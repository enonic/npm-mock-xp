import type {ByteSource} from '@enonic-types/core';


import {readFileSync} from 'fs';
import { vol } from 'memfs';
import {join} from 'path';
import {
	// App,
	LibContent,
	LibContext,
	Server
} from '../../src';

// const APP_KEY = 'com.example.myapp';
const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;

const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
	// loglevel: 'silent'
})
	// .su()
	.createProject({
		projectName: PROJECT_NAME,
	})
	// .logout()
	.setContext({
		projectName: PROJECT_NAME,
	});

// const app = new App({
// 	key: APP_KEY
// });

const libContent = new LibContent({
	server
});

const libContext = new LibContext({
	server
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
				_id: createdContent._id,
				_name: "myname",
				_path: createdContent._path,
				attachments: {},
				childOrder: undefined,
				createdTime: expect.any(String),
				creator: "user:system:su",
				data: {
					key: "value",
				},
				displayName: "My display name",
				hasChildren: true,
				owner: "user:system:su",
				publish: {},
				type: "com.example.myapp:person",
				valid: true,
				x: {},
			};
			expect(createdContent).toStrictEqual(expectedContent);
			expect(libContent.exists({key: createdContent._id})).toBe(true);
			expect(libContent.exists({key: createdContent._path})).toBe(true);
			expect(libContent.get({key: createdContent._id})).toStrictEqual(expectedContent);
			expect(libContent.get({key: createdContent._path})).toStrictEqual(expectedContent);

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {

				// const innerContext = libContext.get();
				// console.debug('innerContext:', innerContext);

				expect(libContent.exists({key: createdContent._id})).toBe(false);
				expect(libContent.exists({key: createdContent._path})).toBe(false);
				expect(libContent.get({key: createdContent._id})).toBe(null);
				expect(libContent.get({key: createdContent._path})).toBe(null);
			});
			expect(libContent.publish({
				keys: [
					// createdContent._id
					createdContent._path
					]
				})).toStrictEqual({
					deletedContents: [],
					failedContents: [],
					pushedContents: [
						// createdContent._id,
						createdContent._path
					],
				});

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdContent._id})).toBe(true);
				expect(libContent.exists({key: createdContent._path})).toBe(true);
				expect(libContent.get({key: createdContent._id})).toStrictEqual(expectedContent);
				expect(libContent.get({key: createdContent._path})).toStrictEqual(expectedContent);
			});

			const expectedModifiedContent = {
				...expectedContent,
				data: {
					key: 'changed value',
				},
				modifiedTime: expect.any(String),
				modifier: 'user:system:su',
			};
			const modifiedContent = libContent.modify({
				key: createdContent._path,
				editor: (content) => {
					content.data.key = 'changed value';
					return content;
				},
			});
			expect(modifiedContent).toStrictEqual(expectedModifiedContent);

			// Master is unaffected by modify on draft
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdContent._id})).toBe(true);
				expect(libContent.exists({key: createdContent._path})).toBe(true);
				expect(libContent.get({key: createdContent._id})).toStrictEqual(expectedContent);
				expect(libContent.get({key: createdContent._path})).toStrictEqual(expectedContent);
			});

			expect(libContent.publish({keys: [
				// modifiedContent._id
				modifiedContent._path
			]})).toStrictEqual({
				deletedContents: [],
				failedContents: [],
				pushedContents: [
					// modifiedContent._id
					modifiedContent._path
				],
			});

			// The modify is published to master
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: modifiedContent._id})).toBe(true);
				expect(libContent.exists({key: modifiedContent._path})).toBe(true);
				expect(libContent.get({key: modifiedContent._id})).toStrictEqual(expectedModifiedContent);
				expect(libContent.get({key: modifiedContent._path})).toStrictEqual(expectedModifiedContent);
			});

			const expectedMovedContent = {
				...expectedModifiedContent,
				_name: 'renamed',
				_path: '/renamed',
			};
			const movedContent = libContent.move({
				source: createdContent._path,
				target: '/renamed',
			});
			expect(movedContent).toStrictEqual(expectedMovedContent);

			// Master is unaffected by move on draft
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdContent._id})).toBe(true);
				expect(libContent.get({key: createdContent._id})).toStrictEqual(expectedModifiedContent);

				expect(libContent.exists({key: createdContent._path})).toBe(true);
				expect(libContent.get({key: createdContent._path})).toStrictEqual(expectedModifiedContent);

				expect(libContent.exists({key: movedContent._path})).toBe(false);
				expect(libContent.get({key: movedContent._path})).toStrictEqual(null);
			});

			expect(libContent.publish({keys: [
				// movedContent._id
				movedContent._path
			]})).toStrictEqual({
				deletedContents: [],
				failedContents: [],
				pushedContents: [
					// movedContent._id
					movedContent._path
				],
			});

			// The modify is published to master
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdContent._id})).toBe(true);
				expect(libContent.get({key: createdContent._id})).toStrictEqual(expectedMovedContent);

				expect(libContent.exists({key: createdContent._path})).toBe(false);
				expect(libContent.get({key: createdContent._path})).toBe(null);

				expect(libContent.exists({key: movedContent._path})).toBe(true);
				expect(libContent.get({key: movedContent._path})).toStrictEqual(expectedMovedContent);
			});

			expect(libContent.delete({key: movedContent._id})).toBe(true);
			// expect(libContent.delete({key: '/myname'})).toBe(true); // TODO this one fails :(

			expect(libContent.exists({key: movedContent._id})).toBe(false);
			expect(libContent.exists({key: movedContent._path})).toBe(false);
			expect(libContent.get({key: movedContent._id})).toBe(null);
			expect(libContent.get({key: movedContent._path})).toBe(null);

			// Master is unaffected by delete on draft
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: movedContent._id})).toBe(true);
				expect(libContent.exists({key: movedContent._path})).toBe(true);
				expect(libContent.get({key: movedContent._id})).toStrictEqual(expectedMovedContent);
				expect(libContent.get({key: movedContent._path})).toStrictEqual(expectedMovedContent);
			});

			expect(libContent.publish({keys: [
				// movedContent._id
				movedContent._path
			]})).toStrictEqual({
				deletedContents: [
					// movedContent._id
					movedContent._path
				],
				failedContents: [],
				pushedContents: [],
			});

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: movedContent._id})).toBe(false);
				expect(libContent.exists({key: movedContent._path})).toBe(false);
				expect(libContent.get({key: movedContent._id})).toStrictEqual(null);
				expect(libContent.get({key: movedContent._path})).toStrictEqual(null);
			});
		});
	}); // describe create

	describe('createMedia and getAttachmentStream', () => {
		it('should create a media content and be able to getAttachmentStream', () => {
			const FILENAME = 'Lea-Seydoux.jpg';
			const createdMedia = libContent.createMedia({
				data: readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource,
				name: 'Lea-Seydoux.jpg',
				mimeType: 'image/jpeg',
				focalX: 0.5,
				focalY: 0.5,
			});
			const expectedMediaContent = {
				_id: createdMedia._id,
				_name: FILENAME,
				_path: createdMedia._path,
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: expect.any(String),
				creator: "user:system:su",
				data: {
					artist: "",
					caption: "",
					copyright: "",
					media: {
						attachment: FILENAME,
						focalPoint: {
							x: 0.5,
							y: 0.5,
						},
					},
					tags: "",
				},
				displayName: "Lea-Seydoux",
				hasChildren: true,
				owner: "user:system:su",
				publish: {},
				type: "media:image",
				valid: true,
				x: {
					media: {
						imageInfo: {
							byteSize: 528238,
							contentType: "image/jpeg",
							imageHeight: 1080,
							imageWidth: 1920,
							pixelSize: 2073600,
						},
					},
				},
			};
			expect(createdMedia).toStrictEqual(expectedMediaContent);
			const attachmentStream = libContent.getAttachmentStream({
				// key: createdMedia._id,
				key: createdMedia._path,
				name: FILENAME,
			});
			vol.fromJSON({}, '/');
			vol.writeFileSync(createdMedia._path, attachmentStream.toString());
			const {
				size
			} = vol.statSync(createdMedia._path);
			expect(size).toBe(528238);

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdMedia._id})).toBe(false);
				expect(libContent.exists({key: createdMedia._path})).toBe(false);
				expect(libContent.get({key: createdMedia._id})).toStrictEqual(null);
				expect(libContent.get({key: createdMedia._path})).toStrictEqual(null);
				expect(libContent.getAttachmentStream({
					key: createdMedia._id,
					name: FILENAME,
				})).toBe(null);
				expect(libContent.getAttachmentStream({
					key: createdMedia._path,
					name: FILENAME,
				})).toBe(null);
			});

			expect(libContent.publish({keys: [
				// createdMedia._id
				createdMedia._path
			]})).toStrictEqual({
				deletedContents: [],
				failedContents: [],
				pushedContents: [
					// createdMedia._id
					createdMedia._path
				],
			});

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdMedia._id})).toBe(true);
				expect(libContent.exists({key: createdMedia._path})).toBe(true);
				expect(libContent.get({key: createdMedia._id})).toStrictEqual(expectedMediaContent);
				expect(libContent.get({key: createdMedia._path})).toStrictEqual(expectedMediaContent);

				const attachmentStream = libContent.getAttachmentStream({
					// key: createdMedia._id,
					key: createdMedia._path,
					name: FILENAME,
				});
				vol.fromJSON({}, '/');
				vol.writeFileSync(createdMedia._path, attachmentStream.toString());
				const {
					size
				} = vol.statSync(createdMedia._path);
				expect(size).toBe(528238);
			});

			expect(libContent.delete({key: createdMedia._id})).toBe(true);
			expect(libContent.getAttachmentStream({
				key: createdMedia._id,
				name: FILENAME,
			})).toBe(null);
			expect(libContent.getAttachmentStream({
				key: createdMedia._path,
				name: FILENAME,
			})).toBe(null);

			// Master branch unaffected by delete on draft
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdMedia._id})).toBe(true);
				expect(libContent.exists({key: createdMedia._path})).toBe(true);
				expect(libContent.get({key: createdMedia._id})).toStrictEqual(expectedMediaContent);
				expect(libContent.get({key: createdMedia._path})).toStrictEqual(expectedMediaContent);

				const attachmentStream = libContent.getAttachmentStream({
					// key: createdMedia._id,
					key: createdMedia._path,
					name: FILENAME,
				});
				vol.fromJSON({}, '/');
				vol.writeFileSync(createdMedia._path, attachmentStream.toString());
				const {
					size
				} = vol.statSync(createdMedia._path);
				expect(size).toBe(528238);
			});

			expect(libContent.publish({keys: [
				// createdMedia._id
				createdMedia._path
			]})).toStrictEqual({
				deletedContents: [
					// createdMedia._id
					createdMedia._path
				],
				failedContents: [],
				pushedContents: [],
			});

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.exists({key: createdMedia._id})).toBe(false);
				expect(libContent.exists({key: createdMedia._path})).toBe(false);
				expect(libContent.get({key: createdMedia._id})).toStrictEqual(null);
				expect(libContent.get({key: createdMedia._path})).toStrictEqual(null);
				expect(libContent.getAttachmentStream({
					key: createdMedia._id,
					name: FILENAME,
				})).toBe(null);
				expect(libContent.getAttachmentStream({
					key: createdMedia._path,
					name: FILENAME,
				})).toBe(null);
			});
		}); // it
	}); // describe createMedia
}); // describe LibContent
