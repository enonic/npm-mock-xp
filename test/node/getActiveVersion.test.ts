import {
	deepStrictEqual
} from 'assert';

import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';


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
		describe('connect()', () => {
			describe('Connection', () => {
				const connection = javaBridge.node.connect({
					branch: 'master',
					repoId: 'myRepoId'
				});
				it('returns an object which has a getActiveVersion method', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'getActiveVersion')
					);
				}); // it
				const createRes = connection.create({});
				javaBridge.log.info('createRes:%s', createRes);
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
	}); // describe JavaBridge
}); // describe mock
