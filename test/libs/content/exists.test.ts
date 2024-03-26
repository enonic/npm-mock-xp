import {
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
	describe('exists', () => {
		it('returns true for an existing content', () => {
			const fn = () => {
				return libContext.run({
					branch: 'draft',
					repository: REPO_ID,
				},() => {
					return libContent.exists({ key: '00000000-0000-4000-8000-000000000004' });
				});
			}
			expect(fn()).toBe(true);
		});

		it('returns false for a non-existent content', () => {
			const fn = () => {
				return libContext.run({
					branch: 'draft',
					repository: REPO_ID,
				},() => {
					return libContent.exists({ key: 'non-existent' });
				});
			}
			expect(fn()).toBe(false);
		});
	}); // describe exists
}); // describe content
