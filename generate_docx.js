const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  TableOfContents, HeadingLevel, AlignmentType, BorderStyle,
  convertMillimetersToTwip,
  WidthType, SimpleField,
  Header, Footer,
  ShadingType, VerticalAlign,
} = require('docx');
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { dirname } = require('path');

// ==================== 常量定义 ====================

// 页边距（mm）
const MG = { top: 25.4, bottom: 25.4, left: 31.7, right: 31.7 };

// 字号（docx 使用半点 unit: 12pt = 24）
const SZ = {
  coverOrg:    72,   // 36pt 小初
  coverTitle:  84,   // 42pt 初号
  coverInfo:   32,   // 16pt 三号
  h1:          44,   // 22pt 二号
  h2:          32,   // 16pt 三号
  h3:          30,   // 15pt 小三
  body:        24,   // 12pt 小四
  table:       21,   // 10.5pt 五号
  code:        20,   // 10pt
  blockquote:  22,   // 11pt
  header:      20,   // 10pt
};

// 字体配置
const F = {
  body:       { ascii: 'SimSun',    eastAsia: '宋体' },
  h1:         { ascii: 'SimHei',    eastAsia: '黑体' },
  h2:         { ascii: 'SimHei',    eastAsia: '黑体' },
  h3:         { ascii: 'KaiTi',     eastAsia: '楷体' },
  coverOrg:   { ascii: 'SimHei',    eastAsia: '黑体' },
  coverTitle: { ascii: 'SimHei',    eastAsia: '黑体' },
  coverInfo:  { ascii: 'KaiTi',     eastAsia: '楷体' },
  code:       { ascii: 'Courier New', eastAsia: '仿宋_GB2312' },
  mono:       { ascii: 'Courier New', eastAsia: '仿宋_GB2312' },
};

// 表格边框
const TB_ORDER = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideVertical:   { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

const HEADER_BG = { type: ShadingType.CLEAR, fill: 'D9E2F3', color: 'FFFFFF' };
const CODE_BG   = { type: ShadingType.CLEAR, fill: 'F2F2F2', color: '000000' };

// ==================== 辅助函数 ====================

/** 创建 TextRun，font 可为对象 {ascii, eastAsia} */
function tr(text, o = {}) {
  return new TextRun({
    text,
    size: o.sz || SZ.body,
    font: o.font || F.body,
    bold: !!o.bold,
    italics: !!o.italics,
    color: o.color || '000000',
  });
}

/** 解析 **bold** 内联格式 */
function runs(text, o = {}) {
  const out = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(tr(text.slice(last, m.index), o));
    out.push(tr(m[1], { ...o, bold: true }));
    last = re.lastIndex;
  }
  if (last < text.length) out.push(tr(text.slice(last), o));
  return out.length ? out : [tr(text, o)];
}

/** 创建 Paragraph */
function para(children, o = {}) {
  return new Paragraph({
    children,
    alignment: o.align || AlignmentType.LEFT,
    heading: o.heading,
    spacing: o.spacing || { before: 60, after: 60, line: 360 },
    border: o.border,
    shading: o.shading,
    indent: o.indent,
    keepNext: !!o.keepNext,
    pageBreakBefore: !!o.pageBreakBefore,
  });
}

function emptyPara(sp = {}) {
  const { pageBreakBefore, ...spacing } = sp;
  return new Paragraph({ children: [tr('')], spacing, pageBreakBefore: !!pageBreakBefore });
}

// ==================== MD 解析 ====================

const isRow      = l => l.trim().startsWith('|') && l.trim().endsWith('|');
const isSep      = l => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(l);
const isAscii    = l => /[┌└├┤┬┴┼─│┏┗┣┫┳┻╋━┃]/.test(l);
const rowCells   = l => { let s = l.trim(); if (s[0]==='|') s=s.slice(1); if (s[s.length-1]==='|') s=s.slice(0,-1); return s.split('|').map(c=>c.trim()); };

function parseMD(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // 分隔线
    if (/^-{3,}\s*$/.test(t)) { out.push(emptyPara({before:120,after:120})); i++; continue; }

    // 空行
    if (!t) { out.push(emptyPara()); i++; continue; }

    // ### H3
    if (line.startsWith('### ')) {
      out.push(para(
        [tr(line.slice(4).replace(/\*\*/g,'').trim(), {sz:SZ.h3, font:F.h3, bold:true})],
        {heading:HeadingLevel.HEADING_3, spacing:{before:200,after:100}, keepNext:true}
      )); i++; continue;
    }

    // ## H2
    if (line.startsWith('## ')) {
      out.push(para(
        [tr(line.slice(3).replace(/\*\*/g,'').trim(), {sz:SZ.h2, font:F.h2, bold:true})],
        {heading:HeadingLevel.HEADING_2, spacing:{before:240,after:120}, keepNext:true}
      )); i++; continue;
    }

    // # H1
    if (line.startsWith('# ')) {
      out.push(para(
        [tr(line.slice(2).replace(/\*\*/g,'').trim(), {sz:SZ.h1, font:F.h1, bold:true})],
        {heading:HeadingLevel.HEADING_1, align:AlignmentType.CENTER, spacing:{before:480,after:240}}
      )); i++; continue;
    }

    // 引用
    if (t.startsWith('>')) {
      const block = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const lb = lines[i].trim().replace(/^>\s?/,'');
        if (lb) block.push(lb);
        i++;
      }
      block.forEach(b => {
        out.push(para(runs(b.replace(/\*\*/g,''), {sz:SZ.blockquote, font:{ascii:'KaiTi',eastAsia:'楷体'}, color:'666666', italics:true}), {indent:{left:360}, spacing:{before:40,after:40,line:300}}));
      });
      continue;
    }

    // 表格
    if (isRow(line)) {
      const rows = [];
      while (i < lines.length && (isRow(lines[i]) || isSep(lines[i]))) {
        if (isSep(lines[i])) { i++; continue; }
        const cells = rowCells(lines[i]);
        const isHdr = rows.length === 0;
        rows.push(new TableRow({
          children: cells.map(c => new TableCell({
            children: [para(runs(c.replace(/\*\*/g,'').trim(), {sz:SZ.table}), {align: isHdr ? AlignmentType.CENTER : AlignmentType.LEFT, spacing:{before:40,after:40,line:300}})],
            shading: isHdr ? HEADER_BG : undefined,
            verticalAlign: VerticalAlign.CENTER,
          })),
          tableHeader: isHdr,
        }));
        i++;
      }
      out.push(new Table({
        rows,
        width: {size:8000, type:WidthType.DXA},
        borders: TB_ORDER,
      }));
      continue;
    }

    // 代码块
    if (t.startsWith('```')) {
      i++;
      const code = [];
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      const isAsc = code.some(isAscii);
      const ft = isAsc ? F.code : F.mono;
      code.forEach(c => {
        if (!c.trim()) { out.push(emptyPara()); }
        else {
          out.push(para([tr(c, {sz:SZ.code, font:ft})], {shading:CODE_BG, indent:{left:240}, spacing:{before:60,after:60,line:280}}));
        }
      });
      continue;
    }

    // 列表
    if (/^[-*]\s+/.test(t)) {
      let done = false;
      while (!done && i < lines.length) {
        const ml = lines[i].trim().match(/^[-*]\s+(.+)/);
        if (!ml) { done = true; continue; }
        out.push(para([tr('\u2022  ', {sz:SZ.body, font:F.body}), ...runs(ml[1].replace(/\*\*/g,'').trim(), {sz:SZ.body, font:F.body})], {indent:{left:420,hanging:360}, spacing:{before:20,after:20,line:360}}));
        i++;
      }
      continue;
    }

    // 普通段落
    if (t) {
      out.push(para(runs(t, {sz:SZ.body, font:F.body}), {spacing:{before:60,after:60,line:360}}));
    }
    i++;
  }
  return out;
}

// ==================== 主生成 ====================

async function main() {
  const INPUT  = 'E:/code/my-ai-workspace/myk/技术文章/2026-04-12规划院数字化转型三年实施路径.md';
  const OUTPUT = 'E:/code/my-ai-workspace/exports/邯郸市规划设计院数智化转型三年行动计划（2026-2028）.docx';

  const outDir = dirname(OUTPUT);
  if (!existsSync(outDir)) mkdirSync(outDir, {recursive:true});

  const content = readFileSync(INPUT, 'utf-8');
  const lines = content.split('\n');

  // 提取元数据
  let author = '规划院数字化转型工作组';
  let docDate = '2026年04月12日';
  let version = 'V3.0';
  const org = '邯郸市规划设计院';
  let title = '数智化转型三年行动计划（2026-2028）';

  for (const l of lines) {
    if (l.startsWith('# ') && !l.startsWith('## ')) { title = l.slice(2).replace(/\*\*/g,'').trim(); }
  }

  // 从末尾提取
  for (let idx = lines.length-1; idx >= 0 && idx >= lines.length-15; idx--) {
    const l = lines[idx];
    if (l.includes('编制单位')) { const m=l.match(/编制单位[：:]\s*(.+)/); if (m) author=m[1].replace(/\*\*/g,'').trim().replace(/\s*$/,''); }
    if (l.includes('编制时间')) { const m=l.match(/(\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日)/); if (m) docDate=m[1].replace(/\s+/g,''); }
    if (l.includes('版本'))     { const m=l.match(/(V\d+\.\d+)/); if (m) version=m[1]; }
  }

  console.log('元数据:', {title, org, author, docDate, version});

  // 封面
  const cover = [
    emptyPara({before:3200}),
    para([tr(org, {sz:SZ.coverOrg, font:F.coverOrg, bold:true})], {align:AlignmentType.CENTER, spacing:{before:0,after:0}}),
    emptyPara({before:800}),
    para([tr(title, {sz:SZ.coverTitle, font:F.coverTitle, bold:true})], {align:AlignmentType.CENTER, spacing:{before:0,after:0}}),
    emptyPara({before:900}),
    para([tr('━'.repeat(16), {sz:16, font:{ascii:'SimHei',eastAsia:'黑体'}, color:'888888'})], {align:AlignmentType.CENTER, spacing:{before:0,after:0}}),
    emptyPara({before:600}),
    para([tr(`编制单位：${author}`, {sz:SZ.coverInfo, font:F.coverInfo, bold:true})], {align:AlignmentType.CENTER, spacing:{before:120,after:120}}),
    para([tr(`编制时间：${docDate}`, {sz:SZ.coverInfo, font:F.coverInfo, bold:true})], {align:AlignmentType.CENTER, spacing:{before:120,after:120}}),
    para([tr(`版本号：${version}`, {sz:SZ.coverInfo, font:F.coverInfo, bold:true})], {align:AlignmentType.CENTER, spacing:{before:120,after:120}}),
    emptyPara({before:300}),
    emptyPara({before:0, pageBreakBefore:true}),
  ];

  // 目录
  const toc = [
    para([tr('目录', {sz:SZ.h1, font:F.h1, bold:true})], {align:AlignmentType.CENTER, spacing:{before:200,after:400}}),
    new TableOfContents('目录', {hyperlink:true, headingStyleRange:'1-3'}),
    emptyPara({before:0, pageBreakBefore:true}),
  ];

  // 正文
  const body = parseMD(lines);

  // 创建文档
  const doc = new Document({
    creator: author,
    title: `${org}——${title}`,
    sections: [{
      properties: {
        page: {
          size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
          margin: {
            top: convertMillimetersToTwip(MG.top),
            bottom: convertMillimetersToTwip(MG.bottom),
            left: convertMillimetersToTwip(MG.left),
            right: convertMillimetersToTwip(MG.right),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            para(
              [tr(`${org} · 数智化转型三年行动计划`, {sz:SZ.header, font:F.body, color:'666666'})],
              {
                align: AlignmentType.CENTER,
                spacing: {before:0, after:0},
                border: {bottom: {style:BorderStyle.SINGLE, size:6, color:'CCCCCC'}},
              }
            ),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            para([
              tr('—  ', {sz:SZ.header, font:F.body, color:'999999'}),
              new SimpleField('PAGE'),
              tr('  —', {sz:SZ.header, font:F.body, color:'999999'}),
            ], {align:AlignmentType.CENTER, spacing:{before:0,after:0}}),
          ],
        }),
      },
      children: [...cover, ...toc, ...body],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(OUTPUT, buffer);

  console.log(`\n✅ 文档生成成功`);
  console.log(`   路径: ${OUTPUT}`);
  console.log(`   大小: ${(buffer.length/1024).toFixed(1)} KB`);
  console.log(`   正文段落数: ${body.length}`);
}

main().catch(e => { console.error('❌', e.message); console.error(e.stack); process.exit(1); });
