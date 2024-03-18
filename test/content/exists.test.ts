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
const exists = xp.content.exists;
const run = xp.context.run;


xp.repo.create({
    id: REPO
});

xp.repo.createBranch({
    branchId: 'draft',
    repoId: REPO
});

run({
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
	describe('exists', () => {
		it('should throw when there is no context', () => {
			const fn = () => {
				return exists({ key: '00000000-0000-4000-8000-000000000004' });
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.exists\(\): No context\!$/);
		});

		it('returns true for an existing content', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					repository: REPO,
				},() => {
					return exists({ key: '00000000-0000-4000-8000-000000000004' });
				});
			}
			expect(fn()).toBe(true);
		});

		it('returns false for a non-existent content', () => {
			const fn = () => {
				return run({
					currentApplicationKey: APP,
					branch: 'draft',
					repository: REPO,
				},() => {
					return exists({ key: 'non-existent' });
				});
			}
			expect(fn()).toBe(false);
		});
	}); // describe exists
}); // describe content
