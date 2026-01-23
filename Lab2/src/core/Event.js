/**
 * Event - Represents a simulation event
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
 * Event types
 */
const EventType = {
  CREATE: 'CREATE',
  END_SERVICE: 'END_SERVICE',
  START_SERVICE: 'START_SERVICE'
};

module.exports = { Event, EventType };
