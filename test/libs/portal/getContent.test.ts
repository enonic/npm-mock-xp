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


describe('LibPortal', () => {
	describe('getContent', () => {
		it('should throw if no request is set', () => {
			libPortal.request = undefined;
			expect(() => libPortal.getContent()).toThrow('mock-xp: Portal.getContent(): Unable to determine current contentId as there is no request set on the Portal object instance!');
		});

		it('should return null if no content is found', () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: '/non-existent'
			});
			expect(libPortal.getContent()).toBe(null);
		});

		it('should return the root content', () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: '/'
			});
			expect(libPortal.getContent()).toStrictEqual({
				_id: '00000000-0000-4000-8000-000000000002',
				_name: 'content',
				_path: '',
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: undefined,
				creator: undefined,
				data: undefined,
				displayName: 'Content',
				hasChildren: true,
				owner: undefined,
				publish: {},
				type: 'base:folder',
				valid: false,
				x: {},
			});
		});

		it('should return content if found', () => {
			const content = libContent.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {
					key: 'value'
				},
				name: 'mycontent',
				parentPath: '/',
			});
			libPortal.request = new Request({
				path: '/mycontent',
				repositoryId: REPO_ID,
			});
			expect(libPortal.getContent()).toStrictEqual(content);
		});
	}); // describe getContent
}); // describe portal
