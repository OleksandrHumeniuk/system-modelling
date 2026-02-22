const Element = require('../core/Element');

/**
 * Router - Маршрутизація заявок за пріоритетом (фіксований порядок) або за ймовірністю.
 * Режим 'priority': наступні елементи в порядку пріоритету; заявка йде до першого в списку.
 * Режим 'probability': використовується Element.selectNext() (зважений випадковий вибір).
 */
class Router extends Element {
  /**
   * @param {string} name - Назва елемента
   * @param {'priority'|'probability'} mode - 'priority' = відправляти до першого наступного; 'probability' = за ймовірностями
   */
  constructor(name = 'Router', mode = 'priority') {
    super(name);
    this.mode = mode;
    // Режим пріоритету: порядок nextElements (перший доданий = найвищий пріоритет)
    // Режим ймовірності: addNext(element, probability) як у Element
  }

  /**
   * Обрати наступний елемент: за пріоритетом (перший у списку) або за ймовірністю
   * @returns {Element|null}
   */
  selectNext() {
    if (this.nextElements.length === 0) return null;
    if (this.nextElements.length === 1) return this.nextElements[0];
    if (this.mode === 'priority') {
      return this.nextElements[0]; // Фіксований порядок: перший = найвищий пріоритет
    }
    return super.selectNext(); // ймовірність: зважений випадковий вибір
  }

  /**
   * Прийняти заявку та направити до наступного елемента (за пріоритетом або ймовірністю)
   */
  inAct(entity) {
    this.entitiesIn++;
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) {
      next.inAct(entity);
    }
  }

  /**
   * Додати наступний елемент. У режимі пріоритету — у потрібному порядку (перший = найвищий пріоритет).
   * У режимі ймовірності — addNext(element, probability).
   */
  addNext(element, probability = 1.0) {
    super.addNext(element, probability);
  }
}

module.exports = Router;
