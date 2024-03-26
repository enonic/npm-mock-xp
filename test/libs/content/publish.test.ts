import {
	LibContent,
	LibContext,
	Server
} from '../../../src';


const APP = 'com.enonic.app.myapp';
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

const folderContent = libContext.run({
	branch: 'draft',
	repository: REPO_ID,
},() => {
	return libContent.create({
		contentType: 'base:folder',
		data: {},
		name: 'folder',
		parentPath: '/',
	});
});

describe('content', () => {
	describe('publish', () => {
		it('is able to publish a folder content', () => {
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.get({ key: folderContent._id })).toBeNull();
			});

			const fn = () => {
				return libContext.run({
					branch: 'draft',
					repository: REPO_ID,
				},() => {
					return libContent.publish({
						keys: [folderContent._id],
					});
				});
			}
			expect(fn()).toEqual({
				"deletedContents": [],
				"failedContents": [],
				"pushedContents": [
					folderContent._id,
				],
			});

			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				expect(libContent.get({ key: folderContent._id })).toEqual({
					_id: '00000000-0000-4000-8000-000000000004',
					_name: 'folder',
					_path: '/folder',
					attachments: {},
					childOrder: undefined,
					createdTime: expect.any(String) as unknown as string,
					creator: 'user:system:su',
					data: {},
					displayName: 'folder',
					hasChildren: true,
					owner: 'user:system:su',
					publish: {},
					type: 'base:folder',
					valid: true,
					x: {},
				});
			});
		});
	}); // describe publish
}); // describe content
