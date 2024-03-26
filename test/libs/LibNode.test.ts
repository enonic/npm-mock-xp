import {
	deepStrictEqual//,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {
	LibNode,
	Server
} from '../../src';
import { hasOwnProperty } from '@enonic/js-utils';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}

const server = new Server({
	loglevel: 'error'
});

server.createRepo({
	id: 'myRepoId'
});

const libNode = new LibNode({
	server
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
				assert.throws(() => {
					// @ts-expect-error
					libNode.connect();
				}, {
					name: 'TypeError',
					message: /^Cannot (destructure|read) propert.* 'repoId'/
				});
			}); // it
			it('throws Error when param.repoId is missing', () => {
				assert.throws(() => {
					// @ts-expect-error
					libNode.connect({
						branch: 'master'
					});
				}, {
					name: 'Error',
					message: /No repo with id/
				});
			}); // it
			it('throws Error when param.branch is missing', () => {
				assert.throws(() => {
					// @ts-expect-error
					libNode.connect({
						repoId: 'myRepoId'
					});
				}, {
					name: 'Error',
					message: /No branch with branchId/
				});
			}); // it
			const connection = libNode.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			describe('Connection', () => {
				it('has property refresh', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'refresh')
					);
				}); // it
				const createRes = connection.create({});
				describe('query', () => {
					const queryRes = connection.query({});
					//server.log.debug('queryRes:%s', queryRes);
					it('returns all nodes', () => {
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
