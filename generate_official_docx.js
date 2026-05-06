const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, convertMillimetersToTwip,
  WidthType, Header, Footer, SimpleField, PageNumber,
  NumberFormat, LevelFormat, ShadingType, VerticalAlign,
} = require('docx');
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { dirname } = require('path');

// ==================== 公文格式常量（GB/T 9704-2012） ====================

// 页边距（mm）- 公文标准
const MG = { top: 37, bottom: 35, left: 28, right: 26 };

// 字号（半点单位：12pt = 24）
const SZ = {
  title:  44,   // 二号
  body:   32,   // 三号
  h1:     32,   // 三号（黑体）
  h2:     32,   // 三号（楷体）
  h3:     32,   // 三号（仿宋加粗）
  table:  28,   // 小三号
  small:  24,   // 四号
};

// 字体配置
const F = {
  title: { ascii: 'SimSun',    eastAsia: '小标宋体' },  // 若无小标宋体则回退宋体
  body:  { ascii: 'FangSong',  eastAsia: '仿宋_GB2312' },
  h1:    { ascii: 'SimHei',    eastAsia: '黑体' },
  h2:    { ascii: 'KaiTi',     eastAsia: '楷体_GB2312' },
  h3:    { ascii: 'FangSong',  eastAsia: '仿宋_GB2312' },
};

// 表格边框
const TB = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  insideVertical:   { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

// 行距：28磅固定值（~560 twip）
const LINE_28PT = { line: 560, after: 0, before: 0 };

// ==================== 辅助函数 ====================

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

function para(children, o = {}) {
  return new Paragraph({
    children,
    alignment: o.align || AlignmentType.LEFT,
    heading: o.heading,
    spacing: o.spacing || { ...LINE_28PT },
    indent: o.indent,
    border: o.border,
    shading: o.shading,
    keepNext: !!o.keepNext,
    pageBreakBefore: !!o.pageBreakBefore,
  });
}

function emptyPara(sp = {}) {
  return new Paragraph({ children: [tr('')], spacing: sp });
}

// ==================== MD 解析 ====================

const isRow    = l => l.trim().startsWith('|') && l.trim().endsWith('|');
const isSep    = l => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(l);
const isAscii  = l => /[┌└├┤┬┴┼─│┏┗┣┫┳┻╋━┃]/.test(l);
const rowCells = l => { let s = l.trim(); if (s[0]==='|') s=s.slice(1); if (s[s.length-1]==='|') s=s.slice(0,-1); return s.split('|').map(c=>c.trim()); };

function parseMD(lines) {
  const out = [];
  let i = 0;
  let listCounter = 0;
  let inList = false;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    // YAML frontmatter 跳过
    if (t === '---') {
      if (out.length === 0) {
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('---')) i++;
        i++; // 跳过后面的 ---
      } else {
        out.push(emptyPara({ before: 200, after: 200 }));
        i++;
      }
      continue;
    }

    // 空行
    if (!t) { inList = false; listCounter = 0; out.push(emptyPara()); i++; continue; }

    // ### H3 → 三级标题（仿宋加粗）
    if (line.startsWith('### ')) {
      inList = false; listCounter = 0;
      out.push(para(
        [tr(line.slice(4).replace(/\*\*/g,'').trim(), {sz:SZ.h3, font:F.h3, bold:true})],
        {spacing:{...LINE_28PT}, indent:{left:240}, keepNext:true}
      )); i++; continue;
    }

    // ## H2 → 二级标题（楷体）
    if (line.startsWith('## ')) {
      inList = false; listCounter = 0;
      const title = line.slice(3).replace(/\*\*/g,'').trim();
      // 跳过目录标题本身
      if (title === '目录') { i++; continue; }
      out.push(para(
        [tr(title, {sz:SZ.h2, font:F.h2})],
        {spacing:{before:400, after:200}, indent:{left:240}, keepNext:true}
      )); i++; continue;
    }

    // # H1 → 主标题（小标宋二号居中）
    if (line.startsWith('# ')) {
      inList = false; listCounter = 0;
      out.push(para(
        [tr(line.slice(2).replace(/\*\*/g,'').trim(), {sz:SZ.title, font:F.title, bold:true})],
        {align:AlignmentType.CENTER, spacing:{before:0, after:200}}
      )); i++; continue;
    }

    // 引用 → 楷体
    if (t.startsWith('>')) {
      inList = false; listCounter = 0;
      const block = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const lb = lines[i].trim().replace(/^>\s?/,'');
        if (lb) block.push(lb);
        i++;
      }
      block.forEach(b => {
        out.push(para(
          runs(b, {sz:SZ.small, font:F.h2, color:'666666'}),
          {indent:{left:480}, spacing:{...LINE_28PT}}
        ));
      });
      continue;
    }

    // 表格
    if (isRow(line)) {
      inList = false; listCounter = 0;
      const rows = [];
      while (i < lines.length && (isRow(lines[i]) || isSep(lines[i]))) {
        if (isSep(lines[i])) { i++; continue; }
        const cells = rowCells(lines[i]);
        const isHdr = rows.length === 0;
        rows.push(new TableRow({
          children: cells.map(c => new TableCell({
            children: [para(
              runs(c.replace(/\*\*/g,'').trim(), {sz:SZ.table, font:F.body}),
              {align: AlignmentType.LEFT, spacing:{line:480, before:40, after:40}}
            )],
            verticalAlign: VerticalAlign.CENTER,
          })),
          tableHeader: isHdr,
        }));
        i++;
      }
      out.push(new Table({
        rows,
        width: {size:100, type:WidthType.PERCENTAGE},
        borders: TB,
        margins: {top:60, bottom:60, left:80, right:80},
      }));
      continue;
    }

    // 代码块 → 等宽
    if (t.startsWith('```')) {
      inList = false; listCounter = 0;
      i++;
      const code = [];
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      const ft = { ascii: 'Courier New', eastAsia: '等线' };
      code.forEach(c => {
        if (!c.trim()) { out.push(emptyPara()); }
        else {
          out.push(para(
            [tr(c, {sz:22, font:ft})],
            {indent:{left:360}, spacing:{line:360, before:40, after:40},
             shading:{type:ShadingType.CLEAR, fill:'F5F5F5', color:'000000'}}
          ));
        }
      });
      continue;
    }

    // 目录列表（- 一、简介 这种）跳过
    if (inList === false && t.startsWith('- ')) {
      // 检查是否是目录条目（简短的）
      const content = t.slice(2).trim();
      if (content.length < 60 && (content.endsWith('附录') || content.match(/^[一二三四五六七八九十]/))) {
        // 跳过目录内容
        i++; continue;
      }
    }

    // 列表项（- 或 *）→ 公文用数字序号
    if (/^[-*]\s+/.test(t)) {
      inList = true;
      listCounter++;
      const ml = t.match(/^[-*]\s+(.+)/);
      if (ml) {
        out.push(para(
          [tr(`${listCounter}.  `, {sz:SZ.body, font:F.body}), ...runs(ml[1].replace(/\*\*/g,'').trim(), {sz:SZ.body, font:F.body})],
          {indent:{left:480, hanging:480}, spacing:{...LINE_28PT}}
        ));
      }
      i++; continue;
    }

    // 有序数字列表（1. 2. 3.）
    if (/^\d+\.\s+/.test(t)) {
      inList = true;
      const ml = t.match(/(\d+)\.\s+(.+)/);
      if (ml) {
        out.push(para(
          [tr(`${ml[1]}.  `, {sz:SZ.body, font:F.body, bold:true}), ...runs(ml[2].replace(/\*\*/g,'').trim(), {sz:SZ.body, font:F.body})],
          {indent:{left:480, hanging:480}, spacing:{...LINE_28PT}}
        ));
      }
      i++; continue;
    }

    // 普通段落
    if (t) {
      inList = false; listCounter = 0;
      // 如果是加粗的独立行（**标题**这种），作为段落内粗体
      if (/^\*\*.+\*\*$/.test(t)) {
        out.push(para(
          [tr('    ' + t.replace(/\*\*/g,'').trim(), {sz:SZ.body, font:F.body, bold:true})],
          {indent:{left:480}, spacing:{...LINE_28PT}}
        ));
      } else {
        out.push(para(
          runs(t, {sz:SZ.body, font:F.body}),
          {indent:{firstLine:960}, spacing:{...LINE_28PT}}  // 首行缩进2字=960 twip
        ));
      }
    }
    i++;
  }
  return out;
}

// ==================== 主生成 ====================

async function main() {
  const INPUT  = 'E:/code/my-ai-workspace/myk/调研笔记/规划院数字化转型/规划院数字化转型调研报告.md';
  const OUTPUT = 'E:/code/my-ai-workspace/exports/综合性规划院数字化转型方向调研报告（公文版）.docx';

  const outDir = dirname(OUTPUT);
  if (!existsSync(outDir)) mkdirSync(outDir, {recursive:true});

  const content = readFileSync(INPUT, 'utf-8');
  const lines = content.split('\n');

  let title = '综合性规划院数字化转型方向调研报告';
  for (const l of lines) {
    if (l.startsWith('# ') && !l.startsWith('## ')) { title = l.slice(2).replace(/\*\*/g,'').trim(); }
  }

  console.log('公文生成中...');
  console.log('  标题:', title);

  // 发文机关标志（红色标题上方）
  const orgMark = [
    emptyPara({before:800}),
    para([tr('邯郸市规划设计院', {
      sz: 52, font: F.title, bold: true, color: 'CC0000'
    })], {align: AlignmentType.CENTER, spacing:{before:0, after:0}}),
    emptyPara({before:120}),
    para(
      [tr('━'.repeat(20), {sz:10, font:F.title, color:'CC0000'})],
      {align: AlignmentType.CENTER, spacing:{before:0, after:0}}
    ),
    emptyPara({before:240}),
  ];

  // 发文日期行
  const dateRow = [
    para([
      tr('2026年4月9日', {sz:SZ.small, font:F.h2})
    ], {align: AlignmentType.RIGHT, spacing:{before:0, after:200}}),
    emptyPara({before:60}),
  ];

  // 正文
  const body = parseMD(lines);

  // 页脚：页码
  const footer = new Footer({
    children: [
      para([tr('—  ', {sz:SZ.small, font:F.body, color:'999999'}),
            new SimpleField('PAGE'),
            tr('  —', {sz:SZ.small, font:F.body, color:'999999'})],
           {align:AlignmentType.CENTER, spacing:{before:0,after:0}}),
    ],
  });

  // 创建文档
  const doc = new Document({
    creator: '邯郸市规划设计院',
    title: title,
    numbering: {
      config: [
        {
          reference: 'official-headings',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1', alignment: AlignmentType.LEFT },
          ],
        },
      ],
    },
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
            // 公文密级行（可选）
            emptyPara(),
          ],
        }),
      },
      footers: { default: footer },
      children: [...orgMark, ...dateRow, ...body],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(OUTPUT, buffer);

  console.log(`\n✅ 公文版生成成功`);
  console.log(`   路径: ${OUTPUT}`);
  console.log(`   大小: ${(buffer.length/1024).toFixed(1)} KB`);
  console.log(`   正文段落数: ${body.length}`);
}

main().catch(e => { console.error('❌', e.message); console.error(e.stack); process.exit(1); });
