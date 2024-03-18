import type {ImageUrlParams} from '@enonic-types/lib-portal';
import type {JavaBridge} from '../JavaBridge';


import {get as getContext} from '../context';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}

declare interface QueryParams {
	background?: string
	filter?: string
	quality?: string
	[key: string]: string|undefined
}

const HASH = '0123456789abcdef';


export function imageUrl(params: ImageUrlParams): string {
	if (!globalThis._javaBridge) {
		throw new Error('mock-xp: In order to use the lib-portal.imageUrl() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}

	const context = getContext();
	if (!context) {
		throw new Error('mock-xp: lib-portal.imageUrl(): No context!');
	}

	if (!context.request) {
		throw new Error('mock-xp: lib-portal.imageUrl(): No context.request! Support for imageUrl outside portal is not yet implemented.');
	}

	const contentConnection = globalThis._javaBridge.contentConnect({
		branch: context.branch,
		project: context.repository.replace('com.enonic.cms.', ''),
	});

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

	const imageContent = contentConnection.get({key});
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
	} = context.request;

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
}
