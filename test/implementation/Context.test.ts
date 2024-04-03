import {
	Context,
	Server
} from '../../src';


describe('Context', () => {
	it('should throw when invalid branch for repository', () => {
		const server = new Server({loglevel: 'silent'});
		expect(() => new Context({
			branch: 'invalidbranch',
			repository: 'com.enonic.cms.repository',
			server
		})).toThrow('Invalid branch: invalidbranch for repository: com.enonic.cms.repository!');
	});
}); // describe Context
