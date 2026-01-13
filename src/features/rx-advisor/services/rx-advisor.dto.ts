import type {
  ChiTietCLS,
  ChiTietThuoc,
  DienBienLamSang,
  TongHop,
} from '@/features/pg-ehr-summary/ehr-form.type';

export type RxChatRequest = {
  conversation_id?: string | null;
  model: string;
  stream?: boolean;
  ehr: RxAdvisorRequest['ehr'];
  prescription: RxAdvisorRequest['prescription'];
};

export type ModelResponseContent = {
  type: 'text' | 'thinking';
  content: string;
  citations?: Array<{
    reference_type: string;
    reference_url: string;
    reference_text: string;
  }>;
};

export type RxChatResponse = {
  id: string;
  conversation_id: string;
  status: 'completed' | 'failed' | 'processing';
  error?: {
    code: string;
    message: string;
    reason?: string;
  };
  output: ModelResponseContent[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
};

export type RxAdvisorRequest = {
  ehr: {
    type: 'vn_moh';
    vn_moh: {
      tong_hop: TongHop;
      chi_tiet_thuoc: ChiTietThuoc[];
      chi_tiet_cls: ChiTietCLS[];
      dien_bien_lam_sang: DienBienLamSang[];
    };
  };
  prescription: {
    type: 'vn_moh';
    vn_moh: ChiTietThuoc[];
  };
  stream?: boolean;
};
export type UsedTool = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
};
export type RxAdvisorResponse = {
  analysis: string;
  reasoning: string | null;
  used_tools: UsedTool[];
};
