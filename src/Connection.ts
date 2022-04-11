import type {Log} from './globals.d'
import type { Branch } from './Branch';
import type { JavaBridge } from './JavaBridge';
import type { RepoNodeWithData } from './node/node.d';
import type { NodeCreateParams } from './node/create.d';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse
} from './node/getActiveVersion.d'
import type { NodeModifyParams } from './node/modify.d';
import type { NodeQueryParams } from './node/query';
import type {
	NodeQueryResponse,
	RepoConnection
} from './node/repoConnection.d';


export class Connection implements RepoConnection {
	private _branch :Branch;
	private _javaBridge :JavaBridge;
	readonly log :Log;

	constructor({
		branch,
		javaBridge
	} :{
		branch :Branch,
		javaBridge :JavaBridge
	}) {
		//console.debug('javaBridge.constructor.name', javaBridge.constructor.name);
		this._branch = branch;
		this._javaBridge = javaBridge;
		this.log = this._javaBridge.log;
		//this.log.debug('in Connection constructor');
	}

	create(param :NodeCreateParams) :RepoNodeWithData {
		return this._branch.createNode(param);
	}

	exists(keys: string | Array<string>) :Array<string> {
		return this._branch.existsNode(keys);
	}

	delete(keys: string | Array<string>) :Array<string> {
		return this._branch.deleteNode(keys);
	}

	/*get(key :string) :RepoNodeWithData {
		return this._branch.getNode(key);
	}
	get(keys :string[]) :RepoNodeWithData | RepoNodeWithData[] {
		return this._branch.getNode(keys);
	}*/
	get(...keys :string[]) :RepoNodeWithData | RepoNodeWithData[] {
		return this._branch.getNode(...keys);
	}

	getActiveVersion({
		key
	} :GetActiveVersionParamObject) :GetActiveVersionResponse {
		return this._branch.getNodeActiveVersion({key});
	}

	modify({
		key,
		editor
	} :NodeModifyParams) :RepoNodeWithData {
		return this._branch.modifyNode({
			key,
			editor
		});
	}

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
		return this._branch.query({
			aggregations,
			count,
			explain,
			filters,
			highlight,
			query,
			sort,
			start
		});
	}
} // class Connection
