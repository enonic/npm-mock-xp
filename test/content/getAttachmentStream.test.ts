import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import { vol } from 'memfs';
import {join} from 'path';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP = 'com.enonic.app.myapp';
const PROJECT = 'myproject';
const REPO = `com.enonic.cms.${PROJECT}`;
const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource;


const log = Log.createLogger({
	// loglevel: 'debug'
	loglevel: 'silent'
});

const xp = new JavaBridge({
	app: {
		config: {},
		name: APP,
		version: '0.0.1-SNAPSHOT'
	},
	log
});
const createMedia = xp.content.createMedia;
const getAttachmentStream = xp.content.getAttachmentStream;
const run = xp.context.run;


xp.repo.create({
    id: REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: REPO
});

const createdMediaContent = run({
	currentApplicationKey: APP,
	branch: 'draft',
	repository: REPO,
},() => {
	return createMedia({
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
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return getAttachmentStream({
					name: FILENAME,
					key: createdMediaContent._id
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.getAttachmentStream\(\): No context\!$/);
		});

		it('is able to get an attachmentStream', () => {
			const attachmentStream = run({
				currentApplicationKey: APP,
				branch: 'draft',
				repository: REPO,
			},() => {
				return getAttachmentStream({
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
			expect(size).toBe(528238);
		});
	}); // describe getAttachmentStream
}); // describe content
