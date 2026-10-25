# 三國演義本體論 · Sanguo-Yanyi Multi-Edition Ontology

參考 [yejinlei/The-Story-of-the-Stone](https://yejinlei.github.io/The-Story-of-the-Stone) 的數字人文視覺語言與 [yejinlei/the-journey-to-the-west](https://github.com/yejinlei/the-journey-to-the-west) 的本體論建構範式（OWL 2 Turtle 本體 + 受控詞表 + 多 Agent 研究 + 靜態知識圖譜），為羅貫中《三國演義》建立面向**多版本對照、異文研究、人物關係知識圖譜**的開放數字人文工程。

## 目錄結構

```
sanguo/
├── 03_本體論規範/
│   ├── sanguo_kg_ontology.ttl   # OWL 2 本體（23 類 / 35 屬性）
│   └── vocabularies.yaml        # 受控詞表
├── build/                       # 數據構建腳本
│   ├── parse_chapters.py        # 原文切分 120 回 + 繁轉簡
│   ├── extract.py               # 實體抽取（人物/地點/勢力/計謀…）
│   ├── relations.py             # 關係抽取與圖譜構建
│   └── gen_pages.py             # 生成靜態站所有頁面
├── data/                        # 中間數據（JSON）
│   ├── editions.json            # ★ 12 個主要版本元數據 + 8 組異文案例
│   ├── chapters.json / read.json
│   ├── persons.json / factions.json / places.json
│   ├── battles.json / stratagems.json / artifacts.json
│   ├── prophecies.json / events.json
│   └── graph.json               # 力導向圖譜（關係 + 節點）
├── docs/                        # 靜態站（GitHub Pages 直接發布）
│   ├── index.html               # 總覽
│   ├── read.html                # ★ 正文閱讀器（毛本 59 萬字 / 120 回）
│   ├── versions.html            # ★ 版本源流譜（12 刊本 + SVG 族譜）
│   ├── variants.html            # ★ 異文對照（8 組經典案例）
│   ├── persons / factions / places / battles / stratagems / artifacts / prophecies
│   ├── relations.html           # 七類人物關係分組瀏覽
│   ├── graph.html               # 可拖拽力導向圖譜
│   ├── ontology.html            # 本體規範說明 + 文件下載
│   ├── themes.html / mirror.html
│   └── assets/app.css           # 宣紙底紋 + 朱批墨批設計系統
└── raw/                         # 各版本原文 TXT 目錄（用戶自行放入）
    ├── maozonggang.txt          # ✓ 已內置（Gutenberg #23950）
    ├── jiajing.txt              # 待放入（嘉靖壬午本 TXT）
    ├── zhouyuexiao/             # 待放入（周曰校本各卷 TXT）
    ├── huangzhengfu.txt
    └── yefengchun.txt
```

## 本體論建模

### 版本族兩大系統

- **演義系（通俗演義）**：以嘉靖壬午本（1522）為祖，經周曰校本（1591）、李卓吾評本（約1620），至毛宗崗本（1679）定型，一百二十回通行三百年。特點：文字雅化、刪去花關索故事、合併回目、強化正統論。
- **志傳系（三國志傳）**：以葉逢春本（1592）、余象斗本（1594）、黃正甫本（1625）、劉龍田本、朱鼎臣本為代表，多為閩建刻本。特點：保留花關索出身/征西川/下荊州故事、靜軒詩百餘首、文字質樸，是研究小說成書史的關鍵。

### 核心類（OWL Classes）

- **文本與版本**：`VersionFamily`（版本族）/ `Edition`（版本）/ `Volume`（卷）/ `Chapter`（回/則）/ `Paragraph`（段）/ `VariantReading`（異文）/ `Commentary`（評點）
- **四範疇**：`Wu`（物）/ `Shi`（事）/ `ShiJian`（時）/ `Di`（地）
- **主題實體**：`Person`（人物）/ `Faction`（勢力）/ `Office`（官職）/ `Place`（地點）/ `Artifact`（器物）/ `Battle`（戰役）/ `Stratagem`（計謀）/ `Event`（事件）/ `Prophecy`（讖緯）/ `Poem`（詩文）/ `Concept`（主題概念）

### 核心屬性（OWL Properties）

- 版本族譜：`belongsToFamily / derivedFrom / collatedWith / hasCommentator / correspondsTo`
- 異文：`variantOf / variantEdition / variantText / variantType / significance`
- 人物關係：`swornBrotherOf / fatherOf / lordOf / spouseOf / enemyOf / killedBy / recommended / defectedTo`
- 約束：函數性（FunctionalProperty）、傳遞性（TransitiveProperty）、對稱性（SymmetricProperty）、逆屬性（inverseOf）皆顯式標註，可在 Protégé/rdflib 中做推理。

## 版本收錄狀況（誠實標註）

| 版本 | 刊年 | 系統 | 全文 | 元數據 | 異文案例 |
|---|---|---|---|---|---|
| 毛宗崗評本（通行本） | 1679 | 演義 | ★ 59萬字/120回 | ✓ | ✓ |
| 嘉靖壬午本 | 1522 | 演義 | ✗（見下文） | ✓ | ✓ |
| 周曰校萬卷樓本 | 1591 | 演義 | ✗ | ✓ | ✓ |
| 李卓吾評本 | 1620 | 演義 | ✗ | ✓ | — |
| 李漁評本 | 1670 | 演義 | ✗ | ✓ | — |
| 鍾伯敬評本 | 1630 | 演義 | ✗ | ✓ | — |
| 人民文學出版社校訂本 | 1953 | 演義 | ✗ | ✓ | — |
| 葉逢春本 | 1592 | 志傳 | ✗ | ✓ | ✓ |
| 黃正甫本 | 1625 | 志傳 | ✗ | ✓ | ✓ |
| 余象斗雙峰堂本 | 1594 | 志傳 | ✗ | ✓ | — |
| 劉龍田喬山堂本 | 1600 | 志傳 | ✗ | ✓ | — |
| 朱鼎臣輯本 | 1600 | 志傳 | ✗ | ✓ | — |

### 為什麼其他版本沒有全文？

1. **嘉靖壬午本/葉逢春本/黃正甫本/余象斗本**的電子全文 TXT 主要流通於百度網盤（知乎《三國演義的一些版本資源》帖），沙箱無法登錄網盤下載；
2. **qidafang/sanguo** GitHub 倉庫曾提供完整 TXT 下載，但倉庫現已刪除（用戶頁面確認無公開倉庫）；
3. **識典古籍**（shidianguji.com，字節跳動公益項目）公開了周曰校本全文，但每卷 100+ 分頁、共 10 卷約 1500 頁，受反爬和分頁 SSR 限制，自動批量抓取在當前環境下無法穩定完成；
4. **番茄小說/微信讀書**等商業閱讀端的嘉靖本需登錄且正文被會員牆攔截；
5. **GitHub raw** 域名在當前沙箱網絡下被牆，所有國內外代理（jsdelivr/ghproxy/fastgit）要麼超時要麼返回 404。

**工程是可擴展的**：只要你手上有任何版本的 TXT 全文，放入 `raw/<edition_id>.txt`（如 `raw/jiajing.txt`），然後運行：

```bash
python3 build/parse_chapters.py --edition jiajing
python3 build/extract.py --edition jiajing
python3 build/gen_pages.py
```

即可自動將該版本納入異文比對、跨版本實體查詢、版本源流圖。我在 `data/editions.json` 裡已經預留好了所有 12 個版本的元數據和 ID。

## 異文案例（8 組）

版本學家公認的 8 組核心差異已完整收錄於「異文對照」頁，每組按**版本—文字—文獻學意義**三欄對照：

1. **曹操名言**：「寧我負人，毋人負我」（志傳系近史）→「寧使我負天下人」（嘉靖本）→「寧教我負天下人」（毛本，加重奸雄色彩）
2. **關公改印**：曹操初鑄「壽亭侯」印關公不拜、改鑄「漢壽亭侯」方拜的細節，嘉靖本存、毛本刪
3. **孔明燒魏延**：上方谷欲將魏延與司馬懿同燒，嘉靖本存、毛本全刪（神化諸葛亮）
4. **呂布白門樓罵劉備**：「大耳兒」粗鄙口吻在版本間的雅化痕跡
5. **花關索故事**：志傳系四則完整（出身/認父/征西川/下荊州），演義系全刪、毛本只剩殘影
6. **開篇《臨江仙》**：楊慎詞為毛宗崗所加，嘉靖本/李卓吾評本皆無
7. **靜軒詩去留**：百餘首靜軒（周禮）詩是志傳系標誌，毛本幾乎清除殆盡
8. **張郃戰張飛回合數**：嘉靖本「百餘合」，毛本改「三五十合」

## 在線閱讀統計（毛本）

- 總字數：**590,968 字**
- 人物：**132 位**（TOP5：曹操 2543 / 劉備 2509 / 諸葛亮 1861 / 關羽 943 / 呂布 858）
- 地點：**104 處**（TOP5：荊州 / 漢中 / 成都 / 徐州 / 祁山）
- 勢力 19 · 戰役 19 · 計謀 27 · 器物 17 · 讖緯 12 · 事件 13 · 人物關係 137 條

## 本地運行

```bash
cd docs && python3 -m http.server 8000
# 打開 http://localhost:8000
```

## 發布到 GitHub Pages

倉庫已內置 `.github/workflows/pages.yml`。把 `docs/` 目錄推到 GitHub 主分支，在倉庫 Settings → Pages 中將 Source 設為 "Deploy from a branch"、路徑選 `/docs`，即可自動部署。

## 緣起與致謝

- 視覺系統與站點結構參考：**yejinlei/The-Story-of-the-Stone**（宣紙底紋、朱批墨批、箋紙卡片、印章設計系統）
- 本體論架構參考：**yejinlei/the-journey-to-the-west**（OWL 2 分層建模、四範疇物事時地、受控詞表、名錄/主題雙層結構）
- 底本：Project Gutenberg #23950《三國志演義》（毛宗崗評本系統繁體排印本）
- 版本元數據主要參考：陳翔華《三國志演義版本叢考》、金文京《三國演義的世界》、[日]中川諭《三國演義版本考》、中華書局《三國演義》整理本說明、識典古籍版本說明
