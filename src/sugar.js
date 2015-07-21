/*jshint eqnull: true, browser: true*/

/**
 * This is just a modern browser for operation on a simplified DOM syntactic sugar script
 *
 * @namespace SugarJs
 * @auhor Amery
 * @version v0.1.0
 */

;(function (Global) {
    'use strict';

    var class2type, type, map, each, query, toArray,
        isWindow, isDocument, isFunction, isObject,
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
        return class2type[Object.toString.call(obj)] || 'object';
    };

    isWindow = function isWindow(obj) {
        return obj === obj.window;
    };

    isDocument = function isDocument(obj) {
        return obj.nodeType === obj.DOCUMENT_NODE;
    };

    isObject = function isObject(obj) {
        return type(obj) === 'object';
    };

    isFunction = function isFunction(obj) {
        return type(obj) === 'function';
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

    function Sugar(context) {
        this.element = context;
    }

    Sugar.prototype = {
        attr: function (name, value) {
            if (arguments.length === 1) {
                if (isObject(name)) {
                    each(name, function (val, key) {
                        this.element.setAttribute(key, val);
                    }.bind(this));
                } else {
                    this.element.getAttribute(name);
                }
            } else {
                this.element.setAttribute(name, value);
            }
            return this;
        },
        removeAttr: function (name) {
            this.element.removeAttribute(name);
            return this;
        }
    };

    Global.$ = function (selector) {
        return new Sugar(Global.document.querySelector(selector));
    };

    Global.Sugar = Sugar;
}(window));
