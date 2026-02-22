const Element = require('../core/Element');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Process - Обслуговуючий пристрій з чергою та каналами
 */
class Process extends Element {
  constructor(name, meanServiceTime = 0, channels = 1, options = {}) {
    super(name);
    this.meanServiceTime = meanServiceTime;
    this.channels = channels;
    this.servers = Array(channels).fill(null);
    this.queue = [];
    this.serviceTimeSampler = options.serviceTimeSampler || null;
    this.serverBusyTime = Array(channels).fill(0);
    this.lastEventTime = 0;
    this.queueLengthSum = 0;
    this.lastQueueUpdateTime = 0;
    this.maxQueueLength = 0;
    this.totalWaitTime = 0;
    this.entitiesProcessed = 0;
    this.entitiesStarted = 0;
    this.entityArrivalTimes = new Map();
  }

  inAct(entity) {
    this.entitiesIn++;
    this.entityArrivalTimes.set(entity.id, this.model.currentTime);
    this.updateQueueStats();
    const freeServerIndex = this.servers.findIndex(s => s === null);
    if (freeServerIndex !== -1) {
      this.startService(entity, freeServerIndex);
    } else {
      this.queue.push(entity);
      this.maxQueueLength = Math.max(this.maxQueueLength, this.queue.length);
    }
  }

  startService(entity, channelIndex) {
    this.servers[channelIndex] = entity;
    this.entitiesStarted++;
    const arrivalTime = this.entityArrivalTimes.get(entity.id);
    if (arrivalTime !== undefined) this.totalWaitTime += this.model.currentTime - arrivalTime;
    const serviceTime = this.serviceTimeSampler ? this.serviceTimeSampler(entity) : exponential(this.meanServiceTime);
    const endTime = this.model.currentTime + serviceTime;
    this.serverBusyTime[channelIndex] += serviceTime;
    this.model.scheduleEvent(new Event(endTime, EventType.END_SERVICE, this, entity, { channelIndex, startTime: this.model.currentTime }));
  }

  endService(entity, channelIndex) {
    this.servers[channelIndex] = null;
    this.entitiesProcessed++;
    entity.addServiceRecord(this.name, this.lastEventTime, this.model.currentTime);
    this.entityArrivalTimes.delete(entity.id);
    this.outAct(entity);
    this.updateQueueStats();
    if (this.queue.length > 0) this.startService(this.queue.shift(), channelIndex);
    this.lastEventTime = this.model.currentTime;
  }

  updateQueueStats() {
    const timeDelta = this.model.currentTime - this.lastQueueUpdateTime;
    this.queueLengthSum += this.queue.length * timeDelta;
    this.lastQueueUpdateTime = this.model.currentTime;
  }

  getStats() {
    const stats = super.getStats();
    const totalBusy = this.serverBusyTime.reduce((a, b) => a + b, 0);
    return {
      ...stats,
      channels: this.channels,
      entitiesProcessed: this.entitiesProcessed,
      currentQueueLength: this.queue.length,
      maxQueueLength: this.maxQueueLength,
      utilization: this.model.currentTime > 0 ? totalBusy / (this.model.currentTime * this.channels) : 0
    };
  }

  reset() {
    super.reset();
    this.servers = Array(this.channels).fill(null);
    this.queue = [];
    this.serverBusyTime = Array(this.channels).fill(0);
    this.lastEventTime = 0;
    this.queueLengthSum = 0;
    this.lastQueueUpdateTime = 0;
    this.maxQueueLength = 0;
    this.totalWaitTime = 0;
    this.entitiesProcessed = 0;
    this.entitiesStarted = 0;
    this.entityArrivalTimes.clear();
  }

  printStats() {
    const s = this.getStats();
    console.log(`\n${this.name} (PROCESS): каналів ${s.channels}, оброблено ${s.entitiesProcessed}, черга макс ${s.maxQueueLength}, завантаження ${(s.utilization * 100).toFixed(1)}%`);
  }
}

module.exports = Process;
