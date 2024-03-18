import type {
	// get as getContext,
	// run as runInContext,
	Context,
	ContextParams,
} from '@enonic-types/lib-context';
import type {Request} from './Request';


// export declare interface ContextLib {
// 	get: typeof getContext
// 	run: typeof runInContext
// }

export declare interface MockContext extends Context {
	currentApplicationKey?: string
	currentContentkey?: string
	request?: Request
}

export declare interface MockContextParams extends ContextParams {
	currentApplicationKey?: string
	currentContentkey?: string
	request?: Request
}

export declare interface MockContextLib {
	get: () => MockContext|undefined
	run: <T>(context: MockContextParams, callback: () => T) => T
}
