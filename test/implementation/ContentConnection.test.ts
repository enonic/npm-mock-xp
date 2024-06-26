import type {
	ByteSource,
	LayoutComponent,
	LayoutRegion,
	PageComponent,
	PageRegion,
	PartComponent,
} from '@enonic-types/core';
import type {AllContentProperties} from '../../src/implementation/ContentConnection';

import {readFileSync} from 'fs';
import {join} from 'path';
import {vol} from 'memfs';
import {
	ContentConnection,
	RepoConnection,
	Server,
} from '../../src';
import {LEA_JPG_BYTE_SIZE} from '../constants';


declare global {
	interface XpLayoutMap {
		'com.enonic.app.myapp:mylayout': {
			layoutProp: string
		}
	}
	interface XpPageMap {
		'com.enonic.app.myapp:mypage': {
			pageProp: string
		}
	}
	interface XpPartMap {
		'com.enonic.app.myapp:mypart': {
			partProp: string
		}
	}
}


const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;
const FILENAME = 'Lea-Seydoux.jpg'
const DATA: ByteSource = readFileSync(join(__dirname, '..', FILENAME)) as unknown as ByteSource;


let server, draftBranch, draftConnection;


beforeAll(done => {
	server = new Server({
		loglevel: 'silent',
	}).createProject({
		projectName: PROJECT_NAME,
	});

	draftBranch = server.getBranch({
		branchId: 'draft',
		repoId: REPO_ID,
	});

	draftConnection = new ContentConnection({
		branch: draftBranch
	});
	done();
});

describe('ContentConnection', () => {
	it('should be instantiable', () => {
		expect(draftConnection).toBeInstanceOf(ContentConnection);
	});

	it('should be able to create, exists, get, modify, move, publish and delete content', () => {
		const content = draftConnection.create({
			contentType: 'com.enonic.myapp:mycontent',
			data: {
				key: 'value'
			},
			name: 'mycontent',
			parentPath: '/',
		});
		expect(content).toStrictEqual({
			_id: content._id,
			_name: 'mycontent',
			_path: '/mycontent',
			attachments: {},
			childOrder: undefined,
			// createdTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			createdTime: content.createdTime,
			creator: 'user:system:su',
			data: {
				key: 'value'
			},
			displayName: 'mycontent',
			hasChildren: true,
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		expect(draftConnection.exists({ key: content._id })).toBe(true);

		expect(draftConnection.get({ key: content._id })).toStrictEqual(content);

		const modRes = draftConnection.modify({
			key: content._id,
			editor: (content) => {
				content.data.key = 'modified';
				return content;
			}
		});
		expect(modRes).toStrictEqual({
			_id: content._id,
			_name: 'mycontent',
			_path: '/mycontent',
			attachments: {},
			childOrder: undefined,
			// createdTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			createdTime: modRes.createdTime,
			creator: 'user:system:su',
			data: {
				key: 'modified'
			},
			displayName: 'mycontent',
			hasChildren: true,
			// modifiedTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			modifiedTime: modRes.modifiedTime,
			modifier: 'user:system:su',
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		const moveRes = draftConnection.move({
			source: content._id,
			target: '/renamedMyContent'
		});
		expect(moveRes).toStrictEqual({
			_id: content._id,
			_name: 'renamedMyContent',
			_path: '/renamedMyContent',
			attachments: {},
			childOrder: undefined,
			// createdTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			createdTime: moveRes.createdTime,
			creator: 'user:system:su',
			data: {
				key: 'modified'
			},
			displayName: 'mycontent',
			hasChildren: true,
			// modifiedTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			modifiedTime: moveRes.modifiedTime,
			modifier: 'user:system:su',
			owner: 'user:system:su',
			publish: {},
			type: 'com.enonic.myapp:mycontent',
			valid: true,
			x: {}
		});

		const publishRes = draftConnection.publish({
			keys: [content._id]
		});
		expect(publishRes).toStrictEqual({
			deletedContents: [],
			failedContents: [],
			pushedContents: [
				content._id,
			],
		});

		const deleteRes = draftConnection.delete({ key: content._id });
		expect(deleteRes).toBe(true);

		expect(draftConnection.exists({ key: content._id })).toBe(false);
		expect(draftConnection.get({ key: content._id })).toBe(null);
	});

	it('should be able to createMedia and getAttachmentStream', () => {
		const connection = new ContentConnection({
			branch: server.repos[REPO_ID].getBranch('draft')
		});
		const mediaContent = connection.createMedia({
			data: DATA,
					name: FILENAME,
					parentPath: '/',
					mimeType: 'image/jpeg',
					focalX: 0.5,
					focalY: 0.5,
		});
		expect(mediaContent).toStrictEqual({
			_id: mediaContent._id,
			_name: FILENAME,
			_path: `/${FILENAME}`,
			attachments: {},
			childOrder: 'displayname ASC',
			// createdTime: expect.any(String) as unknown as string, // bun test doesn't support expect.any
			createdTime: mediaContent.createdTime,
			creator: 'user:system:su',
			data: {
				artist: "",
				caption: "",
				copyright: "",
				media: {
				attachment: FILENAME,
				focalPoint: {
					x: 0.5,
					y: 0.5,
				},
				},
				tags: "",
			},
			displayName: 'Lea-Seydoux',
			hasChildren: true,
			owner: 'user:system:su',
			publish: {},
			type: 'media:image',
			valid: true,
			x: {
				media: {
					imageInfo: {
						byteSize: LEA_JPG_BYTE_SIZE,
						contentType: 'image/jpeg',
						imageHeight: 1080,
						imageWidth: 1920,
						pixelSize: 2073600,
					},
				},
			},
		}); // expect mediaContent

		const attachmentStream = connection.getAttachmentStream({
			name: FILENAME,
			key: mediaContent._id
		});
		vol.fromJSON({}, '/');
			const filePath = `/${FILENAME}`;
			vol.writeFileSync(filePath, attachmentStream.toString());
			const {
				size
			} = vol.statSync(filePath);
			expect(size).toBe(LEA_JPG_BYTE_SIZE);
	}); // it should be able to createMedia and getAttachmentStream

	describe('create', () => {
		it('is able to store language', () => {
			const createdContent = draftConnection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {},
				language: 'no',
				parentPath: '/',
			});
			const content = draftConnection.get({key:createdContent._id});
			expect(content.language).toBe('no');
		});
	}); // describe create

	describe('getAttachmentStream', () => {
		it("returns null when content doesn't have the attachment", () => {
			const content = draftConnection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {},
				name: 'mycontentwithoutattachment',
				parentPath: '/',
			});
			const attachmentStream = draftConnection.getAttachmentStream({
				name: 'attachment',
				key: content._id
			});
			expect(attachmentStream).toBe(null);
		});

		it('returns null when content has the attachment name, but it is not a byte source', () => {
			const draftNodeConnection = new RepoConnection({
				branch: draftBranch
			})
			const node = draftNodeConnection.create({
				_name: 'mycontentwithattachmentbutnotbytesource',
				// _parentPath: '/',
				contentType: 'com.enonic.myapp:mycontent',
				attachment: {
					name: 'not-an-attachment',
				},
			});
			const attachmentStream = draftConnection.getAttachmentStream({
				name: 'not-an-attachment',
				key: node._id
			});
			expect(attachmentStream).toBe(null);
		});
	}); // describe getAttachmentStream

	describe('modify', () => {
		it('throws when content does not exist', () => {
			expect(() => draftConnection.modify({
				key: '/non-existing-content',
				editor: (content) => content
			})).toThrow('modify: Content not found for key: /non-existing-content');
		});
	}); // describe modify

	describe('move', () => {
		it('throws when source does not exist', () => {
			expect(() => draftConnection.move({
				source: '/non-existing-content',
				target: '/target'
			})).toThrow('move: Source content not found! key: /non-existing-content');
		});

		it("throws when target parent doesn't exist", () => {
			const content = draftConnection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {},
				name: 'mycontentwithoutparent',
				parentPath: '/',
			});
			expect(() => draftConnection.move({
				source: content._id,
				target: '/non-existing-parent/target'
			})).toThrow(`Cannot move content with source ${content._id} to target /non-existing-parent/target: Parent of target not found!`);
		});

		it('throws when target already exists', () => {
			const content = draftConnection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {},
				name: 'mycontent4',
				parentPath: '/',
			});
			const target = draftConnection.create({
				contentType: 'com.enonic.myapp:mycontent',
				data: {},
				name: 'target',
				parentPath: '/',
			});
			expect(() => draftConnection.move({
				source: content._id,
				target: target._path
			})).toThrow(`Cannot move content with source ${content._id} to target /target: Content already exists at target!`);
		});
	}); // describe move

	describe('nodeToContent', () => {
		it('adds page property from components', () => {
			const server = new Server({
				loglevel: 'debug',
			}).createProject({
				projectName: PROJECT_NAME,
			});

			const draftBranch = server.getBranch({
				branchId: 'draft',
				repoId: REPO_ID,
			});

			const draftConnection = new ContentConnection({
				branch: draftBranch
			});

			const contentFromNode = draftConnection.nodeToContent({
				node: {
					_childOrder: 'displayname ASC',
					_id: '00000000-0000-4000-8000-000000000022',
					_indexConfig: {
						default: 'byType',
					},
					_inheritsPermissions: false,
					_name: 'mycontent',
					_nodeType: 'com.enonic.myapp:mycontent',
					_path: '/mycontent',
					_permissions: [],
					_state: 'PUBLISHED',
					_ts: '2021-07-01T12:00:00Z',
					_versionKey: '00000000-0000-4000-8000-000000000023',
					components: [{
						page: {
							config: {
								'com-enonic-app-myapp': {
									'mypage': {
										pageProp: 'pageValue'
									}
								}
							},
							customized: true,
							descriptor: 'com.enonic.app.myapp:mypage',
						},
						path: '/',
						type: 'page',
					}, {
						part: {
							config: {
								'com-enonic-app-myapp': {
									'mypart': {
										partProp: 'partValue'
									}
								}
							},
							descriptor: 'com.enonic.app.myapp:mypart',
						},
						path: '/main/0',
						type: 'part'
					}, {
						layout: {
							config: {
								'com-enonic-app-myapp': {
									'mylayout': {
										layoutProp: 'layoutValue'
									}
								}
							},
							descriptor: 'com.enonic.app.myapp:mylayout',
						},
						path: '/main/1',
						type: 'layout',
					}, {
						part: {
							config: {
								'com-enonic-app-myapp': {
									'mypart': {
										partProp: 'partValue'
									}
								}
							},
							descriptor: 'com.enonic.app.myapp:mypart',
						},
						path: '/main/1/left/0',
						type: 'part'
					}],
				}
			});

			const main0PartComponent: PartComponent = {
				config: {
					partProp: 'partValue'
				},
				descriptor: 'com.enonic.app.myapp:mypart',
				path: '/main/0',
				type: 'part',
			}

			const main1Left0PartComponent: PartComponent = {
				config: {
					partProp: 'partValue'
				},
				descriptor: 'com.enonic.app.myapp:mypart',
				path: '/main/1/left/0',
				type: 'part',
			}

			const main1LayoutLeftRegion: LayoutRegion<[typeof main1Left0PartComponent]> = {
				name: 'left',
				components: [main1Left0PartComponent]
			}

			const main1LayoutComponent: LayoutComponent = {
				config: {
					layoutProp: 'layoutValue'
				},
				descriptor: 'com.enonic.app.myapp:mylayout',
				path: '/main/1',
				regions: {
					left: main1LayoutLeftRegion
				},
				type: 'layout',
			}

			const mainPageRegion: PageRegion = {
				components: [
					main0PartComponent,
					main1LayoutComponent
				],
				name: 'main',
			};

			const pageComponent: PageComponent = {
				config: {
					pageProp: 'pageValue'
				},
				descriptor: 'com.enonic.app.myapp:mypage',
				path: '/',
				regions: {
					main: mainPageRegion
				},
				type: 'page',
			};

			const expectedContent: Partial<AllContentProperties> = {
				_id: '00000000-0000-4000-8000-000000000022',
				// _indexConfig: {
				// 	default: 'byType',
				// },
				// _inheritsPermissions: false,
				_name: 'mycontent',
				// _nodeType: 'com.enonic.myapp:mycontent',
				_path: '/mycontent',
				// _permissions: [],
				// _state: 'PUBLISHED',
				// _versionKey: '00000000-0000-4000-8000-000000000023',
				// _ts: '2021-07-01T12:00:00Z',
				attachments: {},
				childOrder: 'displayname ASC',
				createdTime: undefined,
				creator: undefined,
				data: undefined,
				displayName: "mycontent",
				hasChildren: true,
				owner: undefined,
				page: pageComponent,
				publish: {},
				type: undefined,
				valid: true,
				x: {},
			};

			expect(contentFromNode).toStrictEqual(expectedContent);
		});
	}); // describe nodeToContent

	// describe('publish', () => {

	// }); // describe publish

}); // describe ContentConnection
