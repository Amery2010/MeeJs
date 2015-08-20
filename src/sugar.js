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

    isObject = function isObject(obj) {
        return type(obj) === 'object';
    };

    isFunction = function isFunction(obj) {
        return type(obj) === 'function';
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

        if (emptyArray.isArray(obj)) {
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

        if (emptyArray.isArray(obj)) {
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
                if (isNull(method)) {
                    if (arguments.length === 1) {
                        if (isObject(name)) {
                            method = function (elem, name) {
                                each(name, function (val, key) {
                                    elem.setAttribute(key, val);
                                });
                            };
                            method(elem, name);
                        } else {
                            return elem.getAttribute(name);
                        }
                    } else {
                        elem.setAttribute(name, isFunction(value) ? value.call(this, elem, elem.getAttribute(name)) : value);
                    }
                } else {
                    method(elem, name, value);
                }
            };

        return function (elem, name, value) {
            var len;
            if (elem.length === 1) {
                defaultMethod.call(this[0], name, value);
            } else {
                len = elem.length -1;
                while (len--) {
                    method(this[len], name, value);
                }
                method = null;
            }
        };
    }());

    Sugar = function (context) {
        this.element = context;
    };

    Sugar.prototype = {
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

    window.Sugar = $;
    if (window.$ === undefined) {
        window.$ = $;
    }
}(window, document));
