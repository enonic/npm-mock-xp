import type {RepoNodeWithData} from '../../../src/types';


import {isString} from '@enonic/js-utils/value/isString';
import {
	deepStrictEqual,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {NODE_ALREADY_EXIST_AT_PATH_EXCEPTION_NAME} from '../../../src/implementation/node/NodeAlreadyExistAtPathException';
import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const server = new Server({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = server.connect({
				branchId: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a create method', () => {
				deepStrictEqual(
					true,
					hasMethod(connection, 'create')
				);
			}); // it
			describe('Connection', () => {
				const createRes = connection.create({
					// _id: 'ignoredId'
				});
				describe('create', () => {
					describe('throws', () => {
						it('throws NodeNotFoundException when _parentPath not found', () => {
							assert.throws(() => {
								connection.create({
									_parentPath: '/nonExistant/'
								});
							}, {
								name: 'com.enonic.xp.node.NodeNotFoundException',
								message: /^Cannot create node with name .*, parent '.*' not found/
							});
						}); // it
						it('throws NodeAlreadyExistAtPathException', () => {
							const node = connection.create({
								_name: 'a'
							});
							assert.throws(() => {
								connection.create({
									_name: 'a'
								});
							}, {
								name: NODE_ALREADY_EXIST_AT_PATH_EXCEPTION_NAME,
								message: /^Node already exists at .* repository: .* branch: .*$/
							});
							connection.delete(node._id);
						}); // it
					}); // describe throws
					//server.log.debug('generated id:%s', createRes._id);
					// it('ignores passed in _id', () => {
					// 	notEqual(
					// 		'ignoredId',
					// 		createRes._id
					// 	);
					// }); // it
					it('generates an _id', () => {
						deepStrictEqual(
							true,
							isString(createRes._id)
						);
					}); // it
					it('generates an _versionKey', () => {
						deepStrictEqual(
							true,
							isString(createRes._versionKey)
						);
					}); // it
					it('sets _name to _id (when _name is not passed in)', () => {
						deepStrictEqual(
							createRes._id,
							createRes._name
						);
					}); // it
					it('provides a default _indexConfig (when not passed in)', () => {
						deepStrictEqual(
							{
								default: {
									decideByType: true,
									enabled: true,
									nGram: false,
									fulltext: false,
									includeInAllText: false,
									path: false,
									indexValueProcessors: [],
									languages: []
								},
								configs: []
							},
							createRes._indexConfig
						);
					}); // it
					it("sets _nodeType to 'default' (when not passed in)", () => {
						deepStrictEqual(
							'default',
							createRes._nodeType
						);
					}); // it

					it('supports a _parentPath parameter', () => {
						//const createFolderRes =
						connection.create({
							_name: 'folder'
						});
						//server.log.debug('createFolderRes:%s', createFolderRes);
						const createRes = connection.create({
							_parentPath: '/folder'
						});
						//server.log.debug('createRes:%s', createRes);
						deepStrictEqual(
							`/folder/${createRes._id}`,
							createRes._path
						);
					});
					it('creates a _path property', () => {
						deepStrictEqual(
							'/00000000-0000-4000-8000-000000000002',
							createRes._path
						);
					});
					it("sets _state to 'DEFAULT' (regardless of passed in)", () => {
						deepStrictEqual(
							'DEFAULT',
							createRes._state
						);
					}); // it
					const node = connection.get(createRes._id) as RepoNodeWithData;
					//server.log.debug('node:%s', node);
					it('sets _ts (regardless of passed in)', () => {
						//server.log.debug('_ts:%s', createRes._ts);
						deepStrictEqual(
							true,
							isString(createRes._ts)
						);
						deepStrictEqual(
							node._ts,
							createRes._ts
						);
					}); // it
					it('returns the created node', () => {
						deepStrictEqual(
							node,
							createRes
						);
					}); // it
					it("doesn't enonify _indexConfig", () => {
						const createRes2 = connection.create({
							_indexConfig: {
								configs: [{
									path: 'myString',
									config: {
										decideByType: true,
										enabled: true,
										fulltext: true,
										includeInAllText: true,
										languages: ['en'],
										nGram: true,
										path: false
									}
								}]
							}
						});
						deepStrictEqual(
							{
								...createRes2,
								_indexConfig: {
									configs: [{
										path: 'myString',
										config: {
											decideByType: true,
											enabled: true,
											fulltext: true,
											includeInAllText: true,
											languages: ['en'],
											nGram: true,
											path: false
										}
									}]
								}
							},
							createRes2
						);
					}); // it

					it('can store boolean values', () => {
						const createRes = connection.create({
							false: false,
							true: true
						});
						// server.log.debug('createRes:%s', createRes);
						expect(createRes.false).toBe(false);
						expect(createRes.true).toBe(true);
					}); // it

				}); // describe create
			}); // describe Connection
		}); // describe connect
	}); // describe Server
}); // describe mock
