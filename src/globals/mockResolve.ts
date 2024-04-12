import {
	dirname,
	join
} from 'path';

function _getCallerFile() {
	var originalFunc = Error.prepareStackTrace;

	var callerfile;
	try {
		var err = new Error();
		var currentfile;

		Error.prepareStackTrace = function (err, stack) { return stack; };

		// @ts-ignore
		currentfile = err.stack.shift().getFileName();

		while (err.stack.length) {
			// @ts-ignore
			callerfile = err.stack.shift().getFileName();

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
