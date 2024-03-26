import {App} from './App';
import {Resource} from './Resource';

/*
A controller is a file inside an app.
It can be imported and called under different contexts.
Using libIo.getResource it's possible to dynamically import a controller from
another app, but it's not pretty.

It should be possible to test a controller under two different context, in the
same test file.

Depending upon the path, controllers are typically run in a specific context.
/main.js             (com.enonic.cms.default, draft, anonymous & everyone)
/assets              (client-side)
/admin/tools         (com.enonic.cms.default, draft, logged in user)
/admin/widgets       (draft,  dashboard: com.enonic.cms.default, contextPanel
                      and menuIten uses current project, logged in user)
/error              (user, not certain about the rest depends on url)
/guillotine         (probably depends on url)
/lib                (typically imported server-side, context may vary)
/i18n               (like /lib)
/import             (not available in jar file)
/services           (request based, descriptor may require specific principals)
/site/content-types (like /lib)
/site/layouts       (request based)
/site/macros        (like /lib)
/site/mixins        (like /lib)
/site/pages         (request based)
/site/parts         (request based)
/site/processors    (request based)
/site/x-data        (like /lib)
/tasks              (system-repo, master, role:system.admin)
/types              (like /lib)
/webapp             (com.enonic.cms.default, draft, user)

Any other path is probably like /lib/*
*/

export class Controller extends Resource {
	app: App;
	path: string;

	constructor({
		app,
		path,
	}: {
		app: App
		path: string
	}) {
		super({
			app,
			path,
		});
	}
} // class Controller

/*
http://localhost:8080/site/intro/master/persons/lea-seydoux context: {
    "branch": "master",
    "repository": "com.enonic.cms.intro",
    "authInfo": {
        "principals": [
            "user:system:anonymous",
            "role:system.everyone"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711349074978
    }
}

/main context: {
    "branch": "draft",
    "repository": "com.enonic.cms.default",
    "authInfo": {
        "principals": [
            "user:system:anonymous",
            "role:system.everyone"
        ]
    },
    "attributes": {}
}

/admin/tool/sample/sample context:{
    "branch": "draft",
    "repository": "com.enonic.cms.default",
    "authInfo": {
        "user": {
            "type": "user",
            "key": "user:system:admin",
            "displayName": "admin",
            "disabled": false,
            "email": "admin@example.com",
            "login": "admin",
            "idProvider": "system"
        },
        "principals": [
            "role:system.admin",
            "role:system.admin.login",
            "role:system.authenticated",
            "role:system.everyone",
            "user:system:admin"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711101006928
    }
}

/admin/widgets/contextPanel/contextPanel context:{
    "branch": "draft",
    "repository": "com.enonic.cms.intro",
    "authInfo": {
        "user": {
            "type": "user",
            "key": "user:system:admin",
            "displayName": "admin",
            "disabled": false,
            "email": "admin@example.com",
            "login": "admin",
            "idProvider": "system"
        },
        "principals": [
            "role:system.admin",
            "role:system.admin.login",
            "role:system.authenticated",
            "role:system.everyone",
            "user:system:admin"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711101129498
    }
}

/admin/widgets/dashboard/dashboard context:{
    "branch": "draft",
    "repository": "com.enonic.cms.default",
    "authInfo": {
        "user": {
            "type": "user",
            "key": "user:system:su",
            "displayName": "Super User",
            "disabled": false,
            "login": "su",
            "idProvider": "system"
        },
        "principals": [
            "role:system.admin",
            "role:system.authenticated",
            "role:system.everyone",
            "user:system:su"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711099799832
    }
}

/admin/widgets/menuItem/menuItem context:{
    "branch": "draft",
    "repository": "com.enonic.cms.intro",
    "authInfo": {
        "user": {
            "type": "user",
            "key": "user:system:admin",
            "displayName": "admin",
            "disabled": false,
            "email": "admin@example.com",
            "login": "admin",
            "idProvider": "system"
        },
        "principals": [
            "role:system.admin",
            "role:system.admin.login",
            "role:system.authenticated",
            "role:system.everyone",
            "user:system:admin"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711101066790
    }
}

/tasks/task/task context:{
    "repository": "system-repo",
    "branch": "master",
    "principals": [
        "role:system.admin"
    ]
}

/wepapp/webapp context:{
    "branch": "draft",
    "repository": "com.enonic.cms.default",
    "authInfo": {
        "user": {
            "type": "user",
            "key": "user:system:admin",
            "displayName": "admin",
            "disabled": false,
            "email": "admin@example.com",
            "login": "admin",
            "idProvider": "system"
        },
        "principals": [
            "role:system.admin",
            "role:system.admin.login",
            "role:system.authenticated",
            "role:system.everyone",
            "user:system:admin"
        ]
    },
    "attributes": {
        "__currentTimeMillis": 1711102301910
    }
}

*/
