#!/usr/bin/env python3
"""批量把 24 個頁面的 header 統一為紅樓未完同款（印章+標題+副標+24連結導航）。"""
import os, re, glob

# 24 個入口（與紅樓未完 24 項數量一致，保持整齊）
NAV = [
  ("index.html",      "總覽"),
  ("read.html",       "正文·脂批"),    # 此處對應"正文·多版本"
  ("persons.html",    "人物譜"),
  ("factions.html",   "勢力志"),
  ("places.html",     "地理志"),
  ("battles.html",    "戰役錄"),
  ("events.html",     "事件簿"),
  ("stratagems.html", "計謀鑑"),
  ("artifacts.html",  "器物簿"),
  ("prophecies.html", "讖緯考"),
  ("poetry.html",     "詩詞箋"),
  ("versions.html",   "版本譜"),
  ("variants.html",   "異文對"),
  ("graph.html",      "關係譜"),
  ("map.html",        "輿地圖"),
  ("guide.html",      "讀法指"),
  ("mirror.html",     "虛實辨"),
  ("destiny.html",    "天命識"),
  ("scholars.html",   "評點家"),
  ("papers.html",     "論著錄"),
  ("adaptations.html","衍生譜"),
  ("stats.html",      "統計譜"),
  ("query.html",      "本體查"),
  ("ontology.html",   "本末論"),
]

# 每頁副標題
SUB_TITLES = {
  "index.html":      "—— 多版本知識圖譜 · Sanguo-Yanyi Multi-Edition Ontology",
  "read.html":       "—— 毛宗崗本 · 周曰校刊本 · 雙版本全文在線",
  "ontology.html":   "—— OWL 2 DL · Turtle TTL · YAML 受控詞表",
  "query.html":      "—— DuckDB-WASM 無服務器 SQL · 本體即席查詢",
  "versions.html":   "—— 演義系 · 志傳繁本 · 志傳簡本 · 評點系 · 現代整理本",
  "variants.html":   "—— 毛本 / 嘉靖本 / 周曰校本 · 全文自動對勘",
}
DEFAULT_SUB = "—— 多版本知識圖譜 · Sanguo-Yanyi Multi-Edition Ontology"

# 每頁標題（<title>）
PAGE_TITLES = {
  "index.html":      "總覽 · 三國演義本體論",
  "read.html":       "正文閱讀 · 三國演義本體論",
  "persons.html":    "人物譜 · 三國演義本體論",
  "factions.html":   "勢力志 · 三國演義本體論",
  "places.html":     "地理志 · 三國演義本體論",
  "battles.html":    "戰役錄 · 三國演義本體論",
  "events.html":     "事件簿 · 三國演義本體論",
  "stratagems.html": "計謀鑑 · 三國演義本體論",
  "artifacts.html":  "器物簿 · 三國演義本體論",
  "prophecies.html": "讖緯考 · 三國演義本體論",
  "poetry.html":     "詩詞箋 · 三國演義本體論",
  "versions.html":   "版本譜 · 三國演義本體論",
  "variants.html":   "異文對勘 · 三國演義本體論",
  "graph.html":      "關係譜 · 三國演義本體論",
  "map.html":        "輿地圖 · 三國演義本體論",
  "guide.html":      "讀法指 · 三國演義本體論",
  "mirror.html":     "虛實辨 · 三國演義本體論",
  "destiny.html":    "天命識 · 三國演義本體論",
  "scholars.html":   "評點家 · 三國演義本體論",
  "papers.html":     "論著錄 · 三國演義本體論",
  "adaptations.html":"衍生譜 · 三國演義本體論",
  "stats.html":      "統計譜 · 三國演義本體論",
  "query.html":      "本體查詢 · 三國演義本體論",
  "ontology.html":   "本末論（OWL2） · 三國演義本體論",
}

def build_header(page_name):
  links = []
  for href, label in NAV:
    cls = ' class="on"' if href == page_name else ''
    links.append(f'<a href="{href}"{cls}>{label}</a>')
  nav_html = "".join(links)
  sub = SUB_TITLES.get(page_name, DEFAULT_SUB)
  return (
    f'<header class="site-header">\n'
    f'  <a class="seal" href="index.html" title="三國">國三</a>\n'
    f'  <h1 class="site-title"><a href="index.html">三國演義本體論</a></h1>\n'
    f'  <div class="sub site-sub">{sub}</div>\n'
    f'  <nav>{nav_html}</nav>\n'
    f'</header>'
  )

def fix_page(path):
  page_name = os.path.basename(path)
  with open(path, encoding="utf-8") as f:
    html = f.read()

  # 1. 保證 css 引用
  if 'assets/app.css' not in html:
    html = re.sub(r'</head>', '<link rel="stylesheet" href="assets/app.css">\n</head>', html, count=1)

  # 2. 修正 title
  new_title = PAGE_TITLES.get(page_name)
  if new_title:
    html = re.sub(r'<title>.*?</title>', f'<title>{new_title}</title>', html, count=1)

  # 3. 移除已有的 header（多種可能寫法）
  # 匹配 <header ...>...</header>
  html = re.sub(r'<header\b[^>]*>.*?</header>', '', html, count=1, flags=re.S)

  # 4. 在 <body> 後插入新 header
  new_header = build_header(page_name)
  html = re.sub(r'(<body[^>]*>)', r'\1\n' + new_header, html, count=1)

  # 5. 補 footer（如果沒有）
  if '<footer>' not in html and '</body>' in html:
    footer = (
      '<footer>\n'
      '  <div>三國演義本體論 · Sanguo-Yanyi Multi-Edition Ontology</div>\n'
      '  <div style="margin-top:6px;opacity:.75;">以毛宗崗評本與周曰校刊本為線上全文；OWL 2 本體兼容十二主要版本</div>\n'
      '</footer>\n'
    )
    html = html.replace('</body>', footer + '</body>')

  with open(path, "w", encoding="utf-8") as f:
    f.write(html)
  return page_name

if __name__ == "__main__":
  docs = os.path.join(os.path.dirname(__file__), "..", "docs")
  changed = []
  for html in sorted(glob.glob(os.path.join(docs, "*.html"))):
    name = fix_page(html)
    changed.append(name)
  print(f"已修復 {len(changed)} 個頁面：")
  for n in changed:
    print(" -", n)
