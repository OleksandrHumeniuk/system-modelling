const Element = require('../core/Element');
const Entity = require('../core/Entity');
const { Event, EventType } = require('../core/Event');

/**
 * MultiLaneProcess - Універсальна багатосмужна система з окремими чергами, обмеженням місця та перестроюванням.
 * config: {
 *   numLanes, maxTotal, maxPerLane,
 *   serviceTimeSampler: (entity, laneIndex) => number,
 *   queueSelector: (queueLengths[]) => laneIndex,
 *   laneChange: { enabled: boolean, minDiff: number } — переміщення з кінця черги якщо різниця >= minDiff
 * }
 */
class MultiLaneProcess extends Element {
  constructor(name, config = {}) {
    super(name);
    this.numLanes = config.numLanes ?? 2;
    this.maxTotal = config.maxTotal ?? Infinity;
    this.maxPerLane = config.maxPerLane ?? Infinity;
    this.serviceTimeSampler = config.serviceTimeSampler || (() => 0);
    this.queueSelector = config.queueSelector || ((lengths) => lengths.indexOf(Math.min(...lengths)));
    this.laneChange = config.laneChange || { enabled: false, minDiff: 2 };

    this.queues = Array.from({ length: this.numLanes }, () => []);
    this.servers = Array(this.numLanes).fill(null);
    this.serverBusyTime = Array(this.numLanes).fill(0);
    this.lostCount = 0;
    this.laneChangeCount = 0;
    this.departureIntervals = [];
    this.lastDepartureTime = 0;
    this.totalTimeInSystem = 0;
    this.totalInSystemSum = 0;
    this.queueLengthSums = Array(this.numLanes).fill(0);
    this.lastStatsTime = 0;
  }

  _totalInSystem() {
    let n = 0;
    for (let i = 0; i < this.numLanes; i++) {
      if (this.servers[i]) n++;
      n += this.queues[i].length;
    }
    return n;
  }

  _updateStats() {
    const t = this.model.currentTime;
    const dt = t - this.lastStatsTime;
    this.totalInSystemSum += this._totalInSystem() * dt;
    for (let i = 0; i < this.numLanes; i++) {
      this.queueLengthSums[i] += this.queues[i].length * dt;
    }
    this.lastStatsTime = t;
  }

  _tryLaneChange() {
    if (!this.laneChange.enabled) return;
    const minDiff = this.laneChange.minDiff;
    for (let i = 0; i < this.numLanes; i++) {
      const j = (i + 1) % this.numLanes;
      if (this.queues[i].length >= this.queues[j].length + minDiff && this.queues[i].length > 0) {
        this.queues[j].push(this.queues[i].pop());
        this.laneChangeCount++;
      }
    }
  }

  inAct(entity) {
    this._updateStats();
    if (this._totalInSystem() >= this.maxTotal) {
      this.lostCount++;
      return;
    }
    this.entitiesIn++;
    const lengths = this.queues.map(q => q.length);
    const lane = this.queueSelector(lengths);
    const queue = this.queues[lane];
    const server = this.servers[lane];
    if (server === null) {
      this._startService(entity, lane);
    } else {
      queue.push(entity);
    }
  }

  _startService(entity, laneIndex) {
    const duration = this.serviceTimeSampler(entity, laneIndex);
    const endTime = this.model.currentTime + duration;
    this.servers[laneIndex] = entity;
    this.serverBusyTime[laneIndex] += duration;
    this.model.scheduleEvent(
      new Event(endTime, EventType.END_SERVICE, this, entity, { channelIndex: laneIndex })
    );
  }

  endService(entity, channelIndex) {
    this._updateStats();
    const t = this.model.currentTime;
    if (this.lastDepartureTime > 0) this.departureIntervals.push(t - this.lastDepartureTime);
    this.lastDepartureTime = t;
    this.totalTimeInSystem += entity.getTimeInSystem(t);
    this.servers[channelIndex] = null;
    this.entitiesOut++;
    entity.addServiceRecord(this.name, this.lastStatsTime, t);
    const next = this.selectNext();
    if (next) next.inAct(entity);
    this._tryLaneChange();
    const queue = this.queues[channelIndex];
    if (queue.length > 0) this._startService(queue.shift(), channelIndex);
  }

  setInitialState(initializer) {
    if (!this.model) throw new Error('MultiLaneProcess має бути в моделі перед setInitialState');
    if (typeof initializer === 'function') {
      initializer(this);
    }
  }

  getStats() {
    this._updateStats();
    const t = this.model.currentTime;
    const disposed = this.entitiesOut;
    const totalArrivals = this.entitiesIn + this.lostCount;
    const avgUtil = this.numLanes && t > 0 ? this.serverBusyTime.map((busy) => busy / t) : [];
    const avgQueues = t > 0 ? this.queueLengthSums.map(s => s / t) : this.queueLengthSums.map(() => 0);
    return {
      ...super.getStats(),
      lostCount: this.lostCount,
      totalArrivals,
      laneChangeCount: this.laneChangeCount,
      avgUtilization: avgUtil,
      avgInSystem: t > 0 ? this.totalInSystemSum / t : 0,
      avgDepartureInterval: this.departureIntervals.length > 0
        ? this.departureIntervals.reduce((a, b) => a + b, 0) / this.departureIntervals.length
        : 0,
      avgTimeInSystem: disposed > 0 ? this.totalTimeInSystem / disposed : 0,
      avgQueueLengths: avgQueues,
      pctLost: totalArrivals > 0 ? (100 * this.lostCount) / totalArrivals : 0
    };
  }

  printStats() {
    const s = this.getStats();
    console.log(`\n${this.name}:`);
    console.log(`  Заявок прийнято: ${this.entitiesIn}, втрачено: ${s.lostCount}`);
    s.avgUtilization.forEach((u, i) => console.log(`  Середнє завантаження канали ${i + 1}: ${(u * 100).toFixed(2)}%`));
    console.log(`  Середня кількість у системі: ${s.avgInSystem.toFixed(4)}`);
    console.log(`  Середній інтервал між виїздами: ${s.avgDepartureInterval.toFixed(4)}`);
    console.log(`  Середній час у системі: ${s.avgTimeInSystem.toFixed(4)}`);
    console.log(`  Середні довжини черг: ${s.avgQueueLengths.map((q, i) => `смуга ${i + 1}: ${q.toFixed(4)}`).join(', ')}`);
    console.log(`  Відсоток відмов: ${s.pctLost.toFixed(2)}%`);
    console.log(`  Перестроювань: ${s.laneChangeCount}`);
  }

  reset() {
    super.reset();
    this.queues = Array.from({ length: this.numLanes }, () => []);
    this.servers = Array(this.numLanes).fill(null);
    this.serverBusyTime = Array(this.numLanes).fill(0);
    this.lostCount = 0;
    this.laneChangeCount = 0;
    this.departureIntervals = [];
    this.lastDepartureTime = 0;
    this.totalTimeInSystem = 0;
    this.totalInSystemSum = 0;
    this.queueLengthSums = Array(this.numLanes).fill(0);
    this.lastStatsTime = 0;
  }
}

module.exports = MultiLaneProcess;
