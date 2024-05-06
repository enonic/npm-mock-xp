import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import { Server } from '../../../src';

const server = new Server({
	loglevel: 'error'
});

describe('RepoConnection()', () => {
	describe('setChildOrder()', () => {
		it('should set the child order', () => {
			const currentChildOrder = server.systemRepoConnection.get('/')['_childOrder'];
			expect(currentChildOrder).toBe('_ts DESC');
			const newChildOrder =server.systemRepoConnection.setChildOrder({
				childOrder: '_ts ASC',
				key: '/'
			})['_childOrder'];
			expect(newChildOrder).toBe('_ts ASC');
		});
	});
});
