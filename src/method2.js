const { buildHistogram } = require('./common');

/**
 * Генерація випадкових чисел з нормальним розподілом методом підсумовування 12 рівномірно розподілених величин
 * @param {number} n - кількість чисел
 * @param {number} a - параметр нормального розподілу
 * @param {number} sigma - параметр нормального розподілу
 * @returns {number[]} масив чисел
 */
function generateNormal(n, a, sigma) {
  const result = [];
  for (let i = 0; i < n; i++) {
    let mu = 0;
    for (let j = 0; j < 12; j++) {
      mu += Math.random();
    }
    mu -= 6;
    
    result.push(sigma * mu + a);
  }
  return result;
}

/**
 * Функція густини нормального розподілу
 * @param {number} x - значення
 * @param {number} a - параметр нормального розподілу
 * @param {number} sigma - параметр нормального розподілу
 * @returns {number} густина нормального розподілу
 */
function normalPDF(x, a, sigma) {
  const exponent = -Math.pow(x - a, 2) / (2 * sigma * sigma);
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Функція розподілу нормального закону (апроксимація)
 * @param {number} x - значення
 * @param {number} a - параметр нормального розподілу
 * @param {number} sigma - параметр нормального розподілу
 * @returns {number} розподіл нормального закону
 */
function normalCDF(x, a, sigma) {
  const z = (x - a) / sigma;
  
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - p : p;
}

/**
 * Критерій χ² для нормального розподілу
 * @param {number[]} data - масив чисел
 * @param {number} a - параметр нормального розподілу
 * @param {number} sigma - параметр нормального розподілу
 * @param {number} bins - кількість інтервалів
 * @returns {object} результати тестування
 */
function chiSquaredTestNormal(data, a, sigma, bins = 10) {
  const { histogram, min, binWidth } = buildHistogram(data, bins);
  const n = data.length;
  
  let chiSquared = 0;
  const results = [];
  
  for (let i = 0; i < bins; i++) {
    const leftBound = min + i * binWidth;
    const rightBound = min + (i + 1) * binWidth;
    
    const pTheoretical = normalCDF(rightBound, a, sigma) - normalCDF(leftBound, a, sigma);
    const expected = n * pTheoretical;
    const observed = histogram[i];
    
    if (expected > 0) {
      chiSquared += Math.pow(observed - expected, 2) / expected;
    }
    
    results.push({ interval: `[${leftBound.toFixed(2)}, ${rightBound.toFixed(2)})`, observed, expected: expected.toFixed(2) });
  }
  
  return { chiSquared, df: bins - 1 - 2, results };
}

module.exports = {
  generateNormal,
  normalPDF,
  normalCDF,
  chiSquaredTestNormal
};
