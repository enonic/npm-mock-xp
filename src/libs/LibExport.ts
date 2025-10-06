// import type {  } from '@enonic-types/core';
import type {
	AccessControlEntry,
	Node,
	NodeConfigEntry,
	NodeIndexConfig,
	NodePropertiesOnCreate,
	Permission,
} from '@enonic-types/lib-node';
import type {
	// ExportNodesError,
	// ExportNodesParams,
	// ExportNodesResult,
	// ImportNodesError,
	ImportNodesParams,
	ImportNodesResult,
	// ResourceKey,
	// exportNodes,
	// importNodes
} from '@enonic-types/lib-export';
import type { Server } from '../implementation/Server';

import { isStringLiteral } from '@enonic/js-utils/value/isStringLiteral';
import { forceArray } from '@enonic/js-utils';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import {
	basename,
	dirname,
	// extname,
	join,
	normalize,
	// relative,
	resolve,
	sep,
} from 'path';
import { sortZipEntries } from './export/sortZipEntries';
import { UUID_NIL } from '../constants';

const parser = new XMLParser();


const TRACE = false;


type EnonicArray<T> = T | T[];

interface NodeXML<DATA extends Record<string, unknown> = Record<string, unknown>> {
	node: {
		id: Node['_id'];
		childOrder: Node['_childOrder'];
		nodeType: Node['_nodeType'];
		timestamp: Node['_ts'];
		inheritPermissions: Node['_inheritsPermissions'];
		permissions: EnonicArray<{
			principal: {
				allow: {
					value: EnonicArray<Permission>
				}
				deny: string;
			}[]
		}>;
		data: DATA;
		// TODO This is not perfect yet
		indexConfigs: Omit<NodeIndexConfig, 'default'> & {
			allTextIndexConfig: string;
			defaultConfig: NodeConfigEntry;
			pathIndexConfigs: string;
		};
	}
}

interface Entry {
	absPath: string;
	isDirectory: boolean;
	name: string;
	nodeParentPath: string;
}


const EXPORT_UUID_NIL = '000-000-000-000';


function isDirectory(path: string) {
	try {
		return statSync(path).isDirectory();
	} catch (err) {
		return false; // Path doesn't exist or other error
	}
}

function isFile(path: string) {
	try {
		return statSync(path).isFile();
	} catch (err) {
		return false; // Path doesn't exist or other error
	}
}


function listDirSync(
	dirPath: string,
	nodeParentPath: string,
	// relativeFrom?: string,
): Entry[] {
	return readdirSync(dirPath, {
		// recursive: true,
		// encoding: 'utf-8',
		withFileTypes: true
	}).map(entry => {
		// console.log(entry);
		const absPath = join(dirPath, entry.name);
		return {
			absPath,
			isDirectory: entry.isDirectory(),
			name: entry.name,
			nodeParentPath,
			// relative: relative(relativeFrom || dirPath, absPath),
		}
	}).sort(({name}, {name: nameB}) => name.localeCompare(nameB));
}


function xmlStringToObj<T>(xmlString: string): T {
	return parser.parse(xmlString);
}


function xmlFileToObj<T>(absFilePath: string): T {
	const xmlString = readFileSync(absFilePath, 'utf-8');
	return xmlStringToObj<T>(xmlString);
}


function nodeXmlToNode<
	DATA extends Record<string, unknown> = Record<string, unknown>
>(nodeXml: NodeXML<DATA>): Node<DATA> {
	const { node } = nodeXml;
	const {
		id,
		childOrder,
		data,
		indexConfigs,
		inheritPermissions,
		nodeType,
		permissions,
		timestamp
	} = node;
	const { defaultConfig } = indexConfigs;
	const accessControlEntries: AccessControlEntry[] = forceArray(permissions).map(({
		principal
	}) => {
		const allowArray: Permission[] = [];
		for (const {allow/*, deny*/} of principal) {
			const { value } = allow;
			const values = forceArray(value);
			for (const permission of values) {
				if (!allowArray.includes(permission)) {
					allowArray.push(permission);
				}
			}
		}
		return {
			principal: 'role:system.admin',
			allow: allowArray,
			deny: []
		};
	});
	return {
		_id: id,
		_childOrder: childOrder,
		_indexConfig: {
			default: defaultConfig,
			configs: [], // TODO
		},
		_inheritsPermissions: inheritPermissions,
		_nodeType: nodeType,
		_permissions: accessControlEntries,
		_ts: timestamp,
		data,
		// _name: undefined, // NOTE: Not in node.xml
		// _path: undefined, // NOTE: Not in node.xml
		_state: 'DEFAULT', // TODO, Not in node.xml?
		// _versionKey: undefined // NOTE: Can't be used anyway
	} as unknown as Node<DATA>;
}

export class LibExport {
	readonly sandboxAbsPath: string;
	readonly server: Server;


	private _importRootNode({
		importNodesResult,
		includePermissions,
		rootXmlObj,
	}: {
		importNodesResult: ImportNodesResult;
		includePermissions: boolean;
		rootXmlObj: NodeXML<Record<string, unknown>>;
	}) {
		const rootXmlNode = nodeXmlToNode(rootXmlObj);
		if (TRACE) this.server.log.debug('rootNode:%s', rootXmlNode);

		if (rootXmlNode._id !== EXPORT_UUID_NIL) {
			throw new Error(`MockXP importNodes: Only supports "root" exports!`);
		}

		rootXmlNode._path = '/'

		if (TRACE) {
			const rootNode = this.server.getNode({
				branchId: this.server.context.branch,
				key: UUID_NIL,
				repoId: this.server.context.repository,
			});
			this.server.log.debug('rootNode:%s', rootNode);
		}

		this.server.modifyNode({
			branchId: this.server.context.branch,
			key: UUID_NIL,
			repoId: this.server.context.repository,
			editor: (node) => {
				node._childOrder = rootXmlNode._childOrder;
				node._indexConfig = rootXmlNode._indexConfig;
				// NOTE: ASFAIK Root node can't have _manualOrderValue
				if (includePermissions) {
					node._inheritsPermissions = rootXmlNode._inheritsPermissions;
					node._permissions = rootXmlNode._permissions;
				}
				node._ts = rootXmlNode._ts;
				// NOTE: _versionKey is automatically incremented on modify
				return node;
			}
		});
		importNodesResult.updatedNodes.push(UUID_NIL);

		if (TRACE) {
			const modifiedRootNode = this.server.getNode({
				branchId: this.server.context.branch,
				key: UUID_NIL,
				repoId: this.server.context.repository,
			});
			this.server.log.debug('modifiedRootNode:%s', modifiedRootNode);
		}
	} // _importRootNode


	private _importNode({
		importNodesResult,
		includeNodeIds,
		includePermissions,
		name,
		parentPath,
		xmlObj,
	}: {
		importNodesResult: ImportNodesResult;
		includeNodeIds: boolean;
		includePermissions: boolean;
		name: string;
		parentPath: string;
		xmlObj: NodeXML<Record<string, unknown>>;
	}): Node | undefined {
		const xmlNode = nodeXmlToNode(xmlObj);
		if (TRACE) this.server.log.debug('xmlNode:%s', xmlNode);

		const createNodeParams: NodePropertiesOnCreate & { _id?: string; }= {
			_childOrder: xmlNode._childOrder,
			_indexConfig: xmlNode._indexConfig,
			_manualOrderValue: xmlNode._manualOrderValue,
			_name: name,
			_nodeType: xmlNode._nodeType,
			_parentPath: parentPath,
			_state: xmlNode._state,
			_ts: xmlNode._ts,
			// _versionKey: xmlNode._versionKey, // NOTE: Doesn't work, which is ok.
		}

		if (includeNodeIds) {
			// TODO This works, but uncertain what happens to internal logics...
			createNodeParams._id = xmlNode._id;
		}

		if (includePermissions) {
			createNodeParams._inheritsPermissions = xmlNode._inheritsPermissions;
			createNodeParams._permissions = xmlNode._permissions;
		}

		try {
			const createdNode = this.server.createNode({
				branchId: this.server.context.branch,
				repoId: this.server.context.repository,
				node: createNodeParams
			});
			if (TRACE) this.server.log.debug('createdNode:%s', createdNode);
			importNodesResult.addedNodes.push(createdNode._id);
			return createdNode;
		} catch (error) {
			if (error instanceof Error) {
				importNodesResult.importErrors.push({
					exception: `${error}`,
					message: error.message,
					stacktrace: [],
				});
			} else {
				importNodesResult.importErrors.push({
					exception: `${error}`,
					message: 'Unknown error',
					stacktrace: [],
				});
			}
		} // try/catch
		return undefined;
	} // _importNode


	private _importFromExportFolder({
		includeNodeIds,
		includePermissions,
		source,
	}: {
		includeNodeIds: boolean;
		includePermissions: boolean;
		source: string;
	}) {
		const exportAbsPath = resolve(this.sandboxAbsPath, 'home/data/export', source);
		if (!isDirectory(exportAbsPath)) {
			throw new Error(`importNodes: Export not found at ${exportAbsPath}!`);
		}

		const entries = listDirSync(exportAbsPath, '/');
		if (TRACE) this.server.log.debug('entries:%s', entries);

		const firstDir = entries.shift();
		if (firstDir.name !== '_') {
			throw new Error(`MockXP importNodes: Only supports "root" exports!`);
		}

		const rootXmlObj = xmlFileToObj<NodeXML>(join(firstDir.absPath,'node.xml'));
		if (TRACE) this.server.log.debug('rootXmlObj:%s', rootXmlObj);

		const importNodesResult: ImportNodesResult = {
			addedNodes: [],
			updatedNodes: [],
			importedBinaries: [],
			importErrors: [{
				exception: '',
				message: '',
				stacktrace: [],
			}],
		}

		this._importRootNode({
			importNodesResult,
			includePermissions,
			rootXmlObj,
		});

		function handleDirectory(this: LibExport, entries: Entry[]) {
			const subDirs: Entry[][] = [];
			for (
				const {
					absPath,
					isDirectory,
					name,
					nodeParentPath,
					// relative,
				} of entries
			) {
				if (isDirectory) {
					const xmlObj = xmlFileToObj<NodeXML>(join(absPath,'_/node.xml'));
					if (TRACE) this.server.log.debug('xmlObj:%s', xmlObj);

					const createdNode = this._importNode({
						importNodesResult,
						includeNodeIds,
						includePermissions,
						name,
						parentPath: nodeParentPath,
						xmlObj,
					});

					if (createdNode) { // Count skipped subdirs as importErrors?
						const subDir = listDirSync(join(absPath), createdNode._path);
						if (TRACE) this.server.log.debug('subDir:%s', subDir);
						subDir.shift(); // Remove '_'
						subDirs.push(subDir)
					}
				} // isDirectory
			} // for entry of entries

			for (const subDir of subDirs) {
				handleDirectory.call(this, subDir); // Recurse
			}
		} // handleDirectory

		handleDirectory.call(this, entries);

		if (TRACE) this.server.log.debug('importNodesResult:%s', importNodesResult);
		return importNodesResult;
	}

	private _importFromZipFile({
		includeNodeIds,
		includePermissions,
		zipFilePath,
	}: {
		includeNodeIds: boolean;
		includePermissions: boolean;
		zipFilePath: string
	}) {
		let zip: AdmZip;
		let zipEntries: AdmZip.IZipEntry[];
		try {
			zip = new AdmZip(zipFilePath);
			zipEntries = sortZipEntries(zip.getEntries(), {
				prioritizeShorter: true
			});
			if (TRACE) this.server.log.debug(`${zipFilePath} is a valid ZIP file.`);
		} catch (error) {
			// this.server.log.error('%s is not a valid ZIP file:%s', source, error.message);
			throw new Error(`${zipFilePath} is not a valid ZIP file!`);
		}

		const rootEntry = zipEntries.shift();
		const rootXmlString = zip.readAsText(rootEntry)
		if (TRACE) this.server.log.debug('rootXmlString:%s', rootXmlString);

		const rootXmlObj = xmlStringToObj<NodeXML>(rootXmlString);
		if (TRACE) this.server.log.debug('rootXmlObj:%s',rootXmlObj);

		const importNodesResult: ImportNodesResult = {
			addedNodes: [],
			updatedNodes: [],
			importedBinaries: [],
			importErrors: [{
				exception: '',
				message: '',
				stacktrace: [],
			}],
		}

		this._importRootNode({
			importNodesResult,
			includePermissions,
			rootXmlObj,
		});

		// this.server.log.debug('entries:%s', entries);
		for (const zipEntry of zipEntries) {
			const {
				entryName,
				// header,
				isDirectory
			} = zipEntry;
			// this.server.log.debug('entryName:%s', entryName);
			const fileName = basename(entryName);
			let nodePath = dirname(entryName);

			const pathComponents = normalize(nodePath).split(sep);
			if (pathComponents.length < 2) {
				if (TRACE) this.server.log.debug('pathComponents:%s', pathComponents);
				continue; // Skip "top" folder with same name as zip file.
			}

			nodePath = `/${pathComponents.length > 1 ? pathComponents.slice(1,-1).join(sep): nodePath}`;
			if (TRACE) this.server.log.debug('nodePath:%s', nodePath);

			const nodeParentPath = dirname(nodePath);
			const nodeName = basename(nodePath);

			// const fileExtension = extname(fileName).toLowerCase();
			// const extensionWithoutDot = fileExtension ? fileExtension.slice(1) : 'unknown';
			// this.server.log.debug('zipEntry:%s', zipEntry);
			// this.server.log.debug('isDirectory:%s', isDirectory);
			// this.server.log.debug('header:%s', header);
			// this.server.log.debug('size:%s', header.size);
			// this.server.log.debug('rawEntryName:%s', zipEntry.rawEntryName); // Array of numbers

			if (!isDirectory && fileName === 'node.xml') {
				const xmlString = zip.readAsText(zipEntry)
				if (TRACE) this.server.log.debug('xmlString:%s', xmlString);

				const xmlObj = xmlStringToObj<NodeXML>(xmlString);
				if (TRACE) this.server.log.debug('%s %s %s xmlObj:%s', nodePath, nodeParentPath, nodeName, xmlObj);

				// const createdNode =
				this._importNode({
					importNodesResult,
					includeNodeIds,
					includePermissions,
					name: nodeName,
					parentPath: nodeParentPath,
					xmlObj,
				});
			}
		} // for zipEntries

		return importNodesResult;
	} // _importFromZipFile

	constructor({
		sandboxName,
		server
	}: {
		sandboxName?: string;
		server: Server;
	}) {
		if (sandboxName) {
			this.sandboxAbsPath = resolve(homedir(),'.enonic/sandboxes', sandboxName);
			if (!isDirectory(this.sandboxAbsPath)) {
				throw new Error(`LibExport constructor: Sandbox not found at ${this.sandboxAbsPath}!`);
			}
		}
		this.server = server;
	} // constructor


	public importNodes({
		source, // Either name of nodes-export located in exports directory or application resource key
		targetNodePath, // TODO: Target path for imported nodes
		xslt, // XSLT file name in exports directory or application resource key. Used for XSLT transformation
		xsltParams, // Parameters used in XSLT transformation
		includeNodeIds = true, // TODO: Set to true to use node IDs from the import, false to generate new node IDs
		includePermissions = false, // TODO: Set to true to use Node permissions from the import, false to use target node permissions
		nodeImported, // A function to be called during import with number of nodes imported since last call
		nodeResolved, // A function to be called during import with number of nodes imported since last call
	}: Omit<ImportNodesParams, 'targetNodePath'> & { targetNodePath?: string }): ImportNodesResult {
		if (targetNodePath) {
			this.server.log.warning('MockXP importNodes: targetNodePath not supported yet, using "/".');
		}

		if (xslt) {
			this.server.log.warning('MockXP importNodes: xslt ignored, not supported.');
		}

		if (xsltParams) {
			this.server.log.warning('MockXP importNodes: xsltParams ignored, not supported.');
		}

		if (nodeImported) {
			this.server.log.warning('MockXP importNodes: nodeImported ignored, not supported yet.');
		}

		if (nodeResolved) {
			this.server.log.warning('MockXP importNodes: nodeResolved ignored, not supported yet.');
		}

		if (!isStringLiteral(source)) {
			throw new Error(`importNodes: source must be a string!`);
		}

		if (isFile(source)) {
			return this._importFromZipFile({
				includeNodeIds,
				includePermissions,
				zipFilePath: source
			});
		}

		return this._importFromExportFolder({
			includeNodeIds,
			includePermissions,
			source,
		});
	} // importNodes

} // LibExport
