import type {
	Role as RoleInterface,
} from '@enonic-types/lib-auth';


import {Principal} from './Principal';


export class Role extends Principal implements RoleInterface {
	// Constrict Principal
	readonly type = 'role';
	// Override
	declare readonly key: RoleInterface['key'];
	declare public modifiedTime: RoleInterface['modifiedTime'];

	// Extend Principal
	readonly description: RoleInterface['description']// = '';

	constructor({
		// Principal
		displayName,
		// Constriction
		key,
		// Override
		modifiedTime,
		// Extension
		description = '',
	}: {
		// Principal
		displayName: Principal['displayName']
		// Constriction
		key: RoleInterface['key']
		// Override
		modifiedTime?: RoleInterface['modifiedTime']
		// Extension
		description?: RoleInterface['description']
	}) {
		super({
			displayName,
			key,
			type: 'user',
		});
		this.description = description;
		this.modifiedTime = modifiedTime;
	} // constructor
}
