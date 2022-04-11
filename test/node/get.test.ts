import {isString} from '@enonic/js-utils/dist/cjs';
import {
	deepStrictEqual//,
	//throws // For some reason this gets borked by swc
} from 'assert';
import * as assert from 'assert';
import {JavaBridge} from '../../src/JavaBridge';

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
		javaBridge.repo.create({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = javaBridge.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a get method', () => {
				deepStrictEqual(
					true,
					hasMethod(connection, 'get')
				);
			}); // it
			describe('Connection', () => {
				const createRes = connection.create({});
				describe('get', () => {
					it('return an empty array when no params', () => {
						deepStrictEqual(
							[],
							connection.get()
						);
					}); // it
					it('returns a single node', () => {
						deepStrictEqual(
							createRes,
							connection.get(createRes._id)
						);
					}); // it
					it('returns a multiple nodes', () => {
						const createRes2 = connection.create({});
						//javaBridge.log.debug('createRes2:%s', createRes2);
						deepStrictEqual(
							[createRes,createRes2],
							connection.get(createRes._id,createRes2._id)
						);
						deepStrictEqual(
							[createRes,createRes2],
							//@ts-ignore
							connection.get([createRes._id,createRes2._id])
						);
					}); // it
					it('support key being a path', () => {
						deepStrictEqual(
							createRes,
							connection.get(createRes._path)
						);
					}); // it
				}); // describe get
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
