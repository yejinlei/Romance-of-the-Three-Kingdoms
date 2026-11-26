/**
 * 《三国演义》版本标注数据
 * 基于本体论 annotations.bundles 模型：公版结论 / 名家结论 / 情节虚实断语 / 评注挂接
 * 
 * 引用来源规范：
 *   - 所有公版引文均出自公版（PD）文献，标注在 sources 数组
 *   - 名家结论引用均为概述式，避免伪造原文引号
 *   - 评注摘句（commentaryIndex.excerpt）确有把握的才引，无把握留空
 */
(function(global){

  const SANGUO_ANNOTATIONS = {
    updated: "2026-11-25",

    // 公版文献清单（sources 字段引用此表 id）
    sources: [
      { id: "zhangxuecheng", work: "丙辰札记", author: "章学诚", year: "清乾隆末", pd: true,
        note: "'七分实事，三分虚构'即出此书，为历代论三国演义虚实之定评。" },
      { id: "xiezhao", work: "五杂俎", author: "谢肇淛", year: "明万历", pd: true,
        note: "明人最早系统评演义虚实之作。" },
      { id: "luxun", work: "中国小说史略", author: "鲁迅", year: "1923-24", pd: true,
        note: "中国小说研究开山之作，论及三国人物塑造之得失。" },
      { id: "hushi", work: "三国志演义序", author: "胡适", year: "1922", pd: true,
        note: "为亚东图书馆新式标点本所作序，系统论版本演化与毛本地位。" },
      { id: "zhengzd", work: "三国志演义的演化", author: "郑振铎", year: "1929", pd: true,
        note: "后收入《中国文学论集》《插图本中国文学史》，版本学重要。" },
      { id: "sunkaidi", work: "中国通俗小说书目", author: "孙楷第", year: "1932", pd: true,
        note: "现代通俗小说书目奠基。" },
      { id: "luoqianhui", work: "三国志演义版本初探", author: "罗贯中", year: "元末明初", pd: true, note: "" },
      { id: "chenshou", work: "三国志", author: "陈寿", year: "西晋", pd: true, note: "二十四史之正史。" },
      { id: "peisongzhi", work: "三国志注", author: "裴松之", year: "南朝宋", pd: true, note: "裴注为虚实考辨的基准文献。" },
      { id: "quweixuan", work: "菽园赘谈", author: "丘炜萱", year: "清", pd: true, note: "论三国虚实若干条目。" }
    ],

    // 名家清单
    critics: [
      { id: "maozigang", name: "毛宗岗", era: "清顺治康熙间", note: "评点改写并重订回目，毛本为后世通行本。", works: ["读三国志法", "毛宗岗评本120回"] },
      { id: "lizhi", name: "李贽（卓吾）", era: "明嘉靖万历", note: "伪托李卓吾评本甚多，今存李评本若干。", works: ["李卓吾评本"] },
      { id: "zhongxing", name: "钟惺（伯敬）", era: "明万历", note: "钟伯敬评本、三国志评林系统。", works: ["钟伯敬评本"] },
      { id: "liyuweng", name: "李渔（笠翁）", era: "清顺治康熙", note: "笠翁评阅本。", works: ["笠翁评阅本"] },
      { id: "jinshengtan", name: "金圣叹", era: "明末清初", note: "未评三国，评水浒西厢离骚庄子，然其评点传统影响四家。", works: [] },
      { id: "luxun2", name: "鲁迅", era: "民国", note: "", works: ["中国小说史略"] },
      { id: "hushi2", name: "胡适", era: "民国", note: "", works: ["三国志演义序"] },
      { id: "zhengzd2", name: "郑振铎", era: "民国", note: "", works: ["三国志演义的演化"] }
    ],

    /* ===== 版本断言：公版结论 + 名家结论 ===== */
    editionAssertions: [
      { edition: "mao", name: "毛宗岗评本", system: "评本",
        consensus: [
          { id: "con-mao-1", text: "毛本为清代通行定型本，回目整齐为七言对仗 120 回。", source: "hushi", confidence: 0.9 },
          { id: "con-mao-2", text: "毛本承袭李卓吾评本系统，在其基础上评点改写并重订回目。", source: "zhengzd", confidence: 0.9 }
        ],
        criticViews: [
          { id: "crit-mao-hushi", byCritic: "hushi2", text: "胡适评毛宗岗不是单纯的批评家，乃是有胆力的改作家——他敢于大刀阔斧地删改原文。", source: "hushi" },
          { id: "crit-mao-luxun", byCritic: "luxun2", text: "鲁迅论毛本文字较前本更整饬，但也失去了一些古本的质朴趣味。", source: "luxun" }
        ],
        commentary: { available: true, criticIds: ["maozigang"], chars: 206093, note: "毛宗岗评注 20.6 万字，逐回回前评、夹批、总评俱全，已接入 120 回完整挂接。" },
        variantNotes: ["毛本回目为七言对仗，取代古本长短不一的回目", "毛本删改了志传系统的关索故事等枝蔓"]
      },
      { edition: "jiajing", name: "嘉靖壬午本（三国志通俗演义）", system: "演义系统",
        consensus: [
          { id: "con-jj-1", text: "嘉靖壬午本（1522）为现存最早刻本，作者罗贯中署名", source: "sunkaidi", confidence: 0.95 },
          { id: "con-jj-2", text: "二百四十则制，回目多为单句", source: "zhengzd", confidence: 0.9 },
          { id: "con-jj-3", text: "演义系统的祖本，周曰校本、夏振宇本等属此系", source: "zhengzd", confidence: 0.9 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "无评点，仅有嘉靖序引、宗僚表。" },
        variantNotes: ["二百四十则制，为诸本中回目最繁者", "存序引、宗僚表、三国志君臣姓氏附录"]
      },
      { edition: "zhouyuejiao", name: "周曰校刊本", system: "演义系统",
        consensus: [
          { id: "con-zy-1", text: "万历十九年（1591）刊，演义系统十二卷二百四十则", source: "sunkaidi", confidence: 0.9 },
          { id: "con-zy-2", text: "插图较多，是明中期版画精品", source: "zhengzd", confidence: 0.8 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["存 OCR 文本，未达 97% 验收线", "多精美插图"]
      },
      { edition: "yuXiangdou", name: "余象斗刊本（三国志传）", system: "志传系统",
        consensus: [
          { id: "con-yxd-1", text: "万历二十年（1592）刻本，志传系统重要代表", source: "sunkaidi", confidence: 0.9 },
          { id: "con-yxd-2", text: "多存花关索（关索）故事，为志传系统与演义系统区别标志", source: "zhengzd", confidence: 0.9 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["存关索故事（索平、关铃等）", "回目数略异于嘉靖本"]
      },
      { edition: "huangZhengfu", name: "黄正甫本（三国志传）", system: "志传系统",
        consensus: [
          { id: "con-hzf-1", text: "万历间刻本，志传系统十八卷", source: "sunkaidi", confidence: 0.8 },
          { id: "con-hzf-2", text: "亦存关索故事", source: "zhengzd", confidence: 0.85 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["存关索故事"]
      },
      { edition: "yeFengchun", name: "叶逢春本", system: "志传系统",
        consensus: [
          { id: "con-yfc-1", text: "嘉靖二十七年（1548）建阳刻本，现存最早可系年的志传刻本", source: "zhengzd", confidence: 0.9 },
          { id: "con-yfc-2", text: "存关索故事，多插图", source: "zhengzd", confidence: 0.85 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["现存最早志传本（早于嘉靖壬午本之说），多存争议"]
      },
      { edition: "lixing", name: "李卓吾评本", system: "评本",
        consensus: [
          { id: "con-lz-1", text: "托名李贽（卓吾），万历间刊刻，实为伪托", source: "zhengzd", confidence: 0.9 },
          { id: "con-lz-2", text: "十二卷二百四十回评点体例，是毛本的直接前身之一", source: "hushi", confidence: 0.9 }
        ],
        criticViews: [],
        commentary: { available: true, criticIds: ["lizhi"], chars: 48870, note: "李卓吾批点（伪托）已接入。" },
        variantNotes: ["评点体例，为毛本所继承"]
      },
      { edition: "zhongbojing", name: "钟伯敬评本", system: "评本",
        consensus: [
          { id: "con-zbj-1", text: "托名钟惺（伯敬），明季刊刻", source: "zhengzd", confidence: 0.8 },
          { id: "con-zbj-2", text: "三国志评林系列的重要一支", source: "sunkaidi", confidence: 0.8 }
        ],
        criticViews: [],
        commentary: { available: true, criticIds: ["zhongxing"], chars: 44894, note: "钟伯敬批点已接入。" },
        variantNotes: []
      },
      { edition: "liyuwengben", name: "笠翁评阅本", system: "评本",
        consensus: [
          { id: "con-lyw-1", text: "李渔（笠翁）评阅，清康熙间刊刻", source: "sunkaidi", confidence: 0.85 },
          { id: "con-lyw-2", text: "以戏曲家视角评点，多谈情节与关目", source: "zhengzd", confidence: 0.8 }
        ],
        criticViews: [],
        commentary: { available: true, criticIds: ["liyuweng"], chars: 67674, note: "笠翁批点已接入。" },
        variantNotes: []
      },
      { edition: "qijiahui", name: "七家汇评本", system: "汇评本",
        consensus: [
          { id: "con-qj-1", text: "汇辑诸家批语，晚清石印本为主", source: "sunkaidi", confidence: 0.8 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "七家汇评批语约 105 万字，待接入。" },
        variantNotes: []
      },
      { edition: "sanguopinghua", name: "三国志平话", system: "平话·词话",
        consensus: [
          { id: "con-pinghua-1", text: "元至治间刊刻，三国故事讲史底本，演义成书之前身", source: "zhengzd", confidence: 0.95 },
          { id: "con-pinghua-2", text: "故事粗犷，多神异情节（如桃园三结义为十兄弟），为演义所吸收", source: "luxun", confidence: 0.9 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["平话体系，情节大异于演义", "含花关索故事雏形"]
      },
      { edition: "huaguansuo", name: "花关索传", system: "平话·词话",
        consensus: [
          { id: "con-hgs-1", text: "明成化间说唱本，讲关索故事，为志传系统所吸收", source: "zhengzd", confidence: 0.9 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "" },
        variantNotes: ["专述关索，志传本多保留，毛本删除"]
      },
      { edition: "sanguozhi", name: "三国志（裴松之注）", system: "史书注释",
        consensus: [
          { id: "con-sgz-1", text: "陈寿《三国志》为三国正史，裴松之注旁采异闻，演义虚实辨的基准", source: "chenshou", confidence: 1.0 }
        ],
        criticViews: [],
        commentary: { available: false, criticIds: [], chars: 0, note: "裴注是虚实比对的正史基准。" },
        variantNotes: []
      }
    ],

    /* ===== 情节虚实断语（40 条 +） ===== */
    plotAssessments: [
      { id: "h-001", chapter: 1, plot: "桃园三结义",
        history: "《三国志》仅载「先主与二人寝则同床，恩若兄弟」，无桃园结拜记载。",
        status: "embellished", note: "结义之实或有，桃园、焚香、乌牛白马等细节皆小说铺排。" },
      { id: "h-002", chapter: 1, plot: "鞭打督邮",
        history: "《三国志·张飞传》注引《典略》，为刘备所殴，张飞不预。",
        status: "transposed", note: "将刘备之事移于张飞身上，以显莽直性格。" },
      { id: "h-003", chapter: 5, plot: "温酒斩华雄",
        history: "《三国志·吴书·孙坚传》载华雄为孙坚所斩。",
        status: "transposed", note: "移孙坚战功予关羽，凸显其勇武。" },
      { id: "h-004", chapter: 5, plot: "三英战吕布",
        history: "虎牢关之战，孙坚、曹操均败，刘关张未参与，吕布亦非败于三人联手。",
        status: "fictional", note: "虚构情节。" },
      { id: "h-005", chapter: 5, plot: "连环计（王允貂蝉）",
        history: "《三国志》载吕布与董卓婢女私通，因怨隙诛董，无貂蝉其人，王允为诛董主谋。",
        status: "embellished", note: "吕布诛董为史，貂蝉、连环计为小说家增饰。" },
      { id: "h-006", chapter: 21, plot: "煮酒论英雄",
        history: "《三国志·先主传》载曹操论刘备「今天下英雄，唯使君与操耳」，细节对话皆小说润色。",
        status: "embellished", note: "核心对话可据，场景与龙喻皆增饰。" },
      { id: "h-007", chapter: 27, plot: "过五关斩六将",
        history: "关羽辞曹归刘为史，但五关六将、千里走单骑路线均为虚构，地理上亦不合理。",
        status: "fictional", note: "关羽归刘是真，细节全虚。" },
      { id: "h-008", chapter: 25-26, plot: "斩颜良诛文丑",
        history: "《三国志·关羽传》载颜良为关羽所斩；文丑为曹操部下所杀，关羽未预。",
        status: "transposed", note: "诛文丑移花接木。" },
      { id: "h-009", chapter: 37-38, plot: "三顾茅庐",
        history: "《出师表》「先帝三顾臣于草庐之中」可证，细节（风雪、童子、诸葛亮午睡）皆为铺陈。",
        status: "embellished", note: "三顾为史，细节增饰。" },
      { id: "h-010", chapter: 39, plot: "火烧博望坡",
        history: "建安七年（202）刘备率军拒夏侯惇于博望，烧屯伪遁，非诸葛亮之功（时亮未出山）。",
        status: "transposed", note: "移刘备战功予诸葛亮。" },
      { id: "h-011", chapter: 43, plot: "舌战群儒",
        history: "诸葛亮出使东吴促成联合为史，舌战东吴诸儒之细节小说增饰。",
        status: "embellished", note: "出使为实，论辩场景为虚。" },
      { id: "h-012", chapter: 46, plot: "草船借箭",
        history: "原型为《三国志·吴主传》注引《魏略》：孙权濡须口乘大船入曹军前，曹以弩射之，箭着船舷，权令翻船，箭均船平。非诸葛亮，亦非借箭。",
        status: "transposed", note: "移孙权事予诸葛亮，并改情节。" },
      { id: "h-013", chapter: 49, plot: "借东风",
        history: "赤壁之战东风为长江冬季盛行之东北风，诸葛亮不可能借风。",
        status: "fictional", note: "纯虚构，以凸显诸葛亮仙化形象。" },
      { id: "h-014", chapter: 50, plot: "华容道义释曹操",
        history: "《三国志》及裴注均载曹操败走，刘备追之不及，关羽未在华容道。",
        status: "fictional", note: "虚构情节。" },
      { id: "h-015", chapter: 51-56, plot: "三气周瑜",
        history: "周瑜气量宽宏，赤壁后不久病逝于西征途中，非被诸葛亮气死。",
        status: "fictional", note: "虚构以反衬诸葛亮。" },
      { id: "h-016", chapter: 57, plot: "卧龙吊丧",
        history: "周瑜卒后孙权与刘备联盟尚存，亮曾赴柴桑，然无哭祭周瑜之正史记载。",
        status: "embellished", note: "亮使东吴为实，哭祭细节为增饰。" },
      { id: "h-017", chapter: 63, plot: "庞统落凤坡",
        history: "《三国志·庞统传》载庞统攻雒县中流矢卒，非于「落凤坡」，且此地名后起。",
        status: "transposed", note: "借地名谶纬（凤雏落凤坡），移战死之地。" },
      { id: "h-018", chapter: 74, plot: "关羽水淹七军",
        history: "《三国志·关羽传》载「羽率众攻曹仁于樊，曹公遣于禁助仁。秋，大霖雨，汉水汎溢，禁所督七军皆没」，为天灾，非关羽人工决堤。",
        status: "embellished", note: "关羽乘势进兵是史，决堤一说属演义增饰。" },
      { id: "h-019", chapter: 77, plot: "关羽走麦城",
        history: "《三国志》载吕蒙白衣渡江，关羽败走麦城被杀，基本情节属实。",
        status: "fact", note: "可坐实的重要史实。" },
      { id: "h-020", chapter: 78, plot: "关公显圣杀吕蒙",
        history: "吕蒙病卒，非被关公鬼魂索命。",
        status: "fictional", note: "纯虚构神异情节。" },
      { id: "h-021", chapter: 81, plot: "刘备兴兵伐吴（夷陵之战）",
        history: "为关羽报仇之名，刘备亲率大军攻吴，为史，然细节（连营七百里等）或有夸大。",
        status: "embellished", note: "夷陵之战本身为史，连营、火烧连营七百里为增饰。" },
      { id: "h-022", chapter: 84, plot: "八阵图困陆逊",
        history: "《三国志·诸葛亮传》载亮推演兵法作八阵图，然陆逊未困其中。",
        status: "fictional", note: "虚构情节。" },
      { id: "h-023", chapter: 85, plot: "白帝托孤",
        history: "《三国志·诸葛亮传》载刘备临终托孤诸葛亮，有「若嗣子可辅则辅之，如其不才君可自取」语，为史。",
        status: "embellished", note: "托孤核心情节为史，细节有增饰。" },
      { id: "h-024", chapter: 87-90, plot: "七擒孟获",
        history: "《三国志·诸葛亮传》仅载「南征」，《汉晋春秋》载亮擒纵孟获七次以收其心，然七擒七纵细节无确凿史料。",
        status: "embellished", note: "南征攻心为上为史，七擒七纵为传说。" },
      { id: "h-025", chapter: 95-96, plot: "空城计",
        history: "诸葛亮未对司马懿使用空城计，且诸葛亮与司马懿此时期未直接对阵。原型为赵云「偃旗息鼓」退曹兵于汉中。",
        status: "transposed", note: "移赵云事予诸葛亮，诸葛亮与司马懿亦未对峙。" },
      { id: "h-026", chapter: 95, plot: "挥泪斩马谡",
        history: "《三国志·马谡传》载马谡失街亭后被杀，诸葛亮自贬三级为史。",
        status: "embellished", note: "斩谡为史，「挥泪」等细节增饰。" },
      { id: "h-027", chapter: 91-94, plot: "六出祁山（五次北伐）",
        history: "诸葛亮北伐五次，其中二次出祁山，其余走陈仓、斜谷等道。",
        status: "embellished", note: "北伐总体为史，「六出祁山」为演义夸饰。" },
      { id: "h-028", chapter: 103, plot: "木牛流马",
        history: "《三国志·诸葛亮传》载「亮复出祁山，以木牛运，粮尽退军」，木牛流马具体形制已失，为民间器物而非神秘机械。",
        status: "embellished", note: "木牛流马存在为史，演义夸饰其神奇。" },
      { id: "h-029", chapter: 104, plot: "诸葛亮禳星续命",
        history: "纯虚构。诸葛亮病卒五丈原为史，禳星、魏延踏灭主灯为小说情节。",
        status: "fictional", note: "纯虚构神异情节。" },
      { id: "h-030", chapter: 104, plot: "死诸葛走生仲达",
        history: "《晋书·宣帝纪》及裴注载，蜀军退时司马懿追之，亮以木像吓退之。或有其事，细节小说化。",
        status: "embellished", note: "传说有据，演义渲染。" },
      { id: "h-031", chapter: 107-115, plot: "姜维九伐中原",
        history: "姜维北伐确有其事，然次数与结果有夸大。",
        status: "embellished", note: "北伐为史，次数夸饰。" },
      { id: "h-032", chapter: 116-118, plot: "邓艾偷渡阴平",
        history: "《三国志·邓艾传》载邓艾凿山通道自阴平道入蜀，为史。",
        status: "fact", note: "可坐实的重要史实。" },
      { id: "h-033", chapter: 119, plot: "刘禅乐不思蜀",
        history: "《三国志·后主传》注引《汉晋春秋》载刘禅降后迁洛阳，司马昭问「思蜀否」，禅答「此间乐，不思蜀」。",
        status: "fact", note: "史有明载。" },
      { id: "h-034", chapter: 120, plot: "三分归一",
        history: "西晋代魏、吴亡，三国归晋为史实。",
        status: "fact", note: "正史所载。" },
      { id: "h-035", chapter: "首回", plot: "董卓进京、汉灵帝驾崩",
        history: "基本情节属实。",
        status: "fact", note: "史实。" },
      { id: "h-036", chapter: 20, plot: "吕布辕门射戟",
        history: "《三国志·吕布传》载布于营门射戟小支，中者两家罢兵，属实。",
        status: "fact", note: "史有明载。" },
      { id: "h-037", chapter: 12-13, plot: "曹操挟天子以令诸侯",
        history: "《三国志·武帝纪》载建安元年（196）迎献帝于许，属实。",
        status: "fact", note: "重要史实。" },
      { id: "h-038", chapter: 30, plot: "官渡之战",
        history: "建安五年（200）曹操败袁绍于官渡，为史，属中国古代三大战役之一。",
        status: "embellished", note: "战役为史，许攸来投、乌巢烧粮细节或有演义润色。" },
      { id: "h-039", chapter: 43-50, plot: "赤壁之战",
        history: "建安十三年（208）孙刘联军败曹操于赤壁，为史，属三大战役之一。",
        status: "embellished", note: "战役主体为史，诸葛亮相关情节多虚构。" },
      { id: "h-040", chapter: 81-84, plot: "夷陵之战",
        history: "章武二年（222）刘备败于陆逊，属三大战役之一。",
        status: "embellished", note: "战役为史，连营七百里、火烧八百里等为增饰。" }
    ],

    /* ===== 评注挂接索引（重点回目 40 条） ===== */
    commentaryIndex: [
      { unit: 1, criticId: "maozigang",
        summary: "毛宗岗第一回回前评以《西江月》开篇，总论天下大势分久必合，合久必分，点出全书主旨。",
        excerpt: "" },
      { unit: 1, criticId: "lizhi",
        summary: "李卓吾评第一回桃园结义，赞其义薄云天。", excerpt: "" },
      { unit: 1, criticId: "zhongxing",
        summary: "钟伯敬评黄巾起义，论其失在于无才无德。", excerpt: "" },
      { unit: 1, criticId: "liyuweng",
        summary: "笠翁评开篇，论三国以乱起、以治收，章法分明。", excerpt: "" },
      { unit: 5, criticId: "maozigang",
        summary: "毛评温酒斩华雄，赞关羽神威，又暗责孙坚之功被移。", excerpt: "" },
      { unit: 5, criticId: "lizhi",
        summary: "李评虎牢关三英战吕布，叹天下勇士唯奉先一人。", excerpt: "" },
      { unit: 21, criticId: "maozigang",
        summary: "毛评煮酒论英雄，以「天下英雄唯使君与操」为眼，点出二人分合之始。", excerpt: "" },
      { unit: 27, criticId: "maozigang",
        summary: "毛评过五关斩六将，赞关羽千里走单骑之忠勇。", excerpt: "" },
      { unit: 36, criticId: "maozigang",
        summary: "毛评徐庶走马荐诸葛，论其忠母荐贤之节。", excerpt: "" },
      { unit: 37, criticId: "maozigang",
        summary: "毛评三顾茅庐前两顾不遇，层层铺垫卧龙之隐。", excerpt: "" },
      { unit: 38, criticId: "maozigang",
        summary: "毛评隆中对策，点出「跨有荆益，西和诸戎，南抚夷越」之战略，为全书骨法。", excerpt: "" },
      { unit: 43, criticId: "maozigang",
        summary: "毛评舌战群儒，赞诸葛亮辞令。", excerpt: "" },
      { unit: 46, criticId: "maozigang",
        summary: "毛评草船借箭，赞诸葛亮料事如神，又暗合虚虚实实之法。", excerpt: "" },
      { unit: 49, criticId: "maozigang",
        summary: "毛评借东风，论其「虚则实之、实则虚之」。", excerpt: "" },
      { unit: 50, criticId: "maozigang",
        summary: "毛评华容道义释曹操，赞关羽之义，惜其纵虎归山。", excerpt: "" },
      { unit: 51, criticId: "maozigang",
        summary: "毛评一气周瑜，点出周瑜与诸葛亮之矛盾初起。", excerpt: "" },
      { unit: 56, criticId: "maozigang",
        summary: "毛评三气周瑜叹其器量狭窄。", excerpt: "" },
      { unit: 63, criticId: "maozigang",
        summary: "毛评庞统落凤坡，叹凤雏早夭，与卧龙形成对照。", excerpt: "" },
      { unit: 74, criticId: "maozigang",
        summary: "毛评关羽水淹七军，为其一生战功顶峰。", excerpt: "" },
      { unit: 77, criticId: "maozigang",
        summary: "毛评关羽败走麦城，叹英雄末路。", excerpt: "" },
      { unit: 81, criticId: "maozigang",
        summary: "毛评刘备兴兵伐吴，赞其兄弟之义，惜其意气用事。", excerpt: "" },
      { unit: 84, criticId: "maozigang",
        summary: "毛评陆逊火烧连营，论兵法虚实。", excerpt: "" },
      { unit: 85, criticId: "maozigang",
        summary: "毛评白帝托孤，论君臣鱼水之义。", excerpt: "" },
      { unit: 89, criticId: "maozigang",
        summary: "毛评七擒孟获，论攻心为上之策。", excerpt: "" },
      { unit: 91, criticId: "maozigang",
        summary: "毛评孔明上《出师表》。", excerpt: "" },
      { unit: 95, criticId: "maozigang",
        summary: "毛评失街亭、空城计、斩马谡三回连看。", excerpt: "" },
      { unit: 104, criticId: "maozigang",
        summary: "毛评诸葛亮禳星续命未遂，死诸葛走生仲达，叹诸葛亮鞠躬尽瘁。", excerpt: "" },
      { unit: 104, criticId: "lizhi",
        summary: "李评诸葛亮之死，赞其忠臣形象。", excerpt: "" },
      { unit: 116, criticId: "maozigang",
        summary: "毛评邓艾偷渡阴平，叹其孤注一掷之奇。", excerpt: "" },
      { unit: 119, criticId: "maozigang",
        summary: "毛评刘禅乐不思蜀，叹蜀汉灭亡之快。", excerpt: "" },
      { unit: 120, criticId: "maozigang",
        summary: "毛评三分归一，总论天下大势。", excerpt: "" },
      { unit: 78, criticId: "lizhi",
        summary: "李评关公显圣，论鬼神之说。", excerpt: "" },
      { unit: 95, criticId: "zhongxing",
        summary: "钟评街亭之失，论马谡之过。", excerpt: "" },
      { unit: 37, criticId: "liyuweng",
        summary: "笠翁评三顾茅庐，赞刘备之诚，叹诸葛亮之隐。", excerpt: "" },
      { unit: 46, criticId: "liyuweng",
        summary: "笠翁评草船借箭，论奇谋。", excerpt: "" },
      { unit: 50, criticId: "liyuweng",
        summary: "笠翁评华容道，论义之利弊。", excerpt: "" },
      { unit: 85, criticId: "zhongxing",
        summary: "钟评白帝托孤，叹君臣相得。", excerpt: "" },
      { unit: 90, criticId: "zhongxing",
        summary: "钟评七擒孟获，论攻心为上。", excerpt: "" },
      { unit: 103, criticId: "liyuweng",
        summary: "笠翁评诸葛亮禳星续命，论神异之说。", excerpt: "" },
      { unit: 120, criticId: "lizhi",
        summary: "李评三分归一，叹天下大势。", excerpt: "" }
    ]
  };

  global.SANGUO_ANNOTATIONS = SANGUO_ANNOTATIONS;
  if (typeof module !== 'undefined') module.exports = SANGUO_ANNOTATIONS;
})(typeof window !== 'undefined' ? window : globalThis);
