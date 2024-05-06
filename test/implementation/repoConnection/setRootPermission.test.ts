import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import { Server } from '../../../src';


const server = new Server({
	loglevel: 'error'
});


describe('RepoConnection()', () => {
	describe('setRootPermission()', () => {
		it('should set the root permissions', () => {
			const rootNode = server.systemRepoConnection.get('/');
			expect(rootNode['_inheritsPermissions']).toBeFalsy();
			expect(rootNode['_permissions']).toStrictEqual([{
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
			}]);
			const modifiedRootNode = server.systemRepoConnection.setRootPermission({
				_inheritsPermissions: true,
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
				}, {
					principal: 'role:system.everyone',
					allow: [
						'READ',
					],
					deny: []
				}]
			});
			expect(modifiedRootNode['_inheritsPermissions']).toBeTruthy();
			expect(modifiedRootNode['_permissions']).toStrictEqual([{
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
			}, {
				principal: 'role:system.everyone',
				allow: [
					'READ',
				],
				deny: []
			}]);
		}); // it should set the root permissions
	}); // describe setRootPermission()
}); // describe RepoConnection()
