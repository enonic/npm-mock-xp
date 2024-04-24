import type {
	Group as GroupInterface,
	// Role as RoleInterface,
	User as UserInterface,
} from '@enonic-types/lib-auth';


import {
	LibAuth,
	Group,
	Role,
	Server,
	// User,
} from '../../../src';


let server: Server;
let libAuth: LibAuth;
let groupWithMembers: Group;
let groupWithoutMembers: GroupInterface;
let roleWithMembers: Role;
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

	groupWithoutMembers = libAuth.createGroup({
		name: "groupWithoutMembers",
		displayName: "Group without Members",
		description: "Group without Members",
		idProvider: "system"
	});

	groupWithMembers = server.auth.createGroup({
		name: 'groupName',
		displayName: 'Group Name',
		description: 'Group Description',
		idProvider: 'system',
		members: [
			groupWithoutMembers.key,
			user.key,
		]
	});

	roleWithMembers = server.auth.createRole({
		name: 'roleName',
		displayName: 'Role Name',
		description: 'Role Description',
		members: [
			groupWithoutMembers.key,
			user.key,
		]
	});

	done();
}); // beforeAll


describe('getMembers', () => {
	it('should get members of a group', () => {
		expect(libAuth.getMembers(groupWithMembers.key)).toEqual([
			groupWithoutMembers,
			user,
		]);
	});

	it('should get members of a role', () => {
		expect(libAuth.getMembers(roleWithMembers.key)).toEqual([
			groupWithoutMembers,
			user,
		]);
	});
});
