import { ArrowRightIcon, DotIcon, DownloadIcon } from "lucide-react";
import { Link } from "react-router-dom";
import veneraLogo from "@/assets/venera.png";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const navItems = [
	{ label: "Introduction", href: "#introduction" },
	{ label: "Platform", href: "#platform" },
	{ label: "Architecture", href: "#architecture" },
	{ label: "Benchmarks", href: "#benchmarks" },
	{ label: "Conclusion", href: "#conclusion" },
	{ label: "Download", href: "#download" },
];

function Section({
	number,
	title,
	children,
	className,
}: {
	number: string;
	title: string;
} & React.HTMLAttributes<HTMLElement>) {
	return (
		<section
			className={cn(
				"grid grid-cols-1 md:grid-cols-[74px_1fr] gap-5 space-y-10 py-12 md:py-16 gap-x-20",
				className
			)}
		>
			<div className="hidden md:block">
				<p className="font-serif text-3xl md:text-8xl leading-none text-zinc-700">
					{number}
				</p>
			</div>
			<div>
				<div className="flex flex-row gap-4 md:gap-10 mb-6">
					<span className="md:hidden font-serif text-2xl leading-tight text-zinc-900 md:mt-5 md:text-4xl">
						{number}
					</span>
					<h2 className="font-serif text-2xl leading-tight text-zinc-900 md:mt-5 md:text-4xl">
						{title}
					</h2>
				</div>
				{children}
			</div>
		</section>
	);
}

export default function WhitepaperPage() {
	const { t } = useTranslation("whitepaper");
	const section1 = t("section1", { returnObjects: true });
	const section2 = t("section2", { returnObjects: true });
	const section3 = t("section3", { returnObjects: true });
	const section4 = t("section4", { returnObjects: true });
	const section5 = t("section5", { returnObjects: true });
	const section6 = t("section6", { returnObjects: true });

	return (
		<div className="min-h-screen bg-white text-zinc-900 font-inter">
			<div className="mx-auto max-w-[1470px] bg-white">
				<header className="z-20 border-b border-zinc-200 bg-white/95 backdrop-blur md:sticky md:top-0">
					<div className="mx-auto flex max-w-[1300px] items-center gap-5 px-4 py-4 md:px-10 md:py-5">
						<Link to="/" className="flex items-center gap-2">
							<img src={veneraLogo} alt="Venera" className="size-8" />
							<span className="font-semibold tracking-wide text-nowrap">
								Venera AI
							</span>
						</Link>

						<nav className="hidden flex-1 items-center justify-center gap-4 md:flex">
							{navItems.map((item) => (
								<a
									key={item.href}
									href={item.href}
									className="inline-flex items-center gap-1.5 px-2 py-1 text-xs uppercase tracking-[0.13em] text-zinc-600 hover:text-black"
								>
									<DotIcon className="size-3" />
									{item.label}
								</a>
							))}
						</nav>

						<div className="ml-auto flex items-center gap-2">
							<a
								href="#download"
								className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-300 px-3 text-xs uppercase tracking-[0.12em] text-zinc-700 transition hover:bg-zinc-100"
							>
								<DownloadIcon className="size-3.5" />
								<span className="hidden md:inline">Download</span>
							</a>
							<Link
								to="/dashboard"
								className="inline-flex h-9 items-center gap-1 rounded-full bg-black px-3 text-xs uppercase tracking-[0.12em] text-white transition hover:bg-zinc-800"
							>
								API Platform
								<ArrowRightIcon className="size-3.5" />
							</Link>
						</div>
					</div>
				</header>

				<main className="mx-auto max-w-[1300px] px-4 pb-16 md:px-10 md:pb-24">
					<section className="grid gap-8 border-zinc-200 py-12 md:grid-cols-[1fr_320px] md:items-center md:py-16">
						<div>
							<h1 className="max-w-[760px] font-serif text-4xl leading-[1.04] md:text-7xl">
								{t("title")}
							</h1>
							<p className="mt-5 max-w-[760px] font-serif text-2xl italic leading-tight text-zinc-600 md:text-3xl">
								{t("subtitle")}
							</p>
							<div className="mt-10 grid max-w-[780px] grid-cols-1 gap-6 border-t border-zinc-200 pt-6 text-sm text-zinc-600 md:grid-cols-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
										{t("series.label")}
									</p>
									<p className="mt-1">{t("series.text")}</p>
								</div>
								<div>
									<p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
										{t("writtenBy.label")}
									</p>
									<p className="mt-1">{t("writtenBy.text")}</p>
								</div>
								<div>
									<p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
										{t("published.label")}
									</p>
									<p className="mt-1">{t("published.text")}</p>
								</div>
							</div>
						</div>
					</section>

					<Section number={t("section1.number")} title={t("section1.title")}>
						<div className="space-y-6">
							<div>
								<div className="grid md:grid-cols-4">
									{section1.steps.map((item, index) => (
										<div
											key={`${section1.number}-challenge-${index}`}
											className="flex flex-row md:flex-col justify-start gap-y-2"
										>
											<div className="relative mr-3 w-4 md:w-full">
												<div className="relative mx-auto md:mx-0 size-1.5 rounded-full bg-black" />
												{/* dotted vertical line for mobile, horizontal line for desktop */}
												<div className="md:hidden absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dotted border-black" />
												<div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full border-t border-dotted border-black" />
											</div>
											<p className="flex-1 text-xs leading-relaxed text-zinc-700 md:text-sm -mt-1 pb-2 md:pr-4">
												{item}
											</p>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-row justify-start items-start gap-2 md:gap-6 ">
								<div>
									<ArrowRightIcon className="size-6 md:size-10 text-zinc-500" />
								</div>
								<p className="max-w-[760px] font-serif text-xl leading-tight text-zinc-800 md:text-3xl">
									{section1.body1}
								</p>
							</div>

							<hr className="border-t border-zinc-200" />

							<div>
								<div className="space-y-2">
									<p className="mt-4 text-[#6E6E6E] italic">
										{section1.remark}
									</p>
									<p className="text-xl md:text-4xl">{section1.body2}</p>
								</div>
								<div className="mt-4 space-y-4">
									<p>{section1.body3}</p>
									<p>{section1.body4}</p>
								</div>
							</div>
						</div>
					</Section>

					<Section number={section2.number} title={section2.title}>
						<div>
							<div className="space-y-2">
								<p className="md:text-[19px] font-semibold leading-relaxed text-zinc-700">
									{section2.description}
								</p>
								<p className="text-[#1f1f1f] md:text-[17px]">
									{section2.example}
								</p>
							</div>

							<div className="flex flex-col md:flex-row gap-8 mt-10 md:mt-16">
								{section2.cards.map(({ text1, text2, text3, text4 }, index) => (
									<div
										key={`section2-card-${index}`}
										className="bg-[#f3f3f3] p-4 md:p-8"
									>
										<div className="py-4 space-y-4">
											<div className="italic text-[13px] text-[#6e6e6e]">
												{text1}
											</div>
											<div className="md:text-[22px] font-medium text-[#0a0a0a]">
												{text2}
											</div>
										</div>
										<div className="pt-8 border-t border-[#E7E3DA] space-y-2">
											<div className="italic text-[13px] text-[#ea2c00]">
												{text3}
											</div>
											<div>{text4}</div>
										</div>
									</div>
								))}
							</div>

							<div className="mt-12 md:mt-24">
								<h3 className="uppercase text-2xl md:text-4xl font-semibold">
									{section2.coverage.title}
								</h3>
								<div className="mt-4 md:mt-2 flex flex-col md:flex-row md:space-between gap-y-2 gap-x-4">
									<p className="text-xl md:text-3xl">
										{section2.coverage.subtitle}
									</p>
									<p>{section2.coverage.description}</p>
								</div>
							</div>

							<div className="mt-8">
								<h3 className="uppercase text-2xl md:text-4xl font-semibold">
									{section2.surfaces.title}
								</h3>
								<p className="mt-4 md:mt-2 text-xl md:text-3xl">
									{section2.surfaces.subtitle}
								</p>

								<div className="mt-8 grid lg:grid-cols-5">
									{section2.surfaces.products.map((item, index) => (
										<div
											key={`${section1.number}-challenge-${index}`}
											className="flex flex-row lg:flex-col justify-start gap-y-2"
										>
											<div className="relative mr-3 w-4 lg:w-full">
												<div className="relative mx-auto lg:mx-0 size-1.5 rounded-full bg-black" />
												{/* dotted vertical line for mobile, horizontal line for desktop */}
												<div className="lg:hidden absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dotted border-black" />
												<div className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-full border-t border-dotted border-black" />
											</div>
											<div className="flex flex-col gap-y-2 pb-1">
												<div>{item.title}</div>
												<p className="flex-1 text-xs leading-relaxed text-zinc-700 md:text-sm -mt-1 pb-2 md:pr-4">
													{item.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</Section>

					<Section number={section3.number} title={section3.title}>
						<p>{section3.body1}</p>
						<p className="mt-4">{section3.body2}</p>

						<div className="mt-4">
							{section3.text.map((item, index) => (
								<div
									className="border-t border-zinc-200 py-4 flex flex-row"
									key={`${section3.number}-text-${index}`}
								>
									<div className="w-10 md:w-14 text-sm italic text-[#6E6E6E] ">
										{(index + 1).toString().padStart(2, "0")}
									</div>
									<p className="flex-1 text-sm leading-relaxed font-semibold">
										{item}
									</p>
								</div>
							))}
						</div>

						<div className="mt-8">
							{section3.steps.map((item, index) => (
								<div
									key={`${section1.number}-challenge-${index}`}
									className="flex justify-start gap-y-2"
								>
									<div className="relative mr-3 w-4">
										{/* dotted vertical line for mobile, horizontal line for desktop */}
										<div className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-dotted border-black" />
										<div className="relative mx-auto size-3 rounded-full border border-black bg-[#F3F3F3]" />
									</div>
									<div className="flex flex-col pb-8 gap-y-2.5">
										<div className="italic text-[#0A0A0A] -mt-1 text-sm">
											{item.title}
										</div>
										<p className="md:text-lg font-semibold">{item.subtitle}</p>
										<p className="md:text-lg leading-relaxed text-zinc-700 pb-2 md:pr-4">
											{item.body}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="mt-10">
							<p className="text-[#6E6E6E] italic">{section3.figures.title}</p>
							<div className="mt-6 space-y-4 grid grid-cols-1 md:grid-cols-[1fr_48px_1fr_48px_1fr] gap-x-0">
								{section3.figures.steps.map((item, index) => (
									<>
										<div
											key={`${section3.number}-figure-${item.title}`}
											className="h-full bg-[#F3F3F3] px-4 py-4 text-center flex flex-col items-center"
										>
											<div className="size-10 text-white rounded-full bg-black shrink-0 grow-0 flex items-center justify-center text-lg">
												{item.title.charAt(0)}
											</div>
											<p className="mt-4 text-lg font-medium text-zinc-700">
												{item.title}
											</p>
											<p className="mt-2 text-sm leading-relaxed text-zinc-700">
												{item.body}
											</p>
										</div>
										{index !== section3.figures.steps.length - 1 && (
											<div
												key={`arrow-${index}`}
												className="flex flex-col justify-center items-center"
											>
												<ArrowRightIcon className="size-6" />
											</div>
										)}
									</>
								))}
							</div>
						</div>

						<hr className="border-dotted border-t border-t-[#A3A3A3] mt-10" />

						<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
							{section3.points.map((item, index) => (
								<p
									key={`${section3.number}-point-${index}`}
									className="text-sm leading-relaxed text-zinc-700 border-l-2 border-l-red-800 p-4 bg-[#F3F3F3]"
								>
									<span className="font-semibold">{item}</span>
								</p>
							))}
						</div>
					</Section>

					<Section number={section4.number} title={section4.title}>
						<div className="space-y-6">
							<p className="text-xl">{section4.body1}</p>
							<p className="">{section4.body2}</p>
							<p className="font-semibold">{section4.body3}</p>
						</div>

						<div className="mt-10 md:mt-16">
							<p className="text-[#6E6E6E] italic">{section4.data.title}</p>
							<div className="mt-6 grid grid-flow-row md:grid-flow-col gap-4">
								<div className="aspect-4/3 px-8 py-10 flex flex-col justify-between bg-[#F3F3F3]">
									<div>
										<p className="italic">{section4.data.box1.title}</p>
										<p>{section4.data.box1.subtitle}</p>
									</div>
									<p className="text-8xl md:text-9xl">
										{section4.data.box1.stat}
									</p>
								</div>
								<div className="aspect-4/3 px-8 py-10 flex flex-col justify-between bg-[#0A0A0A] text-[#F3F3F3]">
									<div className="">
										<p className="">{section4.data.box2.title}</p>
										<p className="opacity-70">{section4.data.box2.subtitle}</p>
									</div>
									<p className="text-8xl md:text-9xl">
										{section4.data.box2.stat}
									</p>
								</div>
							</div>
							<p className="mt-6 text-[#6E6E6E]">{section4.data.body}</p>
						</div>
					</Section>

					<Section number={section5.number} title={section5.title}>
						<p className="font-fraunces font-medium text-xl">
							{section5.subtitle}
						</p>
						<p className="mt-8 text-[#6E6E6E]/60 italic font-fraunces text-sm">
							{section5.remark}
						</p>
						<p className="mt-3">{section5.body1}</p>
						<p className="mt-5">{section5.body2}</p>

						<div className="bg-[#F3F3F3] mt-8 p-6 md:p-10 flex flex-row gap-x-10">
							<ArrowRightIcon className="size-10 shrink-0 hidden md:block" />
							<p className="text-[#0A0A0A] text-xl md:text-2xl font-fraunces font-medium">
								{section5.body3}
							</p>
						</div>

						<p className="mt-14">{section5.body4}</p>

						<div className="mt-14 md:mt-20">
							<div></div>
							<p className="text-2xl md:text-4xl text-[#0A0A0A] font-fraunces">
								{section5.body5}
							</p>
						</div>
					</Section>

					<Section
						className="hidden"
						number={section6.number}
						title={section6.title}
					>
						<div className="space-y-6">
							<label
								className="text-[#6E6E6E]/60 italic font-fraunces block"
								htmlFor="email"
							>
								{section6.inputLabel}
							</label>
							<div className="pb-2 border-b border-black flex flex-row justify-between gap-x-4">
								<input
									className="w-full"
									type="email"
									id="email"
									placeholder={section6.inputPlaceholder}
								/>
								<button
									className="rounded-full px-6 py-3 text-sm bg-[#0A0A0A] text-[#f3f3f3]"
									type="button"
								>
									{section6.inputButtonLabel}
								</button>
							</div>
						</div>
						<p className="mt-6 text-[#6E6E6E] text-sm">{section6.disclaimer}</p>
					</Section>
				</main>

				<footer className="bg-[#0e1117] text-zinc-400">
					<div className="mx-auto grid max-w-[1300px] gap-8 px-4 py-8 md:grid-cols-2 md:px-10">
						<div>
							<div className="flex items-center gap-2">
								<img src={veneraLogo} alt="Venera" className="size-6" />
								<p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
									Venera AI
								</p>
							</div>
							<p className="mt-3 max-w-md text-sm text-zinc-300">
								A clinical intelligence platform for interoperable records,
								reasoning systems, and safe AI deployment.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.12em] text-zinc-500">
							<div>
								<p className="mb-3 text-zinc-300">Sections</p>
								<ul className="space-y-2">
									{navItems.slice(0, 3).map((item) => (
										<li key={item.href}>
											<a href={item.href} className="hover:text-zinc-200">
												{item.label}
											</a>
										</li>
									))}
								</ul>
							</div>
							<div>
								<p className="mb-3 text-zinc-300">More</p>
								<ul className="space-y-2">
									{navItems.slice(3).map((item) => (
										<li key={item.href}>
											<a href={item.href} className="hover:text-zinc-200">
												{item.label}
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
