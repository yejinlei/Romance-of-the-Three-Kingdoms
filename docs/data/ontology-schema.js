/**
 *《三国演义》深度本体论 · 规范文件（Schema v2）
 *
 * 本体以库内古本为文献基础：嘉靖壬午本（1522）、周曰校刊本（1591）、余象斗刊本（1592）、
 * 黄正甫本、熊清波本、叶逢春本、夏振宇本、朱鼎臣本、郑少垣本、刘龙田本、
 * 李卓吾评本、钟伯敬评本、笠翁评阅本、毛宗岗评本、七家汇评本、
 * 《三国志平话》《花关索传》以及《三国志》裴松之注。
 *
 * 设计原则：
 *  1. 四层分离：文献层（版本文本）→ 叙事层（故事实体）→ 评注层（评点）→ 结论层（学术论断）。
 *  2. 虚实是标注维度而非排除标准：虚构实体（如貂蝉、关索）同样是一等公民，挂虚实标签保留。
 *  3. 结论分三级：公版结论（学界公论，出自公版文献）/ 名家结论（具名学者论断）/ 评注（逐段批点）。
 *  4. 版本对齐：各本单元（回/则/卷）通过 UnitMapping 互相对齐，异文挂接于对齐单元上。
 */
const SANGUO_ONTOLOGY = {

  meta: {
    id: 'sanguo-ontology',
    title: '《三国演义》深度本体论',
    subtitle: 'Romance of the Three Kingdoms Deep Ontology',
    iri: 'https://example.org/sanguo#',
    prefix: 'sg:',
    version: '2.0',
    updated: '2026-11-25',
    formalism: 'OWL 2 DL 兼容；本文件为可执行规范，docs/sanguo-ontology.ttl 为序列化产物',
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
    }
  },

  /* ============================ 四层结构 ============================ */
  layers: [
    { id: 'textus', order: 1, label: '文献层', en: 'Textus', desc: '版本、文本单元、序跋凡例、异文、缺口——回答"哪本书、哪一回、什么字"。' },
    { id: 'fabula', order: 2, label: '叙事层', en: 'Fabula', desc: '人物、势力、地理、战役、事件、计谋、器物、诗词、谶纬——回答"谁、何时、何地、做了什么"。' },
    { id: 'scholia', order: 3, label: '评注层', en: 'Scholia', desc: '评点家、评注、读法——回答"古人怎么批"。' },
    { id: 'iudicium', order: 4, label: '结论层', en: 'Iudicium', desc: '公版结论、名家结论、虚实断语——回答"学界怎么看、虚实如何判"。' }
  ],

  /* ============================ 类（Classes） ============================ */
  classes: [
    /* ---- 文献层 ---- */
    { id: 'Edition', label: '版本/刊本', layer: 'textus', estCount: 19,
      def: '一种独立刊刻或整理的《三国演义》相关文本实体。',
      props: ['editionSystem', 'unitKind', 'unitCount', 'year', 'printer', 'holder', 'textStatus', 'derivedFrom', 'hasParatext', 'hasUnit'],
      examples: ['嘉靖壬午本', '毛宗岗评本', '余象斗刊本'] },
    { id: 'Unit', label: '文本单元（回/则/卷）', layer: 'textus', estCount: 2400,
      def: '版本内部的叙事切分单位。不同版本单元数不同（120 回 / 240 则 / 180 则），通过 UnitMapping 互相对齐。',
      props: ['inEdition', 'narrates', 'mentions', 'mapsTo', 'hasCommentary', 'isVirtual'],
      examples: ['毛本第 5 回', '嘉靖本第 10 则'] },
    { id: 'UnitMapping', label: '单元对齐', layer: 'textus', estCount: 240,
      def: '跨版本单元对齐关系：以毛本 120 回为主干，映射嘉靖本 240 则、志传本则目。回目分合差异（如嘉靖一则=毛本半回）以此表达。',
      props: ['mapsFrom', 'mapsTo', 'alignNote'] },
    { id: 'Paratext', label: '序跋/凡例/读法', layer: 'textus', estCount: 10,
      def: '卷首卷末的非叙事文本：序、引、凡例、读法、宗僚表。',
      props: ['inEdition', 'authoredBy'],
      examples: ['毛宗岗本序', '读三国志法', '嘉靖本序引宗僚'] },
    { id: 'VariantReading', label: '异文', layer: 'textus', estCount: 200,
      def: '同一叙事单元在不同版本中的文字/情节差异。按差异性质分：字词异文、情节增删（如关索故事）、分回差异。',
      props: ['occursIn', 'variantKind', 'variantText', 'annotatedBy'] },
    { id: 'EditionGap', label: '版本缺口', layer: 'textus', estCount: 13,
      def: '已著录而文本未获/不全的版本及其获取状态（影印、OCR 验收结论）。',
      props: ['forEdition', 'tier', 'holder', 'ocrVerdict'],
      examples: ['杨美生本（确实拿不到）', '周曰校本 OCR 试点（0.48，未达 97% 验收线）'] },

    /* ---- 叙事层 ---- */
    { id: 'Person', label: '人物', layer: 'fabula', estCount: 200,
      def: '演义叙事中的人物。含史实人物与虚构人物，一律以 historicalStatus 标注虚实，不排除虚构者。',
      props: ['style', 'faction', 'nativePlace', 'birth', 'death', 'officialTitle', 'mentionCount', 'historicalStatus', 'kinOf', 'masterOf', 'participatesIn'],
      examples: ['刘备（史实）', '貂蝉（虚构）', '关索（虚构/志传系统特有）'] },
    { id: 'Faction', label: '势力', layer: 'fabula', estCount: 12,
      def: '政治军事集团：蜀汉、曹魏、东吴、群雄、汉室等。',
      props: ['ruler', 'capital', 'members', 'territory'],
      examples: ['蜀汉', '曹魏', '东吴'] },
    { id: 'Polity', label: '政权', layer: 'fabula', estCount: 6,
      def: '具名号的国家实体（魏蜀吴及汉、晋），与 Faction 区分：Faction 为势力班底，Polity 为正统名号。',
      props: ['eraName', 'foundedBy'] },
    { id: 'Place', label: '地理', layer: 'fabula', estCount: 66,
      def: '州郡县、关隘、山川、城邑。含古今地名对照与经纬度。',
      props: ['level', 'modernName', 'coord', 'battleAt', 'capitalOf'],
      examples: ['洛阳', '赤壁', '五丈原'] },
    { id: 'Battle', label: '战役', layer: 'fabula', estCount: 36,
      def: '具名战役。含年份、地点、参战人物、结果与虚实标注。',
      props: ['year', 'placeIds', 'keyPersonIds', 'result', 'historicalStatus'],
      examples: ['官渡之战', '赤壁之战', '夷陵之战'] },
    { id: 'Event', label: '事件', layer: 'fabula', estCount: 120,
      def: '具名情节单元（桃园结义、三顾茅庐、白帝托孤……），可跨回目。',
      props: ['year', 'persons', 'places', 'kind', 'historicalStatus', 'narratedIn'],
      examples: ['桃园结义', '温酒斩华雄（移花接木）'] },
    { id: 'Stratagem', label: '计谋', layer: 'fabula', estCount: 40,
      def: '具名计谋单元，含使用者、对象、结果。',
      props: ['usedBy', 'targetOf', 'result', 'kind', 'historicalStatus'],
      examples: ['连环计', '空城计（虚构）', '草船借箭（虚构）'] },
    { id: 'Artifact', label: '器物', layer: 'fabula', estCount: 30,
      def: '兵器、坐骑、印玺、信物等。演义多夸张虚构，须标虚实。',
      props: ['kind', 'owner', 'historicalStatus'],
      examples: ['青龙偃月刀', '赤兔马', '传国玉玺'] },
    { id: 'Poem', label: '诗词', layer: 'fabula', estCount: 40,
      def: '回中诗词赞语（"后人有诗赞曰"类）。',
      props: ['author', 'inUnit', 'text'] },
    { id: 'Prophecy', label: '谶纬', layer: 'fabula', estCount: 12,
      def: '童谣、谶语、梦兆及其应验。',
      props: ['prophet', 'foretells', 'omenText'] },
    { id: 'OfficialTitle', label: '官职', layer: 'fabula', estCount: 60,
      def: '官爵名号，供人物任职链查询。',
      props: ['heldBy', 'rank'] },
    { id: 'Genealogy', label: '世系', layer: 'fabula', estCount: 20,
      def: '宗族谱系（刘汉宗亲、曹氏夏侯、孙氏吴郡……）。',
      props: ['members', 'ancestor'] },

    /* ---- 评注层 ---- */
    { id: 'Critic', label: '评点家', layer: 'scholia', estCount: 8,
      def: '评点者/史家：毛宗岗、李卓吾、钟伯敬、李渔、金圣叹、陈寿、裴松之、鲁迅等。',
      props: ['era', 'works', 'hasConclusion', 'hasCommentary'],
      examples: ['毛宗岗（评语 206,093 字）', '李卓吾（48,870 字）', '钟伯敬（44,894 字）', '李渔（67,674 字）'] },
    { id: 'Commentary', label: '评注', layer: 'scholia', estCount: 6000,
      def: '逐回批点文字。四家评语辑录共 36.8 万字，另有七家汇评本夹批总评 105 万字待接入。',
      props: ['byCritic', 'onUnit', 'onText', 'kind'],
      examples: ['毛宗岗第一回回前评', '李卓吾夹批'] },
    { id: 'ReadingMethod', label: '读法', layer: 'scholia', estCount: 3,
      def: '通论性批评文本：《读三国志法》等。',
      props: ['byCritic', 'text'] },

    /* ---- 结论层 ---- */
    { id: 'ConsensusConclusion', label: '公版结论', layer: 'iudicium', estCount: 60,
      def: '学界公论，出自公版（PD）学术文献，须著明出处。如：嘉靖壬午本为现存最早刻本；演义"七实三虚"；志传系统多存关索故事。',
      props: ['about', 'source', 'confidence', 'tags'] },
    { id: 'CriticConclusion', label: '名家结论', layer: 'iudicium', estCount: 120,
      def: '具名学者/评点家的论断。如胡适评毛宗岗"不是批评家，乃是改作家"；鲁迅论三国"描写过实"。',
      props: ['about', 'byCritic', 'source', 'tags'] },
    { id: 'HistoricalAssessment', label: '虚实断语', layer: 'iudicium', estCount: 80,
      def: '具体情节/人物的虚实判词，取值受控于 historicalStatus 词表，附正史对照说明。',
      props: ['about', 'status', 'historyRecord', 'verdict'] }
  ],

  /* ============================ 属性（Properties） ============================ */
  properties: [
    /* 对象属性 */
    { id: 'derivedFrom', label: '承袭自', type: 'object', domain: 'Edition', range: 'Edition',
      def: '版本谱系承袭关系：毛宗岗评本 ← 李卓吾评本 ← 嘉靖壬午本。' },
    { id: 'mapsTo', label: '单元对齐', type: 'object', domain: 'Unit', range: 'Unit', def: '跨版本单元映射（经 UnitMapping）。' },
    { id: 'hasParatext', label: '卷首文本', type: 'object', domain: 'Edition', range: 'Paratext' },
    { id: 'occursIn', label: '异文见于', type: 'object', domain: 'VariantReading', range: 'Edition' },
    { id: 'faction', label: '所属势力', type: 'object', domain: 'Person', range: 'Faction' },
    { id: 'ruler', label: '君主', type: 'object', domain: 'Faction', range: 'Person' },
    { id: 'kinOf', label: '亲缘', type: 'object', domain: 'Person', range: 'Person', def: '父子/兄弟/婚姻/宗亲。' },
    { id: 'masterOf', label: '师承', type: 'object', domain: 'Person', range: 'Person' },
    { id: 'participatesIn', label: '参与', type: 'object', domain: 'Person', range: 'Event' },
    { id: 'foughtAt', label: '战于', type: 'object', domain: 'Battle', range: 'Place' },
    { id: 'narratedIn', label: '叙于', type: 'object', domain: 'Event', range: 'Unit' },
    { id: 'foretells', label: '预言', type: 'object', domain: 'Prophecy', range: 'Event' },
    { id: 'byCritic', label: '评点者', type: 'object', domain: 'Commentary', range: 'Critic' },
    { id: 'onUnit', label: '批于', type: 'object', domain: 'Commentary', range: 'Unit' },
    { id: 'about', label: '论及', type: 'object', domain: 'ConsensusConclusion', range: '*', def: '结论的靶标：版本/人物/事件/情节皆可。' },
    { id: 'source', label: '出处', type: 'object', domain: 'ConsensusConclusion', range: 'Work', def: '结论所本的公版文献。' },

    /* 数据属性 */
    { id: 'historicalStatus', label: '虚实', type: 'data', range: 'historicalStatus',
      def: '取值：fact / embellished / transposed / fictional。' },
    { id: 'editionSystem', label: '版本系统', type: 'data', range: 'editionSystem' },
    { id: 'textStatus', label: '文本状态', type: 'data', range: 'textStatus' },
    { id: 'unitKind', label: '单元形制', type: 'data', range: 'unitKind' },
    { id: 'unitCount', label: '单元数', type: 'data', range: 'integer' },
    { id: 'year', label: '年份', type: 'data', range: 'integer' },
    { id: 'coord', label: '坐标', type: 'data', range: '[lng, lat]', def: '今地经纬度，供舆地图投影。' },
    { id: 'modernName', label: '今地名', type: 'data', range: 'string' },
    { id: 'style', label: '表字', type: 'data', range: 'string' },
    { id: 'mentionCount', label: '提及次数', type: 'data', range: 'integer' },
    { id: 'confidence', label: '置信度', type: 'data', range: 'float', def: '公版结论的置信标注（0-1），OCR 结论另附验收线说明。' },
    { id: 'tags', label: '标签', type: 'data', range: 'string[]' }
  ],

  /* ============================ 标注模型（Annotation Model） ============================ */
  annotationModel: {
    desc: '基于本体给版本/情节/人物打标注的统一格式。标注即实例：每条标注都是 Conclusion/Commentary 类的实例，挂接靶标实体。',
    schema: {
      id: '标注唯一 ID，如 cons-mao-001 / cmt-li-ch5 / hist-005',
      type: 'consensus | critic | commentary | editor',
      target: '{ class: "Edition|Unit|Person|Event|Artifact|Stratagem", id: "..." }',
      scope: '可选。细化到单元/段落，如 "ch:5" / "jiajing:ze:10"',
      text: '标注正文（简体）',
      source: '{ work, author, year, pd: true }  // 公版结论必填',
      byCritic: '名家结论/评注必填：critic id',
      status: '虚实断语必填：fact|embellished|transposed|fictional',
      confidence: '0-1',
      tags: '自由标签'
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
    '毛宗岗评语在 120 回中如何分布？哪些回目评点最密？（Commentary × Unit）',
    '赤壁之战聚合了哪些人物、地点、计谋、虚实成分？（Event 聚合查询）',
    '嘉靖本 240 则与毛本 120 回如何对齐？分回差异何在？（UnitMapping）',
    '各评点家对曹操的评价有何分歧？（CriticConclusion 对比）',
    '三十六场战役的年份-地理分布如何？（Battle × Place × year）',
    '演义系统与志传系统的文本差异集中于哪些情节？（EditionSystem × VariantReading）',
    '虚构人物在叙事中的参与度如何？（historicalStatus=fictional × mentionCount）',
    '《三国志》裴注与演义的事件对应率如何？（HistoricalAssessment 统计）'
  ]
};

// UMD 兼容导出
if (typeof module !== 'undefined') module.exports = SANGUO_ONTOLOGY;
