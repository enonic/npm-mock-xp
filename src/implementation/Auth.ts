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
	RoleKey,
	UserKey,
} from '@enonic-types/lib-auth';
import type {Node} from '@enonic-types/lib-node';
import type {UserConstructorParams} from './auth/User';
import type {UserWithProfileConstructorParams} from './auth/UserWithProfile';
import type {
	CreateUserNodeParams,
	Log,
	GroupNode,
	GroupNodeData,
	// RepoNodeWithData,
	RoleNode,
	RoleNodeData,
	UserData,
	UserNode,
} from '../types';


import hash from 'fnv1a';
import {getIn} from '@enonic/js-utils/object/getIn';
import {setIn} from '@enonic/js-utils/object/setIn';
import {Group} from './auth/Group';
import {Role} from './auth/Role';
import {User} from './auth/User';
import type {RepoConnection} from './RepoConnection';
import {Server} from './Server';
import { UserWithProfile } from './auth/UserWithProfile';
import { isGroupKey } from './auth/isGroupKey';
import { isRoleKey } from './auth/isRoleKey';
import { isUserKey } from './auth/isUserKey';


// Backwards compatibility
export type {
	CreateUserNodeParams,
	GroupNode,
	GroupNodeData,
	RoleNode,
	RoleNodeData,
	UserData,
	UserNode,
}


// In the real world groups and users can be stored outside Enonic.
//
// But when it comes to mock-xp we assume that all groups, users and roles are
// stored in the system repo.
//
// In addition we assume only the 'system' id provider.
export class Auth {
	readonly log: Log;
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
		this.log = server.log;
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
		return this.systemRepoConnection._getSingle<UserNode>(`/identity/${idProvider}/users/${name}`);
	}

	public addMembers({
		members,
		principalKey,
	}: {
		members: (UserKey | GroupKey)[]
		principalKey: GroupKey | RoleKey
	}): Group | Role {
		if (isGroupKey(principalKey)) {
			const [_type, idProvider, name] = principalKey.split(':');
			const groupNode = this.systemRepoConnection.modify({
				key: `/identity/${idProvider}/groups/${name}`,
				editor: (groupNode) => {
					const currentMembersArray = groupNode['member']
						? Array.isArray(groupNode['member'])
							? groupNode['member']
							: [groupNode['member']]
						: [];
					groupNode['member'] = [...currentMembersArray, ...members];
					return groupNode;
				}
			}) as unknown as GroupNode;
			return Group.fromNode(groupNode);
		} // if groupKey

		if (isRoleKey(principalKey)) {
			const [_type, name] = principalKey.split(':');
			const RoleNode = this.systemRepoConnection.modify({
				key: `/identity/roles/${name}`,
				editor: (roleNode) => {
					const currentMembersArray = roleNode['member']
						? Array.isArray(roleNode['member'])
							? roleNode['member']
							: [roleNode['member']]
						: [];
					roleNode['member'] = [...currentMembersArray, ...members];
					return roleNode;
				}
			}) as unknown as RoleNode;
			return Role.fromNode(RoleNode);
		} // if roleKey

		if (isUserKey(principalKey)) {
			throw new Error(`addMembers(): Cannot add members to users! UserKey: ${principalKey}`);
		}

		throw new Error(`addMembers(): Principal key ${principalKey} is neither GroupKey nor RoleKey!`);
	} // addMembers

	public createGroup({
		description,
		displayName,
		idProvider,
		members = [],
		name,
	}: CreateGroupParams & {
		members?: (GroupKey | UserKey)[]
	}): Group {
		const groupNode = this.systemRepoConnection.create<GroupNodeData>({
			_name: name,
			_parentPath: `/identity/${idProvider}/groups`,
			description: description,
			displayName: displayName,
			member: members,
			principalType: 'GROUP',
			userStoreKey: idProvider,
		}) as GroupNode;
		return Group.fromNode(groupNode);
	}

	public createRole({
		name,
		displayName,
		description,
		members = [],
	}: CreateRoleParams & {
		members?: (GroupKey | UserKey)[]
	}): Role {
		const roleNode = this.systemRepoConnection.create<RoleNodeData>({
			_name: name,
			_parentPath: '/identity/roles',
			description,
			displayName,
			member: members,
			principalType: 'ROLE',
		});
		return Role.fromNode(roleNode);
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

	public getGroupByName({
		name,
		idProvider = 'system',
	}: {
		name: string
		idProvider?: string
	}): Group {
		const groupNode = this.systemRepoConnection._getSingle<GroupNode>(`/identity/${idProvider}/groups/${name}`);
		if (!groupNode) {
			throw new Error(`Group with name:${name} not found!`);
		}
		return Group.fromNode(groupNode);
	};

	public getMembers({
		principalKey
	}: {
		principalKey: GroupKey | RoleKey
	}): (Group | User)[] {
		if (isGroupKey(principalKey)) {
			const [_type, idProvider, name] = principalKey.split(':');
			const group = this.getGroupByName({
				name,
				idProvider
			});
			const memberKeys = group.getMemberKeys();
			return memberKeys.map((memberKey) => this.getPrincipal(memberKey)).filter(x => x) as (Group | User)[];
		}

		if (isRoleKey(principalKey)) {
			const [_type, name] = principalKey.split(':');
			const role = this.getRoleByName({
				name
			});
			const memberKeys = role.getMemberKeys();
			return memberKeys.map((memberKey) => this.getPrincipal(memberKey)).filter(x => x) as (Group | User)[];
		}

		if (isUserKey(principalKey)) {
			throw new Error(`getMembers(): Users doesn't have members! UserKey: ${principalKey}`);
		}

		throw new Error(`getMembers(): Principal key ${principalKey} is neither GroupKey nor RoleKey!`);
	} // getMembers


	public getMemberships({
		principalKey,
		// transitive = false
	}: {
		principalKey: UserKey | GroupKey,
		transitive?: boolean
	}): (Group | Role)[] {
		if (isGroupKey(principalKey) || isUserKey(principalKey)) {
			const allGroupsAndRolesRes = this.systemRepoConnection.query({
				count: -1,
				query: {
					boolean: {
						must: [{
							in: {
								field: 'principalType',
								values: ['GROUP', 'ROLE']
							},
						},
						{
							in: {
								field: 'member',
								values: [principalKey]
							}
						}]
					}
				}
			});
			// this.log.debug('getMemberships(): allGroupsAndRolesRes:%s', allGroupsAndRolesRes);

			return allGroupsAndRolesRes.hits.map(({id}) => {
				const groupOrRoleNode = this.systemRepoConnection._getSingle<GroupNode|RoleNode>(id);
				if (groupOrRoleNode['principalType'] === 'GROUP') {
					return Group.fromNode(groupOrRoleNode as unknown as GroupNode);
				}
				if (groupOrRoleNode['principalType'] === 'ROLE') {
					return Role.fromNode(groupOrRoleNode as unknown as RoleNode);
				}
				// throw new Error(`getMemberships(): Query for all groups and roles returned unexpected principalType: ${hit}!`);
			});
		}

		if (isRoleKey(principalKey)) {
			throw new Error(`getMemberships(): Roles aren't members! RoleKey: ${principalKey}`);
		}

		throw new Error(`getMemberships(): Principal key ${principalKey} is neither GroupKey nor UserKey!`);

	} // getMemberships


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
		const roleNode = this.systemRepoConnection._getSingle<RoleNode>(`/identity/roles/${name}`);
		if (!roleNode) {
			throw new Error(`Role with name:${name} not found!`);
		}
		return Role.fromNode(roleNode);
	}

	public getUser({
		includeProfile = false
	}: {
		includeProfile?: boolean;
	} = {}): User | UserWithProfile | null {
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
	}): User | UserWithProfile {
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
	}): User | UserWithProfile {
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
		this.systemRepoConnection.modify<Profile>({
			key: `/identity/${idProvider}/users/${name}`,
			editor: (_node) => {
				return userNode as unknown as Node<Profile>;
			}
		});

		return profile;
	}

	public removeMembers({
		members,
		principalKey
	}: {
		principalKey: GroupKey | RoleKey,
		members: (UserKey | GroupKey)[]
	}): Group | Role {
		if (isGroupKey(principalKey)) {
			const [_type, idProvider, name] = principalKey.split(':');
			const groupNode = this.systemRepoConnection.modify({
				key: `/identity/${idProvider}/groups/${name}`,
				editor: (groupNode) => {
					const currentMembersArray = groupNode['member']
						? Array.isArray(groupNode['member'])
							? groupNode['member']
							: [groupNode['member']]
						: [];
					groupNode['member'] = currentMembersArray.filter((member) => {
						return !members.includes(member);
					});
					return groupNode;
				}
			}) as unknown as GroupNode;
			return Group.fromNode(groupNode);
		}

		if (isRoleKey(principalKey)) {
			const [_type, name] = principalKey.split(':');
			const roleNode = this.systemRepoConnection.modify({
				key: `/identity/roles/${name}`,
				editor: (roleNode) => {
					const currentMembersArray = roleNode['member']
						? Array.isArray(roleNode['member'])
							? roleNode['member']
							: [roleNode['member']]
						: [];
						roleNode['member'] = currentMembersArray.filter((member) => {
						return !members.includes(member);
					});
					return roleNode;
				}
			}) as unknown as RoleNode;
			return Role.fromNode(roleNode);
		}

		if (isUserKey(principalKey)) {
			throw new Error(`removeMembers(): Users doesn't have members! UserKey: ${principalKey}`);
		}

		throw new Error(`removeMembers(): Principal key ${principalKey} is neither GroupKey nor RoleKey!`);
	}
} // class Auth
