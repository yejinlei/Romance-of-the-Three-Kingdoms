# -*- coding: utf-8 -*-
"""解析《三国演义》原文（Gutenberg 23950 繁体本），切分 120 回并转简体。"""
import re, json, os
from opencc import OpenCC

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "sanguo_raw.txt")

cc = OpenCC("t2s")  # 繁体 -> 简体

CN = "零一二三四五六七八九十"
def cn2int(s):
    s = s.replace("○", "零").replace("〇", "零").replace("O", "零").replace("0", "零")
    if not s or s == "零": return 0
    # 「一○○」「一○一」「一一○」「一一一」这类逐位书写式（每字=一位）
    if re.fullmatch(r"[一二三四五六七八九]零{2}", s) or \
       re.fullmatch(r"[一二三四五六七八九]零[\u4e00-\u9fff]", s) or \
       re.fullmatch(r"[一二三四五六七八九]{3}", s) or \
       re.fullmatch(r"[一二三四五六七八九]{2}零", s):
        digits = []
        for ch in s:
            digits.append("0" if ch == "零" else str(CN.index(ch)))
        val = int("".join(digits))
        if 100 <= val <= 120:
            return val
    # 常规中式读法：一百一十 / 一百零八 / 二十三 / 十 / 一百
    total = 0; cur = 0
    units = {"十":10, "百":100, "千":1000}
    for ch in s:
        if ch in units:
            u = units[ch]
            if cur == 0: cur = 1
            total += cur * u
            cur = 0
        elif ch == "零":
            continue
        else:
            cur = CN.index(ch) if ch in CN else 0
    return total + cur

def main():
    with open(RAW, encoding="utf-8") as f:
        text = f.read()
    # 去掉 gutenberg 头尾
    start = text.find("第一回")
    # 正文起点：找第一个回目
    lines = text.split("\n")
    # 定位所有回目标题行
    pat = re.compile(r"^[\s　]*第([一二三四五六七八九十百零○〇]+)回[：:](.+)$")
    marks = []
    for i, ln in enumerate(lines):
        m = pat.match(ln.strip())
        if m:
            marks.append((i, cn2int(m.group(1)), m.group(2).strip()))
    # 只保留正文范围内的 1..120（去重，取每回第一次出现）
    chapters = {}
    for i, no, title in marks:
        if 1 <= no <= 120 and no not in chapters:
            chapters[no] = (i, title)
    print("识别回数:", len(chapters), "缺失:", [n for n in range(1,121) if n not in chapters])
    ordered = sorted(chapters.items())
    out = []
    for k, (no, (li, title)) in enumerate(ordered):
        li_next = ordered[k+1][1][0] if k+1 < len(ordered) else len(lines)
        body = "\n".join(lines[li+1:li_next])
        # 清理
        body = body.replace("　", " ")
        body = re.sub(r"[ \t]+", "", body)
        paras = [p.strip() for p in body.split("\n") if p.strip()]
        # 去掉 gutenberg 尾部说明
        paras = [p for p in paras if not p.startswith("***") ]
        body_s = cc.convert("\n".join(paras))
        title_s = cc.convert(title.replace("，", "，"))
        plist = body_s.split("\n")
        # 截断 gutenberg 尾部说明
        cut = len(plist)
        for idx, p in enumerate(plist):
            if p.startswith("Endof") or ("Project" in p and "Gutenberg" in p) or "DONATIONS" in p or p.startswith("***"):
                cut = idx
                break
        plist = plist[:cut]
        out.append({
            "no": no,
            "title": title_s,
            "paras": plist,
            "chars": sum(len(x) for x in plist),
        })
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    with open(os.path.join(HERE, "out", "chapters.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    total = sum(c["chars"] for c in out)
    print("总字数:", total)
    for c in out[:3]:
        print(c["no"], c["title"], c["chars"], c["paras"][0][:40])

if __name__ == "__main__":
    main()
