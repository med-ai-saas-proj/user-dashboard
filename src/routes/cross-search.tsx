import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";

interface FacilityMatch {
	facility_id: string;
	facility_name: string;
	his_id: string;
	his_name: string;
	record_count: number;
	data_formats: Record<string, number>;
}

interface SearchResult {
	success: boolean;
	query: Record<string, string>;
	hashed_demographics: string;
	facilities_searched: number;
	matches: FacilityMatch[];
	total_matches: number;
}

interface NetworkStats {
	his_providers: Array<{
		his_id: string;
		name: string;
		supported_formats: string[];
		facilities: Array<{
			facility_id: string;
			facility_name: string;
			patient_count: number;
			record_count: number;
		}>;
	}>;
	total_facilities: number;
	total_patients: number;
	total_records: number;
}

const formatBadgeColor = (fmt: string) => {
	const colors: Record<string, string> = {
		hl7v2: "bg-emerald-500/20 text-emerald-400",
		fhir: "bg-violet-500/20 text-violet-400",
		cda: "bg-pink-500/20 text-pink-400",
		bhxh_4210: "bg-amber-500/20 text-amber-400",
		clinical_note: "bg-slate-500/20 text-slate-400",
	};
	return colors[fmt] || "bg-muted text-muted-foreground";
};

const CrossSearchPage = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [dob, setDob] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSeeding, setIsSeeding] = useState(false);
	const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
	const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const requireApiKey = (): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	};

	const loadNetworkStats = async () => {
		try {
			const resp = await fetch(API_ROUTES.SERVICES.CROSS_SEARCH_NETWORK_STATS);
			if (resp.ok) setNetworkStats(await resp.json());
		} catch {}
	};

	const handleSeed = async () => {
		setIsSeeding(true);
		try {
			const resp = await fetch(API_ROUTES.SERVICES.PLAYGROUND_SEED, { method: "POST" });
			if (resp.ok) {
				toast.success("Playground seeded with demo data");
				await loadNetworkStats();
			}
		} catch (err) {
			toast.error("Failed to seed playground");
		} finally {
			setIsSeeding(false);
		}
	};

	const handleSearch = async () => {
		if (!requireApiKey() || !firstName.trim() || !lastName.trim() || !dob.trim()) return;
		setIsLoading(true);
		setSearchResult(null);
		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.CROSS_SEARCH_SEARCH);
			const resp = await fetch(API_ROUTES.SERVICES.CROSS_SEARCH_SEARCH, {
				method: "POST",
				headers,
				body: JSON.stringify({ first_name: firstName, last_name: lastName, dob }),
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const data: SearchResult = await resp.json();
			setSearchResult(data);
			toast.success(`Found ${data.total_matches} facility matches`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Search failed");
		} finally {
			setIsLoading(false);
		}
	};

	const fillDemo = () => {
		setFirstName("John");
		setLastName("Smith");
		setDob("1990-03-15");
	};

	return (
		<DashboardLayout pageTitle="Cross-Provider Search">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center justify-between px-4 py-1.5 border-b">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleSeed} disabled={isSeeding}>
							{isSeeding ? "Seeding..." : "Seed Demo Data"}
						</Button>
						<Button variant="ghost" size="sm" onClick={loadNetworkStats}>
							Refresh Stats
						</Button>
					</div>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.CROSS_SEARCH_SEARCH}
						method="POST"
						body={{ first_name: "John", last_name: "Smith", dob: "1990-03-15" }}
						description="Search patient records across all registered HIS providers"
					/>
				</div>

				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Search Form + Network View */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Patient Demographics</span>
								<Button variant="ghost" size="sm" onClick={fillDemo}>Load Demo</Button>
							</div>
							<div className="grid grid-cols-3 gap-2">
								<input
									value={firstName}
									onChange={e => setFirstName(e.target.value)}
									placeholder="First name"
									className="rounded-md border px-3 py-1.5 text-sm bg-background"
								/>
								<input
									value={lastName}
									onChange={e => setLastName(e.target.value)}
									placeholder="Last name"
									className="rounded-md border px-3 py-1.5 text-sm bg-background"
								/>
								<input
									type="date"
									value={dob}
									onChange={e => setDob(e.target.value)}
									className="rounded-md border px-3 py-1.5 text-sm bg-background"
								/>
							</div>
							<Button onClick={handleSearch} disabled={isLoading || !firstName || !lastName || !dob} className="w-full">
								{isLoading ? "Searching..." : "Search Across Providers"}
							</Button>
						</div>

						{/* Network stats */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{networkStats ? (
								<>
									<div className="grid grid-cols-3 gap-2">
										{[{ label: "Providers", value: networkStats.his_providers.length },
											{ label: "Facilities", value: networkStats.total_facilities },
											{ label: "Records", value: networkStats.total_records.toLocaleString() }].map(s => (
											<div key={s.label} className="rounded-md border p-3 text-center">
												<div className="text-2xl font-bold text-primary">{s.value}</div>
												<div className="text-[11px] text-muted-foreground uppercase">{s.label}</div>
											</div>
										))}
									</div>
									{networkStats.his_providers.map(his => (
										<div key={his.his_id} className="rounded-md border">
											<div className="p-3 border-b bg-muted/50 flex items-center justify-between">
												<span className="text-sm font-medium">{his.name}</span>
												<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{his.facilities.length} facilities</span>
											</div>
											<div className="divide-y">
												{his.facilities.map(f => (
													<div key={f.facility_id} className="p-3 flex items-center justify-between">
														<span className="text-sm">{f.facility_name}</span>
														<div className="flex items-center gap-3 text-xs text-muted-foreground">
															<span>{f.patient_count} patients</span>
															<span>{f.record_count} records</span>
														</div>
													</div>
												))}
											</div>
										</div>
									))}
								</>
							) : (
								<div className="text-center py-8 text-sm text-muted-foreground">
									<p>Click <strong>Seed Demo Data</strong> to populate the network, then <strong>Refresh Stats</strong>.</p>
								</div>
							)}
						</div>
					</div>

					{/* Right: Search Results */}
					<div className="flex flex-col overflow-hidden">
						{searchResult ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										{searchResult.total_matches} facilities found
									</span>
									<span className="text-xs text-muted-foreground font-mono">
										{searchResult.hashed_demographics.slice(0, 16)}...
									</span>
								</div>

								{searchResult.matches.map(m => (
									<div key={m.facility_id} className="rounded-lg border p-4 space-y-3">
										<div className="flex items-start justify-between">
											<div>
												<div className="font-medium">{m.facility_name}</div>
												<div className="text-xs text-muted-foreground">HIS: {m.his_name} ({m.his_id})</div>
											</div>
											<span className="text-lg font-bold text-primary">{m.record_count}</span>
										</div>
										<div className="flex flex-wrap gap-1.5">
											{Object.entries(m.data_formats).map(([fmt, count]) => (
												<span key={fmt} className={`text-xs px-2 py-0.5 rounded-full font-medium ${formatBadgeColor(fmt)}`}>
													{fmt} ({count})
												</span>
											))}
										</div>
									</div>
								))}

								{searchResult.total_matches === 0 && (
									<div className="text-center py-8 text-sm text-muted-foreground">
										No records found across any facility. Try seeding demo data first.
									</div>
								)}
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
										<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
											<title>Search</title>
											<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Search for a patient by demographics to find their records across all connected HIS providers and facilities.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<ApiKeyRequiredDialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog} />
		</DashboardLayout>
	);
};

export default CrossSearchPage;
