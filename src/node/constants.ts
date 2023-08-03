export const INDEX_CONFIG_DEFAULT = {
	analyzer: "document_index_default",
	default: {
		decideByType: true,
		enabled: true,
		nGram: false,
		fulltext: false,
		includeInAllText: false,
		path: false,
		indexValueProcessors: [],
		languages: [],
	},
	configs: [
		{
			path: "data.siteConfig.applicationkey",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "x.*",
			config: {
				decideByType: true,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "attachment.text",
			config: {
				decideByType: false,
				enabled: true,
				nGram: true,
				fulltext: true,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "type",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "site",
			config: {
				decideByType: false,
				enabled: false,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "owner",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "modifier",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "modifiedTime",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "data",
			config: {
				decideByType: true,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "creator",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "createdTime",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
		{
			path: "attachment",
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false,
				indexValueProcessors: [],
				languages: [],
			},
		},
	],
};

export const PERMISSIONS_DEFAULT = [
	{
		principal: "role:system.admin",
		allow: [
			"READ",
			"CREATE",
			"MODIFY",
			"DELETE",
			"PUBLISH",
			"READ_PERMISSIONS",
			"WRITE_PERMISSIONS",
		],
		deny: [],
	},
	{
		principal: "role:cms.admin",
		allow: [
			"READ",
			"CREATE",
			"MODIFY",
			"DELETE",
			"PUBLISH",
			"READ_PERMISSIONS",
			"WRITE_PERMISSIONS",
		],
		deny: [],
	},
	{
		principal: "role:cms.cm.app",
		allow: ["READ"],
		deny: [],
	},
];