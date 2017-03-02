import { Queue } from './core/queue.js';

class Mee extends Queue {
  constructor(...arg) {
    super(arg);
  }
  static get isMee() {
    return true;
  }
}

export default Mee;
