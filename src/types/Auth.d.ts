import type {
	CreateNodeParams,
	Node,
} from '@enonic-types/lib-node';


export declare interface GroupNodeData {
	description?: string
	displayName: string
	principalType: 'GROUP'
	userStoreKey: string
	member?: GroupKey | UserKey | (GroupKey | UserKey)[]
}

export declare type GroupNode = Node<GroupNodeData>

export declare type PrincipalKeySystem =
	| "role:system.everyone"
	| "role:system.authenticated"
	| "role:system.admin"
	| "role:system.admin.login"
	| "role:system.auditlog"
	| "role:system.user.admin"
	| "role:system.user.app"
	| "user:system:su";

export declare type PrincipalKeyUser = `user:${string}:${string}`;
export declare type PrincipalKeyGroup = `group:${string}:${string}`;
export declare type PrincipalKeyRole = `role:${string}`;

export declare type PrincipalKey = PrincipalKeySystem | PrincipalKeyUser | PrincipalKeyGroup | PrincipalKeyRole;

export declare type Permission =
	| "READ"
	| "CREATE"
	| "MODIFY"
	| "DELETE"
	| "PUBLISH"
	| "READ_PERMISSIONS"
	| "WRITE_PERMISSIONS"

export declare interface PermissionsParams {
	principal: PrincipalKey
	allow: Array<Permission>
	deny: Array<Permission>
}

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
