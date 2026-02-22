export type ConvertRequest = {
	data: string;
	validate_output?: boolean;
};

export type ConvertResponse = {
	success: boolean;
	source_format: string;
	message_type: string;
	bundle: Record<string, unknown> | null;
	resource_count: number;
	errors: string[];
	validation_errors: Array<{
		resource_type?: string;
		entry_index?: number;
		field?: string;
		message?: string;
	}>;
};

export type ReverseConvertRequest = {
	bundle: Record<string, unknown>;
	message_type: string;
};

export type ReverseConvertResponse = {
	success: boolean;
	output: string;
	output_format: string;
	message_type: string;
	errors: string[];
};

export type ValidateRequest = {
	bundle: Record<string, unknown>;
};

export type ValidateResponse = {
	valid: boolean;
	errors: Array<Record<string, unknown>>;
};

export type BatchConvertRequest = {
	items: string[];
	validate_output?: boolean;
	workers?: number | null;
};

export type BatchItemResult = {
	index: number;
	filename?: string;
	success: boolean;
	source_format: string;
	message_type: string;
	resource_count: number;
	errors: string[];
};

export type BatchConvertResponse = {
	total: number;
	succeeded: number;
	failed: number;
	resource_count: number;
	elapsed_ms: number;
	throughput_per_sec: number;
	results: BatchItemResult[];
};

export type FhirEntry = {
	fullUrl?: string;
	resource?: {
		resourceType?: string;
		id?: string;
		name?: Array<{ family?: string; given?: string[] }>;
		gender?: string;
		status?: string;
		class?: { code?: string };
		code?: {
			text?: string;
			coding?: Array<{ display?: string; code?: string; system?: string }>;
		};
		medicationCodeableConcept?: {
			text?: string;
			coding?: Array<{ display?: string }>;
		};
		vaccineCode?: {
			text?: string;
			coding?: Array<{ display?: string }>;
		};
		[key: string]: unknown;
	};
};
