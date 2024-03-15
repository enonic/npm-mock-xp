import type {User} from '@enonic-types/lib-context';
import type {
	MockContext,
	MockContextParams
} from './types/index.d';


const contextSymbol = Symbol('__context');

interface That {
	[contextSymbol]: string;
}


function _contextParamsToContext(contextParams: MockContextParams): MockContext {
	const context: MockContext = {
		attributes: contextParams.attributes || {},
		branch: contextParams.branch || 'master',
		repository: contextParams.repository || 'com.enonic.cms.default',
	};
	if (contextParams.currentContentkey) {
		context.currentContentkey = contextParams.currentContentkey;
	}
	if (contextParams.user) {
		context.authInfo = {
			user: contextParams.user.login ? {
				login: contextParams.user.login,
				idProvider: contextParams.user.idProvider || undefined,
			} as User : null,
			principals: contextParams.principals || null,
		};
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
