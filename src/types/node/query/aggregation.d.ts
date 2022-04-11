export interface TermsAggregationParams {
	field :string;
	order? :string; // _term ASC
	size? :number; // Default to 10
	minDocCount? :number;
}

export interface TermsAggregation {
	terms :TermsAggregationParams;
	aggregations? :{
		[subaggregation :string] :Aggregation;
	};
}

export interface StatsAggregationParams {
	field :string;
	order? :string;
	size? :number;
}

export interface StatsAggregation {
	stats :StatsAggregationParams;
	aggregations? :{
		[subaggregation :string] :Aggregation;
	};
}

export interface RangeAggregation {
	range: {
		field: string;
		ranges?: Array<{
			from?: number;
			to?: number;
		}>;
		range?: {
			from: number;
			to: number;
		};
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

export interface GeoDistanceAggregation {
	geoDistance: {
		field: string;
		ranges?: Array<{
			from?: number;
			to?: number;
		}>;
		range?: {
			from: number;
			to: number;
		};
		unit: string;
		origin: {
			lat: string;
			lon: string;
		};
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

export interface DateRangeAggregation {
	dateRange: {
		field: string;
		format: string;
		ranges: Array<{
			from?: string;
			to?: string;
		}>;
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

export interface DateHistogramAggregation {
	dateHistogram: {
		field: string;
		interval: string;
		minDocCount: number;
		format: string;
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

/**
* @since 7.7.0
*/
export interface MinAggregation {
	min: {
		field: string;
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

/**
* @since 7.7.0
*/
export interface MaxAggregation {
	max: {
		field: string;
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

/**
* @since 7.7.0
*/
export interface ValueCountAggregation {
	count: {
		field: string;
	};
	aggregations?: {
		[subaggregation: string]: Aggregation;
	};
}

export type Aggregation =
	| TermsAggregation
	| StatsAggregation
	| RangeAggregation
	| GeoDistanceAggregation
	| DateRangeAggregation
	| DateHistogramAggregation
	| MinAggregation
	| MaxAggregation
	| ValueCountAggregation;


export type Aggregations<
	AggregationKeys extends undefined|string = undefined
> = AggregationKeys extends undefined
	? {}
	: AggregationKeys extends string
		? Record<AggregationKeys, Aggregation>
		: never;


export interface AggregationsResponseBucket {
	readonly docCount: number;
	readonly key: string;
	readonly from?: number | string;
	readonly to?: number | string;

	readonly [key2: string]: any; // sub aggregations
}

export interface AggregationsResponseEntry {
	readonly buckets: Array<AggregationsResponseBucket>;

	// Max, Min, Value Count
	readonly value? :number

	// Stats
	readonly avg? :number
	readonly count? :number
	readonly max? :number
	readonly min? :number
	readonly sum? :number
}

export type AggregationsResponse<
	AggregationKeys extends undefined|string = undefined
> = AggregationKeys extends undefined
	? {}
	: AggregationKeys extends string
		? Record<AggregationKeys, AggregationsResponseEntry>
		/*? {
			[AggregationKey in AggregationKeys]: AggregationsResponseEntry
		}*/
		: never;
