/**
 * Entity - Represents a customer/transaction in the simulation
 */
class Entity {
  static nextId = 0;

  constructor(creationTime = 0) {
    this.id = Entity.nextId++;
    this.creationTime = creationTime;
    this.serviceHistory = []; // Track which elements processed this entity
    this.iterationCount = 0; // Prevent infinite loops
    this.maxIterations = 1000;
  }

  /**
   * Add service record when entity passes through an element
   * @param {string} elementName - Name of the element
   * @param {number} startTime - When service started
   * @param {number} endTime - When service ended
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
   * Increment iteration counter (for loop detection)
   * @returns {boolean} true if under limit, false if exceeded
   */
  incrementIteration() {
    this.iterationCount++;
    return this.iterationCount < this.maxIterations;
  }

  /**
   * Get total time in system
   * @param {number} currentTime - Current simulation time
   * @returns {number} time spent in system
   */
  getTimeInSystem(currentTime) {
    return currentTime - this.creationTime;
  }
}

module.exports = Entity;
