const { printResults } = require('./src/common');
const { generateExponential, chiSquaredTestExponential } = require('./src/method1');
const { generateNormal, chiSquaredTestNormal } = require('./src/method2');
const { generateLCG, chiSquaredTestUniform } = require('./src/method3');

const N = 1000;

(() => {
  console.log('Метод 1: Експоненційний розподіл (метод оберненої функції)');

  const lambdaValues = [0.5, 1.0, 2.0];
  
  for (const lambda of lambdaValues) {
    const generatedNumbers = generateExponential(N, lambda);
    const expTest = chiSquaredTestExponential(generatedNumbers, lambda);
    
    const theoreticalMean = 1 / lambda;
    const theoreticalVar = 1 / (lambda * lambda);
    
    printResults(
      `Експоненційний розподіл (λ = ${lambda})`,
      generatedNumbers,
      expTest,
      { 
        'λ (lambda)': lambda,
        'Теоретичне середнє (1/λ)': theoreticalMean.toFixed(4),
        'Теоретична дисперсія (1/λ²)': theoreticalVar.toFixed(4)
      }
    );
  }
  
  console.log('Метод 2: Нормальний розподіл');
  
  const normalParams = [
    { a: 0, sigma: 1 },
    { a: 5, sigma: 2 },
    { a: 10, sigma: 3 }
  ];
  
  for (const { a, sigma } of normalParams) {
    const normalData = generateNormal(N, a, sigma);
    const normalTest = chiSquaredTestNormal(normalData, a, sigma);
    
    printResults(
      `Нормальний розподіл (a = ${a}, σ = ${sigma})`,
      normalData,
      normalTest,
      {
        'a (математичне сподівання)': a,
        'σ (стандартне відхилення)': sigma,
        'Теоретичне середнє': a,
        'Теоретична дисперсія (σ²)': (sigma * sigma).toFixed(4)
      }
    );
  }
  
  console.log('Метод 3: Лінійний конгруентний генератор (ЛКГ)');
  
  const lcgParams = [
    { a: Math.pow(5, 13), c: Math.pow(2, 31), name: 'a=5¹³, c=2³¹' },
    { a: 16807, c: Math.pow(2, 31) - 1, name: 'a=7⁵, c=2³¹-1 (Park-Miller)' },
    { a: 1103515245, c: Math.pow(2, 31), name: 'a=1103515245, c=2³¹ (ANSI C)' }
  ];
  
  for (const { a, c, name } of lcgParams) {
    const lcgData = generateLCG(N, a, c);
    const lcgTest = chiSquaredTestUniform(lcgData);
    
    const theoreticalMean = 0.5;
    const theoreticalVar = 1 / 12;
    
    printResults(
      `Лінійний конгруентний генератор (${name})`,
      lcgData,
      lcgTest,
      {
        'a (множник)': a.toExponential(4),
        'c (модуль)': c.toExponential(4),
        'Теоретичне середнє': theoreticalMean.toFixed(4),
        'Теоретична дисперсія': theoreticalVar.toFixed(6)
      }
    );
  }
})();

