import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { Fragment, type ComponentProps } from "react";
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
	// { label: "Download", href: "#download" },
];

export default function WhitepaperPage() {
	const { t } = useTranslation("whitepaper");
	const section1 = t("section1", { returnObjects: true });
	const section2 = t("section2", { returnObjects: true });
	const section3 = t("section3", { returnObjects: true });
	const section4 = t("section4", { returnObjects: true });
	const section5 = t("section5", { returnObjects: true });
	const section6 = t("section6", { returnObjects: true });

	return (
		<div className="min-h-screen bg-white font-inter text-[#0A0A0A]">
			<div className="mx-auto max-w-[1470px]">
				<header className="z-20 backdrop-blur md:sticky md:top-0">
					<div className="mx-auto flex items-center gap-5 px-4 py-4 md:px-10 md:py-5">
						<Link to="/" className="flex items-center gap-2">
							<img src={veneraLogo} alt="Venera" className="size-8" />
							<span className="font-fraunces font-semibold tracking-wide text-nowrap">
								Venera AI
							</span>
						</Link>

						<nav className="hidden xl:flex flex-1 items-center justify-center gap-2">
							{navItems.map((item, index) => (
								<a
									key={item.href}
									href={item.href}
									className="flex flex-row items-baseline gap-2 px-2 py-1 hover:text-black hover:scale-105 transition-[scale]"
								>
									<span className="italic font-normal font-fraunces text-[#6E6E6E] text-[11px]">
										{(index + 1).toString().padStart(2, "0")}
									</span>
									<span className="text-[13px] font-inter">{item.label}</span>
								</a>
							))}
						</nav>

						<div className="ml-auto flex items-center gap-2">
							{/* <a
                href="#download"
                className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-300 px-3 text-xs uppercase tracking-[0.12em] transition hover:bg-zinc-100"
              >
                <DownloadIcon className="size-3.5" />
                <span className="hidden md:inline">Download</span>
              </a> */}
							<Link
								to="/dashboard"
								className="inline-flex h-9 items-center gap-1 rounded-full bg-black px-4 text-xs uppercase tracking-[0.12em] text-white transition hover:bg-zinc-800"
							>
								API Platform
							</Link>
						</div>
					</div>
				</header>

				<main className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
					<section className="md:px-10 grid gap-8 border-zinc-200 py-12 lg:grid-cols-[1fr_240px] md:items-center md:py-40">
						<div>
							<h1 className="font-fraunces font-medium text-4xl leading-[1.04] md:text-6xl lg:text-7xl">
								{t("title")}
							</h1>
							<p className="font-fraunces mt-5 text-2xl md:text-3xl lg:text-4xl italic font-light tracking-[-1px]">
								{t("subtitle")}
							</p>
							<div className="mt-10 grid grid-cols-1 gap-6 border-t border-zinc-200 pt-6 text-sm md:grid-cols-3">
								<div>
									<p className="font-fraunces text-[13px] text-[#6E6E6E] italic">
										{t("series.label")}
									</p>
									<p className="mt-1 text-sm">{t("series.text")}</p>
								</div>
								<div>
									<p className="font-fraunces text-[13px] text-[#6E6E6E] italic">
										{t("writtenBy.label")}
									</p>
									<p className="mt-1 text-sm">{t("writtenBy.text")}</p>
								</div>
								<div>
									<p className="font-fraunces text-[13px] text-[#6E6E6E] italic">
										{t("published.label")}
									</p>
									<p className="mt-1 text-sm">{t("published.text")}</p>
								</div>
							</div>
						</div>
					</section>

					<Separator className="my-10" />

					<Section
						id="introduction"
						number={t("section1.number")}
						title={t("section1.title")}
					>
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
											<p className="font-fraunces flex-1 leading-relaxed  md:text-xl tracking-[-0.4px] -mt-1 pb-2 md:pr-4">
												{item}
											</p>
										</div>
									))}
								</div>
							</div>

							<div className="flex flex-row justify-start items-start gap-2 md:gap-6 mt-10 md:mt-16">
								<div>
									<ArrowRightIcon className="size-6 md:size-10 " />
								</div>
								<p className="font-fraunces text-2xl leading-tight text-zinc-800 md:text-4xl">
									{section1.body1}
								</p>
							</div>

							<Separator className="my-16" />

							<div className="mt-10 grid grid-flow-row md:grid-flow-col gap-y-4 md:gap-x-16">
								<div className="space-y-2">
									<p className="font-fraunces text-sm opacity-60 text-[#6E6E6E] font-normal italic">
										{section1.remark}
									</p>
									<p className="font-fraunces text-2xl md:text-[36px] font-normal">
										{section1.body2}
									</p>
								</div>
								<div className="space-y-4 leading-7">
									<p>{section1.body3}</p>
									<p>{section1.body4}</p>
								</div>
							</div>
						</div>
					</Section>

					<Separator className="my-10" />

					<Section
						id="platform"
						number={section2.number}
						title={section2.title}
					>
						<div>
							<div className="space-y-2">
								<p className="md:text-[19px] font-semibold leading-relaxed">
									{section2.description}
								</p>
								<p className="md:text-[17px] leading-7">{section2.example}</p>
							</div>

							<div className="flex flex-col lg:flex-row gap-8 mt-10 lg:mt-16">
								{section2.cards.map(({ text1, text2, text3, text4 }, index) => (
									<Fragment key={`section2-card-${index}`}>
										<div className="bg-[#f3f3f3] p-4 lg:p-8">
											<div className="py-4 space-y-4">
												<div className="font-fraunces italic text-[13px] text-[#6e6e6e]">
													{text1}
												</div>
												<div className="font-fraunces lg:text-[22px] font-medium text-[#0a0a0a]">
													{text2}
												</div>
											</div>
											<div className="pt-8 border-t border-[#E7E3DA] space-y-2">
												<div className="font-fraunces italic text-[13px] text-[#ea2c00]">
													{text3}
												</div>
												<div>{text4}</div>
											</div>
										</div>
										{index !== section2.cards.length - 1 && (
											<div className="flex items-center justify-center">
												<ArrowDownIcon className="lg:hidden size-6" />
												<ArrowRightIcon className="hidden lg:block size-10" />
											</div>
										)}
									</Fragment>
								))}
							</div>

							<div className="mt-12 md:mt-24">
								<h3 className="font-fraunces uppercase text-2xl md:text-4xl font-semibold">
									{section2.coverage.title}
								</h3>
								<div className="mt-4 md:mt-2 flex flex-col md:flex-row md:space-between gap-y-2 gap-x-8">
									<p className="md:w-1/2 font-fraunces text-xl md:text-3xl">
										{section2.coverage.subtitle}
									</p>
									<p className="md:w-1/2 leading-6">
										{section2.coverage.description}
									</p>
								</div>

								<div className="mt-12 bg-[#F3F3F3] p-4 md:px-10 md:py-12 border border-[#E7E3DA] rounded-md">
									<div className="font-fraunces opacity-60 italic">
										{section2.coverage.figure.title}
									</div>
									<img
										className="w-full mt-3"
										src="/whitepaper/surface-figure.svg"
										alt=""
									/>
									<div className="mt-8 space-y-1">
										<div className="font-fraunces font-semibold">
											{section2.coverage.figure.note.title}
										</div>
										<div className="text-sm">
											{section2.coverage.figure.note.body}
										</div>
									</div>
								</div>
							</div>

							<div className="mt-16 md:mt-24">
								<h3 className="font-fraunces uppercase text-2xl md:text-4xl font-semibold">
									{section2.surfaces.title}
								</h3>
								<p className="font-fraunces mt-4 md:mt-2 text-xl md:text-3xl">
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
												<div className="font-fraunces">{item.title}</div>
												<p className="flex-1 text-xs leading-relaxed  md:text-sm -mt-1 pb-2 md:pr-4">
													{item.description}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</Section>

					<Separator className="my-10" />

					<Section
						id="architecture"
						number={section3.number}
						title={section3.title}
					>
						<p className="leading-7">{section3.body1}</p>
						<p className="mt-4 leading-7">{section3.body2}</p>

						<div className="mt-4">
							{section3.text.map((item, index) => (
								<div
									className="border-t border-zinc-200 py-4 flex flex-row items-baseline"
									key={`${section3.number}-text-${index}`}
								>
									<div className="font-fraunces w-10 md:w-14 text-sm text-[#6E6E6E]/60">
										{(index + 1).toString().padStart(2, "0")}
									</div>
									<p className="flex-1 text-lg leading-relaxed font-semibold">
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
										<div className="font-fraunces italic text-[#0A0A0A] -mt-1 text-sm">
											{item.title}
										</div>
										<p className="md:text-lg font-semibold">{item.subtitle}</p>
										<p className="md:text-lg leading-relaxed  pb-2 md:pr-4">
											{item.body}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="mt-10">
							<p className="text-[#6E6E6E] italic text-sm">
								{section3.figures.title}
							</p>
							<div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_48px_1fr_48px_1fr] gap-x-0 gap-y-4">
								{section3.figures.steps.map((item, index) => (
									<Fragment key={`${section3.number}-figure-${index}`}>
										<div className="h-full bg-[#F3F3F3] p-6 text-center flex flex-col items-center rounded-md">
											<div className="font-fraunces size-10 text-white rounded-full bg-black shrink-0 grow-0 flex items-center justify-center text-lg">
												{item.title.charAt(0)}
											</div>
											<div className="font-fraunces mt-4 text-lg font-medium ">
												{item.title}
											</div>
											<p className="mt-2 text-sm leading-relaxed ">
												{item.body}
											</p>
										</div>
										{index !== section3.figures.steps.length - 1 && (
											<div className="flex flex-col justify-center items-center">
												<ArrowDownIcon className="md:hidden size-6" />
												<ArrowRightIcon className="hidden md:block size-6" />
											</div>
										)}
									</Fragment>
								))}
							</div>
						</div>

						<Separator className="border-dotted mt-10" />

						<div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
							{section3.points.map((item, index) => (
								<p
									key={`${section3.number}-point-${index}`}
									className="text-sm leading-relaxed  border-l-2 border-l-[#EA2C00] p-4 bg-[#F3F3F3]"
								>
									<span className="font-semibold">{item}</span>
								</p>
							))}
						</div>
					</Section>

					<Separator className="my-10" />

					<Section
						id="benchmarks"
						number={section4.number}
						title={section4.title}
					>
						<div className="space-y-6">
							<p className="text-xl">{section4.body1}</p>
							<p className="">{section4.body2}</p>
							<p className="font-semibold">{section4.body3}</p>
						</div>

						<div className="mt-10 md:mt-16">
							<p className="font-fraunces text-[#6E6E6E] italic text-sm">
								{section4.data.title}
							</p>
							<div className="font-fraunces mt-6 grid grid-flow-row md:grid-flow-col gap-4">
								<div className="px-8 py-10 flex flex-col justify-between gap-y-20 bg-[#F3F3F3]">
									<div>
										<p className="italic text-xs font-normal opacity-60">
											{section4.data.box1.title}
										</p>
										<p className="">{section4.data.box1.subtitle}</p>
									</div>
									<p className="text-8xl lg:text-9xl">
										{section4.data.box1.stat}
									</p>
								</div>
								<div className="px-8 py-10 flex flex-col justify-between gap-y-20 bg-[#0A0A0A] text-[#F3F3F3]">
									<div className="">
										<p className="text-xs font-normal">
											{section4.data.box2.title}
										</p>
										<p className="opacity-70">{section4.data.box2.subtitle}</p>
									</div>
									<p className="text-8xl lg:text-9xl">
										{section4.data.box2.stat}
									</p>
								</div>
							</div>
							<p className="mt-6 text-[#6E6E6E] text-sm">
								{section4.data.body}
							</p>
						</div>
					</Section>

					<Separator className="my-10" />

					<Section
						id="conclusion"
						number={section5.number}
						title={section5.title}
					>
						<p className="font-fraunces font-medium text-xl">
							{section5.subtitle}
						</p>
						<p className="mt-8 text-[#6E6E6E]/60 italic font-fraunces text-sm">
							{section5.remark}
						</p>
						<p className="mt-3 leading-7">{section5.body1}</p>
						<p className="mt-5 leading-7">{section5.body2}</p>

						<div className="bg-[#F3F3F3] mt-8 p-6 md:p-10 flex flex-row gap-x-4 md:gap-x-10">
							<ArrowRightIcon className="size-6 md:size-10 shrink-0 block" />
							<p className="text-xl md:text-2xl font-fraunces font-medium leading-8">
								{section5.body3}
							</p>
						</div>

						<p className="mt-14 leading-7">{section5.body4}</p>

						<Separator className="my-14" />

						<div className="md:mt-20 flex flex-col md:flex-row gap-x-10">
							<img
								className="w-1/2 md:w-1/5 mx-auto shrink-0"
								src="/whitepaper/section5-infinity.svg"
								alt=""
							/>
							<p className="text-2xl md:text-4xl font-fraunces leading-10">
								{section5.body5}
							</p>
						</div>
					</Section>

					<Separator className="hidden my-10" />

					<Section
						id="download"
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
							<div className="max-w-lg pb-2 border-b border-black flex flex-row justify-between gap-x-4">
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
			</div>

			<footer className="bg-[#1A1A1A]">
				<div className="mx-auto max-w-[1300px] px-4 py-8 md:px-10 pt-16 pb-14">
					<div className="flex flex-col md:flex-row gap-8 justify-between">
						<div>
							<div className="flex items-center gap-2">
								<img src={veneraLogo} alt="Venera" className="size-6" />
								<p className="font-fraunces font-medium text-xl text-[#F3F3F3]">
									Venera AI
								</p>
							</div>
							<p className="font-fraunces mt-3 max-w-md text-xl text-[#F5F1E8]/80">
								{t("footer.description")}
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4">
							<div>
								<p className="text-[#F5F1E8]/50 font-fraunces italic text-[13px]">
									{t("footer.contact.label")}
								</p>
								<div className="mt-2.5 space-y-2.5 text-[#F5F1E8]/85 text-sm flex flex-col">
									<a href={`mailto:${t("footer.contact.email")}`}>
										{t("footer.contact.email")}
									</a>
									<a href={`tel:${t("footer.contact.phone")}`}>
										{t("footer.contact.phone")}
									</a>
									<p>{t("footer.contact.location")}</p>
								</div>
							</div>
						</div>
					</div>

					<Separator className="my-12 opacity-10" />

					<div className="flex flex-col lg:flex-row justify-between text-[#F5F1E8]/40">
						<div>{t("footer.copyright")}</div>
						<div>{t("footer.version")}</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function Section({
	number,
	title,
	children,
	className,
	...props
}: {
	number: string;
	title: string;
} & ComponentProps<"section">) {
	return (
		<section
			className={cn(
				"grid grid-cols-1 md:grid-cols-[74px_1fr] gap-5 space-y-10 md:px-4 py-12 md:py-16 gap-x-20",
				className
			)}
			{...props}
		>
			<div className="hidden md:block">
				<p className="font-fraunces font-light tracking-[-2px] text-3xl md:text-8xl leading-none ">
					{number}
				</p>
			</div>
			<div className="space-y-12 md:space-y-20">
				<div className="flex flex-row gap-4 md:gap-10">
					<span className="md:hidden font-fraunces text-3xl tracking-[-2px] font-light text-zinc-900 md:mt-5 md:text-4xl">
						{number}
					</span>
					<h2 className="font-fraunces text-3xl leading-tight tracking-[-1.5px] text-zinc-900 md:text-6xl">
						{title}
					</h2>
				</div>
				<div>{children}</div>
			</div>
		</section>
	);
}

function Separator(props: ComponentProps<"hr">) {
	return <hr className={cn("border-t border-[#E7E3DA]", props.className)} />;
}
