import type { NestedRecord } from '@enonic-types/core';
import type {
	Content,
	GetContentParams
} from '@enonic-types/lib-content';
import type { Node } from '@enonic-types/lib-node';
import type {
	Log,
	RepoNodeWithData,
} from './types/index.d'
import type { Branch } from './Branch';
import type { JavaBridge } from './JavaBridge';


import {
	setIn,
	toStr
} from '@enonic/js-utils';


interface NodeComponentLayout {
	layout: {
		config: NestedRecord
		descriptor: string;
	}
	path: string;
	type: 'layout';
}

interface NodeComponentPage {
	page: {
		customized: boolean;
		descriptor: string;
	}
	path: string;
	type: 'page';
}

interface NodeComponentPart {
	part: {
		config: NestedRecord
		descriptor: string;
	}
	path: string;
	type: 'part';
}

type NodeComponent = NodeComponentLayout | NodeComponentPage | NodeComponentPart;


export class ContentConnection {
	private _branch: Branch;
	private _javaBridge: JavaBridge;
	readonly log: Log;

	constructor({
		branch,
		javaBridge
	}: {
		branch: Branch,
		javaBridge: JavaBridge
	}) {
		//console.debug('javaBridge.constructor.name', javaBridge.constructor.name);
		this._branch = branch;
		this._javaBridge = javaBridge;
		this.log = this._javaBridge.log;
		this.log.debug('in ContentConnection constructor');
	}

	get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		this.log.debug('ContentConnection get(%s)', toStr(params));
		const {
			key,
			// versionId
		} = params;
		const node = this._branch.getNode(key) as RepoNodeWithData;
		if (!node) {
			return null;
		}
		return this.nodeToContent({node}) as Hit;
	}

	nodeToContent({node}: {node: RepoNodeWithData}): Content {
		const {
			_childOrder, // on Content as ChildOrder
			_id,
			// _indexConfig, // not on Content
			// _inheritsPermissions, // not on Content
			_name,
			// _nodeType, // not on Content
			_path,
			// _permissions, // not on Content
			// _state, // not on Content
			// _ts, // not on Content
			// _versionKey, // not on Content
			components, // Different on Content
			creator,
			createdTime,
			data,
			displayName,
			language,
			modifier,
			modifiedTime,
			owner,
			type,
			valid,
			x
		} = node as Node<{
			components: NodeComponent[];
			creator: Content['creator'];
			createdTime: Content['createdTime'];
			data: Content['data'];
			displayName: Content['displayName'];
			language: Content['language'];
			modifier: Content['modifier'];
			modifiedTime: Content['modifiedTime'];
			owner: Content['owner'];
			type: Content['type'];
			valid: Content['valid'];
			x: Content['x'];
		}>;
		const content: Content = {
			_id,
			_name,
			_path,
			attachments: {}, // TODO Hardcoded
			childOrder: _childOrder,
			creator,
			createdTime,
			data,
			displayName,
			hasChildren: true, // TODO Hardcoded
			language,
			modifier,
			modifiedTime,
			owner,
			type,
			valid,
			x
		};
		const fragmentOrPage = {} as Content['fragment'] | Content['page'];
		for (let i = 0; i < components.length; i++) {
			const component = components[i] as NodeComponent;
			this.log.debug('ContentConnection nodeToContent component:%s', toStr(component));
			const {
				type,
				path,
				// part,
				// layout
			} = component;
			if (type === 'page' && path === '/') {
				const { page: {
					descriptor
				} } = component;
				setIn(fragmentOrPage, 'descriptor', descriptor);
				setIn(fragmentOrPage, 'path', path);
				setIn(fragmentOrPage, 'type', type);
				setIn(fragmentOrPage, 'regions', {});
				content.page = fragmentOrPage;
			} else {
				const pathParts = path.split('/');
				this.log.debug('ContentConnection nodeToContent pathParts:%s', toStr(pathParts));
			}
		}
		return content;
	}
}
