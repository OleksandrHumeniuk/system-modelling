const Element = require('../core/Element');
const Entity = require('../core/Entity');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Create - Генерує заявки через задані інтервали
 * @param {number} [firstArrivalTime] - Якщо задано, перша заявка створюється в цей час; інакше перша затримка — експоненційна(meanDelay)
 */
class Create extends Element {
  constructor(name, meanDelay, maxEntities = Infinity, firstArrivalTime = null) {
    super(name);
    this.meanDelay = meanDelay; // Середній час між надходженнями
    this.maxEntities = maxEntities; // Максимальна кількість заявок
    this.firstArrivalTime = firstArrivalTime; // Опційно: перша подія CREATE в цей час
    this.entitiesCreated = 0;
  }

  /**
   * Запустити процес генерації заявок
   */
  start() {
    if (!this.model) {
      throw new Error('Елемент Create потрібно додати до моделі перед запуском');
    }
    // Запланувати першу подію створення
    const firstTime = this.firstArrivalTime != null
      ? this.firstArrivalTime
      : exponential(this.meanDelay);
    const event = new Event(firstTime, EventType.CREATE, this);
    this.model.scheduleEvent(event);
  }

  /**
   * Викликається при надходженні заявки (для Create не застосовується)
   */
  inAct(entity) {
    // Create не приймає заявки, а лише генерує їх
    throw new Error('Елемент Create не приймає вхідні заявки');
  }

  /**
   * Згенерувати наступну заявку
   */
  generateNext() {
    if (this.entitiesCreated >= this.maxEntities) {
      return;
    }

    // Створити нову заявку
    const entity = new Entity(this.model.currentTime);
    this.entitiesCreated++;
    this.entitiesOut++;

    // Направити заявку до наступного елемента
    const next = this.selectNext();
    if (next) {
      next.inAct(entity);
    }

    // Запланувати наступне створення
    if (this.entitiesCreated < this.maxEntities) {
      const delay = exponential(this.meanDelay);
      const event = new Event(
        this.model.currentTime + delay,
        EventType.CREATE,
        this
      );
      this.model.scheduleEvent(event);
    }
  }

  /**
   * Отримати статистику
   */
  getStats() {
    const stats = super.getStats();
    return {
      ...stats,
      entitiesCreated: this.entitiesCreated,
      maxEntities: this.maxEntities,
      meanDelay: this.meanDelay,
      arrivalRate: 1 / this.meanDelay
    };
  }

  /**
   * Вивести статистику
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name} (CREATE):`);
    console.log(`  Створено заявок: ${stats.entitiesCreated}`);
    console.log(`  Макс. заявок: ${stats.maxEntities === Infinity ? 'Необмежено' : stats.maxEntities}`);
    console.log(`  Середня затримка: ${stats.meanDelay.toFixed(4)}`);
    console.log(`  Інтенсивність надходження (λ): ${stats.arrivalRate.toFixed(4)} заявок/час`);
  }

  /**
   * Скинути статистику
   */
  reset() {
    super.reset();
    this.entitiesCreated = 0;
  }
}

module.exports = Create;
