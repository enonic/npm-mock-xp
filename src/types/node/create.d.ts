import type {PermissionsParams} from '../auth';
import type {IndexConfig} from './indexConfig.d';


export interface NodeCreateParams {
	/**
	* Name of content.
	*/
	_name?: string;

	_nodeType? :string;

	/**
	* Path to place content under.
	*/
	_parentPath?: string;

	/**
	* How the document should be indexed. A default value "byType" will be set if no value specified.
	*/
	_indexConfig?: IndexConfig;

	/**
	* The access control list for the node. By default the creator will have full access
	*/
	_permissions?: ReadonlyArray<PermissionsParams>;

	/**
	* true if the permissions should be inherited from the node parent. Default is false.
	*/
	_inheritsPermissions?: boolean;

	/**
	* Value used to order document when ordering by parent and child-order is set to manual
	*/
	_manualOrderValue?: number;

	/**
	* Default ordering of children when doing getChildren if no order is given in query
	*/
	_childOrder?: string;

	[key :string] :unknown
}
