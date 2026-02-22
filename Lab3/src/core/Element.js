/**
 * Element - Базовий клас для всіх елементів симуляції
 * Абстрактний клас з спільним функціоналом для Create, Process, Dispose
 */
class Element {
  static nextId = 0;

  constructor(name = 'Element') {
    this.id = Element.nextId++;
    this.name = name;
    this.nextElements = []; // Наступні елементи (для маршрутизації)
    this.nextProbabilities = []; // Ймовірності маршрутизації
    this.model = null; // Посилання на модель симуляції
    
    // Статистика
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  /**
   * Встановити посилання на модель
   * @param {Model} model - Модель симуляції
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Додати наступний елемент з ймовірністю (маршрутизація)
   * @param {Element} element - Наступний елемент
   * @param {number} probability - Ймовірність маршрутизації (0-1)
   */
  addNext(element, probability = 1.0) {
    this.nextElements.push(element);
    this.nextProbabilities.push(probability);
    
    // Нормалізація ймовірностей, якщо сума не дорівнює 1
    const sum = this.nextProbabilities.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      this.nextProbabilities = this.nextProbabilities.map(p => p / sum);
    }
  }

  /**
   * Обрати наступний елемент за ймовірностями
   * @returns {Element|null} Обраний наступний елемент
   */
  selectNext() {
    // Якщо наступні елементи не налаштовані
    if (this.nextElements.length === 0) {
      return null;
    }

    // Якщо лише один елемент у масиві
    if (this.nextElements.length === 1) {
      return this.nextElements[0];
    }

    // Випадковий вибір з вагами
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < this.nextProbabilities.length; i++) {
      cumulative += this.nextProbabilities[i];
      if (rand < cumulative) {
        return this.nextElements[i];
      }
    }
    
    // За потреби — останній елемент
    return this.nextElements[this.nextElements.length - 1];
  }

  /**
   * Викликається при надходженні заявки до цього елемента
   * Має бути перевизначено в підкласах
   * @param {Entity} entity - Заявка, що надійшла
   */
  inAct(entity) {
    this.entitiesIn++;
    throw new Error(`inAct() має бути реалізовано в ${this.constructor.name}`);
  }

  /**
   * Викликається при виході заявки з цього елемента
   * @param {Entity} entity - Заявка, що виходить
   */
  outAct(entity) {
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) {
      next.inAct(entity);
    }
  }

  /**
   * Отримати статистику по елементу
   * @returns {object} Об'єкт статистики
   */
  getStats() {
    return {
      name: this.name,
      entitiesIn: this.entitiesIn,
      entitiesOut: this.entitiesOut
    };
  }

  /**
   * Скинути статистику
   */
  reset() {
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  /**
   * Вивести статистику
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name}:`);
    console.log(`  Заявок надійшло: ${stats.entitiesIn}`);
    console.log(`  Заявок вийшло: ${stats.entitiesOut}`);
  }
}

module.exports = Element;
