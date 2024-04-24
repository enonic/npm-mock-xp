import type {
	AssetUrlParams,
	Content,
	ImageUrlParams,
	Site,
	SiteConfig,
} from '@enonic-types/lib-portal';
import type {
	Log,
	// RepositorySettings
} from '../types';


import {forceArray} from '@enonic/js-utils/array/forceArray'
import {CONTENT_TYPE_PORTAL_SITE} from '../constants';
import {App} from '../implementation/App';
import {ContentConnection} from '../implementation/ContentConnection';
import {Request} from '../implementation/Request';
import {Server} from '../implementation/Server';


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
	readonly server: Server;

	public request: Request;

	constructor({
		app,
		server,
	}: {
		app: App
		server: Server
	}) {
		this.app = app;
		this.log = server.log;
		this.server = server;
	} // constructor

	private _getParentContent({
		path
	}: {
		path: string
	}) {
		const pathParts = path.split('/');
		pathParts.pop();
		const parentPath = pathParts.join('/');
		return this.connect().get({key: parentPath});
	}

	private _recursiveReturnParentIfSite<Config = Record<string, unknown>>({
		path
	}: {
		path: string
	}) {
		const parentContent = this._getParentContent({
			path
		});
		if (!parentContent) {
			return null;
		}
		if (parentContent.type == CONTENT_TYPE_PORTAL_SITE) {
			return parentContent as Site<Config>;
		}
		return this._recursiveReturnParentIfSite<Config>({
			path: parentContent._path
		});
	}

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

	connect() {
		const repoId = this.server.context.repository;
		if (!repoId) {
			throw new Error('mock-xp: LibPortal.connect: No repository set in context!');
		}
		const repo = this.server.repos[repoId];
		const branchId = this.server.context.branch;
		if (!branchId) {
			throw new Error('mock-xp: LibPortal.connect: No branch set in context!');
		}
		const branch = repo.getBranch(branchId);
		const contentConnection = new ContentConnection({
			branch
		});
		return contentConnection;
	}

	public getContent<Hit extends Content<unknown> = Content>(): Hit | null {
		if(!this.request) {
			throw new Error('mock-xp: Portal.getContent(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		}
		// this.log.debug('getContent: request', this.request);
		const contentPath = this.request.contentPath();
		// this.log.debug('getContent: contentPath', contentPath);
		return this.connect().get({key: contentPath});
	}

	public getSite<Config = Record<string, unknown>>(): Site<Config> | null {
		if(!this.request) {
			throw new Error('mock-xp: Portal.getSite(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		}
		const currentContent = this.getContent();
		if (!currentContent) {
			throw new Error('mock-xp: Portal.getSite(): Unable to find current content!');
		}
		if (currentContent.type == CONTENT_TYPE_PORTAL_SITE) {
			return currentContent as Site<Config>;
		}
		return this._recursiveReturnParentIfSite<Config>({
			path: currentContent._path
		});
	}

	public getSiteConfig<Config = Record<string, unknown>>(): Config | null {
		if(!this.request) {
			throw new Error('mock-xp: Portal.getSiteConfig(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		}
		let site;
		try {
			site = this.getSite<Config>();
			// this.log.debug('site', site);
		} catch (e) {
			throw new Error('mock-xp: Portal.getSiteConfig(): Unable to find site content!');
		}

		if (!site.data.siteConfig) {
			return null;
		}

		const siteConfigsObj = forceArray(site.data.siteConfig);
		// this.log.debug('siteConfigsObj', siteConfigsObj);

		const filteredSiteConfigs = siteConfigsObj.filter((siteConfig) => siteConfig.applicationKey === this.app.key);
		// this.log.debug('filteredSiteConfigs', filteredSiteConfigs);

		if (filteredSiteConfigs.length === 0) {
			return null;
		}
		const aSiteConfig: SiteConfig<Config> = filteredSiteConfigs[0] as SiteConfig<Config>;
		return aSiteConfig.config;
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

		const imageContent = this.connect().get({key});
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

		return `${scheme}://${host}${port && port !== 80 ? `:${port}`: ''}${urlPathAndQuery}`;
	} // imageUrl

} // class Portal
