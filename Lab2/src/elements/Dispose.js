const Element = require('../core/Element');

/**
 * Dispose - Terminal element that removes entities from system
 */
class Dispose extends Element {
  constructor(name = 'Dispose') {
    super(name);
    this.entitiesDisposed = 0;
    this.totalTimeInSystem = 0;
    this.minTimeInSystem = Infinity;
    this.maxTimeInSystem = 0;
  }

  /**
   * Called when entity arrives (to be disposed)
   * @param {Entity} entity - Entity to dispose
   */
  inAct(entity) {
    super.entitiesIn++;
    this.entitiesDisposed++;
    
    // Calculate time in system
    const timeInSystem = entity.getTimeInSystem(this.model.currentTime);
    this.totalTimeInSystem += timeInSystem;
    this.minTimeInSystem = Math.min(this.minTimeInSystem, timeInSystem);
    this.maxTimeInSystem = Math.max(this.maxTimeInSystem, timeInSystem);
    
    // Entity is removed from system (no outAct call)
  }

  /**
   * Get average time in system
   * @returns {number} Average time
   */
  getAverageTimeInSystem() {
    return this.entitiesDisposed > 0 ? this.totalTimeInSystem / this.entitiesDisposed : 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = super.getStats();
    return {
      ...stats,
      entitiesDisposed: this.entitiesDisposed,
      averageTimeInSystem: this.getAverageTimeInSystem(),
      minTimeInSystem: this.minTimeInSystem === Infinity ? 0 : this.minTimeInSystem,
      maxTimeInSystem: this.maxTimeInSystem
    };
  }

  /**
   * Print statistics
   */
  printStats() {
    const stats = this.getStats();
    console.log(`\n${this.name} (DISPOSE):`);
    console.log(`  Заявок вилучено з системи: ${stats.entitiesDisposed}`);
    console.log(`  Середній час в системі: ${stats.averageTimeInSystem.toFixed(4)}`);
    console.log(`  Мінімальний час в системі: ${stats.minTimeInSystem.toFixed(4)}`);
    console.log(`  Максимальний час в системі: ${stats.maxTimeInSystem.toFixed(4)}`);
  }

  /**
   * Reset statistics
   */
  reset() {
    super.reset();
    this.entitiesDisposed = 0;
    this.totalTimeInSystem = 0;
    this.minTimeInSystem = Infinity;
    this.maxTimeInSystem = 0;
  }
}

module.exports = Dispose;
