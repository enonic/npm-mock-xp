import {deepStrictEqual} from 'assert';
import {SYSTEM_REPO} from '../src/constants';
import {JavaBridge} from '../src/JavaBridge';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			}
		});
		it('instance has property repo', () => {
			deepStrictEqual(
				true,
				javaBridge.hasOwnProperty('repo')
			);
		}); // it
		describe('repo', () => {
			it('repo object has method create', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.repo, 'create')
				);
			}); // it
			it('repo object has method get', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.repo, 'get')
				);
			}); // it
			it('repo object has method list', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.repo, 'list')
				);
			}); // it
			/*it('repo object has method refresh', () => {
				deepStrictEqual(
					true,
					hasMethod(javaBridge.repo, 'refresh')
				);
			}); // it*/
			describe('create', () => {
				const createdRepo = javaBridge.repo.create({
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
					const connection = javaBridge.connect({
						branch: 'master',
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
						javaBridge.repo.get('myRepoId')
					);
				}); // it
			}); // describe get
			describe('list', () => {
				it('returns list with info about all repos', () => {
					javaBridge.repo.create({
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
						javaBridge.repo.list()
					);
				}); // it
			}); // describe list
			/*describe('refresh', () => {
				it('can be called', () => {
					javaBridge.repo.refresh();
				}); // it
			}); // describe refresh*/
		}); // describe repo
	}); // describe JavaBridge
}); // describe mock
