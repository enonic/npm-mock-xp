import type { NestedRecord } from '@enonic-types/core';
import type {
	Content,
	CreateContentParams,
	GetContentParams,
	ModifyContentParams
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
	// toStr // log mock does not support need toStr
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
		// this.log.debug('in ContentConnection constructor');
		this._branch.createNode({
			_childOrder: 'displayname ASC',
			_indexConfig: {
				"analyzer": "document_index_default",
				"default": {
					"decideByType": true,
					"enabled": true,
					"nGram": false,
					"fulltext": false,
					"includeInAllText": false,
					"path": false,
					"indexValueProcessors": [
					],
					"languages": [
					]
				},
				"configs": [
					{
					"path": "data.siteConfig.applicationkey",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "x.*",
					"config": {
						"decideByType": true,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "attachment.text",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": true,
						"fulltext": true,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "type",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "site",
					"config": {
						"decideByType": false,
						"enabled": false,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "owner",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "modifier",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "modifiedTime",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "language",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": true,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "data",
					"config": {
						"decideByType": true,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "creator",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "createdTime",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					},
					{
					"path": "attachment",
					"config": {
						"decideByType": false,
						"enabled": true,
						"nGram": false,
						"fulltext": false,
						"includeInAllText": false,
						"path": false,
						"indexValueProcessors": [
						],
						"languages": [
						]
					}
					}
				]
				},
				_inheritsPermissions: false,
				_name: 'content',
				_parentPath: '/',
				_permissions: [
				{
					"principal": "role:system.everyone",
					"allow": [
					"READ"
					],
					"deny": [
					]
				},
				{
					"principal": "role:system.admin",
					"allow": [
					"READ",
					"CREATE",
					"MODIFY",
					"DELETE",
					"PUBLISH",
					"READ_PERMISSIONS",
					"WRITE_PERMISSIONS"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.admin",
					"allow": [
					"READ",
					"CREATE",
					"MODIFY",
					"DELETE",
					"PUBLISH",
					"READ_PERMISSIONS",
					"WRITE_PERMISSIONS"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.project.sample-blog.owner",
					"allow": [
					"READ",
					"CREATE",
					"MODIFY",
					"DELETE",
					"PUBLISH",
					"READ_PERMISSIONS",
					"WRITE_PERMISSIONS"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.project.sample-blog.editor",
					"allow": [
					"READ",
					"CREATE",
					"MODIFY",
					"DELETE",
					"PUBLISH",
					"READ_PERMISSIONS",
					"WRITE_PERMISSIONS"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.project.sample-blog.author",
					"allow": [
					"READ",
					"CREATE",
					"MODIFY",
					"DELETE"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.project.sample-blog.contributor",
					"allow": [
					"READ"
					],
					"deny": [
					]
				},
				{
					"principal": "role:cms.project.sample-blog.viewer",
					"allow": [
					"READ"
					],
					"deny": [
					]
				}
			],
			displayName: 'Content',
			type: 'base:folder',
			valid: false,
		});
	}


	contentToNode<
		Data = Record<string, unknown>, Type extends string = string
	>({
		content,
		mode = 'create',
	}: {
		content: CreateContentParams<Data, Type> //| ModifyContentParams<Data, Type>
		mode: 'create' | 'modify'
	}): RepoNodeWithData {
		const {
			name,
			parentPath,
			displayName,
			// requireValid, // We're not running any validaton
			// refresh,
			contentType,
			language,
			childOrder,
			data,
			// @ts-ignore
			type,
			x,
			// idGenerator, // TODO undocumented?
			// workflow // TODO undocumented?
		} = content;
		const node: Partial<RepoNodeWithData> = {
			createdTime: new Date().toISOString(),
			creator: 'user:system:su', // NOTE: Hardcode
			data,
			language,
			owner: 'user:system:su', // NOTE: Hardcode
			type: contentType || type,
			x
		};
		if (mode === 'create') {
			node['_parentPath'] = `/content${parentPath}`;
		} else if (mode === 'modify') {
			if (node._path?.startsWith('/content')) {
				node._path = `/content${node._path}`;
			}
			node['modifiedTime'] = new Date().toISOString();
			node['modifier'] = 'user:system:su'; // NOTE: Hardcode
		}
		if (childOrder) {
			node._childOrder = childOrder;
		}
		if (displayName) {
			node['displayName'] = displayName;
		}
		if (name) {
			node._name = name;
		}
		return node as RepoNodeWithData;
	}

	create<
		Data = Record<string, unknown>, Type extends string = string
	>(params: CreateContentParams<Data, Type>): Content<Data, Type> {
		// this.log.debug('ContentConnection create(%s)', params);
		const createNodeParams = this.contentToNode({
			content: params,
			mode: 'create'
		});
		// this.log.debug('ContentConnection createNodeParams(%s)', createNodeParams);
		const createdNode = this._branch.createNode(createNodeParams);
		// this.log.debug('ContentConnection createdNode(%s)', createdNode);
		// TODO: Modify node to apply displayName if missing
		return this.nodeToContent({node: createdNode}) as Content<Data, Type>;
	}

	get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		// this.log.debug('ContentConnection get(%s)', params);
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

	modify<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: ModifyContentParams<Data, Type>): Content<Data, Type> | null {
		// this.log.debug('ContentConnection modify(%s)', params);
		const {
			editor,
			key,
			// requireValid, // We're not running any validaton
		} = params;
		const content = this.get({key}) as Content<Data, Type> | null;
		if (!content) {
			throw new Error(`Content not found for key: ${key}`);
		}
		const contentToBeModified = editor(content) //as Content<Data, Type>;
		// this.log.debug('ContentConnection contentToBeModified(%s)', contentToBeModified);

		const nodeToBeModified = this.contentToNode<Data, Type>({
			//@ts-ignore
			content: contentToBeModified,
			mode: 'modify'
		});
		// this.log.debug('ContentConnection nodeToBeModified(%s)', nodeToBeModified);

		const rootProps = Object.keys(nodeToBeModified).filter((key) => !key.startsWith('_')
			&& key !== 'createdTime'
			&& key !== 'creator'
		);
		const modifiedNode = this._branch.modifyNode({
			key,
			editor: (existingNode) => {
				for (let i = 0; i < rootProps.length; i++) {
					const prop = rootProps[i] as keyof typeof nodeToBeModified;
					existingNode[prop] = nodeToBeModified[prop];
				}
				return existingNode;
			}
		});
		// this.log.debug('ContentConnection modifiedNode(%s)', modifiedNode);

		const modifiedContent = this.nodeToContent({node: modifiedNode}) as Content<Data, Type>;
		// this.log.debug('ContentConnection modifiedContent(%s)', modifiedContent);

		return modifiedContent;
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
			displayName = _name,
			language,
			modifier,
			modifiedTime,
			owner,
			type,
			valid = true, // TODO Hardcoded
			x = {}
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
			_path: _path.replace(/^\/content/, ''),
			attachments: {}, // TODO Hardcoded
			childOrder: _childOrder,
			creator,
			createdTime,
			data,
			displayName,
			hasChildren: true, // TODO Hardcoded
			owner,
			publish: {}, // TODO Hardcoded
			type,
			valid,
			x
		};
		if (language) {
			content.language = language;
		}
		if (modifier) {
			content.modifier = modifier;
		}
		if (modifiedTime) {
			content.modifiedTime = modifiedTime;
		}
		if (components) {
			const fragmentOrPage = {} as Content['fragment'] | Content['page'];
			for (let i = 0; i < components.length; i++) {
				const component = components[i] as NodeComponent;
				// this.log.debug('ContentConnection nodeToContent component:%s', component);
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
					this.log.debug('ContentConnection nodeToContent pathParts:%s', pathParts);
				}
			} // for components
		}
		return content;
	}
}
