import {sortKeys} from '@enonic/js-utils/object/sortKeys';
import {parse, serialize} from 'fast-uri';


const SCHEME_DEFAULT = 'http';
const HOST_DEFAULT = 'localhost';
const PORT_DEFAULT = 80;
const PATH_DEFAULT = '';


export declare type Params = Record<string, string|string[]>


export class Request {
	readonly scheme: string
	readonly host: string
	readonly port: number|string
	readonly path: string // TODO: Ending slash removed, perhaps not on root?
	readonly url: string // TODO: Ending slash removed, perhaps not on root?

	readonly branch: 'draft'|'master' = 'draft';
	readonly method: 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'|'PATCH' = 'GET';
	readonly mode: 'edit'|'inline'|'live'|'preview' = 'preview';

	readonly body?: string = '';
	readonly contextPath?: string = '';
	readonly contentType?: string = '';
	readonly cookies?: Record<string, string> = {};
	readonly followRedirects?: boolean = true;
	readonly headers?: Record<string, string> = {};
	readonly params?: Params = {};
	readonly pathParams?: Record<string, string> = {};
	readonly rawPath?: string = ''; // TODO: Contains ending slash
	readonly repositoryId?: string = '';
	readonly remoteAddress?: string = '';
	readonly webSocket?: boolean = false;

	static queryToParams(query: string): Params {
		const queryParams: Params = {};
		query.split('&').forEach((pair) => {
			const [key, value = ''] = pair.split('=');
			if (!queryParams.hasOwnProperty(key)) {
				queryParams[key] = value;
			} else {
				const currentValue = queryParams[key];
				if (Array.isArray(currentValue)) {
					currentValue.push(value);
				} else {
					queryParams[key] = [currentValue, value];
				}
			}
		});
		return queryParams;
	}

	constructor(constructorParams: Partial<Request> = {}) {
		Object.assign(this, constructorParams);
		let {
			scheme,
			host,
			port,
			path,
			params,
			url,
		} = constructorParams;

		if (url) {
			const {
				scheme: urlScheme,
				// userinfo, // Not present in request object
				host: urlHost,
				port: urlPort,
				path: urlPath,
				query, // Put into params
				// fragment, // Not present in request object
			} = parse(url);

			if (scheme && scheme !== urlScheme) {
				throw new Error(`scheme !== url.scheme: ${scheme} !== ${urlScheme}`);
			}

			if (host && host !== urlHost) {
				throw new Error(`host !== url.host: ${host} !== ${urlHost}`);
			}

			if (port && port !== urlPort) {
				throw new Error(`port !== url.port: ${port} !== ${urlPort}`);
			}

			if (path && path !== urlPath) {
				throw new Error(`path !== url.path: ${path} !== ${urlPath}`);
			}

			if (query) {
				const queryParams = Request.queryToParams(query);
				if (params && Object.entries(params).some(([key, value]) => queryParams[key] !== value)) {
					throw new Error(`params !== query: ${JSON.stringify(params)} !== ${JSON.stringify(queryParams)}`);
				}
				this.params = queryParams;
			} // if query
		} // if url

		if (this.params) {
			this.params = sortKeys(this.params);
		}

		this.scheme = scheme || SCHEME_DEFAULT;
		this.host = host || HOST_DEFAULT;
		this.port = port || PORT_DEFAULT;
		this.path = path || PATH_DEFAULT;
		this.url = this.serialize();
	}

	// "path": "/admin/site/preview/intro/draft/persons/lea-seydoux",
	// "rawPath": "/admin/site/preview/intro/draft/persons/lea-seydoux",
	// "contextPath": "/admin/site/preview/draft/",
	contentPath(): string {
		return this.path
			.replace(/^\/admin/, '')
			.replace(/^\/site/, '')
			.replace(new RegExp(`^/${this.mode}`), '')
			.replace(new RegExp(`^/${this.project()}`), '')
			.replace(new RegExp(`^/${this.branch}`), '');
	}

	query() {
		return Object.entries(this.params).map(([key, value]) => `${key}=${value}`).join('&');
	}

	project() {
		return this.repositoryId.replace(/^com\.enonic\.cms\./, '');
	}

	serialize(): string {
		return serialize({
			scheme: this.scheme,
			host: this.host,
			port: this.port,
			path: this.path,
			query: this.query()
		}).replace(/\?$/, '');
	}

} // class Request
