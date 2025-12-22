import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';
import type { EHRSummaryRequest } from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import type { RxAdvisorRequest } from '@/features/rx-advisor/services/rx-advisor.dto';

export const ehrFormToSummaryRequest = (
  data: EHRFormData
): EHRSummaryRequest => {
  return {
    ehr: {
      type: 'vn_moh',
      vn_moh: {
        tong_hop: data.tong_hop,
        chi_tiet_thuoc: data.chi_tiet_thuoc,
        chi_tiet_cls: data.chi_tiet_cls,
        dien_bien_lam_sang: data.dien_bien_lam_sang,
      },
    },
    stream: false,
  };
};

export const ehrFormToRxAdvisorRequest = (
  data: EHRFormData
): RxAdvisorRequest => {
  return {
    ehr: {
      type: 'vn_moh',
      vn_moh: {
        tong_hop: data.tong_hop,
        chi_tiet_thuoc: data.chi_tiet_thuoc,
        chi_tiet_cls: data.chi_tiet_cls,
        dien_bien_lam_sang: data.dien_bien_lam_sang,
      },
    },
    prescription: {
      type: 'vn_moh',
      vn_moh: data.chi_tiet_thuoc,
    },
    stream: false,
  };
};
