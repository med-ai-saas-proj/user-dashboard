import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/layouts/dashboard-layout";
import type { OrganizationPeopleTabs } from "@/features/organization/organization.type";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";
import OrganizationPeopleMember from "@/features/organization/components/organization-people/organization-people-member";
import OrganizationPeopleInvitation from "@/features/organization/components/organization-people/organization-people-invitation";

const SettingOrganizationPeoplePage = () => {
	const { t } = useTranslation("organization");
	const [organizationPeopleTab, setOrganizationPeopleTab] =
		useState<OrganizationPeopleTabs>("members");

	return (
		<DashboardLayout pageTitle={t("people.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("people.heading")}</h2>
			<Tabs
				value={organizationPeopleTab}
				onValueChange={(value: string) =>
					setOrganizationPeopleTab(value as OrganizationPeopleTabs)
				}
			>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="members">
							{t("people.tabs.members")}
						</TabsTrigger>
						<TabsTrigger value="invitations">
							{t("people.tabs.invitations")}
						</TabsTrigger>
						<TabsTrigger value="roles">{t("people.tabs.roles")}</TabsTrigger>
					</TabsList>
				</div>
				{organizationPeopleTab === "members" && (
					<TabsContent value="members">
						<OrganizationPeopleMember />
					</TabsContent>
				)}
				{organizationPeopleTab === "invitations" && (
					<TabsContent value="invitations">
						<OrganizationPeopleInvitation />
					</TabsContent>
				)}
				{organizationPeopleTab === "roles" && (
					<TabsContent value="roles">
						<p className="text-gray-500">{t("people.roles.description")}</p>
					</TabsContent>
				)}
			</Tabs>
		</DashboardLayout>
	);
};

export default SettingOrganizationPeoplePage;
