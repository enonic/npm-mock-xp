import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	BRANCH_ALREADY_EXIST_EXCEPTION_CODE,
	BranchAlreadyExistException
} from '../../../src/implementation/repo/BranchAlreadyExistException';
import { Server } from '../../../src';


const BRANCH_ID = 'draft';
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

const instance = new BranchAlreadyExistException(branch);

describe('BranchAlreadyExistException()', () => {
	describe('getBranch()', () => {
		it('return the branch', () => {
			expect(instance.getBranch()).toBe(branch);
		});
	});

	describe('getCode()', () => {
		it('return the node', () => {
			expect(instance.getCode()).toBe(BRANCH_ALREADY_EXIST_EXCEPTION_CODE);
		});
	});
});
