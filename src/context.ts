import type {Node} from '@enonic-types/lib-node';
import type {PrincipalKey, User} from '@enonic-types/lib-context';
import type {
	MockContext,
	MockContextParams
} from './types';
import type {JavaBridge} from './JavaBridge';


import { SYSTEM_REPO } from './constants';


declare module globalThis {
	var _javaBridge: JavaBridge|undefined;
}

const contextSymbol = Symbol('__context');

declare interface That {
	[contextSymbol]: string;
}


function _contextParamsToContext(contextParams: MockContextParams): MockContext {
	if (!globalThis._javaBridge) {
		throw new Error('In order to use the lib-context mock, an instance of JavaBridge must be created and assigned to globalThis._javaBridge');
	}
	const context: MockContext = {
		attributes: contextParams.attributes || {},
		branch: contextParams.branch || 'master',
		repository: contextParams.repository || 'com.enonic.cms.default',
	};

	if (contextParams.currentApplicationKey) {
		context.currentApplicationKey = contextParams.currentApplicationKey;
	}

	if (contextParams.currentContentkey) {
		context.currentContentkey = contextParams.currentContentkey;
	}

	if (contextParams.request) {
		context.request = contextParams.request;
	}

	if (contextParams.principals) {
		context.authInfo = {
			principals: contextParams.principals
		}
	}

	if (contextParams.user?.login) {
		const systemRepoConnection = globalThis._javaBridge.connect({
			branch: 'master',
			repoId: SYSTEM_REPO
		});
		const idProvider = contextParams.user.idProvider || 'system';

		// const systemRepoQueryRes = systemRepoConnection.query({});
		// const allSystemRepoNodes = systemRepoQueryRes.hits.map(({id}) => systemRepoConnection.get(id))
		// console.debug('allSystemRepoNodes', allSystemRepoNodes);

		const userNode = systemRepoConnection.get(`/identity/${idProvider}/users/${contextParams.user.login}`) as Node<{
			authenticationHash?: string
			disabled?: boolean
			displayName: string
			email?: string
			idProvider: string
			login: string
			modifiedTime?: string
			profile?: Record<string, unknown>
		}>;
		// console.debug('userNode', userNode);
		if (userNode) {
			const {
				_ts,
				disabled,
				displayName,
				email,
				login,
			} = userNode;

			const principalKey: PrincipalKey = `user:${idProvider}:${login}`;

			const user: User = {
				type: 'user',
				key: principalKey,
				displayName,
				login,
				modifiedTime: _ts,
				idProvider
			};
			if (disabled) {
				user.disabled = true;
			}
			if (email) {
				user.email = email;
			}
			if (!context.authInfo) {
				context.authInfo = {}
			}
			if (!context.authInfo.principals) {
				context.authInfo.principals = [];
			}

			// TODO Lookup members of all roles, instead of this hack:
			if (idProvider === 'system' && login === 'su') {
				context.authInfo.principals.push('role:system.admin');
			}

			context.authInfo.principals.push('role:system.authenticated');
			context.authInfo.principals.push('role:system.everyone');
			if (!context.authInfo.principals.includes(principalKey)) {
				context.authInfo.principals.push(principalKey);
			}
			context.authInfo.user = user;
		}
	}
	return context;
}

export function get(this: any): MockContext|undefined {
	const that: That = (this || globalThis) as That;
	const contextParamsJson: string = that[contextSymbol];
	return contextParamsJson ? _contextParamsToContext(JSON.parse(contextParamsJson) as MockContextParams) : undefined;
};

export function run<T>(this: any, context: MockContextParams, callback: () => T): T {
	const that: That = (this || globalThis) as That;
	const previousContext: string = that[contextSymbol];
	that[contextSymbol] = JSON.stringify(context);
	const res = callback();
	that[contextSymbol] = previousContext;
	return res;
}
