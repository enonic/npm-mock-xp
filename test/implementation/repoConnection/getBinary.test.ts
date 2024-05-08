import type {ByteSource} from '@enonic-types/core';
import type {BinaryAttachment} from '@enonic-types/lib-value';


import {readFileSync} from 'fs';
import {join} from 'path';
import {
	App,
	LibIo,
	LibValue,
	NodeNotFoundException,
	Server
} from '../../../src';
import {LEA_JPG_BYTE_SIZE} from '../../constants';


const BRANCH_ID = 'master';
const REPO_ID = 'myrepo';
const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '../..', FILENAME)) as unknown as ByteSource;
const BINARY_NAME = 'binaryName';

const server = new Server({
	loglevel: 'debug',
	// loglevel: 'silent'
}).createRepo({
	id: REPO_ID
});

const app = new App({
	key: 'com.enonic.app.example',
});

const libIo = new LibIo({
	app,
});

const connection = server.connect({
	branchId: BRANCH_ID,
	repoId: REPO_ID
});

const createdNode = server.createNode<{
	nested: {
		propertyName: BinaryAttachment
	}
}>({
	branchId: 'master',
	node: {
		_name: 'myNodeName',
		_parentPath: '/',
		nested: {
			propertyName: LibValue.binary(BINARY_NAME, DATA)
		}
	},
	repoId: 'myrepo'
});


describe('RepoConnection', () => {
	describe('getBinary', () => {
		it('should store binary data', () => {
			const byteSource = connection.getBinary({
				binaryReference: BINARY_NAME,
				key: createdNode._id,
			});
			expect(byteSource).toBeTruthy();
			expect(libIo.getSize(byteSource)).toBe(LEA_JPG_BYTE_SIZE);
		}); // it

		it('should throw when there is no node with key', () => {
			const key = 'non-existing-key';
			expect(() => connection.getBinary({
				binaryReference: BINARY_NAME,
				key,
			})).toThrow(new NodeNotFoundException(
				`Cannot get binary reference, node with id: ${key} not found`
			));
		}); // it
	}); // describe _createNodeInternal
}); // describe Branch
