import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {
	LibContent,
	LibContext,
	Server
} from '../../../src';


const PROJECT_NAME = 'myproject';
const REPO = `com.enonic.cms.${PROJECT_NAME}`;
const DATA: ByteSource = readFileSync(join(__dirname, '../..', 'Lea-Seydoux.jpg')) as unknown as ByteSource;


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

describe('content', () => {
	describe('createMedia', () => {
		it('is able to create a folder content', () => {
			const fn = () => {
				return libContext.run({
					branch: 'draft',
					repository: REPO,
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
			}
			expect(fn()).toEqual({
				_id: '00000000-0000-4000-8000-000000000004',
				_name: 'Lea-Seydoux.jpg',
				_path: '/Lea-Seydoux.jpg',
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: expect.any(String) as unknown as string,
				creator: 'user:system:su',
				data: {
					artist: "",
					caption: "",
					copyright: "",
					media: {
					attachment: 'Lea-Seydoux.jpg',
					focalPoint: {
						x: 0.5,
						y: 0.5,
					},
					},
					tags: "",
				},
				displayName: 'Lea-Seydoux',
				hasChildren: true,
				owner: 'user:system:su',
				publish: {},
				type: 'media:image',
				valid: true,
				x: {
					media: {
						imageInfo: {
							byteSize: 528238,
							contentType: 'image/jpeg',
							imageHeight: 1080,
							imageWidth: 1920,
							pixelSize: 2073600,
						},
					},
				},
			});
		});
	}); // describe createMedia
}); // describe content
