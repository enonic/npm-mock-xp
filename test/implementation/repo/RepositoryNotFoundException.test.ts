import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	REPOSITORY_NOT_FOUND_EXCEPTION_CODE,
	RepositoryNotFoundException
} from '../../../src/implementation/repo/RepositoryNotFoundException';


const REPO_ID = 'myRepoId';
const instance = new RepositoryNotFoundException(REPO_ID);


describe('RepositoryNotFoundException()', () => {
	describe('getCode()', () => {
		it('return the node', () => {
			expect(instance.getCode()).toBe(REPOSITORY_NOT_FOUND_EXCEPTION_CODE);
		});
	});
});
