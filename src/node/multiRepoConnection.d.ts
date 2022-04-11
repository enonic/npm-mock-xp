import type { PrincipalKey } from '../auth';
import type {
	NodeQueryHit,
	NodeQueryResponse,
	Source
} from './repoConnection';
import type { NodeQueryParams } from './query';


// Multi repo connect requires principles to be present for sources
export type SourceWithPrincipals = Omit<Source, "principals"> & {
	principals: Array<PrincipalKey>;
};

export interface MultiRepoConnectParams {
	sources: Array<SourceWithPrincipals>;
}

export interface MultiRepoNodeQueryHit extends NodeQueryHit {
	readonly repoId: string;
	readonly branch: string;
}

export type MultiRepoNodeQueryResponse<
	AggregationKeys extends undefined|string = undefined
> = Omit<
	NodeQueryResponse<AggregationKeys>,
	"hits"
> & {
	hits: ReadonlyArray<MultiRepoNodeQueryHit>;
};

export interface MultiRepoConnection {
	query<
		AggregationKeys extends undefined|string = undefined
	>(
		params: NodeQueryParams<AggregationKeys>
	): MultiRepoNodeQueryResponse<AggregationKeys>;
}
