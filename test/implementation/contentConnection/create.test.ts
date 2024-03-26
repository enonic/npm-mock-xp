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
			it('returns an object which has a create method', () => {
				expect(hasMethod(contentConnection, 'create')).toBe(true);
			});
			describe('contentConnection', () => {
				describe('create', () => {
					it('creates content', () => {
						const createdContent = contentConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'name',
							parentPath: '/',
						});
						expect(createdContent).toEqual({
							_id: createdContent._id,
							_name: 'name',
							_path: '/name',
							attachments: {},
							childOrder: 'displayname ASC',
							createdTime: createdContent.createdTime,
							creator: createdContent.creator,
							displayName: 'name',
							hasChildren: true, // TODO: Hardcode
							data: {},
							owner: createdContent.owner,
							publish: {},
							type: CONTENT_TYPE,
							valid: true,
							x: {}
						});
					});
				});
			});
		});
	});
});
