import type {SiteConfig} from '@enonic-types/lib-portal';


import {CONTENT_TYPE_PORTAL_SITE} from '../../src/constants';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const log = Log.createLogger({
	// loglevel: 'debug'
	loglevel: 'silent'
});

const xp = new JavaBridge({
	app: {
		config: {},
		name: 'com.enonic.app.test',
		version: '0.0.1-SNAPSHOT'
	},
	log
});

const run = xp.context.run;
const getSiteConfig = xp.portal.getSiteConfig;

xp.repo.create({
	id: 'com.enonic.cms.default'
});

const contentConnection = xp.contentConnect({
	branch: 'master',
	project: 'default'
});

const siteContentWithoutSiteConfigs = contentConnection.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {},
	name: 'mySiteWithoutSiteConfigs',
	parentPath: '/',
});

const myAppSiteConfig: SiteConfig<{
	foo: string
}> = {
	applicationKey: 'com.enonic.app.myApp',
	config: {
		foo: 'bar'
	}
}

const myAnotherAppSiteConfig: SiteConfig<{
	bar: string
}> = {
	applicationKey: 'com.enonic.app.myAnotherApp',
	config: {
		bar: 'foo'
	}
}

const siteContentWithSingleSiteConfig = contentConnection.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {
		siteConfig: myAppSiteConfig
	},
	name: 'mySiteWithSingleSiteConfig',
	parentPath: '/',
});

const siteContentWithMultipleSiteConfigs = contentConnection.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {
		siteConfig: [myAppSiteConfig, myAnotherAppSiteConfig]
	},
	name: 'mySiteWithMultipleSiteConfigs',
	parentPath: '/',
});

describe('portal', () => {
	describe('getSiteConfig', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return getSiteConfig();
			}
			expect(fn).toThrow('No context');
		});

		it('should throw when no currentApplicationKey found in run context', () => {
			run({
				branch: 'master',
				repository: 'com.enonic.cms.default',
			},() => {
				const fn = () => {
					return getSiteConfig();
				}
				expect(fn).toThrow('No currentApplicationKey found in mocked run context');
			});
		});

		it('should throw when no currentContentkey found in run context', () => {
			run({
				branch: 'master',
				currentApplicationKey: 'com.enonic.app.myApp',
				repository: 'com.enonic.cms.default',
			},() => {
				const fn = () => {
					return getSiteConfig();
				}
				expect(fn).toThrow('No currentContentkey found in mocked run context');
			});
		});

		it("should return null when there are no siteConfigs", () => {
			run({
				branch: 'master',
				currentApplicationKey: 'com.enonic.app.myApp',
				currentContentkey: siteContentWithoutSiteConfigs._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSiteConfig()).toEqual(null);
			});
		});

		it("should return the correct site config when the site only has a single siteConfig", () => {
			run({
				branch: 'master',
				currentApplicationKey: 'com.enonic.app.myApp',
				currentContentkey: siteContentWithSingleSiteConfig._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSiteConfig()).toEqual(myAppSiteConfig.config);
			});
		});

		it("should return the correct site config when the site has multiple siteConfigs", () => {
			run({
				branch: 'master',
				currentApplicationKey: 'com.enonic.app.myAnotherApp',
				currentContentkey: siteContentWithMultipleSiteConfigs._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSiteConfig()).toEqual(myAnotherAppSiteConfig.config);
			});
		});

		it("should return null when there is no site config for the currentApplicationKey", () => {
			run({
				branch: 'master',
				currentApplicationKey: 'whatnot',
				currentContentkey: siteContentWithSingleSiteConfig._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSiteConfig()).toEqual(null);
			});
			run({
				branch: 'master',
				currentApplicationKey: 'whatnot',
				currentContentkey: siteContentWithMultipleSiteConfigs._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSiteConfig()).toEqual(null);
			});
		});
	}); // describe getSiteConfig
}); // describe portal
