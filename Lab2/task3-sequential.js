const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ЗАВДАННЯ 3: Послідовний ланцюг з 3 процесів');
console.log('CREATE → PROCESS1 → PROCESS2 → PROCESS3 → DISPOSE');

const model = new Model();

const create = new Create('Генератор', 5.0, 200); // Середня затримка = 5.0, макс 200 заявок
const process1 = new Process('Процес 1', 2.0); // Середній час обсл. = 2.0
const process2 = new Process('Процес 2', 1.5); // Середній час обсл. = 1.5
const process3 = new Process('Процес 3', 1.0); // Середній час обсл. = 1.0
const dispose = new Dispose('Вихід');

create.addNext(process1);
process1.addNext(process2);
process2.addNext(process3);
process3.addNext(dispose);

model.setElements([create, process1, process2, process3, dispose]);

create.start();
model.simulate(1000);

// Додатковий аналіз
console.log('\n' + '='.repeat(70));
console.log('АНАЛІЗ СИСТЕМИ:');
console.log('='.repeat(70));

const lambda = 1 / create.meanDelay; // Інтенсивність надходження
console.log(`  Інтенсивність надходження в систему (λ): ${lambda.toFixed(4)} заявок/час`);

const mu1 = 1 / process1.meanServiceTime;
const mu2 = 1 / process2.meanServiceTime;
const mu3 = 1 / process3.meanServiceTime;

console.log(`  Інтенсивність обсл. Процесу 1 (μ₁): ${mu1.toFixed(4)} заявок/час`);
console.log(`  Інтенсивність обсл. Процесу 2 (μ₂): ${mu2.toFixed(4)} заявок/час`);
console.log(`  Інтенсивність обсл. Процесу 3 (μ₃): ${mu3.toFixed(4)} заявок/час`);

const rho1 = lambda / mu1;
const rho2 = lambda / mu2;
const rho3 = lambda / mu3;

console.log(`\n  Теоретичні завантаження:`);
console.log(`    Процес 1: ρ₁ = ${(rho1 * 100).toFixed(2)}%`);
console.log(`    Процес 2: ρ₂ = ${(rho2 * 100).toFixed(2)}%`);
console.log(`    Процес 3: ρ₃ = ${(rho3 * 100).toFixed(2)}%`);

// Перевірити стабільність системи
console.log(`\n  Стабільність системи:`);
if (rho1 < 1 && rho2 < 1 && rho3 < 1) {
  console.log(`    ✓ Система СТАБІЛЬНА (всі ρᵢ < 1)`);
} else {
  console.log(`    ✗ Система НЕСТАБІЛЬНА (деякі ρᵢ >= 1)`);
}

// Аналіз вузького місця
const maxRho = Math.max(rho1, rho2, rho3);
if (maxRho === rho1) {
  console.log(`    Вузьке місце: Процес 1 (найвище завантаження)`);
} else if (maxRho === rho2) {
  console.log(`    Вузьке місце: Процес 2 (найвище завантаження)`);
} else {
  console.log(`    Вузьке місце: Процес 3 (найвище завантаження)`);
}
