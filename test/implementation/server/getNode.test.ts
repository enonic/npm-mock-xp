import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import { Server } from '../../../src';

const server = new Server({
	loglevel: 'error'
});

describe('Server', () => {
	describe('getNode()', () => {
		it('should set the child order', () => {
			const node = server.getNode({
				branchId: 'master',
				key: '/',
				repoId: 'system-repo'
			});
			expect(node['_id']).toBe('00000000-0000-0000-0000-000000000000');
		});
	});
});
