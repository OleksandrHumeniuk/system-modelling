const asciichart = require('asciichart');

/**
 * Обчислення середнього значення
 * @param {number[]} arr - масив чисел
 * @returns {number} середнє значення
 */
function mean(arr) {
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

/**
 * Обчислення дисперсії
 * @param {number[]} arr - масив чисел
 * @returns {number} дисперсія
 */
function variance(arr) {
  const m = mean(arr);
  return arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / arr.length;
}

/**
 * Обчислення стандартного відхилення
 * @param {number[]} arr - масив чисел
 * @returns {number} стандартне відхилення
 */
function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

/**
 * Побудова гістограми частот
 * @param {number[]} arr - масив чисел
 * @param {number} bins - кількість інтервалів
 * @returns {object} гістограма
 */
function buildHistogram(arr, bins = 20) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const binWidth = (max - min) / bins;
  
  const histogram = new Array(bins).fill(0);
  const binCenters = [];
  
  for (let i = 0; i < bins; i++) {
    binCenters.push(min + binWidth * (i + 0.5));
  }
  
  for (const x of arr) {
    let binIndex = Math.floor((x - min) / binWidth);
    if (binIndex >= bins) binIndex = bins - 1;
    if (binIndex < 0) binIndex = 0;
    histogram[binIndex]++;
  }
  
  return { histogram, binCenters, binWidth, min, max };
}

/**
 * Виведення ASCII гістограми
 * @param {number[]} data - масив чисел
 * @param {string} title - назва гістограми
 */
function printHistogram(data, title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
  
  const bins = 40;
  const { histogram, min, max } = buildHistogram(data, bins);
  
  console.log(asciichart.plot(histogram, {
    height: 15,
    padding: '       ',
    format: (x) => x.toFixed(0).padStart(4)
  }));
  
  // Підпис горизонтальної осі
  const padding = '       ';
  const chartWidth = 30; // ширина графіка
  const minLabel = min.toFixed(2);
  const maxLabel = max.toFixed(2);
  const midValue = (min + max) / 2;
  const midLabel = midValue.toFixed(2);
  
  // Лінія осі
  console.log(padding + '└' + '─'.repeat(40) + '┘');
  
  // Мітки значень
  const labelLine = padding + minLabel.padEnd(Math.floor(chartWidth / 2)) + 
                    midLabel.padStart(Math.floor(chartWidth / 4)).padEnd(Math.floor(chartWidth / 4)) +
                    maxLabel.padStart(Math.ceil(chartWidth / 2) + minLabel.length);
  console.log(labelLine);
  
  // Назва осі
  const axisLabel = 'Значення X';
  const axisLabelPadding = padding + ' '.repeat(Math.floor((chartWidth - axisLabel.length) / 2));
  console.log(axisLabelPadding + axisLabel);
}

/**
 * Критичні значення χ² для рівня значущості α = 0.05
 * @param {number} df - ступені свободи
 * @returns {number} критичне значення χ²
 */
function chiSquaredCritical(df) {
  const table = {
    1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.070,
    6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919, 10: 18.307,
    11: 19.675, 12: 21.026, 13: 22.362, 14: 23.685, 15: 24.996,
    16: 26.296, 17: 27.587, 18: 28.869, 19: 30.144, 20: 31.410,
    21: 32.671, 22: 33.924, 23: 35.172, 24: 36.415, 25: 37.652,
    26: 38.885, 27: 40.113, 28: 41.337, 29: 42.557, 30: 43.773
  }; 
  return table[df] || (df + 2.5 * Math.sqrt(df));
}


/**
 * Функція виведення результатів
 * @param {string} name - назва розподілу
 * @param {number[]} data - масив чисел
 * @param {object} testResult - результати тестування
 * @param {object} params - параметри розподілу
 */
function printResults(name, data, testResult, params) {
  console.log(name);
  
  console.log('\n📊 ПАРАМЕТРИ ГЕНЕРАТОРА:');
  for (const [key, value] of Object.entries(params)) {
    console.log(`   ${key} = ${value}`);
  }
  
  console.log('\n📈 СТАТИСТИЧНІ ХАРАКТЕРИСТИКИ ВИБІРКИ:');
  console.log(`   Кількість чисел: ${data.length}`);
  console.log(`   Середнє значення (x̄): ${mean(data).toFixed(6)}`);
  console.log(`   Дисперсія (s²): ${variance(data).toFixed(6)}`);
  console.log(`   Стандартне відхилення (s): ${stdDev(data).toFixed(6)}`);
  console.log(`   Мінімум: ${Math.min(...data).toFixed(6)}`);
  console.log(`   Максимум: ${Math.max(...data).toFixed(6)}`);
  
  printHistogram(data, '📊 ГІСТОГРАМА ЧАСТОТ:');
  
  console.log('\n🧪 ПЕРЕВІРКА ЗА КРИТЕРІЄМ χ² (рівень значущості α = 0.05):');
  console.log(`   Обчислене значення χ²: ${testResult.chiSquared.toFixed(4)}`);
  console.log(`   Ступені свободи (df): ${testResult.df}`);
  
  const critical = chiSquaredCritical(testResult.df);
  console.log(`   Критичне значення χ²(0.05, ${testResult.df}): ${critical.toFixed(4)}`);
  
  if (testResult.chiSquared < critical) {
    console.log(`   ✅ ВИСНОВОК: χ² = ${testResult.chiSquared.toFixed(4)} < ${critical.toFixed(4)}`);
    console.log('   Гіпотеза про відповідність розподілу ПРИЙМАЄТЬСЯ');
  } else {
    console.log(`   ❌ ВИСНОВОК: χ² = ${testResult.chiSquared.toFixed(4)} >= ${critical.toFixed(4)}`);
    console.log('   Гіпотеза про відповідність розподілу ВІДХИЛЯЄТЬСЯ');
  }
}

module.exports = {
  mean,
  variance,
  stdDev,
  buildHistogram,
  printHistogram,
  chiSquaredCritical,
  printResults
};
