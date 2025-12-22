import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/shadcn/field';
import { Input } from '@/components/shadcn/input';
import { Textarea } from '@/components/shadcn/textarea';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';

type PatientInfoSectionProps = {
  register: UseFormRegister<EHRFormData>;
  errors: FieldErrors<EHRFormData>;
};

export function PatientInfoSection({
  register,
  errors,
}: PatientInfoSectionProps) {
  return (
    <FieldSet>
      <FieldLegend>Thông tin bệnh nhân</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel htmlFor="ma_lk">Mã liên kết</FieldLabel>
            <FieldContent>
              <Input
                id="ma_lk"
                aria-invalid={!!errors.tong_hop?.ma_lk}
                {...register('tong_hop.ma_lk')}
              />
              <FieldError errors={[errors.tong_hop?.ma_lk]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_bn">Mã bệnh nhân</FieldLabel>
            <FieldContent>
              <Input
                id="ma_bn"
                aria-invalid={!!errors.tong_hop?.ma_bn}
                {...register('tong_hop.ma_bn')}
              />
              <FieldError errors={[errors.tong_hop?.ma_bn]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ho_ten">Họ tên</FieldLabel>
            <FieldContent>
              <Input
                id="ho_ten"
                aria-invalid={!!errors.tong_hop?.ho_ten}
                {...register('tong_hop.ho_ten')}
              />
              <FieldError errors={[errors.tong_hop?.ho_ten]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ngay_sinh">Ngày sinh</FieldLabel>
            <FieldContent>
              <Input
                id="ngay_sinh"
                type="date"
                aria-invalid={!!errors.tong_hop?.ngay_sinh}
                {...register('tong_hop.ngay_sinh')}
              />
              <FieldError errors={[errors.tong_hop?.ngay_sinh]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="gioi_tinh">Giới tính</FieldLabel>
            <FieldContent>
              <Input
                id="gioi_tinh"
                type="number"
                aria-invalid={!!errors.tong_hop?.gioi_tinh}
                {...register('tong_hop.gioi_tinh', { valueAsNumber: true })}
              />
              <FieldDescription>1: Nam, 2: Nữ</FieldDescription>
              <FieldError errors={[errors.tong_hop?.gioi_tinh]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_quoctich">Mã quốc tịch</FieldLabel>
            <FieldContent>
              <Input
                id="ma_quoctich"
                aria-invalid={!!errors.tong_hop?.ma_quoctich}
                {...register('tong_hop.ma_quoctich')}
              />
              <FieldError errors={[errors.tong_hop?.ma_quoctich]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_nghe_nghiep">Mã nghề nghiệp</FieldLabel>
            <FieldContent>
              <Input
                id="ma_nghe_nghiep"
                aria-invalid={!!errors.tong_hop?.ma_nghe_nghiep}
                {...register('tong_hop.ma_nghe_nghiep')}
              />
              <FieldError errors={[errors.tong_hop?.ma_nghe_nghiep]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="dien_thoai">Điện thoại</FieldLabel>
            <FieldContent>
              <Input
                id="dien_thoai"
                type="tel"
                aria-invalid={!!errors.tong_hop?.dien_thoai}
                {...register('tong_hop.dien_thoai')}
              />
              <FieldError errors={[errors.tong_hop?.dien_thoai]} />
            </FieldContent>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="dia_chi">Địa chỉ</FieldLabel>
            <FieldContent>
              <Textarea
                id="dia_chi"
                aria-invalid={!!errors.tong_hop?.dia_chi}
                {...register('tong_hop.dia_chi')}
              />
              <FieldError errors={[errors.tong_hop?.dia_chi]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ngay_vao">Ngày vào</FieldLabel>
            <FieldContent>
              <Input
                id="ngay_vao"
                type="datetime-local"
                aria-invalid={!!errors.tong_hop?.ngay_vao}
                {...register('tong_hop.ngay_vao')}
              />
              <FieldError errors={[errors.tong_hop?.ngay_vao]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="can_nang">Cân nặng (kg)</FieldLabel>
            <FieldContent>
              <Input
                id="can_nang"
                aria-invalid={!!errors.tong_hop?.can_nang}
                {...register('tong_hop.can_nang')}
              />
              <FieldError errors={[errors.tong_hop?.can_nang]} />
            </FieldContent>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="chan_doan_rv">Chẩn đoán</FieldLabel>
            <FieldContent>
              <Textarea
                id="chan_doan_rv"
                aria-invalid={!!errors.tong_hop?.chan_doan_rv}
                {...register('tong_hop.chan_doan_rv')}
              />
              <FieldError errors={[errors.tong_hop?.chan_doan_rv]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_benh_chinh">Mã bệnh chính</FieldLabel>
            <FieldContent>
              <Input
                id="ma_benh_chinh"
                aria-invalid={!!errors.tong_hop?.ma_benh_chinh}
                {...register('tong_hop.ma_benh_chinh')}
              />
              <FieldError errors={[errors.tong_hop?.ma_benh_chinh]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ket_qua_dtri">Kết quả điều trị</FieldLabel>
            <FieldContent>
              <Input
                id="ket_qua_dtri"
                type="number"
                aria-invalid={!!errors.tong_hop?.ket_qua_dtri}
                {...register('tong_hop.ket_qua_dtri', {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[errors.tong_hop?.ket_qua_dtri]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_loai_kcb">Mã loại KCB</FieldLabel>
            <FieldContent>
              <Input
                id="ma_loai_kcb"
                type="number"
                aria-invalid={!!errors.tong_hop?.ma_loai_kcb}
                {...register('tong_hop.ma_loai_kcb', {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[errors.tong_hop?.ma_loai_kcb]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="ma_cskcb">Mã cơ sở KCB</FieldLabel>
            <FieldContent>
              <Input
                id="ma_cskcb"
                aria-invalid={!!errors.tong_hop?.ma_cskcb}
                {...register('tong_hop.ma_cskcb')}
              />
              <FieldError errors={[errors.tong_hop?.ma_cskcb]} />
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
