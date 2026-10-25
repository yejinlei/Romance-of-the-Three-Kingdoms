"""抓取识典古籍周曰校本，通过 browser eval 直接抓 .chapter-reader 的 innerText"""
import subprocess, json, time, os, re

OUT = "/home/user/workspace/5806794539557799814/sanguo/raw/zhouyuexiao"
os.makedirs(OUT, exist_ok=True)

# 卷 ID 列表（从目录页提取）
VOLUMES = [
    ("preface", "全像三國志傳演義", "/zh/book/NA11011/chapter/1k3o711mconbe"),
    ("yin", "全像三國志通俗演義引", "/zh/book/NA11011/chapter/1k3o711ya29sr"),
    ("zongliao", "三國志宗寮", "/zh/book/NA11011/chapter/1k3o712mu6wit"),
    ("juan01", "新刊校正古本大字音釋三國志通俗演義卷之一", "/zh/book/NA11011/chapter/1k3o717ec3xgm"),
    ("juan02", "新刊校正古本出像大字音釋三國志傳通俗演義卷之二", "/zh/book/NA11011/chapter/1k3o71cm0mcd6"),
    ("juan03", "新刊校正古本出像大字音釋三國志傳通俗演義卷之三", "/zh/book/NA11011/chapter/1k3o71heo1kwr"),
    ("juan04", "新刊校正出像古本大字音釋三國志傳通俗演義卷之四", "/zh/book/NA11011/chapter/1k3o71m8i0lra"),
    ("juan05", "新刊校正出像古本大字音釋三國志傳通俗演義卷之五", "/zh/book/NA11011/chapter/1k3o71rg2df76"),
    ("juan06", "新刊校正出像古本大字音釋三國志傳通俗演義卷之六", "/zh/book/NA11011/chapter/1k3o71wrg0wez"),
    ("juan07", "新刊校正古本出像大字音釋三國志傳通俗演義卷之七", "/zh/book/NA11011/chapter/1k3o721q9rwui"),
    ("juan08", "新刊校正古本全像大字音釋三國志傳通俗演義卷之八", "/zh/book/NA11011/chapter/1k3o72754ej2i"),
    ("juan09", "新刊校正古本出像大字音釋三國志傳通俗演義卷之九", "/zh/book/NA11011/chapter/1k3o72ebzwefv"),
    ("juan10", "新刊校正古本出像大字音釋三國志傳通俗演義卷之十", "/zh/book/NA11011/chapter/1k3o72knq5hyq"),
]

# 我们已经在卷一页面，前面那次 eval 也返回了卷一全文。先把已知卷一保存。
# 这里不做自动控制浏览器，而是让父脚本（或多次 browser 调用）去点。
# 但为了批处理更快，我改思路：直接用 fetch 在浏览器里跳转到每卷页面并取正文。

print("Volume list prepared:", len(VOLUMES), "chapters")
for v in VOLUMES:
    print(v[0], v[2])
