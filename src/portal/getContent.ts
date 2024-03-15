import type {Content} from '@enonic-types/lib-portal';
import type {JavaBridge} from '../JavaBridge';


import {get as getContext} from '../context';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}

export function getContent<Hit extends Content<unknown> = Content>(): Hit | null {
	if (!globalThis._javaBridge) {
		throw new Error('In order to use the lib-portal.getContent() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}

	const context = getContext();
	if (!context) {
		throw new Error('No context');
	}
	const contentConnection = globalThis._javaBridge.contentConnect({
		branch: context.branch,
		project: context.repository.replace('com.enonic.cms.', ''),
	});
	if (!context.currentContentkey) {
		throw new Error('No currentContentkey found in mocked run context');
	}
	const content = contentConnection.get({key: context.currentContentkey})
	return content as Hit | null;
}
