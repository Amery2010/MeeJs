/**
 * This is just a modern browser for operation on a simplified DOM syntactic sugar script
 *
 * @namespace SugarJs
 * @auhor Amery
 * @version v0.5.1
 */

;(function (window, document, undefined) {
    'use strict';

    var Sugar, sugar, query, fragment, camelize, dasherize, maybeAddPx,
        ready, filtered, matches,
        hasClass, addClass, removeClass, toggleClass,
        children, parent, prev, next, siblings,
        queryRE = /^[\#.]?[\w-]+$/,
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
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },
        cssNumber = ['columnCount', 'columns', 'fontWeight', 'lineHeight', 'opacity', 'zIndex', 'zoom'],
        // specialDom = ['col', 'colGroup', 'frameSet', 'html', 'head', 'style', 'table', 'tBody', 'tFoot', 'tHead', 'title', 'tr'],
        emptyArray = [];

    query = function query(selector, context) {
        context = context || document;

        if (queryRE.test(selector)) {
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

    camelize = function camelize(str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };

    dasherize = function decamelize(str) {
        return /[A-Z]/g.test(str) ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : str;
    };

    maybeAddPx = function maybeAddPx(name, value) {
        return (typeof value === 'number' && cssNumber.indexOf(name) === -1) ? value + 'px' : value;
    };

    ready = function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    filtered = function filtered(collection, handle) {
        var elems = [];
        collection.each(function (elem) {
            emptyArray.forEach.call(handle.call(collection, elem), function (el) {
                if (elems.indexOf(el) === -1 && el !== null) {
                    elems.push(el);
                }
            });
        });
        return new Sugar(elems);
    };

    matches = (function () {
        var matchesSelector = div.matches || div.matchesSelector ||
                div.webkitMatchesSelector || div.mozMatchesSelector || div.msMatchesSelector;

        return function (elem, selector) {
            return matchesSelector.call(elem, selector);
        };
    }());

    hasClass = (function () {
        if ('classList' in div) {
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
        if ('classList' in div) {
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
        if ('classList' in div) {
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
        if ('classList' in div) {
            return function (elem, className) {
                elem.classList.toggle(className);
            };
        } else {
            return function (elem, className) {
                var classes = elem.className.split(' '),
                    existingIndex = classes.indexOf(className);

                if (existingIndex === -1) {
                    classes.push(className);
                } else {
                    classes.splice(existingIndex, 1);
                }

                elem.className = classes.join(' ');
            };
        }
    }());

    children = (function () {
        if ('children' in div) {
            return function (elem) {
                return elem.children;
            };
        } else {
            return function (elem) {
                return elem.childNodes;
            };
        }
    }());

    parent = (function () {
        if ('parentElement' in div) {
            return function (elem) {
                return elem.parentElement;
            };
        } else {
            return function (elem) {
                return elem.parentNode;
            };
        }
    }());

    prev = (function () {
        if ('previousElementSibling' in div) {
            return function (elem) {
                return elem.previousElementSibling;
            };
        } else {
            return function (elem) {
                return elem.previousSibling;
            };
        }
    }());

    next = (function () {
        if ('nextElementSibling' in div) {
            return function (elem) {
                return elem.nextElementSibling;
            };
        } else {
            return function (elem) {
                return elem.nextSibling;
            };
        }
    }());

    siblings = (function () {
        if ('parentElement' in div && 'children' in div) {
            return function (elem) {
                return emptyArray.filter.call(elem.parentElement.children, function (el) {
                    return el !== elem;
                });
            };
        } else {
            return function (elem) {
                return emptyArray.filter.call(elem.parentNode.childNodes, function (el) {
                    return el !== elem;
                });
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
        get: function (idx) {
            if (idx === undefined) {
                return emptyArray.slice.call(this);
            } else {
                return this[idx >= 0 ? idx : idx + this.length];
            }
        },
        eq: function (idx) {
            return this.slice(idx, idx +1);
        },
        size: function () {
            return this.length;
        },
        each: function (callback) {
            var i, len = this.length;
            for (i = 0; i < len; i++) {
                callback.call(this, this[i], i, this);
            }
            return this;
        },
        map: function (callback) {
            var i, len = this.length;
            for (i = 0; i < len; i++) {
                this[i] = callback.call(this, this[i], i, this);
            }
            return this;
        },
        is: function (selector) {
            var len = this.length;
            while (len--) {
                if (matches(this[len], selector)) {
                    return true;
                }
            }
            return false;
        },
        not: function (selector) {
            return this.is(selector) ? false : true;
        },
        filter: function (selector) {
            if (selector !== undefined) {
                return new Sugar(emptyArray.filter.call(this,
                    typeof selector === 'function' ? selector : function (elem) {
                        return matches(elem, selector);
                    })
                );
            } else {
                return this;
            }
        },
        find: function (selector) {
            return filtered(this, function (elem) {
                return query(selector, elem);
            });
        },
        hasClass: function (className) {
            var len = this.length;
            while (len--) {
                if (hasClass(this[len], className)) {
                    return true;
                }
            }
            return false;
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
        },
        children: function (selector) {
            return filtered(this, function (elem) {
                return children(elem);
            }).filter(selector);
        },
        parent: function (selector) {
            return filtered(this, function (elem) {
                return parent(elem);
            }).filter(selector);
        },
        prev: function (selector) {
            return filtered(this, function (elem) {
                return prev(elem);
            }).filter(selector);
        },
        next: function (selector) {
            return filtered(this, function (elem) {
                return next(elem);
            }).filter(selector);
        },
        siblings: function (selector) {
            return filtered(this, function (elem) {
                return siblings(elem);
            }).filter(selector);
        },
        empty: function () {
            return this.each(function (elem) {
                elem.innerHTML = '';
            });
        },
        html: function (html) {
            if (html === undefined) {
                return this.length ? this[0].innerHTML : undefined;
            } else {
                return this.each(function (elem) {
                    elem.innerHTML = html;
                });
            }
        },
        text: function (text) {
            if (text === undefined) {
                return this.length ? this[0].textContent : undefined;
            } else {
                return this.each(function (elem) {
                    elem.textContent = String(text);
                });
            }
        },
        attr: function (name, value) {
            if (value === undefined) {
                return this.length ? this[0].getAttribute(name) : undefined;
            } else {
                return this.each(function (elem) {
                    elem.setAttribute(name, value);
                });
            }
        },
        hasAttr: function (name) {
            var len = this.length;
            while (len--) {
                if (this[len].hasAttribute(name)) {
                    return true;
                }
            }
            return false;
        },
        removeAttr: function (name) {
            return this.each(function (elem) {
                elem.removeAttribute(name);
            });
        },
        prop: function (name, value) {
            name = propMap[name] || name;

            if (value === undefined) {
                return this.length ? this[0][name] : undefined;
            } else {
                return this.each(function (elem) {
                    elem[name] = value;
                });
            }
        },
        val: function (value) {
            if (value === undefined) {
                if (this.length) {
                    return undefined;
                } else {
                    if (this[0].multiple) {
                        var selected = [];
                        emptyArray.forEach.call(this[0].options, function (opt) {
                            if (opt.selected) {
                                selected.push(opt.value);
                            }
                        });
                        return selected;
                    } else {
                        return this[0].value;
                    }
                }
            } else {
                return this.each(function (elem) {
                    elem.value = value;
                });
            }
        },
        css: function (name, value) {
            if (value === undefined) {
                if (!this.length) {
                    return undefined;
                }

                if (typeof name === 'string') {
                    name = camelize(name);
                    return this[0].style[name] || window.getComputedStyle(this[0], null).getPropertyValue(name);
                } else {
                    return this.each(function (elem) {
                        var currentStyle = elem.style.cssText.split(';'),
                            stylesheet = {}, finalStyle = '', oldkey, newkey;

                        currentStyle.forEach(function (style) {
                            style = style.split(':');
                            stylesheet[style[0]] = style[1];
                        });
                        for (oldkey in name) {
                            stylesheet[dasherize(name[oldkey])] = maybeAddPx(camelize(name[oldkey]), value);
                        }
                        for (newkey in name) {
                            finalStyle += newkey + ':' + stylesheet[newkey] + ';';
                        }
                        elem.style.cssText = finalStyle;
                    });
                }
            } else {
                return this.each(function (elem) {
                    name = camelize(name);
                    elem.style[name] = maybeAddPx(name, value);
                });
            }
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
    if (!window.$) {
        window.$ = sugar;
    }
}(window, document));
