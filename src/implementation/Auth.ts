import type {
	CreateRoleParams,
	CreateUserParams,
	LoginParams,
	LoginResult,
} from '@enonic-types/lib-auth';
import type {
	Node,
} from '@enonic-types/lib-node';

import {Role} from './Role';
import type {RepoConnection} from './RepoConnection';
import {Server} from './Server';
import {User} from './User';


type UserNode = Node<{
	displayName: string
	email?: string
	password?: string
}>


// In the real world groups and users can be stored outside Enonic.
//
// But when it comes to mock-xp we assume that all groups, users and roles are
// stored in the system repo.
//
// In addition we assume only the 'system' id provider.
export class Auth {
	// readonly server: Server;
	readonly systemRepoConnection: RepoConnection;
	public user: User | undefined;

	constructor({
		server
	}: {
		server: Server
	}) {
		// this.server = server;
		this.systemRepoConnection = server.systemRepoConnection;
	}

	private _getUserNodeByName({
		name,
		idProvider = 'system',
	}: {
		name: string
		idProvider?: string
	}): UserNode {
		return this.systemRepoConnection.getSingle<UserNode>(`/identity/${idProvider}/users/${name}`);
	}

	public createRole({
		name,
		displayName,
		description
	}: CreateRoleParams): Role {
		const roleNode = this.systemRepoConnection.create({
			_name: name,
			_parentPath: '/identity/roles',
			displayName,
			principalType: 'ROLE',
		});
		return new Role({
			displayName,
			key: `role:${name}`,
			description,
			modifiedTime: roleNode._ts
		});
	}

	public createUser({
		name,
		displayName,
		idProvider = 'system',
		email = '',
		password = ''
	}: CreateUserParams & {
		password?: string
	}): User {
		const userNode = this.systemRepoConnection.create({
			_name: name,
			_parentPath: `/identity/${idProvider}/users`,
			displayName,
			login: name,
			password,
			principalType: 'USER',
			profile: {},
			userStoreKey: idProvider,
		});
		return new User({
			displayName,
			key: `user:${idProvider}:${name}`,
			idProvider,
			email,
			login: name,
			modifiedTime: userNode._ts
		});
	}

	public getUser() {
		return this.user;
	}

	public getUserByName({
		name,
		idProvider = 'system',
	}: {
		name: string
		idProvider?: string
	}) {
		const userNode = this._getUserNodeByName({idProvider, name});
		return new User({
			displayName: userNode.displayName,
			key: `user:${idProvider}:${name}`,
			idProvider,
			email: userNode.email || '',
			login: name,
			modifiedTime: userNode._ts
		});
	}

	public login({
		user,
		// skipAuth = false,
		password = '',
		idProvider,
		// scope,
		// sessionTimeout
	}: LoginParams): LoginResult {
		const userNode = this._getUserNodeByName({idProvider, name: user});
		const userObject = new User({
			displayName: userNode.displayName,
			key: `user:${idProvider}:${user}`,
			idProvider,
			email: userNode.email || '',
			login: user,
			modifiedTime: userNode._ts
		});
		this.user = userObject;
		return {
			authenticated: password === userNode.password,
			message: 'Login Message',
			user: userObject
		};
	}

	public logout(): void {
		this.user = undefined;
	}
} // class Auth
