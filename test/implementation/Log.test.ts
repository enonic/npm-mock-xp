import {OBJECTS} from '@enonic/test-data';
import {deepStrictEqual} from 'assert';
import {
	Log,
	Server,
} from '../../src';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


const log = Log.createLogger({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('Server', () => {
		const server = new Server({ log });
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
