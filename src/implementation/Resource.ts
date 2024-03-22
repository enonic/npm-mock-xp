import {App} from './App';


// A resource is a file inside the an app.
export class Resource {
	app: App;
	path: string;

	constructor({
		app,
		path,
	}: {
		app: App
		path: string
	}) {
		this.app = app;
		this.path = path;
	}

	// TODO public getSize() {}
	// TODO public getStream() {}
} // class Controller
