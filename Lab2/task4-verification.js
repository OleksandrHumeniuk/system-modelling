const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ВЕРИФІКАЦІЯ ПОСЛІДОВНИХ СИСТЕМ - Завдання 4');

// Параметри симуляції
const arrivalDelay = 5.0;
const serviceTimes = [2.0, 1.5, 1.0];
const simTime = 1000;
const maxEntities = 500;

// Створити модель
const model = new Model();
const create = new Create('Генератор', 5.0, maxEntities);
const process1 = new Process('Процес 1', serviceTimes[0], 1);
const process2 = new Process('Процес 2', serviceTimes[1], 1);
const process3 = new Process('Процес 3', serviceTimes[2], 1);
const dispose = new Dispose('Вихід');

// З'єднати у послідовний ланцюг
create.addNext(process1);
process1.addNext(process2);
process2.addNext(process3);
process3.addNext(dispose);

model.setElements([create, process1, process2, process3, dispose]);

// Запустити симуляцію
create.start();
model.simulate(simTime);

// Зібрати статистику
const lambda = 1 / arrivalDelay;
const stats1 = process1.getStats();
const stats2 = process2.getStats();
const stats3 = process3.getStats();
const disposeStats = dispose.getStats();

// Теоретичні значення для кожного процесу
function calcTheory(lambda, mu) {
  const rho = lambda / mu;
  if (rho >= 1) {
    return { rho, Lq: Infinity, Wq: Infinity, stable: false };
  }
  return {
    rho,
    Lq: (rho * rho) / (1 - rho),
    Wq: rho / (mu - lambda),
    stable: true
  };
}

const theory1 = calcTheory(lambda, 1 / serviceTimes[0]);
const theory2 = calcTheory(lambda, 1 / serviceTimes[1]);
const theory3 = calcTheory(lambda, 1 / serviceTimes[2]);

// Вивести результати верифікації
console.log('\nВЕРИФІКАЦІЯ');
console.log(`Параметри: λ=${lambda.toFixed(4)}, Час симуляції=${simTime}`);
console.log(`Створено заявок: ${create.entitiesCreated}, Видалено: ${disposeStats.entitiesDisposed}\n`);

// Процес 1
const rho1Match = Math.abs(theory1.rho - stats1.utilization) < 0.15;
const lq1Match = theory1.stable && Math.abs(theory1.Lq - stats1.averageQueueLength) < Math.max(0.5, theory1.Lq * 0.2);
const wq1Match = theory1.stable && Math.abs(theory1.Wq - stats1.averageWaitTime) < Math.max(0.1, theory1.Wq * 0.2);

console.log('Процес 1:');
console.log(`  μ = ${(1/serviceTimes[0]).toFixed(4)}`);
console.log(`  Завантаження: теорія ${(theory1.rho * 100).toFixed(2)}%, симуляція ${(stats1.utilization * 100).toFixed(2)}% ${rho1Match ? '✓' : '✗'}`);
if (theory1.stable) {
  console.log(`  Довжина черги: теорія ${theory1.Lq.toFixed(3)}, симуляція ${stats1.averageQueueLength.toFixed(3)} ${lq1Match ? '✓' : '✗'}`);
  console.log(`  Час очікування: теорія ${theory1.Wq.toFixed(3)}, симуляція ${stats1.averageWaitTime.toFixed(3)} ${wq1Match ? '✓' : '✗'}`);
} else {
  console.log(`  Система нестабільна (ρ >= 1)`);
}

// Процес 2
const rho2Match = Math.abs(theory2.rho - stats2.utilization) < 0.15;
const lq2Match = theory2.stable && Math.abs(theory2.Lq - stats2.averageQueueLength) < Math.max(0.5, theory2.Lq * 0.2);
const wq2Match = theory2.stable && Math.abs(theory2.Wq - stats2.averageWaitTime) < Math.max(0.1, theory2.Wq * 0.2);

console.log('\nПроцес 2:');
console.log(`  μ = ${(1/serviceTimes[1]).toFixed(4)}`);
console.log(`  Завантаження: теорія ${(theory2.rho * 100).toFixed(2)}%, симуляція ${(stats2.utilization * 100).toFixed(2)}% ${rho2Match ? '✓' : '✗'}`);
if (theory2.stable) {
  console.log(`  Довжина черги: теорія ${theory2.Lq.toFixed(3)}, симуляція ${stats2.averageQueueLength.toFixed(3)} ${lq2Match ? '✓' : '✗'}`);
  console.log(`  Час очікування: теорія ${theory2.Wq.toFixed(3)}, симуляція ${stats2.averageWaitTime.toFixed(3)} ${wq2Match ? '✓' : '✗'}`);
} else {
  console.log(`  Система нестабільна (ρ >= 1)`);
}

// Процес 3
const rho3Match = Math.abs(theory3.rho - stats3.utilization) < 0.15;
const lq3Match = theory3.stable && Math.abs(theory3.Lq - stats3.averageQueueLength) < Math.max(0.5, theory3.Lq * 0.2);
const wq3Match = theory3.stable && Math.abs(theory3.Wq - stats3.averageWaitTime) < Math.max(0.1, theory3.Wq * 0.2);

console.log('\nПроцес 3:');
console.log(`  μ = ${(1/serviceTimes[2]).toFixed(4)}`);
console.log(`  Завантаження: теорія ${(theory3.rho * 100).toFixed(2)}%, симуляція ${(stats3.utilization * 100).toFixed(2)}% ${rho3Match ? '✓' : '✗'}`);
if (theory3.stable) {
  console.log(`  Довжина черги: теорія ${theory3.Lq.toFixed(3)}, симуляція ${stats3.averageQueueLength.toFixed(3)} ${lq3Match ? '✓' : '✗'}`);
  console.log(`  Час очікування: теорія ${theory3.Wq.toFixed(3)}, симуляція ${stats3.averageWaitTime.toFixed(3)} ${wq3Match ? '✓' : '✗'}`);
} else {
  console.log(`  Система нестабільна (ρ >= 1)`);
}

// Вузьке місце
const utilizations = [stats1.utilization, stats2.utilization, stats3.utilization];
const maxUtilIndex = utilizations.indexOf(Math.max(...utilizations));
const bottleneck = ['Процес 1', 'Процес 2', 'Процес 3'][maxUtilIndex];
console.log(`\nВузьке місце: ${bottleneck} (найвище завантаження)`);

// Збереження заявок
const conservationCheck = Math.abs(create.entitiesCreated - disposeStats.entitiesDisposed) <= 10;
console.log(`Збереження заявок: ${conservationCheck ? 'ПРОЙДЕНО' : 'НЕ ПРОЙДЕНО'} (різниця: ${Math.abs(create.entitiesCreated - disposeStats.entitiesDisposed)})`);

// Підсумки
console.log('\nПІДСУМКИ ВЕРИФІКАЦІЇ');
const rhoMatches = [rho1Match, rho2Match, rho3Match].filter(m => m).length;
const lqMatches = [lq1Match, lq2Match, lq3Match].filter(m => m).length;
const wqMatches = [wq1Match, wq2Match, wq3Match].filter(m => m).length;

console.log(`Перевірено процесів: 3`);
console.log(`Завантаження (ρ): ${rhoMatches}/3 збігаються (${(rhoMatches/3*100).toFixed(1)}%)`);
console.log(`Довжина черги (Lq): ${lqMatches}/3 збігаються (${(lqMatches/3*100).toFixed(1)}%)`);
console.log(`Час очікування (Wq): ${wqMatches}/3 збігаються (${(wqMatches/3*100).toFixed(1)}%)`);
console.log(`Збереження заявок: ${conservationCheck ? 'ПРОЙДЕНО' : 'НЕ ПРОЙДЕНО'}`);
