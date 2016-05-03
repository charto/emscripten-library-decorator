// This file is part of emscripten-library-decorator,
// copyright (c) 2015-2016 BusFaster Ltd.
// Released under the MIT license, see LICENSE.

var evil: (code: string) => any;

/** Allow decorators to call eval() in the context that called them.
  * This is needed for various transformations.
  * @param otherEval must be this function: (code: string) => eval(code) */

export function setEvil(otherEval: (code: string) => any) {
	evil = otherEval;
}

/** @dep decorator.
  * Apply to a function, to list other required variables needing protection
  * from dead code removal.
  * Arguments can be functions or names of global variables. */

export function dep(...depList: (((...args: any[]) => any) | string)[]) {
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
				if(name != 'initNamespaces') lib[name] = evil('(' + dep + ')');
			}

			// Send name without prefix to __deps list.
			return(name);
		}));
	});
}

/** @exportLibrary decorator.
  * Apply to a class with static methods, to export them as functions. */

export function exportLibrary(target: any) {
	mergeInto(LibraryManager.library, target);
}

var namespaceBodyTbl: { [name: string]: string } = {};

/** @prepareNamespace decorator.
  * Apply to an empty, named dummy class defined at the end of the namespace
  * block, to prepare its contents for export in an Emscripten library.
  * Namespaces with matching names in different files are merged together.
  * All code in the block is separated because Emscripten only outputs global
  * functions, not methods. */

export function prepareNamespace(name: string) {
	return((target: any) => {
		var body = evil('__decorate').caller.caller.toString();

		var prefix = new RegExp('^[ (]*function *\\( *' + name + ' *\\) *\\{');
		var suffix = new RegExp('var +' + target.name + ' *= *[^]*$');

		body = (namespaceBodyTbl[name] || '') + body.replace(prefix, '').replace(suffix, '');

		namespaceBodyTbl[name] = body;
	});
}

/** Call once per namespace at the global level, after all files with contents
  * in that namespace have been imported. Clears the namespace and exports a
  * "postset" function to populate it using its original code. */

export function publishNamespace(name: string) {
	var exportName = name.substr(1);

	var body = namespaceBodyTbl[name];
	var bodyWrapped = '(function(' + name + '){' + body + '})' + '(' + name + ')';

	evil(name + '={};');

	var lib: _Library = {
		_extends: evil('__extends'),
		_decorate: evil('__decorate'),
		defineHidden: defineHidden
	};

	lib[exportName + '__deps'] = Object.keys(lib);
	lib[exportName + '__postset'] = bodyWrapped;

	mergeInto(LibraryManager.library, lib);
}

/** @_defineHidden decorator.
  * Assign to a local variable called _defineHidden before using.
  * Apply to a property to protect it from modifications and hide it. */

export function defineHidden(value?: any) {
	return((target: Object, key: string) => {
		Object.defineProperty(target, key, {
			configurable: false,
			enumerable: false,
			writable: true,
			value: value
		});
	});
}
