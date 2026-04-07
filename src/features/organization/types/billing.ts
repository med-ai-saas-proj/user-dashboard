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
