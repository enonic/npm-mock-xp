import * as assert from 'assert';
import {deepStrictEqual} from 'assert';
import {BRANCH_ALREADY_EXIST_EXCEPTION_NAME} from '../../../src/implementation/repo/BranchAlreadyExistException';
import {REPOSITORY_NOT_FOUND_EXCEPTION_NAME} from '../../../src/implementation/repo/RepositoryNotFoundException';
import {
	LibRepo,
	Server
} from '../../../src';
import {hasMethod} from '../../hasMethod';

const throws = assert.throws;

const server = new Server({
	loglevel: 'error'
});

const libRepo = new LibRepo({
	server
});

describe('mock', () => {
	describe('LibRepo', () => {
		libRepo.create({
			id: 'myRepoId'
		});
		it('repo object has method createBranch', () => {
			deepStrictEqual(
				true,
				hasMethod(libRepo, 'createBranch')
			);
		}); // it
		describe('createBranch()', () => {
			describe('throws', () => {
				it(REPOSITORY_NOT_FOUND_EXCEPTION_NAME, () => {
					throws(() => libRepo.createBranch({
						branchId: 'master',
						repoId: 'non.existant'
					}), {
						name: REPOSITORY_NOT_FOUND_EXCEPTION_NAME,
						message: 'Repository with id [non.existant] not found'
					});
				}); // when branch already exists
				it(BRANCH_ALREADY_EXIST_EXCEPTION_NAME, () => {
					throws(() => libRepo.createBranch({
						branchId: 'master',
						repoId: 'myRepoId'
					}), {
						name: BRANCH_ALREADY_EXIST_EXCEPTION_NAME,
						message: 'Branch [master] already exists'
					});
				}); // when branch already exists
			}); // describe throws
			it('returns info about created branch', () => {
				deepStrictEqual(
					{
						id: 'draft',
					},
					libRepo.createBranch({
						branchId: 'draft',
						repoId: 'myRepoId'
					})
				);
			}); // it
		}); // describe createBranch()
	}); // describe LibRepo
}); // describe mock
