// @dep decorator.
// Apply to a function, to export other variables whenever it's used.
// Arguments can be functions to export or names of global variables.

function dep(...depList: any[]) {
	return((target: Object, functionName: string) => {
		// Export names of other functions required by <functionName>
		// as an array named <functionName>__deps.
		var key = functionName + '__deps';
		var lib = (<{ [key: string]: any }>target);

		lib[key] = (lib[key] || []).concat(depList.map((dep: any) => {
			var name: string;

			if(typeof(dep) == 'function') {
				// Get name of required function and remove underscore prefix.
				name = dep.name.substr(1);

				// Export required function with prefix removed from its name.
				lib[name] = dep;
			} else {
				name = dep.substr(1);

				// Export any required global variable,
				// looking it up by name in current scope.
				if(name != 'initNamespaces') lib[name] = eval('(' + dep + ')');
			}

			// Send name without prefix to __deps list.
			return(name);
		}));
	});
}

// @exportLibrary decorator.
// Apply to a class with static methods, to export them as functions.

function exportLibrary(target: any) {
	mergeInto(LibraryManager.library, target);
}

// @exportNamespace decorator.
// Apply to a class named "_" and defined at the end of the namespace,
// to export the entire namespace.

function exportNamespace(name: string) {
	return((target: any) => {
		var exportName = name.substr(1);

		var body = '(' + __decorate.caller.caller.toString().replace(/var +_ *= *[^]*/, '}') + ')';

		eval(name + '={};');

		var lib: _Library = {
			_extends: __extends,
			_decorate: __decorate,
			defineHidden: _defineHidden
		};

		lib[exportName + '__deps'] = Object.keys(lib);
		lib[exportName + '__postset'] = body + '(' + name + ')';

		mergeInto(LibraryManager.library, lib);
	});
}

// @_defineHidden decorator.
// Apply to a property to protect it from modifications and hide it.

function _defineHidden(value: any) {
	return((target: any, key: string) => {
		Object.defineProperty(target, key, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: value
		});
	});
}

// Typescript internal shim functions.

declare var __decorate: any;
declare var __extends: any;

// Declarations of some globals provided by Emscripten to its libraries.

interface _Library { [name: string]: any }

interface _LibraryManager {
	library: _Library;
}

declare var LibraryManager: _LibraryManager;

declare var Module: any;

declare function mergeInto(target: _Library, extension: _Library): void;

// The HEAP* arrays are the main way to access the C++ heap.

declare var HEAP8: Int8Array;
declare var HEAP16: Int16Array;
declare var HEAP32: Int32Array;
declare var HEAPU8: Uint8Array;
declare var HEAPU16: Uint16Array;
declare var HEAPU32: Uint32Array;
declare var HEAPF32: Float32Array;
declare var HEAPF64: Float64Array;
