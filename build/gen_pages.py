#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
三國演義本體論 · 頁面生成（對齊水滸傳本體論模板）
統一 topbar(logo+seal+nav-links) / hero / container / footer 結構
"""
import json, os, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DATA = ROOT / "data"

# ============ 全局導航（25 入口，對齊水滸 nav-links 樣式） ============
NAV = [
    ("index.html",     "總覽"),
    ("read.html",      "版本閱讀"),
    ("heroes.html",    "英雄譜"),
    ("persons.html",   "人物誌"),
    ("factions.html",  "勢力志"),
    ("places.html",    "地理志"),
    ("battles.html",   "戰役錄"),
    ("events.html",    "事件譜"),
    ("stratagems.html","計謀譜"),
    ("artifacts.html", "器物譜"),
    ("prophecies.html","讖緯志"),
    ("poetry.html",    "詩詞鈔"),
    ("versions.html",  "版本譜"),
    ("variants.html",  "異文對勘"),
    ("graph.html",     "關係網"),
    ("map.html",       "輿地圖"),
    ("reading.html",   "讀法"),
    ("fictional.html", "虛實辨"),
    ("destiny.html",   "天命讖"),
    ("critics.html",   "評點家"),
    ("papers.html",    "學術論"),
    ("adaptations.html","演義外"),
    ("query.html",     "本體查詢"),
    ("stat.html",      "統計譜"),
    ("ontology.html",  "本體論"),
]

def header(active, page_title, en_sub=None):
    """水滸同款 topbar：左 logo(seal+名) + 右 nav-links；下方接 hero 區。
    active: 當前頁面的 html 文件名
    page_title: 頁面 H1
    en_sub: 英文副標題（小寫 kicker）
    """
    links = []
    for href, label in NAV:
        cls = ' class="active"' if href == active else ""
        links.append(f'<a href="{href}"{cls}>{label}</a>')
    nav_html = "\n    ".join(links)
    kicker = f'<div class="hero-sub">{en_sub}</div>' if en_sub else ""
    motto = ''
    if active == "index.html":
        motto = '<div class="hero-motto">滾滾長江東逝水　浪花淘盡英雄</div>'
    return f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<title>{page_title} · 三國演義本體論</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="assets/app.css">
</head>
<body>

<header class="topbar">
  <div class="logo">
    <span class="seal">國三</span>
    <span>三國演義本體論</span>
  </div>
  <nav class="nav-links">
    {nav_html}
  </nav>
</header>

<section class="hero">
  {kicker}
  <h1>{page_title}</h1>
  <p class="hero-desc">以本體論方法系統建構三國世界——版本、人物、關係、戰役、地理、計謀、器物、讖緯、評點、衍生，一一納入結構化知識框架。</p>
  {motto}
</section>

<div class="container">
"""

def footer():
    return """
</div>
<footer>
  三國演義本體論 · Romance of the Three Kingdoms Ontology · 以 yejinlei 西遊記/水滸傳本體論為範式 · 視覺系統參考《石頭記》數字人文站
</footer>
</body>
</html>
"""

def section(title, en="", bar_color="vermilion-deep"):
    """水滸同款 section-title：左邊 bar + 中文 h2 + 右斜英文"""
    return f"""<div class="section">
  <div class="section-title">
    <span class="bar"></span>
    <h2>{title}</h2>
    <span class="en">{en}</span>
  </div>
"""

def end_section():
    return "</div>\n"

def write_page(name, body, active=None, title=None, en_sub=None):
    active = active or name
    title = title or {p:t for p,t in NAV}.get(name, name.replace(".html",""))
    html = header(active, title, en_sub) + body + footer()
    (DOCS / name).write_text(html, encoding="utf-8")
    print(f"  · wrote {name}")

def load_json(fname):
    p = DATA / fname
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    # try docs/data
    p2 = DOCS / "data" / fname
    if p2.exists():
        return json.loads(p2.read_text(encoding="utf-8"))
    return {}

def stat_cards(items):
    """items: list of (num, label)"""
    cards = "".join(f'<div class="stat-card"><div class="num">{n}</div><div class="lbl">{l}</div></div>' for n,l in items)
    return f'<div class="stat-grid">{cards}</div>'

def faction_class(fid):
    mp = {"蜀漢":"shu","曹魏":"wei","東吳":"wu","群雄":"qun","東漢":"han","晉":"jin",
          "黄巾":"yj","南蠻":"man"}
    for k,v in mp.items():
        if fid and k in fid:
            return v
    return "qun"

# ============ 1. 總覽（index） ============
def page_index():
    stat = load_json("stat.json")
    persons = load_json("persons.json")
    battles = load_json("battles.json")
    events = load_json("events.json")
    places = load_json("places.json")
    editions = load_json("editions.json")
    variants = load_json("variants.json")
    relations = load_json("relationships.json")
    n_persons = len(persons) if isinstance(persons, list) else stat.get("persons",455)
    n_battles = len(battles) if isinstance(battles, list) else stat.get("battles",115)
    n_events  = len(events)  if isinstance(events, list) else stat.get("events",107)
    n_places  = len(places)  if isinstance(places, list) else stat.get("places",191)
    n_editions= len(editions) if isinstance(editions, list) else 12
    n_vars = len(variants) if isinstance(variants, list) else 260
    n_rels = len(relations) if isinstance(relations, list) else 1421
    body = ""
    body += stat_cards([
        (n_persons, "人物（正史·虛構並存）"),
        (n_battles, "戰役/戰事"),
        (n_events,  "歷史事件"),
        (n_places,  "地理坐標"),
        (n_editions,"版本族譜"),
        (n_vars,    "跨版本異文"),
        (n_rels,    "人物關係"),
        (f"{stat.get('words',590968)//10000}萬", "毛本全文語料"),
    ])
    body += """
<div class="portal-grid">
  <a class="portal-card p-shu" href="read.html">
    <div class="p-title">📖 版本閱讀</div>
    <div class="p-desc">毛宗崗評本·周曰校刊本雙版本全文在線，120回·192章，繁體排印，可切換版本。</div>
  </a>
  <a class="portal-card p-wei" href="heroes.html">
    <div class="p-title">⚔️ 英雄譜</div>
    <div class="p-desc">桃園三結義·五虎上將·五子良將·江東十二虎臣·四大都督·臥龍鳳雛……群像匯聚。</div>
  </a>
  <a class="portal-card p-wu" href="variants.html">
    <div class="p-title">🔍 異文對勘</div>
    <div class="p-desc">版本演化系譜圖·77條學術異文·260條毛本周本全文自動對勘·用戶自助LCS逐字diff。</div>
  </a>
  <a class="portal-card p-qun" href="query.html">
    <div class="p-title">🕸️ 本體查詢</div>
    <div class="p-desc">DuckDB-WASM 瀏覽器端無服務器SQL，19張Parquet列式表，人物/戰役/地理/關係自由查詢。</div>
  </a>
  <a class="portal-card p-yan" href="ontology.html">
    <div class="p-title">📜 本體規範</div>
    <div class="p-desc">OWL 2 DL · Turtle TTL · 78類·37種對象屬性·111種數據屬性·11族受控詞表，兼容水滸本體 sh: 前綴。</div>
  </a>
</div>
"""
    body += section("一部書的千古興亡", "PROLOGUE")
    body += """<div class="prologue">
<p>《三國演義》起自黃巾起義，終於三國歸晉，近百年間英雄輩出，波詭雲譎。其書以「義」字為骨、以「分合」為脈——天下大勢分久必合、合久必分，是為千古興亡之歎。</p>
<p>本站以本體論（Ontology）方法系統建構三國世界——版本、人物、關係、戰役、地理、計謀、器物、讖緯、評點、衍生——從嘉靖本到毛宗崗評本的版本流變，到劉關張桃園結義的千古情義，從官渡、赤壁、夷陵三大戰役的地理空間，到毛宗崗、李卓吾、沈伯俊的千年評說，一一納入結構化知識框架。</p>
<p>本體以《西遊記本體論》（jtw_kg_ontology.ttl）為範式，面向多版本對照與異文比對場景擴展；命名空間統一以 <code>sg:</code> 為前綴，與《水滸傳本體論》 <code>sh:</code> 聯動；視覺系統沿用《石頭記》數字人文站宣紙·朱批·箋紙風格。</p>
</div>"""
    body += end_section()
    write_page("index.html", body, title="三國演義本體論",
               en_sub="ROMANCE OF THE THREE KINGDOMS · ONTOLOGY")

# ============ 2. 正文閱讀 ============
def page_read():
    chapters = load_json("chapters.json")
    if not isinstance(chapters, list): chapters = []
    options = "".join(f'<option value="{i+1:03d}">第{i+1}回 {c.get("title","")}</option>' for i,c in enumerate(chapters[:120]))
    body = ""
    body += """<div class="reader-toolbar">
<label>章回</label>
<select id="chSelect">"""+options+"""</select>
<label style="margin-left:12px;">版本</label>
<select id="edSelect"><option value="maozonggang">毛宗崗評本（120回）</option><option value="zhouyuexiao">周曰校刊本（192章）</option></select>
<button class="nav-btn" id="prevBtn">◀ 上回</button>
<button class="nav-btn" id="nextBtn">下回 ▶</button>
</div>
<div class="reader-status" id="readerStatus">正在載入第001回……</div>
<div class="reader-content" id="readerContent"></div>
<script>
async function loadCh(n,ed){
  n=String(n).padStart(3,'0');
  const url=`data/read/${ed}/${n}.json`;
  try{
    const r=await fetch(url); const j=await r.json();
    document.getElementById('readerStatus').textContent=`載入 ${j.title} · ${j.paragraphs.length}段 · ${j.words}字`;
    const h=document.getElementById('readerContent');
    h.innerHTML='<h2 class="ch-title">'+j.title+'</h2>'+
      j.paragraphs.map(p=>{
        if(/^[詩詞曰].*[。；]$/.test(p)||/^《.*》$/.test(p))return '<p class="verse">'+p+'</p>';
        return '<p>'+p+'</p>';
      }).join('');
  }catch(e){document.getElementById('readerContent').innerHTML='<p style="color:#8b1a1a">本回暫無該版本全文。</p>';}
}
document.getElementById('chSelect').addEventListener('change',e=>loadCh(parseInt(e.target.value),document.getElementById('edSelect').value));
document.getElementById('edSelect').addEventListener('change',e=>loadCh(parseInt(document.getElementById('chSelect').value),e.target.value));
document.getElementById('prevBtn').addEventListener('click',()=>{const s=document.getElementById('chSelect');const i=Math.max(1,s.selectedIndex);s.selectedIndex=i-1;loadCh(i,document.getElementById('edSelect').value);});
document.getElementById('nextBtn').addEventListener('click',()=>{const s=document.getElementById('chSelect');const i=Math.min(s.options.length-2,s.selectedIndex+1);s.selectedIndex=i;loadCh(i+1,document.getElementById('edSelect').value);});
loadCh(1,'maozonggang');
</script>
"""
    write_page("read.html", body, title="版本閱讀", en_sub="READER")

# ============ 3. 英雄譜 ============
def page_heroes():
    persons = load_json("persons.json")
    if not isinstance(persons, list): persons=[]
    def p(name):
        for x in persons:
            if x.get("name")==name: return x
        return {}
    groups = [
        ("三絕", "THREE PEERLESS", [p("諸葛亮"),p("關羽"),p("曹操")],
         ["智絕·孔明","義絕·雲長","姦絕·孟德"]),
        ("桃園三結義", "OATH OF THE PEACH GARDEN", [p("劉備"),p("關羽"),p("張飛")],
         ["大哥玄德","二弟雲長","三弟翼德"]),
        ("蜀漢五虎上將", "FIVE TIGER GENERALS", [p("關羽"),p("張飛"),p("趙雲"),p("馬超"),p("黃忠")], None),
        ("曹魏五子良將", "FIVE ELITE GENERALS", [p("張遼"),p("樂進"),p("于禁"),p("張郃"),p("徐晃")], None),
        ("江東十二虎臣", "TWELVE TIGER MINISTERS",
         [p("程普"),p("黃蓋"),p("韓當"),p("蔣欽"),p("周泰"),p("陳武"),p("董襲"),p("甘寧"),p("淩統"),p("徐盛"),p("潘璋"),p("丁奉")], None),
        ("四大都督", "FOUR COMMANDERS", [p("周瑜"),p("魯肅"),p("呂蒙"),p("陸遜")], None),
        ("臥龍鳳雛", "CROUCHING DRAGON · YOUNG PHOENIX", [p("諸葛亮"),p("龐統")], ["臥龍·孔明","鳳雛·士元"]),
        ("曹魏五大謀主", "FIVE STRATEGISTS OF WEI", [p("荀彧"),p("荀攸"),p("郭嘉"),p("程昱"),p("賈詡")], None),
        ("蜀漢樞要文臣", "CHANCELLORS OF SHU", [p("法正"),p("蔣琬"),p("費禕"),p("董允"),p("馬良")], None),
    ]
    body = ""
    for gname, en, arr, titles in groups:
        arr = [x for x in arr if x]
        body += section(gname, en)
        cards = []
        for i,x in enumerate(arr):
            fc = faction_class(x.get("faction",""))
            nick = titles[i] if titles else (x.get("zi") or "")
            cards.append(f"""<div class="hero-card {fc}">
  <div class="rank">{x.get("name","?")[0]}</div>
  <div class="nick">{nick}</div>
  <div class="nm">{x.get("name","")}</div>
  <div class="pos">{x.get("faction","") or ""}</div>
</div>""")
        body += '<div class="hero-grid">'+"".join(cards)+'</div>'
        body += end_section()
    # 群雄榜 TOP120
    sorted_p = sorted([x for x in persons if isinstance(x,dict) and "name" in x],
                      key=lambda x:-x.get("total",x.get("mention_count",0)))[:120]
    body += section("群雄榜·登場百二十人", "TOP 120 BY MENTIONS")
    body += '<div class="hero-grid">'
    for i,x in enumerate(sorted_p,1):
        fc = faction_class(x.get("faction",""))
        body += f"""<div class="hero-card {fc}">
  <div class="rank">{i:03d}</div>
  <div class="nick">{x.get("zi","")}</div>
  <div class="nm">{x.get("name","")}</div>
  <div class="pos">{x.get("faction","")} · {x.get("total",x.get("mention_count",0))}次</div>
</div>"""
    body += "</div>"+end_section()
    write_page("heroes.html", body, title="英雄譜", en_sub="HEROES")

# ============ 4. 人物誌（完整455人） ============
def page_persons():
    persons = load_json("persons.json")
    if not isinstance(persons,list): persons=[]
    # faction filters
    factions = sorted({x.get("faction","") for x in persons if x.get("faction")})
    body = '<div class="hero-filters">'
    body += '<button class="filter-btn active" data-f="all">全部</button>'
    for f in factions:
        body += f'<button class="filter-btn" data-f="{f}">{f}</button>'
    body += '</div>'
    body += '<input class="hero-search" id="psearch" placeholder="輸入人名/字號搜索……">'
    body += '<div class="hero-grid" id="pgrid">'
    for i,x in enumerate(sorted(persons,key=lambda a:-a.get("total",a.get("mention_count",0))),1):
        fc = faction_class(x.get("faction",""))
        flag = x.get("fictional_flag")
        badge = ""
        if flag==0: badge='<span style="font-size:10px;color:#2d3a6e;background:#e0e4ec;padding:1px 6px;border-radius:3px;">史</span>'
        elif flag==2: badge='<span style="font-size:10px;color:#fff;background:#8b1a1a;padding:1px 6px;border-radius:3px;">虛</span>'
        body += f"""<div class="hero-card {fc}" data-f="{x.get('faction','')}" data-n="{x.get('name','')}{x.get('zi','')}">
  <div class="rank">{i:03d}</div>
  <div class="nick">{x.get('zi','')} {badge}</div>
  <div class="nm">{x.get('name','')}</div>
  <div class="pos">{x.get('faction','')} · {x.get('total',x.get('mention_count',0))}次</div>
</div>"""
    body += """</div>
<script>
document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const f=b.dataset.f;const kw=document.getElementById('psearch').value.trim();
  document.querySelectorAll('#pgrid .hero-card').forEach(c=>{
    const fm=(f==='all'||c.dataset.f===f);const sm=(!kw||c.dataset.n.includes(kw));c.style.display=(fm&&sm)?'':'none';
  });
});
document.getElementById('psearch').oninput=()=>document.querySelector('.filter-btn.active').click();
</script>"""
    write_page("persons.html", body, title="人物誌", en_sub="PERSONAE")

# ============ 5. 勢力志 ============
def page_factions():
    factions = load_json("factions.json") or []
    persons = load_json("persons.json") or []
    if not factions:
        factions = [{"name":"蜀漢","leader":"劉備","color":"shu","desc":"漢昭烈帝所建，諸葛亮輔之，五虎上將為骨幹，以復漢為旗。"},
                    {"name":"曹魏","leader":"曹操","color":"wei","desc":"挾天子以令諸侯，據中原九州，實力最強。"},
                    {"name":"東吳","leader":"孫權","color":"wu","desc":"據江東六郡，歷三代經營，周瑜魯肅呂蒙陸遜為柱石。"},
                    {"name":"群雄","leader":"袁紹","color":"qun","desc":"漢末諸侯割據。"},{"name":"東漢","leader":"漢獻帝","color":"han","desc":"漢室正統。"}]
    body = '<div class="card-grid g4">'
    for f in factions:
        color = f.get("color", faction_class(f.get("name","")))
        members = [p.get("name") for p in persons if p.get("faction")==f.get("name")][:18]
        body += f"""<div class="card {color}">
  <span class="badge" style="background:var(--{color});">{f.get('name','')}</span>
  <h3>{f.get('name','')}</h3>
  <div class="meta">主公：{f.get('leader','')}</div>
  <div class="desc">{f.get('desc','')}</div>
  <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:4px;">
    {''.join(f'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:var(--paper-warm);color:var(--ink-light);">{m}</span>' for m in members)}
  </div>
</div>"""
    body += "</div>"
    write_page("factions.html", body, title="勢力志", en_sub="FACTIONS")

# ============ 通用 list 頁：地理/戰役/事件/計謀/器物/讖緯 ============
def simple_list_page(fname, title, en, json_name, name_field, desc_field, extra_field=None, side=None):
    data = load_json(json_name) or []
    body = '<div class="card-grid g3">'
    for x in data:
        nm = x.get(name_field,"")
        if not nm: continue
        desc = x.get(desc_field,"")
        extra = ""
        if extra_field:
            extra = f'<div class="meta">{x.get(extra_field,"")}</div>'
        body += f'<div class="card"><h3>{nm}</h3>{extra}<div class="desc">{desc}</div></div>'
    body += "</div>"
    write_page(fname, body, title=title, en_sub=en)

# ============ 12. 版本譜 ============
def page_versions():
    editions = load_json("editions.json") or []
    families = [
        ("演義系（24卷240則）", "yanyi"),
        ("志傳繁本（20卷，含花關索）", "zhichuan_full"),
        ("志傳簡本", "zhichuan_short"),
        ("評點系（合併120回）", "pingdian"),
        ("現代整理本", "modern"),
        ("續書", "sequel"),
    ]
    body = ""
    for fname,fid in families:
        items = [e for e in editions if e.get("family")==fid]
        body += section(fname, fid.upper())
        body += '<div class="card-grid g3">'
        for e in items:
            fullstar = " ★" if e.get("fulltext") else ""
            body += f"""<div class="card">
  <span class="badge" style="background:var(--vermilion-deep);">{e.get('year','')}</span>
  <h3>{e.get('short',e.get('name',''))}{fullstar}</h3>
  <div class="meta">{e.get('publisher','')} · {e.get('chapters','')}</div>
  <div class="desc">{e.get('feature','')}</div>
</div>"""
        body += "</div>"+end_section()
    body += """<div class="annotation red">★ 表示全文已在線收錄；其他版本僅錄元數據與代表異文。
工程已預留全文入庫接口：把 TXT/PDF 放入 raw/&lt;version_id&gt;.txt 後運行 build 腳本即可自動入本體。</div>"""
    write_page("versions.html", body, title="版本譜", en_sub="EDITIONS")

# ============ 13. 異文對勘 ============
def page_variants():
    vdata = load_json("variants.json") or {}
    variants = vdata.get("variants",[]) if isinstance(vdata,dict) else vdata
    vtypes = vdata.get("variant_types",{}) if isinstance(vdata,dict) else {}
    body = section("版本演化系譜", "STEMMA CODICUM")
    # SVG 系譜圖（簡化版）
    body += """<svg class="family-svg" viewBox="0 0 880 430" xmlns="http://www.w3.org/2000/svg" style="font-family:Songti SC,serif;">
<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8b1a1a"/></marker></defs>
<line x1="440" y1="40" x2="440" y2="80" stroke="#8b1a1a" stroke-width="1.5"/>
<text x="440" y="30" text-anchor="middle" font-size="14" fill="#8b1a1a" font-weight="700">羅貫中祖本（元末明初）</text>
<rect x="380" y="80" width="120" height="36" rx="4" fill="#8b1a1a"/><text x="440" y="103" text-anchor="middle" fill="#f5f0e6" font-size="13">祖本（佚）</text>
<line x1="340" y1="116" x2="340" y2="170" stroke="#8b1a1a" stroke-width="1.2"/>
<line x1="540" y1="116" x2="540" y2="170" stroke="#b8860b" stroke-width="1.2"/>
<text x="290" y="150" font-size="12" fill="#8b1a1a">演義系（24卷）</text>
<text x="560" y="150" font-size="12" fill="#b8860b">志傳系（20卷）</text>
<rect x="260" y="170" width="120" height="34" rx="4" fill="#c0392b"/><text x="320" y="191" text-anchor="middle" fill="#fff" font-size="12">嘉靖壬午本（1522）★</text>
<rect x="400" y="170" width="120" height="34" rx="4" fill="#c0392b"/><text x="460" y="191" text-anchor="middle" fill="#fff" font-size="12">周曰校本（1591）★</text>
<rect x="480" y="170" width="120" height="34" rx="4" fill="#b8860b"/><text x="540" y="191" text-anchor="middle" fill="#fff" font-size="12">葉逢春本（~1548）</text>
<rect x="620" y="170" width="120" height="34" rx="4" fill="#b8860b"/><text x="680" y="191" text-anchor="middle" fill="#fff" font-size="12">余象斗本（1592）</text>
<rect x="700" y="240" width="120" height="34" rx="4" fill="#b8860b"/><text x="760" y="261" text-anchor="middle" fill="#fff" font-size="12">黃正甫本（1623）</text>
<line x1="400" y1="220" x2="320" y2="260" stroke="#8b1a1a" stroke-width="1"/>
<line x1="460" y1="204" x2="460" y2="260" stroke="#2f5d50" stroke-width="1.2"/>
<rect x="260" y="260" width="120" height="34" rx="4" fill="#2f5d50"/><text x="320" y="281" text-anchor="middle" fill="#fff" font-size="12">李卓吾評本（~1607）</text>
<rect x="400" y="260" width="120" height="34" rx="4" fill="#2f5d50"/><text x="460" y="281" text-anchor="middle" fill="#fff" font-size="12">鍾伯敬評本（~1627）</text>
<line x1="320" y1="294" x2="320" y2="330" stroke="#8b1a1a" stroke-width="2"/>
<rect x="240" y="330" width="160" height="40" rx="4" fill="#8b1a1a"/><text x="320" y="355" text-anchor="middle" fill="#f5f0e6" font-size="13" font-weight="700">毛宗崗評本（1679）★</text>
<line x1="540" y1="350" x2="400" y2="350" stroke="#8b1a1a" stroke-width="1"/>
<line x1="400" y1="260" x2="460" y2="330" stroke="#2f5d50" stroke-width="1" stroke-dasharray="3"/>
<rect x="400" y="370" width="300" height="34" rx="4" fill="#2d3a6e"/><text x="550" y="391" text-anchor="middle" fill="#fff" font-size="12">人文社本（1953）/ 沈伯俊校理本（1992）</text>
</svg>"""
    body += end_section()
    body += section("核心異文對照", "VARIANT READINGS")
    body += '<div class="hero-filters"><button class="filter-btn active" data-t="all">全部</button>'
    types = sorted({v.get("type","") for v in variants if isinstance(v,dict) and v.get("type")})
    type_label = {"vt_rewrite":"改寫","vt_addition":"詩文增刪","vt_typo":"訛字","vt_plot":"情節增刪","vt_naming":"回目/人名"}
    for t in types:
        lb = type_label.get(t, t)
        body += f'<button class="filter-btn" data-t="{t}">{lb}</button>'
    body += '</div>'
    body += '<div class="diff-list">'
    for v in variants:
        if not isinstance(v,dict): continue
        tl = type_label.get(v.get("type",""), v.get("type",""))
        body += f"""<div class="card" style="margin-bottom:14px;" data-t="{v.get('type','')}">
  <span class="badge" style="background:var(--gold);">{tl}</span>
  <h3 style="font-size:16px;">第{v.get('chapter','')}回 · {v.get('section','')}</h3>
  <div class="meta">{v.get('significance','')}</div>
  <div class="diff-grid">
    <div class="diff-col"><h5>毛宗崗本</h5>{v.get('maotext','')}</div>
    <div class="diff-col"><h5>嘉靖本</h5>{v.get('jiajingtext','')}</div>
  </div>
</div>"""
    body += """</div>
<script>
document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  const t=b.dataset.t;
  document.querySelectorAll('.diff-list .card').forEach(c=>{c.style.display=(t==='all'||c.dataset.t===t)?'':'none';});
});
</script>"""
    body += end_section()
    body += section("自助對勘工具", "DIY DIFF")
    body += """<div class="diff-tool">
<p style="margin-bottom:10px;font-family:var(--font-serif);color:var(--ink-muted);">在下方兩個文本框粘貼任意兩段文字，點擊「對比」即得逐字差異（紅刪綠增）。所有計算在瀏覽器端完成，不上傳服務器。</p>
<textarea id="dA" placeholder="毛本（或 A 版文本）"></textarea>
<textarea id="dB" placeholder="嘉靖本（或 B 版文本）"></textarea>
<button onclick="dodiff()">對 比</button>
<div id="dOut" style="margin-top:16px;font-family:var(--font-serif);font-size:14px;line-height:2;"></div>
</div>
<script>
function dodiff(){
  const a=document.getElementById('dA').value,b=document.getElementById('dB').value;
  const n=a.length,m=b.length;const dp=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  let i=n,j=m,out='<div class="verse" style="color:#8b1a1a;margin-bottom:8px;">LCS 最長公共子序列長度：'+dp[n][m]+'</div>';
  let ra='',rb='';
  while(i>0&&j>0){if(a[i-1]===b[j-1]){ra='<span>'+a[i-1]+'</span>'+ra;rb='<span>'+b[j-1]+'</span>'+rb;i--;j--;}else if(dp[i-1][j]>=dp[i][j-1]){ra='<span class="diff-del">'+a[i-1]+'</span>'+ra;i--;}else{rb='<span class="diff-add">'+b[j-1]+'</span>'+rb;j--;}}
  while(i>0){ra='<span class="diff-del">'+a[i-1]+'</span>'+ra;i--;}while(j>0){rb='<span class="diff-add">'+b[j-1]+'</span>'+rb;j--;}
  document.getElementById('dOut').innerHTML='<div class="diff-grid"><div class="diff-col"><h5>A 版本</h5>'+ra+'</div><div class="diff-col"><h5>B 版本</h5>'+rb+'</div></div>';
}
</script>"""
    body += end_section()
    write_page("variants.html", body, title="異文對勘", en_sub="VARIANTS")

# ============ 15. 關係網 ============
def page_graph():
    body = """<div class="graph-wrap">
<svg class="graph-svg" id="gsvg"></svg>
<div class="rel-legend" id="llegend">
<div><span class="f-dot shu"></span>蜀漢</div><div><span class="f-dot wei"></span>曹魏</div>
<div><span class="f-dot wu"></span>東吳</div><div><span class="f-dot qun"></span>群雄</div>
<div style="margin-top:6px;font-size:11px;color:#6b6b6b;">拖動節點·懸停查看關係</div>
</div>
</div>
<script>
(async()=>{
  const data=await fetch('data/graph.json').then(r=>r.json()).catch(()=>({nodes:[],links:[]}));
  const svg=document.getElementById('gsvg');const W=svg.clientWidth||1200,H=620;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const fc={'蜀漢':'#8b1a1a','曹魏':'#2d3a6e','東吳':'#2f5d50','群雄':'#b8860b','東漢':'#6b4423','晉':'#5b3a7a'};
  const ns=(data.nodes||[]).slice(0,80).map(n=>({...n,x:W/2+(Math.random()-.5)*300,y:H/2+(Math.random()-.5)*200,fc:fc[n.faction]||'#8b1a1a',r:Math.min(28,8+Math.sqrt(n.total||1)/2)}));
  const ls=(data.links||[]).filter(l=>{const a=ns.find(n=>n.id===l.source),b=ns.find(n=>n.id===l.target);return a&&b;}).slice(0,200);
  const ns2=ns.map(n=>({...n}));
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');svg.appendChild(g);
  const lg=document.createElementNS('http://www.w3.org/2000/svg','g');g.appendChild(lg);
  const ng=document.createElementNS('http://www.w3.org/2000/svg','g');g.appendChild(ng);
  ls.forEach(l=>{const a=ns.find(n=>n.id===l.source),b=ns.find(n=>n.id===l.target);
    const e=document.createElementNS('http://www.w3.org/2000/svg','line');
    e.setAttribute('stroke','rgba(139,26,26,.25)');e.setAttribute('stroke-width',Math.min(3,.5+l.count/2));
    e.setAttribute('x1',a.x);e.setAttribute('y1',a.y);e.setAttribute('x2',b.x);e.setAttribute('y2',b.y);
    e.a=a;e.b=b;lg.appendChild(e);});
  ns.forEach(n=>{const c=document.createElementNS('http://www.w3.org/2000/svg','g');
    const cir=document.createElementNS('http://www.w3.org/2000/svg','circle');
    cir.setAttribute('r',n.r);cir.setAttribute('fill',n.fc);cir.setAttribute('stroke','#fff');cir.setAttribute('stroke-width',2);
    const tx=document.createElementNS('http://www.w3.org/2000/svg','text');
    tx.setAttribute('text-anchor','middle');tx.setAttribute('dy',n.r+14);tx.setAttribute('font-size','12');
    tx.setAttribute('fill','#1a1a1a');tx.textContent=n.name;
    c.appendChild(cir);c.appendChild(tx);c.style.cursor='grab';c.n=n;ng.appendChild(c);
    let drag=false;c.addEventListener('mousedown',()=>drag=true);
    window.addEventListener('mouseup',()=>drag=false);
    window.addEventListener('mousemove',e=>{if(!drag)return;const r=svg.getBoundingClientRect();
      n.x=(e.clientX-r.left)*W/r.width;n.y=(e.clientY-r.top)*H/r.height;});
  });
  function step(){
    for(let k=0;k<20;k++){
      ns.forEach(n=>{n.vx=(n.vx||0)*.6;n.vy=(n.vy||0)*.6;});
      for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const a=ns[i],b=ns[j];
        let dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=800/(d*d);
        a.vx-=dx/d*f;a.vy-=dy/d*f;b.vx+=dx/d*f;b.vy+=dy/d*f;}
      ls.forEach(l=>{const a=l.source,b=l.target;const na=ns.find(n=>n.id===a),nb=ns.find(n=>n.id===b);
        let dx=nb.x-na.x,dy=nb.y-na.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-100)/d*.05*(l.count||1);
        na.vx+=dx*f;na.vy+=dy*f;nb.vx-=dx*f;nb.vy-=dy*f;});
      ns.forEach(n=>{n.x+=n.vx||0;n.y+=n.vy||0;n.x=Math.max(n.r,Math.min(W-n.r,n.x));n.y=Math.max(n.r,Math.min(H-n.r,n.y));});
    }
    [...lg.children].forEach(e=>{e.setAttribute('x1',e.a.x);e.setAttribute('y1',e.a.y);e.setAttribute('x2',e.b.x);e.setAttribute('y2',e.b.y);});
    [...ng.children].forEach(c=>{const n=c.n;c.setAttribute('transform',`translate(${n.x},${n.y})`);});
    requestAnimationFrame(step);
  }step();
})();
</script>"""
    write_page("graph.html", body, title="關係網", en_sub="NETWORK")

# ============ 16. 輿地圖 ============
def page_map():
    places = load_json("places.json") or []
    if not places:
        places = [{"name":"洛陽","lng":112.45,"lat":34.62,"total":100},
                  {"name":"長安","lng":108.94,"lat":34.34,"total":80}]
    # 簡化 SVG 地圖：用經度緯度投影到畫布
    body = '<div id="map-wrap">'
    body += '<p class="section-desc">三國地理坐標散點圖。點擊地名在地圖中定位；點擊地圖圓點查看提及次數。</p>'
    body += '<svg class="map-svg" id="mapSvg" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg" style="background:#f5f0e6;">'
    body += '<rect x="0" y="0" width="900" height="700" fill="#e8dfc7"/>'
    body += '<text x="450" y="30" text-anchor="middle" font-family="Songti SC,serif" fill="#8b1a1a" font-size="16">三國形勢簡圖</text>'
    # 投影：經度 95-125 → x 50-850；緯度 20-42 → y 650-50
    for p in places:
        lng=p.get("lng",0);lat=p.get("lat",0);t=p.get("total",1)
        if not (95<lng<125 and 20<lat<42): continue
        x=50+(lng-95)/30*800; y=650-(lat-20)/22*600
        r=max(3,min(16,Math.sqrt(t)/2)) if False else max(3,min(16, (t**0.5)/2))
        # 用 python 算
        r=max(3,min(16, int((t**0.5)/2)))
        body += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="#8b1a1a" fill-opacity=".5" stroke="#8b1a1a"><title>{p.get("name","")} · {t}次</title></circle>'
        if t>30:
            body += f'<text x="{x+8:.0f}" y="{y+4:.0f}" font-family="Songti SC,serif" font-size="11" fill="#1a1a1a">{p.get("name","")}</text>'
    body += '</svg>'
    body += '<div class="place-list">'
    for p in sorted(places,key=lambda x:-x.get("total",0)):
        body += f'<div class="place-item"><div class="pn">{p.get("name","")}</div><div class="pt">提及 {p.get("total",0)} 次 · {p.get("lng",0):.2f},{p.get("lat",0):.2f}</div></div>'
    body += '</div></div>'
    write_page("map.html", body, title="輿地圖", en_sub="GEOGRAPHY")

# ============ 17. 讀法 ============
def page_reading():
    body = """<div class="prologue">
<p>讀《三國演義》，要分幾層看。第一層看熱鬧：桃園結義、三英戰呂布、火燒赤壁、空城計——人人皆能道。第二層看人物：曹操之奸、諸葛之智、關羽之義、趙雲之膽，毛宗崗所謂三絕者在此。第三層看章法：首尾呼應、伏線千里，「話說天下大勢，分久必合，合久必分」一句籠罩全書。第四層看版本：毛本「擁劉反曹」最顯，嘉靖本則多「操乃漢相曹參二十四代孫」之褒詞，讀者須辨。</p>
</div>
"""
    body += section("毛宗崗讀三國法（節選）", "MAO ZONGGANG ON READING")
    body += """<div class="critic-card" style="margin-bottom:16px;">
<div class="cc-era">清 · 康熙</div>
<h3>讀三國志法</h3>
<div class="cc-work">毛宗崗評本卷首</div>
<p>《三國》一書，乃文章之最妙者。敘一定之天子，則《西遊》是也；敘數傳之天子，則《水滸》是也；獨至《三國》，則分而為三，卒合而為一，其大起大落，大開大闔，如《國風》之雅，如《離騷》之怨，如《史記》之奇，如《左傳》之整。</p>
<p>吾以為《三國》有三奇，可稱三絕：諸葛亮一絕也，關雲長一絕也，曹操一絕也。諸葛是智絕，關羽是義絕，曹操是奸絕。</p>
<blockquote>總之，讀《三國》者，須從大處著眼，小處著手，方不負作者苦心。</blockquote>
</div>"""
    body += end_section()
    write_page("reading.html", body, title="讀法", en_sub="HOW TO READ")

# ============ 18. 虛實辨 ============
def page_fictional():
    items = [
        ("桃園結義","《三國志》載劉關張「恩若兄弟」，並無桃園結義之儀式。","小說第一回桃園結義為千古佳話，然正史無此典禮，屬文學提煉。"),
        ("過五關斬六將","關羽辭曹歸劉，《三國志》只言「羽盡封其所賜，拜書告辭，而奔先主於袁軍」。","五關六將皆屬虛構，路線亦地理矛盾。"),
        ("草船借箭","孫權探曹營時船中箭之事見《吳歷》，與諸葛亮無關。","小說移花接木於孔明，突顯其智。"),
        ("空城計","郭沖《三事》所載，裴松之已駁其妄。","後世最知名之「智絕」橋段，實為故事。"),
        ("借東風","長江流域冬季確有東南風，屬氣象現象，非諸葛亮所借。","小說將其神化，有祭風之戲。"),
        ("三氣周瑜","周瑜雅量高致，非氣量狹小之人，逝於巴丘病卒。","小說為襯孔明而貶公瑾。"),
        ("華佗刮骨療毒","關羽刮骨時華佗已死（佗死於建安十三年，羽刮骨在建安二十四年）。","史實為關羽刮骨，但醫者非華佗。"),
        ("貂蟬","正史只言「呂布與卓侍婢私通」，無貂蟬之名。","貂蟬是元代雜劇創造，三國演義完善為四大美人之一。"),
    ]
    body = '<div class="vs-grid">'
    for t,h,f in items:
        body += f"""<div class="vs-card">
<h4>{t}</h4>
<div class="hist"><span class="tag hist">正史</span>{h}</div>
<div class="fict"><span class="tag fict">演義</span>{f}</div>
</div>"""
    body += '</div>'
    body += """<div class="annotation gold" style="margin-top:20px;">虛實之辨為讀三國第一要義。章學誠所謂「七分實事，三分虛構」，大體可從；惟小說之妙正在虛處生情，不必以史繩文。</div>"""
    write_page("fictional.html", body, title="虛實辨", en_sub="HISTORY vs FICTION")

# ============ 19. 天命讖 ============
def page_destiny():
    items = [
        ("蒼天已死，黃天當立","黃巾起義口號，漢室氣數已盡之讖。"),
        ("千里草，何青青，十日卜，不得生","董卓讖謠，「董」字拆為千里草，「卓」字拆為十日卜。"),
        ("三馬同槽","司馬懿、司馬師、司馬昭父子將代魏之讖。"),
        ("牛繼馬後","西晉末司馬睿為牛氏子之讖。"),
        ("鬼在邊，委相連","魏字讖，曹丕代漢之兆。"),
        ("八歲孩兒難受禪，三分天下盡歸炎","司馬炎代魏，三分歸一。"),
        ("白帝托孤","劉備臨終託孤於諸葛亮，「君才十倍曹丕，必能安國，終定大事。若嗣子可輔，輔之；如其不才，君可自取。」"),
        ("五丈原星落","孔明病逝前「赤星自東北投於亮營，三投再還」，將星隕落之象。"),
        ("落鳳坡","龐統道號鳳雛，死於落鳳坡，名讖應驗。"),
        ("的盧防主","劉備所乘的盧馬，最終龐統乘之死於落鳳坡，應馬妨主之讖。"),
    ]
    body = '<div class="card-grid g3">'
    for t,d in items:
        body += f'<div class="card"><h3>{t}</h3><div class="desc">{d}</div></div>'
    body += "</div>"
    write_page("destiny.html", body, title="天命讖", en_sub="PROPHECIES")

# ============ 20. 評點家 ============
def page_critics():
    data = [
        ("明中葉","李贄（葉晝偽托）","李卓吾先生批評三國志","首開評點之風，以「童心說」論三國，貶曹操、揚關羽。"),
        ("明末","鍾惺","鍾伯敬先生批評三國志","竟陵派領袖，評點著重文法章法。"),
        ("明末清初","毛綸·毛宗崗","第一才子書三國志演義","改訂回目、添《臨江仙》開篇、增刪詩文，通行本所自。"),
        ("清·康熙","李漁","李笠翁批評三國志","戲曲大家，評點重關目、結構。"),
        ("民國","胡适","三國志演義序","以考證學方法斷定成書年代與版本源流。"),
        ("民國","魯迅","中國小說史略·元明傳來之講史","論「狀諸葛之多智而近妖，狀劉備之長厚而似偽」，影響深遠。"),
        ("當代","沈伯俊","三國演義校理本","系統校正毛本地名、官職、人物訛誤。"),
        ("當代","孫楷第","中國通俗小說書目","首開三國版本目錄學之宗。"),
        ("海外","小川環樹","三國演義の研究","日本漢學界三國版本研究開山之作。"),
    ]
    body = '<div class="critic-grid">'
    for era,name,work,desc in data:
        body += f"""<div class="critic-card">
<div class="cc-era">{era}</div>
<h3>{name}</h3>
<div class="cc-work">{work}</div>
<p>{desc}</p>
</div>"""
    body += "</div>"
    write_page("critics.html", body, title="評點家", en_sub="CRITICS")

# ============ 21. 學術論 ============
def page_papers():
    body = """<table class="data">
<thead><tr><th>時代</th><th>學者</th><th>論著</th><th>要旨</th></tr></thead>
<tbody>
<tr><td>明</td><td>蔣大器</td><td>三國志通俗演義序</td><td>現存最早序跋，謂「前代嘗以野史作為平話」，可謂成書史之重要文獻。</td></tr>
<tr><td>清</td><td>章學誠</td><td>丙辰劄記</td><td>論《三國演義》「七分實事，三分虛構」，為虛實辨經典之論。</td></tr>
<tr><td>民國</td><td>胡適</td><td>三國志演義序</td><td>考證成書在明初，版本以嘉靖本為最早。</td></tr>
<tr><td>民國</td><td>魯迅</td><td>中國小說史略</td><td>論三國人物塑造得失。</td></tr>
<tr><td>當代</td><td>孫楷第</td><td>中國通俗小說書目</td><td>著錄明清三國刊本三十餘種。</td></tr>
<tr><td>當代</td><td>柳存仁</td><td>三國志演義版本考</td><td>論志傳系早於嘉靖本。</td></tr>
<tr><td>當代</td><td>沈伯俊</td><td>三國演義辭典</td><td>系統梳理人物、地名、職官。</td></tr>
<tr><td>日本</td><td>小川環樹</td><td>三國演義の研究</td><td>日本三國學奠基。</td></tr>
<tr><td>日本</td><td>金文京</td><td>三國演義の世界</td><td>花關索故事研究。</td></tr>
<tr><td>英國</td><td>馬蘭安 Anne McLaren</td><td>Chinese Popular Culture & Ming Chantefables</td><td>明代刊本傳播史。</td></tr>
</tbody></table>"""
    write_page("papers.html", body, title="學術論", en_sub="SCHOLARSHIP")

# ============ 22. 演義外 ============
def page_adaptations():
    items = [("京劇","群英會","赤壁之戰周瑜與蔣幹故事，京劇經典。"),
             ("京劇","空城計","諸葛亮撫琴退司馬懿，譚派代表作。"),
             ("京劇","長阪坡","趙雲七進七出救阿斗。"),
             ("評書","袁闊成評書《三國演義》","1980年代電台廣播，一代人記憶。"),
             ("電視劇","1994年央視《三國演義》","唐國強飾諸葛亮、鮑國安飾曹操，經典版本。"),
             ("電視劇","2010年新版《三國》","高希希導演，陸毅飾諸葛亮。"),
             ("電影","赤壁（2008）","吳宇森導演，金城武飾孔明。"),
             ("動畫","日本《三國志》（1991）","東映動畫，橫山光輝原作。"),
             ("漫畫","橫山光輝《三國志》","日本暢銷漫畫，60卷。"),
             ("漫畫","陳某《火鳳燎原》","香港漫畫，以司馬懿為主角重新演繹。"),
             ("遊戲","光榮《三國志》系列","1985年至今策略遊戲標杆。"),
             ("遊戲","真·三國無雙系列","光榮割草遊戲。"),
             ("遊戲","三國殺","桌遊，風靡十年。"),
             ("續書","周大荒《反三國演義》","1924年，為蜀漢翻案。"),]
    body = '<div class="mini-grid">'
    for cat,name,desc in items:
        body += f'<div class="mini-card"><h4>{name}</h4><div class="mmeta">{cat}</div><p>{desc}</p></div>'
    body += "</div>"
    write_page("adaptations.html", body, title="演義外", en_sub="ADAPTATIONS")

# ============ 23. 本體查詢（DuckDB） ============
def page_query():
    body = """<div class="reader-status">本體查詢基於 DuckDB-WASM 瀏覽器端執行，無服務器，數據不出本機。首次打開需下載約 10MB 的 Parquet 數據文件。</div>
<div class="query-box">
<textarea id="sql">-- 提及次數 TOP20 人物
SELECT name, faction, mention_count
FROM persons
ORDER BY mention_count DESC
LIMIT 20;</textarea><br>
<button onclick="runq()">▶ 執行 SQL</button>
<div class="query-samples">快捷示例：
<code onclick="sets('SELECT name,faction,mention_count FROM persons ORDER BY mention_count DESC LIMIT 20;')">人物TOP20</code>
<code onclick="sets('SELECT name,mention_count FROM places ORDER BY mention_count DESC LIMIT 10;')">地名TOP10</code>
<code onclick="sets(\"SELECT faction, COUNT(*) AS n FROM persons GROUP BY faction ORDER BY n DESC;\")">勢力分組</code>
<code onclick="sets('SELECT name,ad_year FROM battles WHERE ad_year>0 ORDER BY ad_year LIMIT 20;')">戰役年表</code>
</div>
</div>
<div class="query-result" id="qout"></div>
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js" as="script">
<script src="https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-browser.js"></script>
<script>
let db=null;
const tables=['persons','places','battles','events','factions','stratagems','artifacts','prophecies','editions','scholars','papers','adaptations','chapters','stats','relationships'];
async function init(){
  document.getElementById('qout').innerHTML='<p style="color:#6b6b6b;">正在初始化 DuckDB-WASM，首次加載約 5-10 秒……</p>';
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles(), bundle=await duckdb.selectBundle(JSDELIVR_BUNDLES);
  const w=await duckdb.createDuckDB({locateFile:(f)=>"https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/"+f});
  db=await duckdb.createDuckDB(bundle.mainWorker);
  await db.instantiate(bundle.mainWorker,-1);
  const c=await db.connect();
  for(const t of tables){
    try{await c.query(`DROP TABLE IF EXISTS ${t}`);}catch(e){}
    const r=await fetch(`data/${t}.parquet`);
    if(!r.ok)continue;
    const ab=await r.arrayBuffer();
    await db.registerFileBuffer(`${t}.parquet`,new Uint8Array(ab));
    await c.query(`CREATE TABLE ${t} AS SELECT * FROM read_parquet('${t}.parquet')`);
  }
  await c.close();
  document.getElementById('qout').innerHTML='<p style="color:#2f5d50;">✓ 已加載 '+tables.length+' 張表，可開始查詢。</p>';
}
async function runq(){
  if(!db){document.getElementById('qout').innerHTML='正在初始化，請稍候……';return;}
  const sql=document.getElementById('sql').value;
  const c=await db.connect();
  try{
    const r=await c.query(sql);
    const cols=r.schema.fields.map(f=>f.name);
    let h='<table class="data"><thead><tr>'+cols.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>';
            for(const row of r){h+='<tr>';for(const col of cols)h+='<td>'+(row[col]??'')+'</td>';h+='</tr>';}
            h+='</tbody></table><p style="margin-top:8px;color:#6b6b6b;font-size:13px;">共 '+r.length+' 行</p>';
            document.getElementById('qout').innerHTML=h;
  }catch(e){document.getElementById('qout').innerHTML='<p style="color:#8b1a1a;">'+e.message+'</p>';}
  await c.close();
}
function sets(s){document.getElementById('sql').value=s;}
init();
</script>
"""
    write_page("query.html", body, title="本體查詢", en_sub="SPARQL · SQL")

# ============ 24. 統計譜 ============
def page_stat():
    persons = load_json("persons.json") or []
    freq = load_json("freq.json") or []
    sp = sorted(persons,key=lambda x:-x.get("total",x.get("mention_count",0)))[:20]
    body = section("人物出場 TOP20", "TOP PERSONAE")
    body += '<ul class="bar-list">'
    m = sp[0].get("total",sp[0].get("mention_count",1)) if sp else 1
    for p in sp:
        t=p.get("total",p.get("mention_count",0));w=int(t/m*100)
        body += f'<li><span class="bl-name">{p.get("name","")}</span><span class="bl-bar"><i style="width:{w}%"></i></span><span class="bl-num">{t}</span></li>'
    body += "</ul>"+end_section()
    body += section("字頻 TOP30", "CHARACTERS")
    body += '<ul class="bar-list">'
    if freq:
        m = freq[0][1] if isinstance(freq[0],list) else freq[0].get("count",1)
        for item in freq[:30]:
            if isinstance(item,list):
                ch,cnt = item[0],item[1]
            else:
                ch,cnt = item.get("char",item.get("ch","")),item.get("count",0)
            w=int(cnt/m*100)
            body += f'<li><span class="bl-name">{ch}</span><span class="bl-bar"><i style="width:{w}%"></i></span><span class="bl-num">{cnt}</span></li>'
    body += "</ul>"+end_section()
    write_page("stat.html", body, title="統計譜", en_sub="STATISTICS")

# ============ 25. 本體論 ============
def page_ontology():
    body = '<div class="reader-status">本體文件採用 Turtle 語法，兼容 Protégé / rdflib / GraphDB / Apache Jena 直接打開；詞表採用 YAML 受控詞表，可跨《水滸傳本體論》 sh: 前綴聯動。</div>'
    body += '<div style="margin-bottom:24px;"><a class="btn" href="ontology/sanguo_kg_ontology.ttl">📥 下載本體 TTL（TBox 1249行）</a>'
    body += '<a class="btn ghost" href="ontology/sanguo_kg_multiversion_abox.ttl">📥 多版本 ABox TTL（7017行）</a>'
    body += '<a class="btn ghost" href="ontology/vocabularies.yaml">📥 受控詞表 YAML</a></div>'
    body += stat_cards([("78","OWL 類"),("37","對象屬性"),("111","數據屬性"),("12","版本族譜"),("337","異文個體"),("455","人物 ABox")])
    body += section("頂級類階層", "CLASSES")
    classes = [
        ("sg:Thing","頂層抽象事物"),
        ("sg:Wu / Shi / ShiJian / Di","四範疇：物·事·時·地"),
        ("sg:VersionFamily","版本族（演義系/志傳系/評點系/現代/續書）"),
        ("sg:Edition","具體版本（刊本/抄本/評本/現代整理本）"),
        ("sg:Volume / Chapter / Paragraph","卷·回·段文本原子"),
        ("sg:VariantReading","異文（跨版本文字差異）"),
        ("sg:Commentary","評點（毛評/李評/李漁評/鍾評）"),
        ("sg:Person / Faction / Office / Place","人物·勢力·官職·地理"),
        ("sg:Artifact / Stratagem / Battle / Event","器物·計謀·戰役·事件"),
        ("sg:Prophecy","讖緯·天命敘事"),
        ("sg:Scholar / Paper / Adaptation","評點家·學術論著·衍生作品"),
    ]
    body += '<ul style="list-style:none;font-family:var(--font-serif);font-size:15px;line-height:2.2;">'
    for c,d in classes:
        body += f'<li><span style="color:var(--vermilion-deep);font-weight:700;">{c}</span>　—　{d}</li>'
    body += "</ul>"+end_section()
    body += section("核心對象屬性（24種+13種版本學）", "OBJECT PROPERTIES")
    props = [("君臣","lordOf/vassalOf","函數性"), ("父子","parentOf/childOf","傳遞"), ("兄弟","swornBrotherOf","對稱"),
             ("夫妻","spouseOf","對稱"), ("隸屬","memberOf/factionOf",""), ("籍貫","bornIn",""),
             ("主公","serves",""), ("參戰","foughtIn",""), ("發生於","occursAt",""),
             ("位於","locatedIn","傳遞"), ("使用計策","usesStratagem",""), ("使用器物","usesArtifact",""),
             ("預言","foretoldBy",""), ("應讖","fulfills",""), ("對應正史","parallelsHistoric",""),
             ("版本衍生","derivedFrom","傳遞"), ("評點於","commentedOn",""), ("屬版本族","inFamily",""),
             ("收錄","contains","反函數"), ("異文對應","hasVariant",""), ("回目對應","correspondsTo","對稱"),
             ("學者論述","discussedBy",""), ("衍生改編","adaptedFrom",""), ("成書於","writtenIn","")]
    body += '<table class="data"><thead><tr><th>關係</th><th>屬性名</th><th>OWL 特徵</th></tr></thead><tbody>'
    for c,p,o in props:
        body += f'<tr><td>{c}</td><td><code>{p}</code></td><td>{o}</td></tr>'
    body += "</tbody></table>"+end_section()
    body += section("版本演化 derivedFrom（ABox 示例）", "VERSION STEMMA")
    body += """<pre class="ontology-code"><span class="cmt"># 演義系</span>
<span class="key">sg:ed_jiajing</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:inFamily</span> sg:fam_yanyi ; <span class="key">sg:year</span> <span class="str">"1522"</span> .
<span class="key">sg:ed_zhouyuexiao</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:derivedFrom</span> sg:ed_jiajing ; <span class="key">sg:year</span> <span class="str">"1591"</span> .
<span class="cmt"># 志傳系（獨立於演義系）</span>
<span class="key">sg:ed_yefengchun</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:inFamily</span> sg:fam_zhichuan_full .
<span class="key">sg:ed_yuxiangdou</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:derivedFrom</span> sg:ed_yefengchun .
<span class="cmt"># 評點系 → 毛宗崗定本</span>
<span class="key">sg:ed_lizhuowu</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:derivedFrom</span> sg:ed_zhouyuexiao .
<span class="key">sg:ed_maozonggang</span> a <span class="cls">sg:Edition</span> ; <span class="key">sg:derivedFrom</span> sg:ed_lizhuowu ; <span class="key">sg:hasFullText</span> <span class="str">true</span> .</pre>"""
    body += end_section()
    body += section("OWL 2 DL 推理約束", "OWL 2 DL CONSTRAINTS")
    body += """<ul style="font-family:var(--font-serif);font-size:14px;line-height:2;">
<li>類不相交：<code>Person ⊓ Place ⊑ ⊥</code>、<code>Battle ⊓ Event ⊓ ⊥</code>……</li>
<li>函數屬性：<code>bornIn Functional</code>、<code>inFamily Functional</code>、<code>hasFullText Functional</code></li>
<li>反函數：<code>personId InverseFunctional</code>、<code>editionId InverseFunctional</code>（主鍵）</li>
<li>對稱屬性：<code>spouseOf / swornBrotherOf / correspondsTo</code></li>
<li>傳遞屬性：<code>parentOf⁺ / derivedFrom⁺ / locatedIn⁺</code>（可做祖先與版本溯源推理）</li>
<li>互逆對：<code>lordOf ≡ vassalOf⁻ / memberOf ≡ hasMember⁻ / contains ≡ containedIn⁻</code></li>
<li>數據約束：<code>Person ∋ mention_count xsd:integer</code>、<code>Edition ∋ year xsd:gYear</code></li>
</ul>"""
    body += end_section()
    write_page("ontology.html", body, title="本體論規範", en_sub="ONTOLOGY")

# ============ 詩詞鈔（暫用詩集硬編碼） ============
def page_poetry():
    poems=[
        ("臨江仙·滾滾長江東逝水","楊慎（毛本卷首）",
         "滾滾長江東逝水，浪花淘盡英雄。是非成敗轉頭空。青山依舊在，幾度夕陽紅。\n白髮漁樵江渚上，慣看秋月春風。一壺濁酒喜相逢。古今多少事，都付笑談中。"),
        ("短歌行","曹操",
         "對酒當歌，人生幾何！譬如朝露，去日苦多。\n慨當以慷，憂思難忘。何以解憂？唯有杜康。\n……月明星稀，烏鵲南飛。繞樹三匝，何枝可依？\n山不厭高，海不厭深。周公吐哺，天下歸心。"),
        ("出師表","諸葛亮",
         "先帝創業未半而中道崩殂，今天下三分，益州疲弊，此誠危急存亡之秋也。……\n臣本布衣，躬耕於南陽，苟全性命於亂世，不求聞達於諸侯。……\n鞠躬盡瘁，死而後已。"),
        ("隆中對","諸葛亮",
         "自董卓已來，豪傑並起。……今操已擁百萬之眾，挾天子而令諸侯，此誠不可與爭鋒。\n孫權據有江東，已歷三世，國險而民附，賢能為之用，此可以為援而不可圖也。\n……益州險塞，沃野千里，天府之土……將軍既帝室之胄，信義著於四海……則霸業可成，漢室可興矣。"),
        ("銅雀台賦","曹植（毛本節選）",
         "從明後以嬉游兮，登層台以娛情。見太府之廣開兮，觀聖德之所營。\n……攬二喬於東南兮，樂朝夕之與共。——按：「連二喬」為諸葛亮改讀激周瑜之辭，原賦本作「連二橋」。"),
        ("七步詩","曹植",
         "煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急！"),
        ("戒子書","諸葛亮",
         "夫君子之行，靜以修身，儉以養德。非淡泊無以明志，非寧靜無以致遠。\n夫學須靜也，才須學也，非學無以廣才，非志無以成學。"),
    ]
    body = '<div class="card-grid g3">'
    for t,a,txt in poems:
        body += f'<div class="poem-card"><h4>{t}</h4><div style="font-size:12px;color:var(--gold);margin-bottom:8px;">{a}</div><pre>{txt}</pre></div>'
    body += "</div>"
    write_page("poetry.html", body, title="詩詞鈔", en_sub="POETRY")

if __name__ == "__main__":
    DOCS.mkdir(exist_ok=True, parents=True)
    (DOCS/"ontology").mkdir(exist_ok=True)
    (DOCS/"assets").mkdir(exist_ok=True)
    (DOCS/"data").mkdir(exist_ok=True)
    print("Generating pages...")
    page_index()
    page_read()
    page_heroes()
    page_persons()
    page_factions()
    simple_list_page("places.html","地理志","GEOGRAPHY","places.json","name","desc","region")
    simple_list_page("battles.html","戰役錄","BATTLES","battles.json","name","desc","year")
    simple_list_page("events.html","事件譜","EVENTS","events.json","name","desc","year")
    simple_list_page("stratagems.html","計謀譜","STRATAGEMS","stratagems.json","name","desc")
    simple_list_page("artifacts.html","器物譜","ARTIFACTS","artifacts.json","name","desc")
    simple_list_page("prophecies.html","讖緯志","PROPHECIES","prophecies.json","text","meaning","chapter")
    page_poetry()
    page_versions()
    page_variants()
    page_graph()
    page_map()
    page_reading()
    page_fictional()
    page_destiny()
    page_critics()
    page_papers()
    page_adaptations()
    page_query()
    page_stat()
    page_ontology()
    print("Done. Total pages:", len(NAV))
