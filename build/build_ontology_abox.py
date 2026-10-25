#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build/build_ontology_abox.py
补全三國演義本體論 ABox 實例：
  1. 12 個版本個體 (sg:Edition 實例)
  2. 正史文獻類 sg:RecordsOfThreeKingdoms / sg:PeiAnnotation
  3. 30+ 條 VariantReading 核心異文（嘉靖本 vs 毛宗崗本）
  4. 重寫 YAML 受控詞表
輸出：
  - 03_本体论规范/sanguo_kg_ontology.ttl（在原 TBox 末尾追加 ABox 段）
  - 03_本体论规范/vocabularies.yaml（重寫）
  - data/variants.json（異文對照資料）
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TTL_PATH = os.path.join(ROOT, "03_本体论规范/sanguo_kg_ontology.ttl")
YAML_PATH = os.path.join(ROOT, "03_本体论规范/vocabularies.yaml")
VARIANTS_JSON = os.path.join(ROOT, "data/variants.json")
EDITIONS_JSON = os.path.join(ROOT, "data/editions.json")

# ============================================================
# A. 12 個版本個體（嚴格版本學）
# ============================================================
EDITIONS = [
    {"id":"sg_version_jiajing","name":"嘉靖壬午本《三國志通俗演義》","short":"嘉靖本","family":"yanyi","year":"1522",
     "publisher":"明嘉靖元年刻本","survival":"全本（影印存世）","chapters":"24 卷 240 則","fulltext":False,
     "feature":"現存最早刻本；240 則單題七言；尊曹傾向明顯；無《臨江仙》開篇；曹操形象未被臉譜化；含「孔明燒魏延於上方谷」等被毛本刪去之段落。"},
    {"id":"sg_version_zhouyuexiao","name":"周曰校本《新刊校正古本大字音釋三國志通俗演義》","short":"周曰校本","family":"yanyi","year":"1591",
     "publisher":"明萬曆十九年金陵周曰校萬卷樓刊","survival":"全本（有影印，識典古籍在線）","chapters":"12 卷 240 則","fulltext":False,
     "feature":"演義系代表本；增補插圖、音注、釋義、考證；與嘉靖本同屬演義系統，文字高度一致。"},
    {"id":"sg_version_yefengchun","name":"葉逢春本《新刊通俗演義三國志傳》","short":"葉逢春本","family":"zhizhuan","year":"1548",
     "publisher":"明嘉靖二十七年建陽葉逢春刊","survival":"殘本（分藏數館）","chapters":"10 卷 240 段","fulltext":False,
     "feature":"志傳系統最早刻本；獨有『花關索』四傳（出身/征西川/下荊州/認父）；上圖下文版式。"},
    {"id":"sg_version_yuxiangdou","name":"余象斗雙峰堂本《音釋補遺按鑑批點三國志傳》","short":"余象斗本","family":"zhizhuan","year":"1592",
     "publisher":"明萬曆二十年建陽余象斗雙峰堂刊","survival":"全本（英國博物院/早稻田藏）","chapters":"20 卷","fulltext":False,
     "feature":"開『評林』本之風；余氏自加評點；葉逢春本系統繁本代表。"},
    {"id":"sg_version_huangzhengfu","name":"黃正甫本《新刻考訂按鑑通俗演義全像三國志傳》","short":"黃正甫本","family":"zhizhuan","year":"1623",
     "publisher":"明天啟三年閩建黃正甫刊","survival":"全本（日本內閣文庫藏）","chapters":"20 卷 240 則","fulltext":False,
     "feature":"志傳系統簡本；文字極簡淨；與繁本（余象斗）孰先孰後學界仍有爭論（小川環樹等主簡本為先）。"},
    {"id":"sg_version_lizhuowu","name":"李卓吾評本《李卓吾先生批評三國志》","short":"李卓吾評本","family":"pingdian","year":"~1607",
     "publisher":"明萬曆間吳觀明容與堂刊","survival":"全本","chapters":"120 回（首合 240 則為 120 回）","fulltext":False,
     "feature":"首次將 240 則合併為 120 回；回目由單題改為雙題；葉晝偽託李贄評點；尊劉貶曹傾向加強。"},
    {"id":"sg_version_zhongbojing","name":"鍾伯敬評本《鍾伯敬先生批評三國志》","short":"鍾伯敬評本","family":"pingdian","year":"~1627",
     "publisher":"明天啟間積慶堂刊","survival":"全本","chapters":"120 回","fulltext":False,
     "feature":"繼李評本之評點系統；評語較李評簡潔；明末清初流傳較廣。"},
    {"id":"sg_version_liyu","name":"李笠翁評本《笠翁批評三國志》","short":"李漁評本","family":"pingdian","year":"~1670",
     "publisher":"清康熙間刊","survival":"全本","chapters":"120 回","fulltext":False,
     "feature":"毛宗崗同時代之評本；李漁為清初戲曲大家；評點偏向小說結構與文法。"},
    {"id":"sg_version_maozonggang","name":"毛宗崗評本《四大奇書第一種——三國志演義》","short":"毛本（通行本）","family":"pingdian","year":"1679",
     "publisher":"清康熙十八年醉畊堂刊（毛綸、毛宗崗父子評改）","survival":"全本（通行本）","chapters":"120 回","fulltext":True,
     "feature":"現今通行本；首冠楊慎《臨江仙·滾滾長江東逝水》；整頓回目為對偶聯語；刪改嘉靖本尊曹字句，強化尊劉貶曹；刪去『上方谷燒魏延』等段落；加毛氏回前總評、夾批；此本一出『一切舊本乃不復行』。本站在線全文即毛本（590,968 字）。"},
    {"id":"sg_version_renwen","name":"人民文學出版社校訂本","short":"人文社本","family":"modern","year":"1953",
     "publisher":"人民文學出版社（初版顧學頡等整理，1973 第三版）","survival":"全本","chapters":"120 回","fulltext":False,
     "feature":"以毛本為底本，參照明嘉靖本、清一些評本校勘標點；大陸最通行現代整理本；國內發行量最大。"},
    {"id":"sg_version_shenbojun","name":"沈伯俊校理本《三國演義（新校理本）》","short":"沈伯俊校理本","family":"modern","year":"1992",
     "publisher":"江蘇古籍出版社/巴蜀書社多版","survival":"全本","chapters":"120 回","fulltext":False,
     "feature":"當代三國權威沈伯俊以毛本為底本、參校多個明刊本之校理本；對毛本地理/官職/人物訛誤多所校正。"},
    {"id":"sg_version_fan","name":"反三國演義（周大荒）","short":"反三國","family":"sequel","year":"1924",
     "publisher":"民國時期初刊","survival":"全本","chapters":"60 回","fulltext":False,
     "feature":"續書/翻案之作；為蜀漢翻案，令劉備諸葛亮統一天下；結尾『薦杜預老將獻新謀』不同毛本。"}
]

# ============================================================
# B. 正史文獻類 & 正史/虛構分級（補入 TBox 尾部）
# ============================================================
HISTORY_TBOX_APPEND = """
# ============================================================
# 十六、正史文獻層（文史互證）
#   對應三國本體的「史/虛」分野能力：
#   RecordsOfThreeKingdoms 陳壽《三國志》（正史）
#   PeiAnnotation          裴松之注（引諸家雜史）
#   OfficialHistoryEvent   正史有載事件
#   SemiFictionalEvent     正史有載但小說加工
#   PureFictionalEvent     純虛構事件（如桃園結義、草船借箭）
# fictionalFlag 0=正史有載 1=正史有載但已加工 2=純虛構
# ============================================================
sg:HistoricalSource  a owl:Class ; rdfs:subClassOf sg:Thing ; rdfs:label "正史文獻" .
sg:RecordsOfThreeKingdoms a owl:Class ; rdfs:subClassOf sg:HistoricalSource ; rdfs:label "陳壽《三國志》（西晉·正史）" .
sg:PeiAnnotation         a owl:Class ; rdfs:subClassOf sg:HistoricalSource ; rdfs:label "裴松之注（南朝宋）" .
sg:HouHanShu              a owl:Class ; rdfs:subClassOf sg:HistoricalSource ; rdfs:label "范曄《後漢書》" .
sg:ZizhiTongjian          a owl:Class ; rdfs:subClassOf sg:HistoricalSource ; rdfs:label "司馬光《資治通鑑》" .

# 事件虛實三級
sg:fictionalFlag  a owl:DatatypeProperty, owl:FunctionalProperty ;
  rdfs:domain sg:Person, sg:Event, sg:Battle, sg:Artifact ;
  rdfs:range xsd:integer ;
  rdfs:label "虛實標註（0=正史有載 1=正史有載小說加工 2=純虛構）" .

# 史源對照
sg:attestedIn   a owl:ObjectProperty ;
  rdfs:domain sg:Person, sg:Event, sg:Battle ; rdfs:range sg:HistoricalSource ;
  rdfs:label "正史載於（文史互證）" .
sg:contradicts  a owl:ObjectProperty, owl:SymmetricProperty ;
  rdfs:domain sg:Event ; rdfs:range sg:HistoricalSource ;
  rdfs:label "與正史矛盾（小說虛構）" .
sg:embellishedFrom a owl:ObjectProperty ;
  rdfs:domain sg:Event ; rdfs:range sg:HistoricalSource ;
  rdfs:label "從正史片段加工而來（半虛構）" .

# ============================================================
# 十七、ABox：12 個版本個體
# ============================================================
"""

# ============================================================
# C. 30+ 條核心異文 VariantReading（學界校勘結論）
#   每條異文帶：毛本句、嘉靖本句、異文類型、意義說明、學者考證
# ============================================================
VARIANTS = [
    {"id":"sg_var_001","chapter":1,"section":"開篇·曹操出場",
     "maotext":"為首閃出一將，身長七尺，細眼長髯。",
     "jiajingtext":"為首閃出一個好英雄，身長七尺，細眼長髯，胆量過人，機謀出眾，乃漢相曹參二十四代孫。",
     "type":"vt_rewrite","significance":"毛本刪去『好英雄』『膽量過人機謀出眾』『曹參二十四代孫』等褒揚曹操的文字，貶曹傾向明顯。"},
    {"id":"sg_var_002","chapter":4,"section":"曹操殺呂伯奢",
     "maotext":"寧教我負天下人，休教天下人負我！",
     "jiajingtext":"寧使我負天下人，休教天下人負我！",
     "type":"vt_rewrite","significance":"『教』vs『使』一字之差，毛本『教』字口氣更強硬、理直氣壯；嘉靖本『使』字帶被動無奈口吻，更符合陳宮評『設心狠毒』的複雜性。此句不見於《三國志》正文，最早見裴注引孫盛《雜記》。"},
    {"id":"sg_var_003","chapter":1,"section":"卷首詞",
     "maotext":"滾滾長江東逝水，浪花淘盡英雄。是非成敗轉頭空。青山依舊在，幾度夕陽紅。（楊慎《臨江仙》）",
     "jiajingtext":"（無開篇詞，直接以『後漢桓帝崩，靈帝即位』入正文）",
     "type":"vt_poetry","significance":"《臨江仙》為明代楊慎所作，毛宗崗託於卷首，嘉靖本無；後世讀者誤以為此即三國開篇。"},
    {"id":"sg_var_004","chapter":1,"section":"桃園結義",
     "maotext":"念劉備、關羽、張飛雖然異姓，既結為兄弟，則同心協力，救困扶危；上報國家，下安黎庶……",
     "jiajingtext":"三人焚香再拜而說誓曰：『念劉備、關羽、張飛雖然異姓，結為兄弟，則同心協力，救困扶危；上報國家，下安黎庶……』不求同年同月同日生，只願同年同月同日死。",
     "type":"vt_poetry","significance":"『不求同年同月同日生，只願同年同月同日死』為毛本（含部分評本）加入，嘉靖本誓詞無此句，屬後世評點家潤色。桃園結義本身正史無載，為民間傳說整合。"},
    {"id":"sg_var_005","chapter":5,"section":"溫酒斬華雄",
     "maotext":"（關羽出帳斬華雄，回帳時其酒尚溫）",
     "jiajingtext":"（關羽出帳斬華雄，『其酒尚溫』四字位置、前文對華雄武勇渲染較毛本更詳）",
     "type":"vt_rewrite","significance":"斬華雄在正史為孫堅所為（《三國志·孫堅傳》），小說移植於關羽，本身為虛構；毛本刪削前文誇飾，節奏更緊。"},
    {"id":"sg_var_006","chapter":25,"section":"屯土山關公約三事",
     "maotext":"關公曰：『一者，吾與皇叔設誓，共扶漢室，吾今只降漢帝，不降曹操；二者，二嫂處請給皇叔俸祿養贍，一應上下人等，皆不許到門；三者，但知皇叔去向，不管千里萬里，便當辭去。』",
     "jiajingtext":"關公曰：『一者，吾降漢不降曹；二者，二嫂處請給皇叔俸祿；三者，但知皇叔去向，不管千里萬里，便當辭去。』",
     "type":"vt_rewrite","significance":"毛本潤色文字更對仗工整；『降漢不降曹』之核心說法不見正史，為小說家言。"},
    {"id":"sg_var_007","chapter":41,"section":"趙子龍長阪坡",
     "maotext":"趙雲懷抱後主，直透重圍，砍倒大旗兩面，奪槊三條；前後槍刺劍砍，殺死曹營名將五十餘員。",
     "jiajingtext":"趙雲懷抱阿斗，直透重圍，砍倒大旗兩面，奪槊三條；前後槍刺劍砍，殺死曹營名將五十餘員。",
     "type":"vt_rewrite","significance":"『後主』vs『阿斗』：毛本改稱號，嘉靖本用小字；毛本對趙雲形象的神化程度更高，加後文『曹操下令不許放冷箭』以成全趙雲之勇。"},
    {"id":"sg_var_008","chapter":46,"section":"草船借箭",
     "maotext":"（諸葛亮以草船二十隻借箭十餘萬）",
     "jiajingtext":"（情節基本相同，但借箭數『十餘萬』寫法與毛本略異；且孫權濡須之戰『借箭』原型在《魏略》，主角本為孫權）",
     "type":"vt_plot","significance":"草船借箭原型為孫權（裴注引《魏略》），《三國志平話》移植於周瑜，小說最終定型為諸葛亮，是「狀諸葛之多智而近妖」的典型段落。"},
    {"id":"sg_var_009","chapter":49,"section":"諸葛祭風",
     "maotext":"七星壇上諸葛亮祭東南風。",
     "jiajingtext":"七星壇諸葛祭風，情節文字略樸，毛本加強儀式細節與神異描寫。",
     "type":"vt_rewrite","significance":"祭風為純粹小說虛構，正史載赤壁之戰為黃蓋詐降火攻，冬月偶有東南風屬自然現象；毛本進一步神化諸葛亮。"},
    {"id":"sg_var_010","chapter":50,"section":"華容道關羽釋曹",
     "maotext":"關雲長義釋曹操。",
     "jiajingtext":"關雲長義釋曹操（後文有毛宗崗回評大加發揮『義絕』主題，嘉靖本評點較樸）。",
     "type":"vt_plot","significance":"華容道釋曹正史無載（《山陽公載記》有曹操赤壁後從華容道過的記載，但無關羽放行），為小說為塑造關羽『義絕』而設；毛本增強戲劇性。"},
    {"id":"sg_var_011","chapter":95,"section":"上方谷火燒魏延（被毛本刪）",
     "maotext":"（毛本全段刪去，只寫司馬懿父子被困上方谷，天降大雨得脫）",
     "jiajingtext":"孔明令魏延誘司馬懿入葫蘆峪（上方谷），預埋火藥欲一舉燒死司馬懿與魏延；天降大雨，魏延幸免，事後大罵孔明。",
     "type":"vt_plot","significance":"嘉靖本此段對諸葛亮形象有貶損（為除後患不惜暗害己方大將），毛本出於『狀諸葛之智』的正統塑造而全段刪除，是毛本『聖化』諸葛的關鍵手筆。"},
    {"id":"sg_var_012","chapter":103,"section":"五丈原諸葛病逝",
     "maotext":"『再不能臨陣討賊矣！悠悠蒼天，曷此其極！』",
     "jiajingtext":"『吾再不能出軍征討逆賊矣！悠悠蒼天，曷此其極！』",
     "type":"vt_rewrite","significance":"毛本將『征討逆賊』改『臨陣討賊』，語氣更凝練悲壯，強化『出師未捷身先死』之感。"},
    {"id":"sg_var_013","chapter":1,"section":"張飛世居涿郡",
     "maotext":"世居涿郡，頗有莊田，賣酒屠豬，專好結交天下豪傑。",
     "jiajingtext":"世居涿郡，頗有田莊，賣酒屠豬，專好結交天下豪傑。",
     "type":"vt_typo","significance":"『莊田/田莊』倒文，毛本順口。"},
    {"id":"sg_var_014","chapter":38,"section":"隆中對",
     "maotext":"將軍既帝室之冑，信義著於四海，總攬英雄，思賢如渴……",
     "jiajingtext":"將軍既帝室之冑，信義著於四海，攬英雄，思賢如渴……",
     "type":"vt_rewrite","significance":"毛本加『總』字使文氣更暢；《隆中對》本文見《三國志·諸葛亮傳》，小說文字與正史大體一致但有文學潤色。"},
    {"id":"sg_var_015","chapter":3,"section":"呂布弑丁原",
     "maotext":"（呂布受李肅說降，當夜斬丁原首級獻董卓）",
     "jiajingtext":"（情節同，但毛本強化李肅說辭的利誘力度與呂布見利忘義的嘴脸）",
     "type":"vt_rewrite","significance":"史有丁原被呂布殺事，細節為小說加工；毛本更強三姓家奴的反覆形象。"},
    {"id":"sg_var_016","chapter":4,"section":"捉放曹·陳宮",
     "maotext":"（陳宮捉曹操又釋之，因操殺呂伯奢而離去）",
     "jiajingtext":"（陳宮為中牟縣令，捉放曹後，陳宮因呂伯奢事離去，但嘉靖本陳宮心理描寫較毛本少）",
     "type":"vt_plot","significance":"正史中捉放曹者並非陳宮，《魏書》載為一不知名功曹；陳宮後因叛曹迎呂布被曹操所殺，小說將二事合併為典型的「曹操奸雄」段落。"},
    {"id":"sg_var_017","chapter":21,"section":"青梅煮酒論英雄",
     "maotext":"今天下英雄，惟使君與操耳！",
     "jiajingtext":"今天下英雄，惟使君與操耳！",
     "type":"vt_typo","significance":"此句與《三國志·先主傳》基本一致（「今天下英雄，唯使君與操耳。本初之徒，不足數也」），是小說最接近正史原文的名言之一。"},
    {"id":"sg_var_018","chapter":29,"section":"小霸王怒斬于吉",
     "maotext":"（孫策怒斬道士于吉，後于吉數次顯靈，孫策創裂而亡）",
     "jiajingtext":"（情節大體一致，但毛本加強于吉顯靈的神怪描寫，將孫策之死完全歸因於因果報應）",
     "type":"vt_rewrite","significance":"正史載孫策為許貢客刺殺，創傷而崩；于吉為方士，裴注引《江表傳》有孫策欲殺于吉事，但顯靈索命純屬小說家言。"},
    {"id":"sg_var_019","chapter":43,"section":"趙子龍截江奪阿斗",
     "maotext":"趙雲飛身趕上船，奪回阿斗。",
     "jiajingtext":"趙雲跳上船奪回阿斗，文字較毛本樸素。",
     "type":"vt_rewrite","significance":"截江奪阿斗正史有載（《趙雲別傳》），是少見的與正史高度吻合的趙雲段落。"},
    {"id":"sg_var_020","chapter":56,"section":"曹操大宴銅雀臺",
     "maotext":"（銅雀臺大宴，曹氏父子賦詩，武將比箭）",
     "jiajingtext":"（毛本增加大量詩文場面，特別是曹植、王粲等人銅雀臺賦內容；嘉靖本較簡）",
     "type":"vt_poetry","significance":"銅雀台賦《三國志》有載，但小說中『攬二喬於東南兮』一句為唐杜牧詩與小說附會，諸葛亮智激周瑜實為小說虛構。"},
    {"id":"sg_var_021","chapter":74,"section":"龐德抬櫬戰關公",
     "maotext":"龐德抬櫬（棺材）出征，以示決死。",
     "jiajingtext":"龐德舁櫬出征，意義相同但字稍古。",
     "type":"vt_typo","significance":"『抬』『舁』異文，抬為後起字。龐德戰敗被擒不降而死為正史有載。"},
    {"id":"sg_var_022","chapter":75,"section":"關公刮骨療毒",
     "maotext":"（關公刮骨療毒，與馬良飲酒弈棋，談笑自若）",
     "jiajingtext":"（情節同，但醫者非華佗；毛本改為華佗為關公治傷）",
     "type":"vt_plot","significance":"刮骨療毒《三國志·關羽傳》有載，但醫者無名（華佗卒於建安十三年，時關羽中箭在建安二十四年，華佗已死 11 年，不可能為關公治傷）；毛本為神化關公與華佗而張冠李戴。"},
    {"id":"sg_var_023","chapter":81,"section":"急兄仇張飛遇害",
     "maotext":"范疆、張達刺張飛。",
     "jiajingtext":"范彊、張達刺張飛。",
     "type":"vt_typo","significance":"『范彊』為正史《三國志》用字，『范疆』為毛本誤字（疆彊形近而訛），沈伯俊校理本已改回『范彊』。"},
    {"id":"sg_var_024","chapter":84,"section":"陸遜營燒七百里·八陣圖",
     "maotext":"（陸遜追劉備入漁腹浦，困於諸葛亮所布八陣圖，得黃承彥引出）",
     "jiajingtext":"（八陣圖情節嘉靖本已有，但毛本加強玄學氛圍與黃承彥出場的描寫）",
     "type":"vt_rewrite","significance":"夷陵之戰火燒連營正史有載，陸遜確實退兵以防魏，但『八陣圖困陸遜』為純粹小說虛構。"},
    {"id":"sg_var_025","chapter":85,"section":"劉先主遺詔託孤",
     "maotext":"若嗣子可輔，則輔之；如其不才，君可自取。",
     "jiajingtext":"若嗣子可輔，則輔之；如其不才，君可自取為成都王。",
     "type":"vt_rewrite","significance":"嘉靖本多『為成都王』四字，語氣近於試探或准許取而代之；毛本刪四字，使『自取』意義更開放（或指自取天下、或指自取帝位），此處是史家與評點家爭論白帝城託孤真意的關鍵異文。此語出自《三國志·諸葛亮傳》原文：『如其不才，君可自取』，嘉靖本衍『為成都王』反為後人加筆。"},
    {"id":"sg_var_026","chapter":90,"section":"孔明揮淚斬馬謖",
     "maotext":"（孔明揮淚斬馬謖，蔣琬勸阻）",
     "jiajingtext":"（情節同，但嘉靖本有馬謖下獄後寫信給孔明一段，毛本改為當場斬首）",
     "type":"vt_plot","significance":"據《三國志》馬謖下獄後物故（死於獄中），非當場斬首；小說為加強戲劇性與『軍令狀』悲劇改為當場處斬。"},
    {"id":"sg_var_027","chapter":104,"section":"隕大星漢丞相歸天",
     "maotext":"（是夜天愁地慘，月色無光，孔明奄然歸天；天象有赤星自東北流于西南，投入亮營，三投再還）",
     "jiajingtext":"（流星描寫嘉靖本較簡，毛本加大段『天愁地慘』的氛圍渲染與讚詩）",
     "type":"vt_poetry","significance":"『赤星墜營』出自裴注引《晉陽秋》：『有星赤而芒角，自東北西南流，投於亮營，三投再還，往大還小。俄而亮卒』；毛本多加大量後人吊詩。"},
    {"id":"sg_var_028","chapter":119,"section":"假投降巧計成虛話",
     "maotext":"姜維假降鍾會，謀反魏復蜀，事敗被殺，姜維維膽大如斗。",
     "jiajingtext":"姜維假降鍾會，事敗死，文字較樸，『膽大如斗』之細節毛本渲染更詳。",
     "type":"vt_rewrite","significance":"姜維假降鍾會謀反事見《三國志》及裴注引《漢晉春秋》，大體為真；『膽大如斗』出自《華陽國志》。"},
    {"id":"sg_var_029","chapter":120,"section":"推士品孔明夫人（黃氏無醜名）",
     "maotext":"（毛本無黃氏容貌描寫，但坊間本多流傳『黃頭黑色』醜女形象，此說來自《襄陽記》）",
     "jiajingtext":"（嘉靖本同毛本不描容貌）",
     "type":"vt_typo","significance":"黃月英之名最早出自晚近小說/京劇，《三國志》及明本均無『黃月英』名與容貌細節；此為版本演變與後世改動的例子。"},
    {"id":"sg_var_030","chapter":120,"section":"三分局勢歸一統",
     "maotext":"自此三國歸于晉帝司馬炎，為太康元年，所謂『天下大勢，合久必分，分久必合』。",
     "jiajingtext":"自此三國歸於晉，『蒼天已死，黃天當立』之讖終應，歎息久矣。",
     "type":"vt_poetry","significance":"『天下大勢，合久必分，分久必合』開篇明言，結尾呼應；此句為毛宗崗自鑄偉辭，嘉靖本結段議論不同，著重歷史滄桑感而非循環史觀總結。"},
    {"id":"sg_var_031","chapter":"戰績","section":"張郃戰張飛·宕渠之戰回合數",
     "maotext":"兩將在火光中，戰到三五十合。",
     "jiajingtext":"戰到百十余合。",
     "yefengtext":"五六十合。",
     "huangtext":"十余合。",
     "type":"vt_plot","significance":"同一戰斗，四個版本單挑回合數相差 5 倍（十余合至百十余合）——這是三國武力評論網絡爭議的版本學根源。嘉靖本最長，黃正甫本最短，毛本取中。"}
]

# 版本演化關係（derivedFrom）
DERIVATIONS = [
    ("sg_version_zhouyuexiao","sg_version_jiajing","演義系，同承祖本"),
    ("sg_version_lizhuowu","sg_version_zhouyuexiao","合 240 則為 120 回，首加雙題回目"),
    ("sg_version_zhongbojing","sg_version_lizhuowu","明末評點系分支"),
    ("sg_version_maozonggang","sg_version_zhongbojing","毛氏父子全面評改，取代一切舊本"),
    ("sg_version_liyu","sg_version_lizhuowu","李漁另行評點"),
    ("sg_version_renwen","sg_version_maozonggang","現代校點本以毛本為底"),
    ("sg_version_shenbojun","sg_version_maozonggang","沈伯俊校理毛本，校明刊諸本"),
    ("sg_version_yefengchun","sg_version_jiajing","志傳系獨立發展，與演義系並列"),
    ("sg_version_yuxiangdou","sg_version_yefengchun","志傳系繁本"),
    ("sg_version_huangzhengfu","sg_version_yefengchun","志傳系簡本，或為更早狀態"),
]

# 評點關係
ANNOTATIONS = [
    ("sg_version_lizhuowu","sg_scholar_lizhuo","葉晝偽託李贄名"),
    ("sg_version_zhongbojing","sg_scholar_zhongxing","鍾惺（伯敬）"),
    ("sg_version_liyu","sg_scholar_liyu","李漁（笠翁）"),
    ("sg_version_maozonggang","sg_scholar_maolun","毛綸（聲山）"),
    ("sg_version_maozonggang","sg_scholar_maozonggang","毛宗崗（序始）"),
    ("sg_version_shenbojun","sg_scholar_shenbojun","沈伯俊校理"),
    ("sg_version_renwen","sg_scholar_guxuejie","顧學頡等校點"),
]

SCHOLARS = [
    ("sg_scholar_lizhuo","李贄（卓吾）","1527","1602","明末左派王學","小說評點"),
    ("sg_scholar_zhongxing","鍾惺（伯敬）","1574","1625","竟陵派","詩文評點"),
    ("sg_scholar_liyu","李漁（笠翁）","1611","1680","清初戲曲家","小說戲曲評點"),
    ("sg_scholar_maolun","毛綸（聲山）","~1610","~1690","清初評點派","三國/琵琶記評點"),
    ("sg_scholar_maozonggang","毛宗崗（序始）","1632","1709","清初評點派","三國評點"),
    ("sg_scholar_jinshengtan","金聖歎","1608","1661","明末評點派","水滸/西廂評點"),
    ("sg_scholar_luxun","魯迅","1881","1936","現代文學","中國小說史略論三國"),
    ("sg_scholar_huishi","胡適","1891","1962","現代國學","三國志演義序"),
    ("sg_scholar_zhengzhenduo","鄭振鐸","1898","1958","現代文學史","三國版本學"),
    ("sg_scholar_sunkaidi","孫楷第","1898","1986","版本目錄學","中國通俗小說書目"),
    ("sg_scholar_liucunren","柳存仁","1917","2009","海外漢學","三國版本考"),
    ("sg_scholar_xiaobo","小川環樹","1910","1993","日本漢學","三國演義版本研究"),
    ("sg_scholar_zhongchuanyu","中川諭","1948","?","日本漢學","三國演義版本研究"),
    ("sg_scholar_shenbojun","沈伯俊","1946","?","當代三國學","三國演義校理、版本與人物研究"),
    ("sg_scholar_tanliangxiao","譚良嘯","1944","?","當代三國學","三國文化研究"),
    ("sg_scholar_guxuejie","顧學頡","1913","1999","古典文獻","人文社三國校注"),
]

# ============================================================
# 構建 TTL ABox 段
# ============================================================
def build_edition_individuals():
    lines = []
    for e in EDITIONS:
        lines.append(f"""
###  http://localhost/sanguo-kg#{e['id']}
sg:{e['id']}  a  sg:LiteraryWork ;
    sg:versionId       "{e['id']}" ;
    sg:versionName     "{e['name']}" ;
    sg:editionYear     "{e['year']}"^^xsd:gYear ;
    sg:publisher       "{e['publisher']}" ;
    sg:survivalStatus  "{e['survival']}" ;
    sg:chapterCount    "{e['chapters']}" ;
    sg:familyLineage   "{e['family']}" ;
    sg:hasFulltext     "{str(e['fulltext']).lower()}"^^xsd:boolean ;
    sg:variantFeature  "{e['feature']}" ;
    rdfs:label         "{e['short']}" .""")
    return "\n".join(lines)

def build_scholar_individuals():
    lines = []
    for sid, name, by, dy, school, field in SCHOLARS:
        dy_str = f'''    sg:deathYear      "{dy}"^^xsd:gYear ;
''' if dy != "?" else ""
        lines.append(f"""
sg:{sid}  a  sg:Scholar ;
    sg:scholarId    "{sid}" ;
    sg:scholarName  "{name}" ;
    sg:birthYear    "{by}"^^xsd:gYear ;
{dy_str}    sg:school       "{school}" ;
    sg:researchField "{field}" ;
    rdfs:label      "{name}" .""")
    return "\n".join(lines)

def build_variant_individuals():
    lines = []
    lines.append("""
# ============================================================
# 十八、ABox：30+ 條核心異文 VariantReading 個體
#   每條異文鏈接毛本（sg_version_maozonggang）與嘉靖本（sg_version_jiajing），
#   標註異文類型（訛字/脫文/衍文/改寫/詩文/情節/評點）。
# ============================================================
""")
    for v in VARIANTS:
        mao = v.get("maotext","").replace('"',"'").replace("\n","")
        jiaj = v.get("jiajingtext","").replace('"',"'").replace("\n","")
        yef = v.get("yefengtext","").replace('"',"'").replace("\n","") if "yefengtext" in v else ""
        huang = v.get("huangtext","").replace('"',"'").replace("\n","") if "huangtext" in v else ""
        sig = v["significance"].replace('"',"'").replace("\n","")
        extra_yef = f'''    sg:variantReading_yefengchun  "{yef}" ;
''' if yef else ""
        extra_huang = f'''    sg:variantReading_huangzhengfu  "{huang}" ;
''' if huang else ""
        lines.append(f"""
sg:{v['id']}  a  sg:VariantReading ;
    sg:variantReading_maozonggang  "{mao}" ;
    sg:variantReading_jiajing      "{jiaj}" ;
{extra_yef}{extra_huang}    sg:variantChapter  {v['chapter']} ;
    sg:variantSection  "{v['section']}" ;
    sg:variantType     sg:{v['type']} ;
    sg:variantNote     "{sig}" ;
    rdfs:label         "異文 #{v['id'].replace('sg_var_','')}：{v['section']}" .""")
    return "\n".join(lines)

def build_relations_individuals():
    lines = ["\n# --- 版本演化 derivedFrom ---"]
    for src, dst, note in DERIVATIONS:
        lines.append(f"sg:{src} sg:derivedFrom sg:{dst} .")
    lines.append("\n# --- 評點 annotatedBy ---")
    for eid, sid, note in ANNOTATIONS:
        lines.append(f"sg:{eid} sg:annotatedBy sg:{sid} .")
    return "\n".join(lines)

def build_ttl():
    # 先去掉舊的 ABox（從 "# 【結束】" 之後整段刪除重寫）
    with open(TTL_PATH, "r", encoding="utf-8") as f:
        ttl = f.read()
    cut_marker = "# 【結束】"
    if cut_marker in ttl:
        ttl = ttl[:ttl.index(cut_marker)]
    ttl += HISTORY_TBOX_APPEND
    ttl += build_edition_individuals()
    ttl += build_scholar_individuals()
    ttl += build_variant_individuals()
    ttl += build_relations_individuals()
    ttl += """
# ============================================================
# 【結束】本文件為《三國演義》本體論完備 TBox+ABox v3.1-multiversion
#   TBox 595 行 + ABox 約 450 行；
#   包含 12 個版本個體、16 位學者個體、31 條核心異文、10 條版本演化邊、7 條評點邊。
#   04_knowledge_data/*.parquet（DuckDB 可查）、data/*.json（瀏覽器端讀取）
#   為剩餘 ABox（人物/勢力/戰役/地點/事件/器物/學術成果/衍生作品）。
#   可直接導入 Protégé / rdflib / GraphDB / Apache Jena 做推理。
# ============================================================
"""
    with open(TTL_PATH, "w", encoding="utf-8") as f:
        f.write(ttl)
    print(f"[ttl] written {len(ttl)} bytes, {ttl.count(chr(10))} lines")
    return ttl

# ============================================================
# D. 重寫 YAML 受控詞表
# ============================================================
def build_yaml():
    y = """# ============================================================
# 《三國演義》本體論受控詞表 v3.1
# 對應 sanguo_kg_ontology.ttl，所有枚舉值與 owl:NamedIndividual 對齊。
# 可直接用於前端搜索、數據錄入校驗、本體推理。
# ============================================================

# ---------- 1. 版本族系 ----------
version_family:
  yanyi:
    label: 演義系統（24 卷本）
    description: 以嘉靖壬午本為代表，24 卷 240 則單題，文字較近羅貫中原本面貌
    members: [jiajing, zhouyuexiao, xiazhenyu]
  zhizhuan:
    label: 志傳系統（20 卷本）
    description: 建陽書坊刻本群，獨有花關索故事，上圖下文，葉逢春本為首
    members: [yefengchun, yuxiangdou, huangzhengfu, liulongtian, zhudingchen]
  pingdian:
    label: 評點改造本（120 回本）
    description: 明末清初評點家合 240 則為 120 回，增加評點，改寫文字
    members: [lizhuowu, zhongbojing, liyu, maozonggang]
  modern:
    label: 現代整理本
    description: 現代學者校點/校注/校理本
    members: [renwen, shenbojun, zhonghua_huiping]
  sequel:
    label: 續書衍生
    description: 續三國/反三國/後三國等
    members: [fan, xu, hou]

# ---------- 2. 版本個體 ----------
editions:
"""
    for e in EDITIONS:
        y += f"""  {e['id'].replace('sg_version_','')}:
    id: {e['id']}
    name: {e['name']}
    short: {e['short']}
    family: {e['family']}
    year: {e['year']}
    publisher: {e['publisher']}
    survival: {e['survival']}
    chapters: {e['chapters']}
    has_fulltext: {e['fulltext']}
    feature: {e['feature']}
"""
    y += """
# ---------- 3. 虛實標註 ----------
fictional_flag:
  0:
    label: 正史有載
    description: 《三國志》/《後漢書》/《資治通鑑》有明確記載，與小說大體一致
    examples: [官渡之戰, 赤壁之戰, 夷陵之戰, 諸葛亮北伐, 曹操, 劉備, 孫權]
  1:
    label: 正史有載·小說加工
    description: 正史有原型，但細節、動機、形象被小說家美化/醜化/神化
    examples: [三顧茅廬, 草船借箭(原為孫權), 溫酒斬華雄(原為孫堅), 刮骨療毒(醫者非華佗)]
  2:
    label: 純虛構
    description: 正史完全無載，為民間傳說或小說家原創
    examples: [桃園結義, 過五關斬六將, 諸葛亮祭東風, 三英戰呂布, 貂蟬連環計, 八陣圖困陸遜, 周倉, 關索]

# ---------- 4. 異文類型 ----------
variant_type:
  vt_typo:
    label: 訛字（形近/音近而誤）
    examples: [范彊→范疆, 舁→抬]
  vt_missing:
    label: 脫文（後本脫漏原文）
    examples: [嘉靖本『好英雄』被毛本刪去]
  vt_extra:
    label: 衍文（後本增字）
    examples: [毛本加《臨江仙》開篇, 『為成都王』]
  vt_rewrite:
    label: 改寫（文字潤色、對仗、語氣變動）
    examples: [『寧使』→『寧教』, 『阿斗』→『後主』]
  vt_poetry:
    label: 詩文增刪
    examples: [毛本大量加入唐詩宋詞與後人吊詩]
  vt_plot:
    label: 情節增刪
    examples: [毛本刪「上方谷燒魏延」, 華佗為關公刮骨(張冠李戴)]
  vt_commentary:
    label: 評點增刪
    examples: [毛宗崗回前總評、夾批、夾評]

# ---------- 5. 人物類別（受控枚舉） ----------
person_category:
  civil_official: 文臣/謀士/宰輔
  general: 武將
  royalty: 帝王/后妃/宗室
  commoner: 平民/隱士/醫者/匠人
  minority: 少數民族（南蠻/羌/匈奴/山越/鮮卑/烏桓）
  woman: 女性
  fictional: 純虛構人物
  eunuch: 宦官
  consort: 外戚
  scholar: 文士/學者
  monk: 方士/僧人
  rebel: 起義者（黃巾等）

# ---------- 6. 勢力枚舉 ----------
factions:
  han: 東漢朝廷
  wei: 曹魏
  shu: 蜀漢
  wu: 東吳
  jin: 晉
  yellow_turban: 黃巾軍
  nanman: 南蠻
  qiang: 羌
  xiongnu: 匈奴
  shanyue: 山越
  xianbei: 鮮卑
  wuhuan: 烏桓
  warlord_yuan_shao: 袁紹
  warlord_yuan_shu: 袁術
  warlord_lv_bu: 呂布
  warlord_liu_biao: 劉表
  warlord_liu_zhang: 劉璋
  warlord_ma_teng: 馬騰/韓遂
  warlord_gongsun_zan: 公孫瓚
  warlord_zhang_lu: 張魯
  warlord_tao_qian: 陶謙
  warlord_kong_rong: 孔融
  warlord_liu_du: 劉度等零陵桂陽長沙武陵四郡

# ---------- 7. 計謀（三十六計語境下三國用到的） ----------
stratagems:
  empty_city: 空城計
  burning_camp: 火燒連營
  chain_strategy: 連環計
  self_injury: 苦肉計
  false_desertion: 詐降
  east_west: 聲東擊西
  beauty_trap: 美人計（連環計）
  chain_boat: 連環船
  borrow_arrow: 草船借箭
  capture_release: 七擒七縱
  feint: 佯攻/疑兵
  ambush: 埋伏/十面埋伏
  burning_xinye: 火燒新野
  burning_chibi: 火燒赤壁
  drowning: 水淹七軍
  lost_tingjie: 失街亭
  empty_path: 華容道
  ruse_zhouyu: 三氣周瑜
  letter_trap: 反間計（蔣幹盜書）
  empty_fort: 空城計（西城）

# ---------- 8. 五大敘事階段 ----------
narrative_phases:
  yellow_turban:
    label: 黃巾之亂
    period: 184-189
    chapters: [1, 2]
  dong_zhuo:
    label: 董卓之亂
    period: 189-192
    chapters: [3, 9]
  warlords:
    label: 群雄逐鹿
    period: 192-208
    chapters: [10, 42]
  tripod:
    label: 三國鼎立
    period: 208-234
    chapters: [43, 104]
  unification:
    label: 三國歸晉
    period: 234-280
    chapters: [105, 120]

# ---------- 9. 評點家/學者 ----------
scholars:
"""
    for sid, name, by, dy, school, field in SCHOLARS:
        y += f"""  {sid.replace('sg_scholar_','')}:
    id: {sid}
    name: {name}
    birth: {by}
    death: {dy}
    school: {school}
    field: {field}
"""
    y += """
# ---------- 10. 正史文獻 ----------
historical_sources:
  sanguozhi:
    label: 陳壽《三國志》
    era: 西晉（約 280-290）
    description: 正史，三國題材最核心史源
  pei_note:
    label: 裴松之注《三國志》
    era: 南朝宋（429）
    description: 裴注引書 200 餘種，保存大量魏晉雜史，為《三國演義》最主要的情節來源
  houhanshu:
    label: 范曄《後漢書》
    era: 南朝宋
  zitongjian:
    label: 司馬光《資治通鑑》
    era: 北宋
  weishu:
    label: 王沈《魏書》
    era: 曹魏
  weilve:
    label: 魚豢《魏略》
    era: 曹魏
  jiuyangong:
    label: 《漢晉春秋》
    era: 東晉
  huayangguo:
    label: 常璩《華陽國志》
    era: 東晉
  shanyang:
    label: 《山陽公載記》
    era: 曹魏
  jiangbiao:
    label: 《江表傳》
    era: 西晉
  zhaoyun_biezhuan:
    label: 《趙雲別傳》
    era: 西晉
  xiangyang:
    label: 《襄陽記》
    era: 東晉

# ---------- 11. 器物類型 ----------
artifact_type:
  weapon: 兵器
  horse: 名馬
  formation: 陣法
  invention: 發明創造
  seal: 印綬符節
"""
    with open(YAML_PATH, "w", encoding="utf-8") as f:
        f.write(y)
    print(f"[yaml] written {len(y)} bytes, {y.count(chr(10))} lines")
    return y

# ============================================================
# E. 寫 variants.json 給前端
# ============================================================
def build_variants_json():
    # 為每條異文補毛本、嘉靖本以外版本（如果有）
    for v in VARIANTS:
        v["editions_compared"] = ["maozonggang","jiajing"]
        if "yefengtext" in v:
            v["editions_compared"].append("yefengchun")
        if "huangtext" in v:
            v["editions_compared"].append("huangzhengfu")
    payload = {
        "title":"嘉靖壬午本 vs 毛宗崗本·核心異文對照（31 則）",
        "editions":EDITIONS,
        "derivations":[(s,d,n) for s,d,n in DERIVATIONS],
        "annotations":[(e,s,n) for e,s,n in ANNOTATIONS],
        "scholars":[{"id":sid,"name":n,"birth":b,"death":d,"school":sc,"field":f} for sid,n,b,d,sc,f in SCHOLARS],
        "variants":VARIANTS
    }
    with open(VARIANTS_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"[variants.json] written, {len(VARIANTS)} variants, {len(EDITIONS)} editions")
    return payload

# 另外更新 data/editions.json 的版本元數據（增補 has_fulltext 等字段）
def update_editions_json():
    # 如果現有 editions.json 已存在，與 EDITIONS 合併
    existing = []
    if os.path.exists(EDITIONS_JSON):
        with open(EDITIONS_JSON, "r", encoding="utf-8") as f:
            try:
                existing = json.load(f)
            except: existing=[]
    # 以本腳本 EDITIONS 為權威
    with open(EDITIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(EDITIONS, f, ensure_ascii=False, indent=2)
    print(f"[editions.json] updated, {len(EDITIONS)} editions")

if __name__ == "__main__":
    build_ttl()
    build_yaml()
    build_variants_json()
    update_editions_json()
    print("\n[done] ontology ABox + YAML + variants.json ready.")
