import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const APP = 'com.enonic.app.myapp';
const PROJECT = 'myproject';
const REPO = `com.enonic.cms.${PROJECT}`;


const log = Log.createLogger({
	// loglevel: 'debug'
	loglevel: 'silent'
});

const xp = new JavaBridge({
	app: {
		config: {},
		name: APP,
		version: '0.0.1-SNAPSHOT'
	},
	log
});
const create = xp.content.create;
const move = xp.content.move;
const run = xp.context.run;


xp.repo.create({
    id: REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: REPO
});

const folderContent = run({
	currentApplicationKey: APP,
	branch: 'draft',
	repository: REPO,
},() => {
	return create({
		contentType: 'base:folder',
		data: {},
		name: 'folder',
		parentPath: '/',
	});
});

describe('content', () => {
	describe('move', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return move({
					source: folderContent._id,
					target: '/renamedFolder'
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.move\(\): No context\!$/);
		});

		it('is able to move a folder content', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					repository: REPO,
				},() => {
					return move({
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
