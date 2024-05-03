import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	LibRepo,
	Server
} from '../../../src';

const server = new Server({
	loglevel: 'error'
});

const libRepo = new LibRepo({
	server
});

libRepo.create({
	id: 'myRepoId'
});

libRepo.createBranch({
	branchId: 'draft',
	repoId: 'myRepoId'
});

describe('deleteBranch()', () => {
	it('deletes a branch if it exists', () => {
		const repo = libRepo.get('myRepoId'); // Not Repo Instance, just a plain static object
		expect(repo.branches).toContain('draft');
		const deleteRes = libRepo.deleteBranch({
			branchId: 'draft',
			repoId: 'myRepoId'
		});
		expect(deleteRes).toEqual({
			id: 'draft'
		});
		expect(libRepo.get('myRepoId').branches).not.toContain('draft');
	});

	it('throws an error if the branch does not exist', () => {
		expect(() => {
			libRepo.deleteBranch({
				branchId: 'draft',
				repoId: 'myRepoId'
			});
		}).toThrow('Branch with id [draft] not found');
	});
});
