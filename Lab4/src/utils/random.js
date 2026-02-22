/**
 * Функції випадкових розподілів
 */
function exponential(mean) {
  return -mean * Math.log(Math.random());
}

function uniform(min, max) {
  return min + Math.random() * (max - min);
}

function normal(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function erlang(mean, k) {
  const scale = mean / k;
  let sum = 0;
  for (let i = 0; i < k; i++) sum += exponential(scale);
  return sum;
}

module.exports = { exponential, uniform, normal, erlang };
