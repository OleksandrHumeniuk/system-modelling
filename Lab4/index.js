/**
 * Завдання 2 та 4: Експериментальна оцінка складності алгоритму симуляції.
 * Серія експериментів для структури "ланцюг" (завд.2) та "паралельні СМО" (завд.4).
 */

const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');
const Router = require('./src/elements/Router');
const { exponential } = require('./src/utils/random');

const END_TIME = 2000;
const MEAN_ARRIVAL = 1;
const MEAN_SERVICE = 0.8;
const RUNS_PER_N = 5;
const N_VALUES = [2, 5, 10, 15, 20];

// ——— Структура 1: ланцюг Create → P1 → P2 → … → PN → Dispose ———
function buildChainModel(n) {
  const model = new Model();
  const create = new Create('Генератор', MEAN_ARRIVAL, Infinity, 0);
  const processes = [];
  for (let i = 0; i < n; i++) {
    processes.push(new Process(`P${i + 1}`, MEAN_SERVICE, 1, { serviceTimeSampler: () => exponential(MEAN_SERVICE) }));
  }
  const dispose = new Dispose('Вихід');
  create.addNext(processes[0]);
  for (let i = 0; i < n - 1; i++) processes[i].addNext(processes[i + 1]);
  processes[n - 1].addNext(dispose);
  model.setElements([create, ...processes, dispose]);
  return { model, create };
}

// ——— Структура 2: паралельні СМО — Create → Router → [P1..PN] → Dispose ———
function buildParallelModel(n) {
  const model = new Model();
  const create = new Create('Генератор', MEAN_ARRIVAL, Infinity, 0);
  const router = new Router('Роутер', 'probability');
  const processes = [];
  const dispose = new Dispose('Вихід');
  for (let i = 0; i < n; i++) {
    const p = new Process(`P${i + 1}`, MEAN_SERVICE, 1, { serviceTimeSampler: () => exponential(MEAN_SERVICE) });
    p.addNext(dispose);
    processes.push(p);
    router.addNext(p, 1 / n);
  }
  create.addNext(router);
  model.setElements([create, router, ...processes, dispose]);
  return { model, create };
}

function runExperiment(buildModel, label) {
  const results = [];
  for (const n of N_VALUES) {
    const times = [];
    const events = [];
    for (let r = 0; r < RUNS_PER_N; r++) {
      const { model, create } = buildModel(n);
      model.reset();
      create.start();
      const res = model.simulate(END_TIME, { silent: true });
      times.push(res.realTimeMs);
      events.push(res.eventCount);
    }
    const avgTime = times.reduce((a, b) => a + b, 0) / RUNS_PER_N;
    const avgEvents = events.reduce((a, b) => a + b, 0) / RUNS_PER_N;
    results.push({ n, eventSources: n + 1, avgTime: Math.round(avgTime * 100) / 100, avgEvents: Math.round(avgEvents) });
  }
  return results;
}

function printTable(data, title) {
  console.log('\n' + '='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
  console.log('  N (СМО)   Оцінка подій (N+1)   Середня кількість подій   Час (мс)');
  console.log('-'.repeat(70));
  for (const row of data) {
    console.log(`  ${String(row.n).padStart(5)}    ${String(row.eventSources).padStart(10)}           ${String(row.avgEvents).padStart(15)}             ${row.avgTime}`);
  }
  console.log('='.repeat(70));
}

console.log('ЛАБОРАТОРНА РОБОТА 4 — ЕКСПЕРИМЕНТИ З СКЛАДНІСТЮ СИМУЛЯЦІЇ');
console.log('Час симуляції: ' + END_TIME + ', запусків на кожне N: ' + RUNS_PER_N);
console.log('Значення N: ' + N_VALUES.join(', '));

// Завдання 2: експерименти для структури "ланцюг"
const chainResults = runExperiment(buildChainModel, 'Структура 1: ланцюг');
printTable(chainResults, 'ЗАВДАННЯ 2 — Експериментальна оцінка складності (структура: ланцюг N СМО)');

// Завдання 4: повтор експерименту при зміні структури (паралельні СМО)
const parallelResults = runExperiment(buildParallelModel, 'Структура 2: паралельні СМО');
printTable(parallelResults, 'ЗАВДАННЯ 4 — Повтор експерименту (структура: паралельні N СМО)');

// Порівняння
console.log('\nПОРІВНЯННЯ СТРУКТУР (середній час, мс):');
console.log('  N      Ланцюг   Паралель');
console.log('-'.repeat(35));
for (let i = 0; i < N_VALUES.length; i++) {
  console.log(`  ${String(N_VALUES[i]).padStart(3)}    ${String(chainResults[i].avgTime).padStart(8)}   ${String(parallelResults[i].avgTime).padStart(8)}`);
}
console.log('\nПримітка: при паралельній структурі заявки розподіляються між N процесами;\nкількість подій та час можуть відрізнятися через іншу динаміку черг.');
