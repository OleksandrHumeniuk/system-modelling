const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ЗАВДАННЯ 1: Проста модель з одним пристроєм');
console.log('CREATE → PROCESS → DISPOSE');

const model = new Model();

const create = new Create('Генератор', 2.0, 100);
const process = new Process('Процес', 1.5, 1);
const dispose = new Dispose('Вихід');

create.addNext(process);
process.addNext(dispose);
model.setElements([create, process, dispose]);

create.start();
model.simulate(500);

console.log('\nТЕОРЕТИЧНІ ЗНАЧЕННЯ');

const lambda = 1 / create.meanDelay; // Інтенсивність надходження
const mu = 1 / process.meanServiceTime; // Інтенсивність обслуговування
const rho = lambda / mu; // Завантаження

console.log(`  Інтенсивність надходження (λ): ${lambda.toFixed(4)}`);
console.log(`  Інтенсивність обслуговування (μ): ${mu.toFixed(4)}`);
console.log(`  Теоретичне завантаження (ρ = λ/μ): ${(rho * 100).toFixed(2)}%`);

if (rho < 1) {
  const L = rho / (1 - rho); // Середня кількість в черзі
  const W = L / lambda; // Середній час в черзі
  console.log(`  Теоретична середня довжина черги (L = ρ/(1-ρ)): ${L.toFixed(4)}`);
  console.log(`  Теоретичний середній час очікування (W = L/λ): ${W.toFixed(4)}`);
} else {
  console.log('  Система нестабільна (ρ >= 1)!');
}
