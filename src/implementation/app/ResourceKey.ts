import type {
	ResourceKey as ResourceKeyInterface,
} from '@enonic-types/core';


export class ResourceKey implements ResourceKeyInterface {
	private applicationKey: string;
	private path: string;

	constructor({
		applicationKey,
		path,
	}: {
		applicationKey: string
		path: string
	}) {
		this.applicationKey = applicationKey;
		this.path = path;
	}

	public getApplicationKey(): string {
		return this.applicationKey;
	}

	public getPath(): string {
		return this.path;
	}

	public getUri(): string {
		return `${this.applicationKey}:${this.path}`;
	}

	public isRoot(): boolean {
		return this.path === '/';
	}

	public getName(): string {
		if (this.isRoot()) {
			return '';
		}
		const pos = this.path.lastIndexOf( '/' );
		return this.path.substring(pos + 1);
	}

	public getExtension(): string {
		const pos = this.path.lastIndexOf( '.' );
		return pos > 0 ? this.path.substring( pos + 1 ) : null;
	}
}
