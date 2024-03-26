import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;


const server = new Server({
	loglevel: 'silent'
});


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
			it('returns an object which has a get method', () => {
				expect(hasMethod(contentConnection, 'get')).toBe(true);
			});
			describe('contentConnection', () => {
				const createdContent = contentConnection.create({
					childOrder: 'displayname ASC',
					contentType: CONTENT_TYPE,
					data: {},
					name: 'name',
					parentPath: '/',
				});
				describe('get', () => {
					it("return null when content don't exist", () => {
						expect(contentConnection.get({key: 'myKey'})).toEqual(null);
					});
					it("return the content when key is an id", () => {
						expect(contentConnection.get({key: createdContent._id})).toStrictEqual(createdContent);
					});
					it("return the content when key is a path", () => {
						expect(contentConnection.get({key: createdContent._path})).toStrictEqual(createdContent);
					});
				});
			});
		});
	});
});
