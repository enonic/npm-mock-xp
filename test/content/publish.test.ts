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
const get = xp.content.get;
const publish = xp.content.publish;
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
	describe('publish', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return publish({
					keys: [folderContent._id],
				});
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.publish\(\): No context\!$/);
		});

		it('is able to publish a folder content', () => {

			run({
				currentApplicationKey: APP,
				branch: 'master',
				repository: REPO,
			}, () => {
				expect(get({ key: folderContent._id })).toBeNull();
			});

			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					repository: REPO,
				},() => {
					return publish({
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

			run({
				currentApplicationKey: APP,
				branch: 'master',
				repository: REPO,
			}, () => {
				expect(get({ key: folderContent._id })).toEqual({
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
