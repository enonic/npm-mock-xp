import {
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {
	LibRepo,
	Server
} from '../../../src';

const REPO_ID = 'myRepoId';

const server = new Server({
	loglevel: 'error'
});

const libRepo = new LibRepo({
	server
});

libRepo.create({
	id: REPO_ID
});

describe('delete()', () => {
	it('deletes a repo exists', () => {
		expect(libRepo.get(REPO_ID)).toBeTruthy();
		const deleteRes = libRepo.delete(REPO_ID);
		expect(deleteRes).toBe(true);
		expect(libRepo.get(REPO_ID)).toBeNull();
	});

	it('returns false if the repo does not exist', () => {
		expect(libRepo.get(REPO_ID)).toBeNull();
		const deleteRes = libRepo.delete(REPO_ID);
		expect(deleteRes).toBe(false);
	});
});
