const Element = require('../core/Element');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Process - Service station with queue and servers
 */
class Process extends Element {
  constructor(name, meanServiceTime, channels = 1) {
    super(name);
    this.meanServiceTime = meanServiceTime;
    this.channels = channels; // Number of parallel servers
    this.servers = Array(channels).fill(null); // null = free, Entity = busy
    this.queue = [];
    
    // Statistics
    this.totalBusyTime = 0; // Sum of all servers' busy time
    this.serverBusyTime = Array(channels).fill(0); // Individual server busy times
    this.lastEventTime = 0;
    this.queueLengthSum = 0; // For time-weighted average
    this.lastQueueUpdateTime = 0;
    this.maxQueueLength = 0;
    this.totalWaitTime = 0;
    this.entitiesProcessed = 0;
    this.entitiesStarted = 0;
    this.entityArrivalTimes = new Map(); // Track when entities arrived
  }

  /**
   * Called when entity arrives at this process
   * @param {Entity} entity - Arriving entity
   */
  inAct(entity) {
    this.entitiesIn++;
    this.entityArrivalTimes.set(entity.id, this.model.currentTime);
    
    // Update queue length statistics
    this.updateQueueStats();

    // Find free server
    const freeServerIndex = this.servers.findIndex(server => server === null);
    
    if (freeServerIndex !== -1) {
      // Server available - start service immediately
      this.startService(entity, freeServerIndex);
    } else {
      // All servers busy - add to queue
      this.queue.push(entity);
      this.maxQueueLength = Math.max(this.maxQueueLength, this.queue.length);
    }
  }

  /**
   * Start service for an entity
   * @param {Entity} entity - Entity to service
   * @param {number} channelIndex - Server index
   */
  startService(entity, channelIndex) {
    this.servers[channelIndex] = entity;
    this.entitiesStarted++;
    
    // Calculate wait time
    const arrivalTime = this.entityArrivalTimes.get(entity.id);
    if (arrivalTime !== undefined) {
      const waitTime = this.model.currentTime - arrivalTime;
      this.totalWaitTime += waitTime;
    }

    // Generate service time and schedule end of service
    const serviceTime = exponential(this.meanServiceTime);
    const endTime = this.model.currentTime + serviceTime;
    
    // Track busy time for this server
    this.serverBusyTime[channelIndex] += serviceTime;
    
    const event = new Event(
      endTime,
      EventType.END_SERVICE,
      this,
      entity,
      { channelIndex, startTime: this.model.currentTime }
    );
    
    this.model.scheduleEvent(event);
  }

  /**
   * Called when service ends
   * @param {Entity} entity - Entity that finished service
   * @param {number} channelIndex - Server index
   */
  endService(entity, channelIndex) {
    // The service duration is tracked when the service was scheduled
    // No need to add more time here
    
    // Free the server
    this.servers[channelIndex] = null;
    this.entitiesProcessed++;
    
    // Add service record to entity
    entity.addServiceRecord(
      this.name,
      this.lastEventTime,
      this.model.currentTime
    );

    // Clean up arrival time tracking
    this.entityArrivalTimes.delete(entity.id);

    // Send entity to next element
    this.outAct(entity);

    // Update queue stats before processing next entity
    this.updateQueueStats();

    // If queue not empty, start next entity
    if (this.queue.length > 0) {
      const nextEntity = this.queue.shift();
      this.startService(nextEntity, channelIndex);
    }
    
    this.lastEventTime = this.model.currentTime;
  }

  /**
   * Update time-weighted queue length statistics
   */
  updateQueueStats() {
    const timeDelta = this.model.currentTime - this.lastQueueUpdateTime;
    this.queueLengthSum += this.queue.length * timeDelta;
    this.lastQueueUpdateTime = this.model.currentTime;
  }

  /**
   * Calculate server utilization
   * @returns {number} Utilization (0-1)
   */
  getUtilization() {
    if (this.model.currentTime === 0) return 0;
    
    // Sum all server busy times
    let totalBusyTime = 0;
    for (let i = 0; i < this.channels; i++) {
      totalBusyTime += this.serverBusyTime[i];
    }
    
    // Total capacity is simulation time * number of servers
    const totalCapacity = this.model.currentTime * this.channels;
    return totalCapacity > 0 ? totalBusyTime / totalCapacity : 0;
  }

  /**
   * Calculate average queue length (time-weighted)
   * @returns {number} Average queue length
   */
  getAverageQueueLength() {
    this.updateQueueStats();
    return this.model.currentTime > 0 ? this.queueLengthSum / this.model.currentTime : 0;
  }

  /**
   * Calculate average wait time
   * @returns {number} Average wait time
   */
  getAverageWaitTime() {
    return this.entitiesStarted > 0 ? this.totalWaitTime / this.entitiesStarted : 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = super.getStats();
    return {
      ...stats,
      channels: this.channels,
      meanServiceTime: this.meanServiceTime,
      serviceRate: 1 / this.meanServiceTime,
      entitiesProcessed: this.entitiesProcessed,
      currentQueueLength: this.queue.length,
      maxQueueLength: this.maxQueueLength,
      averageQueueLength: this.getAverageQueueLength(),
      averageWaitTime: this.getAverageWaitTime(),
      utilization: this.getUtilization()
    };
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name} (PROCESS):`);
    console.log(`  Кількість пристроїв: ${stats.channels}`);
    console.log(`  Середній час обслуговування: ${stats.meanServiceTime.toFixed(4)}`);
    console.log(`  Інтенсивність обслуговування (μ): ${stats.serviceRate.toFixed(4)} заявок/час`);
    console.log(`  Заявок прийнято: ${stats.entitiesIn}`);
    console.log(`  Заявок оброблено: ${stats.entitiesProcessed}`);
    console.log(`  Заявок відправлено: ${stats.entitiesOut}`);
    console.log(`  Поточна довжина черги: ${stats.currentQueueLength}`);
    console.log(`  Максимальна довжина черги: ${stats.maxQueueLength}`);
    console.log(`  Середня довжина черги: ${stats.averageQueueLength.toFixed(4)}`);
    console.log(`  Середній час очікування: ${stats.averageWaitTime.toFixed(4)}`);
    console.log(`  Завантаження: ${(stats.utilization * 100).toFixed(2)}%`);
  }

  /**
   * Reset statistics
   */
  reset() {
    super.reset();
    this.servers = Array(this.channels).fill(null);
    this.queue = [];
    this.totalBusyTime = 0;
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
}

module.exports = Process;
