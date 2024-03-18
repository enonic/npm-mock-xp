import {isString} from '@enonic/js-utils/value/isString';
import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import * as assert from 'assert';
import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';


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
			it('returns an object which has a modify method', () => {
				expect(hasMethod(connection, 'modify')).toBe(true);
			}); // it
			describe('Connection', () => {
				describe('modify', () => {
					it('is able to modify the root node by id', () => {
						const modifiedRootNode = connection.modify({
							key: '00000000-0000-0000-0000-000000000000',
							editor: (rootNode) => {
								rootNode.should = 'RUN';
								return rootNode;
							}
						});
						expect(modifiedRootNode).toStrictEqual({
								_childOrder: '_ts DESC',
								_id: '00000000-0000-0000-0000-000000000000',
								_indexConfig: modifiedRootNode['_indexConfig'],
								_inheritsPermissions: false,
								_name: '',
								_nodeType: 'default',
								_path: '/',
								_permissions: [{
									principal: 'role:system.admin',
									allow: [
										'READ',
										'CREATE',
										'MODIFY',
										'DELETE',
										'PUBLISH',
										'READ_PERMISSIONS',
										'WRITE_PERMISSIONS'
									],
									deny: []
								}],
								_state: 'DEFAULT',
								_ts: modifiedRootNode['_ts'],
								_versionKey: '00000000-0000-4000-8000-000000000001',
								should: 'RUN'
						});
					})
					it('is able to modify the root node by path', () => {
						const modifiedRootNode = connection.modify({
							key: '/',
							editor: (rootNode) => {
								rootNode.should = 'STOP';
								return rootNode;
							}
						});
						expect(modifiedRootNode).toStrictEqual({
							_childOrder: '_ts DESC',
							_id: '00000000-0000-0000-0000-000000000000',
							_indexConfig: modifiedRootNode['_indexConfig'],
							_inheritsPermissions: false,
							_name: '',
							_nodeType: 'default',
							_path: '/',
							_permissions: [{
								principal: 'role:system.admin',
								allow: [
									'READ',
									'CREATE',
									'MODIFY',
									'DELETE',
									'PUBLISH',
									'READ_PERMISSIONS',
									'WRITE_PERMISSIONS'
								],
								deny: []
							}],
							_state: 'DEFAULT',
							_ts: modifiedRootNode['_ts'],
							_versionKey: '00000000-0000-4000-8000-000000000001',
							should: 'STOP'
						});
					});
					describe('createdNode', () => {
						const createRes = connection.create({});
						// log.debug('createRes:%s', createRes);
						const modifiedNode = connection.modify({
							key: createRes._id,
							editor: (node) => {
								node.propertyName = 'propertyValue';
								return node;
							}
						});
						it('returns the modified node', () => {
							expect(modifiedNode).toStrictEqual({
								...createRes,
								propertyName: 'propertyValue'
							})
						}); // it
						it('does NOT modify _id, _name or _path', () => {
							expect(connection.modify({
								key: modifiedNode._id,
								editor: (node) => {
									node._id = 'newId',
									node._name = 'newName';
									node._path = 'newPath';
									return node;
								}
							})).toStrictEqual(modifiedNode);
						}); // it
					}); // describe modifiedNode
				}); // describe modify
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
