import type {
	BooleanDslExpression,
	InDslExpression,
	TermDslExpression
} from '@enonic-types/core';
import type {
	MoveNodeParams,
	QueryNodeParams
} from '@enonic-types/lib-node';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse,
	Log,
	NodeCreateParams,
	NodeModifyParams,
	NodeQueryResponse,
	NodeRefreshParams,
	NodeRefreshReturnType,
	RepoNodeWithData
} from './types/index.d'
import type { Repo } from './Repo';

import {
	isQueryDsl,
	toStr
} from '@enonic/js-utils';
import {flatten} from '@enonic/js-utils/array/flatten';
import {forceArray} from '@enonic/js-utils/array/forceArray';
import {enonify} from '@enonic/js-utils/storage/indexing/enonify';
import {sortKeys} from '@enonic/js-utils/object/sortKeys';
import {isUuidV4String} from '@enonic/js-utils/value/isUuidV4String';
import { isString } from '@enonic/js-utils/value/isString';
import {NodeAlreadyExistAtPathException} from './node/NodeAlreadyExistAtPathException';
import {NodeNotFoundException} from './node/NodeNotFoundException';
import deref from './deref';


interface Nodes {
	[key: string]: RepoNodeWithData
}

interface PathIndex {
	[key: string]: string
}

interface SearchIndex {
	[_indexConfig: string]: {
		[valueString: string]: string[]
	}
}

const DEFAULT_INDEX_CONFIG = {
	default: {
		decideByType: true,
		enabled: true,
		nGram: false,
		fulltext: false,
		includeInAllText: false,
		path: false,
		indexValueProcessors: [],
		languages: []
	},
	configs: []
};

const IGNORED_ON_CREATE = [
	// '_id',
	'_path',
	'_state',
	'_ts',
	// '_versionKey'
];


const SEARCH_INDEX_BLACKLIST = [
	'_childOrder',
	'_id',
	'_indexConfig',
	'_inheritsPermissions',
	'_name',
	'_path',
	'_permissions',
	'_state',
	'_ts',
	'_versionKey'
];


function isPathString(key: string): boolean {
	return key.startsWith('/');
}


export class Branch {
	static generateInstantString() {
		return new Date().toISOString();
	}

	private _id: string;
	private _nodes: Nodes = {
		'00000000-0000-0000-0000-000000000000': {
			_childOrder: '_ts DESC',
			_id: '00000000-0000-0000-0000-000000000000',
			_indexConfig: DEFAULT_INDEX_CONFIG,
			_inheritsPermissions: false,
			_name: '',
			_nodeType: 'default',
			_path: '/',
			_permissions: [{
				principal: 'role:system.admin',
				allow: [
					'READ',
					'CREATE',
					'MODIFY',
					'DELETE',
					'PUBLISH',
					'READ_PERMISSIONS',
					'WRITE_PERMISSIONS'
				],
				deny: []
			}],
			_state: 'DEFAULT',
			_ts: Branch.generateInstantString(),
			_versionKey: '00000000-0000-4000-8000-000000000001'
		}
	};
	private _pathIndex: PathIndex = {
		'/': '00000000-0000-0000-0000-000000000000'
	};
	private _searchIndex: SearchIndex = {
		_nodeType: {
			default: ['00000000-0000-0000-0000-000000000000']
		}
	};
	private _repo: Repo;
	readonly log: Log;

	constructor({
		branchId,
		repo
	}: {
		branchId: string
		repo: Repo
	}) {
		//console.debug('repo.constructor.name',repo.constructor.name);
		this._id = branchId;
		this._repo = repo;
		this.log = this._repo.log;
		//this.log.debug('in Branch constructor');
	}

	_createNodeInternal({
		//_childOrder,
		_id = this._repo.generateId(),
		_indexConfig = DEFAULT_INDEX_CONFIG,
		//_inheritsPermissions,
		//_manualOrderValue, // TODO content layer?
		_name,
		_parentPath = '/',
		//_permissions,
		_ts = Branch.generateInstantString(),
		_versionKey = this._repo.generateId(),
		...rest // contains _nodeType
	}: NodeCreateParams & {
		_id?: string
		_ts?: string
		_versionKey?: string
	}): RepoNodeWithData {
		for (let i = 0; i < IGNORED_ON_CREATE.length; i++) {
			const k = IGNORED_ON_CREATE[i] as keyof typeof rest;
			if (rest.hasOwnProperty(k)) { delete rest[k]; }
		}
		if (!rest._nodeType) {
			rest._nodeType = 'default';
		}
		if (!_name) { _name = _id as string; }

		if(!_parentPath.endsWith('/')) {
			_parentPath += '/'
		}
		// this.log.debug('_parentPath:%s', _parentPath);
		// this.log.debug('this._pathIndex:%s', this._pathIndex);

		if (
			_parentPath !== '/' && // The root node actually has no name nor path
			this.existsNode(_parentPath)[0] !== _parentPath
		) {
			throw new NodeNotFoundException(`Cannot create node with name ${_name}, parent '${_parentPath}' not found`);
		}

		if (this._nodes.hasOwnProperty(_id)) { // This can only happen if
			throw new Error(`Node already exists with ${_id} repository: ${this._repo.id()} branch: ${this._id}`); // /lib/xp/node.connect().create() simply ignores _id
			//throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this._repo.id} branch: ${this._id}`);
		}
		const _path: string = `${_parentPath}${_name}`; // TODO use path.join?
		if (this._pathIndex.hasOwnProperty(_path)) {
			throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this._repo.id()} branch: ${this._id}`);
		}

		const node: RepoNodeWithData = {
			_id,
			_indexConfig,
			_name,
			_path,
			_state: 'DEFAULT',
			_ts,
			_versionKey,
			...(enonify(rest) as Object)
		} as unknown as RepoNodeWithData;
		this._nodes[_id] = node;
		this._pathIndex[_path] = _id;

		const restKeys = Object.keys(rest).filter(k => !SEARCH_INDEX_BLACKLIST.includes(k));
		// this.log.debug('_createNodeInternal restKeys:%s', restKeys);

		RestKeys: for (let i = 0; i < restKeys.length; i++) {
			const rootProp = restKeys[i] as string;
			const rootPropValue = rest[rootProp];
			if (!(
				isString(rootPropValue)
				|| (Array.isArray(rootPropValue) && rootPropValue.every(k => isString(k)))
			)) {
				this.log.warning('mock-xp is not able to handle non-string properties yet, skipping rootProp:%s with value:%s', rootProp, toStr(rootPropValue));
				continue RestKeys;
			}
			const valueArr = forceArray(rootPropValue) as string[];
			for (let j = 0; j < valueArr.length; j++) {
				const valueArrItem = valueArr[j] as string;
				if (!this._searchIndex[rootProp]) {
					this._searchIndex[rootProp] = {};
				}
				// @ts-ignore Object is possibly 'undefined'.ts(2532)
				if (this._searchIndex[rootProp][valueArrItem]) {
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					this._searchIndex[rootProp][valueArrItem].push(_id);
				} else {
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					this._searchIndex[rootProp][valueArrItem] = [_id];
				}
			}
		}
		//this.log.debug('this._pathIndex:%s', this._pathIndex);
		return deref(node);
	} // _createNodeInternal

	createNode(params: NodeCreateParams): RepoNodeWithData {
		return this._createNodeInternal(params); // already dereffed
	}

	private keyToId(key: string): string | undefined {
		// this.log.debug('keyToId(%s)', key);
		let maybeId: string|undefined = key;
		if (isPathString(key)) {
			// this.log.debug('isPathString(%s) === true', key);
			const path = (key.length > 1 && key.endsWith('/')) ? key.substring(0, key.length - 1) : key;
			// this.log.debug('path:%s', path);
			maybeId = this._pathIndex[path];
			// this.log.debug('maybeId:%s', maybeId);
			if (!maybeId) {
				// this.log.debug(`Could not find id from path:${path}!`);
				return undefined;
			}
		}
		if (isUuidV4String(maybeId) || maybeId === '00000000-0000-0000-0000-000000000000') {
			return maybeId;
		}
		this.log.debug(`key not an id! key:${key}`);
		//throw new TypeError(`key not an id nor path! key:${key}`);
		return undefined;
	}

	existsNode(keys: string | Array<string>): Array<string> {
		// this.log.debug('existsNode() keys:%s', keys);
		const existingKeys = forceArray(keys)
			.map(k => {
				const id = this.keyToId(k);
				if (!id) {
					return '';
				}
				return this._nodes.hasOwnProperty(id) ? k : '';
			}).filter(x => x);
		//this.log.debug("existsNode() keys:%s existingKeys:'%s'", keys, existingKeys);
		return existingKeys;
	}

	deleteNode(keys: string | string[]): string[] {
		const keysArray = forceArray(keys);
		const deletedKeys = [];
		NodeKeys: for (let i = 0; i < keysArray.length; i++) {
			const key: string = keysArray[i] as string;
			let maybeNode;
			try {
				maybeNode = this.getNode(key) as RepoNodeWithData;
			} catch (e) {
				// no-op
			}
			if (!maybeNode) {
				this.log.warning(`Node with key:'${key}' doesn't exist. Skipping delete.`);
				continue NodeKeys;
			}
			try {
				delete this._pathIndex[maybeNode._path];

				const rootProps = Object.keys(maybeNode).filter(k => !SEARCH_INDEX_BLACKLIST.includes(k));
				// this.log.debug('rootProps:%s', rootProps);

				RootProps: for (let j = 0; j < rootProps.length; j++) {
					const rootPropKey = rootProps[j] as string;
					// this.log.debug('rootPropKey:%s', rootPropKey);

					const rootPropValue = maybeNode[rootPropKey];
					// this.log.debug('rootPropValue:%s', rootPropValue);

					if (!isString(rootPropValue)) {
						this.log.warning('mock-xp is not able to handle non-string properties yet, skipping rootProp:%s with value:%s', rootPropKey, toStr(rootPropValue));
						continue RootProps;
					}
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					if (this._searchIndex[rootPropKey][rootPropValue]) {
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						this._searchIndex[rootPropKey][rootPropValue].splice(
							// @ts-ignore Object is possibly 'undefined'.ts(2532)
							this._searchIndex[rootPropKey][rootPropValue].indexOf(maybeNode._id), 1
						);
					}
				} // for RootProps

				delete this._nodes[maybeNode._id];
				deletedKeys.push(key);
			} catch (e) {
				this.log.error(`Something went wrong when trying to delete node with key:'${key}'`);
			}
		} // for NodeKeys
		return deletedKeys;
	}

	getBranchId() {
		return this._id;
	}

	getNode(...keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
		//this.log.debug('getNode() keys:%s', keys);
		if (!keys.length) {
			return [];
		}
		const flattenedKeys: string[] = flatten(keys) as string[];
		// this.log.debug('getNode() flattenedKeys:%s', flattenedKeys);
		const existingKeys = this.existsNode(flattenedKeys);
		// this.log.debug('getNode() existingKeys:%s', existingKeys);
		const nodes: RepoNodeWithData[] = existingKeys.map(key => {
			const id = this.keyToId(key);
			if (!id) {
				throw new Error(`Can't get id from key:${key}, even though exists???`); // This could happen if node deleted after exists called.
			}
			return deref(this._nodes[id] as RepoNodeWithData);
		});//.filter(x => x as RepoNodeWithData);
		return nodes.length > 1
			? nodes //as RepoNodeWithData[]
			: nodes[0] as RepoNodeWithData;
	}

	getNodeActiveVersion({
		key
	}: GetActiveVersionParamObject): GetActiveVersionResponse {
		const node: RepoNodeWithData | undefined = this.getNode(key) as (RepoNodeWithData | undefined);
		if (node) {
			return {
				versionId: node._versionKey,
				nodeId: node._id,
				nodePath: node._path,
				timestamp: node._ts
			};
		}
		this.log.error(`No such node with key:'${key}`);
		return null;
	}

	getRepo() {
		return this._repo;
	}

	modifyNode({
		key,
		editor
	}: NodeModifyParams): RepoNodeWithData {
		const node: RepoNodeWithData = this.getNode(key) as RepoNodeWithData;
		if (!node) {
			throw new Error(`modify: Node with key:${key} not found!`);
		}
		const _id = node._id;
		const _name = node._name;
		const _path = node._path;
		const modifiedNode: RepoNodeWithData = sortKeys({
			...editor(node),
			_id, // Not allowed to change _id
			_name, // Not allowed to rename
			_path, // Not allowed to move
		} as RepoNodeWithData);
		this._nodes[_id] = modifiedNode;
		return deref(this._nodes[_id] as RepoNodeWithData);
	}

	// Returns true if the node was successfully moved or renamed, false otherwise.
	moveNode({
		// Path or id of the node to be moved or renamed
		source,
		// New path or name for the node. If the target ends in slash '/',
		// it specifies the parent path where to be moved. Otherwise it
		// means the new desired path or name for the node.
		target
	}: MoveNodeParams): RepoNodeWithData | null {
		const node: RepoNodeWithData = this.getNode(source) as RepoNodeWithData; // This derefs
		if (!node) {
			this.log.error('move: Node with source:%s not found!', source);
			throw new Error(`move: Node with source:${source} not found!`); // TODO throw same Error as XP?
			// return false;
		}
		const previousPath = node._path;
		if (target.endsWith('/')) { // Just move
			node._path = `${target}${node._name}`;
		} else if (target.startsWith('/')) { // Rename and move
			const targetParts = target.split('/');
			const newName = targetParts.pop() as string;
			node._name = newName;
			node._path = `${targetParts.join('/')}/${newName}`;
		} else { // Just rename
			const pathParts = node._path.split('/');
			pathParts.pop(); // remove _name from _path
			node._name = target;
			node._path = `${pathParts.join('/')}/${node._name}`;
		}
		// this.log.debug('move: previousPath:%s newPath:%s', previousPath, node._path);

		if (node._path === previousPath) {
			this.log.warning('move: Node with source:%s already at target:%s', source, target);
			return null;
		}

		const newPathParts = node._path.split('/');
		newPathParts.pop(); // remove _name from _path
		let newParentPath = newPathParts.join('/');
		if(!newParentPath.endsWith('/')) {
			newParentPath += '/'
		}
		// this.log.debug('move: newParentPath:%s', newParentPath);
		// this.log.debug('move: this.existsNode(%s):%s', newParentPath, this.existsNode(newParentPath));
		if (
			newParentPath !== '/' && // The root node actually has no name nor path
			this.existsNode(newParentPath)[0] !== newParentPath
		) {
			throw new NodeNotFoundException(`Cannot move node with source ${source} to target ${target}: Parent '${newParentPath}' not found!`);
		}

		if (this._pathIndex.hasOwnProperty(node._path)) {
			throw new NodeAlreadyExistAtPathException(`Cannot move node with source ${source} to target ${target}: Node already exists at ${node._path} repository: ${this._repo.id()} branch: ${this._id}!`);
		}

		delete this._pathIndex[previousPath];
		this._pathIndex[node._path] = node._id;
		this._nodes[node._id] = node;

		return deref(this._nodes[node._id] as RepoNodeWithData);
	}

	_overwriteNode({
		node
	}: {
		node: RepoNodeWithData
	}): RepoNodeWithData {
		this._nodes[node._id] = node;
		return deref(this._nodes[node._id] as RepoNodeWithData);
	}

	//@ts-ignore
	query({
		// aggregations,
		count = 10,
		// explain,
		// filters,
		// highlight,
		query = '', // QueryNodeParams.query is optional
		// sort,
		start = 0
	}: QueryNodeParams): NodeQueryResponse {
		/*this.log.debug('param:%s', {
			aggregations,
			count,
			explain,
			filters,
			highlight,
			query,
			sort,
			start
		});*/
		if (query === '') {
			const ids = Object.keys(this._nodes);
			const total = ids.length;
			if (count === -1) {
				count = total;
			}
			return {
				aggregations: {},
				count: Math.min(count, total),
				hits: ids.map(id => ({
					id,
					score: 1
				})).slice(start, start + count),
				total
			};
		}

		if (isString(query)) {
			throw new Error(`query: unhandeled query string: ${query}!`);
		}

		if (isQueryDsl(query)) {
			this.log.info('query: Search Index: %s', this._searchIndex);
			const mustIds: string[] = [];
			const mustNotIds: string[] = [];
			const {
				// @ts-expect-error Property 'boolean' does not exist on type 'QueryDsl'.ts(2339)
				boolean,
				// term
			} = query;
			if (boolean) {
				const {
					must,
					mustNot,
					// should, filter
				} = boolean as BooleanDslExpression;
				if (must) {
					forceArray(must).forEach(mustDsl => {
						const {
							// @ts-expect-error Property 'in' does not exist on type '{ boolean: BooleanDslExpression; } | { ngram: NgramDslExpression; } | { stemmed: StemmedDslExpression; } | { fulltext: FulltextDslExpression; } | { matchAll: MatchAllDslExpression; } | { pathMatch: PathMatchDslExpression; } | { range: RangeDslExpression; } | { like: LikeDslExpression; } | { in: InDslExpression; } | { term: TermDslExpression; } | { exists: ExistsDslExpression; }'.ts(2339)
							in: inDslExpression,
							// @ts-expect-error Property 'term' does not exist on type '{ boolean: BooleanDslExpression; } | { ngram: NgramDslExpression; } | { stemmed: StemmedDslExpression; } | { fulltext: FulltextDslExpression; } | { matchAll: MatchAllDslExpression; } | { pathMatch: PathMatchDslExpression; } | { range: RangeDslExpression; } | { like: LikeDslExpression; } | { in: InDslExpression; } | { term: TermDslExpression; } | { exists: ExistsDslExpression; }'.ts(2339)
							term
						} = mustDsl;
						if (inDslExpression) {
							const {
								field,
								values
							} = inDslExpression as InDslExpression;
							if (
								!SEARCH_INDEX_BLACKLIST.includes(field)
								&& this._searchIndex[field]
								&& values.every(isString)
							) {
								values.forEach(value => {
									// @ts-ignore Object is possibly 'undefined'.ts(2532)
									if (this._searchIndex[field][value as string]) {
										// @ts-ignore Object is possibly 'undefined'.ts(2532)
										this._searchIndex[field][value as string].forEach(id => {
											if (!mustIds.includes(id)) {
												mustIds.push(id);
											}
										});
									}
								});
							}
						} else if (term) {
							const {
								field,
								value
							} = term as TermDslExpression;
							if (
								!SEARCH_INDEX_BLACKLIST.includes(field)
								&& this._searchIndex[field]
								&& isString(value)
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								&& this._searchIndex[field][value as string]
							) {
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								this._searchIndex[field][value as string].forEach(id => {
									if (!mustIds.includes(id)) {
										mustIds.push(id);
									}
								});
							}
						}
					});
				} // must
				if (mustNot) {
					forceArray(mustNot).forEach(mustNotDsl => {
						const {
							// @ts-expect-error Property 'in' does not exist on type '{ boolean: BooleanDslExpression; } | { ngram: NgramDslExpression; } | { stemmed: StemmedDslExpression; } | { fulltext: FulltextDslExpression; } | { matchAll: MatchAllDslExpression; } | { pathMatch: PathMatchDslExpression; } | { range: RangeDslExpression; } | { like: LikeDslExpression; } | { in: InDslExpression; } | { term: TermDslExpression; } | { exists: ExistsDslExpression; }'.ts(2339)
							in: inDslExpression,
							// @ts-expect-error Property 'term' does not exist on type '{ boolean: BooleanDslExpression; } | { ngram: NgramDslExpression; } | { stemmed: StemmedDslExpression; } | { fulltext: FulltextDslExpression; } | { matchAll: MatchAllDslExpression; } | { pathMatch: PathMatchDslExpression; } | { range: RangeDslExpression; } | { like: LikeDslExpression; } | { in: InDslExpression; } | { term: TermDslExpression; } | { exists: ExistsDslExpression; }'.ts(2339)
							term,
						} = mustNotDsl;
						if (inDslExpression) {
							const {
								field,
								values
							} = inDslExpression as InDslExpression;
							if (
								!SEARCH_INDEX_BLACKLIST.includes(field)
								&& this._searchIndex[field]
								&& values.every(isString)
							) {
								values.forEach(value => {
									// @ts-ignore Object is possibly 'undefined'.ts(2532)
									if (this._searchIndex[field][value as string]) {
										// @ts-ignore Object is possibly 'undefined'.ts(2532)
										this._searchIndex[field][value as string].forEach(id => {
											if (!mustNotIds.includes(id)) {
												mustNotIds.push(id);
											}
										});
									}
								});
							}
						} else if (term) {
							const {
								field,
								value
							} = term as TermDslExpression;
							if (
								!SEARCH_INDEX_BLACKLIST.includes(field)
								&& this._searchIndex[field]
								&& isString(value)
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								&& this._searchIndex[field][value as string]
							) {
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								this._searchIndex[field][value as string].forEach(id => {
									if (!mustNotIds.includes(id)) {
										mustNotIds.push(id);
									}
								});
							}
						}
					});
				} // must
			} // boolean

			const hitIds: string[] = [];
			for (let i = 0; i < mustIds.length; i++) {
				const matchingId = mustIds[i] as string;
				if (!mustNotIds.includes(matchingId)) {
					hitIds.push(matchingId);
				}
			}

			if (count === -1) {
				count = hitIds.length;
			}
			return {
				aggregations: {},
				count: Math.min(count, hitIds.length),
				hits: hitIds.map(id => ({
					id,
					score: 1
				})).slice(start, start + count),
				total: hitIds.length
			}
		} // isQueryDsl

		throw new Error(`query: unhandeled query dsl: ${query}!`);
	} // query

	refresh({
		mode = 'all',
		repo = this._repo.id(),
		branch = this._id
	}: NodeRefreshParams = {}): NodeRefreshReturnType {
		this.log.debug(`refresh({ mode:${mode} repo:${repo} branch:${branch} })`);
		return;
	}
} // class Branch
