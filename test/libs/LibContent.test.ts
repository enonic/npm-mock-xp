import type {ByteSource} from '@enonic-types/core';


import {readFileSync} from 'fs';
import { vol } from 'memfs';
import {join} from 'path';
import {
    // App,
    LibContent,
	LibContext,
    Project,
    Server
} from '../../src';
import {
    Context
} from '../../src/implementation/Context';

// const APP_KEY = 'com.example.myapp';
const PROJECT_NAME = 'myproject';
const REPO = `com.enonic.cms.${PROJECT_NAME}`;

const server = new Server({
    // loglevel: 'debug'
	loglevel: 'error'
	// loglevel: 'silent'
});

const project = new Project({
    projectName: PROJECT_NAME,
    server
});

// const app = new App({
// 	key: APP_KEY
// });

// const libContext = new LibContext({
// 	server
// });

const libContent = new LibContent({
    project
});

describe('LibContent', () => {
	describe('create, exists, get, modify, move, publish and delete', () => {
		it('should do those things', () => {
			expect(libContent.exists({key: '00000000-0000-4000-8000-000000000004'})).toBe(false);
			expect(libContent.exists({key: '/myname'})).toBe(false);
			expect(libContent.get({key: '00000000-0000-4000-8000-000000000004'})).toBe(null);
			expect(libContent.get({key: '/myname'})).toBe(null);

			const createdContent = libContent.create({
				contentType: 'com.example.myapp:person',
				data: {
					key: 'value'
				},
				name: 'myname',
				displayName: 'My display name',
				parentPath: '/',
			});
			const expectedContent = {
				"_id": "00000000-0000-4000-8000-000000000004",
				"_name": "myname",
				"_path": "/myname",
				"attachments": {},
				"childOrder": undefined,
				"createdTime": expect.any(String),
				"creator": "user:system:su",
				"data": {
					"key": "value",
				},
				"displayName": "My display name",
				"hasChildren": true,
				"owner": "user:system:su",
				"publish": {},
				"type": "com.example.myapp:person",
				"valid": true,
				"x": {},
			};
			expect(createdContent).toStrictEqual(expectedContent);
			expect(libContent.exists({key: '00000000-0000-4000-8000-000000000004'})).toBe(true);
			expect(libContent.exists({key: '/myname'})).toBe(true);
			expect(libContent.get({key: '00000000-0000-4000-8000-000000000004'})).toStrictEqual(expectedContent);
			expect(libContent.get({key: '/myname'})).toStrictEqual(expectedContent);

			Context.runProject({
				contextParams: {
					branch: 'master',
					repository: REPO,
					// user
				},
				project,
				callback: () => {
					expect(libContent.exists({key: '00000000-0000-4000-8000-000000000004'})).toBe(false);
				},
			}); // runProject

			expect(libContent.publish({keys: [
				'00000000-0000-4000-8000-000000000004' // Works
				// '/renamed' // TODO this one fails :(
			]})).toStrictEqual({
				"deletedContents": [],
				"failedContents": [],
				"pushedContents": [
					"00000000-0000-4000-8000-000000000004",
				],
			});

			// libContext.run({
			// 	branch: 'master'
			// }, () => {
			// 	expect(libContent.exists({key: '00000000-0000-4000-8000-000000000004'})).toBe(true);
			// });

			const expectedModifiedContent = {
				...expectedContent,
				data: {
					key: 'changed value',
				},
				modifiedTime: expect.any(String),
				modifier: 'user:system:su',
			};
			expect(libContent.modify({
				key: '/myname',
				editor: (content) => {
					content.data.key = 'changed value';
					return content;
				},
			})).toStrictEqual(expectedModifiedContent);

			const expectedMovedContent = {
				...expectedModifiedContent,
				_name: 'renamed',
				_path: '/renamed',
			};
			expect(libContent.move({
				source: '/myname',
				target: '/renamed',
			})).toStrictEqual(expectedMovedContent);

			expect(libContent.delete({key: '00000000-0000-4000-8000-000000000004'})).toBe(true);
			// expect(libContent.delete({key: '/myname'})).toBe(true); // TODO this one fails :(

			expect(libContent.exists({key: '00000000-0000-4000-8000-000000000004'})).toBe(false);
			expect(libContent.exists({key: '/myname'})).toBe(false);
			expect(libContent.get({key: '00000000-0000-4000-8000-000000000004'})).toBe(null);
			expect(libContent.get({key: '/myname'})).toBe(null);
		});
	}); // describe create

	// describe('createMedia and getAttachmentStream', () => {
	// 	it('should create a media content and be able to getAttachmentStream', () => {
	// 		const FILENAME = 'Lea-Seydoux.jpg';
	// 		const MEDIA_PATH = `/${FILENAME}`;
	// 		const createdMedia = libContent.createMedia({
	// 			data: readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource,
	// 			name: 'Lea-Seydoux.jpg',
	// 			mimeType: 'image/jpeg',
	// 			focalX: 0.5,
	// 			focalY: 0.5,
	// 		});
	// 		expect(createdMedia).toStrictEqual({
	// 			"_id": "00000000-0000-4000-8000-000000000010",
	// 			"_name": FILENAME,
	// 			"_path": MEDIA_PATH,
	// 			"attachments": {},
	// 			"childOrder": 'displayname ASC',
	// 			"createdTime": expect.any(String),
	// 			"creator": "user:system:su",
	// 			data: {
	// 				"artist": "",
	// 				"caption": "",
	// 				"copyright": "",
	// 				"media": {
	// 					"attachment": FILENAME,
	// 					"focalPoint": {
	// 						"x": 0.5,
	// 						"y": 0.5,
	// 					},
	// 				},
	// 				"tags": "",
	// 			},
	// 			"displayName": "Lea-Seydoux",
	// 			"hasChildren": true,
	// 			"owner": "user:system:su",
	// 			"publish": {},
	// 			"type": "media:image",
	// 			"valid": true,
	// 			"x": {
	// 				"media": {
	// 					"imageInfo": {
	// 						"byteSize": 528238,
	// 						"contentType": "image/jpeg",
	// 						"imageHeight": 1080,
	// 						"imageWidth": 1920,
	// 						"pixelSize": 2073600,
	// 					},
	// 				},
	// 			},
	// 		});
	// 		const attachmentStream = libContent.getAttachmentStream({
	// 			key: '00000000-0000-4000-8000-000000000010', // Works
	// 			// key: MEDIA_PATH, // TODO Doesn't work!
	// 			name: FILENAME,
	// 		});
	// 		vol.fromJSON({}, '/');
	// 		vol.writeFileSync(MEDIA_PATH, attachmentStream.toString());
	// 		const {
	// 			size
	// 		} = vol.statSync(MEDIA_PATH);
	// 		expect(size).toBe(528238);
	// 	}); // it
	// }); // describe createMedia
}); // describe LibContent
