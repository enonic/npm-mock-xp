import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	BRANCH_NOT_FOUND_EXCEPTION_CODE,
	BranchNotFoundException
} from '../../../src/implementation/repo/BranchNotFoundException';


const BRANCH_ID = 'draft';
const instance = new BranchNotFoundException(BRANCH_ID);


describe('BranchNotFoundException()', () => {
	describe('getCode()', () => {
		it('return the node', () => {
			expect(instance.getCode()).toBe(BRANCH_NOT_FOUND_EXCEPTION_CODE);
		});
	});
});
