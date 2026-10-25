#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《三國演義》本體站 · 頁面生成器 v3
參考《紅樓未完》站點結構 + 本體論 sg: 規範，24 研究入口。
"""
import json, os, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
DATA = ROOT / "data"
ONTO = ROOT / "03_本体论规范"
DOCS.mkdir(exist_ok=True)
(DOCS / "data").mkdir(exist_ok=True)
(DOCS / "ontology").mkdir(exist_ok=True)
(DOCS / "assets").mkdir(exist_ok=True)

# ---- 載入資料 ----
def load(name, default=None):
    p = DATA / name
    if not p.exists(): return default if default is not None else []
    return json.loads(p.read_text(encoding="utf-8"))

chapters   = load("chapters.json", [])
persons    = load("persons.json", [])
factions   = load("factions.json", [])
places     = load("places.json", [])
battles    = load("battles.json", [])
events     = load("events.json", [])
artifacts  = load("artifacts.json", [])
stratagems = load("stratagems.json", [])
prophecies = load("prophecies.json", [])
stat       = load("stat.json", {})
editions   = load("editions.json", {})

# 統計
n_char = sum(len(c.get("text","")) for c in chapters)
n_person = len(persons)
n_battle = len(battles)
n_place  = len(places)
n_faction= len(factions)
n_edition= len(editions.get('editions',[]))
n_event  = len(events)
n_art    = len(artifacts)
n_strat  = len(stratagems)
n_proph  = len(prophecies)

# ---- 24 維度（對應紅樓未完24入口）----
PORTALS = [
    ("read.html",      "正文·毛宗崗評本", "The Text",       "一百二十回全文，朱批旁註，跨版本標註異文位置"),
    ("ontology.html",  "本體論·TBox",     "Ontology",       "10 大實體類、35 對象屬性、24 種核心關係，OWL 2 DL 公理"),
    ("sanjue.html",    "三絕",            "Three Paragons", "毛宗崗標舉：智絕諸葛、義絕關羽、奸絕曹操"),
    ("taoyuan.html",   "桃園",            "Peach Garden",   "桃園結義——中國人「義」的原點"),
    ("persons.html",   "人物譜",          "Persons",        "主要人物卡片：字號/陣營/兵器/熱度"),
    ("heroes.html",    "英雄譜",          "Heroes List",    f"全 {n_person} 位人物檢索表，按提及排序"),
    ("genealogy.html", "將相譜",          "Genealogy",      "三國君臣將相隸屬體系，主從、姻親、仇敵"),
    ("factions.html",  "勢力志",          "Factions",       "東漢朝廷、曹魏、蜀漢、東吳、群雄並起的政治圖景"),
    ("battles.html",   "戰役錄",          "Battles",        f"{n_battle} 場會戰奇襲，火攻水戰、經緯戰場"),
    ("timeline.html",  "百年興亡",        "Century",        "從 184 黃巾起義到 280 三國歸晉，五階段百年時間軸"),
    ("map.html",       "三國輿圖",        "Map",            "三國形勢略圖：魏/蜀/吳疆域與郡城"),
    ("places.html",    "地名錄",          "Places",         f"{n_place} 處關隘州郡，按類型分組"),
    ("stratagems.html","計謀譜",          "Stratagems",     f"{n_strat} 條奇策，三十六計在三國的實戰演繹"),
    ("artifacts.html", "兵器名馬",        "Artifacts",      f"{n_art} 件器物：青龍刀、赤兔馬、木牛流馬"),
    ("prophecies.html","讖緯童謠",        "Prophecies",     f"{n_proph} 則童謠、預言、星象讖語，敘事伏筆"),
    ("foreshadow.html","草蛇灰線",        "Foreshadowing",  "桃園誓言應驗、三馬同槽、臥龍鳳雛——千里伏線"),
    ("poems.html",     "詩詞讚語",        "Verse",          "開篇臨江仙、短歌行、隆中對、出師表"),
    ("versions.html",  "版本譜",          "Editions",       "演義系 / 志傳系 / 評點本 / 現代本源流 SVG 族譜"),
    ("variants.html",  "異文對勘",        "Variants",       "關鍵異文對照：「寧我負人」等文字演變"),
    ("scholars.html",  "批者群像",        "Commentators",   "李卓吾/金聖歎/毛宗崗/胡適/魯迅/沈伯俊/易中天"),
    ("academy.html",   "論著",            "Scholarship",    "版本學考證、文史互證、現代三國研究代表作"),
    ("adaptations.html","影視戲曲遊戲",   "Adaptations",    "央視三國/赤壁/真三國無雙/三國志/連環畫/京劇"),
    ("graph.html",     "圖譜",            "Graph",          "力導向知識圖譜：人物/勢力/器物三張子圖"),
    ("mirror.html",    "字鏡",            "Mirror",         "全書字頻雲，三國的字是刀、馬、兵、將"),
    ("query.html",     "本體查詢",        "Query",          "DuckDB-WASM 瀏覽器內 SQL，無服務器、無數據外發"),
]

def nav(active=""):
    items = [
        ("index.html","總覽"),
        ("read.html","正文"),
        ("ontology.html","本體"),
        ("sanjue.html","三絕"),
        ("taoyuan.html","桃園"),
        ("persons.html","人物譜"),
        ("heroes.html","英雄譜"),
        ("genealogy.html","將相譜"),
        ("factions.html","勢力志"),
        ("battles.html","戰役錄"),
        ("timeline.html","百年興亡"),
        ("map.html","三國輿圖"),
        ("places.html","地名錄"),
        ("stratagems.html","計謀譜"),
        ("artifacts.html","兵器名馬"),
        ("prophecies.html","讖緯童謠"),
        ("foreshadow.html","草蛇灰線"),
        ("poems.html","詩詞讚語"),
        ("versions.html","版本譜"),
        ("variants.html","異文對勘"),
        ("scholars.html","批者群像"),
        ("academy.html","論著"),
        ("adaptations.html","影視戲曲"),
        ("graph.html","圖譜"),
        ("mirror.html","字鏡"),
        ("query.html","查詢台"),
    ]
    return '<nav>' + ''.join(
        f'<a href="{h}"{" class=active" if h==active else ""}>{t}</a>' for h,t in items
    ) + '</nav>'

def header(title, subtitle="", active=""):
    return f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 三國演義本體論</title>
<link rel="stylesheet" href="assets/app.css"></head><body>
<header>
  <div class="seal l">三<br>國<br>志</div>
  <div class="seal">演<br>義</div>
  <h1>三國演義<span class="dot">·</span>本體論</h1>
  <div class="subtitle">Romance of the Three Kingdoms · Ontology Project{(" · "+subtitle) if subtitle else ""}</div>
</header>
{nav(active)}
<main>
'''

def footer():
    return '''
</main>
<footer>
  《三國演義》本體論工程 · 參考 yejinlei 紅樓未完與西遊記本體論範式 · OWL 2 DL + DuckDB-WASM · 無服務器靜態站
  <span class="stamp">千秋</span><span class="stamp">青史</span>
</footer>
<script src="assets/common.js"></script>
</body></html>'''

def write_page(name, title, body, subtitle="", active=""):
    p = DOCS / name
    p.write_text(header(title, subtitle, active) + body + footer(), encoding="utf-8")
    print(f"  → {name}")

# ---- 通用 JS（圖譜拖拽/檢索）----
common_js = """
window.addEventListener('DOMContentLoaded',()=>{
  // 箋紙卡片點擊效果
  document.querySelectorAll('.card,.portal').forEach(el=>{
    el.addEventListener('click',e=>{
      const link=el.querySelector('a');
      if(link && !e.target.closest('a')){ /* noop */ }
    });
  });
});
"""
(DOCS/"assets"/"common.js").write_text(common_js, encoding="utf-8")

# ---- 1. 首頁 ----
def page_index():
    portals = ''.join(
        f'''<a class="portal" href="{h}">
          <div class="en">{en}</div>
          <h4>{t}</h4>
          <div class="desc">{d}</div>
          <div class="enter">進入 →</div>
        </a>'''
        for h,t,en,d in PORTALS
    )
    body = f'''
<div class="hero">
  <div class="poem">
    滾滾長江東逝水，浪花淘盡英雄。<br>
    是非成敗轉頭空。青山依舊在，幾度夕陽紅。<br>
    白髮漁樵江渚上，慣看秋月春風。<br>
    一壺濁酒喜相逢。<br>古今多少事，都付笑談中。
    <small>—— 明·楊慎《臨江仙》（毛宗崗冠於卷首）</small>
  </div>
  <div class="intro">以羅貫中《三國演義》為核心文本，採用 OWL 2 DL 本體論建模，兼容水滸本體棧，<br>瀏覽器端 DuckDB-WASM 查詢，無服務器靜態部署。</div>
</div>

<h2>規模</h2>
<div class="stat-grid">
  <div class="stat"><div class="num">{len(chapters)}</div><div class="lbl">回次</div></div>
  <div class="stat"><div class="num jade">{n_char//10000}萬</div><div class="lbl">字數</div></div>
  <div class="stat"><div class="num cinnabar">{n_person}</div><div class="lbl">人物</div></div>
  <div class="stat"><div class="num bronze">{n_faction}</div><div class="lbl">勢力</div></div>
  <div class="stat"><div class="num steel">{n_battle}</div><div class="lbl">戰役</div></div>
  <div class="stat"><div class="num jade">{n_place}</div><div class="lbl">地點</div></div>
  <div class="stat"><div class="num">{n_event}</div><div class="lbl">事件</div></div>
  <div class="stat"><div class="num cinnabar">{n_edition}</div><div class="lbl">版本</div></div>
  <div class="stat"><div class="num bronze">{n_strat}</div><div class="lbl">計謀</div></div>
  <div class="stat"><div class="num indigo">{n_proph}</div><div class="lbl">讖語</div></div>
  <div class="stat"><div class="num gold">{n_art}</div><div class="lbl">器物</div></div>
  <div class="stat"><div class="num steel">10</div><div class="lbl">本體類</div></div>
</div>

<p class="lead">本工程以《紅樓未完》視覺與本體論方法為範式，將《三國演義》重構為可計算的知識本體：10 大頂級類（文學作品/人物/政治勢力/戰役/地理/事件/學者/成果/衍生/器物）、24 種核心關係（6 種三國專屬、18 種與水滸本體通用）、16 種版本元數據、8 組關鍵異文，並以 DuckDB-WASM 在瀏覽器端提供 SQL 查詢，無服務器、無數據外發。</p>

<h2>入口</h2>
<div class="portal-grid">{portals}</div>

<div class="colophon">
  本體工程參考 yejinlei 西遊記本體論規範與《紅樓未完》視覺風格<br>
  滾滾長江東逝水 · 浪花淘盡英雄
  <span class="stamp">大塊</span><span class="stamp">文章</span>
</div>
'''
    write_page("index.html", "總覽", body, "", "index.html")

# ---- 2. 本體論頁 ----
def page_ontology():
    shutil.copy(ONTO/"sanguo_kg_ontology.ttl", DOCS/"ontology"/"sanguo_kg_ontology.ttl")
    shutil.copy(ONTO/"vocabularies.yaml", DOCS/"ontology"/"vocabularies.yaml")
    body = '''
<h2>本體論規範 · TBox 完備定義</h2>
<p class="lead">本體採用 OWL 2 DL 描述邏輯規範，10 大頂級實體類，所有子類均繼承自對應頂級類；與水滸本體共享統一 ID 命名規則（<code>sg_xxx_yyy</code>），實現跨本體無縫聯動；可直接導入 Neo4j 與 DuckDB，無需二次重構。</p>

<div class="btn-row">
  <a class="badge zhu" href="ontology/sanguo_kg_ontology.ttl">⬇ 下載 TTL 本體文件</a>
  <a class="badge mo" href="ontology/vocabularies.yaml">⬇ 下載受控詞表 YAML</a>
</div>

<h3>頂層元模型（TBox）10 大頂級類</h3>
<table>
<tr><th>頂級類</th><th>核心子類</th><th>全局主鍵</th><th>頂層通用屬性</th></tr>
<tr><td><b>文學作品類</b><br><span class="mo">sg:LiteraryWork</span></td>
  <td>古本系統、評點改造本、現代整理本、續書衍生本</td>
  <td><code>version_id</code></td>
  <td>版本名、刊刻年代、刊刻機構、存世狀態、底本來源、回目總數、文本異文特徵、族系、是否有全文</td></tr>
<tr><td><b>人物類</b><br><span class="mo">sg:Person</span></td>
  <td>核心文臣、武將、皇族、民間角色、少數民族、女性、虛構人物</td>
  <td><code>person_id</code></td>
  <td>姓名、字、號、綽號、別名、登場/死亡回目、所屬陣營、官職變遷、武器、結局、正史/虛構標註、生卒年、提及數</td></tr>
<tr><td><b>政治勢力類</b><br><span class="mo">sg:Faction</span></td>
  <td>東漢朝廷、曹魏、蜀漢、東吳、割據諸侯、少數民族政權</td>
  <td><code>force_id</code></td>
  <td>勢力名、建立者、建立/滅亡年、都城、核心文臣武將、疆域、年號序列</td></tr>
<tr><td><b>戰爭戰役類</b><br><span class="mo">sg:Battle</span></td>
  <td>大型會戰、局部戰役、伏擊戰、水戰、奇襲戰、圍城戰</td>
  <td><code>battle_id</code></td>
  <td>戰役名、發生回目、公元紀年、交戰雙方、關鍵戰術、勝負、歷史影響、兵力</td></tr>
<tr><td><b>空間地理類</b><br><span class="mo">sg:Place</span></td>
  <td>古地名、當代遺址、戰略關隘、都城、戰場、山嶽、江河</td>
  <td><code>location_id</code></td>
  <td>古地名、今地名、所屬州郡、經緯度、戰略地位、關聯戰役、當代遺存狀態</td></tr>
<tr><td><b>事件類</b><br><span class="mo">sg:Event</span></td>
  <td>個人事件、政治事件、外交事件、典故事件</td>
  <td><code>event_id</code></td>
  <td>事件名、發生回目、公元紀年、參與人物、地點、情節權重、正史/虛構標註</td></tr>
<tr><td><b>學術主體類</b><br><span class="mo">sg:Scholar</span></td>
  <td>古代評點家、近現代三國學者、當代研究機構</td>
  <td><code>scholar_id</code></td>
  <td>姓名、生卒年、所屬流派、研究方向、代表論著</td></tr>
<tr><td><b>學術成果類</b><br><span class="mo">sg:AcademicWork</span></td>
  <td>古代評點本、現代研究論著、學術論文、校理校本</td>
  <td><code>paper_id</code></td>
  <td>標題、發表年、核心觀點、引用文獻、研究方向、底本選擇說明</td></tr>
<tr><td><b>衍生作品類</b><br><span class="mo">sg:Adaptation</span></td>
  <td>影視改編、戲曲、動漫、遊戲、同人</td>
  <td><code>adapt_id</code></td>
  <td>作品名、改編類型、上映年、改編特徵、主創、豆瓣評分</td></tr>
<tr><td><b>器物類</b><br><span class="mo">sg:Artifact</span></td>
  <td>兵器、名馬、陣法、發明創造、印綬符節</td>
  <td><code>artifact_id</code></td>
  <td>器物名、持有者、登場回目、功能、典故</td></tr>
</table>

<h3>24 種核心有向關係</h3>
<p class="piqian">其中 <span class="zhu">6 種為三國專屬</span>（主臣、所屬、指揮、參戰、結盟/敵對（勢力）、發生於（戰役-地點）、評點改造、持有、使用），<span class="mo">18 種與水滸本體通用</span>，全部附加方向與權重屬性。</p>
<table>
<tr><th>分類</th><th>關係</th><th>定義域 → 值域</th><th>附加屬性</th><th>特徵</th></tr>
<tr><td rowspan="4">人-人通用</td><td>結拜為兄弟</td><td>人物→人物</td><td>結義回目、排序權重</td><td>對稱</td></tr>
<tr><td>敵對</td><td>人物→人物</td><td>首次衝突回目、衝突強度</td><td>對稱</td></tr>
<tr><td>師徒</td><td>人物→人物</td><td>授藝內容、登場回目</td><td>互逆</td></tr>
<tr><td>親屬</td><td>人物→人物</td><td>親屬類型、輩分</td><td>對稱</td></tr>
<tr><td>人-人專屬</td><td>主臣 <span class="zhu">★</span></td><td>人物→人物</td><td>從屬時間、信任等級、官職</td><td>互逆</td></tr>
<tr><td>人-勢力專屬</td><td>所屬 <span class="zhu">★</span></td><td>人物→勢力</td><td>入職時間、官職變遷</td><td>—</td></tr>
<tr><td rowspan="2">人-戰役專屬</td><td>指揮 <span class="zhu">★</span></td><td>人物→戰役</td><td>角色、戰術貢獻</td><td>—</td></tr>
<tr><td>參戰 <span class="zhu">★</span></td><td>人物→戰役</td><td>身份、結局</td><td>—</td></tr>
<tr><td rowspan="2">勢力-勢力專屬</td><td>結盟 <span class="zhu">★</span></td><td>勢力→勢力</td><td>起止時間、盟約</td><td>對稱</td></tr>
<tr><td>敵對 <span class="zhu">★</span></td><td>勢力→勢力</td><td>戰爭起止</td><td>對稱</td></tr>
<tr><td>戰役-地點專屬</td><td>發生於 <span class="zhu">★</span></td><td>戰役→地點</td><td>戰場範圍、坐標</td><td>—</td></tr>
<tr><td>版本-版本通用</td><td>演化自</td><td>版本→版本</td><td>時間差、承襲度</td><td>傳遞</td></tr>
<tr><td>版本-版本專屬</td><td>評點改造 <span class="zhu">★</span></td><td>版本→學者</td><td>改造幅度、情節改動</td><td>—</td></tr>
<tr><td>版本-人物通用</td><td>登場於</td><td>人物→版本</td><td>結局差異、異文</td><td>—</td></tr>
<tr><td>版本-事件通用</td><td>收錄於</td><td>事件→版本</td><td>情節刪改、文字異文</td><td>—</td></tr>
<tr><td>學者-成果通用</td><td>創作</td><td>學者→成果</td><td>發表時間、觀點摘要</td><td>—</td></tr>
<tr><td>學者-學者通用</td><td>學術論戰</td><td>學者→學者</td><td>主題、時間</td><td>對稱</td></tr>
<tr><td>版本-學者通用</td><td>研究</td><td>學者→版本</td><td>成果、考證結論</td><td>—</td></tr>
<tr><td>事件-地點通用</td><td>發生於</td><td>事件→地點</td><td>時間、坐標</td><td>—</td></tr>
<tr><td>衍生-版本通用</td><td>改編自</td><td>衍生→版本</td><td>幅度、情節改動</td><td>—</td></tr>
<tr><td>人-器物專屬</td><td>持有 <span class="zhu">★</span></td><td>人物→器物</td><td>時間、回目</td><td>—</td></tr>
<tr><td>戰役-器物專屬</td><td>使用 <span class="zhu">★</span></td><td>戰役→器物</td><td>場景、戰術效果</td><td>—</td></tr>
<tr><td>人-事件通用</td><td>參與</td><td>人物→事件</td><td>角色、權重</td><td>—</td></tr>
<tr><td>人-地點通用</td><td>活動於</td><td>人物→地點</td><td>停留回目、事件關聯</td><td>—</td></tr>
</table>

<h3>OWL 公理</h3>
<div class="scroll-note">
<ul style="list-style:none;padding-left:0;text-indent:0">
  <li>• 10 大頂級類互相不相交（<code>owl:AllDisjointClasses</code>），推理機可識別跨類衝突；</li>
  <li>• 所有主鍵（xxx_id）同時為 <code>owl:FunctionalProperty</code> + <code>owl:InverseFunctionalProperty</code>，保證唯一性；</li>
  <li>• <code>derivedFrom</code> 為 <code>owl:TransitiveProperty</code>（版本演化鏈可推理）；</li>
  <li>• <code>swornBrotherOf / enemyOf_* / alliedWith / kinOf / debatesWith</code> 為 <code>owl:SymmetricProperty</code>；</li>
  <li>• <code>masterOf / lordOf</code> 顯式定義 <code>owl:inverseOf</code>；</li>
  <li>• 枚舉受控詞表：核實狀態（4）、異文類型（7）、關係權重（3）、版本族系（4）、五大歷史階段。</li>
</ul>
</div>

<h3>跨本體聯動</h3>
<p class="lead">ID 命名規則 <code>sg_person_xxx</code> 與水滸本體 <code>sh_person_xxx</code> 同構，在 DuckDB/Neo4j 中可直接以 <code>person_id</code> JOIN 實現跨四大名著本體的人物/地名/器物/關係聯查，無需二次重構。</p>

<div class="piqian">本頁呈現的即為完備 TBox 規範；ABox 實例數據（人物、戰役、地點等）由構建腳本從原文抽取並寫入 Parquet/JSON，可在「本體查詢」頁用 SQL 直接查詢。</div>
'''
    write_page("ontology.html", "本體論", body, "OWL 2 DL · 10 類 · 24 關係")

# ---- 3. 正文頁 ----
def page_read():
    opts = ''.join(f'<option value="{c["no"]}">第{c["no"]}回 {c.get("title","")}</option>' for c in sorted(chapters, key=lambda x:x['no']))
    body = f'''
<h2>正文 · 毛宗崗評本百二十回</h2>
<p class="lead">在線全文取毛宗崗評本系統（Project Gutenberg #23950 繁體排印本，經繁轉簡、回目切分後入庫，共 {n_char:,} 字 / 120 回）。章節切換見下方下拉，朱批位置以<span class="zhu">硃色虛線</span>標註。</p>

<div class="search-box">
  <select id="ch-sel" onchange="loadChapter(this.value)" style="flex:1;padding:8px 12px;border:1px solid var(--line);background:var(--paper2);font-family:var(--kai);font-size:15px">{opts}</select>
</div>

<div class="reader" id="reader">
  <div class="ch-num">第 1 回</div>
  <div class="ch-title"></div>
  <div id="ch-body">加載中……</div>
</div>

<script>
let CHAPTERS = null;
fetch("data/read.json").then(r=>r.json()).then(d=>{{ CHAPTERS=d; loadChapter(1); }});
function loadChapter(n){{
  n = parseInt(n); if(!CHAPTERS) return;
  const c = CHAPTERS.find(x=>x.no===n);
  if(!c) return;
  document.querySelector('#reader .ch-num').textContent = '第 '+n+' 回';
  document.querySelector('#reader .ch-title').textContent = c.title || '';
  document.getElementById('ch-body').innerHTML = (c.paragraphs||[]).map((p,i)=>'<p data-p="'+i+'">'+p+'</p>').join('');
  document.getElementById('ch-sel').value = n;
  window.scrollTo({{top:document.querySelector('.reader').offsetTop-20, behavior:'smooth'}});
}}
</script>

<div class="piqian">全書毛本系統。異文比對與版本源流見「版本譜」「異文對勘」；要對讀其他版本請至「本體查詢」頁使用 SQL 直接檢索 Parquet。</div>
'''
    write_page("read.html", "正文", body, "毛宗崗評本 · 百二十回")

# ---- 4. 人物譜 ----
def page_persons():
    def force_color(f):
        f = (f or "")
        if "魏" in f or "曹" in f: return "indigo"
        if "蜀" in f or "漢" in f or "汉" in f: return ""
        if "吳" in f or "吴" in f or "孫" in f or "孙" in f: return "jade"
        if "東漢" in f or "东汉" in f: return "bronze"
        return "steel"
    cards = []
    for p in sorted(persons, key=lambda x:-(x.get('total',0) or 0)):
        f = p.get('faction','')
        fc = force_color(f)
        cat = p.get('category','')
        tags = []
        if p.get('zi'): tags.append(f'<span class="tag">字{p["zi"]}</span>')
        alias_li = [a for a in (p.get('alias') or '').split('/') if a and a!=p.get('name')]
        if alias_li: tags.append(f'<span class="tag cinnabar">{alias_li[0]}</span>')
        if cat: tags.append(f'<span class="tag jade">{cat}</span>')
        if f: tags.append(f'<span class="tag bronze">{f}</span>')
        meta = f"登場第 {p.get('first','?')} 回 · 提及 {p.get('total',0):,}"
        cards.append(f'''<div class="card {fc}">
          <h4>{p.get('name','')}</h4>
          <div class="meta">{meta}</div>
          <div class="desc">{"".join(tags)}</div>
        </div>''')
    body = f'''
<h2>人物譜 · {n_person} 位</h2>
<p class="lead">人物按全書提及次數排序。<span class="zhu">硃紅卡片</span>為蜀漢核心，<span class="mo" style="color:var(--indigo-d)">鐵青</span>為曹魏，<span class="mo" style="color:var(--jade-d)">竹青</span>為東吳，<span class="mo">青銅</span>為東漢，<span class="mo">鋼灰</span>為割據諸侯。字、號、綽號、陣營、角色類別見卡片標籤。</p>
<div class="search-box"><input id="ps" placeholder="輸入姓名/字/號/綽號檢索……" oninput="filterPs(this.value)"></div>
<div class="grid" id="ps-grid">{"".join(cards)}</div>
<script>
function filterPs(q){{
  q=q.trim(); const cards=document.querySelectorAll('#ps-grid .card');
  cards.forEach(c=>{{c.style.display=(!q||c.textContent.includes(q))?'':'none'}});
}}
</script>
'''
    write_page("persons.html", "人物譜", body, f"{n_person} 位人物")

# ---- 5. 勢力志 ----
def page_factions():
    type_color = {"三足鼎立":"","早期群雄":"steel","東漢朝廷":"bronze","少數民族":"gold"}
    cards=[]
    for f in factions:
        fc = type_color.get(f.get('type',''),"bronze")
        top = f.get('top',[])[:10]
        cards.append(f'''<div class="card {fc}">
          <h4>{f.get('full',f.get('name',''))}</h4>
          <div class="meta">{f.get('type','')} · 都城：{f.get('capital','—')} · 核心人物 {f.get('members',0)} 人 · 累計提及 {f.get('total',0):,}</div>
          <div class="desc">{"".join(f'<span class="tag">{n} {t}</span>' for n,t in top)}</div>
        </div>''')
    body = f'''
<h2>勢力志 · {n_faction} 方</h2>
<p class="lead">從東漢朝廷到三國鼎立再到三分歸晉，政治勢力的消長是《三國演義》主線。卡片展示各勢力都城、類型、核心人物及全書提及總數。</p>
<div class="grid">{"".join(cards)}</div>
'''
    write_page("factions.html", "勢力志", body)

# ---- 6. 將相譜 ----
def page_genealogy():
    pm = {p.get('name'):p for p in persons}
    alias_to = {}
    for p in persons:
        for a in (p.get('alias') or '').split('/'):
            if a: alias_to[a]=p.get('name')
    def find_p(name):
        if name in pm: return pm[name]
        if name in alias_to: return pm[alias_to[name]]
        return None
    clans=[]
    for f in factions:
        force_name = f.get('name','')
        lord = f.get('lord','')
        lp = find_p(lord)
        # top 12 成員 (去除 lord)
        members = [n for n,_ in f.get('top',[]) if n!=lord]
        clans.append(f'''<h3>{f.get('full',force_name)} · 主：{lord}</h3>
          <div class="clan-row">
            <div class="clan king">{lord}<span class="gen">君</span></div>
            {"".join(f'<div class="clan">{m}<span class="gen">{"武" if (find_p(m) or {{}}).get("category")=="武將" else "文"}</span></div>' for m in members[:12])}
          </div>''')
    body = f'''
<h2>將相譜 · 君臣隸屬</h2>
<p class="lead">以勢力為綱、君主為軸，列出各陣營核心成員（按全書提及數取前 12 位）；標籤「文」「武」區分文臣武將。與「人物譜」互為表裡，此處按隸屬結構呈現，彼處按熱度排序。</p>
{''.join(clans)}
'''
    write_page("genealogy.html", "將相譜", body, "君臣隸屬譜系")

# ---- 7. 戰役錄 ----
def page_battles():
    cards=[]
    for b in sorted(battles, key=lambda x:int(x.get('year') or 0)):
        sa = b.get('side_a','') or ''
        win_color = "jade" if ("勝" in (b.get('outcome','') or '') and ("蜀" in sa or "劉備" in sa or "諸葛" in sa)) else ("indigo" if ("魏" in sa or "曹" in sa) else "bronze")
        cards.append('<div class="card ' + win_color + '">'
          '<h4>'+b['name']+'</h4>'
          '<div class="meta">'+str(b.get('year',''))+'年 · 第 '+str(b.get('chapter',''))+' 回</div>'
          '<div class="desc"><div><b>'+b.get('side_a','')+'</b> <span class="zhu">VS</span> <b>'+b.get('side_b','')+'</b></div>'
          '<div class="mo">結果：'+b.get('outcome','')+'</div></div></div>')
    body = '<h2>戰役錄 · '+str(len(battles))+' 場</h2>' \
      '<p class="lead">從黃巾起義到三國歸晉，每場戰役均標註公元紀年、交戰雙方、發生回次。竹青為蜀勝，鐵青為魏勝，青銅為其他結果。</p>' \
      '<div class="grid">'+''.join(cards)+'</div>'
    write_page("battles.html", "戰役錄", body)

# ---- 8. 輿地圖 ----
def page_places():
    groups = {}
    for p in sorted(places, key=lambda x:-x.get('total',0)):
        t = p.get('type','其他')
        groups.setdefault(t, []).append(p)
    blocks=[]
    for t, lst in groups.items():
        blocks.append('<h3>'+t+'（'+str(len(lst))+'）</h3><div class="grid">')
        for p in lst:
            first_ch = p["spark"][0][0] if p.get("spark") else "?"
            blocks.append('<div class="card"><h4>'+p['name']+'</h4>'
              '<div class="meta">提及 '+format(p.get('total',0),',')+' 次</div>'
              '<div class="desc"><span class="tag">'+t+'</span>'
              '<span class="tag jade">首見第 '+str(first_ch)+' 回</span></div></div>')
        blocks.append('</div>')
    body = '<h2>輿地圖 · '+str(len(places))+' 處</h2>' \
      '<p class="lead">按地名類型分組，每處地點標註全書提及總次數與首次出現回次。要在大地圖上查看，請見「三國輿圖」。</p>' \
      +''.join(blocks)
    write_page("places.html", "輿地圖", body)

# ---- 9. 百年興亡 ----
def page_timeline():
    phases = [
        ("184","189","黃巾之亂","jade","蒼天已死，黃天當立；歲在甲子，天下大吉。張角三兄弟起義，劉關張桃園結義，三國大幕拉開。"),
        ("189","192","董卓之亂","","董卓入京專權，廢少帝立獻帝；十八路諸侯討董；王允連環計誅董，天下崩裂。"),
        ("192","208","群雄逐鹿","bronze","官渡之戰（200）曹操一統北方；劉備三顧茅廬得諸葛亮；江東孫氏割據。"),
        ("208","263","三國鼎立","indigo","赤壁之戰（208）三分天下定鼎；襄樊/夷陵/六出祁山；姜維九伐中原；蜀亡（263）。"),
        ("263","280","三分歸晉","steel","司馬氏代魏（265），西晉建；杜預王濬滅吳（280），三家歸晉，天下一統。"),
    ]
    events_sorted = sorted(events, key=lambda x:x.get('chapter',0))
    evs=''.join('<div class="tl-item">'
      '<div class="tl-year">第 '+str(e.get('chapter',''))+' 回 · '+e.get('type','')+'</div>'
      '<div class="tl-title">'+e.get('name','')+'</div>'
      '<div class="tl-desc">'+e.get('desc','')+' <span class="mo">（地：'+e.get('place','—')+'）</span></div></div>' for e in events_sorted)
    phase_cards=''.join('<div class="card '+c+'"><h4>'+name+'</h4><div class="meta">'+start+' – '+end+'</div><div class="desc">'+desc+'</div></div>' for start,end,name,c,desc in phases)
    body = '<h2>百年興亡 · 184 → 280</h2>' \
      '<p class="lead">從黃巾起義到三國歸晉，近百年大歷史分為五個階段。下方時間軸標註 '+str(len(events))+' 個關鍵事件。</p>' \
      '<div class="grid">'+phase_cards+'</div><h3>事件時間軸</h3><div class="timeline">'+evs+'</div>'
    write_page("timeline.html", "百年興亡", body, "184-280 五大階段")

# ---- 10. 計謀譜 ----
def page_stratagems():
    cards=''.join('<div class="card ' + ('jade' if s.get('type')=='敗戰計' else ('bronze' if s.get('type')=='勝戰計' else '')) + '">'
      '<h4>'+s['name']+'</h4>'
      '<div class="meta">'+str(s.get('type',''))+' · '+str(s.get('user',''))+'用 · 第 '+str(s.get('chapter',''))+' 回</div>'
      '<div class="desc">'+str(s.get('desc',''))+'</div></div>' for s in stratagems)
    body = '<h2>計謀譜 · '+str(len(stratagems))+' 條奇策</h2>' \
      '<p class="lead">三十六計在三國的實戰演繹。連環計、苦肉計、空城計、火攻、借東風。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("stratagems.html", "計謀譜", body)

# ---- 11. 兵器名馬 ----
def page_artifacts():
    cards=''.join('<div class="card ' + ('gold' if a.get('type')=='名馬' else ('steel' if a.get('type')=='兵器' else 'jade')) + '">'
      '<h4>'+a['name']+'</h4>'
      '<div class="meta">'+str(a.get('type',''))+' · 持有者：'+str(a.get('owner','—'))+' · 提及 '+str(a.get('total',0))+'</div></div>'
      for a in sorted(artifacts, key=lambda x:-x.get('total',0)))
    body = '<h2>兵器名馬 · '+str(len(artifacts))+' 件</h2>' \
      '<p class="lead">名馬（赤兔/的盧）、兵器（青龍偃月刀/丈八蛇矛/方天畫戟）、發明（木牛流馬/連弩）、印綬——器物是人物命運的延伸。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("artifacts.html", "兵器名馬", body)

# ---- 12. 讖緯童謠 ----
def page_prophecies():
    cards=''.join('<div class="card indigo">'
      '<h4>'+str(p.get('kind','讖語'))+'</h4>'
      '<div class="meta">第 '+str(p.get('chapter',''))+' 回 · 應驗於：'+str(p.get('target','—'))+'</div>'
      '<div class="desc"><span class="zhu">'+str(p.get('text',''))+'</span><br><span class="mo">'+str(p.get('note',''))+'</span></div></div>'
      for p in prophecies)
    body = '<h2>讖緯童謠 · '+str(len(prophecies))+' 則</h2>' \
      '<p class="lead">童謠、讖語、星象、夢兆——「千里草」預董卓之亡，「卧龍鳳雛」定三顧之緣。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("prophecies.html", "讖緯童謠", body)

# ---- 13. 版本譜 ----
def page_versions():
    fam = editions.get('family_meta',{})
    eds = editions.get('editions',[])
    family_cards=''.join('<div class="card ' + ('jade' if k=='yanyi' else 'bronze') + '">'
      '<h4>'+v.get('name','')+'</h4>'
      '<div class="meta">祖本：'+v.get('stem','—')+'</div>'
      '<div class="desc">'+v.get('feature','')+'</div></div>' for k,v in fam.items())
    fc_map = {"yanyi":"","zhizhuan":"bronze"}
    ed_cards=''.join('<div class="card '+fc_map.get(e.get('family',''),'indigo')+'">'
      '<h4>'+e.get('short', e.get('name',''))+'</h4>'
      '<div class="meta">'+str(e.get('year',''))+'年 · '+('演義系' if e.get('family')=='yanyi' else ('志傳系' if e.get('family')=='zhizhuan' else '其他'))+' · '+str(e.get('survival',''))+' · '+('★全文' if e.get('has_fulltext') else '元數據')+'</div>'
      '<div class="desc">'+str(e.get('feature',''))[:140]+'……<br><span class="mo">'+str(e.get('editor',''))+'</span></div></div>' for e in eds)
    svg = '<svg viewBox="0 0 1000 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:Kaiti SC,serif;font-size:13">' \
      '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#8b6f3e"/></marker></defs>' \
      '<line x1="500" y1="30" x2="500" y2="80" stroke="#8b6f3e" stroke-width="1.5" marker-end="url(#arr)"/>' \
      '<rect x="430" y="10" width="140" height="30" fill="#f6ecd4" stroke="#9e2a20" stroke-width="2"/><text x="500" y="30" text-anchor="middle" fill="#9e2a20">羅貫中 原始稿</text>' \
      '<line x1="500" y1="80" x2="280" y2="140" stroke="#8b6f3e"/><line x1="500" y1="80" x2="720" y2="140" stroke="#8b6f3e"/>' \
      '<rect x="200" y="140" width="160" height="28" fill="#f6ecd4" stroke="#9e2a20"/><text x="280" y="159" text-anchor="middle" fill="#9e2a20">演義系（240則單題）</text>' \
      '<rect x="640" y="140" width="160" height="28" fill="#f6ecd4" stroke="#8b6f3e"/><text x="720" y="159" text-anchor="middle" fill="#655028">志傳系（花關索/靜軒詩）</text>' \
      '<line x1="280" y1="168" x2="100" y2="220" stroke="#8b6f3e"/><line x1="280" y1="168" x2="260" y2="220" stroke="#8b6f3e"/>' \
      '<line x1="280" y1="168" x2="420" y2="220" stroke="#8b6f3e"/><line x1="720" y1="168" x2="600" y2="220" stroke="#8b6f3e"/>' \
      '<line x1="720" y1="168" x2="730" y2="220" stroke="#8b6f3e"/><line x1="720" y1="168" x2="870" y2="220" stroke="#8b6f3e"/>' \
      '<rect x="30" y="220" width="130" height="26" fill="#faf3e4" stroke="#9e2a20"/><text x="95" y="238" text-anchor="middle">嘉靖壬午本 1522</text>' \
      '<rect x="180" y="220" width="140" height="26" fill="#faf3e4" stroke="#9e2a20"/><text x="250" y="238" text-anchor="middle">周曰校本 1591</text>' \
      '<rect x="340" y="220" width="140" height="26" fill="#faf3e4" stroke="#9e2a20"/><text x="410" y="238" text-anchor="middle">李卓吾評本 1620</text>' \
      '<rect x="530" y="220" width="140" height="26" fill="#faf3e4" stroke="#8b6f3e"/><text x="600" y="238" text-anchor="middle">葉逢春本 1592</text>' \
      '<rect x="670" y="220" width="130" height="26" fill="#faf3e4" stroke="#8b6f3e"/><text x="735" y="238" text-anchor="middle">余象斗本 1594</text>' \
      '<rect x="810" y="220" width="140" height="26" fill="#faf3e4" stroke="#8b6f3e"/><text x="880" y="238" text-anchor="middle">黃正甫本 1625</text>' \
      '<line x1="410" y1="246" x2="410" y2="280" stroke="#9e2a20" stroke-width="2" marker-end="url(#arr)"/>' \
      '<rect x="320" y="280" width="180" height="30" fill="#9e2a20" stroke="#7a1e16"/><text x="410" y="300" text-anchor="middle" fill="#f7edd4">毛宗崗評本 1679（通行本）★</text>' \
      '</svg>'
    body = '<h2>版本譜 · '+str(len(eds))+' 種</h2>' \
      '<p class="lead">三國版本分為「演義系」與「志傳系」兩大支，至清初毛宗崗評本定鼎為通行本。本頁呈現版本族源流與各本存世狀況。</p>' \
      '<h3>兩大版本族</h3><div class="grid">'+family_cards+'</div>' \
      '<h3>版本源流</h3><div class="lineage">'+svg+'</div>' \
      '<h3>版本一覽</h3><div class="grid">'+ed_cards+'</div>' \
      '<div class="piqian">★ 標記為本站已收錄全文版本（毛宗崗本）；其餘版本目前為元數據級收錄，待取得 TXT 後可自動入庫跨版本異文對照。</div>'
    write_page("versions.html", "版本譜", body)

# ---- 14. 異文對勘 ----
def page_variants():
    vr = editions.get('variant_readings',[])
    cards=''
    for v in vr:
        rows=''.join('<tr><td>'+x.get('edition','')+'</td><td class="diff">'+x.get('text','')+'</td><td>'+x.get('note','')+'</td></tr>' for x in v.get('variants',[]))
        cards += '<div class="card"><h4>'+v.get('topic','')+'</h4>' \
          '<div class="meta">'+v.get('narrative_point','')+'</div>' \
          '<div class="desc"><table><tr><th>版本</th><th>文字</th><th>校記</th></tr>'+rows+'</table>' \
          '<p class="quote"><b>文獻學意義：</b>'+v.get('significance','')+'</p></div></div>'
    body = '<h2>異文對勘 · '+str(len(vr))+' 組</h2>' \
      '<p class="lead">選取學界公認的關鍵異文，逐版本對照並給出文獻學解讀。</p>' \
      '<div>'+cards+'</div>'
    write_page("variants.html", "異文對勘", body)

# ---- 15. 批者群像 ----
def page_scholars():
    scholars = [
        ("李贄（李卓吾）","1527-1602","明代思想家、文學評點家","明末『李卓吾先生批評三國志』開三國評點之風，貶曹操為奸雄之定評始於此。","bronze"),
        ("鍾惺（鍾伯敬）","1574-1624","竟陵派代表","鍾伯敬評本強調「奇」「快」，對武人描寫多有發揮。","jade"),
        ("金聖歎","1608-1661","明末清初評點大家","以評《水滸》《西廂》聞名，才子書體例對毛宗崗影響深遠。","indigo"),
        ("李漁（李笠翁）","1611-1680","清初戲曲家","李笠翁評本於毛本之前，對三國敘事結構多有發明。",""),
        ("毛宗崗","1632-1709?","清初評點家","偕父毛綸評定三國，冠楊慎《臨江仙》於卷首，修正回目、刪靜軒詩、改易關鍵文字，定本通行三百餘年。","red"),
        ("胡適","1891-1962","新文學運動、考據學","《三國志演義序》開現代三國版本學之先。","steel"),
        ("魯迅","1881-1936","現代文學奠基人","《中國小說史略》：「欲顯劉備之長厚而似偽，狀諸葛之多智而近妖。」","steel"),
        ("沈伯俊","1946-","當代三國版本學大家","《三國演義校理本》校訛誤數百處，系統梳理演義/志傳兩大系統源流。","jade"),
        ("易中天","1947-","當代大眾講史代表","《品三國》以平民視角重述三國，引發三國熱；毀譽參半，但傳播貢獻卓著。","gold"),
    ]
    cards=''
    for n,y,f,d,c in scholars:
        cc = "" if c not in ("red",) else ""
        name_html = n + (' <span class="stamp">定本</span>' if c=="red" else "")
        h4_color = ' style="color:var(--cinnabar-d)"' if c=="red" else ""
        cards += '<div class="card '+cc+'"><h4'+h4_color+'>'+name_html+'</h4>' \
          '<div class="meta">'+y+' · '+f+'</div><div class="desc">'+d+'</div></div>'
    body = '<h2>批者群像 · '+str(len(scholars))+' 位</h2>' \
      '<p class="lead">從明末李卓吾、清初毛宗崗的古典評點傳統，到胡適魯迅的現代考據學，再到沈伯俊的版本學與易中天的大眾傳播——三國學術史本身就是一部中國小說批評史。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("scholars.html", "批者群像", body)

# ---- 16. 學術論著 ----
def page_academy():
    papers = [
        ("《三國志演義》毛宗崗評點本","1679","毛宗崗/毛綸","今通行百二十回評點本，定本三百年。","古代評點本"),
        ("《中國小說史略》","1923","魯迅","奠定現代三國研究框架。","現代論著"),
        ("《三國志演義》人文社校注本","1953/1973","顧學頡 等","新中國權威通行點校本。","校理本"),
        ("《三國演義版本考》","2001","沈伯俊/譚良嘯","系統梳理 20 餘種刻本傳承。","現代學術"),
        ("《三國史話》","1943","呂思勉","史學家以正史糾小說之誤，文史互證典範。","文史互證"),
        ("《品三國》","2006","易中天","百家講壇講稿，大眾傳播典範。","大眾學術"),
    ]
    cards=''.join('<div class="card"><h4>'+t+'</h4><div class="meta">'+y+' · '+a+' · <span class="tag">'+c+'</span></div><div class="desc">'+d+'</div></div>' for t,y,a,d,c in papers)
    body = '<h2>論著 · 代表性研究</h2><p class="lead">從毛評本到當代版本學，呈現三國研究的學術脈絡。</p><div class="grid">'+cards+'</div>'
    write_page("academy.html", "論著", body)

# ---- 17. 影視戲曲 ----
def page_adaptations():
    adapt = [
        ("三國演義（央視 1994）","電視劇","1994","王扶林導演，唐國強/鮑國安主演，84集，豆瓣9.6","經典劇集","jade","9.6"),
        ("三國（新三國 2010）","電視劇","2010","高希希導演，陳建斌/于和偉/陸毅主演，95集，豆瓣8.5","重拍劇集","indigo","8.5"),
        ("赤壁（上下）","電影","2008-2009","吳宇森導演，梁朝偉/金城武主演","華語大片","bronze","6.5"),
        ("三國之見龍卸甲","電影","2008","李仁港導演，劉德華飾趙雲","趙子龍單主角","steel","5.6"),
        ("真·三國無雙系列","遊戲","1997-","光榮特庫摩出品，8 代正傳","砍殺動作","gold","—"),
        ("三國志系列","遊戲","1985-","光榮特庫摩歷史策略模擬","策略神作","gold","—"),
        ("三國演義連環畫","繪本","1957-1994","上海人民美術出版社，60冊","小人書","red","9.8"),
        ("定軍山","京劇","傳統","譚鑫培主演，中國第一部電影（1905）即拍此劇","戲曲鼻祖","","—"),
    ]
    cards=''
    for n,t,y,d,c,col,s in adapt:
        cc = ""
        cards += '<div class="card"><h4>'+n+'</h4><div class="meta">'+y+' · '+t+' · <span class="tag">'+c+'</span> · 豆瓣 '+s+'</div><div class="desc">'+d+'</div></div>'
    body = '<h2>影視戲曲遊戲 · 衍生世界</h2>' \
      '<p class="lead">三國是華文世界最大的文化 IP——京劇、電影、電視、遊戲、連環畫，數百年不絕。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("adaptations.html", "影視戲曲", body)

# ---- 18. 詩詞讚語 ----
def page_poems():
    famous = [
        ("臨江仙·滾滾長江東逝水","明·楊慎（毛宗崗冠於卷首）","滾滾長江東逝水，浪花淘盡英雄。是非成敗轉頭空。青山依舊在，幾度夕陽紅。<br>白髮漁樵江渚上，慣看秋月春風。一壺濁酒喜相逢。古今多少事，都付笑談中。"),
        ("短歌行","曹操（第48回）","對酒當歌，人生幾何！譬如朝露，去日苦多。<br>慨當以慷，憂思難忘。何以解憂？唯有杜康。<br>青青子衿，悠悠我心。但為君故，沉吟至今。<br>月明星稀，烏鵲南飛。山不厭高，海不厭深。周公吐哺，天下歸心。"),
        ("隆中對","諸葛亮（第38回）","將軍既帝室之胄，信義著於四海……若跨有荊、益，保其巖阻，西和諸戎，南撫夷越，外結好孫權，內修政理……則霸業可成，漢室可興矣。"),
        ("出師表","諸葛亮（第91回）","臣本布衣，躬耕於南陽，苟全性命於亂世，不求聞達於諸侯。先帝不以臣卑鄙，三顧臣於草廬之中……<br>受任於敗軍之際，奉命於危難之間，爾來二十有一年矣。<br>鞠躬盡瘁，死而後已。"),
        ("銅雀台賦（改動版激周瑜）","曹植（第44回）","攬二喬於東南兮，樂朝夕之與共。（諸葛亮改句激周瑜）"),
        ("七步詩","曹植（第79回）","煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急！"),
        ("卷末詩","","紛紛世事無窮盡，天數茫茫不可逃。鼎足三分已成夢，後人憑弔空牢騷。"),
    ]
    cards=''.join('<div class="card"><h4>'+t+'</h4><div class="meta">'+a+'</div><div class="desc"><p style="font-family:var(--kai);font-size:16px;line-height:2;color:var(--ink);text-indent:0">'+v+'</p></div></div>' for t,a,v in famous)
    body = '<h2>詩詞讚語</h2><p class="lead">毛宗崗以楊慎《臨江仙》定調開篇，奠定千古悲涼基調。</p><div class="grid">'+cards+'</div>'
    write_page("poems.html", "詩詞讚語", body)

# ---- 19. 譜系圖（力導向圖） ----
def page_graph():
    body = '<h2>譜系圖</h2>' \
      '<p class="lead">交互力導向圖：左鍵拖動節點、右鍵/雙擊拖動畫布、滾輪縮放。點擊節點查看本體記錄。下方 Tab 可切換「人物」「勢力」「兵器」三張子圖。</p>' \
      '<div id="tabs" class="tabs"><button class="tab active" data-tab="people">人物圖</button>' \
      '<button class="tab" data-tab="factions">勢力圖</button>' \
      '<button class="tab" data-tab="artifacts">器物圖</button></div>' \
      '<div class="canvas-wrap"><div id="info"><i>點選節點查看本體記錄</i></div>' \
      '<div class="legend"><span class="lg lg-people"></span>人物<span class="lg lg-faction"></span>勢力<span class="lg lg-artifact"></span>器物</div>' \
      '<canvas id="c" width="1000" height="720"></canvas></div>' \
      '<p class="mo" style="margin-top:12px">數據：人物圖源於「君臣/父子/結義」關係；勢力圖含人物→所屬；器物圖含器物→持有者。</p>' \
      '<script src="assets/graph.js"></script>'
    write_page("graph.html", "譜系圖", body, "可交互力導向")

# ---- 20. 字鏡（字頻） ----
def page_mirror():
    body = '<h2>字鏡 · 全書 '+format(stat['chars'],',')+' 字</h2>' \
      '<p class="lead">按全書字頻降序呈現前 120 個單字，字號大小對應出現頻率——三國的字，是刀、馬、兵、將、軍、曹、玄。</p>' \
      '<div id="mirror"></div>' \
      '<p class="mo" style="margin-top:16px">說明：僅統計出現次數 ≥ 100 次的中文字（去除標點與空白）。</p>' \
      '<script>' \
      'fetch("data/freq.json").then(r=>r.json()).then(f=>{' \
      'const max=f[0].c;const d=document.getElementById("mirror");' \
      'f.slice(0,180).forEach(w=>{' \
      'const s=18+52*w.c/max;const op=.55+.45*w.c/max;' \
      'd.insertAdjacentHTML("beforeend",`<span style="font-size:\${s}px;opacity:\${op};margin:0 6px;font-family:var(--kai);color:var(--ink)">\${w.ch}</span>`);' \
      '});});</script>'
    write_page("mirror.html", "字鏡", body, "字頻雲")

# ---- 21. 三絕 ----
def page_sanjue():
    heroes = [
        ("智絕·諸葛亮","jade","臥龍先生","草船借箭·借東風·空城計·六出祁山·七擒孟獲——「狀諸葛之多智而近妖」。出師一表真名世，千載誰堪伯仲間。"),
        ("義絕·關羽","indigo","美髯公·漢壽亭侯","桃園結義·溫酒斬華雄·過五關斬六將·華容道釋曹操·刮骨療毒·走麥城。後世尊為武聖、關帝。"),
        ("奸絕·曹操","red","孟德·魏武帝","挾天子以令諸侯·官渡敗袁紹·橫槊賦詩·夢中殺人·華容道三笑——寧教我負天下人，休教天下人負我。"),
    ]
    cards=''.join('<div class="card hero-'+('zhu' if c=='red' else c)+'" style="padding:36px 32px"><h3 style="font-size:24px;margin-bottom:8px;color:var(--'+('cinnabar-d' if c=='red' else c)+')">'+n+'</h3>' \
      '<div class="meta">'+sub+'</div><div style="margin-top:18px;font-size:16px;line-height:2">'+desc+'</div></div>' for n,c,sub,desc in heroes)
    body = '<h2>三絕 · 毛宗崗評點論</h2>' \
      '<p class="lead">毛宗崗在「讀三國志法」中標舉三絕——諸葛亮智絕、關羽義絕、曹操奸絕，三人撐起三國敘事三角。</p>' \
      '<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:24px">'+cards+'</div>'
    write_page("sanjue.html", "三絕", body)

# ---- 22. 桃園 ----
def page_taoyuan():
    body = '<h2>桃園 · 桃園結義與義的起點</h2>' \
      '<div class="hero-poem" style="margin-bottom:32px"><div style="font-family:var(--kai);font-size:26px;line-height:1.8;color:var(--cinnabar-d);text-align:center;padding:40px 24px;background:var(--paper);border:1px double var(--bronze)">' \
      '念劉備、關羽、張飛，雖然異姓，既結為兄弟，<br>則同心協力，救困扶危；上報國家，下安黎庶。<br>' \
      '<span style="font-size:18px;color:var(--ink2)">——不求同年同月同日生，只願同年同月同日死。</span><br>' \
      '<span class="mo" style="font-size:14px">第一回 · 宴桃園豪傑三結義</span></div></div>' \
      '<h3>桃園結義在中國文化中的意義</h3>' \
      '<p class="lead">桃園結義是中國人「義」的原點。從此，「兄弟」一詞跨過血緣，成為江湖倫理的最高範疇。關公信仰遍佈全球華人社區，皆源於此。</p>' \
      '<div class="grid">' \
      '<div class="card"><h4>桃園在何處？</h4><div class="desc">河北涿郡（今涿州）桃園——張飛莊後。今涿州市樓桑廟三義宮為祭祀舊址。</div></div>' \
      '<div class="card"><h4>桃花意象</h4><div class="desc">桃花象徵春季、青春與短暫。三兄弟於桃下結義，桃花之艷即為後來悲劇伏筆。</div></div>' \
      '<div class="card"><h4>「桃園」作為文化母題</h4><div class="desc">後世天地會、洪門、青幫入會結拜，皆以桃園為典範；《水滸》聚義、《西游》取經團契皆受其影響。</div></div>' \
      '<div class="card jade"><h4>「義」的內涵</h4><div class="desc"><b>君臣義</b>：關羽千里走單騎；<b>兄弟義</b>：張飛為兄長仇出師未捷身先死；<b>朋友義</b>：趙雲單騎救主；<b>知己義</b>：孔明鞠躬盡瘁報三顧。</div></div>' \
      '</div>'
    write_page("taoyuan.html", "桃園", body)

# ---- 23. 英雄譜（帶搜索） ----
def page_heroes():
    rows=''.join('<tr><td><a href="persons.html">'+p['name']+'</a></td>' \
      '<td>'+(p.get('zi') or '—')+'</td>' \
      '<td>'+(p.get('faction') or '—')+'</td>' \
      '<td>'+(p.get('category') or '—')+'</td>' \
      '<td style="text-align:right">'+format(p.get('total',0),',')+'</td>' \
      '<td>第'+str(p.get('first','?'))+'回</td></tr>' for p in sorted(persons, key=lambda x:-x.get('total',0)))
    body = '<h2>英雄譜 · 全集索</h2>' \
      '<p class="lead">按提及次數降序排列全部 '+str(len(persons))+' 位人物。可在右上角輸入姓名/字/別名過濾。</p>' \
      '<input id="q" placeholder="搜尋姓名/字/別名，如「雲長」「公瑾」" autofocus>' \
      '<table id="ht"><thead><tr><th>姓名</th><th>字</th><th>陣營</th><th>類別</th><th>提及</th><th>初見</th></tr></thead>' \
      '<tbody id="hb">'+rows+'</tbody></table>' \
      '<script>' \
      'const rows=document.querySelectorAll("#hb tr");' \
      'document.getElementById("q").addEventListener("input",e=>{' \
      'const q=e.target.value.trim();' \
      'rows.forEach(r=>{r.style.display=!q||r.textContent.includes(q)?"":"none"});});</script>'
    write_page("heroes.html", "英雄譜", body, "全人物表")

# ---- 24. 三國輿圖（SVG 地圖） ----
def page_map():
    svg = '<svg id="map" viewBox="0 0 900 680" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:Kaiti SC,serif">' \
      '<defs><radialGradient id="bg" cx="50%" cy="40%"><stop offset="0%" stop-color="#f6ecd4"/><stop offset="100%" stop-color="#ead9b3"/></radialGradient>' \
      '<pattern id="paper" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="url(#bg)"/><circle cx="1" cy="1" r=".3" fill="#8b6f3e" opacity=".04"/></pattern></defs>' \
      '<rect width="900" height="680" fill="url(#paper)"/>' \
      '<path d="M200,180 Q260,160 340,180 Q420,160 500,190 Q580,170 660,200 Q700,240 680,300 Q640,360 560,400 Q480,440 400,420 Q320,440 240,400 Q180,340 200,280 Z" fill="rgba(158,42,32,.07)" stroke="#9e2a20" stroke-width="1.2" stroke-dasharray="4 3"/>' \
      '<path d="M200,180 Q260,160 340,180" fill="none" stroke="#3b5d7c" stroke-width="1.4" opacity=".6"/>' \
      '<text x="230" y="150" font-size="14" fill="#3b5d7c">魏 · 洛陽/許昌</text>' \
      '<path d="M500,190 Q580,170 660,200" fill="none" stroke="#3d6b5c" stroke-width="1.4" opacity=".6"/>' \
      '<text x="640" y="160" font-size="14" fill="#3d6b5c">吳 · 建業(建康)</text>' \
      '<text x="400" y="370" font-size="14" fill="#8b6f3e">蜀 · 成都</text>' \
      '<line x1="420" y1="120" x2="430" y2="160" stroke="#5c4a30" stroke-width="1"/>' \
      '<circle cx="420" cy="110" r="5" fill="#9e2a20" stroke="#5c221d"/><text x="425" y="106" font-size="13" fill="#2a241f">洛陽</text>' \
      '<circle cx="470" cy="170" r="5" fill="#9e2a20"/><text x="476" y="166" font-size="13">許昌</text>' \
      '<circle cx="690" cy="280" r="5" fill="#3d6b5c"/><text x="696" y="276" font-size="13">建業</text>' \
      '<circle cx="350" cy="400" r="5" fill="#8b6f3e"/><text x="356" y="396" font-size="13">成都</text>' \
      '<circle cx="500" cy="280" r="5" fill="#b07b28"/><text x="506" y="276" font-size="13">荊州</text>' \
      '<circle cx="450" cy="230" r="4" fill="#655028"/><text x="456" y="226" font-size="12">新野</text>' \
      '<circle cx="560" cy="250" r="4" fill="#655028"/><text x="566" y="246" font-size="12">江夏</text>' \
      '<circle cx="420" cy="220" r="4" fill="#655028"/><text x="426" y="216" font-size="12">宛城</text>' \
      '<circle cx="360" cy="330" r="4" fill="#655028"/><text x="320" y="330" font-size="12">漢中</text>' \
      '<circle cx="270" cy="180" r="4" fill="#655028"/><text x="200" y="176" font-size="12">長安</text>' \
      '<circle cx="240" cy="220" r="4" fill="#655028"/><text x="180" y="220" font-size="12">潼關</text>' \
      '<circle cx="480" cy="330" r="4" fill="#655028"/><text x="486" y="326" font-size="12">長沙</text>' \
      '<circle cx="550" cy="380" r="4" fill="#655028"/><text x="556" y="376" font-size="12">零陵</text>' \
      '<circle cx="600" cy="330" r="4" fill="#655028"/><text x="606" y="326" font-size="12">柴桑</text>' \
      '<circle cx="720" cy="350" r="4" fill="#655028"/><text x="726" y="346" font-size="12">會稽</text>' \
      '<circle cx="300" cy="250" r="4" fill="#655028"/><text x="240" y="250" font-size="12">祁山</text>' \
      '<circle cx="320" cy="150" r="4" fill="#655028"/><text x="250" y="148" font-size="12">冀州(鄴)</text>' \
      '<circle cx="200" cy="300" r="4" fill="#655028"/><text x="120" y="300" font-size="12">成都? — 益州</text>' \
      '<text x="50" y="50" font-size="22" fill="#9e2a20" font-weight="bold">三國形勢略圖</text>' \
      '<text x="50" y="72" font-size="12" fill="#655028">參考譚其驤《中國歷史地圖集》三國分圖繪製，僅為示意</text>' \
      '<g font-size="11" fill="#655028"><rect x="50" y="630" width="12" height="12" fill="#9e2a20"/><text x="68" y="640">都城</text><rect x="120" y="630" width="12" height="12" fill="#655028"/><text x="138" y="640">郡/要地</text><rect x="200" y="630" width="12" height="12" fill="rgba(158,42,32,.07)" stroke="#9e2a20" stroke-dasharray="3 2"/><text x="218" y="640">三國大致疆界（蜀-色:青銅）</text></g>' \
      '</svg>'
    body = '<h2>三國輿圖 · 示意地圖</h2>' \
      '<p class="lead">三國核心疆域與主要郡城：魏據中原、吳據江東、蜀據巴蜀；荊州為必爭之地，漢中為蜀之門戶，祁山為北伐要衝。</p>' \
      '<div style="background:var(--paper2);border:1px double var(--bronze);padding:16px">'+svg+'</div>' \
      '<p class="mo" style="margin-top:12px">注：本圖為概念示意，不作精確地理定位。詳見「輿地圖」頁之完整地名索引。</p>'
    write_page("map.html", "三國輿圖", body)

# ---- 25. 伏線 ----
def page_foreshadow():
    threads = [
        ("桃園結義→臨終遺言", "桃園盟「不求同年同月同日生」——關羽走麥城（220）、張飛為范疆張達所殺（221）、劉備夷陵兵敗白帝城託孤（223），三兄弟相隔不到三年先後離世，誓言應驗。"),
        ("臥龍鳳雛得一可安天下", "第35回水鏡先生司馬徽讖語——劉備兼得二人，鳳雛龐統落鳳坡早殞（214），臥龍六出祁山星落五丈原（234），漢室終未中興。讖言有「得一」之伏。"),
        ("三馬同槽", "第78回曹操夢三馬同槽——疑馬騰馬超，實為司馬懿、司馬師、司馬昭父子三人篡魏之讖。"),
        ("白帝託孤「君可自取」", "劉備託孤於諸葛亮——孔明鞠躬盡瘁，此語既是至誠亦是試探，奠定後主時代君臣格局，也種下黃皓亂政伏筆。"),
        ("郭嘉遺計定遼東", "第33回郭嘉臨終遺計——曹操依計不戰而得袁氏首級，郭嘉死後猶能定計，伏「若郭嘉在，不使孤至此」之赤壁遺恨。"),
        ("華容道釋曹", "第50回關羽義釋曹操——三分天下於此定局：曹操不死、孫劉可聯、玄德得以立足。關羽之義，實為大勢之鑰。"),
    ]
    cards=''.join('<div class="card"><h4>'+t+'</h4><div class="desc">'+d+'</div></div>' for t,d in threads)
    body = '<h2>千里伏綫</h2><p class="lead">毛宗崗評點最欣賞三國的「隔年下種、先時伏著」——一個細節，往往數十回後應驗。</p>' \
      '<div class="grid">'+cards+'</div>'
    write_page("foreshadow.html", "千里伏綫", body)

# ---- 26. 本體查詢（DuckDB-WASM） ----
def page_query():
    body = '<h2>本體查詢 · DuckDB-WASM</h2>' \
      '<p class="lead">無服務器 SQL 控制台——所有 Parquet 表本地讀取，可直接在瀏覽器中查詢人物、勢力、戰役、人物提及（章節分佈）、版本元數據等 19 張表。</p>' \
      '<div class="query-panel">' \
      '<div id="qstatus" style="margin-bottom:8px;color:var(--bronze);font-size:13px">正在初始化 DuckDB…（首次需加載 ~3MB WASM，請稍候）</div>' \
      '<textarea id="sql" rows="5" placeholder="輸入 SQL，例如：&#10;SELECT name, faction, total FROM persons ORDER BY total DESC LIMIT 10;">SELECT name, faction, total FROM persons ORDER BY total DESC LIMIT 15;</textarea>' \
      '<div style="margin-top:8px"><button id="run">執行 ▶</button> <button id="explain">表結構</button> ' \
      '<select id="sample"><option value="">快速示例…</option>' \
      '<option>-- 諸葛亮在各章提及分佈\nSELECT l.chapter_no, COUNT(*) c FROM mentions m JOIN lines l ON m.line_id=l.line_id WHERE m.entity_id=\'sg_person_諸葛亮\' GROUP BY l.chapter_no ORDER BY c DESC LIMIT 10;</option>' \
      '<option>-- 蜀漢人物按提及排序\nSELECT name, zi, total FROM persons WHERE faction=\'蜀漢\' ORDER BY total DESC LIMIT 20;</option>' \
      '<option>-- 戰役時間排序\nSELECT name, year, side_a, side_b, outcome FROM battles ORDER BY CAST(year AS INT);</option>' \
      '<option>-- 各勢力人物數\nSELECT faction, COUNT(*) n FROM persons GROUP BY faction ORDER BY n DESC;</option>' \
      '</select></div>' \
      '<div id="results" style="margin-top:16px"></div>' \
      '<div id="schema" style="display:none;margin-top:16px;padding:12px;background:var(--paper);border:1px solid var(--border);font-size:12px;max-height:300px;overflow:auto"></div>' \
      '</div>' \
      '<p class="mo" style="margin-top:12px">技術：DuckDB-WASM 瀏覽器內 SQL 引擎；Parquet 文件由 build/build_parquet.py 生成，並發布至 docs/data/*.parquet。</p>' \
      '<script src="assets/query.js"></script>'
    write_page("query.html", "本體查詢", body, "DuckDB-WASM 控制台")

if __name__ == "__main__":
    page_index()
    page_ontology()
    page_read()
    page_persons()
    page_factions()
    page_genealogy()
    page_battles()
    page_places()
    page_timeline()
    page_stratagems()
    page_artifacts()
    page_prophecies()
    page_versions()
    page_variants()
    page_scholars()
    page_academy()
    page_adaptations()
    page_poems()
    page_graph()
    page_mirror()
    page_sanjue()
    page_taoyuan()
    page_heroes()
    page_map()
    page_foreshadow()
    page_query()
    print("全部页面生成完成")
