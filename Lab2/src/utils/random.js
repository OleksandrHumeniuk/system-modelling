/**
 * Random distribution functions
 */

/**
 * Generate exponentially distributed random number
 * @param {number} mean - Mean value (1/lambda)
 * @returns {number} Random value
 */
function exponential(mean) {
  return -mean * Math.log(Math.random());
}

/**
 * Generate uniformly distributed random number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random value
 */
function uniform(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generate normally distributed random number (Box-Muller transform)
 * @param {number} mean - Mean value
 * @param {number} stdDev - Standard deviation
 * @returns {number} Random value
 */
function normal(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

module.exports = {
  exponential,
  uniform,
  normal
};
