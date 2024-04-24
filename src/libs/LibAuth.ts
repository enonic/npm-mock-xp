import type {
	CreateGroupParams,
	CreateRoleParams,
	CreateUserParams,
	GetProfileParams,
	Group,
	GroupKey,
	LoginParams,
	LoginResult,
	ModifyProfileParams,
	// PrincipalKey,
	Role,
	RoleKey,
	User,
	UserKey,
	UserWithProfile
} from '@enonic-types/lib-auth';
import type {Server} from '../implementation/Server';


export class LibAuth {
	readonly server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	public addMembers(
		principalKey: GroupKey | RoleKey,
		members: (UserKey | GroupKey)[]
	): void {
		this.server.auth.addMembers({
			members,
			principalKey,
		});
		return;
	}

	public createGroup(params: CreateGroupParams): Group {
		return this.server.auth.createGroup(params);
	}

	public getMembers(principalKey: GroupKey | RoleKey): (User | Group)[] {
		return this.server.auth.getMembers({principalKey});
	}

	public getMemberships(
		principalKey: UserKey | GroupKey,
		transitive?: boolean
	): (Group | Role)[] {
		return this.server.auth.getMemberships({
			principalKey,
			transitive
		});
	}

	public createRole(params: CreateRoleParams): Role {
		return this.server.auth.createRole(params);
	}

	public createUser(params: CreateUserParams): User {
		return this.server.auth.createUser(params);
	}

	public getPrincipal(userKey: UserKey): User | null
	public getPrincipal(groupKey: GroupKey): Group | null
	public getPrincipal(roleKey: RoleKey): Role | null
	public getPrincipal(principalKey: UserKey | GroupKey | RoleKey): User | Group | Role | null {
		return this.server.auth.getPrincipal(principalKey);
	}

	public getProfile<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>(params: GetProfileParams): Profile | null {
		return this.server.auth.getProfile(params);
	}

	public getUser(params?: {includeProfile?: false;}): User | null
	public getUser<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>(params: {includeProfile: true;}): UserWithProfile<Profile> | null
	public getUser<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>(params?: {includeProfile?: boolean;}): User | UserWithProfile<Profile> | null {
		return this.server.auth.getUser(params);
	}

	public login(params: LoginParams): LoginResult {
		return this.server.auth.login(params);
	}

	public logout(): void {
		this.server.auth.logout();
	}

	public modifyProfile<
		Profile extends Record<string, unknown> = Record<string, unknown>
	>(params: ModifyProfileParams<Profile>): Profile | null {
		return this.server.auth.modifyProfile(params);
	}

	public removeMembers(
		principalKey: GroupKey | RoleKey,
		members: (UserKey | GroupKey)[]
	): void {
		this.server.auth.removeMembers({
			members,
			principalKey,
		});
		return;
	}
} // class LibAuth
