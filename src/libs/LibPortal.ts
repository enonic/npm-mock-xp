import type {
	AssetUrlParams,
	Content,
	ImageUrlParams,
} from '@enonic-types/lib-portal';
import type {
	Log,
	// RepositorySettings
} from '../types';


import {Project} from '../implementation/Project';
// import {Server} from './Server';
import {App} from '../implementation/App';
import {Request} from '../implementation/Request';


export declare interface QueryParams {
	background?: string
	filter?: string
	quality?: string
	[key: string]: string|undefined
}


const HASH = '0123456789abcdef';
const FINGERPRINT = '0123456789abcdef';


export class LibPortal {
	readonly app: App;
	readonly log: Log;
	readonly project: Project;
	readonly repositoryId: string;
	public request: Request;

	constructor({
		app,
		// branch = 'draft',
		project,
		// projectName,
		// server,
		// settings
	}: {
		app: App
		// branch?: 'draft' | 'master'
		project: Project
		// projectName: string
		// server: Server
		// settings?: RepositorySettings
	}) {
		this.app = app;
		this.log = project.server.log;
		this.project = project;
		// this.project = new Project({
		// 	branch,
		// 	projectName,
		// 	server,
		// 	settings
		// });
		this.repositoryId = project.repositoryId;
	} // constructor


	public assetUrl(params: AssetUrlParams): string {
		if(!this.request) {
			throw new Error('mock-xp: Portal.assetUrl(): No request set on the Portal object instance!');
		}
		const {
			// branch = requestBranch, // The request branch should have set the context branch.
			// contextPath,
			host,
			// mode,
			path: requestPath,
			port,
			// rawPath,
			// repositoryId, // The request repositoryId should have set the context branch.
			scheme,
		} = this.request;

		const requestPathNoEndSlash = requestPath.replace(/\/$/, '');

		const currentApplicationKey = this.app.key;

		const {
			path: assetPath,
			application = currentApplicationKey,
			type,
			params: urlParams
		} = params;

		const assetPathWithoutLeadingSlash = assetPath.replace(/^\//, '');

		const query = urlParams ? `?${new URLSearchParams(urlParams as Record<string,string>).toString()}` : '';

		// const urlPathAndQuery = `/admin/site/${mode}/intro/${branch}/_/asset/${application}:${FINGERPRINT}/${assetPath}${query}`;
		const urlPathAndQuery = `${requestPathNoEndSlash}/_/asset/${application}:${FINGERPRINT}/${assetPathWithoutLeadingSlash}${query}`;

		if (type !== 'absolute') {
			return urlPathAndQuery;
		}

		return `${scheme}://${host}${port && port !== 80 ? `:${port}`: ''}${urlPathAndQuery}`;
	} // assetUrl


	public getContent<Hit extends Content<unknown> = Content>(): Hit | null {
		if(!this.request) {
			throw new Error('mock-xp: Portal.getContent(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		}
		const contentPath = this.request.contentPath();
		// this.log.debug('getContent', contentPath);
		return this.project.connection.get({key: contentPath});
	}

	public imageUrl(params: ImageUrlParams): string {
		const {
			// Required
			scale,
			// One of these are required
			id,
			path,
			// Optional
			quality,
			background,
			format,
			filter,

			// NOTE: "server" exist in ImageUrlParams, but is not documented here:
			// https://developer.enonic.com/docs/xp/stable/api/lib-portal#imageurl
			// server,

			params: urlParams,
			type,
		} = params;
		const key = id || path;

		if (!key) {
			throw new Error('lib-portal.imageUrl(): Either id or path must be set!');
		}

		const imageContent = this.project.connection.get({key});
		// console.debug(imageContent);
		if (!imageContent) {
			throw new Error(`lib-portal.imageUrl(): No imageContent with key:${key}`);
		}

		const {
			host,
			// mode,
			path: requestPath,
			port,
			scheme,
		} = this.request;

		// Possible scales:
		// `block(${widthNumber},${heightNumber})`
		// `height(${number})`
		// `max(${number})`
		// `square(${number})`
		// `wide(${number},${number})`
		// `width(${number})`
		// 'full'
		const s = scale
			.replace(/[\(,]/g, '-') // start parenthesis and comma with hyphen
			.replace(/\)/, '') // Last end parenthesis with nothing

		const queryParams: QueryParams = urlParams as Record<string, string> || {};

		if (background) {
			queryParams.background = background; // ff0000 | f00
		}

		if (filter) {
			queryParams.filter = filter; // rounded(5);sharpen() ...
		}

		const f = format ? `.${format}` : '';

		if (quality) {
			queryParams.quality = `${quality}`; // Converting number to string to match type for URLSearchParams
		}

		const query = Object.values(queryParams).length ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}` : '';
		const urlPathAndQuery = `${requestPath}/_/image/${imageContent._id}:${HASH}/${s}/${imageContent._name}${f}${query}`;

		if (type !== 'absolute') {
			return urlPathAndQuery;
		}

		return `${scheme}://${host}${port ? `:${port}`: ''}${urlPathAndQuery}`;
	} // imageUrl

} // class Portal
