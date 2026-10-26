#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_ontology_abox.py
======================
根据 docs/data/variants.json + jiajing_titles.json 生成 OWL 2 实例层 TTL：
- sg:VersionFamily 个体 (演义系/志传繁本/志传简本/评点系/现代整理/续书)
- sg:Edition 个体 (12个版本)
- sg:Commentary 个体 (5条评点传承)
- sg:Person (scholar) 个体 (24位学者/评点家)
- sg:VariantReading 个体 (77 条异文)
- sg:Chapter 个体 (嘉靖240则 × 毛本120回)
- sg:Work (研究著作) 个体
"""
import json, os, textwrap
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs" / "data"
ONTO_DIR = ROOT / "03_本体论规范"

V = json.load(open(DOCS / "variants.json", encoding="utf-8"))
JT = json.load(open(DOCS / "jiajing_titles.json", encoding="utf-8"))

TTL = []
TTL.append("""@prefix : <http://www.sanguo-ontology.org/ontology#> .
@prefix sg: <http://www.sanguo-ontology.org/resource/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

# ============================================================
# 三国演义本体论 ABox 实例层（多版本 / 异文 / 学者 / 评点 / 回目）
# 与 sanguo_kg_ontology.ttl (TBox) 配套使用
# 自动生成于 """ + datetime.now().strftime("%Y-%m-%d") + """
# 数据版本：12 版本 · 77 核心异文 · 24 位学者 · 5 条评点传承
#           · 嘉靖240則 ↔ 毛本120回 回目映射
# ============================================================
""")

# -------- 版本家族 --------
FAMILIES = {
    "yanyi":   ("演义系",       "24卷240则系统；以嘉靖壬午本、周曰校本、夏振宇本为代表；文人刊本。"),
    "zhizhuan_fan": ("志传繁本系统", "20卷240段；上图下文；含花关索故事；以叶逢春本、余象斗双峰堂本为代表。"),
    "zhizhuan_jian":("志传简本系统", "文字简净；以黄正甫本、刘龙田本、朱鼎臣本为代表；或为更早民间形态。"),
    "pingdian":("评点系",       "将240则合为120回、加双题回目与评点；以李卓吾评本、钟伯敬评本、毛宗岗本为代表。"),
    "modern":  ("现代整理本",   "以毛本为底本，参照明刊诸本校勘标点；人文社本、中华书局汇评本、沈伯俊校理本。"),
    "sequel":  ("续书翻案",     "后世续书与反案之作；如周大荒《反三国演义》。"),
}
TTL.append("# ---------- VersionFamily（版本家族） ----------\n")
for fid,(fname,desc) in FAMILIES.items():
    TTL.append(f'sg:family_{fid} a :VersionFamily ;')
    TTL.append(f'    rdfs:label "{fname}"@zh ;')
    TTL.append(f'    skos:note """{desc}"""@zh .\n')

# 家族→族间并列关系
TTL.append(":parallelTo a owl:SymmetricProperty, owl:ObjectProperty .\n")
TTL.append("sg:family_yanyi     :parallelTo sg:family_zhizhuan_fan .")
TTL.append("sg:family_yanyi     :parallelTo sg:family_zhizhuan_jian .\n")

# -------- 版本个体 --------
FAMILY_MAP = {
    "yanyi":"family_yanyi",
    "zhizhuan":"family_zhizhuan_fan",  # 简化处理
    "pingdian":"family_pingdian",
    "modern":"family_modern",
    "sequel":"family_sequel",
}
TTL.append("# ---------- Edition（版本个体） ----------\n")
for e in V["editions"]:
    fid = e["id"].replace("sg_version_","")
    fam = FAMILY_MAP.get(e["family"], "family_pingdian")
    # 修正叶逢春/余象斗/黄正甫 家族
    if e["id"] in ("sg_version_yefengchun","sg_version_yuxiangdou"):
        fam = "family_zhizhuan_fan"
    if e["id"] == "sg_version_huangzhengfu":
        fam = "family_zhizhuan_jian"

    TTL.append(f'sg:edition_{fid} a :Edition ;')
    TTL.append(f'    rdfs:label "{e["name"]}"@zh ;')
    TTL.append(f'    :shortName "{e["short"]}"@zh ;')
    TTL.append(f'    :belongsToFamily sg:{fam} ;')
    TTL.append(f'    :editionYear "{e["year"]}"^^xsd:gYear ;')
    TTL.append(f'    :publisher "{e["publisher"]}"@zh ;')
    TTL.append(f'    :survivalState "{e["survival"]}"@zh ;')
    TTL.append(f'    :chapterDivision "{e["chapters"]}"@zh ;')
    TTL.append(f'    dc:description """{e["feature"]}"""@zh ;')
    if e.get("fulltext"):
        TTL.append(f'    :hasFullText true^^xsd:boolean .')
    else:
        TTL.append(f'    :hasFullText false^^xsd:boolean .')
    TTL.append("")

# -------- 版本派生关系 --------
# 重新规范化 derivations
DERIVE_TYPE = {
    ("sg_version_zhouyuexiao","sg_version_jiajing"):"derivedFrom",
    ("sg_version_lizhuowu","sg_version_zhouyuexiao"):"derivedFrom",   # 合240则为120回
    ("sg_version_zhongbojing","sg_version_lizhuowu"):"derivedFrom",
    ("sg_version_maozonggang","sg_version_zhongbojing"):"derivedFrom",
    ("sg_version_liyu","sg_version_lizhuowu"):"derivedFrom",
    ("sg_version_renwen","sg_version_maozonggang"):"derivedFrom",
    ("sg_version_shenbojun","sg_version_maozonggang"):"derivedFrom",
    ("sg_version_yefengchun","sg_version_jiajing"):"parallelTo",      # 志传系并列
    ("sg_version_yuxiangdou","sg_version_yefengchun"):"derivedFrom",
    ("sg_version_huangzhengfu","sg_version_yefengchun"):"derivedFrom",
}
TTL.append("# ---------- 版本派生链 ----------\n")
def short_id(i): return "sg:edition_" + i.replace("sg_version_","")
for src,dst,note in V["derivations"]:
    rel = DERIVE_TYPE.get((src,dst),"derivedFrom")
    TTL.append(f'{short_id(src)} :{rel} {short_id(dst)} .')
TTL.append("")

# 毛本为通行本标注
TTL.append("sg:edition_maozonggang :isReceivedEdition true^^xsd:boolean .")
TTL.append("sg:edition_jiajing     :isEarliestExtant  true^^xsd:boolean .\n")

# -------- 评点传承 --------
TTL.append("# ---------- Commentary（评点传承） ----------\n")
for c in V["commentary_lineage"]:
    cid = c["id"].replace("sg_cl_","")
    base = "sg:edition_" + c["base"].replace("sg_version_","")
    TTL.append(f'sg:commentary_{cid} a :Commentary ;')
    TTL.append(f'    rdfs:label "{c["name"]}"@zh ;')
    TTL.append(f'    :commentaryAuthor "{c["author"]}"@zh ;')
    TTL.append(f'    :commentaryPeriod "{c["period"]}" ;')
    TTL.append(f'    :attachedToEdition {base} ;')
    TTL.append(f'    skos:note """{c["desc"]}"""@zh .\n')

# -------- 学者 --------
TTL.append("# ---------- Scholar（学者/评点家个体） ----------\n")
for s in V["scholars"]:
    if not isinstance(s, dict): continue
    sid = s["id"].replace("sg_scholar_","")
    TTL.append(f'sg:scholar_{sid} a :Person, :Scholar ;')
    TTL.append(f'    rdfs:label "{s["name"]}"@zh ;')
    if s.get("birth"): TTL.append(f'    :birthYear "{s["birth"]}"^^xsd:gYear ;')
    if s.get("death"): TTL.append(f'    :deathYear "{s["death"]}"^^xsd:gYear ;')
    if s.get("school"): TTL.append(f'    :academicSchool "{s["school"]}"@zh ;')
    if s.get("field"): TTL.append(f'    :researchField "{s["field"]}"@zh ;')
    if s.get("work"):
        w = s["work"].replace('"','\\"')
        TTL.append(f'    :majorWork """{w}"""@zh .')
    else:
        TTL.append("    .")
    TTL.append("")

# -------- 异文实例 --------
TTL.append("# ---------- VariantReading（异文实例） ----------\n")
VTYPE_MAP = {
    "vt_poetry":   "PoetryVariant",
    "vt_rewrite":  "StylisticRewrite",
    "vt_typo":     "OrthographicVariant",
    "vt_plot":     "PlotVariant",
    "vt_add":      "MaobenAddition",
    "vt_transfer": "PlotTransfer",
}
for v in V["variants"]:
    vid = v["id"]
    cls = VTYPE_MAP.get(v.get("type"),"StylisticRewrite")
    compared = ", ".join(short_id(f"sg_version_{e}") for e in v.get("editions_compared", ["maozonggang","jiajing"]))
    TTL.append(f'sg:{vid} a :VariantReading, :{cls} ;')
    TTL.append(f'    rdfs:label "{v["section"]}"@zh ;')
    TTL.append(f'    :inMaoChapter "{v["chapter"]}"^^xsd:integer ;')
    TTL.append(f'    :maobenText """{v["maotext"]}"""@zh ;')
    TTL.append(f'    :jiajingbenText """{v["jiajingtext"]}"""@zh ;')
    TTL.append(f'    :comparedInEditions {compared} ;')
    TTL.append(f'    :scholarlySignificance """{v["significance"]}"""@zh .\n')

# -------- 回目映射 --------
TTL.append("# ---------- Chapter（回目个体）——毛本120回 + 嘉靖本240则 ----------\n")
for m in JT["mapping"]:
    # 毛本
    TTL.append(f'sg:mao_chapter_{m["mao_chapter"]:03d} a :Chapter ;')
    TTL.append(f'    rdfs:label "第{m["mao_chapter"]}回 {m["mao_title"]}"@zh ;')
    TTL.append(f'    :chapterNumber "{m["mao_chapter"]}"^^xsd:integer ;')
    TTL.append(f'    :belongsToEdition sg:edition_maozonggang ;')
    TTL.append(f'    :correspondsToSection sg:jia_section_{m["jiajing_sec1_no"]:03d}, sg:jia_section_{m["jiajing_sec2_no"]:03d} .\n')
    # 嘉靖本第一则
    TTL.append(f'sg:jia_section_{m["jiajing_sec1_no"]:03d} a :Chapter ;')
    TTL.append(f'    rdfs:label "第{m["jiajing_sec1_no"]}則 {m["jiajing_sec1_title"]}"@zh ;')
    TTL.append(f'    :chapterNumber "{m["jiajing_sec1_no"]}"^^xsd:integer ;')
    TTL.append(f'    :belongsToEdition sg:edition_jiajing ;')
    TTL.append(f'    :correspondsToChapter sg:mao_chapter_{m["mao_chapter"]:03d} .\n')
    # 嘉靖本第二则
    TTL.append(f'sg:jia_section_{m["jiajing_sec2_no"]:03d} a :Chapter ;')
    TTL.append(f'    rdfs:label "第{m["jiajing_sec2_no"]}則 {m["jiajing_sec2_title"]}"@zh ;')
    TTL.append(f'    :chapterNumber "{m["jiajing_sec2_no"]}"^^xsd:integer ;')
    TTL.append(f'    :belongsToEdition sg:edition_jiajing ;')
    TTL.append(f'    :correspondsToChapter sg:mao_chapter_{m["mao_chapter"]:03d} .\n')

# -------- 周曰校本章节个体 + 实测异文 --------
ZY_CH = json.load(open(ROOT / "04_knowledge_data" / "zhouyuexiao_chapters.json",
                       encoding="utf-8"))
TTL.append("# ---------- 周曰校本 Chapter 个体（本站已收全文，识典古籍粗校） ----------\n")
for i, c in enumerate(ZY_CH, 1):
    title = c.get("title") or ""
    TTL.append(f'sg:zhou_chapter_{i:03d} a :Chapter ;')
    TTL.append(f'    rdfs:label "第{i}章 {title}"@zh ;')
    TTL.append(f'    :chapterNumber "{i}"^^xsd:integer ;')
    TTL.append(f'    :belongsToEdition sg:edition_zhouyuexiao ;')
    TTL.append(f'    :wordCount "{c["chars"]}"^^xsd:integer .\n')

VR = json.load(open(DOCS / "variants_real.json", encoding="utf-8"))
TTL.append("# ---------- 实测异文 + 邊：毛宗崗本 × 周曰校本 全文自動對勘 ----------\n")
for it in VR["items"]:
    TTL.append(f'sg:var_real_{it["no"]:03d} a :VariantReading, :TextualVariant ;')
    TTL.append(f'    rdfs:label "毛第{it["mao_ch"]}回／周第{it["zhou_ch"]}章"@zh ;')
    TTL.append(f'    :inMaoChapter "{it["mao_ch"]}"^^xsd:integer ;')
    TTL.append(f'    :inZhouChapter "{it["zhou_ch"]}"^^xsd:integer ;')
    TTL.append(f'    :maobenText """{it["mao"]}"""@zh ;')
    TTL.append(f'    :zhoubenText """{it["zhou"]}"""@zh ;')
    TTL.append(f'    :textSimilarity "{it["sim"]}"^^xsd:decimal ;')
    TTL.append('    :comparedInEditions sg:edition_maozonggang, sg:edition_zhouyuexiao ;')
    TTL.append('    :readingType "TextualVariant" .\n')

# -------- 本体论元信息 --------
TTL.append("""
# ---------- 本体论元信息 ----------
sg:ontology_multiversion a owl:Ontology ;
    dc:title "三國演義多版本本體論 ABox"@zh ;
    dc:description "本文件為 sanguo_kg_ontology.ttl 之實例層，包含12版本、77則核心異文、24位學者、5條評點傳承、360個回目/則個體及其對映關係。"@zh ;
    dc:creator "Sanguo-Ontology Project" ;
    dc:created \"""" + datetime.now().strftime("%Y-%m-%d") + """\"^^xsd:date ;
    owl:versionInfo "1.0.0-multiversion" ;
    owl:imports <http://www.sanguo-ontology.org/ontology> .
""")

out_ttl = "\n".join(TTL)
out_path = ONTO_DIR / "sanguo_kg_multiversion_abox.ttl"
out_path.write_text(out_ttl, encoding="utf-8")

# 统计
n_family = len(FAMILIES)
n_editions = len(V["editions"])
n_commentary = len(V["commentary_lineage"])
n_scholars = sum(1 for s in V["scholars"] if isinstance(s,dict))
n_variants = len(V["variants"])
n_chapters_mao = len(JT["mapping"])
n_sections_jia = len(JT["mapping"]) * 2
print(f"[OK] wrote {out_path}")
print(f"  families: {n_family}")
print(f"  editions: {n_editions}")
print(f"  commentaries: {n_commentary}")
print(f"  scholars: {n_scholars}")
print(f"  variants: {n_variants}")
print(f"  mao chapters: {n_chapters_mao}")
print(f"  jiajing sections: {n_sections_jia}")
print(f"  total TTL bytes: {len(out_ttl)}")
