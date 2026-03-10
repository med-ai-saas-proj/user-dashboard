import { useState } from "react";
import OrganizationPeopleLayout from "@/features/organization/components/organization-people/organization-people-layout";
import SettingLayout from "@/layouts/setting-layout";
import type { OrganizationPeopleTabs } from "@/features/organization/organization.type";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";
import OrganizationPeopleMember from "@/features/organization/components/organization-people/organization-people-member";

const SettingOrganizationPeoplePage = () => {
	const [organizationPeopleTab, setOrganizationPeopleTab] =
		useState<OrganizationPeopleTabs>("members");

	return (
		<SettingLayout pageTitle="People">
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
						<OrganizationPeopleLayout>
							<OrganizationPeopleMember />
						</OrganizationPeopleLayout>
					</TabsContent>
				)}
				{organizationPeopleTab === "invitations" && (
					<TabsContent value="invitations">
						<OrganizationPeopleLayout addedButtonText="Invite member">
							<p className="text-gray-500">
								Manage your organization invitations here.
							</p>
						</OrganizationPeopleLayout>
					</TabsContent>
				)}
				{organizationPeopleTab === "roles" && (
					<TabsContent value="roles">
						<OrganizationPeopleLayout addedButtonText="Add role">
							<p className="text-gray-500">
								Manage your organization roles and permissions here.
							</p>
						</OrganizationPeopleLayout>
					</TabsContent>
				)}
			</Tabs>
		</SettingLayout>
	);
};

export default SettingOrganizationPeoplePage;
