import type {ByteSource} from '@enonic-types/core';


import {readFileSync} from 'fs';
import {join} from 'path';
import {
	App,
	LibContent,
	LibPortal,
	Request,
	Server,
} from '../../../src';


const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;

const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
}).createProject({
	projectName: PROJECT_NAME,
}).setContext({
	projectName: PROJECT_NAME,
});

const app = new App({
	key: 'com.example.myapp'
});

const libContent = new LibContent({
	server
});

const libPortal = new LibPortal({
	app,
	server,
});


const HOST = 'localhost';
const PORT = 8080;
const PATH = '/some/path';

const ADMIN_BRANCH = 'draft';
const ADMIN_MODE = 'preview';
const ADMIN_SCHEME = 'http';
const ADMIN_PREVIEW_PATH = `/admin/site/${ADMIN_MODE}/${PROJECT_NAME}/${ADMIN_BRANCH}${PATH}`;
const ADMIN_PREVIEW_URL = `${ADMIN_SCHEME}://${HOST}:${PORT}${ADMIN_PREVIEW_PATH}`;
const ADMIN_REQUEST = new Request({
	branch: ADMIN_BRANCH,
	host: HOST,
	method: 'GET',
	mode: ADMIN_MODE,
	path: ADMIN_PREVIEW_PATH,
	port: PORT,
	scheme: ADMIN_SCHEME,
	url: ADMIN_PREVIEW_URL
});

const LIVE_BRANCH = 'master';
const LIVE_MODE = 'live';
const LIVE_SCHEME = 'https';
const LIVE_PATH = `/site/${PROJECT_NAME}/${LIVE_BRANCH}${PATH}`;
const LIVE_URL = `${LIVE_SCHEME}://${HOST}:${PORT}${LIVE_PATH}`;
const LIVE_REQUEST = new Request({
	branch: LIVE_BRANCH,
	host: HOST,
	method: 'GET',
	mode: LIVE_MODE,
	path: LIVE_PATH,
	port: PORT,
	scheme: LIVE_SCHEME,
	url: LIVE_URL
});



const leaSeydouxJpg = libContent.createMedia({
    data: readFileSync(join(__dirname, '../..', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    parentPath: '/',
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});


describe('LibPortal', () => {
	describe('imageUrl', () => {
		it('should throw if neither id nor path is passed', () => {
			// @ts-expect-error
			expect(() => libPortal.imageUrl({
				scale: 'width(500)'
			})).toThrow('lib-portal.imageUrl(): Either id or path must be set!');
		});

		it('should throw when image content not found', () => {
			expect(() => libPortal.imageUrl({
				id: '123',
				scale: 'width(500)'
			})).toThrow('lib-portal.imageUrl(): No imageContent with key:123');
		});

		it('should return an image URL', () => {
			libPortal.request = new Request({
				path: '/mycontent', // This content doesn't actually have to exist.
				repositoryId: REPO_ID,
			});
			expect(libPortal.imageUrl({
				background: 'ff0000',
				filter: 'rounded(5);sharpen()',
				format: 'png',
				id: leaSeydouxJpg._id,
				quality: 80,
				scale: 'width(500)'
			})).toBe('/mycontent/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/width-500/Lea-Seydoux.jpg.png?background=ff0000&filter=rounded%285%29%3Bsharpen%28%29&quality=80');
			expect(libPortal.imageUrl({
				background: 'ff0000',
				filter: 'rounded(5);sharpen()',
				format: 'png',
				id: leaSeydouxJpg._id,
				quality: 80,
				scale: 'width(500)',
				type: 'absolute'
			})).toBe('http://localhost/mycontent/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/width-500/Lea-Seydoux.jpg.png?background=ff0000&filter=rounded%285%29%3Bsharpen%28%29&quality=80');
		});

		it('should handle preview by id under admin', () => {
			libPortal.request = ADMIN_REQUEST;
			expect(libPortal.imageUrl({
				id: leaSeydouxJpg._id,
				scale: 'block(1920,1280)',
			})).toEqual('/admin/site/preview/myproject/draft/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/block-1920-1280/Lea-Seydoux.jpg');
		});

		it('should handle preview by path under admin', () => {
			libPortal.request = ADMIN_REQUEST;
			expect(libPortal.imageUrl({
				background: 'FFFFFF',
				id: leaSeydouxJpg._path,
				filter: 'rounded(5);sharpen()',
				format: 'png',
				params: {
					key: 'value'
				},
				quality: 100,
				scale: 'full',
				type: 'absolute'
			})).toEqual('http://localhost:8080/admin/site/preview/myproject/draft/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/full/Lea-Seydoux.jpg.png?key=value&background=FFFFFF&filter=rounded%285%29%3Bsharpen%28%29&quality=100');
		});

		it('should handle preview by id outside admin', () => {
			libPortal.request = LIVE_REQUEST;
			expect(libPortal.imageUrl({
				filter: 'blur(3);grayscale()',
				id: leaSeydouxJpg._id,
				scale: 'height(1280)',
			})).toEqual('/site/myproject/master/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/height-1280/Lea-Seydoux.jpg?filter=blur%283%29%3Bgrayscale%28%29');
		});
	}); // describe imageUrl
}); // describe LibPortal
