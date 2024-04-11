import {
	App,
	ContentConnection,
	RepoConnection,
	Server,
} from '../../src';
import {SYSTEM_REPO} from '../../src/constants';


const REPO_ID = 'com.enonic.myapp';

// const REPO_INFO = {
// 	branches: ['master'],
// 	id: REPO_ID,
// 	settings: {}
// }
const NODE_ID = '00000000-0000-4000-8000-000000000002';
const NODE_VERSION_KEY = '00000000-0000-4000-8000-000000000003';
const NODE_VERSION_KEY_MODIFIED = '00000000-0000-4000-8000-000000000004';
const NODE = {
	_id: NODE_ID,
	_indexConfig: {
		configs: [],
		default: {
		decideByType: true,
		enabled: true,
		fulltext: false,
		includeInAllText: false,
		indexValueProcessors: [],
		languages: [],
		nGram: false,
		path: false,
		},
	},
	_name: NODE_ID,
	_nodeType: 'default',
	_path: `/${NODE_ID}`,
	_state: 'DEFAULT',
	//_ts: expect.any(String) as unknown as string, // bun test doesn't support expect.any
	_versionKey: NODE_VERSION_KEY
};


describe('Server', () => {
	it('should be instantiable without any params', () => {
		const server = new Server({loglevel: 'silent'});
		expect(server).toBeInstanceOf(Server);
	});

	it('should be instantiable with indexWarnings: true', () => {
		const server = new Server({
			loglevel: 'silent',
			indexWarnings: true
		});
		expect(server).toBeInstanceOf(Server);
		expect(server.indexWarnings).toBe(true);
	});

	it('should be instantiable with custom logger', () => {
		const server = new Server({
			log: {
				debug: () => {},
				error: () => {},
				info: () => {},
				warning: () => {}
			}
		});
		expect(server).toBeInstanceOf(Server);
	});

	it('should be instantiable with version', () => {
		const server = new Server({
			loglevel: 'silent',
			version: '7.14.0'
		});
		expect(server).toBeInstanceOf(Server);
		expect(server.version).toBe('7.14.0');
	});

	it('comes with system-repo', () => {
		const server = new Server({loglevel: 'silent'});
		expect(server.getRepo(SYSTEM_REPO)).toBeDefined();
	});

	it('can be used to create a repo', () => {
		const server = new Server({loglevel: 'silent'});
		expect(server.listRepos().length).toStrictEqual(1);
		expect(() => server.getRepo(REPO_ID)).toThrow();

		const repo = server.createRepo({id: REPO_ID}).getRepo(REPO_ID);
		expect(repo.id).toStrictEqual(REPO_ID);
		expect(repo.branches['master']).toBeDefined();
		expect(repo.settings).toStrictEqual({});

		const gottenRepo = server.getRepo(REPO_ID);
		expect(gottenRepo.id).toStrictEqual(REPO_ID);
		expect(gottenRepo.branches['master']).toBeDefined
		expect(gottenRepo.settings).toStrictEqual({});

		expect(server.listRepos().length).toStrictEqual(2);
	});

	it('can be used to create a draft branch', () => {
		const server = new Server({loglevel: 'silent'});
		expect(() => server.createBranch({
			branchId: 'draft',
			repoId: REPO_ID
		})).toThrow();
		server.createRepo({id: REPO_ID});
		const branch = server.createBranch({
			branchId: 'draft',
			repoId: REPO_ID
		});
		expect(branch.id).toStrictEqual('draft');
	});

	describe('connect', () => {
		it('throws an error if no repoId is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.connect({})).toThrow('connect: No repoId provided!');
		});

		it('throws an error if no branchId is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.connect({repoId: REPO_ID})).toThrow('connect: No branchId provided!');
		});

		it('returns a RepoConnection', () => {
			const server = new Server({loglevel: 'silent'});
			server.createRepo({id: REPO_ID});
			const connection = server.connect({
				branchId: 'master',
				repoId: REPO_ID
			});
			expect(connection).toBeInstanceOf(RepoConnection);
		});
	}); // describe connect

	it('can be used to connect and create, exists, get, getActiveVersion, modify and delete a node', () => {
		const server = new Server({
			loglevel: 'silent'
		});
		server.createRepo({id: REPO_ID});
		const connection = new RepoConnection({
			branch: server.repos[REPO_ID].getBranch('master')
		});

		expect(connection.exists(NODE_ID)).toBe(false);
		expect(connection.get(NODE_ID)).toBeUndefined();

		const node = connection.create({});
		expect(node).toStrictEqual({
			...NODE,
			_ts: node._ts
		});
		expect(connection.exists(NODE_ID)).toBe(true);
		expect(connection.get(NODE_ID)).toStrictEqual({
			...NODE,
			_ts: node._ts
		});
		expect(connection.getActiveVersion({key:NODE_ID})).toStrictEqual({
			nodeId: NODE_ID,
			nodePath: `/${NODE_ID}`,
			// timestamp: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			timestamp: node._ts,
			versionId: NODE_VERSION_KEY
		});

		const modifiedNode = connection.modify({
			editor: (node) => {
				node.key = 'value';
				return node;
			},
			key: NODE_ID
		});
		expect(modifiedNode).toStrictEqual({
			...NODE,
			_ts: modifiedNode._ts,
			_versionKey: NODE_VERSION_KEY_MODIFIED,
			key: 'value'
		});
		expect(connection.get(NODE_ID)).toStrictEqual({
			...NODE,
			_ts: modifiedNode._ts,
			_versionKey: NODE_VERSION_KEY_MODIFIED,
			key: 'value'
		});
		expect(connection.getActiveVersion({key:NODE_ID})).toStrictEqual({
			nodeId: NODE_ID,
			nodePath: `/${NODE_ID}`,
			// timestamp: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			timestamp: modifiedNode._ts,
			versionId: NODE_VERSION_KEY_MODIFIED
		});

		expect(connection.delete(NODE_ID)).toStrictEqual([NODE_ID]);
		expect(connection.exists(NODE_ID)).toBe(false);
		expect(connection.get(NODE_ID)).toBeUndefined();
	});

	describe('createProject', () => {
		it('throws an error if no projectName is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.createProject({})).toThrow('Server: createProject: No projectName provided!');
		});

		it('does nothing if project already exists', () => {
			const server = new Server({loglevel: 'silent'}).createProject({projectName: 'myproject'});
			expect(server.createProject({projectName: 'myproject'})).toBeInstanceOf(Server);
		});

		it('is chainable', () => {
			const server = new Server({loglevel: 'silent'});
			const newServer = server.createProject({
				projectName: 'myproject'
			});
			expect(newServer).toBeInstanceOf(Server);
		});
	}); // describe createProject

	describe('contentConnect', () => {
		it('throws an error if no projectId is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.contentConnect({})).toThrow('Server: contentConnect: No projectId provided!');
		});

		it('throws an error if no branchId is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.contentConnect({projectId: REPO_ID})).toThrow('Server: contentConnect: No branchId provided!');
		});

		it('returns a ContentConnection', () => {
			const server = new Server({loglevel: 'silent'}).createProject({
				projectName: 'myproject'
			});
			const connection = server.contentConnect({
				branchId: 'master',
				projectId: 'myproject'
			});
			expect(connection).toBeInstanceOf(ContentConnection);
		});
	}); // describe contentConnect

	describe('getProject', () => {
		it('throws an error if no projectName is provided', () => {
			const server = new Server({loglevel: 'silent'});
			// @ts-expect-error
			expect(() => server.getProject()).toThrow('Server: getProject: No projectName provided!');
		});

		it('throws an error if project does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			expect(() => server.getProject('myproject')).toThrow('Server: getProject: Project myproject not found!');
		});

		it('returns a project', () => {
			const server = new Server({loglevel: 'silent'}).createProject({
				projectName: 'myproject'
			});
			expect(server.getProject('myproject')).toBeDefined();
		});
	}); // describe getProject

	describe('install', () => {
		it('throws an error if version is lower than minSystemVersion', () => {
			const server = new Server({
				loglevel: 'silent',
				version: '7.14.0'
			});
			const app = new App({
				key: 'com.enonic.myapp',
				minSystemVersion: '7.15.0'
			});
			expect(() => server.install(app)).toThrow('System version 7.14.0 is lower than App minSystemVersion 7.15.0!');
		});

		it('throws an error if version is higher than maxSystemVersion', () => {
			const server = new Server({
				loglevel: 'silent',
				version: '7.16.0'
			});
			const app = new App({
				key: 'com.enonic.myapp',
				maxSystemVersion: '7.15.0'
			});
			expect(() => server.install(app)).toThrow('System version 7.16.0 is higher than App maxSystemVersion 7.15.0!');
		});

		it('installs an app if is version is within minSystemVersion and maxSystemVersion', () => {
			const server = new Server({
				loglevel: 'silent',
				version: '7.15.0'
			});
			const app = new App({
				key: 'com.enonic.myapp',
				minSystemVersion: '7.14.0',
				maxSystemVersion: '7.16.0'
			});
			expect(server.install(app)).toBeInstanceOf(Server);
		});

		it('replaces an existing app with the same key', () => {
			const server = new Server({
				loglevel: 'silent',
				version: '7.15.0'
			});
			const app = new App({
				key: 'com.enonic.myapp',
				minSystemVersion: '7.14.0',
				maxSystemVersion: '7.16.0'
			});
			server.install(app);
			expect(server.applications.length).toStrictEqual(1);
			expect(server.install(app)).toBeInstanceOf(Server);
			expect(server.applications.length).toStrictEqual(1);
		});
	}); // describe install

	describe('login', () => {
		it('logs in a user', () => {
			const server = new Server({loglevel: 'silent'});
			expect(server.userKey).toBeUndefined();
			server.login({
				user: 'su'
			});
			expect(server.userKey).toBe('user:system:su');
		});
	}); // describe login

	describe('logout', () => {
		it('logs out a user', () => {
			const server = new Server({loglevel: 'silent'}).login({
				user: 'su'
			});
			expect(server.userKey).toBe('user:system:su');
			server.logout();
			expect(server.userKey).toBeUndefined();
		});
	}); // describe logout

	describe('setContext', () => {
		it('sets context', () => {
			const server = new Server({loglevel: 'silent'});
			expect(server.context.attributes).toEqual({});
			expect(server.context.branch).toBe('master');
			expect(server.context.principals).toEqual([
				'user:system:anonymous',
				'role:system.everyone'
			]);
			expect(server.context.repository).toBe('system-repo');
			expect(server.context.user).toBeUndefined();
			server.setContext({
				attributes: {
					key: 'value'
				},
				login: 'su',
				projectName: 'myproject',
			});
			expect(server.context.attributes).toEqual({
				key: 'value'
			});
			expect(server.context.branch).toBe('draft');
			expect(server.context.principals).toEqual([
				'role:system.admin',
				'role:system.everyone',
				'user:system:su',
			]);
			expect(server.context.repository).toBe('com.enonic.cms.myproject');
			expect(server.context.user.key).toBe('user:system:su');
		});

		it('sets context with loggedin user, if user is not passed', () => {
			const server = new Server({loglevel: 'silent'}).su().createUser({
					displayName: 'My User',
					email: 'myuser@example.com',
					name: 'myuser',
					password: 'mypassword'
				}).login({
					user: 'myuser',
					password: 'mypassword'
				}).setContext({
					principals: ['role:system.admin'],
				});
				expect(server.context.user.key).toEqual('user:system:myuser');
		});
	}); // describe setContext
}); // describe Server
