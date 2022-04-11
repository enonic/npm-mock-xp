export interface GetActiveVersionParamObject {
	key :string
}

export interface GetActiveVersionResponseObject {
	versionId :string
	nodeId :string
	nodePath :string
	timestamp :string
}

export type GetActiveVersionResponse = GetActiveVersionResponseObject | null;
