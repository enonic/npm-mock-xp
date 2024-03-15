import type {
	// get as getContext,
	// run as runInContext,
	Context,
	ContextParams,
} from '@enonic-types/lib-context';

// export declare interface ContextLib {
// 	get: typeof getContext
// 	run: typeof runInContext
// }

export declare interface MockContext extends Context {
	currentContentkey?: string
}

export declare interface MockContextParams extends ContextParams {
	currentContentkey?: string
}

export declare interface MockContextLib {
	get: () => MockContext|undefined
	run: <T>(context: MockContextParams, callback: () => T) => T
}
