import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const server = new Server({
	// loglevel: 'debug',
	loglevel: 'silent',
});


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'myRepoId'
		});
		describe('connect', () => {
			const connection = server.connect({
				branchId: 'master',
				repoId: 'myRepoId'
			});
			it('returns an object which has a query method', () => {
				expect(hasMethod(connection, 'query')).toBe(true);
			}); // it
			describe('Connection', () => {
				const createRes1 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					boolean: true,
					url: 'https://www.enonic.com'
				});
				// server.log.debug('createRes1:%s', createRes1);

				const createRes2 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					boolean: false,
					url: 'https://www.enonic.com/platform/overview'
				});
				// server.log.debug('createRes2:%s', createRes2);

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

					it('handles boolean.must.in _nodeType', () => {
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
					}); // it handles boolean.must.in.field _nodeType

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

					it('handles boolean.must[term.field _nodeType, term.field url]', () => {
						const queryRes = connection.query({
							query: {
								boolean: {
									must: [{
										term: {
											field: '_nodeType',
											value: 'com.enonic.app.explorer:document'
										}
									},{
										term: {
											field: 'url',
											value: 'https://www.enonic.com/platform/overview'
										}
									}]
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
									mustNot: [{
										term: {
											field: '_nodeType',
											value: 'default'
										}
									},{
										in: {
											field: 'url',
											values: [
												'https://www.enonic.com',
											]
										}
									}]
								}
							}
						});
						// log.error('queryRes:%s', queryRes);
						expect(queryRes).toStrictEqual({
							aggregations: {},
							count: 1,
							hits: [{
								id: createRes2._id,
								score: 1,
							}],
							total: 1
						})
					}); // it

					it('can handle in and term with boolean value(s)', () => {
						const mustIn = connection.query({
							query: {
								boolean: {
									must: {
										in: {
											field: 'boolean',
											values: [
												true
											]
										}
									},
								}
							}
						});

						const mustTerm = connection.query({
							query: {
								boolean: {
									must: {
										term: {
											field: 'boolean',
											value: true
										}
									}
								}
							}
						});

						const mustNotIn = connection.query({
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
											field: 'boolean',
											values: [
												false,
											]
										}
									}
								}
							}
						});

						const mustNotTerm = connection.query({
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
											field: 'boolean',
											value: false
										}
									}
								}
							}
						});
						// log.error('queryRes:%s', queryRes);
						const expected = {
							aggregations: {},
							count: 1,
							hits: [{
								id: createRes1._id,
								score: 1,
							}],
							total: 1
						}
						expect(mustIn).toStrictEqual(expected);
						expect(mustTerm).toStrictEqual(expected);
						expect(mustNotIn).toStrictEqual(expected);
						expect(mustNotTerm).toStrictEqual(expected);
					}); // it

				}); // describe query
			});
		});
	});
});
