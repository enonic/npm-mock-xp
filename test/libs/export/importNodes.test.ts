
import { Component } from '@enonic-types/core';
import { Site, SiteConfig } from '@enonic-types/lib-content';
import { RepoConnection } from '@enonic-types/lib-node';
import {
	LibExport,
	LibNode,
	LibRepo,
	Server
} from '../../../src';
import { resolve } from 'path';

// const SANDBOX_NAME = 'mysandbox';
const SOURCE = 'com.enonic.cms.my-project-draft-2025-10-16T16-16-14';
const ABS_PATH_SOURCE_ZIP = resolve(
	__dirname,
	`${SOURCE}.zip`
);
const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;
const SITE_NAME = 'my-site';

let
	draftNodeConnection: RepoConnection,
	libExport: LibExport,
	libNode: LibNode,
	libRepo: LibRepo,
	server: Server;


describe('LibExport', () => {

	beforeAll(done => {
		server = new Server({
			loglevel: 'debug',
			// loglevel: 'error',
			// loglevel: 'silent',
		}).createProject({
			projectName: PROJECT_NAME,
		}).setContext({
			projectName: PROJECT_NAME,
		});

		libRepo = new LibRepo({
			server
		});

		libNode = new LibNode({
			server
		});

		draftNodeConnection = libNode.connect({
			branch: 'draft',
			repoId: REPO_ID
		});
		// console.debug(draftNodeConnection.query({}));

		libExport = new LibExport({
			// sandboxName: SANDBOX_NAME,
			server
		});
		done();
	}); // beforeAll

	describe('importNodes', () => {
		// This test must be skipped because it depends on a local sandbox...
		it.skip(`source: ${SOURCE}`, () => {
			const importNodesResult = libExport.importNodes({
				includeNodeIds: true,
				includePermissions: true,
				source: SOURCE,
				// NOTE: Commenting in these will log some warnings:
				// targetNodePath: '/',
				// xslt: 'xslt',
				// xsltParams: 'xsltParams',
				// nodeImported: () => {},
				// nodeResolved: () => {},
			});

			// const rootNode = draftNodeConnection.get('/');
			// server.log.debug('rootNode:%s', rootNode);

			// const contentNode = draftNodeConnection.get('/content');
			// server.log.debug('contentNode:%s', contentNode);

			// const siteNode = draftNodeConnection.get<{
			// 	components: Component[],
			// 	data: {
			// 		siteConfig: SiteConfig<{}>[]
			// 	}
			// 	x: Record<string, Record<string, unknown>>; // XpXData
			// }>(`/content/${SITE_NAME}`);
			// server.log.debug('siteNode:%s', siteNode);
			// server.log.debug('siteNode components:%s', siteNode.components);

			// This can have the side-effect of creating the /content node, if it doesn't exist!
			// const draftContentConnection = server.contentConnect({
			// 	branchId: 'draft',
			// 	projectId: PROJECT_NAME
			// });

			// const siteContent = draftContentConnection.get<Site<{}>>({ key: `/${SITE_NAME}` });
			// server.log.debug('siteContent:%s', siteContent);
			// server.log.debug('siteContent page:%s', siteContent.page);

			expect(importNodesResult.addedNodes.length).toBe(10);
			expect(importNodesResult.updatedNodes).toStrictEqual([
				'00000000-0000-0000-0000-000000000000'
			]);
			expect(importNodesResult.importedBinaries).toStrictEqual([]);
			expect(importNodesResult.importErrors).toStrictEqual([{
					exception: '',
					message: '',
					stacktrace: [],
				}]);
		});

		it(`source: ${ABS_PATH_SOURCE_ZIP}`, () => {
			const importNodesResult = libExport.importNodes({
				includeNodeIds: true,
				includePermissions: true,
				source: ABS_PATH_SOURCE_ZIP,
				// NOTE: Commenting in these will log some warnings:
				// targetNodePath: '/',
				// xslt: 'xslt',
				// xsltParams: 'xsltParams',
				// nodeImported: () => {},
				// nodeResolved: () => {},
			});

			// const rootNode = draftNodeConnection.get('/');
			// server.log.debug('rootNode:%s', rootNode);

			// const contentNode = draftNodeConnection.get('/content');
			// server.log.debug('contentNode:%s', contentNode);
			// server.log.debug('contentNode._id:%s', contentNode._id); // 00000000-0000-4000-8000-000000000002
			// server.log.debug('contentNode.data:%s', contentNode.data);
			// server.log.debug('contentNode.form:%s', contentNode.form);

			expect(importNodesResult.addedNodes.length).toBe(10);
			expect(importNodesResult.addedNodes).toStrictEqual([
				'2f9d32c6-387f-4d3e-aceb-5976b207cc4b',
				'7212bb0d-6a0f-48a1-a85f-cc856817aebe',
				'ba727b82-813e-416e-9d11-30a9c60399d9',
				'9f6c6353-da7b-42da-9300-64be10f7ba0c',
				'4f62c049-4995-4db7-87e4-364d582943ef',
				'acc48303-8144-43b1-b69f-d5dcfe935b67',
				'c61f74a2-7cc4-4160-b037-ed3f581dfb71',
				'd2f4c9b3-60c3-47a2-bfba-fb438abaf71b',
				'45cc4b1a-343c-4636-ae8f-15cd977d3b77',
				'446942af-a267-4fd3-a11c-c12e97449c13'
			]);
			expect(importNodesResult.updatedNodes).toStrictEqual([
				'00000000-0000-0000-0000-000000000000'
			]);
			expect(importNodesResult.importedBinaries).toStrictEqual([]);
			expect(importNodesResult.importErrors).toStrictEqual([{
					exception: '',
					message: '',
					stacktrace: [],
				}]);

			const siteNode = draftNodeConnection.get<{
				components: Component[],
				data: {
					siteConfig: SiteConfig<{}>[]
				}
				x: Record<string, Record<string, unknown>>; // XpXData
			}>(`/content/${SITE_NAME}`);
			// server.log.debug('siteNode:%s', siteNode);
			const { components, data, x } = siteNode;
			// server.log.debug('siteNode components:%s', components);

			expect(components[0]).toStrictEqual({
				type: 'page',
				path: '/',
				page: {
					descriptor: 'com.enonic.app.page.html5:html5',
					customized: false,
					config: {
						'com-enonic-app-page-html5': {
							html5: {}
						}
					}
				}
			});

			const { siteConfig } = data;
			expect(siteConfig[0].applicationKey).toStrictEqual('com.enonic.app.robotstxt');
			expect(siteConfig[0].config).toStrictEqual({
				groups: {
					disallow: '*',
					userAgent: '*',
				},
			});
			expect(x).toStrictEqual({
				'com-enonic-app-metafields': {
					'meta-data': {}
				}
			});

			// This can have the side-effect of creating the /content node, if it doesn't exist!
			const draftContentConnection = server.contentConnect({
				branchId: 'draft',
				projectId: PROJECT_NAME
			});

			const siteContent = draftContentConnection.get<Site<{}>>({ key: `/${SITE_NAME}` });
			// server.log.debug('siteContent:%s', siteContent);
			// server.log.debug('siteContent.page:%s', siteContent.page);

			expect(siteContent.page).toStrictEqual({
				descriptor: 'com.enonic.app.page.html5:html5',
				path: '/',
				config: {},
				type: 'page',
				regions: {
					body: {
						components: [
							{
								path: '/body/0',
								text: '<p>Richtext <strong>Bold</strong></p>',
								type: 'text'
							},
							{
								fragment: '446942af-a267-4fd3-a11c-c12e97449c13',
								path: '/body/1',
								type: 'fragment'
							}
						],
						name: 'body'
					}
				}
			});
		});

		// This test must be skipped since it depends on a local sandbox.
		it.skip('source: non-existant', () => {
			function fn() {
				return libExport.importNodes({
					source: 'non-existant',
					targetNodePath: '/'
				});
			}
			expect(fn).toThrow(/importNodes: Export not found at/);
		});
	});
});
