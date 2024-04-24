import type {
	CreateNodeParams,
	FindChildrenParams,
	FindNodesByParentResult,
	MoveNodeParams,
	Node,
	// RepoConnection as RepoConnectionInterface // TODO Doesn't match currently
} from '@enonic-types/lib-node';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse,
	Log,
	NodeModifyParams,
	NodeQueryParams,
	NodeQueryResponse,
	NodeRefreshParams,
	NodeRefreshReturnType,
	RepoConnection as RepoConnectionInterface,
	RepoNodeWithData
} from '../types'
import type { Branch } from './Branch';


export class RepoConnection implements RepoConnectionInterface {
	private branch: Branch;
	readonly log: Log;

	constructor({
		branch,
	}: {
		branch: Branch,
	}) {
		this.branch = branch;
		this.log = this.branch.log;
		// this.log.debug('in Connection constructor');
	}

	// TODO: commit()

	create<NodeData = unknown>(param: CreateNodeParams<NodeData>): Node<NodeData> {
		return this.branch.createNode<NodeData>(param);
	}

	delete(keys: string | Array<string>): Array<string> {
		return this.branch.deleteNode(keys);
	}

	// TODO diff()

	// TODO duplicate()

	exists(key: string): boolean {
		return this.branch.existsNode(key);
	}

	public findChildren({
		count = 10,
		// countOnly = false, // Optimize for count children only - default is false
		// childOrder, // How to order the children - default is value stored on parent
		parentKey,
		// recursive = false, // Do recursive fetching of all children of children - default is false
		start = 0,
	}: FindChildrenParams): FindNodesByParentResult {
		// this.log.debug('findChildren(%s)', { parentKey, start, count, childOrder, countOnly, recursive });

		const parentNode = this.getSingle<Node>(parentKey);
		// this.log.debug('findChildren(): parentNode:%s', parentNode);

		const {
			_path
		} = parentNode;

		const childrenRes = this.query({
			count,
			query: {
				boolean: {
					must: {
						term: {
							field: '_parentPath',
							value: _path,
						}
					}
				}
			},
			//sort,
			start,
		});
		// this.log.debug('findChildren(): childrenRes:%s', childrenRes);

		return {
			count: childrenRes.count,
			hits: childrenRes.hits.map(({
				id
				// score,
			}) => ({
				id
			})),
			total: childrenRes.total,
		}
	} // findChildren

	// TODO findVersion()

	// get(key: string): RepoNodeWithData {
	// 	return this._branch.getNode(key);
	// }
	// get(keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
	// 	return this._branch.getNode(keys);
	// }
	get(...keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
		return this.branch.getNode(...keys);
	}

	getActiveVersion({
		key
	}: GetActiveVersionParamObject): GetActiveVersionResponse {
		return this.branch.getNodeActiveVersion({key});
	}

	public getSingle<T>(key: string): T {
		return this.branch.getNode(key) as T;
	}

	// TODO getBinary()

	// TODO getCommit()

	modify({
		key,
		editor
	}: NodeModifyParams): RepoNodeWithData {
		return this.branch.modifyNode({
			key,
			editor
		});
	}

	move({
		source,
		target
	}: MoveNodeParams): boolean {
		let isMoved = false;
		try {
			isMoved = !!this.branch.moveNode({ source, target });
		} catch (e) {
			this.branch.log.error(`Error in moveNode message:${(e as Error).message}`, e);
		}
		return isMoved;
	}

	// TODO push()

	query({
		aggregations,
		count,
		explain,
		filters,
		highlight,
		query,
		sort,
		start
	}: NodeQueryParams): NodeQueryResponse {
		return this.branch.query({
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

	refresh(params: NodeRefreshParams): NodeRefreshReturnType {
		return this.branch.refresh(params);
	}

	// TODO setActiveVersion()

	// TODO setChildOrder()

	// TODO setRootPermission()

} // class Connection
