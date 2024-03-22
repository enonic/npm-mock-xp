import {App} from './App';
import {Resource} from './Resource';


// An asset is a file inside the an app.
export class Asset extends Resource {
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
