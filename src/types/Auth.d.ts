export type PrincipalKeySystem =
	| "role:system.everyone"
	| "role:system.authenticated"
	| "role:system.admin"
	| "role:system.admin.login"
	| "role:system.auditlog"
	| "role:system.user.admin"
	| "role:system.user.app"
	| "user:system:su";

export type PrincipalKeyUser = `user:${string}:${string}`;
export type PrincipalKeyGroup = `group:${string}:${string}`;
export type PrincipalKeyRole = `role:${string}`;

export type PrincipalKey = PrincipalKeySystem | PrincipalKeyUser | PrincipalKeyGroup | PrincipalKeyRole;

export type Permission =
	| "READ"
	| "CREATE"
	| "MODIFY"
	| "DELETE"
	| "PUBLISH"
	| "READ_PERMISSIONS"
	| "WRITE_PERMISSIONS"

export interface PermissionsParams {
	principal: PrincipalKey
	allow: Array<Permission>
	deny: Array<Permission>
}
