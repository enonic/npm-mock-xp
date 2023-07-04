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
						expect(connection.exists('00000000-0000-0000-0000-000000000000')).toStrictEqual([
							'00000000-0000-0000-0000-000000000000'
						]);
						expect(connection.exists('/')).toStrictEqual([
							'/'
						]);
					}); // it
					it('returns an empty array for non existant nodes', () => {
						deepStrictEqual(
							[],
							connection.exists('')
						); // deepStrictEqual
					}); // it
					it('returns an array for existant nodes', () => {
						deepStrictEqual(
							[createRes._id],
							connection.exists(createRes._id)
						); // deepStrictEqual
					}); // it
					it('filters away non existant nodes', () => {
						deepStrictEqual(
							[createRes._id],
							connection.exists([
								'',
								createRes._id,
								'whatever'
							])
						); // deepStrictEqual
					}); // it
				}); // describe exists()
			}); // describe Connection
		}); // describe connect()
	}); // describe JavaBridge
}); // describe mock
