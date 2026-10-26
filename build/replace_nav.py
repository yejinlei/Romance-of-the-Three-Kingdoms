#!/usr/bin/env python3
"""把全站 24 个页面的导航区替换为红楼未完 / 水浒同款裸 <nav>。"""
import os, re, glob

# 24 个导航条目（对齐红楼/水浒的 2-4 字短名风格）
NAV = [
    ("index.html",       "总览"),
    ("read.html",        "正文"),
    ("persons.html",     "人物"),
    ("factions.html",    "势力"),
    ("places.html",      "地理"),
    ("battles.html",     "战役"),
    ("events.html",      "事件"),
    ("stratagems.html",  "计谋"),
    ("artifacts.html",   "器物"),
    ("prophecies.html",  "谶纬"),
    ("poetry.html",      "诗词"),
    ("versions.html",    "版本谱"),
    ("variants.html",    "异文"),
    ("graph.html",       "关系谱"),
    ("map.html",         "舆图"),
    ("guide.html",       "读法"),
    ("mirror.html",      "虚实"),
    ("destiny.html",     "天命"),
    ("scholars.html",    "评点"),
    ("papers.html",      "论著"),
    ("adaptations.html", "衍生"),
    ("stats.html",       "图谱"),
    ("query.html",       "本体查询"),
    ("ontology.html",    "本体论"),
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
