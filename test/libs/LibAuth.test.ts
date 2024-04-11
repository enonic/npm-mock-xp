import {
	LibAuth,
	Server
} from '../../src';


let server, libAuth, group, role, user;


describe('LibAuth', () => {

	beforeAll(done => {
		server = new Server({
			// loglevel: 'debug'
			// loglevel: 'error'
			loglevel: 'silent'
		});

		libAuth = new LibAuth({
			server
		});

		group = libAuth.createGroup({
			name: 'groupName',
			displayName: 'Group Name',
			description: 'Group Description',
			idProvider: 'system'
		});

		role = libAuth.createRole({
			name: 'roleName',
			displayName: 'Role Name',
			description: 'Role Description'
		});

		user = libAuth.createUser({
			name: 'userName',
			displayName: 'User Name',
			email: 'user@example.com',
			idProvider: 'system',
		});
		done();
	}); // beforeAll

	describe('createGroup', () => {
		it('should create a group', () => {
			expect(group).toBeDefined();
			expect(group.key).toBe('group:system:groupName');
			expect(group.displayName).toBe('Group Name');
			expect(group.description).toBe('Group Description');
		});
	});

	describe('createRole', () => {
		it('should create a role', () => {
			expect(role).toBeDefined();
			expect(role.key).toBe('role:roleName');
			expect(role.displayName).toBe('Role Name');
			expect(role.description).toBe('Role Description');
		});
	});

	describe('createUser', () => {
		it('should create a user', () => {
			expect(user).toBeDefined();
			expect(user.key).toBe('user:system:userName');
			expect(user.displayName).toBe('User Name');
			expect(user.email).toBe('user@example.com');
		});
	});

	describe('getPrincipal', () => {
		it('should get a group by key', () => {
			const principal = libAuth.getPrincipal(group.key);
			expect(principal).toEqual(group);
		});
		it('should get a role by key', () => {
			const principal = libAuth.getPrincipal(role.key);
			expect(principal).toEqual(role);
		});
		it('should get a user by key', () => {
			const principal = libAuth.getPrincipal(user.key);
			expect(principal).toEqual(user);
		});
	}); // describe getPrincipal

	describe('login', () => {
		it('should login when user exist and password is correct', () => {
			expect(server.userKey).toBeUndefined();
			const loginResult = libAuth.login({
				user: user.login,
				// password: '',
				// skipAuth,
				// idProvider: user.idProvider,
				// scope: 'SESSION' // REQUEST NONE
				// sessionTimeout
			});
			expect(loginResult).toBeDefined();
			expect(loginResult.authenticated).toBe(true);
			expect(loginResult.message).toBe('');
			expect(loginResult.user).toEqual(user);
			expect(server.userKey).toBe(user.key);
		});

		it("should NOT login when user doesn't exist", () => {
			expect(server.userKey).toBe(user.key);
			const loginResult = libAuth.login({
				user: 'non-existant',
				skipAuth: true
			});
			expect(loginResult).toBeDefined();
			expect(loginResult.authenticated).toBe(false);
			expect(loginResult.message).toBe('Access Denied');
			expect(loginResult.user).toEqual(undefined);
			expect(server.userKey).toBe(user.key);
		});

		it('should NOT login when password is wrong', () => {
			expect(server.userKey).toBe(user.key);
			const loginResult = libAuth.login({
				user: 'su',
				password: 'wrong',
				// skipAuth,
				// idProvider: user.idProvider,
				// scope: 'SESSION' // REQUEST NONE
				// sessionTimeout
			});
			expect(loginResult).toBeDefined();
			expect(loginResult.authenticated).toBe(false);
			expect(loginResult.message).toBe('Access Denied');
			expect(loginResult.user).toEqual(undefined);
			expect(server.userKey).toBe(user.key);
		});
	}); // describe login

	describe('logout', () => {
		it('should logout', () => {
			expect(server.userKey).toBe(user.key);
			libAuth.logout();
			expect(server.userKey).toBeUndefined();
		});
	});

	describe('getProfile', () => {
		it('should return {} for user:system:su', () => {
			const profile = libAuth.getProfile({
				key: 'user:system:su'
			});
			expect(profile).toEqual({});
		});
		it('should return {} when profile is empty and no scope is not passed', () => {
			const profile = libAuth.getProfile({
				key: user.key
			});
			expect(profile).toEqual({});
		});
		it('should return null when profile is empty and scope is passed', () => {
			const profile = libAuth.getProfile({
				key: user.key,
				scope: 'what.ever'
			});
			expect(profile).toBe(null);
		});
	}); // describe getProfile

	describe('getUser', () => {
		// In bun test beforeAll means before all tests, not all tests under current DESCRIBE!
		// beforeAll(done => {
		// 	done();
		// });

		it('should return null when logged out', () => {

			// With bun test this can't be moved to the above beforeAll, yet.
			libAuth.modifyProfile({
				key: user.key,
				editor: (profile) => {
					profile.age = 41;
					return profile;
				}
			});

			libAuth.logout();
			const userWithProfile = libAuth.getUser();
			expect(userWithProfile).toBe(null);
		});

		it('should return user without profile', () => {
			libAuth.login({
				user: user.login
			});
			const userWithProfile = libAuth.getUser({
				includeProfile: false
			});
			expect(userWithProfile).toEqual(user);
		});

		it('should return user with profile', () => {
			libAuth.login({
				user: user.login
			});
			const userWithProfile = libAuth.getUser({
				includeProfile: true
			});
			expect(userWithProfile).toEqual({
				...user,
				profile: {age: 41}
			});
		});
	}); // describe getUser

	describe('modifyProfile', () => {
		it('should modify a user profile', () => {
			const modifiedProfile = libAuth.modifyProfile({
				key: user.key,
				editor: (profile) => {
					profile.age = 42;
					return profile;
				}
			});
			expect(modifiedProfile).toEqual({age: 42});
			const profile = libAuth.getProfile({
				key: user.key,
			});
			expect(profile).toEqual({age: 42});
		});

		it('should modify nested scope', () => {
			const modifiedProfile = libAuth.modifyProfile({
				key: user.key,
				scope: 'what.ever',
				editor: (nestedProfile) => {
					nestedProfile.age = 42;
					return nestedProfile;
				}
			});
			expect(modifiedProfile).toEqual({age: 42});
			const profile = libAuth.getProfile({
				key: user.key,
			});
			expect(profile).toEqual({
				age: 42,
				what: {
					ever: {
						age: 42
					}
				}
			});
		});
	});
}); // describe LibAuth
