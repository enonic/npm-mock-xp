import type {
	Node,
	NodeConfigEntry,
	NodeIndexConfig,
	Permission,
} from '@enonic-types/lib-node';


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
				key: string;
			}[]
		}>;
		data: DATA;
		indexConfigs: Pick<NodeIndexConfig, 'analyzer'> & {
			allTextIndexConfig: string;
			defaultConfig: Partial<NodeConfigEntry>;
			pathIndexConfigs: {
				pathIndexConfig: {
					indexConfig: Partial<NodeConfigEntry>;
					path: string;
				}[]
			};
		};
	}
}
