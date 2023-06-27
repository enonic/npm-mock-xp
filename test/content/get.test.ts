import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';


function hasMethod(obj: unknown, name: string) {
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
		javaBridge.repo.create({
			id: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentConnection = javaBridge.contentConnect({
				branch: 'master',
				project: 'default'
			});
			describe('contentConnection', () => {
				describe('get', () => {
					it("return null when content don't exist", () => {
						expect(contentConnection.get({key: 'myKey'})).toEqual(null);
					});
				});
			});
		});
	});
});
