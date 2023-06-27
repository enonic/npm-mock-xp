import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../src/JavaBridge';
import Log from '../src/Log';
import {hasMethod} from './hasMethod';


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
		it('instance has event object', () => {
			deepStrictEqual(
				true,
				javaBridge.hasOwnProperty('event')
			);
		}); // it
		describe('event', () => {
			it('has listener method', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.event, 'listener')
				);
			}); // it
			it('has send method', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.event, 'send')
				);
			}); // it
			describe('listener method', () => {
				it('can be called', () => {
					javaBridge.event.listener({
						type: 'node.*',
						localOnly: true,
						callback: () => {
							return null;
						}
					});
				}); // it
			}); // describe listener method
			describe('send method', () => {
				it('can be called', () => {
					javaBridge.event.send({
						type: 'myCustomEvent',
						distributed: false,
						data: {
							_id: 'asdf'
						}
					});
				}); // it
			}); // describe send method
		}); // describe event
	}); // describe JavaBridge
}); // describe mock
