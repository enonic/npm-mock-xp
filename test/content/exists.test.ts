import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';

const log = Log.createLogger({
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
			it('returns an object which has a exists method', () => {
				expect(hasMethod(contentConnection, 'exists')).toBe(true);
			});
			describe('contentConnection', () => {
				describe('exists', () => {
					const createdContent = contentConnection.create({
						childOrder: 'displayname ASC',
						contentType: CONTENT_TYPE,
						data: {},
						name: 'name',
						parentPath: '/',
					});
					it('returns true when key is an id and content exists', () => {
						expect(contentConnection.exists({ key: createdContent._id })).toBe(true);
					});
					it('returns true when key is a path and content exists', () => {
						expect(contentConnection.exists({ key: createdContent._path })).toBe(true);
					});
					it("returns false when content doesn't exist", () => {
						expect(contentConnection.exists({ key: 'non-existant-id' })).toBe(false);
						expect(contentConnection.exists({ key: '/non-existant-path' })).toBe(false);
					});
				});
			});
		});
	});
});
