#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
毛本（通行本）与周曰校刊本全文句子级对勘，提取真实异文。
输出：04_knowledge_data/diff_stats.json 与 diff_blocks.json
"""
import json, re, os, time, difflib

ROOT = "/home/user/workspace/5806794539557799814/sanguo"
OUT = os.path.join(ROOT, "04_knowledge_data")

SPLIT = re.compile(r"(?<=[。！？；])")


def load_mao():
    d = json.load(open(os.path.join(ROOT, "docs/data/read.json"), encoding="utf-8"))
    sents, chap = [], []
    for c in d:
        for p in c["paragraphs"]:
            for s in SPLIT.split(p):
                s = s.strip()
                if s:
                    sents.append(s)
                    chap.append(c["no"])
    return sents, chap


def load_zhou():
    d = json.load(open(os.path.join(OUT, "zhouyuexiao_chapters.json"), encoding="utf-8"))
    import opencc
    cc = opencc.OpenCC("t2s")
    sents, chap = [], []
    for i, c in enumerate(d, 1):
        t = cc.convert(c["text"])
        for s in SPLIT.split(t):
            s = s.strip()
            if s:
                sents.append(s)
                chap.append(i)
    return sents, chap


def main():
    t0 = time.time()
    a, ca = load_mao()
    b, cb = load_zhou()
    print(f"毛本句 {len(a)}  周曰校句 {len(b)}  载入 {time.time()-t0:.1f}s", flush=True)

    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    ops = sm.get_opcodes()
    print(f"对齐完成 {time.time()-t0:.1f}s，opcodes={len(ops)}", flush=True)

    blocks = []
    for tag, i1, i2, j1, j2 in ops:
        if tag == "equal":
            continue
        blocks.append({
            "tag": tag,
            "mao": a[i1:i2], "mao_ch": (ca[i1] if i1 < len(ca) else None),
            "zhou": b[j1:j2], "zhou_ch": (cb[j1] if j1 < len(cb) else None),
        })
    stats = {
        "mao_sent": len(a), "zhou_sent": len(b),
        "equal_blocks": sum(1 for t, *_ in ops if t == "equal"),
        "diff_blocks": len(blocks),
        "replace": sum(1 for b_ in blocks if b_["tag"] == "replace"),
        "insert": sum(1 for b_ in blocks if b_["tag"] == "insert"),
        "delete": sum(1 for b_ in blocks if b_["tag"] == "delete"),
    }
    json.dump(stats, open(os.path.join(OUT, "diff_stats.json"), "w",
                          encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(blocks, open(os.path.join(OUT, "diff_blocks.json"), "w",
                           encoding="utf-8"), ensure_ascii=False)
    print(json.dumps(stats, ensure_ascii=False, indent=1), flush=True)
    print("耗时", round(time.time() - t0, 1), "s", flush=True)


if __name__ == "__main__":
    main()
