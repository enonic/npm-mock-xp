import type {
	IdProviderKey,
	VirtualHost as VirtualHostInterface,
} from '@enonic-types/lib-vhost';


export type {
	IdProviderKey,
} from '@enonic-types/lib-vhost';

export class VirtualHost implements VirtualHostInterface {
	public defaultIdProviderKey?: string;
	public host: string;
	public idProviderKeys?: IdProviderKey[];
	public name: string;
	public source: string;
	public target: string;

	constructor({
		defaultIdProviderKey = 'system',
		host = 'localhost',
		idProviderKeys = [{
			idProviderKey: defaultIdProviderKey,
		}],
		name,
		source,
		target,
	}: Omit<VirtualHostInterface, 'host'> & { host?: string; }) {
		if (!/^[A-Za-z0-9-]+$/.test(name)) throw new Error(`name:${name} doesn't match /^[A-Za-z0-9-]$/!`);
		if (!source.startsWith('/')) throw new Error(`source:${source} is not an absolute path!`);
		if (!target.startsWith('/')) throw new Error(`target:${target} is not an absolute path!`);
		this.defaultIdProviderKey = defaultIdProviderKey;
		this.host = host;
		this.idProviderKeys = idProviderKeys;
		this.name = name;
		this.source = source;
		this.target = target;
	}
}
