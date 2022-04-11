interface AppConfigObject {
	[key :string] :unknown
}

export interface App {
	readonly config :AppConfigObject
	readonly name :string
	readonly version :string
}

export interface Log {
	debug(message :string, ...args :unknown[]) :void
	error(message :string, ...args :unknown[]) :void
	info(message :string, ...args :unknown[]) :void
	warning(message :string, ...args :unknown[]) :void
}
