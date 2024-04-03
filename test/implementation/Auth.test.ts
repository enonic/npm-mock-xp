import {
	Auth,
	Server
} from '../../src';


describe('Auth', () => {

	describe('getGroupByName', () => {
		it('should throw when group does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			expect(() => auth.getGroupByName({
				name: 'nonexistentgroup'
			})).toThrow('Group with name:nonexistentgroup not found!');
		});
	}); // describe getGroupByName

	describe('getPrincipal', () => {
		it('should throw when principal type is unsupported', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			// @ts-expect-error
			expect(() => auth.getPrincipal('angel:heaven:gabriel')).toThrow('Principal type angel unsupported!');
		});
	}); // describe getPrincipal

	describe('getProfile', () => {
		it('should throw when user does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			expect(() => auth.getProfile({
				key: 'user:system:nonexistentuser',
				scope: 'auth'
			})).toThrow('User not found: user:system:nonexistentuser!');
		});

		it('should return user profile', () => {
			const server = new Server({loglevel: 'silent'}).createUser({
				name: 'name',
				password: 'password',
				profile: {
					nested: {
						key: 'value'
					}
				}
			});
			const auth = new Auth({
				server
			});
			const profile = auth.getProfile({
				key: 'user:system:name',
				scope: 'nested'
			});
			expect(profile).toEqual({
				key: 'value'
			});
		});

		it('should return null when user profile is empty', () => {
			const server = new Server({loglevel: 'silent'}).createUser({
				name: 'name',
				password: 'password',
				profile: null
			});
			const auth = new Auth({
				server
			});
			const profile = auth.getProfile({
				key: 'user:system:name'
			});
			expect(profile).toBeNull();
		});
	}); // describe getProfile

	describe('getRoleByName', () => {
		it('should throw when role does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			expect(() => auth.getRoleByName({
				name: 'nonexistentrole'
			})).toThrow('Role with name:nonexistentrole not found!');
		});
	}); // describe getRoleByName

	describe('getUserByName', () => {
		it('should throw when user does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			expect(() => auth.getUserByName({
				name: 'nonexistentuser'
			})).toThrow('User not found: user:system:nonexistentuser!');
		});
	}); // describe getUserByName

	describe('modifyProfile', () => {
		it('should throw when user does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const auth = new Auth({
				server
			});
			expect(() => auth.modifyProfile({
				editor: (profile) => {
					return profile;
				},
				key: 'user:system:nonexistentuser',
				scope: 'auth',
			})).toThrow('User not found: user:system:nonexistentuser!');
		});

		it('should modify user profile', () => {
			const server = new Server({loglevel: 'silent'}).createUser({
				name: 'name',
				password: 'password',
				profile: {
					nested: {
						key: 'value'
					}
				}
			});
			const auth = new Auth({
				server
			});
			auth.modifyProfile({
				key: 'user:system:name',
				scope: 'nested',
				editor: (profile) => {
					profile.key = 'modified';
					return profile;
				}
			});
			const profile = auth.getProfile({
				key: 'user:system:name',
				scope: 'nested'
			});
			expect(profile).toEqual({
				key: 'modified'
			});
		});

		it('should modify user profile that is null', () => {
			const server = new Server({loglevel: 'silent'}).createUser({
				name: 'name',
				password: 'password',
				profile: null
			});
			const auth = new Auth({
				server
			});
			auth.modifyProfile({
				key: 'user:system:name',
				editor: (profile) => {
					profile.key = 'modified';
					return profile;
				}
			});
			const profile = auth.getProfile({
				key: 'user:system:name',
			});
			expect(profile).toEqual({
				key: 'modified'
			});
		});
	}); // describe modifyProfile

}); // describe Auth
