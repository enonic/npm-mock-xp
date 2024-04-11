import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import { vol } from 'memfs';
import {join} from 'path';
import {
	LibContent,
	LibContext,
	Server
} from '../../../src';
import {LEA_JPG_BYTE_SIZE} from '../../constants';


const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;
const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '../..', FILENAME)) as unknown as ByteSource;


const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
	// loglevel: 'silent'
})
	.createProject({
		projectName: PROJECT_NAME,
	})
	.setContext({
		projectName: PROJECT_NAME,
	});

const libContent = new LibContent({
	server
});

const libContext = new LibContext({
	server
});

const createdMediaContent = libContext.run({
	branch: 'draft',
	repository: REPO_ID,
},() => {
	return libContent.createMedia({
		data: DATA,
		name: 'Lea-Seydoux.jpg',
		parentPath: '/',
		mimeType: 'image/jpeg',
		focalX: 0.5,
		focalY: 0.5,
	});
});


describe('content', () => {
	describe('getAttachmentStream', () => {
		it('is able to get an attachmentStream', () => {
			const attachmentStream = libContext.run({
				branch: 'draft',
				repository: REPO_ID,
			},() => {
				return libContent.getAttachmentStream({
					name: FILENAME,
					key: createdMediaContent._id
				});
			});
			vol.fromJSON({}, '/');
			const filePath = `/${FILENAME}`;
			vol.writeFileSync(filePath, attachmentStream.toString());
			const {
				size
			} = vol.statSync(filePath);
			expect(size).toBe(LEA_JPG_BYTE_SIZE);
		});
	}); // describe getAttachmentStream
}); // describe content
