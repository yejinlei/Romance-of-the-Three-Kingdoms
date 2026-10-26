#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把毛本×周曰校全文对勘结果整理成异文数据，并把周曰校本全文并入站点数据。
"""
import json, re, os

ROOT = "/home/user/workspace/5806794539557799814/sanguo"
KD = os.path.join(ROOT, "04_knowledge_data")
DD = os.path.join(ROOT, "docs/data")

PUNCT = re.compile(r"[，。！？；：「」『』、（）《》…—·\s\u3000]")


def strip_p(s):
    return PUNCT.sub("", s)


def main():
    blocks = json.load(open(os.path.join(KD, "diff_blocks.json"), encoding="utf-8"))
    curated = []
    for b in blocks:
        mt = "".join(b["mao"]).strip()
        zt = "".join(b["zhou"]).strip()
        if not mt or not zt:
            continue
        if len(mt) < 10 or len(zt) < 10 or len(mt) > 420 or len(zt) > 420:
            continue
        if strip_p(mt) == strip_p(zt):
            continue  # 仅标点差异
        # 相似度粗估（用字符集交集比例）
        sm, sz = set(mt), set(zt)
        ratio = len(sm & sz) / max(1, len(sm | sz))
        curated.append({
            "mao_ch": b["mao_ch"], "zhou_ch": b["zhou_ch"], "tag": b["tag"],
            "mao": mt, "zhou": zt,
            "sim": round(ratio, 3),
            "diff": abs(len(mt) - len(zt)),
        })
    # 按相似度降序（越像越可能是逐字异文，而非整段增删）
    curated.sort(key=lambda x: (-x["sim"], x["diff"]))
    picked = curated[:260]
    picked.sort(key=lambda x: (x["mao_ch"] or 0))
    out = {
        "source": "毛宗崗評本 × 周曰校刊本 全文自動對勘（difflib 句子級對齊）",
        "total_diff_blocks": len(blocks),
        "curated": len(picked),
        "items": [{"no": i + 1, **x} for i, x in enumerate(picked)],
    }
    json.dump(out, open(os.path.join(KD, "variants_real.json"), "w",
                        encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(out, open(os.path.join(DD, "variants_real.json"), "w",
                        encoding="utf-8"), ensure_ascii=False)
    print("实测异文条数:", len(picked))

    # 周曰校本全文 -> 站点数据
    chaps = json.load(open(os.path.join(KD, "zhouyuexiao_chapters.json"),
                           encoding="utf-8"))
    zy = {
        "edition": "sg_version_zhouyuexiao",
        "name": "周曰校刊本《新刊校正古本大字音釋三國志通俗演義》",
        "short": "周曰校本",
        "chars": sum(c["chars"] for c in chaps),
        "n_chapters": len(chaps),
        "source": "識典古籍（粗校）",
        "chapters": [{"i": i + 1, "title": c["title"], "vol": c["vol"],
                      "chars": c["chars"], "text": c["text"]}
                     for i, c in enumerate(chaps)],
    }
    json.dump(zy, open(os.path.join(DD, "zhouyuexiao.json"), "w",
                       encoding="utf-8"), ensure_ascii=False)
    print("周曰校本：", zy["n_chapters"], "章", zy["chars"], "字")

    # 更新 editions.json
    ed = json.load(open(os.path.join(DD, "editions.json"), encoding="utf-8"))
    for e in ed:
        if e["id"] == "sg_version_zhouyuexiao":
            e["fulltext"] = True
            e["chapters"] = f"{zy['n_chapters']} 章（識典古籍粗校全文）"
            e["chars"] = zy["chars"]
            e["feature"] = ("萬曆十九年萬卷樓刊本，演義系；240 則系統。"
                            "本站已收錄全文（識典古籍粗校），可與毛本逐句對勘。")
    json.dump(ed, open(os.path.join(DD, "editions.json"), "w",
                       encoding="utf-8"), ensure_ascii=False)
    full = [e["short"] for e in ed if e.get("fulltext")]
    print("★全文版本:", full)


if __name__ == "__main__":
    main()
