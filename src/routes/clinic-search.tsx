import { useEffect, useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import {
	SearchIcon,
	MapPinIcon,
	UserIcon,
	BuildingIcon,
	StarIcon,
} from "lucide-react";

const SEARCH_ENDPOINT = `${BASE_API_URL}service/api/v1/clinic_search/search`;
const RECOMMEND_ENDPOINT = `${BASE_API_URL}service/api/v1/clinic_search/recommend`;
const PROVINCES_ENDPOINT = `${BASE_API_URL}service/api/v1/clinic_search/provinces`;

type Mode = "search" | "recommend";

interface Clinic {
	name: string;
	province: string;
	type: string;
}

interface Doctor {
	name: string;
	title: string;
	position: string;
	province: string;
}

interface SearchResult {
	query: string;
	province_filter: string;
	clinics: Clinic[];
	doctors: Doctor[];
	total: number;
}

interface Recommendation {
	type: string;
	name: string;
	province: string;
	position?: string;
	score: number;
	specialty: string;
}

interface RecommendResult {
	query: string;
	recommendations: Recommendation[];
	total: number;
}

export default function ClinicSearchPage() {
	const [mode, setMode] = useState<Mode>("search");
	const [keyword, setKeyword] = useState("");
	const [symptoms, setSymptoms] = useState("");
	const [province, setProvince] = useState("");
	const [provinces, setProvinces] = useState<string[]>([]);
	const [limit] = useState(20);
	const [isLoading, setIsLoading] = useState(false);
	const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
	const [recommendResult, setRecommendResult] =
		useState<RecommendResult | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const headers = await getAuthHeaders(PROVINCES_ENDPOINT);
				const resp = await fetch(PROVINCES_ENDPOINT, { headers });
				if (resp.ok) {
					const data: string[] = await resp.json();
					setProvinces(data);
				}
			} catch {
				/* provinces are optional — fail silently */
			}
		})();
	}, []);

	const handleSearch = async () => {
		if (mode === "search" && !keyword.trim()) {
			toast.error("Enter a search keyword");
			return;
		}
		if (mode === "recommend" && !symptoms.trim()) {
			toast.error("Enter symptoms to get recommendations");
			return;
		}

		setIsLoading(true);
		setSearchResult(null);
		setRecommendResult(null);

		try {
			if (mode === "search") {
				const params = new URLSearchParams({ q: keyword.trim() });
				if (province) params.set("province", province);
				params.set("limit", String(limit));
				const url = `${SEARCH_ENDPOINT}?${params}`;
				const headers = await getAuthHeaders(url);
				const resp = await fetch(url, { headers });
				if (!resp.ok)
					throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
				const json: SearchResult = await resp.json();
				setSearchResult(json);
				toast.success(`Found ${json.total} result(s)`);
			} else {
				const headers = await getAuthHeaders(RECOMMEND_ENDPOINT);
				const body: Record<string, unknown> = {
					symptoms: symptoms.trim(),
					limit: 10,
				};
				if (province) body.province = province;
				const resp = await fetch(RECOMMEND_ENDPOINT, {
					method: "POST",
					headers,
					body: JSON.stringify(body),
				});
				if (!resp.ok)
					throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
				const json: RecommendResult = await resp.json();
				setRecommendResult(json);
				toast.success(`Got ${json.total} recommendation(s)`);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const loadExample = () => {
		setMode("recommend");
		setSymptoms("đau lưng");
		setProvince("Hà Nội");
	};

	const activeEndpoint =
		mode === "search" ? SEARCH_ENDPOINT : RECOMMEND_ENDPOINT;
	const activeMethod = mode === "search" ? "GET" : "POST";
	const activeBody =
		mode === "search"
			? undefined
			: {
					symptoms: symptoms || "đau lưng",
					province: province || "Hà Nội",
					limit: 10,
				};

	return (
		<DashboardLayout pageTitle="Clinic Search">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Search form */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Clinic Search
							</h2>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								onClick={loadExample}
							>
								Load Example
							</Button>
						</div>

						<div className="flex-1 overflow-auto p-4 space-y-4">
							{/* Mode toggle */}
							<div className="flex rounded-lg border overflow-hidden">
								<button
									type="button"
									onClick={() => setMode("search")}
									className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
										mode === "search"
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted text-muted-foreground"
									}`}
								>
									<SearchIcon className="size-3.5 inline-block mr-1.5 -mt-0.5" />
									Search
								</button>
								<button
									type="button"
									onClick={() => setMode("recommend")}
									className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
										mode === "recommend"
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted text-muted-foreground"
									}`}
								>
									<StarIcon className="size-3.5 inline-block mr-1.5 -mt-0.5" />
									Recommend
								</button>
							</div>

							{/* Search mode: keyword input */}
							{mode === "search" && (
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Search Keyword
									</span>
									<input
										value={keyword}
										onChange={(e) => setKeyword(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSearch();
										}}
										placeholder="e.g. nha khoa, bệnh viện, tim mạch..."
										className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>
							)}

							{/* Recommend mode: symptoms textarea */}
							{mode === "recommend" && (
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Symptoms
									</span>
									<textarea
										value={symptoms}
										onChange={(e) => setSymptoms(e.target.value)}
										placeholder="Mô tả triệu chứng, e.g. đau lưng, nhức đầu..."
										rows={4}
										className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
									/>
								</label>
							)}

							{/* Province dropdown */}
							<label className="block">
								<span className="text-xs font-medium text-muted-foreground block mb-1">
									<MapPinIcon className="size-3.5 inline-block mr-1 -mt-0.5" />
									Province
								</span>
								<select
									value={province}
									onChange={(e) => setProvince(e.target.value)}
									className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								>
									<option value="">All provinces</option>
									{provinces.map((p) => (
										<option key={p} value={p}>
											{p}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2">
							<ViewCodeDialog
								endpoint={activeEndpoint}
								method={activeMethod}
								body={activeBody}
								description={
									mode === "search"
										? "Search clinics and doctors by keyword and province"
										: "AI-powered clinic and doctor recommendations based on symptoms"
								}
							/>
							<Button
								size="sm"
								className="h-8 text-xs"
								onClick={handleSearch}
								disabled={isLoading}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										{mode === "search" ? "Searching..." : "Recommending..."}
									</span>
								) : mode === "search" ? (
									"Search"
								) : (
									"Get Recommendations"
								)}
							</Button>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{searchResult || recommendResult ? (
							<div className="flex-1 overflow-auto p-4 space-y-3">
								{/* Search results */}
								{searchResult && (
									<>
										<div className="flex items-center gap-1.5 mb-2">
											<SearchIcon className="size-4 text-muted-foreground" />
											<span className="text-xs font-bold uppercase text-muted-foreground">
												Results ({searchResult.total})
											</span>
										</div>

										{searchResult.clinics.map((clinic, i) => (
											<div key={`c-${i}`} className="rounded-lg border p-3">
												<div className="flex items-center gap-2 mb-1">
													<BuildingIcon className="size-4 text-blue-500 shrink-0" />
													<span className="text-sm font-semibold">
														{clinic.name}
													</span>
													<span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
														{clinic.type}
													</span>
												</div>
												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<MapPinIcon className="size-3" />
													{clinic.province}
												</div>
											</div>
										))}

										{searchResult.doctors.map((doctor, i) => (
											<div key={`d-${i}`} className="rounded-lg border p-3">
												<div className="flex items-center gap-2 mb-1">
													<UserIcon className="size-4 text-green-500 shrink-0" />
													<span className="text-sm font-semibold">
														{doctor.name}
													</span>
													<span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
														Doctor
													</span>
												</div>
												<div className="text-xs text-muted-foreground space-y-0.5">
													{doctor.title && <p>{doctor.title}</p>}
													{doctor.position && (
														<p className="italic">{doctor.position}</p>
													)}
													<div className="flex items-center gap-1">
														<MapPinIcon className="size-3" />
														{doctor.province}
													</div>
												</div>
											</div>
										))}

										{searchResult.total === 0 && (
											<p className="text-sm text-muted-foreground text-center py-8">
												No results found. Try a different keyword or province.
											</p>
										)}
									</>
								)}

								{/* Recommend results */}
								{recommendResult && (
									<>
										<div className="flex items-center gap-1.5 mb-2">
											<StarIcon className="size-4 text-muted-foreground" />
											<span className="text-xs font-bold uppercase text-muted-foreground">
												Recommendations ({recommendResult.total})
											</span>
										</div>

										{recommendResult.recommendations.map((rec, i) => (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center gap-2 mb-1">
													{rec.type === "clinic" ? (
														<BuildingIcon className="size-4 text-blue-500 shrink-0" />
													) : (
														<UserIcon className="size-4 text-green-500 shrink-0" />
													)}
													<span className="text-sm font-semibold">
														{rec.name}
													</span>
													<span
														className={`ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full ${
															rec.type === "clinic"
																? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
																: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
														}`}
													>
														{rec.type}
													</span>
												</div>
												<div className="text-xs text-muted-foreground space-y-0.5">
													{rec.position && (
														<p className="italic">{rec.position}</p>
													)}
													<p className="font-medium text-primary">
														{rec.specialty}
													</p>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1">
															<MapPinIcon className="size-3" />
															{rec.province}
														</div>
														<div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
															<StarIcon className="size-3 fill-current" />
															{(rec.score * 100).toFixed(0)}% match
														</div>
													</div>
												</div>
											</div>
										))}

										{recommendResult.total === 0 && (
											<p className="text-sm text-muted-foreground text-center py-8">
												No recommendations found. Try different symptoms.
											</p>
										)}
									</>
								)}
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<BuildingIcon className="size-10 mx-auto text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										Search for clinics and doctors or get AI-powered
										recommendations based on your symptoms.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Switch between <strong>Search</strong> (keyword-based) and{" "}
										<strong>Recommend</strong> (symptom-based AI matching)
										modes.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.clinic_search} />
			</div>
		</DashboardLayout>
	);
}
