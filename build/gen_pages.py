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
</header><main>'''

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
    html = header("本体论规范","ontology.html") + '''
<section class="paper">
  <h2>本体论 OWL 2 规范</h2>
  <p>本体文件采用 Turtle 语法，兼容 Protégé / rdflib 等工具直接打开。词表采用 YAML 受控词表。</p>
  <div class="btn-row">
    <a class="btn primary" href="ontology/sanguo_kg_ontology.ttl">📥 下载本体 TTL（12 版本 / 12 类）</a>
    <a class="btn" href="ontology/vocabularies.yaml">📥 下载受控词表 YAML</a>
  </div>

  <h3>顶级类（Classes）</h3>
  <ul class="cls-list">
    <li><b>sg:Thing</b> — 顶层抽象事物</li>
    <li><b>sg:Wu / Shi / ShiJian / Di</b> — 四范域：物 / 事 / 时 / 地</li>
    <li><b>sg:VersionFamily</b> — 版本族（演义系/志传系）</li>
    <li><b>sg:Edition</b> — 具体版本（刊本/抄本/评本/现代整理本）</li>
    <li><b>sg:Chapter</b> — 回/则（叙事单元）</li>
    <li><b>sg:Paragraph</b> — 段落（文本原子）</li>
    <li><b>sg:VariantReading</b> — 异文（跨版本文字差异）</li>
    <li><b>sg:Commentary</b> — 评点（毛评/李评/李渔评/钟评）</li>
    <li><b>sg:Person / Faction / Office / Place</b> — 人物 / 势力 / 官职 / 地点</li>
    <li><b>sg:Artifact / Stratagem / Battle / Event</b> — 器物 / 计谋 / 战役 / 事件</li>
    <li><b>sg:Prophecy</b> — 谶纬预言</li>
    <li><b>sg:Scholar / Paper / Adaptation</b> — 学者 / 论著 / 改编作品</li>
  </ul>

  <h3>24 种有向关系（Object Properties）</h3>
  <table class="data-table">
    <thead><tr><th>属性</th><th>域</th><th>值域</th><th>说明</th></tr></thead><tbody>
'''
    rels = [
      ('allyOf','结为同盟','Person/Faction','Person/Faction'),
      ('appearsIn','出场于','Person/Place','Chapter'),
      ('belongsTo','归属','Person/Artifact','Faction'),
      ('defeats','战胜','Person/Faction','Person/Faction'),
      ('fatherOf','生父','Person','Person'),
      ('motherOf','生母','Person','Person'),
      ('swornBrotherOf','结义兄弟','Person','Person'),
      ('swornSisterOf','结义姐妹','Person','Person'),
      ('spouseOf','配偶','Person','Person'),
      ('siblingOf','同胞兄弟/姐妹','Person','Person'),
      ('sonOf','子（父/母）','Person','Person'),
      ('lordOf','君主','Person','Person'),
      ('subjectOf','臣属','Person','Person'),
      ('kills','诛杀','Person','Person'),
      ('serves','事奉/效力','Person','Person/Faction'),
      ('locatesIn','位于','Battle/Event/Place','Place'),
      ('participatesIn','参与','Person','Battle/Event'),
      ('uses','使用','Person/Battle','Artifact/Stratagem'),
      ('mentions','提及','Paragraph/Commentary','Person/Place/Thing'),
      ('variantOf','异文于','VariantReading','Paragraph'),
      ('basedOn','底本','Edition','Edition'),
      ('commentsOn','评点','Commentary','Paragraph/Chapter'),
      ('predicts','预言','Prophecy','Event/Person'),
      ('cites','引用/论述','Paper','Edition/Person/Event'),
    ]
    for r,label,d,rn in rels:
        html += f'<tr><td><code>sg:{r}</code></td><td>{esc(d)}</td><td>{esc(rn)}</td><td>{esc(label)}</td></tr>'
    html += '''</tbody></table>
  <h3>数据属性（Datatype Properties）</h3>
  <ul class="cls-list">
    <li><b>sg:zi</b>（字）、<b>sg:hao</b>（号）、<b>sg:birthYear</b>、<b>sg:deathYear</b>、<b>sg:hometown</b>、<b>sg:fictionalFlag</b>（0正史/1半虚构/2虚构）</li>
    <li><b>sg:year</b>（公元纪年）、<b>sg:chapterNo</b>、<b>sg:longitude/latitude</b>、<b>sg:outcome</b>、<b>sg:sourceText</b>（原文片段）</li>
  </ul>
</section>'''
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
  <div class="read-toolbar">
    <select id="chapSel" onchange="jumpSel(this.value)">
      <option value="">— 選擇章回跳轉 —</option>
      {opts_html}
    </select>
    <span class="small">版本：毛宗崗評本百二十回</span>
  </div>
  <div id="chapterList">{''.join(chap_html)}</div>
</section>
<script>
function jumpSel(n){{
  if(!n)return;
  var all=document.querySelectorAll('#chapterList details');
  all.forEach(d=>d.open=false);
  var t=document.querySelector('#chapterList details[data-ch="'+n+'"]');
  if(t){{t.open=true;t.scrollIntoView({{behavior:'smooth',block:'start'}});document.getElementById('chapSel').value='';}}
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
    return f'<article class="list-card"><h3>{esc(e.get("name","") or e.get("title",""))}</h3><p><b>家族：</b>{esc(e.get("family","") or "")} · <b>年代：</b>{esc(e.get("year","") or e.get("era","") or "")}</p><p class="small">{esc(e.get("desc","") or e.get("note","") or "")}</p></article>'

def render_variant(v):
    # variants 直接用固定示例
    return f'<article class="list-card"><h3>{esc(v.get("title",""))}</h3><p><b>毛本：</b><q>{esc(v.get("mao",""))}</q></p><p><b>嘉靖本：</b><q>{esc(v.get("jiajing",""))}</q></p><p class="small">{esc(v.get("note","") or "")}</p></article>'

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

# 异文对勘：8 组经典异文
VARIANTS = [
    {"title":"卷首词（临江仙）","mao":"滚滚长江东逝水……（杨慎词）","jiajing":"（无此词；嘉靖本以『祭天地桃园结义』起头）","note":"毛宗岗评本新增，借杨慎词为全书定调。"},
    {"title":"回目对偶","mao":"严格 120 回七言对偶回目","jiajing":"240 则，以『则』分，单句七字，不对偶","note":"毛本参照李卓吾评本改造回目。"},
    {"title":"刘备形象 · 初见孔明","mao":"玄德拱立阶下半晌，先生未醒……玄德犹然侍立","jiajing":"玄德叉手立于阶下，先生仰卧于堂上，玄德见先生翻身将起，忽又朝里壁睡着","note":"毛本强化刘备『虔诚仁厚』。"},
    {"title":"诸葛亮欲烧魏延（上方谷）","mao":"（此段删去）","jiajing":"孔明于上方谷（葫芦谷）设计火攻，欲连魏延一并烧死，天降大雨未果","note":"毛宗岗删此段以纯化孔明形象。地名是『上方谷/葫芦谷』，非『子午谷』（子午谷是魏延请兵奇袭长安之地）。"},
    {"title":"关羽「华容道义释曹操」","mao":"关羽放曹后自缚请罪，孔明欲斩，刘备求情","jiajing":"基本同毛本，但文字多口语化","note":"嘉靖本有张辽求情关羽的更多细节。"},
    {"title":"曹操杀吕伯奢","mao":"『宁教我负天下人，休教天下人负我』","jiajing":"『宁使我负天下人，休教天下人负我』（一字之差，语境略异）","note":"毛本作『教』，嘉靖本作『使』；今通行引用多为毛本。"},
    {"title":"刘备『妻子如衣服』论","mao":"『兄弟如手足，妻子如衣服。衣服破，尚可缝；手足断，安可续？』","jiajing":"文字略同，但置于张飞自责之后更直接","note":"毛本删削部分口语，文气更顺。"},
    {"title":"结尾诗","mao":"鼎足三分已成梦，后人凭吊空牢骚","jiajing":"一篇古风，详述三分终归一统，以『再受禅依样画葫芦』作结","note":"毛本改尾为七绝，余韵更足。"},
]

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
    page_list("versions.html","版本族谱","版",editions,render_edition)
    page_list("variants.html","异文对勘","勘",VARIANTS,render_variant,subtitle="8 组经典异文，对比毛本与嘉靖本/志传系文字差异")
    page_map(); page_graph(); page_query(); page_stats()
    page_list("scholars.html","学术史","学",scholars,render_scholar)
    page_list("papers.html","论著举要","论",papers,render_paper,sort_key=lambda x:x.get('year',0) or 0)
    page_list("adaptations.html","衍生改编","艺",adaptations,render_adapt,sort_key=lambda x:_year_int(x.get('year',9999)))
    page_list("poetry.html","诗词回目","诗",POEMS,render_poem,subtitle=f"开篇词 + 前 {min(30,len(chapters))} 回回目")
    page_mirror(); page_destiny(); page_guide()
    print("ALL PAGES REBUILT")
