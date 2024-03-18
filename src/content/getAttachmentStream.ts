import type {
	ByteSource,
	GetAttachmentStreamParams
} from '@enonic-types/lib-content';
import type {JavaBridge} from '../JavaBridge';


import {get as getContext} from '../context';



declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}

const LOG_PREFIX = 'mock-xp: lib-content.getAttachmentStream():';


export function getAttachmentStream(params: GetAttachmentStreamParams): ByteSource | null {
	if (!globalThis._javaBridge) {
		throw new Error(`${LOG_PREFIX} In order to use the lib-content.getAttachmentStream() mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge`);
	}

	const context = getContext();
	if (!context) {
		throw new Error(`${LOG_PREFIX} No context!`);
	}

	const {
		branch,
		repository
	} = context;

	const contentConnection = globalThis._javaBridge.contentConnect({
		branch,
		project: repository.replace('com.enonic.cms.', ''),
	});

	return contentConnection.getAttachmentStream(params);
}
