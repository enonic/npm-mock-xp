import type {Request} from '../../src/types';


import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP1 = 'com.enonic.app.myapp1';
const APP2 = 'com.enonic.app.myapp2';
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
		name: APP1,
		version: '0.0.1-SNAPSHOT'
	},
	log
});

const run = xp.context.run;
const assetUrl = xp.portal.assetUrl;


describe('portal', () => {
	describe('assetUrl', () => {
		it('should throw when there is no context', () => {
			const fn = () => {
				return assetUrl({
					application: APP2,
					path: '/images/asset.png',
					params: {
						key: 'value'
					},
					type: 'absolute'
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-portal.assetUrl\(\): No context\!/);
		});

		it('should throw when there is request in the context', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP1,
					branch: 'draft',
					repository: REPO,
				},() => {
					return assetUrl({
						application: APP2,
						path: '/images/asset.png',
						params: {
							key: 'value'
						},
						type: 'absolute'
					});
				});
			}
			expect(fn).toThrow(/mock-xp: lib-portal.assetUrl\(\): No context.request\! Support for assetUrl outside portal is not yet implemented./);
		});

		it('should handle preview under admin', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP1,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					return assetUrl({
						path: '/images/asset.png',
						params: {
							key: 'value'
						},
					});
				});
			}
			expect(fn()).toEqual('/admin/site/preview/myproject/draft/some/path/_/asset/com.enonic.app.myapp1:0123456789abcdef//images/asset.png?key=value');
		});

		it('should handle preview under admin with type absolute', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP1,
					branch: 'draft',
					request: ADMIN_REQUEST,
					repository: REPO,
				},() => {
					return assetUrl({
						application: APP2,
						path: '/images/asset.png',
						params: {
							key: 'value'
						},
						type: 'absolute'
					});
				});
			}
			expect(fn()).toEqual('http://localhost:8080/admin/site/preview/myproject/draft/some/path/_/asset/com.enonic.app.myapp2:0123456789abcdef//images/asset.png?key=value');
		});

		it('should handle live url outside admin', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP1,
					branch: 'draft',
					request: LIVE_REQUEST,
					repository: REPO,
				},() => {
					return assetUrl({
						path: '/images/asset.png',
						params: {
							key: 'value'
						},
					});
				});
			}
			expect(fn()).toEqual('/site/myproject/master/some/path/_/asset/com.enonic.app.myapp1:0123456789abcdef//images/asset.png?key=value');
		});

		it('should handle live url outside admin with type absolute', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP1,
					branch: 'draft',
					request: LIVE_REQUEST,
					repository: REPO,
				},() => {
					return assetUrl({
						application: APP2,
						path: '/images/asset.png',
						params: {
							key: 'value'
						},
						type: 'absolute'
					});
				});
			}
			expect(fn()).toEqual('https://localhost:8080/site/myproject/master/some/path/_/asset/com.enonic.app.myapp2:0123456789abcdef//images/asset.png?key=value');
		});
	});
});
