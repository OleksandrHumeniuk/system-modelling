/**
 * Entity - Заявка / клієнт у симуляції
 */
class Entity {
  static nextId = 0;

  constructor(creationTime = 0) {
    this.id = Entity.nextId++;
    this.creationTime = creationTime;
    this.serviceHistory = [];
    this.iterationCount = 0;
    this.maxIterations = 1000;
  }

  addServiceRecord(elementName, startTime, endTime) {
    this.serviceHistory.push({
      element: elementName,
      startTime,
      endTime,
      duration: endTime - startTime
    });
  }

  incrementIteration() {
    this.iterationCount++;
    return this.iterationCount < this.maxIterations;
  }

  getTimeInSystem(currentTime) {
    return currentTime - this.creationTime;
  }
}

module.exports = Entity;
