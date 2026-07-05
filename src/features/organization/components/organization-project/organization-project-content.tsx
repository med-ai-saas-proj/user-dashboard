import { CustomPagination } from "@/components/pagination/pagination";
import { Spinner } from "@/components/shadcn/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useProjectStore } from "@/features/project/store/project";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetOrganizationProjects } from "../../hooks/organization-projects/use-get-projects";
import OrganizationProjectArchiveDialog from "./organization-project-archive-dialog";
import OrganizationProjectUnarchiveDialog from "./organization-project-unarchive-dialog";
import PermissionDeniedBlock from "@/components/permission-block/permission-denied-block";

type OrganizationProjectContentProps = {
    isArchived: boolean;
    searchQuery?: string;
};

const OrganizationProjectContent = ({
    isArchived,
    searchQuery,
}: OrganizationProjectContentProps) => {
    const { t } = useTranslation("organization");
    const organizationId =
        useAuthStore((state) => state.organization?.id) || "";
    const setProjectId = useProjectStore((state) => state.setProjectId);
    const navigate = useNavigate();

    const limit = 10;
    const [page, setPage] = useState(1);

    const {
        data: projectsResponse,
        isError,
        isPending,
    } = useGetOrganizationProjects({
        organizationId,
        offset: (page - 1) * limit,
        limit,
        q: searchQuery || undefined,
    });

    const filteredProjects = useMemo(() => {
        if (!projectsResponse) return [];

        return projectsResponse.results.filter(
            (project) => project.archived === isArchived,
        );
    }, [projectsResponse, isArchived]);

    const handleNavigateToProject = (projectId: string) => {
        setProjectId(projectId);
        navigate(`/project/${projectId}/general`);
    };

    if (!isError && !isPending && filteredProjects.length === 0) {
        return (
            <div className="flex flex-col items-center gap-y-4">
                <p className="text-muted-foreground">
                    {t("project.content.noProjects")}
                </p>
            </div>
        );
    }

    if (isError) {
        return <PermissionDeniedBlock />;
    }

    return (
        <div className="flex flex-col items-center gap-y-4">
            <Table className="table-fixed w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">#</TableHead>

                        <TableHead className="w-xs truncate">
                            {t("project.content.tableHeaders.name")}
                        </TableHead>

                        <TableHead className="w-xs truncate">
                            {t("project.content.tableHeaders.id")}
                        </TableHead>

                        <TableHead>
                            {t("project.content.tableHeaders.description")}
                        </TableHead>

                        <TableHead className="w-20"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProjects.map((project, index) => (
                        <TableRow
                            key={project.project_uuid}
                            onClick={() =>
                                handleNavigateToProject(project.project_uuid)
                            }
                            className="cursor-pointer"
                        >
                            <TableCell>
                                <p className="text-muted-foreground">
                                    {(page - 1) * limit + index + 1}
                                </p>
                            </TableCell>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>{project.project_uuid}</TableCell>
                            <TableCell>{project.description}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-x-6 justify-end">
                                    {!project.archived && (
                                        <OrganizationProjectArchiveDialog
                                            projectId={project.project_uuid}
                                            projectName={project.name}
                                        />
                                    )}
                                    {project.archived && (
                                        <OrganizationProjectUnarchiveDialog
                                            projectId={project.project_uuid}
                                            projectName={project.name}
                                        />
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {isPending && (
                <div className="flex items-center justify-center h-full">
                    <div className="flex items-center justify-center gap-2">
                        <Spinner />
                        <p className="text-muted-foreground">
                            {t("project.content.loading")}
                        </p>
                    </div>
                </div>
            )}
            {!isPending && (
                <CustomPagination
                    className="my-4"
                    currentPage={page}
                    limit={limit}
                    totalElements={projectsResponse?.total || 1}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

export default OrganizationProjectContent;
