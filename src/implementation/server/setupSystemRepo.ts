import {Server} from '../Server';


export function setupSystemRepo({
	server
}: {
	server: Server
}): void {
	server.systemRepoConnection.create({
		_name: 'identity',
		_parentPath: '/'
	});
	server.systemRepoConnection.create({
		_name: 'roles',
		_parentPath: '/identity'
	});
	server.systemRepoConnection.create({
		_name: 'system.admin',
		_parentPath: '/identity/roles',
		displayName: 'Administrator',
		member: 'user:system:su',
		principalType: 'ROLE',
	});
	server.systemRepoConnection.create({
		_name: 'system.authenticated',
		_parentPath: '/identity/roles',
		displayName: 'Authenticated',
		principalType: 'ROLE',
	});
	server.systemRepoConnection.create({
		_name: 'system.everyone',
		_parentPath: '/identity/roles',
		displayName: 'Everyone',
		principalType: 'ROLE',
	});
	server.systemRepoConnection.create({
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
	server.systemRepoConnection.create({
		_name: 'groups',
		_parentPath: '/identity/system'
	});
	server.systemRepoConnection.create({
		_name: 'users',
		_parentPath: '/identity/system'
	});
	server.auth.createUser({
		displayName: 'Super User',
		name: 'su',
	});
	// server.systemRepoConnection.create({
	// 	_name: 'su',
	// 	_parentPath: '/identity/system/users',
	// 	authenticationHash: Auth.base36Hash(''),
	// 	displayName: 'Super User',
	// 	login: 'su',
	// 	principalType: 'USER',
	// 	profile: {}, // This seems to be correct when viewing with Data Toolbox
	// 	userStoreKey: 'system',
	// });
	server.systemRepoConnection.create({
		_name: 'anonymous',
		_parentPath: '/identity/system/users',
		displayName: 'Anonymous User',
		login: 'anonymous',
		principalType: 'USER',
		profile: {}, // This seems to be correct when viewing with Data Toolbox
		userStoreKey: 'system',
	});
}
