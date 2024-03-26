import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const server = new Server({
	loglevel: 'silent'
});

const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentConnection = server.contentConnect({
				branchId: 'master',
				projectId: 'default'
			});
			it('returns an object which has a exists method', () => {
				expect(hasMethod(contentConnection, 'exists')).toBe(true);
			});
			describe('contentConnection', () => {
				describe('exists', () => {
					const createdContent = contentConnection.create({
						childOrder: 'displayname ASC',
						contentType: CONTENT_TYPE,
						data: {},
						name: 'name',
						parentPath: '/',
					});
					it('returns true when key is an id and content exists', () => {
						expect(contentConnection.exists({ key: createdContent._id })).toBe(true);
					});
					it('returns true when key is a path and content exists', () => {
						expect(contentConnection.exists({ key: createdContent._path })).toBe(true);
					});
					it("returns false when content doesn't exist", () => {
						expect(contentConnection.exists({ key: 'non-existant-id' })).toBe(false);
						expect(contentConnection.exists({ key: '/non-existant-path' })).toBe(false);
					});
				});
			});
		});
	});
});
