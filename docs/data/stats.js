/**
 * 《三国演义》统计聚合模块（SANGUO_STATS）
 * 专题深研页 / 学术研究页所有统计数字均由此处聚合函数实时计算，
 * 页面不得硬编码统计值。所有函数在调用时读取全局数据，
 * 数据变更（含测试翻转）后重新渲染即可反映。
 */
(function(global){
  'use strict';

  /* ---- 全局数据读取（数据文件用顶层 const 定义，不挂 window，须用裸标识符读取） ---- */
  function getData(){    return (typeof SANGUO_DATA !== 'undefined')        ? SANGUO_DATA        : (global.SANGUO_DATA || {}); }
  function getTopics(){  return (typeof SANGUO_TOPICS !== 'undefined')      ? SANGUO_TOPICS      : (global.SANGUO_TOPICS || {}); }
  function getAnn(){     return (typeof SANGUO_ANNOTATIONS !== 'undefined') ? SANGUO_ANNOTATIONS : (global.SANGUO_ANNOTATIONS || null); }
  function getCorpus(){  return (typeof SANGUO_CORPUS !== 'undefined')      ? SANGUO_CORPUS      : (global.SANGUO_CORPUS || {}); }
  function getOnt(){     return (typeof SANGUO_ONTOLOGY !== 'undefined')    ? SANGUO_ONTOLOGY    : (global.SANGUO_ONTOLOGY || null); }

  /* ---- 受控词表兜底（SANGUO_ONTOLOGY 未载入时使用） ---- */
  const FALLBACK_STATUS_TERMS = [
    { id:'fact',        label:'史实',     color:'#006400' },
    { id:'embellished', label:'史实加工', color:'#8b6914' },
    { id:'transposed',  label:'移花接木', color:'#e65100' },
    { id:'fictional',   label:'虚构',     color:'#8b0000' }
  ];
  const FALLBACK_SYSTEM_TERMS = [
    { id:'yanyi',    label:'演义系统' },
    { id:'zhizhuan', label:'志传系统' },
    { id:'pingben',  label:'评本' },
    { id:'huiping',  label:'汇评本' },
    { id:'pinghua',  label:'平话·词话' },
    { id:'shishu',   label:'史书注释' }
  ];

  function statusTerms(){
    const ont = getOnt();
    const terms = ont && ont.vocabularies && ont.vocabularies.historicalStatus && ont.vocabularies.historicalStatus.terms;
    return (terms && terms.length)
      ? terms.map(t=>({ id:t.id, label:t.label, color:t.color }))
      : FALLBACK_STATUS_TERMS;
  }
  function systemTerms(){
    const ont = getOnt();
    const terms = ont && ont.vocabularies && ont.vocabularies.editionSystem && ont.vocabularies.editionSystem.terms;
    return (terms && terms.length)
      ? terms.map(t=>({ id:t.id, label:t.label }))
      : FALLBACK_SYSTEM_TERMS;
  }

  // 虚实等级 → 四级状态（兼容繁简写法）
  const LEVEL_TO_STATUS = {
    '史实':'fact','史實':'fact',
    '史实加工':'embellished','史實加工':'embellished',
    '移花接木':'transposed',
    '虚构':'fictional','虛構':'fictional'
  };

  function num(v){ const n = Number(v); return isFinite(n) ? n : 0; }

  /* ==================== 五类口径聚合 ==================== */

  // 1. 人物提及分布：persons 按 mentionCount 降序，取前 n
  function personMentionTop(n){
    const limit = (typeof n === 'number') ? n : 10;
    const persons = getData().persons || [];
    return persons
      .map(p=>({ id:p.id, name:p.name, faction:p.faction||'', mentionCount:num(p.mentionCount) }))
      .sort((a,b)=>b.mentionCount-a.mentionCount)
      .slice(0, limit);
  }

  // 2a. 战役年份分布：battles 按 year 计数，年份升序
  function battleYearDist(){
    const battles = getData().battles || [];
    const map = {};
    battles.forEach(b=>{
      const y = String(b && b.year != null ? b.year : '').trim();
      if(!y) return;
      map[y] = (map[y] || 0) + 1;
    });
    return Object.keys(map)
      .map(year=>({ year, count:map[year] }))
      .sort((a,b)=>num(a.year)-num(b.year));
  }

  // 2b. 战役地理分布：battles.placeIds → places.name 计数，取前 n
  function battleGeoTop(n){
    const limit = (typeof n === 'number') ? n : 8;
    const d = getData();
    const nameById = {};
    (d.places||[]).forEach(pl=>{ nameById[pl.id] = pl.name; });
    const map = {};
    (d.battles||[]).forEach(b=>{
      (b && b.placeIds || []).forEach(pid=>{
        const name = nameById[pid] || String(pid);
        map[name] = (map[name] || 0) + 1;
      });
    });
    return Object.keys(map)
      .map(name=>({ name, count:map[name] }))
      .sort((a,b)=>b.count-a.count || (a.name < b.name ? -1 : 1))
      .slice(0, limit);
  }

  // 3a. 评点密度（按回）：commentaryIndex 按 unit 计数，取前 n
  function annotationByChapter(n){
    const limit = (typeof n === 'number') ? n : 10;
    const idx = (getAnn() || {}).commentaryIndex || [];
    const map = {};
    idx.forEach(c=>{
      const u = num(c && c.unit);
      map[u] = (map[u] || 0) + 1;
    });
    return Object.keys(map)
      .map(unit=>({ unit:num(unit), count:map[unit] }))
      .sort((a,b)=>b.count-a.count || a.unit-b.unit)
      .slice(0, limit);
  }

  // 3b. 评点密度（按评点家）：commentaryIndex 按 criticId 计数，名从 critics
  function annotationByCritic(){
    const ann = getAnn() || {};
    const idx = ann.commentaryIndex || [];
    const nameById = {};
    (ann.critics||[]).forEach(c=>{ nameById[c.id] = c.name; });
    const map = {};
    idx.forEach(c=>{
      const k = (c && c.criticId) || 'unknown';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map)
      .map(id=>({ id, name:nameById[id] || id, count:map[id] }))
      .sort((a,b)=>b.count-a.count || (a.name < b.name ? -1 : 1));
  }

  // 4. 虚实比例：四源合并四级计数
  //    ① 情节虚实断语 historicalContrast（status 或 level 映射）
  //    ② 战役 battles[].historicalStatus（缺省按史实加工）
  //    ③ 人物/事件/器物 virtual 布尔（true→虚构，false→史实）
  //    ④ 回目虚实注记 chapters[].isVirtual（每条计虚构）
  function virtualRatio(){
    const counts = { fact:0, embellished:0, transposed:0, fictional:0 };
    function bump(s){ if(counts[s] !== undefined) counts[s]++; }

    const contrast = (global.SANGUO_APP && global.SANGUO_APP.historicalContrast) ||
                     (getTopics().historical || []);
    contrast.forEach(h=>{
      bump((h && h.status) || LEVEL_TO_STATUS[h && h.level] || 'embellished');
    });

    const d = getData();
    (d.battles||[]).forEach(b=>bump((b && b.historicalStatus) || 'embellished'));

    function bumpBool(list){
      (list||[]).forEach(x=>{
        if(x && typeof x.virtual === 'boolean') bump(x.virtual ? 'fictional' : 'fact');
      });
    }
    bumpBool(d.persons);
    bumpBool(getTopics().events);
    bumpBool(getTopics().artifacts);

    (d.chapters||[]).forEach(ch=>{
      (ch && ch.isVirtual || []).forEach(()=>bump('fictional'));
    });

    const total = statusTerms().reduce((s,t)=>s+(counts[t.id]||0), 0);
    return statusTerms().map(t=>({
      id:t.id, label:t.label, color:t.color,
      count:counts[t.id] || 0,
      pct: total ? Math.round((counts[t.id]||0) / total * 1000) / 10 : 0
    }));
  }

  /* ---- 版本系统归属：按标题/备注关键词分类（标题优先） ---- */
  const GAP_SYSTEM_MAP = {
    '演義系統':'yanyi','演義系统':'yanyi','演義':'yanyi','演义':'yanyi',
    '志傳系統':'zhizhuan','志传系统':'zhizhuan',
    '評本':'pingben','评本':'pingben',
    '匯評本':'huiping','汇评本':'huiping'
  };
  function classifyItemSystem(it){
    for(const field of ['title','note']){
      const t = String((it && it[field]) || '');
      if(/匯評|汇评/.test(t)) return 'huiping';
      if(/平话|平話|词话|詞話/.test(t)) return 'pinghua';
      if(/评本|評本|评阅|評閱|评点|評點|评语|評語|读法|讀法|批评|批評/.test(t)) return 'pingben';
      if(/演义|演義|嘉靖/.test(t)) return 'yanyi';
      if(/志传|志傳|全傳|全传/.test(t)) return 'zhizhuan';
      if(/裴松之|陈寿|陳壽/.test(t)) return 'shishu';
    }
    return null;
  }

  // 5a. 版本系统分布：gaps 按 system 映射 + items 按关键词分类，合并计数
  function editionSystemDist(){
    const counts = {};
    systemTerms().forEach(t=>{ counts[t.id] = 0; });
    const corpus = getCorpus();
    (corpus.gaps||[]).forEach(g=>{
      const id = GAP_SYSTEM_MAP[g && g.system];
      if(id && counts[id] !== undefined) counts[id]++;
    });
    (corpus.items||[]).forEach(it=>{
      const id = classifyItemSystem(it);
      if(id && counts[id] !== undefined) counts[id]++;
    });
    return systemTerms().map(t=>({ id:t.id, label:t.label, count:counts[t.id] || 0 }));
  }

  // 5b. 异文按回集中度：variantsExtra 按 chapter 计数，取前 n
  function variantConcentration(n){
    const limit = (typeof n === 'number') ? n : 6;
    const list = getTopics().variantsExtra || [];
    const map = {};
    list.forEach(v=>{
      const c = num(v && v.chapter);
      map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map)
      .map(chapter=>({ chapter:num(chapter), count:map[chapter] }))
      .sort((a,b)=>b.count-a.count || a.chapter-b.chapter)
      .slice(0, limit);
  }

  // 语料概要：古本口径 = items 排除评语辑录（cmt-*）与卷首附属（*-front）
  function corpusSummary(){
    const corpus = getCorpus();
    const items = corpus.items || [];
    const editions = items.filter(it=>it && !/^cmt-/.test(it.id || '') && !/-front$/.test(it.id || ''));
    return {
      editionCount: editions.length,
      totalChars: num(corpus.totalChars),
      itemCount: items.length,
      gapCount: (corpus.gaps || []).length
    };
  }

  /* ---- 页面静态标记填充：<span data-stat="editionCount"></span> ---- */
  function fillDataStats(){
    if(typeof document === 'undefined' || !document.querySelectorAll) return;
    const sum = corpusSummary();
    document.querySelectorAll('[data-stat]').forEach(el=>{
      const key = el.getAttribute('data-stat');
      if(Object.prototype.hasOwnProperty.call(sum, key)) el.textContent = String(sum[key]);
    });
  }

  global.SANGUO_STATS = {
    personMentionTop, battleYearDist, battleGeoTop,
    annotationByChapter, annotationByCritic,
    virtualRatio, editionSystemDist, variantConcentration,
    corpusSummary, fillDataStats
  };

  if(typeof document !== 'undefined'){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fillDataStats);
    else fillDataStats();
  }
})(typeof window !== 'undefined' ? window : globalThis);
