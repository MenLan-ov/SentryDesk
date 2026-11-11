// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// node_modules/.pnpm/@vue+shared@3.5.45/node_modules/@vue/shared/dist/shared.esm-bundler.js
/**
* @vue/shared v3.5.45
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
	const map = /* @__PURE__ */ Object.create(null);
	for (const key of str.split(",")) map[key] = 1;
	return (val) => val in map;
}
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var NOOP = () => {};
var NO = () => false;
var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
var isModelListener = (key) => key.startsWith("onUpdate:");
var extend = Object.assign;
var remove = (arr, el) => {
	const i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
};
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isSet = (val) => toTypeString(val) === "[object Set]";
var isDate = (val) => toTypeString(val) === "[object Date]";
var isFunction = (val) => typeof val === "function";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var isPromise = (val) => {
	return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
	return toTypeString(value).slice(8, -1);
};
var isPlainObject = (val) => toTypeString(val) === "[object Object]";
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
var cacheStringFunction = (fn) => {
	const cache = /* @__PURE__ */ Object.create(null);
	return ((str) => {
		return cache[str] || (cache[str] = fn(str));
	});
};
var camelizeRE = /-\w/g;
var camelize = /* @__PURE__ */ cacheStringFunction((str) => {
	return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = /* @__PURE__ */ cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = /* @__PURE__ */ cacheStringFunction((str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
});
var toHandlerKey = /* @__PURE__ */ cacheStringFunction((str) => {
	return str ? `on${capitalize(str)}` : ``;
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var invokeArrayFns = (fns, ...arg) => {
	for (let i = 0; i < fns.length; i++) fns[i](...arg);
};
var def = (obj, key, value, writable = false) => {
	Object.defineProperty(obj, key, {
		configurable: true,
		enumerable: false,
		writable,
		value
	});
};
var looseToNumber = (val) => {
	const n = parseFloat(val);
	return isNaN(n) ? val : n;
};
var toNumber = (val) => {
	const n = isString(val) ? Number(val) : NaN;
	return isNaN(n) ? val : n;
};
var _globalThis;
var getGlobalThis = () => {
	return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
	if (isArray(value)) {
		const res = {};
		for (let i = 0; i < value.length; i++) {
			const item = value[i];
			const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
			if (normalized) for (const key in normalized) res[key] = normalized[key];
		}
		return res;
	} else if (isString(value) || isObject(value)) return value;
}
var listDelimiterRE = /;(?![^(]*\))/g;
var propertyDelimiterRE = /:([^]+)/;
var styleCommentRE = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
	const ret = {};
	cssText.replace(styleCommentRE, (match) => match.startsWith("/*") ? "" : match).split(listDelimiterRE).forEach((item) => {
		if (item) {
			const tmp = item.split(propertyDelimiterRE);
			tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
		}
	});
	return ret;
}
function normalizeClass(value) {
	let res = "";
	if (isString(value)) res = value;
	else if (isArray(value)) for (let i = 0; i < value.length; i++) {
		const normalized = normalizeClass(value[i]);
		if (normalized) res += normalized + " ";
	}
	else if (isObject(value)) {
		for (const name in value) if (value[name]) res += name + " ";
	}
	return res.trim();
}
var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(`itemscope,allowfullscreen,disablepictureinpicture,disableremoteplayback,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly`);
function includeBooleanAttr(value) {
	return !!value || value === "";
}
function looseCompareArrays(a, b, seen) {
	if (a.length !== b.length) return false;
	let equal = true;
	for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i], seen);
	return equal;
}
function looseCompareCollections(a, b, seen) {
	if (a.size !== b.size) return false;
	const candidates = Array.from(b);
	const matched = new Uint8Array(candidates.length);
	for (const item of a) {
		let index = -1;
		for (let i = 0; i < candidates.length; i++) if (!matched[i] && looseEqual(item, candidates[i], seen)) {
			index = i;
			break;
		}
		if (index < 0) return false;
		matched[index] = 1;
	}
	return true;
}
function looseCompareObjects(a, b, seen) {
	let aValidType = isMap(a);
	let bValidType = isMap(b);
	if (aValidType || bValidType) return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
	aValidType = isSet(a);
	bValidType = isSet(b);
	if (aValidType || bValidType) return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
	if (Object.keys(a).length !== Object.keys(b).length) return false;
	for (const key in a) {
		const aHasKey = a.hasOwnProperty(key);
		const bHasKey = b.hasOwnProperty(key);
		if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key], seen)) return false;
	}
	return String(a) === String(b);
}
function looseCompareNested(a, b, seen, compare) {
	if (!seen) seen = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	const [seenA, seenB] = seen;
	if (seenA.has(a) || seenB.has(b)) return seenA.get(a) === b && seenB.get(b) === a;
	seenA.set(a, b);
	seenB.set(b, a);
	const equal = compare(a, b, seen);
	seenA.delete(a);
	seenB.delete(b);
	return equal;
}
function looseEqual(a, b, seen) {
	if (a === b) return true;
	let aValidType = isDate(a);
	let bValidType = isDate(b);
	if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
	aValidType = isSymbol(a);
	bValidType = isSymbol(b);
	if (aValidType || bValidType) return a === b;
	aValidType = isArray(a);
	bValidType = isArray(b);
	if (aValidType || bValidType) return aValidType && bValidType ? looseCompareNested(a, b, seen, looseCompareArrays) : false;
	aValidType = isObject(a);
	bValidType = isObject(b);
	if (aValidType || bValidType) {
		if (!aValidType || !bValidType) return false;
		return looseCompareNested(a, b, seen, looseCompareObjects);
	}
	return String(a) === String(b);
}
function looseIndexOf(arr, val) {
	return arr.findIndex((item) => looseEqual(item, val));
}
var isRef$1 = (val) => {
	return !!(val && val["__v_isRef"] === true);
};
var toDisplayString = (val) => {
	return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
var replacer = (_key, val) => {
	if (isRef$1(val)) return replacer(_key, val.value);
	else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
		entries[stringifySymbol(key, i) + " =>"] = val2;
		return entries;
	}, {}) };
	else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
	else if (isSymbol(val)) return stringifySymbol(val);
	else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
	return val;
};
var stringifySymbol = (v, i = "") => {
	var _a;
	return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
};
// node_modules/.pnpm/@vue+reactivity@3.5.45/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
/**
* @vue/reactivity v3.5.45
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var activeEffectScope;
var EffectScope = class {
	constructor(detached = false) {
		this.detached = detached;
		/**
		* @internal
		*/
		this._active = true;
		/**
		* @internal track `on` calls, allow `on` call multiple times
		*/
		this._on = 0;
		/**
		* @internal
		*/
		this.effects = [];
		/**
		* @internal
		*/
		this.cleanups = [];
		this._isPaused = false;
		this._warnOnRun = true;
		this.__v_skip = true;
		if (!detached && activeEffectScope) {
			if (activeEffectScope.active) {
				this.parent = activeEffectScope;
				this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
			} else {
				this._active = false;
				this._warnOnRun = false;
			}
		}
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = true;
			let i, l;
			if (this.scopes) {
				const scopes = this.scopes.slice();
				for (i = 0, l = scopes.length; i < l; i++) scopes[i].pause();
			}
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
		}
	}
	/**
	* Resumes the effect scope, including all child scopes and effects.
	*/
	resume() {
		if (this._active) {
			if (this._isPaused) {
				this._isPaused = false;
				let i, l;
				if (this.scopes) {
					const scopes = this.scopes.slice();
					for (i = 0, l = scopes.length; i < l; i++) scopes[i].resume();
				}
				const effects = this.effects.slice();
				for (i = 0, l = effects.length; i < l; i++) effects[i].resume();
			}
		}
	}
	run(fn) {
		if (this._active) {
			const currentEffectScope = activeEffectScope;
			try {
				activeEffectScope = this;
				return fn();
			} finally {
				activeEffectScope = currentEffectScope;
			}
		}
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	on() {
		if (++this._on === 1) {
			this.prevScope = activeEffectScope;
			activeEffectScope = this;
		}
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (activeEffectScope === this) activeEffectScope = this.prevScope;
			else {
				let current = activeEffectScope;
				while (current) {
					if (current.prevScope === this) {
						current.prevScope = this.prevScope;
						break;
					}
					current = current.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(fromParent) {
		if (this._active) {
			this._active = false;
			let i, l;
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
			this.effects.length = 0;
			for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
			this.cleanups.length = 0;
			if (this.scopes) {
				const scopes = this.scopes.slice();
				for (i = 0, l = scopes.length; i < l; i++) scopes[i].stop(true);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !fromParent) {
				const last = this.parent.scopes.pop();
				if (last && last !== this) {
					this.parent.scopes[this.index] = last;
					last.index = this.index;
				}
			}
			this.parent = void 0;
		}
	}
};
function getCurrentScope() {
	return activeEffectScope;
}
var activeSub;
var pausedQueueEffects = /* @__PURE__ */ new WeakSet();
var ReactiveEffect = class {
	constructor(fn) {
		this.fn = fn;
		/**
		* @internal
		*/
		this.deps = void 0;
		/**
		* @internal
		*/
		this.depsTail = void 0;
		/**
		* @internal
		*/
		this.flags = 5;
		/**
		* @internal
		*/
		this.next = void 0;
		/**
		* @internal
		*/
		this.cleanup = void 0;
		this.scheduler = void 0;
		if (activeEffectScope) {
			if (activeEffectScope.active) activeEffectScope.effects.push(this);
			else this.flags &= -2;
		}
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		if (this.flags & 64) {
			this.flags &= -65;
			if (pausedQueueEffects.has(this)) {
				pausedQueueEffects.delete(this);
				this.trigger();
			}
		}
	}
	/**
	* @internal
	*/
	notify() {
		if (this.flags & 2 && !(this.flags & 32)) return;
		if (!(this.flags & 8)) batch(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2;
		cleanupEffect(this);
		prepareDeps(this);
		const prevEffect = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = this;
		shouldTrack = true;
		try {
			return this.fn();
		} finally {
			cleanupDeps(this);
			activeSub = prevEffect;
			shouldTrack = prevShouldTrack;
			this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let link = this.deps; link; link = link.nextDep) removeSub(link);
			this.deps = this.depsTail = void 0;
			cleanupEffect(this);
			this.onStop && this.onStop();
			this.flags &= -2;
		}
	}
	trigger() {
		if (this.flags & 64) pausedQueueEffects.add(this);
		else if (this.scheduler) this.scheduler();
		else this.runIfDirty();
	}
	/**
	* @internal
	*/
	runIfDirty() {
		if (isDirty(this)) this.run();
	}
	get dirty() {
		return isDirty(this);
	}
};
var batchDepth = 0;
var batchedSub;
var batchedComputed;
function batch(sub, isComputed = false) {
	sub.flags |= 8;
	if (isComputed) {
		sub.next = batchedComputed;
		batchedComputed = sub;
		return;
	}
	sub.next = batchedSub;
	batchedSub = sub;
}
function startBatch() {
	batchDepth++;
}
function endBatch() {
	if (--batchDepth > 0) return;
	if (batchedComputed) {
		let e = batchedComputed;
		batchedComputed = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			e = next;
		}
	}
	let error;
	while (batchedSub) {
		let e = batchedSub;
		batchedSub = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			if (e.flags & 1) try {
				e.trigger();
			} catch (err) {
				if (!error) error = err;
			}
			e = next;
		}
	}
	if (error) throw error;
}
function prepareDeps(sub) {
	for (let link = sub.deps; link; link = link.nextDep) {
		link.version = -1;
		link.prevActiveLink = link.dep.activeLink;
		link.dep.activeLink = link;
	}
}
function cleanupDeps(sub) {
	let head;
	let tail = sub.depsTail;
	let link = tail;
	while (link) {
		const prev = link.prevDep;
		if (link.version === -1) {
			if (link === tail) tail = prev;
			removeSub(link);
			removeDep(link);
		} else head = link;
		link.dep.activeLink = link.prevActiveLink;
		link.prevActiveLink = void 0;
		link = prev;
	}
	sub.deps = head;
	sub.depsTail = tail;
}
function isDirty(sub) {
	for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
	if (sub._dirty) return true;
	return false;
}
function refreshComputed(computed) {
	if (computed.flags & 4 && !(computed.flags & 16)) return;
	computed.flags &= -17;
	if (computed.globalVersion === globalVersion) return;
	computed.globalVersion = globalVersion;
	if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
	computed.flags |= 2;
	const dep = computed.dep;
	const prevSub = activeSub;
	const prevShouldTrack = shouldTrack;
	activeSub = computed;
	shouldTrack = true;
	try {
		prepareDeps(computed);
		const value = computed.fn(computed._value);
		if (dep.version === 0 || hasChanged(value, computed._value)) {
			computed.flags |= 128;
			computed._value = value;
			dep.version++;
		}
	} catch (err) {
		dep.version++;
		throw err;
	} finally {
		activeSub = prevSub;
		shouldTrack = prevShouldTrack;
		cleanupDeps(computed);
		computed.flags &= -3;
	}
}
function removeSub(link, soft = false) {
	const { dep, prevSub, nextSub } = link;
	if (prevSub) {
		prevSub.nextSub = nextSub;
		link.prevSub = void 0;
	}
	if (nextSub) {
		nextSub.prevSub = prevSub;
		link.nextSub = void 0;
	}
	if (dep.subs === link) {
		dep.subs = prevSub;
		if (!prevSub && dep.computed) {
			dep.computed.flags &= -5;
			for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
		}
	}
	if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
}
function removeDep(link) {
	const { prevDep, nextDep } = link;
	if (prevDep) {
		prevDep.nextDep = nextDep;
		link.prevDep = void 0;
	}
	if (nextDep) {
		nextDep.prevDep = prevDep;
		link.nextDep = void 0;
	}
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
	trackStack.push(shouldTrack);
	shouldTrack = false;
}
function resetTracking() {
	const last = trackStack.pop();
	shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
	const { cleanup } = e;
	e.cleanup = void 0;
	if (cleanup) {
		const prevSub = activeSub;
		activeSub = void 0;
		try {
			cleanup();
		} finally {
			activeSub = prevSub;
		}
	}
}
var globalVersion = 0;
var Link = class {
	constructor(sub, dep) {
		this.sub = sub;
		this.dep = dep;
		this.version = dep.version;
		this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
};
var Dep = class {
	constructor(computed) {
		this.computed = computed;
		this.version = 0;
		/**
		* Link between this dep and the current active effect
		*/
		this.activeLink = void 0;
		/**
		* Doubly linked list representing the subscribing effects (tail)
		*/
		this.subs = void 0;
		/**
		* For object property deps cleanup
		*/
		this.map = void 0;
		this.key = void 0;
		/**
		* Subscriber counter
		*/
		this.sc = 0;
		/**
		* @internal
		*/
		this.__v_skip = true;
	}
	track(debugInfo) {
		if (!activeSub || !shouldTrack || activeSub === this.computed) return;
		let link = this.activeLink;
		if (link === void 0 || link.sub !== activeSub) {
			link = this.activeLink = new Link(activeSub, this);
			if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
			else {
				link.prevDep = activeSub.depsTail;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
			}
			addSub(link);
		} else if (link.version === -1) {
			link.version = this.version;
			if (link.nextDep) {
				const next = link.nextDep;
				next.prevDep = link.prevDep;
				if (link.prevDep) link.prevDep.nextDep = next;
				link.prevDep = activeSub.depsTail;
				link.nextDep = void 0;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
				if (activeSub.deps === link) activeSub.deps = next;
			}
		}
		return link;
	}
	trigger(debugInfo) {
		this.version++;
		globalVersion++;
		this.notify(debugInfo);
	}
	notify(debugInfo) {
		startBatch();
		try {
			for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
		} finally {
			endBatch();
		}
	}
};
function addSub(link) {
	link.dep.sc++;
	if (link.sub.flags & 4) {
		const computed = link.dep.computed;
		if (computed && !link.dep.subs) {
			computed.flags |= 20;
			for (let l = computed.deps; l; l = l.nextDep) addSub(l);
		}
		const currentTail = link.dep.subs;
		if (currentTail !== link) {
			link.prevSub = currentTail;
			if (currentTail) currentTail.nextSub = link;
		}
		link.dep.subs = link;
	}
}
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = /* @__PURE__ */ Symbol("");
var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol("");
var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol("");
function track(target, type, key) {
	if (shouldTrack && activeSub) {
		let depsMap = targetMap.get(target);
		if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
		let dep = depsMap.get(key);
		if (!dep) {
			depsMap.set(key, dep = new Dep());
			dep.map = depsMap;
			dep.key = key;
		}
		dep.track();
	}
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
	const depsMap = targetMap.get(target);
	if (!depsMap) {
		globalVersion++;
		return;
	}
	const run = (dep) => {
		if (dep) dep.trigger();
	};
	startBatch();
	if (type === "clear") depsMap.forEach(run);
	else {
		const targetIsArray = isArray(target);
		const isArrayIndex = targetIsArray && isIntegerKey(key);
		if (targetIsArray && key === "length") {
			const newLength = Number(newValue);
			depsMap.forEach((dep, key2) => {
				if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
			});
		} else {
			if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
			if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
			switch (type) {
				case "add":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					} else if (isArrayIndex) run(depsMap.get("length"));
					break;
				case "delete":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					}
					break;
				case "set": if (isMap(target)) run(depsMap.get(ITERATE_KEY));
			}
		}
	}
	endBatch();
}
function reactiveReadArray(array) {
	const raw = /* @__PURE__ */ toRaw(array);
	if (raw === array) return raw;
	track(raw, "iterate", ARRAY_ITERATE_KEY);
	if (/* @__PURE__ */ isShallow(array)) return raw;
	if (!/* @__PURE__ */ isReadonly(array)) return raw.map(toReactive);
	return /* @__PURE__ */ isReactive(array) ? raw.map((item) => toReadonly(toReactive(item))) : raw.map(toReadonly);
}
function shallowReadArray(arr) {
	track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
	return arr;
}
function toWrapped(target, item) {
	if (/* @__PURE__ */ isReadonly(target)) return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
	return toReactive(item);
}
var arrayInstrumentations = {
	__proto__: null,
	[Symbol.iterator]() {
		return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
	},
	concat(...args) {
		return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
	},
	entries() {
		return iterator(this, "entries", (value) => {
			value[1] = toWrapped(this, value[1]);
			return value;
		});
	},
	every(fn, thisArg) {
		return apply(this, "every", fn, thisArg, void 0, arguments);
	},
	filter(fn, thisArg) {
		return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
	},
	find(fn, thisArg) {
		return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findIndex(fn, thisArg) {
		return apply(this, "findIndex", fn, thisArg, void 0, arguments);
	},
	findLast(fn, thisArg) {
		return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findLastIndex(fn, thisArg) {
		return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
	},
	forEach(fn, thisArg) {
		return apply(this, "forEach", fn, thisArg, void 0, arguments);
	},
	includes(...args) {
		return searchProxy(this, "includes", args);
	},
	indexOf(...args) {
		return searchProxy(this, "indexOf", args);
	},
	join(separator) {
		return reactiveReadArray(this).join(separator);
	},
	lastIndexOf(...args) {
		return searchProxy(this, "lastIndexOf", args);
	},
	map(fn, thisArg) {
		return apply(this, "map", fn, thisArg, void 0, arguments);
	},
	pop() {
		return noTracking(this, "pop");
	},
	push(...args) {
		return noTracking(this, "push", args);
	},
	reduce(fn, ...args) {
		return reduce(this, "reduce", fn, args);
	},
	reduceRight(fn, ...args) {
		return reduce(this, "reduceRight", fn, args);
	},
	shift() {
		return noTracking(this, "shift");
	},
	some(fn, thisArg) {
		return apply(this, "some", fn, thisArg, void 0, arguments);
	},
	splice(...args) {
		return noTracking(this, "splice", args);
	},
	toReversed() {
		return reactiveReadArray(this).toReversed();
	},
	toSorted(comparer) {
		return reactiveReadArray(this).toSorted(comparer);
	},
	toSpliced(...args) {
		return reactiveReadArray(this).toSpliced(...args);
	},
	unshift(...args) {
		return noTracking(this, "unshift", args);
	},
	values() {
		return iterator(this, "values", (item) => toWrapped(this, item));
	}
};
function iterator(self, method, wrapValue) {
	const arr = shallowReadArray(self);
	const methodFn = arr[method];
	const iter = methodFn.call(arr);
	if (arr !== self && !/* @__PURE__ */ isShallow(self)) {
		if (iter[Symbol.toStringTag] === "Array Iterator") {
			const wrapped = Object.create(Object.getPrototypeOf(iter));
			wrapped.next = () => wrapResult(iter.next(), wrapValue);
			if (methodFn !== arrayProto[method]) Object.defineProperties(wrapped, {
				return: { get() {
					const fn = iter.return;
					return typeof fn === "function" ? fn.bind(iter) : fn;
				} },
				throw: { get() {
					const fn = iter.throw;
					return typeof fn === "function" ? fn.bind(iter) : fn;
				} }
			});
			return wrapped;
		}
		iter._next = iter.next;
		iter.next = () => wrapResult(iter._next(), wrapValue);
	}
	return iter;
}
function wrapResult(result, wrapValue) {
	if (!result.done) result.value = wrapValue(result.value);
	return result;
}
var arrayProto = Array.prototype;
function apply(self, method, fn, thisArg, wrappedRetFn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	const methodFn = arr[method];
	if (methodFn !== arrayProto[method]) {
		const result2 = methodFn.apply(self, args);
		return needsWrap ? toReactive(result2) : result2;
	}
	let wrappedFn = fn;
	if (arr !== self) {
		if (needsWrap) wrappedFn = function(item, index) {
			return fn.call(this, toWrapped(self, item), index, self);
		};
		else if (fn.length > 2) wrappedFn = function(item, index) {
			return fn.call(this, item, index, self);
		};
	}
	const result = methodFn.call(arr, wrappedFn, thisArg);
	return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self, method, fn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	let wrappedFn = fn;
	let wrapInitialAccumulator = false;
	if (arr !== self) {
		if (needsWrap) {
			wrapInitialAccumulator = args.length === 0;
			wrappedFn = function(acc, item, index) {
				if (wrapInitialAccumulator) {
					wrapInitialAccumulator = false;
					acc = toWrapped(self, acc);
				}
				return fn.call(this, acc, toWrapped(self, item), index, self);
			};
		} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
			return fn.call(this, acc, item, index, self);
		};
	}
	const result = arr[method](wrappedFn, ...args);
	return wrapInitialAccumulator ? toWrapped(self, result) : result;
}
function searchProxy(self, method, args) {
	const arr = /* @__PURE__ */ toRaw(self);
	track(arr, "iterate", ARRAY_ITERATE_KEY);
	const res = arr[method](...args);
	if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
		args[0] = /* @__PURE__ */ toRaw(args[0]);
		return arr[method](...args);
	}
	return res;
}
function noTracking(self, method, args = []) {
	pauseTracking();
	startBatch();
	const res = (/* @__PURE__ */ toRaw(self))[method].apply(self, args);
	endBatch();
	resetTracking();
	return res;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = /* @__PURE__ */ new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
function hasOwnProperty(key) {
	if (!isSymbol(key)) key = String(key);
	const obj = /* @__PURE__ */ toRaw(this);
	track(obj, "has", key);
	return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
	constructor(_isReadonly = false, _isShallow = false) {
		this._isReadonly = _isReadonly;
		this._isShallow = _isShallow;
	}
	get(target, key, receiver) {
		if (key === "__v_skip") return target["__v_skip"];
		const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_isShallow") return isShallow2;
		else if (key === "__v_raw") {
			if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
			return;
		}
		const targetIsArray = isArray(target);
		if (!isReadonly2) {
			let fn;
			if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
			if (key === "hasOwnProperty") return hasOwnProperty;
		}
		const res = Reflect.get(target, key, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
		if (!isReadonly2) track(target, "get", key);
		if (isShallow2) return res;
		if (/* @__PURE__ */ isRef(res)) {
			const value = targetIsArray && isIntegerKey(key) ? res : res.value;
			return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
		}
		if (isObject(res)) return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
		return res;
	}
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(false, isShallow2);
	}
	set(target, key, value, receiver) {
		let oldValue = target[key];
		const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
		if (!this._isShallow) {
			const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
			if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
				oldValue = /* @__PURE__ */ toRaw(oldValue);
				value = /* @__PURE__ */ toRaw(value);
			}
			if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
				if (isOldValueReadonly) return true;
				else {
					oldValue.value = value;
					return true;
				}
			}
		}
		const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
		const result = Reflect.set(target, key, value, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (target === /* @__PURE__ */ toRaw(receiver) && result) {
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
		}
		return result;
	}
	deleteProperty(target, key) {
		const hadKey = hasOwn(target, key);
		const oldValue = target[key];
		const result = Reflect.deleteProperty(target, key);
		if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
		return result;
	}
	has(target, key) {
		const result = Reflect.has(target, key);
		if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
		return result;
	}
	ownKeys(target) {
		track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
		return Reflect.ownKeys(target);
	}
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(true, isShallow2);
	}
	set(target, key) {
		return true;
	}
	deleteProperty(target, key) {
		return true;
	}
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
	return function(...args) {
		const target = this["__v_raw"];
		const rawTarget = /* @__PURE__ */ toRaw(target);
		const targetIsMap = isMap(rawTarget);
		const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
		const isKeyOnly = method === "keys" && targetIsMap;
		const innerIterator = target[method](...args);
		const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
		!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
		return extend(Object.create(innerIterator), { next() {
			const { value, done } = innerIterator.next();
			return done ? {
				value,
				done
			} : {
				value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
				done
			};
		} });
	};
}
function createReadonlyMethod(type) {
	return function(...args) {
		return type === "delete" ? false : type === "clear" ? void 0 : this;
	};
}
function createInstrumentations(readonly, shallow) {
	const instrumentations = {
		get(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly) {
				if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
				track(rawTarget, "get", rawKey);
			}
			const { has } = getProto(rawTarget);
			const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
			if (has.call(rawTarget, key)) return wrap(target.get(key));
			else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
			else if (target !== rawTarget) target.get(key);
		},
		get size() {
			const target = this["__v_raw"];
			!readonly && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
			return target.size;
		},
		has(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly) {
				if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
				track(rawTarget, "has", rawKey);
			}
			return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
		},
		forEach(callback, thisArg) {
			const observed = this;
			const target = observed["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
			!readonly && track(rawTarget, "iterate", ITERATE_KEY);
			return target.forEach((value, key) => {
				return callback.call(thisArg, wrap(value), wrap(key), observed);
			});
		}
	};
	extend(instrumentations, readonly ? {
		add: createReadonlyMethod("add"),
		set: createReadonlyMethod("set"),
		delete: createReadonlyMethod("delete"),
		clear: createReadonlyMethod("clear")
	} : {
		add(value) {
			const target = /* @__PURE__ */ toRaw(this);
			const proto = getProto(target);
			const rawValue = /* @__PURE__ */ toRaw(value);
			const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
			if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
				target.add(valueToAdd);
				trigger(target, "add", valueToAdd, valueToAdd);
			}
			return this;
		},
		set(key, value) {
			if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) value = /* @__PURE__ */ toRaw(value);
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			}
			const oldValue = get.call(target, key);
			target.set(key, value);
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			return this;
		},
		delete(key) {
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			}
			const oldValue = get ? get.call(target, key) : void 0;
			const result = target.delete(key);
			if (hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		},
		clear() {
			const target = /* @__PURE__ */ toRaw(this);
			const hadItems = target.size !== 0;
			const oldTarget = void 0;
			const result = target.clear();
			if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
			return result;
		}
	});
	[
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((method) => {
		instrumentations[method] = createIterableMethod(method, readonly, shallow);
	});
	return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
	const instrumentations = createInstrumentations(isReadonly2, shallow);
	return (target, key, receiver) => {
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_isShallow") return shallow;
		else if (key === "__v_raw") return target;
		return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
	};
}
var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, false) };
var shallowCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, true) };
var readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, false) };
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
	switch (rawType) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
	if (/* @__PURE__ */ isReadonly(target)) return target;
	return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
	return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
	return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
	if (!isObject(target)) return target;
	if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
	if (target["__v_skip"] || !Object.isExtensible(target)) return target;
	const existingProxy = proxyMap.get(target);
	if (existingProxy) return existingProxy;
	const targetType = targetTypeMap(toRawType(target));
	if (targetType === 0) return target;
	const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
	proxyMap.set(target, proxy);
	return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
	if (/* @__PURE__ */ isReadonly(value)) return /* @__PURE__ */ isReactive(value["__v_raw"]);
	return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
	return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
	return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
	return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
	const raw = observed && observed["__v_raw"];
	return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
	if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
	return value;
}
var toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
var toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
	return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
	return createRef(value, false);
}
function createRef(rawValue, shallow) {
	if (/* @__PURE__ */ isRef(rawValue)) return rawValue;
	return new RefImpl(rawValue, shallow);
}
var RefImpl = class {
	constructor(value, isShallow2) {
		this.dep = new Dep();
		this["__v_isRef"] = true;
		this["__v_isShallow"] = false;
		this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
		this._value = isShallow2 ? value : toReactive(value);
		this["__v_isShallow"] = isShallow2;
	}
	get value() {
		this.dep.track();
		return this._value;
	}
	set value(newValue) {
		const oldValue = this._rawValue;
		const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
		newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
		if (hasChanged(newValue, oldValue)) {
			this._rawValue = newValue;
			this._value = useDirectValue ? newValue : toReactive(newValue);
			this.dep.trigger();
		}
	}
};
function unref(ref2) {
	return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
var shallowUnwrapHandlers = {
	get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
	set: (target, key, value, receiver) => {
		const oldValue = target[key];
		if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
			oldValue.value = value;
			return true;
		} else return Reflect.set(target, key, value, receiver);
	}
};
function proxyRefs(objectWithRefs) {
	return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
var ComputedRefImpl = class {
	constructor(fn, setter, isSSR) {
		this.fn = fn;
		this.setter = setter;
		/**
		* @internal
		*/
		this._value = void 0;
		/**
		* @internal
		*/
		this.dep = new Dep(this);
		/**
		* @internal
		*/
		this.__v_isRef = true;
		/**
		* @internal
		*/
		this.deps = void 0;
		/**
		* @internal
		*/
		this.depsTail = void 0;
		/**
		* @internal
		*/
		this.flags = 16;
		/**
		* @internal
		*/
		this.globalVersion = globalVersion - 1;
		/**
		* @internal
		*/
		this.next = void 0;
		this.effect = this;
		this["__v_isReadonly"] = !setter;
		this.isSSR = isSSR;
	}
	/**
	* @internal
	*/
	notify() {
		this.flags |= 16;
		if (!(this.flags & 8) && activeSub !== this) {
			batch(this, true);
			return true;
		}
	}
	get value() {
		const link = this.dep.track();
		refreshComputed(this);
		if (link) link.version = this.dep.version;
		return this._value;
	}
	set value(newValue) {
		if (this.setter) this.setter(newValue);
	}
};
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
	let getter;
	let setter;
	if (isFunction(getterOrOptions)) getter = getterOrOptions;
	else {
		getter = getterOrOptions.get;
		setter = getterOrOptions.set;
	}
	return new ComputedRefImpl(getter, setter, isSSR);
}
var INITIAL_WATCHER_VALUE = {};
var cleanupMap = /* @__PURE__ */ new WeakMap();
var activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
	if (owner) {
		let cleanups = cleanupMap.get(owner);
		if (!cleanups) cleanupMap.set(owner, cleanups = []);
		cleanups.push(cleanupFn);
	}
}
function watch$1(source, cb, options = EMPTY_OBJ) {
	const { immediate, deep, once, scheduler, augmentJob, call } = options;
	const reactiveGetter = (source2) => {
		if (deep) return source2;
		if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
		return traverse(source2);
	};
	let effect;
	let getter;
	let cleanup;
	let boundCleanup;
	let forceTrigger = false;
	let isMultiSource = false;
	if (/* @__PURE__ */ isRef(source)) {
		getter = () => source.value;
		forceTrigger = /* @__PURE__ */ isShallow(source);
	} else if (/* @__PURE__ */ isReactive(source)) {
		getter = () => reactiveGetter(source);
		forceTrigger = true;
	} else if (isArray(source)) {
		isMultiSource = true;
		forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
		getter = () => source.map((s) => {
			if (/* @__PURE__ */ isRef(s)) return s.value;
			else if (/* @__PURE__ */ isReactive(s)) return reactiveGetter(s);
			else if (isFunction(s)) return call ? call(s, 2) : s();
		});
	} else if (isFunction(source)) {
		if (cb) getter = call ? () => call(source, 2) : source;
		else getter = () => {
			if (cleanup) {
				pauseTracking();
				try {
					cleanup();
				} finally {
					resetTracking();
				}
			}
			const currentEffect = activeWatcher;
			activeWatcher = effect;
			try {
				return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
			} finally {
				activeWatcher = currentEffect;
			}
		};
	} else getter = NOOP;
	if (cb && deep) {
		const baseGetter = getter;
		const depth = deep === true ? Infinity : deep;
		getter = () => traverse(baseGetter(), depth);
	}
	const scope = getCurrentScope();
	const watchHandle = () => {
		effect.stop();
		if (scope && scope.active) remove(scope.effects, effect);
	};
	if (once && cb) {
		const _cb = cb;
		cb = (...args) => {
			try {
				return _cb(...args);
			} finally {
				watchHandle();
			}
		};
	}
	let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
	const job = (immediateFirstRun) => {
		if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
		if (cb) {
			const newValue = effect.run();
			if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
				const currentWatcher = activeWatcher;
				pauseTracking();
				try {
					if (cleanup) cleanup();
					activeWatcher = effect;
					const args = [
						newValue,
						oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
						boundCleanup
					];
					oldValue = newValue;
					call ? call(cb, 3, args) : cb(...args);
				} finally {
					activeWatcher = currentWatcher;
					resetTracking();
				}
			}
		} else effect.run();
	};
	if (augmentJob) augmentJob(job);
	effect = new ReactiveEffect(getter);
	effect.scheduler = scheduler ? () => scheduler(job, false) : job;
	boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
	cleanup = effect.onStop = () => {
		const cleanups = cleanupMap.get(effect);
		if (cleanups) {
			if (call) call(cleanups, 4);
			else for (const cleanup2 of cleanups) cleanup2();
			cleanupMap.delete(effect);
		}
	};
	if (cb) {
		if (immediate) job(true);
		else oldValue = effect.run();
	} else if (scheduler) scheduler(job.bind(null, true), true);
	else effect.run();
	watchHandle.pause = effect.pause.bind(effect);
	watchHandle.resume = effect.resume.bind(effect);
	watchHandle.stop = watchHandle;
	return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
	if (depth <= 0 || !isObject(value) || value["__v_skip"]) return value;
	seen = seen || /* @__PURE__ */ new Map();
	if ((seen.get(value) || 0) >= depth) return value;
	seen.set(value, depth);
	depth--;
	if (/* @__PURE__ */ isRef(value)) traverse(value.value, depth, seen);
	else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
	else if (isSet(value) || isMap(value)) value.forEach((v) => {
		traverse(v, depth, seen);
	});
	else if (isPlainObject(value)) {
		for (const key in value) traverse(value[key], depth, seen);
		for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
	}
	return value;
}
// node_modules/.pnpm/@vue+runtime-core@3.5.45/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
/**
* @vue/runtime-core v3.5.45
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function callWithErrorHandling(fn, instance, type, args) {
	try {
		return args ? fn(...args) : fn();
	} catch (err) {
		handleError(err, instance, type);
	}
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
	if (isFunction(fn)) {
		const res = callWithErrorHandling(fn, instance, type, args);
		if (res && isPromise(res)) res.catch((err) => {
			handleError(err, instance, type, void 0, true);
		});
		return res;
	}
	if (isArray(fn)) {
		const values = [];
		for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
		return values;
	}
}
function handleError(err, instance, type, throwInDev = true, isAsyncError = false) {
	const contextVNode = instance ? instance.vnode : null;
	const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
	if (instance) {
		let cur = instance.parent;
		const exposedInstance = instance.proxy;
		const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
		while (cur) {
			const errorCapturedHooks = cur.ec;
			if (errorCapturedHooks && !cur.isUnmounted && (!isAsyncError || cur.scope.active)) {
				for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
			}
			cur = cur.parent;
		}
		if (errorHandler) {
			pauseTracking();
			callWithErrorHandling(errorHandler, null, 10, [
				err,
				exposedInstance,
				errorInfo
			]);
			resetTracking();
			return;
		}
	}
	logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
	if (throwInProd) throw err;
	else console.error(err);
}
var queue = [];
var flushIndex = -1;
var pendingPostFlushCbs = [];
var activePostFlushCbs = null;
var postFlushIndex = 0;
var resolvedPromise = /* @__PURE__ */ Promise.resolve();
var currentFlushPromise = null;
function nextTick(fn) {
	const p = currentFlushPromise || resolvedPromise;
	return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function findInsertionIndex(id) {
	let start = flushIndex + 1;
	let end = queue.length;
	while (start < end) {
		const middle = start + end >>> 1;
		const middleJob = queue[middle];
		const middleJobId = getId(middleJob);
		if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
		else end = middle;
	}
	return start;
}
function queueJob(job) {
	if (!(job.flags & 1)) {
		const jobId = getId(job);
		const lastJob = queue[queue.length - 1];
		if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) queue.push(job);
		else queue.splice(findInsertionIndex(jobId), 0, job);
		job.flags |= 1;
		queueFlush();
	}
}
function queueFlush() {
	if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
}
function queuePostFlushCb(cb) {
	if (!isArray(cb)) {
		if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
		else if (!(cb.flags & 1)) {
			pendingPostFlushCbs.push(cb);
			cb.flags |= 1;
		}
	} else for (let i = 0; i < cb.length; i++) pendingPostFlushCbs.push(cb[i]);
	queueFlush();
}
function flushPreFlushCbs(instance, minUid, seen, i = flushIndex + 1) {
	for (; i < queue.length; i++) {
		const cb = queue[i];
		if (cb && cb.flags & 2) {
			if (instance && cb.id !== instance.uid || minUid !== void 0 && !(cb.id >= minUid)) continue;
			queue.splice(i, 1);
			i = instance ? i - 1 : flushIndex;
			if (cb.flags & 4) cb.flags &= -2;
			cb();
			if (!(cb.flags & 4)) cb.flags &= -2;
		}
	}
}
function flushPostFlushCbs(seen, skip, minUid = 0) {
	if (pendingPostFlushCbs.length) {
		let cbs = pendingPostFlushCbs;
		let kept = 0;
		if (skip) {
			cbs = [];
			for (let i = 0; i < pendingPostFlushCbs.length; i++) {
				const cb = pendingPostFlushCbs[i];
				if (cb.i !== void 0 ? !cb.i || cb.i.uid < minUid : skip.has(cb)) pendingPostFlushCbs[kept++] = cb;
				else cbs.push(cb);
			}
		}
		const deduped = [...new Set(cbs)].sort((a, b) => getId(a) - getId(b));
		pendingPostFlushCbs.length = kept;
		if (activePostFlushCbs) {
			for (let i = 0; i < deduped.length; i++) activePostFlushCbs.push(deduped[i]);
			return;
		}
		activePostFlushCbs = deduped;
		for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
			const cb = activePostFlushCbs[postFlushIndex];
			if (cb.flags & 4) cb.flags &= -2;
			if (!(cb.flags & 8)) cb();
			cb.flags &= -2;
		}
		activePostFlushCbs = null;
		postFlushIndex = 0;
	}
}
var isFlushing = false;
function flushOnAppMount(fn, minUid) {
	if (isFlushing) {
		fn();
		return;
	}
	const queued = minUid === void 0 ? void 0 : new Set(pendingPostFlushCbs);
	fn();
	isFlushing = true;
	try {
		flushPreFlushCbs(void 0, minUid);
		flushPostFlushCbs(void 0, queued, minUid);
	} finally {
		isFlushing = false;
	}
}
var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
	try {
		for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
			const job = queue[flushIndex];
			if (job && !(job.flags & 8)) {
				if (job.flags & 4) job.flags &= -2;
				callWithErrorHandling(job, job.i, job.i ? 15 : 14);
				if (!(job.flags & 4)) job.flags &= -2;
			}
		}
	} finally {
		for (; flushIndex < queue.length; flushIndex++) {
			const job = queue[flushIndex];
			if (job) job.flags &= -2;
		}
		flushIndex = -1;
		queue.length = 0;
		flushPostFlushCbs(seen);
		currentFlushPromise = null;
		if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
	}
}
var currentRenderingInstance = null;
var currentScopeId = null;
function setCurrentRenderingInstance(instance) {
	const prev = currentRenderingInstance;
	currentRenderingInstance = instance;
	currentScopeId = instance && instance.type.__scopeId || null;
	return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
	if (!ctx) return fn;
	if (fn._n) return fn;
	const renderFnWithContext = (...args) => {
		if (renderFnWithContext._d) setBlockTracking(-1);
		const prevInstance = setCurrentRenderingInstance(ctx);
		const prevStackSize = blockStack.length;
		let res;
		try {
			res = fn(...args);
		} finally {
			for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
			setCurrentRenderingInstance(prevInstance);
			if (renderFnWithContext._d) setBlockTracking(1);
		}
		return res;
	};
	renderFnWithContext._n = true;
	renderFnWithContext._c = true;
	renderFnWithContext._d = true;
	return renderFnWithContext;
}
function withDirectives(vnode, directives) {
	if (currentRenderingInstance === null) return vnode;
	const instance = getComponentPublicInstance(currentRenderingInstance);
	const bindings = vnode.dirs || (vnode.dirs = []);
	for (let i = 0; i < directives.length; i++) {
		let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
		if (dir) {
			if (isFunction(dir)) dir = {
				mounted: dir,
				updated: dir
			};
			if (dir.deep) traverse(value);
			bindings.push({
				dir,
				instance,
				value,
				oldValue: void 0,
				arg,
				modifiers
			});
		}
	}
	return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
	let hookVNode = vnode;
	if (name === "beforeMount") vnode._mount = vnode;
	else if (name === "beforeUpdate") {
		const mount = prevVNode && prevVNode._mount;
		if (mount) {
			mount._latest = vnode;
			vnode._mount = mount;
		}
	} else if (name === "mounted") {
		const latest = vnode._latest;
		vnode._mount = vnode._latest = void 0;
		if (latest) {
			hookVNode = latest;
			latest._mount = void 0;
		}
	}
	const bindings = hookVNode.dirs;
	const oldBindings = prevVNode && prevVNode.dirs;
	for (let i = 0; i < bindings.length; i++) {
		let binding = bindings[i];
		if (oldBindings) binding.oldValue = oldBindings[i].value;
		else if (name === "mounted" && binding.oldValue !== void 0) binding = extend({}, binding, { oldValue: void 0 });
		let hook = binding.dir[name];
		if (hook) {
			pauseTracking();
			callWithAsyncErrorHandling(hook, instance, 8, [
				vnode.el,
				binding,
				hookVNode,
				prevVNode
			]);
			resetTracking();
		}
	}
}
function provide(key, value) {
	if (currentInstance) {
		let provides = currentInstance.provides;
		const parentProvides = currentInstance.parent && currentInstance.parent.provides;
		if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
		provides[key] = value;
	}
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
	const instance = getCurrentInstance();
	if (instance || currentApp) {
		let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
		if (provides && key in provides) return provides[key];
		else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
	}
}
var ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
var useSSRContext = () => {
	{
		const ctx = inject(ssrContextKey);
		if (!ctx) {}
		return ctx;
	}
};
function watch(source, cb, options) {
	return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
	const { immediate, deep, flush, once } = options;
	const baseWatchOptions = extend({}, options);
	const runsImmediately = cb && immediate || !cb && flush !== "post";
	let ssrCleanup;
	if (isInSSRComponentSetup) {
		if (flush === "sync") {
			const ctx = useSSRContext();
			ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
		} else if (!runsImmediately) {
			const watchStopHandle = () => {};
			watchStopHandle.stop = NOOP;
			watchStopHandle.resume = NOOP;
			watchStopHandle.pause = NOOP;
			return watchStopHandle;
		}
	}
	const instance = currentInstance;
	baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
	let isPre = false;
	if (flush === "post") baseWatchOptions.scheduler = (job) => {
		job.i = instance;
		queuePostRenderEffect(job, instance && instance.suspense);
	};
	else if (flush !== "sync") {
		isPre = true;
		baseWatchOptions.scheduler = (job, isFirstRun) => {
			if (isFirstRun) job();
			else queueJob(job);
		};
	}
	baseWatchOptions.augmentJob = (job) => {
		if (cb) job.flags |= 4;
		if (isPre) {
			job.flags |= 2;
			if (instance) {
				job.id = instance.uid;
				job.i = instance;
			}
		}
	};
	const watchHandle = watch$1(source, cb, baseWatchOptions);
	if (isInSSRComponentSetup) {
		if (ssrCleanup) ssrCleanup.push(watchHandle);
		else if (runsImmediately) watchHandle();
	}
	return watchHandle;
}
function instanceWatch(source, value, options) {
	const publicThis = this.proxy;
	const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
	let cb;
	if (isFunction(value)) cb = value;
	else {
		cb = value.handler;
		options = value;
	}
	const reset = setCurrentInstance(this);
	const res = doWatch(getter, cb.bind(publicThis), options);
	reset();
	return res;
}
function createPathGetter(ctx, path) {
	const segments = path.split(".");
	return () => {
		let cur = ctx;
		for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
		return cur;
	};
}
var pendingMounts = /* @__PURE__ */ new WeakMap();
var TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
var isTeleport = (type) => type.__isTeleport;
var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
var resolveTarget = (props, select) => {
	const targetSelector = props && props.to;
	if (isString(targetSelector)) {
		if (!select) return null;
		else return select(targetSelector);
	} else return targetSelector;
};
var TeleportImpl = {
	name: "Teleport",
	__isTeleport: true,
	process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
		const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment, parentNode } } = internals;
		const disabled = isTeleportDisabled(n2.props);
		let { dynamicChildren } = n2;
		const mount = (vnode, container2, anchor2) => {
			if (vnode.shapeFlag & 16) mountChildren(vnode.children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const mountToTarget = (vnode = n2) => {
			const disabled2 = isTeleportDisabled(vnode.props);
			const target = vnode.target = resolveTarget(vnode.props, querySelector);
			const targetAnchor = prepareAnchor(target, vnode, createText, insert);
			if (target) {
				if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
				else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
				if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
				if (!disabled2) {
					mount(vnode, target, targetAnchor);
					updateCssVars(vnode, false);
				}
			}
		};
		const queuePendingMount = (vnode) => {
			const mountJob = () => {
				if (pendingMounts.get(vnode) !== mountJob) return;
				pendingMounts.delete(vnode);
				if (isTeleportDisabled(vnode.props)) {
					const mountContainer = parentNode(vnode.el) || container;
					mount(vnode, mountContainer, vnode.anchor);
					updateCssVars(vnode, true);
				}
				mountToTarget(vnode);
			};
			pendingMounts.set(vnode, mountJob);
			queuePostRenderEffect(mountJob, parentSuspense);
		};
		if (n1 == null) {
			const placeholder = n2.el = createText("");
			const mainAnchor = n2.anchor = createText("");
			insert(placeholder, container, anchor);
			insert(mainAnchor, container, anchor);
			if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
				queuePendingMount(n2);
				return;
			}
			if (disabled) {
				mount(n2, container, mainAnchor);
				updateCssVars(n2, true);
			}
			mountToTarget();
		} else {
			n2.el = n1.el;
			const mainAnchor = n2.anchor = n1.anchor;
			const pendingMount = pendingMounts.get(n1);
			if (pendingMount) {
				pendingMount.flags |= 8;
				pendingMounts.delete(n1);
				queuePendingMount(n2);
				return;
			}
			n2.targetStart = n1.targetStart;
			const target = n2.target = n1.target;
			const targetAnchor = n2.targetAnchor = n1.targetAnchor;
			const wasDisabled = isTeleportDisabled(n1.props);
			const currentContainer = wasDisabled ? container : target;
			const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
			if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
			else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
			if (dynamicChildren) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
				traverseStaticChildren(n1, n2, true);
			} else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
			if (disabled) {
				if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
				else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
			} else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
				const nextTarget = resolveTarget(n2.props, querySelector);
				if (nextTarget) {
					n2.target = nextTarget;
					moveTeleport(n2, nextTarget, null, internals, 0);
				}
			} else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
			updateCssVars(n2, disabled);
		}
	},
	remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
		const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
		const disabled = isTeleportDisabled(props);
		const shouldRemove = doRemove || !disabled;
		const pendingMount = pendingMounts.get(vnode);
		if (pendingMount) {
			pendingMount.flags |= 8;
			pendingMounts.delete(vnode);
		}
		if (target) {
			hostRemove(targetStart);
			hostRemove(targetAnchor);
		}
		doRemove && hostRemove(anchor);
		if (!pendingMount && (disabled || target) && shapeFlag & 16) for (let i = 0; i < children.length; i++) {
			const child = children[i];
			unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
		}
	},
	move: moveTeleport,
	hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
	if (moveType === 0) {
		if (vnode.targetStart) insert(vnode.targetStart, container, parentAnchor);
		insert(vnode.targetAnchor, container, parentAnchor);
		parentAnchor = vnode.targetAnchor;
	}
	const { el, anchor, shapeFlag, children, props } = vnode;
	const isReorder = moveType === 2;
	if (isReorder) insert(el, container, parentAnchor);
	if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
		if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move(children[i], container, parentAnchor, 2);
	}
	if (isReorder) insert(anchor, container, parentAnchor);
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector, insert, createText } }, hydrateChildren) {
	function hydrateAnchor(target2, targetNode) {
		let targetAnchor = targetNode;
		while (targetAnchor) {
			if (targetAnchor && targetAnchor.nodeType === 8) {
				if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
				else if (targetAnchor.data === "teleport anchor") {
					vnode.targetAnchor = targetAnchor;
					target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
					break;
				}
			}
			targetAnchor = nextSibling(targetAnchor);
		}
	}
	function hydrateDisabledTeleport(node2, vnode2) {
		vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode(node2), parentComponent, parentSuspense, slotScopeIds, optimized);
	}
	const target = vnode.target = resolveTarget(vnode.props, querySelector);
	const disabled = isTeleportDisabled(vnode.props);
	if (target) {
		const targetNode = target._lpa || target.firstChild;
		if (vnode.shapeFlag & 16) {
			if (disabled) {
				hydrateDisabledTeleport(node, vnode);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert, parentNode(node) === target ? node : null);
			} else {
				vnode.anchor = nextSibling(node);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert);
				hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
			}
		}
		updateCssVars(vnode, disabled);
	} else if (disabled) {
		if (vnode.shapeFlag & 16) {
			hydrateDisabledTeleport(node, vnode);
			vnode.targetStart = node;
			vnode.targetAnchor = nextSibling(node);
		}
	}
	return vnode.anchor && nextSibling(vnode.anchor);
}
var Teleport = TeleportImpl;
function updateCssVars(vnode, isDisabled) {
	const ctx = vnode.ctx;
	if (ctx && ctx.ut) {
		let node, anchor;
		if (isDisabled) {
			node = vnode.el;
			anchor = vnode.anchor;
		} else {
			node = vnode.targetStart;
			anchor = vnode.targetAnchor;
		}
		while (node && node !== anchor) {
			if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
			node = node.nextSibling;
		}
		ctx.ut();
	}
}
function prepareAnchor(target, vnode, createText, insert, anchor = null) {
	const targetStart = vnode.targetStart = createText("");
	const targetAnchor = vnode.targetAnchor = createText("");
	targetStart[TeleportEndKey] = targetAnchor;
	if (target) {
		insert(targetStart, target, anchor);
		insert(targetAnchor, target, anchor);
	}
	return targetAnchor;
}
var leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
var enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
	const state = {
		isMounted: false,
		isLeaving: false,
		isUnmounting: false,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	onMounted(() => {
		state.isMounted = true;
	});
	onBeforeUnmount(() => {
		state.isUnmounting = true;
	});
	return state;
}
var TransitionHookValidator = [Function, Array];
var BaseTransitionPropsValidators = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: TransitionHookValidator,
	onEnter: TransitionHookValidator,
	onAfterEnter: TransitionHookValidator,
	onEnterCancelled: TransitionHookValidator,
	onBeforeLeave: TransitionHookValidator,
	onLeave: TransitionHookValidator,
	onAfterLeave: TransitionHookValidator,
	onLeaveCancelled: TransitionHookValidator,
	onBeforeAppear: TransitionHookValidator,
	onAppear: TransitionHookValidator,
	onAfterAppear: TransitionHookValidator,
	onAppearCancelled: TransitionHookValidator
};
var BaseTransitionImpl = {
	name: `BaseTransition`,
	props: BaseTransitionPropsValidators,
	setup(props, { slots }) {
		const instance = getCurrentInstance();
		const state = useTransitionState();
		return () => {
			const children = slots.default && getTransitionRawChildren(slots.default(), true);
			const child = children && children.length ? findNonCommentChild(children) : instance.subTree ? createCommentVNode() : void 0;
			if (!child) return;
			const rawProps = /* @__PURE__ */ toRaw(props);
			const { mode } = rawProps;
			if (state.isLeaving) return emptyPlaceholder(child);
			const innerChild = getInnerChild$1(child);
			if (!innerChild) return emptyPlaceholder(child);
			const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
			if (innerChild.type !== Comment) setTransitionHooks(innerChild, enterHooks);
			let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
			if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && getTransitionRoot(instance.subTree)) {
				let leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
				setTransitionHooks(oldInnerChild, leavingHooks);
				if (mode === "out-in" && innerChild.type !== Comment) {
					state.isLeaving = true;
					leavingHooks.afterLeave = () => {
						state.isLeaving = false;
						if (!(instance.job.flags & 8)) {
							if (instance.effect.flags & 2) {
								const job = () => {
									if (!(instance.job.flags & 8)) instance.update();
								};
								job.i = instance;
								queueJob(job);
							} else instance.update();
						}
						delete leavingHooks.afterLeave;
						oldInnerChild = void 0;
					};
					return emptyPlaceholder(child);
				} else if (mode === "in-out" && innerChild.type !== Comment) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
					const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
					leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
					el[leaveCbKey] = () => {
						earlyRemove();
						el[leaveCbKey] = void 0;
						delete enterHooks.delayedLeave;
						oldInnerChild = void 0;
					};
					enterHooks.delayedLeave = () => {
						delayedLeave();
						delete enterHooks.delayedLeave;
						oldInnerChild = void 0;
					};
				};
				else oldInnerChild = void 0;
			} else if (oldInnerChild) oldInnerChild = void 0;
			return child;
		};
	}
};
function findNonCommentChild(children) {
	let child = children[0];
	if (children.length > 1) {
		for (const c of children) if (c.type !== Comment) {
			child = c;
			break;
		}
	}
	return child;
}
var BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
	const { leavingVNodes } = state;
	let leavingVNodesCache = leavingVNodes.get(vnode.type);
	if (!leavingVNodesCache) {
		leavingVNodesCache = /* @__PURE__ */ Object.create(null);
		leavingVNodes.set(vnode.type, leavingVNodesCache);
	}
	return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance) {
	const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
	const key = String(vnode.key);
	const leavingVNodesCache = getLeavingNodesForType(state, vnode);
	const callHook = (hook, args) => {
		hook && callWithAsyncErrorHandling(hook, instance, 9, args);
	};
	const callAsyncHook = (hook, args) => {
		const done = args[1];
		callHook(hook, args);
		if (isArray(hook)) {
			if (hook.every((hook2) => hook2.length <= 1)) done();
		} else if (hook.length <= 1) done();
	};
	const hooks = {
		mode,
		persisted,
		beforeEnter(el) {
			let hook = onBeforeEnter;
			if (!state.isMounted) {
				if (appear) hook = onBeforeAppear || onBeforeEnter;
				else return;
			}
			if (el[leaveCbKey]) el[leaveCbKey](true);
			const leavingVNode = leavingVNodesCache[key];
			if (leavingVNode && isSameVNodeType(vnode, leavingVNode)) {
				let leavingCb = leavingVNode.el[leaveCbKey];
				if (!leavingCb) {
					const leavingRoot = getTransitionRoot(leavingVNode);
					leavingCb = leavingRoot && leavingRoot.el[leaveCbKey];
				}
				if (leavingCb) leavingCb();
			}
			callHook(hook, [el]);
		},
		enter(el) {
			if (leavingVNodesCache[key] === vnode) return;
			let hook = onEnter;
			let afterHook = onAfterEnter;
			let cancelHook = onEnterCancelled;
			if (!state.isMounted) {
				if (appear) {
					hook = onAppear || onEnter;
					afterHook = onAfterAppear || onAfterEnter;
					cancelHook = onAppearCancelled || onEnterCancelled;
				} else return;
			}
			let called = false;
			el[enterCbKey] = (cancelled) => {
				if (called) return;
				called = true;
				if (cancelled) callHook(cancelHook, [el]);
				else callHook(afterHook, [el]);
				if (hooks.delayedLeave) hooks.delayedLeave();
				el[enterCbKey] = void 0;
			};
			const done = el[enterCbKey].bind(null, false);
			if (hook) callAsyncHook(hook, [el, done]);
			else done();
		},
		leave(el, remove) {
			const key2 = String(vnode.key);
			if (el[enterCbKey]) el[enterCbKey](true);
			if (state.isUnmounting) return remove();
			callHook(onBeforeLeave, [el]);
			let called = false;
			el[leaveCbKey] = (cancelled) => {
				if (called) return;
				called = true;
				remove();
				if (cancelled) callHook(onLeaveCancelled, [el]);
				else callHook(onAfterLeave, [el]);
				el[leaveCbKey] = void 0;
				if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
			};
			const done = el[leaveCbKey].bind(null, false);
			leavingVNodesCache[key2] = vnode;
			if (onLeave) callAsyncHook(onLeave, [el, done]);
			else done();
		},
		clone(vnode2) {
			const cloned = resolveTransitionHooks(vnode2, props, state, instance);
			cloned.afterLeave = () => {
				if (hooks.afterLeave) hooks.afterLeave();
			};
			cloned.delayLeave = (el, earlyRemove, delayedLeave) => {
				if (hooks.delayLeave) hooks.delayLeave(el, earlyRemove, delayedLeave);
				else delayedLeave();
			};
			cloned.delayedLeave = () => {
				if (hooks.delayedLeave) hooks.delayedLeave();
			};
			return cloned;
		}
	};
	return hooks;
}
function emptyPlaceholder(vnode) {
	if (isKeepAlive(vnode)) {
		vnode = cloneVNode(vnode);
		vnode.children = null;
		return vnode;
	}
}
function getInnerChild$1(vnode) {
	if (!isKeepAlive(vnode)) {
		if (isTeleport(vnode.type) && vnode.children) return findNonCommentChild(vnode.children);
		return vnode;
	}
	if (vnode.component) return vnode.component.subTree;
	const { shapeFlag, children } = vnode;
	if (children) {
		if (shapeFlag & 16) return children[0];
		if (shapeFlag & 32 && isFunction(children.default)) return children.default();
	}
}
function setTransitionHooks(vnode, hooks) {
	if (vnode.shapeFlag & 6 && vnode.component) {
		vnode.transition = hooks;
		const subTree = vnode.component.subTree;
		setTransitionHooks(isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree, hooks);
	} else if (vnode.shapeFlag & 128) {
		const suspense = vnode.suspense;
		if (suspense) {
			const branch = suspense.isHydrating ? suspense.pendingBranch : suspense.activeBranch;
			if (branch) setTransitionHooks(branch, hooks.clone(branch));
		} else {
			vnode.ssContent.transition = hooks.clone(vnode.ssContent);
			vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
		}
	} else {
		vnode.transition = hooks;
		if (vnode.type === Fragment && isArray(vnode.children)) {
			const child = filterSingleRoot(vnode.children, false);
			if (child) setTransitionHooks(child, hooks);
		}
	}
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
	let ret = [];
	let keyedFragmentCount = 0;
	for (let i = 0; i < children.length; i++) {
		let child = children[i];
		const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
		if (child.type === Fragment) {
			if (child.patchFlag & 128) keyedFragmentCount++;
			ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
		} else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, { key }) : child);
	}
	if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
	return ret;
}
function getTransitionRoot(vnode) {
	if (vnode.component) return getTransitionRoot(vnode.component.subTree);
	if (vnode.type === Fragment) {
		const child = isArray(vnode.children) && filterSingleRoot(vnode.children, false);
		return child ? getTransitionRoot(child) : void 0;
	}
	if (vnode.type !== Comment) return vnode;
}
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
	return isFunction(options) ? /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
}
function markAsyncBoundary(instance) {
	instance.ids = [
		instance.ids[0] + instance.ids[2]++ + "-",
		0,
		0
	];
}
function isTemplateRefKey(refs, key) {
	let desc;
	return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
	if (isArray(rawRef)) {
		rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
		return;
	}
	if (isAsyncWrapper(vnode) && !isUnmount) {
		if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
		return;
	}
	const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
	const value = isUnmount ? null : refValue;
	const { i: owner, r: ref } = rawRef;
	const oldRef = oldRawRef && oldRawRef.r;
	const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
	const setupState = owner.setupState;
	const rawSetupState = /* @__PURE__ */ toRaw(setupState);
	const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
		if (isTemplateRefKey(refs, key)) return false;
		return hasOwn(rawSetupState, key);
	};
	const canSetRef = (ref2, key) => {
		if (key && isTemplateRefKey(refs, key)) return false;
		return true;
	};
	if (oldRef != null && oldRef !== ref) {
		invalidatePendingSetRef(oldRawRef);
		if (isString(oldRef)) {
			refs[oldRef] = null;
			if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
		} else if (/* @__PURE__ */ isRef(oldRef)) {
			const oldRawRefAtom = oldRawRef;
			if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
			if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
		}
	}
	if (isFunction(ref)) callWithErrorHandling(ref, owner, 12, [value, refs]);
	else {
		const _isString = isString(ref);
		const _isRef = /* @__PURE__ */ isRef(ref);
		if (_isString || _isRef) {
			const doSet = () => {
				if (rawRef.f) {
					const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
					if (isUnmount) isArray(existing) && remove(existing, refValue);
					else if (!isArray(existing)) {
						if (_isString) {
							refs[ref] = [refValue];
							if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
						} else {
							const newVal = [refValue];
							if (canSetRef(ref, rawRef.k)) ref.value = newVal;
							if (rawRef.k) refs[rawRef.k] = newVal;
						}
					} else if (!existing.includes(refValue)) existing.push(refValue);
				} else if (_isString) {
					refs[ref] = value;
					if (canSetSetupRef(ref)) setupState[ref] = value;
				} else if (_isRef) {
					if (canSetRef(ref, rawRef.k)) ref.value = value;
					if (rawRef.k) refs[rawRef.k] = value;
				}
			};
			if (value) {
				const job = () => {
					doSet();
					pendingSetRefMap.delete(rawRef);
				};
				job.id = -1;
				pendingSetRefMap.set(rawRef, job);
				queuePostRenderEffect(job, parentSuspense);
			} else {
				invalidatePendingSetRef(rawRef);
				doSet();
			}
		}
	}
}
function invalidatePendingSetRef(rawRef) {
	const pendingSetRef = pendingSetRefMap.get(rawRef);
	if (pendingSetRef) {
		pendingSetRef.flags |= 8;
		pendingSetRefMap.delete(rawRef);
	}
}
getGlobalThis().requestIdleCallback;
getGlobalThis().cancelIdleCallback;
var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
	registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
	registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
	const wrappedHook = hook.__wdc || (hook.__wdc = () => {
		let current = target;
		while (current) {
			if (current.isDeactivated) return;
			current = current.parent;
		}
		return hook();
	});
	injectHook(type, wrappedHook, target);
	if (target) {
		let current = target.parent;
		while (current && current.parent) {
			if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
			current = current.parent;
		}
	}
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
	const injected = injectHook(type, hook, keepAliveRoot, true);
	const removal = injectHook("um", () => remove(keepAliveRoot[type], injected), target);
	removal.flags = 16;
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
	if (target) {
		const hooks = target[type] || (target[type] = []);
		const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
			pauseTracking();
			const reset = setCurrentInstance(target);
			const res = callWithAsyncErrorHandling(hook, target, type, args);
			reset();
			resetTracking();
			return res;
		});
		if (prepend) hooks.unshift(wrappedHook);
		else hooks.push(wrappedHook);
		return wrappedHook;
	}
}
var createHook = (lifecycle) => (hook, target = currentInstance) => {
	if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
};
var onBeforeMount = createHook("bm");
var onMounted = createHook("m");
var onBeforeUpdate = createHook("bu");
var onUpdated = createHook("u");
var onBeforeUnmount = createHook("bum");
var onUnmounted = createHook("um");
var onServerPrefetch = createHook("sp");
var onRenderTriggered = createHook("rtg");
var onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
	injectHook("ec", hook, target);
}
var NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function renderList(source, renderItem, cache, index) {
	let ret;
	const cached = cache && cache[index];
	const sourceIsArray = isArray(source);
	if (sourceIsArray || isString(source)) {
		const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
		let needsWrap = false;
		let isReadonlySource = false;
		if (sourceIsReactiveArray) {
			needsWrap = !/* @__PURE__ */ isShallow(source);
			isReadonlySource = /* @__PURE__ */ isReadonly(source);
			source = shallowReadArray(source);
		}
		ret = new Array(source.length);
		for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
	} else if (typeof source === "number") {
		if (!Number.isInteger(source) || source < 0) ret = [];
		else {
			ret = new Array(source);
			for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
		}
	} else if (isObject(source)) {
		if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
		else {
			const keys = Object.keys(source);
			ret = new Array(keys.length);
			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				ret[i] = renderItem(source[key], key, i, cached && cached[i]);
			}
		}
	} else ret = [];
	if (cache) cache[index] = ret;
	return ret;
}
function renderSlot(slots, name, props, fallback, noSlotted, branchKey) {
	if (props == null) props = {};
	if (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce) {
		const slotProps = branchKey != null && props.key == null ? extend({}, props, { key: branchKey }) : props;
		const hasProps = Object.keys(slotProps).length > 0;
		if (name !== "default") slotProps.name = name;
		return openBlock(), createBlock(Fragment, null, [createVNode("slot", slotProps, fallback && fallback())], hasProps ? -2 : 64);
	}
	let slot = slots[name];
	if (slot && slot._c) slot._d = false;
	const prevStackSize = blockStack.length;
	openBlock();
	let rendered;
	try {
		const validSlotContent = slot && ensureValidVNode(slot(props));
		const slotKey = props.key || branchKey || validSlotContent && validSlotContent.key;
		rendered = createBlock(Fragment, { key: (slotKey && !isSymbol(slotKey) ? slotKey : `_${name}`) + (!validSlotContent && fallback ? "_fb" : "") }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
	} catch (err) {
		for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
		throw err;
	} finally {
		if (slot && slot._c) slot._d = true;
	}
	if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [rendered.scopeId + "-s"];
	return rendered;
}
function ensureValidVNode(vnodes) {
	return vnodes.some((child) => {
		if (!isVNode(child)) return true;
		if (child.type === Comment) return false;
		if (child.type === Fragment && !ensureValidVNode(child.children)) return false;
		return true;
	}) ? vnodes : null;
}
var getPublicInstance = (i) => {
	if (!i) return null;
	if (isStatefulComponent(i)) return getComponentPublicInstance(i);
	return getPublicInstance(i.parent);
};
var publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
	$: (i) => i,
	$el: (i) => i.vnode.el,
	$data: (i) => i.data,
	$props: (i) => i.props,
	$attrs: (i) => i.attrs,
	$slots: (i) => i.slots,
	$refs: (i) => i.refs,
	$parent: (i) => getPublicInstance(i.parent),
	$root: (i) => getPublicInstance(i.root),
	$host: (i) => i.ce,
	$emit: (i) => i.emit,
	$options: (i) => resolveMergedOptions(i),
	$forceUpdate: (i) => i.f || (i.f = () => {
		queueJob(i.update);
	}),
	$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
	$watch: (i) => instanceWatch.bind(i)
});
var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
var PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		if (key === "__v_skip") return true;
		const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
		if (key[0] !== "$") {
			const n = accessCache[key];
			if (n !== void 0) switch (n) {
				case 1: return setupState[key];
				case 2: return data[key];
				case 4: return ctx[key];
				case 3: return props[key];
			}
			else if (hasSetupBinding(setupState, key)) {
				accessCache[key] = 1;
				return setupState[key];
			} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
				accessCache[key] = 2;
				return data[key];
			} else if (hasOwn(props, key)) {
				accessCache[key] = 3;
				return props[key];
			} else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (shouldCacheAccess) accessCache[key] = 0;
		}
		const publicGetter = publicPropertiesMap[key];
		let cssModule, globalProperties;
		if (publicGetter) {
			if (key === "$attrs") track(instance.attrs, "get", "");
			return publicGetter(instance);
		} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
		else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
			accessCache[key] = 4;
			return ctx[key];
		} else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) return globalProperties[key];
	},
	set({ _: instance }, key, value) {
		const { data, setupState, ctx } = instance;
		if (hasSetupBinding(setupState, key)) {
			setupState[key] = value;
			return true;
		} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
			data[key] = value;
			return true;
		} else if (hasOwn(instance.props, key)) return false;
		if (key[0] === "$" && key.slice(1) in instance) return false;
		else ctx[key] = value;
		return true;
	},
	has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
		let cssModules;
		return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
	},
	defineProperty(target, key, descriptor) {
		if (descriptor.get != null) target._.accessCache[key] = 0;
		else if (hasOwn(descriptor, "value")) this.set(target, key, descriptor.value, null);
		return Reflect.defineProperty(target, key, descriptor);
	}
};
function normalizePropsOrEmits(props) {
	return isArray(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
}
var shouldCacheAccess = true;
function applyOptions(instance) {
	const options = resolveMergedOptions(instance);
	const publicThis = instance.proxy;
	const ctx = instance.ctx;
	shouldCacheAccess = false;
	if (options.beforeCreate) callHook$1(options.beforeCreate, instance, "bc");
	const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
	const checkDuplicateProperties = null;
	if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
	if (methods) for (const key in methods) {
		const methodHandler = methods[key];
		if (isFunction(methodHandler)) ctx[key] = methodHandler.bind(publicThis);
	}
	if (dataOptions) {
		const data = dataOptions.call(publicThis, publicThis);
		if (!isObject(data)) {} else instance.data = /* @__PURE__ */ reactive(data);
	}
	shouldCacheAccess = true;
	if (computedOptions) for (const key in computedOptions) {
		const opt = computedOptions[key];
		const c = computed({
			get: isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP,
			set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP
		});
		Object.defineProperty(ctx, key, {
			enumerable: true,
			configurable: true,
			get: () => c.value,
			set: (v) => c.value = v
		});
	}
	if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
	if (provideOptions) {
		const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
		Reflect.ownKeys(provides).forEach((key) => {
			provide(key, provides[key]);
		});
	}
	if (created) callHook$1(created, instance, "c");
	function registerLifecycleHook(register, hook) {
		if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
		else if (hook) register(hook.bind(publicThis));
	}
	registerLifecycleHook(onBeforeMount, beforeMount);
	registerLifecycleHook(onMounted, mounted);
	registerLifecycleHook(onBeforeUpdate, beforeUpdate);
	registerLifecycleHook(onUpdated, updated);
	registerLifecycleHook(onActivated, activated);
	registerLifecycleHook(onDeactivated, deactivated);
	registerLifecycleHook(onErrorCaptured, errorCaptured);
	registerLifecycleHook(onRenderTracked, renderTracked);
	registerLifecycleHook(onRenderTriggered, renderTriggered);
	registerLifecycleHook(onBeforeUnmount, beforeUnmount);
	registerLifecycleHook(onUnmounted, unmounted);
	registerLifecycleHook(onServerPrefetch, serverPrefetch);
	if (isArray(expose)) {
		if (expose.length) {
			const exposed = instance.exposed || (instance.exposed = {});
			expose.forEach((key) => {
				Object.defineProperty(exposed, key, {
					get: () => publicThis[key],
					set: (val) => publicThis[key] = val,
					enumerable: true
				});
			});
		} else if (!instance.exposed) instance.exposed = {};
	}
	if (render && instance.render === NOOP) instance.render = render;
	if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
	if (components) instance.components = components;
	if (directives) instance.directives = directives;
	if (serverPrefetch) markAsyncBoundary(instance);
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
	if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
	for (const key in injectOptions) {
		const opt = injectOptions[key];
		let injected;
		if (isObject(opt)) {
			if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
			else injected = inject(opt.from || key);
		} else injected = inject(opt);
		if (/* @__PURE__ */ isRef(injected)) Object.defineProperty(ctx, key, {
			enumerable: true,
			configurable: true,
			get: () => injected.value,
			set: (v) => injected.value = v
		});
		else ctx[key] = injected;
	}
}
function callHook$1(hook, instance, type) {
	callWithAsyncErrorHandling(isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
	let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
	if (isString(raw)) {
		const handler = ctx[raw];
		if (isFunction(handler)) watch(getter, handler);
	} else if (isFunction(raw)) watch(getter, raw.bind(publicThis));
	else if (isObject(raw)) {
		if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
		else {
			const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
			if (isFunction(handler)) watch(getter, handler, raw);
		}
	}
}
function resolveMergedOptions(instance) {
	const base = instance.type;
	const { mixins, extends: extendsOptions } = base;
	const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
	const cached = cache.get(base);
	let resolved;
	if (cached) resolved = cached;
	else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
	else {
		resolved = {};
		if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
		mergeOptions(resolved, base, optionMergeStrategies);
	}
	if (isObject(base)) cache.set(base, resolved);
	return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
	const { mixins, extends: extendsOptions } = from;
	if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
	if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
	for (const key in from) if (asMixin && key === "expose") {} else {
		const strat = internalOptionMergeStrats[key] || strats && strats[key];
		to[key] = strat ? strat(to[key], from[key]) : from[key];
	}
	return to;
}
var internalOptionMergeStrats = {
	data: mergeDataFn,
	props: mergeEmitsOrPropsOptions,
	emits: mergeEmitsOrPropsOptions,
	methods: mergeObjectOptions,
	computed: mergeObjectOptions,
	beforeCreate: mergeAsArray,
	created: mergeAsArray,
	beforeMount: mergeAsArray,
	mounted: mergeAsArray,
	beforeUpdate: mergeAsArray,
	updated: mergeAsArray,
	beforeDestroy: mergeAsArray,
	beforeUnmount: mergeAsArray,
	destroyed: mergeAsArray,
	unmounted: mergeAsArray,
	activated: mergeAsArray,
	deactivated: mergeAsArray,
	errorCaptured: mergeAsArray,
	serverPrefetch: mergeAsArray,
	components: mergeObjectOptions,
	directives: mergeObjectOptions,
	watch: mergeWatchOptions,
	provide: mergeDataFn,
	inject: mergeInject
};
function mergeDataFn(to, from) {
	if (!from) return to;
	if (!to) return from;
	return function mergedDataFn() {
		return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
	};
}
function mergeInject(to, from) {
	return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
	if (isArray(raw)) {
		const res = {};
		for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
		return res;
	}
	return raw;
}
function mergeAsArray(to, from) {
	return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
	return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
	if (to) {
		if (isArray(to) && isArray(from)) return [.../* @__PURE__ */ new Set([...to, ...from])];
		return extend(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
	} else return from;
}
function mergeWatchOptions(to, from) {
	if (!to) return from;
	if (!from) return to;
	const merged = extend(/* @__PURE__ */ Object.create(null), to);
	for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
	return merged;
}
function createAppContext() {
	return {
		app: null,
		config: {
			isNativeTag: NO,
			performance: false,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var uid$1 = 0;
function createAppAPI(render, hydrate) {
	return function createApp(rootComponent, rootProps = null) {
		if (!isFunction(rootComponent)) rootComponent = extend({}, rootComponent);
		if (rootProps != null && !isObject(rootProps)) rootProps = null;
		const context = createAppContext();
		const installedPlugins = /* @__PURE__ */ new WeakSet();
		const pluginCleanupFns = [];
		let isMounted = false;
		const app = context.app = {
			_uid: uid$1++,
			_component: rootComponent,
			_props: rootProps,
			_container: null,
			_context: context,
			_instance: null,
			version,
			get config() {
				return context.config;
			},
			set config(v) {},
			use(plugin, ...options) {
				if (installedPlugins.has(plugin)) {} else if (plugin && isFunction(plugin.install)) {
					installedPlugins.add(plugin);
					plugin.install(app, ...options);
				} else if (isFunction(plugin)) {
					installedPlugins.add(plugin);
					plugin(app, ...options);
				}
				return app;
			},
			mixin(mixin) {
				if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
				return app;
			},
			component(name, component) {
				if (!component) return context.components[name];
				context.components[name] = component;
				return app;
			},
			directive(name, directive) {
				if (!directive) return context.directives[name];
				context.directives[name] = directive;
				return app;
			},
			mount(rootContainer, isHydrate, namespace) {
				if (!isMounted) {
					const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
					vnode.appContext = context;
					if (namespace === true) namespace = "svg";
					else if (namespace === false) namespace = void 0;
					if (isHydrate && hydrate) hydrate(vnode, rootContainer);
					else render(vnode, rootContainer, namespace);
					isMounted = true;
					app._container = rootContainer;
					rootContainer.__vue_app__ = app;
					return getComponentPublicInstance(vnode.component);
				}
			},
			onUnmount(cleanupFn) {
				pluginCleanupFns.push(cleanupFn);
			},
			unmount() {
				if (isMounted) {
					callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
					render(null, app._container);
					delete app._container.__vue_app__;
				}
			},
			provide(key, value) {
				context.provides[key] = value;
				return app;
			},
			runWithContext(fn) {
				const lastApp = currentApp;
				currentApp = app;
				try {
					return fn();
				} finally {
					currentApp = lastApp;
				}
			}
		};
		return app;
	};
}
var currentApp = null;
var getModelModifiers = (props, modelName) => {
	return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit$1(instance, event, ...rawArgs) {
	if (instance.isUnmounted) return;
	const props = instance.vnode.props || EMPTY_OBJ;
	let args = rawArgs;
	const isModelListener = event.startsWith("update:");
	const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
	if (modifiers) {
		if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
		if (modifiers.number) args = args.map(looseToNumber);
	}
	let handlerName;
	let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
	if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate(event))];
	if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
	const onceHandler = props[handlerName + `Once`];
	if (onceHandler) {
		if (!instance.emitted) instance.emitted = {};
		else if (instance.emitted[handlerName]) return;
		instance.emitted[handlerName] = true;
		callWithAsyncErrorHandling(onceHandler, instance, 6, args);
	}
}
var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
	const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
	const cached = cache.get(comp);
	if (cached !== void 0) return cached;
	const raw = comp.emits;
	let normalized = {};
	let hasExtends = false;
	if (!isFunction(comp)) {
		const extendEmits = (raw2) => {
			const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
			if (normalizedFromExtend) {
				hasExtends = true;
				extend(normalized, normalizedFromExtend);
			}
		};
		if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
		if (comp.extends) extendEmits(comp.extends);
		if (comp.mixins) comp.mixins.forEach(extendEmits);
	}
	if (!raw && !hasExtends) {
		if (isObject(comp)) cache.set(comp, null);
		return null;
	}
	if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
	else extend(normalized, raw);
	if (isObject(comp)) cache.set(comp, normalized);
	return normalized;
}
function isEmitListener(options, key) {
	if (!options || !isOn(key)) return false;
	key = key.slice(2);
	key = key === "Once" ? key : key.replace(/Once$/, "");
	return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function renderComponentRoot(instance) {
	const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
	const prev = setCurrentRenderingInstance(instance);
	let result;
	let fallthroughAttrs;
	try {
		if (vnode.shapeFlag & 4) {
			const proxyToUse = withProxy || proxy;
			const thisProxy = proxyToUse;
			result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, props, setupState, data, ctx));
			fallthroughAttrs = attrs;
		} else {
			const render2 = Component;
			result = normalizeVNode(render2.length > 1 ? render2(props, {
				attrs,
				slots,
				emit
			}) : render2(props, null));
			fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
		}
	} catch (err) {
		blockStack.length = 0;
		handleError(err, instance, 1);
		result = createVNode(Comment);
	}
	let root = result;
	if (fallthroughAttrs && inheritAttrs !== false) {
		const keys = Object.keys(fallthroughAttrs);
		const { shapeFlag } = root;
		if (keys.length) {
			if (shapeFlag & 7) {
				if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
				root = cloneVNode(root, fallthroughAttrs, false, true);
			}
		}
	}
	if (vnode.dirs) {
		root = cloneVNode(root, null, false, true);
		root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
	}
	if (vnode.transition) setTransitionHooks(isTeleport(root.type) ? getInnerChild$1(root) || root : root, vnode.transition);
	result = root;
	setCurrentRenderingInstance(prev);
	return result;
}
function filterSingleRoot(children, recurse = true) {
	let singleRoot;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (isVNode(child)) {
			if (child.type !== Comment || child.children === "v-if") {
				if (singleRoot) return;
				else singleRoot = child;
			}
		} else return;
	}
	return singleRoot;
}
var getFunctionalFallthrough = (attrs) => {
	let res;
	for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
	return res;
};
var filterModelListeners = (attrs, props) => {
	const res = {};
	for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
	return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
	const { props: prevProps, children: prevChildren, component } = prevVNode;
	const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
	const emits = component.emitsOptions;
	if (nextVNode.dirs || nextVNode.transition) return true;
	if (optimized && patchFlag >= 0) {
		if (patchFlag & 1024) return true;
		if (patchFlag & 16) {
			if (!prevProps) return !!nextProps;
			return hasPropsChanged(prevProps, nextProps, emits);
		} else if (patchFlag & 8) {
			const dynamicProps = nextVNode.dynamicProps;
			for (let i = 0; i < dynamicProps.length; i++) {
				const key = dynamicProps[i];
				if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
			}
		}
	} else {
		if (prevChildren || nextChildren) {
			if (!nextChildren || !nextChildren.$stable) return true;
		}
		if (prevProps === nextProps) return false;
		if (!prevProps) return !!nextProps;
		if (!nextProps) return true;
		return hasPropsChanged(prevProps, nextProps, emits);
	}
	return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
	const nextKeys = Object.keys(nextProps);
	if (nextKeys.length !== Object.keys(prevProps).length) return true;
	for (let i = 0; i < nextKeys.length; i++) {
		const key = nextKeys[i];
		if (!hasOwn(prevProps, key) || hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
	}
	return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
	const nextProp = nextProps[key];
	const prevProp = prevProps[key];
	if (key === "style" && isObject(nextProp) && isObject(prevProp)) return !looseEqual(nextProp, prevProp);
	return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
	while (parent) {
		const root = parent.subTree;
		if (root.suspense && root.suspense.activeBranch === vnode) {
			root.suspense.vnode.el = root.el = el;
			vnode = root;
		}
		if (root === vnode) {
			(vnode = parent.vnode).el = el;
			parent = parent.parent;
		} else break;
	}
	if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
}
var internalObjectProto = {};
var createInternalObject = () => Object.create(internalObjectProto);
var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
	const props = {};
	const attrs = createInternalObject();
	instance.propsDefaults = /* @__PURE__ */ Object.create(null);
	setFullProps(instance, rawProps, props, attrs);
	for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
	if (isStateful) instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
	else if (!instance.type.props) instance.props = attrs;
	else instance.props = props;
	instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
	const { props, attrs, vnode: { patchFlag } } = instance;
	const rawCurrentProps = /* @__PURE__ */ toRaw(props);
	const [options] = instance.propsOptions;
	let hasAttrsChanged = false;
	if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
		if (patchFlag & 8) {
			const propsToUpdate = instance.vnode.dynamicProps;
			for (let i = 0; i < propsToUpdate.length; i++) {
				let key = propsToUpdate[i];
				if (isEmitListener(instance.emitsOptions, key)) continue;
				const value = rawProps[key];
				if (options) {
					if (hasOwn(attrs, key)) {
						if (value !== attrs[key]) {
							attrs[key] = value;
							hasAttrsChanged = true;
						}
					} else {
						const camelizedKey = camelize(key);
						props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
					}
				} else if (value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
	} else {
		if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
		let kebabKey;
		for (const key in rawCurrentProps) if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
			if (options) {
				if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
			} else delete props[key];
		}
		if (attrs !== rawCurrentProps) {
			for (const key in attrs) if (!rawProps || !hasOwn(rawProps, key) && true) {
				delete attrs[key];
				hasAttrsChanged = true;
			}
		}
	}
	if (hasAttrsChanged) trigger(instance.attrs, "set", "");
}
function setFullProps(instance, rawProps, props, attrs) {
	const [options, needCastKeys] = instance.propsOptions;
	let hasAttrsChanged = false;
	let rawCastValues;
	if (rawProps) for (let key in rawProps) {
		if (isReservedProp(key)) continue;
		const value = rawProps[key];
		let camelKey;
		if (options && hasOwn(options, camelKey = camelize(key))) {
			if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
			else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
		} else if (!isEmitListener(instance.emitsOptions, key)) {
			if (!(key in attrs) || value !== attrs[key]) {
				attrs[key] = value;
				hasAttrsChanged = true;
			}
		}
	}
	if (needCastKeys) {
		const rawCurrentProps = /* @__PURE__ */ toRaw(props);
		const castValues = rawCastValues || EMPTY_OBJ;
		for (let i = 0; i < needCastKeys.length; i++) {
			const key = needCastKeys[i];
			props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
		}
	}
	return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
	const opt = options[key];
	if (opt != null) {
		const hasDefault = hasOwn(opt, "default");
		if (hasDefault && value === void 0) {
			const defaultValue = opt.default;
			if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
				const { propsDefaults } = instance;
				if (key in propsDefaults) value = propsDefaults[key];
				else {
					const reset = setCurrentInstance(instance);
					value = propsDefaults[key] = defaultValue.call(null, props);
					reset();
				}
			} else value = defaultValue;
			if (instance.ce) instance.ce._setProp(key, value);
		}
		if (opt[0]) {
			if (isAbsent && !hasDefault) value = false;
			else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
		}
	}
	return value;
}
var mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
	const cache = asMixin ? mixinPropsCache : appContext.propsCache;
	const cached = cache.get(comp);
	if (cached) return cached;
	const raw = comp.props;
	const normalized = {};
	const needCastKeys = [];
	let hasExtends = false;
	if (!isFunction(comp)) {
		const extendProps = (raw2) => {
			hasExtends = true;
			const [props, keys] = normalizePropsOptions(raw2, appContext, true);
			extend(normalized, props);
			if (keys) needCastKeys.push(...keys);
		};
		if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
		if (comp.extends) extendProps(comp.extends);
		if (comp.mixins) comp.mixins.forEach(extendProps);
	}
	if (!raw && !hasExtends) {
		if (isObject(comp)) cache.set(comp, EMPTY_ARR);
		return EMPTY_ARR;
	}
	if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
		const normalizedKey = camelize(raw[i]);
		if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
	}
	else if (raw) for (const key in raw) {
		const normalizedKey = camelize(key);
		if (validatePropName(normalizedKey)) {
			const opt = raw[key];
			const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
			const propType = prop.type;
			let shouldCast = false;
			let shouldCastTrue = true;
			if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
				const type = propType[index];
				const typeName = isFunction(type) && type.name;
				if (typeName === "Boolean") {
					shouldCast = true;
					break;
				} else if (typeName === "String") shouldCastTrue = false;
			}
			else shouldCast = isFunction(propType) && propType.name === "Boolean";
			prop[0] = shouldCast;
			prop[1] = shouldCastTrue;
			if (shouldCast || hasOwn(prop, "default")) needCastKeys.push(normalizedKey);
		}
	}
	const res = [normalized, needCastKeys];
	if (isObject(comp)) cache.set(comp, res);
	return res;
}
function validatePropName(key) {
	if (key[0] !== "$" && !isReservedProp(key)) return true;
	return false;
}
var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
var normalizeSlot = (key, rawSlot, ctx) => {
	if (rawSlot._n) return rawSlot;
	const normalized = withCtx((...args) => {
		return normalizeSlotValue(rawSlot(...args));
	}, ctx);
	normalized._c = false;
	return normalized;
};
var normalizeObjectSlots = (rawSlots, slots, instance) => {
	const ctx = rawSlots._ctx;
	for (const key in rawSlots) {
		if (isInternalKey(key)) continue;
		const value = rawSlots[key];
		if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
		else if (value != null) {
			const normalized = normalizeSlotValue(value);
			slots[key] = () => normalized;
		}
	}
};
var normalizeVNodeSlots = (instance, children) => {
	const normalized = normalizeSlotValue(children);
	instance.slots.default = () => normalized;
};
var assignSlots = (slots, children, optimized) => {
	for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
};
var initSlots = (instance, children, optimized) => {
	const slots = instance.slots = createInternalObject();
	if (instance.vnode.shapeFlag & 32) {
		const type = children._;
		if (type) {
			assignSlots(slots, children, optimized);
			if (optimized) def(slots, "_", type, true);
		} else normalizeObjectSlots(children, slots);
	} else if (children) normalizeVNodeSlots(instance, children);
};
var updateSlots = (instance, children, optimized) => {
	const { vnode, slots } = instance;
	let needDeletionCheck = true;
	let deletionComparisonTarget = EMPTY_OBJ;
	if (vnode.shapeFlag & 32) {
		const type = children._;
		if (type) {
			if (optimized && type === 1) needDeletionCheck = false;
			else assignSlots(slots, children, optimized);
		} else {
			needDeletionCheck = !children.$stable;
			normalizeObjectSlots(children, slots);
		}
		deletionComparisonTarget = children;
	} else if (children) {
		normalizeVNodeSlots(instance, children);
		deletionComparisonTarget = { default: 1 };
	}
	if (needDeletionCheck) {
		for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
	}
};
var queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
	return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
	const target = getGlobalThis();
	target.__VUE__ = true;
	const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
	const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
		if (n1 === n2) return;
		if (n1 && !isSameVNodeType(n1, n2)) {
			anchor = getNextHostNode(n1);
			unmount(n1, parentComponent, parentSuspense, true);
			n1 = null;
		}
		if (n2.patchFlag === -2) {
			optimized = false;
			n2.dynamicChildren = null;
		}
		if (n2.dynamicChildren && n1 && n1.dynamicChildren && n1.dynamicChildren.hasOnce) {
			if (n2.dynamicChildren === EMPTY_ARR) n2.dynamicChildren = [];
			n2.dynamicChildren.hasOnce = true;
		}
		const { type, ref, shapeFlag } = n2;
		switch (type) {
			case Text:
				processText(n1, n2, container, anchor);
				break;
			case Comment:
				processCommentNode(n1, n2, container, anchor);
				break;
			case Static:
				if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
				break;
			case Fragment:
				processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				break;
			default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
			else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
		}
		if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
		else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
	};
	const processText = (n1, n2, container, anchor) => {
		if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
		else {
			const el = n2.el = n1.el;
			if (n2.children !== n1.children) hostSetText(el, n2.children);
		}
	};
	const processCommentNode = (n1, n2, container, anchor) => {
		if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
		else n2.el = n1.el;
	};
	const mountStaticNode = (n2, container, anchor, namespace) => {
		[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
	};
	const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
		let next;
		while (el && el !== anchor) {
			next = hostNextSibling(el);
			hostInsert(el, container, nextSibling);
			el = next;
		}
		hostInsert(anchor, container, nextSibling);
	};
	const removeStaticNode = ({ el, anchor }) => {
		let next;
		while (el && el !== anchor) {
			next = hostNextSibling(el);
			hostRemove(el);
			el = next;
		}
		hostRemove(anchor);
	};
	const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		if (n2.type === "svg") namespace = "svg";
		else if (n2.type === "math") namespace = "mathml";
		if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		else {
			const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
			try {
				if (customElement) customElement._beginPatch();
				patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} finally {
				if (customElement) customElement._endPatch();
			}
		}
	};
	const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		let el;
		let vnodeHook;
		const { props, shapeFlag, transition, dirs } = vnode;
		el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
		if (shapeFlag & 8) hostSetElementText(el, vnode.children);
		else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
		if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
		setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
		if (props) {
			for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
			if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
			if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
		}
		if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
		const needCallTransitionHooks = needTransition(parentSuspense, transition);
		if (needCallTransitionHooks) transition.beforeEnter(el);
		else if (transition && !transition.persisted) el[deferredEnterKey] = true;
		hostInsert(el, container, anchor);
		if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) queuePostRenderEffect(() => {
			try {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				needCallTransitionHooks && transition.enter(el);
				dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
			} finally {}
		}, parentSuspense);
	};
	const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
		if (scopeId) hostSetScopeId(el, scopeId);
		if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
		if (parentComponent) {
			let subTree = parentComponent.subTree;
			if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
				const parentVNode = parentComponent.vnode;
				setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
			}
		}
	};
	const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
		for (let i = start; i < children.length; i++) {
			const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
			patch(null, child, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		}
	};
	const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		const el = n2.el = n1.el;
		let { patchFlag, dynamicChildren, dirs } = n2;
		patchFlag |= n1.patchFlag & 16;
		const oldProps = n1.props || EMPTY_OBJ;
		const newProps = n2.props || EMPTY_OBJ;
		let vnodeHook;
		parentComponent && toggleRecurse(parentComponent, false);
		if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
		if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
		parentComponent && toggleRecurse(parentComponent, true);
		if (dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)) {
			patchFlag = 0;
			optimized = false;
			dynamicChildren = null;
		}
		if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
		if (dynamicChildren) patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
		else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
		if (patchFlag > 0) {
			if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
			else {
				if (patchFlag & 2) {
					if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
				}
				if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
				if (patchFlag & 8) {
					const propsToUpdate = n2.dynamicProps;
					for (let i = 0; i < propsToUpdate.length; i++) {
						const key = propsToUpdate[i];
						const prev = oldProps[key];
						const next = newProps[key];
						if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
					}
				}
			}
			if (patchFlag & 1) {
				if (n1.children !== n2.children) hostSetElementText(el, n2.children);
			}
		} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
		if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
			vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
		}, parentSuspense);
	};
	const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
		for (let i = 0; i < newChildren.length; i++) {
			const oldVNode = oldChildren[i];
			const newVNode = newChildren[i];
			const oldEl = oldVNode.el || resolveAsyncComponentPlaceholder(oldVNode);
			const container = oldEl && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldEl) : fallbackContainer;
			patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
		}
	};
	const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
		if (oldProps !== newProps) {
			if (oldProps !== EMPTY_OBJ) {
				for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
			}
			for (const key in newProps) {
				if (isReservedProp(key)) continue;
				const next = newProps[key];
				const prev = oldProps[key];
				if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
			}
			if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
		}
	};
	const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
		const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
		let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
		if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
		if (n1 == null) {
			hostInsert(fragmentStartAnchor, container, anchor);
			hostInsert(fragmentEndAnchor, container, anchor);
			mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
			patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
			if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
		} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
	};
	const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		n2.slotScopeIds = slotScopeIds;
		if (n1 == null) {
			if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
			else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
		} else updateComponent(n1, n2, optimized);
	};
	const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
		const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
		if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
		setupComponent(instance, false, optimized);
		if (instance.asyncDep) {
			parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized, namespace);
			if (!initialVNode.el) {
				const placeholder = instance.subTree = createVNode(Comment);
				processCommentNode(null, placeholder, container, anchor);
				initialVNode.placeholder = placeholder.el;
			}
		} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
	};
	const updateComponent = (n1, n2, optimized) => {
		const instance = n2.component = n1.component;
		if (shouldUpdateComponent(n1, n2, optimized)) {
			if (instance.asyncDep && !instance.asyncResolved) {
				n2.el = n1.el;
				n2.placeholder = n1.placeholder;
				updateComponentPreRender(instance, n2, optimized);
				return;
			} else {
				instance.next = n2;
				instance.update();
			}
		} else {
			n2.el = n1.el;
			n2.placeholder = n1.placeholder;
			instance.vnode = n2;
		}
	};
	const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
		const componentUpdateFn = () => {
			if (!instance.isMounted) {
				let vnodeHook;
				const { el, props } = initialVNode;
				const { bm, m, parent, root, type } = instance;
				const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
				toggleRecurse(instance, false);
				if (bm) invokeArrayFns(bm);
				if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
				toggleRecurse(instance, true);
				if (el && hydrateNode) {
					const hydrateSubTree = () => {
						instance.subTree = renderComponentRoot(instance);
						hydrateNode(el, instance.subTree, instance, parentSuspense, null);
					};
					if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
					else hydrateSubTree();
				} else {
					if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
					const subTree = instance.subTree = renderComponentRoot(instance);
					patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
					initialVNode.el = subTree.el;
				}
				if (m) queuePostRenderEffect(m, parentSuspense);
				if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
					const scopedInitialVNode = initialVNode;
					queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
				}
				if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
				instance.isMounted = true;
				initialVNode = container = anchor = null;
			} else {
				let { next, bu, u, parent, vnode } = instance;
				{
					const unresolvedAsyncRoot = locateUnresolvedAsyncRoot(instance);
					if (unresolvedAsyncRoot) {
						if (next) {
							next.el = vnode.el;
							updateComponentPreRender(instance, next, optimized);
						}
						unresolvedAsyncRoot.asyncDep.then(() => {
							const retry = () => {
								if (instance.job.flags & 8) return;
								if (parentSuspense && parentSuspense.pendingBranch) queuePostRenderEffect(retry, parentSuspense);
								else update();
							};
							retry.flags = 48;
							queuePostRenderEffect(retry, parentSuspense);
						});
						return;
					}
				}
				let originNext = next;
				let vnodeHook;
				toggleRecurse(instance, false);
				if (next) {
					next.el = vnode.el;
					updateComponentPreRender(instance, next, optimized);
				} else next = vnode;
				if (bu) invokeArrayFns(bu);
				if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
				toggleRecurse(instance, true);
				const nextTree = renderComponentRoot(instance);
				const prevTree = instance.subTree;
				instance.subTree = nextTree;
				patch(prevTree, nextTree, hostParentNode(prevTree.el || resolveAsyncComponentPlaceholder(prevTree)), getNextHostNode(prevTree), instance, parentSuspense, namespace);
				next.el = nextTree.el;
				if (originNext === null) updateHOCHostEl(instance, nextTree.el);
				if (u) queuePostRenderEffect(u, parentSuspense);
				if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
			}
		};
		instance.scope.on();
		const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
		instance.scope.off();
		const update = instance.update = effect.run.bind(effect);
		const job = instance.job = effect.runIfDirty.bind(effect);
		job.i = instance;
		job.id = instance.uid;
		effect.scheduler = () => queueJob(job);
		toggleRecurse(instance, true);
		update();
	};
	const updateComponentPreRender = (instance, nextVNode, optimized) => {
		nextVNode.component = instance;
		const prevProps = instance.vnode.props;
		instance.vnode = nextVNode;
		instance.next = null;
		updateProps(instance, nextVNode.props, prevProps, optimized);
		updateSlots(instance, nextVNode.children, optimized);
		pauseTracking();
		flushPreFlushCbs(instance);
		resetTracking();
	};
	const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
		const c1 = n1 && n1.children;
		const prevShapeFlag = n1 ? n1.shapeFlag : 0;
		const c2 = n2.children;
		const { patchFlag, shapeFlag } = n2;
		if (patchFlag > 0) {
			if (patchFlag & 128) {
				patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				return;
			} else if (patchFlag & 256) {
				patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				return;
			}
		}
		if (shapeFlag & 8) {
			if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
			if (c2 !== c1) hostSetElementText(container, c2);
		} else if (prevShapeFlag & 16) {
			if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else unmountChildren(c1, parentComponent, parentSuspense, true);
		} else {
			if (prevShapeFlag & 8) hostSetElementText(container, "");
			if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		}
	};
	const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		c1 = c1 || EMPTY_ARR;
		c2 = c2 || EMPTY_ARR;
		const oldLength = c1.length;
		const newLength = c2.length;
		const commonLength = Math.min(oldLength, newLength);
		let i = 0;
		for (; i < commonLength; i++) {
			const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
			patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		}
		if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
		else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
	};
	const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		let i = 0;
		const l2 = c2.length;
		let e1 = c1.length - 1;
		let e2 = l2 - 1;
		while (i <= e1 && i <= e2) {
			const n1 = c1[i];
			const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
			if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else break;
			i++;
		}
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1];
			const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
			if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else break;
			e1--;
			e2--;
		}
		if (i > e1) {
			if (i <= e2) {
				const nextPos = e2 + 1;
				const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
				while (i <= e2) {
					patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					i++;
				}
			}
		} else if (i > e2) while (i <= e1) {
			unmount(c1[i], parentComponent, parentSuspense, true);
			i++;
		}
		else {
			const s1 = i;
			const s2 = i;
			const keyToNewIndexMap = /* @__PURE__ */ new Map();
			for (i = s2; i <= e2; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (nextChild.key != null) keyToNewIndexMap.set(nextChild.key, i);
			}
			let j;
			let patched = 0;
			const toBePatched = e2 - s2 + 1;
			let moved = false;
			let maxNewIndexSoFar = 0;
			const newIndexToOldIndexMap = new Array(toBePatched);
			for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
			for (i = s1; i <= e1; i++) {
				const prevChild = c1[i];
				if (patched >= toBePatched) {
					unmount(prevChild, parentComponent, parentSuspense, true);
					continue;
				}
				let newIndex;
				if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
				else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
					newIndex = j;
					break;
				}
				if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
				else {
					newIndexToOldIndexMap[newIndex - s2] = i + 1;
					if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
					else moved = true;
					patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					patched++;
				}
			}
			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
			j = increasingNewIndexSequence.length - 1;
			for (i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = s2 + i;
				const nextChild = c2[nextIndex];
				const anchorVNode = c2[nextIndex + 1];
				const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
				if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (moved) {
					if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
					else j--;
				}
			}
		}
	};
	const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
		const { el, type, transition, children, shapeFlag } = vnode;
		if (shapeFlag & 6) {
			move(vnode.component.subTree, container, anchor, moveType);
			return;
		}
		if (shapeFlag & 128) {
			vnode.suspense.move(container, anchor, moveType);
			return;
		}
		if (shapeFlag & 64) {
			type.move(vnode, container, anchor, internals);
			return;
		}
		if (type === Fragment) {
			hostInsert(el, container, anchor);
			for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
			hostInsert(vnode.anchor, container, anchor);
			return;
		}
		if (type === Static) {
			moveStaticNode(vnode, container, anchor);
			return;
		}
		if (moveType !== 2 && shapeFlag & 1 && transition) {
			if (moveType === 0) {
				if (transition.persisted && !el[leaveCbKey]) hostInsert(el, container, anchor);
				else {
					transition.beforeEnter(el);
					hostInsert(el, container, anchor);
					queuePostRenderEffect(() => transition.enter(el), parentSuspense);
				}
			} else {
				const { leave, delayLeave, afterLeave } = transition;
				const remove2 = () => {
					if (vnode.ctx.isUnmounted) hostRemove(el);
					else hostInsert(el, container, anchor);
				};
				const performLeave = () => {
					const wasLeaving = el._isLeaving || !!el[leaveCbKey];
					if (el._isLeaving) el[leaveCbKey](true);
					if (transition.persisted && !wasLeaving) remove2();
					else leave(el, () => {
						remove2();
						afterLeave && afterLeave();
					});
				};
				if (delayLeave) delayLeave(el, remove2, performLeave);
				else performLeave();
			}
		} else hostInsert(el, container, anchor);
	};
	const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
		const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
		if (patchFlag === -2 || dynamicChildren && dynamicChildren.hasOnce) optimized = false;
		if (ref != null) {
			pauseTracking();
			setRef(ref, null, parentSuspense, vnode, true);
			resetTracking();
		}
		if (cacheIndex != null && (!vnode.ctx || vnode.ctx === parentComponent)) parentComponent.renderCache[cacheIndex] = void 0;
		if (shapeFlag & 256 && parentComponent.ctx.deactivate(vnode)) return;
		const shouldInvokeDirs = shapeFlag & 1 && dirs;
		const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
		let vnodeHook;
		if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
		if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
		else {
			if (shapeFlag & 128) {
				vnode.suspense.unmount(parentSuspense, doRemove);
				return;
			}
			if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
			if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
			else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
			else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
			if (doRemove) remove(vnode);
		}
		const shouldInvalidateMemo = memo != null && cacheIndex == null;
		if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
			vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
			shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
			if (shouldInvalidateMemo) vnode.el = null;
		}, parentSuspense);
	};
	const remove = (vnode) => {
		const { type, el, anchor, transition } = vnode;
		const isFragment = type === Fragment;
		if (isFragment && !transition) {
			removeFragment(el, anchor);
			return;
		}
		if (type === Static) {
			removeStaticNode(vnode);
			if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
			return;
		}
		const leavingNode = isFragment ? getTransitionRoot(vnode) : vnode;
		const performRemove = () => {
			if (isFragment) {
				if (hostParentNode(el)) removeFragment(el, anchor);
			} else hostRemove(el);
			if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
		};
		if (leavingNode && leavingNode.shapeFlag & 1 && transition && !transition.persisted) {
			const { leave, delayLeave } = transition;
			const leavingEl = leavingNode.el;
			const performLeave = () => leave(leavingEl, performRemove);
			if (delayLeave) delayLeave(leavingEl, performRemove, performLeave);
			else performLeave();
		} else performRemove();
	};
	const removeFragment = (cur, end) => {
		let next;
		while (cur !== end) {
			next = hostNextSibling(cur);
			hostRemove(cur);
			cur = next;
		}
		hostRemove(end);
	};
	const unmountComponent = (instance, parentSuspense, doRemove) => {
		const { bum, scope, job, subTree, um, m, a } = instance;
		invalidateMount(m);
		invalidateMount(a);
		if (bum) invokeArrayFns(bum);
		scope.stop();
		if (job) {
			job.flags |= 8;
			unmount(subTree, instance, parentSuspense, doRemove);
		} else if (subTree) {
			subTree.transition = instance.vnode.transition;
			unmount(subTree, instance, parentSuspense, doRemove);
		}
		if (um) queuePostRenderEffect(um, parentSuspense);
		const markUnmounted = () => {
			instance.isUnmounted = true;
		};
		markUnmounted.flags = 16;
		queuePostRenderEffect(markUnmounted, parentSuspense);
	};
	const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
		for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
	};
	const getNextHostNode = (vnode) => {
		if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
		if (vnode.shapeFlag & 128) return vnode.suspense.next();
		const el = hostNextSibling(vnode.anchor || vnode.el);
		const teleportEnd = el && el[TeleportEndKey];
		return teleportEnd ? hostNextSibling(teleportEnd) : el;
	};
	const render = (vnode, container, namespace) => {
		flushOnAppMount(() => {
			if (vnode == null) {
				if (container._vnode) unmount(container._vnode, null, null, true);
			} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
			container._vnode = vnode;
		}, vnode && container._vnode ? void 0 : vnode && vnode.component ? vnode.component.uid : getNextUid());
	};
	const internals = {
		p: patch,
		um: unmount,
		m: move,
		r: remove,
		mt: mountComponent,
		mc: mountChildren,
		pc: patchChildren,
		pbc: patchBlockChildren,
		n: getNextHostNode,
		o: options
	};
	let hydrate;
	let hydrateNode;
	if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
	return {
		render,
		hydrate,
		createApp: createAppAPI(render, hydrate)
	};
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
	return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, job }, allowed) {
	if (allowed) {
		effect.flags |= 32;
		job.flags |= 4;
	} else {
		effect.flags &= -33;
		job.flags &= -5;
	}
}
function needTransition(parentSuspense, transition) {
	return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
	const ch1 = n1.children;
	const ch2 = n2.children;
	if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
		const c1 = ch1[i];
		let c2 = ch2[i];
		if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
			if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
				c2 = ch2[i] = cloneIfMounted(ch2[i]);
				c2.el = c1.el;
			}
			if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
		}
		if (c2.type === Text) {
			if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
			c2.el = c1.el;
		}
		if (c2.type === Comment && !c2.el) c2.el = c1.el;
	}
}
function getSequence(arr) {
	const p = arr.slice();
	const result = [0];
	let i, j, u, v, c;
	const len = arr.length;
	for (i = 0; i < len; i++) {
		const arrI = arr[i];
		if (arrI !== 0) {
			j = result[result.length - 1];
			if (arr[j] < arrI) {
				p[i] = j;
				result.push(i);
				continue;
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				c = u + v >> 1;
				if (arr[result[c]] < arrI) u = c + 1;
				else v = c;
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) p[i] = result[u - 1];
				result[u] = i;
			}
		}
	}
	u = result.length;
	v = result[u - 1];
	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}
	return result;
}
function locateUnresolvedAsyncRoot(instance) {
	const subComponent = instance.subTree.component;
	if (subComponent) {
		if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
		else return locateUnresolvedAsyncRoot(subComponent);
	}
}
function invalidateMount(hooks) {
	if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
	if (anchorVnode.placeholder) return anchorVnode.placeholder;
	const instance = anchorVnode.component;
	if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
	const suspense = anchorVnode.suspense;
	if (suspense && suspense.activeBranch) return resolveAsyncComponentPlaceholder(suspense.activeBranch);
	return null;
}
var isSuspense = (type) => type.__isSuspense;
var deferredEnterKey = /* @__PURE__ */ Symbol("_deferredEnter");
function queueEffectWithSuspense(fn, suspense) {
	if (suspense && suspense.pendingBranch) {
		if (isArray(fn)) suspense.effects.push(...fn);
		else suspense.effects.push(fn);
	} else queuePostFlushCb(fn);
}
var Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
var Text = /* @__PURE__ */ Symbol.for("v-txt");
var Comment = /* @__PURE__ */ Symbol.for("v-cmt");
var Static = /* @__PURE__ */ Symbol.for("v-stc");
var blockStack = [];
var currentBlock = null;
function openBlock(disableTracking = false) {
	blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
	blockStack.pop();
	currentBlock = blockStack[blockStack.length - 1] || null;
}
var isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
	isBlockTreeEnabled += value;
	if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
}
function setupBlock(vnode) {
	vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
	closeBlock();
	if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
	return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
	return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
	return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
	return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
	return n1.type === n2.type && n1.key === n2.key;
}
var normalizeKey = ({ key }) => key != null ? key : null;
var normalizeRef = ({ ref, ref_key, ref_for }) => {
	if (typeof ref === "number") ref = "" + ref;
	return ref != null ? isString(ref) || /* @__PURE__ */ isRef(ref) || isFunction(ref) ? {
		i: currentRenderingInstance,
		r: ref,
		k: ref_key,
		f: !!ref_for
	} : ref : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
	const vnode = {
		__v_isVNode: true,
		__v_skip: true,
		type,
		props,
		key: props && normalizeKey(props),
		ref: props && normalizeRef(props),
		scopeId: currentScopeId,
		slotScopeIds: null,
		children,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag,
		patchFlag,
		dynamicProps,
		dynamicChildren: null,
		appContext: null,
		ctx: currentRenderingInstance
	};
	if (needFullChildrenNormalization) {
		normalizeChildren(vnode, children);
		if (shapeFlag & 128) type.normalize(vnode);
	} else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
	if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
	return vnode;
}
var createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
	if (!type || type === NULL_DYNAMIC_COMPONENT) type = Comment;
	if (isVNode(type)) {
		const cloned = cloneVNode(type, props, true);
		if (children) normalizeChildren(cloned, children);
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
			if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
			else currentBlock.push(cloned);
		}
		cloned.patchFlag = -2;
		return cloned;
	}
	if (isClassComponent(type)) type = type.__vccOpts;
	if (props) {
		props = guardReactiveProps(props);
		let { class: klass, style } = props;
		if (klass && !isString(klass)) props.class = normalizeClass(klass);
		if (isObject(style)) {
			if (/* @__PURE__ */ isProxy(style) && !isArray(style)) style = extend({}, style);
			props.style = normalizeStyle(style);
		}
	}
	const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
	return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
	if (!props) return null;
	if (/* @__PURE__ */ isProxy(props)) return extend({}, props);
	return isInternalObject(props) ? extend({}, props[rawAttrsKey] || props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
	const { props, ref, patchFlag, children, transition } = vnode;
	const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
	const cloned = {
		__v_isVNode: true,
		__v_skip: true,
		type: vnode.type,
		props: mergedProps,
		key: mergedProps && normalizeKey(mergedProps),
		ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
		scopeId: vnode.scopeId,
		slotScopeIds: vnode.slotScopeIds,
		children,
		target: vnode.target,
		targetStart: vnode.targetStart,
		targetAnchor: vnode.targetAnchor,
		staticCount: vnode.staticCount,
		shapeFlag: vnode.shapeFlag,
		patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
		dynamicProps: vnode.dynamicProps,
		dynamicChildren: vnode.dynamicChildren,
		appContext: vnode.appContext,
		dirs: vnode.dirs,
		transition,
		component: vnode.component,
		suspense: vnode.suspense,
		ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
		ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
		placeholder: vnode.placeholder,
		el: vnode.el,
		anchor: vnode.anchor,
		ctx: vnode.ctx,
		ce: vnode.ce,
		cacheIndex: vnode.cacheIndex
	};
	if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
	return cloned;
}
function createTextVNode(text = " ", flag = 0) {
	return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
	const vnode = createVNode(Static, null, content);
	vnode.staticCount = numberOfNodes;
	return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
	return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
	if (child == null || typeof child === "boolean") return createVNode(Comment);
	else if (isArray(child)) return createVNode(Fragment, null, child.slice());
	else if (isVNode(child)) return cloneIfMounted(child);
	else return createVNode(Text, null, String(child));
}
function cloneIfMounted(child) {
	return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
	let type = 0;
	const { shapeFlag } = vnode;
	if (children == null) children = null;
	else if (isArray(children)) type = 16;
	else if (typeof children === "object") {
		if (shapeFlag & 65) {
			const slot = children.default;
			if (slot) {
				slot._c && (slot._d = false);
				normalizeChildren(vnode, slot());
				slot._c && (slot._d = true);
			}
			return;
		} else {
			type = 32;
			const slotFlag = children._;
			if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
			else if (slotFlag === 3 && currentRenderingInstance) {
				if (currentRenderingInstance.slots._ === 1) children._ = 1;
				else {
					children._ = 2;
					vnode.patchFlag |= 1024;
				}
			}
		}
	} else if (isFunction(children)) {
		if (shapeFlag & 65) {
			normalizeChildren(vnode, { default: children });
			return;
		}
		children = {
			default: children,
			_ctx: currentRenderingInstance
		};
		type = 32;
	} else {
		children = String(children);
		if (shapeFlag & 64) {
			type = 16;
			children = [createTextVNode(children)];
		} else type = 8;
	}
	vnode.children = children;
	vnode.shapeFlag |= type;
}
function mergeProps(...args) {
	const ret = {};
	for (let i = 0; i < args.length; i++) {
		const toMerge = args[i];
		for (const key in toMerge) if (key === "class") {
			if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
		} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
		else if (isOn(key)) {
			const existing = ret[key];
			const incoming = toMerge[key];
			if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
			else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
		} else if (key !== "") ret[key] = toMerge[key];
	}
	return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
	callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
}
var emptyAppContext = /* @__PURE__ */ createAppContext();
var uid = 0;
function getNextUid() {
	return uid;
}
function createComponentInstance(vnode, parent, suspense) {
	const type = vnode.type;
	const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
	const instance = {
		uid: uid++,
		vnode,
		type,
		parent,
		appContext,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new EffectScope(true),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: parent ? parent.provides : Object.create(appContext.provides),
		ids: parent ? parent.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: normalizePropsOptions(type, appContext),
		emitsOptions: normalizeEmitsOptions(type, appContext),
		emit: null,
		emitted: null,
		propsDefaults: EMPTY_OBJ,
		inheritAttrs: type.inheritAttrs,
		ctx: EMPTY_OBJ,
		data: EMPTY_OBJ,
		props: EMPTY_OBJ,
		attrs: EMPTY_OBJ,
		slots: EMPTY_OBJ,
		refs: EMPTY_OBJ,
		setupState: EMPTY_OBJ,
		setupContext: null,
		suspense,
		suspenseId: suspense ? suspense.pendingId : 0,
		asyncDep: null,
		asyncResolved: false,
		isMounted: false,
		isUnmounted: false,
		isDeactivated: false,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	instance.ctx = { _: instance };
	instance.root = parent ? parent.root : instance;
	instance.emit = emit$1.bind(null, instance);
	if (vnode.ce) vnode.ce(instance);
	return instance;
}
var currentInstance = null;
var getCurrentInstance = () => currentInstance || currentRenderingInstance;
var internalSetCurrentInstance;
var setInSSRSetupState;
{
	const g = getGlobalThis();
	const registerGlobalSetter = (key, setter) => {
		let setters;
		if (!(setters = g[key])) setters = g[key] = [];
		setters.push(setter);
		return (v) => {
			if (setters.length > 1) setters.forEach((set) => set(v));
			else setters[0](v);
		};
	};
	internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
	setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
}
var setCurrentInstance = (instance) => {
	const prev = currentInstance;
	internalSetCurrentInstance(instance);
	instance.scope.on();
	return () => {
		instance.scope.off();
		internalSetCurrentInstance(prev);
	};
};
var unsetCurrentInstance = () => {
	currentInstance && currentInstance.scope.off();
	internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
	return instance.vnode.shapeFlag & 4;
}
var isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
	isSSR && setInSSRSetupState(isSSR);
	const { props, children } = instance.vnode;
	const isStateful = isStatefulComponent(instance);
	initProps(instance, props, isStateful, isSSR);
	initSlots(instance, children, optimized || isSSR);
	const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
	isSSR && setInSSRSetupState(false);
	return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
	const Component = instance.type;
	instance.accessCache = /* @__PURE__ */ Object.create(null);
	instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
	const { setup } = Component;
	if (setup) {
		pauseTracking();
		const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
		const reset = setCurrentInstance(instance);
		const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
		const isAsyncSetup = isPromise(setupResult);
		resetTracking();
		reset();
		if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
		if (isAsyncSetup) {
			setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
			if (isSSR) return setupResult.then((resolvedResult) => {
				setInSSRSetupState(true);
				try {
					handleSetupResult(instance, resolvedResult, isSSR);
				} finally {
					setInSSRSetupState(false);
				}
			}).catch((e) => {
				handleError(e, instance, 0, void 0, true);
				instance.ssrRender = (_, push) => push("<!---->");
			});
			else instance.asyncDep = setupResult;
		} else handleSetupResult(instance, setupResult, isSSR);
	} else finishComponentSetup(instance, isSSR);
}
function handleSetupResult(instance, setupResult, isSSR) {
	if (isFunction(setupResult)) {
		if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
		else instance.render = setupResult;
	} else if (isObject(setupResult)) instance.setupState = proxyRefs(setupResult);
	finishComponentSetup(instance, isSSR);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
	const Component = instance.type;
	if (!instance.render) instance.render = Component.render || NOOP;
	{
		const reset = setCurrentInstance(instance);
		pauseTracking();
		try {
			applyOptions(instance);
		} finally {
			resetTracking();
			reset();
		}
	}
}
var rawAttrsKey = /* @__PURE__ */ Symbol();
var attrsProxyHandlers = { get(target, key) {
	track(target, "get", "");
	return key === rawAttrsKey ? target : target[key];
} };
function createSetupContext(instance) {
	const expose = (exposed) => {
		instance.exposed = exposed || {};
	};
	return {
		attrs: new Proxy(instance.attrs, attrsProxyHandlers),
		slots: instance.slots,
		emit: instance.emit,
		expose
	};
}
function getComponentPublicInstance(instance) {
	if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
		get(target, key) {
			if (key in target) return target[key];
			else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
		},
		has(target, key) {
			return key in target || key in publicPropertiesMap;
		}
	}));
	else return instance.proxy;
}
function isClassComponent(value) {
	return isFunction(value) && "__vccOpts" in value;
}
var computed = (getterOrOptions, debugOptions) => {
	return /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
function h(type, propsOrChildren, children) {
	try {
		setBlockTracking(-1);
		const l = arguments.length;
		if (l === 2) {
			if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
				if (isVNode(propsOrChildren)) return createVNode(type, null, [propsOrChildren]);
				return createVNode(type, propsOrChildren);
			} else return createVNode(type, null, propsOrChildren);
		} else {
			if (l > 3) children = Array.prototype.slice.call(arguments, 2);
			else if (l === 3 && isVNode(children)) children = [children];
			return createVNode(type, propsOrChildren, children);
		}
	} finally {
		setBlockTracking(1);
	}
}
var version = "3.5.45";
// node_modules/.pnpm/@vue+runtime-dom@3.5.45/node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
/**
* @vue/runtime-dom v3.5.45
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var policy = void 0;
var tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) try {
	policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (val) => val });
} catch (e) {}
var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
var svgNS = "http://www.w3.org/2000/svg";
var mathmlNS = "http://www.w3.org/1998/Math/MathML";
var doc = typeof document !== "undefined" ? document : null;
var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
var nodeOps = {
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null);
	},
	remove: (child) => {
		const parent = child.parentNode;
		if (parent) parent.removeChild(child);
	},
	createElement: (tag, namespace, is, props) => {
		const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
		if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
		return el;
	},
	createText: (text) => doc.createTextNode(text),
	createComment: (text) => doc.createComment(text),
	setText: (node, text) => {
		node.nodeValue = text;
	},
	setElementText: (el, text) => {
		el.textContent = text;
	},
	parentNode: (node) => node.parentNode,
	nextSibling: (node) => node.nextSibling,
	querySelector: (selector) => doc.querySelector(selector),
	setScopeId(el, id) {
		el.setAttribute(id, "");
	},
	insertStaticContent(content, parent, anchor, namespace, start, end) {
		const before = anchor ? anchor.previousSibling : parent.lastChild;
		if (start && (start === end || start.nextSibling)) while (true) {
			parent.insertBefore(start.cloneNode(true), anchor);
			if (start === end || !(start = start.nextSibling)) break;
		}
		else {
			templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
			const template = templateContainer.content;
			if (namespace === "svg" || namespace === "mathml") {
				const wrapper = template.firstChild;
				while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
				template.removeChild(wrapper);
			}
			parent.insertBefore(template, anchor);
		}
		return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
	}
};
var TRANSITION = "transition";
var ANIMATION = "animation";
var vtcKey = /* @__PURE__ */ Symbol("_vtc");
var DOMTransitionPropsValidators = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: true
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
};
var TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
var decorate$1 = (t) => {
	t.displayName = "Transition";
	t.props = TransitionPropsValidators;
	return t;
};
var Transition = /* @__PURE__ */ decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
var callHook = (hook, args = []) => {
	if (isArray(hook)) hook.forEach((h2) => h2(...args));
	else if (hook) hook(...args);
};
var hasExplicitCallback = (hook) => {
	return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
	const baseProps = {};
	for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
	if (rawProps.css === false) return baseProps;
	const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
	const durations = normalizeDuration(duration);
	const enterDuration = durations && durations[0];
	const leaveDuration = durations && durations[1];
	const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
	const finishEnter = (el, isAppear, done, isCancelled) => {
		el._enterCancelled = isCancelled;
		removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
		removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
		done && done();
	};
	const finishLeave = (el, done) => {
		el._isLeaving = false;
		removeTransitionClass(el, leaveFromClass);
		removeTransitionClass(el, leaveToClass);
		removeTransitionClass(el, leaveActiveClass);
		done && done();
	};
	const makeEnterHook = (isAppear) => {
		return (el, done) => {
			const hook = isAppear ? onAppear : onEnter;
			const resolve = () => finishEnter(el, isAppear, done);
			callHook(hook, [el, resolve]);
			nextFrame(() => {
				removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
				addTransitionClass(el, isAppear ? appearToClass : enterToClass);
				if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
			});
		};
	};
	return extend(baseProps, {
		onBeforeEnter(el) {
			callHook(onBeforeEnter, [el]);
			addTransitionClass(el, enterFromClass);
			addTransitionClass(el, enterActiveClass);
		},
		onBeforeAppear(el) {
			callHook(onBeforeAppear, [el]);
			addTransitionClass(el, appearFromClass);
			addTransitionClass(el, appearActiveClass);
		},
		onEnter: makeEnterHook(false),
		onAppear: makeEnterHook(true),
		onLeave(el, done) {
			el._isLeaving = true;
			const resolve = () => finishLeave(el, done);
			addTransitionClass(el, leaveFromClass);
			if (!el._enterCancelled) {
				forceReflow(el);
				addTransitionClass(el, leaveActiveClass);
			} else {
				addTransitionClass(el, leaveActiveClass);
				forceReflow(el);
			}
			nextFrame(() => {
				if (!el._isLeaving) return;
				removeTransitionClass(el, leaveFromClass);
				addTransitionClass(el, leaveToClass);
				if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
			});
			callHook(onLeave, [el, resolve]);
		},
		onEnterCancelled(el) {
			finishEnter(el, false, void 0, true);
			callHook(onEnterCancelled, [el]);
		},
		onAppearCancelled(el) {
			finishEnter(el, true, void 0, true);
			callHook(onAppearCancelled, [el]);
		},
		onLeaveCancelled(el) {
			finishLeave(el);
			callHook(onLeaveCancelled, [el]);
		}
	});
}
function normalizeDuration(duration) {
	if (duration == null) return null;
	else if (isObject(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
	else {
		const n = NumberOf(duration);
		return [n, n];
	}
}
function NumberOf(val) {
	return toNumber(val);
}
function addTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
	(el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
	const _vtc = el[vtcKey];
	if (_vtc) {
		_vtc.delete(cls);
		if (!_vtc.size) el[vtcKey] = void 0;
	}
}
function nextFrame(cb) {
	requestAnimationFrame(() => {
		requestAnimationFrame(cb);
	});
}
var endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
	const id = el._endId = ++endId;
	const resolveIfNotStale = () => {
		if (id === el._endId) resolve();
	};
	if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
	const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
	if (!type) return resolve();
	const endEvent = type + "end";
	let ended = 0;
	const end = () => {
		el.removeEventListener(endEvent, onEnd);
		resolveIfNotStale();
	};
	const onEnd = (e) => {
		if (e.target === el && ++ended >= propCount) end();
	};
	setTimeout(() => {
		if (ended < propCount) end();
	}, timeout + 1);
	el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
	const styles = window.getComputedStyle(el);
	const getStyleProperties = (key) => (styles[key] || "").split(", ");
	const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
	const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
	const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
	const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
	const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
	const animationTimeout = getTimeout(animationDelays, animationDurations);
	let type = null;
	let timeout = 0;
	let propCount = 0;
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
	const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
	return {
		type,
		timeout,
		propCount,
		hasTransform
	};
}
function getTimeout(delays, durations) {
	while (delays.length < durations.length) delays = delays.concat(delays);
	return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
	if (s === "auto") return 0;
	return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
	return (el ? el.ownerDocument : document).body.offsetHeight;
}
function patchClass(el, value, isSVG) {
	const transitionClasses = el[vtcKey];
	if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
	if (value == null) el.removeAttribute("class");
	else if (isSVG) el.setAttribute("class", value);
	else el.className = value;
}
var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
var CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
	const style = el.style;
	const isCssString = isString(next);
	let hasControlledDisplay = false;
	if (next && !isCssString) {
		if (prev) {
			if (!isString(prev)) {
				for (const key in prev) if (next[key] == null) setStyle(style, key, "");
			} else for (const prevStyle of prev.split(";")) {
				const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
				if (next[key] == null) setStyle(style, key, "");
			}
		}
		for (const key in next) {
			if (key === "display") hasControlledDisplay = true;
			const value = next[key];
			if (value != null) {
				if (!shouldPreserveTextareaResizeStyle(el, key, !isString(prev) && prev ? prev[key] : void 0, value)) setStyle(style, key, value);
			} else setStyle(style, key, "");
		}
	} else if (isCssString) {
		if (prev !== next) {
			const cssVarText = style[CSS_VAR_TEXT];
			if (cssVarText) next += ";" + cssVarText;
			style.cssText = next;
			hasControlledDisplay = displayRE.test(next);
		}
	} else if (prev) el.removeAttribute("style");
	if (vShowOriginalDisplay in el) {
		if (!isCssString || prev !== next) el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
		if (el[vShowHidden]) style.display = "none";
	}
}
var importantRE = /\s*!important$/;
function setStyle(style, name, val) {
	if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
	else {
		if (val == null) val = "";
		if (name.startsWith("--")) {
			if (importantRE.test(val)) style.setProperty(name, val.replace(importantRE, ""), "important");
			else style.setProperty(name, val);
		} else {
			const prefixed = autoPrefix(style, name);
			if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
			else style[prefixed] = val;
		}
	}
}
var prefixes = [
	"Webkit",
	"Moz",
	"ms"
];
var prefixCache = {};
function autoPrefix(style, rawName) {
	const cached = prefixCache[rawName];
	if (cached) return cached;
	let name = camelize(rawName);
	if (name !== "filter" && name in style) return prefixCache[rawName] = name;
	name = capitalize(name);
	for (let i = 0; i < prefixes.length; i++) {
		const prefixed = prefixes[i] + name;
		if (prefixed in style) return prefixCache[rawName] = prefixed;
	}
	return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
	return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
	if (isSVG && key.startsWith("xlink:")) {
		if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
		else el.setAttributeNS(xlinkNS, key, value);
	} else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
	else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
	if (key === "innerHTML" || key === "textContent") {
		if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
		return;
	}
	const tag = el.tagName;
	if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
		const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
		const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
		if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
		if (value == null) el.removeAttribute(key);
		el._value = value;
		return;
	}
	let needRemove = false;
	if (value === "" || value == null) {
		const type = typeof el[key];
		if (type === "boolean") value = includeBooleanAttr(value);
		else if (value == null && type === "string") {
			value = "";
			needRemove = true;
		} else if (type === "number") {
			value = 0;
			needRemove = true;
		}
	}
	try {
		el[key] = value;
	} catch (e) {}
	needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
	el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
	el.removeEventListener(event, handler, options);
}
var veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
	const invokers = el[veiKey] || (el[veiKey] = {});
	const existingInvoker = invokers[rawName];
	if (nextValue && existingInvoker) existingInvoker.value = nextValue;
	else {
		const [name, options] = parseName(rawName);
		if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(nextValue, instance), options);
		else if (existingInvoker) {
			removeEventListener(el, name, existingInvoker, options);
			invokers[rawName] = void 0;
		}
	}
}
var optionsModifierRE = /(Once|Passive|Capture)$/;
var optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
function parseName(name) {
	let options;
	let m;
	while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
		if (!options) options = {};
		name = name.slice(0, name.length - m[1].length);
		options[m[1].toLowerCase()] = true;
	}
	return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
}
var cachedNow = 0;
var p = /* @__PURE__ */ Promise.resolve();
var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
	const invoker = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= invoker.attached) return;
		const value = invoker.value;
		if (isArray(value)) {
			const originalStop = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				originalStop.call(e);
				e._stopped = true;
			};
			const handlers = value.slice();
			const args = [e];
			for (let i = 0; i < handlers.length; i++) {
				if (e._stopped) break;
				const handler = handlers[i];
				if (handler) callWithAsyncErrorHandling(handler, instance, 5, args);
			}
		} else callWithAsyncErrorHandling(value, instance, 5, [e]);
	};
	invoker.value = initialValue;
	invoker.attached = getNow();
	return invoker;
}
var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
	const isSVG = namespace === "svg";
	if (key === "class") patchClass(el, nextValue, isSVG);
	else if (key === "style") patchStyle(el, prevValue, nextValue);
	else if (isOn(key)) {
		if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
	} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
		patchDOMProp(el, key, nextValue);
		if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
	} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
	else {
		if (key === "true-value") el._trueValue = nextValue;
		else if (key === "false-value") el._falseValue = nextValue;
		patchAttr(el, key, nextValue, isSVG);
	}
};
function shouldSetAsProp(el, key, value, isSVG) {
	if (isSVG) {
		if (key === "innerHTML" || key === "textContent") return true;
		if (key in el && isNativeOn(key) && isFunction(value)) return true;
		return false;
	}
	if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
	if (key === "sandbox" && el.tagName === "IFRAME") return false;
	if (key === "form") return false;
	if (key === "list" && el.tagName === "INPUT") return false;
	if (key === "type" && el.tagName === "TEXTAREA") return false;
	if (key === "width" || key === "height") {
		const tag = el.tagName;
		if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
	}
	if (isNativeOn(key) && isString(value)) return false;
	return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
	const props = el._def.props;
	if (!props) return false;
	const camelKey = camelize(key);
	return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
var getModelAssigner = (vnode) => {
	const fn = vnode.props["onUpdate:modelValue"] || false;
	return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
	e.target.composing = true;
}
function onCompositionEnd(e) {
	const target = e.target;
	if (target.composing) {
		target.composing = false;
		target.dispatchEvent(new Event("input"));
	}
}
var assignKey = /* @__PURE__ */ Symbol("_assign");
var initialValueKey = /* @__PURE__ */ Symbol("_initialValue");
function castValue(value, trim, number) {
	if (trim) value = value.trim();
	if (number) value = looseToNumber(value);
	return value;
}
var vModelText = {
	created(el, { modifiers: { lazy, trim, number } }, vnode) {
		if (el.parentNode) {
			if (el.type === "text") el[initialValueKey] = el.defaultValue.replace(/[\r\n]/g, "");
			else if (el.type === "textarea") el[initialValueKey] = el.defaultValue.replace(/\r\n?/g, "\n");
		}
		el[assignKey] = getModelAssigner(vnode);
		const castToNumber = number || vnode.props && vnode.props.type === "number";
		addEventListener(el, lazy ? "change" : "input", (e) => {
			if (e.target.composing) return;
			el[assignKey](castValue(el.value, trim, castToNumber));
		});
		if (trim || castToNumber) addEventListener(el, "change", () => {
			el.value = castValue(el.value, trim, castToNumber);
		});
		if (!lazy) {
			addEventListener(el, "compositionstart", onCompositionStart);
			addEventListener(el, "compositionend", onCompositionEnd);
			addEventListener(el, "change", onCompositionEnd);
		}
	},
	mounted(el, { value, modifiers: { trim, number } }) {
		const newValue = value == null ? "" : value;
		const initialValue = el[initialValueKey];
		delete el[initialValueKey];
		if (initialValue !== void 0 && (el.type === "text" || el.type === "textarea") && el.value !== initialValue) el[assignKey](castValue(el.value, trim, number));
		else el.value = newValue;
	},
	beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
		el[assignKey] = getModelAssigner(vnode);
		if (el.composing) return;
		const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
		const newValue = value == null ? "" : value;
		if (elValue === newValue) return;
		const rootNode = el.getRootNode();
		if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
			if (lazy && value === oldValue) return;
			if (trim && el.value.trim() === newValue) return;
		}
		el.value = newValue;
	}
};
var vModelCheckbox = {
	deep: true,
	created(el, _, vnode) {
		el[assignKey] = getModelAssigner(vnode);
		addEventListener(el, "change", () => {
			const modelValue = el._modelValue;
			const elementValue = getValue(el);
			const checked = el.checked;
			const assign = el[assignKey];
			if (isArray(modelValue)) {
				const index = looseIndexOf(modelValue, elementValue);
				const found = index !== -1;
				if (checked && !found) assign(modelValue.concat(elementValue));
				else if (!checked && found) {
					const filtered = [...modelValue];
					filtered.splice(index, 1);
					assign(filtered);
				}
			} else if (isSet(modelValue)) {
				const cloned = new Set(modelValue);
				if (checked) cloned.add(elementValue);
				else cloned.delete(elementValue);
				assign(cloned);
			} else assign(getCheckboxValue(el, checked));
		});
	},
	mounted: setChecked,
	beforeUpdate(el, binding, vnode) {
		el[assignKey] = getModelAssigner(vnode);
		setChecked(el, binding, vnode);
	}
};
function setChecked(el, { value, oldValue }, vnode) {
	el._modelValue = value;
	let checked;
	if (isArray(value)) checked = looseIndexOf(value, vnode.props.value) > -1;
	else if (isSet(value)) checked = value.has(vnode.props.value);
	else {
		if (value === oldValue) return;
		checked = looseEqual(value, getCheckboxValue(el, true));
	}
	if (el.checked !== checked) el.checked = checked;
}
var vModelSelect = {
	deep: true,
	created(el, { value, modifiers: { number } }, vnode) {
		el._modelValue = value;
		addEventListener(el, "change", () => {
			const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? looseToNumber(getValue(o)) : getValue(o));
			const multiple = el.multiple;
			const assignedValue = multiple ? isSet(el._modelValue) ? new Set(selectedVal) : selectedVal : selectedVal[0];
			const pending = el._pendingValue = [multiple, multiple ? isArray(assignedValue) ? selectedVal.slice() : selectedVal : assignedValue];
			try {
				el[assignKey](assignedValue);
			} finally {
				nextTick(() => {
					if (el._pendingValue === pending) el._pendingValue = void 0;
				});
			}
		});
		el[assignKey] = getModelAssigner(vnode);
	},
	mounted(el, { value, modifiers: { number } }) {
		setSelected(el, value, number);
	},
	beforeUpdate(el, { value }, vnode) {
		el._modelValue = value;
		el[assignKey] = getModelAssigner(vnode);
	},
	updated(el, { value, modifiers: { number } }) {
		const pending = el._pendingValue;
		el._pendingValue = void 0;
		if (!pending || pending[0] !== el.multiple || !isSameSelectValue(value, pending[1], pending[0])) setSelected(el, value, number);
	}
};
function isSameSelectValue(value, assignedValue, multiple) {
	if (!multiple) return looseEqual(value, assignedValue);
	if (isArray(value)) return looseEqual(value, assignedValue);
	if (isSet(value)) {
		if (value.size !== assignedValue.length) return false;
		for (const item of assignedValue) if (!value.has(item)) return false;
		return true;
	}
	return false;
}
function setSelected(el, value, number = false) {
	const isMultiple = el.multiple;
	const isArrayValue = isArray(value);
	if (isMultiple && !isArrayValue && !isSet(value)) return;
	for (let i = 0, l = el.options.length; i < l; i++) {
		const option = el.options[i];
		const optionValue = getValue(option);
		if (isMultiple) {
			if (isArrayValue) {
				const optionType = typeof optionValue;
				if (optionType === "string" || optionType === "number") option.selected = value.some((v) => String(v) === String(optionValue));
				else option.selected = looseIndexOf(value, optionValue) > -1;
			} else option.selected = value.has(optionValue) || number && typeof optionValue === "string" && value.has(looseToNumber(optionValue));
		} else if (looseEqual(getValue(option), value)) {
			if (el.selectedIndex !== i) el.selectedIndex = i;
			return;
		}
	}
	if (!isMultiple && el.selectedIndex !== -1) el.selectedIndex = -1;
}
function getValue(el) {
	return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
	const key = checked ? "_trueValue" : "_falseValue";
	return key in el ? el[key] : checked;
}
var systemModifiers = [
	"ctrl",
	"shift",
	"alt",
	"meta"
];
var modifierGuards = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
var withModifiers = (fn, modifiers) => {
	if (!fn) return fn;
	const cache = fn._withMods || (fn._withMods = {});
	const cacheKey = modifiers.join(".");
	return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
		for (let i = 0; i < modifiers.length; i++) {
			const guard = modifierGuards[modifiers[i]];
			if (guard && guard(event, modifiers)) return;
		}
		return fn(event, ...args);
	}));
};
var keyNames = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
};
var withKeys = (fn, modifiers) => {
	const cache = fn._withKeys || (fn._withKeys = {});
	const cacheKey = modifiers.join(".");
	return cache[cacheKey] || (cache[cacheKey] = ((event) => {
		if (!("key" in event)) return;
		const eventKey = hyphenate(event.key);
		if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) return fn(event);
	}));
};
var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
var renderer;
function ensureRenderer() {
	return renderer || (renderer = createRenderer(rendererOptions));
}
var createApp = ((...args) => {
	const app = ensureRenderer().createApp(...args);
	const { mount } = app;
	app.mount = (containerOrSelector) => {
		const container = normalizeContainer(containerOrSelector);
		if (!container) return;
		const component = app._component;
		if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
		if (container.nodeType === 1) container.textContent = "";
		const proxy = mount(container, false, resolveRootNamespace(container));
		if (container instanceof Element) {
			container.removeAttribute("v-cloak");
			container.setAttribute("data-v-app", "");
		}
		return proxy;
	};
	return app;
});
function resolveRootNamespace(container) {
	if (container instanceof SVGElement) return "svg";
	if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
}
function normalizeContainer(container) {
	if (isString(container)) return document.querySelector(container);
	return container;
}
// src/components/Icon.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$19 = [
	"width",
	"height",
	"stroke-width"
];
var _hoisted_2$19 = ["d"];
var Icon_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Icon",
	props: {
		name: {},
		size: { default: 16 },
		stroke: { default: 1.7 }
	},
	setup(__props) {
		/**
		* 统一图标组件：24×24 网格、1.7 线宽、圆角端点。
		* 全部用 currentColor，颜色由父级控制，避免每个场景单独配色。
		*/
		const paths = {
			search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2",
			command: "M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z",
			sun: "M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
			moon: "M20 13.5A8 8 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z",
			eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
			globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z",
			help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9.6 9.4A2.5 2.5 0 0 1 12 8c1.4 0 2.4.9 2.4 2.1 0 1.7-2.4 1.9-2.4 3.9M12 17.2v.1",
			star: "M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9L12 3.6Z",
			book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 0 0-2 1.5 2 2 0 0 0-2-1.5H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM12 5v15",
			shield: "M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6l7-3Z",
			chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
			alert: "M12 4l8.5 15H3.5L12 4ZM12 10v4M12 17v.1",
			settings: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM19.4 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1Z",
			layers: "M12 3l9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
			"arrow-right": "M4 12h15M13 6l6 6-6 6",
			"arrow-left": "M20 12H5M11 6l-6 6 6 6",
			"chevron-down": "M6 9.5l6 6 6-6",
			"chevron-right": "M9.5 6l6 6-6 6",
			"chevron-left": "M14.5 6l-6 6 6 6",
			check: "M4.5 12.5l5 5 10-11",
			x: "M6 6l12 12M18 6L6 18",
			copy: "M9 9V5.5A1.5 1.5 0 0 1 10.5 4h8A1.5 1.5 0 0 1 20 5.5v8a1.5 1.5 0 0 1-1.5 1.5H15M4 10.5A1.5 1.5 0 0 1 5.5 9h8A1.5 1.5 0 0 1 15 10.5v8A1.5 1.5 0 0 1 13.5 20h-8A1.5 1.5 0 0 1 4 18.5v-8Z",
			external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
			refresh: "M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5",
			sparkles: "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z",
			clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7.5V12l3 2",
			tag: "M3 12.5V5a2 2 0 0 1 2-2h7.5L21 11.5 12.5 20 3 12.5ZM8 8v.1",
			note: "M6 3h8l4 4v14H6V3ZM14 3v4h4M9 12h6M9 16h4",
			database: "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
			filter: "M4 5h16l-6.2 7.6V19l-3.6 1.6v-8L4 5Z",
			grid: "M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z",
			flame: "M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.6-4.2C9.8 9.6 12 8.5 12 3Z",
			pin: "M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11ZM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
			info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 8v.1",
			list: "M8 6h13M8 12h13M8 18h13M4 6v.1M4 12v.1M4 18v.1",
			minus: "M5 12h14",
			plus: "M12 5v14M5 12h14",
			target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 11.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1Z",
			trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
			pencil: "M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4"
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("svg", {
				width: __props.size,
				height: __props.size,
				viewBox: "0 0 24 24",
				fill: "none",
				"stroke-width": __props.stroke,
				stroke: "currentColor",
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"aria-hidden": "true",
				class: "ico"
			}, [createBaseVNode("path", { d: paths[__props.name] ?? paths.info }, null, 8, _hoisted_2$19)], 8, _hoisted_1$19);
		};
	}
});
// \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
// src/components/Icon.vue
var Icon_default = /*#__PURE__*/ _plugin_vue_export_helper_default(Icon_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8d63405c"]]);
// node_modules/.pnpm/@tauri-apps+api@2.12.4/node_modules/@tauri-apps/api/external/tslib/tslib.es6.js
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __classPrivateFieldGet(receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
	if (kind === "m") throw new TypeError("Private method is not writable");
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
var _Resource_rid;
/**
* Invoke your custom commands.
*
* This package is also accessible with `window.__TAURI__.core` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
* @module
*/
/**
* A key to be used to implement a special function
* on your types that define how your type should be serialized
* when passing across the IPC.
* @example
* Given a type in Rust that looks like this
* ```rs
* #[derive(serde::Serialize, serde::Deserialize)
* enum UserId {
*   String(String),
*   Number(u32),
* }
* ```
* `UserId::String("id")` would be serialized into `{ String: "id" }`
* and so we need to pass the same structure back to Rust
* ```ts
* import { SERIALIZE_TO_IPC_FN } from "@tauri-apps/api/core"
*
* class UserIdString {
*   id
*   constructor(id) {
*     this.id = id
*   }
*
*   [SERIALIZE_TO_IPC_FN]() {
*     return { String: this.id }
*   }
* }
*
* class UserIdNumber {
*   id
*   constructor(id) {
*     this.id = id
*   }
*
*   [SERIALIZE_TO_IPC_FN]() {
*     return { Number: this.id }
*   }
* }
*
* type UserId = UserIdString | UserIdNumber
* ```
*
*/
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
/**
* Stores the callback in a known location, and returns an identifier that can be passed to the backend.
* The backend uses the identifier to `eval()` the callback.
*
* @return An unique identifier associated with the callback function.
*
* @since 1.0.0
*/
function transformCallback(callback, once = false) {
	return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
/**
* Sends a message to the backend.
* @example
* ```typescript
* import { invoke } from '@tauri-apps/api/core';
* await invoke('login', { user: 'tauri', password: 'poiwe3h4r5ip3yrhtew9ty' });
* ```
*
* @param cmd The command name.
* @param args The optional arguments to pass to the command.
* @param options The request options.
* @return A promise resolving or rejecting to the backend response.
*
* @since 1.0.0
*/
async function invoke(cmd, args = {}, options) {
	return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}
/**
* A rust-backed resource stored through `tauri::Manager::resources_table` API.
*
* The resource lives in the main process and does not exist
* in the Javascript world, and thus will not be cleaned up automatically
* except on application exit. If you want to clean it up early, call {@linkcode Resource.close} or use [Explicit Resource Management].
*
* Several API types are resources and inherit this behavior, among them `Menu`,
* `TrayIcon`, `Image`, `Webview` and the menu item classes.
*
* To support older browsers with [Explicit Resource Management], use a supported compiler (e.g. tsc) or bundler (e.g. rollup).
*
* @example
* ```typescript
* import { Resource, invoke } from '@tauri-apps/api/core';
*
* export class DatabaseHandle extends Resource {
*   static async open(path: string): Promise<DatabaseHandle> {
*     const rid: number = await invoke('open_db', { path });
*     return new DatabaseHandle(rid);
*   }
*
*   async execute(sql: string): Promise<void> {
*     await invoke('execute_sql', { rid: this.rid, sql });
*   }
* }
* ```
*
* Only asynchronous disposal is implemented (`Symbol.asyncDispose`), because closing
* a resource is an IPC call. Use `await using`; the synchronous `using` form does
* **not** work with resources.
*
* @example
* ```
* await using db = await DatabaseHandle.open('test.db');
* await db.execute('SELECT *');
* // `db` is closed here, by awaiting `db[Symbol.asyncDispose]()`
* ```
*
* To support older browsers, add the following to the globals (e.g. adding to the HTML file):
*
* ```javascript
* Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");
* ```
*
* And for the compiler, for example `tsc`, `rollup`, `vite`, add the following to `tsconfig.json`:
*
* ```json
* {
*   "compilerOptions": {
*     "target": "es2022",
*     "lib": ["es2022", "esnext.disposable", "dom"]
*   }
* }
* ```
*
* [Explicit Resource Management]: https://github.com/tc39/proposal-explicit-resource-management
*/
var Resource = class {
	get rid() {
		return __classPrivateFieldGet(this, _Resource_rid, "f");
	}
	constructor(rid) {
		_Resource_rid.set(this, void 0);
		__classPrivateFieldSet(this, _Resource_rid, rid, "f");
	}
	/**
	* Destroys and cleans up this resource from memory.
	* **You should not call any method on this object anymore and should drop any reference to it.**
	*
	* @remarks Uses the `core:resources:allow-close` permission, which is part of
	* the `core:resources:default` permission set enabled by default.
	*/
	async close() {
		return invoke("plugin:resources|close", { rid: this.rid });
	}
	async [(_Resource_rid = /* @__PURE__ */ new WeakMap(), Symbol.asyncDispose)]() {
		await this.close();
	}
};
// node_modules/.pnpm/@tauri-apps+api@2.12.4/node_modules/@tauri-apps/api/event.js
/**
* The event system allows you to emit events to the backend and listen to events from it.
*
* This package is also accessible with `window.__TAURI__.event` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
*
* @remarks All commands used by this module (`core:event:allow-listen`,
* `allow-unlisten`, `allow-emit` and `allow-emit-to`) are part of the
* `core:event:default` permission set, which is enabled by default, so no extra
* capability configuration is needed.
*
* @module
*/
/**
* The built-in event names emitted by Tauri itself.
*
* These are the raw names behind the `on*` helpers of the `Window` and `Webview`
* classes (e.g. `Window.onResized` listens to {@linkcode TauriEvent.WINDOW_RESIZED}).
* Prefer those helpers when one exists, since they also decode the payload into
* the matching class (`PhysicalSize`, `PhysicalPosition`, ...).
*
* @example
* ```typescript
* import { listen, TauriEvent } from '@tauri-apps/api/event';
* const unlisten = await listen(TauriEvent.WINDOW_DESTROYED, (event) => {
*   console.log('a window was destroyed', event.payload);
* });
* ```
*
* @since 1.1.0
*/
var TauriEvent;
(function(TauriEvent) {
	/** A window was resized. Payload: the new inner size, in physical pixels. See `Window.onResized`. */
	TauriEvent["WINDOW_RESIZED"] = "tauri://resize";
	/** A window was moved. Payload: the new outer position, in physical pixels. See `Window.onMoved`. */
	TauriEvent["WINDOW_MOVED"] = "tauri://move";
	/**
	* The user requested a window to be closed (e.g. clicked the close button).
	* See `Window.onCloseRequested`, which also handles preventing the close.
	*/
	TauriEvent["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
	/** A window was destroyed, i.e. it is gone and its label can be reused. */
	TauriEvent["WINDOW_DESTROYED"] = "tauri://destroyed";
	/** A window gained focus. See `Window.onFocusChanged`. */
	TauriEvent["WINDOW_FOCUS"] = "tauri://focus";
	/** A window lost focus. See `Window.onFocusChanged`. */
	TauriEvent["WINDOW_BLUR"] = "tauri://blur";
	/**
	* The scale factor of the monitor a window is on changed, or the window moved to
	* a monitor with a different scale factor. See `Window.onScaleChanged`.
	*/
	TauriEvent["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
	/** The system or window theme changed. See `Window.onThemeChanged`. */
	TauriEvent["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
	/** A new window was created. */
	TauriEvent["WINDOW_CREATED"] = "tauri://window-created";
	/**
	* The window's event loop was suspended.
	*
	* #### Platform-specific
	*
	* - **Android:** emitted when the activity is paused.
	* - **Other platforms:** never emitted.
	*/
	TauriEvent["WINDOW_SUSPENDED"] = "tauri://suspended";
	/**
	* The window's event loop was resumed after being suspended.
	*
	* #### Platform-specific
	*
	* - **Android:** emitted when the activity is resumed.
	* - **Other platforms:** never emitted.
	*/
	TauriEvent["WINDOW_RESUMED"] = "tauri://resumed";
	/** A new webview was created. */
	TauriEvent["WEBVIEW_CREATED"] = "tauri://webview-created";
	/** The user dragged files onto a webview. See `Webview.onDragDropEvent`. */
	TauriEvent["DRAG_ENTER"] = "tauri://drag-enter";
	/** The user is moving dragged files over a webview. See `Webview.onDragDropEvent`. */
	TauriEvent["DRAG_OVER"] = "tauri://drag-over";
	/** The user dropped files onto a webview. See `Webview.onDragDropEvent`. */
	TauriEvent["DRAG_DROP"] = "tauri://drag-drop";
	/** The drag operation left the webview or was cancelled. See `Webview.onDragDropEvent`. */
	TauriEvent["DRAG_LEAVE"] = "tauri://drag-leave";
})(TauriEvent || (TauriEvent = {}));
/**
* Unregister the event listener associated with the given name and id.
*
* @ignore
* @param event The event name
* @param eventId Event identifier
* @returns
*/
async function _unlisten(event, eventId) {
	window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener(event, eventId);
	await invoke("plugin:event|unlisten", {
		event,
		eventId
	});
}
/**
* Listen to an emitted event to any {@link EventTarget|target}.
*
* @example
* ```typescript
* import { listen } from '@tauri-apps/api/event';
* const unlisten = await listen<string>('error', (event) => {
*   console.log(`Got error, payload: ${event.payload}`);
* });
*
* // call unlisten when your handler goes out of scope e.g. the component is unmounted
* unlisten();
* ```
*
* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
* @param handler Event handler callback.
* @param options Event listening options.
* @returns A promise resolving to a function to unlisten to the event.
*
* @remarks Listeners bound to a window or webview are removed automatically when
* that window or webview is destroyed, so you do not need to unlisten just to
* avoid leaking across a window close. You should still call the returned
* function when the listener's own scope ends — for example on page navigation
* or when a component unmounts — otherwise the handler keeps running for the
* lifetime of the webview.
*
* @since 1.0.0
*/
async function listen(event, handler, options) {
	var _a;
	return invoke("plugin:event|listen", {
		event,
		target: typeof (options === null || options === void 0 ? void 0 : options.target) === "string" ? {
			kind: "AnyLabel",
			label: options.target
		} : (_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : { kind: "Any" },
		handler: transformCallback(handler)
	}).then((eventId) => {
		return async () => _unlisten(event, eventId);
	});
}
/**
* Listens once to an emitted event to any {@link EventTarget|target}.
*
* @example
* ```typescript
* import { once } from '@tauri-apps/api/event';
* interface LoadedPayload {
*   loggedIn: boolean,
*   token: string
* }
* const unlisten = await once<LoadedPayload>('loaded', (event) => {
*   console.log(`App is loaded, loggedIn: ${event.payload.loggedIn}, token: ${event.payload.token}`);
* });
*
* // call unlisten when your handler goes out of scope e.g. the component is unmounted
* unlisten();
* ```
*
* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
* @param handler Event handler callback.
* @param options Event listening options.
* @returns A promise resolving to a function to unlisten to the event.
*
* @remarks The listener removes itself after the first event, and listeners bound
* to a window or webview are also removed automatically when that target is
* destroyed. Still call the returned function when the listener's own scope ends
* before the event arrives — for example on page navigation or component unmount.
*
* @since 1.0.0
*/
async function once(event, handler, options) {
	return listen(event, (eventData) => {
		_unlisten(event, eventData.id);
		handler(eventData);
	}, options);
}
/**
* Emits an event to all {@link EventTarget|targets}.
*
* @example
* ```typescript
* import { emit } from '@tauri-apps/api/event';
* await emit('frontend-loaded', { loggedIn: true, token: 'authToken' });
* ```
*
* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
* @param payload Event payload.
*
* @since 1.0.0
*/
async function emit(event, payload) {
	await invoke("plugin:event|emit", {
		event,
		payload
	});
}
/**
* Emits an event to all {@link EventTarget|targets} matching the given target.
*
* @example
* ```typescript
* import { emitTo } from '@tauri-apps/api/event';
* await emitTo('main', 'frontend-loaded', { loggedIn: true, token: 'authToken' });
* ```
*
* @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
* @param payload Event payload.
*
* @since 2.0.0
*/
async function emitTo(target, event, payload) {
	await invoke("plugin:event|emit_to", {
		target: typeof target === "string" ? {
			kind: "AnyLabel",
			label: target
		} : target,
		event,
		payload
	});
}
// src/api.ts
function errMsg(e) {
	if (typeof e === "string") return e;
	if (e && typeof e === "object" && "message" in e) return String(e.message);
	return String(e);
}
var api = {
	listSources: () => invoke("list_sources"),
	getRobots: () => invoke("get_robots"),
	checkRobots: () => invoke("check_robots"),
	startCollect: () => invoke("start_collect"),
	collectLogs: (limit = 50) => invoke("collect_logs", { limit }),
	search: (filter) => invoke("search_items", { filter }),
	getItem: (id) => invoke("get_item_detail", { id }),
	getStats: () => invoke("get_stats"),
	saveNote: (itemId, body) => invoke("save_note", {
		itemId,
		body
	}),
	toggleFavorite: (itemId) => invoke("toggle_favorite", { itemId }),
	favoriteSummary: () => invoke("favorite_summary"),
	getTheme: () => invoke("get_theme"),
	setTheme: (config) => invoke("set_theme", { config }),
	exportTheme: () => invoke("export_theme"),
	importTheme: (json) => invoke("import_theme", { json }),
	previewMemo: () => invoke("preview_memo"),
	exportMemo: (path) => invoke("export_memo", { path }),
	searchLessons: (filter) => invoke("search_lessons", { filter }),
	getLesson: (id) => invoke("get_lesson", { id }),
	getLessonByCwe: (cwe) => invoke("get_lesson_by_cwe", { cwe }),
	lessonStats: () => invoke("lesson_stats"),
	dashboard: (days = 30) => invoke("dashboard", { days }),
	listWrongAnswers: (includeReviewed = false) => invoke("list_wrong_answers", { includeReviewed }),
	markWrongReviewed: (lessonId, quizIndex) => invoke("mark_wrong_reviewed", {
		lessonId,
		quizIndex
	}),
	wrongAnswerCount: () => invoke("wrong_answer_count"),
	countItemsByCwe: (cwe) => invoke("count_items_by_cwe", { cwe }),
	relatedLessons: (id) => invoke("related_lessons", { id }),
	glossary: () => invoke("glossary_all"),
	learningPaths: () => invoke("learning_paths"),
	getProgress: () => invoke("get_progress"),
	setProgress: (lessonId, status) => invoke("set_progress", {
		lessonId,
		status
	}),
	saveQuizResult: (lessonId, total, correct, wrong) => invoke("save_quiz_result", {
		lessonId,
		total,
		correct,
		wrong
	}),
	saveLessonNote: (lessonId, note) => invoke("save_lesson_note", {
		lessonId,
		note
	}),
	learnOverview: () => invoke("learn_overview"),
	exportLearnReport: (path) => invoke("export_learn_report", { path }),
	complianceInfo: () => invoke("compliance_info"),
	backupDatabase: (targetDir) => invoke("backup_database", { targetDir: targetDir ?? null }),
	restoreDatabase: (source) => invoke("restore_database", { source }),
	openDataDir: () => invoke("open_data_dir"),
	exportItemsJson: (limit) => invoke("export_items_json", { limit: limit ?? null }),
	windowState: () => invoke("window_state"),
	saveWindowState: (s) => invoke("save_window_state", s),
	quitApp: () => invoke("quit_app")
};
// src/stores/guard.ts
function makeGuard() {
	let seq = 0;
	return {
		next() {
			return ++seq;
		},
		isCurrent(token) {
			return token === seq;
		}
	};
}
/** 情报检索：关键词/筛选变化时用 */
var searchGuard = makeGuard();
/** 教学卡列表：筛选与搜索共用 */
var lessonGuard = makeGuard();
/** 详情类：条目详情、教学卡详情（快速连点会共用） */
var detailGuard = makeGuard();
// src/stores/theme.ts
var theme = /* @__PURE__ */ reactive({
	mode: "light",
	accent: "#0f766e",
	density: "comfortable",
	radius: "md",
	lang: "zh-CN"
});
/** v0.7.1 起的默认主色：深青绿。为了让它跟随主题（浅色深青 / 深色薄荷），
*  当主色等于默认值时不下发内联变量，交给 tokens.css 按主题决定。 */
var DEFAULT_ACCENT = "#0f766e";
/** 旧版默认主色，读到就迁移，避免升级后仍停留在蓝色 */
var LEGACY_ACCENT = "#2563eb";
/** 把主题写到 <html> 的 data-* 上，由 CSS 变量表接管 */
function applyTheme() {
	const html = document.documentElement;
	html.setAttribute("data-theme", theme.mode);
	html.setAttribute("data-density", theme.density);
	html.setAttribute("data-radius", theme.radius);
	if (theme.accent && theme.accent !== "#0f766e") {
		html.style.setProperty("--color-accent", theme.accent);
		html.style.setProperty("--color-accent-hover", lighten(theme.accent, .14));
		html.style.setProperty("--color-accent-soft", hexToSoft(theme.accent, .1));
		html.style.setProperty("--color-accent-soft-strong", hexToSoft(theme.accent, .18));
		html.style.setProperty("--color-accent-line", hexToSoft(theme.accent, .4));
	} else for (const k of [
		"--color-accent",
		"--color-accent-hover",
		"--color-accent-soft",
		"--color-accent-soft-strong",
		"--color-accent-line"
	]) html.style.removeProperty(k);
	html.setAttribute("lang", theme.lang);
}
/** 提亮一个十六进制颜色（0–1），用于 hover 态 */
function lighten(hex, amount) {
	const rgb = parseHex(hex);
	if (!rgb) return hex;
	const mix = (c) => Math.round(c + (255 - c) * amount);
	return `#${[
		mix(rgb[0]),
		mix(rgb[1]),
		mix(rgb[2])
	].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
function parseHex(hex) {
	const h = hex.replace("#", "");
	if (h.length !== 6) return null;
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16)
	];
}
/** 主色转成低透明度底色，用于选中态背景 */
function hexToSoft(hex, alpha = .12) {
	const rgb = parseHex(hex);
	if (!rgb) return `rgba(15, 118, 110, ${alpha})`;
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}
/** 启动时读本地配置；首次无配置文件则用默认值 */
async function loadTheme() {
	try {
		const cfg = await api.getTheme();
		Object.assign(theme, cfg);
		if (theme.accent === LEGACY_ACCENT) {
			theme.accent = DEFAULT_ACCENT;
			persistTheme();
		}
	} catch {}
	applyTheme();
}
var saveTimer;
/** 变更后写回本地；300ms 去抖，避免拖动颜色时狂写磁盘 */
function persistTheme() {
	applyTheme();
	window.clearTimeout(saveTimer);
	saveTimer = window.setTimeout(() => {
		api.setTheme({ ...theme }).catch(() => {});
	}, 300);
}
// src/locales/zh-CN.json
var zh_CN_default = {
	"app.name": "SentryDesk",
	"app.tagline": "本地安全情报聚合",
	"topbar.search": "搜索 CVE、产品、关键词…",
	"topbar.searchHint": "Ctrl+K 聚焦 · Esc 清空",
	"topbar.theme": "主题",
	"topbar.lang": "语言",
	"topbar.settings": "设置",
	"theme.light": "浅色",
	"theme.dark": "深色",
	"theme.eyecare": "护眼",
	"sidebar.sources": "数据源",
	"sidebar.all": "全部",
	"sidebar.filter": "筛选",
	"sidebar.cvssMin": "CVSS 最低分",
	"sidebar.days": "时间窗",
	"sidebar.daysAny": "不限",
	"sidebar.days7": "近 7 天",
	"sidebar.days30": "近 30 天",
	"sidebar.days90": "近 90 天",
	"sidebar.severity": "严重等级",
	"sidebar.kevOnly": "仅在野利用（KEV）",
	"sidebar.robots": "robots 状态",
	"sidebar.collect": "开始合规采集",
	"sidebar.collecting": "采集中…",
	"sidebar.collectTip": "仅采集公开源，遵守 robots 协议与限速",
	"sidebar.checkRobots": "校验 robots",
	"list.count": "条结果",
	"list.sortLatest": "最新优先",
	"list.empty": "暂无数据",
	"list.emptyHint": "点击左侧「开始合规采集」获取公开安全情报",
	"list.searching": "检索中…",
	"detail.empty": "选择左侧条目查看详情",
	"detail.products": "受影响产品",
	"detail.published": "发布时间",
	"detail.source": "来源",
	"detail.collected": "采集时间",
	"detail.summary": "摘要",
	"detail.note": "个人笔记",
	"detail.notePlaceholder": "记录你的处置思路…（仅存本机）",
	"detail.saveNote": "保存笔记",
	"detail.saved": "已保存",
	"detail.openSource": "打开原文",
	"detail.cve": "CVE 编号",
	"detail.cvss": "CVSS",
	"detail.kev": "在野利用",
	"detail.externalId": "外部编号",
	"status.ready": "就绪",
	"status.total": "本地库",
	"status.items": "条",
	"status.dbSize": "库体积",
	"status.lastCollect": "最近采集",
	"status.never": "尚未采集",
	"status.elapsed": "耗时",
	"status.collecting": "采集中",
	"status.export": "导出备忘",
	"status.exported": "已导出",
	"status.offline": "断网可用",
	"severity.CRITICAL": "严重",
	"severity.HIGH": "高危",
	"severity.MEDIUM": "中危",
	"severity.LOW": "低危",
	"severity.UNKNOWN": "未评级",
	"robots.allowed": "允许",
	"robots.disallowed": "禁止",
	"robots.not_found": "未发现",
	"robots.unknown": "未校验",
	"collect.done": "采集完成",
	"collect.failed": "采集失败",
	"common.close": "关闭",
	"common.cancel": "取消",
	"common.confirm": "确定",
	"detail.learnMore": "学习该缺陷类型",
	"detail.action": "处置要求",
	"nav.learn": "学习",
	"nav.intel": "情报",
	"home.allLessons": "全部教程",
	"home.topics": "个主题",
	"detail.noteEmpty": "笔记不能为空",
	"topbar.searchLesson": "搜索缺陷类型、方法、实战…",
	"topbar.palette": "Ctrl+K 命令面板",
	"home.resume": "继续学习"
};
// src/locales/en-US.json
var en_US_default = {
	"app.name": "SentryDesk",
	"app.tagline": "Local Security Intelligence",
	"topbar.search": "Search CVE, product, keyword…",
	"topbar.searchHint": "Ctrl+K to focus · Esc to clear",
	"topbar.theme": "Theme",
	"topbar.lang": "Language",
	"topbar.settings": "Settings",
	"theme.light": "Light",
	"theme.dark": "Dark",
	"theme.eyecare": "Eye care",
	"sidebar.sources": "Sources",
	"sidebar.all": "All",
	"sidebar.filter": "Filters",
	"sidebar.cvssMin": "Min CVSS",
	"sidebar.days": "Time window",
	"sidebar.daysAny": "Any",
	"sidebar.days7": "Last 7 days",
	"sidebar.days30": "Last 30 days",
	"sidebar.days90": "Last 90 days",
	"sidebar.severity": "Severity",
	"sidebar.kevOnly": "Exploited in the wild (KEV)",
	"sidebar.robots": "robots status",
	"sidebar.collect": "Start collection",
	"sidebar.collecting": "Collecting…",
	"sidebar.collectTip": "Public sources only, honoring robots.txt and rate limits",
	"sidebar.checkRobots": "Verify robots",
	"list.count": "results",
	"list.sortLatest": "Newest first",
	"list.empty": "No data yet",
	"list.emptyHint": "Click \"Start collection\" on the left to fetch public security intelligence",
	"list.searching": "Searching…",
	"detail.empty": "Select an item to view details",
	"detail.products": "Affected products",
	"detail.published": "Published",
	"detail.source": "Source",
	"detail.collected": "Collected",
	"detail.summary": "Summary",
	"detail.note": "Personal note",
	"detail.notePlaceholder": "Your remediation notes… (stored locally only)",
	"detail.saveNote": "Save note",
	"detail.saved": "Saved",
	"detail.openSource": "Open source",
	"detail.cve": "CVE ID",
	"detail.cvss": "CVSS",
	"detail.kev": "Known exploited",
	"detail.externalId": "External ID",
	"status.ready": "Ready",
	"status.total": "Local DB",
	"status.items": "items",
	"status.dbSize": "DB size",
	"status.lastCollect": "Last collection",
	"status.never": "Never collected",
	"status.elapsed": "Elapsed",
	"status.collecting": "Collecting",
	"status.export": "Export memo",
	"status.exported": "Exported",
	"status.offline": "Works offline",
	"severity.CRITICAL": "Critical",
	"severity.HIGH": "High",
	"severity.MEDIUM": "Medium",
	"severity.LOW": "Low",
	"severity.UNKNOWN": "Unrated",
	"robots.allowed": "Allowed",
	"robots.disallowed": "Disallowed",
	"robots.not_found": "Not found",
	"robots.unknown": "Unverified",
	"collect.done": "Collection complete",
	"collect.failed": "Collection failed",
	"common.close": "Close",
	"common.cancel": "Cancel",
	"common.confirm": "OK",
	"detail.learnMore": "Learn this weakness type",
	"detail.action": "Required action",
	"nav.learn": "Learn",
	"nav.intel": "Intel",
	"home.allLessons": "All lessons",
	"home.topics": "topics",
	"detail.noteEmpty": "Note cannot be empty",
	"topbar.searchLesson": "Search weakness, method, lab…",
	"topbar.palette": "Ctrl+K 命令面板",
	"home.resume": "继续学习"
};
// src/stores/i18n.ts
/** 分类名英译 */
var CATEGORY_EN = {
	"Web 安全": "Web",
	"信息暴露": "Info exposure",
	"内存安全": "Memory safety",
	"凭据管理": "Credential mgmt",
	"反序列化": "Deserialization",
	"密码学": "Cryptography",
	"并发与时序": "Concurrency",
	"应急响应": "Incident response",
	"数值处理": "Numeric handling",
	"文件与上传": "Files & uploads",
	"注入类": "Injection",
	"类型系统": "Type system",
	"认证与会话": "Auth & sessions",
	"访问控制": "Access control",
	"语言特性": "Language quirks",
	"资源管理": "Resource mgmt",
	"输入校验": "Input validation",
	"配置与解析": "Config & parsing",
	"API 安全": "API security",
	"供应链安全": "Supply chain",
	"基础必修": "Fundamentals",
	"处置流程": "Response process",
	"威胁情报": "Threat intel",
	"安全运营": "Security ops",
	"安全自测": "Self check",
	"工程实践": "Engineering",
	"思维方法": "Methodology",
	"数据来源": "Data sources",
	"漏洞情报": "Vuln intel",
	"代码审计": "Code audit",
	"桌面与云原生": "Desktop & cloud",
	"认证与凭据": "Auth & credentials",
	"配置加固": "Hardening",
	"评估方法": "Assessment"
};
/** 标签英译；未收录的原样输出 */
var TAG_EN = {
	"认证": "auth",
	"应急响应": "incident response",
	"实战": "hands-on",
	"方法论": "method",
	"供应链": "supply chain",
	"注入": "injection",
	"内存": "memory",
	"会话": "session",
	"威胁情报": "threat intel",
	"凭据": "credentials",
	"密码学": "crypto",
	"架构": "architecture",
	"授权": "authorization",
	"越权": "broken access",
	"配置": "config",
	"审计": "audit",
	"流程": "process",
	"加固": "hardening",
	"前端": "frontend",
	"文件": "files",
	"访问控制": "access control",
	"信息泄露": "info leak",
	"权限": "privilege",
	"处置": "response",
	"安全运营": "security ops",
	"合规": "compliance",
	"加密": "encryption",
	"优先级": "priority",
	"数据库": "database",
	"系统": "system",
	"反序列化": "deserialization",
	"基础": "basics",
	"内网": "internal network",
	"上传": "upload",
	"运维": "operations",
	"可用性": "availability",
	"钓鱼": "phishing",
	"日志": "logging",
	"令牌": "token",
	"评估": "assessment",
	"自测": "self check",
	"取证": "forensics",
	"云安全": "cloud security",
	"漏洞评估": "vuln assessment",
	"数据源": "data source",
	"输入校验": "input validation",
	"解析": "parsing",
	"文件读取": "file read",
	"并发": "concurrency",
	"业务逻辑": "business logic",
	"数值": "numeric",
	"稳定性": "stability",
	"类型": "types",
	"暴力破解": "brute force",
	"随机数": "randomness",
	"正则": "regex",
	"框架": "framework",
	"存储": "storage",
	"传输": "transport",
	"跨源": "cross-origin",
	"原理": "principle",
	"原则": "principles",
	"工程": "engineering",
	"情报源": "intel source",
	"复盘": "postmortem",
	"持久化": "persistence",
	"后门": "backdoor",
	"沟通": "communication",
	"勒索软件": "ransomware",
	"运营": "operations",
	"威胁建模": "threat modeling",
	"补丁": "patching",
	"检测": "detection",
	"基线": "baseline",
	"组件清单": "component list",
	"构建安全": "build security",
	"依赖混淆": "dependency confusion",
	"包管理": "package manager",
	"依赖管理": "dependency mgmt",
	"传递依赖": "transitive deps",
	"签名": "signing",
	"完整性": "integrity",
	"桌面应用": "desktop app",
	"攻击面": "attack surface",
	"本地安全": "local security",
	"凭据存储": "credential store",
	"隐私": "privacy",
	"元数据": "metadata",
	"最小权限": "least privilege",
	"容器": "container",
	"镜像": "image",
	"云原生": "cloud native",
	"密钥": "keys",
	"轮换": "rotation",
	"离线": "offline",
	"本地优先": "local first",
	"评分": "scoring",
	"标准": "standards",
	"漏洞库": "vuln feed",
	"误报治理": "false positives",
	"检测工程": "detection engineering",
	"映射": "mapping",
	"情报": "intelligence",
	"可信度": "reliability",
	"交叉验证": "cross-verification",
	"数据建模": "data modeling",
	"生命周期": "lifecycle",
	"降噪": "noise reduction",
	"指标": "metrics",
	"批量赋值": "mass assignment",
	"数据暴露": "data exposure",
	"限流": "rate limiting",
	"资源": "resources",
	"成本": "cost",
	"资产清单": "inventory",
	"影子接口": "shadow API",
	"治理": "governance",
	"业务安全": "business security",
	"自动化": "automation",
	"风控": "abuse control",
	"网关": "gateway",
	"口令": "password",
	"哈希": "hashing",
	"回调": "redirect"
};
/** 按当前语言取分类显示名 */
function categoryLabel(name, zh) {
	return zh ? name : CATEGORY_EN[name] ?? name;
}
/** 按当前语言取标签显示名 */
function tagLabel(tag, zh) {
	return zh ? tag : TAG_EN[tag] ?? tag;
}
// src/stores/format.ts
/** 字节数转可读大小 */
function fmtBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
/** ISO 时间转本地日期；无法解析时退化为截取前 10 位 */
function fmtDate(s) {
	if (!s) return "—";
	const d = new Date(s);
	if (isNaN(d.getTime())) return s.slice(0, 10);
	return d.toLocaleDateString(theme.lang, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});
}
/** ISO 时间转相对时间（刚刚 / N 分钟前 / N 小时前 / N 天前） */
function fmtRelative(s) {
	if (!s) return "—";
	const d = new Date(s);
	if (isNaN(d.getTime())) return "—";
	const diff = Date.now() - d.getTime();
	const mins = Math.floor(diff / 6e4);
	const zh = theme.lang === "zh-CN";
	if (mins < 1) return zh ? "刚刚" : "just now";
	if (mins < 60) return zh ? `${mins} 分钟前` : `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return zh ? `${hours} 小时前` : `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return zh ? `${days} 天前` : `${days}d ago`;
	return fmtDate(s);
}
// src/store.ts
var LOCALES = {
	"zh-CN": zh_CN_default,
	"en-US": en_US_default
};
var dict = computed(() => LOCALES[theme.lang] ?? LOCALES["zh-CN"]);
/** 取文案。缺键时回退到 key 本身，便于发现遗漏 */
function t(key) {
	return dict.value[key] ?? key;
}
function setLang(lang) {
	theme.lang = lang;
	persistTheme();
}
var sources = /* @__PURE__ */ ref([]);
var robots = /* @__PURE__ */ ref([]);
var stats = /* @__PURE__ */ ref(null);
var items = /* @__PURE__ */ ref([]);
var total = /* @__PURE__ */ ref(0);
var elapsedMs = /* @__PURE__ */ ref(0);
var selectedId = /* @__PURE__ */ ref(null);
var selected = /* @__PURE__ */ ref(null);
var filter = /* @__PURE__ */ reactive({
	query: "",
	source_key: null,
	cvss_min: null,
	days: null,
	kev_only: false,
	severity: null,
	cwe: null,
	favorite_only: false,
	limit: 100,
	offset: 0
});
/** 顶栏搜索框的当前文本。
* 放在 store 而不是 TopBar 本地 ref：清除筛选等功能需要同步清空输入框，
* 本地 ref 会与 store 里的 query 脱节（清掉了结果但框里还留着旧词）。 */
var searchInput = /* @__PURE__ */ ref("");
var loading = /* @__PURE__ */ ref(false);
var collecting = /* @__PURE__ */ ref(false);
/** 采集进度：由后端 collect://progress 事件驱动，5 个源逐个回报 */
var collectProgress = /* @__PURE__ */ ref(null);
var toast = /* @__PURE__ */ ref("");
var toastTimer;
function showToast(msg) {
	toast.value = msg;
	window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => toast.value = "", 2600);
}
/** 订阅后端采集进度事件：单源耗时可达数秒，必须有逐源反馈 */
async function initCollectEvents() {
	try {
		await listen("collect://progress", (e) => {
			const p = e.payload;
			collectProgress.value = {
				name: p.source_name,
				done: p.done,
				total: p.total,
				status: p.status
			};
		});
		await listen("collect://done", (e) => {
			collectProgress.value = null;
			const s = e.payload;
			if (s.failed_sources > 0) {
				const first = (s.details ?? []).find((d) => d.message)?.message ?? "";
				const tail = first ? `｜${first.slice(0, 60)}` : "";
				showToast((theme.lang === "en-US" ? "Collection: " : "采集完成：") + `${s.ok_sources} ok / ${s.failed_sources} failed · +${s.inserted}${tail}`);
			}
		});
	} catch {}
}
async function refreshSources() {
	try {
		sources.value = await api.listSources();
		robots.value = await api.getRobots();
	} catch (e) {
		showToast(errMsg(e));
	}
}
async function refreshStats() {
	try {
		stats.value = await api.getStats();
	} catch (e) {
		showToast(errMsg(e));
	}
}
async function doSearch() {
	const tok = searchGuard.next();
	loading.value = true;
	try {
		const r = await api.search({ ...filter });
		if (!searchGuard.isCurrent(tok)) return;
		items.value = r.items;
		total.value = r.total;
		elapsedMs.value = r.elapsed_ms;
		if (!r.items.some((x) => x.id === selectedId.value)) {
			selectedId.value = r.items.length > 0 ? r.items[0].id : null;
			if (r.items.length > 0) await selectItem(r.items[0].id);
			else selected.value = null;
		}
	} catch (e) {
		if (searchGuard.isCurrent(tok)) showToast(errMsg(e));
	} finally {
		if (searchGuard.isCurrent(tok)) loading.value = false;
	}
}
async function selectItem(id) {
	const tok = detailGuard.next();
	selectedId.value = id;
	try {
		const it = await api.getItem(id);
		if (!detailGuard.isCurrent(tok)) return;
		selected.value = it;
	} catch (e) {
		if (detailGuard.isCurrent(tok)) showToast(errMsg(e));
	}
}
function moveSelection(delta) {
	if (items.value.length === 0) return;
	const idx = items.value.findIndex((x) => x.id === selectedId.value);
	const next = Math.min(Math.max(idx + delta, 0), items.value.length - 1);
	selectItem(items.value[next].id);
}
function robotsOf(key) {
	return robots.value.find((r) => r.source_key === key);
}
var favoriteIds = /* @__PURE__ */ ref([]);
var favoriteCount = computed(() => favoriteIds.value.length);
function isFavorite(id) {
	return id != null && favoriteIds.value.includes(id);
}
async function loadFavorites() {
	try {
		const [, ids] = await api.favoriteSummary();
		favoriteIds.value = ids;
	} catch {
		favoriteIds.value = [];
	}
}
/** 切换收藏：先本地改状态保证点击即反馈，再落库 */
async function toggleFavorite(id) {
	const prev = favoriteIds.value;
	const on = !isFavorite(id);
	favoriteIds.value = on ? [id, ...prev] : prev.filter((x) => x !== id);
	if (selected.value?.id === id) selected.value.favorite = on;
	const hit = items.value.find((x) => x.id === id);
	if (hit) hit.favorite = on;
	showToast(on ? theme.lang === "zh-CN" ? "已加入稍后读" : "Saved for later" : theme.lang === "zh-CN" ? "已取消收藏" : "Removed from saved");
	try {
		const real = await api.toggleFavorite(id);
		if (real !== on) favoriteIds.value = real ? [id, ...prev.filter((x) => x !== id)] : prev.filter((x) => x !== id);
	} catch (e) {
		favoriteIds.value = prev;
		showToast(errMsg(e));
	}
}
/** 待复习错题数（顶栏徽标） */
var wrongPending = /* @__PURE__ */ ref(0);
async function refreshWrongCount() {
	try {
		const [, pending] = await api.wrongAnswerCount();
		wrongPending.value = pending;
	} catch {
		wrongPending.value = 0;
	}
}
/** 当前视图：home 首页磁贴 / learn 教学详情 / items 情报检索 */
var view = /* @__PURE__ */ ref("home");
/** 命令面板（Ctrl+K）：跨模块跳转与动作执行 */
var paletteOpen = /* @__PURE__ */ ref(false);
/** 快捷键总览（?） */
var helpOpen = /* @__PURE__ */ ref(false);
function openPalette() {
	helpOpen.value = false;
	paletteOpen.value = true;
}
function openHelp() {
	paletteOpen.value = false;
	helpOpen.value = true;
}
/** 主题三态循环：浅色 → 深色 → 护眼 */
function cycleTheme() {
	const order = [
		"light",
		"dark",
		"eyecare"
	];
	theme.mode = order[(order.indexOf(theme.mode) + 1) % order.length];
	persistTheme();
}
var lessons = /* @__PURE__ */ ref([]);
/** 全量教学卡（不受筛选影响），用于路径、关联等查标题 */
var allLessons = /* @__PURE__ */ ref([]);
var lessonStats = /* @__PURE__ */ ref(null);
var activeLesson = /* @__PURE__ */ ref(null);
var lessonLoading = /* @__PURE__ */ ref(false);
var lessonFilter = /* @__PURE__ */ reactive({
	query: "",
	kind: null,
	category: null,
	level: null
});
/** 教学卡关联的真实漏洞数 */
var lessonCveCount = /* @__PURE__ */ ref(0);
/** 从教学卡跳转到情报列表时使用的 CWE */
var activeCwe = /* @__PURE__ */ ref(null);
var progress = /* @__PURE__ */ ref([]);
var glossary = /* @__PURE__ */ ref([]);
var paths = /* @__PURE__ */ ref([]);
var overview = /* @__PURE__ */ ref(null);
/** progress 的 Map 索引：卡片数量多时避免 O(n) 线性查找 */
var progressIndex = computed(() => {
	const m = /* @__PURE__ */ new Map();
	for (const p of progress.value) m.set(p.lesson_id, p);
	return m;
});
function progressOf(id) {
	return progressIndex.value.get(id);
}
function statusOf(id) {
	return progressIndex.value.get(id)?.status ?? "unread";
}
async function loadProgress() {
	try {
		progress.value = await api.getProgress();
		overview.value = await api.learnOverview();
	} catch (e) {
		showToast(errMsg(e));
	}
}
async function setLessonStatus(id, status) {
	try {
		await api.setProgress(id, status);
		await loadProgress();
	} catch (e) {
		showToast(errMsg(e));
	}
}
async function loadGlossary() {
	try {
		glossary.value = await api.glossary();
	} catch {
		glossary.value = [];
	}
}
async function loadPaths() {
	try {
		paths.value = await api.learningPaths();
	} catch {
		paths.value = [];
	}
}
/** 术语索引：只在 glossary 变化时重算一次，避免每次渲染都排序 */
var termIndexCache = null;
function sortedTerms() {
	if (termIndexCache && termIndexCache.src === glossary.value) return termIndexCache.sorted;
	const sorted = [...glossary.value].sort((a, b) => b.term.length - a.term.length);
	termIndexCache = {
		src: glossary.value,
		sorted
	};
	return sorted;
}
/** 结果缓存：同一段文本不重复计算（正文长度做键） */
var matchCache = /* @__PURE__ */ new Map();
var MATCH_CACHE_MAX = 400;
/** 在文本里匹配术语，返回可用于渲染的分段 */
function matchTerms(text) {
	if (!glossary.value.length || !text) return [{ text }];
	const cached = matchCache.get(text);
	if (cached) return cached;
	const terms = sortedTerms();
	const hits = [];
	const used = new Array(text.length).fill(false);
	for (const t of terms) {
		const keys = [t.term, ...t.alias ?? []].filter((k) => k && k.length >= 2);
		for (const k of keys) {
			let idx = text.indexOf(k);
			while (idx !== -1) {
				const end = idx + k.length;
				let free = true;
				for (let i = idx; i < end; i++) if (used[i]) {
					free = false;
					break;
				}
				if (free) {
					for (let i = idx; i < end; i++) used[i] = true;
					hits.push({
						start: idx,
						end,
						term: t
					});
				}
				idx = text.indexOf(k, idx + 1);
			}
		}
	}
	if (!hits.length) {
		const plain = [{ text }];
		if (matchCache.size > MATCH_CACHE_MAX) matchCache.clear();
		matchCache.set(text, plain);
		return plain;
	}
	hits.sort((a, b) => a.start - b.start);
	const out = [];
	let cur = 0;
	for (const h of hits) {
		if (h.start > cur) out.push({ text: text.slice(cur, h.start) });
		out.push({
			text: text.slice(h.start, h.end),
			term: h.term
		});
		cur = h.end;
	}
	if (cur < text.length) out.push({ text: text.slice(cur) });
	if (matchCache.size > MATCH_CACHE_MAX) matchCache.clear();
	matchCache.set(text, out);
	return out;
}
async function loadLessons() {
	const tok = lessonGuard.next();
	lessonLoading.value = true;
	try {
		const found = await api.searchLessons({ ...lessonFilter });
		if (!lessonGuard.isCurrent(tok)) return;
		lessons.value = found;
		if (!allLessons.value.length || !lessonFilter.category) {
			const all = await api.searchLessons({
				query: "",
				kind: null,
				category: null,
				level: null
			});
			if (all.length >= allLessons.value.length) allLessons.value = all;
		}
		if (!lessonStats.value) lessonStats.value = await api.lessonStats();
	} catch (e) {
		if (lessonGuard.isCurrent(tok)) showToast(errMsg(e));
	} finally {
		if (lessonGuard.isCurrent(tok)) lessonLoading.value = false;
	}
}
async function openLesson(id) {
	const tok = detailGuard.next();
	try {
		const card = await api.getLesson(id);
		if (!card || !detailGuard.isCurrent(tok)) return;
		activeLesson.value = card;
		view.value = "learn";
		try {
			localStorage.setItem("sentrydesk:last-lesson", id);
		} catch {}
		const cwe = card.cwe;
		const n = cwe ? await api.countItemsByCwe(cwe) : 0;
		if (!detailGuard.isCurrent(tok)) return;
		lessonCveCount.value = n;
	} catch (e) {
		if (detailGuard.isCurrent(tok)) showToast(errMsg(e));
	}
}
/** 从教学卡跳到「该 CWE 的真实漏洞」 */
async function jumpToCwe(cwe) {
	activeCwe.value = cwe;
	filter.query = "";
	filter.cwe = cwe;
	filter.source_key = null;
	filter.severity = null;
	filter.cvss_min = null;
	filter.days = null;
	filter.kev_only = false;
	view.value = "items";
	await doSearch();
}
function goHome() {
	view.value = "home";
	activeLesson.value = null;
	activeCwe.value = null;
}
// src/components/TopBar.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$18 = { class: "topbar" };
var _hoisted_2$18 = ["title"];
var _hoisted_3$17 = { class: "tabs" };
var _hoisted_4$17 = ["onClick"];
var _hoisted_5$16 = {
	key: 0,
	class: "tab-badge mono"
};
var _hoisted_6$16 = ["placeholder"];
var _hoisted_7$15 = ["title"];
var _hoisted_8$14 = {
	key: 1,
	class: "kbd s-kbd"
};
var _hoisted_9$14 = { class: "actions" };
var _hoisted_10$14 = ["title"];
var _hoisted_11$12 = ["title"];
var _hoisted_12$12 = ["title"];
var _hoisted_13$11 = ["title"];
var _hoisted_14$10 = ["title"];
// src/components/TopBar.vue
var TopBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "TopBar",
	setup(__props) {
		const searchRef = /* @__PURE__ */ ref(null);
		const query = searchInput;
		const focused = /* @__PURE__ */ ref(false);
		const zh = computed(() => theme.lang === "zh-CN");
		const tabs = [
			{
				key: "home",
				zh: "学习",
				en: "Learn",
				icon: "book"
			},
			{
				key: "paths",
				zh: "路径",
				en: "Paths",
				icon: "layers"
			},
			{
				key: "items",
				zh: "情报",
				en: "Intel",
				icon: "shield"
			},
			{
				key: "dashboard",
				zh: "看板",
				en: "Board",
				icon: "chart"
			},
			{
				key: "wrong",
				zh: "错题",
				en: "Review",
				icon: "alert",
				badge: true
			}
		];
		const isActive = (k) => k === "home" ? view.value === "home" || view.value === "learn" : view.value === k;
		function go(k) {
			if (k === "home") goHome();
			else view.value = k;
			if (k === "items") doSearch();
			if (k === "wrong") refreshWrongCount();
		}
		/** 搜索框只在有列表的视图里出现，看板/设置页留着只会误导 */
		const showSearch = computed(() => [
			"home",
			"learn",
			"paths",
			"items"
		].includes(view.value));
		const placeholder = () => view.value === "items" ? t("topbar.search") : t("topbar.searchLesson");
		let timer;
		watch(query, (v) => {
			window.clearTimeout(timer);
			timer = window.setTimeout(async () => {
				if (view.value === "home" || view.value === "learn" || view.value === "paths") {
					lessonFilter.query = v;
					await loadLessons();
					if (v.trim()) view.value = "home";
				} else {
					filter.query = v;
					filter.offset = 0;
					await doSearch();
				}
			}, 220);
		});
		watch(view, async (v) => {
			const q = query.value.trim();
			if (!q) return;
			if (v === "items") {
				filter.query = q;
				filter.offset = 0;
				await doSearch();
			} else if (v === "home" || v === "learn" || v === "paths") {
				lessonFilter.query = q;
				await loadLessons();
			}
		});
		function clearQuery() {
			query.value = "";
			lessonFilter.query = "";
			filter.query = "";
			if (view.value === "items") doSearch();
			else loadLessons();
			searchRef.value?.focus();
		}
		function onKeydown(e) {
			const mod = e.ctrlKey || e.metaKey;
			if (mod && e.key.toLowerCase() === "k") {
				e.preventDefault();
				openPalette();
				return;
			}
			if (mod && e.key.toLowerCase() === "f") {
				e.preventDefault();
				searchRef.value?.focus();
				searchRef.value?.select();
				return;
			}
			if (e.key === "/" && !mod) {
				const tag = e.target?.tagName;
				if (tag !== "INPUT" && tag !== "TEXTAREA") {
					e.preventDefault();
					searchRef.value?.focus();
				}
				return;
			}
			if (mod && /^[1-6]$/.test(e.key)) {
				e.preventDefault();
				const v = {
					"1": "home",
					"2": "paths",
					"3": "items",
					"4": "dashboard",
					"5": "wrong",
					"6": "settings"
				}[e.key];
				if (v) go(v);
				return;
			}
			if (e.key === "Escape" && document.activeElement === searchRef.value) {
				clearQuery();
				searchRef.value?.blur();
				return;
			}
			if (e.key === "?" && !mod) {
				const tag = e.target?.tagName;
				if (tag !== "INPUT" && tag !== "TEXTAREA") {
					e.preventDefault();
					openHelp();
				}
			}
		}
		onMounted(() => window.addEventListener("keydown", onKeydown));
		onUnmounted(() => window.removeEventListener("keydown", onKeydown));
		const themeIcon = computed(() => theme.mode === "dark" ? "moon" : theme.mode === "eyecare" ? "eye" : "sun");
		const themeTitle = computed(() => zh.value ? `主题：${t("theme." + theme.mode)}（点击切换）` : `Theme: ${theme.mode} (click to cycle)`);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("header", _hoisted_1$18, [
				createBaseVNode("button", {
					class: "brand",
					onClick: _cache[0] || (_cache[0] = ($event) => unref(goHome)()),
					title: zh.value ? "返回学习首页" : "Back to lessons"
				}, [..._cache[9] || (_cache[9] = [createStaticVNode("<span class=\"logo\" data-v-e4c77d7d><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" data-v-e4c77d7d><defs data-v-e4c77d7d><linearGradient id=\"sd-logo\" x1=\"4\" y1=\"2\" x2=\"20\" y2=\"22\" gradientUnits=\"userSpaceOnUse\" data-v-e4c77d7d><stop stop-color=\"var(--color-accent-hover)\" data-v-e4c77d7d></stop><stop offset=\"1\" stop-color=\"var(--color-accent)\" data-v-e4c77d7d></stop></linearGradient></defs><path d=\"M12 2.6l8.2 3.4v6.2c0 4.7-3.4 8.5-8.2 9.9-4.8-1.4-8.2-5.2-8.2-9.9V6L12 2.6Z\" fill=\"url(#sd-logo)\" data-v-e4c77d7d></path><path d=\"M8.6 12.1l2.4 2.4 4.5-4.9\" stroke=\"var(--color-on-accent)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-v-e4c77d7d></path></svg></span><span class=\"brand-text\" data-v-e4c77d7d><span class=\"name\" data-v-e4c77d7d>SentryDesk</span><span class=\"ver mono\" data-v-e4c77d7d>v0.7.1</span></span>", 2)])], 8, _hoisted_2$18),
				createBaseVNode("nav", _hoisted_3$17, [(openBlock(), createElementBlock(Fragment, null, renderList(tabs, (tb) => {
					return createBaseVNode("button", {
						key: tb.key,
						class: normalizeClass(["tab", { active: isActive(tb.key) }]),
						onClick: ($event) => go(tb.key)
					}, [
						createVNode(Icon_default, {
							name: tb.icon,
							size: 14
						}, null, 8, ["name"]),
						createBaseVNode("span", null, toDisplayString(zh.value ? tb.zh : tb.en), 1),
						tb.badge && unref(wrongPending) > 0 ? (openBlock(), createElementBlock("span", _hoisted_5$16, toDisplayString(unref(wrongPending)), 1)) : createCommentVNode("", true)
					], 10, _hoisted_4$17);
				}), 64))]),
				_cache[10] || (_cache[10] = createBaseVNode("span", { class: "grow" }, null, -1)),
				showSearch.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(["search", { on: focused.value }])
				}, [
					createVNode(Icon_default, {
						name: "search",
						size: 14,
						class: "s-ico"
					}),
					withDirectives(createBaseVNode("input", {
						ref_key: "searchRef",
						ref: searchRef,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => /* @__PURE__ */ isRef(query) ? query.value = $event : null),
						placeholder: placeholder(),
						spellcheck: "false",
						onFocus: _cache[2] || (_cache[2] = ($event) => focused.value = true),
						onBlur: _cache[3] || (_cache[3] = ($event) => focused.value = false)
					}, null, 40, _hoisted_6$16), [[vModelText, unref(query)]]),
					unref(query) ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "s-clear",
						onClick: clearQuery,
						title: zh.value ? "清空" : "Clear"
					}, [createVNode(Icon_default, {
						name: "x",
						size: 12
					})], 8, _hoisted_7$15)) : (openBlock(), createElementBlock("span", _hoisted_8$14, "Ctrl F"))
				], 2)) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_9$14, [
					createBaseVNode("button", {
						class: "icon-btn cmd",
						onClick: _cache[4] || (_cache[4] = (...args) => unref(openPalette) && unref(openPalette)(...args)),
						title: zh.value ? "命令面板 · Ctrl+K" : "Command palette · Ctrl+K"
					}, [createVNode(Icon_default, {
						name: "command",
						size: 15
					})], 8, _hoisted_10$14),
					createBaseVNode("button", {
						class: "icon-btn",
						onClick: _cache[5] || (_cache[5] = ($event) => unref(cycleTheme)()),
						title: themeTitle.value
					}, [createVNode(Icon_default, {
						name: themeIcon.value,
						size: 15
					}, null, 8, ["name"])], 8, _hoisted_11$12),
					createBaseVNode("button", {
						class: "icon-btn lang",
						onClick: _cache[6] || (_cache[6] = ($event) => unref(setLang)(unref(theme).lang === "zh-CN" ? "en-US" : "zh-CN")),
						title: zh.value ? "切换到 English" : "切换到中文"
					}, toDisplayString(zh.value ? "EN" : "中"), 9, _hoisted_12$12),
					createBaseVNode("button", {
						class: "icon-btn",
						onClick: _cache[7] || (_cache[7] = (...args) => unref(openHelp) && unref(openHelp)(...args)),
						title: zh.value ? "快捷键 · ?" : "Shortcuts · ?"
					}, [createVNode(Icon_default, {
						name: "help",
						size: 15
					})], 8, _hoisted_13$11),
					createBaseVNode("button", {
						class: normalizeClass(["icon-btn", { on: unref(view) === "settings" }]),
						onClick: _cache[8] || (_cache[8] = ($event) => view.value = "settings"),
						title: unref(t)("topbar.settings")
					}, [createVNode(Icon_default, {
						name: "settings",
						size: 15
					})], 10, _hoisted_14$10)
				])
			]);
		};
	}
}), [["__scopeId", "data-v-e4c77d7d"]]);
// src/components/Sidebar.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$17 = { class: "sidebar" };
var _hoisted_2$17 = { class: "block" };
var _hoisted_3$16 = { class: "b-head" };
var _hoisted_4$16 = { class: "section-label" };
var _hoisted_5$15 = { class: "b-count mono" };
var _hoisted_6$15 = { class: "row-label" };
var _hoisted_7$14 = { class: "row-count mono" };
var _hoisted_8$13 = ["onClick", "title"];
var _hoisted_9$13 = { class: "row-label" };
var _hoisted_10$13 = { class: "row-count mono" };
var _hoisted_11$11 = { class: "block tight" };
var _hoisted_12$11 = { class: "row-label" };
var _hoisted_13$10 = { class: "row-count mono" };
var _hoisted_14$9 = { class: "block" };
var _hoisted_15$9 = { class: "b-head" };
var _hoisted_16$9 = { class: "section-label" };
var _hoisted_17$9 = { class: "field" };
var _hoisted_18$9 = { class: "f-label" };
var _hoisted_19$8 = { class: "chips" };
var _hoisted_20$8 = ["onClick"];
var _hoisted_21$8 = { class: "field" };
var _hoisted_22$7 = { class: "f-label" };
var _hoisted_23$7 = { class: "chips" };
var _hoisted_24$7 = ["onClick"];
var _hoisted_25$7 = { class: "field" };
var _hoisted_26$7 = { class: "f-label" };
var _hoisted_27$6 = { class: "f-val mono" };
var _hoisted_28$5 = ["value"];
var _hoisted_29$5 = { class: "sw-label" };
var _hoisted_30$5 = { class: "block" };
var _hoisted_31$5 = { class: "b-head" };
var _hoisted_32$5 = { class: "section-label" };
var _hoisted_33$5 = {
	key: 0,
	class: "muted"
};
var _hoisted_34$5 = ["title"];
var _hoisted_35$5 = { class: "robots-name" };
var _hoisted_36$5 = { class: "collect" };
var _hoisted_37$5 = { class: "cp-head" };
var _hoisted_38$5 = { class: "cp-label" };
var _hoisted_39$4 = { class: "cp-n mono" };
var _hoisted_40$4 = { class: "cp-bar" };
var _hoisted_41$4 = { class: "cp-src" };
var _hoisted_42$4 = {
	key: 2,
	class: "collect-msg"
};
var _hoisted_43$4 = { class: "hint" };
// src/components/Sidebar.vue
var Sidebar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "Sidebar",
	setup(__props) {
		const lastSum = /* @__PURE__ */ ref(null);
		const zh = computed(() => theme.lang === "zh-CN");
		const sevOptions = computed(() => [
			{
				v: null,
				label: zh.value ? "全部" : "All",
				dot: ""
			},
			{
				v: "CRITICAL",
				label: t("severity.CRITICAL"),
				dot: "var(--color-sev-critical)"
			},
			{
				v: "HIGH",
				label: t("severity.HIGH"),
				dot: "var(--color-sev-high)"
			},
			{
				v: "MEDIUM",
				label: t("severity.MEDIUM"),
				dot: "var(--color-sev-medium)"
			},
			{
				v: "LOW",
				label: t("severity.LOW"),
				dot: "var(--color-sev-low)"
			}
		]);
		const windows = computed(() => [
			{
				v: null,
				label: zh.value ? "不限" : "Any"
			},
			{
				v: 7,
				label: zh.value ? "7 天" : "7d"
			},
			{
				v: 30,
				label: zh.value ? "30 天" : "30d"
			},
			{
				v: 90,
				label: zh.value ? "90 天" : "90d"
			}
		]);
		function pickSource(key) {
			filter.source_key = key;
			filter.offset = 0;
			doSearch();
		}
		function refresh() {
			filter.offset = 0;
			doSearch();
		}
		function setSeverity(v) {
			filter.severity = v;
			refresh();
		}
		function setDays(v) {
			filter.days = v;
			refresh();
		}
		function setCvss(e) {
			const raw = Number(e.target.value);
			filter.cvss_min = raw > 0 ? raw : null;
			refresh();
		}
		async function runCollect() {
			if (collecting.value) return;
			collecting.value = true;
			try {
				lastSum.value = await api.startCollect();
				await refreshSources();
				await refreshStats();
				await doSearch();
			} catch (e) {
				showToast(t("collect.failed") + ": " + errMsg(e));
			} finally {
				collecting.value = false;
			}
		}
		async function runCheckRobots() {
			showToast(t("sidebar.checkRobots") + "…");
			try {
				await api.checkRobots();
				await refreshSources();
				showToast(t("sidebar.robots") + " ✓");
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		const sourceCount = (key) => stats.value?.by_source.find((s) => s.source_key === key) ?? null;
		const pct = computed(() => {
			const p = collectProgress.value;
			if (!p || !p.total) return 0;
			return Math.round(p.done / p.total * 100);
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("aside", _hoisted_1$17, [
				createBaseVNode("section", _hoisted_2$17, [
					createBaseVNode("header", _hoisted_3$16, [createBaseVNode("span", _hoisted_4$16, toDisplayString(unref(t)("sidebar.sources")), 1), createBaseVNode("span", _hoisted_5$15, toDisplayString(unref(sources).length), 1)]),
					createBaseVNode("button", {
						class: normalizeClass(["row", { active: !unref(filter).source_key }]),
						onClick: _cache[0] || (_cache[0] = ($event) => pickSource(null))
					}, [
						_cache[4] || (_cache[4] = createBaseVNode("span", { class: "dot dot-all" }, null, -1)),
						createBaseVNode("span", _hoisted_6$15, toDisplayString(unref(t)("sidebar.all")), 1),
						createBaseVNode("span", _hoisted_7$14, toDisplayString(unref(stats)?.total ?? 0), 1)
					], 2),
					(openBlock(true), createElementBlock(Fragment, null, renderList(unref(sources), (s) => {
						return openBlock(), createElementBlock("button", {
							key: s.key,
							class: normalizeClass(["row", { active: unref(filter).source_key === s.key }]),
							onClick: ($event) => pickSource(s.key),
							title: s.base_url
						}, [
							createBaseVNode("span", { class: normalizeClass(["dot", unref(robotsOf)(s.key)?.state === "disallowed" ? "dot-off" : "dot-on"]) }, null, 2),
							createBaseVNode("span", _hoisted_9$13, toDisplayString(s.name), 1),
							createBaseVNode("span", _hoisted_10$13, toDisplayString(sourceCount(s.key)?.count ?? 0), 1)
						], 10, _hoisted_8$13);
					}), 128))
				]),
				_cache[6] || (_cache[6] = createBaseVNode("div", { class: "divider" }, null, -1)),
				createBaseVNode("section", _hoisted_11$11, [createBaseVNode("button", {
					class: normalizeClass([
						"row",
						"fav-row",
						{ active: unref(filter).favorite_only }
					]),
					onClick: _cache[1] || (_cache[1] = ($event) => {
						unref(filter).favorite_only = !unref(filter).favorite_only;
						refresh();
					})
				}, [
					createVNode(Icon_default, {
						name: "star",
						size: 13,
						class: normalizeClass(["fav-ico", { on: unref(filter).favorite_only }])
					}, null, 8, ["class"]),
					createBaseVNode("span", _hoisted_12$11, toDisplayString(zh.value ? "稍后读" : "Saved"), 1),
					createBaseVNode("span", _hoisted_13$10, toDisplayString(unref(favoriteCount)), 1)
				], 2)]),
				_cache[7] || (_cache[7] = createBaseVNode("div", { class: "divider" }, null, -1)),
				createBaseVNode("section", _hoisted_14$9, [
					createBaseVNode("header", _hoisted_15$9, [createBaseVNode("span", _hoisted_16$9, toDisplayString(unref(t)("sidebar.filter")), 1), unref(filter).severity || unref(filter).days || unref(filter).cvss_min || unref(filter).kev_only || unref(filter).favorite_only ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "reset",
						onClick: _cache[2] || (_cache[2] = ($event) => {
							unref(filter).severity = null;
							unref(filter).days = null;
							unref(filter).cvss_min = null;
							unref(filter).kev_only = false;
							unref(filter).favorite_only = false;
							refresh();
						})
					}, toDisplayString(zh.value ? "重置" : "Reset"), 1)) : createCommentVNode("", true)]),
					createBaseVNode("div", _hoisted_17$9, [createBaseVNode("span", _hoisted_18$9, toDisplayString(unref(t)("sidebar.severity")), 1), createBaseVNode("div", _hoisted_19$8, [(openBlock(true), createElementBlock(Fragment, null, renderList(sevOptions.value, (o) => {
						return openBlock(), createElementBlock("button", {
							key: String(o.v),
							class: normalizeClass(["mini-chip", { on: unref(filter).severity === o.v }]),
							onClick: ($event) => setSeverity(o.v)
						}, [o.dot ? (openBlock(), createElementBlock("span", {
							key: 0,
							class: "mini-dot",
							style: normalizeStyle({ background: o.dot })
						}, null, 4)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(o.label), 1)], 10, _hoisted_20$8);
					}), 128))])]),
					createBaseVNode("div", _hoisted_21$8, [createBaseVNode("span", _hoisted_22$7, toDisplayString(unref(t)("sidebar.days")), 1), createBaseVNode("div", _hoisted_23$7, [(openBlock(true), createElementBlock(Fragment, null, renderList(windows.value, (w) => {
						return openBlock(), createElementBlock("button", {
							key: String(w.v),
							class: normalizeClass(["mini-chip", { on: unref(filter).days === w.v }]),
							onClick: ($event) => setDays(w.v)
						}, toDisplayString(w.label), 11, _hoisted_24$7);
					}), 128))])]),
					createBaseVNode("div", _hoisted_25$7, [createBaseVNode("span", _hoisted_26$7, [createTextVNode(toDisplayString(zh.value ? "CVSS 最低" : "Min CVSS") + " ", 1), createBaseVNode("span", _hoisted_27$6, toDisplayString(unref(filter).cvss_min != null ? unref(filter).cvss_min.toFixed(1) : "—"), 1)]), createBaseVNode("input", {
						class: "range",
						type: "range",
						min: "0",
						max: "10",
						step: "0.5",
						value: unref(filter).cvss_min ?? 0,
						onChange: setCvss
					}, null, 40, _hoisted_28$5)]),
					createBaseVNode("button", {
						class: normalizeClass(["switch-row", { on: unref(filter).kev_only }]),
						onClick: _cache[3] || (_cache[3] = ($event) => {
							unref(filter).kev_only = !unref(filter).kev_only;
							refresh();
						})
					}, [_cache[5] || (_cache[5] = createBaseVNode("span", { class: "switch" }, [createBaseVNode("span", { class: "knob" })], -1)), createBaseVNode("span", _hoisted_29$5, toDisplayString(unref(t)("sidebar.kevOnly")), 1)], 2)
				]),
				_cache[8] || (_cache[8] = createBaseVNode("div", { class: "divider" }, null, -1)),
				createBaseVNode("section", _hoisted_30$5, [
					createBaseVNode("header", _hoisted_31$5, [createBaseVNode("span", _hoisted_32$5, toDisplayString(unref(t)("sidebar.robots")), 1), createBaseVNode("button", {
						class: "link-btn",
						onClick: runCheckRobots
					}, [createVNode(Icon_default, {
						name: "refresh",
						size: 11
					}), createTextVNode(toDisplayString(zh.value ? "校验" : "Check"), 1)])]),
					unref(robots).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_33$5, "—")) : createCommentVNode("", true),
					(openBlock(true), createElementBlock(Fragment, null, renderList(unref(robots), (r) => {
						return openBlock(), createElementBlock("div", {
							key: r.source_key,
							class: "robots-row",
							title: r.detail
						}, [createBaseVNode("span", { class: normalizeClass(["badge", "badge-" + r.state]) }, toDisplayString(unref(t)("robots." + r.state)), 3), createBaseVNode("span", _hoisted_35$5, toDisplayString(r.source_key), 1)], 8, _hoisted_34$5);
					}), 128))
				]),
				_cache[9] || (_cache[9] = createBaseVNode("div", { class: "spacer" }, null, -1)),
				createBaseVNode("section", _hoisted_36$5, [
					unref(collecting) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createBaseVNode("div", _hoisted_37$5, [createBaseVNode("span", _hoisted_38$5, toDisplayString(unref(t)("sidebar.collecting")), 1), createBaseVNode("span", _hoisted_39$4, toDisplayString(unref(collectProgress) ? unref(collectProgress).done + "/" + unref(collectProgress).total : "…"), 1)]),
						createBaseVNode("div", _hoisted_40$4, [createBaseVNode("div", {
							class: "cp-fill",
							style: normalizeStyle({ width: pct.value + "%" })
						}, null, 4)]),
						createBaseVNode("p", _hoisted_41$4, toDisplayString(unref(collectProgress)?.name ?? (zh.value ? "准备中" : "Preparing")), 1)
					], 64)) : (openBlock(), createElementBlock("button", {
						key: 1,
						class: "primary wide",
						onClick: runCollect
					}, [createVNode(Icon_default, {
						name: "refresh",
						size: 13
					}), createTextVNode(" " + toDisplayString(unref(t)("sidebar.collect")), 1)])),
					lastSum.value && !unref(collecting) ? (openBlock(), createElementBlock("p", _hoisted_42$4, toDisplayString(unref(t)("collect.done")) + " · +" + toDisplayString(lastSum.value.inserted) + " / " + toDisplayString(lastSum.value.skipped) + " " + toDisplayString(unref(t)("status.items")) + " · " + toDisplayString((lastSum.value.elapsed_ms / 1e3).toFixed(1)) + "s ", 1)) : createCommentVNode("", true),
					createBaseVNode("p", _hoisted_43$4, toDisplayString(unref(t)("sidebar.collectTip")), 1)
				])
			]);
		};
	}
}), [["__scopeId", "data-v-b77c95b7"]]);
// node_modules/.pnpm/@tauri-apps+plugin-opener@2.7.2/node_modules/@tauri-apps/plugin-opener/dist-js/index.js
/**
* Open files and URLs using their default application.
*
* ## Security
*
* This API has a scope configuration that forces you to restrict the files and urls to be opened.
*
* ### Restricting access to the {@link open | `open`} API
*
* On the configuration object, `open: true` means that the {@link open} API can be used with any URL,
* as the argument is validated with the `^((mailto:\w+)|(tel:\w+)|(https?://\w+)).+` regex.
* You can change that regex by changing the boolean value to a string, e.g. `open: ^https://github.com/`.
*
* @module
*/
/**
* Opens a url with the system's default app, or the one specified with {@linkcode openWith}.
*
* @example
* ```typescript
* import { openUrl } from '@tauri-apps/plugin-opener';
*
* // opens the given URL on the default browser:
* await openUrl('https://github.com/tauri-apps/tauri');
* // opens the given URL using `firefox`:
* await openUrl('https://github.com/tauri-apps/tauri', 'firefox');
* ```
*
* @param url The URL to open.
* @param openWith The app to open the URL with. If not specified, defaults to the system default application for the specified url type.
* On mobile, `openWith` can be provided as `inAppBrowser` to open the URL in an in-app browser. Otherwise, it will open the URL in the system default browser.
*
* @since 2.0.0
*/
async function openUrl(url, openWith) {
	await invoke("plugin:opener|open_url", {
		url,
		with: openWith
	});
}
// src/composables/useContextMenu.ts
var menuState = /* @__PURE__ */ reactive({
	open: false,
	x: 0,
	y: 0,
	items: []
});
function openMenu(e, items) {
	e.preventDefault();
	e.stopPropagation();
	menuState.items = items.filter((i) => i.separator || i.label);
	menuState.x = e.clientX;
	menuState.y = e.clientY;
	menuState.open = true;
}
function closeMenu() {
	menuState.open = false;
}
/** 复制文本到剪贴板 */
async function copyText(text, what = "") {
	try {
		await navigator.clipboard.writeText(text);
		showToast((what ? what + " " : "") + "已复制");
	} catch {
		try {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
			showToast("已复制");
		} catch {
			showToast("复制失败");
		}
	}
}
/** 导出单个条目为备忘 */
var SEP = {
	key: "sep",
	label: "",
	separator: true,
	action: () => {}
};
/** 打开外部链接 */
async function openExternal(url) {
	try {
		await openUrl(url);
	} catch (e) {
		showToast(errMsg(e));
	}
}
// src/components/ResultList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$16 = { class: "list-col" };
var _hoisted_2$16 = { class: "list-head" };
var _hoisted_3$15 = { class: "count" };
var _hoisted_4$15 = { class: "mono" };
var _hoisted_5$14 = { class: "count-label" };
var _hoisted_6$14 = {
	key: 0,
	class: "chip chip-mono chip-accent"
};
var _hoisted_7$13 = {
	key: 1,
	class: "chip chip-accent"
};
var _hoisted_8$12 = { class: "meta mono" };
var _hoisted_9$12 = { class: "sort" };
var _hoisted_10$12 = {
	key: 0,
	class: "skeleton-list"
};
var _hoisted_11$10 = {
	key: 1,
	class: "state"
};
var _hoisted_12$10 = { class: "empty-ico" };
var _hoisted_13$9 = { class: "empty-title" };
var _hoisted_14$8 = { class: "empty-hint" };
var _hoisted_15$8 = { class: "empty-title" };
var _hoisted_16$8 = { class: "empty-hint" };
var _hoisted_17$8 = [
	"aria-selected",
	"onClick",
	"onContextmenu",
	"onKeydown"
];
var _hoisted_18$8 = { class: "row-top" };
var _hoisted_19$7 = { class: "cve mono" };
var _hoisted_20$7 = {
	key: 0,
	class: "kev"
};
var _hoisted_21$7 = ["title", "onClick"];
var _hoisted_22$6 = { class: "row-title" };
var _hoisted_23$6 = { class: "row-foot" };
var _hoisted_24$6 = { class: "product" };
var _hoisted_25$6 = {
	key: 0,
	class: "cwe-tag mono"
};
var _hoisted_26$6 = { class: "src mono" };
var ROW_H = 96;
var OVERSCAN = 6;
// src/components/ResultList.vue
var ResultList_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ResultList",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const viewport = /* @__PURE__ */ ref(null);
		const scrollTop = /* @__PURE__ */ ref(0);
		const viewportH = /* @__PURE__ */ ref(640);
		const totalH = computed(() => items.value.length * ROW_H);
		const startIdx = computed(() => Math.max(0, Math.floor(scrollTop.value / ROW_H) - OVERSCAN));
		const endIdx = computed(() => Math.min(items.value.length, Math.ceil((scrollTop.value + viewportH.value) / ROW_H) + OVERSCAN));
		const visible = computed(() => {
			const from = Math.min(startIdx.value, Math.max(0, items.value.length - 1));
			const to = Math.min(endIdx.value, items.value.length);
			return from < to ? items.value.slice(from, to) : [];
		});
		const offsetY = computed(() => Math.min(startIdx.value, Math.max(0, items.value.length - 1)) * ROW_H);
		/** 是否有任一生效的筛选条件（决定空状态该说什么） */
		const hasFilter = computed(() => !!((filter.query ?? "").trim() || filter.source_key || filter.cwe || filter.severity || filter.cvss_min != null || filter.days != null || filter.kev_only || filter.favorite_only));
		/** 一键清空全部筛选，回到全量列表 */
		async function clearFilters() {
			filter.query = "";
			searchInput.value = "";
			filter.source_key = null;
			filter.cwe = null;
			filter.severity = null;
			filter.cvss_min = null;
			filter.days = null;
			filter.kev_only = false;
			filter.favorite_only = false;
			filter.offset = 0;
			await doSearch();
		}
		function onScroll() {
			if (!viewport.value) return;
			scrollTop.value = viewport.value.scrollTop;
		}
		function measure() {
			if (viewport.value) viewportH.value = viewport.value.clientHeight;
		}
		/**
		* 结果集变短时把滚动位置夹回合法范围。
		*
		* 不做这一步会有一个很难复现但很致命的现象：
		* 从 530 条筛到 1 条时，容器滚动位置仍停在原来的高度，
		* startIdx = floor(scrollTop / ROW_H) - OVERSCAN 会远大于数组长度，
		* slice() 返回空数组 —— 列表一片空白，但结果其实是有的。
		*/
		function clampScroll() {
			const max = Math.max(0, totalH.value - viewportH.value);
			if (scrollTop.value > max) scrollTop.value = max;
			const el = viewport.value;
			if (el && el.scrollTop > max) el.scrollTop = max;
		}
		watch(() => items.value, clampScroll, { flush: "post" });
		watch(viewportH, clampScroll);
		let ro = null;
		onMounted(() => {
			measure();
			ro = new ResizeObserver(measure);
			if (viewport.value) ro.observe(viewport.value);
			window.addEventListener("keydown", onKeydown);
		});
		onUnmounted(() => {
			ro?.disconnect();
			window.removeEventListener("keydown", onKeydown);
		});
		function onKeydown(e) {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				moveSelection(1);
				scrollToSelected(1);
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				moveSelection(-1);
				scrollToSelected(-1);
			}
		}
		/** 键盘切换时保证选中项在视口内 */
		function scrollToSelected(dir) {
			const idx = items.value.findIndex((x) => x.id === selectedId.value);
			if (idx < 0 || !viewport.value) return;
			const top = idx * ROW_H;
			const vp = viewport.value;
			if (top < vp.scrollTop) vp.scrollTop = top;
			else if (top + ROW_H > vp.scrollTop + vp.clientHeight) vp.scrollTop = top + ROW_H - vp.clientHeight;
		}
		const sevOf = (s) => s ?? "UNKNOWN";
		function onRowContext(e, it) {
			openMenu(e, [
				{
					key: "fav",
					label: isFavorite(it.id) ? zh.value ? "取消稍后读" : "Remove from saved" : zh.value ? "加入稍后读" : "Save for later",
					action: () => toggleFavorite(it.id)
				},
				SEP,
				{
					key: "copy-cve",
					label: zh.value ? "复制 CVE 编号" : "Copy CVE ID",
					disabled: !it.cve_id,
					action: () => copyText(it.cve_id ?? "", "CVE")
				},
				{
					key: "copy-url",
					label: zh.value ? "复制原文链接" : "Copy source URL",
					action: () => copyText(it.source_url, zh.value ? "链接" : "URL")
				},
				{
					key: "copy-title",
					label: zh.value ? "复制标题" : "Copy title",
					action: () => copyText(it.title, zh.value ? "标题" : "Title")
				},
				SEP,
				{
					key: "open-src",
					label: zh.value ? "打开原文" : "Open source",
					hint: "↗",
					action: () => openExternal(it.source_url)
				},
				{
					key: "to-lesson",
					label: zh.value ? "看该缺陷类型的教学" : "Learn this weakness",
					disabled: !it.cwe,
					action: () => {
						if (it.cwe) jumpToCwe(it.cwe);
					}
				},
				SEP,
				{
					key: "select",
					label: zh.value ? "选中此项" : "Select",
					action: () => selectItem(it.id)
				}
			]);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("section", _hoisted_1$16, [createBaseVNode("header", _hoisted_2$16, [
				createBaseVNode("span", _hoisted_3$15, [createBaseVNode("strong", _hoisted_4$15, toDisplayString(unref(total)), 1), createBaseVNode("span", _hoisted_5$14, toDisplayString(zh.value ? "条结果" : "results"), 1)]),
				unref(filter).cwe ? (openBlock(), createElementBlock("span", _hoisted_6$14, toDisplayString(unref(filter).cwe), 1)) : createCommentVNode("", true),
				unref(filter).favorite_only ? (openBlock(), createElementBlock("span", _hoisted_7$13, [createVNode(Icon_default, {
					name: "star",
					size: 10
				}), createTextVNode(toDisplayString(zh.value ? "稍后读" : "Saved"), 1)])) : createCommentVNode("", true),
				_cache[1] || (_cache[1] = createBaseVNode("span", { class: "grow" }, null, -1)),
				createBaseVNode("span", _hoisted_8$12, toDisplayString(unref(elapsedMs)) + " ms", 1),
				createBaseVNode("span", _hoisted_9$12, [createVNode(Icon_default, {
					name: "clock",
					size: 11
				}), createTextVNode(" " + toDisplayString(zh.value ? "最新优先" : "Newest"), 1)])
			]), unref(loading) ? (openBlock(), createElementBlock("div", _hoisted_10$12, [(openBlock(), createElementBlock(Fragment, null, renderList(8, (i) => {
				return createBaseVNode("div", {
					key: i,
					class: "sk-row"
				}, [..._cache[2] || (_cache[2] = [
					createBaseVNode("div", { class: "skeleton sk-a" }, null, -1),
					createBaseVNode("div", { class: "skeleton sk-b" }, null, -1),
					createBaseVNode("div", { class: "skeleton sk-c" }, null, -1)
				])]);
			}), 64))])) : unref(items).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_11$10, [createBaseVNode("div", _hoisted_12$10, [createVNode(Icon_default, {
				name: "filter",
				size: 20
			})]), hasFilter.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
				createBaseVNode("p", _hoisted_13$9, toDisplayString(zh.value ? "没有符合条件的条目" : "No items match"), 1),
				createBaseVNode("p", _hoisted_14$8, toDisplayString(zh.value ? "当前筛选组合过窄，可放宽条件再试" : "The filter combination is too narrow; try relaxing it"), 1),
				createBaseVNode("button", {
					class: "empty-btn",
					onClick: _cache[0] || (_cache[0] = ($event) => clearFilters())
				}, toDisplayString(zh.value ? "清除全部筛选" : "Clear all filters"), 1)
			], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createBaseVNode("p", _hoisted_15$8, toDisplayString(zh.value ? "本地库还没有数据" : "The local database is empty"), 1), createBaseVNode("p", _hoisted_16$8, toDisplayString(zh.value ? "点击左下角「开始合规采集」获取公开安全情报" : "Click \"Start collection\" to fetch public security intelligence"), 1)], 64))])) : (openBlock(), createElementBlock("div", {
				key: 2,
				ref_key: "viewport",
				ref: viewport,
				class: "vp",
				onScrollPassive: onScroll
			}, [createBaseVNode("div", {
				class: "spacer",
				style: normalizeStyle({ height: totalH.value + "px" })
			}, [createBaseVNode("div", {
				class: "window",
				style: normalizeStyle({ transform: "translateY(" + offsetY.value + "px)" })
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(visible.value, (it) => {
				return openBlock(), createElementBlock("button", {
					key: it.id,
					class: normalizeClass(["row", { active: it.id === unref(selectedId) }]),
					style: normalizeStyle({ height: "96px" }),
					tabindex: "0",
					role: "option",
					"data-ctx": "item",
					"aria-selected": it.id === unref(selectedId),
					onClick: ($event) => unref(selectItem)(it.id),
					onContextmenu: ($event) => onRowContext($event, it),
					onKeydown: [withKeys(withModifiers(($event) => unref(selectItem)(it.id), ["prevent"]), ["enter"]), withKeys(withModifiers(($event) => unref(selectItem)(it.id), ["prevent"]), ["space"])]
				}, [
					createBaseVNode("div", _hoisted_18$8, [
						createBaseVNode("span", { class: normalizeClass(["sev-dot", "sev-" + sevOf(it.cvss_severity)]) }, null, 2),
						createBaseVNode("span", _hoisted_19$7, toDisplayString(it.cve_id ?? it.external_id ?? "—"), 1),
						it.in_kev ? (openBlock(), createElementBlock("span", _hoisted_20$7, [createVNode(Icon_default, {
							name: "flame",
							size: 10
						}), _cache[3] || (_cache[3] = createTextVNode("KEV ", -1))])) : createCommentVNode("", true),
						_cache[4] || (_cache[4] = createBaseVNode("span", { class: "grow" }, null, -1)),
						it.cvss_score !== null ? (openBlock(), createElementBlock("span", {
							key: 1,
							class: normalizeClass(["score", "score-" + sevOf(it.cvss_severity)])
						}, toDisplayString(it.cvss_score.toFixed(1)), 3)) : createCommentVNode("", true),
						createBaseVNode("span", {
							class: normalizeClass(["star-btn", { on: unref(isFavorite)(it.id) }]),
							title: zh.value ? "稍后读" : "Save for later",
							role: "button",
							onClick: withModifiers(($event) => unref(toggleFavorite)(it.id), ["stop"])
						}, [createVNode(Icon_default, {
							name: "star",
							size: 13
						})], 10, _hoisted_21$7)
					]),
					createBaseVNode("div", _hoisted_22$6, toDisplayString(it.title), 1),
					createBaseVNode("div", _hoisted_23$6, [
						createBaseVNode("span", _hoisted_24$6, toDisplayString(it.products.join(" · ") || "—"), 1),
						it.cwe ? (openBlock(), createElementBlock("span", _hoisted_25$6, toDisplayString(it.cwe), 1)) : createCommentVNode("", true),
						createBaseVNode("span", _hoisted_26$6, toDisplayString(it.source_key), 1)
					])
				], 46, _hoisted_17$8);
			}), 128))], 4)], 4)], 544))]);
		};
	}
}), [["__scopeId", "data-v-15d35a74"]]);
// src/components/DetailPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$15 = { class: "detail" };
var _hoisted_2$15 = {
	key: 0,
	class: "empty"
};
var _hoisted_3$14 = { class: "empty-ico" };
var _hoisted_4$14 = { class: "empty-title" };
var _hoisted_5$13 = { class: "empty-hint" };
var _hoisted_6$13 = {
	key: 1,
	class: "content"
};
var _hoisted_7$12 = { class: "head" };
var _hoisted_8$11 = { class: "id-line" };
var _hoisted_9$11 = { class: "cve mono" };
var _hoisted_10$11 = {
	key: 0,
	class: "kev"
};
var _hoisted_11$9 = ["title"];
var _hoisted_12$9 = ["title"];
var _hoisted_13$8 = {
	key: 0,
	class: "cvss-block"
};
var _hoisted_14$7 = { class: "cvss-line" };
var _hoisted_15$7 = { class: "meter" };
var _hoisted_16$7 = { class: "title" };
var _hoisted_17$7 = { class: "meta" };
var _hoisted_18$7 = { class: "meta-row" };
var _hoisted_19$6 = { class: "k" };
var _hoisted_20$6 = { class: "v mono" };
var _hoisted_21$6 = {
	key: 0,
	class: "meta-row"
};
var _hoisted_22$5 = { class: "k" };
var _hoisted_23$5 = { class: "v" };
var _hoisted_24$5 = { class: "meta-row" };
var _hoisted_25$5 = { class: "k" };
var _hoisted_26$5 = { class: "v mono" };
var _hoisted_27$5 = { class: "meta-row" };
var _hoisted_28$4 = { class: "k" };
var _hoisted_29$4 = { class: "v mono" };
var _hoisted_30$4 = {
	key: 1,
	class: "meta-row"
};
var _hoisted_31$4 = { class: "k" };
var _hoisted_32$4 = { class: "v mono" };
var _hoisted_33$4 = { class: "le-icon" };
var _hoisted_34$4 = { class: "le-body" };
var _hoisted_35$4 = { class: "le-kicker" };
var _hoisted_36$4 = { class: "le-title" };
var _hoisted_37$4 = {
	key: 1,
	class: "cwe-bare"
};
var _hoisted_38$4 = { class: "mono" };
var _hoisted_39$3 = { class: "cwe-note" };
var _hoisted_40$3 = {
	key: 2,
	class: "block"
};
var _hoisted_41$3 = { class: "block-title" };
var _hoisted_42$3 = { class: "action-text" };
var _hoisted_43$3 = {
	key: 3,
	class: "block"
};
var _hoisted_44$3 = { class: "block-title" };
var _hoisted_45$3 = { class: "summary" };
var _hoisted_46$3 = { class: "block" };
var _hoisted_47$3 = { class: "block-title" };
var _hoisted_48$3 = {
	key: 0,
	class: "saved"
};
var _hoisted_49$3 = ["placeholder"];
var _hoisted_50$3 = ["disabled"];
var _hoisted_51$3 = { class: "foot" };
// src/components/DetailPanel.vue
var DetailPanel_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "DetailPanel",
	setup(__props) {
		const noteBody = /* @__PURE__ */ ref("");
		const saving = /* @__PURE__ */ ref(false);
		const savedAt = /* @__PURE__ */ ref("");
		const zh = () => theme.lang === "zh-CN";
		watch(selected, (v) => {
			noteBody.value = v?.note?.body ?? "";
			savedAt.value = "";
		}, { immediate: true });
		async function saveNote() {
			if (!selected.value) return;
			if (!noteBody.value.trim()) {
				showToast(t("detail.noteEmpty"));
				return;
			}
			saving.value = true;
			try {
				const saved = await api.saveNote(selected.value.id, noteBody.value);
				selected.value.note = saved;
				savedAt.value = t("detail.saved");
				window.setTimeout(() => savedAt.value = "", 2e3);
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				saving.value = false;
			}
		}
		async function openSource() {
			if (!selected.value) return;
			try {
				await openUrl(selected.value.source_url);
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		const sevOf = (s) => s ?? "UNKNOWN";
		const scorePct = (n) => n == null ? 0 : Math.min(100, n / 10 * 100);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("aside", _hoisted_1$15, [!unref(selected) ? (openBlock(), createElementBlock("div", _hoisted_2$15, [
				createBaseVNode("div", _hoisted_3$14, [createVNode(Icon_default, {
					name: "shield",
					size: 22
				})]),
				createBaseVNode("p", _hoisted_4$14, toDisplayString(unref(t)("detail.empty")), 1),
				createBaseVNode("p", _hoisted_5$13, toDisplayString(zh() ? "用 ↑ ↓ 或点击左侧条目浏览" : "Use ↑ ↓ or click an item on the left"), 1)
			])) : (openBlock(), createElementBlock("div", _hoisted_6$13, [
				createBaseVNode("header", _hoisted_7$12, [
					createBaseVNode("div", _hoisted_8$11, [
						createBaseVNode("span", _hoisted_9$11, toDisplayString(unref(selected).cve_id ?? unref(selected).external_id ?? "—"), 1),
						unref(selected).in_kev ? (openBlock(), createElementBlock("span", _hoisted_10$11, [createVNode(Icon_default, {
							name: "flame",
							size: 10
						}), createTextVNode(toDisplayString(unref(t)("detail.kev")), 1)])) : createCommentVNode("", true),
						_cache[4] || (_cache[4] = createBaseVNode("span", { class: "grow" }, null, -1)),
						createBaseVNode("button", {
							class: normalizeClass([
								"icon-btn",
								"fav",
								{ on: unref(isFavorite)(unref(selected).id) }
							]),
							onClick: _cache[0] || (_cache[0] = ($event) => unref(toggleFavorite)(unref(selected).id)),
							title: zh() ? "稍后读" : "Save for later"
						}, [createVNode(Icon_default, {
							name: "star",
							size: 15
						})], 10, _hoisted_11$9),
						createBaseVNode("button", {
							class: "icon-btn",
							onClick: _cache[1] || (_cache[1] = ($event) => unref(copyText)(unref(selected).source_url, zh() ? "链接" : "URL")),
							title: zh() ? "复制原文链接" : "Copy link"
						}, [createVNode(Icon_default, {
							name: "copy",
							size: 14
						})], 8, _hoisted_12$9)
					]),
					unref(selected).cvss_score !== null ? (openBlock(), createElementBlock("div", _hoisted_13$8, [createBaseVNode("div", _hoisted_14$7, [
						createBaseVNode("span", { class: normalizeClass(["cvss", "v-" + sevOf(unref(selected).cvss_severity)]) }, toDisplayString(unref(selected).cvss_score.toFixed(1)), 3),
						_cache[5] || (_cache[5] = createBaseVNode("span", { class: "cvss-max mono" }, "/ 10", -1)),
						createBaseVNode("span", { class: normalizeClass(["sev-chip", "c-" + sevOf(unref(selected).cvss_severity)]) }, [createBaseVNode("span", { class: normalizeClass(["sev-dot", "sev-" + sevOf(unref(selected).cvss_severity)]) }, null, 2), createTextVNode(" " + toDisplayString(unref(t)("severity." + sevOf(unref(selected).cvss_severity))), 1)], 2)
					]), createBaseVNode("div", _hoisted_15$7, [createBaseVNode("div", {
						class: normalizeClass(["meter-fill", "f-" + sevOf(unref(selected).cvss_severity)]),
						style: normalizeStyle({ width: scorePct(unref(selected).cvss_score) + "%" })
					}, null, 6)])])) : createCommentVNode("", true),
					createBaseVNode("h2", _hoisted_16$7, toDisplayString(unref(selected).title), 1)
				]),
				createBaseVNode("section", _hoisted_17$7, [
					createBaseVNode("div", _hoisted_18$7, [createBaseVNode("span", _hoisted_19$6, toDisplayString(unref(t)("detail.source")), 1), createBaseVNode("span", _hoisted_20$6, toDisplayString(unref(selected).source_key), 1)]),
					unref(selected).products.length ? (openBlock(), createElementBlock("div", _hoisted_21$6, [createBaseVNode("span", _hoisted_22$5, toDisplayString(unref(t)("detail.products")), 1), createBaseVNode("span", _hoisted_23$5, toDisplayString(unref(selected).products.join(", ")), 1)])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_24$5, [createBaseVNode("span", _hoisted_25$5, toDisplayString(unref(t)("detail.published")), 1), createBaseVNode("span", _hoisted_26$5, toDisplayString(unref(fmtDate)(unref(selected).published_at)), 1)]),
					createBaseVNode("div", _hoisted_27$5, [createBaseVNode("span", _hoisted_28$4, toDisplayString(unref(t)("detail.collected")), 1), createBaseVNode("span", _hoisted_29$4, toDisplayString(unref(fmtRelative)(unref(selected).collected_at)), 1)]),
					unref(selected).external_id && unref(selected).external_id !== unref(selected).cve_id ? (openBlock(), createElementBlock("div", _hoisted_30$4, [createBaseVNode("span", _hoisted_31$4, toDisplayString(unref(t)("detail.externalId")), 1), createBaseVNode("span", _hoisted_32$4, toDisplayString(unref(selected).external_id), 1)])) : createCommentVNode("", true)
				]),
				unref(selected).lesson ? (openBlock(), createElementBlock("button", {
					key: 0,
					class: "lesson-entry",
					onClick: _cache[2] || (_cache[2] = ($event) => unref(openLesson)(unref(selected).lesson.id))
				}, [
					createBaseVNode("span", _hoisted_33$4, toDisplayString(unref(selected).lesson.icon), 1),
					createBaseVNode("span", _hoisted_34$4, [createBaseVNode("span", _hoisted_35$4, toDisplayString(unref(t)("detail.learnMore")) + " · " + toDisplayString(unref(selected).cwe), 1), createBaseVNode("span", _hoisted_36$4, toDisplayString(unref(selected).lesson.title), 1)]),
					createVNode(Icon_default, {
						name: "arrow-right",
						size: 14,
						class: "le-arrow"
					})
				])) : unref(selected).cwe ? (openBlock(), createElementBlock("div", _hoisted_37$4, [
					createVNode(Icon_default, {
						name: "tag",
						size: 11
					}),
					createBaseVNode("span", _hoisted_38$4, toDisplayString(unref(selected).cwe), 1),
					createBaseVNode("span", _hoisted_39$3, toDisplayString(zh() ? "暂无对应教学卡" : "No lesson yet"), 1)
				])) : createCommentVNode("", true),
				unref(selected).action ? (openBlock(), createElementBlock("section", _hoisted_40$3, [createBaseVNode("h3", _hoisted_41$3, toDisplayString(unref(t)("detail.action")), 1), createBaseVNode("p", _hoisted_42$3, toDisplayString(unref(selected).action), 1)])) : createCommentVNode("", true),
				unref(selected).summary ? (openBlock(), createElementBlock("section", _hoisted_43$3, [createBaseVNode("h3", _hoisted_44$3, toDisplayString(unref(t)("detail.summary")), 1), createBaseVNode("p", _hoisted_45$3, toDisplayString(unref(selected).summary), 1)])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_46$3, [
					createBaseVNode("h3", _hoisted_47$3, [createTextVNode(toDisplayString(unref(t)("detail.note")) + " ", 1), savedAt.value ? (openBlock(), createElementBlock("span", _hoisted_48$3, [createVNode(Icon_default, {
						name: "check",
						size: 11
					}), createTextVNode(toDisplayString(savedAt.value), 1)])) : createCommentVNode("", true)]),
					withDirectives(createBaseVNode("textarea", {
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => noteBody.value = $event),
						class: "note",
						rows: "4",
						placeholder: unref(t)("detail.notePlaceholder")
					}, null, 8, _hoisted_49$3), [[vModelText, noteBody.value]]),
					createBaseVNode("button", {
						class: "save",
						disabled: saving.value,
						onClick: saveNote
					}, toDisplayString(unref(t)("detail.saveNote")), 9, _hoisted_50$3)
				]),
				_cache[6] || (_cache[6] = createBaseVNode("div", { class: "spacer" }, null, -1)),
				createBaseVNode("footer", _hoisted_51$3, [createBaseVNode("button", {
					class: "primary wide",
					onClick: openSource
				}, [createVNode(Icon_default, {
					name: "external",
					size: 13
				}), createTextVNode(toDisplayString(unref(t)("detail.openSource")), 1)])])
			]))]);
		};
	}
}), [["__scopeId", "data-v-cb17cbf5"]]);
// src/components/StatusBar.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$14 = { class: "statusbar" };
var _hoisted_2$14 = { class: "item" };
var _hoisted_3$13 = { class: "mono v" };
var _hoisted_4$13 = { class: "item" };
var _hoisted_5$12 = { class: "k" };
var _hoisted_6$12 = { class: "mono v" };
var _hoisted_7$11 = { class: "item" };
var _hoisted_8$10 = { class: "k" };
var _hoisted_9$10 = { class: "mono v" };
var _hoisted_10$10 = { class: "chip chip-accent offline" };
// src/components/StatusBar.vue
var StatusBar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "StatusBar",
	setup(__props) {
		const statusText = computed(() => {
			if (!collecting.value) return t("status.ready");
			const p = collectProgress.value;
			return p ? `${t("status.collecting")} ${p.done}/${p.total} · ${p.name}` : t("status.collecting");
		});
		const dbSize = computed(() => stats.value ? fmtBytes(stats.value.db_bytes) : "—");
		const lastCollect = computed(() => stats.value?.last_collected_at ? fmtRelative(stats.value.last_collected_at) : t("status.never"));
		async function exportMemo() {
			try {
				if ((await api.previewMemo()).length === 0) {
					showToast(theme.lang === "zh-CN" ? "没有带笔记的条目可导出" : "No items with notes to export");
					return;
				}
				const name = `sentrydesk-memo-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
				const saved = await api.exportMemo(name);
				showToast(t("status.exported") + " → " + saved);
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("footer", _hoisted_1$14, [
				createBaseVNode("span", { class: normalizeClass(["dot", unref(collecting) ? "busy" : "idle"]) }, null, 2),
				createBaseVNode("span", { class: normalizeClass(["label", { live: unref(collecting) }]) }, toDisplayString(statusText.value), 3),
				_cache[0] || (_cache[0] = createBaseVNode("span", { class: "sep" }, null, -1)),
				createBaseVNode("span", _hoisted_2$14, [createVNode(Icon_default, {
					name: "database",
					size: 11
				}), createBaseVNode("span", _hoisted_3$13, toDisplayString(unref(stats)?.total ?? 0), 1)]),
				createBaseVNode("span", _hoisted_4$13, [createBaseVNode("span", _hoisted_5$12, toDisplayString(unref(t)("status.dbSize")), 1), createBaseVNode("span", _hoisted_6$12, toDisplayString(dbSize.value), 1)]),
				createBaseVNode("span", _hoisted_7$11, [createBaseVNode("span", _hoisted_8$10, toDisplayString(unref(t)("status.lastCollect")), 1), createBaseVNode("span", _hoisted_9$10, toDisplayString(lastCollect.value), 1)]),
				createBaseVNode("span", _hoisted_10$10, [createVNode(Icon_default, {
					name: "shield",
					size: 10
				}), createTextVNode(toDisplayString(unref(t)("status.offline")), 1)]),
				createBaseVNode("button", {
					class: "export",
					onClick: exportMemo
				}, [createVNode(Icon_default, {
					name: "note",
					size: 11
				}), createTextVNode(toDisplayString(unref(t)("status.export")), 1)])
			]);
		};
	}
}), [["__scopeId", "data-v-cdb84374"]]);
// src/components/HomeView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$13 = { class: "home" };
var _hoisted_2$13 = { class: "cats" };
var _hoisted_3$12 = { class: "cats-head" };
var _hoisted_4$12 = { class: "section-label" };
var _hoisted_5$11 = { class: "cats-n mono" };
var _hoisted_6$11 = { class: "cat-name" };
var _hoisted_7$10 = { class: "cat-n mono" };
var _hoisted_8$9 = ["onClick"];
var _hoisted_9$9 = { class: "cat-name" };
var _hoisted_10$9 = { class: "cat-n mono" };
var _hoisted_11$8 = { class: "cat-name" };
var _hoisted_12$8 = { class: "cat-n mono" };
var _hoisted_13$7 = { class: "cat-name" };
var _hoisted_14$6 = { class: "cat-n mono" };
var _hoisted_15$6 = {
	key: 0,
	class: "ov"
};
var _hoisted_16$6 = { class: "ov-top" };
var _hoisted_17$6 = { class: "ov-k" };
var _hoisted_18$6 = { class: "ov-v mono" };
var _hoisted_19$5 = { class: "ov-bar" };
var _hoisted_20$5 = { class: "ov-sub" };
var _hoisted_21$5 = { class: "wall" };
var _hoisted_22$4 = { class: "hero" };
var _hoisted_23$4 = { class: "hero-main" };
var _hoisted_24$4 = { class: "kicker" };
var _hoisted_25$4 = { class: "hero-title" };
var _hoisted_26$4 = { class: "hero-sub" };
var _hoisted_27$4 = { class: "hero-actions" };
var _hoisted_28$3 = { class: "hero-stats" };
var _hoisted_29$3 = { class: "hs" };
var _hoisted_30$3 = { class: "hs-n mono" };
var _hoisted_31$3 = { class: "hs-k" };
var _hoisted_32$3 = { class: "hs" };
var _hoisted_33$3 = { class: "hs-n mono" };
var _hoisted_34$3 = { class: "hs-k" };
var _hoisted_35$3 = { class: "hs" };
var _hoisted_36$3 = { class: "hs-n mono" };
var _hoisted_37$3 = { class: "hs-k" };
var _hoisted_38$3 = { class: "wall-head" };
var _hoisted_39$2 = { class: "wall-title" };
var _hoisted_40$2 = { class: "wall-sub" };
var _hoisted_41$2 = {
	key: 0,
	class: "grid"
};
var _hoisted_42$2 = {
	key: 1,
	class: "empty"
};
var _hoisted_43$2 = { class: "empty-ico" };
var _hoisted_44$2 = { class: "empty-title" };
var _hoisted_45$2 = { class: "empty-hint" };
var _hoisted_46$2 = {
	key: 2,
	class: "grid"
};
var _hoisted_47$2 = ["onClick", "onContextmenu"];
var _hoisted_48$2 = { class: "tile-top" };
var _hoisted_49$2 = { class: "tile-title" };
var _hoisted_50$2 = ["aria-label"];
var _hoisted_51$2 = { class: "tile-desc" };
var _hoisted_52$2 = { class: "tile-foot" };
var _hoisted_53$2 = { class: "kind" };
var _hoisted_54$2 = { class: "lvl" };
var _hoisted_55$1 = {
	key: 0,
	class: "cwe mono"
};
var _hoisted_56$1 = {
	key: 1,
	class: "quiz-n mono"
};
var LAST_KEY = "sentrydesk:last-lesson";
// src/components/HomeView.vue
var HomeView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "HomeView",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const cats = computed(() => {
			const m = /* @__PURE__ */ new Map();
			for (const c of lessons.value ?? []) m.set(c.category, (m.get(c.category) ?? 0) + 1);
			return [...m.entries()].map(([name, count]) => ({
				name,
				count
			}));
		});
		const levelLabel = (lv) => zh.value ? {
			beginner: "入门",
			intermediate: "进阶",
			advanced: "深入"
		}[lv] ?? lv : {
			beginner: "Beginner",
			intermediate: "Intermediate",
			advanced: "Advanced"
		}[lv] ?? lv;
		const kindLabel = (k) => zh.value ? {
			cwe: "缺陷类型",
			lesson: "方法论",
			lab: "实战"
		}[k] ?? k : {
			cwe: "Weakness",
			lesson: "Method",
			lab: "Lab"
		}[k] ?? k;
		async function pickCategory(cat) {
			lessonFilter.category = cat;
			await loadLessons();
		}
		/** 清除检索与分类筛选，回到全部教程 */
		async function resetFilter() {
			lessonFilter.query = "";
			lessonFilter.category = null;
			lessonFilter.kind = null;
			lessonFilter.level = null;
			searchInput.value = "";
			await loadLessons();
		}
		async function goItems() {
			view.value = "items";
			await doSearch();
		}
		const titleOf = (c) => zh.value ? c.title : c.title_en || c.title;
		const summaryOf = (c) => zh.value ? c.summary : c.summary_en || c.summary;
		/** 卡片角标：预计算成 Map，避免每次渲染都线性查找 */
		const badgeMap = computed(() => {
			const m = /* @__PURE__ */ new Map();
			for (const c of lessons.value) {
				const b = computeBadge(c.id);
				if (b) m.set(c.id, b);
			}
			return m;
		});
		function badge(id) {
			return badgeMap.value.get(id) ?? null;
		}
		function computeBadge(id) {
			const st = statusOf(id);
			const p = progressOf(id);
			if (st === "mastered") return {
				text: "✓",
				cls: "b-done",
				label: zh.value ? "已掌握" : "Mastered"
			};
			if (p?.quiz_score !== null && p?.quiz_score !== void 0) return {
				text: String(p.quiz_score),
				cls: p.quiz_score >= 60 ? "b-ok" : "b-weak",
				label: (zh.value ? "自测得分 " : "Quiz score ") + p.quiz_score
			};
			if (st === "reading") return {
				text: "…",
				cls: "b-reading",
				label: zh.value ? "学习中" : "In progress"
			};
			return null;
		}
		function onTileContext(e, c) {
			const st = statusOf(c.id);
			openMenu(e, [
				{
					key: "open",
					label: zh.value ? "打开这张卡" : "Open card",
					action: () => openLesson(c.id)
				},
				SEP,
				{
					key: "mark-mastered",
					label: zh.value ? "标记为已掌握" : "Mark mastered",
					disabled: st === "mastered",
					action: () => setLessonStatus(c.id, "mastered")
				},
				{
					key: "mark-reading",
					label: zh.value ? "标记为学习中" : "Mark in progress",
					disabled: st === "reading",
					action: () => setLessonStatus(c.id, "reading")
				},
				{
					key: "mark-unread",
					label: zh.value ? "重置为未读" : "Reset to unread",
					disabled: st === "unread",
					action: () => setLessonStatus(c.id, "unread")
				},
				SEP,
				{
					key: "copy-cwe",
					label: zh.value ? "复制 CWE 编号" : "Copy CWE",
					disabled: !c.cwe,
					action: () => copyText(c.cwe ?? "", "CWE")
				},
				{
					key: "copy-title",
					label: zh.value ? "复制标题" : "Copy title",
					action: () => copyText(c.title, zh.value ? "标题" : "Title")
				},
				{
					key: "to-intel",
					label: zh.value ? "看该类型的真实漏洞" : "See real findings",
					disabled: !c.cwe,
					action: () => {
						if (c.cwe) jumpToCwe(c.cwe);
					}
				}
			]);
		}
		const pct = computed(() => {
			if (!overview.value || !overview.value.total_cards) return 0;
			return Math.round(overview.value.mastered_count / overview.value.total_cards * 100);
		});
		const lastId = computed(() => localStorage.getItem(LAST_KEY));
		const lastCard = computed(() => {
			const id = lastId.value;
			if (!id) return null;
			return lessons.value.find((c) => c.id === id) ?? null;
		});
		const greeting = computed(() => {
			const h = (/* @__PURE__ */ new Date()).getHours();
			if (h < 6) return zh.value ? "夜深了" : "Late night";
			if (h < 12) return zh.value ? "早上好" : "Good morning";
			if (h < 18) return zh.value ? "下午好" : "Good afternoon";
			return zh.value ? "晚上好" : "Good evening";
		});
		function resume() {
			const c = lastCard.value ?? lessons.value[0];
			if (c) openLesson(c.id);
		}
		function randomCard() {
			const pool = lessons.value;
			if (!pool.length) return;
			const pick = pool[Math.floor(Math.random() * pool.length)];
			openLesson(pick.id);
		}
		const totalCards = computed(() => overview.value?.total_cards ?? lessonStats.value?.total ?? 107);
		const avgScore = computed(() => Math.round(overview.value?.avg_score ?? 0));
		const noteCount = computed(() => overview.value?.note_count ?? 0);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$13, [createBaseVNode("aside", _hoisted_2$13, [
				createBaseVNode("header", _hoisted_3$12, [createBaseVNode("span", _hoisted_4$12, toDisplayString(zh.value ? "分类" : "Categories"), 1), createBaseVNode("span", _hoisted_5$11, toDisplayString(unref(lessons)?.length ?? 0), 1)]),
				createBaseVNode("button", {
					class: normalizeClass(["cat", { active: !unref(lessonFilter).category }]),
					onClick: _cache[0] || (_cache[0] = ($event) => pickCategory(null))
				}, [createBaseVNode("span", _hoisted_6$11, toDisplayString(zh.value ? "全部教程" : "All lessons"), 1), createBaseVNode("span", _hoisted_7$10, toDisplayString(unref(lessons)?.length ?? 0), 1)], 2),
				(openBlock(true), createElementBlock(Fragment, null, renderList(cats.value, (c) => {
					return openBlock(), createElementBlock("button", {
						key: c.name,
						class: normalizeClass(["cat", { active: unref(lessonFilter).category === c.name }]),
						onClick: ($event) => pickCategory(c.name)
					}, [createBaseVNode("span", _hoisted_9$9, toDisplayString(unref(categoryLabel)(c.name, zh.value)), 1), createBaseVNode("span", _hoisted_10$9, toDisplayString(c.count), 1)], 10, _hoisted_8$9);
				}), 128)),
				_cache[6] || (_cache[6] = createBaseVNode("div", { class: "cats-sep" }, null, -1)),
				createBaseVNode("button", {
					class: "cat entry",
					onClick: _cache[1] || (_cache[1] = ($event) => view.value = "paths")
				}, [
					createVNode(Icon_default, {
						name: "layers",
						size: 13,
						class: "entry-ico"
					}),
					createBaseVNode("span", _hoisted_11$8, toDisplayString(zh.value ? "学习路径" : "Learning paths"), 1),
					createBaseVNode("span", _hoisted_12$8, toDisplayString(unref(paths)?.length ?? 0), 1)
				]),
				createBaseVNode("button", {
					class: "cat entry",
					onClick: goItems
				}, [
					createVNode(Icon_default, {
						name: "shield",
						size: 13,
						class: "entry-ico"
					}),
					createBaseVNode("span", _hoisted_13$7, toDisplayString(zh.value ? "情报检索" : "Intel search"), 1),
					createBaseVNode("span", _hoisted_14$6, toDisplayString(unref(stats)?.total ?? 0), 1)
				]),
				unref(overview) ? (openBlock(), createElementBlock("div", _hoisted_15$6, [
					createBaseVNode("div", _hoisted_16$6, [createBaseVNode("span", _hoisted_17$6, toDisplayString(zh.value ? "掌握进度" : "Mastered"), 1), createBaseVNode("span", _hoisted_18$6, toDisplayString(pct.value) + "%", 1)]),
					createBaseVNode("div", _hoisted_19$5, [createBaseVNode("div", {
						class: "ov-fill",
						style: normalizeStyle({ width: pct.value + "%" })
					}, null, 4)]),
					createBaseVNode("div", _hoisted_20$5, toDisplayString(unref(overview).mastered_count) + " / " + toDisplayString(unref(overview).total_cards) + " " + toDisplayString(zh.value ? "张已掌握" : "cards"), 1)
				])) : createCommentVNode("", true)
			]), createBaseVNode("main", _hoisted_21$5, [
				createBaseVNode("section", _hoisted_22$4, [createBaseVNode("div", _hoisted_23$4, [
					createBaseVNode("span", _hoisted_24$4, [_cache[7] || (_cache[7] = createBaseVNode("span", { class: "k-dot" }, null, -1)), createTextVNode(toDisplayString(greeting.value) + " · " + toDisplayString(zh.value ? "学习台" : "Study desk"), 1)]),
					createBaseVNode("h1", _hoisted_25$4, toDisplayString(zh.value ? "把漏洞看懂，而不只是知道名字" : "Understand the flaw, not just its name"), 1),
					createBaseVNode("p", _hoisted_26$4, toDisplayString(totalCards.value) + " " + toDisplayString(zh.value ? "张中英双语卡片 · 329 道自测 · 91 条术语" : "bilingual cards · 329 quizzes · 91 terms"), 1),
					createBaseVNode("div", _hoisted_27$4, [createBaseVNode("button", {
						class: "primary",
						onClick: _cache[2] || (_cache[2] = ($event) => resume())
					}, [createVNode(Icon_default, {
						name: lastCard.value ? "arrow-right" : "book",
						size: 13
					}, null, 8, ["name"]), createTextVNode(" " + toDisplayString(lastCard.value ? (zh.value ? "继续：" : "Resume: ") + titleOf(lastCard.value) : zh.value ? "从第一张开始" : "Start with the first"), 1)]), createBaseVNode("button", { onClick: _cache[3] || (_cache[3] = ($event) => randomCard()) }, [createVNode(Icon_default, {
						name: "sparkles",
						size: 13
					}), createTextVNode(toDisplayString(zh.value ? "随机一张" : "Random"), 1)])])
				]), createBaseVNode("div", _hoisted_28$3, [
					createBaseVNode("div", _hoisted_29$3, [createBaseVNode("span", _hoisted_30$3, toDisplayString(unref(overview)?.mastered_count ?? 0), 1), createBaseVNode("span", _hoisted_31$3, toDisplayString(zh.value ? "已掌握" : "Mastered"), 1)]),
					createBaseVNode("div", _hoisted_32$3, [createBaseVNode("span", _hoisted_33$3, toDisplayString(avgScore.value), 1), createBaseVNode("span", _hoisted_34$3, toDisplayString(zh.value ? "自测均分" : "Avg score"), 1)]),
					createBaseVNode("div", _hoisted_35$3, [createBaseVNode("span", _hoisted_36$3, toDisplayString(noteCount.value), 1), createBaseVNode("span", _hoisted_37$3, toDisplayString(zh.value ? "笔记" : "Notes"), 1)])
				])]),
				createBaseVNode("header", _hoisted_38$3, [
					createBaseVNode("h2", _hoisted_39$2, toDisplayString(unref(lessonFilter).category ? unref(categoryLabel)(unref(lessonFilter).category, zh.value) : zh.value ? "全部教程" : "All lessons"), 1),
					createBaseVNode("span", _hoisted_40$2, toDisplayString(unref(lessons)?.length ?? 0) + " " + toDisplayString(unref(lessonFilter).query ? zh.value ? `个匹配「${unref(lessonFilter).query}」` : `matching "${unref(lessonFilter).query}"` : zh.value ? "个主题" : "topics"), 1),
					_cache[8] || (_cache[8] = createBaseVNode("span", { class: "grow" }, null, -1)),
					unref(lessonFilter).query || unref(lessonFilter).category ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "reset",
						onClick: _cache[4] || (_cache[4] = ($event) => resetFilter())
					}, [createVNode(Icon_default, {
						name: "x",
						size: 11
					}), createTextVNode(toDisplayString(zh.value ? "清除筛选" : "Clear"), 1)])) : createCommentVNode("", true)
				]),
				unref(lessonLoading) ? (openBlock(), createElementBlock("div", _hoisted_41$2, [(openBlock(), createElementBlock(Fragment, null, renderList(9, (i) => {
					return createBaseVNode("div", {
						key: i,
						class: "tile sk"
					}, [..._cache[9] || (_cache[9] = [createStaticVNode("<div class=\"skeleton\" style=\"height:34px;width:34px;border-radius:8px;\" data-v-00b32a92></div><div class=\"sk-lines\" data-v-00b32a92><div class=\"skeleton\" style=\"height:11px;width:78%;\" data-v-00b32a92></div><div class=\"skeleton\" style=\"height:9px;width:96%;\" data-v-00b32a92></div><div class=\"skeleton\" style=\"height:9px;width:64%;\" data-v-00b32a92></div></div>", 2)])]);
				}), 64))])) : !unref(lessons).length ? (openBlock(), createElementBlock("div", _hoisted_42$2, [
					createBaseVNode("div", _hoisted_43$2, [createVNode(Icon_default, {
						name: "search",
						size: 20
					})]),
					createBaseVNode("p", _hoisted_44$2, toDisplayString(unref(lessonFilter).query ? zh.value ? "没有匹配的教程" : "No lessons match" : zh.value ? "该分类下暂无教程" : "No lessons in this category"), 1),
					createBaseVNode("p", _hoisted_45$2, toDisplayString(unref(lessonFilter).query ? zh.value ? `关键词「${unref(lessonFilter).query}」没有命中任何主题` : `"${unref(lessonFilter).query}" matched no topics` : zh.value ? "换一个分类试试" : "Try another category"), 1),
					createBaseVNode("button", {
						class: "empty-btn",
						onClick: _cache[5] || (_cache[5] = ($event) => resetFilter())
					}, toDisplayString(zh.value ? "清除筛选" : "Clear filters"), 1)
				])) : (openBlock(), createElementBlock("div", _hoisted_46$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(lessons), (c) => {
					return openBlock(), createElementBlock("button", {
						key: c.id,
						class: "tile",
						"data-ctx": "tile",
						onClick: ($event) => unref(openLesson)(c.id),
						onContextmenu: ($event) => onTileContext($event, c)
					}, [
						createBaseVNode("div", _hoisted_48$2, [
							createBaseVNode("span", { class: normalizeClass(["tile-icon", "ic-" + c.color]) }, toDisplayString(c.icon), 3),
							createBaseVNode("span", _hoisted_49$2, toDisplayString(titleOf(c)), 1),
							badge(c.id) ? (openBlock(), createElementBlock("span", {
								key: 0,
								class: normalizeClass(["badge", badge(c.id).cls]),
								"aria-label": badge(c.id).label,
								role: "img"
							}, toDisplayString(badge(c.id).text), 11, _hoisted_50$2)) : createCommentVNode("", true)
						]),
						createBaseVNode("p", _hoisted_51$2, toDisplayString(summaryOf(c)), 1),
						createBaseVNode("div", _hoisted_52$2, [
							createBaseVNode("span", _hoisted_53$2, toDisplayString(kindLabel(c.kind)), 1),
							createBaseVNode("span", _hoisted_54$2, toDisplayString(levelLabel(c.level)), 1),
							c.cwe ? (openBlock(), createElementBlock("span", _hoisted_55$1, toDisplayString(c.cwe), 1)) : createCommentVNode("", true),
							c.quiz?.length ? (openBlock(), createElementBlock("span", _hoisted_56$1, toDisplayString(c.quiz.length) + toDisplayString(zh.value ? " 题" : "Q"), 1)) : createCommentVNode("", true),
							createVNode(Icon_default, {
								name: "arrow-right",
								size: 13,
								class: "arrow"
							})
						])
					], 40, _hoisted_47$2);
				}), 128))]))
			])]);
		};
	}
}), [["__scopeId", "data-v-00b32a92"]]);
// src/components/CodeCompare.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$12 = { class: "cmp" };
var _hoisted_2$12 = { class: "cmp-head" };
var _hoisted_3$11 = { class: "cmp-title" };
var _hoisted_4$11 = { class: "cmp-lang mono" };
var _hoisted_5$10 = { class: "cmp-grid" };
var _hoisted_6$10 = { class: "pane bad" };
var _hoisted_7$9 = { class: "pane-head" };
var _hoisted_8$8 = { class: "pane-label" };
var _hoisted_9$8 = { class: "pane good" };
var _hoisted_10$8 = { class: "pane-head" };
var _hoisted_11$7 = { class: "pane-label" };
var _hoisted_12$7 = {
	key: 0,
	class: "cmp-note"
};
// src/components/CodeCompare.vue
var CodeCompare_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "CodeCompare",
	props: {
		block: {},
		index: {}
	},
	setup(__props) {
		const props = __props;
		const copied = /* @__PURE__ */ ref("");
		const label = computed(() => theme.lang === "zh-CN" ? {
			bad: "易受攻击",
			good: "修复后"
		} : {
			bad: "Vulnerable",
			good: "Fixed"
		});
		const langName = computed(() => props.block.lang.toUpperCase());
		const title = computed(() => {
			if (theme.lang === "zh-CN") return props.block.title || langName.value;
			return props.block.title_en || langName.value;
		});
		const note = computed(() => {
			if (theme.lang === "zh-CN") return props.block.note;
			return props.block.note_en || "";
		});
		function onCodeContext(e, code, what) {
			openMenu(e, [
				{
					key: "copy",
					label: `复制${what}代码`,
					hint: "Ctrl+C",
					action: () => copyText(code, what)
				},
				{
					key: "copy-md",
					label: "复制为代码块（含语言标记）",
					action: () => copyText("```" + props.block.lang + "\n" + code + "\n```", what)
				},
				SEP,
				{
					key: "select-all",
					label: "全选这段",
					action: () => {
						const sel = window.getSelection();
						const pre = e.target.closest("pre");
						if (sel && pre) {
							const r = document.createRange();
							r.selectNodeContents(pre);
							sel.removeAllRanges();
							sel.addRange(r);
						}
					}
				}
			]);
		}
		async function copy(text, which) {
			try {
				await navigator.clipboard.writeText(text);
				copied.value = which;
				window.setTimeout(() => copied.value = "", 1400);
			} catch {}
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$12, [
				createBaseVNode("div", _hoisted_2$12, [createBaseVNode("span", _hoisted_3$11, toDisplayString(title.value), 1), createBaseVNode("span", _hoisted_4$11, toDisplayString(langName.value), 1)]),
				createBaseVNode("div", _hoisted_5$10, [createBaseVNode("div", _hoisted_6$10, [createBaseVNode("div", _hoisted_7$9, [
					_cache[4] || (_cache[4] = createBaseVNode("span", { class: "dot" }, null, -1)),
					createBaseVNode("span", _hoisted_8$8, toDisplayString(label.value.bad), 1),
					createBaseVNode("button", {
						class: "copy",
						onClick: _cache[0] || (_cache[0] = ($event) => copy(__props.block.bad, "bad"))
					}, toDisplayString(copied.value === "bad" ? "✓" : "⧉"), 1)
				]), createBaseVNode("pre", {
					class: "code",
					tabindex: "0",
					"data-ctx": "code",
					onContextmenu: _cache[1] || (_cache[1] = ($event) => onCodeContext($event, __props.block.bad, label.value.bad))
				}, [createBaseVNode("code", null, toDisplayString(__props.block.bad), 1)], 32)]), createBaseVNode("div", _hoisted_9$8, [createBaseVNode("div", _hoisted_10$8, [
					_cache[5] || (_cache[5] = createBaseVNode("span", { class: "dot" }, null, -1)),
					createBaseVNode("span", _hoisted_11$7, toDisplayString(label.value.good), 1),
					createBaseVNode("button", {
						class: "copy",
						onClick: _cache[2] || (_cache[2] = ($event) => copy(__props.block.good, "good"))
					}, toDisplayString(copied.value === "good" ? "✓" : "⧉"), 1)
				]), createBaseVNode("pre", {
					class: "code",
					tabindex: "0",
					"data-ctx": "code",
					onContextmenu: _cache[3] || (_cache[3] = ($event) => onCodeContext($event, __props.block.good, label.value.good))
				}, [createBaseVNode("code", null, toDisplayString(__props.block.good), 1)], 32)])]),
				note.value ? (openBlock(), createElementBlock("p", _hoisted_12$7, toDisplayString(note.value), 1)) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-3cfb9cfb"]]);
// src/components/QuizPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$11 = { class: "quiz" };
var _hoisted_2$11 = { class: "qz-head" };
var _hoisted_3$10 = { class: "qz-title" };
var _hoisted_4$10 = { class: "qz-count mono" };
var _hoisted_5$9 = {
	key: 0,
	class: "qz-fallback"
};
var _hoisted_6$9 = {
	key: 1,
	class: "qz-prev"
};
var _hoisted_7$8 = { class: "qz-q" };
var _hoisted_8$7 = { class: "qz-idx mono" };
var _hoisted_9$7 = { class: "qz-opts" };
var _hoisted_10$7 = ["disabled", "onClick"];
var _hoisted_11$6 = { class: "qz-mark mono" };
var _hoisted_12$6 = { class: "qz-text" };
var _hoisted_13$6 = {
	key: 0,
	class: "qz-explain"
};
var _hoisted_14$5 = { class: "qz-foot" };
var _hoisted_15$5 = { class: "qz-progress mono" };
var _hoisted_16$5 = ["disabled"];
var _hoisted_17$5 = { class: "qz-score mono" };
var _hoisted_18$5 = { class: "qz-score-label" };
// src/components/QuizPanel.vue
var QuizPanel_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "QuizPanel",
	props: {
		lessonId: {},
		questions: {},
		savedScore: {}
	},
	setup(__props) {
		const props = __props;
		const picked = /* @__PURE__ */ ref({});
		const submitted = /* @__PURE__ */ ref(false);
		const score = /* @__PURE__ */ ref(null);
		const saving = /* @__PURE__ */ ref(false);
		watch(() => props.lessonId, () => {
			picked.value = {};
			submitted.value = false;
			score.value = null;
			saving.value = false;
		});
		const answered = computed(() => Object.keys(picked.value).length);
		const correctCount = computed(() => props.questions.reduce((n, q, i) => picked.value[i] === q.answer ? n + 1 : n, 0));
		const zh = computed(() => theme.lang === "zh-CN");
		/** 按当前语言取题目字段；英文缺失时回退中文 */
		const qText = (q) => zh.value ? q.q : q.q_en ?? q.q;
		const qOptions = (q) => zh.value ? q.options : q.options_en ?? q.options;
		const qExplain = (q) => zh.value ? q.explain : q.explain_en ?? q.explain;
		/** 英文模式但该题没有英文时，标记出来供 UI 提示 */
		const missingEn = computed(() => !zh.value && props.questions.some((q) => !q.q_en));
		function pick(qi, oi) {
			if (submitted.value) return;
			picked.value = {
				...picked.value,
				[qi]: oi
			};
		}
		async function submit() {
			if (answered.value < props.questions.length) {
				showToast(zh.value ? "还有题目未作答" : "Some questions are unanswered");
				return;
			}
			submitted.value = true;
			score.value = Math.round(correctCount.value / props.questions.length * 100);
			saving.value = true;
			try {
				const wrong = props.questions.map((q, i) => ({
					q,
					i
				})).filter(({ q, i }) => picked.value[i] !== q.answer).map(({ q, i }) => ({
					index: i,
					question: q.q,
					chosen: picked.value[i] ?? -1,
					correct: q.answer,
					explain: q.explain
				}));
				await api.saveQuizResult(props.lessonId, props.questions.length, correctCount.value, wrong);
				if (wrong.length > 0) await refreshWrongCount();
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				saving.value = false;
			}
		}
		function reset() {
			picked.value = {};
			submitted.value = false;
			score.value = null;
		}
		const optClass = (qi, oi) => {
			const q = props.questions[qi];
			if (!submitted.value) return picked.value[qi] === oi ? "picked" : "";
			if (oi === q.answer) return "correct";
			if (picked.value[qi] === oi) return "wrong";
			return "muted";
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("section", _hoisted_1$11, [
				createBaseVNode("header", _hoisted_2$11, [
					createBaseVNode("h2", _hoisted_3$10, [createTextVNode(toDisplayString(zh.value ? "自测" : "Self-check") + " ", 1), createBaseVNode("span", _hoisted_4$10, toDisplayString(__props.questions.length), 1)]),
					missingEn.value ? (openBlock(), createElementBlock("span", _hoisted_5$9, toDisplayString(zh.value ? "" : "Chinese fallback for some questions"), 1)) : createCommentVNode("", true),
					__props.savedScore !== null && __props.savedScore !== void 0 && !submitted.value ? (openBlock(), createElementBlock("span", _hoisted_6$9, toDisplayString(zh.value ? "上次得分" : "Last score") + " " + toDisplayString(__props.savedScore), 1)) : createCommentVNode("", true)
				]),
				(openBlock(true), createElementBlock(Fragment, null, renderList(__props.questions, (q, qi) => {
					return openBlock(), createElementBlock("div", {
						key: qi,
						class: "qz-item"
					}, [
						createBaseVNode("p", _hoisted_7$8, [createBaseVNode("span", _hoisted_8$7, toDisplayString(qi + 1), 1), createTextVNode(toDisplayString(qText(q)), 1)]),
						createBaseVNode("div", _hoisted_9$7, [(openBlock(true), createElementBlock(Fragment, null, renderList(qOptions(q), (o, oi) => {
							return openBlock(), createElementBlock("button", {
								key: oi,
								class: normalizeClass(["qz-opt", optClass(qi, oi)]),
								disabled: submitted.value,
								onClick: ($event) => pick(qi, oi)
							}, [createBaseVNode("span", _hoisted_11$6, toDisplayString(String.fromCharCode(65 + oi)), 1), createBaseVNode("span", _hoisted_12$6, toDisplayString(o), 1)], 10, _hoisted_10$7);
						}), 128))]),
						submitted.value ? (openBlock(), createElementBlock("p", _hoisted_13$6, [createBaseVNode("span", { class: normalizeClass(["qz-tag", picked.value[qi] === q.answer ? "ok" : "no"]) }, toDisplayString(picked.value[qi] === q.answer ? zh.value ? "正确" : "Correct" : zh.value ? "错误" : "Wrong"), 3), createTextVNode(" " + toDisplayString(qExplain(q)), 1)])) : createCommentVNode("", true)
					]);
				}), 128)),
				createBaseVNode("div", _hoisted_14$5, [!submitted.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("span", _hoisted_15$5, toDisplayString(answered.value) + " / " + toDisplayString(__props.questions.length), 1), createBaseVNode("button", {
					class: "primary",
					disabled: saving.value,
					onClick: submit
				}, toDisplayString(zh.value ? "提交答案" : "Submit"), 9, _hoisted_16$5)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createBaseVNode("span", _hoisted_17$5, toDisplayString(score.value), 1),
					createBaseVNode("span", _hoisted_18$5, toDisplayString(zh.value ? "分" : "points") + " · " + toDisplayString(correctCount.value) + " / " + toDisplayString(__props.questions.length), 1),
					createBaseVNode("button", { onClick: reset }, toDisplayString(zh.value ? "再做一次" : "Retry"), 1)
				], 64))])
			]);
		};
	}
}), [["__scopeId", "data-v-c842b271"]]);
// src/components/GlossaryPopover.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$10 = { class: "pop-head" };
var _hoisted_2$10 = { class: "pop-term" };
var _hoisted_3$9 = {
	key: 0,
	class: "pop-en mono"
};
var _hoisted_4$9 = { class: "pop-def" };
var _hoisted_5$8 = {
	key: 0,
	class: "pop-rel"
};
var _hoisted_6$8 = ["onClick"];
// src/components/GlossaryPopover.vue
var GlossaryPopover_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "GlossaryPopover",
	props: {
		term: {},
		x: {},
		y: {}
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const zh = computed(() => theme.lang === "zh-CN");
		const style = computed(() => ({
			left: Math.min(props.x, window.innerWidth - 360) + "px",
			top: Math.min(props.y + 12, window.innerHeight - 220) + "px"
		}));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Teleport, { to: "body" }, [__props.term ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: "mask",
				onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
			})) : createCommentVNode("", true), __props.term ? (openBlock(), createElementBlock("div", {
				key: 1,
				class: "pop",
				style: normalizeStyle(style.value),
				onClick: _cache[2] || (_cache[2] = withModifiers(() => {}, ["stop"]))
			}, [
				createBaseVNode("div", _hoisted_1$10, [
					createBaseVNode("span", _hoisted_2$10, toDisplayString(zh.value ? __props.term.term : __props.term.term_en || __props.term.term), 1),
					__props.term.term_en ? (openBlock(), createElementBlock("span", _hoisted_3$9, toDisplayString(__props.term.term_en), 1)) : createCommentVNode("", true),
					createBaseVNode("button", {
						class: "pop-x",
						onClick: _cache[1] || (_cache[1] = ($event) => emit("close"))
					}, "×")
				]),
				createBaseVNode("p", _hoisted_4$9, toDisplayString(zh.value ? __props.term.definition : __props.term.definition_en || __props.term.definition), 1),
				__props.term.related?.length ? (openBlock(), createElementBlock("div", _hoisted_5$8, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.term.related.slice(0, 3), (r) => {
					return openBlock(), createElementBlock("button", {
						key: r,
						class: "pop-link",
						onClick: ($event) => {
							unref(openLesson)(r);
							emit("close");
						}
					}, toDisplayString(zh.value ? "相关" : "Related") + " → " + toDisplayString(r), 9, _hoisted_6$8);
				}), 128))])) : createCommentVNode("", true)
			], 4)) : createCommentVNode("", true)]);
		};
	}
}), [["__scopeId", "data-v-bd28f6a9"]]);
// src/components/LearnView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$9 = { class: "learn" };
var _hoisted_2$9 = {
	key: 0,
	class: "none"
};
var _hoisted_3$8 = { class: "lh" };
var _hoisted_4$8 = { class: "crumb" };
var _hoisted_5$7 = { class: "crumb-cur" };
var _hoisted_6$7 = { class: "title" };
var _hoisted_7$7 = { class: "summary" };
var _hoisted_8$6 = { class: "meta-line" };
var _hoisted_9$6 = { class: "pill" };
var _hoisted_10$6 = { class: "pill" };
var _hoisted_11$5 = {
	key: 0,
	class: "pill cwe mono"
};
var _hoisted_12$5 = { class: "status-bar" };
var _hoisted_13$5 = {
	key: 0,
	class: "st-done"
};
var _hoisted_14$4 = { class: "real-label" };
var _hoisted_15$4 = { class: "real-n mono" };
var _hoisted_16$4 = { class: "body" };
var _hoisted_17$4 = { class: "sec-h" };
var _hoisted_18$4 = { class: "sec-idx mono" };
var _hoisted_19$4 = { class: "sec-p" };
var _hoisted_20$4 = ["onClick"];
var _hoisted_21$4 = { key: 1 };
var _hoisted_22$3 = { class: "note-sec" };
var _hoisted_23$3 = { class: "sec-h" };
var _hoisted_24$3 = ["placeholder"];
var _hoisted_25$3 = { class: "note-foot" };
var _hoisted_26$3 = {
	key: 0,
	class: "saved"
};
var _hoisted_27$3 = {
	key: 2,
	class: "rel-sec"
};
var _hoisted_28$2 = { class: "sec-h" };
var _hoisted_29$2 = { class: "rel-list" };
var _hoisted_30$2 = ["onClick"];
var _hoisted_31$2 = { class: "rel-title" };
var _hoisted_32$2 = {
	key: 3,
	class: "refs"
};
var _hoisted_33$2 = { class: "sec-h" };
var _hoisted_34$2 = { class: "ref-list" };
var _hoisted_35$2 = ["onClick"];
var _hoisted_36$2 = { class: "ref-name" };
var _hoisted_37$2 = { class: "ref-url mono" };
var _hoisted_38$2 = { class: "ref-note" };
// src/components/LearnView.vue
var LearnView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "LearnView",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const related = /* @__PURE__ */ ref([]);
		const noteBody = /* @__PURE__ */ ref("");
		const noteSaved = /* @__PURE__ */ ref(false);
		const popTerm = /* @__PURE__ */ ref(null);
		const popPos = /* @__PURE__ */ ref({
			x: 0,
			y: 0
		});
		const levelLabel = (lv) => zh.value ? {
			beginner: "入门",
			intermediate: "进阶",
			advanced: "深入"
		}[lv ?? ""] ?? lv : {
			beginner: "Beginner",
			intermediate: "Intermediate",
			advanced: "Advanced"
		}[lv ?? ""] ?? lv;
		const kindLabel = (k) => zh.value ? {
			cwe: "缺陷类型",
			lesson: "方法论",
			lab: "实战实验"
		}[k ?? ""] ?? k : {
			cwe: "Weakness",
			lesson: "Method",
			lab: "Lab"
		}[k ?? ""] ?? k;
		function isKey(h) {
			return /解决办法|修复|落地|配置|加固/.test(h);
		}
		/** 把正文切成可点击术语的分段（computed 保证 glossary 加载后自动刷新） */
		const segCache = computed(() => {
			const m = /* @__PURE__ */ new Map();
			if (!activeLesson.value) return m;
			for (const s of activeLesson.value.sections) m.set(s.p, matchTerms(s.p));
			return m;
		});
		const segs = (text) => segCache.value.get(text) ?? [{ text }];
		function openRelated(id) {
			openLesson(id);
		}
		function onTermClick(e, term) {
			e.preventDefault();
			popPos.value = {
				x: e.clientX - 40,
				y: e.clientY
			};
			popTerm.value = term;
		}
		async function loadRelated(id) {
			try {
				related.value = await api.relatedLessons(id);
			} catch {
				related.value = [];
			}
		}
		const curStatus = computed(() => activeLesson.value ? statusOf(activeLesson.value.id) : "unread");
		async function mark(status) {
			if (!activeLesson.value) return;
			await setLessonStatus(activeLesson.value.id, status);
		}
		async function saveNote() {
			if (!activeLesson.value) return;
			try {
				await api.saveLessonNote(activeLesson.value.id, noteBody.value);
				noteSaved.value = true;
				window.setTimeout(() => noteSaved.value = false, 1800);
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		watch(activeLesson, async (v) => {
			if (!v) return;
			noteBody.value = progressOf(v.id)?.note ?? "";
			const tasks = [loadRelated(v.id)];
			if (statusOf(v.id) === "unread") tasks.push(setLessonStatus(v.id, "reading"));
			await Promise.allSettled(tasks);
		}, { immediate: true });
		onMounted(() => {
			if (activeLesson.value) noteBody.value = progressOf(activeLesson.value.id)?.note ?? "";
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$9, [!unref(activeLesson) ? (openBlock(), createElementBlock("div", _hoisted_2$9, toDisplayString(zh.value ? "未选择教学卡" : "No lesson selected"), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
				createBaseVNode("header", _hoisted_3$8, [
					createBaseVNode("div", _hoisted_4$8, [
						createBaseVNode("button", {
							class: "crumb-btn",
							onClick: _cache[0] || (_cache[0] = ($event) => unref(goHome)())
						}, "← " + toDisplayString(zh.value ? "全部教程" : "All lessons"), 1),
						_cache[6] || (_cache[6] = createBaseVNode("span", { class: "sep" }, "/", -1)),
						createBaseVNode("span", _hoisted_5$7, toDisplayString(unref(categoryLabel)(unref(activeLesson).category, zh.value)), 1)
					]),
					createBaseVNode("h1", _hoisted_6$7, [createBaseVNode("span", { class: normalizeClass(["icon", "ic-" + unref(activeLesson).color]) }, toDisplayString(unref(activeLesson).icon), 3), createBaseVNode("span", null, toDisplayString(zh.value ? unref(activeLesson).title : unref(activeLesson).title_en || unref(activeLesson).title), 1)]),
					createBaseVNode("p", _hoisted_7$7, toDisplayString(zh.value ? unref(activeLesson).summary : unref(activeLesson).summary_en || unref(activeLesson).summary), 1),
					createBaseVNode("div", _hoisted_8$6, [
						createBaseVNode("span", _hoisted_9$6, toDisplayString(kindLabel(unref(activeLesson).kind)), 1),
						createBaseVNode("span", _hoisted_10$6, toDisplayString(levelLabel(unref(activeLesson).level)), 1),
						unref(activeLesson).cwe ? (openBlock(), createElementBlock("span", _hoisted_11$5, toDisplayString(unref(activeLesson).cwe), 1)) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(unref(activeLesson).tags, (tg) => {
							return openBlock(), createElementBlock("span", {
								key: tg,
								class: "pill tag"
							}, "#" + toDisplayString(unref(tagLabel)(tg, zh.value)), 1);
						}), 128))
					]),
					createBaseVNode("div", _hoisted_12$5, [
						createBaseVNode("button", {
							class: normalizeClass(["st", { on: curStatus.value === "reading" }]),
							onClick: _cache[1] || (_cache[1] = ($event) => mark("reading"))
						}, toDisplayString(zh.value ? "学习中" : "In progress"), 3),
						createBaseVNode("button", {
							class: normalizeClass(["st", { on: curStatus.value === "mastered" }]),
							onClick: _cache[2] || (_cache[2] = ($event) => mark("mastered"))
						}, toDisplayString(zh.value ? "标记掌握" : "Mark mastered"), 3),
						curStatus.value === "mastered" ? (openBlock(), createElementBlock("span", _hoisted_13$5, "✓ " + toDisplayString(zh.value ? "已掌握" : "Mastered"), 1)) : createCommentVNode("", true)
					])
				]),
				unref(activeLesson).cwe ? (openBlock(), createElementBlock("button", {
					key: 0,
					class: "real-entry",
					onClick: _cache[3] || (_cache[3] = ($event) => unref(jumpToCwe)(unref(activeLesson).cwe))
				}, [
					createBaseVNode("span", _hoisted_14$4, toDisplayString(zh.value ? "本地情报库中该类型的真实漏洞" : "Real findings of this type in your local DB"), 1),
					createBaseVNode("span", _hoisted_15$4, toDisplayString(unref(lessonCveCount)), 1),
					_cache[7] || (_cache[7] = createBaseVNode("span", { class: "real-arrow" }, "→", -1))
				])) : createCommentVNode("", true),
				createBaseVNode("article", _hoisted_16$4, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(activeLesson).sections, (s, i) => {
					return openBlock(), createElementBlock("section", {
						key: i,
						class: normalizeClass(["sec", { key: isKey(s.h) }])
					}, [
						createBaseVNode("h2", _hoisted_17$4, [createBaseVNode("span", _hoisted_18$4, toDisplayString(String(i + 1).padStart(2, "0")), 1), createTextVNode(" " + toDisplayString(zh.value ? s.h : s.h_en ?? s.h), 1)]),
						createBaseVNode("p", _hoisted_19$4, [(openBlock(true), createElementBlock(Fragment, null, renderList(segs(zh.value ? s.p : s.p_en ?? s.p), (sg, si) => {
							return openBlock(), createElementBlock(Fragment, { key: si }, [sg.term ? (openBlock(), createElementBlock("span", {
								key: 0,
								class: "term",
								onClick: ($event) => onTermClick($event, sg.term)
							}, toDisplayString(sg.text), 9, _hoisted_20$4)) : (openBlock(), createElementBlock("span", _hoisted_21$4, toDisplayString(sg.text), 1))], 64);
						}), 128))]),
						(openBlock(true), createElementBlock(Fragment, null, renderList(s.code || [], (cb, ci) => {
							return openBlock(), createBlock(CodeCompare_default, {
								key: ci,
								block: cb,
								index: ci
							}, null, 8, ["block", "index"]);
						}), 128))
					], 2);
				}), 128))]),
				unref(activeLesson).quiz && unref(activeLesson).quiz.length ? (openBlock(), createBlock(QuizPanel_default, {
					key: unref(activeLesson).id,
					"lesson-id": unref(activeLesson).id,
					questions: unref(activeLesson).quiz,
					"saved-score": unref(progressOf)(unref(activeLesson).id)?.quiz_score ?? null
				}, null, 8, [
					"lesson-id",
					"questions",
					"saved-score"
				])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_22$3, [
					createBaseVNode("h2", _hoisted_23$3, [_cache[8] || (_cache[8] = createBaseVNode("span", { class: "sec-idx mono" }, "NOTE", -1)), createTextVNode(toDisplayString(zh.value ? "学习笔记" : "My notes"), 1)]),
					withDirectives(createBaseVNode("textarea", {
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => noteBody.value = $event),
						class: "note",
						rows: "3",
						placeholder: zh.value ? "记录你的理解与疑问（仅存本机）" : "Your takeaways and open questions (local only)"
					}, null, 8, _hoisted_24$3), [[vModelText, noteBody.value]]),
					createBaseVNode("div", _hoisted_25$3, [createBaseVNode("button", { onClick: saveNote }, toDisplayString(zh.value ? "保存" : "Save"), 1), noteSaved.value ? (openBlock(), createElementBlock("span", _hoisted_26$3, "✓ " + toDisplayString(zh.value ? "已保存" : "Saved"), 1)) : createCommentVNode("", true)])
				]),
				related.value.length ? (openBlock(), createElementBlock("section", _hoisted_27$3, [createBaseVNode("h2", _hoisted_28$2, [_cache[9] || (_cache[9] = createBaseVNode("span", { class: "sec-idx mono" }, "NEXT", -1)), createTextVNode(toDisplayString(zh.value ? "接着看" : "Continue with"), 1)]), createBaseVNode("div", _hoisted_29$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(related.value, (r) => {
					return openBlock(), createElementBlock("button", {
						key: r.id,
						class: "rel",
						onClick: ($event) => openRelated(r.id)
					}, [
						createBaseVNode("span", { class: normalizeClass(["rel-ic", "ic-" + r.color]) }, toDisplayString(r.icon), 3),
						createBaseVNode("span", _hoisted_31$2, toDisplayString(zh.value ? r.title : r.title_en || r.title), 1),
						_cache[10] || (_cache[10] = createBaseVNode("span", { class: "rel-arrow" }, "→", -1))
					], 8, _hoisted_30$2);
				}), 128))])])) : createCommentVNode("", true),
				unref(activeLesson).refs.length ? (openBlock(), createElementBlock("section", _hoisted_32$2, [
					createBaseVNode("h2", _hoisted_33$2, [_cache[11] || (_cache[11] = createBaseVNode("span", { class: "sec-idx mono" }, "REF", -1)), createTextVNode(toDisplayString(zh.value ? "参考来源" : "References"), 1)]),
					createBaseVNode("div", _hoisted_34$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(activeLesson).refs, (r) => {
						return openBlock(), createElementBlock("button", {
							key: r.url,
							class: "ref",
							onClick: ($event) => unref(openUrl)(r.url).catch((e) => unref(showToast)(unref(errMsg)(e)))
						}, [createBaseVNode("span", _hoisted_36$2, toDisplayString(r.name), 1), createBaseVNode("span", _hoisted_37$2, toDisplayString(r.url), 1)], 8, _hoisted_35$2);
					}), 128))]),
					createBaseVNode("p", _hoisted_38$2, toDisplayString(zh.value ? "正文为本项目根据上述公开来源自行撰写，非原文转载。" : "Body text is original work based on the public sources above, not a reproduction."), 1)
				])) : createCommentVNode("", true)
			], 64)), createVNode(GlossaryPopover_default, {
				term: popTerm.value,
				x: popPos.value.x,
				y: popPos.value.y,
				onClose: _cache[5] || (_cache[5] = ($event) => popTerm.value = null)
			}, null, 8, [
				"term",
				"x",
				"y"
			])]);
		};
	}
}), [["__scopeId", "data-v-c8fdcdce"]]);
// src/components/PathView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$8 = { class: "paths" };
var _hoisted_2$8 = { class: "pv-top" };
var _hoisted_3$7 = { class: "pv-title" };
var _hoisted_4$7 = { class: "pv-sub" };
var _hoisted_5$6 = ["disabled"];
var _hoisted_6$6 = { class: "pv-list" };
var _hoisted_7$6 = { class: "pv-head" };
var _hoisted_8$5 = { class: "pv-head-main" };
var _hoisted_9$5 = { class: "pv-name" };
var _hoisted_10$5 = { class: "pv-meta mono" };
var _hoisted_11$4 = ["onClick"];
var _hoisted_12$4 = {
	key: 1,
	class: "pv-done"
};
var _hoisted_13$4 = { class: "pv-desc" };
var _hoisted_14$3 = { class: "pv-bar" };
var _hoisted_15$3 = { class: "pv-pct mono" };
var _hoisted_16$3 = { class: "pv-steps" };
var _hoisted_17$3 = ["onClick"];
var _hoisted_18$3 = { class: "pv-idx mono" };
var _hoisted_19$3 = { class: "pv-step-title" };
var _hoisted_20$3 = {
	key: 0,
	class: "pv-check"
};
var _hoisted_21$3 = {
	key: 1,
	class: "pv-reading"
};
// src/components/PathView.vue
var PathView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "PathView",
	props: {
		paths: {},
		cards: {},
		progress: {}
	},
	setup(__props) {
		const props = __props;
		/** 导出学习报告：掌握情况 + 自测成绩 + 薄弱项 + 笔记 */
		const exporting = /* @__PURE__ */ ref(false);
		async function exportReport() {
			if (exporting.value) return;
			exporting.value = true;
			try {
				const name = `sentrydesk-学习报告-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
				const saved = await api.exportLearnReport(name);
				showToast((zh.value ? "已导出 → " : "Exported → ") + saved);
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				exporting.value = false;
			}
		}
		const zh = computed(() => theme.lang === "zh-CN");
		const titleOf = (p) => zh.value ? p.title : p.title_en || p.title;
		const descOf = (p) => zh.value ? p.desc : p.desc_en || p.desc;
		function cardOf(id) {
			return props.cards.find((c) => c.id === id);
		}
		function statusOf(id) {
			return props.progress.find((p) => p.lesson_id === id)?.status ?? "unread";
		}
		function doneCount(p) {
			return p.steps.filter((s) => statusOf(s) === "mastered").length;
		}
		function pct(p) {
			return p.steps.length ? Math.round(doneCount(p) / p.steps.length * 100) : 0;
		}
		/** 找到第一个未掌握的卡，作为「继续」入口 */
		function nextId(p) {
			return p.steps.find((s) => statusOf(s) !== "mastered") ?? null;
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$8, [createBaseVNode("div", _hoisted_2$8, [createBaseVNode("div", null, [createBaseVNode("h1", _hoisted_3$7, toDisplayString(zh.value ? "学习路径" : "Learning paths"), 1), createBaseVNode("p", _hoisted_4$7, toDisplayString(zh.value ? "按推荐顺序学习，每完成一张卡可标记掌握。" : "Follow the suggested order; mark a card mastered when done."), 1)]), createBaseVNode("button", {
				class: "pv-export",
				disabled: exporting.value,
				onClick: exportReport
			}, toDisplayString(exporting.value ? "…" : zh.value ? "导出学习报告" : "Export report"), 9, _hoisted_5$6)]), createBaseVNode("div", _hoisted_6$6, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.paths, (p) => {
				return openBlock(), createElementBlock("section", {
					key: p.id,
					class: "pv-card"
				}, [
					createBaseVNode("header", _hoisted_7$6, [createBaseVNode("div", _hoisted_8$5, [createBaseVNode("h2", _hoisted_9$5, toDisplayString(titleOf(p)), 1), createBaseVNode("span", _hoisted_10$5, toDisplayString(p.steps.length) + " " + toDisplayString(zh.value ? "步" : "steps") + " · " + toDisplayString(p.minutes) + " min ", 1)]), nextId(p) ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "pv-go",
						onClick: ($event) => unref(openLesson)(nextId(p))
					}, toDisplayString(doneCount(p) ? zh.value ? "继续" : "Continue" : zh.value ? "开始" : "Start") + " →", 9, _hoisted_11$4)) : (openBlock(), createElementBlock("span", _hoisted_12$4, "✓ " + toDisplayString(zh.value ? "已完成" : "Completed"), 1))]),
					createBaseVNode("p", _hoisted_13$4, toDisplayString(descOf(p)), 1),
					createBaseVNode("div", _hoisted_14$3, [createBaseVNode("div", {
						class: "pv-bar-fill",
						style: normalizeStyle({ width: pct(p) + "%" })
					}, null, 4)]),
					createBaseVNode("span", _hoisted_15$3, toDisplayString(doneCount(p)) + " / " + toDisplayString(p.steps.length) + " · " + toDisplayString(pct(p)) + "%", 1),
					createBaseVNode("ol", _hoisted_16$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(p.steps, (s, i) => {
						return openBlock(), createElementBlock("li", {
							key: s,
							class: normalizeClass(["pv-step", statusOf(s)]),
							onClick: ($event) => unref(openLesson)(s)
						}, [
							createBaseVNode("span", _hoisted_18$3, toDisplayString(String(i + 1).padStart(2, "0")), 1),
							createBaseVNode("span", _hoisted_19$3, toDisplayString(cardOf(s)?.title ?? s), 1),
							statusOf(s) === "mastered" ? (openBlock(), createElementBlock("span", _hoisted_20$3, "✓")) : statusOf(s) === "reading" ? (openBlock(), createElementBlock("span", _hoisted_21$3, toDisplayString(zh.value ? "学习中" : "In progress"), 1)) : createCommentVNode("", true)
						], 10, _hoisted_17$3);
					}), 128))])
				]);
			}), 128))])]);
		};
	}
}), [["__scopeId", "data-v-352b46df"]]);
// src/components/DashboardView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$7 = { class: "dash" };
var _hoisted_2$7 = { class: "dh" };
var _hoisted_3$6 = { class: "dh-title" };
var _hoisted_4$6 = { class: "dh-sub" };
var _hoisted_5$5 = { class: "dh-actions" };
var _hoisted_6$5 = { value: 7 };
var _hoisted_7$5 = { value: 30 };
var _hoisted_8$4 = { value: 90 };
var _hoisted_9$4 = {
	key: 0,
	class: "kpis"
};
var _hoisted_10$4 = { class: "kpi" };
var _hoisted_11$3 = { class: "kpi-v mono" };
var _hoisted_12$3 = { class: "kpi-k" };
var _hoisted_13$3 = { class: "kpi" };
var _hoisted_14$2 = { class: "kpi-v mono" };
var _hoisted_15$2 = { class: "kpi-k" };
var _hoisted_16$2 = { class: "kpi" };
var _hoisted_17$2 = { class: "kpi-v mono danger" };
var _hoisted_18$2 = { class: "kpi-k" };
var _hoisted_19$2 = { class: "kpi" };
var _hoisted_20$2 = { class: "kpi-v mono" };
var _hoisted_21$2 = { class: "kpi-k" };
var _hoisted_22$2 = { class: "kpi" };
var _hoisted_23$2 = { class: "kpi-k" };
var _hoisted_24$2 = { class: "charts" };
var _hoisted_25$2 = { class: "tabs" };
var _hoisted_26$2 = ["onClick"];
var _hoisted_27$2 = {
	key: 0,
	class: "loading"
};
var _hoisted_28$1 = {
	key: 1,
	class: "chart-box"
};
var _hoisted_29$1 = { class: "bars" };
var _hoisted_30$1 = ["title"];
var _hoisted_31$1 = { class: "axis" };
var _hoisted_32$1 = { class: "chart-note" };
var _hoisted_33$1 = {
	key: 2,
	class: "chart-box"
};
var _hoisted_34$1 = { class: "hl" };
var _hoisted_35$1 = { class: "hbar" };
var _hoisted_36$1 = { class: "hv mono" };
var _hoisted_37$1 = { class: "hp mono" };
var _hoisted_38$1 = {
	key: 3,
	class: "chart-box"
};
var _hoisted_39$1 = { class: "hl w2" };
var _hoisted_40$1 = { class: "hbar" };
var _hoisted_41$1 = { class: "hv mono" };
var _hoisted_42$1 = { class: "hp mono" };
var _hoisted_43$1 = {
	key: 4,
	class: "chart-box"
};
var _hoisted_44$1 = {
	key: 0,
	class: "empty"
};
var _hoisted_45$1 = ["title"];
var _hoisted_46$1 = { class: "hbar" };
var _hoisted_47$1 = { class: "hv mono" };
var _hoisted_48$1 = {
	key: 5,
	class: "chart-box"
};
var _hoisted_49$1 = {
	key: 0,
	class: "empty"
};
var _hoisted_50$1 = ["onClick"];
var _hoisted_51$1 = { class: "hl mono w1" };
var _hoisted_52$1 = { class: "hbar" };
var _hoisted_53$1 = { class: "hv mono" };
var _hoisted_54$1 = { class: "foot-note" };
// src/components/DashboardView.vue
var DashboardView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "DashboardView",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const data = /* @__PURE__ */ ref(null);
		const loading = /* @__PURE__ */ ref(true);
		const range = /* @__PURE__ */ ref(30);
		const tab = /* @__PURE__ */ ref("trend");
		async function load() {
			loading.value = true;
			try {
				data.value = await api.dashboard(range.value);
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				loading.value = false;
			}
		}
		onMounted(load);
		/** 趋势图：把 daily 补全为连续日期 */
		const trend = computed(() => {
			if (!data.value) return [];
			const map = new Map(data.value.daily.map((d) => [d.date, d.count]));
			const out = [];
			const today = /* @__PURE__ */ new Date();
			for (let i = range.value - 1; i >= 0; i--) {
				const d = new Date(today);
				d.setDate(d.getDate() - i);
				const key = d.toISOString().slice(0, 10);
				out.push({
					date: key,
					count: map.get(key) ?? 0
				});
			}
			return out;
		});
		const maxDaily = computed(() => Math.max(1, ...trend.value.map((d) => d.count)));
		/** 严重等级：按固定顺序 + 占比 */
		const sevOrder = [
			"CRITICAL",
			"HIGH",
			"MEDIUM",
			"LOW",
			"UNKNOWN"
		];
		const sevData = computed(() => {
			if (!data.value) return [];
			const map = new Map(data.value.severity.map((s) => [s.severity, s.count]));
			const total = data.value.total || 1;
			return sevOrder.map((k) => ({
				key: k,
				count: map.get(k) ?? 0,
				pct: Math.round((map.get(k) ?? 0) / total * 100)
			}));
		});
		const sevLabel = (k) => zh.value ? {
			CRITICAL: "严重",
			HIGH: "高危",
			MEDIUM: "中危",
			LOW: "低危",
			UNKNOWN: "未评级"
		}[k] ?? k : {
			CRITICAL: "Critical",
			HIGH: "High",
			MEDIUM: "Medium",
			LOW: "Low",
			UNKNOWN: "Unrated"
		}[k] ?? k;
		const sourceData = computed(() => {
			if (!data.value) return [];
			const total = data.value.sources.reduce((a, b) => a + b.count, 0) || 1;
			return data.value.sources.map((s) => ({
				...s,
				pct: Math.round(s.count / total * 100)
			}));
		});
		const maxProduct = computed(() => Math.max(1, ...data.value?.top_products.map((p) => p.count) ?? [1]));
		const maxCwe = computed(() => Math.max(1, ...data.value?.top_cwe.map((p) => p.count) ?? [1]));
		const kevPct = computed(() => {
			if (!data.value?.total) return 0;
			return Math.round(data.value.kev_count / data.value.total * 100);
		});
		const ratedPct = computed(() => {
			if (!data.value?.total) return 0;
			return Math.round(data.value.rated_count / data.value.total * 100);
		});
		const tabs = computed(() => [
			{
				k: "trend",
				label: zh.value ? "时间趋势" : "Trend"
			},
			{
				k: "severity",
				label: zh.value ? "严重分级" : "Severity"
			},
			{
				k: "source",
				label: zh.value ? "来源占比" : "Sources"
			},
			{
				k: "product",
				label: zh.value ? "受影响产品" : "Products"
			},
			{
				k: "cwe",
				label: zh.value ? "缺陷类型" : "CWE"
			}
		]);
		function pickCwe(cwe) {
			jumpToCwe(cwe);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$7, [
				createBaseVNode("header", _hoisted_2$7, [createBaseVNode("div", null, [createBaseVNode("h1", _hoisted_3$6, toDisplayString(zh.value ? "数据看板" : "Dashboard"), 1), createBaseVNode("p", _hoisted_4$6, toDisplayString(zh.value ? "本地情报库的分布与趋势，全部数据来自本机" : "Distribution and trends from your local database"), 1)]), createBaseVNode("div", _hoisted_5$5, [withDirectives(createBaseVNode("select", {
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => range.value = $event),
					onChange: load
				}, [
					createBaseVNode("option", _hoisted_6$5, toDisplayString(zh.value ? "近 7 天" : "7 days"), 1),
					createBaseVNode("option", _hoisted_7$5, toDisplayString(zh.value ? "近 30 天" : "30 days"), 1),
					createBaseVNode("option", _hoisted_8$4, toDisplayString(zh.value ? "近 90 天" : "90 days"), 1)
				], 544), [[
					vModelSelect,
					range.value,
					void 0,
					{ number: true }
				]]), createBaseVNode("button", { onClick: load }, toDisplayString(zh.value ? "刷新" : "Refresh"), 1)])]),
				data.value ? (openBlock(), createElementBlock("section", _hoisted_9$4, [
					createBaseVNode("div", _hoisted_10$4, [createBaseVNode("span", _hoisted_11$3, toDisplayString(data.value.total), 1), createBaseVNode("span", _hoisted_12$3, toDisplayString(zh.value ? "情报总数" : "Total items"), 1)]),
					createBaseVNode("div", _hoisted_13$3, [createBaseVNode("span", _hoisted_14$2, toDisplayString(data.value.recent_30d), 1), createBaseVNode("span", _hoisted_15$2, toDisplayString(zh.value ? "近 30 天新增" : "Added in 30d"), 1)]),
					createBaseVNode("div", _hoisted_16$2, [createBaseVNode("span", _hoisted_17$2, toDisplayString(data.value.kev_count), 1), createBaseVNode("span", _hoisted_18$2, toDisplayString(zh.value ? "在野利用" : "Known exploited") + " · " + toDisplayString(kevPct.value) + "%", 1)]),
					createBaseVNode("div", _hoisted_19$2, [createBaseVNode("span", _hoisted_20$2, toDisplayString(ratedPct.value) + "%", 1), createBaseVNode("span", _hoisted_21$2, toDisplayString(zh.value ? "已有 CVSS 评分" : "Rated"), 1)]),
					createBaseVNode("div", _hoisted_22$2, [createBaseVNode("span", { class: normalizeClass(["kpi-v mono", data.value.collect_fail > 0 ? "warn" : "ok"]) }, toDisplayString(data.value.collect_ok) + "/" + toDisplayString(data.value.collect_ok + data.value.collect_fail), 3), createBaseVNode("span", _hoisted_23$2, toDisplayString(zh.value ? "近 7 天采集成功率" : "Collect success 7d"), 1)])
				])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_24$2, [createBaseVNode("nav", _hoisted_25$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(tabs.value, (t) => {
					return openBlock(), createElementBlock("button", {
						key: t.k,
						class: normalizeClass(["tb", { active: tab.value === t.k }]),
						onClick: ($event) => tab.value = t.k
					}, toDisplayString(t.label), 11, _hoisted_26$2);
				}), 128))]), loading.value ? (openBlock(), createElementBlock("div", _hoisted_27$2, [..._cache[1] || (_cache[1] = [createBaseVNode("div", {
					class: "skeleton",
					style: {
						"height": "220px",
						"width": "100%"
					}
				}, null, -1)])])) : tab.value === "trend" ? (openBlock(), createElementBlock("div", _hoisted_28$1, [
					createBaseVNode("div", _hoisted_29$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(trend.value, (d, i) => {
						return openBlock(), createElementBlock("div", {
							key: i,
							class: "bar-wrap",
							title: d.date + " · " + d.count
						}, [createBaseVNode("div", {
							class: "bar",
							style: normalizeStyle({ height: d.count / maxDaily.value * 100 + "%" })
						}, null, 4)], 8, _hoisted_30$1);
					}), 128))]),
					createBaseVNode("div", _hoisted_31$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(trend.value, (d, i) => {
						return openBlock(), createElementBlock("span", {
							key: i,
							class: "axis-l"
						}, [i % Math.ceil(trend.value.length / 6) === 0 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(d.date.slice(5)), 1)], 64)) : createCommentVNode("", true)]);
					}), 128))]),
					createBaseVNode("p", _hoisted_32$1, toDisplayString(zh.value ? "纵轴为当日新增条目数" : "Bars show items added per day") + " · 峰值 " + toDisplayString(maxDaily.value), 1)
				])) : tab.value === "severity" ? (openBlock(), createElementBlock("div", _hoisted_33$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(sevData.value, (s) => {
					return openBlock(), createElementBlock("div", {
						key: s.key,
						class: "hrow"
					}, [
						createBaseVNode("span", { class: normalizeClass(["sev-dot", "sev-" + s.key]) }, null, 2),
						createBaseVNode("span", _hoisted_34$1, toDisplayString(sevLabel(s.key)), 1),
						createBaseVNode("div", _hoisted_35$1, [createBaseVNode("div", {
							class: normalizeClass(["hfill", "f-" + s.key]),
							style: normalizeStyle({ width: s.pct + "%" })
						}, null, 6)]),
						createBaseVNode("span", _hoisted_36$1, toDisplayString(s.count), 1),
						createBaseVNode("span", _hoisted_37$1, toDisplayString(s.pct) + "%", 1)
					]);
				}), 128))])) : tab.value === "source" ? (openBlock(), createElementBlock("div", _hoisted_38$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(sourceData.value, (s) => {
					return openBlock(), createElementBlock("div", {
						key: s.source_key,
						class: "hrow"
					}, [
						createBaseVNode("span", _hoisted_39$1, toDisplayString(s.name), 1),
						createBaseVNode("div", _hoisted_40$1, [createBaseVNode("div", {
							class: "hfill f-src",
							style: normalizeStyle({ width: s.pct + "%" })
						}, null, 4)]),
						createBaseVNode("span", _hoisted_41$1, toDisplayString(s.count), 1),
						createBaseVNode("span", _hoisted_42$1, toDisplayString(s.pct) + "%", 1)
					]);
				}), 128))])) : tab.value === "product" ? (openBlock(), createElementBlock("div", _hoisted_43$1, [!data.value?.top_products.length ? (openBlock(), createElementBlock("div", _hoisted_44$1, toDisplayString(zh.value ? "暂无产品数据" : "No product data"), 1)) : createCommentVNode("", true), (openBlock(true), createElementBlock(Fragment, null, renderList(data.value?.top_products, (p) => {
					return openBlock(), createElementBlock("div", {
						key: p.key,
						class: "hrow"
					}, [
						createBaseVNode("span", {
							class: "hl w3",
							title: p.key
						}, toDisplayString(p.key), 9, _hoisted_45$1),
						createBaseVNode("div", _hoisted_46$1, [createBaseVNode("div", {
							class: "hfill f-prod",
							style: normalizeStyle({ width: p.count / maxProduct.value * 100 + "%" })
						}, null, 4)]),
						createBaseVNode("span", _hoisted_47$1, toDisplayString(p.count), 1)
					]);
				}), 128))])) : tab.value === "cwe" ? (openBlock(), createElementBlock("div", _hoisted_48$1, [!data.value?.top_cwe.length ? (openBlock(), createElementBlock("div", _hoisted_49$1, toDisplayString(zh.value ? "暂无 CWE 数据" : "No CWE data"), 1)) : createCommentVNode("", true), (openBlock(true), createElementBlock(Fragment, null, renderList(data.value?.top_cwe, (c) => {
					return openBlock(), createElementBlock("button", {
						key: c.key,
						class: "hrow clickable",
						onClick: ($event) => pickCwe(c.key)
					}, [
						createBaseVNode("span", _hoisted_51$1, toDisplayString(c.key), 1),
						createBaseVNode("div", _hoisted_52$1, [createBaseVNode("div", {
							class: "hfill f-cwe",
							style: normalizeStyle({ width: c.count / maxCwe.value * 100 + "%" })
						}, null, 4)]),
						createBaseVNode("span", _hoisted_53$1, toDisplayString(c.count), 1)
					], 8, _hoisted_50$1);
				}), 128))])) : createCommentVNode("", true)]),
				createBaseVNode("p", _hoisted_54$1, toDisplayString(zh.value ? "所有图表由本地 SQLite 实时聚合生成，无外部图表库、无网络请求。" : "All charts are aggregated locally from SQLite. No chart library, no network calls."), 1)
			]);
		};
	}
}), [["__scopeId", "data-v-b43f380f"]]);
// src/components/WrongView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$6 = { class: "wrong" };
var _hoisted_2$6 = { class: "wh" };
var _hoisted_3$5 = { class: "wh-title" };
var _hoisted_4$5 = { class: "wh-sub" };
var _hoisted_5$4 = { class: "wh-actions" };
var _hoisted_6$4 = { class: "chk" };
var _hoisted_7$4 = { class: "badge mono" };
var _hoisted_8$3 = {
	key: 0,
	class: "skeleton",
	style: { "height": "200px" }
};
var _hoisted_9$3 = {
	key: 1,
	class: "empty"
};
var _hoisted_10$3 = { class: "e-t" };
var _hoisted_11$2 = { class: "e-h" };
var _hoisted_12$2 = {
	key: 2,
	class: "list"
};
var _hoisted_13$2 = { class: "wa-head" };
var _hoisted_14$1 = { class: "wa-q" };
var _hoisted_15$1 = {
	key: 0,
	class: "wa-times mono"
};
var _hoisted_16$1 = { class: "wa-opts" };
var _hoisted_17$1 = { class: "wa-opt wrong" };
var _hoisted_18$1 = { class: "wa-l mono" };
var _hoisted_19$1 = { class: "wa-t" };
var _hoisted_20$1 = { class: "wa-opt right" };
var _hoisted_21$1 = { class: "wa-l mono" };
var _hoisted_22$1 = { class: "wa-t" };
var _hoisted_23$1 = {
	key: 0,
	class: "wa-explain"
};
var _hoisted_24$1 = { class: "wa-foot" };
var _hoisted_25$1 = ["onClick"];
var _hoisted_26$1 = ["onClick"];
var _hoisted_27$1 = {
	key: 1,
	class: "wa-done"
};
// src/components/WrongView.vue
var WrongView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "WrongView",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const list = /* @__PURE__ */ ref([]);
		const loading = /* @__PURE__ */ ref(true);
		const showReviewed = /* @__PURE__ */ ref(false);
		async function load() {
			loading.value = true;
			try {
				list.value = await api.listWrongAnswers(showReviewed.value);
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				loading.value = false;
			}
		}
		onMounted(async () => {
			if (!allLessons.value.length) try {
				await loadLessons();
			} catch {}
			await load();
		});
		async function markDone(w) {
			try {
				await api.markWrongReviewed(w.lesson_id, w.quiz_index);
				await Promise.all([load(), refreshWrongCount()]);
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		const pending = computed(() => list.value.filter((x) => !x.reviewed).length);
		const letter = (i) => String.fromCharCode(65 + i);
		/** 知识库索引：按 lesson_id 取卡片，再按 quiz_index 取题目 */
		const lessonMap = computed(() => {
			const m = /* @__PURE__ */ new Map();
			for (const c of allLessons.value) m.set(c.id, c);
			return m;
		});
		/** 按当前语言取题干；取不到时回退到存储的中文快照 */
		function questionOf(w) {
			const q = lessonMap.value.get(w.lesson_id)?.quiz?.[w.quiz_index];
			if (!q) return w.question;
			return zh.value ? q.q : q.q_en ?? q.q;
		}
		/** 按当前语言取解析 */
		function explainOf(w) {
			const q = lessonMap.value.get(w.lesson_id)?.quiz?.[w.quiz_index];
			if (!q) return w.explain;
			return zh.value ? q.explain : q.explain_en ?? q.explain;
		}
		/** 按当前语言取选项文本（错题本要显示你选了哪个） */
		function optionOf(w, idx) {
			const q = lessonMap.value.get(w.lesson_id)?.quiz?.[w.quiz_index];
			if (!q) return letter(idx);
			return (zh.value ? q.options : q.options_en ?? q.options)[idx] ?? letter(idx);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$6, [createBaseVNode("header", _hoisted_2$6, [createBaseVNode("div", null, [createBaseVNode("h1", _hoisted_3$5, toDisplayString(zh.value ? "错题本" : "Mistakes"), 1), createBaseVNode("p", _hoisted_4$5, toDisplayString(zh.value ? "自测答错的题会自动收进这里。搞懂一题，划掉一题。" : "Wrong answers are collected here automatically. Clear them one by one."), 1)]), createBaseVNode("div", _hoisted_5$4, [createBaseVNode("label", _hoisted_6$4, [withDirectives(createBaseVNode("input", {
				type: "checkbox",
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => showReviewed.value = $event),
				onChange: load
			}, null, 544), [[vModelCheckbox, showReviewed.value]]), createBaseVNode("span", null, toDisplayString(zh.value ? "显示已复习" : "Show cleared"), 1)]), createBaseVNode("span", _hoisted_7$4, toDisplayString(pending.value), 1)])]), loading.value ? (openBlock(), createElementBlock("div", _hoisted_8$3)) : list.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_9$3, [createBaseVNode("p", _hoisted_10$3, toDisplayString(zh.value ? "没有待复习的错题" : "No mistakes to review"), 1), createBaseVNode("p", _hoisted_11$2, toDisplayString(zh.value ? "去做几张教学卡的自测，答错的题会自动出现在这里。" : "Take a few quizzes; wrong answers will show up here."), 1)])) : (openBlock(), createElementBlock("div", _hoisted_12$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(list.value, (w) => {
				return openBlock(), createElementBlock("article", {
					key: w.id,
					class: normalizeClass(["wa", { done: w.reviewed }])
				}, [
					createBaseVNode("header", _hoisted_13$2, [createBaseVNode("span", _hoisted_14$1, toDisplayString(questionOf(w)), 1), w.wrong_times > 1 ? (openBlock(), createElementBlock("span", _hoisted_15$1, "×" + toDisplayString(w.wrong_times), 1)) : createCommentVNode("", true)]),
					createBaseVNode("div", _hoisted_16$1, [createBaseVNode("div", _hoisted_17$1, [createBaseVNode("span", _hoisted_18$1, toDisplayString(letter(w.chosen)), 1), createBaseVNode("span", _hoisted_19$1, toDisplayString(optionOf(w, w.chosen)), 1)]), createBaseVNode("div", _hoisted_20$1, [createBaseVNode("span", _hoisted_21$1, toDisplayString(letter(w.correct)), 1), createBaseVNode("span", _hoisted_22$1, toDisplayString(optionOf(w, w.correct)), 1)])]),
					explainOf(w) ? (openBlock(), createElementBlock("p", _hoisted_23$1, toDisplayString(explainOf(w)), 1)) : createCommentVNode("", true),
					createBaseVNode("footer", _hoisted_24$1, [createBaseVNode("button", {
						class: "link",
						onClick: ($event) => unref(openLesson)(w.lesson_id)
					}, toDisplayString(zh.value ? "回到这张卡" : "Open the card") + " → ", 9, _hoisted_25$1), !w.reviewed ? (openBlock(), createElementBlock("button", {
						key: 0,
						onClick: ($event) => markDone(w)
					}, toDisplayString(zh.value ? "我懂了" : "Got it"), 9, _hoisted_26$1)) : (openBlock(), createElementBlock("span", _hoisted_27$1, "✓ " + toDisplayString(zh.value ? "已复习" : "Cleared"), 1))])
				], 2);
			}), 128))]))]);
		};
	}
}), [["__scopeId", "data-v-6e200d02"]]);
// src/components/ContextMenu.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$5 = {
	key: 0,
	class: "cm-sep"
};
var _hoisted_2$5 = ["disabled", "onClick"];
var _hoisted_3$4 = { class: "cm-label" };
var _hoisted_4$4 = {
	key: 0,
	class: "cm-hint mono"
};
// src/components/ContextMenu.vue
var ContextMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ContextMenu",
	setup(__props) {
		const items = computed(() => menuState.items);
		const style = computed(() => {
			const x = Math.min(menuState.x, window.innerWidth - 220);
			const y = Math.min(menuState.y, window.innerHeight - Math.max(60, items.value.length * 30 + 16));
			return {
				left: x + "px",
				top: y + "px"
			};
		});
		function run(it) {
			if (it.disabled) return;
			it.action();
			closeMenu();
		}
		function onKey(e) {
			if (e.key === "Escape") closeMenu();
		}
		onMounted(() => {
			window.addEventListener("keydown", onKey);
			window.addEventListener("blur", closeMenu);
		});
		onUnmounted(() => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("blur", closeMenu);
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Teleport, { to: "body" }, [unref(menuState).open ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: "cm-mask",
				onClick: _cache[0] || (_cache[0] = (...args) => unref(closeMenu) && unref(closeMenu)(...args)),
				onContextmenu: _cache[1] || (_cache[1] = withModifiers((...args) => unref(closeMenu) && unref(closeMenu)(...args), ["prevent"]))
			}, null, 32)) : createCommentVNode("", true), unref(menuState).open ? (openBlock(), createElementBlock("div", {
				key: 1,
				class: "cm",
				style: normalizeStyle(style.value),
				role: "menu"
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(items.value, (it) => {
				return openBlock(), createElementBlock(Fragment, { key: it.key }, [it.separator ? (openBlock(), createElementBlock("div", _hoisted_1$5)) : (openBlock(), createElementBlock("button", {
					key: 1,
					class: normalizeClass(["cm-item", {
						disabled: it.disabled,
						danger: it.danger
					}]),
					role: "menuitem",
					disabled: it.disabled,
					onClick: ($event) => run(it)
				}, [createBaseVNode("span", _hoisted_3$4, toDisplayString(it.label), 1), it.hint ? (openBlock(), createElementBlock("span", _hoisted_4$4, toDisplayString(it.hint), 1)) : createCommentVNode("", true)], 10, _hoisted_2$5))], 64);
			}), 128))], 4)) : createCommentVNode("", true)]);
		};
	}
}), [["__scopeId", "data-v-059b1724"]]);
// src/components/SettingsView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = { class: "settings" };
var _hoisted_2$4 = { class: "sh" };
var _hoisted_3$3 = { class: "sh-title" };
var _hoisted_4$3 = { class: "sh-sub" };
var _hoisted_5$3 = { class: "tabs" };
var _hoisted_6$3 = ["onClick"];
var _hoisted_7$3 = {
	key: 0,
	class: "skeleton",
	style: { "height": "300px" }
};
var _hoisted_8$2 = {
	key: 1,
	class: "pane"
};
var _hoisted_9$2 = { class: "card offline" };
var _hoisted_10$2 = { class: "badge-ok" };
var _hoisted_11$1 = { class: "offline-text" };
var _hoisted_12$1 = { class: "sec" };
var _hoisted_13$1 = { class: "ua" };
var _hoisted_14 = { class: "hint" };
var _hoisted_15 = { class: "sec" };
var _hoisted_16 = { class: "grid2" };
var _hoisted_17 = { class: "kv" };
var _hoisted_18 = { class: "mono" };
var _hoisted_19 = { class: "kv" };
var _hoisted_20 = { class: "mono" };
var _hoisted_21 = { class: "kv" };
var _hoisted_22 = { class: "mono" };
var _hoisted_23 = { class: "kv" };
var _hoisted_24 = { class: "mono" };
var _hoisted_25 = { class: "kv" };
var _hoisted_26 = { class: "mono" };
var _hoisted_27 = { class: "hint" };
var _hoisted_28 = { class: "sec" };
var _hoisted_29 = {
	key: 0,
	class: "tbl"
};
var _hoisted_30 = { class: "num" };
var _hoisted_31 = { class: "num" };
var _hoisted_32 = { class: "src-name" };
var _hoisted_33 = { class: "src-url mono" };
var _hoisted_34 = { class: "mono small" };
var _hoisted_35 = { class: "num mono" };
var _hoisted_36 = ["title"];
var _hoisted_37 = { class: "num mono" };
var _hoisted_38 = {
	key: 1,
	class: "hint"
};
var _hoisted_39 = {
	key: 2,
	class: "pane"
};
var _hoisted_40 = { class: "sec" };
var _hoisted_41 = { class: "path-box" };
var _hoisted_42 = { class: "path-row" };
var _hoisted_43 = { class: "mono" };
var _hoisted_44 = { class: "path-row" };
var _hoisted_45 = { class: "mono" };
var _hoisted_46 = { class: "path-row" };
var _hoisted_47 = { class: "mono" };
var _hoisted_48 = { class: "row-btns" };
var _hoisted_49 = { class: "sec" };
var _hoisted_50 = { class: "hint" };
var _hoisted_51 = { class: "row-btns" };
var _hoisted_52 = ["disabled"];
var _hoisted_53 = {
	key: 0,
	class: "result"
};
var _hoisted_54 = { class: "ok" };
var _hoisted_55 = { class: "mono small" };
var _hoisted_56 = { class: "small" };
var _hoisted_57 = { class: "sec" };
var _hoisted_58 = { class: "hint" };
var _hoisted_59 = { class: "restore-row" };
var _hoisted_60 = ["placeholder"];
var _hoisted_61 = ["disabled"];
var _hoisted_62 = { class: "sec" };
var _hoisted_63 = { class: "hint" };
var _hoisted_64 = { class: "row-btns" };
var _hoisted_65 = ["disabled"];
var _hoisted_66 = {
	key: 1,
	class: "result"
};
var _hoisted_67 = { class: "ok" };
var _hoisted_68 = { class: "mono small" };
var _hoisted_69 = { class: "small" };
var _hoisted_70 = {
	key: 3,
	class: "pane"
};
var _hoisted_71 = { class: "sec" };
var _hoisted_72 = { class: "row-btns" };
var _hoisted_73 = { class: "sec" };
var _hoisted_74 = { class: "row-btns" };
var _hoisted_75 = { class: "mono" };
var _hoisted_76 = { class: "sec" };
var _hoisted_77 = { class: "row-btns" };
var _hoisted_78 = { class: "sec" };
var _hoisted_79 = { class: "row-btns" };
var _hoisted_80 = { class: "sec" };
var _hoisted_81 = { class: "hint" };
var _hoisted_82 = { class: "row-btns" };
var _hoisted_83 = {
	key: 4,
	class: "pane"
};
var _hoisted_84 = { class: "sec" };
var _hoisted_85 = { class: "keys" };
var _hoisted_86 = { class: "mono" };
var _hoisted_87 = {
	key: 5,
	class: "pane"
};
var _hoisted_88 = { class: "about-desc" };
var _hoisted_89 = { class: "sec" };
var _hoisted_90 = { class: "grid2" };
var _hoisted_91 = { class: "kv" };
var _hoisted_92 = { class: "kv" };
var _hoisted_93 = { class: "kv" };
var _hoisted_94 = { class: "kv" };
var _hoisted_95 = { class: "sec" };
var _hoisted_96 = { class: "grid2" };
var _hoisted_97 = { class: "kv" };
var _hoisted_98 = { class: "kv" };
var _hoisted_99 = { class: "kv" };
var _hoisted_100 = { class: "kv" };
var _hoisted_101 = { class: "kv" };
var _hoisted_102 = { class: "kv" };
var _hoisted_103 = { class: "sec" };
var _hoisted_104 = { class: "hint" };
// src/components/SettingsView.vue
var SettingsView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SettingsView",
	setup(__props) {
		const zh = computed(() => theme.lang === "zh-CN");
		const info = /* @__PURE__ */ ref(null);
		const loading = /* @__PURE__ */ ref(true);
		const busy = /* @__PURE__ */ ref("");
		const lastBackup = /* @__PURE__ */ ref(null);
		const lastExport = /* @__PURE__ */ ref(null);
		const restorePath = /* @__PURE__ */ ref("");
		const tab = /* @__PURE__ */ ref("compliance");
		async function load() {
			loading.value = true;
			try {
				info.value = await api.complianceInfo();
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				loading.value = false;
			}
		}
		onMounted(load);
		async function doBackup() {
			if (busy.value) return;
			busy.value = zh.value ? "正在备份…" : "Backing up…";
			try {
				lastBackup.value = await api.backupDatabase();
				showToast(zh.value ? "备份完成" : "Backup complete");
				await load();
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				busy.value = "";
			}
		}
		async function doRestore() {
			if (!restorePath.value.trim()) {
				showToast(zh.value ? "请填写备份文件完整路径" : "Enter the backup file path");
				return;
			}
			busy.value = zh.value ? "正在恢复…" : "Restoring…";
			try {
				showToast(await api.restoreDatabase(restorePath.value.trim()));
				restorePath.value = "";
				await load();
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				busy.value = "";
			}
		}
		async function doExportItems() {
			if (busy.value) return;
			busy.value = zh.value ? "正在导出…" : "Exporting…";
			try {
				lastExport.value = await api.exportItemsJson();
				showToast((zh.value ? "已导出 " : "Exported ") + lastExport.value.count + (zh.value ? " 条" : " items"));
			} catch (e) {
				showToast(errMsg(e));
			} finally {
				busy.value = "";
			}
		}
		async function openDir() {
			try {
				await api.openDataDir();
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		async function exportTheme() {
			try {
				const json = await api.exportTheme();
				await navigator.clipboard.writeText(json);
				showToast(zh.value ? "主题配置已复制到剪贴板" : "Theme config copied to clipboard");
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		async function importTheme() {
			try {
				const txt = await navigator.clipboard.readText();
				if (!txt.trim()) {
					showToast(zh.value ? "剪贴板为空" : "Clipboard is empty");
					return;
				}
				const cfg = await api.importTheme(txt);
				Object.assign(theme, cfg);
				persistTheme();
				showToast(zh.value ? "主题配置已导入" : "Theme imported");
			} catch (e) {
				showToast(errMsg(e));
			}
		}
		const robotsLabel = (s) => zh.value ? {
			allowed: "允许",
			disallowed: "禁止",
			not_found: "未发现（视为不限制）",
			unknown: "未校验"
		}[s] ?? s : {
			allowed: "Allowed",
			disallowed: "Disallowed",
			not_found: "Not found (treated as unrestricted)",
			unknown: "Unverified"
		}[s] ?? s;
		const tabs = computed(() => [
			{
				k: "compliance",
				label: zh.value ? "合规" : "Compliance"
			},
			{
				k: "data",
				label: zh.value ? "数据" : "Data"
			},
			{
				k: "theme",
				label: zh.value ? "外观" : "Appearance"
			},
			{
				k: "keys",
				label: zh.value ? "快捷键" : "Shortcuts"
			},
			{
				k: "about",
				label: zh.value ? "关于" : "About"
			}
		]);
		const shortcuts = computed(() => [
			{
				k: "Ctrl / Cmd + K",
				d: zh.value ? "聚焦搜索框" : "Focus search"
			},
			{
				k: "Ctrl / Cmd + 1",
				d: zh.value ? "学习首页" : "Learn home"
			},
			{
				k: "Ctrl / Cmd + 2",
				d: zh.value ? "学习路径" : "Learning paths"
			},
			{
				k: "Ctrl / Cmd + 3",
				d: zh.value ? "情报检索" : "Intel search"
			},
			{
				k: "Ctrl / Cmd + 4",
				d: zh.value ? "数据看板" : "Dashboard"
			},
			{
				k: "Ctrl / Cmd + 5",
				d: zh.value ? "错题本" : "Mistakes"
			},
			{
				k: "Ctrl / Cmd + 6",
				d: zh.value ? "设置" : "Settings"
			},
			{
				k: "Esc",
				d: zh.value ? "清空搜索 / 关闭弹窗" : "Clear search / close popover"
			},
			{
				k: "↑ / ↓",
				d: zh.value ? "切换列表选中项" : "Move list selection"
			},
			{
				k: "Enter / Space",
				d: zh.value ? "选中聚焦的条目" : "Select focused item"
			}
		]);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$4, [
				createBaseVNode("header", _hoisted_2$4, [createBaseVNode("h1", _hoisted_3$3, toDisplayString(zh.value ? "设置" : "Settings"), 1), createBaseVNode("p", _hoisted_4$3, toDisplayString(zh.value ? "合规边界、数据管理与外观配置。所有设置只保存在本机。" : "Compliance boundaries, data management, and appearance. Everything stays local."), 1)]),
				createBaseVNode("nav", _hoisted_5$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(tabs.value, (x) => {
					return openBlock(), createElementBlock("button", {
						key: x.k,
						class: normalizeClass(["tb", { active: tab.value === x.k }]),
						onClick: ($event) => tab.value = x.k
					}, toDisplayString(x.label), 11, _hoisted_6$3);
				}), 128))]),
				loading.value ? (openBlock(), createElementBlock("div", _hoisted_7$3)) : tab.value === "compliance" && info.value ? (openBlock(), createElementBlock("section", _hoisted_8$2, [
					createBaseVNode("div", _hoisted_9$2, [createBaseVNode("span", _hoisted_10$2, "✓ " + toDisplayString(zh.value ? "仅本地运行" : "Local only"), 1), createBaseVNode("p", _hoisted_11$1, toDisplayString(zh.value ? "本程序不提供任何对外 API、不上传任何数据、无账号体系、无遥测。所有情报与教学内容均存于本机 SQLite 文件。" : "This app exposes no API, uploads nothing, has no accounts and no telemetry. All data lives in a local SQLite file."), 1)]),
					createBaseVNode("h2", _hoisted_12$1, toDisplayString(zh.value ? "User-Agent（固定标识）" : "User-Agent (fixed)"), 1),
					createBaseVNode("pre", _hoisted_13$1, toDisplayString(info.value.user_agent), 1),
					createBaseVNode("p", _hoisted_14, toDisplayString(zh.value ? "每次请求都使用这个 UA，包含项目名与联系方式，不伪装浏览器。" : "Every request uses this UA with project name and contact, never impersonating a browser."), 1),
					createBaseVNode("h2", _hoisted_15, toDisplayString(zh.value ? "请求约束" : "Request limits"), 1),
					createBaseVNode("div", _hoisted_16, [
						createBaseVNode("div", _hoisted_17, [createBaseVNode("span", null, toDisplayString(zh.value ? "限速硬性下限" : "Rate limit floor"), 1), createBaseVNode("b", _hoisted_18, toDisplayString(info.value.min_interval_floor_ms) + " ms", 1)]),
						createBaseVNode("div", _hoisted_19, [createBaseVNode("span", null, toDisplayString(zh.value ? "默认间隔" : "Default interval"), 1), createBaseVNode("b", _hoisted_20, toDisplayString(info.value.default_interval_ms) + " ms", 1)]),
						createBaseVNode("div", _hoisted_21, [createBaseVNode("span", null, toDisplayString(zh.value ? "请求超时" : "Timeout"), 1), createBaseVNode("b", _hoisted_22, toDisplayString(info.value.timeout_secs) + " s", 1)]),
						createBaseVNode("div", _hoisted_23, [createBaseVNode("span", null, toDisplayString(zh.value ? "最大重试" : "Max retries"), 1), createBaseVNode("b", _hoisted_24, toDisplayString(info.value.max_retries), 1)]),
						createBaseVNode("div", _hoisted_25, [createBaseVNode("span", null, toDisplayString(zh.value ? "响应体上限" : "Body size cap"), 1), createBaseVNode("b", _hoisted_26, toDisplayString(unref(fmtBytes)(info.value.max_body_bytes)), 1)])
					]),
					createBaseVNode("p", _hoisted_27, toDisplayString(zh.value ? "限速下限不可低于配置值，即使源码改小也会被强制抬升到该值。" : "The floor cannot be lowered; even a smaller configured value is raised to this floor."), 1),
					createBaseVNode("h2", _hoisted_28, toDisplayString(zh.value ? "数据源与 robots 状态" : "Sources and robots status"), 1),
					info.value.sources && info.value.sources.length ? (openBlock(), createElementBlock("table", _hoisted_29, [createBaseVNode("thead", null, [createBaseVNode("tr", null, [
						createBaseVNode("th", null, toDisplayString(zh.value ? "源" : "Source"), 1),
						createBaseVNode("th", null, toDisplayString(zh.value ? "类型" : "Kind"), 1),
						createBaseVNode("th", _hoisted_30, toDisplayString(zh.value ? "限速" : "Rate"), 1),
						createBaseVNode("th", null, toDisplayString(zh.value ? "robots" : "robots"), 1),
						createBaseVNode("th", _hoisted_31, toDisplayString(zh.value ? "条目" : "Items"), 1)
					])]), createBaseVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(info.value.sources, (s) => {
						return openBlock(), createElementBlock("tr", { key: s.key }, [
							createBaseVNode("td", null, [createBaseVNode("div", _hoisted_32, toDisplayString(s.name), 1), createBaseVNode("div", _hoisted_33, toDisplayString(s.base_url), 1)]),
							createBaseVNode("td", _hoisted_34, toDisplayString(s.kind), 1),
							createBaseVNode("td", _hoisted_35, [createTextVNode(toDisplayString(s.interval_ms) + " ms ", 1), s.floor_applied ? (openBlock(), createElementBlock("span", {
								key: 0,
								class: "floor",
								title: zh.value ? "已抬升到下限" : "Raised to floor"
							}, "↑", 8, _hoisted_36)) : createCommentVNode("", true)]),
							createBaseVNode("td", null, [createBaseVNode("span", { class: normalizeClass(["rob", "r-" + s.robots_state]) }, toDisplayString(robotsLabel(s.robots_state)), 3)]),
							createBaseVNode("td", _hoisted_37, toDisplayString(s.item_count), 1)
						]);
					}), 128))])])) : (openBlock(), createElementBlock("div", _hoisted_38, toDisplayString(zh.value ? "数据源列表为空" : "Source list is empty"), 1))
				])) : tab.value === "data" && info.value ? (openBlock(), createElementBlock("section", _hoisted_39, [
					createBaseVNode("h2", _hoisted_40, toDisplayString(zh.value ? "数据位置" : "Data location"), 1),
					createBaseVNode("div", _hoisted_41, [
						createBaseVNode("div", _hoisted_42, [createBaseVNode("span", null, toDisplayString(zh.value ? "数据目录" : "Data dir"), 1), createBaseVNode("code", _hoisted_43, toDisplayString(info.value.data_dir), 1)]),
						createBaseVNode("div", _hoisted_44, [createBaseVNode("span", null, toDisplayString(zh.value ? "数据库" : "Database"), 1), createBaseVNode("code", _hoisted_45, toDisplayString(info.value.db_path), 1)]),
						createBaseVNode("div", _hoisted_46, [createBaseVNode("span", null, toDisplayString(zh.value ? "库体积" : "DB size"), 1), createBaseVNode("b", _hoisted_47, toDisplayString(unref(fmtBytes)(info.value.db_bytes)), 1)])
					]),
					createBaseVNode("div", _hoisted_48, [createBaseVNode("button", { onClick: openDir }, toDisplayString(zh.value ? "打开数据目录" : "Open data folder"), 1), createBaseVNode("button", { onClick: load }, toDisplayString(zh.value ? "刷新" : "Refresh"), 1)]),
					createBaseVNode("h2", _hoisted_49, toDisplayString(zh.value ? "备份" : "Backup"), 1),
					createBaseVNode("p", _hoisted_50, toDisplayString(zh.value ? "备份会先做 WAL checkpoint 再拷贝整库，导出一个完整的 .db 文件到数据目录。" : "A WAL checkpoint runs before copying the whole database into a complete .db file in the data dir."), 1),
					createBaseVNode("div", _hoisted_51, [createBaseVNode("button", {
						class: "primary",
						disabled: !!busy.value,
						onClick: doBackup
					}, toDisplayString(busy.value || (zh.value ? "立即备份" : "Back up now")), 9, _hoisted_52)]),
					lastBackup.value ? (openBlock(), createElementBlock("div", _hoisted_53, [
						createBaseVNode("div", _hoisted_54, "✓ " + toDisplayString(zh.value ? "备份完成" : "Backup done"), 1),
						createBaseVNode("div", _hoisted_55, toDisplayString(lastBackup.value.path), 1),
						createBaseVNode("div", _hoisted_56, toDisplayString(unref(fmtBytes)(lastBackup.value.bytes)) + " · " + toDisplayString(lastBackup.value.items) + " " + toDisplayString(zh.value ? "条目" : "items") + " · " + toDisplayString(lastBackup.value.notes) + " " + toDisplayString(zh.value ? "笔记" : "notes") + " · " + toDisplayString(lastBackup.value.progress) + " " + toDisplayString(zh.value ? "学习记录" : "progress"), 1)
					])) : createCommentVNode("", true),
					createBaseVNode("h2", _hoisted_57, toDisplayString(zh.value ? "恢复" : "Restore"), 1),
					createBaseVNode("p", _hoisted_58, toDisplayString(zh.value ? "填写备份文件完整路径。恢复前会自动把当前库另存一份，避免误操作丢数据。恢复后需重启生效。" : "Enter the full path of a backup. The current DB is saved first to avoid data loss. Restart after restoring."), 1),
					createBaseVNode("div", _hoisted_59, [withDirectives(createBaseVNode("input", {
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => restorePath.value = $event),
						placeholder: zh.value ? "C:...sentrydesk-backup-xxxx.db" : "C:\\...\\sentrydesk-backup-xxxx.db"
					}, null, 8, _hoisted_60), [[vModelText, restorePath.value]]), createBaseVNode("button", {
						disabled: !!busy.value,
						onClick: doRestore
					}, toDisplayString(zh.value ? "恢复" : "Restore"), 9, _hoisted_61)]),
					createBaseVNode("h2", _hoisted_62, toDisplayString(zh.value ? "导出条目（JSON）" : "Export items (JSON)"), 1),
					createBaseVNode("p", _hoisted_63, toDisplayString(zh.value ? "导出为纯元数据 JSON：CVE 编号、标题、摘要、CVSS、受影响产品、发布时间、来源链接。不含任何第三方原文全文。" : "Exports metadata-only JSON: CVE ID, title, summary, CVSS, products, publish time, source link. No third-party full text."), 1),
					createBaseVNode("div", _hoisted_64, [createBaseVNode("button", {
						disabled: !!busy.value,
						onClick: doExportItems
					}, toDisplayString(zh.value ? "导出 JSON" : "Export JSON"), 9, _hoisted_65)]),
					lastExport.value ? (openBlock(), createElementBlock("div", _hoisted_66, [
						createBaseVNode("div", _hoisted_67, "✓ " + toDisplayString(zh.value ? "导出完成" : "Export done"), 1),
						createBaseVNode("div", _hoisted_68, toDisplayString(lastExport.value.path), 1),
						createBaseVNode("div", _hoisted_69, toDisplayString(lastExport.value.count) + " " + toDisplayString(zh.value ? "条 · " : "items · ") + toDisplayString(unref(fmtBytes)(lastExport.value.bytes)), 1)
					])) : createCommentVNode("", true)
				])) : tab.value === "theme" ? (openBlock(), createElementBlock("section", _hoisted_70, [
					createBaseVNode("h2", _hoisted_71, toDisplayString(zh.value ? "主题" : "Theme"), 1),
					createBaseVNode("div", _hoisted_72, [
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).mode === "light" }),
							onClick: _cache[1] || (_cache[1] = ($event) => {
								unref(theme).mode = "light";
								unref(persistTheme)();
							})
						}, toDisplayString(unref(t)("theme.light")), 3),
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).mode === "dark" }),
							onClick: _cache[2] || (_cache[2] = ($event) => {
								unref(theme).mode = "dark";
								unref(persistTheme)();
							})
						}, toDisplayString(unref(t)("theme.dark")), 3),
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).mode === "eyecare" }),
							onClick: _cache[3] || (_cache[3] = ($event) => {
								unref(theme).mode = "eyecare";
								unref(persistTheme)();
							})
						}, toDisplayString(unref(t)("theme.eyecare")), 3)
					]),
					createBaseVNode("h2", _hoisted_73, toDisplayString(zh.value ? "主色" : "Accent color"), 1),
					createBaseVNode("div", _hoisted_74, [withDirectives(createBaseVNode("input", {
						type: "color",
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(theme).accent = $event),
						onChange: _cache[5] || (_cache[5] = ($event) => unref(persistTheme)()),
						class: "color"
					}, null, 544), [[vModelText, unref(theme).accent]]), createBaseVNode("code", _hoisted_75, toDisplayString(unref(theme).accent), 1)]),
					createBaseVNode("h2", _hoisted_76, toDisplayString(zh.value ? "密度" : "Density"), 1),
					createBaseVNode("div", _hoisted_77, [createBaseVNode("button", {
						class: normalizeClass({ primary: unref(theme).density === "comfortable" }),
						onClick: _cache[6] || (_cache[6] = ($event) => {
							unref(theme).density = "comfortable";
							unref(persistTheme)();
						})
					}, toDisplayString(zh.value ? "舒适" : "Comfortable"), 3), createBaseVNode("button", {
						class: normalizeClass({ primary: unref(theme).density === "compact" }),
						onClick: _cache[7] || (_cache[7] = ($event) => {
							unref(theme).density = "compact";
							unref(persistTheme)();
						})
					}, toDisplayString(zh.value ? "紧凑" : "Compact"), 3)]),
					createBaseVNode("h2", _hoisted_78, toDisplayString(zh.value ? "圆角" : "Radius"), 1),
					createBaseVNode("div", _hoisted_79, [
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).radius === "sm" }),
							onClick: _cache[8] || (_cache[8] = ($event) => {
								unref(theme).radius = "sm";
								unref(persistTheme)();
							})
						}, "SM", 2),
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).radius === "md" }),
							onClick: _cache[9] || (_cache[9] = ($event) => {
								unref(theme).radius = "md";
								unref(persistTheme)();
							})
						}, "MD", 2),
						createBaseVNode("button", {
							class: normalizeClass({ primary: unref(theme).radius === "lg" }),
							onClick: _cache[10] || (_cache[10] = ($event) => {
								unref(theme).radius = "lg";
								unref(persistTheme)();
							})
						}, "LG", 2)
					]),
					createBaseVNode("h2", _hoisted_80, toDisplayString(zh.value ? "配置文件" : "Config file"), 1),
					createBaseVNode("p", _hoisted_81, toDisplayString(zh.value ? "导出把当前配置写入剪贴板；导入从剪贴板读取 JSON。" : "Export copies config to clipboard; import reads JSON from clipboard."), 1),
					createBaseVNode("div", _hoisted_82, [createBaseVNode("button", { onClick: exportTheme }, toDisplayString(zh.value ? "导出到剪贴板" : "Export to clipboard"), 1), createBaseVNode("button", { onClick: importTheme }, toDisplayString(zh.value ? "从剪贴板导入" : "Import from clipboard"), 1)])
				])) : tab.value === "keys" ? (openBlock(), createElementBlock("section", _hoisted_83, [createBaseVNode("h2", _hoisted_84, toDisplayString(zh.value ? "键盘快捷键" : "Keyboard shortcuts"), 1), createBaseVNode("div", _hoisted_85, [(openBlock(true), createElementBlock(Fragment, null, renderList(shortcuts.value, (s) => {
					return openBlock(), createElementBlock("div", {
						key: s.k,
						class: "key-row"
					}, [createBaseVNode("kbd", _hoisted_86, toDisplayString(s.k), 1), createBaseVNode("span", null, toDisplayString(s.d), 1)]);
				}), 128))])])) : tab.value === "about" ? (openBlock(), createElementBlock("section", _hoisted_87, [
					_cache[21] || (_cache[21] = createBaseVNode("div", { class: "about-head" }, [createBaseVNode("div", { class: "logo" }, "◆"), createBaseVNode("div", null, [createBaseVNode("h2", { class: "about-name" }, "SentryDesk"), createBaseVNode("p", { class: "about-ver mono" }, "v0.6.0")])], -1)),
					createBaseVNode("p", _hoisted_88, toDisplayString(zh.value ? "本地运行的安全情报聚合与学习桌面工具。合规采集公开源，解析为结构化条目，存入本地 SQLite，提供毫秒级离线检索与中英双语教学知识库。" : "A local-first security intelligence and learning desktop app. Public sources are collected compliantly, parsed into structured items, stored in local SQLite, and exposed through millisecond offline search with a bilingual teaching library."), 1),
					createBaseVNode("h2", _hoisted_89, toDisplayString(zh.value ? "技术栈" : "Stack"), 1),
					createBaseVNode("div", _hoisted_90, [
						createBaseVNode("div", _hoisted_91, [createBaseVNode("span", null, toDisplayString(zh.value ? "应用外壳" : "Shell"), 1), _cache[11] || (_cache[11] = createBaseVNode("b", null, "Tauri 2", -1))]),
						createBaseVNode("div", _hoisted_92, [createBaseVNode("span", null, toDisplayString(zh.value ? "内核" : "Core"), 1), _cache[12] || (_cache[12] = createBaseVNode("b", null, "Rust", -1))]),
						createBaseVNode("div", _hoisted_93, [createBaseVNode("span", null, toDisplayString(zh.value ? "数据层" : "Data"), 1), _cache[13] || (_cache[13] = createBaseVNode("b", null, "SQLite + FTS5", -1))]),
						createBaseVNode("div", _hoisted_94, [createBaseVNode("span", null, toDisplayString(zh.value ? "前端" : "Frontend"), 1), _cache[14] || (_cache[14] = createBaseVNode("b", null, "Vue 3 + TypeScript", -1))])
					]),
					createBaseVNode("h2", _hoisted_95, toDisplayString(zh.value ? "内容规模" : "Content"), 1),
					createBaseVNode("div", _hoisted_96, [
						createBaseVNode("div", _hoisted_97, [createBaseVNode("span", null, toDisplayString(zh.value ? "教学卡" : "Lesson cards"), 1), _cache[15] || (_cache[15] = createBaseVNode("b", { class: "mono" }, "107", -1))]),
						createBaseVNode("div", _hoisted_98, [createBaseVNode("span", null, toDisplayString(zh.value ? "自测题" : "Quiz questions"), 1), _cache[16] || (_cache[16] = createBaseVNode("b", { class: "mono" }, "329", -1))]),
						createBaseVNode("div", _hoisted_99, [createBaseVNode("span", null, toDisplayString(zh.value ? "代码对比块" : "Code comparisons"), 1), _cache[17] || (_cache[17] = createBaseVNode("b", { class: "mono" }, "89", -1))]),
						createBaseVNode("div", _hoisted_100, [createBaseVNode("span", null, toDisplayString(zh.value ? "术语" : "Glossary terms"), 1), _cache[18] || (_cache[18] = createBaseVNode("b", { class: "mono" }, "91", -1))]),
						createBaseVNode("div", _hoisted_101, [createBaseVNode("span", null, toDisplayString(zh.value ? "学习路径" : "Paths"), 1), _cache[19] || (_cache[19] = createBaseVNode("b", { class: "mono" }, "10", -1))]),
						createBaseVNode("div", _hoisted_102, [createBaseVNode("span", null, toDisplayString(zh.value ? "分类" : "Categories"), 1), _cache[20] || (_cache[20] = createBaseVNode("b", { class: "mono" }, "34", -1))])
					]),
					createBaseVNode("h2", _hoisted_103, toDisplayString(zh.value ? "参考来源" : "References"), 1),
					_cache[22] || (_cache[22] = createBaseVNode("p", { class: "about-refs" }, " MITRE CWE · MITRE ATT&CK · OWASP (Web / API Top 10 / Cheat Sheets) · NIST SP 800-53/61/86/190 · CISA KEV · FIRST CVSS v3.1 / v4.0 · FIRST EPSS · SLSA · CycloneDX · Sigstore · CIS Benchmarks ", -1)),
					createBaseVNode("p", _hoisted_104, toDisplayString(zh.value ? "教学正文为本项目根据上述公开标准自行撰写，非原文转载。" : "Lesson text is original work based on the public standards above, not a reproduction."), 1)
				])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-9453fb56"]]);
// src/components/ErrorBoundary.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = {
	key: 0,
	class: "eb"
};
var _hoisted_2$3 = { class: "eb-card" };
var _hoisted_3$2 = { class: "eb-title" };
var _hoisted_4$2 = { class: "eb-sub" };
var _hoisted_5$2 = { class: "eb-trace mono" };
var _hoisted_6$2 = { class: "eb-actions" };
var _hoisted_7$2 = {
	key: 1,
	class: "eb-pass"
};
// src/components/ErrorBoundary.vue
var ErrorBoundary_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ErrorBoundary",
	setup(__props) {
		const err = /* @__PURE__ */ ref(null);
		const info = /* @__PURE__ */ ref("");
		onErrorCaptured((e, instance, trace) => {
			err.value = e;
			const name = instance?.$options?.__name ?? "unknown";
			info.value = [
				String(e),
				"at <" + name + ">",
				e?.stack?.split("\n").slice(1, 4).join("\n"),
				trace
			].filter(Boolean).join("\n").slice(0, 900);
			return false;
		});
		function reload() {
			err.value = null;
			window.location.reload();
		}
		function dismiss() {
			err.value = null;
		}
		return (_ctx, _cache) => {
			return err.value ? (openBlock(), createElementBlock("div", _hoisted_1$3, [createBaseVNode("div", _hoisted_2$3, [
				createBaseVNode("h2", _hoisted_3$2, toDisplayString(unref(theme).lang === "zh-CN" ? "界面出现了异常" : "Something went wrong"), 1),
				createBaseVNode("p", _hoisted_4$2, toDisplayString(unref(theme).lang === "zh-CN" ? "数据仍安全保存在本机。可以尝试关闭提示继续使用，或刷新界面。" : "Your data is still safe locally. You can dismiss this and continue, or reload the interface."), 1),
				createBaseVNode("pre", _hoisted_5$2, toDisplayString(info.value), 1),
				createBaseVNode("div", _hoisted_6$2, [createBaseVNode("button", {
					class: "primary",
					onClick: reload
				}, toDisplayString(unref(theme).lang === "zh-CN" ? "刷新界面" : "Reload"), 1), createBaseVNode("button", { onClick: dismiss }, toDisplayString(unref(theme).lang === "zh-CN" ? "关闭提示" : "Dismiss"), 1)])
			])])) : (openBlock(), createElementBlock("div", _hoisted_7$2, [renderSlot(_ctx.$slots, "default", {}, void 0, true)]));
		};
	}
}), [["__scopeId", "data-v-f7a2c426"]]);
// src/components/CommandPalette.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = {
	class: "palette",
	role: "dialog",
	"aria-modal": "true"
};
var _hoisted_2$2 = { class: "in-wrap" };
var _hoisted_3$1 = ["placeholder", "onKeydown"];
var _hoisted_4$1 = { class: "group" };
var _hoisted_5$1 = ["onMouseenter", "onClick"];
var _hoisted_6$1 = { class: "r-ico" };
var _hoisted_7$1 = { class: "r-main" };
var _hoisted_8$1 = { class: "r-title" };
var _hoisted_9$1 = {
	key: 0,
	class: "r-sub"
};
var _hoisted_10$1 = {
	key: 0,
	class: "kbd"
};
var _hoisted_11 = {
	key: 0,
	class: "none"
};
var _hoisted_12 = { class: "foot" };
var _hoisted_13 = { class: "muted" };
// src/components/CommandPalette.vue
var CommandPalette_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "CommandPalette",
	setup(__props) {
		/**
		* 命令面板（Ctrl+K）：一处完成「跳到哪、看什么、做什么」。
		* 纯前端聚合现有数据（教学卡 / 术语 / 导航 / 动作），不新增后端接口。
		*/
		const q = /* @__PURE__ */ ref("");
		const cursor = /* @__PURE__ */ ref(0);
		const inputRef = /* @__PURE__ */ ref(null);
		const listRef = /* @__PURE__ */ ref(null);
		const zh = computed(() => theme.lang === "zh-CN");
		function close() {
			paletteOpen.value = false;
			q.value = "";
			cursor.value = 0;
		}
		function goto(v) {
			view.value = v;
			if (v === "items") doSearch();
		}
		const actions = [
			{
				key: "nav-home",
				group: "nav",
				title: "学习 · 全部教程",
				sub: "Lessons",
				icon: "book",
				run: () => goHome()
			},
			{
				key: "nav-paths",
				group: "nav",
				title: "学习路径",
				sub: "Paths",
				icon: "layers",
				run: () => goto("paths")
			},
			{
				key: "nav-items",
				group: "nav",
				title: "情报检索",
				sub: "Intel",
				icon: "shield",
				run: () => goto("items")
			},
			{
				key: "nav-dash",
				group: "nav",
				title: "数据看板",
				sub: "Dashboard",
				icon: "chart",
				run: () => goto("dashboard")
			},
			{
				key: "nav-wrong",
				group: "nav",
				title: "错题本",
				sub: "Review queue",
				icon: "alert",
				run: () => goto("wrong")
			},
			{
				key: "nav-settings",
				group: "nav",
				title: "设置",
				sub: "Settings",
				icon: "settings",
				run: () => goto("settings")
			},
			{
				key: "act-help",
				group: "action",
				title: "快捷键一览",
				sub: "Keyboard shortcuts",
				icon: "help",
				hint: "?",
				run: () => openHelp()
			},
			{
				key: "act-theme",
				group: "action",
				title: "切换主题（浅色 / 深色 / 护眼）",
				sub: "Cycle theme",
				icon: "sun",
				run: () => cycleTheme()
			},
			{
				key: "act-lang",
				group: "action",
				title: "切换界面语言",
				sub: "Toggle language",
				icon: "globe",
				run: () => setLang(theme.lang === "zh-CN" ? "en-US" : "zh-CN")
			},
			{
				key: "act-export",
				group: "action",
				title: "导出笔记备忘（Markdown）",
				sub: "Export memo",
				icon: "note",
				run: async () => {
					const name = `sentrydesk-memo-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
					try {
						const p = await api.exportMemo(name);
						showToast((zh.value ? "已导出 → " : "Exported → ") + p);
					} catch (e) {
						showToast(String(e));
					}
				}
			}
		];
		/** 拼音/大小写无关的轻量匹配：优先子串，退化为子序列 */
		function score(text, query) {
			const t = text.toLowerCase();
			const s = query.toLowerCase();
			if (!s) return 1;
			const i = t.indexOf(s);
			if (i >= 0) return 120 - Math.min(i, 50) - (t.length - s.length) * .05;
			let ti = 0;
			for (const ch of s) {
				const n = t.indexOf(ch, ti);
				if (n < 0) return -1;
				ti = n + 1;
			}
			return 20;
		}
		const rows = computed(() => {
			const query = q.value.trim();
			const out = [];
			const picks = [];
			for (const a of actions) {
				const s = Math.max(score(a.title, query), score(a.sub ?? "", query));
				if (s > 0) picks.push({
					row: a,
					s: s + 8
				});
			}
			for (const c of allLessons.value) {
				const label = zh.value ? c.title : c.title_en || c.title;
				const s = Math.max(score(label, query), score(c.cwe ?? "", query), score(c.category, query));
				if (s > 0) picks.push({
					row: {
						key: "lesson-" + c.id,
						group: "lesson",
						title: label,
						sub: [c.cwe, zh.value ? c.category : c.category].filter(Boolean).join(" · "),
						icon: "book",
						run: () => openLesson(c.id)
					},
					s
				});
			}
			for (const g of glossary.value) {
				const s = Math.max(score(g.term, query), score(g.term_en ?? "", query));
				if (s > 0) picks.push({
					row: {
						key: "gloss-" + g.term,
						group: "glossary",
						title: g.term,
						sub: g.term_en || (g.definition ?? "").slice(0, 40),
						icon: "tag",
						run: () => {
							const cwe = g.related?.[0];
							if (cwe) jumpToCwe(cwe);
							else goto("home");
						}
					},
					s: s - 30
				});
			}
			if (query) picks.push({
				row: {
					key: "search-items",
					group: "search",
					title: (zh.value ? "在情报库中搜索「" : "Search intel for \"") + query + (zh.value ? "」" : "\""),
					sub: "SQLite FTS5 · 本地",
					icon: "search",
					hint: "Enter",
					run: () => {
						filter.query = query;
						filter.offset = 0;
						view.value = "items";
						doSearch();
					}
				},
				s: 60
			});
			picks.sort((a, b) => b.s - a.s);
			const seen = /* @__PURE__ */ new Set();
			for (const p of picks) {
				if (out.length >= 14) break;
				if (seen.has(p.row.key)) continue;
				seen.add(p.row.key);
				out.push(p.row);
			}
			return out;
		});
		const grouped = computed(() => {
			const order = [
				{
					id: "search",
					label: zh.value ? "检索" : "Search"
				},
				{
					id: "nav",
					label: zh.value ? "跳转" : "Go to"
				},
				{
					id: "action",
					label: zh.value ? "动作" : "Actions"
				},
				{
					id: "lesson",
					label: zh.value ? "教学卡" : "Lessons"
				},
				{
					id: "glossary",
					label: zh.value ? "术语" : "Glossary"
				}
			];
			const out = [];
			let idx = 0;
			for (const g of order) {
				const rs = rows.value.filter((r) => r.group === g.id);
				if (!rs.length) continue;
				out.push({
					label: g.label,
					rows: rs,
					start: idx
				});
				idx += rs.length;
			}
			return out;
		});
		watch(rows, () => {
			cursor.value = Math.min(cursor.value, Math.max(0, rows.value.length - 1));
		});
		watch(paletteOpen, async (open) => {
			if (!open) return;
			q.value = "";
			cursor.value = 0;
			await nextTick();
			inputRef.value?.focus();
		});
		function move(delta) {
			if (!rows.value.length) return;
			cursor.value = (cursor.value + delta + rows.value.length) % rows.value.length;
			nextTick(() => {
				(listRef.value?.querySelector(".row.active"))?.scrollIntoView({ block: "nearest" });
			});
		}
		function runAt(i) {
			const r = rows.value[i];
			if (!r) return;
			close();
			r.run();
		}
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, { name: "pal" }, {
				default: withCtx(() => [unref(paletteOpen) ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "backdrop",
					onMousedown: withModifiers(close, ["self"])
				}, [createBaseVNode("div", _hoisted_1$2, [
					createBaseVNode("div", _hoisted_2$2, [
						createVNode(Icon_default, {
							name: "search",
							size: 16,
							class: "in-ico"
						}),
						withDirectives(createBaseVNode("input", {
							ref_key: "inputRef",
							ref: inputRef,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => q.value = $event),
							class: "in",
							placeholder: zh.value ? "搜索教程、术语，或直接跳到某个页面…" : "Search lessons, glossary, or jump to a page…",
							spellcheck: "false",
							onKeydown: [
								_cache[1] || (_cache[1] = withKeys(withModifiers(($event) => move(1), ["prevent"]), ["down"])),
								_cache[2] || (_cache[2] = withKeys(withModifiers(($event) => move(-1), ["prevent"]), ["up"])),
								_cache[3] || (_cache[3] = withKeys(withModifiers(($event) => runAt(cursor.value), ["prevent"]), ["enter"])),
								withKeys(withModifiers(close, ["prevent"]), ["esc"])
							]
						}, null, 40, _hoisted_3$1), [[vModelText, q.value]]),
						_cache[4] || (_cache[4] = createBaseVNode("span", { class: "kbd" }, "Esc", -1))
					]),
					createBaseVNode("div", {
						ref_key: "listRef",
						ref: listRef,
						class: "list"
					}, [(openBlock(true), createElementBlock(Fragment, null, renderList(grouped.value, (g) => {
						return openBlock(), createElementBlock(Fragment, { key: g.label }, [createBaseVNode("div", _hoisted_4$1, toDisplayString(g.label), 1), (openBlock(true), createElementBlock(Fragment, null, renderList(g.rows, (r, i) => {
							return openBlock(), createElementBlock("button", {
								key: r.key,
								class: normalizeClass(["row", { active: cursor.value === g.start + i }]),
								onMouseenter: ($event) => cursor.value = g.start + i,
								onClick: ($event) => runAt(g.start + i)
							}, [
								createBaseVNode("span", _hoisted_6$1, [createVNode(Icon_default, {
									name: r.icon,
									size: 14
								}, null, 8, ["name"])]),
								createBaseVNode("span", _hoisted_7$1, [createBaseVNode("span", _hoisted_8$1, toDisplayString(r.title), 1), r.sub ? (openBlock(), createElementBlock("span", _hoisted_9$1, toDisplayString(r.sub), 1)) : createCommentVNode("", true)]),
								r.hint ? (openBlock(), createElementBlock("span", _hoisted_10$1, toDisplayString(r.hint), 1)) : (openBlock(), createBlock(Icon_default, {
									key: 1,
									name: "arrow-right",
									size: 13,
									class: "r-arrow"
								}))
							], 42, _hoisted_5$1);
						}), 128))], 64);
					}), 128)), !rows.value.length ? (openBlock(), createElementBlock("div", _hoisted_11, toDisplayString(zh.value ? "没有匹配项" : "No matches"), 1)) : createCommentVNode("", true)], 512),
					createBaseVNode("footer", _hoisted_12, [
						createBaseVNode("span", null, [
							_cache[5] || (_cache[5] = createBaseVNode("span", { class: "kbd" }, "↑", -1)),
							_cache[6] || (_cache[6] = createBaseVNode("span", { class: "kbd" }, "↓", -1)),
							createTextVNode(" " + toDisplayString(zh.value ? "选择" : "move"), 1)
						]),
						createBaseVNode("span", null, [_cache[7] || (_cache[7] = createBaseVNode("span", { class: "kbd" }, "↵", -1)), createTextVNode(" " + toDisplayString(zh.value ? "打开" : "open"), 1)]),
						_cache[8] || (_cache[8] = createBaseVNode("span", { class: "grow" }, null, -1)),
						createBaseVNode("span", _hoisted_13, toDisplayString(zh.value ? "命令面板" : "Command palette"), 1)
					])
				])], 32)) : createCommentVNode("", true)]),
				_: 1
			});
		};
	}
}), [["__scopeId", "data-v-311f593d"]]);
// src/components/ShortcutsOverlay.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "head" };
var _hoisted_2$1 = { class: "h-ico" };
var _hoisted_3 = { class: "h-text" };
var _hoisted_4 = ["title"];
var _hoisted_5 = { class: "body" };
var _hoisted_6 = { class: "g-title" };
var _hoisted_7 = { class: "g-rows" };
var _hoisted_8 = { class: "r-keys" };
var _hoisted_9 = { class: "r-label" };
var _hoisted_10 = { class: "foot" };
// src/components/ShortcutsOverlay.vue
var ShortcutsOverlay_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ShortcutsOverlay",
	setup(__props) {
		/** 快捷键总览：? 唤出，纯展示，不拦截其它操作 */
		const zh = computed(() => theme.lang === "zh-CN");
		const groups = computed(() => [
			{
				label: zh.value ? "全局" : "Global",
				icon: "command",
				rows: [
					{
						keys: ["Ctrl", "K"],
						zh: "命令面板",
						en: "Command palette"
					},
					{
						keys: ["Ctrl", "F"],
						zh: "聚焦搜索框",
						en: "Focus search"
					},
					{
						keys: ["/"],
						zh: "快速搜索",
						en: "Quick search"
					},
					{
						keys: ["?"],
						zh: "打开这张表",
						en: "This panel"
					},
					{
						keys: ["Esc"],
						zh: "关闭浮层 / 清空搜索",
						en: "Close overlay / clear"
					}
				]
			},
			{
				label: zh.value ? "视图" : "Views",
				icon: "layers",
				rows: [
					{
						keys: ["Ctrl", "1"],
						zh: "学习",
						en: "Learn"
					},
					{
						keys: ["Ctrl", "2"],
						zh: "学习路径",
						en: "Paths"
					},
					{
						keys: ["Ctrl", "3"],
						zh: "情报检索",
						en: "Intel"
					},
					{
						keys: ["Ctrl", "4"],
						zh: "数据看板",
						en: "Dashboard"
					},
					{
						keys: ["Ctrl", "5"],
						zh: "错题本",
						en: "Review"
					},
					{
						keys: ["Ctrl", "6"],
						zh: "设置",
						en: "Settings"
					}
				]
			},
			{
				label: zh.value ? "列表" : "Lists",
				icon: "list",
				rows: [
					{
						keys: ["↑", "↓"],
						zh: "上一条 / 下一条",
						en: "Previous / next item"
					},
					{
						keys: ["Enter"],
						zh: "打开选中项",
						en: "Open selection"
					},
					{
						keys: ["右键"],
						zh: "上下文菜单",
						en: "Context menu"
					}
				]
			}
		]);
		function close() {
			helpOpen.value = false;
		}
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Transition, { name: "help" }, {
				default: withCtx(() => [unref(helpOpen) ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "backdrop",
					onMousedown: withModifiers(close, ["self"])
				}, [createBaseVNode("div", {
					class: "panel",
					role: "dialog",
					"aria-modal": "true",
					onKeydown: withKeys(close, ["esc"])
				}, [
					createBaseVNode("header", _hoisted_1$1, [
						createBaseVNode("span", _hoisted_2$1, [createVNode(Icon_default, {
							name: "command",
							size: 16
						})]),
						createBaseVNode("div", _hoisted_3, [createBaseVNode("h2", null, toDisplayString(zh.value ? "快捷键与操作" : "Shortcuts"), 1), createBaseVNode("p", null, toDisplayString(zh.value ? "全部功能都能用键盘走完，不依赖鼠标。" : "Everything can be driven from the keyboard."), 1)]),
						createBaseVNode("button", {
							class: "icon-btn",
							onClick: close,
							title: zh.value ? "关闭" : "Close"
						}, [createVNode(Icon_default, {
							name: "x",
							size: 15
						})], 8, _hoisted_4)
					]),
					createBaseVNode("div", _hoisted_5, [(openBlock(true), createElementBlock(Fragment, null, renderList(groups.value, (g) => {
						return openBlock(), createElementBlock("section", {
							key: g.label,
							class: "group"
						}, [createBaseVNode("h3", _hoisted_6, [createVNode(Icon_default, {
							name: g.icon,
							size: 13
						}, null, 8, ["name"]), createTextVNode(toDisplayString(g.label), 1)]), createBaseVNode("div", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(g.rows, (r) => {
							return openBlock(), createElementBlock("div", {
								key: r.zh,
								class: "r"
							}, [createBaseVNode("span", _hoisted_8, [(openBlock(true), createElementBlock(Fragment, null, renderList(r.keys, (k) => {
								return openBlock(), createElementBlock("span", {
									key: k,
									class: "kbd"
								}, toDisplayString(k), 1);
							}), 128))]), createBaseVNode("span", _hoisted_9, toDisplayString(zh.value ? r.zh : r.en), 1)]);
						}), 128))])]);
					}), 128))]),
					createBaseVNode("footer", _hoisted_10, [_cache[0] || (_cache[0] = createBaseVNode("span", { class: "dot" }, null, -1)), createBaseVNode("span", null, toDisplayString(zh.value ? "SentryDesk v0.7.1 · 本地运行，数据不出机器" : "SentryDesk v0.7.1 · local-first, nothing leaves your machine"), 1)])
				], 32)], 32)) : createCommentVNode("", true)]),
				_: 1
			});
		};
	}
}), [["__scopeId", "data-v-26ad42cc"]]);
// node_modules/.pnpm/@tauri-apps+api@2.12.4/node_modules/@tauri-apps/api/dpi.js
/**
* Size and position types for working with logical and physical pixels.
*
* Window and webview APIs report sizes and positions in **physical pixels** (actual
* screen pixels), while most browser APIs and the window creation options use
* **logical pixels** (physical pixels divided by the monitor scale factor). The
* classes in this module make the unit explicit and convert between the two.
*
* ```typescript
* import { getCurrentWindow } from '@tauri-apps/api/window';
*
* const appWindow = getCurrentWindow();
* const size = await appWindow.innerSize(); // PhysicalSize
* const logical = size.toLogical(await appWindow.scaleFactor());
* ```
*
* They also serialize into the shape `tauri::Size` / `tauri::Position` expect, so
* they can be passed straight to your own commands, see {@linkcode Size} and
* {@linkcode Position}.
*
* This package is also accessible with `window.__TAURI__.dpi` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
*
* @module
*/
/**
* A size represented in logical pixels.
* Logical pixels are scaled according to the window's DPI scale.
* Most browser APIs (i.e. `MouseEvent`'s `clientX`) will return logical pixels.
*
* For logical-pixel-based position, see {@linkcode LogicalPosition}.
*
* @since 2.0.0
*/
var LogicalSize = class {
	constructor(...args) {
		this.type = "Logical";
		if (args.length === 1) {
			if ("Logical" in args[0]) {
				this.width = args[0].Logical.width;
				this.height = args[0].Logical.height;
			} else {
				this.width = args[0].width;
				this.height = args[0].height;
			}
		} else {
			this.width = args[0];
			this.height = args[1];
		}
	}
	/**
	* Converts the logical size to a physical one.
	* @example
	* ```typescript
	* import { LogicalSize } from '@tauri-apps/api/dpi';
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	*
	* const appWindow = getCurrentWindow();
	* const factor = await appWindow.scaleFactor();
	* const size = new LogicalSize(400, 500);
	* const physical = size.toPhysical(factor);
	* ```
	*
	* @since 2.0.0
	*/
	toPhysical(scaleFactor) {
		return new PhysicalSize(this.width * scaleFactor, this.height * scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return {
			width: this.width,
			height: this.height
		};
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
/**
* A size represented in physical pixels.
*
* Physical pixels represent actual screen pixels, and are DPI-independent.
* For high-DPI windows, this means that any point in the window on the screen
* will have a different position in logical pixels {@linkcode LogicalSize}.
*
* For physical-pixel-based position, see {@linkcode PhysicalPosition}.
*
* @since 2.0.0
*/
var PhysicalSize = class {
	constructor(...args) {
		this.type = "Physical";
		if (args.length === 1) {
			if ("Physical" in args[0]) {
				this.width = args[0].Physical.width;
				this.height = args[0].Physical.height;
			} else {
				this.width = args[0].width;
				this.height = args[0].height;
			}
		} else {
			this.width = args[0];
			this.height = args[1];
		}
	}
	/**
	* Converts the physical size to a logical one.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const appWindow = getCurrentWindow();
	* const factor = await appWindow.scaleFactor();
	* const size = await appWindow.innerSize(); // PhysicalSize
	* const logical = size.toLogical(factor);
	* ```
	*
	* @since 2.0.0
	*/
	toLogical(scaleFactor) {
		return new LogicalSize(this.width / scaleFactor, this.height / scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return {
			width: this.width,
			height: this.height
		};
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
/**
* A size represented either in physical or in logical pixels.
*
* This type is basically a union type of {@linkcode LogicalSize} and {@linkcode PhysicalSize}
* but comes in handy when using `tauri::Size` in Rust as an argument to a command, as this class
* automatically serializes into a valid format so it can be deserialized correctly into `tauri::Size`
*
* So instead of
* ```typescript
* import { invoke } from '@tauri-apps/api/core';
* import { LogicalSize, PhysicalSize } from '@tauri-apps/api/dpi';
*
* const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
* const validSize = size instanceof LogicalSize
*   ? { Logical: { width: size.width, height: size.height } }
*   : { Physical: { width: size.width, height: size.height } }
* await invoke("do_something_with_size", { size: validSize });
* ```
*
* You can just use {@linkcode Size}
* ```typescript
* import { invoke } from '@tauri-apps/api/core';
* import { LogicalSize, PhysicalSize, Size } from '@tauri-apps/api/dpi';
*
* const size: LogicalSize | PhysicalSize = someFunction(); // where someFunction returns either LogicalSize or PhysicalSize
* const validSize = new Size(size);
* await invoke("do_something_with_size", { size: validSize });
* ```
*
* @since 2.1.0
*/
var Size = class {
	constructor(size) {
		this.size = size;
	}
	/**
	* Converts the wrapped size to a logical one.
	*
	* Returns the inner value untouched when it already is a {@linkcode LogicalSize}.
	*
	* @param scaleFactor The monitor scale factor, e.g. `await appWindow.scaleFactor()`.
	*
	* @since 2.1.0
	*/
	toLogical(scaleFactor) {
		return this.size instanceof LogicalSize ? this.size : this.size.toLogical(scaleFactor);
	}
	/**
	* Converts the wrapped size to a physical one.
	*
	* Returns the inner value untouched when it already is a {@linkcode PhysicalSize}.
	*
	* @param scaleFactor The monitor scale factor, e.g. `await appWindow.scaleFactor()`.
	*
	* @since 2.1.0
	*/
	toPhysical(scaleFactor) {
		return this.size instanceof PhysicalSize ? this.size : this.size.toPhysical(scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return { [`${this.size.type}`]: {
			width: this.size.width,
			height: this.size.height
		} };
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
/**
* A position represented in logical pixels.
* For an explanation of what logical pixels are, see description of {@linkcode LogicalSize}.
*
* @since 2.0.0
*/
var LogicalPosition = class {
	constructor(...args) {
		this.type = "Logical";
		if (args.length === 1) {
			if ("Logical" in args[0]) {
				this.x = args[0].Logical.x;
				this.y = args[0].Logical.y;
			} else {
				this.x = args[0].x;
				this.y = args[0].y;
			}
		} else {
			this.x = args[0];
			this.y = args[1];
		}
	}
	/**
	* Converts the logical position to a physical one.
	* @example
	* ```typescript
	* import { LogicalPosition } from '@tauri-apps/api/dpi';
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	*
	* const appWindow = getCurrentWindow();
	* const factor = await appWindow.scaleFactor();
	* const position = new LogicalPosition(400, 500);
	* const physical = position.toPhysical(factor);
	* ```
	*
	* @since 2.0.0
	*/
	toPhysical(scaleFactor) {
		return new PhysicalPosition(this.x * scaleFactor, this.y * scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return {
			x: this.x,
			y: this.y
		};
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
/**
* A position represented in physical pixels.
*
* For an explanation of what physical pixels are, see description of {@linkcode PhysicalSize}.
*
* @since 2.0.0
*/
var PhysicalPosition = class {
	constructor(...args) {
		this.type = "Physical";
		if (args.length === 1) {
			if ("Physical" in args[0]) {
				this.x = args[0].Physical.x;
				this.y = args[0].Physical.y;
			} else {
				this.x = args[0].x;
				this.y = args[0].y;
			}
		} else {
			this.x = args[0];
			this.y = args[1];
		}
	}
	/**
	* Converts the physical position to a logical one.
	* @example
	* ```typescript
	* import { PhysicalPosition } from '@tauri-apps/api/dpi';
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	*
	* const appWindow = getCurrentWindow();
	* const factor = await appWindow.scaleFactor();
	* const position = new PhysicalPosition(400, 500);
	* const logical = position.toLogical(factor);
	* ```
	*
	* @since 2.0.0
	*/
	toLogical(scaleFactor) {
		return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return {
			x: this.x,
			y: this.y
		};
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
/**
* A position represented either in physical or in logical pixels.
*
* This type is basically a union type of {@linkcode LogicalPosition} and {@linkcode PhysicalPosition}
* but comes in handy when using `tauri::Position` in Rust as an argument to a command, as this class
* automatically serializes into a valid format so it can be deserialized correctly into `tauri::Position`
*
* So instead of
* ```typescript
* import { invoke } from '@tauri-apps/api/core';
* import { LogicalPosition, PhysicalPosition } from '@tauri-apps/api/dpi';
*
* const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
* const validPosition = position instanceof LogicalPosition
*   ? { Logical: { x: position.x, y: position.y } }
*   : { Physical: { x: position.x, y: position.y } }
* await invoke("do_something_with_position", { position: validPosition });
* ```
*
* You can just use {@linkcode Position}
* ```typescript
* import { invoke } from '@tauri-apps/api/core';
* import { LogicalPosition, PhysicalPosition, Position } from '@tauri-apps/api/dpi';
*
* const position: LogicalPosition | PhysicalPosition = someFunction(); // where someFunction returns either LogicalPosition or PhysicalPosition
* const validPosition = new Position(position);
* await invoke("do_something_with_position", { position: validPosition });
* ```
*
* @since 2.1.0
*/
var Position = class {
	constructor(position) {
		this.position = position;
	}
	/**
	* Converts the wrapped position to a logical one.
	*
	* Returns the inner value untouched when it already is a {@linkcode LogicalPosition}.
	*
	* @param scaleFactor The monitor scale factor, e.g. `await appWindow.scaleFactor()`.
	*
	* @since 2.1.0
	*/
	toLogical(scaleFactor) {
		return this.position instanceof LogicalPosition ? this.position : this.position.toLogical(scaleFactor);
	}
	/**
	* Converts the wrapped position to a physical one.
	*
	* Returns the inner value untouched when it already is a {@linkcode PhysicalPosition}.
	*
	* @param scaleFactor The monitor scale factor, e.g. `await appWindow.scaleFactor()`.
	*
	* @since 2.1.0
	*/
	toPhysical(scaleFactor) {
		return this.position instanceof PhysicalPosition ? this.position : this.position.toPhysical(scaleFactor);
	}
	[SERIALIZE_TO_IPC_FN]() {
		return { [`${this.position.type}`]: {
			x: this.position.x,
			y: this.position.y
		} };
	}
	toJSON() {
		return this[SERIALIZE_TO_IPC_FN]();
	}
};
// node_modules/.pnpm/@tauri-apps+api@2.12.4/node_modules/@tauri-apps/api/image.js
/**
* Load and inspect images to use as window icons, tray icons and menu item icons.
*
* Images live on the Rust side (they extend {@linkcode Resource}), the frontend only
* holds a handle to them. Call `close()` when an image is no longer needed, or let
* it be released when the app exits.
*
* @remarks {@linkcode Image.fromPath} and {@linkcode Image.fromBytes} decode PNG and ICO
* files, which requires the `image-png` and/or `image-ico` Cargo features of the
* `tauri` crate:
* ```toml
* [dependencies]
* tauri = { version = "2", features = ["image-png"] }
* ```
* {@linkcode Image.new} takes raw RGBA data and needs no extra feature.
*
* @remarks All commands used by this module are part of the `core:image:default`
* permission set, which is enabled by default.
*
* This package is also accessible with `window.__TAURI__.image` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
*
* @module
*/
/**
* An RGBA Image in row-major order from top to bottom.
*
* Instances are created with {@linkcode Image.new}, {@linkcode Image.fromBytes} or
* {@linkcode Image.fromPath} and can be passed wherever a {@linkcode JsImage} is
* accepted, such as `Window.setIcon`, `TrayIcon.setIcon` or an icon menu item.
*
* @example
* ```typescript
* import { Image } from '@tauri-apps/api/image';
* import { getCurrentWindow } from '@tauri-apps/api/window';
*
* const icon = await Image.fromPath('icons/icon.png');
* await getCurrentWindow().setIcon(icon);
* await icon.close();
* ```
*
* @since 2.0.0
*/
var Image = class Image extends Resource {
	/**
	* Creates an Image from a resource ID. For internal use only.
	*
	* @ignore
	*/
	constructor(rid) {
		super(rid);
	}
	/**
	* Creates a new Image using RGBA data, in row-major order from top to bottom, and with specified width and height.
	*
	* The buffer must contain exactly `width * height * 4` bytes.
	* Unlike {@linkcode Image.fromBytes} and {@linkcode Image.fromPath} this does not
	* decode an image format, so it requires no extra Cargo feature.
	*
	* @example
	* ```typescript
	* import { Image } from '@tauri-apps/api/image';
	*
	* // a 1x1 opaque red image
	* const image = await Image.new(new Uint8Array([255, 0, 0, 255]), 1, 1);
	* ```
	*
	* @since 2.0.0
	*/
	static async new(rgba, width, height) {
		return invoke("plugin:image|new", {
			rgba,
			width,
			height
		}).then((rid) => new Image(rid));
	}
	/**
	* Creates a new image using the provided bytes by inferring the file format.
	*
	* Only `ico` and `png` are supported (based on activated feature flag).
	*
	* Note that you need the `image-ico` or `image-png` Cargo features to use this API.
	* To enable it, change your Cargo.toml file:
	* ```toml
	* [dependencies]
	* tauri = { version = "...", features = ["...", "image-png"] }
	* ```
	*
	* @example
	* ```typescript
	* import { Image } from '@tauri-apps/api/image';
	*
	* const bytes = await fetch('/icon.png').then((r) => r.arrayBuffer());
	* const image = await Image.fromBytes(bytes);
	* ```
	*
	* @since 2.0.0
	*/
	static async fromBytes(bytes) {
		return invoke("plugin:image|from_bytes", { bytes }).then((rid) => new Image(rid));
	}
	/**
	* Creates a new image using the provided path.
	*
	* Only `ico` and `png` are supported (based on activated feature flag).
	*
	* Note that you need the `image-ico` or `image-png` Cargo features to use this API.
	* To enable it, change your Cargo.toml file:
	* ```toml
	* [dependencies]
	* tauri = { version = "...", features = ["...", "image-png"] }
	* ```
	*
	* The path is resolved on the Rust side, so it must be a path on the user's
	* machine (for example one returned by the path APIs or a bundled resource
	* resolved with `resolveResource`), not a frontend asset URL.
	*
	* @example
	* ```typescript
	* import { Image } from '@tauri-apps/api/image';
	* import { resolveResource } from '@tauri-apps/api/path';
	*
	* const image = await Image.fromPath(await resolveResource('icons/icon.png'));
	* ```
	*
	* @since 2.0.0
	*/
	static async fromPath(path) {
		return invoke("plugin:image|from_path", { path }).then((rid) => new Image(rid));
	}
	/**
	* Returns the RGBA data for this image, in row-major order from top to bottom.
	*
	* The returned buffer has `width * height * 4` bytes, see {@linkcode Image.size}.
	*
	* @example
	* ```typescript
	* import { Image } from '@tauri-apps/api/image';
	*
	* const image = await Image.fromPath('icons/icon.png');
	* const rgba = await image.rgba();
	* ```
	*
	* @since 2.0.0
	*/
	async rgba() {
		return invoke("plugin:image|rgba", { rid: this.rid }).then((buffer) => new Uint8Array(buffer));
	}
	/**
	* Returns the size of this image, in pixels.
	*
	* @example
	* ```typescript
	* import { Image } from '@tauri-apps/api/image';
	*
	* const image = await Image.fromPath('icons/icon.png');
	* const { width, height } = await image.size();
	* ```
	*
	* @since 2.0.0
	*/
	async size() {
		return invoke("plugin:image|size", { rid: this.rid });
	}
};
/**
* Transforms image from various types into a type acceptable by Rust.
*
* See [`tauri::image::JsImage`](https://docs.rs/tauri/2/tauri/image/enum.JsImage.html) for more information.
* Note the API signature is not stable and might change.
*/
function transformImage(image) {
	return image == null ? null : typeof image === "string" ? image : image instanceof Image ? image.rid : image;
}
// node_modules/.pnpm/@tauri-apps+api@2.12.4/node_modules/@tauri-apps/api/window.js
/**
* Provides APIs to create windows, communicate with other windows and manipulate the current window.
*
* #### Window events
*
* Events can be listened to using {@link Window.listen}:
* ```typescript
* import { getCurrentWindow } from "@tauri-apps/api/window";
* getCurrentWindow().listen("my-window-event", ({ event, payload }) => { });
* ```
*
* This package is also accessible with `window.__TAURI__.window` when [`app.withGlobalTauri`](https://v2.tauri.app/reference/config/#withglobaltauri) in `tauri.conf.json` is set to `true`.
*
* @remarks `core:window:default` only enables the getters (sizes, positions,
* monitors, title, theme and the `is*` queries). Creating a window and every
* method that changes one needs its own permission, which each member documents,
* added to a capability in your app.
*
* @module
*/
/**
* Attention type to request on a window.
*
* @since 1.0.0
*/
var UserAttentionType;
(function(UserAttentionType) {
	/**
	* #### Platform-specific
	* - **macOS:** Bounces the dock icon until the application is in focus.
	* - **Windows:** Flashes both the window and the taskbar button until the application is in focus.
	*/
	UserAttentionType[UserAttentionType["Critical"] = 1] = "Critical";
	/**
	* #### Platform-specific
	* - **macOS:** Bounces the dock icon once.
	* - **Windows:** Flashes the taskbar button until the application is in focus.
	*/
	UserAttentionType[UserAttentionType["Informational"] = 2] = "Informational";
})(UserAttentionType || (UserAttentionType = {}));
/**
* The event passed to a {@link Window.onCloseRequested} handler.
*
* Call {@link CloseRequestedEvent.preventDefault} to keep the window open, for
* example to ask the user to save their work first.
*/
var CloseRequestedEvent = class {
	constructor(event) {
		this._preventDefault = false;
		this.event = event.event;
		this.id = event.id;
	}
	/**
	* Prevents the window from being closed.
	*
	* Must be called before the handler returns (await anything you need first),
	* otherwise the window is destroyed as usual.
	*/
	preventDefault() {
		this._preventDefault = true;
	}
	/** Whether {@link CloseRequestedEvent.preventDefault} was called on this event. */
	isPreventDefault() {
		return this._preventDefault;
	}
};
/**
* The state of the taskbar/dock progress bar, see {@link Window.setProgressBar}.
*
* @since 2.0.0
*/
var ProgressBarStatus;
(function(ProgressBarStatus) {
	/**
	* Hide progress bar.
	*/
	ProgressBarStatus["None"] = "none";
	/**
	* Normal state.
	*/
	ProgressBarStatus["Normal"] = "normal";
	/**
	* Indeterminate state. **Treated as Normal on Linux and macOS**
	*/
	ProgressBarStatus["Indeterminate"] = "indeterminate";
	/**
	* Paused state. **Treated as Normal on Linux**
	*/
	ProgressBarStatus["Paused"] = "paused";
	/**
	* Error state. **Treated as Normal on linux**
	*/
	ProgressBarStatus["Error"] = "error";
})(ProgressBarStatus || (ProgressBarStatus = {}));
/**
* Get an instance of `Window` for the current window.
*
* @since 1.0.0
*/
function getCurrentWindow() {
	return new Window(window.__TAURI_INTERNALS__.metadata.currentWindow.label, { skip: true });
}
/**
* Gets a list of instances of `Window` for all available windows.
*
* @remarks Uses the `core:window:allow-get-all-windows` permission, which is part
* of `core:window:default`.
*
* @since 1.0.0
*/
async function getAllWindows() {
	return invoke("plugin:window|get_all_windows").then((windows) => windows.map((w) => new Window(w, { skip: true })));
}
/** @ignore */
var localTauriEvents = ["tauri://created", "tauri://error"];
/**
* Create new window or get a handle to an existing one.
*
* Windows are identified by a *label*  a unique identifier that can be used to reference it later.
* It may only contain alphanumeric characters `a-zA-Z` plus the following special characters `-`, `/`, `:` and `_`.
*
* @example
* ```typescript
* import { Window } from "@tauri-apps/api/window"
*
* const appWindow = new Window('theUniqueLabel');
*
* appWindow.once('tauri://created', function () {
*  // window successfully created
* });
* appWindow.once('tauri://error', function (e) {
*  // an error happened creating the window
* });
*
* // emit an event to the backend
* await appWindow.emit("some-event", "data");
* // listen to an event from the backend
* const unlisten = await appWindow.listen("event-name", e => {});
* unlisten();
* ```
*
* @since 2.0.0
*/
var Window = class {
	/**
	* Creates a new Window.
	* @example
	* ```typescript
	* import { Window } from '@tauri-apps/api/window';
	* const appWindow = new Window('my-label');
	* appWindow.once('tauri://created', function () {
	*  // window successfully created
	* });
	* appWindow.once('tauri://error', function (e) {
	*  // an error happened creating the window
	* });
	* ```
	*
	* @param label The unique window label. Must be alphanumeric: `a-zA-Z-/:_`.
	* @param options The window configuration, see {@link WindowOptions}.
	* @returns The {@link Window} instance to communicate with the window.
	*
	* @remarks Requires the `core:window:allow-create` permission (not included in
	* `core:window:default`).
	*/
	constructor(label, options = {}) {
		var _a;
		this.label = label;
		this.listeners = Object.create(null);
		if (!(options === null || options === void 0 ? void 0 : options.skip)) invoke("plugin:window|create", { options: {
			...options,
			parent: typeof options.parent === "string" ? options.parent : (_a = options.parent) === null || _a === void 0 ? void 0 : _a.label,
			label
		} }).then(async () => this.emit("tauri://created")).catch(async (e) => this.emit("tauri://error", e));
	}
	/**
	* Gets the Window associated with the given label.
	* @example
	* ```typescript
	* import { Window } from '@tauri-apps/api/window';
	* const mainWindow = Window.getByLabel('main');
	* ```
	*
	* @param label The window label.
	* @returns The Window instance to communicate with the window or null if the window doesn't exist.
	*/
	static async getByLabel(label) {
		var _a;
		return (_a = (await getAllWindows()).find((w) => w.label === label)) !== null && _a !== void 0 ? _a : null;
	}
	/**
	* Get an instance of `Window` for the current window.
	*/
	static getCurrent() {
		return getCurrentWindow();
	}
	/**
	* Gets a list of instances of `Window` for all available windows.
	*/
	static async getAll() {
		return getAllWindows();
	}
	/**
	*  Gets the focused window.
	* @example
	* ```typescript
	* import { Window } from '@tauri-apps/api/window';
	* const focusedWindow = Window.getFocusedWindow();
	* ```
	*
	* @returns The Window instance or `undefined` if there is not any focused window.
	*/
	static async getFocusedWindow() {
		for (const w of await getAllWindows()) if (await w.isFocused()) return w;
		return null;
	}
	/**
	* Listen to an emitted event on this window.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const unlisten = await getCurrentWindow().listen<string>('state-changed', (event) => {
	*   console.log(`Got error: ${payload}`);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
	* @param handler Event handler.
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async listen(event, handler) {
		if (this._handleTauriEvent(event, handler)) return () => {
			const listeners = this.listeners[event];
			listeners.splice(listeners.indexOf(handler), 1);
		};
		return listen(event, handler, { target: {
			kind: "Window",
			label: this.label
		} });
	}
	/**
	* Listen to an emitted event on this window only once.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const unlisten = await getCurrentWindow().once<null>('initialized', (event) => {
	*   console.log(`Window initialized!`);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
	* @param handler Event handler.
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener removes itself after the first event and is also removed
	* automatically when this window is destroyed. Do call the returned function if
	* the listener's own scope ends before the event arrives.
	*/
	async once(event, handler) {
		if (this._handleTauriEvent(event, handler)) return () => {
			const listeners = this.listeners[event];
			listeners.splice(listeners.indexOf(handler), 1);
		};
		return once(event, handler, { target: {
			kind: "Window",
			label: this.label
		} });
	}
	/**
	* Emits an event to all {@link EventTarget|targets}.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().emit('window-loaded', { loggedIn: true, token: 'authToken' });
	* ```
	*
	* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
	* @param payload Event payload.
	*/
	async emit(event, payload) {
		if (localTauriEvents.includes(event)) {
			for (const handler of this.listeners[event] || []) handler({
				event,
				id: -1,
				payload
			});
			return;
		}
		return emit(event, payload);
	}
	/**
	* Emits an event to all {@link EventTarget|targets} matching the given target.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().emitTo('main', 'window-loaded', { loggedIn: true, token: 'authToken' });
	* ```
	* @param target Label of the target Window/Webview/WebviewWindow or raw {@link EventTarget} object.
	* @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
	* @param payload Event payload.
	*/
	async emitTo(target, event, payload) {
		if (localTauriEvents.includes(event)) {
			for (const handler of this.listeners[event] || []) handler({
				event,
				id: -1,
				payload
			});
			return;
		}
		return emitTo(target, event, payload);
	}
	/** @ignore */
	_handleTauriEvent(event, handler) {
		if (localTauriEvents.includes(event)) {
			if (!(event in this.listeners)) this.listeners[event] = [handler];
			else this.listeners[event].push(handler);
			return true;
		}
		return false;
	}
	/**
	* The scale factor that can be used to map physical pixels to logical pixels.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const factor = await getCurrentWindow().scaleFactor();
	* ```
	*
	* @returns The window's monitor scale factor.
	*/
	async scaleFactor() {
		return invoke("plugin:window|scale_factor", { label: this.label });
	}
	/**
	* The position of the top-left hand corner of the window's client area relative to the top-left hand corner of the desktop.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const position = await getCurrentWindow().innerPosition();
	* ```
	*
	* @returns The window's inner position.
	*/
	async innerPosition() {
		return invoke("plugin:window|inner_position", { label: this.label }).then((p) => new PhysicalPosition(p));
	}
	/**
	* The position of the top-left hand corner of the window relative to the top-left hand corner of the desktop.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const position = await getCurrentWindow().outerPosition();
	* ```
	*
	* @returns The window's outer position.
	*/
	async outerPosition() {
		return invoke("plugin:window|outer_position", { label: this.label }).then((p) => new PhysicalPosition(p));
	}
	/**
	* The physical size of the window's client area.
	* The client area is the content of the window, excluding the title bar and borders.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const size = await getCurrentWindow().innerSize();
	* ```
	*
	* @returns The window's inner size.
	*/
	async innerSize() {
		return invoke("plugin:window|inner_size", { label: this.label }).then((s) => new PhysicalSize(s));
	}
	/**
	* The physical size of the entire window.
	* These dimensions include the title bar and borders. If you don't want that (and you usually don't), use inner_size instead.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const size = await getCurrentWindow().outerSize();
	* ```
	*
	* @returns The window's outer size.
	*/
	async outerSize() {
		return invoke("plugin:window|outer_size", { label: this.label }).then((s) => new PhysicalSize(s));
	}
	/**
	* Gets the window's current fullscreen state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const fullscreen = await getCurrentWindow().isFullscreen();
	* ```
	*
	* @returns Whether the window is in fullscreen mode or not.
	*/
	async isFullscreen() {
		return invoke("plugin:window|is_fullscreen", { label: this.label });
	}
	/**
	* Gets the window's current minimized state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const minimized = await getCurrentWindow().isMinimized();
	* ```
	*/
	async isMinimized() {
		return invoke("plugin:window|is_minimized", { label: this.label });
	}
	/**
	* Gets the window's current maximized state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const maximized = await getCurrentWindow().isMaximized();
	* ```
	*
	* @returns Whether the window is maximized or not.
	*/
	async isMaximized() {
		return invoke("plugin:window|is_maximized", { label: this.label });
	}
	/**
	* Gets the window's current focus state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const focused = await getCurrentWindow().isFocused();
	* ```
	*
	* @returns Whether the window is focused or not.
	*/
	async isFocused() {
		return invoke("plugin:window|is_focused", { label: this.label });
	}
	/**
	* Gets the window's current decorated state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const decorated = await getCurrentWindow().isDecorated();
	* ```
	*
	* @returns Whether the window is decorated or not.
	*/
	async isDecorated() {
		return invoke("plugin:window|is_decorated", { label: this.label });
	}
	/**
	* Gets the window's current resizable state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const resizable = await getCurrentWindow().isResizable();
	* ```
	*
	* @returns Whether the window is resizable or not.
	*/
	async isResizable() {
		return invoke("plugin:window|is_resizable", { label: this.label });
	}
	/**
	* Gets the window's native maximize button state.
	*
	* #### Platform-specific
	*
	* - **Linux / iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const maximizable = await getCurrentWindow().isMaximizable();
	* ```
	*
	* @returns Whether the window's native maximize button is enabled or not.
	*/
	async isMaximizable() {
		return invoke("plugin:window|is_maximizable", { label: this.label });
	}
	/**
	* Gets the window's native minimize button state.
	*
	* #### Platform-specific
	*
	* - **Linux / iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const minimizable = await getCurrentWindow().isMinimizable();
	* ```
	*
	* @returns Whether the window's native minimize button is enabled or not.
	*/
	async isMinimizable() {
		return invoke("plugin:window|is_minimizable", { label: this.label });
	}
	/**
	* Gets the window's native close button state.
	*
	* #### Platform-specific
	*
	* - **iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const closable = await getCurrentWindow().isClosable();
	* ```
	*
	* @returns Whether the window's native close button is enabled or not.
	*/
	async isClosable() {
		return invoke("plugin:window|is_closable", { label: this.label });
	}
	/**
	* Gets the window's current visible state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const visible = await getCurrentWindow().isVisible();
	* ```
	*
	* @returns Whether the window is visible or not.
	*/
	async isVisible() {
		return invoke("plugin:window|is_visible", { label: this.label });
	}
	/**
	* Gets the window's current title.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const title = await getCurrentWindow().title();
	* ```
	*/
	async title() {
		return invoke("plugin:window|title", { label: this.label });
	}
	/**
	* Gets the window's current theme.
	*
	* #### Platform-specific
	*
	* - **macOS:** Theme was introduced on macOS 10.14. Returns `light` on macOS 10.13 and below.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const theme = await getCurrentWindow().theme();
	* ```
	*
	* @returns The window theme.
	*/
	async theme() {
		return invoke("plugin:window|theme", { label: this.label });
	}
	/**
	* Whether the window is configured to be always on top of other windows or not.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const alwaysOnTop = await getCurrentWindow().isAlwaysOnTop();
	* ```
	*
	* @returns Whether the window is visible or not.
	*/
	async isAlwaysOnTop() {
		return invoke("plugin:window|is_always_on_top", { label: this.label });
	}
	/**
	* The name of the Android activity hosting this window.
	*
	* On Android each window is backed by its own activity. Use this to tell windows
	* apart from native code, or to match a window with the activity declared in your
	* `AndroidManifest.xml`.
	*
	* #### Platform-specific
	*
	* - **Android:** Supported.
	* - **Windows / Linux / macOS / iOS:** Unsupported, the call rejects because the
	*   command is not registered.
	*
	* See the [mobile multiwindow guide](https://tauri.app/learn/mobile-multiwindow/).
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const activity = await getCurrentWindow().activityName();
	* ```
	*
	* @returns The activity name.
	*
	* @remarks Uses the `core:window:allow-activity-name` permission, which is part
	* of `core:window:default`.
	*
	* @since 2.11.0
	*/
	async activityName() {
		return invoke("plugin:window|activity_name", { label: this.label });
	}
	/**
	* The identifier of the iOS scene hosting this window.
	*
	* On iOS each window is backed by a `UIScene`. Use this to tell windows apart
	* from native code, or to match a window with a scene configuration declared in
	* your `Info.plist`.
	*
	* #### Platform-specific
	*
	* - **iOS:** Supported.
	* - **Windows / Linux / macOS / Android:** Unsupported, the call rejects because
	*   the command is not registered.
	*
	* See the [mobile multiwindow guide](https://tauri.app/learn/mobile-multiwindow/).
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const scene = await getCurrentWindow().sceneIdentifier();
	* ```
	*
	* @returns The scene identifier.
	*
	* @remarks Uses the `core:window:allow-scene-identifier` permission, which is part
	* of `core:window:default`.
	*
	* @since 2.11.0
	*/
	async sceneIdentifier() {
		return invoke("plugin:window|scene_identifier", { label: this.label });
	}
	/**
	* Centers the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().center();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-center` permission (not included
	* in `core:window:default`).
	*/
	async center() {
		return invoke("plugin:window|center", { label: this.label });
	}
	/**
	*  Requests user attention to the window, this has no effect if the application
	* is already focused. How requesting for user attention manifests is platform dependent,
	* see `UserAttentionType` for details.
	*
	* Providing `null` will unset the request for user attention. Unsetting the request for
	* user attention might not be done automatically by the WM when the window receives input.
	*
	* #### Platform-specific
	*
	* - **macOS:** `null` has no effect.
	* - **Linux:** Urgency levels have the same effect.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().requestUserAttention();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-request-user-attention` permission (not included
	* in `core:window:default`).
	*/
	async requestUserAttention(requestType) {
		let requestType_ = null;
		if (requestType) {
			if (requestType === UserAttentionType.Critical) requestType_ = { type: "Critical" };
			else requestType_ = { type: "Informational" };
		}
		return invoke("plugin:window|request_user_attention", {
			label: this.label,
			value: requestType_
		});
	}
	/**
	* Updates the window resizable flag.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setResizable(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-resizable` permission (not included
	* in `core:window:default`).
	*/
	async setResizable(resizable) {
		return invoke("plugin:window|set_resizable", {
			label: this.label,
			value: resizable
		});
	}
	/**
	* Enable or disable the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setEnabled(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-enabled` permission (not included
	* in `core:window:default`).
	*
	* @since 2.0.0
	*/
	async setEnabled(enabled) {
		return invoke("plugin:window|set_enabled", {
			label: this.label,
			value: enabled
		});
	}
	/**
	* Whether the window is enabled or disabled.
	*
	* A disabled window ignores all user input; see {@link Window.setEnabled}.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* const enabled = await getCurrentWindow().isEnabled();
	* ```
	*
	* @returns `true` when the window accepts user input, `false` when it is disabled.
	*
	* @since 2.0.0
	*/
	async isEnabled() {
		return invoke("plugin:window|is_enabled", { label: this.label });
	}
	/**
	* Sets whether the window's native maximize button is enabled or not.
	* If resizable is set to false, this setting is ignored.
	*
	* #### Platform-specific
	*
	* - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
	* - **Linux / iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setMaximizable(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-maximizable` permission (not included
	* in `core:window:default`).
	*/
	async setMaximizable(maximizable) {
		return invoke("plugin:window|set_maximizable", {
			label: this.label,
			value: maximizable
		});
	}
	/**
	* Sets whether the window's native minimize button is enabled or not.
	*
	* #### Platform-specific
	*
	* - **Linux / iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setMinimizable(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-minimizable` permission (not included
	* in `core:window:default`).
	*/
	async setMinimizable(minimizable) {
		return invoke("plugin:window|set_minimizable", {
			label: this.label,
			value: minimizable
		});
	}
	/**
	* Sets whether the window's native close button is enabled or not.
	*
	* #### Platform-specific
	*
	* - **Linux:** GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible
	* - **iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setClosable(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-closable` permission (not included
	* in `core:window:default`).
	*/
	async setClosable(closable) {
		return invoke("plugin:window|set_closable", {
			label: this.label,
			value: closable
		});
	}
	/**
	* Sets the window title.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setTitle('Tauri');
	* ```
	*
	* @param title The new title
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-title` permission (not included
	* in `core:window:default`).
	*/
	async setTitle(title) {
		return invoke("plugin:window|set_title", {
			label: this.label,
			value: title
		});
	}
	/**
	* Maximizes the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().maximize();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-maximize` permission (not included
	* in `core:window:default`).
	*/
	async maximize() {
		return invoke("plugin:window|maximize", { label: this.label });
	}
	/**
	* Unmaximizes the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().unmaximize();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-unmaximize` permission (not included
	* in `core:window:default`).
	*/
	async unmaximize() {
		return invoke("plugin:window|unmaximize", { label: this.label });
	}
	/**
	* Toggles the window maximized state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().toggleMaximize();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-toggle-maximize` permission (not included
	* in `core:window:default`).
	*/
	async toggleMaximize() {
		return invoke("plugin:window|toggle_maximize", { label: this.label });
	}
	/**
	* Minimizes the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().minimize();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-minimize` permission (not included
	* in `core:window:default`).
	*/
	async minimize() {
		return invoke("plugin:window|minimize", { label: this.label });
	}
	/**
	* Unminimizes the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().unminimize();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-unminimize` permission (not included
	* in `core:window:default`).
	*/
	async unminimize() {
		return invoke("plugin:window|unminimize", { label: this.label });
	}
	/**
	* Sets the window visibility to true.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().show();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-show` permission (not included
	* in `core:window:default`).
	*/
	async show() {
		return invoke("plugin:window|show", { label: this.label });
	}
	/**
	* Sets the window visibility to false.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().hide();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-hide` permission (not included
	* in `core:window:default`).
	*/
	async hide() {
		return invoke("plugin:window|hide", { label: this.label });
	}
	/**
	* Closes the window.
	*
	* Note this emits a closeRequested event so you can intercept it. To force window close, use {@link Window.destroy}.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().close();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-close` permission (not included
	* in `core:window:default`).
	*/
	async close() {
		return invoke("plugin:window|close", { label: this.label });
	}
	/**
	* Destroys the window. Behaves like {@link Window.close} but forces the window close instead of emitting a closeRequested event.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().destroy();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-destroy` permission (not included
	* in `core:window:default`).
	*/
	async destroy() {
		return invoke("plugin:window|destroy", { label: this.label });
	}
	/**
	* Whether the window should have borders and bars.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setDecorations(false);
	* ```
	*
	* @param decorations Whether the window should have borders and bars.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-decorations` permission (not included
	* in `core:window:default`).
	*/
	async setDecorations(decorations) {
		return invoke("plugin:window|set_decorations", {
			label: this.label,
			value: decorations
		});
	}
	/**
	* Whether or not the window should have shadow.
	*
	* #### Platform-specific
	*
	* - **Windows:**
	*   - `false` has no effect on decorated window, shadows are always ON.
	*   - `true` will make undecorated window have a 1px white border,
	* and on Windows 11, it will have a rounded corners.
	* - **Linux:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setShadow(false);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-shadow` permission (not included
	* in `core:window:default`).
	*/
	async setShadow(enable) {
		return invoke("plugin:window|set_shadow", {
			label: this.label,
			value: enable
		});
	}
	/**
	* Applies platform-specific window effects such as Mica, Acrylic, Blur or the
	* macOS vibrancy materials.
	*
	* Requires the window to be transparent, so create it with `transparent: true`
	* (or set `transparent` in `tauri.conf.json`). Give the page a transparent or
	* translucent background as well, otherwise the effect is hidden behind your own
	* background color.
	*
	* Conflicting effects are resolved by applying the first supported one and
	* ignoring the rest, so you can list a Windows and a macOS effect together.
	*
	* #### Platform-specific
	*
	* - **Windows:** If the window uses decorations or shadows, you may need
	*   [this workaround](https://github.com/tauri-apps/tao/issues/72#issuecomment-975607891).
	* - **Linux:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow, Effect, EffectState } from '@tauri-apps/api/window';
	*
	* await getCurrentWindow().setEffects({
	*   effects: [Effect.Mica, Effect.Acrylic, Effect.UnderWindowBackground],
	*   state: EffectState.Active,
	*   radius: 8
	* });
	* ```
	*
	* @param effects The effects to apply, see {@link Effects}.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-effects` permission (not included
	* in `core:window:default`).
	*
	* @since 2.0.0
	*/
	async setEffects(effects) {
		return invoke("plugin:window|set_effects", {
			label: this.label,
			value: effects
		});
	}
	/**
	* Clear any applied effects if possible.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().clearEffects();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-effects` permission (not included
	* in `core:window:default`), the same one used by {@link Window.setEffects}.
	*
	* @since 2.0.0
	*/
	async clearEffects() {
		return invoke("plugin:window|set_effects", {
			label: this.label,
			value: null
		});
	}
	/**
	* Whether the window should always be on top of other windows.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setAlwaysOnTop(true);
	* ```
	*
	* @param alwaysOnTop Whether the window should always be on top of other windows or not.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-always-on-top` permission (not included
	* in `core:window:default`).
	*/
	async setAlwaysOnTop(alwaysOnTop) {
		return invoke("plugin:window|set_always_on_top", {
			label: this.label,
			value: alwaysOnTop
		});
	}
	/**
	* Whether the window should always be below other windows.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setAlwaysOnBottom(true);
	* ```
	*
	* @param alwaysOnBottom Whether the window should always be below other windows or not.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-always-on-bottom` permission (not included
	* in `core:window:default`).
	*/
	async setAlwaysOnBottom(alwaysOnBottom) {
		return invoke("plugin:window|set_always_on_bottom", {
			label: this.label,
			value: alwaysOnBottom
		});
	}
	/**
	* Prevents the window contents from being captured by other apps.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setContentProtected(true);
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-content-protected` permission (not included
	* in `core:window:default`).
	*/
	async setContentProtected(protected_) {
		return invoke("plugin:window|set_content_protected", {
			label: this.label,
			value: protected_
		});
	}
	/**
	* Resizes the window with a new inner size.
	* @example
	* ```typescript
	* import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
	* await getCurrentWindow().setSize(new LogicalSize(600, 500));
	* ```
	*
	* @param size The logical or physical inner size.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-size` permission (not included
	* in `core:window:default`).
	*/
	async setSize(size) {
		return invoke("plugin:window|set_size", {
			label: this.label,
			value: size instanceof Size ? size : new Size(size)
		});
	}
	/**
	* Sets the window minimum inner size. If the `size` argument is not provided, the constraint is unset.
	* @example
	* ```typescript
	* import { getCurrentWindow, PhysicalSize } from '@tauri-apps/api/window';
	* await getCurrentWindow().setMinSize(new PhysicalSize(600, 500));
	* ```
	*
	* @param size The logical or physical inner size, or `null` to unset the constraint.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-min-size` permission (not included
	* in `core:window:default`).
	*/
	async setMinSize(size) {
		return invoke("plugin:window|set_min_size", {
			label: this.label,
			value: size instanceof Size ? size : size ? new Size(size) : null
		});
	}
	/**
	* Sets the window maximum inner size. If the `size` argument is undefined, the constraint is unset.
	* @example
	* ```typescript
	* import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
	* await getCurrentWindow().setMaxSize(new LogicalSize(600, 500));
	* ```
	*
	* @param size The logical or physical inner size, or `null` to unset the constraint.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-max-size` permission (not included
	* in `core:window:default`).
	*/
	async setMaxSize(size) {
		return invoke("plugin:window|set_max_size", {
			label: this.label,
			value: size instanceof Size ? size : size ? new Size(size) : null
		});
	}
	/**
	* Sets the window inner size constraints.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setSizeConstraints({ minWidth: 300 });
	* ```
	*
	* @param constraints The inner size constraints in **logical pixels**, or `null`
	* to unset every constraint. Each field is optional and independent, so
	* `{ minWidth: 300 }` constrains only the width.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-size-constraints` permission (not included
	* in `core:window:default`).
	*/
	async setSizeConstraints(constraints) {
		function logical(pixel) {
			return pixel ? { Logical: pixel } : null;
		}
		return invoke("plugin:window|set_size_constraints", {
			label: this.label,
			value: {
				minWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minWidth),
				minHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.minHeight),
				maxWidth: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxWidth),
				maxHeight: logical(constraints === null || constraints === void 0 ? void 0 : constraints.maxHeight)
			}
		});
	}
	/**
	* Sets the window outer position.
	* @example
	* ```typescript
	* import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
	* await getCurrentWindow().setPosition(new LogicalPosition(600, 500));
	* ```
	*
	* @param position The new position, in logical or physical pixels.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-position` permission (not included
	* in `core:window:default`).
	*/
	async setPosition(position) {
		return invoke("plugin:window|set_position", {
			label: this.label,
			value: position instanceof Position ? position : new Position(position)
		});
	}
	/**
	* Sets the window fullscreen state.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setFullscreen(true);
	* ```
	*
	* @param fullscreen Whether the window should go to fullscreen or not.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-fullscreen` permission (not included
	* in `core:window:default`).
	*/
	async setFullscreen(fullscreen) {
		return invoke("plugin:window|set_fullscreen", {
			label: this.label,
			value: fullscreen
		});
	}
	/**
	* Sets the window as fullscreen on the monitor that contains the given physical position.
	*
	* Does nothing if no monitor contains the position.
	* @example
	* ```typescript
	* import { getCurrentWindow, availableMonitors } from '@tauri-apps/api/window';
	* const monitors = await availableMonitors();
	* if (monitors.length > 1) {
	*   await getCurrentWindow().setFullscreenOnMonitor(monitors[1].position);
	* }
	* ```
	*
	* @param position A physical position inside the target monitor, such as {@linkcode Monitor.position}.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-fullscreen-on-monitor` permission (not included
	* in `core:window:default`).
	*
	* @since 2.12.0
	*/
	async setFullscreenOnMonitor(position) {
		return invoke("plugin:window|set_fullscreen_on_monitor", {
			label: this.label,
			value: position
		});
	}
	/**
	* On macOS, Toggles a fullscreen mode that doesn’t require a new macOS space. Returns a boolean indicating whether the transition was successful (this won't work if the window was already in the native fullscreen).
	* This is how fullscreen used to work on macOS in versions before Lion. And allows the user to have a fullscreen window without using another space or taking control over the entire monitor.
	*
	* On other platforms, this is the same as {@link Window.setFullscreen}.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setSimpleFullscreen(true);
	* ```
	*
	* @param fullscreen Whether the window should go to simple fullscreen or not.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-simple-fullscreen` permission (not included
	* in `core:window:default`).
	*
	* @since 2.8.0
	*/
	async setSimpleFullscreen(fullscreen) {
		return invoke("plugin:window|set_simple_fullscreen", {
			label: this.label,
			value: fullscreen
		});
	}
	/**
	* Bring the window to front and focus.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setFocus();
	* ```
	*
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-focus` permission (not included
	* in `core:window:default`).
	*/
	async setFocus() {
		return invoke("plugin:window|set_focus", { label: this.label });
	}
	/**
	* Sets whether the window can be focused.
	*
	* #### Platform-specific
	*
	* - **macOS**: If the window is already focused, it is not possible to unfocus it after calling `set_focusable(false)`.
	*   In this case, you might consider calling {@link Window.setFocus} but it will move the window to the back i.e. at the bottom in terms of z-order.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setFocusable(true);
	* ```
	*
	* @param focusable Whether the window can be focused.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-focusable` permission (not included
	* in `core:window:default`).
	*/
	async setFocusable(focusable) {
		return invoke("plugin:window|set_focusable", {
			label: this.label,
			value: focusable
		});
	}
	/**
	* Sets the window icon.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setIcon('/tauri/awesome.png');
	* ```
	*
	* Note that you may need the `image-ico` or `image-png` Cargo features to use this API.
	* To enable it, change your Cargo.toml file:
	* ```toml
	* [dependencies]
	* tauri = { version = "...", features = ["...", "image-png"] }
	* ```
	*
	* @param icon Icon bytes or path to the icon file.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-icon` permission (not included
	* in `core:window:default`).
	*/
	async setIcon(icon) {
		return invoke("plugin:window|set_icon", {
			label: this.label,
			value: transformImage(icon)
		});
	}
	/**
	* Whether the window icon should be hidden from the taskbar or not.
	*
	* #### Platform-specific
	*
	* - **macOS:** Unsupported.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setSkipTaskbar(true);
	* ```
	*
	* @param skip true to hide window icon, false to show it.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-skip-taskbar` permission (not included
	* in `core:window:default`).
	*/
	async setSkipTaskbar(skip) {
		return invoke("plugin:window|set_skip_taskbar", {
			label: this.label,
			value: skip
		});
	}
	/**
	* Grabs the cursor, preventing it from leaving the window.
	*
	* There's no guarantee that the cursor will be hidden. You should
	* hide it by yourself if you want so.
	*
	* #### Platform-specific
	*
	* - **Linux:** Unsupported.
	* - **macOS:** This locks the cursor in a fixed location, which looks visually awkward.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setCursorGrab(true);
	* ```
	*
	* @param grab `true` to grab the cursor icon, `false` to release it.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-cursor-grab` permission (not included
	* in `core:window:default`).
	*/
	async setCursorGrab(grab) {
		return invoke("plugin:window|set_cursor_grab", {
			label: this.label,
			value: grab
		});
	}
	/**
	* Modifies the cursor's visibility.
	*
	* #### Platform-specific
	*
	* - **Windows:** The cursor is only hidden within the confines of the window.
	* - **macOS:** The cursor is hidden as long as the window has input focus, even if the cursor is
	*   outside of the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setCursorVisible(false);
	* ```
	*
	* @param visible If `false`, this will hide the cursor. If `true`, this will show the cursor.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-cursor-visible` permission (not included
	* in `core:window:default`).
	*/
	async setCursorVisible(visible) {
		return invoke("plugin:window|set_cursor_visible", {
			label: this.label,
			value: visible
		});
	}
	/**
	* Modifies the cursor icon of the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setCursorIcon('help');
	* ```
	*
	* @param icon The new cursor icon.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-cursor-icon` permission (not included
	* in `core:window:default`).
	*/
	async setCursorIcon(icon) {
		return invoke("plugin:window|set_cursor_icon", {
			label: this.label,
			value: icon
		});
	}
	/**
	* Sets the window background color.
	*
	* #### Platform-specific:
	*
	* - **Windows:** alpha channel is ignored.
	* - **iOS / Android:** Unsupported.
	*
	* This sets the color of the window itself, which is what you see while the
	* webview is still loading or behind a transparent page. To also change the
	* webview background use {@link WebviewWindow.setBackgroundColor}.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setBackgroundColor('#2f2f2f');
	* // also accepts an RGB/RGBA tuple or an object
	* await getCurrentWindow().setBackgroundColor([47, 47, 47, 255]);
	* ```
	*
	* @param color The new background color, see {@link Color}.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-background-color` permission (not included
	* in `core:window:default`).
	*
	* @since 2.1.0
	*/
	async setBackgroundColor(color) {
		return invoke("plugin:window|set_background_color", {
			label: this.label,
			value: color
		});
	}
	/**
	* Changes the position of the cursor in window coordinates.
	* @example
	* ```typescript
	* import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window';
	* await getCurrentWindow().setCursorPosition(new LogicalPosition(600, 300));
	* ```
	*
	* @param position The new cursor position.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-cursor-position` permission (not included
	* in `core:window:default`).
	*/
	async setCursorPosition(position) {
		return invoke("plugin:window|set_cursor_position", {
			label: this.label,
			value: position instanceof Position ? position : new Position(position)
		});
	}
	/**
	* Changes the cursor events behavior.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setIgnoreCursorEvents(true);
	* ```
	*
	* @param ignore `true` to ignore the cursor events; `false` to process them as usual.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-ignore-cursor-events` permission (not included
	* in `core:window:default`).
	*/
	async setIgnoreCursorEvents(ignore) {
		return invoke("plugin:window|set_ignore_cursor_events", {
			label: this.label,
			value: ignore
		});
	}
	/**
	* Starts dragging the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().startDragging();
	* ```
	*
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-start-dragging` permission (not included
	* in `core:window:default`).
	*/
	async startDragging() {
		return invoke("plugin:window|start_dragging", { label: this.label });
	}
	/**
	* Starts resize-dragging the window.
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().startResizeDragging();
	* ```
	*
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-start-resize-dragging` permission (not included
	* in `core:window:default`).
	*/
	async startResizeDragging(direction) {
		return invoke("plugin:window|start_resize_dragging", {
			label: this.label,
			value: direction
		});
	}
	/**
	* Sets the badge count. It is app wide and not specific to this window.
	*
	* #### Platform-specific
	*
	* - **Windows**: Unsupported. Use {@linkcode Window.setOverlayIcon} instead.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setBadgeCount(5);
	* ```
	*
	* @param count The badge count. Use `undefined` to remove the badge.
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-badge-count` permission (not included
	* in `core:window:default`).
	*/
	async setBadgeCount(count) {
		return invoke("plugin:window|set_badge_count", {
			label: this.label,
			value: count
		});
	}
	/**
	* Sets the badge label shown on the app's dock icon. **macOS only**
	*
	* Unlike {@linkcode Window.setBadgeCount}, which takes a number, this shows
	* arbitrary short text. It is app-wide and not specific to this window.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setBadgeLabel("Hello");
	* ```
	*
	* @param label The badge label. Use `undefined` to remove the badge.
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-badge-label` permission (not included
	* in `core:window:default`).
	*/
	async setBadgeLabel(label) {
		return invoke("plugin:window|set_badge_label", {
			label: this.label,
			value: label
		});
	}
	/**
	* Sets the overlay icon. **Windows only**
	* The overlay icon can be set for every window.
	*
	*
	* Note that you may need the `image-ico` or `image-png` Cargo features to use this API.
	* To enable it, change your Cargo.toml file:
	*
	* ```toml
	* [dependencies]
	* tauri = { version = "...", features = ["...", "image-png"] }
	* ```
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setOverlayIcon("/tauri/awesome.png");
	* ```
	*
	* @param icon Icon bytes or path to the icon file. Use `undefined` to remove the overlay icon.
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-overlay-icon` permission (not included
	* in `core:window:default`).
	*/
	async setOverlayIcon(icon) {
		return invoke("plugin:window|set_overlay_icon", {
			label: this.label,
			value: icon ? transformImage(icon) : void 0
		});
	}
	/**
	* Sets the taskbar progress state.
	*
	* #### Platform-specific
	*
	* - **Linux / macOS**: Progress bar is app-wide and not specific to this window.
	* - **Linux**: Only supported desktop environments with `libunity` (e.g. GNOME).
	*
	* @example
	* ```typescript
	* import { getCurrentWindow, ProgressBarStatus } from '@tauri-apps/api/window';
	* await getCurrentWindow().setProgressBar({
	*   status: ProgressBarStatus.Normal,
	*   progress: 50,
	* });
	* ```
	*
	* @return A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-progress-bar` permission (not included
	* in `core:window:default`).
	*/
	async setProgressBar(state) {
		return invoke("plugin:window|set_progress_bar", {
			label: this.label,
			value: state
		});
	}
	/**
	* Sets whether the window should be visible on all workspaces or virtual desktops.
	*
	* #### Platform-specific
	*
	* - **Windows / iOS / Android:** Unsupported.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setVisibleOnAllWorkspaces(true);
	* ```
	*
	* @param visible Whether the window should follow the user across workspaces.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-visible-on-all-workspaces` permission (not included
	* in `core:window:default`).
	*
	* @since 2.0.0
	*/
	async setVisibleOnAllWorkspaces(visible) {
		return invoke("plugin:window|set_visible_on_all_workspaces", {
			label: this.label,
			value: visible
		});
	}
	/**
	* Sets the title bar style. **macOS only**.
	*
	* Use `transparent` or `overlay` to build a custom title bar: with `overlay` the
	* page extends under the title bar and only the traffic lights remain, so leave
	* room for them in your layout and pair it with {@link Window.startDragging} on a
	* draggable region.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setTitleBarStyle('overlay');
	* ```
	*
	* @param style The new title bar style, see {@link TitleBarStyle}.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-title-bar-style` permission (not included
	* in `core:window:default`).
	*
	* @since 2.0.0
	*/
	async setTitleBarStyle(style) {
		return invoke("plugin:window|set_title_bar_style", {
			label: this.label,
			value: style
		});
	}
	/**
	* Set window theme, pass in `null` or `undefined` to follow system theme
	*
	* #### Platform-specific
	*
	* - **Linux / macOS**: Theme is app-wide and not specific to this window.
	* - **iOS / Android:** Unsupported.
	*
	* Use {@link Window.theme} to read the effective theme and
	* {@link Window.onThemeChanged} to react to changes.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from '@tauri-apps/api/window';
	* await getCurrentWindow().setTheme('dark');
	* // follow the system theme again
	* await getCurrentWindow().setTheme(null);
	* ```
	*
	* @param theme The theme to apply, or `null`/`undefined` to follow the system theme.
	* @returns A promise indicating the success or failure of the operation.
	*
	* @remarks Requires the `core:window:allow-set-theme` permission (not included
	* in `core:window:default`).
	*
	* @since 2.0.0
	*/
	async setTheme(theme) {
		return invoke("plugin:window|set_theme", {
			label: this.label,
			value: theme
		});
	}
	/**
	* Listen to window resize.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onResized(({ payload: size }) => {
	*  console.log('Window resized', size);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onResized(handler) {
		return this.listen(TauriEvent.WINDOW_RESIZED, (e) => {
			e.payload = new PhysicalSize(e.payload);
			handler(e);
		});
	}
	/**
	* Listen to window move.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onMoved(({ payload: position }) => {
	*  console.log('Window moved', position);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onMoved(handler) {
		return this.listen(TauriEvent.WINDOW_MOVED, (e) => {
			e.payload = new PhysicalPosition(e.payload);
			handler(e);
		});
	}
	/**
	* Listen to window close requested. Emitted when the user requests to closes the window.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* // `confirm` comes from the dialog plugin, which you have to add separately:
	* // `pnpm tauri add dialog`
	* import { confirm } from '@tauri-apps/plugin-dialog';
	* const unlisten = await getCurrentWindow().onCloseRequested(async (event) => {
	*   const confirmed = await confirm('Are you sure?');
	*   if (!confirmed) {
	*     // user did not confirm closing the window; let's prevent it
	*     event.preventDefault();
	*   }
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onCloseRequested(handler) {
		return this.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (event) => {
			const evt = new CloseRequestedEvent(event);
			await handler(evt);
			if (!evt.isPreventDefault()) await this.destroy();
		});
	}
	/**
	* Listen to a file drop event.
	* The listener is triggered when the user hovers the selected files on the webview,
	* drops the files or cancels the operation.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onDragDropEvent((event) => {
	*  if (event.payload.type === 'over') {
	*    console.log('User hovering', event.payload.position);
	*  } else if (event.payload.type === 'drop') {
	*    console.log('User dropped', event.payload.paths);
	*  } else {
	*    console.log('File drop cancelled');
	*  }
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onDragDropEvent(handler) {
		const unlistenDrag = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
			handler({
				...event,
				payload: {
					type: "enter",
					paths: event.payload.paths,
					position: new PhysicalPosition(event.payload.position)
				}
			});
		});
		const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
			handler({
				...event,
				payload: {
					type: "over",
					position: new PhysicalPosition(event.payload.position)
				}
			});
		});
		const unlistenDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
			handler({
				...event,
				payload: {
					type: "drop",
					paths: event.payload.paths,
					position: new PhysicalPosition(event.payload.position)
				}
			});
		});
		const unlistenCancel = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
			handler({
				...event,
				payload: { type: "leave" }
			});
		});
		return async () => {
			await Promise.all([
				unlistenDrag(),
				unlistenDrop(),
				unlistenDragOver(),
				unlistenCancel()
			]);
		};
	}
	/**
	* Listen to window focus change.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
	*  console.log('Focus changed, window is focused? ' + focused);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onFocusChanged(handler) {
		const unlistenFocus = await this.listen(TauriEvent.WINDOW_FOCUS, (event) => {
			handler({
				...event,
				payload: true
			});
		});
		const unlistenBlur = await this.listen(TauriEvent.WINDOW_BLUR, (event) => {
			handler({
				...event,
				payload: false
			});
		});
		return async () => {
			await Promise.all([unlistenFocus(), unlistenBlur()]);
		};
	}
	/**
	* Listen to window scale change. Emitted when the window's scale factor has changed.
	* The following user actions can cause DPI changes:
	* - Changing the display's resolution.
	* - Changing the display's scale factor (e.g. in Control Panel on Windows).
	* - Moving the window to a display with a different scale factor.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onScaleChanged(({ payload }) => {
	*  console.log('Scale changed', payload.scaleFactor, payload.size);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onScaleChanged(handler) {
		return this.listen(TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, handler);
	}
	/**
	* Listen to the system theme change.
	*
	* @example
	* ```typescript
	* import { getCurrentWindow } from "@tauri-apps/api/window";
	* const unlisten = await getCurrentWindow().onThemeChanged(({ payload: theme }) => {
	*  console.log('New theme: ' + theme);
	* });
	*
	* // call unlisten when your handler goes out of scope e.g. the component is unmounted
	* unlisten();
	* ```
	*
	* @returns A promise resolving to a function to unlisten to the event.
	*
	* @remarks The listener is removed automatically when this window is destroyed,
	* so you do not need to unlisten just because the window is closing. Do call the
	* returned function when the listener's own scope ends, e.g. on page navigation
	* or when a component unmounts.
	*/
	async onThemeChanged(handler) {
		return this.listen(TauriEvent.WINDOW_THEME_CHANGED, handler);
	}
};
/**
* Background throttling policy
*
* @since 2.0.0
*/
var BackgroundThrottlingPolicy;
(function(BackgroundThrottlingPolicy) {
	BackgroundThrottlingPolicy["Disabled"] = "disabled";
	BackgroundThrottlingPolicy["Throttle"] = "throttle";
	BackgroundThrottlingPolicy["Suspend"] = "suspend";
})(BackgroundThrottlingPolicy || (BackgroundThrottlingPolicy = {}));
/**
* The scrollbar style to use in the webview.
*
* ## Platform-specific
*
* **Windows**: This option must be given the same value for all webviews.
*
* @since 2.8.0
*/
var ScrollBarStyle;
(function(ScrollBarStyle) {
	/**
	* The default scrollbar style for the webview.
	*/
	ScrollBarStyle["Default"] = "default";
	/**
	* Fluent UI style overlay scrollbars. **Windows Only**
	*
	* Requires WebView2 Runtime version 125.0.2535.41 or higher, does nothing on older versions,
	* see https://learn.microsoft.com/en-us/microsoft-edge/webview2/release-notes/?tabs=dotnetcsharp#10253541
	*/
	ScrollBarStyle["FluentOverlay"] = "fluentOverlay";
})(ScrollBarStyle || (ScrollBarStyle = {}));
/**
* Platform-specific window effects
*
* @since 2.0.0
*/
var Effect;
(function(Effect) {
	/**
	* A default material appropriate for the view's effectiveAppearance.  **macOS 10.14-**
	*
	* @deprecated since macOS 10.14. You should instead choose an appropriate semantic material.
	*/
	Effect["AppearanceBased"] = "appearanceBased";
	/**
	*  **macOS 10.14-**
	*
	* @deprecated since macOS 10.14. Use a semantic material instead.
	*/
	Effect["Light"] = "light";
	/**
	*  **macOS 10.14-**
	*
	* @deprecated since macOS 10.14. Use a semantic material instead.
	*/
	Effect["Dark"] = "dark";
	/**
	*  **macOS 10.14-**
	*
	* @deprecated since macOS 10.14. Use a semantic material instead.
	*/
	Effect["MediumLight"] = "mediumLight";
	/**
	*  **macOS 10.14-**
	*
	* @deprecated since macOS 10.14. Use a semantic material instead.
	*/
	Effect["UltraDark"] = "ultraDark";
	/**
	*  **macOS 10.10+**
	*/
	Effect["Titlebar"] = "titlebar";
	/**
	*  **macOS 10.10+**
	*/
	Effect["Selection"] = "selection";
	/**
	*  **macOS 10.11+**
	*/
	Effect["Menu"] = "menu";
	/**
	*  **macOS 10.11+**
	*/
	Effect["Popover"] = "popover";
	/**
	*  **macOS 10.11+**
	*/
	Effect["Sidebar"] = "sidebar";
	/**
	*  **macOS 10.14+**
	*/
	Effect["HeaderView"] = "headerView";
	/**
	*  **macOS 10.14+**
	*/
	Effect["Sheet"] = "sheet";
	/**
	*  **macOS 10.14+**
	*/
	Effect["WindowBackground"] = "windowBackground";
	/**
	*  **macOS 10.14+**
	*/
	Effect["HudWindow"] = "hudWindow";
	/**
	*  **macOS 10.14+**
	*/
	Effect["FullScreenUI"] = "fullScreenUI";
	/**
	*  **macOS 10.14+**
	*/
	Effect["Tooltip"] = "tooltip";
	/**
	*  **macOS 10.14+**
	*/
	Effect["ContentBackground"] = "contentBackground";
	/**
	*  **macOS 10.14+**
	*/
	Effect["UnderWindowBackground"] = "underWindowBackground";
	/**
	*  **macOS 10.14+**
	*/
	Effect["UnderPageBackground"] = "underPageBackground";
	/**
	*  **macOS 26.0+**
	*/
	Effect["LiquidGlassRegular"] = "liquidGlassRegular";
	/**
	*  **macOS 26.0+**
	*/
	Effect["LiquidGlassClear"] = "liquidGlassClear";
	/**
	*  **Windows 11 Only**
	*/
	Effect["Mica"] = "mica";
	/**
	* **Windows 7/10/11(22H1) Only**
	*
	* #### Notes
	*
	* This effect has bad performance when resizing/dragging the window on Windows 11 build 22621.
	*/
	Effect["Blur"] = "blur";
	/**
	* **Windows 10/11**
	*
	* #### Notes
	*
	* This effect has bad performance when resizing/dragging the window on Windows 10 v1903+ and Windows 11 build 22000.
	*/
	Effect["Acrylic"] = "acrylic";
	/**
	* Tabbed effect that matches the system dark preference **Windows 11 Only**
	*/
	Effect["Tabbed"] = "tabbed";
	/**
	* Tabbed effect with dark mode but only if dark mode is enabled on the system **Windows 11 Only**
	*/
	Effect["TabbedDark"] = "tabbedDark";
	/**
	* Tabbed effect with light mode **Windows 11 Only**
	*/
	Effect["TabbedLight"] = "tabbedLight";
})(Effect || (Effect = {}));
/**
* Window effect state **macOS only**
*
* @see https://developer.apple.com/documentation/appkit/nsvisualeffectview/state
*
* @since 2.0.0
*/
var EffectState;
(function(EffectState) {
	/**
	*  Make window effect state follow the window's active state **macOS only**
	*/
	EffectState["FollowsWindowActiveState"] = "followsWindowActiveState";
	/**
	*  Make window effect state always active **macOS only**
	*/
	EffectState["Active"] = "active";
	/**
	*  Make window effect state always inactive **macOS only**
	*/
	EffectState["Inactive"] = "inactive";
})(EffectState || (EffectState = {}));
// src/composables/useWindow.ts
async function initWindow() {
	const win = getCurrentWindow();
	try {
		const s = await api.windowState();
		if (s.width > 800 && s.height > 600) {
			await win.setSize(new LogicalSize(s.width, s.height));
			if (s.x !== 0 || s.y !== 0) await win.setPosition(new LogicalPosition(s.x, s.y));
			if (s.maximized) await win.maximize();
		}
	} catch {}
	let timer;
	const save = () => {
		window.clearTimeout(timer);
		timer = window.setTimeout(async () => {
			try {
				const size = await win.innerSize();
				const pos = await win.outerPosition();
				const maximized = await win.isMaximized();
				await api.saveWindowState({
					x: Math.round(pos.x),
					y: Math.round(pos.y),
					width: Math.round(size.width),
					height: Math.round(size.height),
					maximized
				});
			} catch {}
		}, 600);
	};
	await win.onResized(save);
	await win.onMoved(save);
	try {
		if (await win.isMinimized()) await win.unminimize();
		await win.show();
		await win.setFocus();
	} catch {}
}
// src/composables/useGlobalContext.ts
function installGlobalContextMenu() {
	window.addEventListener("contextmenu", (e) => {
		const el = e.target;
		if (el.closest("input, textarea, [contenteditable='true']")) return;
		if (el.closest("[data-ctx]")) {
			openMenu(e, [{
				key: "copy-page",
				label: theme.lang === "zh-CN" ? "复制可见文本" : "Copy visible text",
				action: () => copyText(el.innerText || el.textContent || "")
			}]);
			return;
		}
		const sel = window.getSelection()?.toString().trim() ?? "";
		const zh = theme.lang === "zh-CN";
		const items = [];
		if (sel) {
			items.push({
				key: "copy-sel",
				label: zh ? "复制选中内容" : "Copy selection",
				hint: "Ctrl+C",
				action: () => copyText(sel)
			});
			items.push(SEP);
		}
		items.push({
			key: "copy-all",
			label: zh ? "复制整页文本" : "Copy page text",
			action: () => {
				copyText(document.querySelector(".learn, .dash, .wrong, .paths, .home, .list-col, .detail")?.textContent ?? document.body.innerText);
			}
		});
		items.push(SEP);
		items.push({
			key: "reload",
			label: zh ? "刷新界面" : "Reload view",
			action: () => window.location.reload()
		});
		openMenu(e, items);
	});
}
// src/App.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 6,
	class: "main view-enter"
};
var _hoisted_2 = {
	key: 0,
	class: "toast"
};
// src/main.ts
createApp(/* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "App",
	setup(__props) {
		onMounted(async () => {
			installGlobalContextMenu();
			await initCollectEvents();
			await loadTheme();
			await loadGlossary();
			await Promise.all([
				refreshSources(),
				refreshStats(),
				loadLessons(),
				loadPaths(),
				loadProgress(),
				refreshWrongCount(),
				loadFavorites()
			]);
			await doSearch();
			await initWindow();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [
				createVNode(TopBar_default),
				createVNode(ErrorBoundary_default, null, {
					default: withCtx(() => [unref(view) === "home" ? (openBlock(), createBlock(HomeView_default, {
						key: 0,
						class: "view-enter"
					})) : unref(view) === "learn" ? (openBlock(), createBlock(LearnView_default, {
						key: 1,
						class: "view-enter"
					})) : unref(view) === "paths" ? (openBlock(), createBlock(PathView_default, {
						key: 2,
						class: "view-enter",
						paths: unref(paths),
						cards: unref(allLessons),
						progress: unref(progress)
					}, null, 8, [
						"paths",
						"cards",
						"progress"
					])) : unref(view) === "dashboard" ? (openBlock(), createBlock(DashboardView_default, {
						key: 3,
						class: "view-enter"
					})) : unref(view) === "wrong" ? (openBlock(), createBlock(WrongView_default, {
						key: 4,
						class: "view-enter"
					})) : unref(view) === "settings" ? (openBlock(), createBlock(SettingsView_default, {
						key: 5,
						class: "view-enter"
					})) : (openBlock(), createElementBlock("div", _hoisted_1, [
						createVNode(Sidebar_default),
						createVNode(ResultList_default),
						createVNode(DetailPanel_default)
					]))]),
					_: 1
				}),
				createVNode(StatusBar_default),
				createVNode(ContextMenu_default),
				createVNode(CommandPalette_default),
				createVNode(ShortcutsOverlay_default),
				createVNode(Transition, { name: "toast" }, {
					default: withCtx(() => [unref(toast) ? (openBlock(), createElementBlock("div", _hoisted_2, [createVNode(Icon_default, {
						name: "check",
						size: 13,
						class: "t-ico"
					}), createBaseVNode("span", null, toDisplayString(unref(toast)), 1)])) : createCommentVNode("", true)]),
					_: 1
				})
			], 64);
		};
	}
}), [["__scopeId", "data-v-1e31cef0"]])).mount("#app");
