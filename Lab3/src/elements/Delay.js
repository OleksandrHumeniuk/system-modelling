const Element = require('../core/Element');
const { Event, EventType } = require('../core/Event');
const { uniform } = require('../utils/random');

/**
 * Delay - Затримка заявки на випадковий (або фіксований) час, потім передача до наступного елемента.
 * Використовує подію DELAY_END; Model має обробляти EventType.DELAY_END.
 */
class Delay extends Element {
  /**
   * @param {string} name - Назва елемента
   * @param {number} [minTime] - Мінімальна затримка (для рівномірного розподілу)
   * @param {number} [maxTime] - Максимальна затримка (для рівномірного). Якщо обидва 0 — затримка 0.
   */
  constructor(name = 'Delay', minTime = 0, maxTime = 0) {
    super(name);
    this.minTime = minTime;
    this.maxTime = maxTime;
  }

  inAct(entity) {
    this.entitiesIn++;
    const delay = this.maxTime > this.minTime ? uniform(this.minTime, this.maxTime) : 0;
    const endTime = this.model.currentTime + delay;
    const event = new Event(endTime, EventType.DELAY_END, this, entity, {});
    this.model.scheduleEvent(event);
  }

  /**
   * Викликається моделлю при обробці події DELAY_END
   */
  finishDelay(entity) {
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);
  }
}

module.exports = Delay;
