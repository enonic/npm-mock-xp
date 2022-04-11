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
		it('instance has app object', () => {
			deepStrictEqual(
				{
					config: {},
					name: 'com.enonic.app.test',
					version: '0.0.1-SNAPSHOT'
				},
				javaBridge.app
			);
		}); // it
	}); // describe JavaBridge
}); // describe mock
