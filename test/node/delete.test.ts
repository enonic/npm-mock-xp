import {
	deepStrictEqual
} from 'assert';
import * as assert from 'assert';

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
				it('returns an object which has a delete method', () => {
					deepStrictEqual(
						true,
						hasMethod(connection, 'delete')
					);
				}); // it
				describe('delete()', () => {
					/*describe('throws', () => {
						it('when key is not id nor path', () => {
							assert.throws(() => {
								//@ts-ignore
								connection.delete('');
							}, {
								name: 'TypeError',
								message: /^key not an id nor path/
							});
						}); // it
					}); // describe throws*/
					it('works for a single existing node', () => {
						const createRes1 = connection.create({});
						deepStrictEqual(
							[createRes1._id],
							connection.delete(createRes1._id)
						); // deepStrictEqual
					}); // it
					it('return an empty array for a single non existant key', () => {
						deepStrictEqual(
							[],
							connection.delete('/nonExistantParentPath/nonExistantName')
						); // deepStrictEqual
					}); // it
					it('works for a list of existing and non-existant keys', () => {
						const createRes2 = connection.create({});
						deepStrictEqual(
							[createRes2._id],
							connection.delete(['', createRes2._id, 'whatever'])
						); // deepStrictEqual
					}); // it
					it('cleans up the pathIndex', () => {
						const createFolderRes =	connection.create({
							_name: 'myParentPath'
						});
						const createRes3 = connection.create({
							_name: 'myName',
							_parentPath: '/myParentPath/'
						});
						//javaBridge.log.info('createRes3:%s', createRes3);
						deepStrictEqual(
							'/myParentPath/myName',
							createRes3._path
						);
						deepStrictEqual(
							createRes3,
							connection.get('/myParentPath/myName')
						);

						connection.delete('/myParentPath/myName');
						deepStrictEqual(
							[],
							connection.exists(createRes3._id)
						);
						deepStrictEqual(
							[],
							connection.exists('/myParentPath/myName')
						);
						deepStrictEqual( // Parent exists after node deleted
							['/myParentPath'],
							connection.exists('/myParentPath')
						);

						connection.delete('/myParentPath');
						deepStrictEqual(
							[],
							connection.exists(createFolderRes._id)
						);
						deepStrictEqual(
							[],
							connection.exists('/myParentPath')
						);
					}); // it
				}); // describe delete()
			}); // describe Connection
		}); // describe connect()
	}); // describe JavaBridge
}); // describe mock
