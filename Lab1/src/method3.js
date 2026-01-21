const { buildHistogram } = require('./common');

/**
 * Генерація псевдовипадкових чисел лінійним конгруентним методом
 * @param {number} n - кількість чисел
 * @param {number} a - параметр лінійного конгруентний генератора
 * @param {number} c - параметр лінійного конгруентний генератора
 * @param {number} seed - початкове значення
 * @returns {number[]} масив чисел
 */
function generateLCG(n, a, c, seed = 12345) {
  const result = [];
  let z = BigInt(seed);
  const aBig = BigInt(a);
  const cBig = BigInt(c);
  
  for (let i = 0; i < n; i++) {
    z = (aBig * z) % cBig;
    result.push(Number(z) / Number(cBig));
  }
  return result;
}

/**
 * Критерій χ² для рівномірного розподілу
 * @param {number[]} data - масив чисел
 * @param {number} bins - кількість інтервалів
 * @returns {object} результати тестування
 */
function chiSquaredTestUniform(data, bins = 10) {
  const { histogram } = buildHistogram(data, bins);
  const n = data.length;
  
  // Для рівномірного розподілу очікувана частота однакова для всіх інтервалів
  const expected = n / bins;
  
  let chiSquared = 0;
  const results = [];
  
  for (let i = 0; i < bins; i++) {
    const observed = histogram[i];
    chiSquared += Math.pow(observed - expected, 2) / expected;
    results.push({ bin: i + 1, observed, expected: expected.toFixed(2) });
  }
  
  return { chiSquared, df: bins - 1, results };
}

module.exports = {
  generateLCG,
  chiSquaredTestUniform
};
