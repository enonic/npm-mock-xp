import type { PermissionsParams } from '../auth';
import type { IndexConfig } from './indexConfig.d';


export interface RepoNode {
	_childOrder: string; // in CommonNodeProperties
	_id: string; // in NodePropertiesOnRead
	_indexConfig: IndexConfig; // similar in NodePropertiesOnRead
	_inheritsPermissions: boolean; // in CommonNodeProperties
	// _manualOrderValue?: number; // in CommonNodeProperties // TODO is missing here...
	_name: string; // in CommonNodeProperties
	_nodeType: string; // in CommonNodeProperties
	_path: string; // in CommonNodeProperties
	_permissions: ReadonlyArray<PermissionsParams>;  // similar in CommonNodeProperties
	_state: string; // in CommonNodeProperties
	_versionKey: string; // in CommonNodeProperties
	_ts: string; // in CommonNodeProperties
}

export type RepoNodeWithData<NodeData = Record<string, unknown>> = RepoNode & NodeData;
