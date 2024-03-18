import type {ByteSource} from '@enonic-types/core';


import {readFileSync } from 'fs';
import {join} from 'path';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP = 'com.enonic.app.myapp';
const PROJECT = 'myproject';
const REPO = `com.enonic.cms.${PROJECT}`;
const DATA: ByteSource = readFileSync(join(__dirname, '..', 'Lea-Seydoux.jpg')) as unknown as ByteSource;


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
const run = xp.context.run;


xp.repo.create({
    id: REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: REPO
});


describe('content', () => {
	describe('createMedia', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return createMedia({
					data: DATA,
					name: 'Lea-Seydoux.jpg',
					parentPath: '/',
					mimeType: 'image/jpeg',
					focalX: 0.5,
					focalY: 0.5,
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.createMedia\(\): No context\!$/);
		});

		it('is able to create a folder content', () => {
			const fn = () => {
				return run({
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
	}); // describe create
}); // describe content
