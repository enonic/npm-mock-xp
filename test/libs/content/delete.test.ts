import {
	// App,
	LibContent,
	LibContext,
	Server
} from '../../../src';


const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;


const server = new Server({
	// loglevel: 'debug'
	loglevel: 'error'
	// loglevel: 'silent'
})
	.createProject({
		projectName: PROJECT_NAME,
	})
	.setContext({
		projectName: PROJECT_NAME,
	});

const libContent = new LibContent({
	server
});

const libContext = new LibContext({
	server
});

libContent.create({
	contentType: 'base:folder',
	data: {},
	name: 'folder',
	parentPath: '/',
});

describe('content', () => {
	describe('delete', () => {
		it('is able to delete a folder content', () => {
			return libContext.run({
				branch: 'draft',
				repository: REPO_ID,
			},() => {
				expect(libContent.delete({ key: '00000000-0000-4000-8000-000000000004' })).toBe(true);
				expect(libContent.get({ key: '00000000-0000-4000-8000-000000000004' })).toBe(null);
			});
		});
	}); // describe delete
}); // describe content
