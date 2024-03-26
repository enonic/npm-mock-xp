import {
	App,
	LibContext,
	LibContent,
	LibPortal,
	Request,
	Server,
} from '../../../src';

const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;
const APP = 'com.example.myapp';

const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
}).createProject({
	projectName: PROJECT_NAME,
}).setContext({
	projectName: PROJECT_NAME,
});

const app = new App({
	key: APP
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


describe('LibPortal', () => {
	describe('assetUrl', () => {
		it('should throw if no request is set', () => {
			expect(() => libPortal.assetUrl({path: '/'})).toThrow('mock-xp: Portal.assetUrl(): No request set on the Portal object instance!');
		});

		it('should return an asset URL', () => {
			libPortal.request = new Request({path: '/what/ever/'});
			expect(libPortal.assetUrl({path: '/images/asset.png'}))
				.toBe('/what/ever/_/asset/com.example.myapp:0123456789abcdef/images/asset.png');
		});

		it('should return an asset URL', () => {
			libPortal.request = new Request({path: '/'});
			expect(libPortal.assetUrl({
				path: '/images/asset.png',
				type: 'absolute'
			}))
				.toBe('http://localhost/_/asset/com.example.myapp:0123456789abcdef/images/asset.png');
		});

		it('should handle preview under admin', () => {
			libPortal.request = ADMIN_REQUEST;
			expect(libPortal.assetUrl({
				params: {
					key: 'value'
				},
				path: '/images/asset.png',
			}))
				.toBe('/admin/site/preview/myproject/draft/some/path/_/asset/com.example.myapp:0123456789abcdef/images/asset.png?key=value');
		});

		it('should handle preview under admin with type absolute', () => {
			libPortal.request = ADMIN_REQUEST;
			expect(libPortal.assetUrl({
				params: {
					key: 'value'
				},
				path: '/images/asset.png',
				type: 'absolute'
			}))
				.toBe('http://localhost:8080/admin/site/preview/myproject/draft/some/path/_/asset/com.example.myapp:0123456789abcdef/images/asset.png?key=value');
		});

		it('should handle live url outside admin', () => {
			libPortal.request = LIVE_REQUEST;
			expect(libPortal.assetUrl({
				params: {
					key: 'value'
				},
				path: '/images/asset.png',
			}))
				.toBe('/site/myproject/master/some/path/_/asset/com.example.myapp:0123456789abcdef/images/asset.png?key=value');
		});

		it('should handle live url outside admin with type absolute', () => {
			libPortal.request = LIVE_REQUEST;
			expect(libPortal.assetUrl({
				params: {
					key: 'value'
				},
				path: '/images/asset.png',
				type: 'absolute'
			}))
				.toBe('https://localhost:8080/site/myproject/master/some/path/_/asset/com.example.myapp:0123456789abcdef/images/asset.png?key=value');
		});
	}); // describe assetUrl
}); // describe LibPortal
