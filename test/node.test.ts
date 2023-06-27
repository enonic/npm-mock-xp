import {isString} from '@enonic/js-utils/value/isString';
import {
	deepStrictEqual//,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {JavaBridge} from '../src/JavaBridge';
import Log from '../src/Log';


function hasMethod(obj :unknown, name :string) {
	// TODO check if obj is Object?
	return typeof obj[name] === 'function';
}

const log = Log.createLogger({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			},
			log
		});
		javaBridge.repo.create({
			id: 'myRepoId'
		});
		it('instance has property connect', () => {
			deepStrictEqual(
				true,
				hasMethod(javaBridge, 'connect')
			);
		}); // it
		describe('connect', () => {
			it('throws TypeError when no params', () => {
				assert.throws(() => {
					//@ts-ignore
					javaBridge.connect();
				}, {
					name: 'TypeError',
					message: /^Cannot (destructure|read) propert.* 'repoId'/
				});
			}); // it
			it('throws Error when param.repoId is missing', () => {
				assert.throws(() => {
					//@ts-ignore
					javaBridge.connect({
						branch: 'master'
					});
				}, {
					name: 'Error',
					message: /No repo with id/
				});
			}); // it
			it('throws Error when param.branch is missing', () => {
				assert.throws(() => {
					//@ts-ignore
					javaBridge.connect({
						repoId: 'myRepoId'
					});
				}, {
					name: 'Error',
					message: /No branch with branchId/
				});
			}); // it
			const connection = javaBridge.connect({
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
					//javaBridge.log.debug('queryRes:%s', queryRes);
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
	}); // describe JavaBridge
}); // describe mock
