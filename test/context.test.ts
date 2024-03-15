import type {
	MockContext,
	MockContextParams,
} from '../src/types';

import {
	describe,
	expect,
	test as it
} from '@jest/globals';
import {JavaBridge} from '../src';
const xp = new JavaBridge({
	app: {
		config: {},
		name: 'com.enonic.app.test',
		version: '0.0.1-SNAPSHOT'
	},
});
const get = xp.context.get;
const run = xp.context.run;


describe('context', () => {
	describe('get', () => {
		it('should return undefined when not inside a run context', () => {
			expect(get()).toBeUndefined();
		});
	}); // describe get

	describe('run', () => {
		it('should run the callback in the specified context', () => {
			const outerContext: MockContextParams = {};
			const outerExpected: MockContext = {
				attributes: {},
				branch: 'master',
				repository: 'com.enonic.cms.default',
			}
			const innerContext: MockContextParams = {
				attributes: {},
				branch: 'draft',
				currentContentkey: '123',
				principals: [
					'role:myRole',
				],
				repository: 'com.enonic.cms.default',
				user: {
					login: 'su',
					idProvider: 'system',
				},
			};

			const innerExpected: MockContext = {
				attributes: {},
				authInfo: {
					principals: [
						'role:myRole',
						'role:system.admin',
						'role:system.authenticated',
						'role:system.everyone',
						'user:system:su'
					],
					user: {
						displayName: 'Super User',
						idProvider: 'system',
						key: 'user:system:su',
						login: 'su',
						modifiedTime: expect.any(String) as unknown as string,
						type: 'user'
					}
				},
				branch: 'draft',
				currentContentkey: '123',
				repository: 'com.enonic.cms.default',
			};
			let outerActual: MockContext|undefined;
			let innerActual: MockContext|undefined;
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
