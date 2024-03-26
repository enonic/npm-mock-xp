import {
	deepStrictEqual
} from 'assert';
import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const server = new Server({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'myRepoId'
		});
		describe('connect()', () => {
			describe('Connection', () => {
				const connection = server.connect({
					branchId: 'master',
					repoId: 'myRepoId'
				});
				it('returns an object which has a exists method', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'exists')
					);
				}); // it
				const createRes = connection.create({});
				//server.log.info('createRes:%s', createRes);
				describe('exists()', () => {
					it('finds the root node by id and path', () => {
						expect(connection.exists('00000000-0000-0000-0000-000000000000')).toBe(true);
						expect(connection.exists('/')).toBe(true);
					}); // it
					it('returns false for non existant nodes', () => {
						deepStrictEqual(
							false,
							connection.exists('')
						); // deepStrictEqual
					}); // it
					it('returns true for existant nodes', () => {
						deepStrictEqual(
							true,
							connection.exists(createRes._id)
						); // deepStrictEqual
					}); // it
				}); // describe exists()
			}); // describe Connection
		}); // describe connect()
	}); // describe Server
}); // describe mock
