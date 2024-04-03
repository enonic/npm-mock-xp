import type {
	BooleanDslExpression,
	InDslExpression,
	TermDslExpression
} from '@enonic-types/core';
import type {
	BooleanFilter,
	HasValueFilter,
	MoveNodeParams,
	QueryNodeParams,
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
} from '../types'
import type { Repo } from './Repo';

import {
	isBoolean,
	isBooleanFilter,
	isFilter,
	isHasValueFilter,
	isQueryDsl,
	toStr
} from '@enonic/js-utils';
import {flatten} from '@enonic/js-utils/array/flatten';
import {forceArray} from '@enonic/js-utils/array/forceArray';
import {enonify} from '@enonic/js-utils/storage/indexing/enonify';
import {sortKeys} from '@enonic/js-utils/object/sortKeys';
// import { isBoolean } from '@enonic/js-utils/value/isBoolean'; // Not exported in package.json yet
import {isUuidV4String} from '@enonic/js-utils/value/isUuidV4String';
import { isString } from '@enonic/js-utils/value/isString';
// import { isFilter } from '@enonic/js-utils/storage/query/filter/isBooleanFilter'; // Not exported in package.json yet
// import { isHasValueFilter } from '@enonic/js-utils/storage/query/filter/isHasValueFilter'; // Not exported in package.json yet
// @ts-ignore TS7016: Could not find a declaration file for module 'uniqs'
import uniqs from 'uniqs';
import intersect from 'intersect';
import {NodeAlreadyExistAtPathException} from './node/NodeAlreadyExistAtPathException';
import {NodeNotFoundException} from './node/NodeNotFoundException';
import deref from '../util/deref';


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


function supportedValueType(v: unknown) {
	return isBoolean(v) || isString(v);
}


export class Branch {
	static generateInstantString() {
		return new Date().toISOString();
	}

	readonly id: string;
	readonly nodes: Nodes = {
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
	readonly pathIndex: PathIndex = {
		'/': '00000000-0000-0000-0000-000000000000'
	};
	readonly searchIndex: SearchIndex = {
		_nodeType: {
			default: ['00000000-0000-0000-0000-000000000000']
		}
	};
	readonly repo: Repo;
	readonly log: Log;

	constructor({
		branchId,
		repo
	}: {
		branchId: string
		repo: Repo
	}) {
		// console.debug('repo.constructor.name',repo.constructor.name);
		this.id = branchId;
		this.repo = repo;
		this.log = this.repo.log;
		// this.log.debug('in Branch constructor');
	}

	_createNodeInternal({
		// _childOrder,
		_id = this.repo.generateId(),
		_indexConfig = DEFAULT_INDEX_CONFIG,
		// _inheritsPermissions,
		// _manualOrderValue, // TODO content layer?
		_name,
		_parentPath = '/',
		// _permissions,
		_ts = Branch.generateInstantString(),
		_versionKey = this.repo.generateId(),
		...rest // contains _nodeType
	}: NodeCreateParams & {
		_id?: string
		_ts?: string
		_versionKey?: string
	}): RepoNodeWithData {
		for (const k of IGNORED_ON_CREATE) {
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
			!this.existsNode(_parentPath)
		) {
			throw new NodeNotFoundException(`Cannot create node with name ${_name}, parent '${_parentPath}' not found`);
		}

		if (this.nodes.hasOwnProperty(_id)) { // This can only happen if
			throw new Error(`Node already exists with ${_id} repository: ${this.repo.id} branch: ${this.id}`); // /lib/xp/node.connect().create() simply ignores _id
			// throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this._repo.id} branch: ${this._id}`);
		}
		const _path: string = `${_parentPath}${_name}`; // TODO use path.join?
		if (this.pathIndex.hasOwnProperty(_path)) {
			throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this.repo.id} branch: ${this.id}`);
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
		this.nodes[_id] = node;
		this.pathIndex[_path] = _id;

		const restKeys = Object.keys(rest).filter(k => !SEARCH_INDEX_BLACKLIST.includes(k));
		// this.log.debug('_createNodeInternal restKeys:%s', restKeys);

		RestKeys: for (const rootProp of restKeys) {
			const rootPropValue = rest[rootProp];
			if (!(
				supportedValueType(rootPropValue)
				|| (
					Array.isArray(rootPropValue)
					&& rootPropValue.every(k => supportedValueType(k))
				)
			)) {
				if (this.repo.server.indexWarnings) {
					this.log.warning('mock-xp is only able to (index for quering) boolean and string properties, skipping rootProp:%s with value:%s', rootProp, toStr(rootPropValue));
				}
				continue RestKeys;
			}
			const valueArr = forceArray(rootPropValue) as (boolean|string)[];
			for (const valueArrItem of valueArr) {
				if (!this.searchIndex[rootProp]) {
					this.searchIndex[rootProp] = {};
				}
				// @ts-ignore Object is possibly 'undefined'.ts(2532)
				if (this.searchIndex[rootProp][valueArrItem]) {
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					this.searchIndex[rootProp][valueArrItem].push(_id);
				} else {
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					this.searchIndex[rootProp][valueArrItem] = [_id];
				}
			} // for valueArr
		} // for RestKeys
		// this.log.error('this._searchIndex:%s', this._searchIndex);
		// this.log.debug('this._pathIndex:%s', this._pathIndex);
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
			maybeId = this.pathIndex[path];
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
		// throw new TypeError(`key not an id nor path! key:${key}`);
		return undefined;
	}

	existsNode(key: string): boolean {
		// this.log.debug('existsNode() keys:%s', keys);
		const id = this.keyToId(key);
		if (!id) {
			return false;
		}
		// this.log.debug("existsNode() key:%s existingKeys:'%s'", key, Object.keys(this._nodes));
		return this.nodes.hasOwnProperty(id);
	}

	deleteNode(keys: string | string[]): string[] {
		const keysArray = forceArray(keys);
		const deletedKeys: string[] = [];
		NodeKeys: for (const key of keysArray) {
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
				// this.log.debug('maybeNode._path:%s', maybeNode._path);
				// this.log.debug('this._pathIndex:%s', this._pathIndex);
				delete this.pathIndex[maybeNode._path];
				// this.log.debug('this._pathIndex:%s', this._pathIndex);

				const rootProps = Object.keys(maybeNode).filter(k => !SEARCH_INDEX_BLACKLIST.includes(k));
				// this.log.debug('rootProps:%s', rootProps);

				RootProps: for (const rootPropKey of rootProps) {
					// this.log.debug('rootPropKey:%s', rootPropKey);

					const rootPropValue = maybeNode[rootPropKey];
					// this.log.debug('rootPropValue:%s', rootPropValue);

					if (!isString(rootPropValue)) {
						if (this.repo.server.indexWarnings) {
							this.log.warning('mock-xp is not able to handle non-string properties yet, skipping rootProp:%s with value:%s', rootPropKey, toStr(rootPropValue));
						}
						continue RootProps;
					}
					// this.log.debug('this._searchIndex:%s', this._searchIndex);
					// @ts-ignore Object is possibly 'undefined'.ts(2532)
					if (this.searchIndex[rootPropKey]?.[rootPropValue]) {
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						this.searchIndex[rootPropKey][rootPropValue].splice(
							// @ts-ignore Object is possibly 'undefined'.ts(2532)
							this.searchIndex[rootPropKey][rootPropValue].indexOf(maybeNode._id), 1
						);
					}
				} // for RootProps

				// this.log.debug('this._nodes:%s', this._nodes);
				delete this.nodes[maybeNode._id];
				// this.log.debug('this._nodes:%s', this._nodes);
				deletedKeys.push(key);
			} catch (e) {
				this.log.error(`Something went wrong when trying to delete node with key:'${key}'`);
			}
		} // for NodeKeys
		return deletedKeys;
	}

	getBranchId() {
		return this.id;
	}

	getNode(...keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
		// this.log.debug('getNode() keys:%s', keys);
		if (!keys.length) {
			return [];
		}
		const flattenedKeys: string[] = flatten(keys) as string[];
		// this.log.debug('pathIndex', this.pathIndex);
		// this.log.debug('getNode() flattenedKeys:%s', flattenedKeys);
		const existingKeys = flattenedKeys
			.map(k => this.existsNode(k) ? k : undefined)
			.filter(k => k) as string[];
		// this.log.debug('getNode() existingKeys:%s', existingKeys);
		const nodes: RepoNodeWithData[] = existingKeys.map(key => {
			const id = this.keyToId(key);
			if (!id) {
				throw new Error(`Can't get id from key:${key}, even though exists???`); // This could happen if node deleted after exists called.
			}
			return deref(this.nodes[id] as RepoNodeWithData);
		});// .filter(x => x as RepoNodeWithData);
		return nodes.length > 1
			? nodes // as RepoNodeWithData[]
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
		return this.repo;
	}

	modifyNode({
		key,
		editor
	}: NodeModifyParams): RepoNodeWithData {
		const node: RepoNodeWithData = this.getNode(key) as RepoNodeWithData;
		if (!node) {
			throw new Error(`modify: Node with key:${key} not found!`);
		}
		const dereffedNode = deref(node);
		const _id = dereffedNode._id;
		const _name = dereffedNode._name;
		const _path = dereffedNode._path;
		const modifiedNode: RepoNodeWithData = sortKeys({
			...editor(dereffedNode),
			_id, // Not allowed to change _id
			_name, // Not allowed to rename
			_path, // Not allowed to move
		} as RepoNodeWithData);
		modifiedNode._versionKey = this.repo.generateId();
		this.nodes[_id] = modifiedNode;
		return deref(this.nodes[_id]) as RepoNodeWithData;
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
			!this.existsNode(newParentPath)
		) {
			throw new NodeNotFoundException(`Cannot move node with source ${source} to target ${target}: Parent '${newParentPath}' not found!`);
		}

		if (this.pathIndex.hasOwnProperty(node._path)) {
			throw new NodeAlreadyExistAtPathException(`Cannot move node with source ${source} to target ${target}: Node already exists at ${node._path} repository: ${this.repo.id} branch: ${this.id}!`);
		}

		delete this.pathIndex[previousPath];
		this.pathIndex[node._path] = node._id;
		this.nodes[node._id] = node;

		return deref(this.nodes[node._id] as RepoNodeWithData);
	} // moveNode

	_overwriteNode({
		node
	}: {
		node: RepoNodeWithData
	}): RepoNodeWithData {
		const previousPath = this.nodes[node._id]._path;
		delete this.pathIndex[previousPath];
		this.pathIndex[node._path] = node._id;
		this.nodes[node._id] = node;
		return deref(this.nodes[node._id] as RepoNodeWithData);
	}

	_handleHasValueFilter(hasValueFilter: HasValueFilter) {
		const hasValueIds: string[] = [];
		const {
			field,
			values
		} = hasValueFilter.hasValue;
		if (
			!SEARCH_INDEX_BLACKLIST.includes(field)
			&& this.searchIndex[field]
		) {
			for (const value of values) {
				if (!supportedValueType(value)) {
					this.log.error('query: Unsupported value type:%s', toStr(value));
				} else {
					if (
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						this.searchIndex[field][value as string]
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						// && Array.isArray(this._searchIndex[field][value as string]) // Trust internal structure
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						&& this.searchIndex[field][value as string].length
					) {
						// @ts-ignore Object is possibly 'undefined'.ts(2532)
						const ids = this.searchIndex[field][value as string] as string[];
						for (const id of ids) {
							if (!hasValueIds.includes(id)) {
								hasValueIds.push(id);
							}
						} // for ids
					}
				}
			} // for values
		}
		// this.log.debug('hasValueIds:%s', hasValueIds);
		return hasValueIds;
	}

	// Stages:
	// Process filters, generate filtersMustIds, filtersMustNotIds, filtersShouldIds
	// @ts-ignore
	query({
		// aggregations,
		count = 10,
		// explain,
		filters,
		// highlight,
		query = '', // QueryNodeParams.query is optional
		// sort,
		start = 0
	}: QueryNodeParams): NodeQueryResponse {
		// this.log.debug('param:%s', {
		// 	// aggregations,
		// 	count,
		// 	// explain,
		// 	filters,
		// 	// highlight,
		// 	query,
		// 	// sort,
		// 	start
		// });

		const filtersMustSets: string[][] = [];
		const filtersMustNotSets: string[][] = [];
		// const filtersShouldSets: string[][] = [];
		let filtersMustIds: string[] = [];
		let filtersMustNotIds: string[] = [];
		// let filtersShouldIds: string[] = [];
		if (
			(Array.isArray(filters) && isFilter(filters))
			|| isFilter(filters)
		) {
			const filtersArray = forceArray(filters);

			for (const filter of filtersArray) {
				if (isBooleanFilter(filter)) {
					const must = forceArray((filter as BooleanFilter).boolean.must ?? []);
					const mustNot = forceArray((filter as BooleanFilter).boolean.mustNot ?? []);
					for (const mustFilter of must) {
						if (isHasValueFilter(mustFilter)) {
							filtersMustSets.push(this._handleHasValueFilter(mustFilter as HasValueFilter));
						}
					} // for must
					for (const mustNotFilter of mustNot) {
						if (isHasValueFilter(mustNotFilter)) {
							filtersMustNotSets.push(this._handleHasValueFilter(mustNotFilter as HasValueFilter));
						}
					} // for mustNot
				} else if (isHasValueFilter(filter)) {
					filtersMustSets.push(this._handleHasValueFilter(filter));
				}
			} // for filters

			// All expressions must evaluate to true to include a node in the result.
			filtersMustIds = intersect(filtersMustSets) as string[];
			// this.log.debug('filtersMustIds:%s', filtersMustIds);

			filtersMustNotIds = uniqs(...filtersMustNotSets) as string[]; // All expressions in the mustNot must evaluate to false for nodes to match.

			// Any leftover ids in the filtersMustSets (not in filtersMustIds)
			// are id's that match at least one, but not all criteria
			// and should thus be excluded from the results
			const allMustIds = uniqs(...filtersMustSets) as string[];
			for (const anMustId of allMustIds) {
				if (
					!filtersMustIds.includes(anMustId as string)
					&& !filtersMustNotIds.includes(anMustId as string)
				) {
					filtersMustNotIds.push(anMustId as string);
				}
			}
		} // filters

		const allIds = Object.keys(this.nodes);
		// this.log.debug('allIds:%s', allIds);

		if (query === '') {
			const mustIds = filtersMustIds.length ? intersect([allIds, filtersMustIds]) : allIds;
			// this.log.debug('mustIds:%s', mustIds);

			const hitIds: string[] = [];
			// this.log.debug('filtersMustNotIds:%s', filtersMustNotIds);
			for (const matchingId of mustIds) {
				// this.log.debug('matchingId:%s', matchingId);
				if (!filtersMustNotIds.includes(matchingId)) {
					hitIds.push(matchingId);
				}
			}
			// this.log.debug('hitIds:%s', hitIds);

			const total = hitIds.length;
			if (count === -1) {
				count = total;
			}
			return {
				aggregations: {},
				count: Math.min(count, total),
				hits: hitIds.map(id => ({
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
			this.log.info('query: Search Index: %s', this.searchIndex);
			const mustSets: string[][] = [];
			const mustNotSets: string[][] = [];

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
						const mustIds: string[] = [];
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
								&& this.searchIndex[field]
								&& values.every(v => supportedValueType(v))
							) {
								values.forEach(value => {
									// @ts-ignore Object is possibly 'undefined'.ts(2532)
									if (this.searchIndex[field][value as string]) {
										// @ts-ignore Object is possibly 'undefined'.ts(2532)
										this.searchIndex[field][value as string].forEach(id => {
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
								&& this.searchIndex[field]
								&& supportedValueType(value)
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								&& this.searchIndex[field][value as string]
							) {
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								this.searchIndex[field][value as string].forEach(id => {
									if (!mustIds.includes(id)) {
										mustIds.push(id);
									}
								});
							}
						}
						mustSets.push(mustIds);
					}); // forEach
				} // must
				if (mustNot) {
					forceArray(mustNot).forEach(mustNotDsl => {
						const mustNotIds: string[] = [];
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
								&& this.searchIndex[field]
								&& values.every(v => supportedValueType(v))
							) {
								values.forEach(value => {
									// @ts-ignore Object is possibly 'undefined'.ts(2532)
									if (this.searchIndex[field][value as string]) {
										// @ts-ignore Object is possibly 'undefined'.ts(2532)
										this.searchIndex[field][value as string].forEach(id => {
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
								&& this.searchIndex[field]
								&& supportedValueType(value)
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								&& this.searchIndex[field][value as string]
							) {
								// @ts-ignore Object is possibly 'undefined'.ts(2532)
								this.searchIndex[field][value as string].forEach(id => {
									if (!mustNotIds.includes(id)) {
										mustNotIds.push(id);
									}
								});
							}
						}
						mustNotSets.push(mustNotIds);
					}); // forEach
				} // mustNot
			} // boolean

			// this.log.debug('filtersMustSets:%s', filtersMustSets);
			// this.log.debug('mustSets:%s', mustSets);
			const filterAndQueryMustSets = filtersMustSets.concat(mustSets);
			// this.log.debug('filterAndQueryMustSets:%s', filterAndQueryMustSets);

			const mustIds = intersect(filterAndQueryMustSets) as string[]; // All expressions must evaluate to true to include a node in the result.
			// this.log.debug('mustIds:%s', mustIds);

			// Any leftover ids in the mustSets (not in mustIds)
			// are id's that match at least one, but not all criteria
			// and should thus be excluded from the results
			// This is valid when the mustIds array is empty.
			const partialMustIds: string[] = [];
			const allMustIds = uniqs(...filterAndQueryMustSets) as string[];
			for (const anMustId of allMustIds) {
				if (
					!mustIds.includes(anMustId as string)
					&& !partialMustIds.includes(anMustId as string)
				) {
					partialMustIds.push(anMustId as string);
				}
			} // for
			// this.log.debug('partialMustIds:%s', partialMustIds);

			// this.log.debug('filtersMustNotSets:%s', filtersMustNotSets);
			// this.log.debug('mustNotSets:%s', mustNotSets);
			const filterAndQueryMustNotSets = filtersMustNotSets.concat(mustNotSets, partialMustIds);
			// this.log.debug('filterAndQueryMustNotSets:%s', filterAndQueryMustNotSets);

			const mustNotIds = uniqs(...filterAndQueryMustNotSets) as string[]; // All expressions in the mustNot must evaluate to false for nodes to match.
			// this.log.debug('mustNotIds1:%s', mustNotIds);

			// TODO: Should: One or more expressions must evaluate to true to include a node in the result.

			const someorAllIds = (filtersMustSets.length || mustSets.length) ? intersect([allIds, mustIds]) : allIds;
			// this.log.debug('someorAllIds:%s', someorAllIds);

			const hitIds: string[] = [];
			for (const matchingId of someorAllIds) {
				// this.log.debug('matchingId:%s', matchingId);
				if (!mustNotIds.includes(matchingId)) {
					hitIds.push(matchingId);
				}
			} // for
			// this.log.debug('hitIds:%s', hitIds);

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
		repo = this.repo.id,
		branch = this.id
	}: NodeRefreshParams = {}): NodeRefreshReturnType {
		this.log.debug(`refresh({ mode:${mode} repo:${repo} branch:${branch} })`);
		return;
	}
} // class Branch
