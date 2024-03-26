import type {ByteSource} from '@enonic-types/core';


import {readFileSync} from 'fs';
import {join} from 'path';
import {
    App,
	LibContext,
    LibContent,
    LibPortal,
    Project,
    Request,
    Server
} from '../../src';


const APP_KEY = 'com.example.myapp';
const PROJECT_NAME = 'myproject';
const REPO_ID = `com.enonic.cms.${PROJECT_NAME}`;

const server = new Server({
	// loglevel: 'debug',
	loglevel: 'error',
}).createProject({
	projectName: PROJECT_NAME,
}).setContext({
	projectName: PROJECT_NAME,
});

const app = new App({
	key: APP_KEY
});

const libContent = new LibContent({
    server
});

const libContext = new LibContext({
	server
});

const libPortal = new LibPortal({
	app,
	server
});

const leaSeydouxJpg = libContent.createMedia({
    data: readFileSync(join(__dirname, '..', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

const originalContent = libContent.create({
    contentType: 'com.example.myapp:person',
    data: {
        bio: "French actress Léa Seydoux was born in 1985 in Paris, France, to Valérie Schlumberger, a philanthropist, and Henri Seydoux, a businessman.",
        dateofbirth: "1985-07-01",
        photos: leaSeydouxJpg._id,
    },
    name: 'lea-seydoux',
    displayName: 'Lea Seydous',
    parentPath: '/',
});

libContent.publish({
	keys: [originalContent._id, leaSeydouxJpg._id]
});

const modifiedContent = libContent.modify({
	key: originalContent._id,
	editor: (content) => {
		content.displayName = 'Léa Seydoux';
		return content;
	}
});

describe('lib-context', () => {
	describe('run', () => {
		it('should change which branch a content is fetched from', () => {
			libPortal.request = new Request({
				repositoryId: REPO_ID,
				path: '/admin/site/preview/myproject/draft/lea-seydoux'
			});
			const draftContent = libPortal.getContent();
			expect(draftContent.displayName).toBe('Léa Seydoux');
			expect(draftContent).toStrictEqual(modifiedContent);
			libContext.run({
				branch: 'master',
				repository: REPO_ID,
			}, () => {
				const unknownContent = libPortal.getContent();
				expect(unknownContent).toStrictEqual(originalContent);
			});
		});
	}); // describe run
}); // describe lib-context
