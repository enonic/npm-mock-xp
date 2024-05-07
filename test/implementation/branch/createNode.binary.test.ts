import type {ByteSource} from '@enonic-types/core';
import type {BinaryAttachment} from '@enonic-types/lib-value';


import {readFileSync} from 'fs';
import {join} from 'path';
import {
	App,
	LibIo,
	LibValue,
	Server
} from '../../../src';
import {
	LEA_JPG_BYTE_SIZE,
	LEA_SHA512,
} from '../../constants';

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

const branch = server.getBranch({
	branchId: BRANCH_ID,
	repoId: REPO_ID
});

const connection = server.connect({
	branchId: BRANCH_ID,
	repoId: REPO_ID
});


describe('Branch', () => {
	describe('_createNodeInternal', () => {
		it('should store binary data', () => {
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
			// server.log.debug('createdNode: %s', createdNode);
			expect(createdNode).toStrictEqual({
				_id: '00000000-0000-4000-8000-000000000002',
				_indexConfig: {
					default: {
						decideByType: true,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false,
						indexValueProcessors: [],
						languages: []
					},
					configs: []
				},
				_name: 'myNodeName',
				_path: '/myNodeName',
				_state: 'DEFAULT',
				_ts: createdNode._ts,
				_versionKey: '00000000-0000-4000-8000-000000000003',
				nested: {
					propertyName: 'binaryName'
				},
				_nodeType: 'default'
			});
			expect(branch.binaryReferences[createdNode._id]).toStrictEqual({
				binaryName: LEA_SHA512
			});
			expect(server.vol.existsSync(`/${LEA_SHA512}`)).toBe(true);
			const tDataOut = server.vol.readFileSync(`/${LEA_SHA512}`);
			expect(tDataOut).toBeTruthy();
			expect(tDataOut.length).toBe(LEA_JPG_BYTE_SIZE);
			const byteSource = connection.getBinary({
				binaryReference: 'binaryName',
				key: createdNode._id,
			});
			expect(byteSource).toBeTruthy();
			expect(libIo.getSize(byteSource)).toBe(LEA_JPG_BYTE_SIZE);
		}); // it
	}); // describe _createNodeInternal
}); // describe Branch
