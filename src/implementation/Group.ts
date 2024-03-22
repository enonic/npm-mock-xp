import type {
	Group as GroupInterface,
} from '@enonic-types/lib-auth';


import {Principal} from './Principal';


export class Group extends Principal implements GroupInterface {
	// Constrict Principal
	readonly key: GroupInterface['key'];
	readonly type = 'group';
	// Override
	public modifiedTime: GroupInterface['modifiedTime'];

	// Extend Principal
	readonly description: GroupInterface['description']// = '';

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
		key: GroupInterface['key']
		// Override
		modifiedTime?: GroupInterface['modifiedTime']
		// Extension
		description?: GroupInterface['description']
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
