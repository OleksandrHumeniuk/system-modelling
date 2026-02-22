/**
 * Entity - Заявка / клієнт у симуляції
 */
class Entity {
  static nextId = 0;

  constructor(creationTime = 0) {
    this.id = Entity.nextId++;
    this.creationTime = creationTime;
    this.serviceHistory = []; // Які елементи обробили заявку
    this.iterationCount = 0; // Захист від нескінченних циклів
    this.maxIterations = 1000;
  }

  /**
   * Додати запис про обслуговування при проходженні елемента
   * @param {string} elementName - Назва елемента
   * @param {number} startTime - Час початку обслуговування
   * @param {number} endTime - Час завершення обслуговування
   */
  addServiceRecord(elementName, startTime, endTime) {
    this.serviceHistory.push({
      element: elementName,
      startTime,
      endTime,
      duration: endTime - startTime
    });
  }

  /**
   * Збільшити лічильник ітерацій (виявлення циклів)
   * @returns {boolean} true якщо межа не перевищена, false якщо перевищена
   */
  incrementIteration() {
    this.iterationCount++;
    return this.iterationCount < this.maxIterations;
  }

  /**
   * Загальний час перебування в системі
   * @param {number} currentTime - Поточний час симуляції
   * @returns {number} час перебування в системі
   */
  getTimeInSystem(currentTime) {
    return currentTime - this.creationTime;
  }
}

module.exports = Entity;
