import {
	LibContent,
	Server
} from '../../../src';


const PROJECT_NAME = 'myproject';
const FIELD = 'data.dateTime';
const DT_OLDER = '2000-01-01T00:00:00Z';
const DT = '2000-01-01T00:00:01Z';
const DT_NEWER = '2000-01-01T00:00:02Z';

const server = new Server({
	// loglevel: 'debug',
	loglevel: 'error',
	// loglevel: 'silent',
})
	.createProject({
		projectName: PROJECT_NAME,
	})
	.setContext({
		projectName: PROJECT_NAME,
	});

const libContent = new LibContent({
	server
});

const content = libContent.create({
	contentType: 'base:folder',
	data: {
		dateTime: DT,
	},
	name: 'folder',
	parentPath: '/',
});

const draftContentConnection = server.contentConnect({
	branchId: 'draft',
	projectId: PROJECT_NAME
});

// const allRes = draftContentConnection.query({
// 	count: -1,
// 	// query: {},
// });
// server.log.debug('allRes:%s', allRes);

describe('content', () => {
	describe('query', () => {
		describe('must', () => {
			it('lt with match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									lt: DT_NEWER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(1);
				expect(hits[0]._id).toBe(content._id);
			});

			it('lt without match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									lt: DT
								}
							}
						}
					}
				});
				const { total } = res;
				expect(total).toBe(0);
			});

			it('lte with match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									lte: DT,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(1);
				expect(hits[0]._id).toBe(content._id);
			});

			it('lte without match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									lte: DT_OLDER,
								}
							}
						}
					}
				});
				const {
					total,
				} = res;
				expect(total).toBe(0);
			});

			it('gt with match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									gt: DT_OLDER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(1);
				expect(hits[0]._id).toBe(content._id);
			});

			it('gt without match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									gt: DT,
								}
							}
						}
					}
				});
				const { total } = res;
				expect(total).toBe(0);
			});

			it('gte with match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									gte: DT,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(1);
				expect(hits[0]._id).toBe(content._id);
			});

			it('gte without match', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							must: {
								range: {
									field: FIELD,
									gte: DT_NEWER,
								}
							}
						}
					}
				});
				const { total } = res;
				expect(total).toBe(0);
			});
		}); // describe must

		describe('mustNot', () => {

			// If it was a MUST query it would find all content that has a value in data.dateTime
			// with a value less than DT_NEWER.
			// Since it's a MUSTNOT query is should be the opposite, meaning it should EXCLUDE all
			// content that has a value in data.dateTime with a value less than DT_NEWER.
			it('lt(newer) ', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									lt: DT_NEWER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(2);
				for (const hit of hits) {
					expect(hit._id).not.toBe(content._id);
				}
			});

			it('lt(same)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									lt: DT
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(3);
				expect(hits[2]._id).toBe(content._id);
			});

			it('lte(same)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									lte: DT,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(2);
				for (const hit of hits) {
					expect(hit._id).not.toBe(content._id);
				}
			});

			it('lte(older)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									lte: DT_OLDER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(3);
				expect(hits[2]._id).toBe(content._id);
			});

			it('gt(older)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									gt: DT_OLDER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(2);
				for (const hit of hits) {
					expect(hit._id).not.toBe(content._id);
				}
			});

			it('gt(same)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									gt: DT,
								}
							}
						}
					}
				});
				const {
					hits,
					total
				} = res;
				expect(total).toBe(3);
				expect(hits[2]._id).toBe(content._id);
			});

			it('gte(same)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									gte: DT,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(2);
				for (const hit of hits) {
					expect(hit._id).not.toBe(content._id);
				}
			});

			it('gte(newer)', () => {
				const res = draftContentConnection.query({
					count: -1,
					query: {
						boolean: {
							mustNot: {
								range: {
									field: FIELD,
									gte: DT_NEWER,
								}
							}
						}
					}
				});
				const {
					hits,
					total,
				} = res;
				expect(total).toBe(3);
				expect(hits[2]._id).toBe(content._id);
			});
		}); // describe mustNot
	}); // describe query
}); // describe content
