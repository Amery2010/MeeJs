import { Queue } from './core/queue.js';
import { query, queryAll } from './core/selector.js';

const GLOBAL = this;

class Mee {
  constructor({ global, modules = {} }) {
    if (global) {
      GLOBAL.Mee = Mee;
    }
    if (modules.length > 0) {
      Mee.use(modules);
    }
  }
  static use(modules) {
    for (let name in modules) {
      Queue.prototype[name] = function (...arg) {
        return this.each(elem => modules[name](elem, ...arg));
      };
    }
  }
  query(selector, context) {
    return new Queue(query(selector, context));
  }
  queryAll(selector, context) {
    return new Queue(...queryAll(selector, context));
  }
}

export default Mee;
