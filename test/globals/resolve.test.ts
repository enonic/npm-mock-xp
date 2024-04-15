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
} from './slm';
import {BUN} from '../constants';


beforeAll(done => {
	globalThis.resolve = mockResolve({
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

describe('slm', () => {
	describe('render', () => {
		it('render an slm template to html', () => {
			expect(render('./site/parts/mypart/mypart.slm', {
				subject: 'World'
			}, {
				basePath: __dirname
			})).toBe('<p>Hello, World!</p>');
		});
	});
});
