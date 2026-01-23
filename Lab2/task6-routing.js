const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ЗАВДАННЯ 6: Маршрутизація з кількома шляхами та циклами');
console.log('CREATE → PROCESS1 → [70% → PROCESS2 → DISPOSE]');
console.log('                 ↘ [30% → назад до PROCESS1 (цикл)]');

// Створити модель симуляції
const model = new Model();

// Створити елементи
const create = new Create('Генератор', 3.0, 100); // Середня затримка = 3.0, макс 100 заявок
const process1 = new Process('Процес 1 (Контроль якості)', 1.0, 1);
const process2 = new Process('Процес 2 (Фінальний)', 1.5, 1);
const dispose = new Dispose('Вихід');

// Налаштувати маршрутизацію з ймовірностями
// Process1 має 70% шанс перейти до Process2, 30% шанс повернутися до себе
process1.addNext(process2, 0.7);  // 70% до Process2
process1.addNext(process1, 0.3);  // 30% повернення до Process1

// Простий ланцюг для інших елементів
create.addNext(process1);
process2.addNext(dispose);

// Додати елементи до моделі
model.setElements([create, process1, process2, dispose]);

// Запустити симуляцію
create.start();
model.simulate(500);

// Аналіз
console.log('АНАЛІЗ МАРШРУТИЗАЦІЇ:');

const process1Stats = process1.getStats();
const process2Stats = process2.getStats();

console.log(`  Процес 1:`);
console.log(`    Заявок прийнято: ${process1Stats.entitiesIn}`);
console.log(`    Заявок відправлено: ${process1Stats.entitiesOut}`);
console.log(`    Примітка: більше заявок заходить, ніж створено, через цикли`);

console.log(`\n  Процес 2:`);
console.log(`    Заявок прийнято: ${process2Stats.entitiesIn}`);
console.log(`    Заявок відправлено: ${process2Stats.entitiesOut}`);

console.log(`\n  Аналіз циклів:`);
const loopIterations = process1Stats.entitiesOut - process2Stats.entitiesIn;
console.log(`    Заявок, що повернулися: ~${loopIterations}`);
console.log(`    Середня кількість циклів на заявку: ${(process1Stats.entitiesOut / create.entitiesCreated).toFixed(2)}`);
console.log(`    Очікувана частота циклів: 30%`);
console.log(`    Фактично до Процесу 2: ${(process2Stats.entitiesIn / process1Stats.entitiesOut * 100).toFixed(2)}%`);
console.log(`    Фактично повернулося: ${(loopIterations / process1Stats.entitiesOut * 100).toFixed(2)}%`);