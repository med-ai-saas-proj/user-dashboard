import type {
	ChiTietCLS,
	ChiTietThuoc,
	DienBienLamSang,
	TongHop,
} from "@/features/pg-ehr-summary/ehr-form.type";

export type EHRSummaryRequest = {
	ehr: {
		type: "vn_moh";
		vn_moh: {
			tong_hop: TongHop;
			chi_tiet_thuoc: ChiTietThuoc[];
			chi_tiet_cls: ChiTietCLS[];
			dien_bien_lam_sang: DienBienLamSang[];
		};
	};
	stream?: boolean;
};

export type EHRSummaryStreamRequest = {
	conversation_id?: string | null;
	model: string;
	stream?: boolean;
	input_ehr: {
		type: "vn_moh";
		vn_moh: {
			tong_hop: TongHop;
			chi_tiet_thuoc: ChiTietThuoc[];
			chi_tiet_cls: ChiTietCLS[];
			dien_bien_lam_sang: DienBienLamSang[];
		};
	};
};

export type EHRSummaryResponse = {
	summary: string;
};
