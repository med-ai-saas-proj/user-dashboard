// ehr-form.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/shadcn/button';
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
import { ehrFormSchema } from '@/features/pg-ehr-summary/schemas/ehr-form.schema';

const defaultValues: EHRFormData = {
  tong_hop: {
    ma_lk: '70223256',
    ma_bn: '70223256',
    ho_ten: 'Mai Lý Thị',
    ngay_sinh: '1961-08-20',
    gioi_tinh: 2,
    ma_quoctich: 'VN',
    ma_nghe_nghiep: 'GV',
    dia_chi: 'Số 47 Phố Tràng Tiền, Tòa tháp A, Tây Hồ, Hà Nội, Việt Nam',
    dien_thoai: '0039 512 62 01',
    ngay_vao: '2023-05-15 07:30',
    chan_doan_rv: 'Bệnh đái tháo đường không phụ thuộc insulin',
    ma_benh_chinh: 'E11',
    ket_qua_dtri: 1,
    ma_loai_kcb: 1,
    ma_cskcb: 'BACHMAI',
    can_nang: '59.0',
  },
  chi_tiet_thuoc: [
    {
      ma_lk: '70223256',
      stt: 1,
      ten_thuoc: 'Gliclazide (Diamicron MR 60mg)',
      ham_luong: '60mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '1',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
    {
      ma_lk: '70223256',
      stt: 2,
      ten_thuoc: 'Atorvastatin (Atrox 10)',
      ham_luong: '10mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '1',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
    {
      ma_lk: '70223256',
      stt: 3,
      ten_thuoc: 'Metformin hydroclorid (Metformin Stella)',
      ham_luong: '1000mg',
      lieu_dung: '1 viên/lần',
      cach_dung: 'Uống',
      so_luong: '2',
      ngay_yl: '2023-05-15 09:10',
      ma_bac_si: 'Mai Thanh Dung',
    },
  ],
  chi_tiet_cls: [
    {
      ma_lk: '70223256',
      stt: 1,
      ten_chi_so: 'Glucose máu',
      gia_tri: '9.5',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 2,
      ten_chi_so: 'Cholesterol toàn phần',
      gia_tri: '5.78',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 3,
      ten_chi_so: 'Triglycerid',
      gia_tri: '1.26',
      don_vi_do: 'mmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
    {
      ma_lk: '70223256',
      stt: 4,
      ten_chi_so: 'Creatinin máu',
      gia_tri: '86',
      don_vi_do: 'µmol/L',
      ngay_kq: '2023-05-15 07:33',
    },
  ],
  dien_bien_lam_sang: [
    {
      ma_lk: '70223256',
      stt: 1,
      dien_bien_ls: 'Bệnh nhân tỉnh, sinh hiệu ổn định, đường huyết tăng.',
      thoi_diem_dbls: '2023-05-15 07:30',
      nguoi_thuc_hien: 'Lý Thùy Hoa',
    },
  ],
};

const EHRForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EHRFormData>({
    resolver: zodResolver(ehrFormSchema),
    defaultValues,
  });

  const onSubmit = (data: EHRFormData) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Patient Information Section */}
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

      {/* Medication Details Section */}
      <FieldSet>
        <FieldLegend>Chi tiết thuốc</FieldLegend>
        <FieldGroup>
          {defaultValues.chi_tiet_thuoc.map((_, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-4 bg-muted/20"
            >
              <h3 className="font-semibold text-sm">Thuốc {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ten_thuoc`}>
                    Tên thuốc
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.ten_thuoc`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.ten_thuoc}
                      {...register(`chi_tiet_thuoc.${index}.ten_thuoc`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.ten_thuoc]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ham_luong`}>
                    Hàm lượng
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.ham_luong`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.ham_luong}
                      {...register(`chi_tiet_thuoc.${index}.ham_luong`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.ham_luong]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.lieu_dung`}>
                    Liều dùng
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.lieu_dung`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.lieu_dung}
                      {...register(`chi_tiet_thuoc.${index}.lieu_dung`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.lieu_dung]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.cach_dung`}>
                    Cách dùng
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.cach_dung`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.cach_dung}
                      {...register(`chi_tiet_thuoc.${index}.cach_dung`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.cach_dung]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.so_luong`}>
                    Số lượng
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.so_luong`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.so_luong}
                      {...register(`chi_tiet_thuoc.${index}.so_luong`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.so_luong]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_thuoc.${index}.ma_bac_si`}>
                    Mã bác sĩ
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_thuoc.${index}.ma_bac_si`}
                      aria-invalid={!!errors.chi_tiet_thuoc?.[index]?.ma_bac_si}
                      {...register(`chi_tiet_thuoc.${index}.ma_bac_si`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_thuoc?.[index]?.ma_bac_si]}
                    />
                  </FieldContent>
                </Field>
              </div>
            </div>
          ))}
        </FieldGroup>
      </FieldSet>

      {/* Lab Results Section */}
      <FieldSet>
        <FieldLegend>Chi tiết cận lâm sàng</FieldLegend>
        <FieldGroup>
          {defaultValues.chi_tiet_cls.map((_, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-4 bg-muted/20"
            >
              <h3 className="font-semibold text-sm">Xét nghiệm {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor={`chi_tiet_cls.${index}.ten_chi_so`}>
                    Tên chỉ số
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_cls.${index}.ten_chi_so`}
                      aria-invalid={!!errors.chi_tiet_cls?.[index]?.ten_chi_so}
                      {...register(`chi_tiet_cls.${index}.ten_chi_so`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_cls?.[index]?.ten_chi_so]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_cls.${index}.gia_tri`}>
                    Giá trị
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_cls.${index}.gia_tri`}
                      aria-invalid={!!errors.chi_tiet_cls?.[index]?.gia_tri}
                      {...register(`chi_tiet_cls.${index}.gia_tri`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_cls?.[index]?.gia_tri]}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`chi_tiet_cls.${index}.don_vi_do`}>
                    Đơn vị đo
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`chi_tiet_cls.${index}.don_vi_do`}
                      aria-invalid={!!errors.chi_tiet_cls?.[index]?.don_vi_do}
                      {...register(`chi_tiet_cls.${index}.don_vi_do`)}
                    />
                    <FieldError
                      errors={[errors.chi_tiet_cls?.[index]?.don_vi_do]}
                    />
                  </FieldContent>
                </Field>
              </div>
            </div>
          ))}
        </FieldGroup>
      </FieldSet>

      {/* Clinical Progress Section */}
      <FieldSet>
        <FieldLegend>Diễn biến lâm sàng</FieldLegend>
        <FieldGroup>
          {defaultValues.dien_bien_lam_sang.map((_, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-4 bg-muted/20"
            >
              <h3 className="font-semibold text-sm">Diễn biến {index + 1}</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor={`dien_bien_lam_sang.${index}.dien_bien_ls`}
                  >
                    Diễn biến lâm sàng
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      id={`dien_bien_lam_sang.${index}.dien_bien_ls`}
                      aria-invalid={
                        !!errors.dien_bien_lam_sang?.[index]?.dien_bien_ls
                      }
                      {...register(`dien_bien_lam_sang.${index}.dien_bien_ls`)}
                    />
                    <FieldError
                      errors={[
                        errors.dien_bien_lam_sang?.[index]?.dien_bien_ls,
                      ]}
                    />
                  </FieldContent>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel
                      htmlFor={`dien_bien_lam_sang.${index}.thoi_diem_dbls`}
                    >
                      Thời điểm
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={`dien_bien_lam_sang.${index}.thoi_diem_dbls`}
                        type="datetime-local"
                        aria-invalid={
                          !!errors.dien_bien_lam_sang?.[index]?.thoi_diem_dbls
                        }
                        {...register(
                          `dien_bien_lam_sang.${index}.thoi_diem_dbls`
                        )}
                      />
                      <FieldError
                        errors={[
                          errors.dien_bien_lam_sang?.[index]?.thoi_diem_dbls,
                        ]}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor={`dien_bien_lam_sang.${index}.nguoi_thuc_hien`}
                    >
                      Người thực hiện
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={`dien_bien_lam_sang.${index}.nguoi_thuc_hien`}
                        aria-invalid={
                          !!errors.dien_bien_lam_sang?.[index]?.nguoi_thuc_hien
                        }
                        {...register(
                          `dien_bien_lam_sang.${index}.nguoi_thuc_hien`
                        )}
                      />
                      <FieldError
                        errors={[
                          errors.dien_bien_lam_sang?.[index]?.nguoi_thuc_hien,
                        ]}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default EHRForm;
