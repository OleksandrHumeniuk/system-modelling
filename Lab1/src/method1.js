const { buildHistogram } = require('./common');

/**
 * Генерація випадкових чисел з експоненційним розподілом методом оберненої функції
 * @param {number} n - кількість чисел
 * @param {number} lambda - параметр експоненційного розподілу
 * @returns {number[]} масив чисел
 */
function generateExponential(n, lambda) {
  const result = [];
  for (let i = 0; i < n; i++) {
    const xi = Math.random();
    result.push(-(1 / lambda) * Math.log(xi));
  }
  return result;
}

/**
 * Теоретична функція розподілу експоненційного закону: F(x) = 1 - e^(-λx)
 * @param {number} x - значення
 * @param {number} lambda - параметр експоненційного розподілу
 * @returns {number} теоретична функція розподілу
 */
function exponentialCDF(x, lambda) {
  return 1 - Math.exp(-lambda * x);
}

/**
 * Критерій χ² для експоненційного розподілу
 * @param {number[]} data - масив чисел
 * @param {number} lambda - параметр експоненційного розподілу
 * @param {number} bins - кількість інтервалів
 * @returns {object} результати тестування
 */
function chiSquaredTestExponential(data, lambda, bins = 10) {
  const { histogram, min, binWidth } = buildHistogram(data, bins);
  const n = data.length;
  
  let chiSquared = 0;
  const results = [];
  
  for (let i = 0; i < bins; i++) {
    const a = min + i * binWidth;
    const b = min + (i + 1) * binWidth;
    
    const pTheoretical = exponentialCDF(b, lambda) - exponentialCDF(a, lambda);
    const expected = n * pTheoretical;
    const observed = histogram[i];
    
    if (expected > 0) {
      chiSquared += Math.pow(observed - expected, 2) / expected;
    }
    
    results.push(
      { 
        interval: `[${a.toFixed(2)}, ${b.toFixed(2)})`, 
        observed, 
        expected: expected.toFixed(2) 
      });
  }
  
  return { chiSquared, df: bins - 1, results };
}

module.exports = {
  generateExponential,
  exponentialCDF,
  chiSquaredTestExponential
};
