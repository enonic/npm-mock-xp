import {JavaBridge} from '../../src';
import Log from '../../src/Log';
import {
	CONTENT_TYPE_BASE_FOLDER,
	CONTENT_TYPE_PORTAL_SITE,
} from '../../src/constants';


const log = Log.createLogger({
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
const getSite = xp.portal.getSite;

xp.repo.create({
	id: 'com.enonic.cms.default'
});

const contentConnection = xp.contentConnect({
	branch: 'master',
	project: 'default'
});

const siteContent = contentConnection.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {},
	name: 'mySite',
	parentPath: '/',
});

const folderOutsideSiteContent = contentConnection.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'folderOutsideSite',
	parentPath: '/',
});

const folderInSiteContent = contentConnection.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'folderInSite',
	parentPath: siteContent._path,
});

const nestedFolderInSiteContent = contentConnection.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'nestedFolderInSite',
	parentPath: folderInSiteContent._path,
});

describe('portal', () => {
	describe('getSite', () => {
		it('should throw when there is no context', () => {
			const fn = () => {
				return getSite();
			}
			expect(fn).toThrow('No context');
		});

		it('should throw when no currentContentkey found in run context', () => {
			run({
				branch: 'master',
				repository: 'com.enonic.cms.default',
			},() => {
				const fn = () => {
					return getSite();
				}
				expect(fn).toThrow('No currentContentkey found in mocked run context');
			});
		});

		it("should return the current content when it's a site", () => {
			run({
				branch: 'master',
				currentContentkey: siteContent._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSite()).toEqual(siteContent);
			});
		});

		it("should return null when there is no site connected to the currentContent", () => {
			run({
				branch: 'master',
				currentContentkey: folderOutsideSiteContent._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSite()).toEqual(null);
			});
		});

		it('should return the closest site', () => {
			run({
				branch: 'master',
				currentContentkey: nestedFolderInSiteContent._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getSite()).toEqual(siteContent);
			});
		});
	});
});
