import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	CreateBillingSourceCredentials,
	GetBillingHistoryResponse,
	GetBillingSourceResponse,
	GetPaymentMethod,
	InvoiceDetailsResponse,
	UpdateBillingSourceCredentials,
} from "@/features/organization/types/billing";

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBody = (body?: string) => {
	if (!body) return null;

	try {
		return JSON.parse(body) as Record<string, unknown>;
	} catch {
		return null;
	}
};

const toIso = (daysAgo: number) =>
	new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

const billingBaseRoute = API_ROUTES.MANAGEMENT.BILLING;

let mockBillingSource: GetBillingSourceResponse["data"] = {
	billing_source_uid: "bsrc_mock_001",
	organization_id: "org_mock_001",
	source_type: "stripe",
	created_at: toIso(45),
	provider_id: "cus_mock_123",
	name: "Acme Health",
	email: "billing@acme.health",
	phone: "+1-555-0123",
	billing_address: {
		line1: "123 Main St",
		line2: "Suite 12",
		city: "Austin",
		state: "TX",
		postal_code: "78701",
		country: "US",
	},
	default_payment_method: "pm_mock_visa_01",
};

let mockPaymentMethods: GetPaymentMethod[] = [
	{
		id: "pm_mock_visa_01",
		object: "payment_method",
		allow_redisplay: "always",
		billing_details: {
			address: {
				city: "Austin",
				country: "US",
				line1: "123 Main St",
				line2: "Suite 12",
				postal_code: "78701",
				state: "TX",
			},
			email: "billing@acme.health",
			name: "Acme Health",
			phone: "+1-555-0123",
			tax_id: null,
		},
		card: {
			brand: "visa",
			checks: {
				address_line1_check: "pass",
				address_postal_code_check: "pass",
				cvc_check: "pass",
			},
			country: "US",
			display_brand: "visa",
			exp_month: 12,
			exp_year: 2030,
			fingerprint: "fp_mock_visa_01",
			funding: "credit",
			generated_from: null,
			last4: "4242",
			networks: {
				available: ["visa"],
				preferred: null,
			},
			regulated_status: "unregulated",
			three_d_secure_usage: {
				supported: true,
			},
			wallet: null,
		},
		created: Math.floor((Date.now() - 20 * 24 * 60 * 60 * 1000) / 1000),
		customer: "cus_mock_123",
		customer_account: null,
		livemode: false,
		metadata: {},
		type: "card",
	},
];

let mockCredits = 1250.5;

const mockCreditTransactions = Array.from({ length: 15 }, (_, index) => ({
	amount: (index % 2 === 0 ? 100 : 50).toFixed(2),
	description: `Credit top-up #${index + 1}`,
	created_at: toIso(index + 1),
}));

const mockInvoices: InvoiceDetailsResponse["data"][] = Array.from(
	{ length: 12 },
	(_, index) => ({
		invoice_uid: `inv_mock_${String(index + 1).padStart(3, "0")}`,
		billing_period: `2026-${String((index % 12) + 1).padStart(2, "0")}`,
		total_amount: (140 + index * 9.5).toFixed(2),
		paid_at: toIso(index * 9 + 2),
		details: {
			additionalProperty: `Invoice details for cycle ${index + 1}`,
		},
		used_credits: (20 + index * 2.5).toFixed(2),
		line_items: [
			{
				description: "Model usage",
				amount: (80 + index * 4).toFixed(2),
				project_uid: "project_mock_alpha",
			},
			{
				description: "Storage",
				amount: (60 + index * 2).toFixed(2),
				project_uid: "project_mock_beta",
			},
		],
	})
);

const mockTransactions = Array.from({ length: 28 }, (_, index) => ({
	transaction_uid: `txn_mock_${String(index + 1).padStart(3, "0")}`,
	amount: (15 + index * 3.25).toFixed(2),
	date: toIso(index + 10),
	project_uid: index % 2 === 0 ? "project_mock_alpha" : "project_mock_beta",
	details: {
		additionalProperty: `Usage transaction ${index + 1}`,
	},
	captured_at: toIso(index + 9),
	status: index % 5 === 0 ? "pending" : "succeeded",
}));

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/sources/setup_intents(?:\\?.*)?$`
	),
	"post",
	() => ({
		id: "seti_mock_001",
		status: "requires_payment_method",
		clientSecret: "seti_client_secret_mock_001",
		client_secret: "seti_client_secret_mock_001",
	})
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/sources/setup_intents/required_actions(?:\\?.*)?$`
	),
	"get",
	() => ({
		success: true,
		data: [],
	})
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/sources(?:\\?.*)?$`),
	"get",
	() => ({
		success: true,
		data: mockBillingSource,
	})
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/sources(?:\\?.*)?$`),
	"post",
	(options) => {
		const body = parseBody(
			options.body
		) as CreateBillingSourceCredentials | null;

		if (body) {
			mockBillingSource = {
				...mockBillingSource,
				name: body.name,
				email: body.email,
				phone: body.phone,
				billing_address: body.address,
				source_type: body.provider,
			};
		}

		return {
			success: true,
			data: {
				billing_source_uid: mockBillingSource.billing_source_uid,
				organization_id: mockBillingSource.organization_id,
				source_type: "stripe",
				created_at: mockBillingSource.created_at,
			},
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/sources(?:\\?.*)?$`),
	"put",
	(options) => {
		const body = parseBody(
			options.body
		) as UpdateBillingSourceCredentials | null;

		if (body) {
			mockBillingSource = {
				...mockBillingSource,
				email: body.new_email,
				phone: body.new_phone,
				billing_address: body.new_address,
			};
		}

		return {
			success: true,
			data: mockBillingSource,
		};
	}
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/sources/payment_methods(?:\\?.*)?$`
	),
	"get",
	() => mockPaymentMethods
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/sources/payment_method/[^/]+(?:\\?.*)?$`
	),
	"delete",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const paymentMethodId = url.pathname.split("/").at(-1);

		if (paymentMethodId) {
			mockPaymentMethods = mockPaymentMethods.filter(
				(method) => method.id !== paymentMethodId
			);
		}

		return { success: true };
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/credits(?:\\?.*)?$`),
	"get",
	() => ({
		success: true,
		data: {
			amount: mockCredits.toFixed(2),
		},
	})
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/credits(?:\\?.*)?$`),
	"post",
	(options) => {
		const body = parseBody(options.body) as {
			amount?: { value?: number; scale?: number };
			description?: string;
		} | null;

		const rawValue = body?.amount?.value ?? 0;
		const scale = body?.amount?.scale ?? 2;
		const normalizedAmount = rawValue / 10 ** scale;

		mockCredits += normalizedAmount;
		mockCreditTransactions.unshift({
			amount: normalizedAmount.toFixed(2),
			description: body?.description || "Manual credit top-up",
			created_at: new Date().toISOString(),
		});

		return {
			success: true,
			data: {
				amount: mockCredits.toFixed(2),
			},
		};
	}
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/credits/transactions(?:\\?.*)?$`
	),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const offset = Number(url.searchParams.get("offset") || "0");
		const limit = Number(url.searchParams.get("limit") || "10");

		const data = mockCreditTransactions.slice(offset, offset + limit);

		return {
			success: true,
			data,
			total: mockCreditTransactions.length,
			offset,
			limit,
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/invoices(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const offset = Number(url.searchParams.get("offset") || "0");
		const limit = Number(url.searchParams.get("limit") || "10");
		const fromDate = url.searchParams.get("from_date");
		const toDate = url.searchParams.get("to_date");

		let filtered = [...mockInvoices];

		if (fromDate) {
			filtered = filtered.filter((invoice) => invoice.paid_at >= fromDate);
		}

		if (toDate) {
			filtered = filtered.filter((invoice) => invoice.paid_at <= toDate);
		}

		const paginated = filtered.slice(offset, offset + limit);

		const response: GetBillingHistoryResponse = {
			success: true,
			data: paginated.map((invoice) => ({
				invoice_uid: invoice.invoice_uid,
				billing_period: invoice.billing_period,
				total_amount: invoice.total_amount,
				paid_at: invoice.paid_at,
				details: invoice.details,
				used_credits: invoice.used_credits,
			})),
			total: filtered.length,
			offset,
			limit,
		};

		return response;
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/invoices/[^/]+(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const invoiceUid = url.pathname.split("/").at(-1);
		const invoice = mockInvoices.find(
			(item) => item.invoice_uid === invoiceUid
		);

		if (!invoice) {
			return {
				success: false,
				data: null,
			};
		}

		return {
			success: true,
			data: invoice,
		} satisfies InvoiceDetailsResponse;
	}
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/invoices/[^/]+/pay(?:\\?.*)?$`
	),
	"post",
	() => ({
		success: true,
		data: {
			hosted_invoice_url: "https://billing.mock.local/hosted-invoice/mock-001",
		},
	})
);

Mock.mock(
	new RegExp(`^${escapeRegExp(billingBaseRoute)}/transactions(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const offset = Number(url.searchParams.get("offset") || "0");
		const limit = Number(url.searchParams.get("limit") || "10");
		const startDate = url.searchParams.get("start_date");
		const endDate = url.searchParams.get("end_date");

		const queryProjectUids = [
			...url.searchParams.getAll("project_uids"),
			...url.searchParams.getAll("project_uids[]"),
		];

		let filtered = [...mockTransactions];

		if (queryProjectUids.length > 0) {
			filtered = filtered.filter((tx) =>
				queryProjectUids.includes(tx.project_uid)
			);
		}

		if (startDate) {
			filtered = filtered.filter((tx) => tx.date >= startDate);
		}

		if (endDate) {
			filtered = filtered.filter((tx) => tx.date <= endDate);
		}

		const paginated = filtered.slice(offset, offset + limit);

		return {
			success: true,
			data: paginated,
			total: filtered.length,
			offset,
			limit,
		};
	}
);

Mock.mock(
	new RegExp(
		`^${escapeRegExp(billingBaseRoute)}/transactions/[^/]+(?:\\?.*)?$`
	),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const transactionUid = url.pathname.split("/").at(-1);
		const transaction = mockTransactions.find(
			(item) => item.transaction_uid === transactionUid
		);

		if (!transaction) {
			return {
				success: false,
				data: null,
			};
		}

		return {
			success: true,
			data: transaction,
		};
	}
);
