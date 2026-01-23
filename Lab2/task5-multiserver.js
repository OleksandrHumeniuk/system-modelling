const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ЗАВДАННЯ 5: Багатоканальна модель обслуговування');
console.log('CREATE → PROCESS (3 паралельних пристрої) → DISPOSE');

const model = new Model();

const create = new Create('Генератор', 1.0, 200); // Середня затримка = 1.0, макс 200 заявок
const process = new Process('Багатоканальний пристрій', 2.5, 3); // Середній час обсл. = 2.5, 3 канали
const dispose = new Dispose('Вихід');

create.addNext(process);
process.addNext(dispose);
model.setElements([create, process, dispose]);

// Запустити симуляцію
create.start();
model.simulate(500);

// Теоретична перевірка (черга M/M/c - c пристроїв)
console.log('\n' + '='.repeat(70));
console.log('ТЕОРЕТИЧНІ ЗНАЧЕННЯ (Черга M/M/c з c=3):');
console.log('='.repeat(70));

const lambda = 1 / create.meanDelay; // Інтенсивність надходження
const mu = 1 / process.meanServiceTime; // Інтенсивність обслуговування одним пристроєм
const c = process.channels; // Кількість пристроїв
const rho = lambda / (c * mu); // Завантаження одного пристрою
const systemLoad = lambda / mu; // Навантаження системи

console.log(`  Інтенсивність надходження (λ): ${lambda.toFixed(4)}`);
console.log(`  Інтенсивність обслуговування одним пристроєм (μ): ${mu.toFixed(4)}`);
console.log(`  Кількість пристроїв (c): ${c}`);
console.log(`  Навантаження системи (λ/μ): ${systemLoad.toFixed(4)}`);
console.log(`  Теоретичне завантаження одного пристрою (ρ = λ/(c·μ)): ${(rho * 100).toFixed(2)}%`);

if (lambda < c * mu) {
  console.log(`  Система СТАБІЛЬНА (λ < c·μ)`);
  console.log(`  Примітка: формули для черги M/M/c складні, показані приблизні значення`);
} else {
  console.log('  Система НЕСТАБІЛЬНА (λ >= c·μ)!');
}

// Порівняння з одноканальним пристроєм
console.log('\n' + '='.repeat(70));
console.log('ПОРІВНЯННЯ: Багатоканальний vs Одноканальний');
console.log('='.repeat(70));

const singleServerRho = lambda / mu;
console.log(`  Завантаження одноканального пристрою: ${(singleServerRho * 100).toFixed(2)}%`);
console.log(`  Завантаження багатоканального пристрою: ${(rho * 100).toFixed(2)}%`);
console.log(`  Виграш: зменшення завантаження на ${((singleServerRho - rho) / singleServerRho * 100).toFixed(1)}%`);

