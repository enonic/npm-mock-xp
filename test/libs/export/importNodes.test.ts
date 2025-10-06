import { RepoConnection } from 'src/types';
import {
	LibExport,
	LibNode,
	LibRepo,
	Server
} from '../../../src';
import { resolve } from 'path';

// const SANDBOX_NAME = 'mysandbox';
const SOURCE = 'myexport';
const ABS_PATH_SOURCE_ZIP = resolve(
	__dirname,
	'com.enonic.cms.my-project-draft-2025-10-06T14-27-50.zip'
);
const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;

let
	connection: RepoConnection,
	libExport: LibExport,
	libNode: LibNode,
	libRepo: LibRepo,
	server: Server;


describe('LibExport', () => {

	beforeAll(done => {
		server = new Server({
			loglevel: 'debug'
			// loglevel: 'error'
			// loglevel: 'silent'
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

		connection = libNode.connect({
			branch: 'draft',
			repoId: REPO_ID
		});

		// console.debug(connection.query({}));

		libExport = new LibExport({
			// sandboxName: SANDBOX_NAME,
			server
		});
		done();
	}); // beforeAll

	describe('importNodes', () => {
		// This test must be skipped because it depends on a local sandbox...
		it.skip(`source: ${SOURCE}`, () => {
			const ImportNodesResult = libExport.importNodes({
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
			expect(ImportNodesResult.addedNodes.length).toBe(8);
			expect(ImportNodesResult.updatedNodes).toStrictEqual([
				'00000000-0000-0000-0000-000000000000'
			]);
			expect(ImportNodesResult.importedBinaries).toStrictEqual([]);
			expect(ImportNodesResult.importErrors).toStrictEqual([{
					exception: '',
					message: '',
					stacktrace: [],
				}]);
		});

		it(`source: ${ABS_PATH_SOURCE_ZIP}`, () => {
			const ImportNodesResult = libExport.importNodes({
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
			expect(ImportNodesResult.addedNodes.length).toBe(8);
			expect(ImportNodesResult.addedNodes).toStrictEqual([
				'2f9d32c6-387f-4d3e-aceb-5976b207cc4b',
				'7212bb0d-6a0f-48a1-a85f-cc856817aebe',
				'ba727b82-813e-416e-9d11-30a9c60399d9',
				'9f6c6353-da7b-42da-9300-64be10f7ba0c',
				'4f62c049-4995-4db7-87e4-364d582943ef',
				'acc48303-8144-43b1-b69f-d5dcfe935b67',
				'c61f74a2-7cc4-4160-b037-ed3f581dfb71',
				'45cc4b1a-343c-4636-ae8f-15cd977d3b77'
			]);
			expect(ImportNodesResult.updatedNodes).toStrictEqual([
				'00000000-0000-0000-0000-000000000000'
			]);
			expect(ImportNodesResult.importedBinaries).toStrictEqual([]);
			expect(ImportNodesResult.importErrors).toStrictEqual([{
					exception: '',
					message: '',
					stacktrace: [],
				}]);
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
