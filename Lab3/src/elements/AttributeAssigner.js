const Element = require('../core/Element');

/**
 * AttributeAssigner - Універсальне призначення атрибутів заявці за ймовірностями.
 * rules: [{ probability: number, attributes: object }] — сума probability має бути 1 (або буде нормалізовано).
 * Після призначення заявка передається до єдиного наступного елемента (selectNext).
 */
class AttributeAssigner extends Element {
  constructor(name = 'AttributeAssigner', rules = []) {
    super(name);
    this.rules = rules;
    let sum = this.rules.reduce((s, r) => s + r.probability, 0);
    if (sum > 0 && Math.abs(sum - 1) > 0.001) {
      this.rules = this.rules.map(r => ({ ...r, probability: r.probability / sum }));
    }
  }

  addRule(probability, attributes) {
    this.rules.push({ probability, attributes });
    let sum = this.rules.reduce((s, r) => s + r.probability, 0);
    if (sum > 0) {
      this.rules = this.rules.map(r => ({ ...r, probability: r.probability / sum }));
    }
  }

  inAct(entity) {
    this.entitiesIn++;
    const r = Math.random();
    let cumulative = 0;
    for (const rule of this.rules) {
      cumulative += rule.probability;
      if (r < cumulative) {
        Object.assign(entity, rule.attributes);
        break;
      }
    }
    this.entitiesOut++;
    const next = this.selectNext();
    if (next) next.inAct(entity);
  }
}

module.exports = AttributeAssigner;
