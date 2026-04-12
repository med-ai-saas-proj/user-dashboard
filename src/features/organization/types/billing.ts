// Billing Profile

export type CreateBillingSourceCredentials = {
	name: string;
	email: string;
	phone: string;
	address: {
		line1: string;
		line2: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	};
	provider: "stripe";
};

export type CreateBillingSourceResponse = {
	success: boolean;
	data: {
		billing_source_uid: string;
		organization_id: string;
		source_type: "stripe";
		created_at: string;
	};
};

export type UpdateBillingSourceCredentials = {
	new_address: {
		line1: string;
		line2: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	};
	new_email: string;
	new_phone: string;
};

export type GetBillingSourceResponse = {
	success: boolean;
	data: {
		billing_source_uid: string;
		organization_id: string;
		source_type: string;
		created_at: string;
		provider_id: string;
		email: string;
		phone: string;
		name: string;
		billing_address: {
			line1: string;
			line2: string;
			city: string;
			state: string;
			postal_code: string;
			country: string;
		};
	};
};

export type GetPaymentMethod = {
	id: string;
	object: "payment_method";
	allow_redisplay: string;
	billing_details: {
		address: {
			city: string | null;
			country: string | null;
			line1: string | null;
			line2: string | null;
			postal_code: string | null;
			state: string | null;
		};
		email: string | null;
		name: string | null;
		phone: string | null;
		tax_id: string | null;
	};
	card: {
		brand: string;
		checks: {
			address_line1_check: string | null;
			address_postal_code_check: string | null;
			cvc_check: string | null;
		};
		country: string;
		display_brand: string;
		exp_month: number;
		exp_year: number;
		fingerprint: string;
		funding: string;
		generated_from: null;
		last4: string;
		networks: {
			available: string[];
			preferred: string | null;
		};
		regulated_status: string;
		three_d_secure_usage: {
			supported: boolean;
		};
		wallet: null;
	};
	created: number;
	customer: string;
	customer_account: string | null;
	livemode: boolean;
	metadata: Record<string, unknown>;
	type: "card";
};

export type GetBillingHistoryResponse = {
	success: boolean;
	data: {
		invoice_uid: string;
		billing_period: string;
		total_amount: string;
		paid_at: string;
		details: {
			additionalProperty: string;
		};
		used_credits: string;
	}[];
	total: number;
	offset: number;
	limit: number;
};

export type BillingHistory = {
	success: boolean;
	data: {
		invoiceUID: string;
		billingPeriod: string;
		totalAmount: string;
		paidAt: string;
		details: {
			additionalProperty: string;
		};
		usedCredits: string;
	}[];
	total: number;
	offset: number;
	limit: number;
};

export type PayInvoiceResponse = {
	success: boolean;
	data: {
		hosted_invoice_url: "string";
	};
};

export type PayInvoice = {
	success: boolean;
	data: {
		hostedInvoiceUrl: string;
	};
};

export type InvoiceDetailsResponse = {
	success: boolean;
	data: {
		invoice_uid: string;
		billing_period: string;
		total_amount: string;
		paid_at: string;
		details: {
			additionalProperty: string;
		};
		used_credits: string;
		line_items: {
			description: string;
			amount: string;
			project_uid: string;
		}[];
	};
};

export type InvoiceDetails = {
	success: boolean;
	data: {
		invoiceUID: string;
		billingPeriod: string;
		totalAmount: string;
		paidAt: string;
		details: {
			additionalProperty: string;
		};
		usedCredits: string;
		lineItems: {
			description: string;
			amount: string;
			projectUID: string;
		}[];
	};
};

export type Credits = {
	success: boolean;
	data: {
		amount: string;
	};
};

export type CreditTransactions = {
	success: boolean;
	data: {
		amount: string;
		description: string;
		created_at: string;
	}[];
	total: number;
	offset: number;
	limit: number;
};

export type BillingTransactions = {
	success: boolean;
	data: {
		transaction_uid: string;
		amount: string;
		date: string;
		project_uid: string;
		details: {
			additionalProperty: string;
		};
		captured_at: string;
		status: string;
	}[];
	total: number;
	offset: number;
	limit: number;
};

export type BillingTransactionDetails = {
	success: boolean;
	data: {
		transaction_uid: string;
		amount: string;
		date: string;
		project_uid: string;
		details: {
			additionalProperty: string;
		};
		captured_at: string;
		status: string;
	};
};
