import type {PrincipalKey} from '@enonic-types/lib-auth';


export interface PrincipalInterface {
	displayName: string
	key: PrincipalKey
	type: 'group'|'role'|'user'

	modifiedTime?: string
}

export class Principal implements PrincipalInterface {
	readonly displayName: PrincipalInterface['displayName'];
	readonly key: PrincipalInterface['key'];
	readonly type: PrincipalInterface['type'];

	// Optional
	public modifiedTime?: PrincipalInterface['modifiedTime'];

	constructor({
		displayName,
		key,
		type,
	}: {
		displayName: PrincipalInterface['displayName']
		key: PrincipalInterface['key']
		type: PrincipalInterface['type']
	}) {
		this.displayName = displayName;
		this.key = key;
		this.type = type;
	} // constructor
}
