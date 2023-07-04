import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../src/JavaBridge';
import Log from '../src/Log';

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
