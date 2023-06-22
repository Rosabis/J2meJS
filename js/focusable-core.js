if (!("classList" in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/g),
                        index = classes.indexOf(value);

                    fn(classes, index, value);
                    self.className = classes.join(" ");
                }
            }

            return {
                add: update(function(classes, index, value) {
                    if (!~index) classes.push(value);
                }),

                remove: update(function(classes, index) {
                    if (~index) classes.splice(index, 1);
                }),

                toggle: update(function(classes, index, value) {
                    if (~index)
                        classes.splice(index, 1);
                    else
                        classes.push(value);
                }),

                contains: function(value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                },

                item: function(i) {
                    return self.className.split(/\s+/g)[i] || null;
                }
            };
        }
    });
}
var __extends =
    (this && this.__extends) ||
    (function () {
        var D = function (z, v) {
            D =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                    function (A, B) {
                        A.__proto__ = B;
                    }) ||
                function (A, B) {
                    for (var E in B) B.hasOwnProperty(E) && (A[E] = B[E]);
                };
            return D(z, v);
        };
        return function (z, v) {
            function A() {
                this.constructor = z;
            }
            D(z, v);
            z.prototype = null === v ? Object.create(v) : ((A.prototype = v.prototype), new A());
        };
    })();

const defineFocusable = function (z) {
    Object.defineProperty(z, "__esModule", { value: !0 });
    (function () {
        if ("function" === typeof window.CustomEvent) return !1;
        var r = function (l, a) {
            a = a || { bubbles: !1, cancelable: !1, detail: void 0 };
            var b = document.createEvent("CustomEvent");
            b.initCustomEvent(l, a.bubbles, a.cancelable, a.detail);
            return b;
        };
        r.prototype = window.Event.prototype;
        window.CustomEvent = r;
    })();
    var v = { KEY_LEFT: [37, 21], KEY_UP: [38, 19], KEY_RIGHT: [39, 22], KEY_DOWN: [40, 20], KEY_ENTER: [13, 23] },
        A = { type: "left", event: new CustomEvent("left", { detail: {} }) },
        B = { type: "right", event: new CustomEvent("right", { detail: {} }) },
        E = { type: "up", event: new CustomEvent("up", { detail: {} }) },
        J = { type: "down", event: new CustomEvent("down", { detail: {} }) },
        G = 0,
        H = null,
        I = 0;
    var D = (function (r) {
        function l() {
            var a = (null !== r && r.apply(this, arguments)) || this;
            a.focusKeyUpEvent = function (b) {
                var c = window.event ? window.event.keyCode : b.which,
                    d = document.querySelectorAll("[focusable]");
                if (d.length) {
                    var f = document.querySelectorAll("[focused]");
                    d = f.length ? f[f.length - 1] : d[0];
                    -1 !== a._KEYS.KEY_ENTER.indexOf(c) && (clearTimeout(H), 0 === G && (a.preventDefault(b), d.click(), (G = 0)));
                }
                G = I = 0;
            };
            a.focusKeyDownEvent = function (b) {
                var c = window.event ? window.event.keyCode : b.which,
                    d = document.querySelectorAll("[focusable]");
                if (d.length) {
                    var f = document.querySelectorAll("[focused]"),
                        h = f.length ? f[f.length - 1] : d[0];
                    -1 !== a._KEYS.KEY_ENTER.indexOf(c)
                        ? 0 === I &&
                          ((I = 1),
                          (H = setTimeout(function () {
                              G++;
                              h.dispatchEvent(new CustomEvent("longPress", { detail: { el: h } }));
                              clearTimeout(H);
                          }, a._longPressTime)))
                        : -1 !== a._KEYS.KEY_LEFT.indexOf(c)
                        ? (a.preventDefault(b), a.keyEvent(A, h))
                        : -1 !== a._KEYS.KEY_UP.indexOf(c)
                        ? (a.preventDefault(b), a.keyEvent(E, h))
                        : -1 !== a._KEYS.KEY_DOWN.indexOf(c)
                        ? (a.preventDefault(b), a.keyEvent(J, h))
                        : -1 !== a._KEYS.KEY_RIGHT.indexOf(c) && (a.preventDefault(b), a.keyEvent(B, h));
                }
            };
            a.init = function (b) {
                a._focusClassName = b.focusClassName || a._focusClassName;
                a._initDis = b.initDis || a._initDis;
                a._findFocusType = void 0 === b.findFocusType ? a._findFocusType : b.findFocusType;
                a._KEYS.KEY_UP = (b.KEYS && b.KEYS.KEY_UP) || a._KEYS.KEY_UP;
                a._KEYS.KEY_RIGHT = (b.KEYS && b.KEYS.KEY_RIGHT) || a._KEYS.KEY_RIGHT;
                a._KEYS.KEY_DOWN = (b.KEYS && b.KEYS.KEY_DOWN) || a._KEYS.KEY_DOWN;
                a._KEYS.KEY_LEFT = (b.KEYS && b.KEYS.KEY_LEFT) || a._KEYS.KEY_LEFT;
                a._KEYS.KEY_ENTER = (b.KEYS && b.KEYS.KEY_ENTER) || a._KEYS.KEY_ENTER;
                a._offsetDistance = void 0 === b.offsetDistance ? a._offsetDistance : b.offsetDistance;
                a._longPressTime = void 0 === b.longPressTime ? a._longPressTime : b.longPressTime;
                a._distanceToCenter = void 0 === b.distanceToCenter ? a._distanceToCenter : b.distanceToCenter;
            };
            a.requestFocus = function (b, c) {
                void 0 === c && (c = !0);
                a.eventDisabled = a.eventDisabled ? "eventSkip" : "initSkip";
                b = (b && b.length && b[0]) || b;
                if (!b) throw Error("Element not found!");
                b = b.$el || b;
                if (null !== b.getAttribute("focused")) return !1;
                for (var d = document.getElementsByClassName(a._focusClassName), f = 0; f < d.length; f++) a.removeOneClassName(d[f], a._focusClassName);
                a.addAttrName(b, "focused");
                "initSkip" === a.eventDisabled
                    ? c
                        ? a.doScroll(b, c)
                        : setTimeout(function () {
                              a.doScroll(b, c);
                          }, 100)
                    : a.doScroll(b, c);
            };
            a.getElementByPath = a.getElementByPath;
            a.reset = function () {
                a._KEYS = v;
                a._scrollEl = null;
                a._focusClassName = "focus";
                a._initDis = 20;
                a._findFocusType = 1;
                a._offsetDistance = 50;
                a._longPressTime = 500;
                a._distanceToCenter = !1;
                a._limitingEl = null;
            };
            a.resetFocusClassName = function () {
                a._focusClassName = "focus";
            };
            a.resetInitDis = function () {
                a._initDis = 20;
            };
            a.resetFindFocusType = function () {
                a._findFocusType = 1;
            };
            a.resetKEYS = function () {
                a._KEYS = v;
            };
            a.resetTheDis = function () {
                a._offsetDistance = 50;
            };
            a.resetOffsetDistance = function () {
                a._offsetDistance = 50;
            };
            a.resetLongPressTime = function () {
                a._longPressTime = 500;
            };
            a.resetDistanceToCenter = function () {
                a._distanceToCenter = !1;
            };
            a.resetLimitingEl = function () {
                a._limitingEl = null;
            };
            a.resetScrollEl = function () {
                a._scrollEl = null;
            };
            a.setScrollEl = function (b) {
                a._scrollEl = b || a._scrollEl;
            };
            return a;
        }
        __extends(l, r);
        Object.defineProperty(l.prototype, "focusClassName", {
            get: function () {
                return this._focusClassName;
            },
            set: function (a) {
                this._focusClassName = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "initDis", {
            get: function () {
                return this._initDis;
            },
            set: function (a) {
                this._initDis = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "findFocusType", {
            get: function () {
                return this._findFocusType;
            },
            set: function (a) {
                this._findFocusType = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "KEYS", {
            get: function () {
                return this._KEYS;
            },
            set: function (a) {
                this._KEYS = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "offsetDistance", {
            get: function () {
                return this._offsetDistance;
            },
            set: function (a) {
                this._offsetDistance = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "longPressTime", {
            get: function () {
                return this._longPressTime;
            },
            set: function (a) {
                this._longPressTime = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "distanceToCenter", {
            get: function () {
                return this._distanceToCenter;
            },
            set: function (a) {
                this._distanceToCenter = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "limitingEl", {
            get: function () {
                return this._limitingEl;
            },
            set: function (a) {
                null !== a
                    ? (document.querySelectorAll("[focusable]").forEach(function (b) {
                          b.setAttribute("focusdisable", "");
                          b.removeAttribute("focusable");
                      }),
                      a.querySelectorAll("[focusdisable]").forEach(function (b) {
                          b.setAttribute("focusable", "");
                          b.removeAttribute("focusdisable");
                      }))
                    : (document.querySelectorAll("[focusable]").forEach(function (b) {
                          b.removeAttribute("focusdisable");
                      }),
                      document.querySelectorAll("[focusdisable]").forEach(function (b) {
                          b.setAttribute("focusable", "");
                          b.removeAttribute("focusdisable");
                      }));
                this._limitingEl = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        Object.defineProperty(l.prototype, "scrollEl", {
            get: function () {
                return this._scrollEl;
            },
            set: function (a) {
                this._scrollEl = a;
            },
            enumerable: !0,
            configurable: !0,
        });
        return l;
    })(
        (function (r) {
            function l() {
                var a = (null !== r && r.apply(this, arguments)) || this;
                a.keyEvent = function (b, c) {
                    a.eventDisabled = "event";
                    c.dispatchEvent(b.event);
                    c.dispatchEvent(new CustomEvent("onBlur", { detail: { el: c } }));
                    "eventSkip" === a.eventDisabled ? (a.eventDisabled = "") : a.setFocus(b.type);
                };
                a.setFocus = function (b) {
                    var c = a.getNextFocusElement(b);
                    document.querySelector("focused");
                    null !== c &&
                        "none" !== window.getComputedStyle(c).display &&
                        a.parentShow(c) &&
                        null === c.getAttribute("focusdisable") &&
                        (c && a.addAttrName(c, "focused"), a.doScroll(c, !0, b));
                };
                a.scrollFn = function (b, c, d) {
                    void 0 === d && (d = !0);
                    a.Scroll2({
                        number: b,
                        time: d ? 200 : 0,
                        getNumFn: function () {
                            if ("scrollTop" === c) return a._scrollEl ? a._scrollEl.scrollTop : document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
                            if ("scrollLeft" === c) return a._scrollEl ? a._scrollEl.scrollLeft : document.body.scrollLeft || document.documentElement.scrollLeft || window.pageXOffset;
                        },
                        setNumFn: function (f) {
                            "scrollTop" === c && (a._scrollEl ? (a._scrollEl.scrollTop = f) : (document.body.scrollTop = document.documentElement.scrollTop = f));
                            "scrollLeft" === c && (a._scrollEl ? (a._scrollEl.scrollLeft = f) : (document.body.scrollLeft = document.documentElement.scrollLeft = f));
                        },
                    });
                };
                a.doScroll = function (b, c, d) {
                    void 0 === c && (c = !0);
                    b = (b && b.length && b[0]) || b;
                    if ((!a._scrollEl || a.inNode(b, a._scrollEl)) && b) {
                        b = b.getBoundingClientRect();
                        if (a._scrollEl) {
                            var f = a._scrollEl.scrollTop;
                            var h = a._scrollEl.scrollLeft;
                            var k = a._scrollEl.getBoundingClientRect();
                            var w = k.height;
                            var g = k.width;
                            var p = b.left - k.left;
                            k = b.top - k.top;
                        } else
                            (f = document.body.scrollTop || document.documentElement.scrollTop || window.pageXOffset),
                                (h = document.body.scrollLeft || document.documentElement.scrollLeft || window.pageYOffset),
                                (g = document.documentElement.clientWidth || document.body.clientWidth),
                                (w = document.documentElement.clientHeight || document.body.clientHeight),
                                (p = b.left),
                                (k = b.top);
                        var m = g / 2,
                            u = w / 2,
                            x = p + b.width / 2,
                            y = k + b.height / 2;
                        a._distanceToCenter
                            ? "down" === d || "up" === d
                                ? a.scrollFn(y + f - u, "scrollTop", c)
                                : "left" === d || "right" === d
                                ? a.scrollFn(x + h - m, "scrollLeft", c)
                                : b.top > b.left
                                ? (a.scrollFn(x + h - m, "scrollLeft", c), a.scrollFn(y + f - u, "scrollTop", c))
                                : (a.scrollFn(y + f - u, "scrollTop", c), a.scrollFn(x + h - m, "scrollLeft", c))
                            : ((d = k + b.height),
                              d > w && ((d = d - w + f + a._offsetDistance), a.scrollFn(d, "scrollTop", c)),
                              0 > k && ((d = k + f - a._offsetDistance), a.scrollFn(d, "scrollTop", c)),
                              (d = p + b.width),
                              d > g && ((d = d - g + h + a._offsetDistance), a.scrollFn(d, "scrollLeft", c)),
                              0 > p && ((d = p + h - a._offsetDistance), a.scrollFn(d, "scrollLeft", c)));
                    }
                };
                a.calLineEl = function (b, c, d, f, h, k, w) {
                    if (1 === k) return !1;
                    k = 0;
                    if ("up" === b || "down" === b) k = c;
                    else if ("right" === b || "left" === b) k = d;
                    k <= w && ((b = Math.min(c + d, f.dis)), b != f.dis && ((f.dis = b), (f.el = h)));
                    return f;
                };
                a.getNextFocusElement = function (b) {
                    var c = document.querySelectorAll("[focusable]"),
                        d = document.querySelectorAll("[focused]");
                    if (!c || !c.length) return null;
                    var f = null,
                        h = Number.MAX_VALUE,
                        k = Number.MAX_VALUE,
                        w = { el: null, dis: Number.MAX_VALUE, absDis: Number.MAX_VALUE };
                    if (d.length) d = d[d.length - 1];
                    else return (d = c[0]), a.addAttrName(d, "focused"), d;
                    var g = d.getBoundingClientRect(),
                        p = (g.width - d.offsetWidth) / 2,
                        m = (g.height - d.offsetHeight) / 2,
                        u = (d = 0),
                        x = 0,
                        y = 0,
                        t = [g.top + m, g.right - p, g.bottom - m, g.left + p];
                    "up" === b && ((d = g.left + g.width / 2), (u = Math.round(g.bottom - m)), (x = g.left + p), (y = g.left + g.width - p));
                    "right" === b && ((u = g.top + g.height / 2), (d = Math.round(g.left + p)), (x = g.top + m), (y = g.top + g.height - m));
                    "down" === b && ((d = g.left + g.width / 2), (u = Math.round(g.top + m)), (x = g.left + p), (y = g.left + g.width - p));
                    "left" === b && ((u = g.top + g.height / 2), (d = Math.round(g.right - p)), (x = g.top + m), (y = g.top + g.height - m));
                    g = !1;
                    for (p = 0; p < c.length; p++) {
                        m = c[p];
                        var e = m.getBoundingClientRect(),
                            C = 0,
                            q = 0,
                            n = 0,
                            F = 0;
                        if (document.querySelector("." + a._focusClassName) !== m) {
                            if ("up" === b) {
                                q = e.top + e.height;
                                if ((e.right < t[3] || e.left > t[1]) && e.bottom > t[0]) continue;
                                if (Math.round(q) >= u) continue;
                                C = e.left + e.width / 2;
                                n = e.left;
                                F = e.left + e.width;
                            } else if ("right" === b) {
                                C = e.left;
                                if ((e.bottom < t[0] || e.top > t[2]) && e.left < t[1]) continue;
                                if (Math.round(C) <= d) continue;
                                q = e.top + e.height / 2;
                                n = e.top;
                                F = e.top + e.height;
                            } else if ("down" === b) {
                                q = e.top;
                                if ((e.right < t[3] || e.left > t[1]) && e.top < t[2]) continue;
                                if (Math.round(q) <= u) continue;
                                C = e.left + e.width / 2;
                                n = e.left;
                                F = e.left + e.width;
                            } else if ("left" === b) {
                                C = e.left + e.width;
                                if ((e.bottom < t[0] || e.top > t[2]) && e.right > t[3]) continue;
                                if (Math.round(C) >= d) continue;
                                q = e.top + e.height / 2;
                                n = e.top;
                                F = e.top + e.height;
                            }
                            e = Math.abs(d - C);
                            q = Math.abs(u - q);
                            a.calLineEl(b, e, q, w, m, a._findFocusType, a._initDis);
                            if (x <= F && y >= n) {
                                g = !0;
                                n = 0;
                                if ("up" === b || "down" === b) n = q;
                                else if ("right" === b || "left" === b) n = e;
                                k === n
                                    ? ((n = Math.min(Math.sqrt(e * e + q * q), h)), n != h && ((h = n), (f = m)))
                                    : ((n = Math.min(k, n)), n != k && ((k = n), (h = Math.min(Math.sqrt(e * e + q * q), h)), (f = m)));
                            } else g || ((n = Math.min(Math.sqrt(e * e + q * q), h)), n != h && ((h = n), (f = m)));
                        }
                    }
                    return 1 === a._findFocusType ? f : w.el || f;
                };
                return a;
            }
            __extends(l, r);
            return l;
        })(
            (function (r) {
                function l() {
                    var a = (null !== r && r.apply(this, arguments)) || this;
                    a.hasClass = function (b, c) {
                        return b.classList.contains(c);
                    };
                    a.toggleClass = function (b, c) {
                        return b.classList.toggle(c);
                    };
                    a.getParentTag = function (b, c) {
                        void 0 === c && (c = []);
                        return b instanceof HTMLElement
                            ? "BODY" !== b.parentElement.nodeName
                                ? (c.push(b.parentElement), a.getParentTag(b.parentElement, c))
                                : c
                            : console.error("receive only HTMLElement");
                    };
                    a.parentShow = function (b) {
                        return 0 ===
                            a.getParentTag(b).filter(function (c) {
                                return "none" === window.getComputedStyle(c).display;
                            }).length
                            ? !0
                            : !1;
                    };
                    a.removeOneClassName = function (b, c) {
                        b && a.hasClass(b, c) && a.toggleClass(b, c);
                    };
                    a.getElementByPath = function (b) {
                        return document.evaluate(b, document).iterateNext();
                    };
                    a.getElementsByPath = function (b) {
                        b = document.evaluate(b, document, null, XPathResult.ANY_TYPE, null);
                        var c = [],
                            d = b.iterateNext();
                        for (d && c.push(d); d; ) (d = b.iterateNext()) && c.push(d);
                        return c;
                    };
                    a.addClassName = function (b, c) {
                        b && a.toggleClass(b, c);
                    };
                    a.addAttrName = function (b, c) {
                        a.focusOriginalEl !== b && ((a.focusOriginalSize = b.getBoundingClientRect()), (a.focusOriginalEl = b));
                        var d = document.querySelector("[focused]");
                        d && (d.removeAttribute(c), a.removeOneClassName(d, a._focusClassName));
                        b.setAttribute(c, "");
                        "focused" === c && (a.addClassName(b, a._focusClassName), b.dispatchEvent(new CustomEvent("onFocus", { detail: { el: b } })));
                    };
                    a.inNode = function (b, c) {
                        return c !== b && c.contains(b);
                    };
                    a.preventDefault = function (b) {
                        b = b || window.event;
                        b.preventDefault && b.preventDefault();
                        b.returnValue = !1;
                    };
                    a.onEvent = function (b, c, d) {
                        return b.dispatchEvent(new CustomEvent(c, { detail: d }));
                    };
                    a.offEvent = function (b, c, d, f) {
                        void 0 === f && (f = !1);
                        return b.removeEventListener(c, d, f);
                    };
                    return a;
                }
                __extends(l, r);
                l.prototype.Scroll2 = function (a) {
                    var b = this;
                    if (!a.time) return a.setNumFn && a.setNumFn(a.number), a.number;
                    null != this.scrollTimer && (clearInterval(this.scrollTimer), this.lastOpt.setNumFn && this.lastOpt.setNumFn(this.lastOpt.number));
                    this.lastOpt = a;
                    var c = a.time / 20,
                        d = 0;
                    a.getNumFn && (d = a.getNumFn());
                    var f = (a.number - d) / c;
                    this.scrollTimer = setInterval(function () {
                        0 < c ? (c--, b.Scroll2({ number: (d += f), getNumFn: a.getNumFn, setNumFn: a.setNumFn })) : (clearInterval(b.scrollTimer), (b.scrollTimer = null), (b.lastOpt = null));
                    }, 20);
                };
                return l;
            })(
                (function () {
                    return function () {
                        this._KEYS = v;
                        this._scrollEl = null;
                        this._focusClassName = "focus";
                        this._initDis = 20;
                        this._findFocusType = 1;
                        this._offsetDistance = 50;
                        this._longPressTime = 500;
                        this._limitingEl = null;
                        this._distanceToCenter = !1;
                        this.eventDisabled = "";
                        this.focusOriginalEl = this.focusOriginalSize = this.lastOpt = this.scrollTimer = null;
                    };
                })()
            )
        )
    );
    z.default = new D();
};
let _focusable = {};
defineFocusable(_focusable);
const focusable = _focusable.default;
document.removeEventListener("keydown", focusable.focusKeyDownEvent, !1);
document.addEventListener("keydown", focusable.focusKeyDownEvent);
document.removeEventListener("keyup", focusable.focusKeyUpEvent, !1);
document.addEventListener("keyup", focusable.focusKeyUpEvent);
