import {isString} from '@enonic/js-utils/value/isString';
import {
	describe,
	expect,
	// jest,
	// test
} from '@jest/globals';
import * as assert from 'assert';
import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';


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
		describe('connect', () => {
			const connection = javaBridge.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a modify method', () => {
				expect(hasMethod(connection, 'modify')).toBe(true);
			}); // it
			describe('Connection', () => {
				const createRes = connection.create({});
				// log.debug('createRes:%s', createRes);
				describe('modify', () => {
					const modifiedNode = connection.modify({
						key: createRes._id,
						editor: (node) => {
							node.propertyName = 'propertyValue';
							return node;
						}
					});
					it('returns the modified node', () => {
						expect(modifiedNode).toStrictEqual({
							...createRes,
							propertyName: 'propertyValue'
						})
					}); // it
					it('does NOT modify _id, _name or _path', () => {
						expect(connection.modify({
							key: modifiedNode._id,
							editor: (node) => {
								node._id = 'newId',
								node._name = 'newName';
								node._path = 'newPath';
								return node;
							}
						})).toStrictEqual(modifiedNode);
					}); // it
				}); // describe modify
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
