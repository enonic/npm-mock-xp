import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import { NodeAlreadyExistAtPathException } from '../../../src/implementation/node/NodeAlreadyExistAtPathException';
import { Server } from '../../../src';


const BRANCH_ID = 'draft';
const PATH = '/myNode';
const REPO_ID = 'myRepoId';


const server = new Server({
	loglevel: 'error'
}).createRepo({
	id: REPO_ID
});

server.createBranch({
	branchId: BRANCH_ID,
	repoId: REPO_ID
});

const branch = server.getBranch({
	branchId: BRANCH_ID,
	repoId: REPO_ID
});

const instance = new NodeAlreadyExistAtPathException(PATH, REPO_ID, branch);

describe('NodeAlreadyExistAtPathException()', () => {
	describe('getBranch()', () => {
		it('return the branch', () => {
			expect(instance.getBranch()).toBe(branch);
		});
	});

	describe('getNode()', () => {
		it('return the node', () => {
			expect(instance.getNode()).toBe(PATH);
		});
	});

	describe('getRepositoryId()', () => {
		it('return the repositoryId', () => {
			expect(instance.getRepositoryId()).toBe(REPO_ID);
		});
	});
});
