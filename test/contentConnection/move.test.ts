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
			it('returns an object which has a move method', () => {
				expect(hasMethod(contentConnection, 'move')).toBe(true);
			});
			describe('contentConnection', () => {
				describe('move', () => {
					const createdContent = contentConnection.create({
						childOrder: 'displayname ASC',
						contentType: CONTENT_TYPE,
						data: {},
						name: 'name',
						parentPath: '/',
					});

					it('moves content when source is a path, and target ends with /', () => {
						contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: 'base:folder',
							data: {},
							name: 'newPath',
							parentPath: '/'
						});
						const target = '/newPath/';
						const movedContent = contentConnection.move({
							source: createdContent._path,
							target
						});
						// log.debug('movedContent:%s', movedContent);
						expect(movedContent._name).toBe(createdContent._name); // unchanged
						expect(movedContent._path).toBe(`${target}${createdContent._name}`); // new folder
					});

					it("moves and renames when source is an id, and target starts with / but doesn't end with /", () => {
						contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: 'base:folder',
							data: {},
							name: 'anotherNewPath',
							parentPath: '/'
						});
						const target = '/anotherNewPath/andNewNameToo';
						const movedContent = contentConnection.move({
							source: createdContent._id,
							target
						});
						// log.debug('movedContent:%s', movedContent);
						expect(movedContent._name).toBe('andNewNameToo'); // new name
						expect(movedContent._path).toBe('/anotherNewPath/andNewNameToo'); // new folder and name
					});

					it("just renames when source is an id, and target doesn't start with /", () => {
						const target = 'newName';
						const movedContent = contentConnection.move({
							source: createdContent._id,
							target
						});
						// log.debug('movedContent:%s', movedContent);
						expect(movedContent._name).toBe(target);
						expect(movedContent._path).toBe('/anotherNewPath/newName'); // just new name
					});

				}); // describe move
			});
		});
	});
});
