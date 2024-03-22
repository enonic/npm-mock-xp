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

const server = new Server({
    loglevel: 'debug'
});

const project = new Project({
    projectName: PROJECT_NAME,
    server
});

const app = new App({
	key: APP_KEY
});

const libContent = new LibContent({
    project
});

const libContext = new LibContext({
	server
});

const libPortal = new LibPortal({
	app,
	project
});

const leaSeydouxJpg = libContent.createMedia({
    data: readFileSync(join(__dirname, '..', 'Lea-Seydoux.jpg')) as unknown as ByteSource,
    name: 'Lea-Seydoux.jpg',
    mimeType: 'image/jpeg',
    focalX: 0.5,
    focalY: 0.5,
});

const leaContent = libContent.create({
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
	keys: [leaContent._id, leaSeydouxJpg._id]
});

libContent.modify({
	key: leaContent._id,
	editor: (content) => {
		content.displayName = 'Léa Seydoux';
		return content;
	}
});

describe('lib-context', () => {
	describe('run', () => {
		it('should NOT change which branch a content is fetched from', () => {
			libPortal.request = new Request({
				repositoryId: libPortal.repositoryId,
				path: '/admin/site/preview/myproject/draft/lea-seydoux'
			});
			const draftContent = libPortal.getContent();
			expect(draftContent.displayName).toBe('Léa Seydoux');
			libContext.run({
				branch: 'master'
			}, () => {
				const unknownContent = libPortal.getContent();
				expect(unknownContent).toStrictEqual(draftContent);
			});
		});
	}); // describe run
}); // describe lib-context
