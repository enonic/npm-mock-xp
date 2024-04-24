import type {
	PrincipalKey,
	RoleKey,
} from '@enonic-types/lib-auth';


export function isRoleKey(principalKey: PrincipalKey): principalKey is RoleKey {
	return principalKey.startsWith('role:');
}
