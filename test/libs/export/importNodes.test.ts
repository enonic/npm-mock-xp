import { RepoConnection } from 'src/types';
import {
	LibExport,
	LibNode,
	LibRepo,
	Server
} from '../../../src';

const SANDBOX_NAME = 'mysandbox';
const SOURCE = 'myexport';
const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;
const ADDED_COUNT = 98;

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
			sandboxName: SANDBOX_NAME,
			server
		});
		done();
	}); // beforeAll

	describe('importNodes', () => {
		it(`source: ${SOURCE}`, () => {
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
			expect(ImportNodesResult.addedNodes.length).toBe(ADDED_COUNT);
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

		it('source: non-existant', () => {
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
