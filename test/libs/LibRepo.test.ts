import {deepStrictEqual} from 'assert';
import {SYSTEM_REPO} from '../../src/constants';
import {
	LibRepo,
	Server
} from '../../src';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


const server = new Server({
	loglevel: 'error'
});

const libRepo = new LibRepo({
	server
});

describe('mock', () => {
	describe('LibRepo', () => {
		it('repo object has method create', () => {
			deepStrictEqual(
				true,
				hasMethod(libRepo, 'create')
			);
		}); // it
		it('repo object has method get', () => {
			deepStrictEqual(
				true,
				hasMethod(libRepo, 'get')
			);
		}); // it
		it('repo object has method list', () => {
			deepStrictEqual(
				true,
				hasMethod(libRepo, 'list')
			);
		}); // it
		/*it('repo object has method refresh', () => {
			deepStrictEqual(
				true,
				hasMethod(libRepo, 'refresh')
			);
		}); // it*/
		describe('create', () => {
			const createdRepo = libRepo.create({
				id: 'myRepoId'
			});
			it('returns info about created repo', () => {
				deepStrictEqual(
					{
						id: 'myRepoId',
						branches: ['master'],
						settings: {}
					},
					createdRepo
				);
			}); // it
			it('created repo contains a root node', () => {
				const connection = server.connect({
					branchId: 'master',
					repoId: 'myRepoId'
				});
				deepStrictEqual(
					{
						aggregations: {},
						count: 1,
						hits: [{
							id: '00000000-0000-0000-0000-000000000000',
							score: 1
						}],
						total: 1
					},
					connection.query({})
				); // deepStrictEqual
			}); // it
		}); // describe create
		describe('get', () => {
			it('returns info about a repo', () => {
				deepStrictEqual(
					{
						id: 'myRepoId',
						branches: ['master'],
						settings: {}
					},
					libRepo.get('myRepoId')
				);
			}); // it
		}); // describe get
		describe('list', () => {
			it('returns list with info about all repos', () => {
				libRepo.create({
					id: 'myRepoId2'
				});
				deepStrictEqual(
					[{
						id: SYSTEM_REPO,
						branches: ['master'],
						settings: {}
					},{
						id: 'myRepoId',
						branches: ['master'],
						settings: {}
					},{
						id: 'myRepoId2',
						branches: ['master'],
						settings: {}
					}],
					libRepo.list()
				);
			}); // it
		}); // describe list
		/*describe('refresh', () => {
			it('can be called', () => {
				libRepo.refresh();
			}); // it
		}); // describe refresh*/
	}); // describe LibRepo
}); // describe mock
