import { PlusIcon, Trash2Icon } from "lucide-react";
import type {
	FieldArrayWithId,
	FieldErrors,
	UseFieldArrayAppend,
	UseFieldArrayReturn,
	UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shadcn/accordion";
import { Button } from "@/components/shadcn/button";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import type { EHRFormData } from "@/features/pg-ehr-summary/ehr-form.type";

type ClinicalProgressSectionProps = {
	register: UseFormRegister<EHRFormData>;
	errors: FieldErrors<EHRFormData>;
	fields: FieldArrayWithId<EHRFormData, "dien_bien_lam_sang", "id">[];
	append: UseFieldArrayAppend<EHRFormData, "dien_bien_lam_sang">;
	remove: UseFieldArrayReturn["remove"];
};

export function ClinicalProgressSection({
	register,
	errors,
	fields,
	append,
	remove,
}: ClinicalProgressSectionProps) {
	const { t } = useTranslation("clinical-progress");

	const handleAddProgress = () => {
		append({
			ma_lk: "",
			stt: fields.length + 1,
			dien_bien_ls: "",
			thoi_diem_dbls: "",
			nguoi_thuc_hien: "",
		});
	};

	return (
		<FieldSet>
			<div className="flex items-center justify-between mb-3">
				<FieldLegend>{t("legend")}</FieldLegend>
				<Button
					type="button"
					size="sm"
					onClick={handleAddProgress}
					className="gap-2"
				>
					<PlusIcon className="size-4" />
					{t("action.addEntry")}
				</Button>
			</div>
			<FieldGroup>
				<Accordion type="multiple" className="w-full">
					{fields.map((field, index) => (
						<AccordionItem key={field.id} value={`progress-${index}`}>
							<AccordionTrigger>
								<div className="flex items-center gap-2">
									<span>{t("entryTitle", { index: index + 1 })}</span>
									{errors.dien_bien_lam_sang?.[index] && (
										<span className="text-destructive text-xs">
											{t("hasError")}
										</span>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-4">
									<Field>
										<FieldLabel
											htmlFor={`dien_bien_lam_sang.${index}.dien_bien_ls`}
										>
											{t("fields.clinicalProgress")}
										</FieldLabel>
										<FieldContent>
											<Textarea
												id={`dien_bien_lam_sang.${index}.dien_bien_ls`}
												aria-invalid={
													!!errors.dien_bien_lam_sang?.[index]?.dien_bien_ls
												}
												{...register(
													`dien_bien_lam_sang.${index}.dien_bien_ls`
												)}
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
												{t("fields.time")}
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
												{t("fields.performedBy")}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`dien_bien_lam_sang.${index}.nguoi_thuc_hien`}
													aria-invalid={
														!!errors.dien_bien_lam_sang?.[index]
															?.nguoi_thuc_hien
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

									<div className="flex justify-end pt-2">
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() => remove(index)}
											className="gap-2"
										>
											<Trash2Icon className="size-4" />
											{t("action.removeEntry")}
										</Button>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</FieldGroup>
		</FieldSet>
	);
}
