// BHXH 4210 envelope helpers.
//
// QD 4210/2017 + QD 130/2018 + QD 5937/2023 define a top-level
// <GIAMDINHHS> envelope that contains <FILEHOSO> children, one per table
// (XML1..XML9). Each <NOIDUNGFILE> is base64-encoded UTF-8 of the inner
// table XML. The FHIR Converter Worker only operates on the envelope —
// bare per-table files (TONG_HOP, CHITIEU_CHITIET_THUOC, …) need to be
// packed into a synthetic envelope before they will convert.

export type BhxhTable = {
	loaiHoSo: string; // "XML1".."XML9"
	innerXml: string; // decoded NOIDUNGFILE
	rootTag: string; // top-level tag of the inner XML, e.g. "TONG_HOP"
};

const ROOT_TO_LOAI: Record<string, string> = {
	TONG_HOP: "XML1",
	CHITIEUKCB: "XML1",
	CHI_TIET_THUOC: "XML2",
	CHITIETTHUOC: "XML2",
	CHITIEU_CHITIET_THUOC: "XML2",
	CHITIEU_CHITIET_DICHVUCANLAMSANG: "XML3",
	CHITIEU_CHITIET_DVKT_VTYT: "XML3",
	CHITIET_DVKT: "XML3",
	CHITIET_CLSANLAMSANG: "XML3",
	CHITIEU_CHITIET_DIENBIENLAMSANG: "XML4",
	CHITIET_DIEN_BIEN: "XML4",
	CHITIET_DIEN_BIEN_BENH: "XML4",
	CHI_TIEU_DU_LIEU_GIAY_RA_VIEN: "XML5",
	CHITIET_RA_VIEN: "XML5",
	THONGTINDONTHUOC: "XML6",
	CHITIET_GIAM_DINH: "XML7",
	CHITIET_CHUYEN_DE: "XML8",
	CHITIET_THANH_TOAN: "XML9",
};

const stripPreamble = (raw: string): string =>
	raw
		.replace(/^﻿/, "")
		.trim()
		.replace(/^<\?xml[^?]*\?>\s*/i, "");

const rootTagOf = (xml: string): string => {
	const m = stripPreamble(xml).match(/^<([A-Z0-9_]+)/i);
	return (m?.[1] ?? "").toUpperCase();
};

const tableForRoot = (root: string): string | null => {
	const direct = ROOT_TO_LOAI[root];
	if (direct) return direct;
	const m = root.match(/^XML([1-9])$/);
	return m ? `XML${m[1]}` : null;
};

// Encode a UTF-8 string to base64 the way the BHXH spec expects.
// btoa() only handles Latin-1; we re-encode through %xx-escaped UTF-8
// so Vietnamese diacritics survive the round-trip.
const utf8ToBase64 = (s: string): string => {
	// biome-ignore lint/suspicious/noExplicitAny: deprecated unescape is the simplest path
	return btoa((unescape as any)(encodeURIComponent(s)));
};

const base64ToUtf8 = (b64: string): string => {
	const bin = atob(b64.replace(/\s+/g, ""));
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new TextDecoder("utf-8").decode(bytes);
};

const isEnvelope = (xml: string): boolean =>
	stripPreamble(xml).toUpperCase().startsWith("<GIAMDINHHS");

// Decode a GIAMDINHHS envelope into its individual tables.
export const decodeBhxhEnvelope = (xml: string): BhxhTable[] => {
	if (!isEnvelope(xml)) return [];
	const tables: BhxhTable[] = [];
	const fileRe = /<FILEHOSO>([\s\S]*?)<\/FILEHOSO>/gi;
	let fileMatch: RegExpExecArray | null;
	fileMatch = fileRe.exec(xml);
	while (fileMatch !== null) {
		const block = fileMatch[1];
		const loaiMatch = /<LOAIHOSO>\s*([^<]+?)\s*<\/LOAIHOSO>/i.exec(block);
		const noidungMatch = /<NOIDUNGFILE>\s*([^<]+?)\s*<\/NOIDUNGFILE>/i.exec(
			block
		);
		if (loaiMatch && noidungMatch) {
			let innerXml = "";
			try {
				innerXml = base64ToUtf8(noidungMatch[1]);
			} catch {
				innerXml = "";
			}
			tables.push({
				loaiHoSo: loaiMatch[1].toUpperCase(),
				innerXml,
				rootTag: rootTagOf(innerXml),
			});
		}
		fileMatch = fileRe.exec(xml);
	}
	return tables;
};

// Decoded record (one HOSO with all its FILEHOSO children decoded).
export type BhxhDecodedRecord = {
	maLk: string | null; // first MA_LK found across files in this record
	tables: BhxhTable[];
};

// Decode a GIAMDINHHS envelope grouped by HOSO (record). Each HOSO is one
// medical episode and contains one FILEHOSO per XML type. This is the shape
// the validator's per-record view needs so the user can match decoded XML
// to the per-MA_LK error report.
export const decodeBhxhEnvelopeByRecord = (
	xml: string
): BhxhDecodedRecord[] => {
	if (!isEnvelope(xml)) return [];
	const records: BhxhDecodedRecord[] = [];
	const hosoRe = /<HOSO>([\s\S]*?)<\/HOSO>/gi;
	let hosoMatch: RegExpExecArray | null = hosoRe.exec(xml);
	while (hosoMatch !== null) {
		const hosoBlock = hosoMatch[1];
		const tables: BhxhTable[] = [];
		const fileRe = /<FILEHOSO>([\s\S]*?)<\/FILEHOSO>/gi;
		let fileMatch: RegExpExecArray | null = fileRe.exec(hosoBlock);
		while (fileMatch !== null) {
			const block = fileMatch[1];
			const loaiMatch = /<LOAIHOSO>\s*([^<]+?)\s*<\/LOAIHOSO>/i.exec(block);
			const noidungMatch = /<NOIDUNGFILE>\s*([^<]+?)\s*<\/NOIDUNGFILE>/i.exec(
				block
			);
			if (loaiMatch && noidungMatch) {
				let innerXml = "";
				try {
					innerXml = base64ToUtf8(noidungMatch[1]);
				} catch {
					innerXml = "";
				}
				tables.push({
					loaiHoSo: loaiMatch[1].toUpperCase(),
					innerXml,
					rootTag: rootTagOf(innerXml),
				});
			}
			fileMatch = fileRe.exec(hosoBlock);
		}
		// Best-effort MA_LK from the first file that has one.
		let maLk: string | null = null;
		for (const t of tables) {
			const m = /<MA_LK>\s*([^<]+?)\s*<\/MA_LK>/i.exec(t.innerXml);
			if (m) {
				maLk = m[1];
				break;
			}
		}
		records.push({ maLk, tables });
		hosoMatch = hosoRe.exec(xml);
	}
	return records;
};

// Light-touch pretty-printer for the decoded inner XML. Adds newlines after
// every closing tag so the output is readable in a textarea without pulling
// in a heavy XML formatter dependency. Self-closing and CDATA blocks are
// preserved verbatim.
const prettyXml = (xml: string): string => {
	const cleaned = xml.replace(/>\s+</g, "><").trim();
	let depth = 0;
	let out = "";
	let i = 0;
	while (i < cleaned.length) {
		if (cleaned.startsWith("<![CDATA[", i)) {
			const end = cleaned.indexOf("]]>", i);
			if (end === -1) {
				out += cleaned.slice(i);
				break;
			}
			out += cleaned.slice(i, end + 3);
			i = end + 3;
			continue;
		}
		if (cleaned[i] === "<") {
			const end = cleaned.indexOf(">", i);
			if (end === -1) {
				out += cleaned.slice(i);
				break;
			}
			const tag = cleaned.slice(i, end + 1);
			const isClosing = tag.startsWith("</");
			const isSelfClosing = tag.endsWith("/>") || tag.startsWith("<?");
			if (isClosing) depth = Math.max(0, depth - 1);
			if (out && !out.endsWith("\n")) out += "\n";
			out += `${"  ".repeat(depth)}${tag}`;
			if (!isClosing && !isSelfClosing) depth += 1;
			i = end + 1;
		} else {
			const next = cleaned.indexOf("<", i);
			if (next === -1) {
				out += cleaned.slice(i);
				break;
			}
			out += cleaned.slice(i, next);
			i = next;
		}
	}
	return out.replace(/\n+/g, "\n");
};

// Render a GIAMDINHHS envelope as a single human-readable XML document where
// each FILEHOSO/NOIDUNGFILE has been base64-decoded inline. Records are
// separated by visible markers so the user can scroll through 500 hồ sơ
// efficiently.
export const decodeBhxhEnvelopeToReadable = (xml: string): string => {
	const records = decodeBhxhEnvelopeByRecord(xml);
	if (records.length === 0) return xml; // not an envelope; nothing to decode
	const sections: string[] = [];
	for (let r = 0; r < records.length; r++) {
		const rec = records[r];
		const header = `<!-- ===== Record ${r + 1} of ${records.length}${
			rec.maLk ? ` · MA_LK=${rec.maLk}` : ""
		} ===== -->`;
		const tableBlocks = rec.tables.map((t) => {
			const body = t.innerXml.trim() ? prettyXml(t.innerXml) : "(empty)";
			return `<!-- --- ${t.loaiHoSo}${
				t.rootTag ? ` (${t.rootTag})` : ""
			} --- -->\n${body}`;
		});
		sections.push([header, ...tableBlocks].join("\n\n"));
	}
	return sections.join("\n\n");
};

// Wrap one or more bare BHXH tables into a synthetic GIAMDINHHS envelope.
// Tables are sorted into XML1..XML9 order. Multiple tables for the same
// LOAIHOSO are kept in input order and packed under the same <HOSO>.
export const wrapBareBhxhTables = (
	rawSources: string[],
	opts: { facilityCode?: string } = {}
): { envelope: string; tables: BhxhTable[]; missingXml1: boolean } => {
	const tables: BhxhTable[] = [];
	for (const raw of rawSources) {
		const cleaned = stripPreamble(raw);
		if (!cleaned) continue;
		const root = rootTagOf(cleaned);
		const loai = tableForRoot(root);
		if (!loai) continue;
		tables.push({ loaiHoSo: loai, innerXml: cleaned, rootTag: root });
	}
	tables.sort((a, b) => {
		const an = Number.parseInt(a.loaiHoSo.replace("XML", ""), 10);
		const bn = Number.parseInt(b.loaiHoSo.replace("XML", ""), 10);
		return an - bn;
	});

	const facility = opts.facilityCode ?? "00000";
	const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
	const fileHoSos = tables
		.map(
			(t) =>
				`        <FILEHOSO>\n          <LOAIHOSO>${t.loaiHoSo}</LOAIHOSO>\n          <NOIDUNGFILE>${utf8ToBase64(t.innerXml)}</NOIDUNGFILE>\n        </FILEHOSO>`
		)
		.join("\n");

	const envelope = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<GIAMDINHHS>
  <THONGTINDONVI>
    <MACSKCB>${facility}</MACSKCB>
  </THONGTINDONVI>
  <THONGTINHOSO>
    <NGAYLAP>${today}</NGAYLAP>
    <SOLUONGHOSO>1</SOLUONGHOSO>
    <DANHSACHHOSO>
      <HOSO>
${fileHoSos}
      </HOSO>
    </DANHSACHHOSO>
  </THONGTINHOSO>
</GIAMDINHHS>`;
	return {
		envelope,
		tables,
		missingXml1: !tables.some((t) => t.loaiHoSo === "XML1"),
	};
};
