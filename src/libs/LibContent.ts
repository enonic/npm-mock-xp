import type { AggregationsToAggregationResults } from '@enonic-types/core';
import type {
	Aggregations,
	ByteSource,
	Content,
	ContentExistsParams,
	ContentsResult,
	CreateContentParams,
	CreateMediaParams,
	DeleteContentParams,
	GetAttachmentStreamParams,
	GetContentParams,
	ModifyContentParams,
	MoveContentParams,
	PublishContentParams,
	PublishContentResult,
	QueryContentParams,
} from '@enonic-types/lib-content';
import type {Server} from '../implementation/Server';


import {Project} from '../implementation/Project';


export class LibContent {
	readonly server: Server;

	constructor({
		server
	}: {
		server: Server
	}) {
		this.server = server;
	}

	private _connect() {
		const repoId = this.server.context.repository;
		if (!repoId) {
			throw new Error('mock-xp: LibContent._connect: No repository set in context!');
		}
		const branchId = this.server.context.branch;
		if (!branchId) {
			throw new Error('mock-xp: LibContent._connect: No branch set in context!');
		}
		return this.server.contentConnect({
			branchId,
			projectId: Project.projectNameFromRepoId(repoId),
		});
	}

	public create<
		Data = Record<string, unknown>, Type extends string = string
	>(params: CreateContentParams<Data, Type>): Content<Data, Type> {
		return this._connect().create<Data, Type>(params);
	}

	public createMedia<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: CreateMediaParams): Content<Data, Type> {
		return this._connect().createMedia<Data, Type>(params);
	}

	public delete(params: DeleteContentParams): boolean {
		return this._connect().delete(params);
	}

	public exists(params: ContentExistsParams): boolean {
		return this._connect().exists(params);
	}

	public get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		return this._connect().get<Hit>(params);
	}

	public getAttachmentStream(params: GetAttachmentStreamParams): ByteSource | null {
		return this._connect().getAttachmentStream(params);
	}

	public modify<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: ModifyContentParams<Data, Type>): Content<Data, Type> | null {
		return this._connect().modify<Data,Type>(params);
	}

	public move<
		Data = Record<string, unknown>, Type extends string = string
	>(params: MoveContentParams): Content<Data, Type> {
		return this._connect().move<Data,Type>(params);
	}

	public publish(params: PublishContentParams): PublishContentResult {
		return this._connect().publish(params);
	}

	public query<
		Hit extends Content<unknown> = Content,
		AggregationInput extends Aggregations = never
	>(params: QueryContentParams<AggregationInput> & {
		_debug?: boolean;
		_trace?: boolean;
	}): ContentsResult<Hit, AggregationsToAggregationResults<AggregationInput>> {
		return this._connect().query(params);
	}

} // class LibContent
