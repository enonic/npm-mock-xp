import * as assert from 'assert';
import {deepStrictEqual} from 'assert';
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
				it('com.enonic.xp.repository.RepositoryNotFoundException', () => {
					throws(() => libRepo.createBranch({
						branchId: 'master',
						repoId: 'non.existant'
					}), {
						name: 'com.enonic.xp.repository.RepositoryNotFoundException',
						message: 'Repository with id [non.existant] not found'
					});
				}); // when branch already exists
				it('com.enonic.xp.repo.impl.repository.BranchAlreadyExistException', () => {
					throws(() => libRepo.createBranch({
						branchId: 'master',
						repoId: 'myRepoId'
					}), {
						name: 'com.enonic.xp.repo.impl.repository.BranchAlreadyExistException',
						message: 'Branch [{master}] already exists'
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
