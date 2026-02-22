const Model = require('./src/core/Model');
const Create = require('./src/elements/Create');
const AttributeAssigner = require('./src/elements/AttributeAssigner');
const PriorityProcess = require('./src/elements/PriorityProcess');
const Process = require('./src/elements/Process');
const Delay = require('./src/elements/Delay');
const RouterByCondition = require('./src/elements/RouterByCondition');
const Dispose = require('./src/elements/Dispose');
const { exponential, uniform, erlang } = require('./src/utils/random');
const { mean } = require('./src/utils/stats');

const MEAN_BY_TYPE = { 1: 15, 2: 40, 3: 30 };

console.log('ЗАВДАННЯ 3: Лікарня (універсальні PriorityProcess, Process, RouterByCondition, AttributeAssigner)');
console.log('Типи хворих: 1 (0.5) реєстр. 15 хв, 2 (0.1) 40 хв, 3 (0.4) 30 хв');
console.log('Інтервал прибуття експ(15), 2 лікарі, пріоритет тим хто пройшов попередній огляд\n');

const model = new Model();

const create = new Create('Прибуття', 15, 500);
const attributeAssigner = new AttributeAssigner('Визначення типу', [
  { probability: 0.5, attributes: { patientType: 1, preliminaryDone: true, } }, // хворі, що пройшли попереднє обстеження і направлені на лікування 
  { probability: 0.1, attributes: { patientType: 2, preliminaryDone: false } }, // хворі, що бажають потрапити в лікарню, але не пройшли повністю попереднє обстеження
  { probability: 0.4, attributes: { patientType: 3, preliminaryDone: false } } // хворі, які тільки що поступили на попереднє обстеження
]);

const escort = new Process('Супровід до палати', 0, 3, {
  serviceTimeSampler: () => uniform(3, 8)
});
const delayToLab = new Delay('Рух в лабораторію', 2, 5);

const routeAfterAdmission = new RouterByCondition('Маршрут після приймального');
routeAfterAdmission.addRoute((e) => e.patientType === 1, escort);
routeAfterAdmission.addRoute(() => true, delayToLab);

const admission = new PriorityProcess('Приймальне відділення', 2, {
  priorityFn: (e) => (e.preliminaryDone ? 1 : 0),
  serviceTimeSampler: (e) => exponential(MEAN_BY_TYPE[e.patientType] || 15)
});
admission.addNext(routeAfterAdmission);

const labReg = new Process('Реєстратура лабораторії', 0, 1, {
  serviceTimeSampler: () => erlang(4.5, 3),
  recordArrivalTimes: true
});
const labTech = new Process('Лаборанти', 0, 2, {
  serviceTimeSampler: () => erlang(4, 2)
});
const delayToAdmission = new Delay('Рух в приймальне', 2, 5);
const disposeWard = new Dispose('Палата');
const disposeLeave = new Dispose('Вихід з лікарні');

const routeAfterLab = new RouterByCondition('Маршрут після лабораторії');
routeAfterLab.addRoute((e) => e.patientType === 2, delayToAdmission, (e) => {
  e.preliminaryDone = true;
  e.patientType = 1;
});
routeAfterLab.addRoute(() => true, disposeLeave);

create.addNext(attributeAssigner);
attributeAssigner.addNext(admission);
escort.addNext(disposeWard);
delayToLab.addNext(labReg);
labReg.addNext(labTech);
labTech.addNext(routeAfterLab);
delayToAdmission.addNext(admission);

model.setElements([
  create,
  attributeAssigner,
  admission,
  routeAfterAdmission,
  escort,
  delayToLab,
  labReg,
  labTech,
  routeAfterLab,
  delayToAdmission,
  disposeWard,
  disposeLeave
]);

create.start();
model.simulate(10000);

const wardStats = disposeWard.getStats();
const leaveStats = disposeLeave.getStats();
const arrivalTimes = labReg.getArrivalTimes();
const intervals = [];
for (let i = 1; i < arrivalTimes.length; i++) {
  intervals.push(arrivalTimes[i] - arrivalTimes[i - 1]);
}

console.log('\n' + '='.repeat(70));
console.log('РЕЗУЛЬТАТИ ЗАВДАННЯ 3');
console.log('='.repeat(70));
console.log('1. Середній час у системі (доставлені в палату):', wardStats.averageTimeInSystem.toFixed(2), 'хв');
console.log('   Кількість:', wardStats.entitiesDisposed);
console.log('2. Середній час у системі (вийшли з лабораторії):', leaveStats.averageTimeInSystem.toFixed(2), 'хв');
console.log('   Кількість:', leaveStats.entitiesDisposed);
console.log('3. Середній інтервал між прибуттями в лабораторію:', intervals.length > 0 ? mean(intervals).toFixed(2) : '—', 'хв');
console.log('   Кількість інтервалів:', intervals.length);
console.log('='.repeat(70));
