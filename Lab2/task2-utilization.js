const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const Process = require('./src/elements/Process');
const Dispose = require('./src/elements/Dispose');

console.log('ЗАВДАННЯ 2: Демонстрація завантаження пристрою');
console.log('Порівняння сценаріїв з різним завантаженням');

const scenarios = [
  { name: 'Низьке навантаження (ρ ≈ 0.3)', arrivalDelay: 4.0, serviceTime: 1.2 },
  { name: 'Середнє навантаження (ρ ≈ 0.6)', arrivalDelay: 2.0, serviceTime: 1.2 },
  { name: 'Високе навантаження (ρ ≈ 0.9)', arrivalDelay: 1.2, serviceTime: 1.1 }
];

for (const scenario of scenarios) {
  console.log(`\nВиконується: ${scenario.name}...`);
  
  const model = new Model();
  const create = new Create('Генератор', scenario.arrivalDelay, 500);
  const process = new Process('Процес', scenario.serviceTime, 1);
  const dispose = new Dispose('Вихід');

  create.addNext(process);
  process.addNext(dispose);

  model.setElements([create, process, dispose]);

  create.start();
  model.simulate(1000);

  const stats = process.getStats();
  const lambda = 1 / scenario.arrivalDelay;
  const mu = 1 / scenario.serviceTime;
  
  console.log(`\n  Сценарій: ${scenario.name}`);
  console.log(`  λ (інтенсивність надходження): ${lambda.toFixed(4)}`);
  console.log(`  μ (інтенсивність обслуговування): ${mu.toFixed(4)}`);
  console.log(`  Завантаження: ${(stats.utilization * 100).toFixed(1)}%`);
  console.log(`  Середня довжина черги: ${stats.averageQueueLength.toFixed(4)}`);
  console.log(`  Середній час очікування: ${stats.averageWaitTime.toFixed(4)}`);
  console.log(`  Оброблено заявок: ${stats.entitiesProcessed}`);
}