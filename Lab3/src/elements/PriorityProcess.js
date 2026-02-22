const Element = require('../core/Element');
const { Event, EventType } = require('../core/Event');

/**
 * PriorityProcess - Універсальний багатоканальний процес з пріоритетною чергою.
 * priorityFn(entity) => number (більше = вищий пріоритет, обслуговується першим).
 * serviceTimeSampler(entity) => number — час обслуговування.
 * Після обслуговування заявка йде до наступного елемента (addNext).
 */
class PriorityProcess extends Element {
  constructor(name, channels, options = {}) {
    super(name);
    this.channels = channels;
    this.servers = Array(channels).fill(null);
    this.queue = []; // масив { entity, priority }; при виборі беремо з найбільшим priority
    this.priorityFn = options.priorityFn || (() => 0);
    this.serviceTimeSampler = options.serviceTimeSampler || (() => 0);
    this.entityArrivalTimes = new Map();
    this.serverBusyTime = Array(channels).fill(0);
    this.entitiesProcessed = 0;
  }

  _pickFromQueue() {
    if (this.queue.length === 0) return null;
    let bestIdx = 0;
    let bestPriority = this.priorityFn(this.queue[0]);
    for (let i = 1; i < this.queue.length; i++) {
      const p = this.priorityFn(this.queue[i]);
      if (p > bestPriority) {
        bestPriority = p;
        bestIdx = i;
      }
    }
    return this.queue.splice(bestIdx, 1)[0];
  }

  inAct(entity) {
    this.entitiesIn++;
    this.entityArrivalTimes.set(entity.id, this.model.currentTime);
    const freeIndex = this.servers.findIndex(s => s === null);
    if (freeIndex !== -1) {
      this._startService(entity, freeIndex);
    } else {
      this.queue.push(entity);
    }
  }

  _startService(entity, channelIndex) {
    this.servers[channelIndex] = entity;
    const startTime = this.model.currentTime;
    entity._serviceStartTime = startTime;
    const duration = this.serviceTimeSampler(entity);
    this.serverBusyTime[channelIndex] += duration;
    const endTime = startTime + duration;
    this.model.scheduleEvent(
      new Event(endTime, EventType.END_SERVICE, this, entity, { channelIndex })
    );
  }

  endService(entity, channelIndex) {
    this.servers[channelIndex] = null;
    this.entitiesProcessed++;
    const startTime = entity._serviceStartTime ?? this.entityArrivalTimes.get(entity.id);
    if (startTime !== undefined) {
      entity.addServiceRecord(this.name, startTime, this.model.currentTime);
    }
    delete entity._serviceStartTime;
    this.entityArrivalTimes.delete(entity.id);

    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);

    const nextEntity = this._pickFromQueue();
    if (nextEntity) this._startService(nextEntity, channelIndex);
  }

  reset() {
    super.reset();
    this.servers = Array(this.channels).fill(null);
    this.queue = [];
    this.entityArrivalTimes.clear();
    this.serverBusyTime = Array(this.channels).fill(0);
    this.entitiesProcessed = 0;
  }
}

module.exports = PriorityProcess;
