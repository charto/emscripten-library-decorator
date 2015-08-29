emscripten-library-decorator
============================

This package provides decorators for writing Emscripten libraries. Include them in a TypeScript source file by adding a `reference path` in the beginning pointing to `index.ts` like:

```typescript
/// <reference path="node_modules/emscripten-library-decorator/index.ts" />

function _print(message: string) {
	console.log(message);
}

@exportLibrary
class test {
	@dep(_print)
	static hello() {
		_print('Hello, World!!');
	}

	static foobar = 42;
};
```

The class decorator `@exportLibrary` exports the static members of the class as an Emscripten library. Place it with no arguments just before the class.

The property decorator `@dep` is for listing dependencies. It ensures that when an exported function is used in the C or C++ code, other required functions are also included in the compiled Emscripten output after dead code elimination. Place it just before a function with any number of parameters listing the other required functions.

The dependencies should be global functions and their name should begin with an underscore. Otherwise Emscripten's name mangling will change their name in the output making any calls to them fail.

There is a [longer article](http://blog.charto.net/asm-js/Writing-Emscripten-libraries-in-TypeScript/) with more information.

License
-------
[The MIT License](https://raw.githubusercontent.com/charto/emscripten-library-decorator/master/LICENSE)

Copyright (c) 2015 BusFaster Ltd

