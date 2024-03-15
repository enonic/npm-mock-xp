import type {Site} from '@enonic-types/lib-portal';
import type {JavaBridge} from '../JavaBridge';
import type {ContentConnection} from '../ContentConnection';


import {CONTENT_TYPE_PORTAL_SITE} from '../constants';
import {get as getContext} from '../context';
import {getContent} from './getContent';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}


function getParentContent({
	contentConnection,
	path
}: {
	contentConnection: ContentConnection
	path: string
}) {
	const pathParts = path.split('/');
	pathParts.pop();
	const parentPath = pathParts.join('/');
	return contentConnection.get({key: parentPath});
}


function recursiveReturnParentIfSite<Config = Record<string, unknown>>({
	contentConnection,
	path
}: {
	contentConnection: ContentConnection
	path: string
}) {
	const parentContent = getParentContent({
		contentConnection,
		path
	});
	if (!parentContent) {
		return null;
	}
	if (parentContent.type == CONTENT_TYPE_PORTAL_SITE) {
		return parentContent as Site<Config>;
	}
	return recursiveReturnParentIfSite<Config>({
		contentConnection,
		path: parentContent._path
	});
}


export function getSite<Config = Record<string, unknown>>(): Site<Config> | null {
	if (!globalThis._javaBridge) {
		throw new Error('In order to use the lib-portal.getSite() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}

	const context = getContext();
	if (!context) {
		throw new Error('No context');
	}
	const contentConnection = globalThis._javaBridge.contentConnect({
		branch: context.branch,
		project: context.repository.replace('com.enonic.cms.', ''),
	});

	const currentContent = getContent();
	if (!currentContent) {
		throw new Error('getSite: Unable to find current content!');
	}
	if (currentContent.type == CONTENT_TYPE_PORTAL_SITE) {
		return currentContent as Site<Config>;
	}
	return recursiveReturnParentIfSite<Config>({
		contentConnection,
		path: currentContent._path
	});
}
