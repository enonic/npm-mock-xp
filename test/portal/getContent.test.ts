import {JavaBridge} from '../../src';
import Log from '../../src/Log';


const log = Log.createLogger({
	loglevel: 'silent'
});

const xp = new JavaBridge({
	app: {
		config: {},
		name: 'com.enonic.app.test',
		version: '0.0.1-SNAPSHOT'
	},
	log
});

const run = xp.context.run;
const getContent = xp.portal.getContent;

xp.repo.create({
	id: 'com.enonic.cms.default'
});

const contentConnection = xp.contentConnect({
	branch: 'master',
	project: 'default'
});

const aContent = contentConnection.create({
	contentType: 'myContentType',
	data: {},
	name: 'myContent',
	parentPath: '/',
});

describe('portal', () => {
	describe('getContent', () => {
		it('should throw when there is context is not found', () => {
			const fn = () => {
				return getContent();
			}
			expect(fn).toThrow('No context');
		});

		it('should throw when no currentContentkey found in run context', () => {
			run({
				branch: 'master',
				repository: 'com.enonic.cms.default',
			},() => {
				const fn = () => {
					return getContent();
				}
				expect(fn).toThrow('No currentContentkey found in mocked run context');
			});
		});

		it('should return the current content', () => {
			run({
				branch: 'master',
				currentContentkey: aContent._id,
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getContent()).toEqual(aContent);
			});
		});

		it("should return null when currentContent isn't found", () => {
			run({
				branch: 'master',
				currentContentkey: 'non-existing-key',
				repository: 'com.enonic.cms.default'
			},() => {
				expect(getContent()).toEqual(null);
			});
		});
	}); // describe getContent
}); // describe portal
