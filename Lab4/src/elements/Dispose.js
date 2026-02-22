const Element = require('../core/Element');

/**
 * Dispose - Кінцевий елемент, виводить заявки з системи
 */
class Dispose extends Element {
  constructor(name = 'Dispose') {
    super(name);
    this.entitiesDisposed = 0;
    this.totalTimeInSystem = 0;
  }

  inAct(entity) {
    this.entitiesIn++;
    this.entitiesDisposed++;
    this.totalTimeInSystem += entity.getTimeInSystem(this.model.currentTime);
  }

  getStats() {
    return {
      ...super.getStats(),
      entitiesDisposed: this.entitiesDisposed,
      averageTimeInSystem: this.entitiesDisposed > 0 ? this.totalTimeInSystem / this.entitiesDisposed : 0
    };
  }

  reset() {
    super.reset();
    this.entitiesDisposed = 0;
    this.totalTimeInSystem = 0;
  }

  printStats() {
    const s = this.getStats();
    console.log(`\n${this.name} (DISPOSE): виведено ${s.entitiesDisposed}, середній час у системі ${s.averageTimeInSystem.toFixed(4)}`);
  }
}

module.exports = Dispose;
