import {
	dirname,
	join
} from 'path';

interface V8_StackItem {
	getFileName: () => string
}


function _getCallerFile() {
	const originalFunc = Error.prepareStackTrace;

	let callerfile;
	try {
		const err = new Error();

		Error.prepareStackTrace = function (_err, stack) { return stack; };

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
		// Because the stack property is non-standard, implementations differ
		//
		// https://v8.dev/docs/stack-trace-api
		// The API described here is specific to V8 and is not supported by any
		// other JavaScript implementations. Most implementations do provide an
		// error.stack property but the format of the stack trace is likely to
		// be different from the format described here.
		const v8StackArray = err.stack as unknown as V8_StackItem[];
		const currentfile = v8StackArray.shift().getFileName();

		while (v8StackArray.length) {
			callerfile = v8StackArray.shift().getFileName();

			if(currentfile !== callerfile) break;
		}
	} catch (e) {}

	Error.prepareStackTrace = originalFunc;

	return callerfile;
}


// https://developer.enonic.com/docs/xp/stable/framework/globals#resolve
// According to our documentation resolve either resolves:
// * an absolute path (relative to src/main/resources)
// * a relative path (relative to the current file)
// Which means that if one src file imports from another src file with a
// different path, the resolve function should resolve the path relative to each
// file, not just the first file.
export function mockResolve({
	basePath
}: {
	basePath: string
}) {
	return (path: string) => {
		if (path.startsWith('/')) {
			return join(basePath, `.${path}`)
		}
		const callerFile = _getCallerFile();
		const dir = dirname(callerFile);
		return join(dir, path); // TODO: Perhaps path.resolve instead of join
	}
}
