import {isString} from '@enonic/js-utils/dist/cjs';
import {
	deepStrictEqual,
	notEqual,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {JavaBridge} from '../../src/JavaBridge';

function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}

describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			}
		});
		/*const obj={key:'value'};
		javaBridge.log.error('error:%s', obj);
		javaBridge.log.warning('warning:%s', obj);
		javaBridge.log.info('info:%s', obj);
		javaBridge.log.debug('debug:%s', obj);*/
		javaBridge.repo.create({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = javaBridge.connect({
				branch: 'master',
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
					_id: 'ignoredId'
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
								name: 'com.enonic.xp.node.NodeAlreadyExistAtPathException',
								message: /^Node already exists at .* repository: .* branch: .*$/
							});
							connection.delete(node._id);
						}); // it
					}); // describe throws
					//javaBridge.log.debug('generated id:%s', createRes._id);
					it('ignores passed in _id', () => {
						notEqual(
							'ignoredId',
							createRes._id
						);
					}); // it
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
						//javaBridge.log.debug('createFolderRes:%s', createFolderRes);
						const createRes = connection.create({
							_parentPath: '/folder'
						});
						//javaBridge.log.debug('createRes:%s', createRes);
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
					it('sets _ts (regardless of passed in)', () => {
						//javaBridge.log.debug('_ts:%s', createRes._ts);
						deepStrictEqual(
							true,
							isString(createRes._ts)
						);
						deepStrictEqual(
							node._ts,
							createRes._ts
						);
					}); // it
					const node = connection.get(createRes._id);
					//javaBridge.log.debug('node:%s', node);
					it('returns the created node', () => {
						deepStrictEqual(
							node,
							createRes
						);
					}); // it*/
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
				}); // describe create
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
