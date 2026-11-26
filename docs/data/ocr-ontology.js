/**
 * 余象斗刊本（OCR）A1 版本形制轴实例
 * 供本体页（ontology.html）与版本阅读页（read.html）共享
 * 顶层 const 不挂 window；页面内用裸标识符 YXD_ONTOLOGY 读取
 */
const YXD_ONTOLOGY = {
  edition: {
    id: 'yuxiangdou',
    label: '余象斗刊本（OCR）',
    unitKind: 'ze',
    unitCount: 180,
    unitSource: { file: 'texts/余象斗刊本_OCR.txt', split: 'ze' },
    note: '明万历余象斗双峰堂刊《新刻按鉴全像批评三国志传》系统；识典古籍 OCR，180 则。未校勘，不作异文对勘底本。'
  },
  // 则 → 毛本回 近似对齐（按则目题名关键词匹配；对不齐的如实标注）
  unitMappings: [
    { from: '第1則', to: 'mao-ch1', alignNote: '宴桃园豪杰三结义；与毛本第1回同源' },
    { from: '第2則', to: 'mao-ch1', alignNote: '张角黄巾起义；毛本第1回后半' },
    { from: '第10則', to: 'mao-ch5', alignNote: '虎牢关三战吕布；毛本第5回' },
    { from: '第16則', to: 'mao-ch8', alignNote: '凤仪亭吕布戏貂蝉；毛本第8回' },
    { from: '第21則', to: 'mao-ch11', alignNote: '刘备北海解围；毛本第11回' },
    { from: '第29則', to: 'mao-ch15', alignNote: '孙策大战太史慈；毛本第15回' },
    { from: '第49則', to: 'mao-ch25', alignNote: '张辽义说关云长；毛本第25回' },
    { from: '第74則', to: 'mao-ch37', alignNote: '玄德风雪谒孔明；毛本第37回' },
    { from: '第86則', to: 'mao-ch43', alignNote: '诸葛亮激孙权；毛本第43回' },
    { from: '第94則', to: 'mao-ch47', alignNote: '庞统智进连环计；毛本第47回' },
    { from: '第100則', to: 'mao-ch50', alignNote: '关云长义释曹操；毛本第50回' },
    { from: '第112則', to: 'mao-ch56', alignNote: '诸葛亮三气周瑜；毛本第56回' },
    { from: '第129則', to: 'mao-ch65', alignNote: '葭萌关张飞战马超；毛本第65回' },
    { from: '第148則', to: 'mao-ch74', alignNote: '关云长水淹七军；毛本第74回' },
    { from: '第169則', to: 'mao-ch85', alignNote: '白帝城先主托孤；毛本第85回' },
    { from: '第180則', to: 'mao-ch90', alignNote: '孔明七擒孟获；毛本第90回' }
  ],
  // 典型异文（志传系 vs 毛本）
  variants: [
    { unit: '第1則', variantKind: '情节增删', note: '志传系存「关索」故事线索，毛本无；属志传本系情节系统差异', ref: 'mao-ch1' },
    { unit: '第50則', variantKind: '字词异文', note: '「雲長匹馬刺顏良」之「匹馬」与毛本「一騎」异文；志传系文字较毛本简省', ref: 'mao-ch25' },
    { unit: '第100則', variantKind: '情节增删', note: '「關雲長義釋曹操」志传系叙事极简（仅数句），毛本增衍大量心理描写与诗词', ref: 'mao-ch50' },
    { unit: '第148則', variantKind: '字词异文', note: '「水淹七軍」志传系记汉水自然泛滥，毛本增「关公决堤」人工情节', ref: 'mao-ch74' }
  ]
};
