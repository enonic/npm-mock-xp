import type {Aggregation} from './aggregation.d';
import type {
	BasicFilters,
	BooleanFilter
} from './filters.d';
import type {Highlight} from './highlight.d';


export interface NodeQueryParams<
	AggregationKeys extends undefined|string = undefined
> {
	/**
	* Start index (used for paging).
	*/
	start?: number;

	/**
	* Number of contents to fetch.
	*/
	count?: number;

	/**
	* Query expression.
	*/
	query?: string;

	/**
	* Query filters
	*/
	filters?: BasicFilters | BooleanFilter;

	/**
	* Sorting expression.
	*/
	sort?: string;

	/**
	* Aggregations expression.
	*/
	aggregations?: AggregationKeys extends undefined
		? {}
		: AggregationKeys extends string
			? Record<AggregationKeys, Aggregation>
			: never

	/**
	* Highlighting config
	*/
	highlight?: Highlight;

	/**
	* Return score calculation explanation.
	*/
	explain?: boolean;
}
