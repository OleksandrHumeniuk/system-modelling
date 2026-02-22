const Element = require('../core/Element');

/**
 * Dispose - Кінцевий елемент, що виводить заявки з системи
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
   * Викликається при надходженні заявки (для виведення з системи)
   * @param {Entity} entity - Заявка для виведення
   */
  inAct(entity) {
    super.entitiesIn++;
    this.entitiesDisposed++;
    
    // Час перебування в системі
    const timeInSystem = entity.getTimeInSystem(this.model.currentTime);
    this.totalTimeInSystem += timeInSystem;
    this.minTimeInSystem = Math.min(this.minTimeInSystem, timeInSystem);
    this.maxTimeInSystem = Math.max(this.maxTimeInSystem, timeInSystem);
    
    // Заявка виведена з системи (outAct не викликається)
  }

  /**
   * Середній час перебування в системі
   * @returns {number} Середній час
   */
  getAverageTimeInSystem() {
    return this.entitiesDisposed > 0 ? this.totalTimeInSystem / this.entitiesDisposed : 0;
  }

  /**
   * Отримати статистику
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
   * Вивести статистику
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
   * Скинути статистику
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
