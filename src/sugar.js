/**
 * This is just a modern browser for operation on a simplified DOM syntactic sugar script
 *
 * @namespace SugarJs
 * @auhor Amery
 * @version v0.5.1
 */

;(function (window, document, undifined) {
    'use strict';

    var Sugar, sugar, query, fragment, ready,
        hasClass, addClass, removeClass, toggleClass,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        div = document.createElement('div'),
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        specialTags = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow, '*': div
        },
        emptyArray = [];

    query = function query(selector, context) {
        context = context || document;

        if (/^[\#.]?[\w-]+$/.test(selector)) {
            if (selector[0] === '.') {
                return context.getElementsByClassName(selector.slice(1));
            } else if (selector[0] === '#') {
                var element = context.getElementById(selector.slice(1));
                return element ? [element] : [];
            } else {
                return context.getElementsByTagName(selector);
            }
        }
        return context.querySelectorAll(selector);
    };

    fragment = function fragment(html) {
        var tagName = html.match(fragmentRE)[1],
            container, dom;

        if (singleTagRE.test(html)) {
            return [document.createElement(tagName)];
        } else {
            if (!(tagName in specialTags)) {
                tagName = '*';
            }
            container = specialTags[tagName];
            container.innerHTML = '' + html;
            dom = emptyArray.slice.call(container.childNodes);
            container.innerHTML = '';
            return dom;
        }
    };

    ready = function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    hasClass = (function () {
        if (div.classList) {
            return function (elem, className) {
                return elem.classList.contains(className);
            };
        } else {
            return function (elem, className) {
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(elem.className);
            };
        }
    }());

    addClass = (function () {
        if (div.classList) {
            return function (elem, className) {
                elem.classList.add(className);
            };
        } else {
            return function (elem, className) {
                if (!hasClass(elem, className)) {
                    elem.className += ' ' + className;
                }
            };
        }
    }());

    removeClass = (function () {
        if (div.classList) {
            return function (elem, className) {
                elem.classList.remove(className);
            };
        } else {
            return function (elem, className) {
                elem.className = elem.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            };
        }
    }());

    toggleClass = (function () {
        if (div.classList) {
            return function (elem, className) {
                elem.classList.toggle(className);
            };
        } else {
            return function (elem, className) {
                if (hasClass(elem, className)) {
                    removeClass(elem, className);
                } else {
                    addClass(elem, className);
                }
            };
        }
    }());

    Sugar = function Sugar(query) {
        var len = query.length;

        this.length = len;
        while (len--) {
            this[len] = query[len];
        }
    };

    Sugar.prototype = {
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,
        splice: emptyArray.splice,
        slice: function () {
            return new Sugar(emptyArray.slice.apply(this, arguments));
        },
        each: function (callback) {
            var len = this.length;
            while (len--) {
                callback.call(this, this[len], len, this);
            }
            return this;
        },
        map: function (callback) {
            var len = this.length;
            while (len--) {
                this[len] = callback.call(this, this[len], len, this);
            }
            return this;
        },
        find: function (selector) {
            var elems = [];
            this.each(function (elem) {
                emptyArray.forEach.call(query(selector, elem), function (el) {
                    if (elems.indexOf(el) === -1) {
                        elems.push(el);
                    }
                });
            });
            return new Sugar(elems);
        },
        hasClass: function (className) {
            var len = this.length;
            while (len--) {
                if (hasClass(this[len], className)) {
                    return true;
                }
            }
        },
        addClass: function (className) {
            return this.each(function (elem) {
                addClass(elem, className);
            });
        },
        removeClass: function (className) {
            return this.each(function (elem) {
                removeClass(elem, className);
            });
        },
        toggleClass: function (className) {
            return this.each(function (elem) {
                toggleClass(elem, className);
            });
        }
    };

    sugar = function sugar(selector, context) {
        if (!selector) {
            return new Sugar(emptyArray);
        }

        if (context) {
            if (typeof context === 'string') {
                return new Sugar(query(selector, context));
            } else {
                context = context instanceof Sugar ? context : new Sugar(context);
                return context.find(selector);
            }
        }

        if (typeof selector === 'string') {
            selector = selector.trim();
            if (selector[0] === '<' && fragmentRE.test(selector)) {
                return new Sugar(fragment(selector));
            } else {
                return new Sugar(query(selector));
            }
        } else if (selector instanceof Sugar) {
            return selector;
        } else if (typeof selector === 'function') {
            return ready(selector);
        } else if (emptyArray.isArray(selector)) {
            return new Sugar(selector);
        } else {
            return new Sugar([selector]);
        }
    };

    sugar.fn = Sugar.prototype;

    window.sugar = sugar;
    if (!window.$) window.$ = sugar;
}(window, document));
