/**
 * Event - Подія симуляції
 */
class Event {
  constructor(time, type, element, entity = null, data = {}) {
    this.time = time;
    this.type = type;
    this.element = element;
    this.entity = entity;
    this.data = data;
  }
}

/**
 * Типи подій
 */
const EventType = {
  CREATE: 'CREATE',
  END_SERVICE: 'END_SERVICE',
  START_SERVICE: 'START_SERVICE',
  DELAY_END: 'DELAY_END'
};

module.exports = { Event, EventType };
