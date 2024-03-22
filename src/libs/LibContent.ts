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
import type {Project} from '../implementation/Project';
// import type {ContentConnection} from '../implementation/ContentConnection';


export class LibContent {
	// readonly connection: ContentConnection;
	readonly project: Project;

	constructor({
		project
	}: {
		project: Project
	}) {
		// Since project.connection can be changed by Context this will break
		// stuff. So don't do this:
		// this.connection = project.connection;
		this.project = project;
	}

	create<
		Data = Record<string, unknown>, Type extends string = string
	>(params: CreateContentParams<Data, Type>): Content<Data, Type> {
		return this.project.connection.create(params);
	}

	createMedia<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: CreateMediaParams): Content<Data, Type> {
		return this.project.connection.createMedia(params);
	}

	delete(params: DeleteContentParams): boolean {
		return this.project.connection.delete(params);
	}

	exists(params: ContentExistsParams): boolean {
		return this.project.connection.exists(params);
	}

	get<
		Hit extends Content<unknown> = Content
	>(params: GetContentParams): Hit | null {
		return this.project.connection.get(params);
	}

	getAttachmentStream(params: GetAttachmentStreamParams): ByteSource | null {
		return this.project.connection.getAttachmentStream(params);
	}

	modify<
		Data = Record<string, unknown>,
		Type extends string = string
	>(params: ModifyContentParams<Data, Type>): Content<Data, Type> | null {
		return this.project.connection.modify(params);
	}

	move<
		Data = Record<string, unknown>, Type extends string = string
	>(params: MoveContentParams): Content<Data, Type> {
		return this.project.connection.move(params);
	}

	publish(params: PublishContentParams): PublishContentResult {
		return this.project.connection.publish(params);
	}

} // class LibContent
