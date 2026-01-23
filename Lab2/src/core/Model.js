const { Event, EventType } = require('./Event');

/**
 * Model - Головний рушій симуляції з подієво-орієнтованим плануванням
 */
class Model {
  constructor() {
    this.currentTime = 0;
    this.eventQueue = []; // Черга подій з пріоритетом, відсортована за часом
    this.elements = [];
    this.running = false;
  }

  /**
   * Встановити елементи симуляції
   * @param {Element[]} elements - Масив елементів для додавання
   */
  setElements(elements) {
    this.elements = [];
    for (const element of elements) {
      element.setModel(this);
      this.elements.push(element);
    }
  }

  /**
   * Запланувати подію
   * @param {Event} event - Подія для планування
   */
  scheduleEvent(event) {
    // Вставити подію у відсортованому порядку (черга з пріоритетом)
    let inserted = false;
    for (let i = 0; i < this.eventQueue.length; i++) {
      if (event.time < this.eventQueue[i].time) {
        this.eventQueue.splice(i, 0, event);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.eventQueue.push(event);
    }
  }

  /**
   * Отримати наступну подію з черги
   * @returns {Event|null} Наступна подія або null якщо черга порожня
   */
  getNextEvent() {
    return this.eventQueue.shift();
  }

  /**
   * Запустити симуляцію на вказаний час
   * @param {number} endTime - Час завершення симуляції
   */
  simulate(endTime) {
    this.running = true;
    this.currentTime = 0;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Запуск симуляції: 0 → ${endTime} одиниць часу`);
    console.log('='.repeat(70));

    let eventCount = 0;
    const startRealTime = Date.now();

    while (this.eventQueue.length > 0 && this.running) {
      const event = this.getNextEvent();
      
      if (event.time > endTime) {
        this.currentTime = endTime;
        break;
      }

      this.currentTime = event.time;
      eventCount++;

      // Обробити подію
      this.processEvent(event);
    }

    const endRealTime = Date.now();
    const realTimeElapsed = endRealTime - startRealTime;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Симуляцію завершено в момент часу ${this.currentTime.toFixed(2)}`);
    console.log(`Оброблено подій: ${eventCount}`);
    console.log(`Реальний час: ${realTimeElapsed}мс`);
    console.log('='.repeat(70));

    this.printStats();
  }

  /**
   * Обробити одну подію
   * @param {Event} event - Подія для обробки
   */
  processEvent(event) {
    switch (event.type) {
      case EventType.CREATE:
        event.element.generateNext();
        break;
      
      case EventType.END_SERVICE:
        event.element.endService(event.entity, event.data.channelIndex);
        break;
      
      case EventType.START_SERVICE:
        // Зазвичай обробляється всередині Process.inAct()
        break;
      
      default:
        console.warn(`Невідомий тип події: ${event.type}`);
    }
  }

  /**
   * Вивести статистику для всіх елементів
   */
  printStats() {
    console.log('\n' + '='.repeat(70));
    console.log('СТАТИСТИКА СИМУЛЯЦІЇ');
    console.log('='.repeat(70));
    
    for (const element of this.elements) {
      element.printStats();
    }
  }

  /**
   * Скинути симуляцію
   */
  reset() {
    this.currentTime = 0;
    this.eventQueue = [];
    this.running = false;
    
    for (const element of this.elements) {
      element.reset();
    }
  }

  /**
   * Зупинити симуляцію
   */
  stop() {
    this.running = false;
  }
}

module.exports = Model;
