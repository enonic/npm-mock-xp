import {
	Repo,
	Server
} from '../../src';


describe('Repo', () => {
	describe('getBranch', () => {
		it('should throw when branch does not exist', () => {
			const server = new Server({loglevel: 'silent'});
			const repo = new Repo({
				id: 'repoId',
				server
			});
			expect(() => repo.getBranch('branchId')).toThrow('getBranch: No branch with branchId:branchId');
		});
	}); // describe getBranch
}); // describe Repo
