import type {
	CreateNodeParams,
	FindChildrenParams,
	FindNodesByParentResult,
	MoveNodeParams,
	Node,
	// RepoConnection as RepoConnectionInterface // TODO Doesn't match currently
	PushNodeParams,
	PushNodesResult,
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

	public getSingle<T = Node>(key: string): T {
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

	public push({
		key, // Id or path to a node
		keys = [], // Array of ids or paths to the nodes
		target, // Branch to push to
		// includeChildren = false, // Also push children of given nodes. Default is false.
		// resolve = true, // Resolve dependencies before pushing, meaning that references will also be pushed. Default is true
		// exclude = [], // Optional array of ids or paths to nodes not to be pushed. If using this, be aware that nodes need to maintain data integrity (e.g parents must be present in target). If data integrity is not maintained with excluded nodes, they will be pushed anyway.
	}: PushNodeParams): PushNodesResult {
		if (target === this.branch.id) {
			throw new Error('Target branch cannot be the same as source branch!')
		}
		const targetBranch: Branch = this.branch.repo.getBranch(target); // Throws if branch not found
		const targetBranchRepoConnection = new RepoConnection({
			branch: targetBranch,
		});
		if (key) {
			keys.push(key);
		}
		if (!keys.length) {
			throw new Error('No keys to push');
		}
		const pushNodesResult: PushNodesResult = {
			success: [],
			failed: [],
			deleted: [],
		};
		nodeKeysLoop: for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			const existsOnSource = this.exists(k);
			// const existsOnTarget = targetBranchRepoConnection.exists(k);
			const existsOnTarget = targetBranch.existsNode(k)

			if (existsOnSource) {
				const nodeOnSource = this.getSingle<RepoNodeWithData>(k);
				if (existsOnTarget) {
					// TODO ALREADY_EXIST
					targetBranch._overwriteNode({ node: nodeOnSource });
					pushNodesResult.success.push(k); // TODO: Does this always return _id or is _path possible?
					continue nodeKeysLoop;
				}

				const createdNode = targetBranch._createNodeInternal(nodeOnSource as unknown);
				if (createdNode) {
					pushNodesResult.success.push(k); // TODO: Does this always return _id or is _path possible?
				} else {
					// istanbul ignore next // Skip coverage for the next line // TODO
					pushNodesResult.failed.push({
						id: k,
						reason: 'PARENT_NOT_FOUND' // TODO This is currently just a hardcode, there might be other reasons?
					});
				}
				continue nodeKeysLoop;
			}

			if (existsOnTarget) {
				if (targetBranchRepoConnection.delete(k)) {
					pushNodesResult.deleted.push(k);
				} else {
					// istanbul ignore next // Skip coverage for the next line // TODO
					pushNodesResult.failed.push({
						id: k,
						reason: 'ACCESS_DENIED' // TODO This is currently just a hardcode, there might be other reasons?
					});
				}
				continue nodeKeysLoop;
			}

			pushNodesResult.failed.push({
				id: k,
				reason: 'NOT_FOUND_ON_SOURCE_NOR_TARGET' // TODO This doesn't exist com.enonic.xp.repo.impl.node.NodePushResult.Reason
			});
		} // for
		return pushNodesResult;
	} // push

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
