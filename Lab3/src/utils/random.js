/**
 * Функції випадкових розподілів
 */

/**
 * Експоненційний розподіл
 * @param {number} mean - Математичне сподівання (1/λ)
 * @returns {number} Випадкове значення
 */
function exponential(mean) {
  return -mean * Math.log(Math.random());
}

/**
 * Рівномірний розподіл
 * @param {number} min - Мінімальне значення
 * @param {number} max - Максимальне значення
 * @returns {number} Випадкове значення
 */
function uniform(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Нормальний розподіл (перетворення Бокса-Мюллера)
 * @param {number} mean - Математичне сподівання
 * @param {number} stdDev - Середньоквадратичне відхилення
 * @returns {number} Випадкове значення
 */
function normal(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Розподіл Ерланга (сума k однаково розподілених експоненційних з середнім mean/k)
 * @param {number} mean - Математичне сподівання розподілу Ерланга
 * @param {number} k - Параметр форми (кількість стадій)
 * @returns {number} Випадкове значення
 */
function erlang(mean, k) {
  const scale = mean / k;
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += exponential(scale);
  }
  return sum;
}

module.exports = {
  exponential,
  uniform,
  normal,
  erlang
};
