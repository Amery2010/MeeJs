/*jshint eqnull: true, browser: true*/

/**
 * This is just a modern browser for operation on a simplified DOM syntactic sugar script
 *
 * @namespace SugarJs
 * @auhor Amery
 * @version v0.1.0
 */

;(function (window, document, undifined) {
    'use strict';

    var $, Sugar, class2type, type, map, each, query, toArray,
        isSugar, isWindow, isDocument, isUndifined, isNull, isElement, isFunction, isObject, isArrayLike, isString,
        emptyArray = [],
        slice = emptyArray.slice;

    class2type = (function () {
        var typeMap = {};

        ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'].map(function (type) {
            typeMap['[object' + type + ']'] = type.toLowerCase();
        });
        return typeMap;
    }());

    type = function type(obj) {
        return class2type[Object.prototype.toString.call(obj)] || 'object';
    };

    isSugar = function isSugar(obj) {
        return obj instanceof Sugar;
    };

    isWindow = function isWindow(obj) {
        return obj === obj.window;
    };

    isDocument = function isDocument(obj) {
        return obj.nodeType === obj.DOCUMENT_NODE;
    };

    isUndifined = function isUndifined(obj) {
        return obj === undifined;
    };

    isNull = function isNull(obj) {
        return obj !== obj;
    };

    isElement = function isElement(obj) {
        return obj.nodeType === 1;
    };

    isFunction = function isFunction(obj) {
        return typeof obj === 'function';
    };

    isObject = function isObject(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    isArrayLike = function isArrayLike(obj) {
        return 'length' in obj && type(obj.length) === 'number';
    };

    isString = function isString(str) {
        return type(str) === 'string';
    };

    toArray = function toArray(obj) {
        return slice.call(obj);
    };

    map = function map(obj, callback, scope) {
        var item, emptyObj;

        if (Array.isArray(obj)) {
            return obj.map(callback, scope);
        } else {
            emptyObj = {};

            for (item in obj) {
                emptyObj[item] = callback.call(scope, obj[item], item, obj);
            }
            return emptyObj;
        }
    };

    each = function each(obj, callback, scope) {
        var item;

        if (Array.isArray(obj)) {
            obj.forEach(callback, scope);
        } else {
            for (item in obj) {
                callback.call(scope, obj[item], item, obj);
            }
        }
        return obj;
    };

    query = function query(selector, context) {
        context = context || document;

        if (/^[\#.]?[\w-]+$/.test(selector)) {
            if (selector[0] === '.') {
                return toArray(context.getElementsByClassName(selector.slice(1)));
            }
            if (selector[0] === '#') {
                var element = context.getElementById(selector.slice(1));
                return element ? [element] : [];
            }
            return toArray(context.getElementsByTagName(selector));
        }
        return toArray(context.querySelectorAll(selector));
    };

    var attr = (function () {
        var method,
            defaultMethod = function (elem, name, value) {
                if (isUndifined(value)) {
                    if (isObject(name)) {
                        each(name, function (val, key) {
                            this.attr(key, val);
                        }, this);
                        return this;
                    } else {
                        return elem.getAttribute(name);
                    }
                } else {
                    method = function (elem, name, value) {
                        elem.setAttribute(name, isFunction(value) ? value.call(this, elem, elem.getAttribute(name)) : value);
                    };
                }
            };

        return function (name, value) {
            var len = this.length, cb;

            if (len > 0) {
                cb = defaultMethod.call(this, this[0], name, value);
                if (isUndifined(cb)) {
                    while (--len) {
                        method.call(this, this[len], name, value);
                    }
                } else {
                    return cb;
                }
            }

            return this;
        };
    }());

    Sugar = function (selector) {
        var tmpObj = query(selector),
            len = tmpObj.length;

        this.length = len;
        while (len--) {
            this[len] = tmpObj[len];
        }
    };

    Sugar.prototype = {
        each: function (callback) {
            emptyArray.every.call(this, function(el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        attr: attr,
        removeAttr: function (name) {
            this.element.removeAttribute(name);
            return this;
        }
    };

    $ = function (selector, context) {
        if (isString(selector)) {
            if (context && isSugar(context)) {
                return context.find(selector);
            } else {
                return new Sugar(selector);
            }
        } else if (isSugar(selector)) {
            return selector;
        } else if (isArrayLike(selector)) {
            return toArray(selector);
        } else if (isObject(selector)) {
            if (isElement(selector)) {
                return new Sugar(selector);
            } else if (isWindow(selector)) {
                return window;
            } else if (isDocument(selector)) {
                return new Sugar(document);
            }
        }
    };

    window.Sugar = Sugar;
    if (window.$ === undefined) {
        window.$ = $;
    }
}(window, document));
