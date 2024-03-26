import type { NestedRecord } from '@enonic-types/core';
import type {
	ByteSource,
	Content,
	ContentExistsParams,
	CreateContentParams,
	CreateMediaParams,
	DeleteContentParams,
	GetAttachmentStreamParams,
	GetContentParams,
	ModifyContentParams,
	MoveContentParams,
	PublishContentParams,
	PublishContentResult
} from '@enonic-types/lib-content';
import type { Node } from '@enonic-types/lib-node';
import type {
	Log,
	RepoNodeWithData,
	Vol,
} from '../types'
import type { Branch } from './Branch';


import {
	// deleteIn,
	setIn,
	// toStr // log mock does not support need toStr, but throwing Errors does.
} from '@enonic/js-utils';
import { sha512 } from 'node-forge';
import { sync as probeSync } from 'probe-image-size';
import {
	INDEX_CONFIG_DEFAULT,
	PERMISSIONS_DEFAULT,
} from './node/constants';


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


const CHILD_ORDER_DEFAULT = 'displayname ASC'; // NOTE: With small n is actually what Content Studio does.
const USER_DEFAULT = 'user:system:su';


export class ContentConnection {
	readonly branch: Branch;
	// readonly server: Server;
	readonly vol: Vol;
	readonly log: Log;

	constructor({
		branch,
	}: {
		branch: Branch,
	}) {
		// console.debug('javaBridge.constructor.name', javaBridge.constructor.name);
		this.branch = branch;
		this.log = branch.repo.server.log;
		this.vol = branch.repo.server.vol;
		// this.log.debug('in ContentConnection constructor');
		if (!this.branch.existsNode('/content')) {
			this.branch.createNode({
				_childOrder: CHILD_ORDER_DEFAULT,
				_indexConfig: INDEX_CONFIG_DEFAULT,
				_inheritsPermissions: false,
				_name: 'content',
				_parentPath: '/',
				_permissions: PERMISSIONS_DEFAULT,
				displayName: 'Content',
				type: 'base:folder',
				valid: false,
			});
		}
	} // constructor

	// TODO addAttachment()

	// TODO archive()

	contentToNode<
		Data = Record<string, unknown>, Type extends string = string
	>({
		content,
		mode = 'create',
	}: {
		content: CreateContentParams<Data, Type> // | ModifyContentParams<Data, Type>
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
			creator: USER_DEFAULT, // NOTE: Hardcode
			data,
			owner: USER_DEFAULT, // NOTE: Hardcode
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
			node['modifier'] = USER_DEFAULT; // NOTE: Hardcode
		}
		if (childOrder) {
			node._childOrder = childOrder;
		}
		if (displayName) {
			node['displayName'] = displayName;
		}
		if (language) {
			node['language'] = language;
		}
		if (name) {
			node._name = name;
		}
		return node as RepoNodeWithData;
	} // contentToNode

	create<
		Data = Record<string, unknown>, Type extends string = string
	>(params: CreateContentParams<Data, Type>): Content<Data, Type> {
		// this.log.debug('ContentConnection create(%s)', params);
		const createNodeParams = this.contentToNode({
			content: params,
			mode: 'create'
		});
		// this.log.debug('ContentConnection createNodeParams(%s)', createNodeParams);
		const createdNode = this.branch.createNode(createNodeParams);
		// this.log.debug('ContentConnection createdNode(%s)', createdNode);
		// TODO: Modify node to apply displayName if missing
		return this.nodeToContent({node: createdNode}) as Content<Data, Type>;
	} // create

	createMedia<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: CreateMediaParams): Content<Data, Type> {
		// this.log.debug('ContentConnection createMedia(%s)', params); // params.data can be huge!
		const {
			data: fileBuffer,
			focalX = 0.5,
			focalY = 0.5,
			// idGenerator, // TODO undocumented?
			mimeType,
			name,
			parentPath = '/',
		} = params;
		// this.log.debug('ContentConnection createMedia(%s)', {
		// 	focalX, focalY, mimeType, name, parentPath
		// });
		const probeRes = probeSync((fileBuffer as unknown as Buffer));
		// this.log.debug('ContentConnection createMedia probeRes:%s', probeRes);
		const {
			height = 0,
			// mime,
			width = 0,
		} = probeRes || {};
		// this.log.debug('ContentConnection createMedia width:%s height:%s', width, height);

		const data = fileBuffer.toString();
		// this.log.debug('ContentConnection createMedia data:%s', data);

		const sha512HexDigest = sha512.create().update(data).digest().toHex();
		const filePath = `/${sha512HexDigest}`;
		this.vol.writeFileSync(filePath, data)
		const stats = this.vol.statSync(filePath);
		// this.log.debug('ContentConnection createMedia stats:%s', stats);
		const size = stats.size;

		const nameParts = name.split('.');
		nameParts.pop();
		const displayName = nameParts.join('.');

		const createdNode = this.branch.createNode({
			_childOrder: CHILD_ORDER_DEFAULT,
			_indexConfig: INDEX_CONFIG_DEFAULT,
			_inheritsPermissions: true,
			_name: name,
			_parentPath: `/content${parentPath}`,
			_permissions: PERMISSIONS_DEFAULT,
			_nodeType: 'content',
			attachment: {
				binary: name,
				label: 'source',
				mimeType,
				name: name,
				size,
				sha512: sha512HexDigest
			},
			creator: USER_DEFAULT, // NOTE: Hardcode
			createdTime: new Date().toISOString(),
			data: {
				artist: '',
				caption: '',
				copyright: '',
				media: {
					attachment: name,
					focalPoint: {
						x: focalX,
						y: focalY
					}
				},
				tags: ''
			},
			displayName,
			type: 'media:image', // TODO: Detect type
			owner: USER_DEFAULT, // NOTE: Hardcode
			valid: true,
			x: {
				media: {
					imageInfo: {
						imageHeight: height,
						imageWidth: width,
						contentType: mimeType,
						pixelSize: width * height,
						byteSize: size
					}
				}
			}
		});
		// this.log.debug('ContentConnection createMedia createdNode:%s', createdNode);

		const createdContent = this.nodeToContent({node: createdNode}) as Content<Data, Type>;
		// this.log.debug('ContentConnection createMedia createdContent:%s', createdContent);

		return createdContent;
	} // createMedia

	// TODO modifyMedia()

	delete(params: DeleteContentParams): boolean {
		// this.log.debug('ContentConnection delete(%s)', params);
		let { key } = params;
		if (key.startsWith('/')) {
			key = `/content${ key }`;
		}
		const [deletedId] = this.branch.deleteNode(key);
		return !!deletedId;
	} // delete

	// TODO duplicate()

	exists(params: ContentExistsParams): boolean {
		// this.log.debug('ContentConnection exists(%s)', params);
		let { key } = params;
		if (key.startsWith('/')) {
			key = `/content${ key }`;
		}
		const exists = this.branch.existsNode(key);
		// this.log.debug('ContentConnection exists(%s) -> %s', params, exists);
		return exists;
	} // exists

	get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		// this.log.debug('ContentConnection get(%s)', params);
		let {
			key,
			// versionId
		} = params;
		if (key.startsWith('/')) {
			key = `/content${ key }`;
		}
		const node = this.branch.getNode(key) as RepoNodeWithData;
		if (!node) {
			// TODO Some setting to show this warning? Maybe TRACE level?
			// this.log.warning('ContentConnection get: No content for key:%s', key);
			return null;
		}
		return this.nodeToContent({node}) as Hit;
	} // get

	// TODO getAttachments()

	getAttachmentStream(params: GetAttachmentStreamParams): ByteSource | null {
		// this.log.debug('ContentConnection getAttachmentStream(%s)', params);
		let {
			key,
		} = params;
		if (key.startsWith('/')) {
			key = `/content${ key }`;
		}
		const {
			name: paramName
		} = params;
		const node = this.branch.getNode(key) as Node<{
			attachment: {
				name: string
				sha512: string
			}
		}>;
		// console.debug('node', node);
		if (!node) {
			return null;
		}
		const {
			attachment: {
				name: attachmentName,
				sha512
			} = {}
		} = node;
		// this.log.debug('ContentConnection getAttachmentStream node:%s', node);
		if (attachmentName !== paramName) {
			this.log.warning('ContentConnection getAttachmentStream content has no attachment named:%s', paramName);
			return null;
		}
		if(!sha512) {
			this.log.warning('ContentConnection getAttachmentStream unable to find sha512 for attachment named:%s', paramName);
			return null;
		}
		return this.vol.readFileSync(`/${sha512}`) as unknown as ByteSource;
	} // getAttachmentStream

	// TODO getChildren()

	// TODO getOutboundDependencies()

	// TODO getPermissions()

	// TODO getSite()

	// TODO getSiteConfig()

	// TODO getType()

	// TODO getTypes()

	modify<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: ModifyContentParams<Data, Type>): Content<Data, Type> | null {
		// this.log.debug('ContentConnection modify(%s)', params);
		const {
			key: contentIdOrPath,
			editor,
			// requireValid, // We're not running any validaton
		} = params;
		const content = this.get({key: contentIdOrPath}) as Content<Data, Type> | null;
		if (!content) {
			throw new Error(`Content not found for key: ${contentIdOrPath}`);
		}
		const contentToBeModified = editor(content) // as Content<Data, Type>;
		// this.log.debug('ContentConnection contentToBeModified(%s)', contentToBeModified);

		const nodeToBeModified = this.contentToNode<Data, Type>({
			// @ts-ignore
			content: contentToBeModified,
			mode: 'modify'
		});
		// this.log.debug('ContentConnection nodeToBeModified(%s)', nodeToBeModified);

		const rootProps = Object.keys(nodeToBeModified).filter((key) => !key.startsWith('_')
			&& key !== 'createdTime'
			&& key !== 'creator'
		);
		const nodeKey = contentIdOrPath.startsWith('/') ? `/content${contentIdOrPath}`: contentIdOrPath;
		const modifiedNode = this.branch.modifyNode({
			key: nodeKey,
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
	} // modify

	move<
		Data = Record<string, unknown>, Type extends string = string
	>(params: MoveContentParams): Content<Data, Type> {
		// this.log.debug('ContentConnection move(%s)', params);
		let {
			source,
			target
		} = params;
		if (source.startsWith('/')) {
			source = `/content${source}`
		}
		if (target.startsWith('/')) {
			target = `/content${target}`
		}
		const movedNode = this.branch.moveNode({ source, target }) // This can throw
		if (movedNode) {
			const modifiedContent = this.modify({ // Adds/updates modifiedTime and modifier
				key: movedNode._id,
				editor: (n) => n
			});
			return modifiedContent as Content<Data, Type>;
		}
		throw new Error(`Unable to move content from ${source} to ${target}!`);
	} // move

	nodeToContent({
		node
	}: {
		node: RepoNodeWithData
	}): Content {
		// this.log.debug('nodeToContent(%s)', {node});
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
		// if (_path) {
		// 	content._path = _path.replace(/^\/content/, '');
		// }
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
	} // nodeToContent

	// This function publishes content to the master branch
	publish(params: PublishContentParams): PublishContentResult {
		// TODO: Publish should fail if parent is not published.
		// this.log.debug('ContentConnection publish(%s)', params);
		const {
			keys, // List of all content keys(path or id) that should be published
			// sourceBranch, // Not in use from XP 7.12.0 The branch where the content to be published is stored.
			// targetBranch, // Not in use since XP 7.12.0 The branch to which the content should be published. Technically, publishing is just a move from one branch to another, and publishing user content from master to draft is therefore also valid usage of this function, which may be practical if user input to a web-page is stored on master
			// schedule, // Schedule the publish
			// includeChildren, // TODO: Undocumented???
			// excludeChildrenIds, // List of content keys whose descendants should be excluded from publishing
			// includeDependencies, // Whether all related content should be included when publishing content
			// message // TODO: Undocumented???
		} = params;
		const branchId = this.branch.getBranchId();
		if (branchId !== 'draft') {
			throw new Error(`ContentConnection publish only allowed from the draft branch, got:${branchId}`);
		}
		const masterBranch = this.branch.getRepo().getBranch('master');
		const contentMasterConnection = new ContentConnection({
			branch: masterBranch
		});
		const res: PublishContentResult = {
			deletedContents: [],
			failedContents: [],
			pushedContents: [],
		};
		contentKeysLoop: for (let i = 0; i < keys.length; i++) {
			const contentKey = keys[i] as string;
			const nodeKey = contentKey.startsWith('/') ? `/content${contentKey}`: contentKey;

			const existsOnDraft = this.exists({ key: contentKey });

			if (existsOnDraft) {
				const nodeOnDraft = this.branch.getNode(nodeKey) as RepoNodeWithData;
				// this.log.debug('ContentConnection nodeOnDraft(%s)', nodeOnDraft);
				// this.log.debug('ContentConnection nodeOnDraft(%s)', {
				// 	_id: nodeOnDraft._id,
				// 	_path: nodeOnDraft._path,
				// });

				const nodeId = nodeOnDraft._id;  // Path may have changed by move on draft
				const existsOnMaster = contentMasterConnection.exists({ key: nodeId });
				if (existsOnMaster) {
					const overriddenNode = masterBranch._overwriteNode({ node: nodeOnDraft });
					if (overriddenNode) {
						this.log.debug("ContentConnection publish: Modified content with id %s on the master branch!", nodeId);
						res.pushedContents.push(contentKey);
					} else {
						this.log.error("ContentConnection publish: Failed to modify content with id %s on the master branch!", nodeId);
						res.failedContents.push(contentKey);
					}
					continue contentKeysLoop;
				} // if existsOnMaster

				const pathParts = nodeOnDraft._path.split('/');
				pathParts.pop();
				nodeOnDraft['_parentPath'] = pathParts.join('/');
				// deleteIn(nodeOnDraft as unknown as NestedRecord, '_path'); // Causes problems
				const createdNode = masterBranch._createNodeInternal(nodeOnDraft);
				if (createdNode) {
					this.log.debug("ContentConnection publish: Created content with key %s on the master branch!", contentKey);
					res.pushedContents.push(contentKey);
				} else {
					this.log.error("ContentConnection publish: Failed to create content with key %s on the master branch!", contentKey);
					res.failedContents.push(contentKey);
				}
				continue contentKeysLoop;
			} // if existsOnDraft

			const existsOnMaster = contentMasterConnection.exists({ key: contentKey });
			if (existsOnMaster) {
				if (contentMasterConnection.delete({ key: contentKey })) {
					this.log.debug("ContentConnection publish: Deleted content with key %s from the master branch!", contentKey);
					res.deletedContents.push(contentKey);
					continue contentKeysLoop;
				} else {
					this.log.error("ContentConnection publish: Failed to delete content with key %s from the master branch!", contentKey);
					res.failedContents.push(contentKey);
					continue contentKeysLoop;
				}
			}
			this.log.error("ContentConnection publish: Content with key %s doesn't exist on the draft nor the master branch!", contentKey);
			res.failedContents.push(contentKey);
		} // for
		return res;
	}

	// TODO query()

	// TODO removeAttachment()

	// TODO resetInheritance()

	// TODO restore()

	// TODO setPermissions()

	// TODO unpublish()

}
