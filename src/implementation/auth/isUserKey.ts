import type {
	PrincipalKey,
	UserKey,
} from '@enonic-types/lib-auth';


export function isUserKey(principalKey: PrincipalKey): principalKey is UserKey {
	return principalKey.startsWith('user:');
}
