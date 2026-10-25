# -*- coding: utf-8 -*-
"""一次性生成全部 24 研究页 + 首页 + 本体页 + 查询台"""
import os, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT/'data'
DOCS = ROOT/'docs'
DOCS.mkdir(exist_ok=True)
(DOCS/'data').mkdir(exist_ok=True)

def load(p): return json.load(open(DATA/p,encoding='utf-8'))
persons   = sorted(load('persons_db.json'), key=lambda x:-x.get('total',0))
factions  = sorted(load('factions.json'), key=lambda x:-x.get('total',0))
places    = sorted(load('places.json'), key=lambda x:-x.get('total',0))
battles   = sorted(load('battles.json'), key=lambda x:(x.get('year') or 9999, x.get('chapter') or 0))
events    = sorted(load('events.json'), key=lambda x:(x.get('year') or 9999, x.get('chapter') or 0))
artifacts = load('artifacts.json')
stratagems= load('stratagems.json')
prophecies= load('prophecies.json')
editions  = load('editions.json')
scholars  = load('scholars.json')
papers    = load('papers.json')
adaptations=load('adaptations.json')
cooccur   = load('cooccurrence.json')
freq      = load('freq.json')
stat      = load('stat.json')

# 导航 24 条目（与红楼未完范式对齐）
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

def header(title, active=""):
    nav_html = '<div class="nav-grid">'
    for label, href, seal in NAV:
        cls = "nav-card" + (" active" if href==active else "")
        nav_html += f'<a class="{cls}" href="{href}"><span class="seal">{seal}</span><span>{label}</span></a>'
    nav_html += '</div>'
    return f'''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 三国演义数字人文研究</title>
<link rel="stylesheet" href="assets/app.css">
</head><body>
<header class="site-header"><div class="header-inner">
<div class="brand"><span class="seal big">三</span><div class="brand-txt"><h1>三国演义 · 数字人文研究</h1><p class="subtitle">Romance of the Three Kingdoms — An Ontology-driven Digital Edition</p></div></div>
<p class="tagline">滚滚长江东逝水，浪花淘尽英雄。以本体论重构毛宗岗评本一百二十回，做文本、图谱、版本、地理、学术五维校勘。</p>
{nav_html}
</div></header><main>'''

def footer():
    return '''</main><footer class="site-footer"><div class="footer-inner">
<p>本项目以罗贯中《三国演义》毛宗岗评本为底本，参照 <em>The Story of the Stone</em> 与 <em>The Journey to the West</em> 数字人文工程构建。OWL 2 DL 本体 / 无服务器 DuckDB-WASM 查询 / 多版本异文对勘</p>
<p class="small">© 数字人文研究 · 宣纸式阅读体验</p></div></footer>
<script src="assets/app.js"></script></body></html>'''

def write_page(filename, title, content):
    html = header(title, filename) + content + footer()
    (DOCS/filename).write_text(html, encoding='utf-8')
    print("wrote", filename)

# ========== 首页 ==========
def page_index():
    total_chars = stat.get('total_chars', 590968)
    cards = [
        ('人物志', 'persons.html', '人', f'{len(persons)}', '四百五十五位人物，标注正史/半虚/纯虚构三档'),
        ('战役史', 'battles.html', '战', f'{len(battles)}', '从黄巾到三国归晋，一百一十五场战事'),
        ('地理志', 'places.html', '地', f'{len(places)}', '一百九十一处地名，带古今经纬度坐标'),
        ('全文阅读', 'read.html', '读', f'120回', f'毛宗岗评本 {total_chars:,} 字，分回带人物出场标引'),
        ('本体论', 'ontology.html', '元', 'OWL2', 'TBox/ABox 分离，10 大类 24 关系'),
        ('查询台', 'query.html', '问', 'SQL', '无服务器 DuckDB-WASM 直接查 19 张 Parquet'),
    ]
    blocks = '<section class="hero"><div class="hero-paper"><div class="hero-frame">'
    blocks += '<p class="hero-motto">滚滚长江东逝水，浪花淘尽英雄。<br/>是非成败转头空，青山依旧在，几度夕阳红。</p>'
    blocks += '<p class="hero-sub">—— 明·杨慎《临江仙》，毛宗岗评本卷首词</p>'
    blocks += '<div class="hero-meta"><span>底本：毛宗岗评本一百二十回</span><span>字数：{:,}</span><span>实体：{} 人 · {} 地 · {} 战</span></div>'.format(total_chars, len(persons), len(places), len(battles))
    blocks += '</div></div></section>'
    blocks += '<section class="cards">'
    for title,href,seal,num,desc in cards:
        blocks += f'''<a class="card" href="{href}">
        <div class="card-seal">{seal}</div>
        <div class="card-num">{num}</div>
        <h3>{title}</h3><p>{desc}</p></a>'''
    blocks += '</section>'
    blocks += '<section class="intro-paper"><h2>研究说明</h2>'
    blocks += '<p>本站参照《<a href="https://yejinlei.github.io/The-Story-of-the-Stone" target="_blank">The Story of the Stone</a>》与《<a href="https://yejinlei.github.io/the-journey-to-the-west/" target="_blank">The Journey to the West</a>》两个数字人文工程的构建范式——宣纸式阅读视觉、24 研究入口、OWL 2 本体驱动、多版本异文对勘、学术成果层——以明罗贯中《三国演义》毛宗岗评本为底本，做「文本 + 本体 + 图谱 + 地图 + 查询」五位一体的可复现数字人文研究。</p>'
    blocks += '<p>技术栈：<strong>纯静态</strong>、<strong>无服务器</strong>、<strong>DuckDB-WASM + Parquet</strong> 浏览器端列式查询（不使用 Neo4j）；<strong>sg_</strong> 前缀 ID 体系与《水浒传》本体 <code>sh_</code> 技术栈完全兼容，可跨本体联动。</p>'
    blocks += '<ul class="dim-list"><li><b>TBox 本体层：</b>sg:Character / sg:Faction / sg:Place / sg:Battle / sg:Event / sg:Stratagem / sg:Artifact / sg:Prophecy / sg:Version / sg:Scholarship 十大类 + 24 种对象属性（含 6 种三国专属：效忠/割据/联姻/诈降/挟令/禅代）</li>'
    blocks += '<li><b>ABox 实例层：</b>{} 位人物（337 正史 / 64 半虚构 / 54 纯虚构）· {} 处地名（191 带坐标）· {} 场战役 · {} 件事件 · {} 计 · {} 谶语 · 17 器物 · 15 学者 · 12 论著 · 17 衍生作品</li>'.format(
        len(persons), len(places), len(battles), len(events), len(stratagems), len(prophecies))
    blocks += '<li><b>版本族谱：</b>16 个版本节点，从嘉靖壬午本（1522）到今本沈伯俊校理本；嘉靖本/李卓吾评本/毛本/沈校本四大核心版本。</li>'
    blocks += '<li><b>虚实标注：</b>全部实体加注 <code>fictional_flag</code>：0=正史有其人其事，1=正史有其人但演义加工，2=纯虚构（如貂蝉、周仓、关索）。</li></ul></section>'
    write_page('index.html','首页', blocks)

# ========== 本体页 ==========
def page_ontology():
    html = '<section class="paper"><h2>本体论构建 · Ontology</h2>'
    html += '<p>本工程采用 OWL 2 DL 形式化建模，TBox 与 ABox 严格分离。TBox 文件位于 <code>03_本体论规范/sanguo_kg_ontology.ttl</code>，受控词表位于 <code>03_本体论规范/vocabularies.yaml</code>。</p>'
    classes = [
        ('sg:Character','人物/角色', f'{len(persons)}','含姓名/字/号/生卒年/籍贯/阵营/官职/虚实标注等'),
        ('sg:Faction','势力/集团', f'{len(factions)}','含创始人/起止年/都城/代表色'),
        ('sg:Place','地理实体', f'{len(places)}','含类型/古今名/经纬度/战略价值'),
        ('sg:Battle','战役/会战', f'{len(battles)}','含交战方/主帅/时间/战术/胜负/影响'),
        ('sg:Event','政治/外交事件', f'{len(events)}','含时间/地点/参与者/虚实/描述'),
        ('sg:Stratagem','计谋/策略', f'{len(stratagems)}','含施用者/章回/描述'),
        ('sg:Artifact','器物/信物', f'{len(artifacts)}','含所有者/功能/典故'),
        ('sg:Prophecy','谶纬/童谣/卦象', f'{len(prophecies)}','含文本/言者/对象/应验解释'),
        ('sg:Version','版本/刊本/评点', f'{len(editions)}','版本族谱系节点'),
        ('sg:Scholarship','学术成果', f'{len(scholars)+len(papers)}','学者+论著'),
    ]
    html += '<h3>1. 十 大 顶 级 实 体 类</h3><table class="onto-table"><thead><tr><th>类</th><th>释义</th><th>实例数</th><th>核心属性</th></tr></thead><tbody>'
    for c,n,num,d in classes:
        html += f'<tr><td><code>{c}</code></td><td>{n}</td><td class="num">{num}</td><td>{d}</td></tr>'
    html += '</tbody></table>'
    rels = [
        ('sg:swornTo','结义','桃园结义类兄弟关系，对称、传递'),
        ('sg:swearsAllegianceTo','效忠','臣对君/将对主，Functional'),
        ('sg:relatedByBloodTo','血缘','父子/兄弟/叔侄'),
        ('sg:marries','联姻','婚姻关系，对称'),
        ('sg:surrendersTo','归降','含主动投降与被迫归降'),
        ('sg:defectsTo','叛降','★三国专属，背主投敌（如吕布反复）'),
        ('sg:schemesAgainst','谋害','阴谋加害'),
        ('sg:participatesIn','参与','人物参与事件/战役'),
        ('sg:commands','指挥','主帅指挥战役'),
        ('sg:usesStratagem','用计','人物使用某计谋'),
        ('sg:occursAt','发生于','事件/战役发生在地点'),
        ('sg:occursIn','发生于回目','事件发生在第几回'),
        ('sg:holdsArtifact','持有','人物持有器物'),
        ('sg:uttersProphecy','出谶','人物/童谣作谶语'),
        ('sg:prophecyTargets','谶指','谶语指向某人物/势力'),
        ('sg:foundsFaction','创立','人物创立势力'),
        ('sg:servesFaction','从属','人物从属势力'),
        ('sg:controlsPlace','割据','★三国专属，势力占据要地'),
        ('sg:holdsEmperor','挟帝','★三国专属，挟天子以令诸侯'),
        ('sg:usurps','禅代','★三国专属，汉魏魏晋嬗代'),
        ('sg:feignsSurrender','诈降','★三国专属，黄盖诈降/姜维诈降'),
        ('sg:arrangesMarriage','联姻外交','★三国专属，政治联姻'),
        ('sg:variantOf','异文','版本间异文关系'),
        ('sg:annotates','评点','评注本对原文的评点'),
    ]
    html += '<h3>2. 二 十 四 种 对 象 属 性（含 6 种 三 国 专 属 ★）</h3><table class="onto-table"><thead><tr><th>属性</th><th>语义</th><th>约束</th></tr></thead><tbody>'
    for r,s,c in rels:
        html += f'<tr><td><code>{r}</code></td><td>{s}</td><td>{c}</td></tr>'
    html += '</tbody></table>'
    html += '<h3>3. 数 据 属 性 与 受 控 词 表</h3>'
    html += '<p>四级核实度：<code>verified_primary</code>（原文可证）/ <code>verified_commentary</code>（毛评可证）/ <code>scholarly_consensus</code>（学界共识）/ <code>inferred</code>（推理得出）。</p>'
    html += '<p>虚实标注 <code>fictional_flag</code>：0 正史有其人其事；1 正史有其人但演义有艺术加工；2 纯虚构人物/事件。</p>'
    html += '<h3>4. 版 本 族 谱 层</h3><p>新增 VersionFamily / Edition / Volume / Chapter / Paragraph / VariantReading / Commentary 七类，构成多版本异文对勘的谱系基础。目前毛本有全本（★），其余版本保留元数据与 8 组学术考证异文。</p>'
    html += '<h3>5. 下 载</h3><ul>'
    html += '<li>TBox 本体：<a href="ontology/sanguo_kg_ontology.ttl">sanguo_kg_ontology.ttl</a></li>'
    html += '<li>受控词表：<a href="ontology/vocabularies.yaml">vocabularies.yaml</a></li>'
    html += '<li>知识图谱：<a href="data/graph.json">graph.json</a>（nodes + edges，可导入 Gephi/Cytoscape）</li>'
    html += '<li>Parquet 表：19 张列式表，可直接被 DuckDB/PyArrow/pandas 读取（详见查询台示例）</li></ul>'
    write_page('ontology.html','本体论', html)

# ========== 全文阅读 ==========
def page_read():
    html = '<section class="paper"><h2>全文阅读 · Read</h2>'
    html += '<p>底本：毛宗岗评本《三国演义》一百二十回，繁体排印本为参照，简体整理。点击章回展开阅读。</p>'
    html += '<div class="chapter-select"><label>跳转到第 <input type="number" id="chapJump" min="1" max="120" value="1"> 回</label><button onclick="jumpChap()">前往</button></div>'
    html += '<div id="chapterList"></div></section>'
    html += '''<script>
async function loadRead(){const r=await fetch('data/read.json');const d=await r.json();window.READ=d;
 const list=document.getElementById('chapterList');
 d.chapters.forEach((c,i)=>{const div=document.createElement('details');div.className='chapter';
  div.innerHTML=`<summary><span class="ch-no">第${String(c.no).padStart(3,'0')}回</span><span class="ch-title">${c.title}</span><span class="ch-meta">${c.paras.length}段</span></summary><div class="ch-body"></div>`;
  div.addEventListener('toggle',e=>{if(div.open){const body=div.querySelector('.ch-body');if(!body.dataset.loaded){body.innerHTML=c.paras.map(p=>'<p>'+p+'</p>').join('');body.dataset.loaded=1;}}});
  list.appendChild(div);});}
function jumpChap(){const n=parseInt(document.getElementById('chapJump').value);const all=document.querySelectorAll('#chapterList details');if(all[n-1]){all[n-1].open=true;all[n-1].scrollIntoView({behavior:'smooth'});}}
loadRead();
</script>'''
    write_page('read.html','全文阅读', html)

# ========== 人物 ==========
def page_persons():
    html = '<section class="paper"><h2>人物志 · Persons</h2>'
    html += f'<p>共 {len(persons)} 位人物：其中 <span class="tag real">正史 {sum(1 for p in persons if p.get("fictional")==0)}</span> <span class="tag half">半虚构 {sum(1 for p in persons if p.get("fictional")==1)}</span> <span class="tag fic">纯虚构 {sum(1 for p in persons if p.get("fictional")==2)}</span></p>'
    html += '<div class="filter-bar"><button class="fbtn active" data-f="all">全部</button><button class="fbtn" data-f="0">正史</button><button class="fbtn" data-f="1">半虚构</button><button class="fbtn" data-f="2">纯虚构</button><input type="search" id="pSearch" placeholder="搜姓名 / 字 / 籍贯…"></div>'
    html += '<div class="person-grid" id="pGrid">'
    for p in persons:
        fic = p.get('fictional',0)
        cls = ['real','half','fic'][fic]
        tag = ['正史','半虚','虚构'][fic]
        html += f'''<div class="person-card {cls}" data-fic="{fic}" data-name="{p['name']}{p.get('zi','')}{p.get('hometown','')}">
        <div class="p-head"><h3>{p['name']}</h3><span class="fic-tag">{tag}</span></div>
        <p class="p-zi">{p.get('zi','') or '—'} · {p.get('hao','') or ''} · {p.get('hometown','') or '籍贯不详'}</p>
        <p class="p-fac">{p.get('faction','') or '—'} · {p.get('category','')}</p>
        <p class="p-meta">生卒：{p.get('birth') or '?'}—{p.get('death') or '?'} · 提及 {p.get('total',0)} 次 · 首见第 {p.get('first',0)} 回</p>
        <p class="p-desc">{p.get('desc','') or ''}</p>
        </div>'''
    html += '</div></section>'
    html += '''<script>
document.querySelectorAll('.fbtn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.fbtn').forEach(x=>x.classList.remove('active'));b.classList.add('active');const f=b.dataset.f;document.querySelectorAll('.person-card').forEach(c=>{c.style.display=(f==='all'||c.dataset.fic===f)?'':'none';});});
document.getElementById('pSearch').oninput=e=>{const q=e.target.value.trim();document.querySelectorAll('.person-card').forEach(c=>{c.style.display=(!q||c.dataset.name.includes(q))?'':'none';});};
</script>'''
    write_page('persons.html','人物志', html)

# ========== 势力 ==========
def page_factions():
    html = '<section class="paper"><h2>势力谱 · Factions</h2>'
    html += '<p>从东汉朝廷到晋朝，大小集团十九家。</p>'
    html += '<div class="faction-grid">'
    for f in factions:
        color = f.get('color','#b08d57')
        html += f'''<div class="faction-card" style="border-left-color:{color}">
        <h3>{f['name']}</h3>
        <p>{f.get('type','')} · 创始人：{f.get('founder','—')} · 都城：{f.get('capital','—')}</p>
        <p>起：{f.get('start_year','?')} — 终：{f.get('end_year','?')}</p>
        <p>{f.get('desc','')}</p>
        <p class="small">提及 {f.get('total',0)} 次</p>
        </div>'''
    html += '</div></section>'
    write_page('factions.html','势力谱', html)

# ========== 地理 ==========
def page_places():
    html = '<section class="paper"><h2>地理志 · Places</h2>'
    html += f'<p>共 {len(places)} 处地名，全部标注经纬度，可跳转至「时空地图」可视化。</p>'
    html += '<table class="data-table"><thead><tr><th>地名</th><th>类型</th><th>今址</th><th>经度</th><th>纬度</th><th>战略价值</th><th>提及</th></tr></thead><tbody>'
    for pl in places:
        html += f'<tr><td>{pl["name"]}</td><td>{pl.get("type","")}</td><td>{pl.get("modern","")}</td><td>{pl.get("lng","")}</td><td>{pl.get("lat","")}</td><td>{pl.get("note","")}</td><td>{pl.get("total",0)}</td></tr>'
    html += '</tbody></table></section>'
    write_page('places.html','地理志', html)

# ========== 战役 ==========
def page_battles():
    html = '<section class="paper"><h2>战役史 · Battles</h2>'
    html += f'<p>共 {len(battles)} 场战事，按年份排序。</p>'
    html += '<div class="timeline">'
    for b in battles:
        y = b.get('year')
        html += f'''<div class="tl-item">
        <div class="tl-year">{y or '—'}</div>
        <div class="tl-card">
        <h3>{b['name']}</h3>
        <p class="tl-meta">第 {b.get('chapter',0)} 回 · {b.get('side_a','')} vs {b.get('side_b','')}</p>
        <p>主帅：{b.get('commander_a','—')} / {b.get('commander_b','—')}</p>
        <p>结果：{b.get('outcome','')}</p>
        <p class="small">{b.get('desc','')}</p>
        </div></div>'''
    html += '</div></section>'
    write_page('battles.html','战役史', html)

# ========== 事件 ==========
def page_events():
    html = '<section class="paper"><h2>事件录 · Events</h2>'
    html += f'<p>共 {len(events)} 件政治/外交事件，按年份排序。</p>'
    html += '<div class="timeline">'
    for e in events:
        html += f'''<div class="tl-item">
        <div class="tl-year">{e.get('year','—')}</div>
        <div class="tl-card">
        <h3>{e['name']} <span class="fic-tag {['real','half','fic'][int(e.get('fictional',0))]}">{['正史','半虚','虚构'][int(e.get('fictional',0))]}</span></h3>
        <p class="tl-meta">第 {e.get('chapter',0)} 回 · {e.get('place','')}</p>
        <p>参与者：{e.get('participants','')}</p>
        <p class="small">{e.get('desc','')}</p>
        </div></div>'''
    html += '</div></section>'
    write_page('events.html','事件录', html)

# ========== 计谋/器物/谶纬（列表通用）==========
def page_list(filename, title, items, title_field='name', extra_fn=None):
    html = f'<section class="paper"><h2>{title}</h2><p>共 {len(items)} 条。</p><div class="list-grid">'
    for it in items:
        html += '<div class="list-card"><h3>'+str(it.get(title_field,it.get('name','')))+'</h3>'
        if extra_fn: html += extra_fn(it)
        html += '</div>'
    html += '</div></section>'
    write_page(filename, title, html)

def strat_extra(s):
    return f'<p>施用者：{s.get("user","—")} · 第 {s.get("chapter",0)} 回</p><p>{s.get("desc","")}</p>'
def art_extra(a):
    return f'<p>类型：{a.get("type","")} · 持有者：{a.get("owner","—")}</p><p>{a.get("anecdote","")}</p>'
def pro_extra(p):
    return f'<blockquote>{p.get("text","")}</blockquote><p>{p.get("type","")} · 第 {p.get("chapter",0)} 回 · 指：{p.get("target","")}</p><p>{p.get("meaning","")}</p>'

# ========== 版本族谱 ==========
def page_versions():
    html = '<section class="paper"><h2>版本族谱 · Versions</h2>'
    html += '<p>《三国演义》版本源流复杂：从明代嘉靖壬午本（1522）到清初毛宗岗评本，再到当代沈伯俊校理本。本工程以毛本为唯一全本底本（★），其余版本保留元数据以待扩展。</p>'
    html += '<div class="version-tree"><ol>'
    eds = editions.get('editions', []) if isinstance(editions,dict) else editions
    fm = editions.get('family_meta', {}) if isinstance(editions,dict) else {}
    html += '<li><h3>版本系统</h3><ul>'
    for fid,fmeta in fm.items():
        html += f'<li><b>{fmeta["name"]}</b>（{fmeta["stem"]}）：{fmeta["feature"]}</li>'
    html += '</ul></li>'
    # 按朝代分组
    groups = {}
    for e in eds:
        y = e.get('year',0) or 0
        era = '元明以前' if y<1500 else ('明嘉靖-万历' if y<1620 else ('明末-清' if y<1800 else ('近现代' if y<1950 else '当代')))
        groups.setdefault(era, []).append(e)
    for era, lst in groups.items():
        html += f'<li><h3>{era}</h3><ul>'
        for e in lst:
            mark = ' ★' if e.get('full_text') else ''
            html += f'<li><b>{e["name"]}</b>{mark} · {e.get("year","")} · {e.get("editor","")}<br/><span class="small">{e.get("desc","")}</span></li>'
        html += '</ul></li>'
    html += '</ol></div>'
    html += '<h3>全文入库接口</h3><p>将其他版本全文 TXT 放入 <code>raw/&lt;edition_id&gt;.txt</code>（文件名与 editions.json 的 id 一致），执行 <code>python3 build/build_parquet.py</code> 即可自动合并入 lines 表并启用多版本异文对勘。</p>'
    write_page('versions.html','版本族谱', html)

# ========== 异文对勘（8 组学术考证）==========
def page_variants():
    variants = [
        ('第5回','关羽温酒斩华雄','嘉靖本/李卓吾本：华雄为孙坚所杀（《三国志·孙破虏传》）；毛本：关羽温酒斩华雄（虚构武功，树立武圣形象）'),
        ('第39-50回','诸葛亮赤壁之战','嘉靖本：周瑜主战、诸葛亮仅外交；毛本：增加舌战群儒/草船借箭/借东风，神化孔明'),
        ('第36-38回','三顾茅庐','《三国志》"凡三往乃见"五字；演义扩展为 36/37/38 三回浓墨重彩'),
        ('第41-42回','赵云长坂坡','《三国志》仅"云身抱弱子…保护甘夫人…皆得免难"；演义七进七出、斩曹营名将五十余员'),
        ('第50回','华容道义释曹操','《三国志》曹操败走华容道，刘备追之不及；演义改为关羽义释，立"义绝"'),
        ('第89-90回','诸葛亮七擒孟获','《三国志》仅"亮率众南征，其秋悉平"；演义七擒七纵，加入木鹿大王/藤甲兵奇幻情节'),
        ('第95回','空城计','《三国志》裴松之注引郭冲五事已驳；演义作为孔明"多智近妖"代表情节'),
        ('第104回','遗计斩魏延','《三国志》魏延与杨仪争权被杀，无关诸葛遗计；演义改为"反骨"谶言应验'),
    ]
    html = '<section class="paper"><h2>异文对勘 · Variants</h2>'
    html += '<p>列出 8 组学界公认的重要版本异文，对比嘉万旧本（嘉靖壬午本/李卓吾评本）与毛宗岗评本的叙事增删，揭示毛氏父子"尊刘贬曹、强化忠义"的改写倾向。</p>'
    html += '<table class="data-table"><thead><tr><th>位置</th><th>情节</th><th>版本差异 / 学术考证</th></tr></thead><tbody>'
    for ch, plot, diff in variants:
        html += f'<tr><td>{ch}</td><td>{plot}</td><td>{diff}</td></tr>'
    html += '</tbody></table><p class="small">注：因公开可获取的嘉靖本/李卓吾本电子全文暂不可得，本工程暂列学术考证异文；待全文入库后将开放逐段对勘。</p></section>'
    write_page('variants.html','异文对勘', html)

# ========== 关系图 ==========
def page_graph():
    html = '<section class="paper"><h2>人物关系 · Network</h2>'
    html += '<p>基于共同出现（co-occurrence）构建人物共现网络，边宽代表共现段落数。共 454 条共现关系。</p>'
    html += '<div class="graph-wrap"><canvas id="graphCv" width="1000" height="700"></canvas></div>'
    html += '''<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script>
(async()=>{
const g=await(await fetch('data/graph.json')).json();
const persons=await(await fetch('data/persons.json')).json();
const tot=new Map(persons.map(p=>[p.name,p.total||0]));
const fic=new Map(persons.map(p=>[p.name,p.fictional||0]));
const fac=new Map(persons.map(p=>[p.name,p.faction||'']));
const W=1000,H=700;const cv=document.getElementById('graphCv');const ctx=cv.getContext('2d');
const nodes=g.nodes.slice(0,120).map(n=>({...n,r:Math.sqrt(tot.get(n.id)||3)*1.2+3}));
const ids=new Set(nodes.map(n=>n.id));
const edges=g.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)).slice(0,400);
const sim=d3.forceSimulation(nodes).force('link',d3.forceLink(edges).distance(60).strength(0.3)).force('charge',d3.forceManyBody().strength(-80)).force('center',d3.forceCenter(W/2,H/2)).force('collide',d3.forceCollide(d=>d.r+2));
const colors={'曹魏':'#9e2b25','蜀汉':'#3f6b5e','东吴':'#3b4a6b','群雄':'#b08d57','东汉':'#6a4e78','其他':'#888','晋':'#555'};
let hover=null;
cv.onmousemove=e=>{const rect=cv.getBoundingClientRect();const x=(e.clientX-rect.left)*(W/rect.width),y=(e.clientY-rect.top)*(H/rect.height);hover=null;for(const n of nodes){if((n.x-x)**2+(n.y-y)**2<n.r*n.r){hover=n;break;}}};
sim.on('tick',()=>{ctx.clearRect(0,0,W,H);
 for(const e of edges){ctx.strokeStyle='rgba(110,80,60,0.15)';ctx.lineWidth=Math.sqrt(e.weight||1)*0.3;ctx.beginPath();ctx.moveTo(e.source.x,e.source.y);ctx.lineTo(e.target.x,e.target.y);ctx.stroke();}
 for(const n of nodes){ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle=colors[fac.get(n.id)]||'#888';if(n.fictional===2)ctx.fillStyle='#c88';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();if(n.r>8){ctx.fillStyle='#2f2a25';ctx.font='12px Kaiti, STKaiti, serif';ctx.textAlign='center';ctx.fillText(n.id,n.x,n.y+n.r+12);}}
 if(hover){ctx.fillStyle='rgba(255,250,240,0.95)';ctx.fillRect(hover.x-hover.r,hover.y-hover.r-30,120,26);ctx.fillStyle='#9e2b25';ctx.font='bold 13px Kaiti';ctx.textAlign='left';ctx.fillText(hover.id+' ('+(tot.get(hover.id)||0)+'次)',hover.x-hover.r+4,hover.y-hover.r-12);}
 cv.style.cursor=hover?'pointer':'default';
});
})();
</script>'''
    write_page('graph.html','人物关系', html)

# ========== 地图 ==========
def page_map():
    html = '<section class="paper"><h2>时空地图 · Map</h2>'
    html += '<p>全部 191 处地名标注古今位置，点击标记查看；色点代表势力控制区颜色。</p>'
    html += '<div id="map" style="height:600px;border:1px solid var(--border);background:#f3ead7;"></div>'
    html += '''<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(async()=>{
const places=await(await fetch('data/places.json')).json();
const battles=await(await fetch('data/battles.json')).json();
const map=L.map('map').setView([33,112],5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
const placeLayer=L.layerGroup().addTo(map);
places.forEach(p=>{if(p.lat&&p.lng){const m=L.circleMarker([p.lat,p.lng],{radius:4+Math.log10(p.total+1),color:'#b08d57',fillColor:'#9e2b25',fillOpacity:0.6}).bindPopup('<b>'+p.name+'</b><br/>今：'+(p.modern||'—')+'<br/>'+(p.note||'')+'<br/>提及'+p.total+'次').addTo(placeLayer);}});
const battleLayer=L.layerGroup();
battles.forEach(b=>{const p=places.find(x=>x.name===b.place);if(p&&p.lat){L.marker([p.lat,p.lng],{icon:L.divIcon({html:'<div style="background:#9e2b25;color:#fff;border-radius:50%;width:22px;height:22px;text-align:center;line-height:22px;font-size:11px;border:2px solid #fff;">⚔</div>',iconSize:[22,22]})}).bindPopup('<b>'+b.name+'</b> ('+(b.year||'—')+')<br/>'+(b.outcome||'')).addTo(battleLayer);}});
L.control.layers({'地名':placeLayer,'战役':battleLayer}).addTo(map);
})();
</script>'''
    write_page('map.html','时空地图', html)

# ========== 查询台 ==========
def page_query():
    html = '<section class="paper"><h2>无服务器查询台 · DuckDB-WASM Query Console</h2>'
    html += '<p>纯浏览器端查询，数据以 Parquet 列式表直接读取，无需后端/Neo4j。共 19 张表：' + ', '.join(['persons','factions','places','battles','events','stratagems','artifacts','prophecies','editions','chapters','lines','mentions','relationships','entities','scholars','papers','adaptations','annotations','stats']) + '。</p>'
    html += '''<div class="query-box">
<select id="sampleQ"><option value="">-- 示例SQL --</option>
<option value="SELECT name, faction, fictional_flag, mention_count FROM persons ORDER BY mention_count DESC LIMIT 20;">TOP20 人物</option>
<option value="SELECT name, side_a, side_b, outcome, ad_year FROM battles ORDER BY ad_year;">战役年表</option>
<option value="SELECT name, modern_name, lon, lat, mention_count FROM places WHERE mention_count>50 ORDER BY mention_count DESC;">高频地名</option>
<option value="SELECT fictional_flag, COUNT(*) FROM persons GROUP BY fictional_flag;">虚实分布</option>
<option value="SELECT faction, COUNT(*) FROM persons GROUP BY faction ORDER BY COUNT(*) DESC;">阵营人数</option>
</select>
<textarea id="sql" rows="6">SELECT name, faction, mention_count, fictional_flag
FROM persons
WHERE faction = '蜀汉'
ORDER BY mention_count DESC
LIMIT 15;</textarea>
<button id="runBtn">执行查询 ▶</button>
</div>
<div id="qStatus" class="small"></div>
<div id="qResult"></div>
<h3>Python / pandas 使用方式</h3>
<pre class="code">import pandas as pd
persons = pd.read_parquet("04_knowledge_data/persons.parquet")
battles = pd.read_parquet("04_knowledge_data/battles.parquet")
relations = pd.read_parquet("04_knowledge_data/relationships.parquet")
print(persons.head())</pre>'''
    html += '''<script type="module">
import * as duckdb from 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/+esm';
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger);
await db.instantiate(bundle.mainWorker);
const c = await db.connect();
async function loadParquet(name){const url='data/'+name+'.parquet';await c.query(`CREATE OR REPLACE VIEW ${name} AS SELECT * FROM parquet_scan('${url}')`);}
const tables=['persons','factions','places','battles','events','stratagems','artifacts','prophecies','editions','chapters','mentions','relationships','scholars','papers','adaptations','stats','entities'];
document.getElementById('qStatus').textContent='加载 Parquet 表中...';
await Promise.all(tables.map(t=>loadParquet(t)));
document.getElementById('qStatus').textContent='已加载 '+tables.length+' 张表，可执行查询。';
document.getElementById('sampleQ').onchange=e=>{if(e.target.value)document.getElementById('sql').value=e.target.value;};
document.getElementById('runBtn').onclick=async()=>{const sql=document.getElementById('sql').value;try{document.getElementById('qStatus').textContent='执行中...';const r=await c.query(sql);const rows=r.toArray().map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v===null?'':(v?.toString?v.toString():v)])));const cols=rows.length?Object.keys(rows[0]):[];let html='<table class="data-table"><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';rows.forEach(r=>{html+='<tr>'+cols.map(c=>'<td>'+(r[c]??'')+'</td>').join('')+'</tr>';});html+='</tbody></table><p class="small">共 '+rows.length+' 行</p>';document.getElementById('qResult').innerHTML=html;document.getElementById('qStatus').textContent='完成 '+rows.length+' 行';}catch(err){document.getElementById('qResult').innerHTML='<pre class="err">'+err.message+'</pre>';document.getElementById('qStatus').textContent='出错';}};
</script>'''
    write_page('query.html','查询台', html)

# ========== 其他说明页（占位）==========
def simple_page(filename, title, body):
    write_page(filename, title, '<section class="paper"><h2>'+title+'</h2>'+body+'</section>')

def page_stats():
    faction_counts={}
    for p in persons:
        f=p.get('faction','其他') or '其他'
        faction_counts[f]=faction_counts.get(f,0)+1
    fic_counts={'正史':0,'半虚构':0,'纯虚构':0}
    for p in persons:
        fic_counts[['正史','半虚构','纯虚构'][int(p.get('fictional',0))]]+=1
    body='<h3>全局统计</h3><ul>'
    body += f'<li>总字数：{stat.get("total_chars",590968):,} 字</li>'
    body += f'<li>总章回：120 回</li>'
    body += f'<li>段落：{stat.get("total_paras",17408):,} 段</li>'
    body += f'<li>人物：{len(persons)}（正史 {fic_counts["正史"]}/半虚构 {fic_counts["半虚构"]}/纯虚构 {fic_counts["纯虚构"]}）</li>'
    body += f'<li>地名：{len(places)}（含坐标 191）</li>'
    body += f'<li>战役：{len(battles)}</li>'
    body += f'<li>事件：{len(events)}</li>'
    body += f'<li>计谋：{len(stratagems)} · 器物：{len(artifacts)} · 谶语：{len(prophecies)}</li></ul>'
    body += '<h3>阵营人数分布</h3><table class="data-table"><tr><th>阵营</th><th>人数</th></tr>'
    for f,n in sorted(faction_counts.items(),key=lambda x:-x[1]):
        body += f'<tr><td>{f}</td><td>{n}</td></tr>'
    body += '</table>'
    body += '<h3>高频字 TOP30</h3><div class="freq-cloud">'
    for c in freq[:30]:
        fs = 12 + c[1]/50
        body += f'<span style="font-size:{fs}px;margin:4px;color:var(--ink)">{c[0]}</span>'
    body += '</div>'
    simple_page('stats.html','统计析', body)

def page_scholars():
    body = '<p>自西晋陈寿《三国志》至当代沈伯俊校理本，15 位有代表性的学者/评点家。</p>'
    body += '<div class="list-grid">'
    for s in scholars:
        body += f'<div class="list-card"><h3>{s["name"]} <small>{s.get("era","")}</small></h3>'
        body += f'<p>{s.get("faction","")} · {s.get("role","")}</p>'
        body += f'<p><b>代表作：</b>{s.get("work","")}</p>'
        body += f'<p>{s.get("view","")}</p><p class="small">{s.get("impact","")}</p></div>'
    body += '</div>'
    simple_page('scholars.html','学术史', body)

def page_papers():
    body = '<p>12 种代表性论著。</p><table class="data-table"><thead><tr><th>书名/论文</th><th>作者</th><th>年份</th><th>领域</th><th>观点</th></tr></thead><tbody>'
    for p in papers:
        body += f'<tr><td>{p["title"]}</td><td>{p["author"]}</td><td>{p.get("year","")}</td><td>{p.get("category","")}</td><td>{p.get("desc","")}</td></tr>'
    body += '</tbody></table>'
    simple_page('papers.html','论著举要', body)

def page_adapt():
    body = '<p>戏曲、评书、影视、游戏、连环画、动画——17 种经典衍生作品。</p><div class="list-grid">'
    for a in adaptations:
        body += f'<div class="list-card"><h3>{a["title"]} <small>{a.get("type","")}</small></h3>'
        body += f'<p>{a.get("year","")} · {a.get("creator","")}</p><p>{a.get("note","")}</p></div>'
    body += '</div>'
    simple_page('adaptations.html','衍生改编', body)

def page_poetry():
    poems = [
        ('开篇词','临江仙·滚滚长江东逝水','明·杨慎','滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。'),
        ('卷尾','古风·高祖提剑入咸阳','明·罗贯中','高祖提剑入咸阳，炎炎红日升扶桑。光武龙兴成大统，金乌飞上天中央。…纷纷世事无穷尽，天数茫茫不可逃。鼎足三分已成梦，后人凭吊空牢骚。'),
        ('第38回','隆中对诗','罗贯中','豫州当日叹孤穷，何幸南阳有卧龙。欲识他年分鼎处，先生笑指画图中。'),
        ('第49回','借东风','罗贯中','七星坛上卧龙登，一夜东风江水腾。不是孔明施妙计，周郎安得逞才能？'),
        ('第77回','关羽之死','后人','汉末才无敌，云长独出群。神威能奋武，儒雅更知文。天日心如镜，春秋义薄云。昭然垂万古，不止冠三分。'),
        ('第104回','武侯陨星','杜甫·咏怀古迹','长星昨夜坠前营，讣报先生此日倾。虎帐不闻施号令，麟台惟显著勋名。空余门下三千客，辜负胸中十万兵。好看绿阴清昼里，于今无复雅歌声。'),
    ]
    body = '<div class="poem-list">'
    for loc,title,author,t in poems:
        body += f'<div class="poem-card"><p class="poem-meta">{loc}</p><h3>{title}</h3><p class="poem-author">—— {author}</p><p class="poem-text">{"<br/>".join(t.split("。"))}</p></div>'
    body += '</div>'
    simple_page('poetry.html','诗词回目', body)

def page_mirror():
    body = '''<p>演义七分实三分虚。以下列出 10 处经典"虚构"——演义与《三国志》正史之关键差异。</p>
<table class="data-table"><thead><tr><th>演义情节</th><th>正史《三国志》记载</th><th>虚构类型</th></tr></thead><tbody>
<tr><td>桃园三结义</td><td>刘关张"恩若兄弟"，但未记载结拜仪式</td><td>仪式虚构，情感史实</td></tr>
<tr><td>温酒斩华雄</td><td>华雄为孙坚所杀（《孙破虏传》）</td><td>嫁接战功</td></tr>
<tr><td>三英战吕布</td><td>吕布为孙坚击退，刘关张未参与</td><td>完全虚构</td></tr>
<tr><td>貂蝉连环计</td><td>吕布与董卓侍婢私通，无"貂蝉"之名</td><td>人物虚构</td></tr>
<tr><td>关羽约三事/千里走单骑</td><td>关羽辞曹归刘有载，但过五关斩六将无据</td><td>路线虚构</td></tr>
<tr><td>赵云长坂七进七出</td><td>保护甘夫人与后主免难，无七进七出</td><td>夸张</td></tr>
<tr><td>诸葛亮舌战群儒/草船借箭/借东风</td><td>诸葛亮仅外交出使；草船借箭原型孙权；借东风无</td><td>多起神化</td></tr>
<tr><td>华容道义释曹操</td><td>刘备追之不及，无关羽释曹</td><td>虚构显"义"</td></tr>
<tr><td>三气周瑜</td><td>周瑜豁达，"器量广大"，非气死</td><td>反衬孔明</td></tr>
<tr><td>空城计</td><td>裴松之已驳郭冲五事之虚妄</td><td>移植/虚构</td></tr>
</tbody></table>'''
    simple_page('mirror.html','虚实对照', body)

def page_destiny():
    body = '''<p>《三国演义》以"天命"为叙事经线：从开篇"天下大势，分久必合，合久必分"，到卷尾"纷纷世事无穷尽，天数茫茫不可逃"，天命观贯穿 120 回。以下 5 条天命叙事主线。</p>
<div class="list-grid">
<div class="list-card"><h3>一、五德终始 · 赤德衰尽</h3><p>汉属火德（赤），故有"赤帝子"高祖斩白蛇起义。至桓灵失德、黄巾倡"苍天已死，黄天当立"，火生土之兆；曹魏篡汉以土德承之，司马晋复以金德代土——五行嬗代构成王朝循环的隐性框架。</p></div>
<div class="list-card"><h3>二、谶纬童谣 · 字里藏机</h3><p>"千里草，何青青"谶董卓之亡；"代汉者当涂高"暗示曹魏（"当涂高"即"魏"，阙名也）；"三马同槽"疑司马氏父子。谶语是《三国》叙事天命合法性的重要媒介，也是民间想象最活跃的符号。</p></div>
<div class="list-card"><h3>三、星象灾异 · 将星陨落</h3><p>第 104 回诸葛亮秋风五丈原，"是夜，天愁地惨，月色无光，孔明奄然归天"，其将星自东北流于西南。此前孙坚、周瑜、关羽之死皆有星象对应——天道显象于人事，是天人感应叙事的典型表达。</p></div>
<div class="list-card"><h3>四、英雄宿命 · 天道有常</h3><p>诸葛亮六出祁山，"出师未捷身先死"，上方谷天降大雨救司马懿，司马懿夜观天文知诸葛将死——人力终不敌天命。关羽"玉可碎而不可改其白"，姜维假降复汉而身死族灭，皆"知其不可而为之"的英雄悲剧。</p></div>
<div class="list-card"><h3>五、三分归晋 · 历史大势</h3><p>卷首"分久必合，合久必分"一语成谶：184黄巾→220三国鼎立→280晋武统一，近百年乱世终入一统。卷尾"鼎足三分已成梦，后人凭吊空牢骚"，与开篇《临江仙》形成首尾呼应，完成"天数循环"的叙事闭环。</p></div>
</div>'''
    simple_page('destiny.html','天命叙事', body)

def page_guide():
    body = '''<h3>如何使用本站</h3>
<ol>
<li><b>新手入门：</b>先读<a href="index.html">首页</a>的五个卡片入口，了解整体结构；可从<a href="read.html">全文阅读</a>开始，120 回分回展开。</li>
<li><b>研究者：</b>先看<a href="ontology.html">本体论</a>理解数据模型，然后去<a href="query.html">查询台</a>用 SQL 直接查询 19 张 Parquet 表，或下载 graph.json 做网络分析。</li>
<li><b>文学爱好者：</b>推荐<a href="persons.html">人物志</a>（支持筛选正史/虚构）、<a href="battles.html">战役史</a>、<a href="poetry.html">诗词回目</a>、<a href="destiny.html">天命叙事</a>四个入口。</li>
<li><b>版本学/校勘学：</b><a href="versions.html">版本族谱</a>+<a href="variants.html">异文对勘</a>，展示嘉万旧本与毛宗岗本的改写差异。</li>
<li><b>可视化探索：</b><a href="graph.html">人物关系网络</a>、<a href="map.html">时空地图</a>提供 D3 力导向图与 Leaflet 地图。</li>
<li><b>数据复用：</b>19 张 Parquet 表位于 <code>docs/data/*.parquet</code>，可直接被 pandas/DuckDB/PyArrow 读取；TBox 本体 TTL 可导入 Protegé 做推理。</li>
</ol>
<h3>与姊妹项目的关系</h3>
<p>本工程是继《红楼梦》（<em>The Story of the Stone</em>）与《西游记》（<em>The Journey to the West</em>）之后的第三部数字人文经典重构建，与《水浒传》All Men Are Brothers 本体共用 <code>*_</code> 前缀 ID 体系（三国为 <code>sg_</code>，水浒为 <code>sh_</code>），未来可做跨本体联动查询（如"关羽与武松的忠义叙事比较""诸葛亮与吴用的军师形象"）。</p>
<h3>致谢与许可</h3>
<p>文本来自 Project Gutenberg #23950 公版《三國志演義》；CSS 设计受 yeinlei 红楼未完启发；本项目所有代码与数据以 MIT 许可开源。</p>'''
    simple_page('guide.html','阅读指南', body)

# ========== 运行 ==========
if __name__ == '__main__':
    page_index()
    page_ontology()
    page_read()
    page_persons()
    page_factions()
    page_places()
    page_battles()
    page_events()
    page_list('stratagems.html','计谋鉴',stratagems,extra_fn=strat_extra)
    page_list('artifacts.html','器物簿',artifacts,extra_fn=art_extra)
    page_list('prophecies.html','谶纬考',prophecies,extra_fn=pro_extra)
    page_versions()
    page_variants()
    page_graph()
    page_map()
    page_query()
    page_stats()
    page_scholars()
    page_papers()
    page_adapt()
    page_poetry()
    page_mirror()
    page_destiny()
    page_guide()
    # 把 TTL/YAML 拷到 docs/ontology/
    (DOCS/'ontology').mkdir(exist_ok=True)
    import shutil
    for f in ['sanguo_kg_ontology.ttl','vocabularies.yaml']:
        shutil.copy(ROOT/'03_本体论规范'/f, DOCS/'ontology'/f)
    # app.js 空占位
    (DOCS/'assets'/'app.js').write_text('// sanguo app\n',encoding='utf-8')
    print("ALL DONE")
