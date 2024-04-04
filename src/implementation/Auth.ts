import type {
	CreateGroupParams,
	CreateRoleParams,
	CreateUserParams,
	GetProfileParams,
	GroupKey,
	LoginParams,
	LoginResult,
	ModifyProfileParams,
	PrincipalKey,
	// RoleKey,
	UserKey,
} from '@enonic-types/lib-auth';
import type {
	CreateNodeParams,
	Node,
} from '@enonic-types/lib-node';
import type {UserConstructorParams} from './auth/User';
import type {UserWithProfileConstructorParams} from './auth/UserWithProfile';
import type {RepoNodeWithData} from '../types';


import hash from 'fnv1a';
import {getIn} from '@enonic/js-utils/object/getIn';
import {setIn} from '@enonic/js-utils/object/setIn';
import {Group} from './auth/Group';
import {Role} from './auth/Role';
import {User} from './auth/User';
import type {RepoConnection} from './RepoConnection';
import {Server} from './Server';
import { UserWithProfile } from './auth/UserWithProfile';


export declare interface GroupNodeData {
	description?: string
	displayName: string
	principalType: 'GROUP'
	userStoreKey: string
	member?: GroupKey | UserKey | (GroupKey | UserKey)[]
}

export declare type GroupNode = Node<GroupNodeData>

export declare interface RoleNodeData {
	description?: string
	displayName: string
	principalType: 'ROLE'
	member?: GroupKey | UserKey | (GroupKey | UserKey)[]
}

export declare type RoleNode = Node<RoleNodeData>

export declare interface UserData<
	Profile extends Record<string, unknown> = Record<string, unknown>
> {
	authenticationHash?: string
	displayName: string
	email?: string
	login: string
	principalType: 'USER'
	profile?: Profile
	userStoreKey: string
}

export declare type CreateUserNodeParams = CreateNodeParams<UserData>

export declare type UserNode<
	Profile extends Record<string, unknown> = Record<string, unknown>
> = Node<UserData<Profile>>


// In the real world groups and users can be stored outside Enonic.
//
// But when it comes to mock-xp we assume that all groups, users and roles are
// stored in the system repo.
//
// In addition we assume only the 'system' id provider.
export class Auth {
	readonly server: Server;
	readonly systemRepoConnection: RepoConnection;

	static base36Hash(string: string): string {
		return hash(string).toString(36);
	}

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
		this.systemRepoConnection = server.systemRepoConnection;
	}

	private _getUserNodeByName({
		name,
		idProvider = 'system',
	}: {
		name: string
		idProvider?: string
	}): UserNode | undefined {
		return this.systemRepoConnection.getSingle<UserNode>(`/identity/${idProvider}/users/${name}`);
	}

	public createGroup({
		description,
		displayName,
		idProvider,
		name,
	}: CreateGroupParams): Group {
		const groupNode = this.systemRepoConnection.create<GroupNodeData>({
			_name: name,
			_parentPath: `/identity/${idProvider}/groups`,
			description: description,
			displayName: displayName,
			principalType: 'GROUP',
			userStoreKey: idProvider,
		}) as GroupNode;
		return new Group({
			description: description,
			displayName: displayName,
			key: `group:${idProvider}:${name}`,
			modifiedTime: groupNode._ts
		});
	}

	public createRole({
		name,
		displayName,
		description
	}: CreateRoleParams): Role {
		const roleNode = this.systemRepoConnection.create<RoleNodeData>({
			_name: name,
			_parentPath: '/identity/roles',
			description,
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
		password = '',
		profile = {}, // This seems to be correct when viewing with Data Toolbox
	}: Omit<CreateUserParams, 'idProvider'> & {
		idProvider?: string
		password?: string
		profile?: Record<string, unknown>
	}): User {
		const createParams: CreateUserNodeParams = {
			_name: name,
			_parentPath: `/identity/${idProvider}/users`,
			authenticationHash: Auth.base36Hash(password),
			displayName,
			email,
			login: name,
			principalType: 'USER',
			profile,
			userStoreKey: idProvider,
		};
		const userNode = this.systemRepoConnection.create<UserData>(createParams);
		return new User({
			displayName,
			key: `user:${idProvider}:${name}`,
			idProvider,
			email,
			login: name,
			modifiedTime: userNode._ts
		});
	}

	public getPrincipal(principalKey: PrincipalKey): User | Group | Role | null {
		const [type, two, three] = principalKey.split(':');
		if (type === 'user') {
			return this.getUserByName({
				name: three,
				idProvider: two
			});
		}
		if (type === 'group') {
			return this.getGroupByName({
				name: three,
				idProvider: two
			});
		}
		if (type === 'role') {
			return this.getRoleByName({
				name: two
			});
		}
		throw new Error(`Principal type ${type} unsupported!`);
	}

	public getGroupByName({
		name,
		idProvider = 'system',
	}: {
		name: string
		idProvider?: string
	}) {
		const groupNode = this.systemRepoConnection.getSingle<GroupNode>(`/identity/${idProvider}/groups/${name}`);
		if (!groupNode) {
			throw new Error(`Group with name:${name} not found!`);
		}
		return new Group({
			description: groupNode.description || '',
			displayName: groupNode.displayName,
			key: `group:${idProvider}:${name}`,
			modifiedTime: groupNode._ts
		});
	};

	public getProfile<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>({
		key,
		scope,
	}: GetProfileParams): Profile | null {
		const [_type, idProvider, name] = key.split(':');
		const userNode = this._getUserNodeByName({
			name,
			idProvider,
		});
		// this.server.log.debug('userNode', userNode);
		if (!userNode) {
			throw new Error(`User not found: ${key}!`);
		}
		if (userNode.profile) {
			if (scope) {
				const profile = getIn(userNode.profile, scope);
				if (profile) {
					return profile as Profile;
				}
				return null;
			}
			return userNode.profile as Profile;
		}
		return null;
	}

	public getRoleByName({
		name,
	}: {
		name: string
	}): Role {
		const roleNode = this.systemRepoConnection.getSingle<RoleNode>(`/identity/roles/${name}`);
		if (!roleNode) {
			throw new Error(`Role with name:${name} not found!`);
		}
		return new Role({
			displayName: roleNode.displayName,
			key: `role:${name}`,
			description: roleNode.description || '',
			modifiedTime: roleNode._ts
		});
	}

	public getUser({
		includeProfile = false
	}: {
		includeProfile?: boolean;
	} = {}) {
		if (this.server.userKey) {
			return this.getUserByUserKey({
				includeProfile,
				userKey: this.server.userKey,
			});
		}
		return null;
	}

	public getUserByName({
		name,
		idProvider = 'system',
		includeProfile = false,
	}: {
		name: string
		idProvider?: string
		includeProfile?: boolean
	}) {
		const userNode = this._getUserNodeByName({idProvider, name});
		if (!userNode) {
			throw new Error(`User not found: user:${idProvider}:${name}!`);
		}
		const params: UserConstructorParams = {
			displayName: userNode.displayName,
			key: `user:${idProvider}:${name}`,
			idProvider,
			email: userNode.email || '',
			login: name,
			modifiedTime: userNode._ts
		};
		if (includeProfile) {
			(params as UserWithProfileConstructorParams).profile = userNode.profile;
			return new UserWithProfile(params);
		}
		return new User(params);
	}

	public getUserByUserKey({
		userKey,
		includeProfile = false,
	}: {
		userKey: UserKey,
		includeProfile?: boolean
	}) {
		const [_type, idProvider, name] = userKey.split(':');
		return this.getUserByName({
			name,
			idProvider,
			includeProfile,
		});
	}

	public login({
		user,
		// skipAuth = false,
		password = '',
		idProvider = 'system',
		// scope,
		// sessionTimeout
	}: LoginParams): LoginResult {
		const userNode = this._getUserNodeByName({idProvider, name: user});
		if (!userNode) {
			this.server.log.debug(`User not found: user:${idProvider}:${user}!`);
			return {
				authenticated: false,
				message: 'Access Denied',
			};
		}
		const authenticated = Auth.base36Hash(password) === userNode.authenticationHash;
		if (authenticated) {
			const userKey: UserKey = `user:${idProvider}:${user}`;
			this.server.userKey = userKey;
			return {
				authenticated,
				message: '',
				user: new User({
					displayName: userNode.displayName,
					key: userKey,
					idProvider,
					email: userNode.email || '',
					login: user,
					modifiedTime: userNode._ts
				})
			};
		}
		this.server.log.debug(`Wrong password for user:${idProvider}:${user}!`);
		return {
			authenticated,
			// Same as when user not found, probably a security feature.
			message: 'Access Denied',
		};
	}

	public logout(): void {
		// this.server.context.setUser(null);
		this.server.userKey = undefined;
	}

	public modifyProfile<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>({
		key,
		scope,
		editor
	}: ModifyProfileParams<Profile>): Profile | null {
		const [_type, idProvider, name] = key.split(':');

		const userNode = this._getUserNodeByName({idProvider, name});
		if (!userNode) {
			throw new Error(`User not found: ${key}!`);
		}

		if (!userNode.profile) {
			userNode.profile = {};
		}

		let profile: Profile;
		if (scope) {
			setIn(userNode.profile, scope, {});
			const nested = getIn(userNode.profile, scope);
			profile = editor(nested as Profile);
		} else {
			profile = editor(userNode.profile as Profile);
		}

		// TODO Does this have side-effects?
		this.systemRepoConnection.modify({
			key: `/identity/${idProvider}/users/${name}`,
			editor: (_node) => {
				return userNode as unknown as RepoNodeWithData;
			}
		});

		return profile;
	}
} // class Auth
