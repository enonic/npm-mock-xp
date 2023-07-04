import {JavaBridge} from '../../src/JavaBridge';
import Log from '../../src/Log';
import { hasMethod } from '../hasMethod';


const log = Log.createLogger({
	// loglevel: 'info'
	loglevel: 'silent'
});


describe('mock', () => {
	describe('JavaBridge', () => {
		const javaBridge = new JavaBridge({
			app: {
				config: {},
				name: 'com.enonic.app.test',
				version: '0.0.1-SNAPSHOT'
			},
			log
		});
		/*const obj={key:'value'};
		javaBridge.log.error('error:%s', obj);
		javaBridge.log.warning('warning:%s', obj);
		javaBridge.log.info('info:%s', obj);
		javaBridge.log.debug('debug:%s', obj);*/
		javaBridge.repo.create({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = javaBridge.connect({
				branch: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a query method', () => {
				expect(hasMethod(connection, 'query')).toBe(true);
			}); // it
			describe('Connection', () => {
				const createRes1 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					url: 'https://www.enonic.com'
				});
				const createRes2 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					url: 'https://www.enonic.com/platform/overview'
				});
				describe('query', () => {
					it('returns all nodes when query is an empty string', () => {
						const queryRes = connection.query({
							query: ''
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 3,
							hits: [{
								id: '00000000-0000-0000-0000-000000000000',
								score: 1
							},{
								id: createRes1._id,
								score: 1
							},{
								id: createRes2._id,
								score: 1
							}],
							total: 3
						})
					});
					it('returns all nodes when count is -1', () => {
						const queryRes = connection.query({
							count: -1,
							query: ''
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 3,
							hits: [{
								id: '00000000-0000-0000-0000-000000000000',
								score: 1
							},{
								id: createRes1._id,
								score: 1
							},{
								id: createRes2._id,
								score: 1
							}],
							total: 3
						})
					});
					it('returns 1 hit when count is 1', () => {
						const queryRes = connection.query({
							count: 1,
							query: ''
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 1,
							hits: [{
								id: '00000000-0000-0000-0000-000000000000',
								score: 1
							}],
							total: 3
						})
					});
					it('handles boolean.must.term.in _nodeType', () => {
						const queryRes = connection.query({
							query: {
								boolean: {
									must: {
										in: {
											field: '_nodeType',
											values: [
												'com.enonic.app.explorer:document'
											]
										}
									}
								}
							}
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 2,
							hits: [{
								id: createRes1._id,
								score: 1,
							},{
								id: createRes2._id,
								score: 1,
							}],
							total: 2
						})
					}); // it handles boolean.must.term.field _nodeType
					it('handles boolean.must.term.field _nodeType', () => {
						const queryRes = connection.query({
							query: {
								boolean: {
									must: {
										term: {
											field: '_nodeType',
											value: 'com.enonic.app.explorer:document'
										}
									}
								}
							}
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 2,
							hits: [{
								id: createRes1._id,
								score: 1,
							},{
								id: createRes2._id,
								score: 1,
							}],
							total: 2
						})
					}); // it handles boolean.must.term.field _nodeType

					it('handles boolean.mustNot.term.field url', () => {
						const queryRes = connection.query({
							query: {
								boolean: {
									must: {
										term: {
											field: '_nodeType',
											value: 'com.enonic.app.explorer:document'
										}
									},
									mustNot: {
										term: {
											field: 'url',
											value: 'https://www.enonic.com'
										}
									}
								}
							}
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 1,
							hits: [{
								id: createRes2._id,
								score: 1,
							}],
							total: 1
						})
					});

					it('handles boolean.mustNot.in.field url', () => {
						const queryRes = connection.query({
							query: {
								boolean: {
									must: {
										term: {
											field: '_nodeType',
											value: 'com.enonic.app.explorer:document'
										}
									},
									mustNot: {
										in: {
											field: 'url',
											values: [
												'https://www.enonic.com',
											]
										}
									}
								}
							}
						});
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 1,
							hits: [{
								id: createRes2._id,
								score: 1,
							}],
							total: 1
						})
					});

				}); // describe query
			});
		});
	});
});
