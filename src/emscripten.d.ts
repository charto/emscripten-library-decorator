// Declarations of some globals provided by Emscripten to its libraries.

interface _Library { // tslint:disable-line:class-name
	[name: string]: any;
}

declare var LibraryManager: {
	library: _Library;
};

declare function mergeInto(target: _Library, extension: _Library): void;
