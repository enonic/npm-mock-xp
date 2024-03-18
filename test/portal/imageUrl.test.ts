import type {ByteSource} from '@enonic-types/core';
import type {Request} from '../../src/types';


import {readFileSync } from 'fs';
import {join} from 'path';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP = 'com.enonic.app.myapp';
const PROJECT = 'myproject';
const REPO = `com.enonic.cms.${PROJECT}`;

const HOST = 'localhost';
const PORT = 8080;
const PATH = '/some/path';

const ADMIN_BRANCH = 'draft';
const ADMIN_MODE = 'preview';
const ADMIN_SCHEME = 'http';
const ADMIN_PREVIEW_PATH = `/admin/site/${ADMIN_MODE}/${PROJECT}/${ADMIN_BRANCH}${PATH}`;
const ADMIN_PREVIEW_URL = `${ADMIN_SCHEME}://${HOST}:${PORT}${ADMIN_PREVIEW_PATH}`;
const ADMIN_REQUEST: Request = {
	branch: ADMIN_BRANCH,
	host: HOST,
	method: 'GET',
	mode: ADMIN_MODE,
	path: ADMIN_PREVIEW_PATH,
	port: PORT,
	scheme: ADMIN_SCHEME,
	url: ADMIN_PREVIEW_URL
};

const LIVE_BRANCH = 'master';
const LIVE_MODE = 'live';
const LIVE_SCHEME = 'https';
const LIVE_PATH = `/site/${PROJECT}/${LIVE_BRANCH}${PATH}`;
const LIVE_URL = `${LIVE_SCHEME}://${HOST}:${PORT}${LIVE_PATH}`;
const LIVE_REQUEST: Request = {
	branch: LIVE_BRANCH,
	host: HOST,
	method: 'GET',
	mode: LIVE_MODE,
	path: LIVE_PATH,
	port: PORT,
	scheme: LIVE_SCHEME,
	url: LIVE_URL
}

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
const run = xp.context.run;
const imageUrl = xp.portal.imageUrl;


xp.repo.create({
    id: REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: REPO
});

const contentDraftConnection = xp.contentConnect({
    branch: 'draft',
    project: PROJECT,
});

const leaSeydouxJpg = contentDraftConnection.createMedia({
    data: readFileSync(join(__dirname, '..', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    parentPath: '/',
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});


describe('portal', () => {
	describe('imageUrl', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return imageUrl({
					id: '123',
					scale: 'width(500)'
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-portal.imageUrl\(\): No context\!/);
		});

		it('should throw when there is request in the context', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					repository: REPO,
				},() => {
					return imageUrl({
						id: '123',
						scale: 'width(500)'
					});
				});
			}
			expect(fn).toThrow(/mock-xp: lib-portal.imageUrl\(\): No context.request\! Support for imageUrl outside portal is not yet implemented./);
		});

		it('should throw when id or path is missing from the params', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					// @ts-expect-error
					return imageUrl({
						scale: 'width(500)'
					});
				});
			}
			expect(fn).toThrow(/^lib-portal.imageUrl\(\): Either id or path must be set!$/);
		});

		it('should throw when image content not found', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					return imageUrl({
						id: '123',
						scale: 'width(500)'
					});
				});
			}
			// expect(fn).toThrow(/^contentConnect: No repo with id/);
			expect(fn).toThrow(/^lib-portal.imageUrl\(\): No imageContent with key:123$/);
		});

		it('should handle preview by id inside Content Studio', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					return imageUrl({
						id: leaSeydouxJpg._id,
						scale: 'block(1920,1280)',
					});
				});
			}
			expect(fn()).toEqual('/admin/site/preview/myproject/draft/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/block-1920-1280/Lea-Seydoux.jpg');
		});

		it('should handle preview by path inside Content Studio', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					return imageUrl({
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
					});
				});
			}
			expect(fn()).toEqual('http://localhost:8080/admin/site/preview/myproject/draft/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/full/Lea-Seydoux.jpg.png?key=value&background=FFFFFF&filter=rounded%285%29%3Bsharpen%28%29&quality=100');
		});

		it('should handle preview by id outside Content Studio', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					request: LIVE_REQUEST,
					repository: REPO,
				},() => {
					return imageUrl({
						filter: 'blur(3);grayscale()',
						id: leaSeydouxJpg._id,
						scale: 'height(1280)',
					});
				});
			}
			expect(fn()).toEqual('/site/myproject/master/some/path/_/image/00000000-0000-4000-8000-000000000004:0123456789abcdef/height-1280/Lea-Seydoux.jpg?filter=blur%283%29%3Bgrayscale%28%29');
		});
	}); // describe imageUrl
}); // describe portal
