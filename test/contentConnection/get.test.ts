import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';


const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;


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
			it('returns an object which has a get method', () => {
				expect(hasMethod(contentConnection, 'get')).toBe(true);
			});
			describe('contentConnection', () => {
				const createdContent = contentConnection.create({
					childOrder: 'displayname ASC',
					contentType: CONTENT_TYPE,
					data: {},
					name: 'name',
					parentPath: '/',
				});
				describe('get', () => {
					it("return null when content don't exist", () => {
						expect(contentConnection.get({key: 'myKey'})).toEqual(null);
					});
					it("return the content when key is an id", () => {
						expect(contentConnection.get({key: createdContent._id})).toStrictEqual(createdContent);
					});
					it("return the content when key is a path", () => {
						expect(contentConnection.get({key: createdContent._path})).toStrictEqual(createdContent);
					});
				});
			});
		});
	});
});
