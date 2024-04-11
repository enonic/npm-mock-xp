import type {Log as LogType} from '../types';

// Not using named imports to avoid:
// bun test failing with: SyntaxError: Import named 'white' not found in module
import colors from 'colors/safe';

// @ts-ignore
import {stringify} from 'q-i';

const {
	// @ts-expect-error Property 'brightRed' does not exist on type
	brightRed,
	// @ts-expect-error Property 'brightYellow' does not exist on type
	brightYellow,
	grey,
	reset,
	white,
} = colors;


export type LogLevel =
	// Gradle has 'quiet' but that could also mean 'with little sound', silent is 'without sound'
	|'silent' // Node has this, Enonic XP log does not, but useful when running tests
	|'error'
	|'warn'
	|'info'
	|'debug'
	// |'trace' // logback.xml has this, but Enonic XP log does not.
;


export class Log {

	static colorize(a: unknown[]) {
		return a.map(i => reset(stringify(i, { maxItems: Infinity })));
	}

	static createLogger({
		loglevel
	}: {
		loglevel: LogLevel
	} = {
		loglevel: 'info'
	}): LogType {
		return {
			debug: loglevel === 'debug'
				? (format: string, ...s: unknown[]): void => {
					if (s.length) {
						console.debug(grey(`DEBUG ${format}`), ...Log.colorize(s));
					} else {
						console.debug(grey(`DEBUG ${format}`));
					}
				}
				: (_format: string, ..._s: unknown[]): void => {},
			error: loglevel !== 'silent'
				? (format: string, ...s: unknown[]): void => {
					if (s.length) {
						console.error(brightRed(`ERROR ${format}`), ...Log.colorize(s));
					} else {
						console.error(brightRed(`ERROR ${format}`));
					}
				}
				: (_format: string, ..._s: unknown[]): void => {},
			info: loglevel !== 'silent' && loglevel !== 'error' && loglevel !== 'warn'
				? (format: string, ...s: unknown[]): void => {
					if (s.length) {
						console.info(white(`INFO  ${format}`), ...Log.colorize(s));
					} else {
						console.info(white(`INFO  ${format}`));
					}
				}
				: (_format: string, ..._s: unknown[]): void => {},
			warning: loglevel !== 'silent' && loglevel !== 'error'
				? (format: string, ...s: unknown[]): void => {
					if (s.length) {
						console.warn(brightYellow(`WARN  ${format}`), ...Log.colorize(s));
					} else {
						console.warn(brightYellow(`WARN  ${format}`));
					}
				}
				: (_format: string, ..._s: unknown[]): void => {},
		};
	} // createLogger

} // class
