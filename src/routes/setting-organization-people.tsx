import { useState } from "react";
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
	const [organizationPeopleTab, setOrganizationPeopleTab] =
		useState<OrganizationPeopleTabs>("members");

	return (
		<DashboardLayout pageTitle="People">
			<h2 className="text-2xl font-bold mb-4">People & Permission</h2>
			<Tabs
				value={organizationPeopleTab}
				onValueChange={(value: string) =>
					setOrganizationPeopleTab(value as OrganizationPeopleTabs)
				}
			>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="members">Members</TabsTrigger>
						<TabsTrigger value="invitations">Invitations</TabsTrigger>
						<TabsTrigger value="roles">Roles</TabsTrigger>
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
						<p className="text-gray-500">
							Manage your organization roles and permissions here.
						</p>
					</TabsContent>
				)}
			</Tabs>
		</DashboardLayout>
	);
};

export default SettingOrganizationPeoplePage;
