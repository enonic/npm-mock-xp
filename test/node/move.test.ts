import type { RepoNodeWithData } from '@enonic/js-utils/types';
import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import { JavaBridge } from '../../src/JavaBridge';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';
import { move } from '@enonic-types/lib-content';


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
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = javaBridge.node.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a move method', () => {
				expect(hasMethod(connection, 'move')).toBe(true);
			}); // it
			describe('Connection', () => {
				const createRes = connection.create({});
				// log.debug('createRes:%s', createRes);

				describe('move', () => {

					it("returns false when source and target ends up beeing the same location", () => {
						const target = '/';
						expect(connection.move({
							source: createRes._path,
							target
						})).toBe(false);
					});

					it("returns false when new parentPath doesn't exist", () => {
						const target = '/newPath/';
						expect(connection.move({
							source: createRes._path,
							target
						})).toBe(false);
					});

					it("returns false when there is already a node at the target", () => {
						connection.create({
							_name: 'whatever',
							parentPath: '/',
							type: 'base:folder'
						});
						const target = 'whatever';
						expect(connection.move({
							source: createRes._path,
							target
						})).toBe(false);
					});

					it('moves when source is a path, and target ends with /', () => {
						connection.create({
							_name: 'newPath',
							parentPath: '/',
							type: 'base:folder'
						});
						const target = '/newPath/';
						expect(connection.move({
							source: createRes._path,
							target
						})).toBe(true);
						const movedNode = connection.get(createRes._id) as RepoNodeWithData;
						// log.debug('movedNode:%s', movedNode);
						expect(movedNode._name).toBe(createRes._name); // unchanged
						expect(movedNode._path).toBe(`${target}${createRes._name}`); // new folder
					});

					it("moves and renames when source is an id, and target starts with / but doesn't end with /", () => {
						connection.create({
							_name: 'anotherNewPath',
							parentPath: '/',
							type: 'base:folder'
						});
						const target = '/anotherNewPath/andNewNameToo';
						expect(connection.move({
							source: createRes._id,
							target
						})).toBe(true);
						const movedNode = connection.get(createRes._id) as RepoNodeWithData;
						// log.debug('movedNode:%s', movedNode);
						expect(movedNode._name).toBe('andNewNameToo'); // new name
						expect(movedNode._path).toBe('/anotherNewPath/andNewNameToo'); // new folder and name
					});

					it("just renames when source is an id, and target doesn't start with /", () => {
						const target = 'newName';
						expect(connection.move({
							source: createRes._id,
							target
						})).toBe(true);
						const movedNode = connection.get(createRes._id) as RepoNodeWithData;
						// log.debug('movedNode:%s', movedNode);
						expect(movedNode._name).toBe(target);
						expect(movedNode._path).toBe('/anotherNewPath/newName'); // just new name
					});

				}); // describe move
			});
		});
	});
});
