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
				const connection = javaBridge.connect({
					branch: 'master',
					repoId: 'myRepoId'
				});
				it('returns an object which has a exists method', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'exists')
					);
				}); // it
				const createRes = connection.create({});
				//javaBridge.log.info('createRes:%s', createRes);
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
	}); // describe JavaBridge
}); // describe mock
