#!/usr/bin/env python3
"""把全站 24 个页面的导航区替换为红楼未完 / 水浒同款裸 <nav>。"""
import os, re, glob

# 24 个导航条目（对齐红楼/水浒的 2-4 字短名风格）
NAV = [
    ("index.html",       "总览"),
    ("read.html",        "正文"),
    ("heroes.html",      "英雄譜"),
    ("persons.html",     "人物誌"),
    ("factions.html",    "勢力志"),
    ("places.html",      "地理志"),
    ("battles.html",     "戰役錄"),
    ("events.html",      "事件譜"),
    ("stratagems.html",  "計謀譜"),
    ("artifacts.html",   "器物譜"),
    ("prophecies.html",  "讖緯志"),
    ("poetry.html",      "詩詞鈔"),
    ("versions.html",    "版本譜"),
    ("variants.html",    "異文對勘"),
    ("graph.html",       "關係網"),
    ("map.html",         "輿地圖"),
    ("guide.html",       "讀法"),
    ("mirror.html",      "虛實辯"),
    ("destiny.html",     "天命讖"),
    ("scholars.html",    "評點家"),
    ("papers.html",      "學術論"),
    ("adaptations.html", "演義外"),
    ("query.html",       "本體查詢"),
    ("ontology.html",    "本體論"),
]

def build_nav(current_file):
    parts = []
    for href, label in NAV:
        if href == current_file:
            parts.append(f'<a href="{href}" class="on">{label}</a>')
        else:
            parts.append(f'<a href="{href}">{label}</a>')
    return "<nav>" + "".join(parts) + "</nav>"

ROOT = os.path.join(os.path.dirname(__file__), "..", "docs")

# 匹配 nav 块（先匹配旧 div.nav-grid，再匹配新 <nav>）
OLD_RE_DIV = re.compile(r'<div class="nav-grid">.*?</div>', re.S)
OLD_RE_NAV = re.compile(r'<nav>.*?</nav>', re.S)

count = 0
for html_path in glob.glob(os.path.join(ROOT, "*.html")):
    fname = os.path.basename(html_path)
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    new_nav = build_nav(fname)
    html2, n1 = OLD_RE_DIV.subn(new_nav, html, count=1)
    if n1 == 0:
        html2, n2 = OLD_RE_NAV.subn(new_nav, html, count=1)
    else:
        n2 = 1
    if n1 == 0 and n2 == 0:
        print(f"[skip] {fname} — no nav block found")
        continue
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html2)
    count += 1
    print(f"[ok]   {fname}")

print(f"\nUpdated {count} pages.")
