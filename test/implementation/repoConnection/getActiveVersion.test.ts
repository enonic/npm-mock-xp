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
				it('returns an object which has a getActiveVersion method', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'getActiveVersion')
					);
				}); // it
				const createRes = connection.create({});
				server.log.debug('createRes:%s', createRes);
				describe('getActiveVersion()', () => {
					it('returns null for a non existing node', () => {
						deepStrictEqual(
							null,
							connection.getActiveVersion({ key: '0001' })
						); // deepStrictEqual
					}); // it
					it('works for a single existing node', () => {
						const createRes = connection.create({});
						deepStrictEqual(
							{
								versionId: createRes._versionKey,
								nodeId: createRes._id,
								nodePath: createRes._path,
								timestamp: createRes._ts
							},
							connection.getActiveVersion({ key: createRes._id })
						); // deepStrictEqual
					}); // it
				}); // describe getActiveVersion()
			}); // describe Connection
		}); // describe connect()
	}); // describe Server
}); // describe mock
