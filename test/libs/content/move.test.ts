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
	describe('move', () => {
		it('is able to move a folder content', () => {
			const fn = () => {
				return libContext.run({
					branch: 'draft',
					repository: REPO_ID,
				},() => {
					return libContent.move({
						source: folderContent._id,
						target: '/renamedFolder'
					});
				});
			}
			expect(fn()).toEqual({
				_id: '00000000-0000-4000-8000-000000000004',
				_name: 'renamedFolder',
				_path: '/renamedFolder',
				attachments: {},
				childOrder: undefined,
				createdTime: expect.any(String) as unknown as string,
				creator: 'user:system:su',
				data: {},
				displayName: 'renamedFolder', // TODO: should be 'folder'?
				hasChildren: true,
				modifiedTime: expect.any(String) as unknown as string,
				modifier: 'user:system:su',
				owner: 'user:system:su',
				publish: {},
				type: 'base:folder',
				valid: true,
				x: {},
			});
		});
	}); // describe move
}); // describe content
