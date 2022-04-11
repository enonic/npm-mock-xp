import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../src/JavaBridge';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			},
			log: {
				debug: (...params) => { console.debug(...params) },
				error: (...params) => { console.error(...params) },
				info: (...params) => { console.info(...params) },
				warning: (...params) => { console.warn(...params) }
			}
		});
		it('instance has log object', () => {
			deepStrictEqual(
				true,
				javaBridge.hasOwnProperty('log')
			);
		}); // it
		describe('log', () => {
			describe('debug', () => {
				it('log object has debug method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'debug')
					);
				}); // it
				javaBridge.log.debug('string:%s', 'string');
			}); // describe debug
			describe('error', () => {
				it('log object has error method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'error')
					);
				}); // it
				javaBridge.log.error('string:%s', 'string');
			}); // describe error
			describe('info', () => {
				it('log object has info method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'info')
					);
				}); // it
				javaBridge.log.info('string:%s', 'string');
			}); // describe info
			describe('warning', () => {
				it('log object has warning method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'warning')
					);
				}); // it
				javaBridge.log.warning('string:%s', 'string');
			}); // describe warning
		}); // describe log
	}); // describe JavaBridge
}); // describe mock
