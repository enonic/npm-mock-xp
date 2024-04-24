import type {
	Group as GroupInterface,
	Role as RoleInterface,
	User as UserInterface,
} from '@enonic-types/lib-auth';


import {
	LibAuth,
	// Group,
	// Role,
	Server,
	// User,
} from '../../../src';


let server: Server;
let libAuth: LibAuth;
let group: GroupInterface;
let groupWithoutMembers: GroupInterface;
let role: RoleInterface;
let user: UserInterface;


beforeAll(done => {
	server = new Server({
		loglevel: 'silent'
	});

	libAuth = new LibAuth({
		server
	});

	user = libAuth.createUser({
		name: 'userName',
		displayName: 'User Name',
		email: 'user@example.com',
		idProvider: 'system',
	});

	group = libAuth.createGroup({
		name: "groupName",
		displayName: 'Group Name',
			description: 'Group Description',
		idProvider: "system"
	});

	groupWithoutMembers = libAuth.createGroup({
		name: "groupWithoutMembers",
		displayName: "Group without Members",
		description: "Group without Members",
		idProvider: "system"
	});

	role = libAuth.createRole({
		name: 'roleName',
		displayName: 'Role Name',
		description: 'Role Description',
	});

	done();
}); // beforeAll


describe('addMembers', () => {
	it('should add members to a group', () => {
		libAuth.addMembers(group.key, [groupWithoutMembers.key, user.key]);
		expect(libAuth.getMembers(group.key)).toEqual([groupWithoutMembers, user]);
	});

	it('should add members to a role', () => {
		libAuth.addMembers(role.key, [groupWithoutMembers.key, user.key]);
		expect(libAuth.getMembers(role.key)).toEqual([groupWithoutMembers, user]);
	});
});
