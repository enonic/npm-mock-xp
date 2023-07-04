import {isString} from '@enonic/js-utils/value/isString';
import {
	deepStrictEqual//,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {JavaBridge} from '../../src/JavaBridge';
import {hasMethod} from '../hasMethod';


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			}
		});
		javaBridge.repo.create({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = javaBridge.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a get method', () => {
				deepStrictEqual(
					true,
					hasMethod(connection, 'get')
				);
			}); // it
			describe('Connection', () => {
				describe('get', () => {
					it('get the root node by id', () => {
						const node = connection.get('00000000-0000-0000-0000-000000000000');
						expect(node).toStrictEqual({
							_childOrder: '_ts DESC',
							_id: '00000000-0000-0000-0000-000000000000',
							_indexConfig: node['_indexConfig'],
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
							_ts: node['_ts'],
							_versionKey: '00000000-0000-4000-8000-000000000001'
						});
					});
					it('get the root node by path', () => {
						const node = connection.get('/');
						expect(node).toStrictEqual({
							_childOrder: '_ts DESC',
							_id: '00000000-0000-0000-0000-000000000000',
							_indexConfig: node['_indexConfig'],
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
							_ts: node['_ts'],
							_versionKey: '00000000-0000-4000-8000-000000000001'
						});
					});
					it('return an empty array when no params', () => {
						deepStrictEqual(
							[],
							connection.get()
						);
					}); // it
					describe('createdNodes', () => {
						const createRes = connection.create({});
						it('returns a single node', () => {
							deepStrictEqual(
								createRes,
								connection.get(createRes._id)
							);
						}); // it
						it('returns a multiple nodes', () => {
							const createRes2 = connection.create({});
							//javaBridge.log.debug('createRes2:%s', createRes2);
							deepStrictEqual(
								[createRes,createRes2],
								connection.get(createRes._id,createRes2._id)
							);
							deepStrictEqual(
								[createRes,createRes2],
								//@ts-ignore
								connection.get([createRes._id,createRes2._id])
							);
						}); // it
						it('support key being a path', () => {
							deepStrictEqual(
								createRes,
								connection.get(createRes._path)
							);
						}); // it
					}); // describe createdNodes
				}); // describe get
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
