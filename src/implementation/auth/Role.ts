import type {
	GroupKey,
	Role as RoleInterface,
	UserKey,
} from '@enonic-types/lib-auth';
import type {
	RoleNode,
	RoleNodeData,
} from '../../types';


import {Principal} from './Principal';


export class Role extends Principal implements RoleInterface {

	static fromNode(node: RoleNode): Role {
		return new Role({
			description: node.description,
			displayName: node.displayName,
			key: `role:${node._name}`,
			members: node.member,
			modifiedTime: node._ts
		});
	}

	// Constrict Principal
	readonly type = 'role';
	// Override
	declare readonly key: RoleInterface['key'];
	declare public modifiedTime: RoleInterface['modifiedTime'];

	// Extend Principal
	readonly description: RoleInterface['description']// = '';
	public members: (GroupKey | UserKey)[]

	constructor({
		// Principal
		displayName,
		// Constriction
		key,
		// Override
		modifiedTime,
		// Extension
		description = '',
		members = [],
	}: {
		// Principal
		displayName: Principal['displayName']
		// Constriction
		key: RoleInterface['key']
		// Override
		modifiedTime?: RoleInterface['modifiedTime']
		// Extension
		description?: RoleInterface['description']
		members?: RoleNodeData['member']
	}) {
		super({
			displayName,
			key,
			type: 'user',
		});
		this.description = description;
		this.members = members
			? Array.isArray(members)
				? members
				: [members]
			: [];
		this.modifiedTime = modifiedTime;
	} // constructor

	getMemberKeys(): (GroupKey | UserKey)[] {
		return this.members;
	}
}
