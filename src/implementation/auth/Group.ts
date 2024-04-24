import type {
	Group as GroupInterface,
	GroupKey,
	UserKey,
} from '@enonic-types/lib-auth';
import type {
	GroupNode,
	GroupNodeData,
} from '../../types';


import {Principal} from './Principal';


export class Group extends Principal implements GroupInterface {

	static fromNode(node: GroupNode): Group {
		return new Group({
			description: node.description,
			displayName: node.displayName,
			key: `group:${node.userStoreKey}:${node._name}`,
			members: node.member,
			modifiedTime: node._ts
		});
	}

	// Constrict Principal
	declare readonly key: GroupInterface['key'];
	readonly type = 'group';
	// Override
	declare public modifiedTime: GroupInterface['modifiedTime'];

	// Extend Principal
	readonly description: GroupInterface['description']// = '';
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
		key: GroupInterface['key']
		// Override
		modifiedTime?: GroupInterface['modifiedTime']
		// Extension
		description?: GroupInterface['description']
		members?: GroupNodeData['member']
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
