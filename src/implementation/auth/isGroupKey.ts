import type {
	GroupKey,
	PrincipalKey,
} from '@enonic-types/lib-auth';


export function isGroupKey(principalKey: PrincipalKey): principalKey is GroupKey {
	return principalKey.startsWith('group:');
}
