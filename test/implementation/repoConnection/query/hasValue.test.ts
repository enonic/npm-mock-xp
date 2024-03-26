import {Server} from '../../../../src';


const server = new Server({
	loglevel: 'silent'
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
			describe('Connection', () => {
				const createRes1 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					boolean: true,
					url: 'https://www.enonic.com'
				});
				const createRes2 = connection.create({
					_nodeType: 'com.enonic.app.explorer:document',
					boolean: false,
					url: 'https://www.enonic.com/platform/overview'
				});

				describe('query', () => {

					describe('filters', () => {
						describe('boolean.must', () => {
							describe('hasValue', () => {
								it('handles booleans correctly', () => {
									const queryRes1 = connection.query({
										filters: {
											boolean: {
												must: {
													hasValue: {
														field: 'boolean',
														values: [
															true
														]
													}
												}
											}
										}
									});
									// log.debug('queryRes1:%s',queryRes1);
									expect(queryRes1.count).toBe(1);
									expect(queryRes1.total).toBe(1);
									queryRes1.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).toBe(true);
									});

									const queryRes2 = connection.query({
										filters: {
											boolean: {
												must: [{
													hasValue: {
														field: 'boolean',
														values: [
															false
														]
													}
												}]
											}
										}
									});
									// log.debug('queryRes2:%s',queryRes2);
									expect(queryRes2.count).toBe(1);
									expect(queryRes2.total).toBe(1);
									queryRes2.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).toBe(false);
									});

									const queryRes3 = connection.query({
										filters: {
											boolean: {
												must: {
													hasValue: {
														field: 'boolean',
														values: [
															true,
															false
														]
													}
												}
											}
										}
									});
									// log.debug('queryRes3:%s', queryRes3);
									expect(queryRes3.count).toBe(2);
									expect(queryRes3.total).toBe(2);
									// queryRes3.hits.forEach(({id}) => {
									// 	const getRes = connection.get(id);
									// 	log.debug('getRes:%s',getRes);
									// });

									const queryRes4 = connection.query({
										filters: {
											boolean: {
												must: [{
													hasValue: {
														field: 'boolean',
														values: [
															true
														]
													}
												},{
													hasValue: {
														field: 'boolean',
														values: [
															false,
														]
													}
												}]
											}
										}
									});
									// log.debug('queryRes4:%s', queryRes4);
									expect(queryRes4.count).toBe(1);
									expect(queryRes4.total).toBe(1);
									queryRes4.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).toBe(undefined);
									});
								}); // it
							}); // hasValue
						}); // boolean.must

						describe('boolean.mustNot', () => {
							describe('hasValue', () => {
								it('handles booleans correctly', () => {
									const queryRes1 = connection.query({
										filters: {
											boolean: {
												mustNot: {
													hasValue: {
														field: 'boolean',
														values: [
															true
														]
													}
												}
											}
										}
									});
									// log.debug('queryRes1:%s',queryRes1);
									expect(queryRes1.count).toBe(2);
									expect(queryRes1.total).toBe(2);
									queryRes1.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).not.toBe(true);
									});

									const queryRes2 = connection.query({
										filters: {
											boolean: {
												mustNot: {
													hasValue: {
														field: 'boolean',
														values: [
															false
														]
													}
												}
											}
										}
									});
									// log.debug('queryRes2:%s',queryRes2);
									expect(queryRes2.count).toBe(2);
									expect(queryRes2.total).toBe(2);
									queryRes2.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).not.toBe(false);
									});

									const queryRes3 = connection.query({
										filters: {
											boolean: {
												mustNot: {
													hasValue: {
														field: 'boolean',
														values: [
															true,
															false
														]
													}
												}
											}
										}
									});
									// log.debug('queryRes3:%s',queryRes3);
									expect(queryRes3.count).toBe(1);
									expect(queryRes3.total).toBe(1);
									queryRes3.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).toBe(undefined);
									});
								}); // it
							}); //	hasValue
						}); // boolean.mustNot

						describe('hasValue', () => {
							it('handles booleans correctly', () => {
								const queryRes1 = connection.query({
									filters: {
										hasValue: {
											field: 'boolean',
											values: [
												true
											]
										}
									}
								});
								// log.debug('queryRes1:%s',queryRes1);
								expect(queryRes1.count).toBe(1);
								expect(queryRes1.total).toBe(1);
								queryRes1.hits.forEach(({id}) => {
									const getRes = connection.get(id);
									// log.debug('getRes:%s',getRes);
									expect(getRes['boolean']).toBe(true);
								});

								const queryRes2 = connection.query({
									filters: {
										hasValue: {
											field: 'boolean',
											values: [
												false
											]
										}
									}
								});
								// log.debug('queryRes2:%s',queryRes2);
								expect(queryRes2.count).toBe(1);
								expect(queryRes2.total).toBe(1);
								queryRes2.hits.forEach(({id}) => {
									const getRes = connection.get(id);
									// log.debug('getRes:%s',getRes);
									expect(getRes['boolean']).toBe(false);
								});

								const queryRes3 = connection.query({
									filters: {
										hasValue: {
											field: 'boolean',
											values: [
												false,
												true
											]
										}
									}
								});
								// log.debug('queryRes3:%s', queryRes3);
								expect(queryRes3.count).toBe(2);
								expect(queryRes3.total).toBe(2);
								// queryRes3.hits.forEach(({id}) => {
								// 	const getRes = connection.get(id);
								// 	log.debug('getRes:%s',getRes);
								// });
							}); // it
						}); // hasValue
					}); // filters

					describe('filters combined with query', () => {
						describe('boolean.mustNot', () => {
							describe('hasValue', () => {
								it('returns no results when filters.boolean.must.hasValue: true and query.boolean.must.term: false', () => {
									const queryRes1 = connection.query({
										filters: {
											boolean: {
												must: {
													hasValue: {
														field: 'boolean',
														values: [
															true
														]
													}
												}
											}
										},
										query: {
											boolean: {
												must: {
													term: {
														field: 'boolean',
														value: false
													}
												}
											}
										}
									});
									// log.debug('queryRes1:%s', queryRes1);
									expect(queryRes1.count).toBe(0);
									expect(queryRes1.total).toBe(0);
								});

								it('returns only results where boolean is undefined when filters.boolean.mustNot.hasValue: true and query.boolean.mustNot.term: false', () => {
									const queryRes2 = connection.query({
										filters: {
											boolean: {
												mustNot: {
													hasValue: {
														field: 'boolean',
														values: [
															true
														]
													}
												}
											}
										},
										query: {
											boolean: {
												mustNot: {
													term: {
														field: 'boolean',
														value: false
													}
												}
											}
										}
									});
									// log.debug('queryRes2:%s', queryRes2);
									queryRes2.hits.forEach(({id}) => {
										const getRes = connection.get(id);
										// log.debug('getRes:%s',getRes);
										expect(getRes['boolean']).toBe(undefined);
									});
									expect(queryRes2.count).toBe(1);
									expect(queryRes2.total).toBe(1);
								}); // it

							});
						});
					});
				}); // query
			});
		});
	});
});
