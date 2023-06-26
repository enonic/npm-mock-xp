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
			log: Log.createLogger({
				loglevel: 'debug'
			}),
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
				describe('create', () => {
					it('creates content', () => {
						const createdContent = contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'name',
							parentPath: '/',
						});
						expect(createdContent).toEqual({
							_id: createdContent._id,
							_name: 'name',
							_path: '/name',
							attachments: {},
							childOrder: 'displayname ASC',
							createdTime: createdContent.createdTime,
							creator: createdContent.creator,
							displayName: 'name',
							hasChildren: true, // TODO: Hardcode
							data: {},
							owner: createdContent.owner,
							publish: {},
							type: CONTENT_TYPE,
							valid: true,
							x: {}
						});
					});
				});
			});
		});
	});
});
