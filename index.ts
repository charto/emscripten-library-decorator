// @dep decorator.
function dep(...depList: any[]) {
	return((target: Object, functionName: string) => {
		// Export names of other functions required by <functionName>
		// as an array named <functionName>__deps.
		var key = functionName + '__deps';
		var lib = (<any>target);

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
function exportLibrary(target: any) {
	mergeInto(LibraryManager.library, target);
}

// Declarations of some globals provided by Emscripten to its libraries.

interface _Library {}

interface _LibraryManager {
	library: _Library;
}

declare var LibraryManager: _LibraryManager;

declare function mergeInto(lib: _Library, proto: any): void;

// The HEAP* arrays are the main way to access the C++ heap.

declare var HEAP8: Int8Array;
declare var HEAP16: Int16Array;
declare var HEAP32: Int32Array;
declare var HEAPU8: Uint8Array;
declare var HEAPU16: Uint16Array;
declare var HEAPU32: Uint32Array;
declare var HEAPF32: Float32Array;
declare var HEAPF64: Float64Array;
