// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped, ModuleConfig) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(ModuleConfig);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({4:[function(require,module,exports) {
var global = (1,eval)("this");
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*!
 * Vue.js v2.5.16
 * (c) 2014-2018 Evan You
 * Released under the MIT License.
 */
/*  */

var emptyObject = Object.freeze({});

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
function isUndef(v) {
  return v === undefined || v === null;
}

function isDef(v) {
  return v !== undefined && v !== null;
}

function isTrue(v) {
  return v === true;
}

function isFalse(v) {
  return v === false;
}

/**
 * Check if value is primitive
 */
function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number' ||
  // $flow-disable-line
  typeof value === 'symbol' || typeof value === 'boolean';
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Get the raw type string of a value e.g. [object Object]
 */
var _toString = Object.prototype.toString;

function toRawType(value) {
  return _toString.call(value).slice(8, -1);
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex(val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber(val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n;
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? function (val) {
    return map[val.toLowerCase()];
  } : function (val) {
    return map[val];
  };
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if a attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array
 */
function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Create a cached version of a pure function.
 */
function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});

/**
 * Simple bind polyfill for environments that do not support it... e.g.
 * PhantomJS 1.x. Technically we don't need this anymore since native bind is
 * now more performant in most browsers, but removing it would be breaking for
 * code that was able to run in PhantomJS 1.x, so this must be kept for
 * backwards compatibility.
 */

/* istanbul ignore next */
function polyfillBind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  }

  boundFn._length = fn.length;
  return boundFn;
}

function nativeBind(fn, ctx) {
  return fn.bind(ctx);
}

var bind = Function.prototype.bind ? nativeBind : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to;
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject(arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
function noop(a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) {
  return false;
};

/**
 * Return same value
 */
var identity = function (_) {
  return _;
};

/**
 * Generate a static keys string from compiler modules.
 */

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual(a, b) {
  if (a === b) {
    return true;
  }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i]);
        });
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key]);
        });
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}

function looseIndexOf(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

/**
 * Ensure a function is called only once.
 */
function once(fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  };
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = ['component', 'directive', 'filter'];

var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated', 'errorCaptured'];

/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: 'development' !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: 'development' !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
};

/*  */

/**
 * Check if a string starts with $ or _
 */
function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Define a property.
 */
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) {
        return;
      }
      obj = obj[segments[i]];
    }
    return obj;
  };
}

/*  */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0 || weexPlatform === 'android';
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA) || weexPlatform === 'ios';
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefox has a "watch" function on Object.prototype...
var nativeWatch = {}.watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', {
      get: function get() {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    }); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer;
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

var hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    function Set() {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has(key) {
      return this.set[key] === true;
    };
    Set.prototype.add = function add(key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear() {
      this.set = Object.create(null);
    };

    return Set;
  }();
}

/*  */

var warn = noop;
var tip = noop;
var generateComponentTrace = noop; // work around flow check
var formatComponentName = noop;

if ('development' !== 'production') {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) {
    return str.replace(classifyRE, function (c) {
      return c.toUpperCase();
    }).replace(/[-_]/g, '');
  };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && !config.silent) {
      console.error("[Vue warn]: " + msg + trace);
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && !config.silent) {
      console.warn("[Vue tip]: " + msg + (vm ? generateComponentTrace(vm) : ''));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>';
    }
    var options = typeof vm === 'function' && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm || {};
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (name ? "<" + classify(name) + ">" : "<Anonymous>") + (file && includeFile !== false ? " at " + file : '');
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) {
        res += str;
      }
      if (n > 1) {
        str += str;
      }
      n >>= 1;
    }
    return res;
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree.map(function (vm, i) {
        return "" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm) ? formatComponentName(vm[0]) + "... (" + vm[1] + " recursive calls)" : formatComponentName(vm));
      }).join('\n');
    } else {
      return "\n\n(found in " + formatComponentName(vm) + ")";
    }
  };
}

/*  */

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep() {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub(sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub(sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend() {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify() {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget(_target) {
  if (Dep.target) {
    targetStack.push(Dep.target);
  }
  Dep.target = _target;
}

function popTarget() {
  Dep.target = targetStack.pop();
}

/*  */

var VNode = function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance;
};

Object.defineProperties(VNode.prototype, prototypeAccessors);

var createEmptyVNode = function (text) {
  if (text === void 0) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};

function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode(vnode) {
  var cloned = new VNode(vnode.tag, vnode.data, vnode.children, vnode.text, vnode.elm, vnode.context, vnode.componentOptions, vnode.asyncFactory);
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.isCloned = true;
  return cloned;
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    var args = [],
        len = arguments.length;
    while (len--) args[len] = arguments[len];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    // notify change
    ob.dep.notify();
    return result;
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;

function toggleObserving(value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray(items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe(value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive(obj, key, val, customSetter, shallow) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  if (!getter && arguments.length === 2) {
    val = obj[key];
  }
  var setter = property && property.set;

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || newVal !== newVal && value !== value) {
        return;
      }
      /* eslint-enable no-self-compare */
      if ('development' !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set(target, key, val) {
  if ('development' !== 'production' && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot set reactive property on undefined, null, or primitive value: " + target);
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }
  var ob = target.__ob__;
  if (target._isVue || ob && ob.vmCount) {
    'development' !== 'production' && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - declare it upfront in the data option.');
    return val;
  }
  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
function del(target, key) {
  if ('development' !== 'production' && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot delete reactive property on undefined, null, or primitive value: " + target);
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  var ob = target.__ob__;
  if (target._isVue || ob && ob.vmCount) {
    'development' !== 'production' && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
    return;
  }
  if (!hasOwn(target, key)) {
    return;
  }
  delete target[key];
  if (!ob) {
    return;
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value) {
  for (var e = void 0, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if ('development' !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn("option \"" + key + "\" can only be used during instance " + 'creation with the `new` keyword.');
    }
    return defaultStrat(parent, child);
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(to, from) {
  if (!from) {
    return to;
  }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */
function mergeDataOrFn(parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(typeof childVal === 'function' ? childVal.call(this, this) : childVal, typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal);
    };
  } else {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
}

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      'development' !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);

      return parentVal;
    }
    return mergeDataOrFn(parentVal, childVal);
  }

  return mergeDataOrFn(parentVal, childVal, vm);
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook(parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets(parentVal, childVal, vm, key) {
  var res = Object.create(parentVal || null);
  if (childVal) {
    'development' !== 'production' && assertObjectType(key, childVal, vm);
    return extend(res, childVal);
  } else {
    return res;
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal, vm, key) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) {
    parentVal = undefined;
  }
  if (childVal === nativeWatch) {
    childVal = undefined;
  }
  /* istanbul ignore if */
  if (!childVal) {
    return Object.create(parentVal || null);
  }
  if ('development' !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) {
    return childVal;
  }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */
strats.props = strats.methods = strats.inject = strats.computed = function (parentVal, childVal, vm, key) {
  if (childVal && 'development' !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) {
    return childVal;
  }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) {
    extend(ret, childVal);
  }
  return ret;
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Validate component names
 */
function checkComponents(options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName(name) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characters and the hyphen, ' + 'and must start with a letter.');
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + name);
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps(options, vm) {
  var props = options.props;
  if (!props) {
    return;
  }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if ('development' !== 'production') {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : { type: val };
    }
  } else if ('development' !== 'production') {
    warn("Invalid value for option \"props\": expected an Array or an Object, " + "but got " + toRawType(props) + ".", vm);
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject(options, vm) {
  var inject = options.inject;
  if (!inject) {
    return;
  }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val) ? extend({ from: key }, val) : { from: val };
    }
  } else if ('development' !== 'production') {
    warn("Invalid value for option \"inject\": expected an Array or an Object, " + "but got " + toRawType(inject) + ".", vm);
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives(options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

function assertObjectType(name, value, vm) {
  if (!isPlainObject(value)) {
    warn("Invalid value for option \"" + name + "\": expected an Object, " + "but got " + toRawType(value) + ".", vm);
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions(parent, child, vm) {
  if ('development' !== 'production') {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) {
    return assets[id];
  }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) {
    return assets[camelizedId];
  }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) {
    return assets[PascalCaseId];
  }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ('development' !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

/*  */

function validateProp(key, propOptions, propsData, vm) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // boolean casting
  var booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  if ('development' !== 'production' &&
  // skip validation for weex recycle-list child component props
  !(false && isObject(value) && '@binding' in value)) {
    assertProp(prop, key, value, vm, absent);
  }
  return value;
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue(vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined;
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ('development' !== 'production' && isObject(def)) {
    warn('Invalid default value for prop "' + key + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData && vm.$options.propsData[key] === undefined && vm._props[key] !== undefined) {
    return vm._props[key];
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 */
function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm);
    return;
  }
  if (value == null && !prop.required) {
    return;
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn("Invalid prop: type check failed for prop \"" + name + "\"." + " Expected " + expectedTypes.map(capitalize).join(', ') + ", got " + toRawType(value) + ".", vm);
    return;
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType(value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType(fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

function isSameType(a, b) {
  return getType(a) === getType(b);
}

function getTypeIndex(type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i;
    }
  }
  return -1;
}

/*  */

function handleError(err, vm, info) {
  if (vm) {
    var cur = vm;
    while (cur = cur.$parent) {
      var hooks = cur.$options.errorCaptured;
      if (hooks) {
        for (var i = 0; i < hooks.length; i++) {
          try {
            var capture = hooks[i].call(cur, err, vm, info) === false;
            if (capture) {
              return;
            }
          } catch (e) {
            globalHandleError(e, cur, 'errorCaptured hook');
          }
        }
      }
    }
  }
  globalHandleError(err, vm, info);
}

function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info);
    } catch (e) {
      logError(e, null, 'config.errorHandler');
    }
  }
  logError(err, vm, info);
}

function logError(err, vm, info) {
  if ('development' !== 'production') {
    warn("Error in " + info + ": \"" + err.toString() + "\"", vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err;
  }
}

/*  */
/* globals MessageChannel */

var callbacks = [];
var pending = false;

function flushCallbacks() {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
var microTimerFunc;
var macroTimerFunc;
var useMacroTask = false;

// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) ||
// PhantomJS
MessageChannel.toString() === '[object MessageChannelConstructor]')) {
  var channel = new MessageChannel();
  var port = channel.port2;
  channel.port1.onmessage = flushCallbacks;
  macroTimerFunc = function () {
    port.postMessage(1);
  };
} else {
  /* istanbul ignore next */
  macroTimerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  microTimerFunc = function () {
    p.then(flushCallbacks);
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) {
      setTimeout(noop);
    }
  };
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc;
}

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
function withMacroTask(fn) {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true;
    var res = fn.apply(null, arguments);
    useMacroTask = false;
    return res;
  });
}

function nextTick(cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    if (useMacroTask) {
      macroTimerFunc();
    } else {
      microTimerFunc();
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    });
  }
}

/*  */

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if ('development' !== 'production') {
  var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn("Property or method \"" + key + "\" is not defined on the instance but " + 'referenced during render. Make sure that this property is reactive, ' + 'either in the data option, or for class-based components, by ' + 'initializing the property. ' + 'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.', target);
  };

  var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set(target, key, value) {
        if (isBuiltInModifier(key)) {
          warn("Avoid overwriting built-in modifier in config.keyCodes: ." + key);
          return false;
        } else {
          target[key] = value;
          return true;
        }
      }
    });
  }

  var hasHandler = {
    has: function has(target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed;
    }
  };

  var getHandler = {
    get: function get(target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key];
    }
  };

  initProxy = function initProxy(vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped ? getHandler : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse(val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse(val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if (!isA && !isObject(val) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return;
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) {
      _traverse(val[i], seen);
    }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      _traverse(val[keys[i]], seen);
    }
  }
}

var mark;
var measure;

if ('development' !== 'production') {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
    mark = function (tag) {
      return perf.mark(tag);
    };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      perf.clearMeasures(name);
    };
  }
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  };
});

function createFnInvoker(fns) {
  function invoker() {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments$1);
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments);
    }
  }
  invoker.fns = fns;
  return invoker;
}

function updateListeners(on, oldOn, add, remove$$1, vm) {
  var name, def, cur, old, event;
  for (name in on) {
    def = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    /* istanbul ignore if */
    if (isUndef(cur)) {
      'development' !== 'production' && warn("Invalid handler for event \"" + event.name + "\": got " + String(cur), vm);
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur);
      }
      add(event.name, cur, event.once, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook(def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook() {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData(data, Ctor, tag) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return;
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      if ('development' !== 'production') {
        var keyInLowerCase = key.toLowerCase();
        if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
          tip("Prop \"" + keyInLowerCase + "\" is passed to component " + formatComponentName(tag || Ctor) + ", but the declared prop name is" + " \"" + key + "\". " + "Note that HTML attributes are case-insensitive and camelCased " + "props need to use their kebab-case equivalents when using in-DOM " + "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\".");
        }
      }
      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
    }
  }
  return res;
}

function checkProp(res, hash, key, altKey, preserve) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true;
    }
  }
  return false;
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren(children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children);
    }
  }
  return children;
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren(children) {
  return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefined;
}

function isTextNode(node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

function normalizeArrayChildren(children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') {
      continue;
    }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, (nestedIndex || '') + "_" + i);
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c[0].text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res;
}

/*  */

function ensureCtor(comp, base) {
  if (comp.__esModule || hasSymbol && comp[Symbol.toStringTag] === 'Module') {
    comp = comp.default;
  }
  return isObject(comp) ? base.extend(comp) : comp;
}

function createAsyncPlaceholder(factory, data, context, children, tag) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node;
}

function resolveAsyncComponent(factory, baseCtor, context) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp;
  }

  if (isDef(factory.resolved)) {
    return factory.resolved;
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp;
  }

  if (isDef(factory.contexts)) {
    // already pending
    factory.contexts.push(context);
  } else {
    var contexts = factory.contexts = [context];
    var sync = true;

    var forceRender = function () {
      for (var i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate();
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender();
      }
    });

    var reject = once(function (reason) {
      'development' !== 'production' && warn("Failed to resolve async component: " + String(factory) + (reason ? "\nReason: " + reason : ''));
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender();
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (typeof res.then === 'function') {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isDef(res.component) && typeof res.component.then === 'function') {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            setTimeout(function () {
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender();
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(function () {
            if (isUndef(factory.resolved)) {
              reject('development' !== 'production' ? "timeout (" + res.timeout + "ms)" : null);
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading ? factory.loadingComp : factory.resolved;
  }
}

/*  */

function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory;
}

/*  */

function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
}

/*  */

/*  */

function initEvents(vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add(event, fn, once) {
  if (once) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

function remove$1(event, fn) {
  target.$off(event, fn);
}

function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
  target = undefined;
}

function eventsMixin(Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var this$1 = this;

    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        this$1.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm;
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm;
  };

  Vue.prototype.$off = function (event, fn) {
    var this$1 = this;

    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        this$1.$off(event[i], fn);
      }
      return vm;
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm;
    }
    if (!fn) {
      vm._events[event] = null;
      return vm;
    }
    if (fn) {
      // specific handler
      var cb;
      var i$1 = cbs.length;
      while (i$1--) {
        cb = cbs[i$1];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i$1, 1);
          break;
        }
      }
    }
    return vm;
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    if ('development' !== 'production') {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip("Event \"" + lowerCaseEvent + "\" is emitted in component " + formatComponentName(vm) + " but the handler is registered for \"" + event + "\". " + "Note that HTML attributes are case-insensitive and you cannot use " + "v-on to listen to camelCase events when using in-DOM templates. " + "You should probably use \"" + hyphenate(event) + "\" instead of \"" + event + "\".");
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args);
        } catch (e) {
          handleError(e, vm, "event handler for \"" + event + "\"");
        }
      }
    }
    return vm;
  };
}

/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots(children, context) {
  var slots = {};
  if (!children) {
    return slots;
  }
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) && data && data.slot != null) {
      var name = data.slot;
      var slot = slots[name] || (slots[name] = []);
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots;
}

function isWhitespace(node) {
  return node.isComment && !node.asyncFactory || node.text === ' ';
}

function resolveScopedSlots(fns, // see flow/vnode
res) {
  res = res || {};
  for (var i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res);
    } else {
      res[fns[i].key] = fns[i].fn;
    }
  }
  return res;
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function initLifecycle(vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */
      , vm.$options._parentElm, vm.$options._refElm);
      // no need for the ref nodes after initial patch
      // this prevents keeping a detached DOM tree in memory (#5851)
      vm.$options._parentElm = vm.$options._refElm = null;
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return;
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent(vm, el, hydrating) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if ('development' !== 'production') {
      /* istanbul ignore if */
      if (vm.$options.template && vm.$options.template.charAt(0) !== '#' || vm.$options.el || el) {
        warn('You are using the runtime-only build of Vue where the template ' + 'compiler is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
      } else {
        warn('Failed to mount component: template or render function not defined.', vm);
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if ('development' !== 'production' && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure("vue " + name + " render", startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure("vue " + name + " patch", startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, null, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm;
}

function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  if ('development' !== 'production') {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  var hasChildren = !!(renderChildren || // has new static slots
  vm.$options._renderChildren || // has old static slots
  parentVnode.data.scopedSlots || // has new scoped slots
  vm.$scopedSlots !== emptyObject // has old scoped slots
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) {
    // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if ('development' !== 'production') {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree(vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) {
      return true;
    }
  }
  return false;
}

function activateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return;
    }
  } else if (vm._directInactive) {
    return;
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return;
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook(vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm);
      } catch (e) {
        handleError(e, vm, hook + " hook");
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  if ('development' !== 'production') {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) {
    return a.id - b.id;
  });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ('development' !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn('You may have an infinite update loop ' + (watcher.user ? "in watcher with expression \"" + watcher.expression + "\"" : "in a component render function."), watcher.vm);
        break;
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks(queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent(vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks(queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$1 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$1; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = 'development' !== 'production' ? expOrFn.toString() : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      'development' !== 'production' && warn("Failed watching path: \"" + expOrFn + "\" " + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
    }
  }
  this.value = this.lazy ? undefined : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get() {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, "getter for watcher \"" + this.expression + "\"");
    } else {
      throw e;
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value;
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep(dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps() {
  var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update() {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run() {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) || this.deep) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, "callback for watcher \"" + this.expression + "\"");
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate() {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend() {
  var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown() {
  var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) {
    initProps(vm, opts.props);
  }
  if (opts.methods) {
    initMethods(vm, opts.methods);
  }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps(vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  var loop = function (key) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if ('development' !== 'production') {
      var hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
        warn("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop.", vm);
      }
      defineReactive(props, key, value, function () {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn("Avoid mutating a prop directly since the value will be " + "overwritten whenever the parent component re-renders. " + "Instead, use a data or computed property based on the prop's " + "value. Prop being mutated: \"" + key + "\"", vm);
        }
      });
    } else {
      defineReactive(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop(key);
  toggleObserving(true);
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
  if (!isPlainObject(data)) {
    data = {};
    'development' !== 'production' && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    if ('development' !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn("Method \"" + key + "\" has already been defined as a data property.", vm);
      }
    }
    if (props && hasOwn(props, key)) {
      'development' !== 'production' && warn("The data property \"" + key + "\" is already declared as a prop. " + "Use prop default value instead.", vm);
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData(data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, "data()");
    return {};
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed(vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ('development' !== 'production' && getter == null) {
      warn("Getter is missing for computed property \"" + key + "\".", vm);
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if ('development' !== 'production') {
      if (key in vm.$data) {
        warn("The computed property \"" + key + "\" is already defined in data.", vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn("The computed property \"" + key + "\" is already defined as a prop.", vm);
      }
    }
  }
}

function defineComputed(target, key, userDef) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef;
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get : noop;
    sharedPropertyDefinition.set = userDef.set ? userDef.set : noop;
  }
  if ('development' !== 'production' && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn("Computed property \"" + key + "\" was assigned to but it has no setter.", this);
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  return function computedGetter() {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

function initMethods(vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    if ('development' !== 'production') {
      if (methods[key] == null) {
        warn("Method \"" + key + "\" has an undefined value in the component definition. " + "Did you reference the function correctly?", vm);
      }
      if (props && hasOwn(props, key)) {
        warn("Method \"" + key + "\" has already been defined as a prop.", vm);
      }
      if (key in vm && isReserved(key)) {
        warn("Method \"" + key + "\" conflicts with an existing Vue instance method. " + "Avoid defining component methods that start with _ or $.");
      }
    }
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
  }
}

function initWatch(vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}

function stateMixin(Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () {
    return this._data;
  };
  var propsDef = {};
  propsDef.get = function () {
    return this._props;
  };
  if ('development' !== 'production') {
    dataDef.set = function (newData) {
      warn('Avoid replacing instance root $data. ' + 'Use nested data properties instead.', this);
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };
}

/*  */

function initProvide(vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide;
  }
}

function initInjections(vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if ('development' !== 'production') {
        defineReactive(vm, key, result[key], function () {
          warn("Avoid mutating an injected value directly since the changes will be " + "overwritten whenever the provided component re-renders. " + "injection being mutated: \"" + key + "\"", vm);
        });
      } else {
        defineReactive(vm, key, result[key]);
      }
    });
    toggleObserving(true);
  }
}

function resolveInject(inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol ? Reflect.ownKeys(inject).filter(function (key) {
      /* istanbul ignore next */
      return Object.getOwnPropertyDescriptor(inject, key).enumerable;
    }) : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var provideKey = inject[key].from;
      var source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break;
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function' ? provideDefault.call(vm) : provideDefault;
        } else if ('development' !== 'production') {
          warn("Injection \"" + key + "\" not found", vm);
        }
      }
    }
    return result;
  }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList(val, render) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    keys = Object.keys(val);
    ret = new Array(keys.length);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  }
  if (isDef(ret)) {
    ret._isVList = true;
  }
  return ret;
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot(name, fallback, props, bindObject) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  if (scopedSlotFn) {
    // scoped slot
    props = props || {};
    if (bindObject) {
      if ('development' !== 'production' && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    var slotNodes = this.$slots[name];
    // warn duplicate slot usage
    if (slotNodes) {
      if ('development' !== 'production' && slotNodes._rendered) {
        warn("Duplicate presence of slot \"" + name + "\" found in the same render tree " + "- this will likely cause render errors.", this);
      }
      slotNodes._rendered = true;
    }
    nodes = slotNodes || fallback;
  }

  var target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes);
  } else {
    return nodes;
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter(id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity;
}

/*  */

function isKeyNotMatch(expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1;
  } else {
    return expect !== actual;
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName);
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode);
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key;
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps(data, tag, value, asProp, isSync) {
  if (value) {
    if (!isObject(value)) {
      'development' !== 'production' && warn('v-bind without argument expects an Object or Array value', this);
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function (key) {
        if (key === 'class' || key === 'style' || isReservedAttribute(key)) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
        }
        if (!(key in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on["update:" + key] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop(key);
    }
  }
  return data;
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic(index, isInFor) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree;
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(this._renderProxy, null, this // for render fns generated for functional component templates
  );
  markStatic(tree, "__static__" + index, false);
  return tree;
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce(tree, index, key) {
  markStatic(tree, "__once__" + index + (key ? "_" + key : ""), true);
  return tree;
}

function markStatic(tree, key, isOnce) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], key + "_" + i, isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode(node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners(data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      'development' !== 'production' && warn('v-on without argument expects an Object value', this);
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data;
}

/*  */

function installRenderHelpers(target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
}

/*  */

function FunctionalRenderContext(data, props, children, parent, Ctor) {
  var options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = function () {
    return resolveSlots(children, parent);
  };

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = data.scopedSlots || emptyObject;
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode;
    };
  } else {
    this._c = function (a, b, c, d) {
      return createElement(contextVm, a, b, c, d, needNormalization);
    };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) {
      mergeProps(props, data.attrs);
    }
    if (isDef(data.props)) {
      mergeProps(props, data.props);
    }
  }

  var renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor);

  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options);
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);
    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options);
    }
    return res;
  }
}

function cloneAndMarkFunctionalResult(vnode, data, contextVm, options) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone;
}

function mergeProps(to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

// Register the component hook to weex native render engine.
// The hook will be triggered by native, not javascript.


// Updates the state of the component to weex native render engine.

/*  */

// https://github.com/Hanks10100/weex-native-directive/tree/master/component

// listening on native callback

/*  */

/*  */

// inline hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init(vnode, hydrating, parentElm, refElm) {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance, parentElm, refElm);
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch(oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(child, options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
    );
  },

  insert: function insert(vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy(vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent(Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return;
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if ('development' !== 'production') {
      warn("Invalid Component definition: " + String(Ctor), context);
    }
    return;
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children);
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode("vue-component-" + Ctor.cid + (name ? "-" + name : ''), data, undefined, undefined, undefined, context, { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }, asyncFactory);

  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  return vnode;
}

function createComponentInstanceForVnode(vnode, // we know it's MountedComponentVNode but flow doesn't
parent, // activeInstance in lifecycle state
parentElm, refElm) {
  var options = {
    _isComponent: true,
    parent: parent,
    _parentVnode: vnode,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnode.componentOptions.Ctor(options);
}

function installComponentHooks(data) {
  var hooks = data.hook || (data.hook = {});
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    hooks[key] = componentVNodeHooks[key];
  }
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel(options, data) {
  var prop = options.model && options.model.prop || 'value';
  var event = options.model && options.model.event || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  if (isDef(on[event])) {
    on[event] = [data.model.callback].concat(on[event]);
  } else {
    on[event] = data.model.callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType);
}

function _createElement(context, tag, data, children, normalizationType) {
  if (isDef(data) && isDef(data.__ob__)) {
    'development' !== 'production' && warn("Avoid using observed data object as vnode data: " + JSON.stringify(data) + "\n" + 'Always create fresh vnode data objects in each render!', context);
    return createEmptyVNode();
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode();
  }
  // warn against non-primitive key
  if ('development' !== 'production' && isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    {
      warn('Avoid using non-primitive value as key, ' + 'use string/number value instead.', context);
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = context.$vnode && context.$vnode.ns || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode;
  } else if (isDef(vnode)) {
    if (isDef(ns)) {
      applyNS(vnode, ns);
    }
    if (isDef(data)) {
      registerDeepBindings(data);
    }
    return vnode;
  } else {
    return createEmptyVNode();
  }
}

function applyNS(vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force) && child.tag !== 'svg')) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings(data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender(vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, false);
  };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, true);
  };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  if ('development' !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true);
  }
}

function renderMixin(Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this);
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    // reset _rendered flag on slots for duplicate slot check
    if ('development' !== 'production') {
      for (var key in vm.$slots) {
        // $flow-disable-line
        vm.$slots[key]._rendered = false;
      }
    }

    if (_parentVnode) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject;
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if ('development' !== 'production') {
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ('development' !== 'production' && Array.isArray(vnode)) {
        warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode;
  };
}

/*  */

var uid$3 = 0;

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$3++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ('development' !== 'production' && config.performance && mark) {
      startTag = "vue-perf-start:" + vm._uid;
      endTag = "vue-perf-end:" + vm._uid;
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
    }
    /* istanbul ignore else */
    if ('development' !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ('development' !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure("vue " + vm._name + " init", startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent(vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;

  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions(Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options;
}

function resolveModifiedOptions(Ctor) {
  var modified;
  var latest = Ctor.options;
  var extended = Ctor.extendOptions;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) {
        modified = {};
      }
      modified[key] = dedupe(latest[key], extended[key], sealed[key]);
    }
  }
  return modified;
}

function dedupe(latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    var res = [];
    sealed = Array.isArray(sealed) ? sealed : [sealed];
    extended = Array.isArray(extended) ? extended : [extended];
    for (var i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i]);
      }
    }
    return res;
  } else {
    return latest;
  }
}

function Vue(options) {
  if ('development' !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse(Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = this._installedPlugins || (this._installedPlugins = []);
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this;
  };
}

/*  */

function initMixin$1(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}

/*  */

function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    var name = extendOptions.name || Super.options.name;
    if ('development' !== 'production' && name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent(options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub;
  };
}

function initProps$1(Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1(Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if ('development' !== 'production' && type === 'component') {
          validateComponentName(id);
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}

/*  */

function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag);
}

function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1;
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  /* istanbul ignore next */
  return false;
}

function pruneCache(keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry(cache, key, keys, current) {
  var cached$$1 = cache[key];
  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created: function created() {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed() {
    var this$1 = this;

    for (var key in this$1.cache) {
      pruneCacheEntry(this$1.cache, key, this$1.keys);
    }
  },

  mounted: function mounted() {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) {
        return matches(val, name);
      });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) {
        return !matches(val, name);
      });
    });
  },

  render: function render() {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      if (
      // not included
      include && (!name || !matches(include, name)) ||
      // excluded
      exclude && name && matches(exclude, name)) {
        return vnode;
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null
      // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      ? componentOptions.Ctor.cid + (componentOptions.tag ? "::" + componentOptions.tag : '') : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || slot && slot[0];
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive

  /*  */

};function initGlobalAPI(Vue) {
  // config
  var configDef = {};
  configDef.get = function () {
    return config;
  };
  if ('development' !== 'production') {
    configDef.set = function () {
      warn('Do not replace the Vue.config object, set individual fields instead.');
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.5.16';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select,progress');
var mustUseProp = function (tag, type, attr) {
  return attr === 'value' && acceptValue(tag) && type !== 'button' || attr === 'selected' && tag === 'option' || attr === 'checked' && tag === 'input' || attr === 'muted' && tag === 'video';
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : '';
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false;
};

/*  */

function genClassForVnode(vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class);
}

function mergeClassData(child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class) ? [child.class, parent.class] : parent.class
  };
}

function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
  /* istanbul ignore next */
  return '';
}

function concat(a, b) {
  return a ? b ? a + ' ' + b : a : b || '';
}

function stringifyClass(value) {
  if (Array.isArray(value)) {
    return stringifyArray(value);
  }
  if (isObject(value)) {
    return stringifyObject(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  /* istanbul ignore next */
  return '';
}

function stringifyArray(value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) {
        res += ' ';
      }
      res += stringified;
    }
  }
  return res;
}

function stringifyObject(value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) {
        res += ' ';
      }
      res += key;
    }
  }
  return res;
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template,blockquote,iframe,tfoot');

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' + 'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag);
};

function getTagNamespace(tag) {
  if (isSVG(tag)) {
    return 'svg';
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math';
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement(tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true;
  }
  if (isReservedTag(tag)) {
    return false;
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag];
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
  } else {
    return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString());
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query(el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
      'development' !== 'production' && warn('Cannot find element: ' + el);
      return document.createElement('div');
    }
    return selected;
  } else {
    return el;
  }
}

/*  */

function createElement$1(tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm;
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm;
}

function createElementNS(namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createComment(text) {
  return document.createComment(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

function appendChild(node, child) {
  node.appendChild(child);
}

function parentNode(node) {
  return node.parentNode;
}

function nextSibling(node) {
  return node.nextSibling;
}

function tagName(node) {
  return node.tagName;
}

function setTextContent(node, text) {
  node.textContent = text;
}

function setStyleScope(node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create: function create(_, vnode) {
    registerRef(vnode);
  },
  update: function update(oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy(vnode) {
    registerRef(vnode, true);
  }
};

function registerRef(vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!isDef(key)) {
    return;
  }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode(a, b) {
  return a.key === b.key && (a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b) || isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error));
}

function sameInputType(a, b) {
  if (a.tag !== 'input') {
    return true;
  }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) {
      map[key] = i;
    }
  }
  return map;
}

function createPatchFunction(backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove;
  }

  function removeNode(el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1(vnode, inVPre) {
    return !inVPre && !vnode.ns && !(config.ignoredElements.length && config.ignoredElements.some(function (ignore) {
      return isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag;
    })) && config.isUnknownElement(vnode.tag);
  }

  var creatingElmInVPre = 0;

  function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return;
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if ('development' !== 'production') {
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
        }
      }

      vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if ('development' !== 'production' && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true;
      }
    }
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break;
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert(parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (ref$$1.parentNode === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if ('development' !== 'production') {
        checkDuplicateKeys(children);
      }
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable(vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag);
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) {
        i.create(emptyNode, vnode);
      }
      if (isDef(i.insert)) {
        insertedVnodeQueue.push(vnode);
      }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope(vnode) {
    var i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) && i !== vnode.context && i !== vnode.fnContext && isDef(i = i.$options._scopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) {
        i(vnode);
      }
      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else {
          // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    if ('development' !== 'production') {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) {
          // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys(children) {
    var seenKeys = {};
    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn("Duplicate keys detected: '" + key + "'. This may cause an update error.", vnode.context);
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld(node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) {
        return i;
      }
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return;
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return;
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
      vnode.componentInstance = oldVnode.componentInstance;
      return;
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }
      if (isDef(i = data.hook) && isDef(i = i.update)) {
        i(oldVnode, vnode);
      }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
        i(oldVnode, vnode);
      }
    }
  }

  function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || data && data.pre;
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true;
    }
    // assert node match
    if ('development' !== 'production') {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false;
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode, true /* hydrating */);
      }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true;
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if ('development' !== 'production' && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false;
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break;
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if ('development' !== 'production' && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false;
            }
          }
        }
      }
      if (isDef(data)) {
        var fullInvoke = false;
        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break;
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true;
  }

  function assertNodeMatch(node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || !isUnknownElement$$1(vnode, inVPre) && vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase());
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3);
    }
  }

  return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) {
        invokeDestroyHook(oldVnode);
      }
      return;
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode;
            } else if ('development' !== 'production') {
              warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. This is likely caused by incorrect ' + 'HTML markup, for example nesting block-level elements inside ' + '<p>, or missing <tbody>. Bailing hydration and performing ' + 'full client-side render.');
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm$1 = nodeOps.parentNode(oldElm);

        // create new node
        createElm(vnode, insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm$1, nodeOps.nextSibling(oldElm));

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);
          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              var insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        if (isDef(parentElm$1)) {
          removeVnodes(parentElm$1, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm;
  };
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives(vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives(oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update(oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1(dirs, vm) {
  var res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res;
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res;
}

function getRawDirName(dir) {
  return dir.rawName || dir.name + "." + Object.keys(dir.modifiers || {}).join('.');
}

function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, "directive " + dir.name + " " + hook + " hook");
    }
  }
}

var baseModules = [ref, directives];

/*  */

function updateAttrs(oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return;
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return;
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr(el, key, value) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr(el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (isIE && !isIE9 && el.tagName === 'TEXTAREA' && key === 'placeholder' && !el.__ieph) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs

  /*  */

};function updateClass(oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (isUndef(data.staticClass) && isUndef(data.class) && (isUndef(oldData) || isUndef(oldData.staticClass) && isUndef(oldData.class))) {
    return;
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass

  /*  */

  /*  */

  // add a raw attr (use this in preTransforms)


  // note: this only removes the attr from the Array (attrsList) so that it
  // doesn't get processed by processAttrs.
  // By default it does NOT remove it from the map (attrsMap) because the map is
  // needed during codegen.

  /*  */

  /**
   * Cross-platform code generation for component v-model
   */

  /**
   * Cross-platform codegen helper for generating v-model value assignment code.
   */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
};var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents(on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler(handler, event, capture) {
  var _target = target$1; // save current target element in closure
  return function onceHandler() {
    var res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  };
}

function add$1(event, handler, once$$1, capture, passive) {
  handler = withMacroTask(handler);
  if (once$$1) {
    handler = createOnceHandler(handler, event, capture);
  }
  target$1.addEventListener(event, handler, supportsPassive ? { capture: capture, passive: passive } : capture);
}

function remove$2(event, handler, capture, _target) {
  (_target || target$1).removeEventListener(event, handler._withTask || handler, capture);
}

function updateDOMListeners(oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return;
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners

  /*  */

};function updateDOMProps(oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return;
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (isUndef(props[key])) {
      elm[key] = '';
    }
  }
  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) {
        vnode.children.length = 0;
      }
      if (cur === oldProps[key]) {
        continue;
      }
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue(elm, checkVal) {
  return !elm.composing && (elm.tagName === 'OPTION' || isNotInFocusAndDirty(elm, checkVal) || isDirtyWithModifiers(elm, checkVal));
}

function isNotInFocusAndDirty(elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try {
    notInFocus = document.activeElement !== elm;
  } catch (e) {}
  return notInFocus && elm.value !== checkVal;
}

function isDirtyWithModifiers(elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.lazy) {
      // inputs with lazy should only be updated when not in focus
      return false;
    }
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal);
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim();
    }
  }
  return value !== newVal;
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps

  /*  */

};var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res;
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData(data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle ? extend(data.staticStyle, style) : style;
}

// normalize possible array / string values into Object
function normalizeStyleBinding(bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle);
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle);
  }
  return bindingStyle;
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle(vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if (styleData = normalizeStyleData(vnode.data)) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while (parentNode = parentNode.parent) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res;
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && prop in emptyStyle) {
    return prop;
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name;
    }
  }
});

function updateStyle(oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) && isUndef(oldData.staticStyle) && isUndef(oldData.style)) {
    return;
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__) ? extend({}, style) : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle

  /*  */

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
};function addClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition(def) {
  if (!def) {
    return;
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    var res = {};
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'));
    }
    extend(res, def);
    return res;
  } else if (typeof def === 'string') {
    return autoCssTransition(def);
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: name + "-enter",
    enterToClass: name + "-enter-to",
    enterActiveClass: name + "-enter-active",
    leaveClass: name + "-leave",
    leaveToClass: name + "-leave-to",
    leaveActiveClass: name + "-leave-active"
  };
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : /* istanbul ignore next */function (fn) {
  return fn();
};

function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass(el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass(el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds(el, expectedType, cb) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) {
    return cb();
  }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo(el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  };
}

function getTimeout(delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i]);
  }));
}

function toMs(s) {
  return Number(s.slice(0, -1)) * 1000;
}

/*  */

function enter(vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return;
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return;
  }

  var startClass = isAppear && appearClass ? appearClass : enterClass;
  var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
  var toClass = isAppear && appearToClass ? appearToClass : enterToClass;

  var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
  var enterHook = isAppear ? typeof appear === 'function' ? appear : enter : enter;
  var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
  var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;

  var explicitEnterDuration = toNumber(isObject(duration) ? duration.enter : duration);

  if ('development' !== 'production' && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave(vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm();
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(isObject(duration) ? duration.leave : duration);

  if ('development' !== 'production' && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave() {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return;
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration(val, name, vnode) {
  if (typeof val !== 'number') {
    warn("<transition> explicit " + name + " duration is not a valid number - " + "got " + JSON.stringify(val) + ".", vnode.context);
  } else if (isNaN(val)) {
    warn("<transition> explicit " + name + " duration is NaN - " + 'the duration expression might be incorrect.', vnode.context);
  }
}

function isValidDuration(val) {
  return typeof val === 'number' && !isNaN(val);
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength(fn) {
  if (isUndef(fn)) {
    return false;
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
  } else {
    return (fn._length || fn.length) > 1;
  }
}

function _enter(_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1(vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [attrs, klass, events, domProps, style, transition];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted(el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated: function componentUpdated(el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) {
        return !looseEqual(o, prevOptions[i]);
      })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple ? binding.value.some(function (v) {
          return hasNoMatchingOption(v, curOptions);
        }) : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected(el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected(el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    'development' !== 'production' && warn("<select multiple v-model=\"" + binding.expression + "\"> " + "expects an Array value for its binding, but got " + Object.prototype.toString.call(value).slice(8, -1), vm);
    return;
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return;
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption(value, options) {
  return options.every(function (o) {
    return !looseEqual(o, value);
  });
}

function getValue(option) {
  return '_value' in option ? option._value : option.value;
}

function onCompositionStart(e) {
  e.target.composing = true;
}

function onCompositionEnd(e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) {
    return;
  }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger(el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode(vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.componentInstance._vnode) : vnode;
}

var show = {
  bind: function bind(el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay = el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update(el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (!value === !oldValue) {
      return;
    }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind(el, binding, vnode, oldVnode, isDestroy) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show: show

  /*  */

  // Provides transition support for a single element/component.
  // supports transition mode (out-in / in-out)

};var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild(vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children));
  } else {
    return vnode;
  }
}

function extractTransitionData(comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data;
}

function placeholder(h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    });
  }
}

function hasParentTransition(vnode) {
  while (vnode = vnode.parent) {
    if (vnode.data.transition) {
      return true;
    }
  }
}

function isSameChild(child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag;
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render(h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return;
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) {
      return c.tag || isAsyncPlaceholder(c);
    });
    /* istanbul ignore if */
    if (!children.length) {
      return;
    }

    // warn multiple elements
    if ('development' !== 'production' && children.length > 1) {
      warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent);
    }

    var mode = this.mode;

    // warn invalid mode
    if ('development' !== 'production' && mode && mode !== 'in-out' && mode !== 'out-in') {
      warn('invalid <transition> mode: ' + mode, this.$parent);
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild;
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild;
    }

    if (this._leaving) {
      return placeholder(h, rawChild);
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + this._uid + "-";
    child.key = child.key == null ? child.isComment ? id + 'comment' : id + child.tag : isPrimitive(child.key) ? String(child.key).indexOf(id) === 0 ? child.key : id + child.key : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) {
      return d.name === 'show';
    })) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && !isSameChild(child, oldChild) && !isAsyncPlaceholder(oldChild) &&
    // #6687 component root is a comment node
    !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild);
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild;
        }
        var delayedLeave;
        var performLeave = function () {
          delayedLeave();
        };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        });
      }
    }

    return rawChild;
  }

  /*  */

  // Provides transition support for list items.
  // supports move transitions using the FLIP technique.

  // Because the vdom's children update algorithm is "unstable" - i.e.
  // it doesn't guarantee the relative positioning of removed elements,
  // we force transition-group to update its children into two passes:
  // in the first pass, we remove all nodes that need to be removed,
  // triggering their leaving transition; in the second pass, we insert/move
  // into the final desired state. This way in the second pass removed
  // nodes will remain where they should be.

};var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render(h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c;(c.data || (c.data = {})).transition = transitionData;
        } else if ('development' !== 'production') {
          var opts = c.componentOptions;
          var name = opts ? opts.Ctor.options.name || opts.tag || '' : c.tag;
          warn("<transition-group> children must be keyed: <" + name + ">");
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children);
  },

  beforeUpdate: function beforeUpdate() {
    // force removing pass
    this.__patch__(this._vnode, this.kept, false, // hydrating
    true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated() {
    var children = this.prevChildren;
    var moveClass = this.moveClass || (this.name || 'v') + '-move';
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return;
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove(el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false;
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove;
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) {
          removeClass(clone, cls);
        });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return this._hasMove = info.hasTransform;
    }
  }
};

function callPendingCbs(c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition(c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation(c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup

  /*  */

  // install platform specific utils
};Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (el, hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else if ('development' !== 'production' && 'development' !== 'test' && isChrome) {
        console[console.info ? 'info' : 'log']('Download the Vue Devtools extension for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
      }
    }
    if ('development' !== 'production' && 'development' !== 'test' && config.productionTip !== false && typeof console !== 'undefined') {
      console[console.info ? 'info' : 'log']("You are running Vue in development mode.\n" + "Make sure to turn on production mode when deploying for production.\n" + "See more tips at https://vuejs.org/guide/deployment.html");
    }
  }, 0);
}

/*  */

exports.default = Vue;
},{}],8:[function(require,module,exports) {
var inserted = exports.cache = {}

function noop () {}

exports.insert = function (css) {
  if (inserted[css]) return noop
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return function () {
    document.getElementsByTagName('head')[0].removeChild(elem)
    inserted[css] = false
  }
}

},{}],15:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hooks = hooks;
exports.setHookCallback = setHookCallback;


var hookCallback;

function hooks() {
    return hookCallback.apply(null, arguments);
}

// This is done to register the method called with moment()
// without creating circular dependencies.
function setHookCallback(callback) {
    hookCallback = callback;
}
},{}],63:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isArray;
function isArray(input) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
}
},{}],108:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isObject;
function isObject(input) {
    // IE8 will treat undefined and null as object if it wasn't for
    // input != null
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
}
},{}],109:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isObjectEmpty;
function isObjectEmpty(obj) {
    if (Object.getOwnPropertyNames) {
        return Object.getOwnPropertyNames(obj).length === 0;
    } else {
        var k;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                return false;
            }
        }
        return true;
    }
}
},{}],62:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isUndefined;
function isUndefined(input) {
    return input === void 0;
}
},{}],89:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isNumber;
function isNumber(input) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
}
},{}],21:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isDate;
function isDate(input) {
    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
}
},{}],110:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = map;
function map(arr, fn) {
    var res = [],
        i;
    for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i], i));
    }
    return res;
}
},{}],61:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = hasOwnProp;
function hasOwnProp(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
}
},{}],58:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = extend;

var _hasOwnProp = require('./has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extend(a, b) {
    for (var i in b) {
        if ((0, _hasOwnProp2.default)(b, i)) {
            a[i] = b[i];
        }
    }

    if ((0, _hasOwnProp2.default)(b, 'toString')) {
        a.toString = b.toString;
    }

    if ((0, _hasOwnProp2.default)(b, 'valueOf')) {
        a.valueOf = b.valueOf;
    }

    return a;
}
},{"./has-own-prop":61}],24:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createUTC = createUTC;

var _fromAnything = require('./from-anything');

function createUTC(input, format, locale, strict) {
    return (0, _fromAnything.createLocalOrUTC)(input, format, locale, strict, true).utc();
}
},{"./from-anything":57}],59:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getParsingFlags;
function defaultParsingFlags() {
    // We need to deep clone this object.
    return {
        empty: false,
        unusedTokens: [],
        unusedInput: [],
        overflow: -2,
        charsLeftOver: 0,
        nullInput: false,
        invalidMonth: null,
        invalidFormat: false,
        userInvalidated: false,
        iso: false,
        parsedDateParts: [],
        meridiem: null,
        rfc2822: false,
        weekdayMismatch: false
    };
}

function getParsingFlags(m) {
    if (m._pf == null) {
        m._pf = defaultParsingFlags();
    }
    return m._pf;
}
},{}],60:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var some;
if (Array.prototype.some) {
    exports.default = some = Array.prototype.some;
} else {
    exports.default = some = function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;

        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(this, t[i], i, t)) {
                return true;
            }
        }

        return false;
    };
}

exports.default = some;
},{}],25:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isValid = isValid;
exports.createInvalid = createInvalid;

var _extend = require('../utils/extend');

var _extend2 = _interopRequireDefault(_extend);

var _utc = require('./utc');

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

var _some = require('../utils/some');

var _some2 = _interopRequireDefault(_some);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isValid(m) {
    if (m._isValid == null) {
        var flags = (0, _parsingFlags2.default)(m);
        var parsedParts = _some2.default.call(flags.parsedDateParts, function (i) {
            return i != null;
        });
        var isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);

        if (m._strict) {
            isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
        }

        if (Object.isFrozen == null || !Object.isFrozen(m)) {
            m._isValid = isNowValid;
        } else {
            return isNowValid;
        }
    }
    return m._isValid;
}

function createInvalid(flags) {
    var m = (0, _utc.createUTC)(NaN);
    if (flags != null) {
        (0, _extend2.default)((0, _parsingFlags2.default)(m), flags);
    } else {
        (0, _parsingFlags2.default)(m).userInvalidated = true;
    }

    return m;
}
},{"../utils/extend":58,"./utc":24,"../create/parsing-flags":59,"../utils/some":60}],26:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.copyConfig = copyConfig;
exports.Moment = Moment;
exports.isMoment = isMoment;

var _hooks = require('../utils/hooks');

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _isUndefined = require('../utils/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
var momentProperties = _hooks.hooks.momentProperties = [];

function copyConfig(to, from) {
    var i, prop, val;

    if (!(0, _isUndefined2.default)(from._isAMomentObject)) {
        to._isAMomentObject = from._isAMomentObject;
    }
    if (!(0, _isUndefined2.default)(from._i)) {
        to._i = from._i;
    }
    if (!(0, _isUndefined2.default)(from._f)) {
        to._f = from._f;
    }
    if (!(0, _isUndefined2.default)(from._l)) {
        to._l = from._l;
    }
    if (!(0, _isUndefined2.default)(from._strict)) {
        to._strict = from._strict;
    }
    if (!(0, _isUndefined2.default)(from._tzm)) {
        to._tzm = from._tzm;
    }
    if (!(0, _isUndefined2.default)(from._isUTC)) {
        to._isUTC = from._isUTC;
    }
    if (!(0, _isUndefined2.default)(from._offset)) {
        to._offset = from._offset;
    }
    if (!(0, _isUndefined2.default)(from._pf)) {
        to._pf = (0, _parsingFlags2.default)(from);
    }
    if (!(0, _isUndefined2.default)(from._locale)) {
        to._locale = from._locale;
    }

    if (momentProperties.length > 0) {
        for (i = 0; i < momentProperties.length; i++) {
            prop = momentProperties[i];
            val = from[prop];
            if (!(0, _isUndefined2.default)(val)) {
                to[prop] = val;
            }
        }
    }

    return to;
}

var updateInProgress = false;

// Moment prototype object
function Moment(config) {
    copyConfig(this, config);
    this._d = new Date(config._d != null ? config._d.getTime() : NaN);
    if (!this.isValid()) {
        this._d = new Date(NaN);
    }
    // Prevent infinite loop in case updateOffset creates new moment
    // objects.
    if (updateInProgress === false) {
        updateInProgress = true;
        _hooks.hooks.updateOffset(this);
        updateInProgress = false;
    }
}

function isMoment(obj) {
    return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
}
},{"../utils/hooks":15,"../utils/has-own-prop":61,"../utils/is-undefined":62,"../create/parsing-flags":59}],117:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = absFloor;
function absFloor(number) {
    if (number < 0) {
        // -0 -> 0
        return Math.ceil(number) || 0;
    } else {
        return Math.floor(number);
    }
}
},{}],88:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = toInt;

var _absFloor = require('./abs-floor');

var _absFloor2 = _interopRequireDefault(_absFloor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toInt(argumentForCoercion) {
    var coercedNumber = +argumentForCoercion,
        value = 0;

    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = (0, _absFloor2.default)(coercedNumber);
    }

    return value;
}
},{"./abs-floor":117}],85:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = compareArrays;

var _toInt = require('./to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// compare two arrays, return the number of differences
function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
    for (i = 0; i < len; i++) {
        if (dontConvert && array1[i] !== array2[i] || !dontConvert && (0, _toInt2.default)(array1[i]) !== (0, _toInt2.default)(array2[i])) {
            diffs++;
        }
    }
    return diffs + lengthDiff;
}
},{"./to-int":88}],33:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deprecate = deprecate;
exports.deprecateSimple = deprecateSimple;

var _extend = require('./extend');

var _extend2 = _interopRequireDefault(_extend);

var _hooks = require('./hooks');

var _isUndefined = require('./is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function warn(msg) {
    if (_hooks.hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
        console.warn('Deprecation warning: ' + msg);
    }
}

function deprecate(msg, fn) {
    var firstTime = true;

    return (0, _extend2.default)(function () {
        if (_hooks.hooks.deprecationHandler != null) {
            _hooks.hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
            var args = [];
            var arg;
            for (var i = 0; i < arguments.length; i++) {
                arg = '';
                if (typeof arguments[i] === 'object') {
                    arg += '\n[' + i + '] ';
                    for (var key in arguments[0]) {
                        arg += key + ': ' + arguments[0][key] + ', ';
                    }
                    arg = arg.slice(0, -2); // Remove trailing comma and space
                } else {
                    arg = arguments[i];
                }
                args.push(arg);
            }
            warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + new Error().stack);
            firstTime = false;
        }
        return fn.apply(this, arguments);
    }, fn);
}

var deprecations = {};

function deprecateSimple(name, msg) {
    if (_hooks.hooks.deprecationHandler != null) {
        _hooks.hooks.deprecationHandler(name, msg);
    }
    if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
    }
}

_hooks.hooks.suppressDeprecationWarnings = false;
_hooks.hooks.deprecationHandler = null;
},{"./extend":58,"./hooks":15,"./is-undefined":62}],36:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isFunction;
function isFunction(input) {
    return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
}
},{}],70:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.set = set;
exports.mergeConfigs = mergeConfigs;

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _extend = require('../utils/extend');

var _extend2 = _interopRequireDefault(_extend);

var _isObject = require('../utils/is-object');

var _isObject2 = _interopRequireDefault(_isObject);

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function set(config) {
    var prop, i;
    for (i in config) {
        prop = config[i];
        if ((0, _isFunction2.default)(prop)) {
            this[i] = prop;
        } else {
            this['_' + i] = prop;
        }
    }
    this._config = config;
    // Lenient ordinal parsing accepts just a number in addition to
    // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
    // TODO: Remove "ordinalParse" fallback in next major release.
    this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + '|' + /\d{1,2}/.source);
}

function mergeConfigs(parentConfig, childConfig) {
    var res = (0, _extend2.default)({}, parentConfig),
        prop;
    for (prop in childConfig) {
        if ((0, _hasOwnProp2.default)(childConfig, prop)) {
            if ((0, _isObject2.default)(parentConfig[prop]) && (0, _isObject2.default)(childConfig[prop])) {
                res[prop] = {};
                (0, _extend2.default)(res[prop], parentConfig[prop]);
                (0, _extend2.default)(res[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
                res[prop] = childConfig[prop];
            } else {
                delete res[prop];
            }
        }
    }
    for (prop in parentConfig) {
        if ((0, _hasOwnProp2.default)(parentConfig, prop) && !(0, _hasOwnProp2.default)(childConfig, prop) && (0, _isObject2.default)(parentConfig[prop])) {
            // make sure changes to properties don't modify parent config
            res[prop] = (0, _extend2.default)({}, res[prop]);
        }
    }
    return res;
}
},{"../utils/is-function":36,"../utils/extend":58,"../utils/is-object":108,"../utils/has-own-prop":61}],64:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Locale = Locale;
function Locale(config) {
    if (config != null) {
        this.set(config);
    }
}
},{}],86:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _hasOwnProp = require('./has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var keys;

if (Object.keys) {
    exports.default = keys = Object.keys;
} else {
    exports.default = keys = function (obj) {
        var i,
            res = [];
        for (i in obj) {
            if ((0, _hasOwnProp2.default)(obj, i)) {
                res.push(i);
            }
        }
        return res;
    };
}

exports.default = keys;
},{"./has-own-prop":61}],65:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultCalendar = undefined;
exports.calendar = calendar;

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultCalendar = exports.defaultCalendar = {
    sameDay: '[Today at] LT',
    nextDay: '[Tomorrow at] LT',
    nextWeek: 'dddd [at] LT',
    lastDay: '[Yesterday at] LT',
    lastWeek: '[Last] dddd [at] LT',
    sameElse: 'L'
};

function calendar(key, mom, now) {
    var output = this._calendar[key] || this._calendar['sameElse'];
    return (0, _isFunction2.default)(output) ? output.call(mom, now) : output;
}
},{"../utils/is-function":36}],66:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.longDateFormat = longDateFormat;
var defaultLongDateFormat = exports.defaultLongDateFormat = {
    LTS: 'h:mm:ss A',
    LT: 'h:mm A',
    L: 'MM/DD/YYYY',
    LL: 'MMMM D, YYYY',
    LLL: 'MMMM D, YYYY h:mm A',
    LLLL: 'dddd, MMMM D, YYYY h:mm A'
};

function longDateFormat(key) {
    var format = this._longDateFormat[key],
        formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
        return format;
    }

    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
        return val.slice(1);
    });

    return this._longDateFormat[key];
}
},{}],68:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.invalidDate = invalidDate;
var defaultInvalidDate = exports.defaultInvalidDate = 'Invalid date';

function invalidDate() {
    return this._invalidDate;
}
},{}],67:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ordinal = ordinal;
var defaultOrdinal = exports.defaultOrdinal = '%d';
var defaultDayOfMonthOrdinalParse = exports.defaultDayOfMonthOrdinalParse = /\d{1,2}/;

function ordinal(number) {
    return this._ordinal.replace('%d', number);
}
},{}],71:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultRelativeTime = undefined;
exports.relativeTime = relativeTime;
exports.pastFuture = pastFuture;

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultRelativeTime = exports.defaultRelativeTime = {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    ss: '%d seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years'
};

function relativeTime(number, withoutSuffix, string, isFuture) {
    var output = this._relativeTime[string];
    return (0, _isFunction2.default)(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
}

function pastFuture(diff, output) {
    var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
    return (0, _isFunction2.default)(format) ? format(output) : format.replace(/%s/i, output);
}
},{"../utils/is-function":36}],55:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addUnitAlias = addUnitAlias;
exports.normalizeUnits = normalizeUnits;
exports.normalizeObjectUnits = normalizeObjectUnits;

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var aliases = {};

function addUnitAlias(unit, shorthand) {
    var lowerCase = unit.toLowerCase();
    aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
}

function normalizeUnits(units) {
    return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
}

function normalizeObjectUnits(inputObject) {
    var normalizedInput = {},
        normalizedProp,
        prop;

    for (prop in inputObject) {
        if ((0, _hasOwnProp2.default)(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            if (normalizedProp) {
                normalizedInput[normalizedProp] = inputObject[prop];
            }
        }
    }

    return normalizedInput;
}
},{"../utils/has-own-prop":61}],103:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addUnitPriority = addUnitPriority;
exports.getPrioritizedUnits = getPrioritizedUnits;
var priorities = {};

function addUnitPriority(unit, priority) {
    priorities[unit] = priority;
}

function getPrioritizedUnits(unitsObj) {
    var units = [];
    for (var u in unitsObj) {
        units.push({ unit: u, priority: priorities[u] });
    }
    units.sort(function (a, b) {
        return a.priority - b.priority;
    });
    return units;
}
},{}],90:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = zeroFill;
function zeroFill(number, targetLength, forceSign) {
    var absNumber = '' + Math.abs(number),
        zerosToFill = targetLength - absNumber.length,
        sign = number >= 0;
    return (sign ? forceSign ? '+' : '' : '-') + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
}
},{}],91:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.formatTokenFunctions = exports.formattingTokens = undefined;
exports.addFormatToken = addFormatToken;
exports.formatMoment = formatMoment;
exports.expandFormat = expandFormat;

var _zeroFill = require('../utils/zero-fill');

var _zeroFill2 = _interopRequireDefault(_zeroFill);

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formattingTokens = exports.formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

var formatFunctions = {};

var formatTokenFunctions = exports.formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function addFormatToken(token, padded, ordinal, callback) {
    var func = callback;
    if (typeof callback === 'string') {
        func = function () {
            return this[callback]();
        };
    }
    if (token) {
        formatTokenFunctions[token] = func;
    }
    if (padded) {
        formatTokenFunctions[padded[0]] = function () {
            return (0, _zeroFill2.default)(func.apply(this, arguments), padded[1], padded[2]);
        };
    }
    if (ordinal) {
        formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        };
    }
}

function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, '');
    }
    return input.replace(/\\/g, '');
}

function makeFormatFunction(format) {
    var array = format.match(formattingTokens),
        i,
        length;

    for (i = 0, length = array.length; i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
            array[i] = formatTokenFunctions[array[i]];
        } else {
            array[i] = removeFormattingTokens(array[i]);
        }
    }

    return function (mom) {
        var output = '',
            i;
        for (i = 0; i < length; i++) {
            output += (0, _isFunction2.default)(array[i]) ? array[i].call(mom, format) : array[i];
        }
        return output;
    };
}

// format date using native date object
function formatMoment(m, format) {
    if (!m.isValid()) {
        return m.localeData().invalidDate();
    }

    format = expandFormat(format, m.localeData());
    formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

    return formatFunctions[format](m);
}

function expandFormat(format, locale) {
    var i = 5;

    function replaceLongDateFormatTokens(input) {
        return locale.longDateFormat(input) || input;
    }

    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
    }

    return format;
}
},{"../utils/zero-fill":90,"../utils/is-function":36}],92:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.matchWord = exports.matchTimestamp = exports.matchShortOffset = exports.matchOffset = exports.matchSigned = exports.matchUnsigned = exports.match1to6 = exports.match1to4 = exports.match1to3 = exports.match5to6 = exports.match3to4 = exports.match1to2 = exports.match6 = exports.match4 = exports.match3 = exports.match2 = exports.match1 = undefined;
exports.addRegexToken = addRegexToken;
exports.getParseRegexForToken = getParseRegexForToken;
exports.regexEscape = regexEscape;

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var match1 = exports.match1 = /\d/; //       0 - 9
var match2 = exports.match2 = /\d\d/; //      00 - 99
var match3 = exports.match3 = /\d{3}/; //     000 - 999
var match4 = exports.match4 = /\d{4}/; //    0000 - 9999
var match6 = exports.match6 = /[+-]?\d{6}/; // -999999 - 999999
var match1to2 = exports.match1to2 = /\d\d?/; //       0 - 99
var match3to4 = exports.match3to4 = /\d\d\d\d?/; //     999 - 9999
var match5to6 = exports.match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
var match1to3 = exports.match1to3 = /\d{1,3}/; //       0 - 999
var match1to4 = exports.match1to4 = /\d{1,4}/; //       0 - 9999
var match1to6 = exports.match1to6 = /[+-]?\d{1,6}/; // -999999 - 999999

var matchUnsigned = exports.matchUnsigned = /\d+/; //       0 - inf
var matchSigned = exports.matchSigned = /[+-]?\d+/; //    -inf - inf

var matchOffset = exports.matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
var matchShortOffset = exports.matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

var matchTimestamp = exports.matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
var matchWord = exports.matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

var regexes = {};

function addRegexToken(token, regex, strictRegex) {
    regexes[token] = (0, _isFunction2.default)(regex) ? regex : function (isStrict, localeData) {
        return isStrict && strictRegex ? strictRegex : regex;
    };
}

function getParseRegexForToken(token, config) {
    if (!(0, _hasOwnProp2.default)(regexes, token)) {
        return new RegExp(unescapeFormat(token));
    }

    return regexes[token](config._strict, config._locale);
}

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function unescapeFormat(s) {
    return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
    }));
}

function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
},{"../utils/has-own-prop":61,"../utils/is-function":36}],93:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addParseToken = addParseToken;
exports.addWeekParseToken = addWeekParseToken;
exports.addTimeToArrayFromToken = addTimeToArrayFromToken;

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _isNumber = require('../utils/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tokens = {};

function addParseToken(token, callback) {
    var i,
        func = callback;
    if (typeof token === 'string') {
        token = [token];
    }
    if ((0, _isNumber2.default)(callback)) {
        func = function (input, array) {
            array[callback] = (0, _toInt2.default)(input);
        };
    }
    for (i = 0; i < token.length; i++) {
        tokens[token[i]] = func;
    }
}

function addWeekParseToken(token, callback) {
    addParseToken(token, function (input, array, config, token) {
        config._w = config._w || {};
        callback(input, config._w, config, token);
    });
}

function addTimeToArrayFromToken(token, input, config) {
    if (input != null && (0, _hasOwnProp2.default)(tokens, token)) {
        tokens[token](input, config._a, config, token);
    }
}
},{"../utils/has-own-prop":61,"../utils/is-number":89,"../utils/to-int":88}],102:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var YEAR = exports.YEAR = 0;
var MONTH = exports.MONTH = 1;
var DATE = exports.DATE = 2;
var HOUR = exports.HOUR = 3;
var MINUTE = exports.MINUTE = 4;
var SECOND = exports.SECOND = 5;
var MILLISECOND = exports.MILLISECOND = 6;
var WEEK = exports.WEEK = 7;
var WEEKDAY = exports.WEEKDAY = 8;
},{}],54:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetYear = undefined;
exports.daysInYear = daysInYear;
exports.isLeapYear = isLeapYear;
exports.getIsLeapYear = getIsLeapYear;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _hooks = require('../utils/hooks');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('Y', 0, 0, function () {
    var y = this.year();
    return y <= 9999 ? '' + y : '+' + y;
});

(0, _format.addFormatToken)(0, ['YY', 2], 0, function () {
    return this.year() % 100;
});

(0, _format.addFormatToken)(0, ['YYYY', 4], 0, 'year');
(0, _format.addFormatToken)(0, ['YYYYY', 5], 0, 'year');
(0, _format.addFormatToken)(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES

(0, _aliases.addUnitAlias)('year', 'y');

// PRIORITIES

(0, _priorities.addUnitPriority)('year', 1);

// PARSING

(0, _regex.addRegexToken)('Y', _regex.matchSigned);
(0, _regex.addRegexToken)('YY', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('YYYY', _regex.match1to4, _regex.match4);
(0, _regex.addRegexToken)('YYYYY', _regex.match1to6, _regex.match6);
(0, _regex.addRegexToken)('YYYYYY', _regex.match1to6, _regex.match6);

(0, _token.addParseToken)(['YYYYY', 'YYYYYY'], _constants.YEAR);
(0, _token.addParseToken)('YYYY', function (input, array) {
    array[_constants.YEAR] = input.length === 2 ? _hooks.hooks.parseTwoDigitYear(input) : (0, _toInt2.default)(input);
});
(0, _token.addParseToken)('YY', function (input, array) {
    array[_constants.YEAR] = _hooks.hooks.parseTwoDigitYear(input);
});
(0, _token.addParseToken)('Y', function (input, array) {
    array[_constants.YEAR] = parseInt(input, 10);
});

// HELPERS

function daysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}

// HOOKS

_hooks.hooks.parseTwoDigitYear = function (input) {
    return (0, _toInt2.default)(input) + ((0, _toInt2.default)(input) > 68 ? 1900 : 2000);
};

// MOMENTS

var getSetYear = exports.getSetYear = (0, _getSet.makeGetSet)('FullYear', true);

function getIsLeapYear() {
    return isLeapYear(this.year());
}
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"../utils/hooks":15,"./constants":102,"../utils/to-int":88}],79:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeGetSet = makeGetSet;
exports.get = get;
exports.set = set;
exports.stringGet = stringGet;
exports.stringSet = stringSet;

var _aliases = require('../units/aliases');

var _priorities = require('../units/priorities');

var _hooks = require('../utils/hooks');

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _month = require('../units/month');

var _year = require('../units/year');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeGetSet(unit, keepTime) {
    return function (value) {
        if (value != null) {
            set(this, unit, value);
            _hooks.hooks.updateOffset(this, keepTime);
            return this;
        } else {
            return get(this, unit);
        }
    };
}

function get(mom, unit) {
    return mom.isValid() ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
}

function set(mom, unit, value) {
    if (mom.isValid() && !isNaN(value)) {
        if (unit === 'FullYear' && (0, _year.isLeapYear)(mom.year()) && mom.month() === 1 && mom.date() === 29) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), (0, _month.daysInMonth)(value, mom.month()));
        } else {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }
}

// MOMENTS

function stringGet(units) {
    units = (0, _aliases.normalizeUnits)(units);
    if ((0, _isFunction2.default)(this[units])) {
        return this[units]();
    }
    return this;
}

function stringSet(units, value) {
    if (typeof units === 'object') {
        units = (0, _aliases.normalizeObjectUnits)(units);
        var prioritized = (0, _priorities.getPrioritizedUnits)(units);
        for (var i = 0; i < prioritized.length; i++) {
            this[prioritized[i].unit](units[prioritized[i].unit]);
        }
    } else {
        units = (0, _aliases.normalizeUnits)(units);
        if ((0, _isFunction2.default)(this[units])) {
            return this[units](value);
        }
    }
    return this;
}
},{"../units/aliases":55,"../units/priorities":103,"../utils/hooks":15,"../utils/is-function":36,"../units/month":47,"../units/year":54}],106:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = mod;
function mod(n, x) {
    return (n % x + x) % x;
}
},{}],104:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var indexOf;

if (Array.prototype.indexOf) {
    exports.default = indexOf = Array.prototype.indexOf;
} else {
    exports.default = indexOf = function (o) {
        // I know
        var i;
        for (i = 0; i < this.length; ++i) {
            if (this[i] === o) {
                return i;
            }
        }
        return -1;
    };
}

exports.default = indexOf;
},{}],47:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultLocaleMonthsShort = exports.defaultLocaleMonths = undefined;
exports.daysInMonth = daysInMonth;
exports.localeMonths = localeMonths;
exports.localeMonthsShort = localeMonthsShort;
exports.localeMonthsParse = localeMonthsParse;
exports.setMonth = setMonth;
exports.getSetMonth = getSetMonth;
exports.getDaysInMonth = getDaysInMonth;
exports.monthsShortRegex = monthsShortRegex;
exports.monthsRegex = monthsRegex;

var _getSet = require('../moment/get-set');

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _hooks = require('../utils/hooks');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _isArray = require('../utils/is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _isNumber = require('../utils/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _mod = require('../utils/mod');

var _mod2 = _interopRequireDefault(_mod);

var _indexOf = require('../utils/index-of');

var _indexOf2 = _interopRequireDefault(_indexOf);

var _utc = require('../create/utc');

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

var _year = require('../units/year');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function daysInMonth(year, month) {
    if (isNaN(year) || isNaN(month)) {
        return NaN;
    }
    var modMonth = (0, _mod2.default)(month, 12);
    year += (month - modMonth) / 12;
    return modMonth === 1 ? (0, _year.isLeapYear)(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
}

// FORMATTING

(0, _format.addFormatToken)('M', ['MM', 2], 'Mo', function () {
    return this.month() + 1;
});

(0, _format.addFormatToken)('MMM', 0, 0, function (format) {
    return this.localeData().monthsShort(this, format);
});

(0, _format.addFormatToken)('MMMM', 0, 0, function (format) {
    return this.localeData().months(this, format);
});

// ALIASES

(0, _aliases.addUnitAlias)('month', 'M');

// PRIORITY

(0, _priorities.addUnitPriority)('month', 8);

// PARSING

(0, _regex.addRegexToken)('M', _regex.match1to2);
(0, _regex.addRegexToken)('MM', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('MMM', function (isStrict, locale) {
    return locale.monthsShortRegex(isStrict);
});
(0, _regex.addRegexToken)('MMMM', function (isStrict, locale) {
    return locale.monthsRegex(isStrict);
});

(0, _token.addParseToken)(['M', 'MM'], function (input, array) {
    array[_constants.MONTH] = (0, _toInt2.default)(input) - 1;
});

(0, _token.addParseToken)(['MMM', 'MMMM'], function (input, array, config, token) {
    var month = config._locale.monthsParse(input, token, config._strict);
    // if we didn't find a month name, mark the date as invalid.
    if (month != null) {
        array[_constants.MONTH] = month;
    } else {
        (0, _parsingFlags2.default)(config).invalidMonth = input;
    }
});

// LOCALES

var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
var defaultLocaleMonths = exports.defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
function localeMonths(m, format) {
    if (!m) {
        return (0, _isArray2.default)(this._months) ? this._months : this._months['standalone'];
    }
    return (0, _isArray2.default)(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
}

var defaultLocaleMonthsShort = exports.defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
function localeMonthsShort(m, format) {
    if (!m) {
        return (0, _isArray2.default)(this._monthsShort) ? this._monthsShort : this._monthsShort['standalone'];
    }
    return (0, _isArray2.default)(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
}

function handleStrictParse(monthName, format, strict) {
    var i,
        ii,
        mom,
        llc = monthName.toLocaleLowerCase();
    if (!this._monthsParse) {
        // this is not used
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0; i < 12; ++i) {
            mom = (0, _utc.createUTC)([2000, i]);
            this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
            this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'MMM') {
            ii = _indexOf2.default.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = _indexOf2.default.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'MMM') {
            ii = _indexOf2.default.call(this._shortMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = _indexOf2.default.call(this._longMonthsParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeMonthsParse(monthName, format, strict) {
    var i, mom, regex;

    if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format, strict);
    }

    if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
    }

    // TODO: add sorting
    // Sorting makes sure if one month (or abbr) is a prefix of another
    // see sorting in computeMonthsParse
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = (0, _utc.createUTC)([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
            this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
            this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._monthsParse[i]) {
            regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
            this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
            return i;
        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
            return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
            return i;
        }
    }
}

// MOMENTS

function setMonth(mom, value) {
    var dayOfMonth;

    if (!mom.isValid()) {
        // No op
        return mom;
    }

    if (typeof value === 'string') {
        if (/^\d+$/.test(value)) {
            value = (0, _toInt2.default)(value);
        } else {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (!(0, _isNumber2.default)(value)) {
                return mom;
            }
        }
    }

    dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
    mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
    return mom;
}

function getSetMonth(value) {
    if (value != null) {
        setMonth(this, value);
        _hooks.hooks.updateOffset(this, true);
        return this;
    } else {
        return (0, _getSet.get)(this, 'Month');
    }
}

function getDaysInMonth() {
    return daysInMonth(this.year(), this.month());
}

var defaultMonthsShortRegex = _regex.matchWord;
function monthsShortRegex(isStrict) {
    if (this._monthsParseExact) {
        if (!(0, _hasOwnProp2.default)(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsShortStrictRegex;
        } else {
            return this._monthsShortRegex;
        }
    } else {
        if (!(0, _hasOwnProp2.default)(this, '_monthsShortRegex')) {
            this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
    }
}

var defaultMonthsRegex = _regex.matchWord;
function monthsRegex(isStrict) {
    if (this._monthsParseExact) {
        if (!(0, _hasOwnProp2.default)(this, '_monthsRegex')) {
            computeMonthsParse.call(this);
        }
        if (isStrict) {
            return this._monthsStrictRegex;
        } else {
            return this._monthsRegex;
        }
    } else {
        if (!(0, _hasOwnProp2.default)(this, '_monthsRegex')) {
            this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
    }
}

function computeMonthsParse() {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var shortPieces = [],
        longPieces = [],
        mixedPieces = [],
        i,
        mom;
    for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = (0, _utc.createUTC)([2000, i]);
        shortPieces.push(this.monthsShort(mom, ''));
        longPieces.push(this.months(mom, ''));
        mixedPieces.push(this.months(mom, ''));
        mixedPieces.push(this.monthsShort(mom, ''));
    }
    // Sorting makes sure if one month (or abbr) is a prefix of another it
    // will match the longer piece.
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 12; i++) {
        shortPieces[i] = (0, _regex.regexEscape)(shortPieces[i]);
        longPieces[i] = (0, _regex.regexEscape)(longPieces[i]);
    }
    for (i = 0; i < 24; i++) {
        mixedPieces[i] = (0, _regex.regexEscape)(mixedPieces[i]);
    }

    this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._monthsShortRegex = this._monthsRegex;
    this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
}
},{"../moment/get-set":79,"../utils/has-own-prop":61,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"../utils/hooks":15,"./constants":102,"../utils/to-int":88,"../utils/is-array":63,"../utils/is-number":89,"../utils/mod":106,"../utils/index-of":104,"../create/utc":24,"../create/parsing-flags":59,"../units/year":54}],105:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createDate = createDate;
exports.createUTCDate = createUTCDate;
function createDate(y, m, d, h, M, s, ms) {
    // can't just apply() to create a date:
    // https://stackoverflow.com/q/181348
    var date = new Date(y, m, d, h, M, s, ms);

    // the date constructor remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y);
    }
    return date;
}

function createUTCDate(y) {
    var date = new Date(Date.UTC.apply(null, arguments));

    // the Date.UTC function remaps years 0-99 to 1900-1999
    if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
        date.setUTCFullYear(y);
    }
    return date;
}
},{}],107:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dayOfYearFromWeeks = dayOfYearFromWeeks;
exports.weekOfYear = weekOfYear;
exports.weeksInYear = weeksInYear;

var _year = require('./year');

var _local = require('../create/local');

var _dateFromArray = require('../create/date-from-array');

// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
    var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
    fwd = 7 + dow - doy,

    // first-week day local weekday -- which local weekday is fwd
    fwdlw = (7 + (0, _dateFromArray.createUTCDate)(year, 0, fwd).getUTCDay() - dow) % 7;

    return -fwdlw + fwd - 1;
}

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
    var localWeekday = (7 + weekday - dow) % 7,
        weekOffset = firstWeekOffset(year, dow, doy),
        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
        resYear,
        resDayOfYear;

    if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = (0, _year.daysInYear)(resYear) + dayOfYear;
    } else if (dayOfYear > (0, _year.daysInYear)(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - (0, _year.daysInYear)(year);
    } else {
        resYear = year;
        resDayOfYear = dayOfYear;
    }

    return {
        year: resYear,
        dayOfYear: resDayOfYear
    };
}

function weekOfYear(mom, dow, doy) {
    var weekOffset = firstWeekOffset(mom.year(), dow, doy),
        week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
        resWeek,
        resYear;

    if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
    } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
    } else {
        resYear = mom.year();
        resWeek = week;
    }

    return {
        week: resWeek,
        year: resYear
    };
}

function weeksInYear(year, dow, doy) {
    var weekOffset = firstWeekOffset(year, dow, doy),
        weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
    return ((0, _year.daysInYear)(year) - weekOffset + weekOffsetNext) / 7;
}
},{"./year":54,"../create/local":23,"../create/date-from-array":105}],53:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultLocaleWeek = undefined;
exports.localeWeek = localeWeek;
exports.localeFirstDayOfWeek = localeFirstDayOfWeek;
exports.localeFirstDayOfYear = localeFirstDayOfYear;
exports.getSetWeek = getSetWeek;
exports.getSetISOWeek = getSetISOWeek;

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _local = require('../create/local');

var _weekCalendarUtils = require('./week-calendar-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('w', ['ww', 2], 'wo', 'week');
(0, _format.addFormatToken)('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES

(0, _aliases.addUnitAlias)('week', 'w');
(0, _aliases.addUnitAlias)('isoWeek', 'W');

// PRIORITIES

(0, _priorities.addUnitPriority)('week', 5);
(0, _priorities.addUnitPriority)('isoWeek', 5);

// PARSING

(0, _regex.addRegexToken)('w', _regex.match1to2);
(0, _regex.addRegexToken)('ww', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('W', _regex.match1to2);
(0, _regex.addRegexToken)('WW', _regex.match1to2, _regex.match2);

(0, _token.addWeekParseToken)(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
    week[token.substr(0, 1)] = (0, _toInt2.default)(input);
});

// HELPERS

// LOCALES

function localeWeek(mom) {
    return (0, _weekCalendarUtils.weekOfYear)(mom, this._week.dow, this._week.doy).week;
}

var defaultLocaleWeek = exports.defaultLocaleWeek = {
    dow: 0, // Sunday is the first day of the week.
    doy: 6 // The week that contains Jan 1st is the first week of the year.
};

function localeFirstDayOfWeek() {
    return this._week.dow;
}

function localeFirstDayOfYear() {
    return this._week.doy;
}

// MOMENTS

function getSetWeek(input) {
    var week = this.localeData().week(this);
    return input == null ? week : this.add((input - week) * 7, 'd');
}

function getSetISOWeek(input) {
    var week = (0, _weekCalendarUtils.weekOfYear)(this, 1, 4).week;
    return input == null ? week : this.add((input - week) * 7, 'd');
}
},{"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"../utils/to-int":88,"../create/local":23,"./week-calendar-utils":107}],42:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultLocaleWeekdaysMin = exports.defaultLocaleWeekdaysShort = exports.defaultLocaleWeekdays = undefined;
exports.localeWeekdays = localeWeekdays;
exports.localeWeekdaysShort = localeWeekdaysShort;
exports.localeWeekdaysMin = localeWeekdaysMin;
exports.localeWeekdaysParse = localeWeekdaysParse;
exports.getSetDayOfWeek = getSetDayOfWeek;
exports.getSetLocaleDayOfWeek = getSetLocaleDayOfWeek;
exports.getSetISODayOfWeek = getSetISODayOfWeek;
exports.weekdaysRegex = weekdaysRegex;
exports.weekdaysShortRegex = weekdaysShortRegex;
exports.weekdaysMinRegex = weekdaysMinRegex;

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _isArray = require('../utils/is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _indexOf = require('../utils/index-of');

var _indexOf2 = _interopRequireDefault(_indexOf);

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _utc = require('../create/utc');

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('d', 0, 'do', 'day');

(0, _format.addFormatToken)('dd', 0, 0, function (format) {
    return this.localeData().weekdaysMin(this, format);
});

(0, _format.addFormatToken)('ddd', 0, 0, function (format) {
    return this.localeData().weekdaysShort(this, format);
});

(0, _format.addFormatToken)('dddd', 0, 0, function (format) {
    return this.localeData().weekdays(this, format);
});

(0, _format.addFormatToken)('e', 0, 0, 'weekday');
(0, _format.addFormatToken)('E', 0, 0, 'isoWeekday');

// ALIASES

(0, _aliases.addUnitAlias)('day', 'd');
(0, _aliases.addUnitAlias)('weekday', 'e');
(0, _aliases.addUnitAlias)('isoWeekday', 'E');

// PRIORITY
(0, _priorities.addUnitPriority)('day', 11);
(0, _priorities.addUnitPriority)('weekday', 11);
(0, _priorities.addUnitPriority)('isoWeekday', 11);

// PARSING

(0, _regex.addRegexToken)('d', _regex.match1to2);
(0, _regex.addRegexToken)('e', _regex.match1to2);
(0, _regex.addRegexToken)('E', _regex.match1to2);
(0, _regex.addRegexToken)('dd', function (isStrict, locale) {
    return locale.weekdaysMinRegex(isStrict);
});
(0, _regex.addRegexToken)('ddd', function (isStrict, locale) {
    return locale.weekdaysShortRegex(isStrict);
});
(0, _regex.addRegexToken)('dddd', function (isStrict, locale) {
    return locale.weekdaysRegex(isStrict);
});

(0, _token.addWeekParseToken)(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
    var weekday = config._locale.weekdaysParse(input, token, config._strict);
    // if we didn't get a weekday name, mark the date as invalid
    if (weekday != null) {
        week.d = weekday;
    } else {
        (0, _parsingFlags2.default)(config).invalidWeekday = input;
    }
});

(0, _token.addWeekParseToken)(['d', 'e', 'E'], function (input, week, config, token) {
    week[token] = (0, _toInt2.default)(input);
});

// HELPERS

function parseWeekday(input, locale) {
    if (typeof input !== 'string') {
        return input;
    }

    if (!isNaN(input)) {
        return parseInt(input, 10);
    }

    input = locale.weekdaysParse(input);
    if (typeof input === 'number') {
        return input;
    }

    return null;
}

function parseIsoWeekday(input, locale) {
    if (typeof input === 'string') {
        return locale.weekdaysParse(input) % 7 || 7;
    }
    return isNaN(input) ? null : input;
}

// LOCALES

var defaultLocaleWeekdays = exports.defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
function localeWeekdays(m, format) {
    if (!m) {
        return (0, _isArray2.default)(this._weekdays) ? this._weekdays : this._weekdays['standalone'];
    }
    return (0, _isArray2.default)(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
}

var defaultLocaleWeekdaysShort = exports.defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
function localeWeekdaysShort(m) {
    return m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
}

var defaultLocaleWeekdaysMin = exports.defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
function localeWeekdaysMin(m) {
    return m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
}

function handleStrictParse(weekdayName, format, strict) {
    var i,
        ii,
        mom,
        llc = weekdayName.toLocaleLowerCase();
    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];

        for (i = 0; i < 7; ++i) {
            mom = (0, _utc.createUTC)([2000, 1]).day(i);
            this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
            this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
            this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
        }
    }

    if (strict) {
        if (format === 'dddd') {
            ii = _indexOf2.default.call(this._weekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = _indexOf2.default.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = _indexOf2.default.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    } else {
        if (format === 'dddd') {
            ii = _indexOf2.default.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
            ii = _indexOf2.default.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        } else {
            ii = _indexOf2.default.call(this._minWeekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._weekdaysParse, llc);
            if (ii !== -1) {
                return ii;
            }
            ii = _indexOf2.default.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
        }
    }
}

function localeWeekdaysParse(weekdayName, format, strict) {
    var i, mom, regex;

    if (this._weekdaysParseExact) {
        return handleStrictParse.call(this, weekdayName, format, strict);
    }

    if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
    }

    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already

        mom = (0, _utc.createUTC)([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
            this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
            this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
            this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
        }
        if (!this._weekdaysParse[i]) {
            regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
            this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
            return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
            return i;
        }
    }
}

// MOMENTS

function getSetDayOfWeek(input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, 'd');
    } else {
        return day;
    }
}

function getSetLocaleDayOfWeek(input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return input == null ? weekday : this.add(input - weekday, 'd');
}

function getSetISODayOfWeek(input) {
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }

    // behaves the same as moment#day except
    // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
    // as a setter, sunday should belong to the previous week.

    if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
    } else {
        return this.day() || 7;
    }
}

var defaultWeekdaysRegex = _regex.matchWord;
function weekdaysRegex(isStrict) {
    if (this._weekdaysParseExact) {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysStrictRegex;
        } else {
            return this._weekdaysRegex;
        }
    } else {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysRegex')) {
            this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
    }
}

var defaultWeekdaysShortRegex = _regex.matchWord;
function weekdaysShortRegex(isStrict) {
    if (this._weekdaysParseExact) {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysShortStrictRegex;
        } else {
            return this._weekdaysShortRegex;
        }
    } else {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysShortRegex')) {
            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
    }
}

var defaultWeekdaysMinRegex = _regex.matchWord;
function weekdaysMinRegex(isStrict) {
    if (this._weekdaysParseExact) {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysRegex')) {
            computeWeekdaysParse.call(this);
        }
        if (isStrict) {
            return this._weekdaysMinStrictRegex;
        } else {
            return this._weekdaysMinRegex;
        }
    } else {
        if (!(0, _hasOwnProp2.default)(this, '_weekdaysMinRegex')) {
            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
    }
}

function computeWeekdaysParse() {
    function cmpLenRev(a, b) {
        return b.length - a.length;
    }

    var minPieces = [],
        shortPieces = [],
        longPieces = [],
        mixedPieces = [],
        i,
        mom,
        minp,
        shortp,
        longp;
    for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        mom = (0, _utc.createUTC)([2000, 1]).day(i);
        minp = this.weekdaysMin(mom, '');
        shortp = this.weekdaysShort(mom, '');
        longp = this.weekdays(mom, '');
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
    }
    // Sorting makes sure if one weekday (or abbr) is a prefix of another it
    // will match the longer piece.
    minPieces.sort(cmpLenRev);
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 7; i++) {
        shortPieces[i] = (0, _regex.regexEscape)(shortPieces[i]);
        longPieces[i] = (0, _regex.regexEscape)(longPieces[i]);
        mixedPieces[i] = (0, _regex.regexEscape)(mixedPieces[i]);
    }

    this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
    this._weekdaysShortRegex = this._weekdaysRegex;
    this._weekdaysMinRegex = this._weekdaysRegex;

    this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
    this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
}
},{"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"../utils/to-int":88,"../utils/is-array":63,"../utils/index-of":104,"../utils/has-own-prop":61,"../create/utc":24,"../create/parsing-flags":59}],44:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetHour = exports.defaultLocaleMeridiemParse = undefined;
exports.localeIsPM = localeIsPM;
exports.localeMeridiem = localeMeridiem;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _zeroFill = require('../utils/zero-fill');

var _zeroFill2 = _interopRequireDefault(_zeroFill);

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

function hFormat() {
    return this.hours() % 12 || 12;
}

function kFormat() {
    return this.hours() || 24;
}

(0, _format.addFormatToken)('H', ['HH', 2], 0, 'hour');
(0, _format.addFormatToken)('h', ['hh', 2], 0, hFormat);
(0, _format.addFormatToken)('k', ['kk', 2], 0, kFormat);

(0, _format.addFormatToken)('hmm', 0, 0, function () {
    return '' + hFormat.apply(this) + (0, _zeroFill2.default)(this.minutes(), 2);
});

(0, _format.addFormatToken)('hmmss', 0, 0, function () {
    return '' + hFormat.apply(this) + (0, _zeroFill2.default)(this.minutes(), 2) + (0, _zeroFill2.default)(this.seconds(), 2);
});

(0, _format.addFormatToken)('Hmm', 0, 0, function () {
    return '' + this.hours() + (0, _zeroFill2.default)(this.minutes(), 2);
});

(0, _format.addFormatToken)('Hmmss', 0, 0, function () {
    return '' + this.hours() + (0, _zeroFill2.default)(this.minutes(), 2) + (0, _zeroFill2.default)(this.seconds(), 2);
});

function meridiem(token, lowercase) {
    (0, _format.addFormatToken)(token, 0, 0, function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
    });
}

meridiem('a', true);
meridiem('A', false);

// ALIASES

(0, _aliases.addUnitAlias)('hour', 'h');

// PRIORITY
(0, _priorities.addUnitPriority)('hour', 13);

// PARSING

function matchMeridiem(isStrict, locale) {
    return locale._meridiemParse;
}

(0, _regex.addRegexToken)('a', matchMeridiem);
(0, _regex.addRegexToken)('A', matchMeridiem);
(0, _regex.addRegexToken)('H', _regex.match1to2);
(0, _regex.addRegexToken)('h', _regex.match1to2);
(0, _regex.addRegexToken)('k', _regex.match1to2);
(0, _regex.addRegexToken)('HH', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('hh', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('kk', _regex.match1to2, _regex.match2);

(0, _regex.addRegexToken)('hmm', _regex.match3to4);
(0, _regex.addRegexToken)('hmmss', _regex.match5to6);
(0, _regex.addRegexToken)('Hmm', _regex.match3to4);
(0, _regex.addRegexToken)('Hmmss', _regex.match5to6);

(0, _token.addParseToken)(['H', 'HH'], _constants.HOUR);
(0, _token.addParseToken)(['k', 'kk'], function (input, array, config) {
    var kInput = (0, _toInt2.default)(input);
    array[_constants.HOUR] = kInput === 24 ? 0 : kInput;
});
(0, _token.addParseToken)(['a', 'A'], function (input, array, config) {
    config._isPm = config._locale.isPM(input);
    config._meridiem = input;
});
(0, _token.addParseToken)(['h', 'hh'], function (input, array, config) {
    array[_constants.HOUR] = (0, _toInt2.default)(input);
    (0, _parsingFlags2.default)(config).bigHour = true;
});
(0, _token.addParseToken)('hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[_constants.HOUR] = (0, _toInt2.default)(input.substr(0, pos));
    array[_constants.MINUTE] = (0, _toInt2.default)(input.substr(pos));
    (0, _parsingFlags2.default)(config).bigHour = true;
});
(0, _token.addParseToken)('hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[_constants.HOUR] = (0, _toInt2.default)(input.substr(0, pos1));
    array[_constants.MINUTE] = (0, _toInt2.default)(input.substr(pos1, 2));
    array[_constants.SECOND] = (0, _toInt2.default)(input.substr(pos2));
    (0, _parsingFlags2.default)(config).bigHour = true;
});
(0, _token.addParseToken)('Hmm', function (input, array, config) {
    var pos = input.length - 2;
    array[_constants.HOUR] = (0, _toInt2.default)(input.substr(0, pos));
    array[_constants.MINUTE] = (0, _toInt2.default)(input.substr(pos));
});
(0, _token.addParseToken)('Hmmss', function (input, array, config) {
    var pos1 = input.length - 4;
    var pos2 = input.length - 2;
    array[_constants.HOUR] = (0, _toInt2.default)(input.substr(0, pos1));
    array[_constants.MINUTE] = (0, _toInt2.default)(input.substr(pos1, 2));
    array[_constants.SECOND] = (0, _toInt2.default)(input.substr(pos2));
});

// LOCALES

function localeIsPM(input) {
    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
    // Using charAt should be more compatible.
    return (input + '').toLowerCase().charAt(0) === 'p';
}

var defaultLocaleMeridiemParse = exports.defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
function localeMeridiem(hours, minutes, isLower) {
    if (hours > 11) {
        return isLower ? 'pm' : 'PM';
    } else {
        return isLower ? 'am' : 'AM';
    }
}

// MOMENTS

// Setting the hour should keep the time, because the user explicitly
// specified which hour they want. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
var getSetHour = exports.getSetHour = (0, _getSet.makeGetSet)('Hours', true);
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102,"../utils/to-int":88,"../utils/zero-fill":90,"../create/parsing-flags":59}],87:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.baseConfig = undefined;

var _calendar = require('./calendar');

var _formats = require('./formats');

var _invalid = require('./invalid');

var _ordinal = require('./ordinal');

var _relative = require('./relative');

var _month = require('../units/month');

var _week = require('../units/week');

var _dayOfWeek = require('../units/day-of-week');

var _hour = require('../units/hour');

// weekdays


// months
var baseConfig = exports.baseConfig = {
    calendar: _calendar.defaultCalendar,
    longDateFormat: _formats.defaultLongDateFormat,
    invalidDate: _invalid.defaultInvalidDate,
    ordinal: _ordinal.defaultOrdinal,
    dayOfMonthOrdinalParse: _ordinal.defaultDayOfMonthOrdinalParse,
    relativeTime: _relative.defaultRelativeTime,

    months: _month.defaultLocaleMonths,
    monthsShort: _month.defaultLocaleMonthsShort,

    week: _week.defaultLocaleWeek,

    weekdays: _dayOfWeek.defaultLocaleWeekdays,
    weekdaysMin: _dayOfWeek.defaultLocaleWeekdaysMin,
    weekdaysShort: _dayOfWeek.defaultLocaleWeekdaysShort,

    meridiemParse: _hour.defaultLocaleMeridiemParse
};

// meridiem


// week
},{"./calendar":65,"./formats":66,"./invalid":68,"./ordinal":67,"./relative":71,"../units/month":47,"../units/week":53,"../units/day-of-week":42,"../units/hour":44}],31:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetGlobalLocale = getSetGlobalLocale;
exports.defineLocale = defineLocale;
exports.updateLocale = updateLocale;
exports.getLocale = getLocale;
exports.listLocales = listLocales;

var _isArray = require('../utils/is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _isUndefined = require('../utils/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _compareArrays = require('../utils/compare-arrays');

var _compareArrays2 = _interopRequireDefault(_compareArrays);

var _deprecate = require('../utils/deprecate');

var _set = require('./set');

var _constructor = require('./constructor');

var _keys = require('../utils/keys');

var _keys2 = _interopRequireDefault(_keys);

var _baseConfig = require('./base-config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// internal storage for locale config files
var locales = {};
var localeFamilies = {};
var globalLocale;

function normalizeLocale(key) {
    return key ? key.toLowerCase().replace('_', '-') : key;
}

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function chooseLocale(names) {
    var i = 0,
        j,
        next,
        locale,
        split;

    while (i < names.length) {
        split = normalizeLocale(names[i]).split('-');
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split('-') : null;
        while (j > 0) {
            locale = loadLocale(split.slice(0, j).join('-'));
            if (locale) {
                return locale;
            }
            if (next && next.length >= j && (0, _compareArrays2.default)(split, next, true) >= j - 1) {
                //the next array item is better than a shallower substring of this one
                break;
            }
            j--;
        }
        i++;
    }
    return globalLocale;
}

function loadLocale(name) {
    var oldLocale = null;
    // TODO: Find a better way to register and load all the locales in Node
    if (!locales[name] && typeof module !== 'undefined' && module && module.exports) {
        try {
            oldLocale = globalLocale._abbr;
            var aliasedRequire = require;
            aliasedRequire('./locale/' + name);
            getSetGlobalLocale(oldLocale);
        } catch (e) {}
    }
    return locales[name];
}

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function getSetGlobalLocale(key, values) {
    var data;
    if (key) {
        if ((0, _isUndefined2.default)(values)) {
            data = getLocale(key);
        } else {
            data = defineLocale(key, values);
        }

        if (data) {
            // moment.duration._locale = moment._locale = data;
            globalLocale = data;
        } else {
            if (typeof console !== 'undefined' && console.warn) {
                //warn user if arguments are passed but the locale could not be set
                console.warn('Locale ' + key + ' not found. Did you forget to load it?');
            }
        }
    }

    return globalLocale._abbr;
}

function defineLocale(name, config) {
    if (config !== null) {
        var locale,
            parentConfig = _baseConfig.baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
            (0, _deprecate.deprecateSimple)('defineLocaleOverride', 'use moment.updateLocale(localeName, config) to change ' + 'an existing locale. moment.defineLocale(localeName, ' + 'config) should only be used for creating a new locale ' + 'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
            parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
            if (locales[config.parentLocale] != null) {
                parentConfig = locales[config.parentLocale]._config;
            } else {
                locale = loadLocale(config.parentLocale);
                if (locale != null) {
                    parentConfig = locale._config;
                } else {
                    if (!localeFamilies[config.parentLocale]) {
                        localeFamilies[config.parentLocale] = [];
                    }
                    localeFamilies[config.parentLocale].push({
                        name: name,
                        config: config
                    });
                    return null;
                }
            }
        }
        locales[name] = new _constructor.Locale((0, _set.mergeConfigs)(parentConfig, config));

        if (localeFamilies[name]) {
            localeFamilies[name].forEach(function (x) {
                defineLocale(x.name, x.config);
            });
        }

        // backwards compat for now: also set the locale
        // make sure we set the locale AFTER all child locales have been
        // created, so we won't end up with the child locale set.
        getSetGlobalLocale(name);

        return locales[name];
    } else {
        // useful for testing
        delete locales[name];
        return null;
    }
}

function updateLocale(name, config) {
    if (config != null) {
        var locale,
            tmpLocale,
            parentConfig = _baseConfig.baseConfig;
        // MERGE
        tmpLocale = loadLocale(name);
        if (tmpLocale != null) {
            parentConfig = tmpLocale._config;
        }
        config = (0, _set.mergeConfigs)(parentConfig, config);
        locale = new _constructor.Locale(config);
        locale.parentLocale = locales[name];
        locales[name] = locale;

        // backwards compat for now: also set the locale
        getSetGlobalLocale(name);
    } else {
        // pass null for config to unupdate, useful for tests
        if (locales[name] != null) {
            if (locales[name].parentLocale != null) {
                locales[name] = locales[name].parentLocale;
            } else if (locales[name] != null) {
                delete locales[name];
            }
        }
    }
    return locales[name];
}

// returns locale data
function getLocale(key) {
    var locale;

    if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
    }

    if (!key) {
        return globalLocale;
    }

    if (!(0, _isArray2.default)(key)) {
        //short-circuit everything else
        locale = loadLocale(key);
        if (locale) {
            return locale;
        }
        key = [key];
    }

    return chooseLocale(key);
}

function listLocales() {
    return (0, _keys2.default)(locales);
}
},{"../utils/is-array":63,"../utils/has-own-prop":61,"../utils/is-undefined":62,"../utils/compare-arrays":85,"../utils/deprecate":33,"./set":70,"./constructor":64,"../utils/keys":86,"./base-config":87}],111:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = checkOverflow;

var _month = require('../units/month');

var _constants = require('../units/constants');

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkOverflow(m) {
    var overflow;
    var a = m._a;

    if (a && (0, _parsingFlags2.default)(m).overflow === -2) {
        overflow = a[_constants.MONTH] < 0 || a[_constants.MONTH] > 11 ? _constants.MONTH : a[_constants.DATE] < 1 || a[_constants.DATE] > (0, _month.daysInMonth)(a[_constants.YEAR], a[_constants.MONTH]) ? _constants.DATE : a[_constants.HOUR] < 0 || a[_constants.HOUR] > 24 || a[_constants.HOUR] === 24 && (a[_constants.MINUTE] !== 0 || a[_constants.SECOND] !== 0 || a[_constants.MILLISECOND] !== 0) ? _constants.HOUR : a[_constants.MINUTE] < 0 || a[_constants.MINUTE] > 59 ? _constants.MINUTE : a[_constants.SECOND] < 0 || a[_constants.SECOND] > 59 ? _constants.SECOND : a[_constants.MILLISECOND] < 0 || a[_constants.MILLISECOND] > 999 ? _constants.MILLISECOND : -1;

        if ((0, _parsingFlags2.default)(m)._overflowDayOfYear && (overflow < _constants.YEAR || overflow > _constants.DATE)) {
            overflow = _constants.DATE;
        }
        if ((0, _parsingFlags2.default)(m)._overflowWeeks && overflow === -1) {
            overflow = _constants.WEEK;
        }
        if ((0, _parsingFlags2.default)(m)._overflowWeekday && overflow === -1) {
            overflow = _constants.WEEKDAY;
        }

        (0, _parsingFlags2.default)(m).overflow = overflow;
    }

    return m;
}
},{"../units/month":47,"../units/constants":102,"../create/parsing-flags":59}],119:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = defaults;
// Pick the first defined of two or three arguments.
function defaults(a, b, c) {
    if (a != null) {
        return a;
    }
    if (b != null) {
        return b;
    }
    return c;
}
},{}],115:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configFromArray = configFromArray;

var _hooks = require('../utils/hooks');

var _dateFromArray = require('./date-from-array');

var _year = require('../units/year');

var _weekCalendarUtils = require('../units/week-calendar-utils');

var _constants = require('../units/constants');

var _local = require('./local');

var _defaults = require('../utils/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _parsingFlags = require('./parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function currentDateArray(config) {
    // hooks is actually the exported moment object
    var nowValue = new Date(_hooks.hooks.now());
    if (config._useUTC) {
        return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
    }
    return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
}

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function configFromArray(config) {
    var i,
        date,
        input = [],
        currentDate,
        expectedWeekday,
        yearToUse;

    if (config._d) {
        return;
    }

    currentDate = currentDateArray(config);

    //compute day of the year from weeks and weekdays
    if (config._w && config._a[_constants.DATE] == null && config._a[_constants.MONTH] == null) {
        dayOfYearFromWeekInfo(config);
    }

    //if the day of the year is set, figure out what it is
    if (config._dayOfYear != null) {
        yearToUse = (0, _defaults2.default)(config._a[_constants.YEAR], currentDate[_constants.YEAR]);

        if (config._dayOfYear > (0, _year.daysInYear)(yearToUse) || config._dayOfYear === 0) {
            (0, _parsingFlags2.default)(config)._overflowDayOfYear = true;
        }

        date = (0, _dateFromArray.createUTCDate)(yearToUse, 0, config._dayOfYear);
        config._a[_constants.MONTH] = date.getUTCMonth();
        config._a[_constants.DATE] = date.getUTCDate();
    }

    // Default to current date.
    // * if no year, month, day of month are given, default to today
    // * if day of month is given, default month and year
    // * if month is given, default only year
    // * if year is given, don't default anything
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
    }

    // Zero out whatever was not defaulted, including time
    for (; i < 7; i++) {
        config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
    }

    // Check for 24:00:00.000
    if (config._a[_constants.HOUR] === 24 && config._a[_constants.MINUTE] === 0 && config._a[_constants.SECOND] === 0 && config._a[_constants.MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[_constants.HOUR] = 0;
    }

    config._d = (config._useUTC ? _dateFromArray.createUTCDate : _dateFromArray.createDate).apply(null, input);
    expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

    // Apply timezone offset from input. The actual utcOffset can be changed
    // with parseZone.
    if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
    }

    if (config._nextDay) {
        config._a[_constants.HOUR] = 24;
    }

    // check for mismatching day of week
    if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
        (0, _parsingFlags2.default)(config).weekdayMismatch = true;
    }
}

function dayOfYearFromWeekInfo(config) {
    var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

    w = config._w;
    if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;

        // TODO: We need to take the current isoWeekYear, but that depends on
        // how we interpret now (local, utc, fixed offset). So create
        // a now version of current config (take local/utc/offset flags, and
        // create now).
        weekYear = (0, _defaults2.default)(w.GG, config._a[_constants.YEAR], (0, _weekCalendarUtils.weekOfYear)((0, _local.createLocal)(), 1, 4).year);
        week = (0, _defaults2.default)(w.W, 1);
        weekday = (0, _defaults2.default)(w.E, 1);
        if (weekday < 1 || weekday > 7) {
            weekdayOverflow = true;
        }
    } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;

        var curWeek = (0, _weekCalendarUtils.weekOfYear)((0, _local.createLocal)(), dow, doy);

        weekYear = (0, _defaults2.default)(w.gg, config._a[_constants.YEAR], curWeek.year);

        // Default to current week.
        week = (0, _defaults2.default)(w.w, curWeek.week);

        if (w.d != null) {
            // weekday -- low day numbers are considered next week
            weekday = w.d;
            if (weekday < 0 || weekday > 6) {
                weekdayOverflow = true;
            }
        } else if (w.e != null) {
            // local weekday -- counting starts from begining of week
            weekday = w.e + dow;
            if (w.e < 0 || w.e > 6) {
                weekdayOverflow = true;
            }
        } else {
            // default to begining of week
            weekday = dow;
        }
    }
    if (week < 1 || week > (0, _weekCalendarUtils.weeksInYear)(weekYear, dow, doy)) {
        (0, _parsingFlags2.default)(config)._overflowWeeks = true;
    } else if (weekdayOverflow != null) {
        (0, _parsingFlags2.default)(config)._overflowWeekday = true;
    } else {
        temp = (0, _weekCalendarUtils.dayOfYearFromWeeks)(weekYear, week, weekday, dow, doy);
        config._a[_constants.YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }
}
},{"../utils/hooks":15,"./date-from-array":105,"../units/year":54,"../units/week-calendar-utils":107,"../units/constants":102,"./local":23,"../utils/defaults":119,"./parsing-flags":59}],114:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configFromISO = configFromISO;
exports.configFromRFC2822 = configFromRFC2822;
exports.configFromString = configFromString;

var _fromStringAndFormat = require('./from-string-and-format');

var _dateFromArray = require('./date-from-array');

var _fromArray = require('./from-array');

var _hooks = require('../utils/hooks');

var _deprecate = require('../utils/deprecate');

var _parsingFlags = require('./parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

var _month = require('../units/month');

var _dayOfWeek = require('../units/day-of-week');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

var isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/], ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/], ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/], ['GGGG-[W]WW', /\d{4}-W\d\d/, false], ['YYYY-DDD', /\d{4}-\d{3}/], ['YYYY-MM', /\d{4}-\d\d/, false], ['YYYYYYMMDD', /[+-]\d{10}/], ['YYYYMMDD', /\d{8}/],
// YYYYMM is NOT allowed by the standard
['GGGG[W]WWE', /\d{4}W\d{3}/], ['GGGG[W]WW', /\d{4}W\d{2}/, false], ['YYYYDDD', /\d{7}/]];

// iso time formats and regexes
var isoTimes = [['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/], ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/], ['HH:mm:ss', /\d\d:\d\d:\d\d/], ['HH:mm', /\d\d:\d\d/], ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/], ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/], ['HHmmss', /\d\d\d\d\d\d/], ['HHmm', /\d\d\d\d/], ['HH', /\d\d/]];

var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
function configFromISO(config) {
    var i,
        l,
        string = config._i,
        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
        allowTime,
        dateFormat,
        timeFormat,
        tzFormat;

    if (match) {
        (0, _parsingFlags2.default)(config).iso = true;

        for (i = 0, l = isoDates.length; i < l; i++) {
            if (isoDates[i][1].exec(match[1])) {
                dateFormat = isoDates[i][0];
                allowTime = isoDates[i][2] !== false;
                break;
            }
        }
        if (dateFormat == null) {
            config._isValid = false;
            return;
        }
        if (match[3]) {
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(match[3])) {
                    // match[2] should be 'T' or space
                    timeFormat = (match[2] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (timeFormat == null) {
                config._isValid = false;
                return;
            }
        }
        if (!allowTime && timeFormat != null) {
            config._isValid = false;
            return;
        }
        if (match[4]) {
            if (tzRegex.exec(match[4])) {
                tzFormat = 'Z';
            } else {
                config._isValid = false;
                return;
            }
        }
        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
        (0, _fromStringAndFormat.configFromStringAndFormat)(config);
    } else {
        config._isValid = false;
    }
}

// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
    var result = [untruncateYear(yearStr), _month.defaultLocaleMonthsShort.indexOf(monthStr), parseInt(dayStr, 10), parseInt(hourStr, 10), parseInt(minuteStr, 10)];

    if (secondStr) {
        result.push(parseInt(secondStr, 10));
    }

    return result;
}

function untruncateYear(yearStr) {
    var year = parseInt(yearStr, 10);
    if (year <= 49) {
        return 2000 + year;
    } else if (year <= 999) {
        return 1900 + year;
    }
    return year;
}

function preprocessRFC2822(s) {
    // Remove comments and folding whitespace and replace multiple-spaces with a single space
    return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').trim();
}

function checkWeekday(weekdayStr, parsedInput, config) {
    if (weekdayStr) {
        // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
        var weekdayProvided = _dayOfWeek.defaultLocaleWeekdaysShort.indexOf(weekdayStr),
            weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
        if (weekdayProvided !== weekdayActual) {
            (0, _parsingFlags2.default)(config).weekdayMismatch = true;
            config._isValid = false;
            return false;
        }
    }
    return true;
}

var obsOffsets = {
    UT: 0,
    GMT: 0,
    EDT: -4 * 60,
    EST: -5 * 60,
    CDT: -5 * 60,
    CST: -6 * 60,
    MDT: -6 * 60,
    MST: -7 * 60,
    PDT: -7 * 60,
    PST: -8 * 60
};

function calculateOffset(obsOffset, militaryOffset, numOffset) {
    if (obsOffset) {
        return obsOffsets[obsOffset];
    } else if (militaryOffset) {
        // the only allowed military tz is Z
        return 0;
    } else {
        var hm = parseInt(numOffset, 10);
        var m = hm % 100,
            h = (hm - m) / 100;
        return h * 60 + m;
    }
}

// date and time from ref 2822 format
function configFromRFC2822(config) {
    var match = rfc2822.exec(preprocessRFC2822(config._i));
    if (match) {
        var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
        if (!checkWeekday(match[1], parsedArray, config)) {
            return;
        }

        config._a = parsedArray;
        config._tzm = calculateOffset(match[8], match[9], match[10]);

        config._d = _dateFromArray.createUTCDate.apply(null, config._a);
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

        (0, _parsingFlags2.default)(config).rfc2822 = true;
    } else {
        config._isValid = false;
    }
}

// date from iso format or fallback
function configFromString(config) {
    var matched = aspNetJsonRegex.exec(config._i);

    if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
    }

    configFromISO(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    configFromRFC2822(config);
    if (config._isValid === false) {
        delete config._isValid;
    } else {
        return;
    }

    // Final attempt, use Input Fallback
    _hooks.hooks.createFromInputFallback(config);
}

_hooks.hooks.createFromInputFallback = (0, _deprecate.deprecate)('value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' + 'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' + 'discouraged and will be removed in an upcoming major release. Please refer to ' + 'http://momentjs.com/guides/#/warnings/js-date/ for more info.', function (config) {
    config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
});
},{"./from-string-and-format":113,"./date-from-array":105,"./from-array":115,"../utils/hooks":15,"../utils/deprecate":33,"./parsing-flags":59,"../units/month":47,"../units/day-of-week":42}],113:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configFromStringAndFormat = configFromStringAndFormat;

var _fromString = require('./from-string');

var _fromArray = require('./from-array');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _format = require('../format/format');

var _checkOverflow = require('./check-overflow');

var _checkOverflow2 = _interopRequireDefault(_checkOverflow);

var _constants = require('../units/constants');

var _hooks = require('../utils/hooks');

var _parsingFlags = require('./parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// constant that refers to the ISO standard
_hooks.hooks.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
_hooks.hooks.RFC_2822 = function () {};

// date from string and format string
function configFromStringAndFormat(config) {
    // TODO: Move this to another part of the creation flow to prevent circular deps
    if (config._f === _hooks.hooks.ISO_8601) {
        (0, _fromString.configFromISO)(config);
        return;
    }
    if (config._f === _hooks.hooks.RFC_2822) {
        (0, _fromString.configFromRFC2822)(config);
        return;
    }
    config._a = [];
    (0, _parsingFlags2.default)(config).empty = true;

    // This array is used to make a Date, either with `new Date` or `Date.UTC`
    var string = '' + config._i,
        i,
        parsedInput,
        tokens,
        token,
        skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;

    tokens = (0, _format.expandFormat)(config._f, config._locale).match(_format.formattingTokens) || [];

    for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        parsedInput = (string.match((0, _regex.getParseRegexForToken)(token, config)) || [])[0];
        // console.log('token', token, 'parsedInput', parsedInput,
        //         'regex', getParseRegexForToken(token, config));
        if (parsedInput) {
            skipped = string.substr(0, string.indexOf(parsedInput));
            if (skipped.length > 0) {
                (0, _parsingFlags2.default)(config).unusedInput.push(skipped);
            }
            string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            totalParsedInputLength += parsedInput.length;
        }
        // don't parse if it's not a known token
        if (_format.formatTokenFunctions[token]) {
            if (parsedInput) {
                (0, _parsingFlags2.default)(config).empty = false;
            } else {
                (0, _parsingFlags2.default)(config).unusedTokens.push(token);
            }
            (0, _token.addTimeToArrayFromToken)(token, parsedInput, config);
        } else if (config._strict && !parsedInput) {
            (0, _parsingFlags2.default)(config).unusedTokens.push(token);
        }
    }

    // add remaining unparsed input length to the string
    (0, _parsingFlags2.default)(config).charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
        (0, _parsingFlags2.default)(config).unusedInput.push(string);
    }

    // clear _12h flag if hour is <= 12
    if (config._a[_constants.HOUR] <= 12 && (0, _parsingFlags2.default)(config).bigHour === true && config._a[_constants.HOUR] > 0) {
        (0, _parsingFlags2.default)(config).bigHour = undefined;
    }

    (0, _parsingFlags2.default)(config).parsedDateParts = config._a.slice(0);
    (0, _parsingFlags2.default)(config).meridiem = config._meridiem;
    // handle meridiem
    config._a[_constants.HOUR] = meridiemFixWrap(config._locale, config._a[_constants.HOUR], config._meridiem);

    (0, _fromArray.configFromArray)(config);
    (0, _checkOverflow2.default)(config);
}

function meridiemFixWrap(locale, hour, meridiem) {
    var isPm;

    if (meridiem == null) {
        // nothing to do
        return hour;
    }
    if (locale.meridiemHour != null) {
        return locale.meridiemHour(hour, meridiem);
    } else if (locale.isPM != null) {
        // Fallback
        isPm = locale.isPM(meridiem);
        if (isPm && hour < 12) {
            hour += 12;
        }
        if (!isPm && hour === 12) {
            hour = 0;
        }
        return hour;
    } else {
        // this is not supposed to happen
        return hour;
    }
}
},{"./from-string":114,"./from-array":115,"../parse/regex":92,"../parse/token":93,"../format/format":91,"./check-overflow":111,"../units/constants":102,"../utils/hooks":15,"./parsing-flags":59}],112:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configFromStringAndArray = configFromStringAndArray;

var _constructor = require('../moment/constructor');

var _fromStringAndFormat = require('./from-string-and-format');

var _parsingFlags = require('./parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

var _valid = require('./valid');

var _extend = require('../utils/extend');

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// date from string and array of format strings
function configFromStringAndArray(config) {
    var tempConfig, bestMoment, scoreToBeat, i, currentScore;

    if (config._f.length === 0) {
        (0, _parsingFlags2.default)(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
    }

    for (i = 0; i < config._f.length; i++) {
        currentScore = 0;
        tempConfig = (0, _constructor.copyConfig)({}, config);
        if (config._useUTC != null) {
            tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        (0, _fromStringAndFormat.configFromStringAndFormat)(tempConfig);

        if (!(0, _valid.isValid)(tempConfig)) {
            continue;
        }

        // if there is any input that was not parsed add a penalty for that format
        currentScore += (0, _parsingFlags2.default)(tempConfig).charsLeftOver;

        //or tokens
        currentScore += (0, _parsingFlags2.default)(tempConfig).unusedTokens.length * 10;

        (0, _parsingFlags2.default)(tempConfig).score = currentScore;

        if (scoreToBeat == null || currentScore < scoreToBeat) {
            scoreToBeat = currentScore;
            bestMoment = tempConfig;
        }
    }

    (0, _extend2.default)(config, bestMoment || tempConfig);
}
},{"../moment/constructor":26,"./from-string-and-format":113,"./parsing-flags":59,"./valid":25,"../utils/extend":58}],116:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configFromObject = configFromObject;

var _aliases = require('../units/aliases');

var _fromArray = require('./from-array');

var _map = require('../utils/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function configFromObject(config) {
    if (config._d) {
        return;
    }

    var i = (0, _aliases.normalizeObjectUnits)(config._i);
    config._a = (0, _map2.default)([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
        return obj && parseInt(obj, 10);
    });

    (0, _fromArray.configFromArray)(config);
}
},{"../units/aliases":55,"./from-array":115,"../utils/map":110}],57:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.prepareConfig = prepareConfig;
exports.createLocalOrUTC = createLocalOrUTC;

var _isArray = require('../utils/is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _isObject = require('../utils/is-object');

var _isObject2 = _interopRequireDefault(_isObject);

var _isObjectEmpty = require('../utils/is-object-empty');

var _isObjectEmpty2 = _interopRequireDefault(_isObjectEmpty);

var _isUndefined = require('../utils/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isNumber = require('../utils/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isDate = require('../utils/is-date');

var _isDate2 = _interopRequireDefault(_isDate);

var _map = require('../utils/map');

var _map2 = _interopRequireDefault(_map);

var _valid = require('./valid');

var _constructor = require('../moment/constructor');

var _locales = require('../locale/locales');

var _hooks = require('../utils/hooks');

var _checkOverflow = require('./check-overflow');

var _checkOverflow2 = _interopRequireDefault(_checkOverflow);

var _fromStringAndArray = require('./from-string-and-array');

var _fromStringAndFormat = require('./from-string-and-format');

var _fromString = require('./from-string');

var _fromArray = require('./from-array');

var _fromObject = require('./from-object');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createFromConfig(config) {
    var res = new _constructor.Moment((0, _checkOverflow2.default)(prepareConfig(config)));
    if (res._nextDay) {
        // Adding is smart enough around DST
        res.add(1, 'd');
        res._nextDay = undefined;
    }

    return res;
}

function prepareConfig(config) {
    var input = config._i,
        format = config._f;

    config._locale = config._locale || (0, _locales.getLocale)(config._l);

    if (input === null || format === undefined && input === '') {
        return (0, _valid.createInvalid)({ nullInput: true });
    }

    if (typeof input === 'string') {
        config._i = input = config._locale.preparse(input);
    }

    if ((0, _constructor.isMoment)(input)) {
        return new _constructor.Moment((0, _checkOverflow2.default)(input));
    } else if ((0, _isDate2.default)(input)) {
        config._d = input;
    } else if ((0, _isArray2.default)(format)) {
        (0, _fromStringAndArray.configFromStringAndArray)(config);
    } else if (format) {
        (0, _fromStringAndFormat.configFromStringAndFormat)(config);
    } else {
        configFromInput(config);
    }

    if (!(0, _valid.isValid)(config)) {
        config._d = null;
    }

    return config;
}

function configFromInput(config) {
    var input = config._i;
    if ((0, _isUndefined2.default)(input)) {
        config._d = new Date(_hooks.hooks.now());
    } else if ((0, _isDate2.default)(input)) {
        config._d = new Date(input.valueOf());
    } else if (typeof input === 'string') {
        (0, _fromString.configFromString)(config);
    } else if ((0, _isArray2.default)(input)) {
        config._a = (0, _map2.default)(input.slice(0), function (obj) {
            return parseInt(obj, 10);
        });
        (0, _fromArray.configFromArray)(config);
    } else if ((0, _isObject2.default)(input)) {
        (0, _fromObject.configFromObject)(config);
    } else if ((0, _isNumber2.default)(input)) {
        // from milliseconds
        config._d = new Date(input);
    } else {
        _hooks.hooks.createFromInputFallback(config);
    }
}

function createLocalOrUTC(input, format, locale, strict, isUTC) {
    var c = {};

    if (locale === true || locale === false) {
        strict = locale;
        locale = undefined;
    }

    if ((0, _isObject2.default)(input) && (0, _isObjectEmpty2.default)(input) || (0, _isArray2.default)(input) && input.length === 0) {
        input = undefined;
    }
    // object construction must be done this way.
    // https://github.com/moment/moment/issues/1423
    c._isAMomentObject = true;
    c._useUTC = c._isUTC = isUTC;
    c._l = locale;
    c._i = input;
    c._f = format;
    c._strict = strict;

    return createFromConfig(c);
}
},{"../utils/is-array":63,"../utils/is-object":108,"../utils/is-object-empty":109,"../utils/is-undefined":62,"../utils/is-number":89,"../utils/is-date":21,"../utils/map":110,"./valid":25,"../moment/constructor":26,"../locale/locales":31,"../utils/hooks":15,"./check-overflow":111,"./from-string-and-array":112,"./from-string-and-format":113,"./from-string":114,"./from-array":115,"./from-object":116}],23:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createLocal = createLocal;

var _fromAnything = require('./from-anything');

function createLocal(input, format, locale, strict) {
    return (0, _fromAnything.createLocalOrUTC)(input, format, locale, strict, false);
}
},{"./from-anything":57}],27:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.prototypeMax = exports.prototypeMin = undefined;
exports.min = min;
exports.max = max;

var _deprecate = require('../utils/deprecate');

var _isArray = require('../utils/is-array');

var _isArray2 = _interopRequireDefault(_isArray);

var _local = require('../create/local');

var _valid = require('../create/valid');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prototypeMin = exports.prototypeMin = (0, _deprecate.deprecate)('moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/', function () {
    var other = _local.createLocal.apply(null, arguments);
    if (this.isValid() && other.isValid()) {
        return other < this ? this : other;
    } else {
        return (0, _valid.createInvalid)();
    }
});

var prototypeMax = exports.prototypeMax = (0, _deprecate.deprecate)('moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/', function () {
    var other = _local.createLocal.apply(null, arguments);
    if (this.isValid() && other.isValid()) {
        return other > this ? this : other;
    } else {
        return (0, _valid.createInvalid)();
    }
});

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function pickBy(fn, moments) {
    var res, i;
    if (moments.length === 1 && (0, _isArray2.default)(moments[0])) {
        moments = moments[0];
    }
    if (!moments.length) {
        return (0, _local.createLocal)();
    }
    res = moments[0];
    for (i = 1; i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
            res = moments[i];
        }
    }
    return res;
}

// TODO: Use [].sort instead?
function min() {
    var args = [].slice.call(arguments, 0);

    return pickBy('isBefore', args);
}

function max() {
    var args = [].slice.call(arguments, 0);

    return pickBy('isAfter', args);
}
},{"../utils/deprecate":33,"../utils/is-array":63,"../create/local":23,"../create/valid":25}],28:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var now = exports.now = function () {
    return Date.now ? Date.now() : +new Date();
};
},{}],56:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isDurationValid;
exports.isValid = isValid;
exports.createInvalid = createInvalid;

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _indexOf = require('../utils/index-of');

var _indexOf2 = _interopRequireDefault(_indexOf);

var _constructor = require('./constructor');

var _create = require('./create');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

function isDurationValid(m) {
    for (var key in m) {
        if (!(_indexOf2.default.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
            return false;
        }
    }

    var unitHasDecimal = false;
    for (var i = 0; i < ordering.length; ++i) {
        if (m[ordering[i]]) {
            if (unitHasDecimal) {
                return false; // only allow non-integers for smallest unit
            }
            if (parseFloat(m[ordering[i]]) !== (0, _toInt2.default)(m[ordering[i]])) {
                unitHasDecimal = true;
            }
        }
    }

    return true;
}

function isValid() {
    return this._isValid;
}

function createInvalid() {
    return (0, _create.createDuration)(NaN);
}
},{"../utils/to-int":88,"../utils/index-of":104,"./constructor":39,"./create":37}],39:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Duration = Duration;
exports.isDuration = isDuration;

var _aliases = require('../units/aliases');

var _locales = require('../locale/locales');

var _valid = require('./valid.js');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Duration(duration) {
    var normalizedInput = (0, _aliases.normalizeObjectUnits)(duration),
        years = normalizedInput.year || 0,
        quarters = normalizedInput.quarter || 0,
        months = normalizedInput.month || 0,
        weeks = normalizedInput.week || 0,
        days = normalizedInput.day || 0,
        hours = normalizedInput.hour || 0,
        minutes = normalizedInput.minute || 0,
        seconds = normalizedInput.second || 0,
        milliseconds = normalizedInput.millisecond || 0;

    this._isValid = (0, _valid2.default)(normalizedInput);

    // representation for dateAddRemove
    this._milliseconds = +milliseconds + seconds * 1e3 + // 1000
    minutes * 6e4 + // 1000 * 60
    hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
    // Because of dateAddRemove treats 24 hours as different from a
    // day when working around DST, we need to store them separately
    this._days = +days + weeks * 7;
    // It is impossible to translate months into days without knowing
    // which months you are are talking about, so we have to store
    // it separately.
    this._months = +months + quarters * 3 + years * 12;

    this._data = {};

    this._locale = (0, _locales.getLocale)();

    this._bubble();
}

function isDuration(obj) {
    return obj instanceof Duration;
}
},{"../units/aliases":55,"../locale/locales":31,"./valid.js":56}],101:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = absRound;
function absRound(number) {
    if (number < 0) {
        return Math.round(-1 * number) * -1;
    } else {
        return Math.round(number);
    }
}
},{}],35:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cloneWithOffset = cloneWithOffset;
exports.getSetOffset = getSetOffset;
exports.getSetZone = getSetZone;
exports.setOffsetToUTC = setOffsetToUTC;
exports.setOffsetToLocal = setOffsetToLocal;
exports.setOffsetToParsedOffset = setOffsetToParsedOffset;
exports.hasAlignedHourOffset = hasAlignedHourOffset;
exports.isDaylightSavingTime = isDaylightSavingTime;
exports.isDaylightSavingTimeShifted = isDaylightSavingTimeShifted;
exports.isLocal = isLocal;
exports.isUtcOffset = isUtcOffset;
exports.isUtc = isUtc;

var _zeroFill = require('../utils/zero-fill');

var _zeroFill2 = _interopRequireDefault(_zeroFill);

var _create = require('../duration/create');

var _addSubtract = require('../moment/add-subtract');

var _constructor = require('../moment/constructor');

var _format = require('../format/format');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _local = require('../create/local');

var _fromAnything = require('../create/from-anything');

var _utc = require('../create/utc');

var _isDate = require('../utils/is-date');

var _isDate2 = _interopRequireDefault(_isDate);

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _isUndefined = require('../utils/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _compareArrays = require('../utils/compare-arrays');

var _compareArrays2 = _interopRequireDefault(_compareArrays);

var _hooks = require('../utils/hooks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

function offset(token, separator) {
    (0, _format.addFormatToken)(token, 0, 0, function () {
        var offset = this.utcOffset();
        var sign = '+';
        if (offset < 0) {
            offset = -offset;
            sign = '-';
        }
        return sign + (0, _zeroFill2.default)(~~(offset / 60), 2) + separator + (0, _zeroFill2.default)(~~offset % 60, 2);
    });
}

offset('Z', ':');
offset('ZZ', '');

// PARSING

(0, _regex.addRegexToken)('Z', _regex.matchShortOffset);
(0, _regex.addRegexToken)('ZZ', _regex.matchShortOffset);
(0, _token.addParseToken)(['Z', 'ZZ'], function (input, array, config) {
    config._useUTC = true;
    config._tzm = offsetFromString(_regex.matchShortOffset, input);
});

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
    var matches = (string || '').match(matcher);

    if (matches === null) {
        return null;
    }

    var chunk = matches[matches.length - 1] || [];
    var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
    var minutes = +(parts[1] * 60) + (0, _toInt2.default)(parts[2]);

    return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
}

// Return a moment from input, that is local/utc/zone equivalent to model.
function cloneWithOffset(input, model) {
    var res, diff;
    if (model._isUTC) {
        res = model.clone();
        diff = ((0, _constructor.isMoment)(input) || (0, _isDate2.default)(input) ? input.valueOf() : (0, _local.createLocal)(input).valueOf()) - res.valueOf();
        // Use low-level api, because this fn is low-level api.
        res._d.setTime(res._d.valueOf() + diff);
        _hooks.hooks.updateOffset(res, false);
        return res;
    } else {
        return (0, _local.createLocal)(input).local();
    }
}

function getDateOffset(m) {
    // On Firefox.24 Date#getTimezoneOffset returns a floating point.
    // https://github.com/moment/moment/pull/1871
    return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
}

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
_hooks.hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function getSetOffset(input, keepLocalTime, keepMinutes) {
    var offset = this._offset || 0,
        localAdjust;
    if (!this.isValid()) {
        return input != null ? this : NaN;
    }
    if (input != null) {
        if (typeof input === 'string') {
            input = offsetFromString(_regex.matchShortOffset, input);
            if (input === null) {
                return this;
            }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
            input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
            localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
            this.add(localAdjust, 'm');
        }
        if (offset !== input) {
            if (!keepLocalTime || this._changeInProgress) {
                (0, _addSubtract.addSubtract)(this, (0, _create.createDuration)(input - offset, 'm'), 1, false);
            } else if (!this._changeInProgress) {
                this._changeInProgress = true;
                _hooks.hooks.updateOffset(this, true);
                this._changeInProgress = null;
            }
        }
        return this;
    } else {
        return this._isUTC ? offset : getDateOffset(this);
    }
}

function getSetZone(input, keepLocalTime) {
    if (input != null) {
        if (typeof input !== 'string') {
            input = -input;
        }

        this.utcOffset(input, keepLocalTime);

        return this;
    } else {
        return -this.utcOffset();
    }
}

function setOffsetToUTC(keepLocalTime) {
    return this.utcOffset(0, keepLocalTime);
}

function setOffsetToLocal(keepLocalTime) {
    if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;

        if (keepLocalTime) {
            this.subtract(getDateOffset(this), 'm');
        }
    }
    return this;
}

function setOffsetToParsedOffset() {
    if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
    } else if (typeof this._i === 'string') {
        var tZone = offsetFromString(_regex.matchOffset, this._i);
        if (tZone != null) {
            this.utcOffset(tZone);
        } else {
            this.utcOffset(0, true);
        }
    }
    return this;
}

function hasAlignedHourOffset(input) {
    if (!this.isValid()) {
        return false;
    }
    input = input ? (0, _local.createLocal)(input).utcOffset() : 0;

    return (this.utcOffset() - input) % 60 === 0;
}

function isDaylightSavingTime() {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
}

function isDaylightSavingTimeShifted() {
    if (!(0, _isUndefined2.default)(this._isDSTShifted)) {
        return this._isDSTShifted;
    }

    var c = {};

    (0, _constructor.copyConfig)(c, this);
    c = (0, _fromAnything.prepareConfig)(c);

    if (c._a) {
        var other = c._isUTC ? (0, _utc.createUTC)(c._a) : (0, _local.createLocal)(c._a);
        this._isDSTShifted = this.isValid() && (0, _compareArrays2.default)(c._a, other.toArray()) > 0;
    } else {
        this._isDSTShifted = false;
    }

    return this._isDSTShifted;
}

function isLocal() {
    return this.isValid() ? !this._isUTC : false;
}

function isUtcOffset() {
    return this.isValid() ? this._isUTC : false;
}

function isUtc() {
    return this.isValid() ? this._isUTC && this._offset === 0 : false;
}
},{"../utils/zero-fill":90,"../duration/create":37,"../moment/add-subtract":72,"../moment/constructor":26,"../format/format":91,"../parse/regex":92,"../parse/token":93,"../create/local":23,"../create/from-anything":57,"../create/utc":24,"../utils/is-date":21,"../utils/to-int":88,"../utils/is-undefined":62,"../utils/compare-arrays":85,"../utils/hooks":15}],37:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createDuration = createDuration;

var _constructor = require('./constructor');

var _isNumber = require('../utils/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _absRound = require('../utils/abs-round');

var _absRound2 = _interopRequireDefault(_absRound);

var _hasOwnProp = require('../utils/has-own-prop');

var _hasOwnProp2 = _interopRequireDefault(_hasOwnProp);

var _constants = require('../units/constants');

var _offset = require('../units/offset');

var _local = require('../create/local');

var _valid = require('./valid');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ASP.NET json date format regex
var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

function createDuration(input, key) {
    var duration = input,

    // matching against regexp is expensive, do it on demand
    match = null,
        sign,
        ret,
        diffRes;

    if ((0, _constructor.isDuration)(input)) {
        duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
        };
    } else if ((0, _isNumber2.default)(input)) {
        duration = {};
        if (key) {
            duration[key] = input;
        } else {
            duration.milliseconds = input;
        }
    } else if (!!(match = aspNetRegex.exec(input))) {
        sign = match[1] === '-' ? -1 : 1;
        duration = {
            y: 0,
            d: (0, _toInt2.default)(match[_constants.DATE]) * sign,
            h: (0, _toInt2.default)(match[_constants.HOUR]) * sign,
            m: (0, _toInt2.default)(match[_constants.MINUTE]) * sign,
            s: (0, _toInt2.default)(match[_constants.SECOND]) * sign,
            ms: (0, _toInt2.default)((0, _absRound2.default)(match[_constants.MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
        };
    } else if (!!(match = isoRegex.exec(input))) {
        sign = match[1] === '-' ? -1 : match[1] === '+' ? 1 : 1;
        duration = {
            y: parseIso(match[2], sign),
            M: parseIso(match[3], sign),
            w: parseIso(match[4], sign),
            d: parseIso(match[5], sign),
            h: parseIso(match[6], sign),
            m: parseIso(match[7], sign),
            s: parseIso(match[8], sign)
        };
    } else if (duration == null) {
        // checks for null or undefined
        duration = {};
    } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
        diffRes = momentsDifference((0, _local.createLocal)(duration.from), (0, _local.createLocal)(duration.to));

        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
    }

    ret = new _constructor.Duration(duration);

    if ((0, _constructor.isDuration)(input) && (0, _hasOwnProp2.default)(input, '_locale')) {
        ret._locale = input._locale;
    }

    return ret;
}

createDuration.fn = _constructor.Duration.prototype;
createDuration.invalid = _valid.createInvalid;

function parseIso(inp, sign) {
    // We'd normally use ~~inp for this, but unfortunately it also
    // converts floats to ints.
    // inp may be undefined, so careful calling replace on it.
    var res = inp && parseFloat(inp.replace(',', '.'));
    // apply sign while we're at it
    return (isNaN(res) ? 0 : res) * sign;
}

function positiveMomentsDifference(base, other) {
    var res = { milliseconds: 0, months: 0 };

    res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
    if (base.clone().add(res.months, 'M').isAfter(other)) {
        --res.months;
    }

    res.milliseconds = +other - +base.clone().add(res.months, 'M');

    return res;
}

function momentsDifference(base, other) {
    var res;
    if (!(base.isValid() && other.isValid())) {
        return { milliseconds: 0, months: 0 };
    }

    other = (0, _offset.cloneWithOffset)(other, base);
    if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
    } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
    }

    return res;
}
},{"./constructor":39,"../utils/is-number":89,"../utils/to-int":88,"../utils/abs-round":101,"../utils/has-own-prop":61,"../units/constants":102,"../units/offset":35,"../create/local":23,"./valid":56}],72:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subtract = exports.add = undefined;
exports.addSubtract = addSubtract;

var _getSet = require('./get-set');

var _month = require('../units/month');

var _create = require('../duration/create');

var _deprecate = require('../utils/deprecate');

var _hooks = require('../utils/hooks');

var _absRound = require('../utils/abs-round');

var _absRound2 = _interopRequireDefault(_absRound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: remove 'name' arg after deprecation is removed
function createAdder(direction, name) {
    return function (val, period) {
        var dur, tmp;
        //invert the arguments, but complain about it
        if (period !== null && !isNaN(+period)) {
            (0, _deprecate.deprecateSimple)(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' + 'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
            tmp = val;val = period;period = tmp;
        }

        val = typeof val === 'string' ? +val : val;
        dur = (0, _create.createDuration)(val, period);
        addSubtract(this, dur, direction);
        return this;
    };
}

function addSubtract(mom, duration, isAdding, updateOffset) {
    var milliseconds = duration._milliseconds,
        days = (0, _absRound2.default)(duration._days),
        months = (0, _absRound2.default)(duration._months);

    if (!mom.isValid()) {
        // No op
        return;
    }

    updateOffset = updateOffset == null ? true : updateOffset;

    if (months) {
        (0, _month.setMonth)(mom, (0, _getSet.get)(mom, 'Month') + months * isAdding);
    }
    if (days) {
        (0, _getSet.set)(mom, 'Date', (0, _getSet.get)(mom, 'Date') + days * isAdding);
    }
    if (milliseconds) {
        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
    }
    if (updateOffset) {
        _hooks.hooks.updateOffset(mom, days || months);
    }
}

var add = exports.add = createAdder(1, 'add');
var subtract = exports.subtract = createAdder(-1, 'subtract');
},{"./get-set":79,"../units/month":47,"../duration/create":37,"../utils/deprecate":33,"../utils/hooks":15,"../utils/abs-round":101}],17:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getCalendarFormat = getCalendarFormat;
exports.calendar = calendar;

var _local = require('../create/local');

var _offset = require('../units/offset');

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _hooks = require('../utils/hooks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCalendarFormat(myMoment, now) {
    var diff = myMoment.diff(now, 'days', true);
    return diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
}

function calendar(time, formats) {
    // We want to compare the start of today, vs this.
    // Getting start-of-today depends on whether we're local/utc/offset or not.
    var now = time || (0, _local.createLocal)(),
        sod = (0, _offset.cloneWithOffset)(now, this).startOf('day'),
        format = _hooks.hooks.calendarFormat(this, sod) || 'sameElse';

    var output = formats && ((0, _isFunction2.default)(formats[format]) ? formats[format].call(this, now) : formats[format]);

    return this.format(output || this.localeData().calendar(format, this, (0, _local.createLocal)(now)));
}
},{"../create/local":23,"../units/offset":35,"../utils/is-function":36,"../utils/hooks":15}],73:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clone = clone;

var _constructor = require('./constructor');

function clone() {
    return new _constructor.Moment(this);
}
},{"./constructor":26}],74:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isAfter = isAfter;
exports.isBefore = isBefore;
exports.isBetween = isBetween;
exports.isSame = isSame;
exports.isSameOrAfter = isSameOrAfter;
exports.isSameOrBefore = isSameOrBefore;

var _constructor = require('./constructor');

var _aliases = require('../units/aliases');

var _local = require('../create/local');

var _isUndefined = require('../utils/is-undefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isAfter(input, units) {
    var localInput = (0, _constructor.isMoment)(input) ? input : (0, _local.createLocal)(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = (0, _aliases.normalizeUnits)(!(0, _isUndefined2.default)(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() > localInput.valueOf();
    } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
    }
}

function isBefore(input, units) {
    var localInput = (0, _constructor.isMoment)(input) ? input : (0, _local.createLocal)(input);
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = (0, _aliases.normalizeUnits)(!(0, _isUndefined2.default)(units) ? units : 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() < localInput.valueOf();
    } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
    }
}

function isBetween(from, to, units, inclusivity) {
    inclusivity = inclusivity || '()';
    return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) && (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
}

function isSame(input, units) {
    var localInput = (0, _constructor.isMoment)(input) ? input : (0, _local.createLocal)(input),
        inputMs;
    if (!(this.isValid() && localInput.isValid())) {
        return false;
    }
    units = (0, _aliases.normalizeUnits)(units || 'millisecond');
    if (units === 'millisecond') {
        return this.valueOf() === localInput.valueOf();
    } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
    }
}

function isSameOrAfter(input, units) {
    return this.isSame(input, units) || this.isAfter(input, units);
}

function isSameOrBefore(input, units) {
    return this.isSame(input, units) || this.isBefore(input, units);
}
},{"./constructor":26,"../units/aliases":55,"../create/local":23,"../utils/is-undefined":62}],75:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.diff = diff;

var _absFloor = require('../utils/abs-floor');

var _absFloor2 = _interopRequireDefault(_absFloor);

var _offset = require('../units/offset');

var _aliases = require('../units/aliases');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function diff(input, units, asFloat) {
    var that, zoneDelta, delta, output;

    if (!this.isValid()) {
        return NaN;
    }

    that = (0, _offset.cloneWithOffset)(input, this);

    if (!that.isValid()) {
        return NaN;
    }

    zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

    units = (0, _aliases.normalizeUnits)(units);

    switch (units) {
        case 'year':
            output = monthDiff(this, that) / 12;break;
        case 'month':
            output = monthDiff(this, that);break;
        case 'quarter':
            output = monthDiff(this, that) / 3;break;
        case 'second':
            output = (this - that) / 1e3;break; // 1000
        case 'minute':
            output = (this - that) / 6e4;break; // 1000 * 60
        case 'hour':
            output = (this - that) / 36e5;break; // 1000 * 60 * 60
        case 'day':
            output = (this - that - zoneDelta) / 864e5;break; // 1000 * 60 * 60 * 24, negate dst
        case 'week':
            output = (this - that - zoneDelta) / 6048e5;break; // 1000 * 60 * 60 * 24 * 7, negate dst
        default:
            output = this - that;
    }

    return asFloat ? output : (0, _absFloor2.default)(output);
}

function monthDiff(a, b) {
    // difference in months
    var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),

    // b is in (anchor - 1 month, anchor + 1 month)
    anchor = a.clone().add(wholeMonthDiff, 'months'),
        anchor2,
        adjust;

    if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor - anchor2);
    } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor2 - anchor);
    }

    //check for negative zero, return zero if negative zero
    return -(wholeMonthDiff + adjust) || 0;
}
},{"../utils/abs-floor":117,"../units/offset":35,"../units/aliases":55}],76:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toString = toString;
exports.toISOString = toISOString;
exports.inspect = inspect;
exports.format = format;

var _format = require('../format/format');

var _hooks = require('../utils/hooks');

var _isFunction = require('../utils/is-function');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_hooks.hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
_hooks.hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

function toString() {
    return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
}

function toISOString(keepOffset) {
    if (!this.isValid()) {
        return null;
    }
    var utc = keepOffset !== true;
    var m = utc ? this.clone().utc() : this;
    if (m.year() < 0 || m.year() > 9999) {
        return (0, _format.formatMoment)(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }
    if ((0, _isFunction2.default)(Date.prototype.toISOString)) {
        // native implementation is ~50x faster, use it when we can
        if (utc) {
            return this.toDate().toISOString();
        } else {
            return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', (0, _format.formatMoment)(m, 'Z'));
        }
    }
    return (0, _format.formatMoment)(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
}

/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function inspect() {
    if (!this.isValid()) {
        return 'moment.invalid(/* ' + this._i + ' */)';
    }
    var func = 'moment';
    var zone = '';
    if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
        zone = 'Z';
    }
    var prefix = '[' + func + '("]';
    var year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
    var datetime = '-MM-DD[T]HH:mm:ss.SSS';
    var suffix = zone + '[")]';

    return this.format(prefix + year + datetime + suffix);
}

function format(inputString) {
    if (!inputString) {
        inputString = this.isUtc() ? _hooks.hooks.defaultFormatUtc : _hooks.hooks.defaultFormat;
    }
    var output = (0, _format.formatMoment)(this, inputString);
    return this.localeData().postformat(output);
}
},{"../format/format":91,"../utils/hooks":15,"../utils/is-function":36}],77:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.from = from;
exports.fromNow = fromNow;

var _create = require('../duration/create');

var _local = require('../create/local');

var _constructor = require('../moment/constructor');

function from(time, withoutSuffix) {
    if (this.isValid() && ((0, _constructor.isMoment)(time) && time.isValid() || (0, _local.createLocal)(time).isValid())) {
        return (0, _create.createDuration)({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function fromNow(withoutSuffix) {
    return this.from((0, _local.createLocal)(), withoutSuffix);
}
},{"../duration/create":37,"../create/local":23,"../moment/constructor":26}],78:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.to = to;
exports.toNow = toNow;

var _create = require('../duration/create');

var _local = require('../create/local');

var _constructor = require('../moment/constructor');

function to(time, withoutSuffix) {
    if (this.isValid() && ((0, _constructor.isMoment)(time) && time.isValid() || (0, _local.createLocal)(time).isValid())) {
        return (0, _create.createDuration)({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
    } else {
        return this.localeData().invalidDate();
    }
}

function toNow(withoutSuffix) {
    return this.to((0, _local.createLocal)(), withoutSuffix);
}
},{"../duration/create":37,"../create/local":23,"../moment/constructor":26}],81:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.lang = undefined;
exports.locale = locale;
exports.localeData = localeData;

var _locales = require('../locale/locales');

var _deprecate = require('../utils/deprecate');

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function locale(key) {
    var newLocaleData;

    if (key === undefined) {
        return this._locale._abbr;
    } else {
        newLocaleData = (0, _locales.getLocale)(key);
        if (newLocaleData != null) {
            this._locale = newLocaleData;
        }
        return this;
    }
}

var lang = exports.lang = (0, _deprecate.deprecate)('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function (key) {
    if (key === undefined) {
        return this.localeData();
    } else {
        return this.locale(key);
    }
});

function localeData() {
    return this._locale;
}
},{"../locale/locales":31,"../utils/deprecate":33}],80:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.startOf = startOf;
exports.endOf = endOf;

var _aliases = require('../units/aliases');

function startOf(units) {
    units = (0, _aliases.normalizeUnits)(units);
    // the following switch intentionally omits break keywords
    // to utilize falling through the cases.
    switch (units) {
        case 'year':
            this.month(0);
        /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
        /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
        case 'date':
            this.hours(0);
        /* falls through */
        case 'hour':
            this.minutes(0);
        /* falls through */
        case 'minute':
            this.seconds(0);
        /* falls through */
        case 'second':
            this.milliseconds(0);
    }

    // weeks are a special case
    if (units === 'week') {
        this.weekday(0);
    }
    if (units === 'isoWeek') {
        this.isoWeekday(1);
    }

    // quarters are also special
    if (units === 'quarter') {
        this.month(Math.floor(this.month() / 3) * 3);
    }

    return this;
}

function endOf(units) {
    units = (0, _aliases.normalizeUnits)(units);
    if (units === undefined || units === 'millisecond') {
        return this;
    }

    // 'date' is an alias for 'day', so it should be considered as such.
    if (units === 'date') {
        units = 'day';
    }

    return this.startOf(units).add(1, units === 'isoWeek' ? 'week' : units).subtract(1, 'ms');
}
},{"../units/aliases":55}],82:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.valueOf = valueOf;
exports.unix = unix;
exports.toDate = toDate;
exports.toArray = toArray;
exports.toObject = toObject;
exports.toJSON = toJSON;
function valueOf() {
    return this._d.valueOf() - (this._offset || 0) * 60000;
}

function unix() {
    return Math.floor(this.valueOf() / 1000);
}

function toDate() {
    return new Date(this.valueOf());
}

function toArray() {
    var m = this;
    return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
}

function toObject() {
    var m = this;
    return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
    };
}

function toJSON() {
    // new Date(NaN).toJSON() === null
    return this.isValid() ? this.toISOString() : null;
}
},{}],83:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isValid = isValid;
exports.parsingFlags = parsingFlags;
exports.invalidAt = invalidAt;

var _valid = require('../create/valid');

var _extend = require('../utils/extend');

var _extend2 = _interopRequireDefault(_extend);

var _parsingFlags = require('../create/parsing-flags');

var _parsingFlags2 = _interopRequireDefault(_parsingFlags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isValid() {
    return (0, _valid.isValid)(this);
}

function parsingFlags() {
    return (0, _extend2.default)({}, (0, _parsingFlags2.default)(this));
}

function invalidAt() {
    return (0, _parsingFlags2.default)(this).overflow;
}
},{"../create/valid":25,"../utils/extend":58,"../create/parsing-flags":59}],84:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.creationData = creationData;
function creationData() {
    return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
    };
}
},{}],51:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetWeekYear = getSetWeekYear;
exports.getSetISOWeekYear = getSetISOWeekYear;
exports.getISOWeeksInYear = getISOWeeksInYear;
exports.getWeeksInYear = getWeeksInYear;

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _weekCalendarUtils = require('./week-calendar-utils');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

var _hooks = require('../utils/hooks');

var _local = require('../create/local');

var _dateFromArray = require('../create/date-from-array');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)(0, ['gg', 2], 0, function () {
    return this.weekYear() % 100;
});

(0, _format.addFormatToken)(0, ['GG', 2], 0, function () {
    return this.isoWeekYear() % 100;
});

function addWeekYearFormatToken(token, getter) {
    (0, _format.addFormatToken)(0, [token, token.length], 0, getter);
}

addWeekYearFormatToken('gggg', 'weekYear');
addWeekYearFormatToken('ggggg', 'weekYear');
addWeekYearFormatToken('GGGG', 'isoWeekYear');
addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

(0, _aliases.addUnitAlias)('weekYear', 'gg');
(0, _aliases.addUnitAlias)('isoWeekYear', 'GG');

// PRIORITY

(0, _priorities.addUnitPriority)('weekYear', 1);
(0, _priorities.addUnitPriority)('isoWeekYear', 1);

// PARSING

(0, _regex.addRegexToken)('G', _regex.matchSigned);
(0, _regex.addRegexToken)('g', _regex.matchSigned);
(0, _regex.addRegexToken)('GG', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('gg', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('GGGG', _regex.match1to4, _regex.match4);
(0, _regex.addRegexToken)('gggg', _regex.match1to4, _regex.match4);
(0, _regex.addRegexToken)('GGGGG', _regex.match1to6, _regex.match6);
(0, _regex.addRegexToken)('ggggg', _regex.match1to6, _regex.match6);

(0, _token.addWeekParseToken)(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
    week[token.substr(0, 2)] = (0, _toInt2.default)(input);
});

(0, _token.addWeekParseToken)(['gg', 'GG'], function (input, week, config, token) {
    week[token] = _hooks.hooks.parseTwoDigitYear(input);
});

// MOMENTS

function getSetWeekYear(input) {
    return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
}

function getSetISOWeekYear(input) {
    return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
}

function getISOWeeksInYear() {
    return (0, _weekCalendarUtils.weeksInYear)(this.year(), 1, 4);
}

function getWeeksInYear() {
    var weekInfo = this.localeData()._week;
    return (0, _weekCalendarUtils.weeksInYear)(this.year(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekYearHelper(input, week, weekday, dow, doy) {
    var weeksTarget;
    if (input == null) {
        return (0, _weekCalendarUtils.weekOfYear)(this, dow, doy).year;
    } else {
        weeksTarget = (0, _weekCalendarUtils.weeksInYear)(input, dow, doy);
        if (week > weeksTarget) {
            week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
    }
}

function setWeekAll(weekYear, week, weekday, dow, doy) {
    var dayOfYearData = (0, _weekCalendarUtils.dayOfYearFromWeeks)(weekYear, week, weekday, dow, doy),
        date = (0, _dateFromArray.createUTCDate)(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

    this.year(date.getUTCFullYear());
    this.month(date.getUTCMonth());
    this.date(date.getUTCDate());
    return this;
}
},{"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./week-calendar-utils":107,"../utils/to-int":88,"../utils/hooks":15,"../create/local":23,"../create/date-from-array":105}],48:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetQuarter = getSetQuarter;

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('Q', 0, 'Qo', 'quarter');

// ALIASES

(0, _aliases.addUnitAlias)('quarter', 'Q');

// PRIORITY

(0, _priorities.addUnitPriority)('quarter', 7);

// PARSING

(0, _regex.addRegexToken)('Q', _regex.match1);
(0, _token.addParseToken)('Q', function (input, array) {
    array[_constants.MONTH] = ((0, _toInt2.default)(input) - 1) * 3;
});

// MOMENTS

function getSetQuarter(input) {
    return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
}
},{"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102,"../utils/to-int":88}],41:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetDayOfMonth = undefined;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('D', ['DD', 2], 'Do', 'date');

// ALIASES

(0, _aliases.addUnitAlias)('date', 'D');

// PRIORITY
(0, _priorities.addUnitPriority)('date', 9);

// PARSING

(0, _regex.addRegexToken)('D', _regex.match1to2);
(0, _regex.addRegexToken)('DD', _regex.match1to2, _regex.match2);
(0, _regex.addRegexToken)('Do', function (isStrict, locale) {
    // TODO: Remove "ordinalParse" fallback in next major release.
    return isStrict ? locale._dayOfMonthOrdinalParse || locale._ordinalParse : locale._dayOfMonthOrdinalParseLenient;
});

(0, _token.addParseToken)(['D', 'DD'], _constants.DATE);
(0, _token.addParseToken)('Do', function (input, array) {
    array[_constants.DATE] = (0, _toInt2.default)(input.match(_regex.match1to2)[0]);
});

// MOMENTS

var getSetDayOfMonth = exports.getSetDayOfMonth = (0, _getSet.makeGetSet)('Date', true);
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102,"../utils/to-int":88}],43:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetDayOfYear = getSetDayOfYear;

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _year = require('./year');

var _dateFromArray = require('../create/date-from-array');

var _token = require('../parse/token');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES

(0, _aliases.addUnitAlias)('dayOfYear', 'DDD');

// PRIORITY
(0, _priorities.addUnitPriority)('dayOfYear', 4);

// PARSING

(0, _regex.addRegexToken)('DDD', _regex.match1to3);
(0, _regex.addRegexToken)('DDDD', _regex.match3);
(0, _token.addParseToken)(['DDD', 'DDDD'], function (input, array, config) {
    config._dayOfYear = (0, _toInt2.default)(input);
});

// HELPERS

// MOMENTS

function getSetDayOfYear(input) {
    var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
    return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
}
},{"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"./year":54,"../create/date-from-array":105,"../parse/token":93,"../utils/to-int":88}],45:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSetMinute = undefined;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

// FORMATTING

(0, _format.addFormatToken)('m', ['mm', 2], 0, 'minute');

// ALIASES

(0, _aliases.addUnitAlias)('minute', 'm');

// PRIORITY

(0, _priorities.addUnitPriority)('minute', 14);

// PARSING

(0, _regex.addRegexToken)('m', _regex.match1to2);
(0, _regex.addRegexToken)('mm', _regex.match1to2, _regex.match2);
(0, _token.addParseToken)(['m', 'mm'], _constants.MINUTE);

// MOMENTS

var getSetMinute = exports.getSetMinute = (0, _getSet.makeGetSet)('Minutes', false);
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102}],49:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSetSecond = undefined;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

// FORMATTING

(0, _format.addFormatToken)('s', ['ss', 2], 0, 'second');

// ALIASES

(0, _aliases.addUnitAlias)('second', 's');

// PRIORITY

(0, _priorities.addUnitPriority)('second', 15);

// PARSING

(0, _regex.addRegexToken)('s', _regex.match1to2);
(0, _regex.addRegexToken)('ss', _regex.match1to2, _regex.match2);
(0, _token.addParseToken)(['s', 'ss'], _constants.SECOND);

// MOMENTS

var getSetSecond = exports.getSetSecond = (0, _getSet.makeGetSet)('Seconds', false);
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102}],46:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetMillisecond = undefined;

var _getSet = require('../moment/get-set');

var _format = require('../format/format');

var _aliases = require('./aliases');

var _priorities = require('./priorities');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _constants = require('./constants');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('S', 0, 0, function () {
    return ~~(this.millisecond() / 100);
});

(0, _format.addFormatToken)(0, ['SS', 2], 0, function () {
    return ~~(this.millisecond() / 10);
});

(0, _format.addFormatToken)(0, ['SSS', 3], 0, 'millisecond');
(0, _format.addFormatToken)(0, ['SSSS', 4], 0, function () {
    return this.millisecond() * 10;
});
(0, _format.addFormatToken)(0, ['SSSSS', 5], 0, function () {
    return this.millisecond() * 100;
});
(0, _format.addFormatToken)(0, ['SSSSSS', 6], 0, function () {
    return this.millisecond() * 1000;
});
(0, _format.addFormatToken)(0, ['SSSSSSS', 7], 0, function () {
    return this.millisecond() * 10000;
});
(0, _format.addFormatToken)(0, ['SSSSSSSS', 8], 0, function () {
    return this.millisecond() * 100000;
});
(0, _format.addFormatToken)(0, ['SSSSSSSSS', 9], 0, function () {
    return this.millisecond() * 1000000;
});

// ALIASES

(0, _aliases.addUnitAlias)('millisecond', 'ms');

// PRIORITY

(0, _priorities.addUnitPriority)('millisecond', 16);

// PARSING

(0, _regex.addRegexToken)('S', _regex.match1to3, _regex.match1);
(0, _regex.addRegexToken)('SS', _regex.match1to3, _regex.match2);
(0, _regex.addRegexToken)('SSS', _regex.match1to3, _regex.match3);

var token;
for (token = 'SSSS'; token.length <= 9; token += 'S') {
    (0, _regex.addRegexToken)(token, _regex.matchUnsigned);
}

function parseMs(input, array) {
    array[_constants.MILLISECOND] = (0, _toInt2.default)(('0.' + input) * 1000);
}

for (token = 'S'; token.length <= 9; token += 'S') {
    (0, _token.addParseToken)(token, parseMs);
}
// MOMENTS

var getSetMillisecond = exports.getSetMillisecond = (0, _getSet.makeGetSet)('Milliseconds', false);
},{"../moment/get-set":79,"../format/format":91,"./aliases":55,"./priorities":103,"../parse/regex":92,"../parse/token":93,"./constants":102,"../utils/to-int":88}],52:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getZoneAbbr = getZoneAbbr;
exports.getZoneName = getZoneName;

var _format = require('../format/format');

// FORMATTING

(0, _format.addFormatToken)('z', 0, 0, 'zoneAbbr');
(0, _format.addFormatToken)('zz', 0, 0, 'zoneName');

// MOMENTS

function getZoneAbbr() {
    return this._isUTC ? 'UTC' : '';
}

function getZoneName() {
    return this._isUTC ? 'Coordinated Universal Time' : '';
}
},{"../format/format":91}],29:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constructor = require('./constructor');

var _addSubtract = require('./add-subtract');

var _calendar = require('./calendar');

var _clone = require('./clone');

var _compare = require('./compare');

var _diff = require('./diff');

var _format = require('./format');

var _from = require('./from');

var _to = require('./to');

var _getSet = require('./get-set');

var _locale = require('./locale');

var _minMax = require('./min-max');

var _startEndOf = require('./start-end-of');

var _toType = require('./to-type');

var _valid = require('./valid');

var _creationData = require('./creation-data');

var _year = require('../units/year');

var _weekYear = require('../units/week-year');

var _quarter = require('../units/quarter');

var _month = require('../units/month');

var _week = require('../units/week');

var _dayOfMonth = require('../units/day-of-month');

var _dayOfWeek = require('../units/day-of-week');

var _dayOfYear = require('../units/day-of-year');

var _hour = require('../units/hour');

var _minute = require('../units/minute');

var _second = require('../units/second');

var _millisecond = require('../units/millisecond');

var _offset = require('../units/offset');

var _timezone = require('../units/timezone');

var _deprecate = require('../utils/deprecate');

var proto = _constructor.Moment.prototype;

proto.add = _addSubtract.add;
proto.calendar = _calendar.calendar;
proto.clone = _clone.clone;
proto.diff = _diff.diff;
proto.endOf = _startEndOf.endOf;
proto.format = _format.format;
proto.from = _from.from;
proto.fromNow = _from.fromNow;
proto.to = _to.to;
proto.toNow = _to.toNow;
proto.get = _getSet.stringGet;
proto.invalidAt = _valid.invalidAt;
proto.isAfter = _compare.isAfter;
proto.isBefore = _compare.isBefore;
proto.isBetween = _compare.isBetween;
proto.isSame = _compare.isSame;
proto.isSameOrAfter = _compare.isSameOrAfter;
proto.isSameOrBefore = _compare.isSameOrBefore;
proto.isValid = _valid.isValid;
proto.lang = _locale.lang;
proto.locale = _locale.locale;
proto.localeData = _locale.localeData;
proto.max = _minMax.prototypeMax;
proto.min = _minMax.prototypeMin;
proto.parsingFlags = _valid.parsingFlags;
proto.set = _getSet.stringSet;
proto.startOf = _startEndOf.startOf;
proto.subtract = _addSubtract.subtract;
proto.toArray = _toType.toArray;
proto.toObject = _toType.toObject;
proto.toDate = _toType.toDate;
proto.toISOString = _format.toISOString;
proto.inspect = _format.inspect;
proto.toJSON = _toType.toJSON;
proto.toString = _format.toString;
proto.unix = _toType.unix;
proto.valueOf = _toType.valueOf;
proto.creationData = _creationData.creationData;

// Year

proto.year = _year.getSetYear;
proto.isLeapYear = _year.getIsLeapYear;

// Week Year

proto.weekYear = _weekYear.getSetWeekYear;
proto.isoWeekYear = _weekYear.getSetISOWeekYear;

// Quarter

proto.quarter = proto.quarters = _quarter.getSetQuarter;

// Month

proto.month = _month.getSetMonth;
proto.daysInMonth = _month.getDaysInMonth;

// Week

proto.week = proto.weeks = _week.getSetWeek;
proto.isoWeek = proto.isoWeeks = _week.getSetISOWeek;
proto.weeksInYear = _weekYear.getWeeksInYear;
proto.isoWeeksInYear = _weekYear.getISOWeeksInYear;

// Day

proto.date = _dayOfMonth.getSetDayOfMonth;
proto.day = proto.days = _dayOfWeek.getSetDayOfWeek;
proto.weekday = _dayOfWeek.getSetLocaleDayOfWeek;
proto.isoWeekday = _dayOfWeek.getSetISODayOfWeek;
proto.dayOfYear = _dayOfYear.getSetDayOfYear;

// Hour

proto.hour = proto.hours = _hour.getSetHour;

// Minute

proto.minute = proto.minutes = _minute.getSetMinute;

// Second

proto.second = proto.seconds = _second.getSetSecond;

// Millisecond

proto.millisecond = proto.milliseconds = _millisecond.getSetMillisecond;

// Offset

proto.utcOffset = _offset.getSetOffset;
proto.utc = _offset.setOffsetToUTC;
proto.local = _offset.setOffsetToLocal;
proto.parseZone = _offset.setOffsetToParsedOffset;
proto.hasAlignedHourOffset = _offset.hasAlignedHourOffset;
proto.isDST = _offset.isDaylightSavingTime;
proto.isLocal = _offset.isLocal;
proto.isUtcOffset = _offset.isUtcOffset;
proto.isUtc = _offset.isUtc;
proto.isUTC = _offset.isUtc;

// Timezone

proto.zoneAbbr = _timezone.getZoneAbbr;
proto.zoneName = _timezone.getZoneName;

// Deprecations

proto.dates = (0, _deprecate.deprecate)('dates accessor is deprecated. Use date instead.', _dayOfMonth.getSetDayOfMonth);
proto.months = (0, _deprecate.deprecate)('months accessor is deprecated. Use month instead', _month.getSetMonth);
proto.years = (0, _deprecate.deprecate)('years accessor is deprecated. Use year instead', _year.getSetYear);
proto.zone = (0, _deprecate.deprecate)('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', _offset.getSetZone);
proto.isDSTShifted = (0, _deprecate.deprecate)('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', _offset.isDaylightSavingTimeShifted);

exports.default = proto;
},{"./constructor":26,"./add-subtract":72,"./calendar":17,"./clone":73,"./compare":74,"./diff":75,"./format":76,"./from":77,"./to":78,"./get-set":79,"./locale":81,"./min-max":27,"./start-end-of":80,"./to-type":82,"./valid":83,"./creation-data":84,"../units/year":54,"../units/week-year":51,"../units/quarter":48,"../units/month":47,"../units/week":53,"../units/day-of-month":41,"../units/day-of-week":42,"../units/day-of-year":43,"../units/hour":44,"../units/minute":45,"../units/second":49,"../units/millisecond":46,"../units/offset":35,"../units/timezone":52,"../utils/deprecate":33}],16:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.momentPrototype = exports.createInvalid = exports.createInZone = exports.createLocal = exports.createUnix = exports.createUTC = exports.isMoment = exports.max = exports.min = exports.now = undefined;

var _local = require('../create/local');

var _utc = require('../create/utc');

var _valid = require('../create/valid');

var _constructor = require('./constructor');

var _minMax = require('./min-max');

var _now = require('./now');

var _prototype = require('./prototype');

var _prototype2 = _interopRequireDefault(_prototype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createUnix(input) {
    return (0, _local.createLocal)(input * 1000);
}

function createInZone() {
    return _local.createLocal.apply(null, arguments).parseZone();
}

exports.now = _now.now;
exports.min = _minMax.min;
exports.max = _minMax.max;
exports.isMoment = _constructor.isMoment;
exports.createUTC = _utc.createUTC;
exports.createUnix = createUnix;
exports.createLocal = _local.createLocal;
exports.createInZone = createInZone;
exports.createInvalid = _valid.createInvalid;
exports.momentPrototype = _prototype2.default;
},{"../create/local":23,"../create/utc":24,"../create/valid":25,"./constructor":26,"./min-max":27,"./now":28,"./prototype":29}],69:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.preParsePostFormat = preParsePostFormat;
function preParsePostFormat(string) {
    return string;
}
},{}],30:[function(require,module,exports) {
'use strict';

var _constructor = require('./constructor');

var _calendar = require('./calendar');

var _formats = require('./formats');

var _invalid = require('./invalid');

var _ordinal = require('./ordinal');

var _prePostFormat = require('./pre-post-format');

var _relative = require('./relative');

var _set = require('./set');

var _month = require('../units/month');

var _week = require('../units/week');

var _dayOfWeek = require('../units/day-of-week');

var _hour = require('../units/hour');

var proto = _constructor.Locale.prototype;

proto.calendar = _calendar.calendar;
proto.longDateFormat = _formats.longDateFormat;
proto.invalidDate = _invalid.invalidDate;
proto.ordinal = _ordinal.ordinal;
proto.preparse = _prePostFormat.preParsePostFormat;
proto.postformat = _prePostFormat.preParsePostFormat;
proto.relativeTime = _relative.relativeTime;
proto.pastFuture = _relative.pastFuture;
proto.set = _set.set;

// Month


proto.months = _month.localeMonths;
proto.monthsShort = _month.localeMonthsShort;
proto.monthsParse = _month.localeMonthsParse;
proto.monthsRegex = _month.monthsRegex;
proto.monthsShortRegex = _month.monthsShortRegex;

// Week

proto.week = _week.localeWeek;
proto.firstDayOfYear = _week.localeFirstDayOfYear;
proto.firstDayOfWeek = _week.localeFirstDayOfWeek;

// Day of Week


proto.weekdays = _dayOfWeek.localeWeekdays;
proto.weekdaysMin = _dayOfWeek.localeWeekdaysMin;
proto.weekdaysShort = _dayOfWeek.localeWeekdaysShort;
proto.weekdaysParse = _dayOfWeek.localeWeekdaysParse;

proto.weekdaysRegex = _dayOfWeek.weekdaysRegex;
proto.weekdaysShortRegex = _dayOfWeek.weekdaysShortRegex;
proto.weekdaysMinRegex = _dayOfWeek.weekdaysMinRegex;

// Hours


proto.isPM = _hour.localeIsPM;
proto.meridiem = _hour.localeMeridiem;
},{"./constructor":64,"./calendar":65,"./formats":66,"./invalid":68,"./ordinal":67,"./pre-post-format":69,"./relative":71,"./set":70,"../units/month":47,"../units/week":53,"../units/day-of-week":42,"../units/hour":44}],32:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.listMonths = listMonths;
exports.listMonthsShort = listMonthsShort;
exports.listWeekdays = listWeekdays;
exports.listWeekdaysShort = listWeekdaysShort;
exports.listWeekdaysMin = listWeekdaysMin;

var _isNumber = require('../utils/is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _locales = require('./locales');

var _utc = require('../create/utc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(format, index, field, setter) {
    var locale = (0, _locales.getLocale)();
    var utc = (0, _utc.createUTC)().set(setter, index);
    return locale[field](utc, format);
}

function listMonthsImpl(format, index, field) {
    if ((0, _isNumber2.default)(format)) {
        index = format;
        format = undefined;
    }

    format = format || '';

    if (index != null) {
        return get(format, index, field, 'month');
    }

    var i;
    var out = [];
    for (i = 0; i < 12; i++) {
        out[i] = get(format, i, field, 'month');
    }
    return out;
}

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function listWeekdaysImpl(localeSorted, format, index, field) {
    if (typeof localeSorted === 'boolean') {
        if ((0, _isNumber2.default)(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    } else {
        format = localeSorted;
        index = format;
        localeSorted = false;

        if ((0, _isNumber2.default)(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';
    }

    var locale = (0, _locales.getLocale)(),
        shift = localeSorted ? locale._week.dow : 0;

    if (index != null) {
        return get(format, (index + shift) % 7, field, 'day');
    }

    var i;
    var out = [];
    for (i = 0; i < 7; i++) {
        out[i] = get(format, (i + shift) % 7, field, 'day');
    }
    return out;
}

function listMonths(format, index) {
    return listMonthsImpl(format, index, 'months');
}

function listMonthsShort(format, index) {
    return listMonthsImpl(format, index, 'monthsShort');
}

function listWeekdays(localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
}

function listWeekdaysShort(localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
}

function listWeekdaysMin(localeSorted, format, index) {
    return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
}
},{"../utils/is-number":89,"./locales":31,"../create/utc":24}],34:[function(require,module,exports) {
'use strict';

require('./prototype');

var _locales = require('./locales');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _locales.getSetGlobalLocale)('en', {
    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal: function (number) {
        var b = number % 10,
            output = (0, _toInt2.default)(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
        return number + output;
    }
});
},{"./prototype":30,"./locales":31,"../utils/to-int":88}],18:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.listWeekdaysMin = exports.listWeekdaysShort = exports.listWeekdays = exports.listMonthsShort = exports.listMonths = exports.listLocales = exports.getLocale = exports.updateLocale = exports.defineLocale = exports.getSetGlobalLocale = undefined;

require('./prototype');

var _locales = require('./locales');

var _lists = require('./lists');

var _deprecate = require('../utils/deprecate');

var _hooks = require('../utils/hooks');

require('./en');

exports.getSetGlobalLocale = _locales.getSetGlobalLocale;
exports.defineLocale = _locales.defineLocale;
exports.updateLocale = _locales.updateLocale;
exports.getLocale = _locales.getLocale;
exports.listLocales = _locales.listLocales;
exports.listMonths = _lists.listMonths;
exports.listMonthsShort = _lists.listMonthsShort;
exports.listWeekdays = _lists.listWeekdays;
exports.listWeekdaysShort = _lists.listWeekdaysShort;
exports.listWeekdaysMin = _lists.listWeekdaysMin; // Side effect imports

_hooks.hooks.lang = (0, _deprecate.deprecate)('moment.lang is deprecated. Use moment.locale instead.', _locales.getSetGlobalLocale);
_hooks.hooks.langData = (0, _deprecate.deprecate)('moment.langData is deprecated. Use moment.localeData instead.', _locales.getLocale);
},{"./prototype":30,"./locales":31,"./lists":32,"../utils/deprecate":33,"../utils/hooks":15,"./en":34}],94:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.abs = abs;
var mathAbs = Math.abs;

function abs() {
    var data = this._data;

    this._milliseconds = mathAbs(this._milliseconds);
    this._days = mathAbs(this._days);
    this._months = mathAbs(this._months);

    data.milliseconds = mathAbs(data.milliseconds);
    data.seconds = mathAbs(data.seconds);
    data.minutes = mathAbs(data.minutes);
    data.hours = mathAbs(data.hours);
    data.months = mathAbs(data.months);
    data.years = mathAbs(data.years);

    return this;
}
},{}],95:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.add = add;
exports.subtract = subtract;

var _create = require('./create');

function addSubtract(duration, input, value, direction) {
    var other = (0, _create.createDuration)(input, value);

    duration._milliseconds += direction * other._milliseconds;
    duration._days += direction * other._days;
    duration._months += direction * other._months;

    return duration._bubble();
}

// supports only 2.0-style add(1, 's') or add(duration)
function add(input, value) {
    return addSubtract(this, input, value, 1);
}

// supports only 2.0-style subtract(1, 's') or subtract(duration)
function subtract(input, value) {
    return addSubtract(this, input, value, -1);
}
},{"./create":37}],118:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = absCeil;
function absCeil(number) {
    if (number < 0) {
        return Math.floor(number);
    } else {
        return Math.ceil(number);
    }
}
},{}],97:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bubble = bubble;
exports.daysToMonths = daysToMonths;
exports.monthsToDays = monthsToDays;

var _absFloor = require('../utils/abs-floor');

var _absFloor2 = _interopRequireDefault(_absFloor);

var _absCeil = require('../utils/abs-ceil');

var _absCeil2 = _interopRequireDefault(_absCeil);

var _dateFromArray = require('../create/date-from-array');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bubble() {
    var milliseconds = this._milliseconds;
    var days = this._days;
    var months = this._months;
    var data = this._data;
    var seconds, minutes, hours, years, monthsFromDays;

    // if we have a mix of positive and negative values, bubble down first
    // check: https://github.com/moment/moment/issues/2166
    if (!(milliseconds >= 0 && days >= 0 && months >= 0 || milliseconds <= 0 && days <= 0 && months <= 0)) {
        milliseconds += (0, _absCeil2.default)(monthsToDays(months) + days) * 864e5;
        days = 0;
        months = 0;
    }

    // The following code bubbles up values, see the tests for
    // examples of what that means.
    data.milliseconds = milliseconds % 1000;

    seconds = (0, _absFloor2.default)(milliseconds / 1000);
    data.seconds = seconds % 60;

    minutes = (0, _absFloor2.default)(seconds / 60);
    data.minutes = minutes % 60;

    hours = (0, _absFloor2.default)(minutes / 60);
    data.hours = hours % 24;

    days += (0, _absFloor2.default)(hours / 24);

    // convert days to months
    monthsFromDays = (0, _absFloor2.default)(daysToMonths(days));
    months += monthsFromDays;
    days -= (0, _absCeil2.default)(monthsToDays(monthsFromDays));

    // 12 months -> 1 year
    years = (0, _absFloor2.default)(months / 12);
    months %= 12;

    data.days = days;
    data.months = months;
    data.years = years;

    return this;
}

function daysToMonths(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    // 400 years have 12 months === 4800
    return days * 4800 / 146097;
}

function monthsToDays(months) {
    // the reverse of daysToMonths
    return months * 146097 / 4800;
}
},{"../utils/abs-floor":117,"../utils/abs-ceil":118,"../create/date-from-array":105}],96:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.asYears = exports.asMonths = exports.asWeeks = exports.asDays = exports.asHours = exports.asMinutes = exports.asSeconds = exports.asMilliseconds = undefined;
exports.as = as;
exports.valueOf = valueOf;

var _bubble = require('./bubble');

var _aliases = require('../units/aliases');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function as(units) {
    if (!this.isValid()) {
        return NaN;
    }
    var days;
    var months;
    var milliseconds = this._milliseconds;

    units = (0, _aliases.normalizeUnits)(units);

    if (units === 'month' || units === 'year') {
        days = this._days + milliseconds / 864e5;
        months = this._months + (0, _bubble.daysToMonths)(days);
        return units === 'month' ? months : months / 12;
    } else {
        // handle milliseconds separately because of floating point math errors (issue #1867)
        days = this._days + Math.round((0, _bubble.monthsToDays)(this._months));
        switch (units) {
            case 'week':
                return days / 7 + milliseconds / 6048e5;
            case 'day':
                return days + milliseconds / 864e5;
            case 'hour':
                return days * 24 + milliseconds / 36e5;
            case 'minute':
                return days * 1440 + milliseconds / 6e4;
            case 'second':
                return days * 86400 + milliseconds / 1000;
            // Math.floor prevents floating point math errors here
            case 'millisecond':
                return Math.floor(days * 864e5) + milliseconds;
            default:
                throw new Error('Unknown unit ' + units);
        }
    }
}

// TODO: Use this.as('ms')?
function valueOf() {
    if (!this.isValid()) {
        return NaN;
    }
    return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + (0, _toInt2.default)(this._months / 12) * 31536e6;
}

function makeAs(alias) {
    return function () {
        return this.as(alias);
    };
}

var asMilliseconds = exports.asMilliseconds = makeAs('ms');
var asSeconds = exports.asSeconds = makeAs('s');
var asMinutes = exports.asMinutes = makeAs('m');
var asHours = exports.asHours = makeAs('h');
var asDays = exports.asDays = makeAs('d');
var asWeeks = exports.asWeeks = makeAs('w');
var asMonths = exports.asMonths = makeAs('M');
var asYears = exports.asYears = makeAs('y');
},{"./bubble":97,"../units/aliases":55,"../utils/to-int":88}],98:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clone = clone;

var _create = require('./create');

function clone() {
    return (0, _create.createDuration)(this);
}
},{"./create":37}],99:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.years = exports.months = exports.days = exports.hours = exports.minutes = exports.seconds = exports.milliseconds = undefined;
exports.get = get;
exports.weeks = weeks;

var _aliases = require('../units/aliases');

var _absFloor = require('../utils/abs-floor');

var _absFloor2 = _interopRequireDefault(_absFloor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(units) {
    units = (0, _aliases.normalizeUnits)(units);
    return this.isValid() ? this[units + 's']() : NaN;
}

function makeGetter(name) {
    return function () {
        return this.isValid() ? this._data[name] : NaN;
    };
}

var milliseconds = exports.milliseconds = makeGetter('milliseconds');
var seconds = exports.seconds = makeGetter('seconds');
var minutes = exports.minutes = makeGetter('minutes');
var hours = exports.hours = makeGetter('hours');
var days = exports.days = makeGetter('days');
var months = exports.months = makeGetter('months');
var years = exports.years = makeGetter('years');

function weeks() {
    return (0, _absFloor2.default)(this.days() / 7);
}
},{"../units/aliases":55,"../utils/abs-floor":117}],40:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetRelativeTimeRounding = getSetRelativeTimeRounding;
exports.getSetRelativeTimeThreshold = getSetRelativeTimeThreshold;
exports.humanize = humanize;

var _create = require('./create');

var round = Math.round;
var thresholds = {
    ss: 44, // a few seconds to seconds
    s: 45, // seconds to minute
    m: 45, // minutes to hour
    h: 22, // hours to day
    d: 26, // days to month
    M: 11 // months to year
};

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
    return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
}

function relativeTime(posNegDuration, withoutSuffix, locale) {
    var duration = (0, _create.createDuration)(posNegDuration).abs();
    var seconds = round(duration.as('s'));
    var minutes = round(duration.as('m'));
    var hours = round(duration.as('h'));
    var days = round(duration.as('d'));
    var months = round(duration.as('M'));
    var years = round(duration.as('y'));

    var a = seconds <= thresholds.ss && ['s', seconds] || seconds < thresholds.s && ['ss', seconds] || minutes <= 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours <= 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days <= 1 && ['d'] || days < thresholds.d && ['dd', days] || months <= 1 && ['M'] || months < thresholds.M && ['MM', months] || years <= 1 && ['y'] || ['yy', years];

    a[2] = withoutSuffix;
    a[3] = +posNegDuration > 0;
    a[4] = locale;
    return substituteTimeAgo.apply(null, a);
}

// This function allows you to set the rounding function for relative time strings
function getSetRelativeTimeRounding(roundingFunction) {
    if (roundingFunction === undefined) {
        return round;
    }
    if (typeof roundingFunction === 'function') {
        round = roundingFunction;
        return true;
    }
    return false;
}

// This function allows you to set a threshold for relative time strings
function getSetRelativeTimeThreshold(threshold, limit) {
    if (thresholds[threshold] === undefined) {
        return false;
    }
    if (limit === undefined) {
        return thresholds[threshold];
    }
    thresholds[threshold] = limit;
    if (threshold === 's') {
        thresholds.ss = limit - 1;
    }
    return true;
}

function humanize(withSuffix) {
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var locale = this.localeData();
    var output = relativeTime(this, !withSuffix, locale);

    if (withSuffix) {
        output = locale.pastFuture(+this, output);
    }

    return locale.postformat(output);
}
},{"./create":37}],100:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toISOString = toISOString;

var _absFloor = require('../utils/abs-floor');

var _absFloor2 = _interopRequireDefault(_absFloor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var abs = Math.abs;

function sign(x) {
    return (x > 0) - (x < 0) || +x;
}

function toISOString() {
    // for ISO strings we do not use the normal bubbling rules:
    //  * milliseconds bubble up until they become hours
    //  * days do not bubble at all
    //  * months bubble up until they become years
    // This is because there is no context-free conversion between hours and days
    // (think of clock changes)
    // and also not between days and months (28-31 days per month)
    if (!this.isValid()) {
        return this.localeData().invalidDate();
    }

    var seconds = abs(this._milliseconds) / 1000;
    var days = abs(this._days);
    var months = abs(this._months);
    var minutes, hours, years;

    // 3600 seconds -> 60 minutes -> 1 hour
    minutes = (0, _absFloor2.default)(seconds / 60);
    hours = (0, _absFloor2.default)(minutes / 60);
    seconds %= 60;
    minutes %= 60;

    // 12 months -> 1 year
    years = (0, _absFloor2.default)(months / 12);
    months %= 12;

    // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
    var Y = years;
    var M = months;
    var D = days;
    var h = hours;
    var m = minutes;
    var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
    var total = this.asSeconds();

    if (!total) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
    }

    var totalSign = total < 0 ? '-' : '';
    var ymSign = sign(this._months) !== sign(total) ? '-' : '';
    var daysSign = sign(this._days) !== sign(total) ? '-' : '';
    var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

    return totalSign + 'P' + (Y ? ymSign + Y + 'Y' : '') + (M ? ymSign + M + 'M' : '') + (D ? daysSign + D + 'D' : '') + (h || m || s ? 'T' : '') + (h ? hmsSign + h + 'H' : '') + (m ? hmsSign + m + 'M' : '') + (s ? hmsSign + s + 'S' : '');
}
},{"../utils/abs-floor":117}],38:[function(require,module,exports) {
'use strict';

var _constructor = require('./constructor');

var _abs = require('./abs');

var _addSubtract = require('./add-subtract');

var _as = require('./as');

var _bubble = require('./bubble');

var _clone = require('./clone');

var _get = require('./get');

var _humanize = require('./humanize');

var _isoString = require('./iso-string');

var _locale = require('../moment/locale');

var _valid = require('./valid');

var _deprecate = require('../utils/deprecate');

var proto = _constructor.Duration.prototype;

proto.isValid = _valid.isValid;
proto.abs = _abs.abs;
proto.add = _addSubtract.add;
proto.subtract = _addSubtract.subtract;
proto.as = _as.as;
proto.asMilliseconds = _as.asMilliseconds;
proto.asSeconds = _as.asSeconds;
proto.asMinutes = _as.asMinutes;
proto.asHours = _as.asHours;
proto.asDays = _as.asDays;
proto.asWeeks = _as.asWeeks;
proto.asMonths = _as.asMonths;
proto.asYears = _as.asYears;
proto.valueOf = _as.valueOf;
proto._bubble = _bubble.bubble;
proto.clone = _clone.clone;
proto.get = _get.get;
proto.milliseconds = _get.milliseconds;
proto.seconds = _get.seconds;
proto.minutes = _get.minutes;
proto.hours = _get.hours;
proto.days = _get.days;
proto.weeks = _get.weeks;
proto.months = _get.months;
proto.years = _get.years;
proto.humanize = _humanize.humanize;
proto.toISOString = _isoString.toISOString;
proto.toString = _isoString.toISOString;
proto.toJSON = _isoString.toISOString;
proto.locale = _locale.locale;
proto.localeData = _locale.localeData;

// Deprecations


proto.toIsoString = (0, _deprecate.deprecate)('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', _isoString.toISOString);
proto.lang = _locale.lang;
},{"./constructor":39,"./abs":94,"./add-subtract":95,"./as":96,"./bubble":97,"./clone":98,"./get":99,"./humanize":40,"./iso-string":100,"../moment/locale":81,"./valid":56,"../utils/deprecate":33}],19:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSetRelativeTimeThreshold = exports.getSetRelativeTimeRounding = exports.isDuration = exports.createDuration = undefined;

require('./prototype');

var _create = require('./create');

var _constructor = require('./constructor');

var _humanize = require('./humanize');

// Side effect imports
exports.createDuration = _create.createDuration;
exports.isDuration = _constructor.isDuration;
exports.getSetRelativeTimeRounding = _humanize.getSetRelativeTimeRounding;
exports.getSetRelativeTimeThreshold = _humanize.getSetRelativeTimeThreshold;
},{"./prototype":38,"./create":37,"./constructor":39,"./humanize":40}],50:[function(require,module,exports) {
'use strict';

var _format = require('../format/format');

var _regex = require('../parse/regex');

var _token = require('../parse/token');

var _toInt = require('../utils/to-int');

var _toInt2 = _interopRequireDefault(_toInt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FORMATTING

(0, _format.addFormatToken)('X', 0, 0, 'unix');
(0, _format.addFormatToken)('x', 0, 0, 'valueOf');

// PARSING

(0, _regex.addRegexToken)('x', _regex.matchSigned);
(0, _regex.addRegexToken)('X', _regex.matchTimestamp);
(0, _token.addParseToken)('X', function (input, array, config) {
    config._d = new Date(parseFloat(input, 10) * 1000);
});
(0, _token.addParseToken)('x', function (input, array, config) {
    config._d = new Date((0, _toInt2.default)(input));
});
},{"../format/format":91,"../parse/regex":92,"../parse/token":93,"../utils/to-int":88}],20:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeUnits = undefined;

require('./day-of-month');

require('./day-of-week');

require('./day-of-year');

require('./hour');

require('./millisecond');

require('./minute');

require('./month');

require('./offset');

require('./quarter');

require('./second');

require('./timestamp');

require('./timezone');

require('./week-year');

require('./week');

require('./year');

var _aliases = require('./aliases');

// Side effect imports
exports.normalizeUnits = _aliases.normalizeUnits;
},{"./day-of-month":41,"./day-of-week":42,"./day-of-year":43,"./hour":44,"./millisecond":46,"./minute":45,"./month":47,"./offset":35,"./quarter":48,"./second":49,"./timestamp":50,"./timezone":52,"./week-year":51,"./week":53,"./year":54,"./aliases":55}],13:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _hooks = require('./lib/utils/hooks');

var _moment = require('./lib/moment/moment');

var _calendar = require('./lib/moment/calendar');

var _locale = require('./lib/locale/locale');

var _duration = require('./lib/duration/duration');

var _units = require('./lib/units/units');

var _isDate = require('./lib/utils/is-date');

var _isDate2 = _interopRequireDefault(_isDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_hooks.hooks.version = '2.22.1'; //! moment.js
//! version : 2.22.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(0, _hooks.setHookCallback)(_moment.createLocal);

_hooks.hooks.fn = _moment.momentPrototype;
_hooks.hooks.min = _moment.min;
_hooks.hooks.max = _moment.max;
_hooks.hooks.now = _moment.now;
_hooks.hooks.utc = _moment.createUTC;
_hooks.hooks.unix = _moment.createUnix;
_hooks.hooks.months = _locale.listMonths;
_hooks.hooks.isDate = _isDate2.default;
_hooks.hooks.locale = _locale.getSetGlobalLocale;
_hooks.hooks.invalid = _moment.createInvalid;
_hooks.hooks.duration = _duration.createDuration;
_hooks.hooks.isMoment = _moment.isMoment;
_hooks.hooks.weekdays = _locale.listWeekdays;
_hooks.hooks.parseZone = _moment.createInZone;
_hooks.hooks.localeData = _locale.getLocale;
_hooks.hooks.isDuration = _duration.isDuration;
_hooks.hooks.monthsShort = _locale.listMonthsShort;
_hooks.hooks.weekdaysMin = _locale.listWeekdaysMin;
_hooks.hooks.defineLocale = _locale.defineLocale;
_hooks.hooks.updateLocale = _locale.updateLocale;
_hooks.hooks.locales = _locale.listLocales;
_hooks.hooks.weekdaysShort = _locale.listWeekdaysShort;
_hooks.hooks.normalizeUnits = _units.normalizeUnits;
_hooks.hooks.relativeTimeRounding = _duration.getSetRelativeTimeRounding;
_hooks.hooks.relativeTimeThreshold = _duration.getSetRelativeTimeThreshold;
_hooks.hooks.calendarFormat = _calendar.getCalendarFormat;
_hooks.hooks.prototype = _moment.momentPrototype;

// currently HTML5 input type only supports 24-hour formats
_hooks.hooks.HTML5_FMT = {
    DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
    DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
    DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
    DATE: 'YYYY-MM-DD', // <input type="date" />
    TIME: 'HH:mm', // <input type="time" />
    TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
    TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
    WEEK: 'YYYY-[W]WW', // <input type="week" />
    MONTH: 'YYYY-MM' // <input type="month" />
};

exports.default = _hooks.hooks;
},{"./lib/utils/hooks":15,"./lib/moment/moment":16,"./lib/moment/calendar":17,"./lib/locale/locale":18,"./lib/duration/duration":19,"./lib/units/units":20,"./lib/utils/is-date":21}],9:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMonthViewStartDay = getMonthViewStartDay;
exports.getMonthViewEndDay = getMonthViewEndDay;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMonthViewStartDay(date, firstDay, mode) {
  firstDay = parseInt(firstDay);
  // get cur month start day obj from data
  var start = (0, _moment2.default)(date);
  var startTemp = (0, _moment2.default)(start.startOf(mode));
  // subtract the start day & cur month start day
  // if cur day is Wed, the view start day should substract 2
  start.subtract(startTemp.day(), 'days');

  if (startTemp.day() < firstDay) {
    // if start day back of the view's first day
    // view start should substrat a week
    start.subtract(7, 'days');
  }

  // set final start day
  start.add(firstDay, 'days');
  return start;
}

function getMonthViewEndDay(date) {
  return this.getMonthViewStartDay().add(6, 'weeks');
}
},{"moment":13}],11:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  methods: {
    genWeekTitle: function genWeekTitle(h) {
      var titleCls = this.prefixCls + '-week-title';
      var titleData = this.weekDateShort || this.localeData[this.locale];
      var temp = this.firstDay - 1;

      var titleArr = titleData.map(function (date) {
        if (++temp >= 7) temp = 0;

        return h('div', {
          class: [titleCls + '-item']
        }, [titleData[temp]]);
      });

      return h('div', {
        class: [titleCls]
      }, [titleArr]);
    },
    genCalendateItem: function genCalendateItem(h) {
      var _this = this;

      var tempRow = this.genItemRow(h);
      var itemArr = [];

      this.monthData.map(function (data, index) {
        var item = h('div', {
          class: _this.prefixCls + '-day-item'
        }, [_this.$scopedSlots.default ? _this.$scopedSlots.default(data) : _this.$slots.default]);

        tempRow.children.push(item);

        if (index - 1 > 0 && (index + 1) % 7 === 0) {
          itemArr.push(tempRow);
          tempRow = _this.genItemRow(h);
        }
      });

      return h('div', {
        class: [this.prefixCls + '-body']
      }, [itemArr]);
    },
    genItemRow: function genItemRow(h) {
      var itemRow = h('div', {
        class: [this.prefixCls + '-body-row']
      }, []);
      return itemRow;
    }
  }
};
},{}],12:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  props: {
    renderHeader: Function
  },
  computed: {
    headerDateText: function headerDateText() {
      if (this.mode === 'week') {
        var startDay = (0, _moment2.default)(this.formatedDay).startOf('week').format('YYYY-MM-DD');
        var endDay = (0, _moment2.default)(this.formatedDay).endOf('week').format('YYYY-MM-DD');
        return startDay + ' - ' + endDay;
      } else {
        return (0, _moment2.default)(this.formatedDay).format('YYYY-MM');
      }
    }
  },
  methods: {
    genHeaderCenter: function genHeaderCenter(h) {
      var prevControl = h('a', {
        class: [this.prefixCls + '-control', this.prefixCls + '-prev'],
        on: {
          click: this.prev
        }
      }, [this.prevNode || '<']);

      var nextControl = h('a', {
        class: [this.prefixCls + '-control', this.prefixCls + '-next'],
        on: {
          click: this.next
        }
      }, [this.nextNode || '>']);

      var curMonth = h('span', {
        class: [this.prefixCls + '-header-date']
      }, [this.headerDateText]);

      console.log(this.$props);
      if (this.renderHeader) {
        return this.renderHeader({
          prev: this.prev,
          next: this.next,
          selectedDate: this.headerDateText
        });
      } else {
        return h('div', {
          class: [this.prefixCls + '-header-center']
        }, [prevControl, curMonth, nextControl]);
      }
    },
    genHeader: function genHeader(h) {
      var headerLeft = h('div', {
        class: [this.prefixCls + '-header-left']
      }, [this.$slots['header-left']]);

      var headerRight = h('div', {
        class: [this.prefixCls + '-header-right']
      }, [this.$slots['header-right']]);

      return h('div', {
        class: [this.prefixCls + '-header']
      }, [headerLeft, this.genHeaderCenter(h), headerRight]);
    }
  }
};
},{"moment":13}],22:[function(require,module,exports) {
var bundleURL = null;
function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp):\/\/[^)\n]+/g);
    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],14:[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();
  newLink.onload = function () {
    link.remove();
  };
  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;
function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":22}],10:[function(require,module,exports) {

        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
},{"_css_loader":14}],5:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _dateFunc = require('./date-func');

var _body = require('./components/body');

var _body2 = _interopRequireDefault(_body);

var _header = require('./components/header');

var _header2 = _interopRequireDefault(_header);

require('./style/calendar.less');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var prefixCls = 'vue-calendar';

function checkType(data) {
  return Object.prototype.toString.call(data);
}

exports.default = {
  name: prefixCls,
  mixins: [_body2.default, _header2.default],
  props: {
    startDate: [Number, String, Date],
    dateData: [Object, Array],
    matchKey: {
      type: String,
      default: 'date'
    },
    locale: {
      type: String,
      default: 'en'
    },
    firstDay: {
      type: Number,
      default: 0
    },
    mode: {
      type: String,
      default: 'month',
      validator: function validator(value) {
        return value === 'month' || value === 'week';
      }
    },
    prefixCls: {
      type: String,
      default: prefixCls
    },
    weekDateShort: Array,
    onMonthChange: Function,
    onPrev: Function,
    onNext: Function
  },
  computed: {
    formatedDay: function formatedDay() {
      return (0, _moment2.default)(this.currentDay);
    },
    monthData: function monthData() {
      var _this = this;

      var dateData = this.dateData,
          formatedDay = this.formatedDay,
          firstDay = this.firstDay,
          mode = this.mode;

      var dataType = checkType(dateData);

      if (!formatedDay) return [];

      var monthViewStartDate = (0, _dateFunc.getMonthViewStartDay)(formatedDay, firstDay, mode);
      var monthData = [];
      var row = 6;

      if (this.mode === 'week') row = 1;

      var _loop = function _loop(day) {
        var data = [];
        if (dataType === '[object Object]') {
          Object.keys(dateData).forEach(function (item) {
            if (monthViewStartDate.isSame((0, _moment2.default)(new Date(item)), 'day')) {
              data.push(dateData[item]);
            }
          });
        } else if (dataType === '[object Array]') {
          data = dateData.filter(function (item) {
            return monthViewStartDate.isSame((0, _moment2.default)(new Date(item[_this.matchKey])), 'day');
          });
        }

        monthData.push(_extends({}, _this.getItemStatus(monthViewStartDate), {
          data: data || {},
          date: {
            year: monthViewStartDate.year(),
            month: monthViewStartDate.month() + 1,
            date: monthViewStartDate.date(),
            day: monthViewStartDate.day(),
            full: monthViewStartDate.format('YYYY-MM-DD')
          }
        }));

        monthViewStartDate.add(1, 'day');
      };

      for (var day = 0; day < 7 * row; day++) {
        _loop(day);
      }

      return monthData;
    }
  },
  methods: {
    changeDate: function changeDate(date) {
      if (typeof date !== 'string' && Object.prototype.toString.call(date) !== '[object Date]') {
        console.error('invalied date!');
        return false;
      }

      this.currentDay = date;
    },
    prev: function prev() {
      this.currentDay = this.formatedDay.subtract(1, this.mode + 's').startOf(this.mode).format('YYYY-MM-DD');

      this.onPrev && this.onPrev({
        startDay: this.monthData[0].date,
        endDay: this.monthData[this.monthData.length - 1].date
      });
    },
    next: function next() {
      this.currentDay = this.formatedDay.add(1, this.mode + 's').startOf(this.mode).format('YYYY-MM-DD');

      this.onNext && this.onNext({
        startDay: this.monthData[0].date,
        endDay: this.monthData[this.monthData.length - 1].date
      });
    },
    getItemStatus: function getItemStatus(date) {
      var isCurMonth = date.isSame(this.formatedDay, 'month');
      var isPrevLastDay = false;
      var isNextFirstDay = false;

      var isPrevMonth = !isCurMonth && date.isBefore(this.formatedDay, 'month');
      var isNextMonth = !isCurMonth && date.isAfter(this.formatedDay, 'month');

      isPrevMonth && (isPrevLastDay = date.isSame((0, _moment2.default)(date).endOf('month').format('YYYY-MM-DD')));
      isNextMonth && (isNextFirstDay = date.isSame((0, _moment2.default)(date).startOf('month').format('YYYY-MM-DD')));

      return {
        isPrevMonth: isPrevMonth,
        isPrevLastDay: isPrevLastDay,
        isNextMonth: isNextMonth,
        isNextFirstDay: isNextFirstDay,
        isToday: date.isSame((0, _moment2.default)(this.today), 'day'),
        isCurMonth: isCurMonth
      };
    },
    changeViewData: function changeViewData() {
      this.onMonthChange && this.onMonthChange({
        startDay: this.monthData[0].date,
        endDay: this.monthData[this.monthData.length - 1].date
      });
    }
  },
  watch: {
    startDate: {
      immediate: true,
      handler: function handler(val) {
        this.currentDay = val ? new Date(val) : new Date();

        if (!this.today) {
          this.today = val;
        }
      }
    },
    currentDay: {
      immediate: true,
      handler: function handler(val, oval) {
        // if (val.isSame(oval, 'day')) return
        // this.$emit('input', val.format('YYYY-MM-DD'))

        this.changeViewData();
      }
    },
    mode: function mode(val) {
      this.changeViewData();
    }
  },
  data: function data() {
    return {
      today: '',
      currentDay: null,
      localeData: {
        'zh-cn': '周日_周一_周二_周三_周四_周五_周六'.split('_'),
        'en': 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_')
      }
    };
  },
  render: function render(h) {
    return h('div', {
      class: [this.prefixCls, 'is-' + this.mode]
    }, [this.genHeader(h), this.genWeekTitle(h), this.genCalendateItem(h)]);
  }
};
},{"moment":13,"./date-func":9,"./components/body":11,"./components/header":12,"./style/calendar.less":10}],6:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();

var ArrayData = [{
  date: year + '-' + month + '-' + day,
  title: 'buy something'
}, {
  date: year + '-' + month + '-' + day,
  title: 'shopping'
}, {
  date: year + '-' + (month + 1) + '-2',
  title: 'remember homework'
}, {
  date: year + '-' + (month + 1) + '-15',
  title: 'music festival'
}, {
  date: year + '-' + (month + 2) + '-6',
  title: 'a course of lectures'
}];
var ObjectData = {};

ArrayData.forEach(function (item) {
  ObjectData[item.date] = { title: item.title };
});

exports.default = {
  Array: ArrayData,
  Object: ObjectData
};
},{}],7:[function(require,module,exports) {
var Vue // late bind
var version
var map = (window.__VUE_HOT_MAP__ = Object.create(null))
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) { return }
  installed = true

  Vue = vue.__esModule ? vue.default : vue
  version = Vue.version.split('.').map(Number)
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = version[0] >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
        'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if(map[id]) { return }
  
  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  }
}

/**
 * Check if module is recorded
 *
 * @param {String} id
 */

exports.isRecorded = function (id) {
  return typeof map[id] !== 'undefined'
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render
    options.render = function (h, ctx) {
      var instances = map[id].instances
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
  } else {
    injectHook(options, initHookName, function() {
      var record = map[id]
      if (!record.Ctor) {
        record.Ctor = this.constructor
      }
      record.instances.push(this)
    })
    injectHook(options, 'beforeDestroy', function() {
      var instances = map[id].instances
      instances.splice(instances.indexOf(this), 1)
    })
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        'Something went wrong during Vue component hot-reload. Full reload required.'
      )
    }
  }
}

function updateOptions (oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key]
    }
  }
  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1]
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate()
    })
    return
  }
  if (typeof options === 'function') {
    options = options.options
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      // reset static trees
      // pre 2.5, all static trees are cahced together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = []
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = []
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = []
      }
      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)
      instance.$forceUpdate()
    })
  } else {
    // functional or no instance created yet
    record.options.render = options.render
    record.options.staticRenderFns = options.staticRenderFns

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options)
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles
        if (injectStyles) {
          var render = options.render
          record.options.render = function (h, ctx) {
            injectStyles.call(ctx)
            return render(h, ctx)
          }
        }
      }
      record.options._Ctor = null
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = []
      }
      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate()
      })
    }
  }
})

exports.reload = tryWrap(function (id, options) {
  var record = map[id]
  if (options) {
    if (typeof options === 'function') {
      options = options.options
    }
    makeOptionsHot(id, options)
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options
      }
      var newCtor = record.Ctor.super.extend(options)
      record.Ctor.options = newCtor.options
      record.Ctor.cid = newCtor.cid
      record.Ctor.prototype = newCtor.prototype
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release()
      }
    } else {
      updateOptions(record.options, options)
    }
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn(
        'Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
})

},{}],3:[function(require,module,exports) {
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert(".vue-calendar {\n  background: #fff;\n  display: flex;\n  flex-direction: column;\n}\n.vue-calendar-header {\n  position: relative;\n  padding: 20px;\n  display: flex;\n  align-items: center;\n}\n.vue-calendar-header-center {\n  flex: 1;\n  text-align: center;\n  font-size: 14px;\n  color: #19a0ff;\n}\n.vue-calendar-header-left,\n.vue-calendar-header-right {\n  flex: 1;\n}\n.vue-calendar-header-date {\n  display: inline-block;\n  margin: 0 32px;\n}\n.vue-calendar-control {\n  cursor: pointer;\n}\n.vue-calendar-week-title {\n  display: flex;\n  border-color: #e8ebee;\n  border-style: solid;\n  border-width: 1px 0 1px 1px;\n}\n.vue-calendar-week-title-item {\n  flex: 1;\n  height: 30px;\n  line-height: 30px;\n  padding: 0 15px;\n  color: #19a0ff;\n}\n.vue-calendar-body {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n}\n.vue-calendar-body-row {\n  flex: 1;\n  display: flex;\n  height: 5em;\n}\n.vue-calendar-day-item {\n  flex: 1;\n  overflow: hidden;\n  border-color: #e8ebee;\n  border-style: solid;\n  border-width: 0 0 1px 1px;\n}\n* {\n  box-sizing: border-box;\n}\nbody,\nhtml {\n  height: 100%;\n  margin: 0;\n  padding: 0;\n}\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  color: #333;\n  background-image: linear-gradient(60deg, #fb7bb0, #fb7bce);\n}\nh1,\nh2 {\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 3px 1px #f81875;\n  margin: 0;\n  font-family: Georgia, 'Times New Roman', Times, serif;\n}\nh1 {\n  font-size: 2.4rem;\n}\n.page-container {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  padding-top: 40px;\n}\n.container {\n  width: 80%;\n  margin: 0 auto;\n  flex: 1;\n  height: 100%;\n}\n.ui-calendar {\n  margin-top: 20px;\n  box-shadow: 0 1px 5px #f81875;\n  border-radius: 5px;\n  height: 90%;\n}\n.ui-calendar-header__left > button {\n  font-size: 12px;\n}\n.ui-calendar-header__left > button:nth-child(2) {\n  margin-left: -4px;\n}\n.ui-calendar-modeBtn {\n  position: relative;\n  display: inline-block;\n  background: #fff;\n  border: 1px solid #ff7dc5;\n  color: #ff7dc5;\n  padding: 5px 1em;\n  font-size: 13px;\n  line-height: 1;\n  box-shadow: 0 1px 3px #ffcae7;\n  min-width: 5em;\n  margin-right: -1px;\n  text-align: center;\n  cursor: pointer;\n}\n.ui-calendar-modeBtn:first-child {\n  border-top-left-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.ui-calendar-modeBtn:last-child {\n  border-bottom-right-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.ui-calendar-modeBtn:active,\n.ui-calendar-modeBtn:focus {\n  outline: none;\n}\n.ui-calendar-modeBtn.active,\n.ui-calendar-modeBtn:active {\n  background: #ff7dc5;\n  color: #fff;\n  z-index: 2;\n}\n.ui-calendar .k-calendar-header-center {\n  color: #ff7dc5;\n}\n.ui-calendar .k-calendar-week-title-item {\n  color: #ff7dc5;\n}\n.ui-calendar-item {\n  padding: 5px 10px;\n  color: #666;\n}\n.ui-calendar-item.is-otherMonth {\n  color: #bbb;\n}\n.ui-calendar-item-name {\n  font-size: 12px;\n}\n.ui-calendar-item-name > * {\n  vertical-align: middle;\n}\n.ui-calendar-item-name .del {\n  display: inline-block;\n  cursor: pointer;\n  color: inherit;\n  margin-bottom: -2px;\n}\n.ui-calendar .vue-calendar-body-row {\n  height: auto;\n}");(function () {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _calendar = require('../src/calendar');

  var _calendar2 = _interopRequireDefault(_calendar);

  var _data2 = require('./data');

  var _data3 = _interopRequireDefault(_data2);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }

  exports.default = {
    name: 'App',
    components: {
      Calendar: _calendar2.default
    },
    data: function data() {
      return {
        currMonth: '',
        dateData: _data3.default.Array,
        mode: 'month'
      };
    },

    methods: {
      onMonthChange: function onMonthChange(val) {
        console.log(val);
      },
      changeDate: function changeDate() {
        this.$refs.calendar.changeDate('2017-12-12');
      },
      deleteItem: function deleteItem(title) {
        this.dateData = this.dateData.filter(function (item) {
          return item.title !== title;
        });
      },
      renderHeader: function renderHeader(_ref) {
        var prev = _ref.prev,
            next = _ref.next,
            selectedDate = _ref.selectedDate;

        var h = this.$createElement;

        var prevButton = h('div', {
          class: ['ui-calendar-modeBtn'],
          on: {
            click: prev
          }
        }, ['prev']);

        var nextButton = h('div', {
          class: ['ui-calendar-modeBtn'],
          on: {
            click: next
          }
        }, ['next']);

        var dateText = h('div', { class: ['ui-calendar-modeBtn'] }, [selectedDate]);
        return h('div', [prevButton, dateText, nextButton]);
      }
    }
  };
})();
if (module.exports.__esModule) module.exports = module.exports.default;
var __vue__options__ = typeof module.exports === "function" ? module.exports.options : module.exports;
if (__vue__options__.functional) {
  console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.");
}
__vue__options__.render = function render() {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "page-container" }, [_c('h1', [_vm._v("A Vue2 Full Calendar")]), _vm._v(" "), _c('h2', { on: { "click": _vm.changeDate } }, [_vm._v("Has month and week two mode. And you can custom all style")]), _vm._v(" "), _c('div', { staticClass: "container" }, [_c('Calendar', { ref: "calendar", staticClass: "ui-calendar", attrs: { "start-day": _vm.currMonth, "dateData": _vm.dateData, "on-month-change": _vm.onMonthChange, "mode": _vm.mode, "render-header": _vm.renderHeader }, scopedSlots: _vm._u([{ key: "default", fn: function fn(item) {
        return _c('div', { class: ['ui-calendar-item', { 'is-otherMonth': item.isPrevMonth || item.isNextMonth }] }, [_c('div', { class: ['ui-calendar-item-date'] }, [_vm._v("\n          " + _vm._s(item.date.date) + "\n        ")]), _vm._v(" "), _vm._l(item.data, function (item, index) {
          return _c('div', { key: index, staticClass: "ui-calendar-item-name" }, [_c('span', [_vm._v(_vm._s(item.title))]), _vm._v(" "), _c('span', { staticClass: "del", on: { "click": function click($event) {
                _vm.deleteItem(item.title);
              } } }, [_vm._v("✖️")])]);
        })], 2);
      } }]) }, [_c('div', { staticClass: "ui-calendar-header__left", attrs: { "slot": "header-left" }, slot: "header-left" }, [_c('button', { class: ['ui-calendar-modeBtn', { active: _vm.mode === 'month' }], on: { "click": function click($event) {
        _vm.mode = 'month';
      } } }, [_vm._v("\n          Month\n        ")]), _vm._v(" "), _c('button', { class: ['ui-calendar-modeBtn', { active: _vm.mode === 'week' }], on: { "click": function click($event) {
        _vm.mode = 'week';
      } } }, [_vm._v("\n          Week\n        ")])])])], 1)]);
};
__vue__options__.staticRenderFns = [];
if (module.hot) {
  (function () {
    var hotAPI = require("vue-hot-reload-api");
    hotAPI.install(require("vue"), true);
    if (!hotAPI.compatible) return;
    module.hot.accept();
    module.hot.dispose(__vueify_style_dispose__);
    if (!module.hot.data) {
      hotAPI.createRecord("data-v-2f2a56e4", __vue__options__);
    } else {
      hotAPI.rerender("data-v-2f2a56e4", __vue__options__);
    }
  })();
}
},{"vueify/lib/insert-css":8,"../src/calendar":5,"./data":6,"vue-hot-reload-api":7,"vue":4}],2:[function(require,module,exports) {
'use strict';

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _App = require('./App.vue');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-new */
new _vue2.default({
  el: '#app',
  components: {
    App: _App2.default
  },
  render: function render(h) {
    return h(_App2.default);
  }
});
},{"vue":4,"./App.vue":3}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(config) {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    },
    data: config && config.hot
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://localhost:53888/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id, undefined, {
    hot: true
  });

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,2])