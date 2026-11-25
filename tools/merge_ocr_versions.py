# -*- coding: utf-8 -*-
"""
合并 texts/ocr/<版本>/NN_<版本>_第NN冊_繁體.md 为 docs/texts/<版本>_OCR.txt
- 繁体优先，简体不合并
- 每卷插入标题行（从文件名提取册号）
- 去重连续重复行
- 输出含版本头注释
"""
import os, re, sys, io

ROOT = r"d:\src\Romance-of-the-Three-Kingdoms"
OCR = os.path.join(ROOT, "texts", "ocr")
OUT = os.path.join(ROOT, "docs", "texts")

VERSIONS = ["李卓吾評本", "笠翁評閱本", "夏振宇刊本", "熊清波藜光堂本",
            "鄭少垣刊本", "鍾伯敬評本", "朱鼎臣刊本"]

def natural_key(s):
    m = re.search(r"(\d+)", s)
    return int(m.group(1)) if m else 0

def merge(version):
    d = os.path.join(OCR, version)
    if not os.path.isdir(d):
        print(f"[跳过] {version} 无目录"); return
    # 繁体分册：优先 "NN_..._繁體.md"；夏振宇类 "NN_..._卷之X_繁体.md"/"卷首序目_..._繁体.md"
    files = [f for f in os.listdir(d)
             if ("_繁體.md" in f or "_繁体.md" in f) and "_简体" not in f and "_簡體" not in f]
    # 卷首序目排最前，其余按数字序
    files.sort(key=lambda f: (0 if "卷首序目" in f else 1, natural_key(f)))
    if not files:
        print(f"[跳过] {version} 无繁体分册"); return
    parts = []
    parts.append(f"# 标题：{version}《三国演义》（OCR）\n")
    parts.append(f"# 版本：{version}，OCR 识别文本，繁体\n")
    parts.append(f"# 来源：Wikimedia Commons 影印本 OCR（{len(files)} 册）\n")
    parts.append(f"# 许可：公版古籍（PD-old）；OCR 文本由 RapidOCR/PaddleOCR 生成，未经全面校勘\n")
    parts.append(f"# 说明：OCR 文本，双行小字批语与正文尚未完全分离；分册合并，卷号从册号推得\n\n")
    seen = set()
    for f in files:
        m = re.match(r"(\d+)", f)
        no = int(m.group(1)) if m else 0
        if "卷首序目" in f:
            title = "=== 卷首序目 ===\n\n"
        elif "卷之" in f:
            vm = re.search(r"卷之([一二三四五六七八九十]+)", f)
            title = f"=== 卷之{vm.group(1) if vm else no} ===\n\n"
        else:
            title = f"=== 第{no:02d}冊 ===\n\n"
        full = os.path.join(d, f)
        with io.open(full, "r", encoding="utf-8") as fh:
            content = fh.read()
        # 去重连续重复行（OCR 分页粘连）
        lines = content.split("\n")
        dedup = []
        for ln in lines:
            if ln in seen:
                continue
            seen.add(ln)
            dedup.append(ln)
        merged_text = "\n".join(dedup).strip()
        parts.append(title + merged_text + "\n\n")
    out_path = os.path.join(OUT, version + "_OCR.txt")
    with io.open(out_path, "w", encoding="utf-8") as fh:
        fh.write("".join(parts))
    size = os.path.getsize(out_path) / 1024
    print(f"[OK] {version}: {len(files)} 册 -> {os.path.basename(out_path)} ({size:,.0f} KB)")

if __name__ == "__main__":
    for v in VERSIONS:
        merge(v)
    print("=== 完成 ===")
