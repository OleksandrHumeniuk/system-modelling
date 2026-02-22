/**
 * Element - Базовий клас для всіх елементів симуляції
 */
class Element {
  static nextId = 0;

  constructor(name = 'Element') {
    this.id = Element.nextId++;
    this.name = name;
    this.nextElements = [];
    this.nextProbabilities = [];
    this.model = null;
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  setModel(model) {
    this.model = model;
  }

  addNext(element, probability = 1.0) {
    this.nextElements.push(element);
    this.nextProbabilities.push(probability);
    const sum = this.nextProbabilities.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      this.nextProbabilities = this.nextProbabilities.map(p => p / sum);
    }
  }

  selectNext() {
    if (this.nextElements.length === 0) return null;
    if (this.nextElements.length === 1) return this.nextElements[0];
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < this.nextProbabilities.length; i++) {
      cumulative += this.nextProbabilities[i];
      if (rand < cumulative) return this.nextElements[i];
    }
    return this.nextElements[this.nextElements.length - 1];
  }

  inAct(entity) {
    this.entitiesIn++;
    throw new Error(`inAct() має бути реалізовано в ${this.constructor.name}`);
  }

  outAct(entity) {
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);
  }

  getStats() {
    return { name: this.name, entitiesIn: this.entitiesIn, entitiesOut: this.entitiesOut };
  }

  reset() {
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name}: надійшло ${stats.entitiesIn}, вийшло ${stats.entitiesOut}`);
  }
}

module.exports = Element;
