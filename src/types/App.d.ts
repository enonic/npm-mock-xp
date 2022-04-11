interface AppConfigObject {
	[key :string] :unknown
}

export interface App {
	readonly config :AppConfigObject
	readonly name :string
	readonly version :string
}
