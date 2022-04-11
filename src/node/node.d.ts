import type { PermissionsParams } from '../auth';
import type { IndexConfig } from './indexConfig.d';


export interface RepoNode {
	_childOrder :string;
	_id :string;
	_indexConfig :IndexConfig;
	_inheritsPermissions :boolean;
	_name :string;
	_nodeType :string;
	_path :string;
	_permissions :ReadonlyArray<PermissionsParams>;
	_state :string;
	_versionKey :string;
	_ts :string;
}

export interface RepoNodeWithData extends RepoNode {
	[key :string] :unknown
}
