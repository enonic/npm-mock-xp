import {
	App,
	LibContent,
	LibPortal,
	Request,
	Server,
} from '../../../src';
import {
	CONTENT_TYPE_BASE_FOLDER,
	CONTENT_TYPE_PORTAL_SITE,
} from '../../../src/constants';


const APP = 'com.example.myapp';
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
	key: APP
});

const libContent = new LibContent({
	server,
});

const libPortal = new LibPortal({
	app,
	server,
});

const siteContent = libContent.create({
	contentType: CONTENT_TYPE_PORTAL_SITE,
	data: {},
	name: 'mySite',
	parentPath: '/',
});

const folderOutsideSiteContent = libContent.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'folderOutsideSite',
	parentPath: '/',
});

const folderInSiteContent = libContent.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'folderInSite',
	parentPath: siteContent._path,
});

const nestedFolderInSiteContent = libContent.create({
	contentType: CONTENT_TYPE_BASE_FOLDER,
	data: {},
	name: 'nestedFolderInSite',
	parentPath: folderInSiteContent._path,
});


describe('portal', () => {
	describe('getSite', () => {
		it('should throw if no request is set', () => {
			libPortal.request = undefined;
			expect(() => libPortal.getSite()).toThrow('mock-xp: Portal.getSite(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		});

		it("should return the current content when it's a site", () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: siteContent._path
			});
			expect(libPortal.getSite()).toEqual(siteContent);
		});

		it("should return null when there is no site connected to the currentContent", () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: folderOutsideSiteContent._path
			});
			expect(libPortal.getSite()).toEqual(null);
		});

		it('should return the closest site', () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: nestedFolderInSiteContent._path
			});
			expect(libPortal.getSite()).toEqual(siteContent);
		});
	});
});
