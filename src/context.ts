import type {
	Context,
	ContextParams,
	User,
} from '@enonic-types/lib-context';

const contextSymbol = Symbol('__context');

interface That {
	[contextSymbol]: string;
}

function _contextParamsToContext(contextParams: ContextParams): Context {
	const context: Context = {
		attributes: contextParams.attributes || {},
		branch: contextParams.branch || 'master',
		repository: contextParams.repository || 'com.enonic.cms.default',
	};
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

export function get(this: any): Context|undefined {
	const that: That = (this || globalThis) as That;
	const contextParamsJson: string = that[contextSymbol];
	return contextParamsJson ? _contextParamsToContext(JSON.parse(contextParamsJson) as ContextParams) : undefined;
};

export function run<T>(this: any, context: ContextParams, callback: () => T): T {
	const that: That = (this || globalThis) as That;
	const previousContext: string = that[contextSymbol];
	that[contextSymbol] = JSON.stringify(context);
	const res = callback();
	that[contextSymbol] = previousContext;
	return res;
}
