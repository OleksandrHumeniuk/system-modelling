const Element = require('../core/Element');
const Entity = require('../core/Entity');
const { Event, EventType } = require('../core/Event');
const { exponential } = require('../utils/random');

/**
 * Create - Генерує заявки через задані інтервали
 */
class Create extends Element {
  constructor(name, meanDelay, maxEntities = Infinity, firstArrivalTime = null) {
    super(name);
    this.meanDelay = meanDelay;
    this.maxEntities = maxEntities;
    this.firstArrivalTime = firstArrivalTime;
    this.entitiesCreated = 0;
  }

  start() {
    if (!this.model) throw new Error('Елемент Create потрібно додати до моделі перед запуском');
    const firstTime = this.firstArrivalTime != null ? this.firstArrivalTime : exponential(this.meanDelay);
    this.model.scheduleEvent(new Event(firstTime, EventType.CREATE, this));
  }

  inAct(entity) {
    throw new Error('Елемент Create не приймає вхідні заявки');
  }

  generateNext() {
    if (this.entitiesCreated >= this.maxEntities) return;
    const entity = new Entity(this.model.currentTime);
    this.entitiesCreated++;
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);
    if (this.entitiesCreated < this.maxEntities) {
      const delay = exponential(this.meanDelay);
      this.model.scheduleEvent(new Event(this.model.currentTime + delay, EventType.CREATE, this));
    }
  }

  getStats() {
    return { ...super.getStats(), entitiesCreated: this.entitiesCreated, meanDelay: this.meanDelay, maxEntities: this.maxEntities };
  }

  reset() {
    super.reset();
    this.entitiesCreated = 0;
  }

  printStats() {
    const s = this.getStats();
    const maxStr = s.maxEntities === Infinity ? '∞' : s.maxEntities;
    console.log(`\n${this.name} (CREATE): створено ${s.entitiesCreated}, макс ${maxStr}`);
  }
}

module.exports = Create;
