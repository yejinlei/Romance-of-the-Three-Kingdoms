/**
 * version-ontology.js —— A1 轴 · 全部版本单元对齐本体（L3 UnitMapping）
 *
 * 提供 docs/texts 下所有可读版本 → 毛本 120 回主干 的单元映射元数据。
 * 映射为「按序近似」，运行时由 app.js 推导（不逐条硬编码）。
 *
 * 顶层 const VERSION_ONTOLOGY，不挂 window；页面用裸标识符读取。
 * 纯静态、无第三方库。
 *
 * 关键前提（实测）：
 * - hui 系：kind=chapter，标题「第N回」，N=回号恒等映射。
 * - jiajing 系：24卷×10则（卷内则无编号、顶格题名），则号=卷序*10+卷内序；维基转录本为 240 回标题。
 * - ze 系：kind=ze，标题「第N則」，N→毛本回按比例近似；周曰校 240 则残本缺 88/98/99。
 * - 夏振宇残本：块状存 40-59 与 1-20，按文件出现顺序编号（非则号）。
 * - juan 系：卷/篇，无则回，按整卷展示。
 */
const VERSION_ONTOLOGY = {
  meta: {
    note: 'A1/L3 UnitMapping：各版本单元→毛本120回主干（按序近似，非精确文本对齐）',
    target: 'mao', targetUnitKind: '回', targetUnitCount: 120
  },
  editions: {
    /* ---- hui 系：第N回 → 毛本第N回（恒等） ---- */
    huiping: {
      id: 'huiping', label: '七家汇评本', kind: 'hui', splitKind: 'chapter',
      splitOpts: {}, unitKind: '回', unitCount: 120, file: '七家汇评本.txt',
      hasAnno: true, annoStyle: 'inline-bracket', note: '汇辑毛宗岗、李贽、钟惺、李渔批语，120回；正文内联【】批语。'
    },
    lizhuowu: {
      id: 'lizhuowu', label: '李卓吾評本（OCR）', kind: 'hui', splitKind: 'chapter',
      splitOpts: { prefix: '###' }, unitKind: '回', unitCount: 120, file: '李卓吾評本_OCR.txt',
      ocr: true, hasAnno: true, annoStyle: 'inline-bracket', note: '明萬曆建陽刊《李卓吾先生批評三國志》，120回（缺第105回）；OCR。'
    },
    zhongbojing: {
      id: 'zhongbojing', label: '鍾伯敬評本（OCR）', kind: 'hui', splitKind: 'chapter',
      splitOpts: { prefix: '###' }, unitKind: '回', unitCount: 120, file: '鍾伯敬評本_OCR.txt',
      ocr: true, hasAnno: true, annoStyle: 'inline-bracket', note: '明末鍾惺批評本，120回（缺第105回）；OCR。'
    },
    liyu: {
      id: 'liyu', label: '笠翁評閱本（OCR）', kind: 'hui', splitKind: 'chapter',
      splitOpts: { prefix: '###' }, unitKind: '回', unitCount: 120, file: '笠翁評閱本_OCR.txt',
      ocr: true, hasAnno: true, annoStyle: 'inline-bracket', note: '清初李漁評閱本，120回（缺第105回）；OCR。'
    },

    /* ---- jiajing 系：24卷×10则 → 毛本回（则号近似） ----
       jiajing（嘉靖壬午本.txt）= 钱氏藏书目录本，仅存目次无正文（catalogOnly）；
       jiajing_ws（维基文库转录本）= 同版异录，含完整 240 则正文，承担嘉靖阅读。 */
    jiajing: {
      id: 'jiajing', label: '嘉靖壬午本', kind: 'jiajing', splitKind: 'marker',
      splitOpts: {}, unitKind: '卷', unitCount: 24, file: '嘉靖壬午本.txt',
      catalogOnly: true, // 仅存目次，无正文
      hasAnno: true, annoStyle: 'inline-bracket',
      note: '明嘉靖壬午刊《三国志通俗演义》24卷240则。本文件为钱氏藏书电子本，仅存卷目次（24卷×10则题名），正文见「嘉靖壬午本（维基文库转录本）」。'
    },
    'jiajing-ws': {
      id: 'jiajing-ws', label: '嘉靖壬午本（维基文库转录本）', kind: 'jiajing', splitKind: 'chapter',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 240, file: '嘉靖壬午本_维基文库转录.txt',
      filterTitle: /第/, // 仅取「第N回」标记，排除序/引/宗僚等卷首件
      perVolume: 10, zePerHui: 2,
      note: '维基文库独立转录，繁体原貌，240则，每则含正文；与嘉靖壬午本.txt同版异录，可对勘。'
    },

    /* ---- ze 系：第N則 → 毛本回（按比例近似） ---- */
    yuxiangdou: {
      id: 'yuxiangdou', label: '余象斗刊本（OCR）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 180, file: '余象斗刊本_OCR.txt',
      ocr: true, hasAnno: true, annoStyle: 'inline-bracket',
      explicitMapping: 'YXD_ONTOLOGY', // 优先用 ocr-ontology.js 显式映射
      note: '明万历余象斗双峰堂刊《三国志传评林》，180则；识典古籍 OCR，未校勘。'
    },
    huang: {
      id: 'huang', label: '黄正甫本', kind: 'ze', splitKind: 'bullet',
      splitOpts: {}, unitKind: '則', unitCount: 180, file: '黄正甫本.txt',
      hasAnno: true, annoStyle: 'inline-bracket',
      note: '明黄正甫刊志传系统，180则（●标记）；参校崇祯间黄正甫刊本。'
    },
    zhouyue: {
      id: 'zhouyue', label: '周曰校刊本（OCR）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '===' }, unitKind: '則', unitCount: 237, file: '周曰校刊本_OCR.txt',
      ocr: true, gapUnits: [88, 98, 99], // 残本缺则（题署240则，实存237则，缺88/98/99；另2/33-39为目录污染重复已去重）
      note: '明万历十九年周曰校刊，题署240则，实存237则（缺88/98/99）；多模态高精图文对照识读。'
    },
    xiongqingbo: {
      id: 'xiongqingbo', label: '熊清波藜光堂本（OCR）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 180, file: '熊清波藜光堂本_OCR.txt',
      ocr: true, note: '明萬曆間熊清波刊《三國全傳》，180则；OCR。'
    },
    zhengshaoyuan: {
      id: 'zhengshaoyuan', label: '鄭少垣刊本（OCR）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 180, file: '鄭少垣刊本_OCR.txt',
      ocr: true, note: '明萬曆間鄭少垣聯輝堂刊《三國志傳》，180则；OCR。'
    },
    zhudingchen: {
      id: 'zhudingchen', label: '朱鼎臣刊本（OCR）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 180, file: '朱鼎臣刊本_OCR.txt',
      ocr: true, note: '明萬曆間朱鼎臣刊《新刻按鑑全像三國志傳》，存180则（题署240则，卷十六至二十补全部分并入）；OCR。'
    },
    xiazhenyu: {
      id: 'xiazhenyu', label: '夏振宇刊本（OCR，殘本）', kind: 'ze', splitKind: 'ze',
      splitOpts: { prefix: '###' }, unitKind: '則', unitCount: 40, file: '夏振宇刊本_OCR.txt',
      ocr: true, unordered: true, // 块状存40-59与1-20两块；去重后唯一则号40个（1-20与40-59）
      gapUnits: [21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39], // 缺则21-39（残本中间整段无存）
      note: '明萬曆間夏振宇刊《三國志傳通俗演義》，殘存1-20与40-59则两块（去重后40则，缺21-39）；OCR，僅檢索用。'
    },

    /* ---- juan 系：卷/篇，无则回，整卷展示 ---- */
    sanguozhi: {
      id: 'sanguozhi', label: '三国志（裴松之注）', kind: 'juan', splitKind: 'marker',
      splitOpts: {}, unitKind: '卷', unitCount: 65, file: '三国志裴注.txt',
      filterTitle: /^[魏蜀吳]書/, // 仅取「魏書N / 蜀書N / 吳書N」卷标题
      note: '晋陈寿撰、南朝宋裴松之注，65卷（魏書/蜀書/吳書）。'
    },
    pinghua: {
      id: 'pinghua', label: '三国志平话', kind: 'juan', splitKind: 'marker',
      splitOpts: {}, unitKind: '卷', unitCount: 3, file: '三国志平话.txt',
      note: '元至治建安虞氏刊《全相平話》三卷。'
    },
    huaguan: {
      id: 'huaguan', label: '花关索传', kind: 'juan', splitKind: 'marker',
      splitOpts: {}, unitKind: '篇', unitCount: 4, file: '花关索传.txt',
      note: '明成化十四年说唱词话，四种。'
    },
    'sankuo-en': {
      id: 'sankuo-en', label: 'San Kuo 英译本（Brewitt-Taylor 1925）', kind: 'hui',
      splitKind: 'en-chapter', splitOpts: {}, unitKind: '回', unitCount: 114,
      file: 'SanKuo_BrewittTaylor英译本.txt',
      gapUnits: [6, 20, 25, 60, 75, 114], // 该译本缺此 6 回
      lang: 'en',
      note: 'Charles Henry Brewitt-Taylor 1925 年英译全本（公版），120回缺6回（6/20/25/60/75/114），回号取自 [Volume N · Chapter M] 标记。'
    }
  }
};
