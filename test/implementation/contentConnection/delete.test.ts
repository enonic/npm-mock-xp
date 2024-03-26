import {Server} from '../../../src';


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
			describe('contentConnection', () => {
				describe('delete', () => {
					it('deletes content', () => {
						const createdContent = contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'name',
							parentPath: '/',
						});
						expect(contentConnection.delete({
							key: createdContent._id
						})).toBe(true);
						expect(contentConnection.get({
							key: createdContent._id
						})).toBe(null);
					});
				});
			});
		});
	});
});
