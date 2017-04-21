// dump-lib is a public domain tool for inspecting emscripten-library-decorator output.

declare var require: any;
declare var process: any;

const util = require('util'); // tslint:disable-line
const fs = require('fs'); // tslint:disable-line

function dump(path: string) {
	const output: string[] = [];

	/* tslint:disable:no-unused-variable */

	const lib: _Library = {};
	const LibraryManager = { library: lib };

	function mergeInto(dst: _Library, src: _Library) {
		for(let key of Object.keys(src)) dst[key] = src[key];
	}

	/* tslint:enable:no-unused-variable */

	eval(fs.readFileSync(path, 'utf-8'));

	for(let key of Object.keys(lib)) {
		if(!key.match(/__deps$/)) {
			let item = lib[key];

			switch(typeof(item)) {
				case 'function':
					item = item.toString().replace(/^(function) *([^(]*)/, '$1 _' + key);
					break;

				case 'object':
					item = 'var _' + key + ' = ' + util.inspect(item) + ';';
					break;

				default:
					break;
			}

			output.push(item);
		}
	}

	return(output.join('\n'));
}

// tslint:disable-next-line:no-console
console.log(dump(process.argv[2]));
