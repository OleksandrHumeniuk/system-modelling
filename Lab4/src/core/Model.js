const { Event, EventType } = require('./Event');

/**
 * Model - Головний рушій симуляції з подієво-орієнтованим плануванням.
 * simulate(endTime, options) повертає { eventCount, realTimeMs, currentTime } для експериментів.
 */
class Model {
  constructor() {
    this.currentTime = 0;
    this.eventQueue = [];
    this.elements = [];
    this.running = false;
  }

  setElements(elements) {
    this.elements = [];
    for (const element of elements) {
      element.setModel(this);
      this.elements.push(element);
    }
  }

  scheduleEvent(event) {
    let inserted = false;
    for (let i = 0; i < this.eventQueue.length; i++) {
      if (event.time < this.eventQueue[i].time) {
        this.eventQueue.splice(i, 0, event);
        inserted = true;
        break;
      }
    }
    if (!inserted) this.eventQueue.push(event);
  }

  getNextEvent() {
    return this.eventQueue.shift();
  }

  /**
   * Запустити симуляцію на вказаний час або до обробки заданої кількості подій.
   * @param {number} endTime - Час завершення симуляції (ігнорується, якщо вказано maxEvents)
   * @param {{ silent?: boolean, maxEvents?: number }} options - silent: не виводити логи; maxEvents: зупинити після N оброблених подій
   * @returns {{ eventCount: number, realTimeMs: number, currentTime: number }}
   */
  simulate(endTime, options = {}) {
    const silent = options.silent === true;
    const maxEvents = options.maxEvents;
    this.running = true;
    this.currentTime = 0;

    if (!silent) {
      const limitDesc = maxEvents != null ? `${maxEvents} подій` : `0 → ${endTime} одиниць часу`;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Запуск симуляції: ${limitDesc}`);
      console.log('='.repeat(70));
    }

    let eventCount = 0;
    const startRealTime = Date.now();
    const timeLimit = maxEvents != null ? Infinity : endTime;

    while (this.eventQueue.length > 0 && this.running) {
      const event = this.getNextEvent();
      if (event.time > timeLimit) {
        this.currentTime = timeLimit;
        break;
      }
      this.currentTime = event.time;
      eventCount++;
      this.processEvent(event);
      if (maxEvents != null && eventCount >= maxEvents) break;
    }

    const realTimeMs = Date.now() - startRealTime;

    if (!silent) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Симуляцію завершено в момент часу ${this.currentTime.toFixed(2)}`);
      console.log(`Оброблено подій: ${eventCount}`);
      console.log(`Реальний час: ${realTimeMs}мс`);
      console.log('='.repeat(70));
      this.printStats();
    }

    return { eventCount, realTimeMs, currentTime: this.currentTime };
  }

  processEvent(event) {
    switch (event.type) {
      case EventType.CREATE:
        event.element.generateNext();
        break;
      case EventType.END_SERVICE:
        event.element.endService(event.entity, event.data.channelIndex);
        break;
      case EventType.START_SERVICE:
        // Зазвичай обробляється в Process.inAct()
        break;
      case EventType.DELAY_END:
        event.element.finishDelay(event.entity);
        break;
      default:
        if (this.running) console.warn(`Невідомий тип події: ${event.type}`);
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(70));
    console.log('СТАТИСТИКА СИМУЛЯЦІЇ');
    console.log('='.repeat(70));
    for (const element of this.elements) element.printStats();
  }

  reset() {
    this.currentTime = 0;
    this.eventQueue = [];
    this.running = false;
    for (const element of this.elements) element.reset();
  }

  stop() {
    this.running = false;
  }
}

module.exports = Model;
