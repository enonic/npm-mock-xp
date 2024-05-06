import type {
	CreateNodeParams,
	MoveNodeParams,
	RepoConnection as RepoConnectionOrig, // TODO Doesn't match currently?
	RefreshMode
} from '@enonic-types/lib-node';

import type { PrincipalKey } from '../auth';

import type {
	// RepoNode,
	RepoNodeWithData
} from './node.d';
// import type { NodeGetParams } from './get.d';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse
} from './getActiveVersion.d'
import type { NodeModifyParams } from './modify.d';
import type { NodeQueryParams } from './query';
import type { AggregationsResponse } from './query/aggregation.d';


export type Source = {
	repoId: string;
	branch: string;
	user?: {
		login: string;
		idProvider?: string;
	};
	principals?: Array<PrincipalKey>;
}

export type NodeQueryHit = {
	readonly id: string;
	readonly score: number;
}

export type NodeQueryResponse<
	AggregationKeys extends undefined|string = undefined
> = {
	readonly total: number;
	readonly count: number;
	readonly hits: ReadonlyArray<NodeQueryHit>;
	readonly aggregations: AggregationsResponse<AggregationKeys>;
}

export type NodeRefreshParams = {
	mode?: RefreshMode
	repo?: string // Repository id: 'com.enonic.cms.default' | 'system-repo'. Default is the current repository set in portal.
	branch?: string // Branch. Default is 'master'.
}

export type RepoConnection = {
	// Commits the active version of nodes.
	// commit(params: CommitParams): CommitResponse;

	// commit(params: MultiCommitParams): ReadonlyArray<CommitResponse>;

	create<NodeData = Record<string, unknown>>(params: CreateNodeParams<NodeData>): Node<NodeData>;

	// Deleting a node or nodes.
	delete(keys: string | Array<string>): Array<string>;

	// Resolves the differences for a node between current and given branch.
	// diff(params: DiffParams): DiffResponse;

	exists(key: string): boolean;
	// exists(key: Parameters<RepoConnectionOrig['exists']>[0]): ReturnType<RepoConnectionOrig['exists']>;

	// Fetch the versions of a node.
	// findVersions(params: FindVersionsParams): NodeVersionQueryResult;

	// Fetches a specific node by path or ID.
	// get<NodeData>(key: string | NodeGetParams): NodeData & RepoNode;
	// get(key: string | NodeGetParams): RepoNodeWithData;
	// get(key: string): RepoNodeWithData;

	// Fetches specific nodes by paths or IDs.
	// get<NodeData>(keys: ReadonlyArray<string | NodeGetParams>): ReadonlyArray<NodeData & RepoNode>;
	// get(keys: Array<string | NodeGetParams>): Array<RepoNodeWithData>;
	// get(keys: string[]): RepoNodeWithData | RepoNodeWithData[];

	// Fetches specific nodes by path(s) or ID(s).
	// get<NodeData>(
	// 	keys: string | NodeGetParams | ReadonlyArray<string | NodeGetParams>
	// ): (NodeData & RepoNode) | ReadonlyArray<NodeData & RepoNode>;
	// get(
	// 	keys: string | NodeGetParams | Array<string | NodeGetParams>
	// ): (RepoNodeWithData) | Array<RepoNodeWithData>;
	// get(keys: string | string[]): RepoNodeWithData | RepoNodeWithData[];
	get(...keys: string[]): RepoNodeWithData | RepoNodeWithData[];

	// This function fetches commit by id. @since 7.7.0
	// getCommit(params: GetCommitParams): CommitResponse;

	// This function returns the active version of a node.
	getActiveVersion(object: GetActiveVersionParamObject): GetActiveVersionResponse;

	// This function sets the active version of a node.
	// setActiveVersion(params: SetActiveVersionParams): boolean;

	// This function returns a binary stream.
	// getBinary(params: GetBinaryParams): import("/lib/xp/content").ByteSource;

	// This command queries nodes.
	// query<AggregationKeys extends string = never>(
	// 	params: NodeQueryParams<AggregationKeys>
	// ): NodeQueryResponse<AggregationKeys>;
	query(params: NodeQueryParams) :NodeQueryResponse

	refresh: RepoConnectionOrig['refresh']
	modify: RepoConnectionOrig['modify']

	move(params: MoveNodeParams): boolean;

	// Pushes a node to a given branch.
	// push(params: PushNodeParams): PushNodeResult;

	// Set the order of the node’s children.
	// setChildOrder<NodeData>(params: SetChildOrderParams): NodeData & RepoNode;

	// Set the root node permissions and inheritance.
	// setRootPermission<NodeData>(params: SetRootPermissionParams): NodeData & RepoNode;

	// Get children for given node.
	// findChildren(params: NodeFindChildrenParams): NodeQueryResponse;
}
