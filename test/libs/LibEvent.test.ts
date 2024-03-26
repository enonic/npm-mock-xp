import {deepStrictEqual} from 'assert';
import {
	LibEvent,
	Server
} from '../../src';
import {hasMethod} from '../hasMethod';


const server = new Server({
	loglevel: 'error'
});

const libEvent = new LibEvent({
	server
});

describe('mock', () => {
	describe('libEvent', () => {
		it('has listener method', () => {
			deepStrictEqual(
				true,
				hasMethod(libEvent, 'listener')
			);
		}); // it
		it('has send method', () => {
			deepStrictEqual(
				true,
				hasMethod(libEvent, 'send')
			);
		}); // it
		describe('listener method', () => {
			it('can be called', () => {
				libEvent.listener({
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
				libEvent.send({
					type: 'myCustomEvent',
					distributed: false,
					data: {
						_id: 'asdf'
					}
				});
			}); // it
		}); // describe send method
	}); // describe libEvent
}); // describe mock
