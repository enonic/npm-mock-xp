import {
	describe,
	expect,
	jest,
	test
} from '@jest/globals';
import {JavaBridge} from '../../src';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';


const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;


const log = Log.createLogger({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: APP_NAME,
				version: '0.0.1-SNAPSHOT'
			},
			log,
		});
		javaBridge.repo.create({
			id: 'com.enonic.cms.default'
		});
		javaBridge.repo.createBranch({
			branchId: 'draft',
			repoId: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentDraftConnection = javaBridge.contentConnect({
				branch: 'draft',
				project: 'default'
			});
			const contentMasterConnection = javaBridge.contentConnect({
				branch: 'master',
				project: 'default'
			});
			it('returns an object which has a publish method', () => {
				expect(hasMethod(contentDraftConnection, 'publish')).toBe(true);
				expect(hasMethod(contentMasterConnection, 'publish')).toBe(true);
			});
			describe('contentConnection', () => {
				describe('publish', () => {
					it('throws when branch is not draft', () => {
						const fn = () => contentMasterConnection.publish({
							keys: [
								"doesn't matter in this test"
							],
						});
						expect(fn).toThrow('ContentConnection publish only allowed from the draft branch, got:master');
					});

					it("creates content on master, when it exist on draft, but not on master", () => {
						const createdOnDraftOnlyContent = contentDraftConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'only-on-draft',
							parentPath: '/',
						});
						expect(contentDraftConnection.publish({
							keys: [
								createdOnDraftOnlyContent._id
							],
						})).toStrictEqual({
							deletedContents: [],
							failedContents: [],
							pushedContents: [
								createdOnDraftOnlyContent._id
							],
						});
					});

					it("modifies content on master, when it exist on draft and on master", () => {
						const content = contentDraftConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'created-published-modified-republished',
							parentPath: '/',
						});
						// log.debug('content:%s', content);

						const firstPublishRes = contentDraftConnection.publish({
							keys: [
								content._id
							],
						});
						// log.debug('firstPublishRes:%s', firstPublishRes);

						const contentOnDraftBeforeModify = contentDraftConnection.get({ key: content._id });
						// log.debug('contentOnDraftBeforeModify:%s', contentOnDraftBeforeModify);

						const modifiedContent = contentDraftConnection.modify({
							key: content._id,
							editor: (draftContent) => {
								draftContent.data = {
									modified: true,
								}
								return draftContent;
							}
						});
						// log.debug('modifiedContent:%s', modifiedContent);

						expect(contentDraftConnection.publish({
							keys: [
								content._id
							],
						})).toStrictEqual({
							deletedContents: [],
							failedContents: [],
							pushedContents: [
								content._id
							],
						});

						const contentOnMasterAfterRepublish = contentMasterConnection.get({ key: content._id });
						// log.debug('contentOnMasterAfterRepublish:%s', contentOnMasterAfterRepublish);
						expect(contentOnMasterAfterRepublish).toStrictEqual(modifiedContent);
					});

					it("modifies content on master, when it is moved and renamed on draft", () => {
						const content = contentDraftConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'created-published-renamed-republished',
							parentPath: '/',
						});
						// log.debug('content:%s', content);

						const firstPublishRes = contentDraftConnection.publish({
							keys: [
								content._id
							],
						});
						// log.debug('firstPublishRes:%s', firstPublishRes);

						const contentOnDraftBeforeRename = contentDraftConnection.get({ key: content._id });
						// log.debug('contentOnDraftBeforeRename:%s', contentOnDraftBeforeRename);
						contentDraftConnection.create({
							childOrder: 'displayname ASC',
							contentType: 'base:folder',
							data: {},
							name: 'newFolder',
							parentPath: '/'
						});
						const renamedContent = contentDraftConnection.move({
							source: content._id,
							target: '/newFolder/newName'
						});
						// log.debug('renamedContent:%s', renamedContent);

						expect(contentDraftConnection.publish({
							keys: [
								content._id
							],
						})).toStrictEqual({
							deletedContents: [],
							failedContents: [],
							pushedContents: [
								content._id
							],
						});

						const contentOnMasterAfterRepublish = contentMasterConnection.get({ key: content._id });
						// log.debug('contentOnMasterAfterRepublish:%s', contentOnMasterAfterRepublish);
						expect(contentOnMasterAfterRepublish).toStrictEqual({
							...renamedContent,
							_name: 'newName',
							_path: '/newFolder/newName',
							displayName: 'newName'
						});
					});

					it("returns keys in failedContent that does'nt exist on draft, nor master branch", () => {
						expect(contentDraftConnection.publish({
							keys: [
								'non-existant'
							],
						})).toStrictEqual({
							deletedContents: [],
							failedContents: [
								'non-existant'
							],
							pushedContents: [],
						});
					});

					it("deletes content from master, when it doesn't exist on draft, but it does on master", () => {
						const createdOnMasterOnlyContent = contentMasterConnection.create({
							childOrder: 'displayname ASC',
							contentType: CONTENT_TYPE,
							data: {},
							name: 'only-on-master',
							parentPath: '/',
						});
						// log.debug('createdOnMasterOnlyContent:%s', createdOnMasterOnlyContent);
						expect(contentDraftConnection.publish({
							keys: [
								createdOnMasterOnlyContent._id
							],
						})).toStrictEqual({
							deletedContents: [
								createdOnMasterOnlyContent._id
							],
							failedContents: [],
							pushedContents: [],
						});
					});
				});
			});
		});
	});
});
