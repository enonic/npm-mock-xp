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
const _delete = xp.content.delete;
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
	describe('delete', () => {
		it('should throw when there is no context', () => {
			const fn = () => {
				return _delete({ key: '00000000-0000-4000-8000-000000000004' });
			}
			expect(fn).toThrow(/^mock-xp: lib-content\.delete\(\): No context\!$/);
		});

		it('is able to delete a folder content', () => {
			return run({
				currentApplicationKey: APP,
				branch: 'draft',
				repository: REPO,
			},() => {
				expect(_delete({ key: '00000000-0000-4000-8000-000000000004' })).toBe(true);
				expect(get({ key: '00000000-0000-4000-8000-000000000004' })).toBe(null);
			});
		});
	}); // describe delete
}); // describe content
