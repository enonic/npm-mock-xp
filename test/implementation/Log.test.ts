import {OBJECTS} from '@enonic/test-data';
import {deepStrictEqual} from 'assert';
import {
	Log,
	Server,
} from '../../src';
import {hasMethod} from '../hasMethod';


// Silence console output, but still allow mock functions to run.
globalThis.console.debug = () => {}
globalThis.console.info = () => {}
globalThis.console.warn = () => {}
globalThis.console.error = () => {}


const defaultLogger = Log.createLogger();
const silentLogger = Log.createLogger({
	loglevel: 'silent'
});
const debugLogger = Log.createLogger({
	loglevel: 'debug'
});
const infoLogger = Log.createLogger({
	loglevel: 'info'
});
const warningLogger = Log.createLogger({
	loglevel: 'warn'
});
const errorLogger = Log.createLogger({
	loglevel: 'error'
});

describe('mock', () => {
	describe('Log', () => {
		describe('static', () => {
			describe('colorize', () => {
				it('colorize is a static method', () => {
					deepStrictEqual(
						true,
						hasMethod(Log, 'colorize')
					);
				}); // it
			}); // describe colorize
			describe('createLogger', () => {
				it('createLogger is a static method', () => {
					deepStrictEqual(
						true,
						hasMethod(Log, 'createLogger')
					);
				}); // it

				describe('silentLogger', () => {
					silentLogger.debug('should not call console.debug');
					silentLogger.debug('should not call console.debug objects:%s', OBJECTS);
					silentLogger.info('should not call console.info');
					silentLogger.info('should not call console.info objects:%s', OBJECTS);
					silentLogger.warning('should not call console.warning');
					silentLogger.warning('should not call console.warning objects:%s', OBJECTS);
					silentLogger.error('should not call console.error');
					silentLogger.error('should not call console.error objects:%s', OBJECTS);
				});

				describe('debugLogger', () => {
					debugLogger.debug('debug message without format');
					debugLogger.debug('objects:%s', OBJECTS);
					debugLogger.info('info message without format');
					debugLogger.info('objects:%s', OBJECTS);
					debugLogger.warning('warning message without format');
					debugLogger.warning('objects:%s', OBJECTS);
					debugLogger.error('error message without format');
					debugLogger.error('objects:%s', OBJECTS);
				});

				describe('infoLogger', () => {
					infoLogger.debug('should not call console.debug');
					infoLogger.debug('should not call console.debug objects:%s', OBJECTS);

					infoLogger.info('info message without format');
					infoLogger.info('objects:%s', OBJECTS);
					infoLogger.warning('warning message without format');
					infoLogger.warning('objects:%s', OBJECTS);
					infoLogger.error('error message without format');
					infoLogger.error('objects:%s', OBJECTS);
				});

				describe('warningLogger', () => {
					warningLogger.debug('should not call console.debug');
					warningLogger.debug('should not call console.debug objects:%s', OBJECTS);
					warningLogger.info('should not call console.info');
					warningLogger.info('should not call console.info objects:%s', OBJECTS);

					warningLogger.warning('warning message without format');
					warningLogger.warning('objects:%s', OBJECTS);
					warningLogger.error('error message without format');
					warningLogger.error('objects:%s', OBJECTS);
				});

				describe('errorLogger', () => {
					errorLogger.debug('should not call console.debug');
					errorLogger.debug('should not call console.debug objects:%s', OBJECTS);
					errorLogger.info('should not call console.info');
					errorLogger.info('should not call console.info objects:%s', OBJECTS);
					errorLogger.warning('should not call console.warning');
					errorLogger.warning('should not call console.warning objects:%s', OBJECTS);

					errorLogger.error('error message without format');
					errorLogger.error('objects:%s', OBJECTS);
				});
			}); // describe createLogger
		});
	}); // describe Log

	describe('Server', () => {
		const server = new Server({ log: defaultLogger });
		it('instance has log object', () => {
			deepStrictEqual(
				true,
				server.hasOwnProperty('log')
			);
		}); // it
		describe('log', () => {
			describe('debug', () => {
				it('log object has debug method', () => {
					deepStrictEqual(
						true,
						hasMethod(server.log, 'debug')
					);
				}); // it
				server.log.debug('objects:%s', OBJECTS);
			}); // describe debug
			describe('error', () => {
				it('log object has error method', () => {
					deepStrictEqual(
						true,
						hasMethod(server.log, 'error')
					);
				}); // it
				server.log.error('objects:%s', OBJECTS);
			}); // describe error
			describe('info', () => {
				it('log object has info method', () => {
					deepStrictEqual(
						true,
						hasMethod(server.log, 'info')
					);
				}); // it
				server.log.info('objects:%s', OBJECTS);
			}); // describe info
			describe('warning', () => {
				it('log object has warning method', () => {
					deepStrictEqual(
						true,
						hasMethod(server.log, 'warning')
					);
				}); // it
				server.log.warning('objects:%s', OBJECTS);
			}); // describe warning
		}); // describe log
	}); // describe Server
}); // describe mock
