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
								_versionKey: expect.stringMatching(/00000000-0000-4000-8000-0000000000\d[1-9]/),
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
							_versionKey: expect.stringMatching(/00000000-0000-4000-8000-0000000000\d[1-9]/),
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
								propertyName: 'propertyValue',
								_versionKey: expect.stringMatching(/00000000-0000-4000-8000-0000000000\d[1-9]/),
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
							})).toStrictEqual({
								...modifiedNode,
								_versionKey: expect.stringMatching(/00000000-0000-4000-8000-0000000000\d[1-9]/),
							});
						}); // it
					}); // describe modifiedNode
				}); // describe modify
			}); // describe Connection
		}); // describe connect
	}); // describe Server
}); // describe mock
