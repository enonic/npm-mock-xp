import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	Server
} from '../../../src';


const REPO_ID = 'myRepoId';
const BRANCH_ID_SOURCE = 'draft';
const BRANCH_ID_TARGET = 'master';


const server = new Server({
	loglevel: 'silent'
}).createRepo({
	id: REPO_ID
})

const sourceBranch = server.createBranch({
	branchId: BRANCH_ID_SOURCE,
	repoId: REPO_ID
});

const targetBranch = server.getBranch({
	branchId: BRANCH_ID_TARGET,
	repoId: REPO_ID
});

const nodeJustOnSource = sourceBranch.createNode({
	on: 'justSource'
});

const nodeJustOnTarget = targetBranch.createNode({
	on: 'justTarget'
});

const nodeOnBoth = sourceBranch.createNode({
	on: 'both'
});
targetBranch._createNodeInternal(nodeOnBoth);

const sourceConnection = server.connect({
	branchId: BRANCH_ID_SOURCE,
	repoId: REPO_ID
});

const NODE_ID_NEITHER = '00000000-0000-4000-8000-000000000008';

describe('RepoConnection', () => {
	describe('push', () => {
		it('pushes a node', () => {
			const pushNodesResult = sourceConnection.push({
				key: nodeJustOnSource._id,
				keys: [
					nodeJustOnTarget._id,
					nodeOnBoth._id,
					NODE_ID_NEITHER
				],
				target: BRANCH_ID_TARGET
			});
			expect(pushNodesResult).toEqual({
				success: [
					nodeOnBoth._id,
					nodeJustOnSource._id,
				],
				failed: [{
					id: NODE_ID_NEITHER,
					reason: 'NOT_FOUND_ON_SOURCE_NOR_TARGET'
				}],
				deleted: [
					nodeJustOnTarget._id,
				]
			});
		});

		it('throws if target is the same as source', () => {
			expect(() => {
				sourceConnection.push({
					keys: [],
					target: BRANCH_ID_SOURCE
				});
			}).toThrow('Target branch cannot be the same as source branch!');
		});

		it('throws if there are no keys to push', () => {
			expect(() => {
				sourceConnection.push({
					// key: '',
					// keys: [],
					target: BRANCH_ID_TARGET
				});
			}).toThrow('No keys to push');

		});

	}); // push
}); // RepoConnection
