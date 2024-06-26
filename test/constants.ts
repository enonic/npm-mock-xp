export const BUN = typeof Bun !== "undefined";

export const LEA_JPG_BYTE_SIZE = BUN ? 526283 : 528238;
export const LEA_SHA512 = BUN
	? 'f5393aa9c2ad99470e4939e13552b41edaa61f8dd3655e8e40772add31cdc3cb1fe74f082f2da51b479675eb1b53057dacc9c4292b76f5288fb68233b3e00fd7'
	: '1e0d4653a413fffbbc3f4d643882365ac7b7dd34e7a04c021bffae386efda44960d02a48a4f20eb22878e020a7e0439433f6ab232cb09b41ca511679e077394e';
export const THUR_BYTE_SIZE = BUN ? 186328 : 187348;
export const JEFF_JPG_BYTE_SIZE = BUN ? 813299 : 816634;
