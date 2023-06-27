import {OBJECTS} from '@enonic/test-data';
import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../src/JavaBridge';
import Log from '../src/Log';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


const log = Log.createLogger({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			},
			log
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
				javaBridge.log.debug('objects:%s', OBJECTS);
			}); // describe debug
			describe('error', () => {
				it('log object has error method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'error')
					);
				}); // it
				javaBridge.log.error('objects:%s', OBJECTS);
			}); // describe error
			describe('info', () => {
				it('log object has info method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'info')
					);
				}); // it
				javaBridge.log.info('objects:%s', OBJECTS);
			}); // describe info
			describe('warning', () => {
				it('log object has warning method', () => {
					deepStrictEqual(
						true,
						hasMethod(javaBridge.log, 'warning')
					);
				}); // it
				javaBridge.log.warning('objects:%s', OBJECTS);
			}); // describe warning
		}); // describe log
	}); // describe JavaBridge
}); // describe mock
