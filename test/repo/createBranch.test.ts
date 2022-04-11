import * as assert from 'assert';
import {deepStrictEqual} from 'assert';
import {JavaBridge} from '../../src/JavaBridge';
import {hasMethod} from '../hasMethod';

const throws = assert.throws;

describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			}
		});
		describe('repo', () => {
			javaBridge.repo.create({
				id: 'myRepoId'
			});
			it('repo object has method createBranch', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.repo, 'createBranch')
				);
			}); // it
			describe('createBranch()', () => {
				describe('throws', () => {
					it('com.enonic.xp.repository.RepositoryNotFoundException', () => {
						throws(() => javaBridge.repo.createBranch({
							branchId: 'master',
							repoId: 'non.existant'
						}), {
							name: 'com.enonic.xp.repository.RepositoryNotFoundException',
							message: 'Repository with id [non.existant] not found'
						});
					}); // when branch already exists
					it('com.enonic.xp.repo.impl.repository.BranchAlreadyExistException', () => {
						throws(() => javaBridge.repo.createBranch({
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
						javaBridge.repo.createBranch({
							branchId: 'draft',
							repoId: 'myRepoId'
						})
					);
				}); // it
			}); // describe createBranch()
		}); // describe repo
	}); // describe JavaBridge
}); // describe mock
