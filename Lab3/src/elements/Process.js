const Element = require('../core/Element');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Process - Універсальний обслуговуючий пристрій з чергою та каналами.
 * Опційно: serviceTimeSampler(entity) для довільного розподілу часу; recordArrivalTimes для збору часів прибуття.
 */
class Process extends Element {
  constructor(name, meanServiceTime = 0, channels = 1, options = {}) {
    super(name);
    this.meanServiceTime = meanServiceTime;
    this.channels = channels; // Кількість паралельних пристроїв
    this.servers = Array(channels).fill(null); // null = вільний, Entity = зайнятий
    this.queue = [];
    this.serviceTimeSampler = options.serviceTimeSampler || null; // (entity) => number; якщо є — використовується замість exponential(mean)
    this.recordArrivalTimes = options.recordArrivalTimes || false;
    this.arrivalTimes = []; // заповнюється якщо recordArrivalTimes
    
    // Статистика
    this.totalBusyTime = 0;
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

  /**
   * Викликається при надходженні заявки до процесу
   * @param {Entity} entity - Заявка, що надійшла
   */
  inAct(entity) {
    this.entitiesIn++;
    const t = this.model.currentTime;
    this.entityArrivalTimes.set(entity.id, t);
    if (this.recordArrivalTimes) this.arrivalTimes.push(t);
    
    this.updateQueueStats();

    // Знайти вільний пристрій
    const freeServerIndex = this.servers.findIndex(server => server === null);
    
    if (freeServerIndex !== -1) {
      // Пристрій вільний — почати обслуговування одразу
      this.startService(entity, freeServerIndex);
    } else {
      // Усі пристрої зайняті — додати в чергу
      this.queue.push(entity);
      this.maxQueueLength = Math.max(this.maxQueueLength, this.queue.length);
    }
  }

  /**
   * Почати обслуговування заявки
   * @param {Entity} entity - Заявка для обслуговування
   * @param {number} channelIndex - Індекс пристрою
   */
  startService(entity, channelIndex) {
    this.servers[channelIndex] = entity;
    this.entitiesStarted++;
    
    // Час очікування
    const arrivalTime = this.entityArrivalTimes.get(entity.id);
    if (arrivalTime !== undefined) {
      const waitTime = this.model.currentTime - arrivalTime;
      this.totalWaitTime += waitTime;
    }

    const serviceTime = this.serviceTimeSampler
      ? this.serviceTimeSampler(entity)
      : exponential(this.meanServiceTime);
    const endTime = this.model.currentTime + serviceTime;
    
    // Час зайнятості цього пристрою
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
   * Викликається при завершенні обслуговування
   * @param {Entity} entity - Заявка, що завершила обслуговування
   * @param {number} channelIndex - Індекс пристрою
   */
  endService(entity, channelIndex) {
    // Тривалість обслуговування вже врахована при плануванні
    
    // Звільнити пристрій
    this.servers[channelIndex] = null;
    this.entitiesProcessed++;
    
    // Додати запис про обслуговування до заявки
    entity.addServiceRecord(
      this.name,
      this.lastEventTime,
      this.model.currentTime
    );

    // Прибрати з відстеження часу надходження
    this.entityArrivalTimes.delete(entity.id);

    // Направити заявку до наступного елемента
    this.outAct(entity);

    // Оновити статистику черги перед обробкою наступної заявки
    this.updateQueueStats();

    // Якщо черга не порожня — почати обслуговування наступної заявки
    if (this.queue.length > 0) {
      const nextEntity = this.queue.shift();
      this.startService(nextEntity, channelIndex);
    }
    
    this.lastEventTime = this.model.currentTime;
  }

  /**
   * Оновити статистику довжини черги (зважена за часом)
   */
  updateQueueStats() {
    const timeDelta = this.model.currentTime - this.lastQueueUpdateTime;
    this.queueLengthSum += this.queue.length * timeDelta;
    this.lastQueueUpdateTime = this.model.currentTime;
  }

  /**
   * Завантаження пристроїв
   * @returns {number} Завантаження (0-1)
   */
  getUtilization() {
    if (this.model.currentTime === 0) return 0;
    
    // Сума часу зайнятості всіх пристроїв
    let totalBusyTime = 0;
    for (let i = 0; i < this.channels; i++) {
      totalBusyTime += this.serverBusyTime[i];
    }
    
    // Загальна потужність = час симуляції * кількість пристроїв
    const totalCapacity = this.model.currentTime * this.channels;
    return totalCapacity > 0 ? totalBusyTime / totalCapacity : 0;
  }

  /**
   * Середня довжина черги (зважена за часом)
   * @returns {number} Середня довжина черги
   */
  getAverageQueueLength() {
    this.updateQueueStats();
    return this.model.currentTime > 0 ? this.queueLengthSum / this.model.currentTime : 0;
  }

  /**
   * Середній час очікування
   * @returns {number} Середній час очікування
   */
  getAverageWaitTime() {
    return this.entitiesStarted > 0 ? this.totalWaitTime / this.entitiesStarted : 0;
  }

  /**
   * Отримати статистику
   */
  getArrivalTimes() {
    return this.arrivalTimes;
  }

  getStats() {
    const stats = super.getStats();
    const totalBusyTime = this.serverBusyTime.reduce((a, b) => a + b, 0);
    const observedMeanServiceTime =
      this.entitiesProcessed > 0 ? totalBusyTime / this.entitiesProcessed : null;
    const observedServiceRate =
      observedMeanServiceTime != null && observedMeanServiceTime > 0
        ? 1 / observedMeanServiceTime
        : 0;
    return {
      ...stats,
      channels: this.channels,
      meanServiceTime: this.meanServiceTime,
      serviceRate: this.meanServiceTime > 0 ? 1 / this.meanServiceTime : 0,
      observedMeanServiceTime: observedMeanServiceTime ?? 0,
      observedServiceRate,
      entitiesProcessed: this.entitiesProcessed,
      currentQueueLength: this.queue.length,
      maxQueueLength: this.maxQueueLength,
      averageQueueLength: this.getAverageQueueLength(),
      averageWaitTime: this.getAverageWaitTime(),
      utilization: this.getUtilization()
    };
  }

  /**
   * Вивести статистику
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name} (PROCESS):`);
    console.log(`  Кількість пристроїв: ${stats.channels}`);
    const meanToShow = stats.observedServiceRate > 0 ? stats.observedMeanServiceTime : (stats.meanServiceTime || 0);
    const rateToShow = stats.observedServiceRate > 0 ? stats.observedServiceRate : stats.serviceRate;
    console.log(`  Середній час обслуговування: ${meanToShow.toFixed(4)}`);
    console.log(`  Інтенсивність обслуговування (μ): ${rateToShow.toFixed(4)} заявок/час`);
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
   * Скинути статистику
   */
  reset() {
    super.reset();
    this.servers = Array(this.channels).fill(null);
    this.queue = [];
    this.arrivalTimes = [];
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
