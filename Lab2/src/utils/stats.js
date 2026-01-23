/**
 * Statistical helper functions
 */

/**
 * Calculate mean of array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Mean value
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

/**
 * Calculate variance of array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Variance
 */
function variance(arr) {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  return arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
}

/**
 * Calculate standard deviation
 * @param {number[]} arr - Array of numbers
 * @returns {number} Standard deviation
 */
function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

/**
 * Calculate min of array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Minimum value
 */
function min(arr) {
  if (arr.length === 0) return 0;
  return Math.min(...arr);
}

/**
 * Calculate max of array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Maximum value
 */
function max(arr) {
  if (arr.length === 0) return 0;
  return Math.max(...arr);
}

/**
 * Calculate confidence interval
 * @param {number[]} arr - Array of numbers
 * @param {number} confidence - Confidence level (e.g., 0.95)
 * @returns {object} {mean, lower, upper}
 */
function confidenceInterval(arr, confidence = 0.95) {
  const m = mean(arr);
  const s = stdDev(arr);
  const n = arr.length;
  
  // Z-score for confidence level (approximate)
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
