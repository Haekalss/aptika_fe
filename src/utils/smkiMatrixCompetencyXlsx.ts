import {
  DEFAULT_COMPETENCIES,
  DEFAULT_EMPLOYEE_LEVELS,
  DEFAULT_KORDINATOR_LEVELS,
  DEFAULT_SMKI_UNITS,
  DEFAULT_TEAM_TEKNIS_LEVELS,
  type MatrixDocument,
  type MatrixRoleRow,
} from "@/services/smki/matrixCompetencyService";

const FONT_TAHOMA = "Tahoma";
const FONT_ARIAL = "Arial";
const ORG = "Dinas Komunikasi dan Informatika Provinsi Jawa Barat";
const K006 =
  "Kemampuan yang terdapat pada K-006 Kebijakan Standar Kompetensi Sistem Manajemen Keamanan Informasi";

const CYAN_FILL = "FFCCFFFF"; // #CCFFFF
const GRAY_FILL = "FFC0C0C0"; // #C0C0C0
const BLUE_HEADER_FILL = "FF00B0F0"; // #00B0F0
const PINK_0_FILL = "FFFF99CC"; // #FF99CC (level 0)
const YELLOW_1_FILL = "FFFFFF99"; // #FFFF99 (level 1)
const GREEN_4_FILL = "FF00FF00"; // #00FF00 (level 4)

const LEGEND = [
  "Definisi",
  "0 - Tidak perlu memiliki pengetahuan",
  "1 - Harus memiliki pengetahuan dasar",
  "2 - Harus dilakukan dengan dukungan",
  "3 - Harus memiliki pengetahuan & melakukannya secara mandiri",
  "4 - Harus pandai teori dan praktis dan bisa melatih",
];

function colLetter(colNumber: number): string {
  let n = colNumber;
  let letter = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function resolveCompHeader(label: string | undefined): string {
  const trimmed = (label ?? "").trim();
  if (!trimmed || /^K-\d+$/i.test(trimmed)) {
    return K006;
  }
  return trimmed;
}

function solidFill(argb: string) {
  return {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb },
  };
}

function levelColorFill(val: number | null | undefined) {
  if (val === 0) return solidFill(PINK_0_FILL);
  if (val === 1) return solidFill(YELLOW_1_FILL);
  if (val === 4) return solidFill(GREEN_4_FILL);
  return undefined;
}

const DATA_CELL_BORDER = {
  left: { style: "thin" as const },
  top: { style: "hair" as const },
  bottom: { style: "hair" as const },
};

const BOX_MEDIUM_BORDER = {
  top: { style: "medium" as const },
  left: { style: "medium" as const },
  bottom: { style: "medium" as const },
  right: { style: "medium" as const },
};

const BOX_THIN_BORDER = {
  top: { style: "thin" as const },
  left: { style: "thin" as const },
  bottom: { style: "thin" as const },
  right: { style: "thin" as const },
};

function addMatrixConditionalFormatting(ws: any, refRange: string) {
  if (typeof ws.addConditionalFormatting !== "function") return;
  ws.addConditionalFormatting({
    ref: refRange,
    rules: [
      {
        type: "cellIs",
        operator: "equal",
        priority: 1,
        formulae: [4],
        style: { fill: solidFill(GREEN_4_FILL) },
      },
      {
        type: "cellIs",
        operator: "equal",
        priority: 2,
        formulae: [1],
        style: { fill: solidFill(YELLOW_1_FILL) },
      },
      {
        type: "cellIs",
        operator: "equal",
        priority: 3,
        formulae: [0],
        style: { fill: solidFill(PINK_0_FILL) },
      },
    ],
  });
}

function normalizeRoleGroups(
  doc: MatrixDocument,
  nCols: number
): {
  groups: { unit: string; kordinator: number[]; teamTeknis: number[] }[];
  activeUnitIndex: number;
} {
  const fit = (arr: number[] | undefined, fallback: number[]) =>
    Array.from({ length: nCols }, (_, i) => {
      const v = arr?.[i];
      return v !== undefined && v !== null
        ? Number(v)
        : (fallback[i] ?? fallback[fallback.length - 1] ?? 0);
    });

  const inputGroups: { unit: string; rows: MatrixRoleRow[] }[] = [];
  (doc.roles ?? []).forEach((r) => {
    const u = (r.unit_label || "").trim() || doc.nama_unit_kerja || "SMKI Bidang.....";
    const found = inputGroups.find((g) => g.unit.toLowerCase() === u.toLowerCase());
    if (found) found.rows.push(r);
    else inputGroups.push({ unit: u, rows: [r] });
  });

  const isAllZero = (arr: number[] | undefined) =>
    !arr || arr.every((v) => Number(v) === 0);

  const resultGroups: { unit: string; kordinator: number[]; teamTeknis: number[] }[] = [];

  if (inputGroups.length >= 2) {
    inputGroups.forEach((g) => {
      const kRow = g.rows.find((x) => x.peran === "Kordinator");
      const tRow = g.rows.find((x) => x.peran === "Team Teknis");
      resultGroups.push({
        unit: g.unit,
        kordinator: fit(
          isAllZero(kRow?.levels) ? undefined : kRow?.levels,
          DEFAULT_KORDINATOR_LEVELS
        ),
        teamTeknis: fit(
          isAllZero(tRow?.levels) ? undefined : tRow?.levels,
          DEFAULT_TEAM_TEKNIS_LEVELS
        ),
      });
    });
  } else {
    const singleGroup = inputGroups[0];
    const singleK = singleGroup?.rows.find((x) => x.peran === "Kordinator")?.levels;
    const singleT = singleGroup?.rows.find((x) => x.peran === "Team Teknis")?.levels;
    const kLevels = fit(
      isAllZero(singleK) ? undefined : singleK,
      DEFAULT_KORDINATOR_LEVELS
    );
    const tLevels = fit(
      isAllZero(singleT) ? undefined : singleT,
      DEFAULT_TEAM_TEKNIS_LEVELS
    );

    DEFAULT_SMKI_UNITS.forEach((unit) => {
      resultGroups.push({
        unit,
        kordinator: [...kLevels],
        teamTeknis: [...tLevels],
      });
    });

    const customUnit = (doc.nama_unit_kerja || singleGroup?.unit || "").trim();
    if (
      customUnit &&
      customUnit !== "Unit Kerja" &&
      !resultGroups.some(
        (g) =>
          g.unit.toLowerCase().includes(customUnit.toLowerCase()) ||
          customUnit
            .toLowerCase()
            .includes(g.unit.replace(/^SMKI\s+/i, "").toLowerCase())
      )
    ) {
      resultGroups.push({
        unit: customUnit,
        kordinator: [...kLevels],
        teamTeknis: [...tLevels],
      });
    }
  }

  const target = (doc.nama_unit_kerja || "").trim().toLowerCase();
  let activeUnitIndex = 3; // Default in FR-031 Matrix Competency.xlsx is index 3 (rows 14 & 15)
  if (target) {
    const idx = resultGroups.findIndex((g) => {
      const u = g.unit.toLowerCase();
      const stripped = u.replace(/^smki\s+/i, "");
      return u === target || u.includes(target) || target.includes(stripped);
    });
    if (idx >= 0) activeUnitIndex = idx;
  }
  if (activeUnitIndex >= resultGroups.length) {
    activeUnitIndex = 0;
  }

  return { groups: resultGroups, activeUnitIndex };
}

/**
 * Ekspor 100% sesuai XML asli `FR-031 Matrix Competency.xlsx`:
 * - Sheet 1: `Roles Matrix (2)`
 * - Sheet 2: `Employee  Matrix`
 * - Sheet 3: `Gap Analisis`
 * - Sheet 4: `Rencana Training`
 */
export async function exportMatrixCompetencyXlsx(doc: MatrixDocument): Promise<void> {
  // @ts-ignore: bundel browser exceljs
  const mod: any = await import("exceljs/dist/exceljs.min.js");
  const ExcelJS = mod.default ?? mod;
  const wb = new ExcelJS.Workbook();
  wb.creator = "SMKI Diskominfo Jabar";

  const comps = doc.competencies?.length ? doc.competencies : DEFAULT_COMPETENCIES;
  const isDefault16 =
    comps.length === 16 &&
    comps.every((c, i) => c === `K-${String(i + 1).padStart(2, "0")}`);

  // Pada file asli FR-031:
  // - Roles Matrix (2): 15 kolom kompetensi (C..Q)
  // - Employee  Matrix: 16 kolom kompetensi (D..S)
  // - Gap Analisis: 15 kolom kompetensi (D..R)
  const nRoles = isDefault16 ? 15 : comps.length;
  const nEmp = comps.length;
  const nGap = isDefault16 ? 15 : comps.length;

  const { groups: roleGroups, activeUnitIndex } = normalizeRoleGroups(
    doc,
    Math.max(nRoles, nEmp)
  );

  let activeKordinatorRow = 14;
  let activeTeamTeknisRow = 15;

  // ============================================================================
  // 1. SHEET: Roles Matrix (2)
  // ============================================================================
  {
    const ws = wb.addWorksheet("Roles Matrix (2)", {
      views: [{ state: "normal", zoomScale: 85, zoomScaleNormal: 85 }],
      pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    ws.getColumn(1).width = 65.44;
    ws.getColumn(2).width = 4.44;
    for (let i = 0; i < nRoles; i++) {
      ws.getColumn(3 + i).width = 4.44;
    }
    ws.getColumn(3 + nRoles).width = 10.44;

    // Row 1 (ht 79.8) - s=1 on A1, s=2 on B1, s=3 on C1:Q1 (NO border, wrapText=false on B1:Q1!)
    ws.getRow(1).height = 79.8;
    const a1 = ws.getCell(1, 1);
    a1.value = ORG;
    a1.font = { name: FONT_TAHOMA, size: 10, bold: true };
    a1.alignment = { horizontal: "left", wrapText: true };
    a1.border = BOX_MEDIUM_BORDER;

    const b1 = ws.getCell(1, 2);
    b1.value = "Kemampuan yang dimiliki";
    b1.font = { name: FONT_TAHOMA, size: 10, bold: true };
    b1.alignment = { horizontal: "left", textRotation: 90 };
    b1.fill = solidFill(CYAN_FILL);

    for (let i = 0; i < nRoles; i++) {
      const c = ws.getCell(1, 3 + i);
      c.value = resolveCompHeader(comps[i]);
      c.font = { name: FONT_TAHOMA, size: 10, bold: false };
      c.alignment = { horizontal: "left", textRotation: 90 };
    }

    // Row 2 (hidden gray bar, ht 3.75) - s=8 / s=9
    const row2 = ws.getRow(2);
    row2.height = 3.75;
    row2.hidden = true;
    const b2 = ws.getCell(2, 2);
    b2.value = 7;
    b2.font = { name: FONT_TAHOMA, size: 10 };
    b2.fill = solidFill(GRAY_FILL);
    b2.border = { left: { style: "thin" } };

    const row2Nums: Record<number, number> = { 0: 8, 11: 9, 12: 10, 13: 9 };
    for (let i = 0; i < nRoles; i++) {
      const c = ws.getCell(2, 3 + i);
      if (row2Nums[i] !== undefined) c.value = row2Nums[i];
      c.font = { name: FONT_TAHOMA, size: 10 };
      c.fill = solidFill(GRAY_FILL);
      if (i < nRoles - 1) {
        c.border = { left: { style: "thin" } };
      }
    }

    // Row 3 (horizontal cyan bar, ht 18) - s=10, s=11, s=12
    ws.getRow(3).height = 18;
    const a3 = ws.getCell(3, 1);
    a3.font = { name: FONT_TAHOMA, size: 10, bold: true };
    a3.fill = solidFill(CYAN_FILL);

    const b3 = ws.getCell(3, 2);
    b3.font = { name: FONT_TAHOMA, size: 10 };
    b3.alignment = { horizontal: "center", vertical: "middle" };
    b3.fill = solidFill(CYAN_FILL);
    b3.border = DATA_CELL_BORDER;

    for (let i = 0; i < nRoles; i++) {
      const c = ws.getCell(3, 3 + i);
      c.font = { name: FONT_TAHOMA, size: 10 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.fill = solidFill(CYAN_FILL);
      if (i < nRoles - 1) {
        c.border = DATA_CELL_BORDER;
      }
    }

    // Rows 4..24: Unit Groups
    let r = 4;
    const writeUnitHeaderRow = (rowNum: number, label: string, regularLabel = false) => {
      ws.getRow(rowNum).height = rowNum <= 9 ? 13.5 : 12.75;
      const ca = ws.getCell(rowNum, 1);
      ca.value = label;
      ca.font = { name: FONT_TAHOMA, size: 10, bold: !regularLabel };

      const cb = ws.getCell(rowNum, 2);
      cb.font = { name: FONT_TAHOMA, size: 10, bold: rowNum >= 7 };
      cb.alignment = { horizontal: "center", vertical: "middle" };
      cb.fill = solidFill(CYAN_FILL);
      cb.border = DATA_CELL_BORDER;

      for (let i = 0; i < nRoles; i++) {
        const cc = ws.getCell(rowNum, 3 + i);
        cc.font = { name: FONT_TAHOMA, size: 10 };
        cc.alignment = { horizontal: "center", vertical: "middle" };
        cc.fill = solidFill(PINK_0_FILL);
        cc.border = DATA_CELL_BORDER;
      }
    };

    const writeRoleLevelRow = (rowNum: number, peranLabel: string, levels: number[]) => {
      ws.getRow(rowNum).height = rowNum <= 9 ? 13.5 : 12.75;
      const ca = ws.getCell(rowNum, 1);
      ca.value = peranLabel;
      ca.font = { name: FONT_TAHOMA, size: 10, bold: false };
      ca.alignment = { horizontal: "left" };

      const cb = ws.getCell(rowNum, 2);
      cb.font = { name: FONT_TAHOMA, size: 10, bold: rowNum >= 7 };
      cb.alignment = { horizontal: "center", vertical: "middle" };
      cb.fill = solidFill(CYAN_FILL);
      cb.border = DATA_CELL_BORDER;

      for (let i = 0; i < nRoles; i++) {
        const lv = Number(levels[i] ?? 0);
        const cc = ws.getCell(rowNum, 3 + i);
        cc.value = lv;
        cc.numFmt = "0";
        cc.font = { name: FONT_TAHOMA, size: 10 };
        cc.alignment = { horizontal: "center", vertical: "middle" };
        cc.border = DATA_CELL_BORDER;
        const f = levelColorFill(lv);
        if (f) cc.fill = f;
      }
    };

    roleGroups.forEach((g, idx) => {
      writeUnitHeaderRow(r, g.unit, false);
      r += 1;
      if (idx === activeUnitIndex) {
        activeKordinatorRow = r;
        activeTeamTeknisRow = r + 1;
      }
      writeRoleLevelRow(r, "Kordinator", g.kordinator);
      r += 1;
      writeRoleLevelRow(r, "Team Teknis", g.teamTeknis);
      r += 1;
    });

    // Row 25: SEKRETARIAT SMKI (s=7 on A25, s=17 on B25, s=14/15 on C25:Q25)
    writeUnitHeaderRow(r, "SEKRETARIAT SMKI", true);
    r += 1;

    // Row 26: Blank row with cyan B26 (s=18) and pink C26:Q26 (no border, covered by CF C7:Q26)
    ws.getRow(r).height = 12.75;
    const b26 = ws.getCell(r, 2);
    b26.font = { name: FONT_TAHOMA, size: 10, bold: true };
    b26.alignment = { horizontal: "center", vertical: "middle" };
    b26.fill = solidFill(CYAN_FILL);
    for (let i = 0; i < nRoles; i++) {
      const cc = ws.getCell(r, 3 + i);
      cc.font = { name: FONT_TAHOMA, size: 10 };
      cc.alignment = { horizontal: "center", vertical: "middle" };
      cc.fill = solidFill(PINK_0_FILL);
    }
    const lastMatrixRow = r;
    r += 1;

    addMatrixConditionalFormatting(ws, `C4:${colLetter(2 + nRoles)}${lastMatrixRow}`);

    // Rows 27..32: Definisi (ht 13.2)
    LEGEND.forEach((text, idx) => {
      ws.getRow(r).height = 13.2;
      const c = ws.getCell(r, 1);
      c.value = text;
      c.font = { name: FONT_TAHOMA, size: 10, bold: idx === 0 };
      c.alignment = { horizontal: "left" };
      r += 1;
    });
  }

  // Prepare Employee rows (if none in doc or all zero, use the exact 6 rows from FR-031 Matrix Competency.xlsx)
  const activeGroup = roleGroups[activeUnitIndex] ?? roleGroups[0];
  const rawEmps = doc.employees ?? [];
  const allEmpsZero =
    rawEmps.length > 0 &&
    rawEmps.every((e) => (e.levels ?? []).every((v) => Number(v) === 0));

  const empRows =
    rawEmps.length > 0 && !allEmpsZero
      ? rawEmps
      : DEFAULT_EMPLOYEE_LEVELS.map((row, idx) => ({
          nama: rawEmps[idx]?.nama ?? "",
          jabatan: rawEmps[idx]?.jabatan ?? "",
          peran: row.peran,
          levels: [...row.levels],
        }));

  const unitHeaderLabel = (doc.nama_unit_kerja || "").trim() || "SMKI Bidang.....";

  // ============================================================================
  // 2. SHEET: Employee  Matrix (2 spaces)
  // ============================================================================
  {
    const ws = wb.addWorksheet("Employee  Matrix", {
      pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Exact column widths from sheet2.xml
    ws.getColumn(1).width = 37.44;
    ws.getColumn(2).width = 13.33;
    ws.getColumn(3).width = 4.44;
    const empColWidths = [
      3.11, 3.11, 4.44, 4.44, 3.11, 4.44, 4.44, 4.44, 4.44, 4.44, 4.44, 4.44,
      4.44, 4.44, 4.44, 3.11,
    ];
    for (let i = 0; i < nEmp; i++) {
      ws.getColumn(4 + i).width = empColWidths[i] ?? 4.44;
    }

    // Row 1 (ht 150.75) - s=23 on A1, s=24 on B1 (NO border!), s=2 on C1, s=3 on D1:S1
    ws.getRow(1).height = 150.75;
    const a1 = ws.getCell(1, 1);
    a1.value = "Employee Names";
    a1.font = { name: FONT_ARIAL, size: 12, bold: true };
    a1.alignment = { horizontal: "left", wrapText: true };
    a1.border = BOX_MEDIUM_BORDER;

    const b1 = ws.getCell(1, 2);
    b1.font = { name: FONT_ARIAL, size: 12, bold: true };
    b1.alignment = { horizontal: "left", wrapText: true };

    const c1 = ws.getCell(1, 3);
    c1.value = "Kemampuan yang dimiliki";
    c1.font = { name: FONT_TAHOMA, size: 10, bold: true };
    c1.alignment = { horizontal: "left", textRotation: 90 };
    c1.fill = solidFill(CYAN_FILL);

    for (let i = 0; i < nEmp; i++) {
      const c = ws.getCell(1, 4 + i);
      c.value = resolveCompHeader(comps[i]);
      c.font = { name: FONT_TAHOMA, size: 10, bold: false };
      c.alignment = { horizontal: "left", textRotation: 90 };
    }

    // Row 2 (hidden gray bar, ht 3.75) - s=27 on C2:R2
    const row2 = ws.getRow(2);
    row2.height = 3.75;
    row2.hidden = true;
    const c2 = ws.getCell(2, 3);
    c2.value = 7;
    c2.font = { name: FONT_TAHOMA, size: 9 };
    c2.fill = solidFill(GRAY_FILL);
    c2.border = { left: { style: "thin" } };

    for (let i = 0; i < nEmp; i++) {
      const c = ws.getCell(2, 4 + i);
      if (i === 0) c.value = 8;
      if (i < nEmp - 1) {
        c.font = { name: FONT_TAHOMA, size: 9 };
        c.fill = solidFill(GRAY_FILL);
        c.border = { left: { style: "thin" } };
      }
    }

    // Row 3 (horizontal cyan bar, ht 18) - s=28 on A3:B3 (Arial 14 bold), s=29 on C3:S3
    ws.getRow(3).height = 18;
    const a3 = ws.getCell(3, 1);
    a3.font = { name: FONT_ARIAL, size: 14, bold: true };
    a3.fill = solidFill(CYAN_FILL);

    const b3 = ws.getCell(3, 2);
    b3.value = "Tingkatan";
    b3.font = { name: FONT_ARIAL, size: 14, bold: true };
    b3.fill = solidFill(CYAN_FILL);

    const c3 = ws.getCell(3, 3);
    c3.font = { name: FONT_ARIAL, size: 10 };
    c3.alignment = { horizontal: "center", vertical: "middle" };
    c3.fill = solidFill(CYAN_FILL);
    c3.border = DATA_CELL_BORDER;

    for (let i = 0; i < nEmp; i++) {
      const c = ws.getCell(3, 4 + i);
      c.font = { name: FONT_ARIAL, size: 10 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.fill = solidFill(CYAN_FILL);
      c.border = DATA_CELL_BORDER;
    }

    // Row 4 (Unit header row, ht 13.5) - s=30 on A4, s=31 on B4, s=29 on C4, s=32 on D4:S4
    ws.getRow(4).height = 13.5;
    const a4 = ws.getCell(4, 1);
    a4.value = unitHeaderLabel;
    a4.font = { name: FONT_ARIAL, size: 11, bold: true };
    ws.getCell(4, 2).font = { name: FONT_ARIAL, size: 11 };

    const c4 = ws.getCell(4, 3);
    c4.font = { name: FONT_ARIAL, size: 10 };
    c4.alignment = { horizontal: "center", vertical: "middle" };
    c4.fill = solidFill(CYAN_FILL);
    c4.border = DATA_CELL_BORDER;

    for (let i = 0; i < nEmp; i++) {
      const c = ws.getCell(4, 4 + i);
      c.font = { name: FONT_ARIAL, size: 10 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.fill = solidFill(PINK_0_FILL);
      c.border = DATA_CELL_BORDER;
    }

    // Rows 5..: Employee rows (ht 13.5)
    let r = 5;
    empRows.forEach((e, empIdx) => {
      ws.getRow(r).height = 13.5;
      const ca = ws.getCell(r, 1);
      if (e.nama) ca.value = e.nama;
      ca.font = { name: FONT_ARIAL, size: 11 };
      ca.alignment = { horizontal: "left" };

      const cb = ws.getCell(r, 2);
      cb.value = e.peran;
      cb.font = { name: FONT_ARIAL, size: 11 };
      cb.alignment = { horizontal: "left" };

      const cc = ws.getCell(r, 3);
      cc.font = { name: FONT_ARIAL, size: 10, bold: empIdx >= 1 };
      cc.alignment = { horizontal: "center", vertical: "middle" };
      cc.fill = solidFill(CYAN_FILL);
      cc.border = DATA_CELL_BORDER;

      for (let i = 0; i < nEmp; i++) {
        const fallbackLv =
          e.peran === "Kordinator"
            ? (activeGroup?.kordinator[i] ?? 3)
            : (activeGroup?.teamTeknis[i] ?? 3);
        const lv = Number(e.levels[i] ?? fallbackLv);
        const cd = ws.getCell(r, 4 + i);
        cd.value = lv;
        cd.numFmt = "0";
        cd.font = { name: FONT_ARIAL, size: 10 };
        cd.alignment = { horizontal: "center", vertical: "middle" };
        cd.border = DATA_CELL_BORDER;
        const f = levelColorFill(lv);
        if (f) cd.fill = f;
      }
      r += 1;
    });

    // 1 trailing blank bordered row (Row 11 in original)
    ws.getRow(r).height = 13.5;
    ws.getCell(r, 1).font = { name: FONT_ARIAL, size: 11 };
    ws.getCell(r, 2).font = { name: FONT_ARIAL, size: 11 };
    const ccBlank = ws.getCell(r, 3);
    ccBlank.font = { name: FONT_ARIAL, size: 10, bold: true };
    ccBlank.alignment = { horizontal: "center", vertical: "middle" };
    ccBlank.fill = solidFill(CYAN_FILL);
    ccBlank.border = DATA_CELL_BORDER;
    for (let i = 0; i < nEmp; i++) {
      const cd = ws.getCell(r, 4 + i);
      cd.font = { name: FONT_ARIAL, size: 10 };
      cd.alignment = { horizontal: "center", vertical: "middle" };
      cd.fill = solidFill(PINK_0_FILL);
      cd.border = DATA_CELL_BORDER;
    }
    const lastEmpGridRow = r;
    r += 1;

    addMatrixConditionalFormatting(ws, `D4:${colLetter(3 + nEmp)}${lastEmpGridRow}`);

    // Row 12: 1 blank row (ht 12)
    ws.getRow(r).height = 12;
    r += 1;

    // Rows 13..18: Definisi block (s=35 on Definisi, s=39 on 0..4 with wrapText=true, ht 26.4 on last 2)
    LEGEND.forEach((text, idx) => {
      ws.getRow(r).height = idx === 0 ? 12.75 : idx >= 4 ? 26.4 : 15;
      const c = ws.getCell(r, 1);
      c.value = text;
      c.font = { name: FONT_TAHOMA, size: 10, bold: idx === 0 };
      c.alignment = { horizontal: "left", wrapText: true };
      r += 1;
    });
  }

  // ============================================================================
  // 3. SHEET: Gap Analisis
  // ============================================================================
  {
    const ws = wb.addWorksheet("Gap Analisis", {
      pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // Exact column widths from sheet3.xml
    ws.getColumn(1).width = 37.44;
    ws.getColumn(2).width = 13.33;
    ws.getColumn(3).width = 4.44;
    const gapColWidths = [
      11.11, 10.11, 4.44, 4.44, 3.11, 4.44, 4.44, 4.44, 4.44, 4.44, 4.44, 4.44,
      4.44, 4.44, 3.11,
    ];
    for (let i = 0; i < nGap; i++) {
      ws.getColumn(4 + i).width = gapColWidths[i] ?? 4.44;
    }

    // Row 1 (ht 100.2) - s=23 on A1, s=24 on B1 (NO border!), s=2 on C1, s=3 on D1:R1 (NO border, wrapText=false!)
    ws.getRow(1).height = 100.2;
    const a1 = ws.getCell(1, 1);
    a1.value = "Employee Names";
    a1.font = { name: FONT_ARIAL, size: 12, bold: true };
    a1.alignment = { horizontal: "left", wrapText: true };
    a1.border = BOX_MEDIUM_BORDER;

    const b1 = ws.getCell(1, 2);
    b1.font = { name: FONT_ARIAL, size: 12, bold: true };
    b1.alignment = { horizontal: "left", wrapText: true };

    const c1 = ws.getCell(1, 3);
    c1.value = "Kemampuan yang dimiliki";
    c1.font = { name: FONT_TAHOMA, size: 10, bold: true };
    c1.alignment = { horizontal: "left", textRotation: 90 };
    c1.fill = solidFill(CYAN_FILL);

    for (let i = 0; i < nGap; i++) {
      const c = ws.getCell(1, 4 + i);
      c.value = resolveCompHeader(comps[i]);
      c.font = { name: FONT_TAHOMA, size: 10, bold: false };
      c.alignment = { horizontal: "left", textRotation: 90 };
    }

    // Row 2 (hidden gray bar, ht 3.75) - s=27 on C2:Q2
    const row2 = ws.getRow(2);
    row2.height = 3.75;
    row2.hidden = true;
    const c2 = ws.getCell(2, 3);
    c2.value = 7;
    c2.font = { name: FONT_TAHOMA, size: 9 };
    c2.fill = solidFill(GRAY_FILL);
    c2.border = { left: { style: "thin" } };

    for (let i = 0; i < nGap; i++) {
      const c = ws.getCell(2, 4 + i);
      if (i === 0) c.value = 8;
      if (i < nGap - 1) {
        c.font = { name: FONT_TAHOMA, size: 9 };
        c.fill = solidFill(GRAY_FILL);
        c.border = { left: { style: "thin" } };
      }
    }

    // Row 3 (ht 18) - In sheet3.xml: A3:B3 is s=28 (cyan, Arial 14 bold), C3 is s=29 (cyan), D3:Q3 is s=32 (NO fill, bordered!)
    ws.getRow(3).height = 18;
    const a3 = ws.getCell(3, 1);
    a3.font = { name: FONT_ARIAL, size: 14, bold: true };
    a3.fill = solidFill(CYAN_FILL);

    const b3 = ws.getCell(3, 2);
    b3.value = "Tingkatan";
    b3.font = { name: FONT_ARIAL, size: 14, bold: true };
    b3.fill = solidFill(CYAN_FILL);

    const c3 = ws.getCell(3, 3);
    c3.font = { name: FONT_ARIAL, size: 10 };
    c3.alignment = { horizontal: "center", vertical: "middle" };
    c3.fill = solidFill(CYAN_FILL);
    c3.border = DATA_CELL_BORDER;

    for (let i = 0; i < nGap; i++) {
      const c = ws.getCell(3, 4 + i);
      c.font = { name: FONT_ARIAL, size: 10 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      if (i < nGap - 1) {
        c.border = DATA_CELL_BORDER;
      }
    }

    // Row 4 (Unit header row, ht 13.5) - s=30 on A4, s=31 on B4, s=29 on C4, s=32 on D4:R4
    ws.getRow(4).height = 13.5;
    const a4 = ws.getCell(4, 1);
    a4.value = unitHeaderLabel;
    a4.font = { name: FONT_ARIAL, size: 11, bold: true };
    ws.getCell(4, 2).font = { name: FONT_ARIAL, size: 11 };

    const c4 = ws.getCell(4, 3);
    c4.font = { name: FONT_ARIAL, size: 10 };
    c4.alignment = { horizontal: "center", vertical: "middle" };
    c4.fill = solidFill(CYAN_FILL);
    c4.border = DATA_CELL_BORDER;

    for (let i = 0; i < nGap; i++) {
      const c = ws.getCell(4, 4 + i);
      c.font = { name: FONT_ARIAL, size: 10 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.fill = solidFill(PINK_0_FILL);
      c.border = DATA_CELL_BORDER;
    }

    // Rows 5..: Employee Gap rows with live Excel formulas (ht 13.5)
    let r = 5;
    empRows.forEach((e, empIdx) => {
      ws.getRow(r).height = 13.5;
      const ca = ws.getCell(r, 1);
      if (e.nama) ca.value = e.nama;
      ca.font = { name: FONT_ARIAL, size: 11 };
      ca.alignment = { horizontal: "left" };

      const cb = ws.getCell(r, 2);
      cb.value = e.peran;
      cb.font = { name: FONT_ARIAL, size: 11 };
      cb.alignment = { horizontal: "left" };

      const cc = ws.getCell(r, 3);
      cc.font = { name: FONT_ARIAL, size: 10, bold: empIdx >= 1 };
      cc.alignment = { horizontal: "center", vertical: "middle" };
      cc.fill = solidFill(CYAN_FILL);
      cc.border = DATA_CELL_BORDER;

      const isKord = e.peran === "Kordinator";
      const stdArr = isKord ? activeGroup.kordinator : activeGroup.teamTeknis;
      const roleSheetRow = isKord ? activeKordinatorRow : activeTeamTeknisRow;

      for (let i = 0; i < nGap; i++) {
        const empColLet = colLetter(4 + i);
        const roleColLet = colLetter(3 + i);
        const roleCellRef = isKord
          ? `${roleColLet}${roleSheetRow}`
          : `$${roleColLet}$${roleSheetRow}`;

        const empVal = Number(e.levels[i] ?? stdArr[i] ?? 0);
        const stdVal = Number(stdArr[i] ?? 0);
        const gapResult = empVal - stdVal;

        const cd = ws.getCell(r, 4 + i);
        cd.value = {
          formula: `'Employee  Matrix'!${empColLet}${r}-'Roles Matrix (2)'!${roleCellRef}`,
          result: gapResult,
        };
        cd.numFmt = "0";
        cd.font = { name: FONT_ARIAL, size: 10 };
        cd.alignment = { horizontal: "center", vertical: "middle" };
        cd.border = DATA_CELL_BORDER;
        const f = levelColorFill(gapResult);
        if (f) cd.fill = f;
      }
      r += 1;
    });

    // Row 11: 1 blank bordered row (matching sheet3.xml Row 11)
    ws.getRow(r).height = 13.5;
    ws.getCell(r, 1).font = { name: FONT_ARIAL, size: 11 };
    ws.getCell(r, 2).font = { name: FONT_ARIAL, size: 11 };
    const ccBlank = ws.getCell(r, 3);
    ccBlank.font = { name: FONT_ARIAL, size: 10, bold: true };
    ccBlank.alignment = { horizontal: "center", vertical: "middle" };
    ccBlank.fill = solidFill(CYAN_FILL);
    ccBlank.border = DATA_CELL_BORDER;
    for (let i = 0; i < nGap; i++) {
      const cd = ws.getCell(r, 4 + i);
      cd.font = { name: FONT_ARIAL, size: 10 };
      cd.alignment = { horizontal: "center", vertical: "middle" };
      cd.fill = solidFill(PINK_0_FILL);
      cd.border = DATA_CELL_BORDER;
    }
    const lastGapGridRow = r;
    r += 1;

    addMatrixConditionalFormatting(ws, `D4:${colLetter(3 + nGap)}${lastGapGridRow}`);

    // Rows 12..17: Definisi block immediately at Row 12 (matching sheet3.xml lines 136..141!)
    LEGEND.forEach((text, idx) => {
      ws.getRow(r).height = idx === 0 ? 17.4 : idx >= 4 ? 26.4 : 15;
      const c = ws.getCell(r, 1);
      c.value = text;
      c.font = { name: FONT_TAHOMA, size: 10, bold: idx === 0 };
      c.alignment = { horizontal: "left", wrapText: true };
      r += 1;
    });
  }

  // ============================================================================
  // 4. SHEET: Rencana Training
  // ============================================================================
  {
    const ws = wb.addWorksheet("Rencana Training", {
      pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    const widths = [4.66, 3.44, 30.66, 44.11, 24.78, 10.66];
    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });

    // Row 1 (ht 28.5): Merged B1:E1 = "RENCANA TRAINING" (s=50: Tahoma 18 bold, center/middle)
    ws.getRow(1).height = 28.5;
    ws.mergeCells("B1:E1");
    const b1 = ws.getCell(1, 2);
    b1.value = "RENCANA TRAINING";
    b1.font = { name: FONT_TAHOMA, size: 18, bold: true };
    b1.alignment = { horizontal: "center", vertical: "middle" };

    // Row 2 (ht 15): B2 = "Nama Unit Kerja : ..." (s=42: Tahoma 10 regular, left)
    ws.getRow(2).height = 15;
    const b2 = ws.getCell(2, 2);
    b2.value = doc.nama_unit_kerja
      ? `Nama Unit Kerja : ${doc.nama_unit_kerja}`
      : "Nama Unit Kerja : ";
    b2.font = { name: FONT_TAHOMA, size: 10, bold: false };
    b2.alignment = { horizontal: "left" };

    // Row 3 (ht 12.75): Blank
    ws.getRow(3).height = 12.75;

    // Row 4 (ht 12.75): Table Header (B4:E4) with #00B0F0 fill (s=44..46: Tahoma 11/10 regular, center/middle)
    ws.getRow(4).height = 12.75;
    const headers = ["No", "Nama", "Jabatan ", "Usulan Training"];
    headers.forEach((h, idx) => {
      const c = ws.getCell(4, 2 + idx);
      c.value = h;
      c.font = { name: FONT_TAHOMA, size: idx === 0 ? 11 : 10, bold: false };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.fill = solidFill(BLUE_HEADER_FILL);
      c.border = BOX_THIN_BORDER;
    });

    const trainingRows = doc.trainings?.length
      ? doc.trainings
      : (doc.employees ?? [])
          .filter((e) => (e.gap ?? []).some((g) => (g ?? 0) < 0) || !!e.usulan_training)
          .map((e) => ({
            nama: e.nama,
            jabatan: e.jabatan,
            usulan_training: e.usulan_training || "",
          }));

    const totalTrainingRows = Math.max(26, trainingRows.length);
    for (let i = 0; i < totalTrainingRows; i++) {
      const r = 5 + i;
      ws.getRow(r).height = 12.75;
      const t = trainingRows[i];

      const cNo = ws.getCell(r, 2);
      cNo.value = i + 1;
      cNo.font = { name: FONT_TAHOMA, size: 10 };
      cNo.alignment = { horizontal: "center" };
      cNo.border = BOX_THIN_BORDER;

      const cNama = ws.getCell(r, 3);
      if (t?.nama) cNama.value = t.nama;
      cNama.font = { name: FONT_ARIAL, size: 11 };
      cNama.alignment = { horizontal: "left" };
      cNama.border = BOX_THIN_BORDER;

      const cJab = ws.getCell(r, 4);
      if (t?.jabatan) cJab.value = t.jabatan;
      cJab.font = { name: FONT_TAHOMA, size: 10 };
      cJab.border = BOX_THIN_BORDER;

      const cUsulan = ws.getCell(r, 5);
      if (t?.usulan_training) cUsulan.value = t.usulan_training;
      cUsulan.font = { name: FONT_TAHOMA, size: 10 };
      cUsulan.border = BOX_THIN_BORDER;
    }

    // 2 extra blank bordered rows below row 26 (Row 31 & Row 32 in sheet4.xml)
    for (let extra = 0; extra < 2; extra++) {
      const r = 5 + totalTrainingRows + extra;
      ws.getRow(r).height = 12.75;
      for (let col = 2; col <= 5; col++) {
        const c = ws.getCell(r, col);
        c.font = { name: FONT_TAHOMA, size: 10 };
        if (col === 2) c.alignment = { horizontal: "center" };
        c.border = BOX_THIN_BORDER;
      }
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const suffix = (doc.nama_unit_kerja || "").trim();
  a.download = suffix
    ? `FR-031 Matrix Competency - ${suffix.replace(/[\\/:*?"<>|]/g, "_")}.xlsx`
    : "FR-031 Matrix Competency.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
