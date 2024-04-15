import type {Resolve} from '../../src/types';

import {
	beforeAll,
	describe,
	expect,
	jest,
	test as it,
} from '@jest/globals';
import {
	mockResolve
} from '../../src';
import {
	render,
} from './lib/slm';
import {BUN} from '../constants';

// Avoid type errors below.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module globalThis {
	let resolve: Resolve
}

beforeAll(done => {
	globalThis.resolve = mockResolve({
		applicationKey: 'com.enonic.app.myapp',
		basePath: __dirname
	});

	if (BUN) {
		import('bun:test').then(({mock}) => {
			mock.module('/lib/xp/slm', () => ({
				render
			}));
			done();
		});
	} else {
		jest.mock('/lib/xp/slm', () => ({
			render
		}), {
			virtual: true
		});
		done();
	}
});

describe('globals', () => {
	describe('resolve', () => {
		it('resolves a resource', (done) => {
			import('./site/parts/mypart/mypart').then(({get}) => {
				expect(get()).toStrictEqual({
					body: `<p>Hello, Absolute!</p>
<p>Hello, No Path!</p>
<p>Hello, Dot Path!</p>
<p>Goodbye, Dotdot Path!</p>`,
					contentType: 'text/html',
				});
				done();
			});
		});
	});
});
