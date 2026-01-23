/**
 * Element - Base class for all simulation elements
 * Abstract class providing common functionality for Create, Process, Dispose
 */
class Element {
  static nextId = 0;

  constructor(name = 'Element') {
    this.id = Element.nextId++;
    this.name = name;
    this.nextElements = []; // Multiple next elements (for routing)
    this.nextProbabilities = []; // Routing probabilities
    this.model = null; // Reference to simulation model
    
    // Statistics
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  /**
   * Set the model reference
   * @param {Model} model - The simulation model
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Add a next element with probability (for routing)
   * @param {Element} element - Next element
   * @param {number} probability - Routing probability (0-1)
   */
  addNext(element, probability = 1.0) {
    this.nextElements.push(element);
    this.nextProbabilities.push(probability);
    
    // Normalize probabilities if they don't sum to 1
    const sum = this.nextProbabilities.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      this.nextProbabilities = this.nextProbabilities.map(p => p / sum);
    }
  }

  /**
   * Select next element based on probabilities
   * @returns {Element|null} Selected next element
   */
  selectNext() {
    // If no next elements configured
    if (this.nextElements.length === 0) {
      return null;
    }

    // If only one element in array
    if (this.nextElements.length === 1) {
      return this.nextElements[0];
    }

    // Weighted random selection
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < this.nextProbabilities.length; i++) {
      cumulative += this.nextProbabilities[i];
      if (rand < cumulative) {
        return this.nextElements[i];
      }
    }
    
    // Fallback to last element
    return this.nextElements[this.nextElements.length - 1];
  }

  /**
   * Called when entity arrives at this element
   * Must be overridden in subclasses
   * @param {Entity} entity - The arriving entity
   */
  inAct(entity) {
    this.entitiesIn++;
    throw new Error(`inAct() must be implemented in ${this.constructor.name}`);
  }

  /**
   * Called when entity departs from this element
   * @param {Entity} entity - The departing entity
   */
  outAct(entity) {
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) {
      next.inAct(entity);
    }
  }

  /**
   * Get statistics for this element
   * @returns {object} Statistics object
   */
  getStats() {
    return {
      name: this.name,
      entitiesIn: this.entitiesIn,
      entitiesOut: this.entitiesOut
    };
  }

  /**
   * Reset statistics
   */
  reset() {
    this.entitiesIn = 0;
    this.entitiesOut = 0;
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name}:`);
    console.log(`  Entities In: ${stats.entitiesIn}`);
    console.log(`  Entities Out: ${stats.entitiesOut}`);
  }
}

module.exports = Element;
