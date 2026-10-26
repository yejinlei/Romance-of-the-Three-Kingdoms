#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
识典古籍 周曰校刊本《三國志通俗演義》(NA11011)
顺着每页「下一篇」链接遍历，得到全书权威章节顺序，再按序拼装全文。
"""
import subprocess, os, re, json, time
from bs4 import BeautifulSoup

BASE = "https://www.shidianguji.com/zh/book/NA11011/chapter/"
OUT = "/home/user/workspace/5806794539557799814/sanguo/raw/zhouyuexiao"
CH = os.path.join(OUT, "chapters")
os.makedirs(CH, exist_ok=True)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
START = "1k3o71cm0mcd6"
PREFIX = ["1k3o711mconbe", "1k3o711ya29sr", "1k3o712mu6wit", "1k3o717ec3xgm"]


def fetch(cid, tries=3):
    for i in range(tries):
        try:
            r = subprocess.run(["curl", "-sL", "--compressed", "-A", UA,
                                "--max-time", "45", BASE + cid],
                               capture_output=True)
            if r.stdout and len(r.stdout) > 10000:
                return r.stdout.decode("utf-8", "ignore")
        except Exception:
            pass
        time.sleep(1 + i)
    return ""


def get_html(cid):
    p = os.path.join(CH, cid + ".html")
    if os.path.exists(p) and os.path.getsize(p) > 10000:
        return open(p, encoding="utf-8").read()
    h = fetch(cid)
    if h:
        with open(p, "w", encoding="utf-8") as f:
            f.write(h)
    return h


def parse(html):
    soup = BeautifulSoup(html, "html.parser")
    art = soup.find("article", class_="chapter-reader")
    if art is None:
        return None, [], None, None
    # 下一篇
    nxt_id = nxt_title = None
    f = art.find("footer")
    if f:
        a = f.find("a", href=True)
        if a:
            m = re.search(r"chapter/([a-z0-9]+)", a["href"])
            if m:
                nxt_id = m.group(1)
            nxt_title = a.get("title")
    for sp in art.find_all("span"):
        t = sp.get_text("", strip=True)
        if "釋義" in t or t.startswith("音") or t.startswith("反"):
            sp.decompose()
    vol, lines = None, []
    for el in art.find_all(["h2", "h3", "p"]):
        t = el.get_text("", strip=True).replace("\u3000", " ").strip()
        if t:
            if el.name == "h2":
                vol = t
            lines.append((el.name, t))
    return vol, lines, nxt_id, nxt_title


def main():
    order = []
    seen = set()
    for cid in PREFIX:
        seen.add(cid)
        html = get_html(cid)
        vol, lines, nxt, nt = parse(html)
        ti = [t for n, t in lines if n == "h3"]
        order.append({"id": cid, "vol": vol, "title": (ti[0] if ti else nt),
                      "chars": sum(len(t) for _, t in lines)})
    cid = START
    while cid and cid not in seen:
        seen.add(cid)
        html = get_html(cid)
        if not html:
            print("抓取失败:", cid, flush=True)
            break
        vol, lines, nxt, nt = parse(html)
        ti = [t for n, t in lines if n == "h3"]
        order.append({"id": cid, "vol": vol, "title": (ti[0] if ti else nt),
                      "chars": sum(len(t) for _, t in lines)})
        if len(order) % 25 == 0:
            print(f"  第 {len(order)} 章 {cid} {order[-1]['title']}", flush=True)
        cid = nxt
    print("遍历完成，章节数 =", len(order), flush=True)
    json.dump(order, open(os.path.join(OUT, "chapter_order.json"), "w",
                          encoding="utf-8"), ensure_ascii=False, indent=1)

    # 按序拼装
    parts, tot = [], 0
    for o in order:
        p = os.path.join(CH, o["id"] + ".txt")
        if not os.path.exists(p):
            vol, lines, _, _ = parse(get_html(o["id"]))
            txt = "\n\n".join(t for _, t in lines)
            open(p, "w", encoding="utf-8").write(txt)
        else:
            txt = open(p, encoding="utf-8").read()
        tot += len(txt.replace("\n", ""))
        if txt.strip():
            parts.append(txt)
    open(os.path.join(OUT, "zhouyuexiao_full.txt"), "w",
         encoding="utf-8").write("\n\n".join(parts))
    print("正文总字数 =", tot, flush=True)
    print("末章 =", order[-1] if order else None, flush=True)


if __name__ == "__main__":
    main()
