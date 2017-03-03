export class Queue extends Array {
  constructor(...arg) {
    super([...arg].filter(item => item));
  }
  each(cb) {
    if (this.length === 1) {
      cb(this[0], 0);
    } else {
      this.forEach.call(this, cb);
    }
    return this;
  }
}

export default function queue(...arg) {
  return new Queue(arg);
}
