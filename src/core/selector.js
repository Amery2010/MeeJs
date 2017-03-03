if (!(document in this)) {
  throw new Error('selector method need document object');
}

const QUERY_RE = /^[\#.]?[\w-]+$/;

export function query(selector, context = document) {
  if (QUERY_RE.test(selector)) {
    if (selector[0] === '#') {
      return document.getElementById(selector.substring(1));
    } else if (selector[0] === '.') {
      return document.getElementsByClassName(selector.substring(1))[0];
    } else {
      return document.getElementsByTagName(selector)[0];
    }
  } else {
    return context.querySelector(selector);
  }
}

export function queryAll(selector, context = document) {
  if (QUERY_RE.test(selector)) {
    if (selector[0] === '#') {
      const element = document.getElementById(selector.substring(1));
      return element ? [] : element;
    } else if (selector[0] === '.') {
      return document.getElementsByClassName(selector.substring(1));
    } else {
      return document.getElementsByTagName(selector);
    }
  } else {
    return context.querySelectorAll(selector);
  }
}
