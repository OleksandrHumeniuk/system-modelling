const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const MultiLaneProcess = require('./src/elements/MultiLaneProcess');
const Dispose = require('./src/elements/Dispose');
const Entity = require('./src/core/Entity');
const { Event, EventType } = require('./src/core/Event');
const { exponential, normal } = require('./src/utils/random');

console.log('ЗАВДАННЯ 2: Драйв-ін банк (універсальна MultiLaneProcess)');
console.log('Перший клієнт о 0.1, інтервал експ(0.5), обслуговування експ(0.3)');
console.log('Початковий стан: обидва каси зайняті (норма 1, 0.3), по 2 авто в кожній черзі\n');

const model = new Model();
const create = new Create('Генератор', 0.5, 10000, 0.1);
const driveThru = new MultiLaneProcess('Драйв-ін банк', {
  numLanes: 2,
  maxTotal: 8,
  maxPerLane: 3,
  serviceTimeSampler: () => exponential(0.3),
  queueSelector: (lengths) => (lengths[0] <= lengths[1] ? 0 : 1),
  laneChange: { enabled: true, minDiff: 2 }
});
const dispose = new Dispose('Вихід');

create.addNext(driveThru);
driveThru.addNext(dispose);
model.setElements([create, driveThru, dispose]);

driveThru.setInitialState((process) => {
  const t0 = 0;
  const e0 = new Entity(t0);
  const e1 = new Entity(t0);
  const e2 = new Entity(t0);
  const e3 = new Entity(t0);
  const e4 = new Entity(t0);
  const e5 = new Entity(t0);
  const d1 = Math.max(0.01, normal(1, 0.3));
  const d2 = Math.max(0.01, normal(1, 0.3));
  process.servers[0] = e0;
  process.servers[1] = e1;
  process.queues[0] = [e2, e3];
  process.queues[1] = [e4, e5];
  process.serverBusyTime[0] += d1;
  process.serverBusyTime[1] += d2;
  process.lastStatsTime = t0;
  process.model.scheduleEvent(new Event(t0 + d1, EventType.END_SERVICE, process, e0, { channelIndex: 0 }));
  process.model.scheduleEvent(new Event(t0 + d2, EventType.END_SERVICE, process, e1, { channelIndex: 1 }));
});

create.start();
model.simulate(500);

console.log('\n' + '='.repeat(70));
console.log('МЕТРИКИ ЗАВДАННЯ 2');
console.log('='.repeat(70));
const s = driveThru.getStats();
console.log(`1. Середнє завантаження каси 1: ${(s.avgUtilization[0] * 100).toFixed(2)}%`);
console.log(`2. Середнє завантаження каси 2: ${(s.avgUtilization[1] * 100).toFixed(2)}%`);
console.log(`3. Середня кількість клієнтів у банку: ${s.avgInSystem.toFixed(4)}`);
console.log(`4. Середній інтервал між виїздами з вікон: ${s.avgDepartureInterval.toFixed(4)}`);
console.log(`5. Середній час перебування клієнта в банку: ${s.avgTimeInSystem.toFixed(4)}`);
console.log(`6. Середня довжина черги 1: ${s.avgQueueLengths[0].toFixed(4)}, черги 2: ${s.avgQueueLengths[1].toFixed(4)}`);
console.log(`7. Відсоток відмов (втрачених клієнтів): ${s.pctLost.toFixed(2)}%`);
console.log(`   Перестроювань смуг: ${s.laneChangeCount}`);
