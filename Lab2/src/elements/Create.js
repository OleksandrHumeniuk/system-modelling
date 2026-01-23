const Element = require('../core/Element');
const Entity = require('../core/Entity');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Create - Generates entities at specified intervals
 */
class Create extends Element {
  constructor(name, meanDelay, maxEntities = Infinity) {
    super(name);
    this.meanDelay = meanDelay; // Mean time between arrivals
    this.maxEntities = maxEntities; // Maximum entities to create
    this.entitiesCreated = 0;
  }

  /**
   * Start the creation process
   */
  start() {
    if (!this.model) {
      throw new Error('Create element must be added to model before starting');
    }
    // Schedule first creation event
    const delay = exponential(this.meanDelay);
    const event = new Event(delay, EventType.CREATE, this);
    this.model.scheduleEvent(event);
  }

  /**
   * Called when entity arrives (not applicable for Create)
   */
  inAct(entity) {
    // Create doesn't receive entities, it generates them
    throw new Error('Create element does not accept incoming entities');
  }

  /**
   * Generate next entity
   */
  generateNext() {
    if (this.entitiesCreated >= this.maxEntities) {
      return;
    }

    // Create new entity
    const entity = new Entity(this.model.currentTime);
    this.entitiesCreated++;
    this.entitiesOut++;

    // Send entity to next element
    const next = this.selectNext();
    if (next) {
      next.inAct(entity);
    }

    // Schedule next creation
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
   * Get statistics
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
   * Print statistics
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
   * Reset statistics
   */
  reset() {
    super.reset();
    this.entitiesCreated = 0;
  }
}

module.exports = Create;
