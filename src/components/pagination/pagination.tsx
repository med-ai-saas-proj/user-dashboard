import type React from "react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	PaginationEllipsis,
} from "@/components/shadcn/pagination";

type CustomPaginationProps = {
	currentPage: number;
	limit: number;
	totalElements: number;
	onPageChange: (page: number) => void;
	className?: string;
};

type PageItem = number | "...";

const getVisiblePages = (current: number, total: number): PageItem[] => {
	const delta = 2;
	const pages: PageItem[] = [];

	const start = Math.max(2, current - delta);
	const end = Math.min(total - 1, current + delta);

	pages.push(1);

	if (start > 2) {
		pages.push("...");
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	if (end < total - 1) {
		pages.push("...");
	}

	if (total > 1) {
		pages.push(total);
	}

	return pages;
};

export const CustomPagination: React.FC<CustomPaginationProps> = ({
	currentPage,
	limit,
	totalElements,
	onPageChange,
	className,
}) => {
	const totalPages = Math.ceil(totalElements / limit);
	const pages = getVisiblePages(currentPage, totalPages);

	const handlePageChange = (page: number) => {
		if (page !== currentPage) {
			onPageChange(page);
		}
	};

	return (
		<Pagination className={className}>
			<PaginationContent>
				{/* Previous */}
				<PaginationItem>
					<PaginationPrevious
						onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
						aria-disabled={currentPage === 1}
					/>
				</PaginationItem>

				{/* Pages */}
				{pages.map((page, index) =>
					page === "..." ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={page}>
							<PaginationLink
								isActive={page === currentPage}
								onClick={() => handlePageChange(page)}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					)
				)}

				{/* Next */}
				<PaginationItem>
					<PaginationNext
						onClick={() =>
							currentPage < totalPages && handlePageChange(currentPage + 1)
						}
						aria-disabled={currentPage === totalPages}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
