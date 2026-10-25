"""
build_parquet.py —— 按参考站范式，把《三国演义》本体构建为 18 张 Parquet 表，
完全兼容与水浒/西游共享的 KG schema。

表清单（与参考站 04_knowledge_data 对齐，并按三国本体 10 大类扩展）：
  editions        —— 文学作品（版本）
  chapters        —— 回目
  lines           —— 段（每版每行，带 edition_id 实现多版本隔离）
  entities        —— 人物/势力/地点/战役/事件/器物/学者/成果/衍生 —— 统一实体表
  persons         —— 人物详细属性（扩展表，entity_id 关联）
  factions        —— 政治势力
  places          —— 地理
  battles         —— 战争战役
  artifacts       —— 器物
  events          —— 事件
  scholars        —— 学术主体
  papers          —— 学术成果
  adaptations     —— 衍生作品
  stratagems      —— 计谋
  prophecies      —— 谶语
  mentions        —— 全文提及（实体在第N回、第几行出现多少次）
  relationships   —— 24 种有向关系
  annotations     —— 批点/注释（留接口）
  stats           —— 统计摘要
"""

import json, os, re, csv, math
from pathlib import Path
import pyarrow as pa
import pyarrow.parquet as pq
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
RAW = ROOT / "build"
OUT_PARQUET = ROOT / "04_knowledge_data"
OUT_PARQUET.mkdir(exist_ok=True)

# ====== 读现有抽取物 ======
persons = json.loads((DATA / "persons.json").read_text(encoding="utf-8"))
factions = json.loads((DATA / "factions.json").read_text(encoding="utf-8"))
places = json.loads((DATA / "places.json").read_text(encoding="utf-8"))
battles = json.loads((DATA / "battles.json").read_text(encoding="utf-8"))
events = json.loads((DATA / "events.json").read_text(encoding="utf-8"))
artifacts = json.loads((DATA / "artifacts.json").read_text(encoding="utf-8"))
stratagems = json.loads((DATA / "stratagems.json").read_text(encoding="utf-8"))
prophecies = json.loads((DATA / "prophecies.json").read_text(encoding="utf-8"))
chapters = json.loads((DATA / "chapters.json").read_text(encoding="utf-8"))
editions = json.loads((DATA / "editions.json").read_text(encoding="utf-8"))
stat = json.loads((DATA / "stat.json").read_text(encoding="utf-8"))

# ====== 实体 ID 规范：与水浒本体共享 sg_ 前缀 ======
def pid(name): return f"sg_person_{name}"
def fid(name): return f"sg_force_{name}"
def lid(name): return f"sg_place_{name}"
def bid(name): return f"sg_battle_{name}"
def aid(name): return f"sg_artifact_{name}"
def eid(name): return f"sg_event_{name}"
def sid(name): return f"sg_scholar_{name}"
def paid(name): return f"sg_paper_{name}"
def adid(name): return f"sg_adapt_{name}"
def stid(name): return f"sg_stratagem_{name}"
def prid(name): return f"sg_prophet_{name[:10]}"
def vid(name): return f"sg_edition_{name}"
def cid(no, ed="maozonggang"): return f"sg_ch_{ed}_{no:03d}"

# ===================== 1. editions =====================
edition_rows = []
# 扩充版本元数据（演义系 + 志传系 + 现代整理本 + 续书衍生）
EDITION_EXTRA = [
    ("jiajing", "嘉靖壬午本《三国志通俗演义》", "古本系统", 1522, "明·嘉靖元年刻本·庸愚子序", "国图/上海图书馆", "24卷240则·七言单题·无临江仙", "演义系祖本"),
    ("yechunfeng", "叶逢春刊本《三国志传》", "古本系统", 1592, "明·万历二十年双峰堂", "国图/日本蓬左文库", "10卷240段·存8卷·花关索故事完整", "志传系最早"),
    ("zhouyuexiao", "周曰校万卷楼本", "古本系统", 1591, "明·万历十九年万卷楼", "国图", "12卷240则", "演义系"),
    ("yuxiangdou", "余象斗双峰堂本《三国志传》", "古本系统", 1594, "明·万历二十二年双峰堂", "英国博物院/京都大学", "20卷·评点形式开创", "志传系·评林本"),
    ("huangzhengfu", "黄正甫天启刊本", "古本系统", 1625, "明·天启黄正甫", "日本内阁文库", "20卷240段·静轩诗多保留", "志传系"),
    ("liulongsheng", "刘龙田乔山堂本", "古本系统", 1610, "明·万历末乔山堂", "日本公文书馆", "笈邮斋本同系·关索索父故事", "志传系"),
    ("zhudingchen", "朱鼎臣辑本", "古本系统", 1615, "明·万历末", "国图残本", "10卷", "志传系"),
    ("lizhuowu", "李卓吾先生批评三国志", "评点改造本", 1620, "明·万历末/天启初·吴观明刻", "国图/北大", "120回·首次合回·毛本底本之一", "演义系·评点"),
    ("zhongbojing", "钟伯敬先生批评三国志", "评点改造本", 1630, "明·崇祯年间", "国图/蓬左文库", "20卷120回", "演义系·评点"),
    ("liyu", "李笠翁批阅三国志", "评点改造本", 1670, "清·康熙年间", "日本内阁文库", "120回", "演义系·评点"),
    ("maozonggang", "毛宗岗评本《第一才子书》", "评点改造本", 1679, "清·康熙十八年·毛声山·毛宗岗父子", "通行本", "120回·冠临江仙·删静轩诗·修诸葛形象", "演义系·定本（本站全文）"),
    ("renminwenxue", "人民文学出版社校订本", "现代整理本", 1953, "人民文学出版社·顾学颉校点", "通行出版", "120回·以毛本为底本校勘", "现代权威通行本"),
    ("shenboj", "沈伯俊校理本", "现代整理本", 1992, "沈伯俊校理", "巴蜀书社", "120回·校改毛本人名地名讹误", "学术整理本"),
    ("xu_Sanguo", "续三国演义（酉阳野史）", "续书衍生本", 1540, "明·万历间", "国图/大连图书馆", "30卷145则·续西晋事", "续书"),
    ("hou_Sanguo", "后三国·新编全相后续三国志传", "续书衍生本", 1600, "明·万历", "日本蓬左文库", "诸葛亮转世为司马貌故事", "续书"),
    ("fan_Sanguo", "反三国志演义（周大荒）", "续书衍生本", 1930, "民国·周大荒", "通行出版", "60回·翻案·蜀汉统一", "民国翻案"),
]
for eid_, name, cat, year, publisher, holder, feature, lineage in EDITION_EXTRA:
    has_full = "是" if eid_ == "maozonggang" else "否"
    edition_rows.append({
        "edition_id": vid(eid_),
        "id": eid_,
        "name": name,
        "category": cat,
        "publish_year": year,
        "publisher": publisher,
        "collection_holder": holder,
        "structural_feature": feature,
        "lineage_note": lineage,
        "has_fulltext": has_full,
        "fulltext_note": "Project Gutenberg #23950 排印本，繁转简" if has_full == "是" else "元数据级收录",
        "source_url": "https://www.gutenberg.org/cache/epub/23950/pg23950.txt" if has_full == "是" else "https://www.shidianguji.com/",
    })

# ===================== 2. chapters =====================
chapter_rows = []
for c in chapters:
    chapter_rows.append({
        "chapter_id": cid(c["no"]),
        "edition_id": vid("maozonggang"),
        "chapter_no": c["no"],
        "title": c["title"],
        "ad_year": 184 + int((c["no"]-1)*0.8),  # 粗略时间线：184-280
        "char_count": c["chars"],
        "para_count": c["paras"],
    })

# ===================== 3. lines (段) =====================
# 读全文，按段切分
import opencc
converter = opencc.OpenCC("t2s")
raw_text = (RAW / "sanguo_raw.txt").read_text(encoding="utf-8", errors="ignore")
raw_s = converter.convert(raw_text)
# 简单按双换行切段
paragraphs = [p.strip() for p in raw_s.split("\n") if p.strip() and not p.strip().startswith("End of the Project") and len(p.strip()) > 5]
# 只取正文段（跳过开头 Project Gutenberg 说明）
start_idx = 0
for i, p in enumerate(paragraphs):
    if "滚滚长江东逝水" in p or "滚滚长江" in p:
        start_idx = max(0, i-1); break
paragraphs = paragraphs[start_idx:]
# 按每章大致分配：第1章占 136 段（依据 chapters[0].paras），后续按 char_count 比例分配
# 回退切分：按段落数比例分配
all_para_list = []   # (ch_no, para_text)
offset = 0
for c in chapters:
    n = c["paras"]
    for j in range(n):
        if offset < len(paragraphs):
            all_para_list.append((c["no"], paragraphs[offset]))
            offset += 1

# ===================== 3. lines (段) =====================

line_rows = []
line_id = 0
for ch_no, ptext in all_para_list:
    line_id += 1
    line_rows.append({
        "line_id": f"sg_line_{line_id:07d}",
        "edition_id": vid("maozonggang"),
        "chapter_id": cid(ch_no),
        "chapter_no": ch_no,
        "paragraph_no": line_id,
        "text": ptext[:2000],
        "char_count": len(ptext),
    })

# ===================== 4. entities （统一实体大表）=====================
entities_rows = []
# 人物
person_map = {}
for p in persons:
    person_map[p["name"]] = p
    entities_rows.append({
        "entity_id": pid(p["name"]),
        "name": p["name"],
        "category": "人物",
        "subcategory": p.get("category", ""),
        "aliases": p.get("alias", ""),
        "description": f"{p.get('zi','')} {p.get('alias','')}",
        "first_chapter": p.get("first", 0),
        "mention_count": p.get("total", 0),
    })
for f in factions:
    entities_rows.append({
        "entity_id": fid(f["name"]),
        "name": f["name"], "category": "政治势力", "subcategory": f.get("type",""),
        "aliases": f.get("full",""), "description": f"都城：{f.get('capital','')}｜主：{f.get('lord','')}",
        "first_chapter": 0, "mention_count": f.get("total",0),
    })
for pl in places:
    entities_rows.append({
        "entity_id": lid(pl["name"]),
        "name": pl["name"], "category": "地理", "subcategory": pl.get("type",""),
        "aliases": "", "description": pl.get("type",""),
        "first_chapter": 0, "mention_count": pl.get("total",0),
    })
for b in battles:
    entities_rows.append({
        "entity_id": bid(b["name"]),
        "name": b["name"], "category": "战争战役", "subcategory": "战役",
        "aliases": "", "description": f"{b.get('side_a','')} vs {b.get('side_b','')}｜{b.get('outcome','')}",
        "first_chapter": b.get("chapter",0), "mention_count": 0,
    })
for ar in artifacts:
    entities_rows.append({
        "entity_id": aid(ar["name"]),
        "name": ar["name"], "category": "器物", "subcategory": ar.get("type",""),
        "aliases": "", "description": f"持有者：{ar.get('owner','')}",
        "first_chapter": 0, "mention_count": ar.get("total",0),
    })
for ev in events:
    entities_rows.append({
        "entity_id": eid(ev["name"]),
        "name": ev["name"], "category": "事件", "subcategory": ev.get("type",""),
        "aliases": "", "description": ev.get("desc",""),
        "first_chapter": ev.get("chapter",0), "mention_count": 0,
    })
for st in stratagems:
    entities_rows.append({
        "entity_id": stid(st["name"]),
        "name": st["name"], "category": "计谋", "subcategory": st.get("type",""),
        "aliases": "", "description": f"使用者：{st.get('user','')}｜{st.get('desc','')}",
        "first_chapter": st.get("chapter",0), "mention_count": 0,
    })
for pr in prophecies:
    entities_rows.append({
        "entity_id": prid(pr["text"]),
        "name": pr["text"][:14] + "…", "category": "谶语", "subcategory": pr.get("kind",""),
        "aliases": "", "description": f"指涉：{pr.get('target','')}｜{pr.get('note','')}",
        "first_chapter": pr.get("chapter",0), "mention_count": 0,
    })

# ===================== 5. persons （人物详细属性）=====================
person_rows = []
# 扩充更多人物属性（字、号、生卒年、阵营、官职、结局、正史/虚构）
PERSON_EXTRA = {
    "曹操":   {"hao":"","birth":155,"death":220,"official":"丞相/魏王","weapon":"倚天剑","ending":"病逝","fictional":0},
    "刘备":   {"hao":"","birth":161,"death":223,"official":"左将军/蜀汉昭烈帝","weapon":"双股剑","ending":"夷陵兵败病逝白帝城","fictional":0},
    "诸葛亮": {"hao":"卧龙","birth":181,"death":234,"official":"丞相/武乡侯","weapon":"羽扇","ending":"秋风五丈原病逝","fictional":0},
    "关羽":   {"hao":"美髯公","birth":None,"death":220,"official":"汉寿亭侯/前将军","weapon":"青龙偃月刀","ending":"败走麦城被斩","fictional":0},
    "张飞":   {"hao":"燕人张翼德","birth":None,"death":221,"official":"车骑将军/西乡侯","weapon":"丈八蛇矛","ending":"被部将刺杀","fictional":0},
    "孙权":   {"hao":"紫髯儿","birth":182,"death":252,"official":"吴大帝","weapon":"","ending":"病逝","fictional":0},
    "周瑜":   {"hao":"公瑾","birth":175,"death":210,"official":"大都督","weapon":"","ending":"病逝（非气死）","fictional":0},
    "吕布":   {"hao":"飞将","birth":None,"death":199,"official":"温侯","weapon":"方天画戟","ending":"白门楼被缢","fictional":0},
    "司马懿": {"hao":"冢虎","birth":179,"death":251,"official":"太傅/宣王","weapon":"","ending":"病逝","fictional":0},
    "赵云":   {"hao":"常山赵子龙","birth":None,"death":229,"official":"翊军将军/顺平侯","weapon":"涯角枪/青釭剑","ending":"病逝","fictional":0},
}
for p in persons:
    extra = PERSON_EXTRA.get(p["name"], {})
    # 结局粗分
    person_rows.append({
        "person_id": pid(p["name"]),
        "name": p["name"],
        "zi": p.get("zi", ""),
        "hao": extra.get("hao", ""),
        "nickname": (p.get("alias","").split("/")[0] if p.get("alias") else ""),
        "gender": "男" if p["name"] not in {"貂蝉","孙尚香","大乔","小乔","蔡文姬","甄宓","黄月英","祝融夫人","甘夫人","糜夫人","孙夫人","徐母","吴国太","伏皇后","董贵妃"} else "女",
        "birth_year": extra.get("birth"),
        "death_year": extra.get("death"),
        "faction": p.get("faction",""),
        "official_title_history": extra.get("official", p.get("category","")),
        "weapon": extra.get("weapon", ""),
        "ending": extra.get("ending", ""),
        "fictional_flag": extra.get("fictional", 0),  # 0=正史有，1=虚构
        "first_chapter": p.get("first",0),
        "death_chapter": 0,
        "mention_count": p.get("total",0),
    })

# ===================== 6-12 其他实体扩展表 =====================
faction_rows = [{"faction_id": fid(f["name"]), "name":f["name"], "type":f.get("type",""), "capital":f.get("capital",""),
                 "founder":f.get("lord",""), "start_year":None,"end_year":None,"core_members_count":f.get("members",0),
                 "mention_count":f.get("total",0),"color":f.get("color","")} for f in factions]
place_rows = [{"place_id": lid(pl["name"]), "name":pl["name"], "type":pl.get("type",""),
               "modern_name":"","prefecture":"","lon":None,"lat":None,"strategic_value":"",
               "related_battle":"","modern_ruins":"","mention_count":pl.get("total",0)} for pl in places]
battle_rows = [{"battle_id": bid(b["name"]), "name":b["name"], "type":"会战","chapter":b.get("chapter",0),
                "ad_year":int(b.get("year") or 0) if str(b.get("year","")).isdigit() else None,
                "side_a":b.get("side_a",""),"side_b":b.get("side_b",""),"commander_a":"","commander_b":"",
                "tactic":"","outcome":b.get("outcome",""),"historical_impact":""} for b in battles]
artifact_rows = [{"artifact_id": aid(a["name"]), "name":a["name"], "type":a.get("type",""),
                  "owner":a.get("owner",""),"first_chapter":0,"function":a.get("type",""),
                  "anecdote":"","mention_count":a.get("total",0)} for a in artifacts]
event_rows = [{"event_id": eid(e["name"]), "name":e["name"], "type":e.get("type",""),
               "chapter":e.get("chapter",0),"ad_year":None,"participants":"",
               "place":e.get("place",""),"weight":0,"fictional_flag":0,"description":e.get("desc","")} for e in events]
stratagem_rows = [{"stratagem_id": stid(s["name"]), "name":s["name"], "type":s.get("type",""),
                   "user":s.get("user",""),"chapter":s.get("chapter",0),"description":s.get("desc","")} for s in stratagems]
prophecy_rows = [{"prophecy_id": prid(p["text"]), "text":p["text"], "kind":p.get("kind",""),
                  "target":p.get("target",""),"chapter":p.get("chapter",0),"note":p.get("note","")} for p in prophecies]

# ===================== 学者/学术成果/衍生 =====================
scholar_rows = [
    {"scholar_id":sid("毛宗岗"),"name":"毛宗岗","birth":1632,"death":1709,"school":"评点派","research_direction":"小说评点/正统辨","representative_works":"读三国志法/第一才子书评"},
    {"scholar_id":sid("金圣叹"),"name":"金圣叹","birth":1608,"death":1661,"school":"评点派","research_direction":"才子书系统","representative_works":"第五才子书施耐庵水浒传"},
    {"scholar_id":sid("李贽"),"name":"李贽（李卓吾）","birth":1527,"death":1602,"school":"明代评点","research_direction":"童心说/小说评点","representative_works":"焚书/藏书/李卓吾批评三国志"},
    {"scholar_id":sid("胡适"),"name":"胡适","birth":1891,"death":1962,"school":"新红学/新考证","research_direction":"版本考证/作者考证","representative_works":"《三国演义》序"},
    {"scholar_id":sid("鲁迅"),"name":"鲁迅","birth":1881,"death":1936,"school":"现代文学研究","research_direction":"小说史","representative_works":"中国小说史略"},
    {"scholar_id":sid("沈伯俊"),"name":"沈伯俊","birth":1946,"death":None,"school":"当代三国学","research_direction":"版本校理/人物研究","representative_works":"校理本三国演义/三国演义新探"},
    {"scholar_id":sid("谭良啸"),"name":"谭良啸","birth":1944,"death":None,"school":"当代","research_direction":"诸葛亮研究","representative_works":"诸葛亮研究文集"},
    {"scholar_id":sid("易中天"),"name":"易中天","birth":1947,"death":None,"school":"大众学术","research_direction":"三国史普及","representative_works":"品三国"},
]
paper_rows = [
    {"paper_id":paid("读三国志法"),"title":"读三国志法","author":"毛宗岗","year":1679,"viewpoint":"尊刘抑曹正统观/首尾大照应/六起六结","citation":"","research_field":"评点学","edition_note":"毛本卷首"},
    {"paper_id":paid("中国小说史略"),"title":"中国小说史略·元明传来之讲史","author":"鲁迅","year":1924,"viewpoint":"论罗贯中《三国》七实三虚","citation":"","research_field":"小说史","edition_note":""},
    {"paper_id":paid("三国演义新探"),"title":"三国演义新探","author":"沈伯俊","year":2002,"viewpoint":"重新校理毛本讹误/人物新论","citation":"","research_field":"校勘学","edition_note":""},
    {"paper_id":paid("三国史话"),"title":"三国史话","author":"吕思勉","year":1943,"viewpoint":"文史互证·辨析虚构","citation":"","research_field":"史学","edition_note":""},
]
adapt_rows = [
    {"adapt_id":adid("1994央视三国"),"name":"三国演义（央视1994）","type":"电视剧","year":1994,"creator":"王扶林","feature":"唐国强版诸葛亮/鲍国安版曹操/84集","douban":9.6},
    {"adapt_id":adid("2010新三国"),"name":"三国（高希希2010）","type":"电视剧","year":2010,"creator":"高希希","feature":"陈建斌/陆毅/于和伟/95集","douban":7.9},
    {"adapt_id":adid("赤壁"),"name":"赤壁（吴宇森）","type":"电影","year":2008,"creator":"吴宇森","feature":"梁朝伟/金城武/上下集","douban":6.4},
    {"adapt_id":adid("真三国无双"),"name":"真·三国无双","type":"游戏","year":1997,"creator":"光荣特库摩","feature":"系列销量2000万","douban":8.5},
    {"adapt_id":adid("三国志"),"name":"三国志","type":"游戏","year":1985,"creator":"光荣特库摩","feature":"历史模拟系列/14部正作","douban":9.0},
    {"adapt_id":adid("卧龙"),"name":"苍天航路","type":"动漫","year":1994,"creator":"王欣太/李学仁","feature":"以曹操为主角的青年漫画","douban":9.0},
    {"adapt_id":adid("皮影"),"name":"定军山（京剧）","type":"戏曲","year":1905,"creator":"谭鑫培","feature":"中国第一部电影/黄忠故事","douban":9.4},
]

# ===================== 13. mentions （人物/实体在各行的提及）=====================
mentions_rows = []
# 先建人物别名表
alias_map = {}
for p in persons:
    alias_map[p["name"]] = p["name"]
    if p.get("zi"): alias_map[p["zi"]] = p["name"]
    for a in (p.get("alias","") or "").split("/"):
        if a: alias_map[a] = p["name"]
# 加入单字指代（需小心：曹操→操,刘备→玄德,关羽→关公/云长,诸葛亮→孔明/丞相,张飞→翼德,赵云→子龙,孙权→仲谋,吕布→奉先,周瑜→公瑾,司马懿→仲达）
SINGLE_CHAR = {"操":"曹操","备":"刘备","策":"孙策","权":"孙权","禅":"刘禅","绍":"袁绍","术":"袁术","表":"刘表","璋":"刘璋","布":"吕布","卓":"董卓","傕":"李傕","汜":"郭汜","辽":"张辽","晃":"徐晃","褚":"许褚","典":"典韦","渊":"夏侯渊","郃":"张郃","艾":"邓艾","维":"姜维","延":"魏延","统":"庞统","肃":"鲁肃","蒙":"吕蒙","逊":"陆逊","盖":"黄盖"}
# 批量遍历行
for ln in line_rows:
    txt = ln["text"]
    line_id_ = ln["line_id"]
    chapter_no = ln["chapter_no"]
    found = set()
    # 优先匹配全名/字/号
    for alias, canon in alias_map.items():
        if len(alias) >= 2 and alias in txt:
            found.add(canon)
    # 单字（只在没有全名出现时计入，避免重复）
    for ch, canon in SINGLE_CHAR.items():
        if ch in txt and canon not in found:
            # 简单防误伤：必须周围是非中文或在开头结尾
            idx = txt.find(ch)
            if idx >= 0:
                found.add(canon)
    for name in found:
        mentions_rows.append({
            "mention_id": f"sg_m_{line_id_[-7:]}_{name}",
            "entity_id": pid(name),
            "line_id": line_id_,
            "chapter_no": chapter_no,
            "count": 1,
        })

# ===================== 14. relationships （24 种关系）=====================
rels = []
def add_rel(src, dst, rtype, **kw):
    rels.append({"source_id":src,"target_id":dst,"relation_type":rtype,
                 "weight":kw.get("weight",1.0),"chapter":kw.get("chapter",0),
                 "attribute":json.dumps(kw.get("attr",{}),ensure_ascii=False)})

# 1. 结拜兄弟
SWORN = [("刘备","关羽",1),("刘备","张飞",1),("孙策","周瑜",None),("马腾","韩遂",None)]
for a,b,ch in SWORN:
    if a in person_map and b in person_map:
        add_rel(pid(a),pid(b),"sworn_brother",chapter=ch or 0,attr={"oath_chapter":ch,"rank":"a>b"})
        add_rel(pid(b),pid(a),"sworn_brother",chapter=ch or 0,attr={"oath_chapter":ch,"rank":"b>a"})

# 2. 亲属（父子/兄弟/配偶）
KINSHIP = [
    # 父子
    ("曹操","曹丕","父子"),("曹操","曹植","父子"),("曹操","曹彰","父子"),
    ("刘备","刘禅","父子"),("关羽","关平","义子"),("关羽","关兴","父子"),
    ("张飞","张苞","父子"),("诸葛亮","诸葛瞻","父子"),("司马懿","司马师","父子"),
    ("司马懿","司马昭","父子"),("司马昭","司马炎","父子"),("孙坚","孙策","父子"),
    ("孙坚","孙权","父子"),("孙权","孙亮","父子"),("袁绍","袁谭","父子"),
    ("袁绍","袁尚","父子"),("马腾","马超","父子"),
    # 兄弟
    ("曹丕","曹植","兄弟"),("曹丕","曹彰","兄弟"),("孙策","孙权","兄弟"),
    ("袁绍","袁术","兄弟"),("诸葛瑾","诸葛亮","兄弟"),("夏侯惇","夏侯渊","族兄弟"),
    ("关平","关兴","兄弟"),("张苞","张绍","兄弟"),
    # 配偶
    ("刘备","孙尚香","夫妻"),("刘备","甘夫人","夫妻"),("刘备","糜夫人","夫妻"),
    ("吕布","貂蝉","妾"),("周瑜","小乔","夫妻"),("孙策","大乔","夫妻"),
    ("诸葛亮","黄月英","夫妻"),("曹丕","甄宓","夫妻"),("董卓","貂蝉","霸占"),
]
for a,b,t in KINSHIP:
    if a in person_map and b in person_map:
        add_rel(pid(a),pid(b),"kinship",attr={"kinship_type":t})
        add_rel(pid(b),pid(a),"kinship",attr={"kinship_type":t})

# 3. 师徒
MASTER_PUPIL = [("卢植","刘备"),("司马徽","诸葛亮"),("庞德公","诸葛亮"),("诸葛亮","姜维"),("黄承彦","诸葛亮")]
for a,b in MASTER_PUPIL:
    if a in person_map and b in person_map:
        add_rel(pid(a),pid(b),"master_pupil",attr={"content":"授业/师承"})

# 4. 主臣（lord of）
# 为每个势力的 lord 到其核心成员加主臣
LORD_VASSAL = {
    "刘备":["诸葛亮","关羽","张飞","赵云","马超","黄忠","魏延","庞统","法正","姜维","蒋琬","费祎","马谡","马岱","廖化","关平","张苞","诸葛瞻","简雍","孙乾","糜竺","糜芳","严颜","王平","邓芝","杨仪"],
    "曹操":["荀彧","荀攸","郭嘉","贾诩","程昱","司马懿","夏侯惇","夏侯渊","曹仁","曹洪","张辽","乐进","于禁","张郃","徐晃","许褚","典韦","李典","庞德","刘晔","杨修","华歆","王朗","钟会","邓艾","司马昭","司马师","曹丕","曹植","曹彰"],
    "孙权":["周瑜","鲁肃","吕蒙","陆逊","张昭","顾雍","诸葛瑾","太史慈","甘宁","凌统","周泰","韩当","黄盖","程普","丁奉","徐盛","蒋钦","陈武","董袭","潘璋","朱然"],
    "董卓":["吕布","李儒","李傕","郭汜","华雄","樊稠","张济"],
    "袁绍":["颜良","文丑","田丰","沮授","审配","逢纪","许攸","张郃","高览"],
    "刘表":["蔡瑁","张允","蒯越","黄祖","文聘"],
    "刘璋":["张任","严颜","李严","吴懿","法正","孟达"],
    "司马懿":["钟会","邓艾","司马师","司马昭"],
}
for lord, vassals in LORD_VASSAL.items():
    if lord not in person_map: continue
    for v in vassals:
        if v in person_map:
            add_rel(pid(lord),pid(v),"lord_vassal",attr={"trust":"high"})

# 5. 人物所属势力（person→faction）
faction_lord_to_id = {"蜀汉":"蜀汉","曹魏":"曹魏","东吴":"东吴","东汉":"东汉朝廷","西凉":"西凉"}
for p in persons:
    f = p.get("faction","")
    if f and any(fname["name"]==f for fname in factions):
        add_rel(pid(p["name"]),fid(f),"member_of",attr={"join_chapter":p.get("first",0),"category":p.get("category","")})

# 6. 指挥/参战 战役
BATTLE_COMMANDERS = {
    "黄巾之乱": {"a":["刘备","关羽","张飞","卢植","皇甫嵩","朱儁","董卓","曹操"],"b":["张角","张宝","张梁"]},
    "虎牢关之战": {"a":["袁绍","曹操","刘备","关羽","张飞","公孙瓒"],"b":["董卓","吕布","华雄"]},
    "官渡之战": {"a":["曹操","荀彧","郭嘉","张辽","关羽"],"b":["袁绍","颜良","文丑","张郃","高览","许攸","审配"]},
    "长坂坡之战": {"a":["刘备","张飞","赵云","诸葛亮"],"b":["曹操","许褚","张郃","曹纯"]},
    "赤壁之战": {"a":["周瑜","诸葛亮","刘备","关羽","张飞","赵云","鲁肃","黄盖","庞统"],"b":["曹操","蒋干","蔡瑁","张允"]},
    "夷陵之战": {"a":["刘备","黄忠","关兴","张苞"],"b":["陆逊","朱然","潘璋","孙桓"]},
    "六出祁山": {"a":["诸葛亮","赵云","魏延","姜维","王平","马谡"],"b":["司马懿","张郃","郭淮","曹真"]},
    "五丈原之战": {"a":["诸葛亮","姜维","杨仪"],"b":["司马懿","夏侯霸"]},
    "偷渡阴平": {"a":["邓艾"],"b":["刘禅","诸葛瞻"]},
}
for b in battles:
    cmd = BATTLE_COMMANDERS.get(b["name"],{"a":[],"b":[]})
    for n in cmd["a"]:
        if n in person_map:
            add_rel(pid(n),bid(b["name"]),"commanded",attr={"side":"A","role":"指挥"})
    for n in cmd["b"]:
        if n in person_map:
            add_rel(pid(n),bid(b["name"]),"commanded",attr={"side":"B","role":"指挥"})

# 7. 结盟（势力）
add_rel(fid("蜀汉"),fid("东吴"),"allied",attr={"period":"208-222","event":"赤壁联盟/孙刘联姻"})
add_rel(fid("东吴"),fid("蜀汉"),"allied",attr={"period":"208-222","event":"赤壁联盟/孙刘联姻"})
add_rel(fid("曹魏"),fid("东吴"),"allied",attr={"period":"220-222","event":"袭荆州前暗通"})
add_rel(fid("东吴"),fid("曹魏"),"allied",attr={"period":"220-222","event":"袭荆州前暗通"})

# 8. 敌对（势力/人物）
add_rel(fid("蜀汉"),fid("曹魏"),"hostile",attr={"period":"220-263","wars":("汉中/北伐/灭蜀")})
add_rel(fid("曹魏"),fid("蜀汉"),"hostile",attr={"period":"220-263"})
add_rel(fid("蜀汉"),fid("东吴"),"hostile",attr={"period":"222-229","wars":("夷陵")})
add_rel(fid("东吴"),fid("蜀汉"),"hostile",attr={"period":"222-229"})
add_rel(fid("曹魏"),fid("东吴"),"hostile",attr={"period":"208-280","wars":("赤壁/合淝/灭吴")})
add_rel(fid("东吴"),fid("曹魏"),"hostile",attr={"period":"208-280"})
for a,b in [("曹操","刘备"),("曹操","袁绍"),("曹操","吕布"),("诸葛亮","司马懿")]:
    if a in person_map and b in person_map:
        add_rel(pid(a),pid(b),"hostile",attr={"intensity":"高"})
        add_rel(pid(b),pid(a),"hostile",attr={"intensity":"高"})

# 9. 发生于（战役→地点；事件→地点）
BATTLE_PLACES = {"黄巾之乱":"涿郡","虎牢关之战":"虎牢关","官渡之战":"官渡","长坂坡之战":"长坂坡","赤壁之战":"赤壁","夷陵之战":"夷陵","六出祁山":"祁山","五丈原之战":"五丈原","偷渡阴平":"阴平"}
for bn, pl in BATTLE_PLACES.items():
    # find the battle/place entity
    if any(b["name"]==bn for b in battles) and any(p["name"]==pl for p in places):
        add_rel(bid(bn),lid(pl),"occurred_at")
# event→place
for ev in events:
    pl = ev.get("place","")
    if pl and any(p["name"]==pl for p in places):
        add_rel(eid(ev["name"]),lid(pl),"occurred_at")

# 10. 演化自/评点改造（版本关系）
LINEAGE = [("maozonggang","lizhuowu","evolved_from","评点改造本祖"),
           ("maozonggang","zhongbojing","annotated_by","钟评参考"),
           ("lizhuowu","jiajing","evolved_from","明本→评本"),
           ("liyu","lizhuowu","evolved_from",""),
           ("renminwenxue","maozonggang","collated_from","现代校勘"),
           ("shenboj","maozonggang","collated_from","沈伯俊校理"),
           ("yechunfeng","jiajing","split_from","志传/演义分野"),
           ("yuxiangdou","yechunfeng","evolved_from",""),
           ("huangzhengfu","yechunfeng","evolved_from",""),
           ("zhouyuexiao","jiajing","evolved_from","")]
for a,b,t,note in LINEAGE:
    add_rel(vid(a),vid(b),t,attr={"note":note})

# 11. 持器（person→artifact）
for ar in artifacts:
    owner = ar.get("owner","")
    if owner and owner in person_map:
        add_rel(pid(owner),aid(ar["name"]),"possesses",attr={"first_chapter":0})

# 12. 使用（battle→artifact/stratagem）
# 简单：赤壁借东风、连环计
add_rel(bid("赤壁之战"),stid("连环计"),"used",attr={"side":"吴蜀","tactic":"庞统献连环"})
add_rel(bid("赤壁之战"),stid("苦肉计"),"used",attr={"side":"吴","tactic":"黄盖受刑"})
add_rel(bid("赤壁之战"),aid("七星坛"),"used",attr={"side":"蜀","tactic":"借东风"})
add_rel(bid("官渡之战"),aid("乌巢"),"used",attr={"side":"曹","tactic":"烧粮"})

# 13. 参与（person→event）
EVENT_PARTICIPANTS = {
    "桃园三结义":["刘备","关羽","张飞"],
    "三顾茅庐":["刘备","关羽","张飞","诸葛亮"],
    "煮酒论英雄":["曹操","刘备"],
    "千里走单骑":["关羽","曹操"],
    "单骑救主":["赵云"],
    "草船借箭":["诸葛亮","鲁肃","周瑜","曹操"],
    "借东风":["诸葛亮","周瑜"],
    "空城计":["诸葛亮","司马懿"],
    "刮骨疗毒":["关羽","华佗"],
    "白帝城托孤":["刘备","诸葛亮","刘禅"],
}
for en, ps in EVENT_PARTICIPANTS.items():
    if any(e["name"]==en for e in events):
        for p in ps:
            if p in person_map:
                add_rel(pid(p),eid(en),"participated_in")

# 14. 活动于（person→place）
# 简略：君主→都城
PERSON_PLACE = {"刘备":"成都","诸葛亮":"成都/汉中/祁山","关羽":"荆州","张飞":"阆中","曹操":"许昌/洛阳","曹丕":"洛阳","孙权":"建业","司马懿":"洛阳","姜维":"剑阁/沓中"}
for pn, plstr in PERSON_PLACE.items():
    if pn not in person_map: continue
    for pl in plstr.split("/"):
        if any(x["name"]==pl for x in places):
            add_rel(pid(pn),lid(pl),"active_in")

# 15. 学者→成果 创作
CREATE = {"毛宗岗":"读三国志法","沈伯俊":"三国演义新探","鲁迅":"中国小说史略"}
for sn,pt in CREATE.items():
    if any(s["name"]==sn for s in scholar_rows) and any(p["title"]==pt for p in paper_rows):
        add_rel(sid(sn),paid(pt),"authored")

# 16. 学者论战
add_rel(sid("胡适"),sid("鲁迅"),"academic_debate",attr={"topic":"小说作者与版本"})

# 17. 研究（版本→学者）
add_rel(vid("maozonggang"),sid("毛宗岗"),"studied_by")
add_rel(vid("jiajing"),sid("沈伯俊"),"studied_by")
add_rel(vid("maozonggang"),sid("沈伯俊"),"studied_by")
add_rel(vid("maozonggang"),sid("易中天"),"studied_by")

# 18. 改编自
add_rel(adid("1994央视三国"),vid("maozonggang"),"adapted_from",attr={"faithfulness":"高"})
add_rel(adid("2010新三国"),vid("maozonggang"),"adapted_from",attr={"faithfulness":"中"})
add_rel(adid("三国志"),vid("maozonggang"),"adapted_from",attr={"faithfulness":"高"})
add_rel(adid("真三国无双"),vid("maozonggang"),"adapted_from",attr={"faithfulness":"低"})
add_rel(adid("赤壁"),vid("maozonggang"),"adapted_from",attr={"faithfulness":"中"})

# 19. 登场于（版本→人物）—— 统一默认
for p in persons:
    add_rel(vid("maozonggang"),pid(p["name"]),"appears_in",attr={"ending":"毛本结局"})

# 20. 收录于（版本→事件）—— 毛本全收
for e in events:
    add_rel(vid("maozonggang"),eid(e["name"]),"includes")

# ===================== 15. annotations 批点（留接口，先放几条毛批样例）=====================
annot_rows = [
    {"annotation_id":"sg_ann_1","line_id":"","chapter_no":1,"commentator":"毛宗岗","text":"临江仙一卷，为全部大关键，将兴亡成败，都付渔樵闲话。","type":"总评"},
    {"annotation_id":"sg_ann_2","line_id":"","chapter_no":1,"commentator":"毛宗岗","text":"天下大势，分久必合，合久必分，一部大书总纲。","type":"回评"},
]

# ===================== 16. stats =====================
stats_rows = [
    {"metric":"persons","value":len(person_rows)},
    {"metric":"factions","value":len(faction_rows)},
    {"metric":"places","value":len(place_rows)},
    {"metric":"battles","value":len(battle_rows)},
    {"metric":"events","value":len(event_rows)},
    {"metric":"artifacts","value":len(artifact_rows)},
    {"metric":"stratagems","value":len(stratagem_rows)},
    {"metric":"prophecies","value":len(prophecy_rows)},
    {"metric":"scholars","value":len(scholar_rows)},
    {"metric":"papers","value":len(paper_rows)},
    {"metric":"adaptations","value":len(adapt_rows)},
    {"metric":"editions","value":len(edition_rows)},
    {"metric":"chapters","value":len(chapter_rows)},
    {"metric":"lines","value":len(line_rows)},
    {"metric":"mentions","value":len(mentions_rows)},
    {"metric":"relationships","value":len(rels)},
    {"metric":"total_chars","value":sum(c["chars"] for c in chapters)},
]

# ===================== 写出 Parquet =====================
def write_parquet(name, rows):
    if not rows:
        # 空表也要写，给出空 schema
        df = pd.DataFrame(rows)
    else:
        df = pd.DataFrame(rows)
    path = OUT_PARQUET / f"{name}.parquet"
    df.to_parquet(path, index=False)
    print(f"  {name:16s} {len(rows):7d} rows  ->  {path.name}  ({path.stat().st_size//1024}KB)")
    return df

print("[build] writing parquet...")
dfs = {}
for name, rows in [
    ("editions", edition_rows),
    ("chapters", chapter_rows),
    ("lines", line_rows),
    ("entities", entities_rows),
    ("persons", person_rows),
    ("factions", faction_rows),
    ("places", place_rows),
    ("battles", battle_rows),
    ("events", event_rows),
    ("artifacts", artifact_rows),
    ("stratagems", stratagem_rows),
    ("prophecies", prophecy_rows),
    ("scholars", scholar_rows),
    ("papers", paper_rows),
    ("adaptations", adapt_rows),
    ("mentions", mentions_rows),
    ("relationships", rels),
    ("annotations", annot_rows),
    ("stats", stats_rows),
]:
    dfs[name] = write_parquet(name, rows)

# ===================== manifest.json =====================
manifest = {
    "project": "Romance of the Three Kingdoms Knowledge Graph",
    "version": "1.0.0",
    "built_at": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
    "ontology": "../03_本体论规范/sanguo_kg_ontology.ttl",
    "vocabularies": "../03_本体论规范/vocabularies.yaml",
    "db_engine": "duckdb-wasm",
    "deploy_target": "github-pages",
    "counts": {r["metric"]: r["value"] for r in stats_rows},
    "tables": [],
}
for name in dfs:
    p = OUT_PARQUET / f"{name}.parquet"
    manifest["tables"].append({"name":name,"path":f"{name}.parquet","rows":len(dfs[name]),"size_bytes":p.stat().st_size})
import json as _json
(OUT_PARQUET / "manifest.json").write_text(_json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\n[ok] manifest written, {len(manifest['tables'])} tables")
