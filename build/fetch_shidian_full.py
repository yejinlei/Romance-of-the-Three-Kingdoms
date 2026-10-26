#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
识典古籍 周曰校刊本《新刊校正古本大字音釋三國志通俗演義》(NA11011) 全书抓取。
两阶段：A 抓种子页扩出全书章节 id；B 并行抓各章正文并逐章落盘（可断点续抓）。
"""
import subprocess, os, re, json, time, sys
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup

BASE = "https://www.shidianguji.com/zh/book/NA11011/chapter/"
OUT = "/home/user/workspace/5806794539557799814/sanguo/raw/zhouyuexiao"
CH = os.path.join(OUT, "chapters")
os.makedirs(CH, exist_ok=True)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

SEED = ["1k3o711mconbe", "1k3o711ya29sr", "1k3o712mu6wit", "1k3o717ec3xgm",
        "1k3o71cm0mcd6", "1k3o71heo1kwr", "1k3o71m8i0lra", "1k3o71rg2df76",
        "1k3o71wrg0wez", "1k3o721q9rwui", "1k3o72754ej2i", "1k3o72ebzwefv",
        "1k3o72knq5hyq"]

ID_RE = re.compile(r"chapter/([a-z0-9]{8,})(?![\w-])")


def fetch(cid, tries=3):
    for i in range(tries):
        try:
            r = subprocess.run(
                ["curl", "-sL", "--compressed", "-A", UA, "--max-time", "45",
                 BASE + cid], capture_output=True)
            if r.stdout and len(r.stdout) > 10000:
                return r.stdout.decode("utf-8", "ignore")
        except Exception:
            pass
        time.sleep(1 + i)
    return ""


def html_path(cid):
    return os.path.join(CH, cid + ".html")


def get_html(cid):
    p = html_path(cid)
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
        return None, []
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
    return vol, lines


def main():
    # 阶段 A
    seen = list(SEED)
    seen_set = set(SEED)
    with ThreadPoolExecutor(max_workers=6) as ex:
        htmls = list(ex.map(get_html, SEED))
    for h in htmls:
        for m in ID_RE.findall(h):
            if m not in seen_set:
                seen_set.add(m)
                seen.append(m)
    print("阶段A：章节 id 数 =", len(seen), flush=True)
    ids = sorted(seen_set)
    with open(os.path.join(OUT, "chapter_ids.json"), "w", encoding="utf-8") as f:
        json.dump(ids, f, ensure_ascii=False, indent=1)

    # 阶段 B
    done = [0]
    def job(cid):
        h = get_html(cid)
        vol, lines = parse(h)
        txt = "\n\n".join(t for _, t in lines)
        with open(os.path.join(CH, cid + ".txt"), "w", encoding="utf-8") as f:
            f.write(txt)
        done[0] += 1
        if done[0] % 15 == 0:
            print(f"  已处理 {done[0]}/{len(ids)}", flush=True)
        return cid, len(txt), vol

    with ThreadPoolExecutor(max_workers=6) as ex:
        res = list(ex.map(job, ids))
    print("阶段B 完成", flush=True)

    # 阶段 C 合并
    parts = []
    tot = 0
    for cid in ids:
        p = os.path.join(CH, cid + ".txt")
        t = open(p, encoding="utf-8").read() if os.path.exists(p) else ""
        tot += len(t.replace("\n", ""))
        if t.strip():
            parts.append(t)
    body = "\n\n".join(parts)
    with open(os.path.join(OUT, "zhouyuexiao_full.txt"), "w", encoding="utf-8") as f:
        f.write(body)
    print("正文总字数 =", tot, flush=True)
    empty = [c for c, n, v in res if n == 0]
    print("空章数 =", len(empty), empty[:20], flush=True)


if __name__ == "__main__":
    main()
