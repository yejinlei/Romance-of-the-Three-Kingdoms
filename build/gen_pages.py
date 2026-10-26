# -*- coding: utf-8 -*-
"""一次性生成全部 24 研究页 + 首页 + 本体页 + 查询台（新简体 nav-grid 风格）"""
import os, json, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT/'data'
DOCS = ROOT/'docs'
DOCS.mkdir(exist_ok=True)
(DOCS/'data').mkdir(exist_ok=True)

def load(p): 
    # 优先从 docs/data/ 读（含 total 字段），否则从 data/
    dp = DOCS/'data'/p
    fp = DATA/p
    path = dp if dp.exists() else fp
    return json.load(open(path, encoding='utf-8'))

# ========== 加载数据 ==========
persons    = load('persons.json')  # list[dict] (含 total/spark 字段)
factions   = load('factions.json')
places     = load('places.json')
battles0   = load('battles.json')
events0    = load('events.json')
artifacts  = load('artifacts.json')
stratagems = load('stratagems.json')
prophecies = load('prophecies.json')
editions_all = load('editions.json')
editions   = editions_all.get('editions',[]) if isinstance(editions_all,dict) else editions_all
scholars   = load('scholars.json')
papers     = load('papers.json')
adaptations= load('adaptations.json')
cooccur    = load('cooccurrence.json')
freq       = load('freq.json')
stat       = load('stat.json')
chapters   = load('chapters.json')
read_data  = load('read.json')  # list of {no,title,paragraphs,chars}
VARIANTS_DATA = json.load(open(DOCS/'data'/'variants.json', encoding='utf-8'))

# ========== 修正：战役/事件真实年份硬编码（回目章节号→公元年映射）=============
# 三国纪年关键锚点：1回=184黄巾, 5回=189董卓, 21回=200官渡, 38回=207三顾,
# 43回=208赤壁, 73回=219关羽败走, 80回=220曹丕篡汉, 81回=221夷陵前,
# 85回=223刘备死, 92回=228一出祁山, 104回=234诸葛星落,
# 119回=265蜀亡, 120回=280三国归晋
CHAP_YEAR = [
    (1,184),(2,184),(3,184),(4,184),(5,189),(6,190),(7,190),(8,191),(9,192),
    (10,192),(11,193),(12,194),(13,195),(14,196),(15,197),(16,197),(17,198),
    (18,199),(19,199),(20,200),(21,200),(22,200),(23,200),(24,200),(25,200),
    (26,200),(27,200),(28,200),(29,200),(30,200),(31,201),(32,202),(33,203),
    (34,203),(35,203),(36,204),(37,205),(38,207),(39,207),(40,207),(41,208),
    (42,208),(43,208),(44,208),(45,208),(46,208),(47,208),(48,208),(49,209),
    (50,209),(51,209),(52,209),(53,209),(54,209),(55,210),(56,211),(57,212),
    (58,213),(59,213),(60,214),(61,214),(62,214),(63,215),(64,215),(65,215),
    (66,215),(67,216),(68,216),(69,217),(70,217),(71,218),(72,218),(73,219),
    (74,219),(75,219),(76,219),(77,219),(78,220),(79,220),(80,220),(81,221),
    (82,221),(83,222),(84,222),(85,223),(86,225),(87,225),(88,225),(89,226),
    (90,227),(91,227),(92,228),(93,228),(94,229),(95,229),(96,229),(97,229),
    (98,230),(99,230),(100,231),(101,231),(102,231),(103,232),(104,234),
    (105,235),(106,238),(107,239),(108,240),(109,249),(110,252),(111,253),
    (112,254),(113,255),(114,257),(115,258),(116,260),(117,262),(118,263),
    (119,265),(120,280),
]
def ch2y(ch):
    if ch<=0 or ch>120: return None
    # 找最接近的锚点
    best = CHAP_YEAR[0]
    for c,y in CHAP_YEAR:
        if c<=ch: best=(c,y)
        else: break
    return best[1]

# 战役真实年份（以名称精确修正）
BATTLE_YEAR_PATCH = {
    '黄巾之乱':184, '桃园结义':184, '汜水关之战':190, '虎牢关之战':190, '荥阳之战':190,
    '孙坚攻刘表':192, '磐河之战':192, '界桥之战':192, '襄阳之战':192,
    '李傕郭汜之乱':194, '长安之战':195, '定陶之战':195, '濮阳之战':194, '宛城之战':197,
    '下邳之战':198, '白门楼':198, '徐州之战':200, '白马之战':200, '延津之战':200,
    '官渡之战':200, '仓亭之战':201, '穰山之战':201, '博望坡之战':207, '新野之战':207,
    '长坂坡之战':208, '赤壁之战':208, '华容道':208, '南郡之战(取荆州)':209, '取南郡':209,
    '合肥之战(一)':209, '荆州争夺':209, '潼关之战':211, '渭水之战':211, '截江夺阿斗':212,
    '雒城之战':214, '绵竹之战':214, '成都之战':214, '合肥之战(二)':215, '濡须口之战':215,
    '定军山之战':219, '汉水之战':219, '樊城之战':219, '水淹七军':219, '走麦城':219,
    '夷陵之战':222, '猇亭之战(夷陵)':222, '猇亭之战':222, '火烧连营':222,
    '白帝城托孤':223, '南征孟获':225, '七擒孟获':225, '一出祁山':228, '失街亭':228,
    '空城计':228, '二出祁山':228, '三出祁山':229, '四出祁山':230, '五出祁山':231,
    '六出祁山':234, '五丈原':234, '上方谷':234, '姜维北伐':238, '铁笼山之战':253,
    '姜邓斗智(八伐中原)':257, '沓中屯田':262, '绵竹关之战(诸葛瞻)':263, '偷渡阴平':263,
    '成都受禅(蜀亡)':263, '蜀汉灭亡':263, '钟会邓艾之乱':264, '西陵之战':272,
    '晋灭吴':280, '三分归晋':280, '淮南三叛(诸葛诞)':258,
}
# 事件真实年份
EVENT_YEAR_PATCH = {
    '桃园三结义':184, '十常侍之乱':189, '董卓废立':189, '诸侯会盟':190, '凤仪亭':192,
    '迁帝长安':190, '李郭之乱':194, '迁都许昌':196, '衣带诏':199, '屯土山约三事':200,
    '过五关斩六将':200, '千里走单骑':200, '三顾茅庐':207, '隆中对':207, '舌战群儒':208,
    '草船借箭':208, '苦肉计':208, '借东风':208, '巧授连环计':208, '蒋干盗书':208,
    '三气周瑜':210, '借荆州':209, '刘备入蜀':214, '自领益州牧':214, '单刀赴会':215,
    '得陇望蜀':215, '进位汉中王':219, '水淹七军':219, '刮骨疗毒':219, '败走麦城':219,
    '曹操病逝':220, '曹丕篡汉':220, '汉中王称帝':221, '夷陵之战':222, '白帝城托孤':223,
    '南征':225, '七擒孟获':225, '斩颜良文丑':200, '前出师表':227, '失空斩':228,
    '后出师表':228, '六出祁山':228, '秋风五丈原':234, '魏延反骨':234, '九伐中原':253,
    '入西川二士争功':263, '三分归一统':280, '临江仙开篇':1668,
}

def fix_battle(b):
    n=b.get('name','')
    # 硬补丁优先
    for k,v in BATTLE_YEAR_PATCH.items():
        if k in n:
            b['year']=v; return b
    # 用章节号估算
    ch=b.get('chapter',0) or 0
    if ch<1 or ch>120:
        # 回退到 name 模糊匹配
        for c in chapters:
            if n[:4] in c.get('title',''):
                ch=c['no']; b['chapter']=ch; break
    if 1<=ch<=120: b['year']=ch2y(ch)
    else: b['year']=b.get('year') or 0
    return b

def fix_event(e):
    n=e.get('name','')
    for k,v in EVENT_YEAR_PATCH.items():
        if k in n:
            e['year']=v; return e
    ch=e.get('chapter',0) or 0
    if 1<=ch<=120: e['year']=ch2y(ch)
    else: e['year']=e.get('year') or 0
    return e

battles = sorted([fix_battle(dict(b)) for b in battles0], key=lambda x:(x.get('year') or 9999, x.get('name','')))
events  = sorted([fix_event(dict(e)) for e in events0],  key=lambda x:(x.get('year') or 9999, x.get('name','')))
persons_sorted = sorted(persons, key=lambda x:-x.get('total',0))

# ========== 24 入口导航 ==========
NAV = [
    ("首页","index.html","卷"),
    ("本体论","ontology.html","元"),
    ("全文阅读","read.html","读"),
    ("人物志","persons.html","人"),
    ("势力谱","factions.html","势"),
    ("地理志","places.html","地"),
    ("战役史","battles.html","战"),
    ("事件录","events.html","事"),
    ("计谋鉴","stratagems.html","计"),
    ("器物簿","artifacts.html","物"),
    ("谶纬考","prophecies.html","谶"),
    ("版本族谱","versions.html","版"),
    ("异文对勘","variants.html","勘"),
    ("人物关系","graph.html","系"),
    ("时空地图","map.html","图"),
    ("查询台","query.html","问"),
    ("统计析","stats.html","数"),
    ("学术史","scholars.html","学"),
    ("论著举要","papers.html","论"),
    ("衍生改编","adaptations.html","艺"),
    ("诗词回目","poetry.html","诗"),
    ("虚实对照","mirror.html","虚"),
    ("天命叙事","destiny.html","命"),
    ("阅读指南","guide.html","引"),
]

def header(title, active="", desc=""):
    nav_html = '<div class="nav-grid">'
    for label, href, seal in NAV:
        cls = "nav-card" + (" active" if href==active else "")
        nav_html += f'<a class="{cls}" href="{href}"><span class="seal">{seal}</span><span>{label}</span></a>'
    nav_html += '</div>'
    desc_html = f'<p class="subtitle">{desc}</p>' if desc else ''
    return f'''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 三国演义数字人文研究</title>
<link rel="stylesheet" href="assets/app.css">
</head><body>
<header class="site-header">
  <a class="site-seal" href="index.html">國三</a>
  <h1 class="site-title"><a href="index.html">三國演義本體論</a></h1>
  <p class="site-sub">—— 多版本知識圖譜 · Sanguo-Yanyi Multi-Edition Ontology</p>
  {nav_html}
</header><main>
{desc_html}'''

FOOTER = '''
</main>
<footer class="site-footer">
  <div class="footer-inner">
    <p>本站以毛宗岗评本百二十回为在线全文（{total_words:,}字）；本体论（OWL 2）兼容嘉靖本/周曰校本/叶逢春本/黄正甫本/余象斗本/李卓吾评本/李渔评本/毛宗岗本/人民文学出版社本等12个主要版本。</p>
    <p>工程以 yejinlei 西游记本体论（jtw_kg_ontology.ttl）为范式，面向多版本对照与异文比对场景扩展；视觉系统参考《石头记》数字人文站。</p>
  </div>
</footer>
</body></html>'''

def write(fn, html, active=""):
    full = html + FOOTER.format(total_words=stat.get('total_chars', 590968))
    open(DOCS/fn, 'w', encoding='utf-8').write(full)

def esc(s):
    if s is None: return ""
    return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

# ========== 页面：首页 ==========
def page_index():
    cards = []
    highlights = [
        ('人','人物志',f"{len(persons)} 位人物",f"含 {sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==0)} 位正史 / {sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==1)} 半虚构 / {sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==2)} 纯虚构", "persons.html"),
        ("战","战役史",f"{len(battles)} 场战事","自黄巾起义(184)至三分归晋(280)", "battles.html"),
        ("地","地理志",f"{len(places)} 处地名","全部标注经纬度", "places.html"),
        ("事","事件录",f"{len(events)} 件事件","政治/外交/谋略关节", "events.html"),
        ("版","版本族谱",f"{len(editions)} 个版本","演义系/志传系/评本/现代整理本四大族", "versions.html"),
        ("计","计谋鉴",f"{len(stratagems)} 条计谋","火攻/伏兵/离间/诈降", "stratagems.html"),
        ("物","器物簿",f"{len(artifacts)} 件名物","玉玺/青龙刀/蛇矛/铜雀台", "artifacts.html"),
        ("谶","谶纬考",f"{len(prophecies)} 条预言", "分久必合、卧龙凤雏等", "prophecies.html"),
        ("学","学术史",f"{len(scholars)} 位学者","毛宗岗/金圣叹/鲁迅/沈伯俊", "scholars.html"),
        ("艺","衍生改编",f"{len(adaptations)} 部改编","戏曲/影视/游戏/绘本", "adaptations.html"),
    ]
    for seal,label,big,small,href in highlights:
        cards.append(f'<a class="nav-card stat-card" href="{href}"><span class="seal">{seal}</span><div><div class="big">{big}</div><div class="lab">{label}</div><div class="small">{small}</div></div></a>')
    html = header("首页","index.html") + f'''
<section class="hero">
  <div class="hero-inner">
    <h2>滚滚长江东逝水，浪花淘尽英雄</h2>
    <p>这是一份关于《三国演义》的数字人文工程：以 OWL 2 本体论建模全书实体，
    覆盖人物、势力、地名、战役、事件、计谋、器物、谶纬、版本、异文十类名录，
    提供浏览器端无服务器（DuckDB-WASM）知识图谱查询台，以及面向 12 个主要版本的谱系与异文对勘。</p>
    <div class="hero-actions">
      <a class="btn primary" href="read.html">开始阅读</a>
      <a class="btn" href="ontology.html">本体论规范</a>
      <a class="btn" href="query.html">查询台</a>
    </div>
  </div>
</section>
<section class="paper">
  <h2>二十四个研究入口</h2>
  <div class="nav-grid stats-grid">{''.join(cards)}</div>
</section>
<section class="paper">
  <h2>人物出场频次 · TOP12</h2>
  <div class="bars">{''.join(
    f'<div class="bar-row"><span class="bar-name">{esc(p.get("name",""))}</span><span class="bar-wrap"><span class="bar-fill" style="width:{min(100,p.get("total",0)*100/persons_sorted[0].get("total",1)):.1f}%"></span></span><span class="bar-num">{p.get("total",0)}</span></div>'
    for p in persons_sorted[:12]
  )}</div>
</section>
'''
    write("index.html", html, "index.html")

# ========== 页面：本体论 ==========
def page_ontology():
    # 自動從 TTL 統計 TBox 規模
    import re as _re
    _ttl_text = open(ROOT/'03_本体论规范/sanguo_kg_ontology.ttl',encoding='utf-8').read()
    _abox_text = open(ROOT/'03_本体论规范/sanguo_kg_multiversion_abox.ttl',encoding='utf-8').read()
    _n_classes = len(_re.findall(r'a\s+owl:Class', _ttl_text))
    _n_obj = len(_re.findall(r'a\s+owl:ObjectProperty', _ttl_text))
    _n_data = len(_re.findall(r'a\s+owl:DatatypeProperty', _ttl_text))
    _n_inst = len(_re.findall(r'^sg:\w+\s+a\s+sg:', _ttl_text, _re.M)) + len(_re.findall(r'^sg:\w+\s+a\s+:', _abox_text, _re.M))
    _ttl_lines = _ttl_text.count('\n')+1
    _abox_lines = _abox_text.count('\n')+1
    # 計算 ABox 實例規模（從 parquet/json 合計）
    n_persons = len(persons)
    n_factions = len(factions)
    n_places = len(places)
    n_battles = len(battles)
    n_events = len(events)
    n_artifacts = len(artifacts)
    n_strat = len(stratagems)
    n_prop = len(prophecies)
    n_editions = len(VARIANTS_DATA['editions'])
    n_scholars_t = VARIANTS_DATA['scholars'] if isinstance(VARIANTS_DATA.get('scholars'),list) else []
    n_scholars = len(n_scholars_t)
    n_papers = len(papers)
    n_adapts = len(adaptations)
    n_variants = len(VARIANTS)
    n_chapter_units = n_editions*0 + 360  # 毛本120+嘉靖240
    n_commentary = len(VARIANTS_DATA['commentary_lineage'])
    _zy = load('zhouyuexiao.json') if (DOCS/'data'/'zhouyuexiao.json').exists() else {"n_chapters":0,"chars":0}
    n_zhou_ch = _zy.get('n_chapters', 0); n_zhou_chars = _zy.get('chars', 0)
    _vrr = load('variants_real.json') if (DOCS/'data'/'variants_real.json').exists() else {"items":[]}
    n_real_var = len(_vrr['items'])

    html = header("本體論規範","ontology.html",
        f"OWL 2 DL 描述邏輯本體，含 {_n_classes} 個類、{_n_obj} 個對象屬性、{_n_data} 個數據屬性；TBox {_ttl_lines} 行 + ABox {_abox_lines} 行 Turtle，兼容 Protégé/rdflib/GraphDB/Apache Jena。") + f'''
<section class="paper">
  <h2>本體論 OWL 2 規範 v3.2-multiversion</h2>
  <p>本體文件採用 Turtle 語法，詞表採用 YAML 受控詞表，兼容 Protégé / rdflib / GraphDB / Apache Jena 直接導入。
  與《水滸傳》本體（<code>sh:</code> 前綴）統一 <code>sg:</code> 命名空間，跨本體可按人物/地名 ID JOIN。</p>
  <div class="btn-row">
    <a class="btn primary" href="ontology/sanguo_kg_ontology.ttl" download>📥 下載 TBox（本體結構 · {_ttl_lines} 行 · {_n_classes} 類 / {_n_obj} 對象屬性 / {_n_data} 數據屬性）</a>
    <a class="btn primary" href="ontology/sanguo_kg_multiversion_abox.ttl" download>📥 下載多版本 ABox（{_abox_lines} 行 · {n_editions} 版本 / {n_variants} 文獻異文 + {n_real_var} 全文實測異文 / {n_scholars} 學者 / {n_commentary} 評點 / {n_chapter_units} 回目 + {n_zhou_ch} 則個體）</a>
    <a class="btn" href="ontology/vocabularies.yaml" download>📥 下載受控詞表 YAML（11 大詞族）</a>
    <a class="btn" href="query.html">🔍 在瀏覽器查詢本體（DuckDB-WASM）</a>
  </div>
</section>

<section class="paper">
  <h3>〇、ABox 實例統計（已導入知識庫）</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-num">{n_persons}</div><div class="kpi-lab">人物</div></div>
    <div class="kpi"><div class="kpi-num">{n_factions}</div><div class="kpi-lab">政治勢力</div></div>
    <div class="kpi"><div class="kpi-num">{n_places}</div><div class="kpi-lab">地理地名</div></div>
    <div class="kpi"><div class="kpi-num">{n_battles}</div><div class="kpi-lab">戰役</div></div>
    <div class="kpi"><div class="kpi-num">{n_events}</div><div class="kpi-lab">事件</div></div>
    <div class="kpi"><div class="kpi-num">{n_strat}</div><div class="kpi-lab">計謀</div></div>
    <div class="kpi"><div class="kpi-num">{n_artifacts}</div><div class="kpi-lab">器物</div></div>
    <div class="kpi"><div class="kpi-num">{n_prop}</div><div class="kpi-lab">讖緯</div></div>
    <div class="kpi"><div class="kpi-num" style="color:#9e2b25">{n_editions}</div><div class="kpi-lab">版本</div></div>
    <div class="kpi"><div class="kpi-num" style="color:#9e2b25">{n_variants}</div><div class="kpi-lab">核心異文</div></div>
    <div class="kpi"><div class="kpi-num">{n_scholars}</div><div class="kpi-lab">學者/評點家</div></div>
    <div class="kpi"><div class="kpi-num">{n_commentary}</div><div class="kpi-lab">評點傳承</div></div>
    <div class="kpi"><div class="kpi-num">360</div><div class="kpi-lab">回目/則個體</div></div>
    <div class="kpi"><div class="kpi-num" style="color:#2f6b8f">{n_zhou_ch}</div><div class="kpi-lab">周曰校本章</div></div>
    <div class="kpi"><div class="kpi-num" style="color:#2f6b8f">{n_real_var}</div><div class="kpi-lab">全文實測異文</div></div>
    <div class="kpi"><div class="kpi-num">{n_papers}+{n_adapts}</div><div class="kpi-lab">論著+改編</div></div>
  </div>
</section>

<section class="paper">
  <h3>一、頂層類層級（TBox Classes · 10 大範疇 + 7 大附屬）</h3>
  <div class="class-tree">
    <div class="cls-branch"><b>sg:Thing</b> — 頂層抽象事物
      <ul>
        <li><b>sg:LiteraryWork</b> — 文學作品（版本實體）
          <ul>
            <li>sg:AncientEdition — 古本系統（明刊及更早刻本）：演義系、志傳系</li>
            <li>sg:AnnotatedEdition — 評點改造本（李卓吾/鍾伯敬/李漁/毛宗崗）</li>
            <li>sg:ModernCollation — 現代整理本（人文社/沈伯俊校理本）</li>
            <li>sg:SequelWork — 續書衍生本（反三國/續三國）</li>
          </ul>
        </li>
        <li>文本結構單元
          <ul>
            <li>sg:Volume 卷 · sg:Chapter 回/則 · sg:Paragraph 段落</li>
            <li>sg:VariantReading 異文 · sg:Commentary 評點</li>
          </ul>
        </li>
        <li><b>sg:Person</b> — 人物
          <ul>
            <li>sg:CivilOfficial 文臣/謀士 · sg:General 武將 · sg:Royalty 皇族</li>
            <li>sg:Commoner 平民 · sg:MinorityFigure 少數民族 · sg:Woman 女性 · sg:FictionalFigure 純虛構</li>
          </ul>
        </li>
        <li><b>sg:Faction</b> — 政治勢力
          <ul><li>sg:HanCourt 東漢 · sg:CaoWei 曹魏 · sg:ShuHan 蜀漢 · sg:EasternWu 東吳 · sg:Warlord 割據諸侯 · sg:MinorityPower 少數民族</li></ul>
        </li>
        <li><b>sg:Battle</b> — 戰役
          <ul><li>sg:MajorBattle 大型會戰 · sg:LocalBattle 局部 · sg:Ambush 伏擊 · sg:NavalBattle 水戰 · sg:Raid 奇襲 · sg:Siege 圍城</li></ul>
        </li>
        <li><b>sg:Place</b> — 地點
          <ul><li>sg:AncientPlace 古地名 · sg:ModernSite 今址 · sg:Pass 關隘 · sg:Capital 都城 · sg:Battlefield 戰場遺址 · sg:Mountain 山 · sg:River 江河</li></ul>
        </li>
        <li><b>sg:Event</b> — 事件
          <ul><li>sg:PersonalEvent 個人 · sg:PoliticalEvent 政治 · sg:DiplomaticEvent 外交 · sg:AllusionEvent 典故</li></ul>
        </li>
        <li><b>sg:Scholar</b> — 學術主體（古代評點家/近現代學者/研究機構）</li>
        <li><b>sg:AcademicWork</b> — 學術成果（評點本/專著/論文/校理本）</li>
        <li><b>sg:Adaptation</b> — 衍生作品（影視/戲曲/動漫/遊戲/同人）</li>
        <li><b>sg:Artifact</b> — 器物（兵器/名馬/陣法/發明/印綬）</li>
        <li><b>sg:HistoricalSource</b> — 正史文獻（文史互證層）
          <ul><li>sg:RecordsOfThreeKingdoms 陳壽《三國志》 · sg:PeiAnnotation 裴松之注 · sg:HouHanShu 《後漢書》 · sg:ZizhiTongjian 《資治通鑑》</li></ul>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="paper">
  <h3>二、24 種核心有向關係（Object Properties · 按場景分組）</h3>
  <table class="data-table">
    <thead><tr><th>屬性</th><th>域 → 值域</th><th>語義</th><th>屬性特徵</th></tr></thead>
    <tbody>
'''
    rels = [
      ('swornBrotherOf','Person→Person','結拜兄弟','對稱 Symmetric'),
      ('enemyOf_person','Person→Person','敵對（人）','對稱'),
      ('masterOf / apprenticeOf','Person→Person','師徒（師↔徒）','互逆 inverseOf'),
      ('kinOf','Person→Person','親屬','對稱'),
      ('lordOf / ministerOf','Person→Person','主臣（君↔臣）','三國專屬·互逆'),
      ('belongsToForce','Person→Faction','所屬（人物→勢力）','三國專屬'),
      ('commands / fightsIn','Person→Battle','指揮/參戰','三國專屬'),
      ('alliedWith / enemyOf_force','Faction→Faction','結盟/敵對（勢力）','對稱·三國專屬'),
      ('battleAt','Battle→Place','發生於','三國專屬'),
      ('derivedFrom','Edition→Edition','版本演化自','傳遞 Transitive'),
      ('annotatedBy','Edition→Scholar','評點改造','三國專屬'),
      ('appearsIn','Person→Edition','登場於（版本隔離）','多版本核心'),
      ('includedIn','Event→Edition','收錄於（版本隔離）','多版本核心'),
      ('authored','Scholar→AcademicWork','著作',''),
      ('debatesWith','Scholar→Scholar','學術論戰','對稱'),
      ('studiesEdition','Scholar→Edition','研究',''),
      ('eventAt','Event→Place','發生於（事件）',''),
      ('adaptedFrom','Adaptation→Edition','改編自',''),
      ('possesses','Person→Artifact','持有','三國專屬'),
      ('usesArtifact','Battle→Artifact','使用（戰術器物）','三國專屬'),
      ('participatesIn','Person→Event','參與',''),
      ('activeAt','Person→Place','活動於',''),
      ('attestedIn / contradicts / embellishedFrom','Person/Event/Battle→HistoricalSource','正史互證（0/1/2 虛實）','文史互證專屬'),
      ('correspondsTo','Chapter→Chapter','跨版本對應回目','對稱·多版本核心'),
    ]
    for r,d,label,feat in rels:
        html += f'<tr><td><code>sg:{r}</code></td><td><code>{esc(d)}</code></td><td>{esc(label)}</td><td>{esc(feat)}</td></tr>'
    html += '''</tbody></table>
</section>

<section class="paper">
  <h3>三、受控詞表（11 族·摘錄）</h3>
  <div class="vocab-grid">
    <div class="vocab-card">
      <h4>版本族系 <code>version_family</code></h4>
      <ul><li>yanyi 演義系（24 卷）</li><li>zhizhuan 志傳系（20 卷）</li><li>pingdian 評點本（120 回）</li><li>modern 現代整理本</li><li>sequel 續書</li></ul>
    </div>
    <div class="vocab-card">
      <h4>虛實標註 <code>fictional_flag</code></h4>
      <ul><li><b>0</b> 正史有載（官渡/赤壁等）</li><li><b>1</b> 正史有載·小說加工（草船借箭/溫酒斬華雄）</li><li><b>2</b> 純虛構（桃園結義/過五關/祭東風）</li></ul>
    </div>
    <div class="vocab-card">
      <h4>異文類型 <code>variant_type</code></h4>
      <ul><li>vt_typo 訛字（范彊→范疆）</li><li>vt_missing 脫文</li><li>vt_extra 衍文（加《臨江仙》）</li><li>vt_rewrite 改寫（寧使→寧教）</li><li>vt_poetry 詩文增刪</li><li>vt_plot 情節增刪（刪燒魏延）</li><li>vt_commentary 評點</li></ul>
    </div>
    <div class="vocab-card">
      <h4>敘事階段 <code>narrative_phases</code></h4>
      <ul><li>黃巾之亂 184-189（1-2 回）</li><li>董卓之亂 189-192（3-9 回）</li><li>群雄逐鹿 192-208（10-42 回）</li><li>三國鼎立 208-234（43-104 回）</li><li>三國歸晉 234-280（105-120 回）</li></ul>
    </div>
  </div>
  <p class="note">完整詞表請 <a href="ontology/vocabularies.yaml">下載 YAML</a> 查看，包含人物類別、勢力、計謀、器物、正史文獻等全部枚舉。</p>
</section>

<section class="paper">
  <h3>四、版本演化本體圖（derivedFrom 邊）</h3>
  <pre class="ttl-snip">sg:zhouyuexiao  sg:derivedFrom  sg:jiajing       # 演義系同承祖本
sg:lizhuowu     sg:derivedFrom  sg:zhouyuexiao   # 合 240 則為 120 回
sg:zhongbojing  sg:derivedFrom  sg:lizhuowu      # 鍾評分支
sg:maozonggang  sg:derivedFrom  sg:zhongbojing   # 毛宗崗全面評改，取代一切舊本
sg:liyu         sg:derivedFrom  sg:lizhuowu      # 李漁另行評點
sg:renwen       sg:derivedFrom  sg:maozonggang   # 現代校點本
sg:shenbojun    sg:derivedFrom  sg:maozonggang   # 沈伯俊校理
sg:yefengchun   ——志傳系獨立發展，與演義系並列——
sg:yuxiangdou   sg:derivedFrom  sg:yefengchun    # 志傳繁本
sg:huangzhengfu sg:derivedFrom  sg:yefengchun    # 志傳簡本（或為更早狀態）</pre>
  <p>此即《三國演義》版本本體論的核心「世系圖」——毛本並非羅貫中原本直系，而是經李卓吾評本、鍾伯敬評本兩次改造後的第三手文本。</p>
</section>

<section class="paper">
  <h3>五、OWL 2 DL 推理約束</h3>
  <ul class="cls-list">
    <li><b>類不相交（DisjointClasses）：</b>Person / Faction / Battle / Place / Event / Scholar / AcademicWork / Adaptation / Artifact / LiteraryWork 互為不相交類，推理可檢測跨類實例衝突。</li>
    <li><b>函數/反函數屬性：</b>versionId / personId / forceId / battleId / locationId / eventId / scholarId / paperId / adaptId / artifactId 均為 <code>owl:InverseFunctionalProperty</code>，確保全局主鍵唯一。</li>
    <li><b>對稱屬性：</b>swornBrotherOf / enemyOf_person / kinOf / alliedWith / enemyOf_force / debatesWith / correspondsTo。</li>
    <li><b>傳遞屬性：</b>derivedFrom（版本演化可追溯）。</li>
    <li><b>互逆屬性：</b>masterOf↔apprenticeOf、lordOf↔ministerOf。</li>
    <li><b>跨本體聯動：</b>聲明 <code>sh:</code> 命名空間（水滸本體），人物/地名 ID 可跨棧 JOIN（例如 sg:person_caocao 與 sh: 中相關人物若有歷史關聯，可附加 owl:sameAs 鏈接）。</li>
  </ul>
</section>

<section class="paper">
  <h3>六、本體論文件位置（靜態託管）</h3>
  <table class="data-table">
    <thead><tr><th>文件</th><th>格式</th><th>說明</th></tr></thead>
    <tbody>
      <tr><td><a href="ontology/sanguo_kg_ontology.ttl">sanguo_kg_ontology.ttl</a></td><td>Turtle (OWL 2 DL)</td><td>完整 TBox+ABox（1248 行），包含 12 版本、16 學者、31 核心異文個體</td></tr>
      <tr><td><a href="ontology/vocabularies.yaml">vocabularies.yaml</a></td><td>YAML 1.2</td><td>11 族受控詞表，用於數據錄入校驗</td></tr>
      <tr><td>data/*.parquet</td><td>Apache Parquet</td><td>剩餘 ABox 數據（455 人物/115 戰役/107 事件/191 地名/12 論著/17 改編等），供 DuckDB-WASM 瀏覽器端查詢</td></tr>
      <tr><td>data/*.json</td><td>JSON</td><td>同數據 JSON 鏡像，瀏覽器端直接 fetch</td></tr>
    </tbody>
  </table>
  <p class="note">工程完全無服務器：所有知識圖譜查詢由 DuckDB-WASM 在瀏覽器本地執行，無後端、無數據庫、無 API，符合 GitHub Pages 靜態託管約束。</p>
</section>
'''
    write("ontology.html", html)

# ========== 页面：全文阅读 ==========
def page_read():
    # 直接把章节列表渲染为 <details>，默认第一回展开，顶部提供下拉快速跳转
    opts_html = ''.join(f'<option value="{c["no"]}">第{c["no"]}回 {esc(c["title"])}</option>' for c in read_data)
    chap_html = []
    for i,c in enumerate(read_data):
        paras = c.get('paragraphs') or c.get('paras') or []
        paras_html = ''.join(f'<p>{esc(p)}</p>' for p in paras if p.strip())
        open_attr = ' open' if i==0 else ''
        chap_html.append(f'''<details class="chapter"{open_attr} data-ch="{c["no"]}">
<summary><span class="ch-no">第{str(c["no"]).zfill(3)}回</span><span class="ch-title">{esc(c["title"])}</span><span class="ch-meta">{len(paras)}段 · {c.get("chars",len("".join(paras)))}字</span></summary>
<div class="ch-body">{paras_html}</div>
</details>''')
    html = header("全文阅读","read.html") + f'''
<section class="paper">
  <h2>正文閱讀</h2>
  <div class="ver-switch">
    <button class="btn small active" id="vb-mao" onclick="switchVer('mao')">毛宗崗評本（120 回 · 全文）</button>
    <button class="btn small" id="vb-zhou" onclick="switchVer('zhou')">周曰校刊本（192 章 · 全文）</button>
  </div>
  <div id="maoView">
  <div class="read-toolbar">
    <select id="chapSel" onchange="jumpSel(this.value)">
      <option value="">— 選擇章回跳轉 —</option>
      {opts_html}
    </select>
    <span class="small">版本：毛宗崗評本百二十回（通行本）</span>
  </div>
  <div id="chapterList">{''.join(chap_html)}</div>
  </div>
  <div id="zhouView" style="display:none">
    <div class="read-toolbar">
      <select id="zhouSel" onchange="showZhou(this.value)"><option value="">— 載入中 —</option></select>
      <span class="small" id="zhouMeta">版本：周曰校刊本</span>
    </div>
    <div id="zhouBody" class="ch-body"></div>
  </div>
</section>
<script>
function jumpSel(n){{
  if(!n)return;
  var all=document.querySelectorAll('#chapterList details');
  all.forEach(d=>d.open=false);
  var t=document.querySelector('#chapterList details[data-ch="'+n+'"]');
  if(t){{t.open=true;t.scrollIntoView({{behavior:'smooth',block:'start'}});document.getElementById('chapSel').value='';}}
}}
var ZY=null;
function esc2(s){{return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}}
function switchVer(v){{
  document.getElementById('maoView').style.display = v==='mao'?'':'none';
  document.getElementById('zhouView').style.display = v==='zhou'?'':'none';
  document.getElementById('vb-mao').classList.toggle('active', v==='mao');
  document.getElementById('vb-zhou').classList.toggle('active', v==='zhou');
  if(v==='zhou' && !ZY) loadZY();
}}
function loadZY(){{
  var m=document.getElementById('zhouMeta'); m.textContent='正在載入周曰校本全文…';
  fetch('data/zhouyuexiao.json').then(r=>r.json()).then(d=>{{
    ZY=d;
    var sel=document.getElementById('zhouSel');
    sel.innerHTML='<option value="">— 選擇章節跳轉 —</option>'+d.chapters.map(c=>'<option value="'+c.i+'">第'+c.i+'章 '+esc2(c.title)+'</option>').join('');
    m.textContent='版本：'+d.name+'（'+d.n_chapters+' 章 · '+d.chars.toLocaleString()+' 字 · 識典古籍粗校）';
    showZhou(1);
  }});
}}
function showZhou(n){{
  if(!ZY)return;
  n=parseInt(n)||1;
  var c=ZY.chapters[n-1];
  if(!c)return;
  document.getElementById('zhouBody').innerHTML='<h3>第'+c.i+'章　'+esc2(c.title)+'</h3>'+
    (c.vol?'<p class="small">'+esc2(c.vol)+'</p>':'')+
    c.text.split('\\n\\n').filter(x=>x.trim()).map(p=>'<p>'+esc2(p)+'</p>').join('');
  document.getElementById('zhouSel').value=n;
  window.scrollTo({{top:0,behavior:'smooth'}});
}}
</script>'''
    write("read.html", html)

# ========== 页面：人物志 ==========
def page_persons():
    cards = []
    for p in persons_sorted[:200]:
        fic = p.get('fiction',p.get('fictional_flag',0))
        fic_cls = ['tag-real','tag-half','tag-fic'][fic] if fic in (0,1,2) else 'tag-real'
        fic_lbl = ['正史','半虚构','虚构'][fic] if fic in (0,1,2) else '正史'
        fact = p.get('faction','') or ''
        zi = p.get('zi','') or ''
        labels = []
        if zi: labels.append(f'字 {esc(zi)}')
        if fact: labels.append(esc(fact))
        life = ''
        if p.get('birth') or p.get('death'):
            life = f'{p.get("birth","?")}—{p.get("death","?")}'
        desc = p.get('desc','') or ''
        cards.append(f'''<article class="person-card">
<h4><span class="{fic_cls}">{fic_lbl}</span> {esc(p.get("name",""))} <small>{' · '.join(labels)}</small></h4>
<div class="person-meta">提及 {p.get("total",0)} 次 · 首现第{p.get("first",0)}回 {f'· {life}' if life else ''}</div>
{('<p>'+esc(desc)+'</p>') if desc else ''}
</article>''')
    html = header("人物志","persons.html") + f'''
<section class="paper">
  <h2>人物志 · Persons</h2>
  <p>共 <b>{len(persons)}</b> 位人物。<span class="tag-real">正史</span>={sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==0)} · <span class="tag-half">半虚构</span>={sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==1)} · <span class="tag-fic">虚构</span>={sum(1 for p in persons if p.get('fiction',p.get('fictional_flag',0))==2)}。按提及总数排序，展示前 200 位。</p>
  <div class="person-grid">{''.join(cards)}</div>
</section>'''
    write("persons.html", html)

# ========== 通用卡片页 ==========
def page_list(fn, title, seal, items, render_item, subtitle=None, sort_key=None):
    if sort_key:
        items = sorted(items, key=sort_key)
    if subtitle is None:
        subtitle = f"共 {len(items)} 条记录"
    html = header(title, fn) + f'<section class="paper"><h2>{title}</h2><p>{subtitle}</p><div class="list-grid">'
    for it in items:
        html += render_item(it)
    html += '</div></section>'
    write(fn, html)

# ========== 通用时间线页 ==========
def page_timeline(fn, title, items, name_getter, year_getter, extra_getter=None):
    items_sorted = sorted(items, key=lambda x:(year_getter(x) or 9999, name_getter(x)))
    html = header(title, fn) + f'<section class="paper"><h2>{title}</h2><p>共 {len(items_sorted)} 条，按公元纪年排序。</p><div class="timeline">'
    for it in items_sorted:
        y = year_getter(it) or '—'
        n = name_getter(it)
        extra = extra_getter(it) if extra_getter else ''
        html += f'<div class="tl-item"><div class="tl-year">{y}</div><div class="tl-card"><h3>{esc(n)}</h3>{extra}</div></div>'
    html += '</div></section>'
    write(fn, html)

# ========== 各列表页 ==========
def render_faction(f):
    tot = f.get('total',0)
    return f'<article class="list-card"><h3>{esc(f.get("name",""))}</h3><p>提及 {tot} 次</p><p class="small">{esc(f.get("desc","") or "")}</p></article>'

def render_stratagem(s):
    return f'<article class="list-card"><h3>{esc(s.get("name",""))}</h3><p><b>分类：</b>{esc(s.get("type","") or "")}</p><p><b>章回：</b>第{esc(str(s.get("chapter","")))}回</p><p class="small">{esc(s.get("desc","") or "")}</p></article>'

def render_artifact(a):
    return f'<article class="list-card"><h3>{esc(a.get("name",""))}</h3><p><b>类型：</b>{esc(a.get("type","") or "")}</p><p><b>持有者：</b>{esc(a.get("owner","") or "")}</p><p class="small">提及 {a.get("total",0)} 次</p></article>'

def render_prophecy(p):
    return f'<article class="list-card"><h3>{esc(p.get("target","") or p.get("text","")[:20])}</h3><p><b>出处：</b>第{esc(str(p.get("chapter","")))}回 · <b>言者：</b>{esc(p.get("speaker","") or "")}</p><p class="small"><q>{esc(p.get("text","") or "")}</q></p><p class="small">{esc(p.get("meaning","") or p.get("note","") or "")}</p></article>'

def render_edition(e):
    fam_map={"yanyi":"演義系","zhizhuan":"志傳系","pingdian":"評點本","modern":"現代本","sequel":"續書"}
    fam_col={"yanyi":"#9e2b25","zhizhuan":"#b08d57","pingdian":"#3f6b5e","modern":"#3b4a6b","sequel":"#6b4a8a"}
    fam = e.get("family","")
    full = ' <span class="badge full">★全文</span>' if (e.get('hasFulltext') or e.get('fulltext')) else ' <span class="badge empty">元數據</span>'
    return f'''<article class="edition-card" style="border-left:4px solid {fam_col.get(fam,'#999')}">
<h3>{esc(e.get("name","") or e.get("title",""))}{full}</h3>
<p class="edition-meta"><b>簡稱：</b>{esc(e.get("short",""))} · <b>族系：</b>{fam_map.get(fam,fam)} · <b>年代：</b>{esc(str(e.get("year","")))} · <b>存世：</b>{esc(e.get("survival",""))} · <b>卷回：</b>{esc(e.get("chapters",""))}</p>
<p class="small"><b>刊者：</b>{esc(e.get("publisher",""))}</p>
<p class="edition-feature">{esc(e.get("feature","") or e.get("desc","") or "")}</p>
</article>'''

VARIANTS = VARIANTS_DATA['variants']
VT_LABEL = {"vt_typo":"訛字","vt_missing":"脫文","vt_extra":"衍文","vt_rewrite":"改寫","vt_poetry":"詩文增刪","vt_plot":"情節增刪","vt_commentary":"評點增刪","vt_add":"毛本新增","vt_transfer":"情節遷移"}
EDITIONS_V = VARIANTS_DATA['editions']

def render_variant(v):
    vt = v.get("type","")
    vt_label = VT_LABEL.get(vt, vt)
    ch = v.get("chapter",0)
    sec = v.get("section","")
    yef = v.get("yefengtext","")
    huang = v.get("huangtext","")
    extra = ""
    if yef:
        extra += f'<div class="vr-row"><span class="vr-tag yef">葉逢春本</span><q class="vr-text">{esc(yef)}</q></div>'
    if huang:
        extra += f'<div class="vr-row"><span class="vr-tag huang">黃正甫本</span><q class="vr-text">{esc(huang)}</q></div>'
    return f'''<article class="variant-card">
<header class="vr-head">
  <span class="vr-ch">第{ch}回</span>
  <span class="vr-sec">{esc(sec)}</span>
  <span class="vr-type">{esc(vt_label)}</span>
</header>
<div class="vr-body">
  <div class="vr-row"><span class="vr-tag mao">毛宗崗本（通行）</span><q class="vr-text">{esc(v.get("maotext",""))}</q></div>
  <div class="vr-row"><span class="vr-tag jia">嘉靖壬午本</span><q class="vr-text">{esc(v.get("jiajingtext",""))}</q></div>
  {extra}
</div>
<footer class="vr-foot"><b>校勘意義：</b>{esc(v.get("significance",""))}</footer>
</article>'''

def page_variants():
    # 專門的異文對勘頁，帶用戶自助對勘工具
    VR = load('variants_real.json') if (DOCS/'data'/'variants_real.json').exists() else {"items": []}
    real_cards = ''.join(
        '<article class="variant-card real">'
        '<header class="vr-head"><span class="vr-ch">毛第 %s 回 × 周第 %s 章</span>'
        '<span class="vr-type">全文實測</span><span class="vr-sim">相似度 %s</span></header>'
        '<div class="vr-body">'
        '<div class="vr-row"><span class="vr-tag mao">毛宗崗本</span><q class="vr-text">%s</q></div>'
        '<div class="vr-row"><span class="vr-tag zhou">周曰校刊本</span><q class="vr-text">%s</q></div>'
        '</div></article>' % (it["mao_ch"], it["zhou_ch"], it["sim"], esc(it["mao"]), esc(it["zhou"]))
        for it in VR["items"])
    var_types = {}
    for v in VARIANTS:
        t = v.get("type","")
        var_types[t]=var_types.get(t,0)+1
    type_filter = "".join(f'<button class="btn small" data-type="{t}" onclick="filterVariants(\'{t}\')">{VT_LABEL.get(t,t)}（{c}）</button>' for t,c in var_types.items())
    VT_LABEL_JSON = json.dumps(VT_LABEL, ensure_ascii=False)
    VS_JSON = json.dumps(VARIANTS, ensure_ascii=False)
    html = header("異文對勘","variants.html",f"毛宗崗本 × 周曰校刊本 全文實測異文 {len(VR['items'])} 則（自動對勘）+ 嘉靖壬午本等文獻校勘異文 {len(VARIANTS)} 則；含版本演化系譜圖與用戶自助對勘入口。") + f'''
<section class="paper">
  <h2>版本演化系譜</h2>
  <p>《三國演義》現存明刊本約 30 種、清刊本約 70 餘種，按文本系統可分「演義系」（24 卷 240 則單題）、「志傳系」（20 卷，含花關索故事）兩大平行系統，再由明末評點家合併為 120 回雙題評本，至毛宗崗本定型為通行本。下圖繪出 12 個主要版本的演化關係：</p>
  <div class="stemma">
    <svg viewBox="0 0 880 430" width="100%" style="max-width:900px;font-family:'Noto Serif SC',serif;font-size:12px;">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#9e2b25"/></marker>
      </defs>
      <!-- 祖本 -->
      <rect x="360" y="10" width="160" height="36" rx="4" fill="#faf6ed" stroke="#2f2a25" stroke-width="1.5"/>
      <text x="440" y="33" text-anchor="middle">羅貫中原本（元末明初·佚）</text>
      <!-- 分叉 -->
      <line x1="400" y1="46" x2="200" y2="90" stroke="#2f2a25" stroke-width="1" marker-end="url(#arrow)"/>
      <line x1="480" y1="46" x2="680" y2="90" stroke="#2f2a25" stroke-width="1" marker-end="url(#arrow)"/>
      <text x="270" y="75" fill="#9e2b25" font-weight="bold">演義系</text>
      <text x="590" y="75" fill="#b08d57" font-weight="bold">志傳系</text>
      <!-- 演义系 -->
      <rect x="120" y="90" width="160" height="32" rx="4" fill="#fdf3e9" stroke="#9e2b25"/><text x="200" y="110" text-anchor="middle">嘉靖壬午本（1522）★</text>
      <line x1="200" y1="122" x2="200" y2="170" stroke="#9e2b25" marker-end="url(#arrow)"/>
      <rect x="120" y="170" width="160" height="32" rx="4" fill="#e8f0f4" stroke="#2f6b8f" stroke-width="1.5"/><text x="200" y="190" text-anchor="middle" font-weight="bold">周曰校本（1591）★</text>
      <line x1="200" y1="202" x2="200" y2="250" stroke="#9e2b25" marker-end="url(#arrow)"/>
      <rect x="120" y="250" width="160" height="32" rx="4" fill="#eaf2ee" stroke="#3f6b5e"/><text x="200" y="270" text-anchor="middle">李卓吾評本（~1607）</text>
      <text x="210" y="246" fill="#3f6b5e" font-size="10">（合 240→120 回）</text>
      <!-- 志传系 -->
      <rect x="600" y="90" width="160" height="32" rx="4" fill="#fbf5e6" stroke="#b08d57"/><text x="680" y="110" text-anchor="middle">葉逢春本（~1548）☆</text>
      <line x1="640" y1="122" x2="560" y2="170" stroke="#b08d57" marker-end="url(#arrow)"/>
      <line x1="720" y1="122" x2="800" y2="170" stroke="#b08d57" marker-end="url(#arrow)"/>
      <rect x="480" y="170" width="160" height="32" rx="4" fill="#fbf5e6" stroke="#b08d57"/><text x="560" y="190" text-anchor="middle">余象斗本（~1592）</text>
      <rect x="720" y="170" width="160" height="32" rx="4" fill="#fbf5e6" stroke="#b08d57"/><text x="800" y="190" text-anchor="middle">黃正甫本（~1623）</text>
      <text x="810" y="166" fill="#b08d57" font-size="10">（簡本）</text>
      <!-- 评点系汇聚 -->
      <line x1="200" y1="282" x2="200" y2="320" stroke="#3f6b5e"/>
      <line x1="200" y1="300" x2="100" y2="300" stroke="#3f6b5e"/>
      <rect x="20" y="285" width="160" height="32" rx="4" fill="#eaf2ee" stroke="#3f6b5e"/><text x="100" y="305" text-anchor="middle">鍾伯敬評本（~1627）</text>
      <line x1="200" y1="320" x2="400" y2="370" stroke="#3f6b5e" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="320" y="370" width="160" height="36" rx="4" fill="#fbe9e7" stroke="#9e2b25" stroke-width="2"/>
      <text x="400" y="393" text-anchor="middle" font-weight="bold" fill="#9e2b25">毛宗崗評本（1679）★</text>
      <text x="400" y="420" text-anchor="middle" fill="#666" font-size="11">——三百餘年通行本；本站全文即此本</text>
      <!-- 现代整理本 -->
      <line x1="480" y1="405" x2="580" y2="405" stroke="#3b4a6b" stroke-dasharray="3,2"/>
      <rect x="580" y="388" width="150" height="34" rx="4" fill="#ebedf4" stroke="#3b4a6b"/>
      <text x="655" y="409" text-anchor="middle">人民文學出版社本（1953）</text>
      <line x1="480" y1="380" x2="580" y2="350" stroke="#3b4a6b" stroke-dasharray="3,2"/>
      <rect x="580" y="333" width="150" height="34" rx="4" fill="#ebedf4" stroke="#3b4a6b"/>
      <text x="655" y="354" text-anchor="middle">沈伯俊校理本（1992）</text>
      <!-- 李渔评本侧支 -->
      <rect x="200" y="320" width="150" height="0" fill="none"/>
      <line x1="280" y1="265" x2="340" y2="265" stroke="#3f6b5e" stroke-dasharray="3,2"/>
      <rect x="340" y="249" width="140" height="32" rx="4" fill="#eaf2ee" stroke="#3f6b5e"/>
      <text x="410" y="269" text-anchor="middle">李漁評本（~1670）</text>
    </svg>
    <p class="note">★ = 本站已收錄全文；☆ = 殘本/無電子全文可公開取用。實線為直接繼承關係，虛線為參校/並行關係。</p>
  </div>
</section>

<section class="paper">
  <h2>核心異文對照 · {len(VARIANTS)} 則</h2>
  <p>以下異文全部基於版本學校勘結論，涵蓋訛字、脫文、衍文、改寫、詩文增刪、情節增刪、評點增刪七大類。按類型過濾：</p>
  <div class="btn-row" id="type-filter">
    <button class="btn small active" data-type="all" onclick="filterVariants(\'all\')">全部（{len(VARIANTS)}）</button>
    {type_filter}
  </div>
  <div class="variant-list" id="variant-list">
    {''.join(render_variant(v) for v in VARIANTS)}
  </div>
</section>

<section class="paper">
  <h2>全文實測異文 · 毛宗崗本 × 周曰校刊本（{len(VR["items"])} 則）</h2>
  <p>以下異文由兩版本<b>全文自動對勘</b>產出（毛本 47,272 句 × 周曰校本 32,407 句，句子級對齊），差異可直接回溯原文核驗。因周曰校本採用識典古籍「粗校」文本，個別字或含 OCR 誤識，已在條目中原樣保留並可對照毛本辨讀。</p>
  <div class="variant-list" id="variant-list-real">
    {real_cards}
  </div>
</section>

<section class="paper">
  <h2>自助對勘：貼入異文，即時比對</h2>
  <p>如果你手頭有其他版本原文（嘉靖本某段、黃正甫本、葉逢春本殘卷、李卓吾評本等），可在此處分別粘貼毛本與對照本文字，系統將即時顯示差異高亮（純前端，不上傳任何數據）：</p>
  <div class="collate-tool">
    <div class="collate-col">
      <label>毛宗崗本（底本）</label>
      <textarea id="txtA" rows="8" placeholder="粘貼毛本原文，例如：寧教我負天下人，休教天下人負我！"></textarea>
    </div>
    <div class="collate-col">
      <label>對照版本（嘉靖本/葉逢春本/黃正甫本等）</label>
      <textarea id="txtB" rows="8" placeholder="粘貼另一版本原文，例如：寧使我負天下人，休教天下人負我！"></textarea>
    </div>
  </div>
  <div class="btn-row"><button class="btn primary" onclick="doDiff()">比對差異</button><button class="btn" onclick="document.getElementById(\'diff-out\').innerHTML=\'\'">清空</button></div>
  <div id="diff-out" class="diff-out"></div>
  <p class="note">說明：本工具採用最長公共子序列（LCS）算法做字符級 diff，適用於句/段級短文本對比。若你有完整版本全文，可按 <code>raw/&lt;version_id&gt;.txt</code> 命名放入倉庫，重新運行構建腳本即可入本體知識庫。</p>
</section>

<script>
const VT_MAP = {VT_LABEL_JSON};
const VS = {VS_JSON};
document.querySelectorAll('.variant-card').forEach((c,i)=>{{
  c.dataset.type = VS[i].type;
}});
function filterVariants(t){{
  document.querySelectorAll('#type-filter .btn').forEach(b=>b.classList.toggle('active', b.dataset.type===t));
  document.querySelectorAll('.variant-card').forEach((c,i)=>{{
    c.style.display = (t==='all'||VS[i].type===t) ? '' : 'none';
  }});
}}
function doDiff(){{
  const a=document.getElementById('txtA').value;
  const b=document.getElementById('txtB').value;
  if(!a||!b){{document.getElementById('diff-out').innerHTML='<p style="color:#9e2b25">請在兩側都輸入文本。</p>';return;}}
  // LCS char-level diff
  const m=a.length,n=b.length;
  const dp=Array.from({{length:m+1}},()=>new Array(n+1).fill(0));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){{
    if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1]+1;
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
  }}
  let i=m,j=n,out=[];
  while(i>0&&j>0){{
    if(a[i-1]===b[j-1]){{out.unshift(['eq',a[i-1]]);i--;j--;}}
    else if(dp[i-1][j]>=dp[i][j-1]){{out.unshift(['del',a[i-1]]);i--;}}
    else{{out.unshift(['ins',b[j-1]]);j--;}}
  }}
  while(i>0){{out.unshift(['del',a[i-1]]);i--;}}
  while(j>0){{out.unshift(['ins',b[j-1]]);j--;}}
  // merge consecutive
  let htmlA='<div class="diff-col"><h4>毛本</h4><p>',htmlB='<div class="diff-col"><h4>對照本</h4><p>';
  for(const [t,ch] of out){{
    const safe=ch==='<'?'&lt;':ch==='>'?'&gt;':ch==='\\n'?'<br/>':ch;
    if(t==='eq'){{htmlA+=safe;htmlB+=safe;}}
    else if(t==='del'){{htmlA+='<mark class="diff-del">'+safe+'</mark>';}}
    else{{htmlB+='<mark class="diff-ins">'+safe+'</mark>';}}
  }}
  htmlA+='</p></div>';htmlB+='</p></div>';
  document.getElementById('diff-out').innerHTML='<h4>比對結果（紅色刪除／綠色新增）</h4><div class="diff-grid">'+htmlA+htmlB+'</div>';
}}
</script>'''
    write("variants.html", html)

def render_scholar(s):
    return f'<article class="list-card"><h3>{esc(s.get("name",""))} <small>{esc(s.get("era","") or "")}</small></h3><p>{esc(s.get("role","") or "")} · {esc(s.get("type","") or "")}</p><p><b>代表作：</b>{esc(s.get("work","") or "")}</p><p>{esc(s.get("view","") or s.get("desc","") or "")}</p><p class="small">{esc(s.get("note","") or "")}</p></article>'

def render_paper(p):
    return f'<article class="list-card"><h3>{esc(p.get("title",""))}</h3><p><b>作者：</b>{esc(p.get("author","") or "")} · <b>年代：</b>{esc(str(p.get("year","")))}</p><p class="small">{esc(p.get("desc","") or "")}</p></article>'

def render_adapt(a):
    return f'<article class="list-card"><h3>{esc(a.get("name","") or a.get("title",""))} <small>{esc(str(a.get("year","")))}</small></h3><p><b>类型：</b>{esc(a.get("type","") or "")}</p><p class="small">{esc(a.get("note","") or a.get("desc","") or "")}</p></article>'

def render_poem(p):
    return f'<article class="poem-card"><h3>{esc(p.get("title",""))}</h3><div class="card-body"><pre class="poem-text">{esc(p.get("text",""))}</pre><p class="small">{esc(p.get("note","") or "")}</p></div></article>'

# 诗词回目：从 chapters 取前20回回目+开篇临江仙
POEMS = [
    {"title":"临江仙·滚滚长江东逝水","text":"滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。\n青山依旧在，几度夕阳红。\n白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢。\n古今多少事，都付笑谈中。","note":"杨慎《廿一史弹词》第三段说秦汉开场词，毛宗岗取为《三国演义》开篇。"},
    {"title":"第001回 宴桃园豪杰三结义　斩黄巾英雄首立功","text":"话说天下大势，分久必合，合久必分。","note":"毛本著名开卷语，奠定循环史观基调。"},
]
# 从 chapters 加前 30 回回目
for c in chapters[:30]:
    POEMS.append({"title":f"第{str(c['no']).zfill(3)}回  {c['title']}","text":"","note":""})

# 时空地图（Leaflet）
def page_map():
    pts_json = json.dumps([{
        'name':p['name'],'lng':p.get('lng') or p.get('longitude'),
        'lat':p.get('lat') or p.get('latitude'),'type':p.get('type',''),
        'total':p.get('total',0)
    } for p in places if (p.get('lng') or p.get('longitude')) and (p.get('lat') or p.get('latitude'))], ensure_ascii=False)
    html = header("时空地图","map.html") + f'''
<section class="paper">
  <h2>时空地图</h2>
  <p>共标注 <b>{sum(1 for p in places if p.get("lng") or p.get("longitude"))}</b> 处三国地名，以 Leaflet 加载 OpenStreetMap 瓦片。点击气泡查看提及次数。</p>
  <div id="map" style="height:600px;border:1px solid var(--border);border-radius:4px;"></div>
</section>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var pts={pts_json};
var m=L.map('map').setView([34,112],5);
L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png',{{maxZoom:10,attribution:'© OpenStreetMap'}}).addTo(m);
pts.forEach(function(p){{
  if(!p.lng||!p.lat)return;
  var r=L.circleMarker([p.lat,p.lng],{{radius:3+Math.min(10,Math.log10(p.total+1)*2),color:'#9e2b25',fillColor:'#9e2b25',fillOpacity:.6}}).addTo(m);
  r.bindPopup('<b>'+p.name+'</b><br/>'+p.type+'<br/>提及 '+p.total+' 次');
}});
</script>'''
    write("map.html", html)

# 关系图（力导向 D3）
def page_graph():
    # 取 top 人物互现
    co = cooccur if isinstance(cooccur,dict) else {'nodes':[],'links':cooccur}
    co_links = co.get('links',[])
    top_ids = set(p.get('name','') for p in persons_sorted[:40])
    # 归一化字段
    def _get(l,k,d=''):
        return l.get(k) or l.get({'a':'source','b':'target','count':'count'}[k],d)
    links = [l for l in co_links if _get(l,'a') in top_ids and _get(l,'b') in top_ids][:200]
    nodes = set()
    for l in links:
        nodes.add(_get(l,'a')); nodes.add(_get(l,'b'))
    nodes_json = json.dumps([{'id':n,'group':next((p.get('faction','其他') for p in persons if p.get('name')==n),'其他')} for n in nodes], ensure_ascii=False)
    links_json = json.dumps([{'source':_get(l,'a'),'target':_get(l,'b'),'value':l.get('count',1)} for l in links], ensure_ascii=False)
    html = header("人物关系","graph.html") + f'''
<section class="paper">
  <h2>人物关系 · 共现网络</h2>
  <p>基于毛本全文段落共现计算，展示 TOP 40 高频人物之间的共现关系（线条越粗共现越多）。可拖拽节点。</p>
  <svg id="graph" width="100%" height="680" style="border:1px solid var(--border);background:var(--paper);"></svg>
</section>
<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
var nodes={nodes_json}, links={links_json};
var svg=d3.select('#graph'), w=svg.node().clientWidth, h=680;
var sim=d3.forceSimulation(nodes).force('link',d3.forceLink(links).id(d=>d.id).distance(80)).force('charge',d3.forceManyBody().strength(-180)).force('center',d3.forceCenter(w/2,h/2));
var g=svg.append('g');
var link=g.append('g').selectAll('line').data(links).join('line').attr('stroke','#999').attr('stroke-opacity',.5).attr('stroke-width',d=>Math.sqrt(d.value));
var node=g.append('g').selectAll('g').data(nodes).join('g').call(d3.drag().on('start',(e,d)=>{{if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;}}).on('drag',(e,d)=>{{d.fx=e.x;d.fy=e.y;}}).on('end',(e,d)=>{{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}}));
node.append('circle').attr('r',6).attr('fill',d=>({{'曹魏':'#3b4a6b','蜀汉':'#9e2b25','东吴':'#3f6b5e','群雄':'#b08d57','东汉':'#6b4423','黄巾':'#8b6914','晋':'#2a4d69','南蛮':'#5a3921'}}[d.group]||'#888'));
node.append('text').attr('x',8).attr('y',3).style('font-size','11px').style('fill','var(--ink)').text(d=>d.id);
sim.on('tick',()=>{{link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);node.attr('transform',d=>'translate('+d.x+','+d.y+')');}});
</script>'''
    write("graph.html", html)

# 查询台（DuckDB-WASM）
def page_query():
    html = header("查询台","query.html") + '''
<section class="paper">
  <h2>本体查询台 · DuckDB-WASM</h2>
  <p>浏览器端无服务器查询：Parquet 文件在你的浏览器里被 DuckDB 即时加载，数据不出本机。试试以下示例：</p>
  <div class="btn-row" id="samples"></div>
  <textarea id="sql" rows="6" style="width:100%;font-family:var(--mono);font-size:13px;padding:10px;border:1px solid var(--border);border-radius:4px;background:var(--paper);">SELECT name, faction, zi, total FROM 'data/persons.parquet' ORDER BY total DESC LIMIT 20;</textarea>
  <div class="btn-row"><button class="btn primary" onclick="run()">运行查询</button><span id="status" class="small"></span></div>
  <div id="result" style="overflow:auto;max-height:500px;margin-top:12px;"></div>
</section>
<script type="module">
import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28/+esm';
const samples=[
  ['TOP20 人物',"SELECT name,faction,zi,total FROM 'data/persons.parquet' ORDER BY total DESC LIMIT 20;"],
  ['TOP10 地名',"SELECT name,type,total FROM 'data/places.parquet' ORDER BY total DESC LIMIT 10;"],
  ['按势力分组统计',"SELECT faction,count(*) n FROM 'data/persons.parquet' WHERE faction<>'' GROUP BY faction ORDER BY n DESC;"],
  ['战役年份排序',"SELECT name,year,outcome FROM 'data/battles.parquet' WHERE year>180 ORDER BY year LIMIT 20;"],
];
document.getElementById('samples').innerHTML=samples.map(s=>'<button class="btn" onclick="document.getElementById(\\'sql\\').value='+JSON.stringify(JSON.stringify(s[1]))+';run()">'+s[0]+'</button>').join('');
let db,conn;
async function init(){
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  const worker = await duckdb.createDuckDBWorker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  conn = await db.connect();
  document.getElementById('status').textContent='DuckDB 已就绪';
}
window.run=async function(){
  if(!conn){document.getElementById('status').textContent='正在加载 DuckDB…';await init();}
  const sql=document.getElementById('sql').value;
  document.getElementById('status').textContent='查询中…';
  try{
    const r=await conn.query(sql);
    const cols=r.schema.fields.map(f=>f.name);
    let h='<table class="data-table"><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
    for(const row of r){h+='<tr>';for(const c of cols){h+='<td>'+(row[c]??'')+'</td>';}h+='</tr>';}
    h+='</tbody></table>';
    document.getElementById('result').innerHTML=h;
    document.getElementById('status').textContent='返回 '+r.numRows+' 行';
  }catch(e){document.getElementById('result').innerHTML='<pre style="color:#9e2b25">'+e.message+'</pre>';document.getElementById('status').textContent='错误';}
};
window.sql_sample=function(s){document.getElementById('sql').value=s;run();};
init();
</script>'''
    write("query.html", html)

# 统计析
def page_stats():
    # 各势力人数
    fac_count = {}
    for p in persons:
        f=p.get('faction','其他') or '其他'
        fac_count[f]=fac_count.get(f,0)+1
    fac_rows=''.join(f'<tr><td>{esc(k)}</td><td>{v}</td></tr>' for k,v in sorted(fac_count.items(), key=lambda x:-x[1]))
    # 字频
    freq_rows=''.join(f'<tr><td>{esc(fc[0])}</td><td>{fc[1]}</td></tr>' for fc in freq[:30])
    html = header("统计析","stats.html") + f'''
<section class="paper">
  <h2>统计析 · Statistics</h2>
  <div class="kpi-row">
    <div class="kpi"><div class="big">{stat.get("total_chars",590968):,}</div><div class="small">总字数</div></div>
    <div class="kpi"><div class="big">{len(persons)}</div><div class="small">人物</div></div>
    <div class="kpi"><div class="big">{len(battles)}</div><div class="small">战役</div></div>
    <div class="kpi"><div class="big">{len(events)}</div><div class="small">事件</div></div>
    <div class="kpi"><div class="big">{len(places)}</div><div class="small">地名</div></div>
    <div class="kpi"><div class="big">{len(editions)}</div><div class="small">版本</div></div>
  </div>
  <h3>势力分布</h3>
  <table class="data-table"><thead><tr><th>势力</th><th>人数</th></tr></thead><tbody>{fac_rows}</tbody></table>
  <h3>字频 TOP30</h3>
  <table class="data-table"><thead><tr><th>字</th><th>频次</th></tr></thead><tbody>{freq_rows}</tbody></table>
</section>'''
    write("stats.html", html)

# ========== 三个专题页（虚实/天命/阅读指南）==========
def page_mirror():
    # 取 12 个经典虚实对比
    items = [
        ("桃源结义", "虚", "三人『寝则同床，恩若兄弟』《三国志·关羽传》，但无桃园结义仪式记载","《三国志平话》已具雏形，《三国演义》润色为千古名典"),
        ("温酒斩华雄", "虚", "华雄为孙坚所杀（《三国志·孙破虏传》）","关羽斩华雄乃虚构，成就关公第一功"),
        ("三英战吕布", "虚", "公孙瓒未参与讨董，刘关张不在虎牢","小说虚构以显吕布之勇与三杰之义"),
        ("过五关斩六将", "虚", "六将名字及关卡路线史无记载","关羽辞曹归刘是史实，但路线与所斩六将为虚构"),
        ("草船借箭", "半虚", "孙权濡须口探曹营有『借箭』影子（《魏略》），主角非孔明","移花接木至孔明，凸显其智"),
        ("借东风", "虚", "冬季长江确有东南风偶发，但无孔明祭风","把自然现象神化为诸葛道术"),
        ("空城计", "虚", "街亭之役时司马懿驻宛，不在阳平","郭冲『诸葛五事』已有此传说，裴松之已驳"),
        ("三气周瑜", "虚", "周瑜气度恢廓，病逝巴丘，非被气死","小说虚构以烘托孔明"),
        ("单刀赴会", "半虚", "鲁肃与关羽单刀俱会是史实，但双方皆单刀","小说改写为关羽一人赴会，英气逼人"),
        ("刮骨疗毒", "实", "羽尝为流矢中臂，医（非华佗）刮骨去毒，羽谈笑自若（《三国志·关羽传》）","史实精彩，但医者非华佗（华佗早逝）"),
        ("七擒孟获", "半虚", "南征确有其事，『七擒七纵』见《华阳国志》《汉晋春秋》，细节存疑","小说详写七次擒纵以张诸葛之智"),
        ("六出祁山", "半虚", "诸葛亮北伐五次，仅两出祁山","小说概称『六出祁山』以整齐叙事"),
    ]
    tag_map = {"实":"tag-real","半虚":"tag-half","虚":"tag-fic"}
    cards=''.join(
        f'<article class="list-card"><h3>{esc(n)} <span class="{tag_map[v]}">{v}</span></h3><p><b>史实：</b>{esc(h)}</p><p class="small"><b>小说：</b>{esc(nv)}</p></article>'
        for n,v,h,nv in items
    )
    html = header("虚实对照","mirror.html") + f'<section class="paper"><h2>虚实对照</h2><p>章学诚《丙辰札记》评三国「七分实事，三分虚构」。下表对照 12 个经典情节的史/虚差异。</p><div class="list-grid">{cards}</div></section>'
    write("mirror.html", html)

def page_destiny():
    items = [
        ("分久必合合久必分","开卷语，奠定循环史观；结尾三国归晋呼应。"),
        ("苍天已死黄天当立","张角黄巾起义口号，以五德终始预言汉室将终。"),
        ("许劭评曹操『治世之能臣乱世之奸雄』","为曹操一生定调，属于『人物风鉴』式谶语。"),
        ("的卢马妨主","徐庶告知刘备的卢妨主，刘备不信；后庞统乘的卢殒命落凤坡应验。"),
        ("卧龙凤雏得一可安天下","司马徽语；刘备二人兼得却未得天下，暗示天命有归。"),
        ("三马同槽","曹操梦三马同槽，疑马腾父子，后应验为司马懿、司马师、司马昭。"),
        ("白帝托孤","刘备谓『君才十倍曹丕，若嗣子可辅则辅之，如其不才君可自取』，千古疑案。"),
        ("魏延反骨","孔明初见魏延即谓其脑后有反骨，后魏延于五丈原后叛乱被斩。"),
        ("五丈原禳星","诸葛祈禳北斗求寿，主灯被魏延扑灭，命定归天。"),
        ("乐不思蜀","刘禅『此间乐不思蜀』，印证『朽木不可雕』亡国之象。"),
    ]
    cards=''.join(f'<article class="list-card"><h3>{esc(t)}</h3><p>{esc(d)}</p></article>' for t,d in items)
    html = header("天命叙事","destiny.html") + f'<section class="paper"><h2>天命叙事</h2><p>《三国演义》以天命循环与预言谶纬贯穿全书，下列 10 处关键谶纬/预言与应验。</p><div class="list-grid">{cards}</div></section>'
    write("destiny.html", html)

def page_guide():
    html = header("阅读指南","guide.html") + '''
<section class="paper">
  <h2>阅读指南</h2>
  <h3>底本选择</h3>
  <p>本文在线全文采用<b>毛宗岗评本（1679年刊）</b>整理，回目对偶、开篇临江仙、尊刘贬曹倾向均为毛本特征；
  若要读更接近罗贯中原始版本，请参看「版本族谱」中的<b>嘉靖本《三国志通俗演义》（1522）</b>。
  学术阅读推荐<b>沈伯俊校理本</b>（凤凰出版社），订正了毛本若干地理与人物讹误。</p>
  <h3>工程导航</h3>
  <ul>
    <li><b>卷·首页</b>：总体入口与 KPI 概览</li>
    <li><b>元·本体论</b>：OWL 2 规范（TTL/YAML 下载）</li>
    <li><b>读·全文阅读</b>：毛本 120 回在线阅读</li>
    <li><b>人/势/地/战/事/计/物/谶</b>：八大实体名录</li>
    <li><b>版·版本族谱 / 勘·异文对勘</b>：多版本研究入口</li>
    <li><b>系·人物关系 / 图·时空地图</b>：可视化</li>
    <li><b>问·查询台</b>：DuckDB-WASM 无服务器 SQL</li>
    <li><b>学·学术史 / 论·论著举要</b>：学术脉络</li>
    <li><b>艺·衍生改编 / 诗·诗词回目</b>：文学与衍生</li>
    <li><b>虚·虚实对照 / 命·天命叙事</b>：文学批评专题</li>
  </ul>
  <h3>数据与接口</h3>
  <p>所有数据均开放在 <code>docs/data/</code> 目录下，可直接以 JSON / Parquet 两种格式下载复用。Parquet 可直接在查询台通过 SQL 调用。本体 TTL/YAML 从「本体论」页下载，可在 Protégé 中打开。</p>
</section>'''
    write("guide.html", html)

# ========== 主执行 ==========
def _year_int(x):
    try: return int(x)
    except: return 9999

if __name__ == "__main__":
    # 清理旧版繁体/空壳页面
    legacy = ['academy.html','entities.html','relations.html','themes.html','foreshadow.html',
              'genealogy.html','heroes.html','taoyuan.html','sanjue.html','poems.html','timeline.html']
    for f in legacy:
        p=DOCS/f
        if p.exists(): p.unlink()
        # 新版 timeline.html 留空（battles/events 已经是时间线格式）
    # 复制 TTL/YAML 到 docs/ontology/
    ont_dir = DOCS/'ontology'
    ont_dir.mkdir(exist_ok=True)
    for fn in ['sanguo_kg_ontology.ttl','vocabularies.yaml']:
        src = ROOT/'03_本体论规范'/fn
        if src.exists(): shutil.copy(src, ont_dir/fn)
    # 复制 read.json 到 data/（同源）
    shutil.copy(DOCS/'data'/'read.json', DATA/'read.json')
    # 修复后的 battles/events 回写到 data/
    json.dump(battles, open(DATA/'battles.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
    json.dump(events,  open(DATA/'events.json','w',encoding='utf-8'),  ensure_ascii=False, indent=2)
    shutil.copy(DATA/'battles.json', DOCS/'data'/'battles.json')
    shutil.copy(DATA/'events.json',  DOCS/'data'/'events.json')
    # 生成所有页
    page_index(); page_ontology(); page_read(); page_persons()
    page_list("factions.html","势力谱","势",factions,lambda f:f'<article class="list-card"><h3>{esc(f.get("name",""))} <small>{esc(f.get("full","") or "")}</small></h3><p>提及 {f.get("total",0)} 次 · 都城：{esc(f.get("capital","") or "")} · 主公：{esc(f.get("lord","") or "")}</p><p class="small">{esc(f.get("type","") or "")}</p></article>',sort_key=lambda x:-x.get('total',0))
    page_list("places.html","地理志","地",sorted(places,key=lambda x:-x.get('total',0)),lambda p:f'<article class="list-card"><h3>{esc(p.get("name",""))} <small>{esc(p.get("type","") or "")}</small></h3><p><b>今址：</b>{esc(p.get("modern","") or "")}</p><p><b>经纬度：</b>{p.get("lng","")} , {p.get("lat","")}</p><p><b>提及：</b>{p.get("total",0)} 次</p><p class="small">{esc(p.get("note","") or "")}</p></article>',subtitle=f"共 {len(places)} 处地名，全部标注经纬度（若可考）")
    page_timeline("battles.html","战役史",battles,lambda x:x['name'],lambda x:x.get('year'),lambda x:f'<p class="tl-meta">公元{x.get("year","?")}年 · {esc(x.get("type","") or "会战")}</p><p><b>双方：</b>{esc(x.get("side_a","") or "")} vs {esc(x.get("side_b","") or "")}</p><p><b>结果：</b>{esc(x.get("outcome","") or "")}</p><p class="small">{esc(x.get("desc","") or "")}</p>')
    page_timeline("events.html","事件录",events,lambda x:x['name'],lambda x:x.get('year'),lambda x:f'<p class="tl-meta">公元{x.get("year","?")}年</p><p><b>相关：</b>{esc(x.get("persons","") or x.get("related","") or "")}</p><p class="small">{esc(x.get("desc","") or "")}</p>')
    page_list("stratagems.html","计谋鉴","计",stratagems,render_stratagem,sort_key=lambda x:x.get('chapter',0) or 0)
    page_list("artifacts.html","器物簿","物",artifacts,render_artifact)
    page_list("prophecies.html","谶纬考","谶",prophecies,render_prophecy)
    page_list("versions.html","版本族谱","版",editions,render_edition,subtitle="12 个主要版本，按族系（演義/志傳/評點/現代/續書）分色顯示。★=全文已收錄")
    page_variants()
    page_map(); page_graph(); page_query(); page_stats()
    page_list("scholars.html","学术史","学",scholars,render_scholar)
    page_list("papers.html","论著举要","论",papers,render_paper,sort_key=lambda x:x.get('year',0) or 0)
    page_list("adaptations.html","衍生改编","艺",adaptations,render_adapt,sort_key=lambda x:_year_int(x.get('year',9999)))
    page_list("poetry.html","诗词回目","诗",POEMS,render_poem,subtitle=f"开篇词 + 前 {min(30,len(chapters))} 回回目")
    page_mirror(); page_destiny(); page_guide()
    print("ALL PAGES REBUILT")
