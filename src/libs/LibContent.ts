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
// import type {Project} from '../implementation/Project';
import type {Server} from '../implementation/Server';


import {ContentConnection} from '../implementation/ContentConnection';


export class LibContent {
	// readonly connection: ContentConnection;
	// readonly project: Project;
	readonly server: Server;

	constructor({
		// project
		server
	}: {
		// project: Project
		server: Server
	}) {
		// Since project.connection can be changed by Context this will break
		// stuff. So don't do this:
		// this.connection = project.connection;
		// this.project = project;
		this.server = server;
	}

	connect() {
		const repoId = this.server.context.repository;
		if (!repoId) {
			throw new Error('No repository set in context!');
		}
		const repo = this.server.repos[repoId];
		const branchId = this.server.context.branch;
		if (!branchId) {
			throw new Error('No branch set in context!');
		}
		const branch = repo.getBranch(branchId);
		const contentConnection = new ContentConnection({
			branch
		});
		return contentConnection;
	}

	public create<
		Data = Record<string, unknown>, Type extends string = string
	>(params: CreateContentParams<Data, Type>): Content<Data, Type> {
		return this.connect().create(params);
	}

	public createMedia<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: CreateMediaParams): Content<Data, Type> {
		return this.connect().createMedia(params);
	}

	public delete(params: DeleteContentParams): boolean {
		return this.connect().delete(params);
	}

	public exists(params: ContentExistsParams): boolean {
		return this.connect().exists(params);
	}

	public get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		return this.connect().get(params);
	}

	public getAttachmentStream(params: GetAttachmentStreamParams): ByteSource | null {
		return this.connect().getAttachmentStream(params);
	}

	public modify<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: ModifyContentParams<Data, Type>): Content<Data, Type> | null {
		return this.connect().modify(params);
	}

	public move<
		Data = Record<string, unknown>, Type extends string = string
	>(params: MoveContentParams): Content<Data, Type> {
		return this.connect().move(params);
	}

	public publish(params: PublishContentParams): PublishContentResult {
		return this.connect().publish(params);
	}

} // class LibContent
