export class Queue extends Array {
  constructor(...arg) {
    super(arg);
  }
}

export default function queue(...arg) {
  return new Queue(arg);
}
