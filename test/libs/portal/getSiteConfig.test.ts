import type {SiteConfig} from '@enonic-types/lib-portal';


import {CONTENT_TYPE_PORTAL_SITE} from '../../../src/constants';
import {
	App,
	LibContent,
	LibPortal,
	Request,
	Server,
} from '../../../src';


const APP_KEY1 = 'com.example.myapp';
const APP_KEY2 = 'com.example.myanotherapp';
const APP_KEY3 = 'com.example.whatnot';
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

const app1 = new App({
	key: APP_KEY1
});

const app2 = new App({
	key: APP_KEY2
});

const app3 = new App({
	key: APP_KEY3
});

const libContent = new LibContent({
	server,
});

const libPortal1 = new LibPortal({
	app: app1,
	server,
});

const libPortal2 = new LibPortal({
	app: app2,
	server,
});

const libPortal3 = new LibPortal({
	app: app3,
	server,
});


const siteContentWithoutSiteConfigs = libContent.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {},
	name: 'mySiteWithoutSiteConfigs',
	parentPath: '/',
});

const myAppSiteConfig: SiteConfig<{
	foo: string
}> = {
	applicationKey: APP_KEY1,
	config: {
		foo: 'bar'
	}
}

const myAnotherAppSiteConfig: SiteConfig<{
	bar: string
}> = {
	applicationKey: APP_KEY2,
	config: {
		bar: 'foo'
	}
}

const siteContentWithSingleSiteConfig = libContent.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {
		siteConfig: myAppSiteConfig
	},
	name: 'mySiteWithSingleSiteConfig',
	parentPath: '/',
});

const siteContentWithMultipleSiteConfigs = libContent.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {
		siteConfig: [myAppSiteConfig, myAnotherAppSiteConfig]
	},
	name: 'mySiteWithMultipleSiteConfigs',
	parentPath: '/',
});

describe('portal', () => {
	describe('getSiteConfig', () => {
		it('should throw if no request is set', () => {
			libPortal1.request = undefined;
			expect(() => libPortal1.getSiteConfig()).toThrow('mock-xp: Portal.getSiteConfig(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		});

		it("should return null when there are no siteConfigs", () => {
			libPortal1.request = new Request({
				repositoryId: REPO_ID,
				path: siteContentWithoutSiteConfigs._path
			});
			expect(libPortal1.getSiteConfig()).toEqual(null);
		});

		it("should return the correct site config when the site only has a single siteConfig", () => {
			libPortal1.request = new Request({
				repositoryId: REPO_ID,
				path: siteContentWithSingleSiteConfig._path
			});
			expect(libPortal1.getSiteConfig()).toEqual(myAppSiteConfig.config);
		});

		it("should return the correct site config when the site has multiple siteConfigs", () => {
			libPortal2.request = new Request({
				repositoryId: REPO_ID,
				path: siteContentWithMultipleSiteConfigs._path
			});
			expect(libPortal2.getSiteConfig()).toEqual(myAnotherAppSiteConfig.config);
		});

		it("should return null when there is no site config for the specified application", () => {
			libPortal3.request = new Request({
				repositoryId: REPO_ID,
				path: siteContentWithSingleSiteConfig._path
			});
			expect(libPortal3.getSiteConfig()).toEqual(null);

			libPortal3.request = new Request({
				repositoryId: REPO_ID,
				path: siteContentWithMultipleSiteConfigs._path
			});
			expect(libPortal3.getSiteConfig()).toEqual(null);
		});
	}); // describe getSiteConfig
}); // describe portal
