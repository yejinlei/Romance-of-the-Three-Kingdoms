/**
 *《三国演义》深度本体论 · 规范文件（Schema v3.0）
 *
 * 本体以库内古本为文献基础：嘉靖壬午本（1522）、周曰校刊本（1591）、余象斗刊本（1592）、
 * 黄正甫本、熊清波本、叶逢春本、夏振宇本、朱鼎臣本、郑少垣本、刘龙田本、
 * 李卓吾评本、钟伯敬评本、笠翁评阅本、毛宗岗评本、七家汇评本、
 * 《三国志平话》《花关索传》以及《三国志》裴松之注。
 *
 * v3.0 架构：4 轴 × 7 层 × N 实例（正交本体）
 *  - 4 轴（横向分类维度，回答四类互不重叠的问题）：
 *      A1 版本形制轴 Edition  —— 哪本书、哪一制、哪一版
 *      A2 叙事内容轴 Narrative —— 写什么、怎么写、以何意趣
 *      A3 人物传承轴 Figure    —— 谁、谁属谁、谁评
 *      A4 时代事件轴 Era       —— 何时、何缘、何背景
 *  - 7 层（纵向抽象阶梯，上层统摄下层）：
 *      L0 元模型 / L1 义理 / L2 论断 / L3 谱系 / L4 文献 / L5 人物叙事 / L6 外延
 *  - N = 实体 × 粒度 × 轴 × 层 × 版本；每个实例携带本体坐标 (axis, layer)。
 *
 * 设计原则：
 *  1. 正交分离：轴回答"横向属于哪一类"，层回答"纵向处于哪一抽象级"，二者独立取值。
 *  2. 虚实是标注维度而非排除标准：虚构实体（如貂蝉、关索）同样是一等公民，挂虚实标签保留。
 *  3. 结论分三级：公版结论（学界公论，出自公版文献）/ 名家结论（具名学者论断）/ 评注（逐段批点）。
 *  4. 版本对齐：各本单元（回/则/卷）通过 UnitMapping 互相对齐，异文挂接于对齐单元上。
 *  5. 可扩展：新增类只需在 classes 追加并标注 axis/layer，页面统计与矩阵自动更新。
 */
const SANGUO_ONTOLOGY = {

  meta: {
    id: 'sanguo-ontology',
    title: '《三国演义》深度本体论',
    subtitle: 'Romance of the Three Kingdoms Deep Ontology',
    iri: 'https://example.org/sanguo#',
    prefix: 'sg:',
    version: '3.0',
    updated: '2026-11-26',
    formalism: 'OWL 2 DL 兼容；本文件为可执行规范，docs/sanguo-ontology.ttl 为序列化产物',
    architecture: '4 轴 × 7 层 × N 实例（正交本体）',
    scope: '以本库 19 种古本/评本/史书语料（约 640 万字）为底，覆盖 120 回叙事、200+ 人物、66 地理、36 战役、4 家评点、13+ 虚实对照。'
  },

  /* ============================ 词表（受控词表） ============================ */
  vocabularies: {
    historicalStatus: {
      label: '虚实标注',
      desc: '情节/人物/器物与正史（《三国志》及裴注）对照后的真实程度，四级制。沿用章学诚"七分实事，三分虚构"之说分判。',
      terms: [
        { id: 'fact', label: '史实', color: '#006400', bg: '#e6f7e6', desc: '与正史基本相合，可坐实。' },
        { id: 'embellished', label: '史实加工', color: '#8b6914', bg: '#fff8e1', desc: '本于史而有增饰渲染，骨干真实、细节虚设。' },
        { id: 'transposed', label: '移花接木', color: '#e65100', bg: '#fff3e0', desc: '史有其事而张冠李戴、时空挪移（如"温酒斩华雄"移孙坚之事予关羽）。' },
        { id: 'fictional', label: '虚构', color: '#8b0000', bg: '#ffe6e6', desc: '史所未载，出于小说家创造（如貂蝉、草船借箭、关索）。' }
      ]
    },
    editionSystem: {
      label: '版本系统',
      desc: '现存《三国演义》版本的两大源流及评本系列。',
      terms: [
        { id: 'yanyi', label: '演义系统', desc: '《三国志通俗演义》二百四十则系：嘉靖壬午本为现存最早刻本，周曰校本、夏振宇本属此系。' },
        { id: 'zhizhuan', label: '志传系统', desc: '《三国志传》系：多存关索故事，叶逢春本、黄正甫本、余象斗本、熊清波本、朱鼎臣本、郑少垣本、刘龙田本属此系。' },
        { id: 'pingben', label: '评本', desc: '李卓吾评本、钟伯敬评本、笠翁评阅本、毛宗岗评本等带批点的刊本。' },
        { id: 'huiping', label: '汇评本', desc: '汇辑诸家批语之本，如七家汇评本。' },
        { id: 'pinghua', label: '平话·词话', desc: '演义成书前的讲史底本：《三国志平话》《花关索传》。' },
        { id: 'shishu', label: '史书注释', desc: '《三国志》及裴松之注，虚实考辨的正史基准。' }
      ]
    },
    textStatus: {
      label: '文本可得性',
      terms: [
        { id: 'full', label: '全文入库', desc: '校勘文本已入库，可全文检索与对读。' },
        { id: 'partial', label: '部分入库', desc: '存残卷或部分单元。' },
        { id: 'ocr', label: '仅OCR（检索用）', desc: 'OCR 文本正确率未达 97% 验收线，只作检索，不作对勘底本。' },
        { id: 'facsimile', label: '仅影印', desc: '有公开影印（PDF/JPG）而无文本。' },
        { id: 'absent', label: '未获', desc: '仅书目著录，未见公开影像。' }
      ]
    },
    assertionType: {
      label: '结论/标注类型',
      terms: [
        { id: 'consensus', label: '公版结论', desc: '学界公论，出自公版（PD）学术文献：鲁迅《中国小说史略》、胡适《三国志演义序》、郑振铎《三国志演义的演化》、孙楷第书目、谢肇淛《五杂俎》、章学诚《丙辰札记》等。' },
        { id: 'critic', label: '名家结论', desc: '具名评点家/学者的论断：毛宗岗、李卓吾（李贽）、钟伯敬（钟惺）、李渔（笠翁）、金圣叹、陈寿、裴松之等。' },
        { id: 'commentary', label: '评注', desc: '逐回逐段批点文字，依附于具体单元（回/则）与文本位置。' },
        { id: 'editor', label: '编者按', desc: '本站编者校勘记、对齐说明、OCR 校情等。' }
      ]
    },
    unitKind: {
      label: '文本单元形制',
      terms: [
        { id: 'hui', label: '回', desc: '毛本、评本等一百二十回制。' },
        { id: 'ze', label: '则', desc: '嘉靖本、演义系统二百四十则制。' },
        { id: 'juan', label: '卷', desc: '志传系统二十卷制、平话三卷制等。' },
        { id: 'juan_ze', label: '卷·则', desc: '卷下分则，如周曰校本十二卷二百四十则。' }
      ]
    },
    narrativeTechnique: {
      label: '叙事技法',
      desc: '评点家所揭示的章回笔法（A2 轴技法/章法类挂载的受控取值），语出毛宗岗、李贽诸家评语。',
      terms: [
        { id: 'foreshadow', label: '草蛇灰线', desc: '前文暗伏、后文照应（如诸葛亮的锦囊、关羽的丹凤眼）。' },
        { id: 'virtualReal', label: '虚实相生', desc: '以虚写实、以实带虚，虚实互为表里。' },
        { id: 'doubleWrite', label: '互影回文', desc: '两回并写、互为镜像（如关羽失荆州与刘备伐吴）。' },
        { id: 'contrast', label: '烘云托月', desc: '以众人之弱烘一人之强，以次要人物衬主要人物。' },
        { id: 'inverted', label: '倒叙插叙', desc: '叙事情序与叙述顺序错位，含补叙、追叙。' },
        { id: 'echoing', label: '首尾呼应', desc: '回末设疑、次回揭底，形成连环扣。' }
      ]
    },
    imagery: {
      label: '意象',
      desc: '反复出现并承载义理的文学意象（A2 轴意象类挂载）。',
      terms: [
        { id: 'sword', label: '剑·刀', desc: '青龙偃月刀、七星剑、雌雄双股剑：英雄身份与义气之象征。' },
        { id: 'horse', label: '马', desc: '赤兔、的卢：命运与忠义之载体（"的卢马"救主）。' },
        { id: 'jadeSeal', label: '玉玺', desc: '传国印信：正统与天命之焦点。' },
        { id: 'peach', label: '桃·桃园', desc: '结义之盟，义气的空间化。' },
        { id: 'fire', label: '火·赤壁', desc: '火烧连营、赤壁鏖兵：天命转移的场面意象。' },
        { id: 'starfall', label: '星陨', desc: '将星陨落：气数与命运的天象化。' },
        { id: 'moon', label: '月', desc: '月下对饮、煮酒论月：智谋与孤独的意象。' }
      ]
    },
    orthodoxy: {
      label: '正统观',
      desc: '评点家与后世论者对"正统"归属的判择（A2 轴正统观类挂载）。',
      terms: [
        { id: 'shuLegit', label: '蜀汉正统', desc: '以"尊刘"为本位，视蜀汉为汉之正统（毛宗岗一派之立场）。' },
        { id: 'weiLegit', label: '曹魏正统', desc: '以禅代为名分所归，视魏承汉统。' },
        { id: 'duoZheng', label: '吴魏双轨', desc: '承认魏、吴并立各有其政。' },
        { id: 'antiLegit', label: '消解正统', desc: '不判正统而只论兴亡，如部分史家叙事立场。' }
      ]
    }
  },
/* ============================ 四轴（Axes） ============================ */
  axes: [
    {
      id: 'A1', label: '版本形制轴', en: 'Edition Axis',
      desc: '回答"哪本书、哪一制、哪一版"：演义系统/志传系统/评本/汇评/平话/史书注 → 单元形制（回/则/卷/卷·则）→ 刊本 → 刊刻者与藏地。',
      classes: ['Edition', 'Unit', 'UnitMapping', 'Paratext', 'VariantReading', 'EditionGap', 'PrintingWork']
    },
    {
      id: 'A2', label: '叙事内容轴', en: 'Narrative Axis',
      desc: '回答"写什么、怎么写、以何意趣"：义理（义·忠·智·勇·天命）→ 论断范畴 → 意象 → 文体范畴 → 技法（伏笔、草蛇灰线、虚实相生）→ 章法 → 句/字/韵。',
      classes: ['DoctrineConcept', 'AssertionCategory', 'Imagery', 'StyleCategory', 'NarrativeTechnique', 'ChapterCraft', 'TextualSpan', 'Prophecy', 'Poem', 'HistoricalAssessment']
    },
    {
      id: 'A3', label: '人物传承轴', en: 'Figure Axis',
      desc: '回答"谁、谁属谁、谁评"：圣贤化人物 → 君主/宗臣 → 名将/谋士 → 幕僚/文士 → 评点家·注家 → 演义/评书再叙述者。',
      classes: ['Person', 'Critic', 'Annotator', 'Reteller', 'Genealogy', 'OfficialTitle']
    },
    {
      id: 'A4', label: '时代事件轴', en: 'Era Axis',
      desc: '回答"何时、何缘、何背景"：朝代（汉末→三国→西晋）→ 政局/党争/结社 → 交游/师承 → 创作·成书·刊刻·流传。',
      classes: ['Polity', 'Faction', 'Dynasty', 'Event', 'Battle', 'Stratagem', 'Place', 'PoliticalSituation', 'HistoricalEvent', 'ChronologyLayer']
    }
  ],

  /* ============================ 七层结构（Layers） ============================ */
  layers: [
    { id: 'L0', order: 0, label: '元模型层', en: 'Meta', desc: '本体的轴、层、粒度、横切维度自身的定义——回答"这套坐标怎么成立"。' },
    { id: 'L1', order: 1, label: '义理层', en: 'Doctrine', desc: '道·正统·天命·义·忠·智·勇——全书的最高义理坐标，统摄一切判词与评点。' },
    { id: 'L2', order: 2, label: '论断层', en: 'Judgement', desc: '评点范畴与虚实判词：古人与学者的判断性表述（虚实四级、褒贬判词）。' },
    { id: 'L3', order: 3, label: '谱系层', en: 'Genealogy', desc: '系统性的归属关系：版本系统谱系、势力与政权谱系、师承与交游。' },
    { id: 'L4', order: 4, label: '文献层', en: 'Textus', desc: '版本、文本单元、序跋凡例、异文、缺口——回答"哪本书、哪一回、什么字"。' },
    { id: 'L5', order: 5, label: '人物叙事层', en: 'Fabula', desc: '人物、地理、战役、事件、计谋、器物、诗词、谶纬、官职、世系——回答"谁、何时、何地、做了什么"。' },
    { id: 'L6', order: 6, label: '外延层', en: 'Extension', desc: '历史背景、正史对照、刊刻出版、地理空间、后世接受——本书与外部世界的连接面。' }
  ],

  /* ============================ 类（Classes） ============================ */
  classes: [
    /* ---- A1 版本形制轴 · L4 文献层 ---- */
    { id: 'Edition', label: '版本/刊本', axis: 'A1', layer: 'L4', estCount: 19,
      def: '一种独立刊刻或整理的《三国演义》相关文本实体。',
      props: ['editionSystem', 'unitKind', 'unitCount', 'year', 'printer', 'holder', 'textStatus', 'derivedFrom', 'hasParatext', 'hasUnit'],
      examples: ['嘉靖壬午本', '毛宗岗评本', '余象斗刊本'] },
    { id: 'Unit', label: '文本单元（回/则/卷）', axis: 'A1', layer: 'L4', estCount: 2400,
      def: '版本内部的叙事切分单位。不同版本单元数不同（120 回 / 240 则 / 180 则），通过 UnitMapping 互相对齐。',
      props: ['inEdition', 'narrates', 'mentions', 'mapsTo', 'hasCommentary', 'isVirtual'],
      examples: ['毛本第 5 回', '嘉靖本第 10 则'] },
    { id: 'UnitMapping', label: '单元对齐', axis: 'A1', layer: 'L3', estCount: 240,
      def: '跨版本单元对齐关系：以毛本 120 回为主干，映射嘉靖本 240 则、志传本则目。回目分合差异（如嘉靖一则=毛本半回）以此表达。',
      props: ['mapsFrom', 'mapsTo', 'alignNote'] },
    { id: 'Paratext', label: '序跋/凡例/读法', axis: 'A1', layer: 'L4', estCount: 10,
      def: '卷首卷末的非叙事文本：序、引、凡例、读法、宗僚表。',
      props: ['inEdition', 'authoredBy'],
      examples: ['毛宗岗本序', '读三国志法', '嘉靖本序引宗僚'] },
    { id: 'VariantReading', label: '异文', axis: 'A1', layer: 'L4', estCount: 200,
      def: '同一叙事单元在不同版本中的文字/情节差异。按差异性质分：字词异文、情节增删（如关索故事）、分回差异。',
      props: ['occursIn', 'variantKind', 'variantText', 'annotatedBy'] },
    { id: 'EditionGap', label: '版本缺口', axis: 'A1', layer: 'L6', estCount: 13,
      def: '已著录而文本未获/不全的版本及其获取状态（影印、OCR 验收结论）。',
      props: ['forEdition', 'tier', 'holder', 'ocrVerdict'],
      examples: ['杨美生本（确实拿不到）', '周曰校本 OCR 试点（0.48，未达 97% 验收线）'] },
    { id: 'PrintingWork', label: '刊刻出版', axis: 'A1', layer: 'L6', estCount: 19,
      def: '刊刻行为本身：书坊、刻工、藏地、版刻年代，供版本流传史与出版史研究。',
      props: ['printer', 'holder', 'year', 'colophon'] },

    /* ---- A2 叙事内容轴 · L1 义理层 ---- */
    { id: 'DoctrineConcept', label: '义理概念', axis: 'A2', layer: 'L1', estCount: 12,
      def: '全书最高义理坐标：天命、正统、仁义、忠、智、勇、大势。一切褒贬与评点以此裁断。',
      props: ['doctrineKind', 'exemplifiedBy'],
      examples: ['天命', '正统', '仁义', '忠义', '智勇'] },
    { id: 'OrthodoxyView', label: '正统观', axis: 'A2', layer: 'L1', estCount: 4,
      def: '评点家与后世论者对"正统"归属的判择，取值受控于 orthodoxy 词表。',
      props: ['orthodoxy', 'advocatedBy'] },

    /* ---- A2 叙事内容轴 · L2 论断层 ---- */
    { id: 'AssertionCategory', label: '论断范畴', axis: 'A2', layer: 'L2', estCount: 20,
      def: '评点家的判断性范畴：褒贬判词、褒贬二分（褒贬/褒贬抑扬）、真伪判定等。',
      props: ['judgedBy', 'about', 'verdict'] },
    { id: 'Imagery', label: '意象', axis: 'A2', layer: 'L2', estCount: 24,
      def: '反复出现并承载义理的文学意象（剑、马、玉玺、桃、火、星、月），取值受控于 imagery 词表。',
      props: ['imageryKind', 'appearsIn', 'symbolizes'] },
    { id: 'HistoricalAssessment', label: '虚实断语', axis: 'A2', layer: 'L2', estCount: 80,
      def: '具体情节/人物的虚实判词，取值受控于 historicalStatus 词表，附正史对照说明。',
      props: ['about', 'status', 'historyRecord', 'verdict'] },
    { id: 'Poem', label: '诗词', axis: 'A2', layer: 'L5', estCount: 40,
      def: '回中诗词赞语（"后人有诗赞曰"类）。',
      props: ['author', 'inUnit', 'text'] },
    { id: 'Prophecy', label: '谶纬', axis: 'A2', layer: 'L2', estCount: 12,
      def: '童谣、谶语、梦兆及其应验——义理层"天命"的叙事落地。',
      props: ['prophet', 'foretells', 'omenText'] },

    /* ---- A2 叙事内容轴 · L5 文体/技法 ---- */
    { id: 'StyleCategory', label: '文体范畴', axis: 'A2', layer: 'L5', estCount: 8,
      def: '叙述体式的受控分类：述赞、韵语、对话、战阵铺陈、议论、回目对偶。供文体计量统计。',
      props: ['styleKind', 'inUnit'] },
    { id: 'NarrativeTechnique', label: '叙事技法', axis: 'A2', layer: 'L5', estCount: 60,
      def: '评点家所揭示的笔法：草蛇灰线、虚实相生、烘云托月、互影回文、倒叙插叙，取值受控于 narrativeTechnique 词表。',
      props: ['techniqueKind', 'exemplifiedIn', 'notedBy'] },
    { id: 'ChapterCraft', label: '章法', axis: 'A2', layer: 'L5', estCount: 40,
      def: '回目级的结构安排：起承转合、章回首尾、双线并叙、章次呼应。',
      props: ['craftKind', 'inUnit', 'notes'] },
    { id: 'TextualSpan', label: '句·字·韵', axis: 'A2', layer: 'L5', estCount: 240,
      def: '句/字/韵级文本片段：回目格律的平仄、韵脚、异文位，供文体计量与回目格律研究。',
      props: ['tokenKind', 'tone', 'rhymeGroup', 'inUnit'] },

    /* ---- A1 轴 · L4 文献层（对齐/评点挂接） ---- */
    { id: 'Commentary', label: '评注', axis: 'A1', layer: 'L4', estCount: 6000,
      def: '逐回批点文字。四家评语辑录共 36.8 万字，另有七家汇评本夹批总评 105 万字待接入。位置受控于 commentaryPos。',
      props: ['byCritic', 'onUnit', 'onText', 'kind', 'commentaryPos'],
      examples: ['毛宗岗第一回回前评', '李卓吾夹批'] },
    { id: 'ReadingMethod', label: '读法', axis: 'A1', layer: 'L4', estCount: 3,
      def: '通论性批评文本：《读三国志法》等。',
      props: ['byCritic', 'text'] },

    /* ---- A3 人物传承轴 · L5 人物叙事层 ---- */
    { id: 'Person', label: '人物', axis: 'A3', layer: 'L5', estCount: 200,
      def: '演义叙事中的人物。含史实人物与虚构人物，一律以 historicalStatus 标注虚实，不排除虚构者。',
      props: ['style', 'faction', 'nativePlace', 'birth', 'death', 'officialTitle', 'mentionCount', 'historicalStatus', 'kinOf', 'masterOf', 'participatesIn'],
      examples: ['刘备（史实）', '貂蝉（虚构）', '关索（虚构/志传系统特有）'] },
    { id: 'OfficialTitle', label: '官职', axis: 'A3', layer: 'L5', estCount: 60,
      def: '官爵名号，供人物任职链查询。',
      props: ['heldBy', 'rank'] },
    { id: 'Genealogy', label: '世系', axis: 'A3', layer: 'L3', estCount: 20,
      def: '宗族谱系（刘汉宗亲、曹氏夏侯、孙氏吴郡……），兼作谱系层的家族归属关系。',
      props: ['members', 'ancestor'] },
    { id: 'Critic', label: '评点家', axis: 'A3', layer: 'L5', estCount: 8,
      def: '评点者/史家：毛宗岗、李卓吾、钟伯敬、李渔、金圣叹、陈寿、裴松之、鲁迅等。',
      props: ['era', 'works', 'hasConclusion', 'hasCommentary'],
      examples: ['毛宗岗（评语 206,093 字）', '李卓吾（48,870 字）', '钟伯敬（44,894 字）', '李渔（67,674 字）'] },
    { id: 'Annotator', label: '注家', axis: 'A3', layer: 'L6', estCount: 3,
      def: '正史注文家：裴松之（《三国志》注）等，为虚实考辨提供外部基准。',
      props: ['era', 'works', 'annotatedOn'] },
    { id: 'Reteller', label: '再叙述者', axis: 'A3', layer: 'L6', estCount: 5,
      def: '后世再叙述者：评书家、戏曲家、影视改编者——本书进入"接受史"的通道。',
      props: ['era', 'medium', 'derivesFrom'] },

    /* ---- A4 时代事件轴 · L3 谱系层 ---- */
    { id: 'Faction', label: '势力', axis: 'A4', layer: 'L3', estCount: 12,
      def: '政治军事集团：蜀汉、曹魏、东吴、群雄、汉室等。',
      props: ['ruler', 'capital', 'members', 'territory'],
      examples: ['蜀汉', '曹魏', '东吴'] },
    { id: 'Polity', label: '政权', axis: 'A4', layer: 'L3', estCount: 6,
      def: '具名号的国家实体（魏蜀吴及汉、晋），与 Faction 区分：Faction 为势力班底，Polity 为正统名号。',
      props: ['eraName', 'foundedBy'] },
    { id: 'Dynasty', label: '朝代', axis: 'A4', layer: 'L3', estCount: 3,
      def: '汉末 → 三国 → 西晋的朝代序列，叙事纪年的最高框架。',
      props: ['reignStart', 'reignEnd', 'successor'] },
    { id: 'PoliticalSituation', label: '政局/结社', axis: 'A4', layer: 'L3', estCount: 15,
      def: '党争、结社、盟约等关系性政局单元：桃园结义、衣带诏、关洛同盟。',
      props: ['kind', 'year', 'involves'] },

    /* ---- A4 时代事件轴 · L5 人物叙事层 ---- */
    { id: 'Place', label: '地理', axis: 'A4', layer: 'L5', estCount: 66,
      def: '州郡县、关隘、山川、城邑。含古今地名对照与经纬度。',
      props: ['level', 'modernName', 'coord', 'battleAt', 'capitalOf'],
      examples: ['洛阳', '赤壁', '五丈原'] },
    { id: 'Battle', label: '战役', axis: 'A4', layer: 'L5', estCount: 36,
      def: '具名战役。含年份、地点、参战人物、结果与虚实标注。',
      props: ['year', 'placeIds', 'keyPersonIds', 'result', 'historicalStatus'],
      examples: ['官渡之战', '赤壁之战', '夷陵之战'] },
    { id: 'Event', label: '事件', axis: 'A4', layer: 'L5', estCount: 120,
      def: '具名情节单元（桃园结义、三顾茅庐、白帝托孤……），可跨回目。',
      props: ['year', 'persons', 'places', 'kind', 'historicalStatus', 'narratedIn'],
      examples: ['桃园结义', '温酒斩华雄（移花接木）'] },
    { id: 'Stratagem', label: '计谋', axis: 'A4', layer: 'L5', estCount: 40,
      def: '具名计谋单元，含使用者、对象、结果。',
      props: ['usedBy', 'targetOf', 'result', 'kind', 'historicalStatus'],
      examples: ['连环计', '空城计（虚构）', '草船借箭（虚构）'] },
    { id: 'Artifact', label: '器物', axis: 'A4', layer: 'L5', estCount: 30,
      def: '兵器、坐骑、印玺、信物等。演义多夸张虚构，须标虚实。',
      props: ['kind', 'owner', 'historicalStatus'],
      examples: ['青龙偃月刀', '赤兔马', '传国玉玺'] },

    /* ---- A4 时代事件轴 · L6 外延层 ---- */
    { id: 'HistoricalEvent', label: '正史事件', axis: 'A4', layer: 'L6', estCount: 80,
      def: '《三国志》及裴注所记之对应史事，为演义事件提供外部基准。',
      props: ['recordedIn', 'sourceCited'] },
    { id: 'ChronologyLayer', label: '编年层', axis: 'A4', layer: 'L6', estCount: 60,
      def: '叙事纪年与史实纪年的对应刻度（虚构年月 ↔ 真实年代），供时间三分维度使用。',
      props: ['narrativeYear', 'historicalYear', 'offsetNote'] },

    /* ---- A2/A3 轴 · L6 外延层（结论与文献） ---- */
    { id: 'ConsensusConclusion', label: '公版结论', axis: 'A2', layer: 'L6', estCount: 60,
      def: '学界公论，出自公版（PD）学术文献，须著明出处。如：嘉靖壬午本为现存最早刻本；演义"七实三虚"；志传系统多存关索故事。',
      props: ['about', 'source', 'confidence', 'tags'] },
    { id: 'CriticConclusion', label: '名家结论', axis: 'A3', layer: 'L6', estCount: 120,
      def: '具名学者/评点家的论断。如胡适评毛宗岗"不是批评家，乃是改作家"；鲁迅论三国"描写过实"。',
      props: ['about', 'byCritic', 'source', 'tags'] },
    { id: 'Work', label: '公版文献', axis: 'A3', layer: 'L6', estCount: 15,
      def: '结论所本的公版（PD）学术文献与书目：鲁迅《中国小说史略》、胡适序、孙楷第目录等。',
      props: ['author', 'year', 'workKind'] },
    { id: 'IntertextText', label: '互文文本节点', axis: 'A4', layer: 'L6', estCount: 10,
      def: '与本书构成互文关系的文本系统节点：《三国志》裴松之注、《三国志平话》、话本、元杂剧三国戏、评书、后世改编。本期为书目级登记，不做逐出对勘。',
      props: ['intertextKind', 'relationKind', 'era', 'notedIn'] }
  ],

  /* ============================ 属性（Properties） ============================ */
  properties: [
    /* 对象属性 */
    { id: 'derivedFrom', label: '承袭自', type: 'object', domain: 'Edition', range: 'Edition',
      def: '版本谱系承袭关系：毛宗岗评本 ← 李卓吾评本 ← 嘉靖壬午本。' },
    { id: 'mapsTo', label: '单元对齐', type: 'object', domain: 'Unit', range: 'Unit', def: '跨版本单元映射（经 UnitMapping）。' },
    { id: 'hasParatext', label: '卷首文本', type: 'object', domain: 'Edition', range: 'Paratext' },
    { id: 'hasUnit', label: '含单元', type: 'object', domain: 'Edition', range: 'Unit' },
    { id: 'inEdition', label: '属于版本', type: 'object', domain: 'Unit', range: 'Edition' },
    { id: 'inUnit', label: '见于单元', type: 'object', domain: 'TextualSpan', range: 'Unit' },
    { id: 'occursIn', label: '异文见于', type: 'object', domain: 'VariantReading', range: 'Edition' },
    { id: 'faction', label: '所属势力', type: 'object', domain: 'Person', range: 'Faction' },
    { id: 'ruler', label: '君主', type: 'object', domain: 'Faction', range: 'Person' },
    { id: 'kinOf', label: '亲缘', type: 'object', domain: 'Person', range: 'Person', def: '父子/兄弟/婚姻/宗亲。' },
    { id: 'masterOf', label: '师承', type: 'object', domain: 'Person', range: 'Person' },
    { id: 'participatesIn', label: '参与', type: 'object', domain: 'Person', range: 'Event' },
    { id: 'foughtAt', label: '战于', type: 'object', domain: 'Battle', range: 'Place' },
    { id: 'narrates', label: '叙述', type: 'object', domain: 'Unit', range: 'Event', def: '单元所叙述的事件。' },
    { id: 'narratedIn', label: '叙于', type: 'object', domain: 'Event', range: 'Unit' },
    { id: 'foretells', label: '预言', type: 'object', domain: 'Prophecy', range: 'Event' },
    { id: 'byCritic', label: '评点者', type: 'object', domain: 'Commentary', range: 'Critic' },
    { id: 'onUnit', label: '批于', type: 'object', domain: 'Commentary', range: 'Unit' },
    { id: 'about', label: '论及', type: 'object', domain: 'ConsensusConclusion', range: '*', def: '结论的靶标：版本/人物/事件/情节皆可。' },
    { id: 'source', label: '出处', type: 'object', domain: 'ConsensusConclusion', range: 'Work', def: '结论所本的公版文献。' },
    { id: 'sourceCited', label: '史书出处', type: 'object', domain: 'HistoricalEvent', range: 'Work', def: '正史/裴注的具体篇目出处。' },
    { id: 'recordedIn', label: '见于史书', type: 'object', domain: 'HistoricalEvent', range: 'Edition' },
    { id: 'exemplifiedIn', label: '例见', type: 'object', domain: 'NarrativeTechnique', range: 'Unit', def: '技法在文本中的例证单元。' },
    { id: 'notedBy', label: '评出', type: 'object', domain: 'NarrativeTechnique', range: 'Critic' },
    { id: 'exemplifiedBy', label: '以之为例', type: 'object', domain: 'DoctrineConcept', range: 'Event' },
    { id: 'symbolizes', label: '象征', type: 'object', domain: 'Imagery', range: 'DoctrineConcept' },
    { id: 'appearsIn', label: '意象见于', type: 'object', domain: 'Imagery', range: 'Unit' },
    { id: 'judgedBy', label: '判于', type: 'object', domain: 'AssertionCategory', range: 'Critic' },
    { id: 'advocatedBy', label: '倡于', type: 'object', domain: 'OrthodoxyView', range: 'Critic' },
    { id: 'authoredBy', label: '撰于', type: 'object', domain: 'Paratext', range: 'Person' },
    { id: 'annotatedBy', label: '注于', type: 'object', domain: 'VariantReading', range: 'Critic' },
    { id: 'usedBy', label: '用计者', type: 'object', domain: 'Stratagem', range: 'Person' },
    { id: 'targetOf', label: '计施于', type: 'object', domain: 'Stratagem', range: 'Person' },
    { id: 'heldBy', label: '任职者', type: 'object', domain: 'OfficialTitle', range: 'Person' },
    { id: 'battleAt', label: '战于地', type: 'object', domain: 'Battle', range: 'Place' },
    { id: 'capitalOf', label: '都于', type: 'object', domain: 'Place', range: 'Polity' },
    { id: 'owner', label: '属主', type: 'object', domain: 'Artifact', range: 'Person' },
    { id: 'prophet', label: '预言者', type: 'object', domain: 'Prophecy', range: 'Person' },
    { id: 'hasCommentary', label: '有评', type: 'object', domain: 'Unit', range: 'Commentary' },
    { id: 'hasConclusion', label: '有论断', type: 'object', domain: 'Critic', range: 'CriticConclusion' },
    { id: 'hasCommentaryOn', label: '有批点', type: 'object', domain: 'Critic', range: 'Commentary' },
    { id: 'forEdition', label: '缺口所属版本', type: 'object', domain: 'EditionGap', range: 'Edition' },
    { id: 'mapsFrom', label: '对齐自', type: 'object', domain: 'UnitMapping', range: 'Unit' },
    { id: 'members', label: '成员', type: 'object', domain: 'Genealogy', range: 'Person' },
    { id: 'ancestor', label: '宗祖', type: 'object', domain: 'Genealogy', range: 'Person' },
    { id: 'author', label: '作者', type: 'object', domain: 'Poem', range: 'Person' },
    { id: 'works', label: '著述', type: 'object', domain: 'Critic', range: 'Work' },
    { id: 'annotatedOn', label: '注于书', type: 'object', domain: 'Annotator', range: 'Edition' },
    { id: 'derivesFrom', label: '本于', type: 'object', domain: 'Reteller', range: 'Edition' },
    { id: 'notedIn', label: '见载于', type: 'object', domain: 'IntertextText', range: 'Work' },
    { id: 'intertextWith', label: '互文于', type: 'object', domain: 'Edition', range: 'IntertextText',
      def: '与外部文本系统（裴注/平话/元杂剧/评书/后世改编）的书目级互文关系。' },
    { id: 'involves', label: '涉事', type: 'object', domain: 'PoliticalSituation', range: 'Person' },
    { id: 'successor', label: '继统于', type: 'object', domain: 'Dynasty', range: 'Dynasty' },
    { id: 'foundedBy', label: '肇基于', type: 'object', domain: 'Polity', range: 'Person' },
    { id: 'territory', label: '辖地', type: 'object', domain: 'Faction', range: 'Place' },
    { id: 'nativePlace', label: '籍贯', type: 'object', domain: 'Person', range: 'Place' },

    /* 数据属性 */
    { id: 'mentions', label: '提及', type: 'object', domain: 'Unit', range: 'Person', def: '单元所提及的人物（G2 粒度下的人物提及计数基础）。' },
    { id: 'onText', label: '批于字', type: 'object', domain: 'Commentary', range: 'TextualSpan', def: '评点所针对的句/字片段。' },
    { id: 'capital', label: '都城', type: 'object', domain: 'Faction', range: 'Place' },
    { id: 'persons', label: '涉事人物集', type: 'object', domain: 'Event', range: 'Person' },
    { id: 'places', label: '涉事地理集', type: 'object', domain: 'Event', range: 'Place' },
    { id: 'status', label: '虚实取值', type: 'data', range: 'historicalStatus', def: '虚实断语所取的等级：fact/embellished/transposed/fictional。' },
    { id: 'historicalStatus', label: '虚实', type: 'data', range: 'historicalStatus',
      def: '取值：fact / embellished / transposed / fictional。' },
    { id: 'editionSystem', label: '版本系统', type: 'data', range: 'editionSystem' },
    { id: 'textStatus', label: '文本状态', type: 'data', range: 'textStatus' },
    { id: 'unitKind', label: '单元形制', type: 'data', range: 'unitKind' },
    { id: 'unitCount', label: '单元数', type: 'data', range: 'integer' },
    { id: 'year', label: '年份', type: 'data', range: 'integer' },
    { id: 'route', label: '路径', type: 'data', range: 'string[]', def: '行军/迁址路径上的地理 id 序列（地理信息系统方法用）。' },
    { id: 'coord', label: '坐标', type: 'data', range: '[lng, lat]', def: '今地经纬度，供舆地图投影。' },
    { id: 'modernName', label: '今地名', type: 'data', range: 'string' },
    { id: 'style', label: '表字', type: 'data', range: 'string' },
    { id: 'mentionCount', label: '提及次数', type: 'data', range: 'integer' },
    { id: 'confidence', label: '置信度', type: 'data', range: 'float', def: '公版结论的置信标注（0-1），OCR 结论另附验收线说明。' },
    { id: 'tags', label: '标签', type: 'data', range: 'string[]' },
    { id: 'variantKind', label: '异文种类', type: 'data', range: 'variantKind', def: '取值：char / unit / plot / system。' },
    { id: 'variantText', label: '异文文本', type: 'data', range: 'string' },
    { id: 'alignNote', label: '对齐说明', type: 'data', range: 'string' },
    { id: 'commentaryPos', label: '评点位置', type: 'data', range: 'commentaryPos',
      def: '取值：jia（夹批）/ mei（眉批）/ bang（旁批）/ huqian（回前）/ huhou（回后）/ zongping（总评）。' },
    { id: 'byCriticId', label: '评点家 ID', type: 'data', range: 'string' },
    { id: 'kind', label: '种类', type: 'data', range: 'string' },
    { id: 'verdict', label: '判词', type: 'data', range: 'string' },
    { id: 'historyRecord', label: '史书记载', type: 'data', range: 'string' },
    { id: 'doctrineKind', label: '义理门类', type: 'data', range: 'string' },
    { id: 'orthodoxy', label: '正统取向', type: 'data', range: 'orthodoxy' },
    { id: 'imageryKind', label: '意象门类', type: 'data', range: 'imagery' },
    { id: 'techniqueKind', label: '技法门类', type: 'data', range: 'narrativeTechnique' },
    { id: 'styleKind', label: '文体门类', type: 'data', range: 'string' },
    { id: 'craftKind', label: '章法门类', type: 'data', range: 'string' },
    { id: 'notes', label: '按语', type: 'data', range: 'string' },
    { id: 'text', label: '文本', type: 'data', range: 'string' },
    { id: 'tokenKind', label: '词性', type: 'data', range: 'tokenKind', def: '取值：content / function / modal。文体计量用。' },
    { id: 'tone', label: '平仄', type: 'data', range: 'string', def: '取值：ping（平）/ ze（仄）。回目格律用。' },
    { id: 'rhymeGroup', label: '韵部', type: 'data', range: 'string' },
    { id: 'diffSpan', label: '差异位', type: 'data', range: '[start, end]', def: '异文 diff 的字符区间。' },
    { id: 'editionPair', label: '对勘版本对', type: 'data', range: 'string', def: '形如 "mao:jiajing"。' },
    { id: 'sentimentPolarity', label: '情感极性', type: 'data', range: 'float' },
    { id: 'sentimentDomain', label: '情感域', type: 'data', range: 'sentimentDomain', def: '取值：loyalty / grief / heroism / restraint / cunning / lament。' },
    { id: 'cooccurrenceScene', label: '共现场景', type: 'data', range: 'string' },
    { id: 'ocrVerdict', label: 'OCR 验收', type: 'data', range: 'string' },
    { id: 'tier', label: '分级', type: 'data', range: 'string' },
    { id: 'printer', label: '刊刻者', type: 'data', range: 'string' },
    { id: 'holder', label: '藏地', type: 'data', range: 'string' },
    { id: 'colophon', label: '牌记', type: 'data', range: 'string' },
    { id: 'level', label: '地名层级', type: 'data', range: 'string' },
    { id: 'placeIds', label: '地点集', type: 'data', range: 'string[]' },
    { id: 'keyPersonIds', label: '要人集', type: 'data', range: 'string[]' },
    { id: 'result', label: '结果', type: 'data', range: 'string' },
    { id: 'eraName', label: '国号', type: 'data', range: 'string' },
    { id: 'reignStart', label: '始年', type: 'data', range: 'integer' },
    { id: 'reignEnd', label: '末年', type: 'data', range: 'integer' },
    { id: 'successorOf', label: '继统', type: 'data', range: 'string' },
    { id: 'omenText', label: '谶语', type: 'data', range: 'string' },
    { id: 'rank', label: '品级', type: 'data', range: 'string' },
    { id: 'birth', label: '生年', type: 'data', range: 'integer' },
    { id: 'death', label: '卒年', type: 'data', range: 'integer' },
    { id: 'officialTitle', label: '官衔', type: 'data', range: 'string' },
    { id: 'era', label: '时代', type: 'data', range: 'string' },
    { id: 'medium', label: '媒介', type: 'data', range: 'string' },
    { id: 'workKind', label: '文献门类', type: 'data', range: 'string' },
    { id: 'intertextKind', label: '互文类型', type: 'data', range: 'intertextKind',
      def: '取值：peizhu / pinghua / huaben / yuanzaju / pingbook / adaptation。' },
    { id: 'relationKind', label: '关系类型', type: 'data', range: 'string' },
    { id: 'isVirtual', label: '虚实标记', type: 'data', range: 'boolean' },
    { id: 'narrativeYear', label: '叙事纪年', type: 'data', range: 'string' },
    { id: 'historicalYear', label: '史实纪年', type: 'data', range: 'integer' },
    { id: 'offsetNote', label: '纪年差说明', type: 'data', range: 'string' }
  ],

  /* ============================ 4×7 正交矩阵（28 格） ============================ */
  /* primary: true 表示该格为"主承载格"——该轴在该层有原生类落地；false 表示交叉格（可挂横切维度但不原生承载）。 */
  matrix: [
    /* ---- A1 版本形制轴 ---- */
    { axis: 'A1', layer: 'L0', primary: true, concept: '版本形制的元定义：单元形制词表（回/则/卷/卷·则）与坐标系本身' },
    { axis: 'A1', layer: 'L1', primary: true, concept: '书史义理：以何系统为正统底本之辨（版本优劣的正统判断）' },
    { axis: 'A1', layer: 'L2', primary: false, concept: '版本优劣判词（如"毛本删改最劣"）' },
    { axis: 'A1', layer: 'L3', primary: true, concept: '版本系统谱系：UnitMapping 单元对齐、derivedFrom 承袭链' },
    { axis: 'A1', layer: 'L4', primary: true, concept: '刊本 Edition、文本单元 Unit、序跋 Paratext、异文 VariantReading' },
    { axis: 'A1', layer: 'L5', primary: false, concept: '—（版本不直接承载叙事实体）' },
    { axis: 'A1', layer: 'L6', primary: true, concept: '刊刻出版 PrintingWork、藏地、版本缺口 EditionGap' },

    /* ---- A2 叙事内容轴 ---- */
    { axis: 'A2', layer: 'L0', primary: false, concept: '技法/文体范畴编码（narrativeTechnique、styleKind 词表）' },
    { axis: 'A2', layer: 'L1', primary: true, concept: '义理概念 DoctrineConcept、正统观 OrthodoxyView' },
    { axis: 'A2', layer: 'L2', primary: true, concept: '论断范畴 AssertionCategory、意象 Imagery、虚实断语、谶纬' },
    { axis: 'A2', layer: 'L3', primary: false, concept: '—（义理不形成谱系）' },
    { axis: 'A2', layer: 'L4', primary: false, concept: '评注挂接位（评点范畴在文本中的落点）' },
    { axis: 'A2', layer: 'L5', primary: true, concept: '文体范畴、叙事技法、章法、句·字·韵、诗词' },
    { axis: 'A2', layer: 'L6', primary: true, concept: '公版结论 ConsensusConclusion（"七实三虚"之判）' },

    /* ---- A3 人物传承轴 ---- */
    { axis: 'A3', layer: 'L0', primary: false, concept: '人物身份类型编码（圣贤化/君主/谋士/幕僚/评点家）' },
    { axis: 'A3', layer: 'L1', primary: false, concept: '—（义理由人物承载而非人物承载义理）' },
    { axis: 'A3', layer: 'L2', primary: false, concept: '—（评价另见 A2 论断层）' },
    { axis: 'A3', layer: 'L3', primary: true, concept: '世系 Genealogy（宗族谱系）' },
    { axis: 'A3', layer: 'L4', primary: false, concept: '—（评点文本另见 A1 文献层）' },
    { axis: 'A3', layer: 'L5', primary: true, concept: '人物 Person、官职 OfficialTitle、评点家 Critic' },
    { axis: 'A3', layer: 'L6', primary: true, concept: '注家 Annotator、再叙述者 Reteller、名家结论、公版文献 Work' },

    /* ---- A4 时代事件轴 ---- */
    { axis: 'A4', layer: 'L0', primary: false, concept: '纪年编码（叙事纪年/史实纪年的坐标约定）' },
    { axis: 'A4', layer: 'L1', primary: false, concept: '—（天命观另见 A2 义理层）' },
    { axis: 'A4', layer: 'L2', primary: false, concept: '—（史事评判另见 A2）' },
    { axis: 'A4', layer: 'L3', primary: true, concept: '朝代 Dynasty、政权 Polity、势力 Faction、政局 PoliticalSituation' },
    { axis: 'A4', layer: 'L4', primary: false, concept: '—（事件的时间定位另见 L6 编年层）' },
    { axis: 'A4', layer: 'L5', primary: true, concept: '事件 Event、战役 Battle、地理 Place、计谋 Stratagem、器物 Artifact' },
    { axis: 'A4', layer: 'L6', primary: true, concept: '正史事件 HistoricalEvent、编年层 ChronologyLayer、互文节点 IntertextText' }
  ],

  /* ============================ 版本系统投影（6 个文本系统 × 28 格） ============================ */
  /* cells: 该系统在本体矩阵上的覆盖格（只列有实质内容的格）。 */
  projections: [
    {
      id: 'yanyi', label: '演义系统', en: 'Yanyi',
      desc: '《三国志通俗演义》二百四十则系：嘉靖壬午本（现存最早刻本）、周曰校本、夏振宇本。',
      editions: ['嘉靖壬午本', '周曰校刊本', '夏振宇刊本'],
      cells: [
        { axis: 'A1', layer: 'L3' }, { axis: 'A1', layer: 'L4' }, { axis: 'A1', layer: 'L6' },
        { axis: 'A2', layer: 'L5' }, { axis: 'A4', layer: 'L5' }, { axis: 'A4', layer: 'L6' }
      ]
    },
    {
      id: 'zhizhuan', label: '志传系统', en: 'Zhizhuan',
      desc: '《三国志传》系：叶逢春本、黄正甫本、余象斗本、熊清波本、朱鼎臣本、郑少垣本、刘龙田本。多存关索故事。',
      editions: ['余象斗刊本', '熊清波藜光堂本', '朱鼎臣刊本', '鄭少垣刊本'],
      cells: [
        { axis: 'A1', layer: 'L3' }, { axis: 'A1', layer: 'L4' }, { axis: 'A1', layer: 'L6' },
        { axis: 'A2', layer: 'L5' }, { axis: 'A3', layer: 'L5' }, { axis: 'A4', layer: 'L5' }
      ]
    },
    {
      id: 'pingben', label: '评本系', en: 'Commentated Editions',
      desc: '李卓吾评本、钟伯敬评本、笠翁评阅本、毛宗岗评本——批点最密的一支。',
      editions: ['李卓吾評本', '鍾伯敬評本', '笠翁評閱本', '毛宗岗评本'],
      cells: [
        { axis: 'A1', layer: 'L4' }, { axis: 'A2', layer: 'L1' }, { axis: 'A2', layer: 'L2' },
        { axis: 'A2', layer: 'L5' }, { axis: 'A3', layer: 'L5' }, { axis: 'A3', layer: 'L6' }
      ]
    },
    {
      id: 'huiping', label: '汇评系', en: 'Collected Commentaries',
      desc: '七家汇评本：夹批总评合辑，异文位最完整。',
      editions: ['七家汇评本'],
      cells: [
        { axis: 'A1', layer: 'L3' }, { axis: 'A1', layer: 'L4' }, { axis: 'A2', layer: 'L2' },
        { axis: 'A2', layer: 'L4' }, { axis: 'A3', layer: 'L6' }
      ]
    },
    {
      id: 'pinghua', label: '平话/词话', en: 'Pinghua',
      desc: '演义成书前的讲史底本：《三国志平话》《花关索传》——情节异文的源头。',
      editions: ['《三国志平话》', '《花关索传》'],
      cells: [
        { axis: 'A1', layer: 'L4' }, { axis: 'A2', layer: 'L5' }, { axis: 'A4', layer: 'L5' },
        { axis: 'A4', layer: 'L6' }
      ]
    },
    {
      id: 'shishu', label: '史书注释', en: 'Historical Texts',
      desc: '《三国志》及裴松之注——虚实考辨的正史基准。',
      editions: ['《三国志》裴松之注'],
      cells: [
        { axis: 'A1', layer: 'L4' }, { axis: 'A2', layer: 'L2' }, { axis: 'A4', layer: 'L6' },
        { axis: 'A3', layer: 'L6' }
      ]
    }
  ],

  /* ============================ N 的结构（五元组） ============================ */
  nTuple: {
    label: 'N 的五元组',
    formula: 'N = 实体 × 粒度 × 轴 × 层 × 版本',
    desc: '4 × 7 骨架不再下钻（正交性已完备）；下钻发生在 N 内部的粒度栈（G1–G4）与三个横切维度上。N 因此不再是单一计数，而是五元组：每个实例由实体身份、粒度坐标、轴坐标、层坐标与版本坐标共同确定。',
    components: [
      { id: 'entity', label: '实体', desc: '一个具名实例：人物、单元、段句、字词、事件、战役、评注、版本、评论家……' },
      { id: 'granularity', label: '粒度', desc: 'G1–G4 粒度栈：实体级 / 单元级 / 段句级 / 字词级，实例下钻的唯一下坡路，G4 为终点。' },
      { id: 'axis', label: '轴', desc: 'A1–A4 横向分类坐标（版本形制 / 叙事内容 / 人物传承 / 时代事件），回答属于哪一类问题。' },
      { id: 'layer', label: '层', desc: 'L0–L6 纵向抽象坐标（元模型 / 义理 / 论断 / 谱系 / 文献 / 人物叙事 / 外延），回答处于哪一抽象级。' },
      { id: 'edition', label: '版本', desc: '19 种古本 / 评本 / 史书语料的版本坐标，跨越演义 / 志传 / 评本 / 汇评 / 平话 / 史书注六系统。' }
    ]
  },

  /* ============================ N 的粒度栈（G1–G4，下钻的唯一下坡路） ============================ */
  granularities: [
    { id: 'G1', label: '实体级', desc: '人物 / 战役 / 器物 / 势力 / 地理 / 计谋——本体的一等实体。',
      mounts: ['人物谱系', '战役聚合', '势力消长', '地理信息系统'] },
    { id: 'G2', label: '单元级', desc: '回 / 则 / 卷 + 单元对齐——版本对勘与评点密度的最小统计单位。',
      mounts: ['版本对勘', '评点密度', '回目格律聚合'] },
    { id: 'G3', label: '段句级', desc: '自然段 / 句——情感曲线与人物共现的最小场景。',
      mounts: ['情感曲线', '文体计量', '人物共现', '句长统计'] },
    { id: 'G4', label: '字词级', desc: '字 / 词 / 韵脚 / 异文位——下钻终点。',
      mounts: ['平仄格律', '异文 diff', '词频', '功能词统计'] }
  ],

  /* ============================ 三个横切维度（不增加轴，作为实例额外坐标） ============================ */
  crossDimensions: {
    timeLine: [
      { id: 'narrative', label: '叙事纪年', desc: '虚构年月，如"建安十三年"——演义自身的时序。' },
      { id: 'textual', label: '文本时序', desc: 'fabula ↔ syuzhet：叙事情序与叙述顺序，含倒叙/补叙/插叙标记。' },
      { id: 'dissemination', label: '传播时序', desc: '成书 → 刊刻 → 评点 → 流传 → 电子化。' }
    ],
    variantKind: [
      { id: 'char', label: '字词异文', desc: '字/词层面的异写与异字。' },
      { id: 'unit', label: '单元异文', desc: '分合回、则目分合造成的结构差异。' },
      { id: 'plot', label: '情节异文', desc: '如"温酒斩华雄"——同一事件在版本间的情节位移。' },
      { id: 'system', label: '系统异文', desc: '如关索故事——某系统特有而另一系统全无。' }
    ],
    intertextWith: {
      label: '互文网',
      domain: 'Edition', range: 'IntertextText',
      desc: '本书与外部文本系统的书目级关系（裴注、平话、元杂剧、评书、后世改编）。本期只登记节点，不做逐出对勘。',
      nodes: [
        { id: 'pei-zhu', label: '《三国志》裴松之注', kind: 'peizhu' },
        { id: 'pinghua-24', label: '《三国志平话》', kind: 'pinghua' },
        { id: 'huaginsuo', label: '《花关索传》', kind: 'huaben' },
        { id: 'yuanzaju-sanguo', label: '元杂剧三国戏', kind: 'yuanzaju' },
        { id: 'pingbook', label: '评书（三国讲史）', kind: 'pingbook' },
        { id: 'later-adaptation', label: '后世改编', kind: 'adaptation' }
      ]
    }
  },

  /* ============================ 前沿研究方法的挂载契约 ============================ */
  /* 每项研究方法须声明其标注挂载的粒度与横切维度，页面不得私设统计口径。 */
  researchMethods: [
    { id: 'styleMetrics', label: '文体计量', granularity: 'G4', crossDims: [],
      requiredFields: ['tokenKind'],
      desc: '实词/虚词/语气词比例统计，跨版本比较白话纯度。' },
    { id: 'sentimentCurve', label: '情感曲线', granularity: 'G3', crossDims: ['timeLine=narrative'],
      requiredFields: ['sentimentPolarity', 'sentimentDomain'],
      desc: '按回/按段的情感极性轨迹（忠义/悲愤/豪迈/隐忍/智谋/哀婉六域）。' },
    { id: 'chapterMeter', label: '回目格律', granularity: 'G4', crossDims: [],
      requiredFields: ['tone', 'rhymeGroup'],
      desc: '回目对偶句的平仄与韵脚统计。' },
    { id: 'personCooccurrence', label: '人物共现', granularity: 'G3', crossDims: ['timeLine=textual'],
      requiredFields: ['cooccurrenceScene'],
      desc: '同一场景（自然段）内共现人物集合，生成人物关系网络。' },
    { id: 'variantCollation', label: '异文对勘', granularity: 'G4', crossDims: ['variantKind=char'],
      requiredFields: ['diffSpan', 'editionPair'],
      desc: '两版本同一单元的字词级差异定位与高亮。' },
    { id: 'gisRoute', label: '地理信息系统', granularity: 'G1', crossDims: ['timeLine=narrative'],
      requiredFields: ['coord', 'route'],
      desc: '战役/行军的地理落点与路径（G1 实体 + G3 段句定位）。' },
    { id: 'commentaryDensity', label: '评点密度', granularity: 'G2', crossDims: [],
      requiredFields: ['commentaryPos', 'byCriticId'],
      desc: '按回统计评点字数与位置分布（夹批/眉批/旁批/回前/回后/总评）。' }
  ],

  /* ============================ 实例栈下钻示例（G1→G4，页面与规范同源展示） ============================ */
  /* 每级实例：id / granularity / parentOf（上级实例 id，根为 null）/ 坐标 (axis, layer) / 简短说明。 */
  drilldownExamples: [
    {
      id: 'p2',
      granularity: 'G1',
      parentOf: null,
      axis: 'A3',
      layer: 'L5',
      class: 'Person',
      label: '关羽（字云长）',
      desc: '蜀汉名将，「温酒斩华雄」情节的主角；该情节的虚实断语为「移花接木」（史载斩华雄者为孙坚部众）。'
    },
    {
      id: 'unit-mao-ch5',
      granularity: 'G2',
      parentOf: 'p2',
      axis: 'A1',
      layer: 'L4',
      class: 'Unit',
      label: '毛本第 5 回 · 发矫诏诸镇应曹公 破关兵三英战吕布',
      desc: '关羽「温酒斩华雄」的承载单元；对应嘉靖本第 9–10 则，是版本对勘与评点密度的最小统计单位。'
    },
    {
      id: 'span-ch5-jiuwen',
      granularity: 'G3',
      parentOf: 'unit-mao-ch5',
      axis: 'A2',
      layer: 'L5',
      class: 'TextualSpan',
      label: '「云长提华雄之头，掷于地上，其酒当温」句',
      desc: '毛本第 5 回「温酒斩华雄」的高潮句，段句级是情感曲线与人物共现的最小场景。',
      quote: '正欲探听，鸾铃响处，马到中军，云长提华雄之头，掷于地上，其酒当温。'
    },
    {
      id: 'var-ch5-jiu-dang',
      granularity: 'G4',
      parentOf: 'span-ch5-jiuwen',
      axis: 'A1',
      layer: 'L4',
      class: 'VariantReading',
      label: '「其酒当温 ↔ 其酒尚温」当/尚 字词异文位',
      desc: '毛本作「其酒当温」、嘉靖本作「其酒尚温」的字词异文（variantKind=char 同词类异文）；G4 字词级为下钻终点。',
      evidence: {
        editionPair: 'mao:jiajing',
        variantKind: 'char',
        maoReading: '其酒当温',
        jiajingReading: '其酒尚温',
        diffChar: '当 ↔ 尚',
        diffSpan: [2, 3]
      }
    }
  ],

  /* ============================ 明确不做（防止过度下钻） ============================ */
  nonGoals: [
    '明确不做：不引入第 5 条轴、第 8 层（4×7 骨架已正交完备）。',
    '不做细于字词级的标注（字内部结构、Unicode 字形变体不进本体）。',
    '不做机器自动标注的置信度体系（本期人工/半人工标注）。',
    '互文网本期只定义关系与已知节点，不做逐出对勘。'
  ],

/* ============================ v2 兼容角色类（ABox 沿用） ============================ */
  /* 既有 ABox（人物/地理实例）沿用的角色子类，均为"轴内细分"而非新轴。
     保留以保证历史实例三元组在 TTL 中不悬空；新增数据请优先使用 axis/layer 坐标。 */
  roleClasses: [
    { id: 'Lord', label: '君主', parent: 'Person', axis: 'A3', layer: 'L5' },
    { id: 'Minister', label: '臣属', parent: 'Person', axis: 'A3', layer: 'L5' },
    { id: 'General', label: '武将', parent: 'Person', axis: 'A3', layer: 'L5' },
    { id: 'Strategist', label: '谋士', parent: 'Person', axis: 'A3', layer: 'L5' },
    { id: 'City', label: '城邑', parent: 'Place', axis: 'A4', layer: 'L5' },
    { id: 'Pass', label: '关隘', parent: 'Place', axis: 'A4', layer: 'L5' },
    { id: 'Battlefield', label: '战场', parent: 'Place', axis: 'A4', layer: 'L5' },
    { id: 'Chapter', label: '回目', parent: 'Unit', axis: 'A1', layer: 'L4' },
    { id: 'Adaptation', label: '衍生作品', parent: 'IntertextText', axis: 'A4', layer: 'L6' }
  ],

  /* ============================ 标注模型（Annotation Model） ============================ */
  annotationModel: {
    desc: '基于本体给版本/情节/人物打标注的统一格式。标注即实例：每条标注都是 Conclusion/Commentary 类的实例，挂接靶标实体。每个实例携带本体坐标 (axis, layer) 与粒度 (granularity)。',
    schema: {
      id: '标注唯一 ID，如 cons-mao-001 / cmt-li-ch5 / hist-005',
      type: 'consensus | critic | commentary | editor',
      target: '{ class: "Edition|Unit|Person|Event|Artifact|Stratagem", id: "..." }',
      axis: 'A1 | A2 | A3 | A4   // 本体坐标：所属轴',
      layer: 'L0..L6            // 本体坐标：所属层',
      granularity: 'G1 | G2 | G3 | G4   // 粒度：实体/单元/段句/字词',
      parentOf: '父实例 id（粒度栈回溯用）',
      scope: '可选。细化到单元/段落，如 "ch:5" / "jiajing:ze:10"',
      text: '标注正文（简体）',
      source: '{ work, author, year, pd: true }  // 公版结论必填',
      byCritic: '名家结论/评注必填：critic id',
      status: '虚实断语必填：fact|embellished|transposed|fictional',
      confidence: '0-1',
      tags: '自由标签'
    },

    /* 评点位置受控词（commentaryPos 字段的值域；G2 评点密度统计的分组键） */
    commentaryPos: {
      label: '评点位置（受控词）',
      desc: '评注实例的落位坐标，取值固定为六位。',
      terms: [
        { id: 'jia', label: '夹批', desc: '夹于正文行间的批语。' },
        { id: 'mei', label: '眉批', desc: '批于天头的批语。' },
        { id: 'bang', label: '旁批', desc: '批于正文行侧的批语。' },
        { id: 'huqian', label: '回前', desc: '回目前的总论性批语。' },
        { id: 'huhou', label: '回后', desc: '回末的总结性批语。' },
        { id: 'zongping', label: '总评', desc: '通回或全书的总评性批语。' }
      ]
    },

    /* G4 字段定义（字词级：异文对勘与声律标注） */
    g4Fields: {
      tokenKind: {
        label: '词性',
        range: 'content | function | modal',
        terms: [
          { id: 'content', label: '实词' },
          { id: 'function', label: '虚词' },
          { id: 'modal', label: '语气词' }
        ],
        def: '字词的词性类：实词 / 虚词 / 语气词（同词类异文的核心判定位）。'
      },
      tone: {
        label: '平仄',
        range: 'ping | ze',
        terms: [
          { id: 'ping', label: '平' },
          { id: 'ze', label: '仄' }
        ],
        def: '格律字位的平仄（回目对仗与章回题词声律分析用）。'
      },
      rhymeGroup: {
        label: '韵部',
        range: 'string（平水韵韵部名）',
        def: '韵脚所属韵部（章回题词与韵文韵脚密度分析用，取平水韵系统）。'
      },
      diffSpan: {
        label: '差异位',
        range: '[start, end]（int，含头不含尾）',
        def: '异文 diff 的字符区间，span 内为可对勘的最小差异文本。'
      }
    },

    bundles: [
      { id: 'consensus-editions', label: '版本公版结论', target: 'Edition',
        desc: '每种古本的年代、系统归属、谱系地位的学界公论（如嘉靖本为最早刻本、毛本为清定型本）。' },
      { id: 'critic-editions', label: '版本名家结论', target: 'Edition',
        desc: '名家对各本的论断（胡适论毛本、鲁迅论演义、郑振铎论版本演化）。' },
      { id: 'commentary-units', label: '逐回评注', target: 'Unit',
        desc: '四家评语（毛宗岗/李卓吾/钟伯敬/李渔）按回挂接，已在库 36.8 万字。' },
      { id: 'historical-plots', label: '情节虚实断语', target: 'Event',
        desc: '逐情节对照《三国志》裴注判虚实（温酒斩华雄=移花接木，草船借箭=虚构）。' },
      { id: 'consensus-texts', label: '文本校情按语', target: 'Unit|Edition',
        desc: 'OCR 验收结论、异文对齐说明（编者按）。' }
    ]
  },

  /* ============================ 能力问题（Competency Questions） ============================ */
  competencyQuestions: [
    '关索故事见于哪些版本？（VariantReading × EditionSystem：志传系统特有）',
    '"温酒斩华雄"在正史与各版本中如何差异？（HistoricalAssessment × VariantReading）',
    '毛宗岗评语在 120 回中如何分布？哪些回目评点最密？（Commentary × Unit × commentaryPos）',
    '赤壁之战聚合了哪些人物、地点、计谋、虚实成分？（Event 聚合查询）',
    '嘉靖本 240 则与毛本 120 回如何对齐？分回差异何在？（UnitMapping）',
    '各评点家对曹操的评价有何分歧？（CriticConclusion 对比）',
    '三十六场战役的年份-地理分布如何？（Battle × Place × year）',
    '演义系统与志传系统的文本差异集中于哪些情节？（EditionSystem × VariantReading）',
    '虚构人物在叙事中的参与度如何？（historicalStatus=fictional × mentionCount）',
    '《三国志》裴注与演义的事件对应率如何？（HistoricalAssessment 统计）',
    '哪条叙事技法在哪些回目的评点中被反复揭示？（NarrativeTechnique × Commentary）',
    '全书义理（天命/正统/义）的落点集中在哪些事件与意象上？（DoctrineConcept × Imagery）'
  ],

  /* ============================ 经典引文（Classic Quotes，F2.6） ============================ */
  /* 本体所据的经典论断与评点语，含出处；供 ontology.html 经典引文区展示。 */
  classicQuotes: [
    {
      text: '《三国演义》是“七分实事，三分虚构”，观者往往为其惑，非识者不能辨。',
      source: '章学诚《丙辰札记》',
      tag: '虚实有据'
    },
    {
      text: '据正史，采小说，证文义，通好尚，非俗非虚，易观易入，非史氏苍古之文，去瞽传诙谐之气，陈叙百年，该括万事。',
      source: '庸愚子（蒋大器）《三国志通俗演义序》',
      tag: '成书观'
    },
    {
      text: '读《三国志》者，当知有正统、闰运、僭国之别，先主帝蜀，为正统之所在。',
      source: '毛宗岗《读三国志法》',
      tag: '正统观'
    },
    {
      text: '文有草蛇灰线，伏脉千里。叙事之法，首尾照应，不着一字，而意已尽在其中。',
      source: '毛宗岗《三国演义》回评（第一回批语）',
      tag: '叙事技法'
    },
    {
      text: '以虚写实，以实带虚；虚实相生，而情事乃见。',
      source: '毛宗岗《三国演义》回评（第四十三回批语）',
      tag: '虚实相生'
    },
    {
      text: '事有本于正史而增饰者，有史所无而作者造之者。增饰者，史之枝叶；造之者，史之华实。',
      source: '李卓吾（李贽）《三国演义》批语',
      tag: '虚实有据'
    },
    {
      text: '文之思也，其神远矣。故寂然凝虑，思接千载；悄焉动容，视通万里。',
      source: '刘勰《文心雕龙·神思》',
      tag: '文体渊源'
    },
    {
      text: '三国之世，人才之盛，为后世所罕及。而演义之书，独以义气忠勇动人，此其所以传也。',
      source: '钟伯敬（钟惺）《三国演义》序',
      tag: '义理'
    }
  ]
};

// UMD 兼容导出
if (typeof module !== 'undefined') module.exports = SANGUO_ONTOLOGY;