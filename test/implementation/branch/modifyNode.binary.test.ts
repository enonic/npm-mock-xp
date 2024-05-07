import type {ByteSource} from '@enonic-types/core';
import type {Node} from '@enonic-types/lib-node';
import type {BinaryAttachment} from '@enonic-types/lib-value';


import {
	beforeAll,
	describe,
	expect,
	test as it,
} from '@jest/globals';
import {readFileSync} from 'fs';
import {join} from 'path';
import {
	App,
	LibIo,
	LibValue,
	RepoConnection,
	Server
} from '../../../src';
import {
	JEFF_JPG_BYTE_SIZE,
	LEA_JPG_BYTE_SIZE
} from '../../constants';


const REPO_ID = 'myrepo';
const BRANCH_ID = 'master';
const NODE_NAME = 'myNodeName';
const BINARY_NAME = 'binaryName';

const JEFF_DATA: ByteSource = readFileSync(join(__dirname, '../..', 'Jeffrey-Wright-hp.jpg')) as unknown as ByteSource;
const LEA_DATA: ByteSource = readFileSync(join(__dirname, '../..', 'Lea-Seydoux.jpg')) as unknown as ByteSource;


let server: Server;
let libIo: LibIo;
let createdNode: Node;
let connection: RepoConnection;


beforeAll(done => {
	server = new Server({
		// loglevel: 'debug',
		loglevel: 'error'
	}).createRepo({
		id: REPO_ID
	});

	const app = new App({
		key: 'com.enonic.app.example',
	});

	libIo = new LibIo({
		app,
	});

	createdNode = server.createNode({
		branchId: BRANCH_ID,
		node: {
			_name: NODE_NAME,
		},
		repoId: REPO_ID,
	});

	connection = server.connect({
		branchId: BRANCH_ID,
		repoId: REPO_ID
	});
	done();
});


describe('Branch', () => {
	describe('modifyNode', () => {
		it('should add binary data', () => {
			const emptyByteSource = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(emptyByteSource)).toBe(0);
			server.modifyNode<{
				nested: {
					propertyName: BinaryAttachment
				}
			}>({
				branchId: BRANCH_ID,
				editor: (node) => {
					node.nested = {
						propertyName: LibValue.binary(BINARY_NAME, LEA_DATA)
					}
					return node;
				},
				key: createdNode._id,
				repoId: REPO_ID,
			});
			const modifiedNode = server.getNode({
				branchId: BRANCH_ID,
				key: createdNode._id,
				repoId: REPO_ID,
			});
			expect(modifiedNode['nested'].propertyName).toBe(BINARY_NAME);
			const byteSource = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSource)).toBe(LEA_JPG_BYTE_SIZE);
		}); // it

		it('should keep binary data', () => {
			const byteSourceBefore = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceBefore)).toBe(LEA_JPG_BYTE_SIZE);
			server.modifyNode<{
				nested: {
					propertyName: BinaryAttachment
				}
			}>({
				branchId: BRANCH_ID,
				editor: (node) => {
					node.nested = {
						propertyName: LibValue.binary(BINARY_NAME, LEA_DATA)
					}
					return node;
				},
				key: createdNode._id,
				repoId: REPO_ID,
			});
			const modifiedNode = server.getNode({
				branchId: BRANCH_ID,
				key: createdNode._id,
				repoId: REPO_ID,
			});
			expect(modifiedNode['nested'].propertyName).toBe(BINARY_NAME);
			const byteSourceAfter = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceAfter)).toBe(LEA_JPG_BYTE_SIZE);
		}); // it

		it('should change binary data', () => {
			const byteSourceBefore = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceBefore)).toBe(LEA_JPG_BYTE_SIZE);
			server.modifyNode<{
				nested: {
					propertyName: BinaryAttachment
				}
			}>({
				branchId: BRANCH_ID,
				editor: (node) => {
					node.nested = {
						propertyName: LibValue.binary(BINARY_NAME, JEFF_DATA)
					}
					return node;
				},
				key: createdNode._id,
				repoId: REPO_ID,
			});
			const modifiedNode = server.getNode({
				branchId: BRANCH_ID,
				key: createdNode._id,
				repoId: REPO_ID,
			});
			expect(modifiedNode['nested'].propertyName).toBe(BINARY_NAME);
			const byteSourceAfter = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceAfter)).toBe(JEFF_JPG_BYTE_SIZE);
		}); // it

		it('should remove binary data', () => {
			const byteSourceBefore = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceBefore)).toBe(JEFF_JPG_BYTE_SIZE);
			server.modifyNode<{
				nested: {
					propertyName: BinaryAttachment
				}
			}>({
				branchId: BRANCH_ID,
				editor: (node) => {
					delete node.nested;
					return node;
				},
				key: createdNode._id,
				repoId: REPO_ID,
			});
			const modifiedNode = server.getNode({
				branchId: BRANCH_ID,
				key: createdNode._id,
				repoId: REPO_ID,
			});
			expect(modifiedNode['nested']).toBeUndefined();
			const byteSourceAfter = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(libIo.getSize(byteSourceAfter)).toBe(0);
		}); // it
	}); // modifyNode
}); // Branch
