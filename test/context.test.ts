import type {
	Context,
	ContextParams,
	User,
} from '@enonic-types/lib-context';

import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {get, run} from '../src/context';


describe('context', () => {
	describe('get', () => {
		it('should return undefined when not inside a run context', () => {
			expect(get()).toBeUndefined();
		});
	}); // describe get

	describe('run', () => {
		it('should run the callback in the specified context', () => {
			const outerContext: ContextParams = {};
			const outerExpected: Context = {
				attributes: {},
				branch: 'master',
				repository: 'com.enonic.cms.default',
			}
			const innerContext: ContextParams = {
				attributes: {},
				branch: 'draft',
				principals: ['role:system:admin'],
				repository: 'com.enonic.cms.default',
				user: {
					login: 'su',
					idProvider: 'system',
				},
			};

			const innerExpected: Context = {
				attributes: {},
				authInfo: {
					principals: ['role:system:admin'],
					user: {
						idProvider: 'system',
						login: 'su',
					} as User
				},
				branch: 'draft',
				repository: 'com.enonic.cms.default',
			};
			let outerActual: Context|undefined;
			let innerActual: Context|undefined;
			run(outerContext, () => {
				outerActual = get();
				run(innerContext, () => {
					innerActual = get();
				});
			});
			expect(outerActual).toEqual(outerExpected);
			expect(innerActual).toEqual(innerExpected);
		});
	}); // describe run
}); // describe context
