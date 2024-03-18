import type {AssetUrlParams} from '@enonic-types/lib-portal';
import type {JavaBridge} from '../JavaBridge';


import {get as getContext} from '../context';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}


const FINGERPRINT = '0123456789abcdef';


export function assetUrl(params: AssetUrlParams): string {
	if (!globalThis._javaBridge) {
		throw new Error('In order to use the lib-portal.asset() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}

	const context = getContext();
	if (!context) {
		throw new Error('lib-portal.asset(): No context!');
	}

	if (!context.request) {
		throw new Error('lib-portal.asset(): No context.request! Support for assetUrl outside portal is not yet implemented.');
	}

	// TODO Both these could be vhosted!
	//
	// Inside Content Studio
	// path: "/admin/site/inline/intro/draft/persons/lea-seydoux",
	// rawPath: "/admin/site/inline/intro/draft/persons/lea-seydoux",
	// contextPath: "/admin/site/inline/draft/",
	//
	// Outside Content Studio
	// "path": "/site/intro/master/persons/lea-seydoux",
	// "rawPath": "/site/intro/master/persons/lea-seydoux",
	// "contextPath": "/site/master/",

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
	} = context.request;

	// if (requestPath.startsWith('/admin')) {
	// 	const [admin,site,mode,project,branch] = requestPath.split('/');
	// } else {
	// 	const [site,project,branch] = requestPath.split('/');
	// }

	const {
		// branch,
		currentApplicationKey
	} = context;

	const {
		path: assetPath,
		application = currentApplicationKey,
		type,
		params: urlParams
	} = params;

	const query = urlParams ? `?${new URLSearchParams(urlParams as Record<string,string>).toString()}` : '';

	// const urlPathAndQuery = `/admin/site/${mode}/intro/${branch}/_/asset/${application}:${FINGERPRINT}/${assetPath}${query}`;
	const urlPathAndQuery = `${requestPath}/_/asset/${application}:${FINGERPRINT}/${assetPath}${query}`;

	if (type !== 'absolute') {
		return urlPathAndQuery;
	}

	return `${scheme}://${host}${port ? `:${port}`: ''}${urlPathAndQuery}`;
}
