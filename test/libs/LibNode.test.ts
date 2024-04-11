import {
	deepStrictEqual//,
	//throws // For some reason this gets borked by swc
} from 'assert';
import {
	LibNode,
	Server
} from '../../src';
import {BUN} from '../constants';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}

let server, libNode, connection;


beforeAll(done => {
	server = new Server({
		loglevel: 'error'
	});

	server.createRepo({
		id: 'myRepoId'
	});

	libNode = new LibNode({
		server
	});

	connection = libNode.connect({
		branch: 'master',
		repoId: 'myRepoId'
	});

	done();
});


describe('mock', () => {

	describe('LibNode', () => {

		it('instance.node has property connect', () => {
			deepStrictEqual(
				true,
				hasMethod(libNode, 'connect')
			);
		}); // it

		describe('connect', () => {

			it('throws TypeError when no params', () => {
				expect(() => {
					libNode.connect()
				}).toThrow(BUN
					? {
						name: 'TypeError',
						message: 'Right side of assignment cannot be destructured'
					}
					: /Cannot (destructure|read) propert.* 'repoId'/);
			}); // it

			it('throws Error when param.repoId is missing', () => {
				expect(() => {
					libNode.connect({
						branch: 'master'
					})
				}).toThrow(/No repo with id/);
			}); // it

			it('throws Error when param.branch is missing', () => {
				expect(() => {
					libNode.connect({
						repoId: 'myRepoId'
					})
				}).toThrow(/No branch with branchId/);
			}); // it

			describe('Connection', () => {
				it('has property refresh', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'refresh')
					);
				}); // it

				describe('query', () => {
					it('returns all nodes', () => {
						const createRes = connection.create({});
						const queryRes = connection.query({});
						//server.log.debug('queryRes:%s', queryRes);
						deepStrictEqual(
							{
								aggregations: {},
								count: 2,
								hits: [{
									id: '00000000-0000-0000-0000-000000000000',
									score: 1
								},{
									id: createRes._id,
									score: 1
								}],
								total: 2
							},
							queryRes
						);
					}); // it
				}); // describe query

				describe('refresh', () => {
					it('can be called', () => {
						connection.refresh();
					}); // it
				}); // describe refresh

			}); // describe Connection
		}); // describe connect
	}); // describe LibNode
}); // describe mock
