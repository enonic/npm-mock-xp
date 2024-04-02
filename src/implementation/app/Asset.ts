import {App} from '../App';
import {Resource} from './Resource';


// An asset is a file inside the an app.
export class Asset extends Resource {
	static path = '/assets';

	static prefixPath(path: string) {
		return `${Asset.path}/${path}`;
	}

	constructor({
		app,
		path,
	}: {
		app: App
		path: string
	}) {
		super({
			app,
			path: Asset.prefixPath(path),
		});
	}
} // class Controller
