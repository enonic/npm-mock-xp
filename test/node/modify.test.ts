import {isString} from '@enonic/js-utils/dist/cjs/value/isString';
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
			it('returns an object which has a modify method', () => {
				deepStrictEqual(
					true,
					hasMethod(connection, 'modify')
				);
			}); // it
			describe('Connection', () => {
				const createRes = connection.create({});
				describe('modify', () => {
					it('returns the modified node', () => {
						deepStrictEqual(
							{
								...createRes,
								propertyName: 'propertyValue'
							},
							connection.modify({
								key: createRes._id,
								editor: (node) => {
									node.propertyName = 'propertyValue';
									return node;
								}
							})
						);
					}); // it
					it('does NOT modify _id, _name or _path', () => {
						deepStrictEqual(
							createRes,
							connection.modify({
								key: createRes._id,
								editor: (node) => {
									node._id = 'newId',
									node._name = 'newName';
									node._path = 'newPath';
									return node;
								}
							})
						);
					}); // it
				}); // describe modify
			}); // describe Connection
		}); // describe connect
	}); // describe JavaBridge
}); // describe mock
