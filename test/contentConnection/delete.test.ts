import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


function hasMethod(obj: unknown, name: string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


const log = Log.createLogger({
	// loglevel: 'info'
	// loglevel: 'error'
	loglevel: 'silent'
});

const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: APP_NAME,
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
				describe('delete', () => {
					it('deletes content', () => {
						const createdContent = contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'name',
							parentPath: '/',
						});
						expect(contentConnection.delete({
							key: createdContent._id
						})).toBe(true);
						expect(contentConnection.get({
							key: createdContent._id
						})).toBe(null);
					});
				});
			});
		});
	});
});
