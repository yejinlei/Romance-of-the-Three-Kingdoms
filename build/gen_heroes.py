#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成三国英雄谱（heroes.html）——参照水浒108将的卡片式人物阵列，
以三国自己的「五虎上将」「五子良将」「十二虎臣」「四大都督」「卧龙凤雏」「桃园结义」「三绝」等经典群体为骨架，
+ 三国群雄榜 TOP 120 人物。
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_pages import NAV, load, write, header, FOOTER, stat, DOCS

def write_page(fn, title, body, active='heroes', breadcrumb=''):
    desc = breadcrumb
    head = header(title, active=active + '.html' if active != 'heroes' else 'heroes.html', desc=desc)
    html = head + body + FOOTER.format(total_words=stat.get('total_chars', 590968))
    (DOCS/f'{fn}.html').write_text(html, encoding='utf-8')
    return True

def load_persons_db():
    persons = json.load(open('data/persons_db.json'))
    # 补充提及次数
    freq = {}
    if os.path.exists('data/freq.json'):
        try:
            f = json.load(open('data/freq.json'))
            if isinstance(f, dict) and 'entities' in f:
                for e in f['entities']:
                    if e.get('type') == 'person':
                        freq[e['name']] = e.get('total', 0)
        except Exception:
            pass
    # 从 persons.json 取提及次数
    pj = json.load(open('docs/data/persons.json'))
    for x in pj:
        if x.get('name'):
            freq[x['name']] = x.get('mention_count', x.get('total', freq.get(x['name'], 0)))
    out = []
    for p in persons:
        p = dict(p)
        p['mentions'] = freq.get(p['name'], 0)
        out.append(p)
    return out

# ==================== 经典人物群体（三国特色，对应水浒「三十六天罡/七十二地煞」） ====================
# 每个 group: (id, 标题, 副标题, 阵营色, 人物姓名列表)
FACTION_COLOR = {
    '蜀汉': 'faction-shuhan',
    '曹魏': 'faction-caowei',
    '东吴': 'faction-dongwu',
    '群雄': 'faction-qunxiong',
    '东汉': 'faction-donghan',
    '晋':   'faction-jin',
    '南蛮': 'faction-nanman',
    '黄巾': 'faction-huangjin',
    '西晋': 'faction-jin',
    '其他': 'faction-qunxiong',
}

GROUPS = [
    ('sanjue', '三絕', '毛宗崗評本所定「三絕」——智絕、義絕、姦絕', 'qunxiong',
     [('諸葛亮','智絕'), ('關羽','義絕'), ('曹操','姦絕')]),
    ('taoyuan', '桃園三結義', '第一回宴桃園豪傑三結義', 'shuhan',
     [('劉備','大哥·昭烈帝'), ('關羽','二哥·漢壽亭侯'), ('張飛','三弟·車騎將軍')]),
    ('wuhu', '五虎上將', '第七十三回劉備進位漢中王，封關張趙馬黃為五虎大將', 'shuhan',
     [('關羽','前將軍·漢壽亭侯'), ('張飛','右將軍·西鄉侯'), ('趙雲','翊軍將軍·常山趙子龍'), ('馬超','左將軍·斄鄉侯'), ('黃忠','後將軍·關內侯')]),
    ('wuziliang', '五子良將', '《三國志》載「太祖建茲武功，而時之良將，五子為先」', 'caowei',
     [('張遼','征東將軍·晉陽侯'), ('樂進','右將軍·廣昌亭侯'), ('于禁','左將軍·益壽亭侯'), ('張郃','征西車騎將軍·鄚侯'), ('徐晃','右將軍·陽平侯')]),
    ('shierhuchen', '江東十二虎臣', '《三國志·吳書》評「凡此諸將，皆江表之虎臣」', 'dongwu',
     [('程普','右北平土垠人'), ('黃蓋','獻苦肉計'), ('韓當','遼西令支人'), ('蔣欽','九江壽春人'),
      ('周泰','九江下蔡人'), ('陳武','廬江松滋人'), ('董襲','會稽餘姚人'), ('甘寧','巴郡臨江人·錦帆賊'),
      ('凌統','吳郡餘杭人'), ('徐盛','琅邪莒人'), ('潘璋','東郡發乾人'), ('丁奉','廬江安豐人·雪中奮短兵')]),
    ('sidadu', '江東四大都督', '東吳四代軍事統帥，皆鎮國柱石', 'dongwu',
     [('周瑜','都督·赤壁破曹'), ('魯肅','都督·榻上策'), ('呂蒙','都督·白衣渡江取荊州'), ('陸遜','都督·火燒連營七百里')]),
    ('wolongfengchu', '臥龍鳳雛', '司馬徽薦言「伏龍鳳雛，二人得一，可安天下」', 'shuhan',
     [('諸葛亮','臥龍·丞相'), ('龐統','鳳雛·軍師中郎將')]),
    ('caocaowei', '曹魏核心謀士集團', '五大謀主', 'caowei',
     [('荀彧','尚書令·王佐之才'), ('荀攸','軍師·十二奇策'), ('郭嘉','軍師祭酒·鬼才'), ('程昱','衛尉·堅守三城'), ('賈詡','太尉·亂武毒士')]),
    ('shuhan_wenchen', '蜀漢文臣樞要', '股肱之臣', 'shuhan',
     [('法正','尚書令·奇謀取漢中'), ('蔣琬','大將軍·諸葛亮舉以自代'), ('費禕','大將軍·寬濟而博愛'), ('董允','侍中·蜀之四相'), ('馬良','侍中·白眉最良')]),
    ('zhuhou', '漢末諸侯', '逐鹿中原的割據群雄', 'qunxiong',
     [('袁紹','四世三公·官渡兵敗'), ('袁術','仲家皇帝·淮南僭號'), ('劉表','荊州牧·據有江漢'),
      ('呂布','溫侯·飛將·虎踞徐州'), ('公孫瓚','白馬將軍·據幽州'), ('馬騰','西涼太守·槐里侯'),
      ('張魯','漢寧太守·五斗米道'), ('劉璋','益州牧·據西川'), ('董卓','太師·廢立天子'), ('孫堅','江東猛虎·破虜將軍')]),
]

def get_person_dict(persons):
    d = {}
    for p in persons:
        d[p['name']] = p
        if p.get('alias'):
            for a in str(p['alias']).split('/'):
                a = a.strip()
                if a:
                    d[a] = p
    return d

def faction_class(f):
    return FACTION_COLOR.get(f, 'faction-qunxiong')

def fiction_label(flag):
    return {0: '<span class="hist">正史</span>', 1: '<span class="half">半虛</span>', 2: '<span class="fict">演義虛構</span>'}.get(flag, '')

def render_group(gid, title, subtitle, color, members, pdict):
    cards = []
    for name, tagline in members:
        p = pdict.get(name)
        if not p:
            cards.append(f'<div class="hero-card {color}"><div class="h-name">{name}</div><div class="h-tag">{tagline}</div><div class="h-meta">（人物資料待補）</div></div>')
            continue
        zi = p.get('zi') or '—'
        faction = p.get('faction') or ''
        home = p.get('home') or ''
        years = ''
        if p.get('birth') and p.get('death'):
            years = f'{int(p["birth"])}—{int(p["death"])}'
        elif p.get('death'):
            years = f'?—{int(p["death"])}'
        fiction = fiction_label(p.get('fiction'))
        # 字号/籍贯小字
        bits = []
        if zi != '—':
            bits.append(f'字{zi}')
        if home:
            bits.append(home)
        if years:
            bits.append(years)
        meta = ' · '.join(bits) if bits else ''
        cards.append(f'''<div class="hero-card {faction_class(faction)}">
            <div class="h-name">{name}<span class="h-zi">{f"字{zi}" if zi != "—" else ""}</span></div>
            <div class="h-tag">{tagline}</div>
            <div class="h-meta">{meta}</div>
            <div class="h-foot">{fiction}<span class="h-camp">{faction}</span></div>
        </div>''')
    return f'''
    <section class="hero-group" id="{gid}">
      <div class="hero-group-hd">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <span class="seal-mini">三國</span>
      </div>
      <div class="hero-grid">{"".join(cards)}</div>
    </section>'''

# ==================== 群雄榜 TOP 120 ====================
def render_top120(persons):
    # 取提及数 top 120，但要剔除上面群体里已出现的核心人物？不，保留但放在一个大榜里
    ranked = sorted(persons, key=lambda x: -x.get('mentions', 0))[:120]
    cards = []
    for i, p in enumerate(ranked, 1):
        name = p['name']
        zi = p.get('zi') or ''
        faction = p.get('faction') or ''
        cat = p.get('category') or ''
        mentions = p.get('mentions', 0)
        fiction = fiction_label(p.get('fiction'))
        cards.append(f'''<div class="top-card {faction_class(faction)}" data-rank="{i}">
            <div class="t-rank">{i:03d}</div>
            <div class="t-body">
              <div class="t-name">{name}<span class="t-zi">{"字"+zi if zi else ""}</span></div>
              <div class="t-meta"><span class="t-cat">{cat}</span>{fiction}</div>
            </div>
            <div class="t-mentions">{mentions}次</div>
        </div>''')
    return f'''
    <section class="hero-group" id="top120">
      <div class="hero-group-hd">
        <h2>群雄榜 · 登場百二十人</h2>
        <p>按毛宗崗評本（120 回·590,968 字）人物提及次數排序，含正史人物、半虛構與演義虛構人物。</p>
        <span class="seal-mini">演義</span>
      </div>
      <div class="top-grid">{"".join(cards)}</div>
    </section>'''

def build():
    persons = load_persons_db()
    pdict = get_person_dict(persons)
    # 统计
    stats = {'total': len(persons), 'hist': sum(1 for p in persons if p.get('fiction')==0),
             'half': sum(1 for p in persons if p.get('fiction')==1),
             'fict': sum(1 for p in persons if p.get('fiction')==2)}

    groups_html = []
    for gid, title, sub, color, mem in GROUPS:
        groups_html.append(render_group(gid, title, sub, color, mem, pdict))
    groups_html.append(render_top120(persons))

    body = f'''
    <section class="hero-hero">
      <h1><span class="big-seal">三</span>國英雄譜</h1>
      <p class="hero-sub">—— 對照水滸一百單八將的英雄冊譜體例，以三國自有的「三絕」「桃園」「五虎上將」「五子良將」「江東十二虎臣」「四大都督」「臥龍鳳雛」等經典群像為經，以全書登場人物登場次序與提及次數為緯 ——</p>
      <div class="hero-stats">
        <div class="stat"><span class="num">{stats["total"]}</span><span class="lbl">登場人物</span></div>
        <div class="stat"><span class="num hist">{stats["hist"]}</span><span class="lbl">正史可考</span></div>
        <div class="stat"><span class="num half">{stats["half"]}</span><span class="lbl">半虛半實</span></div>
        <div class="stat"><span class="num fict">{stats["fict"]}</span><span class="lbl">演義虛構</span></div>
      </div>
    </section>
    <section class="legend">
      <span class="lg shuhan">蜀漢</span>
      <span class="lg caowei">曹魏</span>
      <span class="lg dongwu">東吳</span>
      <span class="lg qunxiong">群雄</span>
      <span class="lg donghan">東漢</span>
      <span class="lg jin">司馬晉</span>
      <span class="lg nanman">南蠻</span>
      <span class="lg huangjin">黃巾</span>
    </section>
    {''.join(groups_html)}
    <section class="an-note">
      <h3>凡例</h3>
      <ul>
        <li>群體分類同時依《三國演義》回目與《三國志》史傳：「五虎上將」出自第七十三回劉備進位漢中王時封關張趙馬黃；「五子良將」典出《三國志·魏書》卷十七合傳；「江東十二虎臣」出自《三國志·吳書》卷十評語；「四大都督」係後世評話之通稱。</li>
        <li>正史／半虛／演義虛構的標註，以《三國志》《後漢書》《資治通鑑》所載為憑；半虛構者為史有其人而演義增飾事蹟（如貂蟬之原型為董卓侍婢）；演義虛構者為史傳無徵之小說人物（如周倉、關索）。</li>
        <li>「群雄榜·登場百二十人」提及次數依毛本（Gutenberg 23950 底本）機器統計，受別名指代消歧影響，偶有小幅誤差，可與「本體查詢台」互相校驗。</li>
      </ul>
    </section>
    '''
    write_page('heroes', '三國英雄譜', body, breadcrumb='人物志 · 英雄譜')
    print('[heroes] 生成成功')

if __name__ == '__main__':
    build()
