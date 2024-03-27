import {SYSTEM_REPO} from '../../constants';
import {Server} from '../Server';


export function setupSystemRepo({
	server
}: {
	server: Server
}) {
	server.createRepo({
		id: SYSTEM_REPO
	});
	const systemRepoConnection = server.connect({
		branchId: 'master',
		repoId: SYSTEM_REPO
	});
	systemRepoConnection.create({
		_name: 'identity',
		_parentPath: '/'
	});
	systemRepoConnection.create({
		_name: 'roles',
		_parentPath: '/identity'
	});
	systemRepoConnection.create({
		_name: 'system.admin',
		_parentPath: '/identity/roles',
		displayName: 'Administrator',
		member: 'user:system:su',
		principalType: 'ROLE',
	});
	systemRepoConnection.create({
		_name: 'system.authenticated',
		_parentPath: '/identity/roles',
		displayName: 'Authenticated',
		principalType: 'ROLE',
	});
	systemRepoConnection.create({
		_name: 'system.everyone',
		_parentPath: '/identity/roles',
		displayName: 'Everyone',
		principalType: 'ROLE',
	});
	systemRepoConnection.create({
		_name: 'system',
		_parentPath: '/identity',
		displayName: 'System Id Provider',
		idProvider: {
			applicationKey: 'com.enonic.xp.app.standardidprovider',
			config: {
				adminUserCreationEnabled: true // TODO hardcoded
			}
		},
	});
	systemRepoConnection.create({
		_name: 'groups',
		_parentPath: '/identity/system'
	});
	systemRepoConnection.create({
		_name: 'users',
		_parentPath: '/identity/system'
	});
	systemRepoConnection.create({
		_name: 'su',
		_parentPath: '/identity/system/users',
		displayName: 'Super User',
		login: 'su',
		principalType: 'USER',
		profile: {}, // This seems to be correct when viewing with Data Toolbox
		userStoreKey: 'system',
	});
	systemRepoConnection.create({
		_name: 'anonymous',
		_parentPath: '/identity/system/users',
		displayName: 'Anonymous User',
		login: 'anonymous',
		principalType: 'USER',
		profile: {}, // This seems to be correct when viewing with Data Toolbox
		userStoreKey: 'system',
	});
	return systemRepoConnection;
}
