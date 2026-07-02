import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Spinner } from "@/components/shadcn/spinner";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { useCreateOrganization } from "@/features/create-organization/hooks/use-create-organization";

const createOrganizationSchema = (messages: {
	organizationNameRequired: string;
}) =>
	z.object({
		name: z.string().min(1, messages.organizationNameRequired),
	});

type CreateOrganizationFormData = z.infer<
	ReturnType<typeof createOrganizationSchema>
>;

const toAlias = (name: string) =>
	name
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

const CreateOrganization = () => {
	const { t: translation } = useTranslation("create-organization" as never);
	const t = translation as unknown as (key: string) => string;
	const navigate = useNavigate();
	const { mutate: createOrganization, isPending } = useCreateOrganization();

	const validationMessages = useMemo(
		() => ({
			organizationNameRequired: t("form.validation.organizationNameRequired"),
		}),
		[t]
	);

	const organizationSchema = useMemo(
		() => createOrganizationSchema(validationMessages),
		[validationMessages]
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateOrganizationFormData>({
		resolver: zodResolver(organizationSchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = (data: CreateOrganizationFormData) => {
		createOrganization(
			{
				name: data.name.trim(),
				alias: toAlias(data.name),
			},
			{
				onSuccess: () => {
					toast.success(t("toast.success"));
					navigate("/dashboard", { replace: true });
				},
				onError: () => {
					toast.error(t("toast.error"));
				},
			}
		);
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
			<LocaleSwitcher className="absolute top-4 right-4" />
			<Card className="w-full max-w-xl border shadow-md">
				<CardHeader className="space-y-4">
					<div className="flex items-start gap-3">
						<div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
							<AlertCircle className="size-5" />
						</div>
						<div className="space-y-1">
							<CardTitle className="text-2xl">{t("title")}</CardTitle>
							<CardDescription>{t("description")}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="organizationName">
									{t("form.fields.name.label")}
								</FieldLabel>
								<FieldDescription>
									{t("form.fields.name.description")}
								</FieldDescription>
								<Input
									id="organizationName"
									placeholder={t("form.fields.name.placeholder")}
									{...register("name")}
								/>
								<FieldError errors={[errors.name]} />
							</Field>
						</FieldGroup>

						<div className="flex items-center justify-end gap-3">
							<Button type="submit" disabled={isPending} className="min-w-44">
								{isPending && <Spinner />}
								<Plus className="size-4" />
								{t("form.actions.create")}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default CreateOrganization;
