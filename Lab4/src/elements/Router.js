const Element = require('../core/Element');

/**
 * Router - Маршрутизація за ймовірністю (рівномірно по N виходах) або за пріоритетом
 */
class Router extends Element {
  constructor(name = 'Router', mode = 'probability') {
    super(name);
    this.mode = mode;
  }

  selectNext() {
    if (this.nextElements.length === 0) return null;
    if (this.nextElements.length === 1) return this.nextElements[0];
    if (this.mode === 'priority') return this.nextElements[0];
    return super.selectNext();
  }

  inAct(entity) {
    this.entitiesIn++;
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);
  }

  addNext(element, probability = 1.0) {
    super.addNext(element, probability);
  }
}

module.exports = Router;
