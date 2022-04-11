export interface Highlight {
	encoder?: "default" | "html";
	fragmenter?: "simple" | "span";
	fragmentSize?: number;
	numberOfFragments?: number;
	noMatchSize?: number;
	order?: "score" | "none";
	preTag?: string;
	postTag?: string;
	requireFieldMatch?: boolean;
	tagsSchema?: string;
	properties?: Record<string, Highlight>; // Yes it's optional, no error will occur, but no highilights returned either
}
