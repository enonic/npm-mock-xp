# `@enonic/mock-xp`

Library to mock Enonic XP API's and state.

Used to run tests in node, without the need to run Enonic XP.

## Usage

```ts
import {deepStrictEqual} from 'assert';
import {
  LibNode,
  Server
} from '@enonic/mock-xp';


const APP_NAME = 'com.enonic.app.example';

const server = new Server().createRepo({id: APP_NAME});

const libNode = new LibNode({
	server
});


describe('whatever', () => {
  it(`is correct`, () => {
    const connection = libNode.connect({
      repoId: APP_NAME,
      branch: 'master'
    });
    const FOLDER_NAME = 'folderName';
    const createdNode = connection.create({
      _name: FOLDER_NAME
    });
    deepStrictEqual(
      {
        _id: createdNode._id,
        _indexConfig: {
          configs: [],
          default: {
            decideByType: true,
            enabled: true,
            fulltext: false,
            includeInAllText: false,
            indexValueProcessors: [],
            languages: [],
            nGram: false,
            path: false,
          },
        },
        _name: FOLDER_NAME,
        _path: createdNode._path,
        _nodeType: 'default',
        _state: 'DEFAULT',
        _ts: createdNode._ts,
        _versionKey: createdNode._versionKey,
      },
      createdNode
    );
  });
});
```

<hr />

<img src="media/enonic.svg" alt="Enonic logo" title="Enonic logo" width="160px">

<hr />
