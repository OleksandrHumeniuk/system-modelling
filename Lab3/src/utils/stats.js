/**
 * Допоміжні функції для статистики
 */

/**
 * Середнє арифметичне масиву
 * @param {number[]} arr - Масив чисел
 * @returns {number} Середнє значення
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

/**
 * Дисперсія масиву
 * @param {number[]} arr - Масив чисел
 * @returns {number} Дисперсія
 */
function variance(arr) {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  return arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
}

/**
 * Середньоквадратичне відхилення
 * @param {number[]} arr - Масив чисел
 * @returns {number} СКВ
 */
function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

/**
 * Мінімум масиву
 * @param {number[]} arr - Масив чисел
 * @returns {number} Мінімальне значення
 */
function min(arr) {
  if (arr.length === 0) return 0;
  return Math.min(...arr);
}

/**
 * Максимум масиву
 * @param {number[]} arr - Масив чисел
 * @returns {number} Максимальне значення
 */
function max(arr) {
  if (arr.length === 0) return 0;
  return Math.max(...arr);
}

/**
 * Довірчий інтервал
 * @param {number[]} arr - Масив чисел
 * @param {number} confidence - Рівень довіри (наприклад, 0.95)
 * @returns {object} {mean, lower, upper}
 */
function confidenceInterval(arr, confidence = 0.95) {
  const m = mean(arr);
  const s = stdDev(arr);
  const n = arr.length;
  
  // Z-критичне значення для рівня довіри (наближено)
  const zScores = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const z = zScores[confidence] || 1.96;
  
  const margin = z * (s / Math.sqrt(n));
  
  return {
    mean: m,
    lower: m - margin,
    upper: m + margin,
    margin
  };
}

module.exports = {
  mean,
  variance,
  stdDev,
  min,
  max,
  confidenceInterval
};
