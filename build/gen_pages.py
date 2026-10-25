"""重新生成多版本本体站点的所有页面"""
import json, os, re, pathlib

ROOT = pathlib.Path("/home/user/workspace/5806794539557799814/sanguo")
DOCS = ROOT/"docs"
DATA = ROOT/"data"

def load(name): return json.loads((DATA/name).read_text(encoding='utf-8'))

persons = load("persons.json")
places = load("places.json")
factions = load("factions.json")
battles = load("battles.json")
stratagems = load("stratagems.json")
artifacts = load("artifacts.json")
events = load("events.json")
prophecies = load("prophecies.json")
chapters = load("chapters.json")
graph = load("graph.json")
editions = load("editions.json")

stat = {"chapters": len(chapters), "persons": len(persons), "places": len(places),
        "factions": len(factions), "battles": len(battles), "stratagems": len(stratagems),
        "artifacts": len(artifacts), "prophecies": len(prophecies),
        "events": len(events), "editions": len(editions['editions']),
        "variants": len(editions['variant_readings'])}

# --- 公共模板 ---
CSS = "assets/app.css"
def head(title, desc=""):
    return f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 三國演義本體論</title><meta name="description" content="{desc}"><link rel="stylesheet" href="{CSS}"></head><body>
<header class="topbar"><div class="seal">三國</div><h1 class="title"><a href="index.html">三國演義本體論</a></h1><p class="sub">—— 多版本知識圖譜 · Sanguo-Yanyi Multi-Edition Ontology</p></header>
<nav class="tabbar">{nav()}</nav>'''
def foot(extra=""):
    return f'<footer class="footer"><p>本站以毛宗崗評本百二十回為在綫全文（590,968字）；本體論（OWL 2）兼容嘉靖本/周曰校本/葉逢春本/黃正甫本/余象斗本/李卓吾評本/李漁評本/毛宗崗本/人民文學出版社本等12個主要版本。</p><p>工程以 yejinlei 西遊記本體論（jtw_kg_ontology.ttl）為範式，面向多版本對照與異文比對場景擴展；視覺系統參考《石頭記》數字人文站。</p>{extra}</footer><script src="assets/app.js" defer></script></body></html>'

# 导航顺序
NAV = [
    ("index","總覽"),
    ("read","正文"),
    ("versions","版本譜"),
    ("variants","異文對照"),
    ("persons","人物譜"),
    ("factions","勢力志"),
    ("relations","關係網"),
    ("places","輿地圖"),
    ("battles","戰役錄"),
    ("stratagems","計謀譜"),
    ("artifacts","器物譜"),
    ("prophecies","讖緯志"),
    ("graph","本體圖譜"),
    ("ontology","本體論規範"),
]
def nav():
    out=[]
    for i,n in NAV:
        out.append(f'<a href="{i}.html">{n}</a>')
    return "".join(out)

def card(title, body, cls="poem-card"):
    return f'<article class="{cls}"><h3>{title}</h3><div class="card-body">{body}</div></article>'

def write_page(name, title, body, desc=""):
    p = DOCS/f"{name}.html"
    p.write_text(head(title, desc)+body+foot(), encoding="utf-8")
    print("wrote", p.name)

# ============ 0. 首页 ============
def page_index():
    feats = []
    feats.append(card("📚 多版本本體框架",
        f'<p>本體論 OWL 2 建模，兼容 <b>{stat["editions"]}</b> 個明清主要刊本，分屬<strong>演義系</strong>（嘉靖壬午本→周曰校本→李卓吾評本→毛宗崗本）與<strong>志傳系</strong>（葉逢春本→黃正甫本→余象斗本）兩大版本族。</p>'
        f'<p>新增類：<code>VersionFamily / Edition / Volume / Chapter / Paragraph / VariantReading / Commentary</code>，支持版本源流（derivedFrom）、跨版本回目對應（correspondsTo）、異文類型與文獻學意義標註。</p>'))
    feats.append(card("📝 在綫全文",
        f'<p>收錄<b>毛宗崗評本</b>百二十回全文 <b>590,968 字</b>。可按回次切換閱讀，人物/地點/勢力已自動鏈結至實體卡。</p>'
        '<p>其他版本（嘉靖本、周曰校本等）給出完整版本元數據與經典異文案例；欲加全文，把 TXT 放入 <code>raw/</code> 目錄運行 <code>build/*.py</code> 即可自動入庫。</p>'))
    feats.append(card("🔍 實體抽取",
        f'<p>以本體受控詞表為錨，從原文抽取實體：'
        f'<b>{stat["persons"]} 人物</b> · <b>{stat["places"]} 地點</b> · {stat["factions"]} 勢力 · '
        f'{stat["battles"]} 戰役 · {stat["stratagems"]} 計謀 · {stat["artifacts"]} 器物 · '
        f'{stat["prophecies"]} 讖語 · {stat["events"]} 事件</p>'
        '<p>人物提及次數：<span class="zhu">曹操 2543 · 劉備 2509 · 諸葛亮 1861 · 關羽 943 · 呂布 858 · 孫權 777</span>。</p>'))
    feats.append(card("⚖️ 異文對照",
        f'<p>整理 <b>{stat["variants"]} 組經典版本差異</b>：曹操名言、關公改印、孔明燒魏延、花關索故事、開篇《臨江仙》、靜軒詩去留、張郃戰張飛回合數等，按『版本—文本—文獻學意義』三欄展示。</p>'))

    # 统计
    stat_html = '<div class="stat-grid">'
    for k,v in [("回次","120"),("字數","59萬"),("人物",stat["persons"]),("版本",stat["editions"]),("異文",stat["variants"]),("關係","137")]:
        stat_html += f'<div class="stat"><span class="n">{v}</span><span class="l">{k}</span></div>'
    stat_html += '</div>'

    body = f'''
<section class="hero">
  <div class="hero-text">
    <p class="yinxiao">滾滾長江東逝水，浪花淘盡英雄。</p>
    <h2 class="hero-title">三國演義本體論</h2>
    <p class="hero-sub">以羅貫中《三國演義》為錨，參考 yejinlei 西遊記本體論與《石頭記》數字人文站的設計語言，構建面向多版本對照、異文研究、人物關係知識圖譜的開放本體工程。</p>
    {stat_html}
  </div>
</section>
<section class="card-grid">{''.join(feats)}</section>
<section class="card"><h3>🔗 閱讀入口</h3><div class="card-body"><p><a href="read.html">📖 在綫正文（毛本百二十回）</a></p><p><a href="variants.html">⚖️ 版本異文對照（8組經典案例）</a></p><p><a href="versions.html">📚 版本源流譜（12個主要刊本）</a></p><p><a href="graph.html">🕸 本體關係圖譜（可拖拽）</a></p></div></section>'''
    write_page("index","總覽",body)

# ============ 1. 正文 ============
def page_read():
    body = '''<section class="card"><h3>正文閱讀</h3><div class="card-body" style="padding:0">
    <div class="read-toolbar"><select id="ch-select" style="width:100%;padding:8px 12px"></select>
    <div class="meta" id="ch-meta"></div></div>
    <article id="reader" class="reader"></article></div></section>'''
    body += '<script>fetch("data/read.json").then(r=>r.json()).then(d=>{const sel=document.getElementById("ch-select");d.forEach((c,i)=>{const o=document.createElement("option");o.value=i;o.textContent=`第${c.no}回 ${c.title}`;sel.appendChild(o)});sel.onchange=()=>render(+sel.value);function render(i){const c=d[i];document.getElementById("ch-meta").innerHTML=`<span class="zhu">版本：毛宗崗評本百二十回</span>`;document.getElementById("reader").innerHTML=`<h2>第${c.no}回 ${c.title}</h2>`+c.paras.map(p=>`<p>${p}</p>`).join("");window.scrollTo(0,0)}render(0)})</script>'
    write_page("read","正文",body)

# ============ 2. 版本谱 ============
def page_versions():
    fam = editions['family_meta']
    cards=[card(fam['yanyi']['name']+"族譜",
        f'<p><b>祖本：</b>{fam["yanyi"]["stem"]}</p><p><b>特徵：</b>{fam["yanyi"]["feature"]}</p>'
        '<p>演義系從嘉靖壬午本（1522）發軔，經周曰校萬卷樓本（1591）、李卓吾評本（約1620）增補評點與合回為一百二十，至清初毛宗崗評本（1679）定型，遂成通行本三百餘年。</p>','poem-card'),
    card(fam['zhizhuan']['name']+"族譜",
        f'<p><b>祖本：</b>{fam["zhizhuan"]["stem"]}</p><p><b>特徵：</b>{fam["zhizhuan"]["feature"]}</p>'
        '<p>志傳系以閩建刻本為主（葉逢春、余象斗、黃正甫、劉龍田、朱鼎臣），保留民間說書痕跡與花關索故事，文字質樸，是研究《三國》成書史的重要資源。</p>','poem-card')]
    # 版本谱系 SVG
    lineage = editions['edition_lineage']
    ed_map = {e['id']:e for e in editions['editions']}
    svg = ['<svg width="100%" viewBox="0 0 900 480" xmlns="http://www.w3.org/2000/svg" style="background:#f8f1de;border:1px solid #d4c5a0;border-radius:8px">']
    # 两族横向布局
    pos = {
        "jiajing":(120,60),"zhouyuexiao":(120,120),"lizhuowu":(120,180),"zhongbojing":(120,230),
        "maozonggang":(120,290),"liyu":(120,350),"renwen":(120,410),
        "yefengchun":(620,60),"yuxiangdou":(620,120),"huangzhengfu":(620,180),"liuliantian":(620,240),"zhudingchen":(620,300)
    }
    def n(id):
        e=ed_map[id]
        x,y=pos[id]
        color = "#a8322a" if e["family"]=="yanyi" else "#3d6b5c"
        has = "★" if e["has_fulltext"] else ""
        svg.append(f'<circle cx="{x}" cy="{y}" r="8" fill="{color}"/>')
        svg.append(f'<text x="{x+14}" y="{y+5}" font-size="14" fill="#2a2723">{e["short"]}{has}</text>')
    for a,b in lineage:
        if a in pos and b in pos:
            x1,y1=pos[a]; x2,y2=pos[b]
            svg.append(f'<line x1="{x1}" y1="{y1+8}" x2="{x2}" y2="{y2-8}" stroke="#8a7b5c" stroke-width="1.5"/>')
    for id in pos: n(id)
    svg.append('<text x="120" y="25" font-size="16" fill="#a8322a" font-weight="bold">演義系</text>')
    svg.append('<text x="620" y="25" font-size="16" fill="#3d6b5c" font-weight="bold">志傳系</text>')
    svg.append('<text x="134" y="310" font-size="12" fill="#a8322a">★=本站已有全文</text>')
    svg.append('</svg>')
    # 12版本卡
    vc=[]
    for e in editions['editions']:
        avail = '<span class="pi zhu">★ 已收全文</span>' if e["has_fulltext"] else '<span class="pi">元數據已收</span>'
        feats = "".join(f'<li>{x}</li>' for x in e.get("features",[]))
        diff = ""
        if e.get("diff_to_maoben"):
            diff = '<h4>與毛本主要差異</h4><ul class="diff">'+''.join(f'<li>{x}</li>' for x in e["diff_to_maoben"])+'</ul>'
        note = f'<p class="note">{e.get("note","")}</p>' if e.get("note") else ""
        src = f'<p><b>全文來源：</b>{e.get("text_source","")}</p>' if e.get("text_source") else ""
        vc.append(card(f"{e['name']}（{e['year']}）",
            f'<p>{avail} <span class="pi">{e["structure"]}</span> <span class="pi">{e["preservation"]}</span></p>'
            f'<p><b>刊者：</b>{e.get("editor","")}　<b>刊行：</b>{e.get("publisher","")}</p>'
            f'<p><b>典藏：</b>{e.get("repository","")}</p>{src}{note}'
            f'<h4>版本特徵</h4><ul>{feats}</ul>{diff}','poem-card edition'))
    body = '<section class="card"><h3>版本源流圖</h3><div class="card-body">'+''.join(svg)+'<p class="note">紅色=演義系（雅化、240則→120回），綠色=志傳系（含花關索、20卷）；箭頭表示版本間承繼關係。</p></div></section>'
    body += '<section class="card-grid">'+''.join(cards)+'</section>'
    body += '<section class="card-grid">'+''.join(vc)+'</section>'
    write_page("versions","版本譜",body)

# ============ 3. 异文对照 ============
def page_variants():
    vcs=[]
    for v in editions['variant_readings']:
        rows=[]
        for vr in v['variants']:
            ed = next((e for e in editions['editions'] if e['id']==vr['edition']), None)
            ed_name = vr['edition'] if not ed else ed['short']
            note = f'<p class="note">{vr["note"]}</p>' if vr.get("note") else ""
            rows.append(f'<tr><td><b>{ed_name}</b></td><td>{vr["text"]}{note}</td></tr>')
        vcs.append(card(v['id'].split('_',1)[1]+" "+v['topic'],
            f'<p><b>敘事位置：</b>{v["narrative_point"]}</p>'
            f'<table class="variant"><thead><tr><th style="width:140px">版本</th><th>文字</th></tr></thead><tbody>{"".join(rows)}</tbody></table>'
            f'<h4>文獻學意義</h4><p class="sig">{v["significance"]}</p>','poem-card variant-card'))
    body = '<section class="card"><h3>異文對照：八組經典案例</h3><div class="card-body"><p>下列異文根據《三國演義》版本學界（陳翔華、金文京、[日]中川諭、杜貴晨等）的既有研究整理。表格列出同一敘事節點在不同版本的文字差異，並說明其意義。</p><p class="note">全文對照需所有版本全文在庫。本站目前已有毛本全文；嘉靖本/周曰校本/黃正甫本/葉逢春本等的全文可由用戶放入 <code>raw/</code> 目錄後運行 build 腳本自動對齊。</p></div></section>'
    body += '<section class="card-grid">'+''.join(vcs)+'</section>'
    write_page("variants","異文對照",body)

# ============ 4. 人物/势力/关系/地点/战役/计谋/器物/谶纬 ============
def simple_list_page(name, title, items, render):
    body = '<section class="card-grid">'
    for x in items: body += card(x.get('name',x.get('title','')), render(x))
    body += '</section>'
    write_page(name,title,body)

def page_persons():
    # top 20 only for the cards list page
    items = sorted(persons, key=lambda x:-x.get('mentions',0))[:40]
    def r(p):
        return f'<p>字{p.get("zi","—")}　{p.get("faction","")}　{"君主" if p.get("category")=="君主" else p.get("category","")}</p><p>提及 {p.get("mentions",0)} 次{p.get("first_chapter",0) and f"　初登場第{p['first_chapter']}回" or ""}</p>'
    body = f'<section class="card"><h3>人物譜（TOP 40 提及次數，共 {len(persons)} 人）</h3><div class="card-body"><p>全部人物數據見 <code>data/persons.json</code>。本體關係圖譜頁可查看完整人物網絡。</p></div></section>'
    body += '<section class="card-grid">'
    for p in items: body += card(p['name'], r(p))
    body += '</section>'
    write_page("persons","人物譜",body)

def page_factions():
    def r(f):
        return f'<p>{f.get("desc","")}</p>'
    simple_list_page("factions","勢力志",factions,r)

def page_places():
    items = sorted(places, key=lambda x:-x.get('mentions',0))[:60]
    def r(p): return f'<p>提及 {p.get("mentions",0)} 次　{p.get("region","")}</p>'
    simple_list_page("places","輿地圖",items,r)

def page_battles():
    def r(b):
        return f'<p>{b.get("date","")}　交戰：{b.get("versus","")}</p><p>{b.get("desc","")}</p>'
    simple_list_page("battles","戰役錄",battles,r)

def page_stratagems():
    def r(s): return f'<p>設計者：{s.get("by","")}　目標：{s.get("target","")}</p><p>{s.get("desc","")}</p>'
    simple_list_page("stratagems","計謀譜",stratagems,r)

def page_artifacts():
    def r(a): return f'<p>類型：{a.get("type","")}　持有者：{a.get("owner","")}</p>'
    simple_list_page("artifacts","器物譜",artifacts,r)

def page_prophecies():
    def r(p): return f'<p>{p.get("desc","")}</p>'
    simple_list_page("prophecies","讖緯志",prophecies,r)

def page_events():
    def r(e): return f'<p>{e.get("desc","")}</p>'
    simple_list_page("events","事件志",events,r)

# ============ 5. 关系网 ============
def page_relations():
    groups = {"結義":"swornBrotherOf","血緣":"fatherOf/sonOf","君臣":"lordOf/ministerOf","配偶":"spouseOf","敵對":"enemyOf","殺伐":"killedBy","薦舉/叛降":"recommended/defectedTo"}
    body = '<section class="card"><h3>七類人物關係</h3><div class="card-body"><p>所有關係抽取自毛本全文，按七類分組。完整可交互網絡見本體圖譜頁。</p></div></section>'
    # 关系按类型分组
    rels_by_t = {}
    main = graph['views'][0]
    for r in main.get('links',[]):
        t = r.get('kind','其他')
        rels_by_t.setdefault(t,[]).append(r)
    grids=[]
    main = graph['views'][0]
    id2n = {n['id']:n['name'] for n in main['nodes']}
    for t,lst in rels_by_t.items():
        items = ''.join(f'<li>{id2n.get(r["source"],r["source"])} — <span class="zhu">{t}</span> → {id2n.get(r["target"],r["target"])}</li>' for r in lst[:30])
        grids.append(card(f"{t}（{len(lst)}）",f'<ul class="rel">{items}</ul>'))
    body += '<section class="card-grid">'+''.join(grids)+'</section>'
    write_page("relations","關係網",body)

# ============ 6. 本体论 ============
def page_ontology():
    classes = [
        ("sg:Thing","頂層抽象事物"),
        ("sg:Wu / Shi / ShiJian / Di","四範疇：物 / 事 / 時 / 地"),
        ("sg:VersionFamily","版本族（演義系/志傳系）"),
        ("sg:Edition","具體版本（刊本/抄本/評本/現代整理本）"),
        ("sg:Volume","卷"),
        ("sg:Chapter","回/則（敘事單元）"),
        ("sg:Paragraph","段落（文本原子）"),
        ("sg:VariantReading","異文（跨版本文字差異）"),
        ("sg:Commentary","評點（毛評/李評/李漁評/鍾評）"),
        ("sg:Person / Faction / Office / Place","人物 / 勢力 / 官職 / 地點"),
        ("sg:Artifact / Stratagem / Battle / Event","器物 / 計謀 / 戰役 / 事件"),
        ("sg:Prophecy / Poem / Concept","讖緯 / 詩文 / 主題概念"),
    ]
    props = [
        ("belongsToFamily / derivedFrom / collatedWith","版本族譜關係"),
        ("hasCommentator / hasEditor / publishedYear","版本元數據"),
        ("chapterStructure / preservationStatus / repository","版本結構/典藏"),
        ("correspondsTo","跨版本回/則對應"),
        ("variantOf / variantEdition / variantText","異文所屬與文字"),
        ("variantType / significance","異文類型與文獻學意義"),
        ("mentions / appearsIn","段落提及實體"),
        ("swornBrotherOf / fatherOf / lordOf / spouseOf / enemyOf","人物社會關係"),
        ("poemAttribution","詩文署名（區分靜軒詩/後人詩/史官論）"),
    ]
    body = f'''<section class="card">
    <h3>本體論 OWL 2 規範</h3><div class="card-body">
    <p>本體文件採用 Turtle 語法，兼容 Protégé / rdflib 等工具直接打開。詞表採用 YAML 受控詞表。</p>
    <p><a class="btn" href="ontology/sanguo_kg_ontology.ttl" download>📥 下載本體 TTL（{stat["editions"]} 版本 / {len(classes)} 類）</a>　
    <a class="btn" href="ontology/vocabularies.yaml" download>📥 下載受控詞表 YAML</a></p>
    <h4>類（Classes）</h4><ul>{''.join(f"<li><code>{c}</code> — {d}</li>" for c,d in classes)}</ul>
    <h4>屬性（Properties）</h4><ul>{''.join(f"<li><code>{c}</code> — {d}</li>" for c,d in props)}</ul>
    <h4>設計原則</h4><ol>
    <li><b>版本先行</b>：所有文本/段落/異文/評點都從屬於某個 Version，實體出處可追溯至版本；</li>
    <li><b>四範疇分類</b>：沿襲《紅樓夢》本體「物/事/時/地」四分，保證敘事文學建模一致性；</li>
    <li><b>異文一等公民</b>：VariantReading 是獨立類而非附屬文本，帶 variantType 與 significance 字段可查詢；</li>
    <li><b>OWL DL 合規</b>：函數式屬性、傳遞屬性、逆屬性、對稱屬性顯式標註，可做推理；</li>
    <li><b>可擴展</b>：新增版本只需在 data/editions.json 增一項，若加全文則將 TXT 放入 raw/ 並運行解析腳本。</li>
    </ol>
    </div></section>'''
    write_page("ontology","本體論規範",body)

# ============ 7. 本体图谱（力导向）复用原 graph.html ============
def page_graph():
    # 读取旧文件已可用，保留；若不存在则生成
    p = DOCS/"graph.html"
    if not p.exists():
        p.write_text("<h1>图谱页（请运行原gen_pages生成）</h1>",encoding='utf-8')

# ============ 主题页（mirror / themes 简化保留） ============
def page_mirror():
    body = '<section class="card"><h3>字鏡</h3><div class="card-body"><p>以毛本全文為樣本的字符頻次表。共計 3978 個不同字符，總字數 590,968。</p><p>常見字 TOP 10：不 / 人 / 一 / 大 / 軍 / 兵 / 將 / 來 / 馬 / 曹。</p></div></section>'
    write_page("mirror","字鏡",body)

def page_themes():
    items=[card("正統論","<p>『擁劉反曹』是毛本的核心敘事立場；嘉靖本則較為中立，曹操的雄才與劉備的仁弱並見。志傳系更近說書口吻，對三方並列敘述。</p>"),
           card("天命與分合","<p>開篇『話說天下大勢，分久必合，合久必分』（毛本）與結尾『鼎足三分已成夢』形成首尾呼應，呈現循環史觀。</p>"),
           card("忠義論","<p>桃園結義、千里走單騎、五丈原託孤是忠義母題的三次頂點；關公形象隨版本演進逐步神化（改印細節的增刪即其表徵）。</p>"),
           card("英雄論","<p>『治世之能臣，亂世之奸雄』為曹操定調；『寧我負人』版本差異決定英雄與奸雄的分界。</p>")]
    body = '<section class="card-grid">'+''.join(items)+'</section>'
    write_page("themes","母題論衡",body)

# ============ 生成所有页面 ============
if __name__=="__main__":
    page_index()
    page_read()
    page_versions()
    page_variants()
    page_persons()
    page_factions()
    page_places()
    page_battles()
    page_stratagems()
    page_artifacts()
    page_prophecies()
    page_relations()
    page_ontology()
    page_mirror()
    page_themes()
    page_events()
    page_graph()
    # 删除旧的 entities.html（合并入 persons/factions/places 等）
    # 但保留它做跳转
    (DOCS/"entities.html").write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=persons.html"><p>跳转中…<a href="persons.html">人物谱</a>',encoding='utf-8')
    print("done")
