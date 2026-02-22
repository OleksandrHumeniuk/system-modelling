const Element = require('../core/Element');

/**
 * RouterByCondition - Універсальна маршрутизація за умовами над заявкою.
 * routes: [{ when: (entity) => boolean, transform?: (entity) => void, element }]
 * Перший збіг when() визначає елемент; опційно transform змінює заявку перед передачею.
 */
class RouterByCondition extends Element {
  constructor(name = 'RouterByCondition', routes = []) {
    super(name);
    this.routes = routes; // [{ when, transform?, element }]
  }

  addRoute(condition, element, transform = null) {
    this.routes.push({ when: condition, element, transform });
  }

  inAct(entity) {
    this.entitiesIn++;
    this.entitiesOut++;
    for (const r of this.routes) {
      if (r.when(entity)) {
        if (r.transform) r.transform(entity);
        r.element.inAct(entity);
        return;
      }
    }
  }

  reset() {
    super.reset();
  }
}

module.exports = RouterByCondition;
