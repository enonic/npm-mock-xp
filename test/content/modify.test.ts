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
				const createdContent = contentConnection.create({
					childOrder: 'displayname ASC',
					contentType: CONTENT_TYPE,
					data: {},
					name: 'name',
					parentPath: '/',
				});
				describe('modify', () => {
					it('modifies content', () => {
						const modifiedContent = contentConnection.modify({
							key: createdContent._id,
							editor: (content) => {
								content._id = '_id ignored';
								content._name = '_name ignored';
								content._path = '_path ignored';
								content.data = {
									...content.data,
									foo: 'bar'
								};
								return content;
							}
						});
						expect(modifiedContent).toEqual({
							...createdContent,
							data: {
								foo: 'bar'
							},
							modifiedTime: modifiedContent.modifiedTime,
							modifier: modifiedContent.modifier,
						});
					});
				});
			});
		});
	});
});
