import type { Log } from './globals.d'
import type { RepoNodeWithData } from './node/node.d';
import type { NodeCreateParams } from './node/create.d';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse
} from './node/getActiveVersion.d'
import type { NodeModifyParams } from './node/modify.d';
import type { NodeQueryParams } from './node/query';
import type { NodeQueryResponse } from './node/repoConnection.d';
import type { Repo } from './Repo';


import {
	enonify,
	flatten,
	forceArray,
	isUuidV4String,
	lpad,
	sortKeys
} from '@enonic/js-utils/dist/cjs';
import {NodeAlreadyExistAtPathException} from './node/NodeAlreadyExistAtPathException';
import {NodeNotFoundException} from './node/NodeNotFoundException';


interface Nodes {
	[key :string] :RepoNodeWithData
}

interface PathIndex {
	[key :string] :string
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
	'_id',
	'_path',
	'_state',
	'_ts',
	'_versionKey'
];


function isPathString(key :string) :boolean {
	return key.startsWith('/');
}


export class Branch {
	static generateInstantString() {
		return new Date().toISOString();
	}

	private _highest_id :number = 1;
	private _id :string;
	private _nodes :Nodes = {
		'00000000-0000-0000-0000-000000000000': {
			_childOrder: '_ts DESC',
			_id: '00000000-0000-0000-0000-000000000000',
			_indexConfig: DEFAULT_INDEX_CONFIG,
			_inheritsPermissions: false,
			_name: '',
			_nodeType: 'default',
			_path: '',
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
	private _pathIndex :PathIndex = {
		'': '00000000-0000-0000-0000-000000000000'
	};
	private _repo :Repo;
	readonly log :Log;

	constructor({
		branchId,
		repo
	} :{
		branchId :string
		repo :Repo
	}) {
		//console.debug('repo.constructor.name',repo.constructor.name);
		this._id = branchId;
		this._repo = repo;
		this.log = this._repo.log;
		//this.log.debug('in Branch constructor');
	}

	private generateId() :string {
		this._highest_id += 1;
		return `00000000-0000-4000-8000-${lpad(this._highest_id,12,'0')}`;
	}

	createNode({
		//_childOrder,
		_indexConfig = DEFAULT_INDEX_CONFIG,
		//_inheritsPermissions,
		//_manualOrderValue,
		_name,
		_nodeType = 'default',
		_parentPath = '/',
		//_permissions,
		...rest
	} :NodeCreateParams) :RepoNodeWithData {
		for (let i = 0; i < IGNORED_ON_CREATE.length; i++) {
		    const k = IGNORED_ON_CREATE[i] as string;
			if (rest.hasOwnProperty(k)) { delete rest[k]; }
		}
		const _id = this.generateId();
		const _versionKey = this.generateId();
		if (!_name) { _name = _id as string; }

		if(!_parentPath.endsWith('/')) {
			_parentPath += '/'
		}
		//this.log.debug('_parentPath:%s', _parentPath);
		//this.log.debug('this._pathIndex:%s', this._pathIndex);

		if (
			_parentPath !== '/' && // The root node actually has no name nor path
			this.existsNode(_parentPath)[0] !== _parentPath
		) {
			throw new NodeNotFoundException(`Cannot create node with name ${_name}, parent '${_parentPath}' not found`);
		}

		const _ts = Branch.generateInstantString();

		if (this._nodes.hasOwnProperty(_id)) { // This can only happen if
			throw new Error(`Node already exists with ${_id} repository: ${this._repo.id()} branch: ${this._id}`); // /lib/xp/node.connect().create() simply ignores _id
			//throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this._repo.id} branch: ${this._id}`);
		}
		const _path :string = `${_parentPath}${_name}`; // TODO use path.join?
		if (this._pathIndex.hasOwnProperty(_path)) {
			throw new NodeAlreadyExistAtPathException(`Node already exists at ${_path} repository: ${this._repo.id()} branch: ${this._id}`);
		}
		const node :RepoNodeWithData = {
			_id,
			_indexConfig,
			_name,
			_nodeType,
			_path,
			_state: 'DEFAULT',
			_ts,
			_versionKey,
			...(enonify(rest) as Object)
		} as RepoNodeWithData;
		this._nodes[_id] = node;
		this._pathIndex[_path] = _id;
		//this.log.debug('this._pathIndex:%s', this._pathIndex);
		return node;
	}

	private keyToId(key :string) :string | undefined {
		let maybeId :string|undefined = key;
		if (isPathString(key)) {
			const path = key.endsWith('/') ? key.substring(0, key.length - 1) : key;
			//this.log.debug('path:%s', path);
			maybeId = this._pathIndex[path];
			//this.log.debug('maybeId:%s', maybeId);
			if (!maybeId) {
				//throw new Error(`Could not find id from path:${path}!`);
				this.log.debug(`Could not find id from path:${path}!`);
				return undefined;
			}
		}
		if (!isUuidV4String(maybeId)) {
			this.log.debug(`key not an id! key:${key}`);
			//throw new TypeError(`key not an id nor path! key:${key}`);
			return undefined;
		}
		return maybeId;
	}

	existsNode(keys: string | Array<string>) :Array<string> {
		//this.log.debug('existsNode() keys:%s', keys);
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

	deleteNode(keys: string | Array<string>) :Array<string> {
		const keysArray = forceArray(keys);
		const deletedKeys = [];
		for (let i = 0; i < keysArray.length; i++) {
		    const key :string = keysArray[i] as string;
			let maybeNode;
			try {
				maybeNode = this.getNode(key) as RepoNodeWithData;
			} catch (e) {
				// no-op
			}
			if (!maybeNode) {
				this.log.warning(`Node with key:'${key}' doesn't exist. Skipping delete.`);
				continue;
			}
			try {
				delete this._pathIndex[maybeNode._path];
				delete this._nodes[maybeNode._id];
				deletedKeys.push(key);
			} catch (e) {
				this.log.error(`Something went wrong when trying to delete node with key:'${key}'`);
			}
		} // for
		return deletedKeys;
	}

	getNode(...keys :string[]) :RepoNodeWithData | RepoNodeWithData[] {
		//this.log.debug('getNode() keys:%s', keys);
		if (!keys.length) {
			return [];
		}
		const flattenedKeys :string[] = flatten(keys) as string[];
		const existingKeys = this.existsNode(flattenedKeys);
		const nodes :RepoNodeWithData[] = existingKeys.map(key => {
			const id = this.keyToId(key);
			if (!id) {
				throw new Error(`Can't get id from key:${key}, even though exists???`); // This could happen if node deleted after exists called.
			}
			return this._nodes[id] as RepoNodeWithData;
		});//.filter(x => x as RepoNodeWithData);
		return nodes.length > 1
			? nodes //as RepoNodeWithData[]
			: nodes[0] as RepoNodeWithData;
	}

	getNodeActiveVersion({
		key
	} :GetActiveVersionParamObject) :GetActiveVersionResponse {
		const node :RepoNodeWithData | undefined = this.getNode(key) as (RepoNodeWithData | undefined);
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

	modifyNode({
		key,
		editor
	} :NodeModifyParams) :RepoNodeWithData {
		const node :RepoNodeWithData = this.getNode(key) as RepoNodeWithData;
		if (!node) {
			throw new Error(`modify: Node with key:${key} not found!`);
		}
		const _id = node._id;
		const _name = node._name;
		const _path = node._path;
		const modifiedNode :RepoNodeWithData = sortKeys({
			...editor(node),
			_id, // Not allowed to change _id
			_name, // Not allowed to rename
			_path, // Not allowed to move
		} as RepoNodeWithData);
		this._nodes[_id] = modifiedNode;
		return this._nodes[_id] as RepoNodeWithData;
	}

	//@ts-ignore
	query({
		aggregations,
		count,
		explain,
		filters,
		highlight,
		query,
		sort,
		start
	} :NodeQueryParams) :NodeQueryResponse {
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
		const ids = Object.keys(this._nodes);
		const total = ids.length;
		return {
			aggregations: {},
			count: total,
			hits: ids.map(id => ({
				id,
				score: 1
			})),
			total
		};
	} // query
} // class Branch
