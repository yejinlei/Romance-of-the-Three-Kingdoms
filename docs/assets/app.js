/**
 * 《三国演义》共享库（所有页面共用）
 * 整合数据、工具函数、showView 分发、所有渲染函数
 * UMD 兼容：浏览器里挂 window 全局
 */
(function(global){
  'use strict';

  /* ======================== 全局数据整合 ======================== */
  const data = (typeof SANGUO_DATA !== 'undefined') ? SANGUO_DATA : {};
  const TOP = (typeof SANGUO_TOPICS !== 'undefined') ? SANGUO_TOPICS : { relationsExtra:[], historical:[], commentsExtra:[], variantsExtra:[], events:[], stratagems:[], artifacts:[], poems:[], prophecies:[], factions:[], editionsExtra:[] };
  const ANN = (typeof SANGUO_ANNOTATIONS !== 'undefined') ? SANGUO_ANNOTATIONS : null;
  const ONT = (typeof SANGUO_ONTOLOGY !== 'undefined') ? SANGUO_ONTOLOGY : null;

  // 核心人物关系数据
  const relations = [
    {subject:"p1", predicate:"swornBrotherOf", object:"p2"},
    {subject:"p1", predicate:"swornBrotherOf", object:"p3"},
    {subject:"p2", predicate:"swornBrotherOf", object:"p3"},
    {subject:"p4", predicate:"lordOf", object:"p1"},
    {subject:"p5", predicate:"vassalOf", object:"p1"},
    {subject:"p6", predicate:"vassalOf", object:"p1"},
    {subject:"p7", predicate:"vassalOf", object:"p1"},
    {subject:"p8", predicate:"vassalOf", object:"p1"},
    {subject:"p9", predicate:"vassalOf", object:"p1"},
    {subject:"p10", predicate:"vassalOf", object:"p11"},
    {subject:"p11", predicate:"sonOf", object:"p1"},
    {subject:"p20", predicate:"sonOf", object:"p2"},
    {subject:"p21", predicate:"sonOf", object:"p2"},
    {subject:"p22", predicate:"sonOf", object:"p3"},
    {subject:"p23", predicate:"adoptedSonOf", object:"p1"},
    {subject:"p34", predicate:"marriedTo", object:"p1"},
    {subject:"p135", predicate:"marriedTo", object:"p1"},
    {subject:"p136", predicate:"marriedTo", object:"p1"},
    {subject:"p134", predicate:"marriedTo", object:"p4"},
    {subject:"p31", predicate:"lordOf", object:"p36"},
    {subject:"p31", predicate:"lordOf", object:"p40"},
    {subject:"p31", predicate:"lordOf", object:"p41"},
    {subject:"p31", predicate:"lordOf", object:"p42"},
    {subject:"p31", predicate:"lordOf", object:"p47"},
    {subject:"p31", predicate:"lordOf", object:"p48"},
    {subject:"p31", predicate:"lordOf", object:"p50"},
    {subject:"p32", predicate:"sonOf", object:"p31"},
    {subject:"p33", predicate:"sonOf", object:"p31"},
    {subject:"p34", predicate:"sonOf", object:"p32"},
    {subject:"p35", predicate:"vassalOf", object:"p31"},
    {subject:"p35", predicate:"vassalOf", object:"p32"},
    {subject:"p59", predicate:"sonOf", object:"p35"},
    {subject:"p60", predicate:"sonOf", object:"p35"},
    {subject:"p133", predicate:"marriedTo", object:"p32"},
    {subject:"p31", predicate:"fatherOf", object:"p32"},
    {subject:"p31", predicate:"fatherOf", object:"p33"},
    {subject:"p71", predicate:"lordOf", object:"p74"},
    {subject:"p71", predicate:"lordOf", object:"p75"},
    {subject:"p71", predicate:"lordOf", object:"p76"},
    {subject:"p71", predicate:"lordOf", object:"p77"},
    {subject:"p71", predicate:"lordOf", object:"p82"},
    {subject:"p72", predicate:"fatherOf", object:"p73"},
    {subject:"p72", predicate:"fatherOf", object:"p71"},
    {subject:"p73", predicate:"elderBrotherOf", object:"p71"},
    {subject:"p74", predicate:"swornBrotherOf", object:"p73"},
    {subject:"p98", predicate:"marriedTo", object:"p73"},
    {subject:"p99", predicate:"marriedTo", object:"p74"},
    {subject:"p100", predicate:"sisterOf", object:"p71"},
    {subject:"p100", predicate:"marriedTo", object:"p1"},
    {subject:"p137", predicate:"motherOf", object:"p71"},
    {subject:"p137", predicate:"motherOf", object:"p73"},
    {subject:"p138", predicate:"fatherOf", object:"p98"},
    {subject:"p138", predicate:"fatherOf", object:"p99"},
    {subject:"p93", predicate:"sonOf", object:"p77"},
    {subject:"p94", predicate:"grandsonOf", object:"p71"},
    {subject:"p101", predicate:"lordOf", object:"p102"},
    {subject:"p101", predicate:"lordOf", object:"p139"},
    {subject:"p101", predicate:"lordOf", object:"p142"},
    {subject:"p102", predicate:"adoptedSonOf", object:"p101"},
    {subject:"p120", predicate:"usedBy", object:"p119"},
    {subject:"p119", predicate:"opponentOf", object:"p101"},
    {subject:"p102", predicate:"lordOf", object:"p143"},
    {subject:"p102", predicate:"lordOf", object:"p144"},
    {subject:"p102", predicate:"marriedTo", object:"p120"},
    {subject:"p31", predicate:"opponentOf", object:"p1"},
    {subject:"p31", predicate:"opponentOf", object:"p71"},
    {subject:"p1", predicate:"opponentOf", object:"p71"},
    {subject:"p4", predicate:"opponentOf", object:"p35"},
    {subject:"p10", predicate:"opponentOf", object:"p58"},
    {subject:"p10", predicate:"opponentOf", object:"p57"}
  ];

  // 虚实对照数据（先用原数据，再与 annotation.js 的 plotAssessments 合并去重）
  const historicalContrast = [
    {chapter:1, plot:"桃园三结义", history:"史无明确记载刘关张结为兄弟，仅载「先主与二人寝则同床，恩若兄弟」", level:"史实加工", status:"embellished"},
    {chapter:5, plot:"温酒斩华雄", history:"华雄为孙坚所斩，非关羽", level:"移花接木", status:"transposed"},
    {chapter:5, plot:"三英战吕布", history:"孙坚击退吕布，刘关张并未参与虎牢关之战", level:"虚构", status:"fictional"},
    {chapter:21, plot:"煮酒论英雄", history:"史有曹操论刘备为英雄记载，但细节多为文学加工", level:"史实加工", status:"embellished"},
    {chapter:27, plot:"过五关斩六将", history:"关羽辞曹归刘为史实，但五关六将均为虚构，路线也不符合地理", level:"虚构", status:"fictional"},
    {chapter:46, plot:"草船借箭", history:"原型为孙权濡须口借箭，非诸葛亮", level:"移花接木", status:"transposed"},
    {chapter:49, plot:"借东风", history:"东风为长江流域冬季常见天气现象，非诸葛亮法术", level:"虚构", status:"fictional"},
    {chapter:50, plot:"华容道义释曹操", history:"刘备率兵追曹操不及，关羽并未在华容道守候", level:"虚构", status:"fictional"},
    {chapter:56, plot:"三气周瑜", history:"周瑜气量宽宏，并非被诸葛亮气死，病逝于西征途中", level:"虚构", status:"fictional"},
    {chapter:95, plot:"空城计", history:"诸葛亮未对司马懿使用空城计，原型为赵云偃旗息鼓退曹兵", level:"移花接木", status:"transposed"},
    {chapter:74, plot:"关羽水淹七军", history:"汉水泛滥自然天灾，非关羽人工决堤", level:"史实加工", status:"embellished"},
    {chapter:84, plot:"八阵图困陆逊", history:"诸葛亮有作八阵图记载，但并未困住陆逊", level:"虚构", status:"fictional"},
    {chapter:90, plot:"七擒孟获", history:"史载诸葛亮南征「攻心为上」，但七擒七纵无明确史料记载", level:"史实加工", status:"embellished"}
  ];

  // 汇评精选
  const comments = [
    {chapter:1, commenter:"毛宗岗", text:"人谓魏得天时、吴得地理、蜀得人和，乃三大国将兴，先有天公、地公、人公三小寇以引之……以三寇引出三国，是全部中宾主；以张角兄弟三人引出桃园兄弟三人，此又一回中宾主。"},
    {chapter:21, commenter:"毛宗岗", text:"孟德煮酒论英雄，其语咄咄逼人，云长乘间斩车胄，其气凛凛如生。英雄相遇，自是不同。"},
    {chapter:37, commenter:"李贽", text:"三顾茅庐，千古佳话。玄德之求贤，孔明之择主，两得之矣。非玄德无以成孔明，非孔明无以成玄德。"},
    {chapter:49, commenter:"毛宗岗", text:"赤壁之战，孙刘同心，周郎妙计，孔明神算，遂成千古第一火攻。"},
    {chapter:50, commenter:"李渔", text:"关公义释曹操，非独报旧恩也，亦见其胸襟磊落，不似世人趋炎附势。"},
    {chapter:85, commenter:"毛宗岗", text:"白帝城托孤，君臣至公，古今盛轨。玄德之知人，孔明之尽忠，千载之下犹令人泪下。"},
    {chapter:95, commenter:"钟惺", text:"空城计只可偶一用之，若再用必败。孔明唯其不得已而用，故成奇谋。"},
    {chapter:104, commenter:"毛宗岗", text:"「出师未捷身先死，长使英雄泪满襟」，千载下读武侯遗表，犹有余痛。"}
  ];

  // 异文数据
  const variants = [
    {chapter:1, item:"张角出身", mao:"那张角本是个不第秀才", jiajing:"角，初是个不第秀才", note:"两版一致，早期版本张角有秀才身份，汉代无秀才科，为后世说话人附会"},
    {chapter:5, item:"关公出战", mao:"(曹操)教酾热酒一杯，与关公饮了上马", jiajing:"操令酾热酒一盃，与关公饮了上马", note:"文字差异极小，毛本仅修饰语气"},
    {chapter:21, item:"刘备失箸", mao:"手中所执匙筯，不觉落于地下……从容俯首拾筯曰：「一震之威，乃至于此。」", jiajing:"玄德以手中匙筯尽落于地……玄德答曰：「圣人云『迅雷风烈必变』，一震之威，乃至于此。」", note:"毛本修改为更从容掩饰，符合刘备韬光养晦性格，为毛宗岗重要改笔"},
    {chapter:25, item:"汉寿亭侯", mao:"表奏朝廷，封云长为汉寿亭侯", jiajing:"铸印送与关公，印之曰「寿亭侯印」，关公推辞不受，后改「汉寿亭侯之印」方受", note:"毛本纠正了嘉靖本的常识错误：汉寿为地名，亭侯为爵名，并非「汉朝的寿亭侯」"},
    {chapter:50, item:"华容道", mao:"云长义释曹操", jiajing:"关公放曹操一行过去", note:"毛本强化关公「义绝」形象，增加大量心理描写与诗词赞颂"}
  ];

  // 计谋列表
  const stratagems = [
    {id:"s1", name:"连环计", user:"王允、庞统", usedIn:["b6","b18"], description:"王允以貂蝉离间董卓吕布；庞统献连环计让曹操锁战船", type:"离间"},
    {id:"s2", name:"苦肉计", user:"黄盖、周瑜", usedIn:["b18"], description:"黄盖故意被周瑜责打，诈降曹操", type:"诈降"},
    {id:"s3", name:"空城计", user:"诸葛亮", usedIn:["b31"], description:"城门大开，抚琴退司马懿大军", type:"疑兵"},
    {id:"s4", name:"反间计", user:"曹操、周瑜", usedIn:["b22","b18"], description:"曹操抹书间韩遂；周瑜假书骗蒋干杀蔡瑁张允", type:"离间"},
    {id:"s5", name:"火攻计", user:"周瑜、陆逊", usedIn:["b18","b28"], description:"火烧赤壁；火烧连营七百里", type:"火攻"},
    {id:"s6", name:"借刀杀人", user:"曹操", usedIn:[], description:"借黄祖之手杀祢衡", type:"借势"},
    {id:"s7", name:"声东击西", user:"贾诩、诸葛亮", usedIn:["b9"], description:"贾诩屡破曹操；诸葛亮北伐声东击西", type:"疑兵"},
    {id:"s8", name:"走为上计", user:"刘备", usedIn:["b31"], description:"刘备屡败屡走，终成帝业", type:"撤退"}
  ];

  // 诗词列表
  const poems = [
    {title:"临江仙·滚滚长江东逝水", author:"杨慎", chapter:0, content:"滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢。古今多少事，都付笑谈中。"},
    {title:"七步诗", author:"曹植", chapter:79, content:"煮豆燃豆萁，豆在釜中泣。本是同根生，相煎何太急。"},
    {title:"出师表（节选）", author:"诸葛亮", chapter:91, content:"臣本布衣，躬耕于南阳，苟全性命于乱世，不求闻达于诸侯。先帝不以臣卑鄙，猥自枉屈，三顾臣于草庐之中……"},
    {title:"赤壁怀古", author:"杜牧（引）", chapter:49, content:"东风不与周郎便，铜雀春深锁二乔。"},
    {title:"蜀相（引）", author:"杜甫（引）", chapter:104, content:"出师未捷身先死，长使英雄泪满襟。"}
  ];

  // 谶纬预言
  const prophecies = [
    {content:"苍天已死，黄天当立；岁在甲子，天下大吉", prophet:"张角", fulfilled:["黄巾起义"], chapter:1},
    {content:"千里草，何青青，十日卜，不得生", prophet:"童谣", fulfilled:["董卓之死"], chapter:9},
    {content:"三马同槽", prophet:"曹操梦中", fulfilled:["司马懿父子专权"], chapter:78},
    {content:"伏龙凤雏，二人得一，可安天下", prophet:"司马徽", fulfilled:["刘备得诸葛亮庞统"], chapter:35}
  ];

  /* ======================== 合并扩充数据 ======================== */
  const T2S = (typeof global.t2s === 'function') ? global.t2s : (typeof globalThis.t2s === 'function' ? globalThis.t2s : null);
  const T2S_MAP_INLINE = {'關':'关','張':'张','劉':'刘','諸':'诸','趙':'赵','馬':'马','黃':'黄','龐':'庞','孫':'孙','權':'权','魯':'鲁','呂':'吕','陸':'陆','顧':'顾','寧':'宁','統':'统','蓋':'盖','韓':'韩','蔣':'蒋','費':'费','禕':'祎','鄧':'邓','鍾':'钟','顏':'颜','醜':'丑','遼':'辽','詡':'诩','維':'维','會':'会','師':'师','騰':'腾','岱':'岱','遂':'遂','琦':'琦','琮':'琮','瑁':'瑁','越':'越','璋':'璋','嚴':'严','寶':'宝','進':'进','紹':'绍','術':'术','紀':'纪','靈':'灵','勳':'勋','楊':'杨','傕':'傕','儒':'儒','雄':'雄','濟':'济','宮':'宫','順':'顺','霸':'霸','蟬':'蝉','祖':'祖','蔡':'蔡','蒯':'蒯','禪':'禅','讖':'谶','譙':'谯','遜':'逊','堅':'坚','策':'策','皓':'皓','叡':'睿','奐':'奂','邕':'邕','衡':'衡','禰':'祢','許':'许','攸':'攸','郃':'郃','瓊':'琼','惇':'惇','淵':'渊','晃':'晃','緒':'绪','誕':'诞','欽':'钦','儉':'俭','表':'表','松':'松','正':'正','顏':'颜','良':'良','覽':'览','配':'配','圖':'图','豐':'丰','授':'授','譚':'谭','尚':'尚','熙':'熙','幹':'干'};
  function simpleT2S(s){ if(!s) return s; if(typeof T2S==='function') return T2S(s); return String(s).split('').map(c=>T2S_MAP_INLINE[c]||c).join(''); }
  function normName(s){ return simpleT2S(s); }
  function personIdByName(name){ const n=normName(name); const p=(data.persons||[]).find(x=>normName(x.name)===n); return p?p.id:null; }

  if(TOP.relationsExtra){
    for(const r of TOP.relationsExtra){
      const s=personIdByName(r.subjectName), o=personIdByName(r.objectName);
      if(s&&o) relations.push({subject:s, predicate:r.predicate, object:o});
    }
  }
  if(TOP.historical) historicalContrast.push(...TOP.historical);
  if(ANN && ANN.plotAssessments){
    for(const h of ANN.plotAssessments){
      const exists = historicalContrast.find(x=>x.chapter===h.chapter && x.plot===h.plot);
      if(!exists) historicalContrast.push({chapter:h.chapter, plot:h.plot, history:h.history, level: ({fact:'史实',embellished:'史实加工',transposed:'移花接木',fictional:'虚构'})[h.status]||'史实加工', status:h.status});
    }
  }
  if(TOP.commentsExtra) comments.push(...TOP.commentsExtra);
  if(TOP.variantsExtra) variants.push(...TOP.variantsExtra);
  if(TOP.stratagems) stratagems.push(...TOP.stratagems);
  if(TOP.poems) poems.push(...TOP.poems);
  if(TOP.prophecies) prophecies.push(...TOP.prophecies);
  const eventsData = (TOP.events||[]);
  const artifactsData = (TOP.artifacts||[]);
  const factionsData = (TOP.factions||[]);
  const editionsExtra = (TOP.editionsExtra||[]);

  function uniqInPlace(arr, keyFn){
    const map=new Map();
    for(const x of arr) map.set(keyFn(x), x);
    arr.length=0; arr.push(...map.values());
  }
  uniqInPlace(stratagems, s=>s.name);
  uniqInPlace(poems, p=>p.title);
  uniqInPlace(prophecies, p=>p.content);
  uniqInPlace(comments, c=>c.commenter+'|'+c.chapter+'|'+String(c.text).slice(0,24));
  uniqInPlace(variants, v=>v.chapter+'|'+v.item);
  uniqInPlace(historicalContrast, h=>h.chapter+'|'+h.plot);

  /* ======================== 工具函数 ======================== */
  // 虚实徽章（统一渲染）
  const STATUS_META = {
    fact:       { label:'史实',      cls:'badge-fact',       color:'#006400' },
    embellished:{ label:'史实加工',   cls:'badge-embellished',color:'#8b6914' },
    transposed: { label:'移花接木',   cls:'badge-transposed', color:'#e65100' },
    fictional:  { label:'虚构',      cls:'badge-fictional',  color:'#8b0000' }
  };
  function virtualBadge(status){
    if(!status) return '';
    const meta = STATUS_META[status] || STATUS_META.embellished;
    return `<span class="badge ${meta.cls}">${meta.label}</span>`;
  }
  function statusFromLevel(level){
    const m = {'史实':'fact','史实加工':'embellished','移花接木':'transposed','虚构':'fictional'};
    return m[level] || 'embellished';
  }
  function levelFromStatus(status){
    const m = {'fact':'史实','embellished':'史实加工','transposed':'移花接木','fictional':'虚构'};
    return m[status] || '史实加工';
  }

  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // LCS 比对算法
  function lcsDiffFn(a, b){
    if(!a||!b) return { onlyA:'', onlyB:'' };
    const m=a.length, n=b.length;
    const dp = Array(m+1).fill(0).map(()=>Array(n+1).fill(0));
    for(let i=1;i<=m;i++)for(let j=1;j<=n;j++) dp[i][j] = a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    let i=m,j=n; const common=[];
    while(i>0&&j>0){ if(a[i-1]===b[j-1]){common.push(a[i-1]);i--;j--;} else if(dp[i-1][j]>dp[i][j-1]) i--; else j--; }
    const commonStr=common.reverse().join('');
    const strip=(s)=>{ let out='',k=0; for(const ch of s){ if(k<commonStr.length&&ch===commonStr[k]){k++;continue;} out+=ch; } return out; };
    return { onlyA:strip(a), onlyB:strip(b) };
  }

  /* ======================== 状态 ======================== */
  let currentView = 'home';
  let currentChapter = 1;
  let currentEdition = 'mao';

  /* ======================== showView 分发 ======================== */
  function showView(viewName, contentEl){
    currentView = viewName;
    const content = contentEl || document.getElementById('main-content');
    if(!content) return;
    switch(viewName) {
      case 'home':          renderHome(content); break;
      case 'reader':        renderReader(content); break;
      case 'heros':         renderHeros(content); break;
      case 'persons':       renderPersons(content); break;
      case 'factions':      renderFactions(content); break;
      case 'places':        renderPlaces(content); break;
      case 'battles':       renderBattles(content); break;
      case 'events':        renderEvents(content); break;
      case 'stratagems':    renderStratagems(content); break;
      case 'artifacts':     renderArtifacts(content); break;
      case 'poems':         renderPoems(content); break;
      case 'versions':      renderVersions(content); break;
      case 'variants':      renderVariants(content); break;
      case 'comments':      renderComments(content); break;
      case 'historical':    renderHistorical(content); break;
      case 'prophecy':      renderProphecy(content); break;
      case 'scholars':      renderScholars(content); break;
      case 'readmethod':    renderReadMethod(content); break;
      case 'academic':      renderAcademic(content); break;
      case 'adaptations':   renderAdaptations(content); break;
      case 'relation-graph': renderRelationGraph(content); break;
      case 'map':           renderMap(content); break;
      case 'query':         renderQuery(content); break;
      case 'statistics':    renderStatistics(content); break;
      case 'ontology':      renderOntology(content); break;
      case 'about':         renderAbout(content); break;
      default: renderHome(content);
    }
    content.scrollTop = 0;
  }

  /* ======================== 渲染函数 ======================== */

  function renderHome(el){
    const annCount = ANN && ANN.editionAssertions ? ANN.editionAssertions.length : 0;
    const plotCount = ANN && ANN.plotAssessments ? ANN.plotAssessments.length : 0;
    const commIdx = ANN && ANN.commentaryIndex ? ANN.commentaryIndex.length : 0;
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold ink-title pb-4 mb-4">三国演义深度本体论</h1>
        <p class="text-xl text-[#5a3a1a]">一部书 · 十九版本 · 二〇〇人物 · 五十大战役 · 四一家评点 · 虚实有据</p>
        <p class="text-sm text-[#8b6914] mt-2">OWL 2 DL 本体 · 公版结论 · 名家评注 · 纯前端静态站</p>
      </div>

      <div class="ancient-border p-6 rounded-lg mb-6">
        <h2 class="text-xl font-bold text-[#8b0000] mb-4">📖 项目定位</h2>
        <p class="mb-3">本项目以本库 19 种古本/评本/史书为文献基础，构建《三国演义》深度本体论。全书分四层：文献层（版本·单元·异文）、叙事层（人物·战役·计谋）、评注层（毛宗岗/李卓吾/钟伯敬/笠翁四家评点）、结论层（公版学术论断·名家结论·虚实断语）。</p>
        <p class="mb-3">核心设计：虚构实体（貂蝉、关索）与史实实体（关羽、诸葛亮）同为一等公民，挂"史实/史实加工/移花接木/虚构"四级标签。章学诚"七分实事，三分虚构"——虚虚实实皆入图谱。</p>
        <p>收录毛宗岗本 120 回完整原文，繁/简/白话三态切换；嘉靖壬午本、周曰校、余象斗、叶逢春、黄正甫、钟伯敬、李卓吾、笠翁、七家汇评、三国志裴注、三国志平话、花关索传等版本语料与断语。</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">📚 文献层 · 已收录</h3>
          <ul class="text-sm space-y-1">
            <li>• 毛宗岗评本（120 回 · 清康熙）</li>
            <li>• 嘉靖壬午本（240 则 · 明嘉靖）</li>
            <li>• 周曰校、余象斗、黄正甫、叶逢春、熊清波、夏振宇、朱鼎臣、郑少垣、刘龙田</li>
            <li>• 李卓吾、钟伯敬、笠翁、七家汇评本</li>
            <li>• 三国志平话、花关索传、三国志裴松之注</li>
            <li class="text-[#006400]">• 公版版本结论 ${annCount} 条 · 情节虚实 ${plotCount} 条</li>
          </ul>
        </div>
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">🗂️ 叙事层 · 实体</h3>
          <ul class="text-sm space-y-1">
            <li>• 核心人物 ${(data.persons||[]).length} 人（蜀魏吴群雄）</li>
            <li>• 地理要地 ${(data.places||[]).length} 处</li>
            <li>• 经典战役 ${(data.battles||[]).length} 场</li>
            <li>• 事件 ${eventsData.length} 件 · 计谋 ${stratagems.length} 条</li>
            <li>• 器物 ${artifactsData.length} 件 · 诗词 ${poems.length} 篇</li>
            <li>• 评点精选 ${comments.length} 条 · 重点回目评注挂接 ${commIdx} 条</li>
          </ul>
        </div>
      </div>

      <div class="ancient-border p-6 rounded-lg mb-6">
        <h2 class="text-xl font-bold text-[#8b0000] mb-4">🎯 五板块导航</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-center">
          <a class="card" href="index.html#home"><h3>导论·总览</h3><p>项目定位与收藏统计</p></a>
          <a class="card" href="read.html"><h3>版本阅读</h3><p>阅读器 · 版本谱 · 异文对勘</p></a>
          <a class="card" href="graph.html"><h3>本体图谱</h3><p>实体八志 · 关系网 · 地图 · 查询</p></a>
          <a class="card" href="research.html"><h3>学术研究</h3><p>评点汇 · 虚实辨 · 天命谶 · 名家</p></a>
          <a class="card" href="topics.html"><h3>专题深研</h3><p>英雄谱 · 演义外</p></a>
        </div>
      </div>

      <div class="text-center text-sm text-[#8b6914]">
        <p>开篇词曰：滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。青山依旧在，几度夕阳红。</p>
      </div>
    </div>`;
  }

  /* ---- 阅读器（多版本 + 繁/简/白三体 + 批注显隐 + URL 深链） ---- */
  // 评点家四家（批注分栏显隐）
  const ANNOT_CRITICS = [
    { id:'maozigang', name:'毛宗岗' },
    { id:'lizhi', name:'李卓吾' },
    { id:'zhongxing', name:'钟伯敬' },
    { id:'liyuweng', name:'李渔' }
  ];
  // 阅读状态（edition / unit / unit2 / lang / annot，写入 URL 支持深链复现）
  const readerState = {
    edition: 'mao',
    lang: 'traditional',
    annot: { all:true, maozigang:true, lizhi:true, zhongxing:true, liyuweng:true }
  };
  let readerUrlParsed = false;

  // textStatus 受控词表标签（与 ontology-schema.js Vocab_textStatus 一致）
  const TEXT_STATUS_LABEL = { full:'全文入库', partial:'部分入库', ocr:'仅OCR（检索用）', facsimile:'仅影印', absent:'未获' };

  // 由 corpus-manifest 清单字段派生 textStatus（清单无该字段，运行时派生）
  function deriveItemTextStatus(it){
    if(!it) return 'absent';
    if(it.id === 'mao') return 'full';      // text.js 120 回全文已接入站内阅读
    if(it.ocr) return 'ocr';                // 仅 OCR，检索用
    if(it.chars > 0) return 'partial';      // 文本已入库语料库
    return 'absent';                        // 文本未入库
  }
  function deriveGapTextStatus(g){
    if(/OCR/.test(g.status || '')) return 'ocr';
    if(/部分可得/.test(g.status || '')) return 'partial';
    if(/不收錄|不收录|拿不到/.test((g.status || '') + (g.tier || ''))) return 'absent';
    return 'facsimile';                     // 未獲文本而有影印 → 仅影印
  }

  // 版本清单（corpus items + gaps 合并去重），含派生 textStatus
  function buildVersionRows(){
    const corpus = (typeof SANGUO_CORPUS !== 'undefined') ? SANGUO_CORPUS : null;
    const rows = [];
    const norm = s => String(s || '').replace(/[（(][^)）]*[)）]/g, '').replace(/[/／\s·、]/g, '');
    const seenTitles = {};
    if(corpus && Array.isArray(corpus.items)){
      corpus.items.forEach(it => {
        if(/^cmt-/.test(it.id) || /-front$/.test(it.id) || it.id === 'mao-dufa') return; // 卷首/评语辑录不作阅读版本
        seenTitles[norm(it.title)] = true;
        rows.push({ id: it.id, title: it.title, status: deriveItemTextStatus(it), chars: it.chars || 0, units: it.units || null });
      });
    }
    if(corpus && Array.isArray(corpus.gaps)){
      corpus.gaps.forEach(g => {
        if(seenTitles[norm(g.edition)]) return;
        rows.push({ id: 'gap:' + g.edition, title: g.edition, status: deriveGapTextStatus(g), chars: 0, units: null, gapNote: (g.status || '') + '；' + (g.tier || '') });
      });
    }
    return rows;
  }

  // URL 深链：解析 ?edition=&unit=&unit2=&lang=&annot=（兼容旧 ?chapter= / ?c=）
  function parseReaderUrl(){
    if(readerUrlParsed) return;
    readerUrlParsed = true;
    const qs = new URLSearchParams(location.search);
    const ed = qs.get('edition');
    if(ed) readerState.edition = ed;
    let u = parseInt(qs.get('unit') != null ? qs.get('unit') : (qs.get('chapter') != null ? qs.get('chapter') : qs.get('c')), 10);
    if(!isNaN(u)){
      currentChapter = Math.max(1, Math.min(120, u));
    } else {
      const u2 = qs.get('unit2');
      if(u2){
        const ch = (data.chapters || []).find(c => String(c.jiajingId) === String(u2));
        if(ch) currentChapter = ch.id;
      }
    }
    const lang = qs.get('lang');
    if(lang && ['traditional','simplified','vernacular'].includes(lang)){
      readerState.lang = lang;
    } else {
      const saved = localStorage.getItem('sanguo-reader-mode');
      readerState.lang = ['traditional','simplified','vernacular'].includes(saved) ? saved : 'traditional';
    }
    const annot = qs.get('annot');
    if(annot != null){
      if(annot === 'all'){
        readerState.annot = { all:true, maozigang:true, lizhi:true, zhongxing:true, liyuweng:true };
      } else if(annot === 'none'){
        readerState.annot = { all:false, maozigang:false, lizhi:false, zhongxing:false, liyuweng:false };
      } else {
        const off = annot.indexOf('off:') === 0;
        const ids = (off ? annot.slice(4) : annot).split(',').map(s => s.trim()).filter(Boolean);
        readerState.annot.all = !off;
        ANNOT_CRITICS.forEach(c => { readerState.annot[c.id] = ids.indexOf(c.id) >= 0; });
      }
    }
  }

  // 阅读状态写回 URL（replaceState，避免历史栈膨胀）
  function syncReaderUrl(){
    const qs = new URLSearchParams();
    qs.set('edition', readerState.edition);
    qs.set('unit', String(currentChapter));
    const chMeta = (data.chapters || []).find(c => c.id === currentChapter);
    if(chMeta && chMeta.jiajingId) qs.set('unit2', String(chMeta.jiajingId));
    qs.set('lang', readerState.lang);
    const onIds = ANNOT_CRITICS.filter(c => readerState.annot[c.id]).map(c => c.id);
    let annotVal;
    if(!readerState.annot.all) annotVal = onIds.length ? ('off:' + onIds.join(',')) : 'none';
    else annotVal = (onIds.length === ANNOT_CRITICS.length) ? 'all' : onIds.join(',');
    qs.set('annot', annotVal);
    history.replaceState(null, '', location.pathname + '?' + qs.toString() + location.hash);
  }

  function renderReader(el){
    parseReaderUrl();
    const chapterNum = currentChapter;
    const chapter = (data.chapters||[]).find(c => c.id === chapterNum) || { title: '' };
    const chapterText = (typeof CHAPTER_TEXT !== 'undefined' && CHAPTER_TEXT[chapterNum]) ? CHAPTER_TEXT[chapterNum] : { title:'', text:'', preComment:'' };
    const mode = readerState.lang;

    // 版本行（corpus-manifest 派生 textStatus）
    const vrows = buildVersionRows();
    const vrow = vrows.find(v => v.id === readerState.edition) || null;
    const readable = !!(vrow && vrow.status === 'full');

    // 三体处理：繁=原文原样 / 简=t2s.js 转换 / 白=编者自撰导读
    let bodyHTML = '';
    let viewLabel = '';
    let viewDesc = '';
    let sourceLayer = '';
    if(!readable){
      const st = vrow ? vrow.status : 'absent';
      bodyHTML = `<div class="empty-state">
        <h3 class="text-lg font-bold mb-2">本版本无可读全文</h3>
        <p class="text-sm">版本「${esc(vrow ? vrow.title : readerState.edition)}」文本状态：<strong>${TEXT_STATUS_LABEL[st] || st}</strong>${vrow && vrow.gapNote ? `（${esc(vrow.gapNote)}）` : ''}。</p>
        <p class="text-sm mt-2">站内逐回全文现仅接入毛宗岗本（text.js 120 回）；${st === 'partial' ? '本版本材料已入库语料库，' : '本版本无入库可读文本，'}可至「多版本语料库」「影印本阅读」查看相关材料。</p>
      </div>`;
      viewLabel = '版本说明';
      viewDesc = '所选版本未接入站内全文阅读。';
      sourceLayer = '无正文层（版本状态说明）';
    } else if(mode==='traditional'){
      bodyHTML = chapterText.text || '';
      viewLabel = '繁体原文';
      viewDesc = '古籍原貌，未作现代标点改动。';
      sourceLayer = '原文层 · 毛宗岗本正文（繁体原样）';
    } else if(mode==='simplified'){
      bodyHTML = simpleT2S(chapterText.text || '');
      viewLabel = '简体';
      viewDesc = '以 t2s.js 繁→简逐字转换，仅供现代读者快速浏览。';
      sourceLayer = '原文层 · 毛宗岗本正文（t2s.js 繁转简）';
    } else if(mode==='vernacular'){
      bodyHTML = renderVernacularGuide(chapterNum);
      viewLabel = '白话导读';
      viewDesc = '编者所撰 · 非原文：据站内元数据编排的本回导读，非原文翻译。';
      sourceLayer = '编者导读层 · 编者所撰（非原文）';
    }

    const prevChapter = chapterNum - 1;
    const nextChapter = chapterNum + 1;

    // 批注块（annotations.js commentaryIndex 评注 + text.js 回前评归毛宗岗栏），按评点家分栏
    const critName = id => {
      const c = ANNOT_CRITICS.find(x => x.id === id);
      return c ? c.name : id;
    };
    const idx = (ANN && Array.isArray(ANN.commentaryIndex)) ? ANN.commentaryIndex : [];
    const annotBlocksHTML = idx.filter(a => a.unit === chapterNum).map(a => `
              <div class="mb-3 p-3 bg-[#faf6ec] rounded text-sm border-l-4 border-[#8b6914]" data-annot-critic="${a.criticId}">
                <span class="comment-text font-bold">【${critName(a.criticId)}评】</span>
                ${esc(a.summary || '')}
                ${a.excerpt ? `<div class="mt-1 text-xs text-[#8b6914]">摘句：${esc(a.excerpt)}</div>` : ''}
              </div>`).join('');
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-4">版本阅读</h1>

      <div class="reader-layout">
        <!-- 回目侧栏 -->
        <div class="reader-toc">
          <h3 class="font-bold text-[#8b0000] mb-2 text-center">回目列表</h3>
          ${(data.chapters||[]).map(c=>`
            <div class="reader-toc-item ${c.id===chapterNum?'active':''}" onclick="appGoChapter(${c.id})">
              第${c.id}回 ${c.title}
            </div>
          `).join('')}
        </div>

        <!-- 正文 -->
        <div class="reader-body">
          <div class="reader-toolbar">
            <div class="flex gap-2 items-center">
              <label class="font-bold">版本：</label>
              <select id="edition-select" class="border border-[#c9b896] rounded px-2 py-1 bg-white"
                onchange="appSetEdition(this.value)">
                ${vrows.map(v=>{
                  const dis = (v.status!=='full' && v.status!=='partial');
                  return `<option value="${esc(v.id)}" ${v.id===readerState.edition?'selected':''} ${dis?'disabled':''}>${esc(v.title)}（${TEXT_STATUS_LABEL[v.status]||v.status}）</option>`;
                }).join('')}
              </select>
            </div>
            <div class="flex gap-1 items-center">
              <span class="font-bold mr-1">语体：</span>
              <button class="btn btn-sm ${mode==='traditional'?'active':''}" onclick="appSetReaderMode('traditional')">繁体</button>
              <button class="btn btn-sm ${mode==='simplified'?'active':''}" onclick="appSetReaderMode('simplified')">简体</button>
              <button class="btn btn-sm ${mode==='vernacular'?'active':''}" onclick="appSetReaderMode('vernacular')">白话</button>
            </div>
            <div class="text-sm text-[#8b6914]">
              第 ${chapterNum} 回 / 共 120 回${vrow ? ` · ${esc(vrow.title)}（${TEXT_STATUS_LABEL[vrow.status]||vrow.status}）` : ''}
            </div>
            <a class="text-sm text-[#8b0000] underline ml-auto" href="corpus.html#ed=${encodeURIComponent(readerState.edition)}&c=${chapterNum}">多版本对读 →</a>
          </div>

          <!-- 批注显隐：总开关 + 按评点家（毛宗岗/李卓吾/钟伯敬/李渔）分栏 -->
          <div class="annot-toolbar text-sm flex flex-wrap gap-3 items-center border-b border-[#c9b896] pb-2 mb-3">
            <span class="font-bold">批注：</span>
            <label class="flex items-center gap-1"><input type="checkbox" id="annot-toggle-all" ${readerState.annot.all?'checked':''} onchange="appSetAnnot('all', this.checked)"> 总开关</label>
            ${ANNOT_CRITICS.map(c=>`
              <label class="flex items-center gap-1"><input type="checkbox" data-annot-toggle="${c.id}" ${readerState.annot[c.id]?'checked':''} onchange="appSetAnnot('${c.id}', this.checked)"> ${c.name}</label>
            `).join('')}
          </div>

          <div class="reader-content">
            <h2>第${chapterNum}回 ${chapterText.title}</h2>
            <p class="text-center text-sm text-[#8b6914] mb-1">当前视图：${viewLabel} · ${viewDesc}</p>
            <p class="text-center text-xs text-[#8b0000] mb-4" id="source-layer">来源层级：${sourceLayer}</p>
            ${chapterText.preComment ? `
              <div class="mb-4 p-3 bg-[#f5f0e6] rounded text-sm border-l-4 border-[#8b0000]" data-annot-critic="maozigang">
                <span class="comment-text font-bold">【毛宗岗回前评】</span>
                ${chapterText.preComment}
              </div>` : ''}
            <div class="ancient-text" id="reader-text-body">${bodyHTML}</div>
            ${annotBlocksHTML ? `
            <div class="mt-6 pt-4 border-t border-[#c9b896]" id="annot-section">
              <h3 class="font-bold text-[#8b0000] mb-2">评点批注（按评点家分栏）</h3>
              ${annotBlocksHTML}
            </div>` : ''}

            <div class="flex justify-between mt-8 pt-4 border-t border-[#c9b896]">
              <button class="btn" ${chapterNum===1?'disabled style="opacity:0.5;cursor:not-allowed"':''} onclick="appGoChapter(${prevChapter})">← 上一回</button>
              <span class="text-sm text-[#8b6914] pt-2">毛宗岗评本 · 第一才子书</span>
              <button class="btn" ${chapterNum===120?'disabled style="opacity:0.5;cursor:not-allowed"':''} onclick="appGoChapter(${nextChapter})">下一回 →</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    applyAnnotVisibility();
    syncReaderUrl();
  }

  // 批注显隐：总开关 + 各评点家开关 → 容器 hidden 属性
  function applyAnnotVisibility(){
    document.querySelectorAll('[data-annot-critic]').forEach(node => {
      const cid = node.getAttribute('data-annot-critic');
      const on = !!readerState.annot.all && readerState.annot[cid] !== false;
      node.hidden = !on;
    });
  }

  // 白话导读（编者所撰 · 非原文）：据站内元数据编排，非原文翻译，不增饰史实细节
  function renderVernacularGuide(chapterNum){
    const meta = (data.chapters || []).find(c => c.id === chapterNum) || {};
    const events = meta.events || [];
    const persons = meta.keyPersons || [];
    const places = meta.keyPlaces || [];
    const virtuals = meta.isVirtual || [];
    const title = meta.title || (typeof CHAPTER_TEXT !== 'undefined' && CHAPTER_TEXT[chapterNum] ? CHAPTER_TEXT[chapterNum].title : '');
    return `
      <div class="vernacular-guide p-3 bg-[#f0f4ea] rounded border border-[#8fbc8f]">
        <div class="guide-banner text-sm mb-3 pb-2 border-b border-[#8fbc8f]">
          <strong class="text-[#006400]">编者所撰 · 非原文</strong>
          <div class="mt-1">本层为<strong>编者导读层</strong>，是编者自撰的本回导读，非毛宗岗本原文、亦非原文翻译。</div>
          <div class="text-xs text-[#4a6741] mt-1">所据材料：本回回目与本回事件 / 人物 / 地理元数据、虚实注记（站内 <code>data/sanguo-data.js</code> chapters 字段：title、events、keyPersons、keyPlaces、isVirtual），不引原文，不采史实细节。</div>
        </div>
        <h3 class="font-bold mb-2">本回导读（编者所撰）</h3>
        <p class="mb-2">本回回目作《${esc(title)}》。据本回事件条目，所叙关目有：${events.length ? esc(events.join('、')) : '（本回暂无事件条目）'}。</p>
        <p class="mb-2">出场要角：${persons.length ? esc(persons.join('、')) : '（本回暂无人物条目）'}；地理所涉：${places.length ? esc(places.join('、')) : '（本回暂无地理条目）'}。</p>
        ${virtuals.length ? `
        <div class="guide-virtual text-sm mt-2 p-2 bg-[#fdf3e7] rounded">
          <strong class="text-[#8b4513]">虚实提示（据站内注记）：</strong>
          <ul class="list-disc ml-5 mt-1">${virtuals.map(v => `<li>${esc(v)}</li>`).join('')}</ul>
        </div>` : ''}
        <p class="guide-foot text-xs text-[#4a6741] mt-3 pt-2 border-t border-[#8fbc8f]">以上导读由编者依据上述站内元数据自撰（编者所撰 · 非原文），仅供快速把握本回梗概；欲观文学原貌，请切回「繁体」或「简体」视图阅读原文层。</p>
      </div>`;
  }

  /* ---- 统计条形卡（Task 7：数字全部来自 SANGUO_STATS 聚合，禁止硬编码） ---- */
  function statBarList(title, note, rows, color){
    if(!rows || !rows.length) return '';
    const max = rows.reduce((m,r)=>Math.max(m, r.value), 0) || 1;
    return `
        <div class="stat-block">
          <h4 class="stat-title">${title}${note?`<span class="stat-note">${note}</span>`:''}</h4>
          ${rows.map(r=>`
          <div class="stat-row">
            <span class="stat-label">${esc(r.label)}</span>
            <span class="stat-track"><span class="stat-bar" style="width:${Math.round(r.value/max*100)}%;background:${r.color||color||'#8b0000'}"></span></span>
            <span class="stat-value">${esc(String(r.display != null ? r.display : r.value))}</span>
          </div>`).join('')}
        </div>`;
  }

  /* ---- 其余渲染 ---- */
  function renderHeros(el){
    const groups = [
      {name:"桃园结义", members:["刘备","关羽","张飞"]},
      {name:"五虎上将", members:["关羽","张飞","赵云","马超","黄忠"]},
      {name:"蜀汉丞相", members:["诸葛亮","庞统","蒋琬","费祎"]},
      {name:"曹魏五谋", members:["郭嘉","荀彧","荀攸","贾诩","程昱"]},
      {name:"五子良将", members:["张辽","张郃","徐晃","于禁","乐进"]},
      {name:"东吴四都督", members:["周瑜","鲁肃","吕蒙","陆逊"]},
      {name:"卧龙凤雏", members:["诸葛亮","庞统"]},
      {name:"四大美人", members:["貂蝉","大乔","小乔","甄宓"]}
    ];
    const st = global.SANGUO_STATS;
    const mentionRows = st ? st.personMentionTop(10).map(x=>({label:x.name, value:x.mentionCount})) : [];
    const yearRows = st ? st.battleYearDist().map(x=>({label:x.year+' 年', value:x.count})) : [];
    const geoRows = st ? st.battleGeoTop(8).map(x=>({label:x.name, value:x.count})) : [];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">英雄谱</h1>
      ${st ? `
      <div class="ancient-border p-4 rounded mb-6">
        <h3 class="text-lg font-bold text-[#8b0000] mb-1">统计速览</h3>
        <p class="text-xs text-[#8b6914] mb-3">以下数字全部由 <code>data/stats.js</code>（SANGUO_STATS）对本体实例集合实时聚合，随数据变更自动更新。</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${statBarList('人物提及分布 TOP10', 'persons · mentionCount', mentionRows)}
          ${statBarList('战役年份分布', 'battles · year', yearRows)}
          ${statBarList('战役地理分布 TOP8', 'battles · placeIds → places', geoRows)}
        </div>
      </div>` : ''}
      <div class="grid grid-cols-2 gap-4">
        ${groups.map(g=>`
          <div class="ancient-border p-4 rounded">
            <h3 class="text-lg font-bold text-[#8b0000] mb-3 text-center border-b border-[#c9b896] pb-2">${g.name}</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              ${g.members.map(m=>`<span class="entity-tag text-base">${m}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderPersons(el){
    const factions = ["蜀汉","曹魏","东吴","群雄","汉室"];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">人物志</h1>
      <div class="text-sm text-[#8b6914] mb-4">共收录核心人物 ${(data.persons||[]).length} 人，按势力分类。虚实徽章标注史实状态（如貂蝉/关索为虚构，关羽为史实）。</div>
      ${factions.map(f=>`
        <div class="mb-6">
          <h3 class="text-lg font-bold text-[#8b0000] mb-3 border-b border-[#c9b896] pb-1">${f}</h3>
          <table>
            <thead><tr><th>姓名</th><th>字</th><th>生卒年</th><th>爵位/官职</th><th>籍贯</th><th>提及次数</th><th>虚实</th></tr></thead>
            <tbody>
              ${(data.persons||[]).filter(p=>(p.faction||'').startsWith(f)).map(p=>`
                <tr>
                  <td class="font-bold">${p.name}</td>
                  <td>${p.style||'-'}</td>
                  <td>${p.birth||'?'} - ${p.death||'?'}</td>
                  <td>${p.title||'-'}</td>
                  <td>${p.nativePlace||'-'}</td>
                  <td>${p.mentionCount||0}+</td>
                  <td>${virtualBadge(p.virtual?'fictional':(p.faction==='群雄'?'transposed':'fact'))}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>`;
  }

  function renderFactions(el){
    const list = factionsData.length ? factionsData : [];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">势力志</h1>
      <p class="text-sm text-[#8b6914] mb-5">共 ${list.length} 个势力集团。</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${list.map(f=>`
          <div class="ancient-border p-5 rounded" style="border-left:6px solid ${f.color||'#8b4513'}">
            <div class="flex items-baseline justify-between mb-2">
              <h3 class="text-xl font-bold" style="color:${f.color||'#8b0000'}">${f.name}</h3>
              <span class="text-xs text-[#8b6914]">${f.period||''}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
              <div><span class="font-bold">君主：</span>${f.leader||'-'}</div>
              <div><span class="font-bold">都城：</span>${f.capital||'-'}</div>
              <div><span class="font-bold">疆域：</span>${f.peak||'-'}</div>
              <div><span class="font-bold">兵力：</span>${f.army||'-'}</div>
            </div>
            <p class="text-sm mb-3">${f.desc||''}</p>
            <div class="flex flex-wrap gap-1">${(f.members||[]).map(n=>`<span class="entity-tag text-xs">${n}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderPlaces(el){
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">地理志</h1>
      <p class="mb-4 text-sm text-[#8b6914]">共收录三国时期重要地理据点 ${(data.places||[]).length} 处，含都城、州郡、关隘、战场、古迹。</p>
      <table>
        <thead><tr><th>名称</th><th>等级</th><th>今地</th><th>坐标</th></tr></thead>
        <tbody>
          ${(data.places||[]).map(p=>`
            <tr>
              <td class="font-bold">${p.name}</td>
              <td>${p.level||'-'}</td>
              <td>${p.modernLocation||p.modernName||'-'}</td>
              <td>${(p.coord&&p.coord.length)?p.coord.join(','):'-'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  function renderBattles(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">战役录</h1>
      <p class="mb-4 text-sm text-[#8b6914]">共收录三国时期经典战役 ${(data.battles||[]).length} 场，从黄巾起义到三分归一统。</p>
      <div class="space-y-3">
        ${(data.battles||[]).map(b=>{
          const places = (b.placeIds||[]).map(pid=>(data.places||[]).find(p=>p.id===pid)?.name).filter(n=>n).join('、');
          const status = b.historicalStatus || 'embellished';
          return `
          <div class="ancient-border p-4 rounded">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-bold text-[#8b0000]">${b.name}</h3>
              <span class="text-sm text-[#8b6914]">公元 ${b.year||'?'} 年</span>
            </div>
            <div class="text-sm mb-2"><span class="font-bold">地点：</span>${places||'-'}</div>
            <div class="flex justify-between items-center">
              <div><span class="font-bold">结果：</span>${b.result||'-'}</div>
              ${virtualBadge(status)}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderEvents(el){
    const list = eventsData.slice().sort((a,b)=>a.year-b.year);
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">事件谱</h1>
      <p class="text-sm text-[#8b6914] mb-4">共 ${list.length} 件大事，自黄巾起义至三国归晋，按年份排列。虚实徽章统一标注史实状态。</p>
      <div class="flex flex-wrap gap-2 mb-4 text-sm">
        <button class="btn btn-sm" onclick="appFilterEvents('')">全部</button>
        ${[...new Set(list.map(e=>e.type).filter(Boolean))].map(t=>`<button class="btn btn-sm" onclick="appFilterEvents('${t}')">${t}</button>`).join('')}
      </div>
      <div class="relative border-l-2 border-[#c9b896] ml-3 pl-6 space-y-4" id="event-list">
        ${list.map(e=>{
          const status = e.historicalStatus || (e.virtual?'fictional':'embellished');
          return `
          <div class="event-item" data-type="${e.type||''}">
            <div class="flex items-baseline gap-3 flex-wrap">
              <span class="text-[#8b0000] font-bold">${e.year}年</span>
              <span class="font-bold text-lg">${e.name}</span>
              <span class="text-xs text-[#8b6914]">第${e.chapter||'?'}回 · ${e.place||''}</span>
              ${virtualBadge(status)}
            </div>
            <p class="text-sm mt-1">${e.desc||''}</p>
            <div class="flex flex-wrap gap-1 mt-1">${(e.persons||[]).map(n=>`<span class="entity-tag text-xs">${n}</span>`).join('')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
    global.appFilterEvents = function(type){
      document.querySelectorAll('.event-item').forEach(x=>x.style.display=(!type||x.dataset.type===type)?'':'none');
    };
  }

  function renderStratagems(el){
    const list = stratagems.slice();
    const types = [...new Set(list.map(s=>s.type||'其他'))];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">计谋谱</h1>
      <p class="text-sm text-[#8b6914] mb-4">共 ${list.length} 条计谋，涵盖三十六计与三国经典权谋。</p>
      <div class="flex flex-wrap gap-2 mb-4 text-sm">
        <button class="btn btn-sm" onclick="appFilterStrat('')">全部</button>
        ${types.map(t=>`<button class="btn btn-sm" onclick="appFilterStrat('${t}')">${t}</button>`).join('')}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="strat-list">
        ${list.map(s=>`
          <div class="ancient-border p-4 rounded strat-item" data-type="${s.type||'其他'}">
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="font-bold text-[#8b0000] text-lg">${s.name}</h3>
              <span class="text-xs text-[#8b6914]">${s.chapter?('第'+s.chapter+'回'):''}</span>
            </div>
            <p class="text-sm mb-1"><span class="font-bold">使用者：</span>${s.user||'—'}</p>
            ${s.target?`<p class="text-sm mb-1"><span class="font-bold">对象：</span>${s.target}</p>`:''}
            <p class="text-sm">${s.description||s.desc||''}</p>
            ${s.outcome?`<p class="text-xs text-[#8b6914] mt-1">结果：${s.outcome}</p>`:''}
          </div>`).join('')}
      </div>
    </div>`;
    global.appFilterStrat = function(type){ document.querySelectorAll('.strat-item').forEach(x=>x.style.display=(!type||x.dataset.type===type)?'':'none'); };
  }

  function renderArtifacts(el){
    const list = artifactsData;
    const types = [...new Set(list.map(a=>a.type))];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">器物谱</h1>
      <p class="text-sm text-[#8b6914] mb-4">共 ${list.length} 件兵器、坐骑、印玺、器械与文书。部分为演义虚构或文学夸张。</p>
      <div class="flex flex-wrap gap-2 mb-4 text-sm">
        <button class="btn btn-sm" onclick="appFilterArtifact('')">全部</button>
        ${types.map(t=>`<button class="btn btn-sm" onclick="appFilterArtifact('${t}')">${t}</button>`).join('')}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="artifact-list">
        ${list.map(a=>`
          <div class="ancient-border p-4 rounded artifact-item" data-type="${a.type}">
            <div class="flex items-baseline justify-between mb-1">
              <h3 class="font-bold text-[#8b0000] text-lg">${a.name}</h3>
              ${virtualBadge(a.virtual?'fictional':'fact')}
            </div>
            <p class="text-sm mb-1"><span class="font-bold">持有者：</span>${a.owner||'-'}${a.chapter?` · 第${a.chapter}回`:''}</p>
            <p class="text-sm">${a.desc||a.description||''}</p>
          </div>`).join('')}
      </div>
    </div>`;
    global.appFilterArtifact = function(type){ document.querySelectorAll('.artifact-item').forEach(x=>x.style.display=(!type||x.dataset.type===type)?'':'none'); };
  }

  function renderPoems(el){
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">诗词钞</h1>
      <p class="text-sm text-[#8b6914] mb-4">共 ${poems.length} 篇：卷首词、乐府、唐诗、表文、家训。</p>
      <div class="space-y-4">
        ${poems.map(p=>`
          <div class="ancient-border p-5 rounded ancient-text">
            <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h3 class="font-bold text-[#8b0000] text-lg">${p.title} <span class="text-sm font-normal">—— ${p.author}</span></h3>
              <span class="text-xs text-[#8b6914]">${p.type||''}${p.chapter?` · 第${p.chapter}回`:''}</span>
            </div>
            <pre>${p.content}</pre>
            ${p.note?`<p class="text-xs text-[#8b6914] mt-2">${p.note}</p>`:''}
          </div>`).join('')}
      </div>
    </div>`;
  }

  function renderVersions(el){
    const inLib = editionsExtra.filter(e=>e.status==='已入库'||e.status==='部分');
    const gaps = editionsExtra.filter(e=>e.status.startsWith('缺口'));
    const annEditions = ANN && ANN.editionAssertions ? ANN.editionAssertions : [];
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">版本谱</h1>
      <p class="mb-4 text-sm text-[#8b6914]">《三国演义》版本分"演义系统""志传系统""评本/汇评"三支。下表同时收录公版结论、名家结论与评注挂接情况。</p>
      <div class="grid grid-cols-3 gap-3 mb-5 text-center text-sm">
        <div class="ancient-border p-3 rounded"><div class="text-2xl font-bold text-[#8b0000]">${inLib.length}</div>已入库</div>
        <div class="ancient-border p-3 rounded"><div class="text-2xl font-bold text-[#8b0000]">${gaps.length}</div>缺口·仅影印</div>
        <div class="ancient-border p-3 rounded"><div class="text-2xl font-bold text-[#8b0000]">${annEditions.length}</div>版本公版结论</div>
      </div>

      <div class="space-y-3 mb-6">
        ${editionsExtra.map(ed=>{
          const ann = annEditions.find(a=>a.name===ed.name);
          return `
          <div class="ancient-border p-4 rounded" style="border-left:5px solid ${ed.status.startsWith('缺口')?'#b0a08a':ed.status==='部分'?'#b08d57':'#2f6b4f'}">
            <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h3 class="text-lg font-bold text-[#8b0000]">${ed.name}</h3>
              <span class="text-xs px-2 py-0.5 rounded ${ed.status.startsWith('缺口')?'bg-[#eee7d8] text-[#6b5a3f]':ed.status==='部分'?'bg-[#fff3e0] text-[#a05a00]':'bg-[#e6f7e6] text-[#006400]'}">${ed.status}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm my-2">
              <div><span class="font-bold">年代：</span>${ed.era}</div>
              <div><span class="font-bold">系统：</span>${ed.system}</div>
              <div><span class="font-bold">规模：</span>${ed.units}</div>
              <div><span class="font-bold">文本：</span>${ed.file?`<a class="underline" href="corpus.html">站内阅读</a>`:'—'}</div>
            </div>
            <p class="text-sm">${ed.note}</p>
            ${ann?`
              <div class="mt-3 pt-3 border-t border-dashed border-[#c9b896] text-sm">
                ${ann.consensus?.length?`<div class="text-[#006400] font-bold">公版结论</div>${ann.consensus.map(c=>`<div class="pl-3">· ${c.text} <span class="text-[#8b6914] text-xs">（${ANN.sources?.find(s=>s.id===c.source)?.work||c.source}）</span></div>`).join('')}`:''}
                ${ann.criticViews?.length?`<div class="text-[#8b0000] font-bold mt-2">名家结论</div>${ann.criticViews.map(c=>`<div class="pl-3">· ${c.text}</div>`).join('')}`:''}
                ${ann.commentary?.available?`<div class="text-[#8b4513] mt-2">✓ ${ann.commentary.chars} 字评注已挂接</div>`:''}
              </div>`:''}
          </div>`;
        }).join('')}
      </div>

      <div class="ancient-border p-4 rounded">
        <h3 class="font-bold text-[#8b0000] mb-2">版本演化脉络</h3>
        <p class="text-sm leading-relaxed">元《三国志平话》 → 明嘉靖壬午本（1522，现存最早完整刊本）→ 周曰校、余象斗、黄正甫等志传/演义刻本 → 李卓吾评本（合并为 120 回）→ 钟伯敬、笠翁评本 → 毛宗岗评本（1679，通行定本）→ 现代整理本。志传系统保留关索故事等早期民间传说。</p>
        <div class="mt-3 text-sm space-y-1">
          <p><span class="font-bold text-[#8b0000]">章学诚《丙辰札记》</span>："三国演义为演义之祖，七分实事，三分虚构。"</p>
          <p><span class="font-bold text-[#8b0000]">胡适《三国志演义序》</span>："毛宗岗是有胆力的改作家。"</p>
          <p><span class="font-bold text-[#8b0000]">郑振铎</span>：演义系统（240 则）与志传系统（多存关索故事）为两大源流。</p>
        </div>
      </div>
    </div>`;
  }

  function renderVariants(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">异文对勘</h1>
      <p class="mb-4 text-sm text-[#8b6914]">共 ${variants.length} 组毛本与嘉靖本代表性异文；下方可粘贴任意两段文本做 LCS 对勘。</p>
      <div class="ancient-border p-4 rounded mb-6">
        <h3 class="font-bold text-[#8b0000] mb-2">版本异文对照 · 两版本同一叙事单元并列</h3>
        <style>
          .cmp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
          .cmp-row select,.cmp-row input{border:1px solid #c9b896;border-radius:4px;padding:4px 8px;font-size:13px;background:#fffdf8}
          .cmp-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          .cmp-col{border:1px solid #c9b896;border-radius:6px;overflow:hidden;background:#fffdf8}
          .cmp-head{background:#f5ecd8;font-weight:bold;color:#8b0000;padding:6px 10px;font-size:13px;border-bottom:1px solid #c9b896}
          .cmp-text{padding:10px;max-height:560px;overflow:auto;font-size:14px;line-height:1.9}
          .d-del{background:#f8d7da;color:#7c1c1c}
          .d-ins{background:#d6f0dc;color:#175c2c}
          .d-chg{background:#fde9c9;color:#7a4a00}
          .cmp-empty{padding:14px;color:#8b6914;font-size:13px;background:#faf6ec}
          .cmp-warn{background:#fff3e0;border:1px solid #e0b070;color:#a05a00;font-size:12.5px;padding:6px 10px;border-radius:4px;margin-bottom:8px}
          @media(max-width:800px){.cmp-cols{grid-template-columns:1fr}}
        </style>
        <div class="cmp-row">
          <label class="text-sm">甲本：<select id="cmp-a" onchange="appCmpRun()">${cmpOptions('mao')}</select></label>
          <label class="text-sm">乙本：<select id="cmp-b" onchange="appCmpRun()">${cmpOptions('jiajing')}</select></label>
          <label class="text-sm">叙事单元（毛本回次）：<input id="cmp-unit" type="number" min="1" max="120" value="${currentChapter||1}" style="width:76px"></label>
          <button class="btn btn-sm" onclick="appCmpRun()">开始对照</button>
        </div>
        <div class="text-xs text-[#8b6914] mb-2">对齐依据：以毛本 120 回为叙事单元枢纽——回目系统（七家汇评/李卓吾/鍾伯敬/笠翁）按回次对齐；嘉靖系 240 则经 jiajingId 对齐；志传系 180/245 则（黄正甫/朱鼎臣/鄭少垣/熊清波/周曰校）按则目题名匹配；对不齐者如实说明，不作强配。图例：<span class="d-del">红＝甲本独有（删除）</span> <span class="d-ins">绿＝乙本独有（新增）</span> <span class="d-chg">橙＝改写对应</span>。</div>
        <div id="cmp-result"><div class="cmp-empty">请选择版本与叙事单元后点击「开始对照」，切换版本/单元会自动重算。</div></div>
      </div>
      <div class="space-y-5">
        ${variants.map(v=>`
          <div class="ancient-border p-4 rounded">
            <h3 class="font-bold text-[#8b0000] mb-2">第${v.chapter}回 · ${v.item}</h3>
            <div class="mb-2 p-3 bg-[#fff5f5] rounded">
              <div class="text-sm font-bold text-[#8b0000] mb-1">【毛宗岗本】</div>
              <div>${v.mao}</div>
            </div>
            <div class="mb-2 p-3 bg-[#f5fff5] rounded">
              <div class="text-sm font-bold text-[#006400] mb-1">【嘉靖壬午本】</div>
              <div>${v.jiajing}</div>
            </div>
            <div class="comment-text text-sm">【考证】${v.note}</div>
          </div>`).join('')}
      </div>
      <div class="ancient-border p-4 rounded mt-6">
        <h3 class="font-bold text-[#8b0000] mb-2">自助对勘（LCS）</h3>
        <p class="text-sm mb-2">粘贴两段文本，自动进行最长公共子序列比对：</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <textarea id="textA" class="w-full border border-[#c9b896] rounded p-2 h-24 text-sm" placeholder="毛本段落"></textarea>
          <textarea id="textB" class="w-full border border-[#c9b896] rounded p-2 h-24 text-sm" placeholder="嘉靖本段落"></textarea>
        </div>
        <button class="btn" onclick="appLcsDiff()">开始对勘</button>
        <div id="diff-result" class="mt-4 p-3 bg-[#f5f0e6] rounded hidden"></div>
      </div>
      <div class="ancient-border p-4 rounded mt-4 text-sm">
        <p class="font-bold text-[#8b0000] mb-1">在线对读</p>
        <p>可前往 <a class="underline" href="corpus.html#ed=mao&c=1">多版本语料库</a> 切换毛本、嘉靖本、七家汇评本与黄正甫本，按回对照阅读。</p>
      </div>
    </div>`;
    setTimeout(()=>{ if(global.appCmpRun) global.appCmpRun(); }, 0);
  }

  /* ======================== 版本异文对照（Task 6 · AC10） ========================
     双版本同一叙事单元并列对照：字符级 LCS diff（公共前后缀剪裁 + 公共子串锚定分段 +
     段内 LCS DP，自实现、不引库），新增/删除/改写三色高亮。单元对齐以毛本 120 回为枢纽：
     回目系统（七家汇评/李卓吾/鍾伯敬/笠翁）按回次对齐；嘉靖系 240 则经 jiajingId 对齐；
     志传系 180/245 则（黄正甫/朱鼎臣/鄭少垣/熊清波/周曰校）按则目题名匹配，对不齐如实说明。 */

  const CMP_PUNCT = {'，':',','、':',','；':';','：':':','？':'?','！':'!','。':'.','．':'.','｡':'.','·':'.','“':'"','”':'"','「':'"','」':'"','『':"'",'』':"'",'‘':"'",'’':"'",'（':'(','）':')','〔':'(','〕':')','【':'[','】':']','《':'<','》':'>','～':'~','—':'-','－':'-','─':'-','…':'…','‥':'…'};
  function cmpT2sChar(ch){ return (global.T2S_MAP && global.T2S_MAP[ch]) || ch; }
  function cmpCnNum(s){
    s = String(s||'').trim().replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
    if(/^\d+$/.test(s)) return parseInt(s, 10);
    const D = {'零':0,'〇':0,'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
    let n = 0;
    if(s.indexOf('百') >= 0){
      const parts = s.split('百');
      n += (parts[0] ? (D[parts[0]] !== undefined ? D[parts[0]] : 1) : 1) * 100;
      s = parts.slice(1).join('');
    }
    if(s.indexOf('十') >= 0){
      const parts = s.split('十');
      n += (parts[0] ? (D[parts[0]] !== undefined ? D[parts[0]] : 1) : 1) * 10;
      s = parts.slice(1).join('');
    }
    if(s) n += (D[s] !== undefined ? D[s] : 0);
    return n;
  }
  function cmpStripHtml(html){
    return String(html||'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<[^>]+>/g,'')
      .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
  function cmpNormTitle(s){
    return String(s||'').split('').map(cmpT2sChar).join('')
      .replace(/[（(]\s*[續续]\s*[)）]/g, '')
      .replace(/[\s　]/g, '')
      .replace(/[：:，,。、《》「」“”‘’（）()·—\-？?！!．.…\[\]【】]/g, '')
      .replace(/[續续]$/, '');
  }
  function cmpLcsRatio(a, b){
    const m = a.length, n = b.length;
    if(!m || !n) return 0;
    const w = n + 1;
    const dp = new Uint16Array((m + 1) * w);
    for(let i = m - 1; i >= 0; i--)
      for(let j = n - 1; j >= 0; j--)
        dp[i*w + j] = a[i] === b[j] ? dp[(i+1)*w + j + 1] + 1 : Math.max(dp[(i+1)*w + j], dp[i*w + j + 1]);
    return 2 * dp[0] / (m + n);
  }

  // —— 语料切分 ——
  const cmpParsed = {};
  function cmpChapters(){ return data.chapters || []; }
  function cmpJiajingRange(unit){
    const ch = cmpChapters()[unit - 1];
    const m = ch && ch.jiajingId && String(ch.jiajingId).match(/(\d+)\s*[-–—]?\s*(\d+)?/);
    if(!m) return null;
    const s = parseInt(m[1], 10);
    return { s: s, e: m[2] ? parseInt(m[2], 10) : s };
  }
  function cmpFileOf(id){
    const corpus = (typeof SANGUO_CORPUS !== 'undefined') ? SANGUO_CORPUS : null;
    const it = corpus && Array.isArray(corpus.items) ? corpus.items.find(x => x.id === id) : null;
    return (it && it.file) || '';
  }
  async function cmpLoadText(fileName){
    const res = await fetch('texts/' + encodeURIComponent(fileName));
    if(!res.ok) throw new Error(fileName + ' HTTP ' + res.status);
    return res.text();
  }
  function cmpSplitByHeading(txt, headRe, def){
    const marks = [];
    let m;
    headRe.lastIndex = 0;
    while((m = headRe.exec(txt)))
      marks.push({ num: cmpCnNum(m[1]), title: String(m[2]||'').trim(), body: headRe.lastIndex, start: m.index });
    return marks.map((mk, i) => {
      let body = txt.slice(mk.body, i + 1 < marks.length ? marks[i+1].start : txt.length);
      body = body.replace(/^>.*$/gm, '').replace(/^---+$/gm, '').replace(/\*\*/g, '');
      if(def.stripComment) body = body.replace(def.stripComment, '');
      return { num: mk.num, title: mk.title, text: body.trim() };
    });
  }
  function cmpParseJiajing(txt){
    const lines = txt.split('\n');
    let b0 = 0;
    for(let i = 0; i < lines.length; i++) if(lines[i].trim() === '祭天地桃园结义') b0 = i;
    const junk = /钱氏藏书|白酒|黄金|钱建文|制作|目录页|PIXTEL|上一页|后记|QQ/;
    const cands = [];
    for(let i = 16; i < b0; i++){
      const l = lines[i], s = l.trim();
      if(s && l[0] !== ' ' && l[0] !== '　' && s.length <= 24 && s.indexOf('卷之') !== 0 && !junk.test(s)) cands.push(s);
    }
    const hits = [];
    let pos = b0;
    for(let k = 0; k < cands.length && hits.length < 240; k++){
      const title = cands[k];
      let j = pos;
      while(j < lines.length){
        const s = lines[j].trim();
        if(s === title || s.indexOf(title) === 0) break;
        j++;
      }
      if(j >= lines.length) continue;
      hits.push({ title: title, line: j });
      pos = j + 1;
    }
    return hits.map((h, k) => ({
      num: k + 1,
      title: h.title,
      text: lines.slice(h.line + 1, k + 1 < hits.length ? hits[k+1].line : lines.length).join('\n').trim()
    }));
  }
  function cmpParseHuang(txt){
    const lines = txt.split('\n');
    const marks = [];
    const re = /^[　 ]*●(.*)$/;
    for(let i = 0; i < lines.length; i++){
      const m = lines[i].match(re);
      if(m) marks.push({ title: m[1].trim(), line: i });
    }
    return marks.map((h, k) => ({
      num: k + 1,
      title: h.title,
      text: lines.slice(h.line + 1, k + 1 < marks.length ? marks[k+1].line : lines.length).join('\n').trim()
    }));
  }
  function cmpParseMao(){
    const CH = (typeof CHAPTER_TEXT !== 'undefined') ? CHAPTER_TEXT : (global.CHAPTER_TEXT || {});
    const units = [];
    for(let n = 1; n <= 120; n++){
      const t = CH[n];
      units.push({ num: n, title: (t && t.title) || '', text: t ? cmpStripHtml(t.text).trim() : '' });
    }
    return units;
  }

  const CMP_DEFS = {
    '毛宗岗评本.txt':              { kind:'mao', ocr:false },
    '嘉靖壬午本.txt':              { kind:'jiajing', ocr:false },
    '嘉靖壬午本_维基文库转录.txt':  { kind:'jiajingWs', ocr:false, headRe:/^### 第([一二三四五六七八九十百零]+)回[　 ]*(.*)$/gm },
    '七家汇评本.txt':              { kind:'hui120', ocr:false, headRe:/^第([一二三四五六七八九十百零]+)回[　 ]+(.*)$/gm, stripComment:/【[^】]*】/g },
    '李卓吾評本_OCR.txt':          { kind:'hui120', ocr:true, headRe:/^### 第([0-9０-９一二三四五六七八九十百零]+)回[　 ]*(.*)$/gm },
    '鍾伯敬評本_OCR.txt':          { kind:'hui120', ocr:true, headRe:/^### 第([0-9０-９一二三四五六七八九十百零]+)回[　 ]*(.*)$/gm },
    '笠翁評閱本_OCR.txt':          { kind:'hui120', ocr:true, headRe:/^### 第([0-9０-９一二三四五六七八九十百零]+)回[　 ]*(.*)$/gm },
    '黄正甫本.txt':                { kind:'zeTitle', ocr:false, parse:'huang' },
    '朱鼎臣刊本_OCR.txt':          { kind:'zeTitle', ocr:true, headRe:/^### 第([0-9０-９一二三四五六七八九十百零]+)則[　 ]*(.*)$/gm },
    '鄭少垣刊本_OCR.txt':          { kind:'zeTitle', ocr:true, headRe:/^### 第([一二三四五六七八九十百零]+)則[　 ]*(.*)$/gm },
    '熊清波藜光堂本_OCR.txt':      { kind:'zeTitle', ocr:true, headRe:/^### 第([0-9０-９一二三四五六七八九十百零]+)則[　 ]*(.*)$/gm },
    '周曰校刊本_OCR.txt':          { kind:'zeTitle', ocr:true, headRe:/^=== 第([一二三四五六七八九十百零]+)則：?(.*?) ===$/gm }
  };

  async function cmpGetParsed(fileName){
    if(cmpParsed[fileName]) return cmpParsed[fileName];
    const def = CMP_DEFS[fileName];
    if(!def) return null;
    let units;
    if(def.kind === 'mao') units = cmpParseMao();
    else {
      const raw = await cmpLoadText(fileName);
      if(def.kind === 'jiajing') units = cmpParseJiajing(raw);
      else if(def.parse === 'huang') units = cmpParseHuang(raw);
      else units = cmpSplitByHeading(raw, def.headRe, def);
    }
    const byTitle = new Map();
    units.forEach((u, idx) => {
      const key = cmpNormTitle(u.title);
      if(!key) return;
      if(!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(idx);
    });
    cmpParsed[fileName] = { units: units, byTitle: byTitle };
    return cmpParsed[fileName];
  }
  function cmpMatchTitle(parsed, title){
    const key = cmpNormTitle(title);
    if(!key) return [];
    if(parsed.byTitle.has(key)) return parsed.byTitle.get(key);
    let best = -1, bestScore = 0;
    parsed.units.forEach((u, i) => {
      const s = cmpLcsRatio(key, cmpNormTitle(u.title));
      if(s > bestScore){ bestScore = s; best = i; }
    });
    return bestScore >= 0.6 ? [best] : [];
  }

  async function cmpUnitText(fileName, unit){
    const def = CMP_DEFS[fileName];
    if(!def) return { reason: '该版本未提供可按叙事单元切分的对读文本（仅版本说明/影印件或非演义分回系统），与毛本 120 回叙事单元对不齐，暂不作对照。' };
    const parsed = await cmpGetParsed(fileName);
    if(!parsed || !parsed.units.length) return { reason: '该版本文本未能按单元切分，暂不作对照。' };
    const range = cmpJiajingRange(unit);
    if(def.kind === 'mao' || def.kind === 'hui120'){
      const u = parsed.units.find(x => x.num === unit);
      if(!u || !u.text) return { reason: '该单元暂无对照文本（文本未覆盖第 ' + unit + ' 回）。' };
      return {
        text: u.text,
        alignNote: def.kind === 'mao'
          ? '毛本第 ' + unit + ' 回（叙事单元基准）'
          : '按回次对齐：毛本第 ' + unit + ' 回 ↔ 本版第 ' + unit + ' 回'
      };
    }
    if(!range) return { reason: '毛本第 ' + unit + ' 回缺少 jiajingId 则目对齐数据，无法定位该单元。' };
    if(def.kind === 'jiajing' || def.kind === 'jiajingWs'){
      const parts = [];
      for(let z = range.s; z <= range.e; z++){
        const u = parsed.units.find(x => x.num === z);
        if(u && u.text) parts.push(u.text);
      }
      if(!parts.length) return { reason: '该单元暂无对照文本（未获得第 ' + range.s + '–' + range.e + ' 则文本）。' };
      return { text: parts.join('\n'), alignNote: '据 jiajingId：毛本第 ' + unit + ' 回 ↔ 嘉靖本第 ' + range.s + '–' + range.e + ' 则' };
    }
    // zeTitle：志传系 180/245 则，按则目题名匹配
    const jt = await cmpGetParsed('嘉靖壬午本.txt');
    const matched = [];
    const miss = [];
    for(let z = range.s; z <= range.e; z++){
      const ju = jt.units.find(x => x.num === z);
      if(!ju){ miss.push('则' + z); continue; }
      const idxs = cmpMatchTitle(parsed, ju.title);
      if(!idxs.length){ miss.push(ju.title); continue; }
      idxs.forEach(i => { const u = parsed.units[i]; if(u && u.text) matched.push(u.text); });
    }
    if(!matched.length)
      return { reason: '该单元暂无对照文本：' + (miss.length ? '则目「' + esc(miss.join('、')) + '」在本版未匹配到对应分则。' : '') + '（志传系统分则与嘉靖本则目对不齐时以对不齐论，不作强配）' };
    return {
      text: matched.join('\n'),
      alignNote: '据嘉靖本则目题名匹配（志传系分则）：毛本第 ' + unit + ' 回 ↔ 嘉靖本第 ' + range.s + '–' + range.e + ' 则 ↔ 本版 ' + matched.length + ' 则'
        + (miss.length ? '（未匹配：' + miss.join('、') + '）' : '')
    };
  }

  // —— 字符级 LCS diff ——
  function cmpKeyEntries(text){
    const entries = [];
    for(const ch of String(text||'')){
      if(ch === '\n' || ch === '\r'){ if(entries.length) entries[entries.length-1].brAfter = true; continue; }
      if(/\s/.test(ch) || ch === '　') continue;
      const k = cmpT2sChar(ch);
      entries.push({ k: CMP_PUNCT[k] || k, ch: ch });
    }
    return entries;
  }
  function cmpLcsOps(ak, bk){
    const m = ak.length, n = bk.length, w = n + 1;
    const dp = new Uint16Array((m + 1) * w);
    for(let i = m - 1; i >= 0; i--)
      for(let j = n - 1; j >= 0; j--)
        dp[i*w + j] = ak[i].k === bk[j].k ? dp[(i+1)*w + j + 1] + 1 : Math.max(dp[(i+1)*w + j], dp[i*w + j + 1]);
    const ops = [];
    const push = (t, i0, i1, j0, j1) => {
      const last = ops[ops.length - 1];
      if(last && last[0] === t){ last[2] = i1; last[4] = j1; }
      else ops.push([t, i0, i1, j0, j1]);
    };
    let i = 0, j = 0;
    while(i < m && j < n){
      if(ak[i].k === bk[j].k){ push('eq', i, i+1, j, j+1); i++; j++; }
      else if(dp[(i+1)*w + j] >= dp[i*w + j + 1]){ push('del', i, i+1, j, j); i++; }
      else { push('ins', i, i, j, j+1); j++; }
    }
    if(i < m) push('del', i, m, j, j);
    if(j < n) push('ins', i, i, j, n);
    return ops;
  }
  function cmpOpsToSegs(ops, a, b){
    const segs = [];
    for(const op of ops){
      const t = op[0], sa = a.slice(op[1], op[2]), sb = b.slice(op[3], op[4]);
      const last = segs[segs.length - 1];
      if(t === 'eq') segs.push({ type:'eq', a: sa, b: sb });
      else if(t === 'del'){
        if(last && last.type === 'ins'){ last.type = 'chg'; last.a = sa; }
        else segs.push({ type:'del', a: sa, b: [] });
      } else {
        if(last && last.type === 'del'){ last.type = 'chg'; last.b = sb; }
        else segs.push({ type:'ins', a: [], b: sb });
      }
    }
    return segs;
  }
  function cmpFindAnchors(a, b){
    const astr = a.map(e => e.k).join(''), bstr = b.map(e => e.k).join('');
    // 多档锚点窗口：两版异文措辞常隔数字即异，先取 10 字锚，找不到再退 6 字、4 字密探针
    for(const cfg of [[10, 30], [6, 150], [4, 300]]){
      const WIN = cfg[0];
      const step = Math.max(1, Math.floor(a.length / cfg[1]));
      const anchors = [];
      let lastA = 0, lastB = 0;
      for(let i = 0; i + WIN <= a.length; i += step){
        if(i < lastA) continue;
        const j = bstr.indexOf(astr.substr(i, WIN), lastB);
        if(j < 0) continue;
        let len = WIN;
        while(i + len < a.length && j + len < b.length && a[i+len].k === b[j+len].k) len++;
        if(j >= lastB){ anchors.push([i, j, len]); lastA = i + len; lastB = j + len; }
      }
      if(anchors.length) return anchors;
    }
    return [];
  }
  function cmpDiffMid(a, b, depth){
    if(!a.length && !b.length) return [];
    if(!a.length) return [{ type:'ins', a: [], b: b }];
    if(!b.length) return [{ type:'del', a: a, b: [] }];
    if(a.length * b.length <= 1500000) return cmpOpsToSegs(cmpLcsOps(a, b), a, b);
    if(depth > 3) return [{ type:'chg', a: a, b: b }];
    const anchors = cmpFindAnchors(a, b);
    if(!anchors.length) return [{ type:'chg', a: a, b: b }];
    const out = [];
    let ia = 0, ib = 0;
    for(const an of anchors){
      out.push.apply(out, cmpDiffMid(a.slice(ia, an[0]), b.slice(ib, an[1]), depth + 1));
      out.push({ type:'eq', a: a.slice(an[0], an[0] + an[2]), b: b.slice(an[1], an[1] + an[2]) });
      ia = an[0] + an[2]; ib = an[1] + an[2];
    }
    out.push.apply(out, cmpDiffMid(a.slice(ia), b.slice(ib), depth + 1));
    return out;
  }
  function cmpDiffSegs(aText, bText){
    const ak = cmpKeyEntries(aText), bk = cmpKeyEntries(bText);
    const segs = [];
    let p = 0;
    while(p < ak.length && p < bk.length && ak[p].k === bk[p].k) p++;
    let s = 0;
    while(s < ak.length - p && s < bk.length - p && ak[ak.length-1-s].k === bk[bk.length-1-s].k) s++;
    if(p) segs.push({ type:'eq', a: ak.slice(0, p), b: bk.slice(0, p) });
    segs.push.apply(segs, cmpDiffMid(ak.slice(p, ak.length - s), bk.slice(p, bk.length - s), 0));
    if(s) segs.push({ type:'eq', a: ak.slice(ak.length - s), b: bk.slice(bk.length - s) });
    return segs;
  }
  function cmpRenderEntries(entries){
    let out = '';
    for(const e of entries) out += esc(e.ch) + (e.brAfter ? '<br>' : '');
    return out;
  }

  function cmpRowMap(){
    const map = {};
    buildVersionRows().forEach(r => map[r.id] = r);
    return map;
  }
  function cmpOptions(sel){
    return buildVersionRows()
      .filter(r => ['full','partial','ocr'].includes(r.status))
      .map(r => '<option value="' + esc(r.id) + '"' + (r.id === sel ? ' selected' : '') + '>'
        + esc(r.title) + '（' + TEXT_STATUS_LABEL[r.status] + '）</option>')
      .join('');
  }

  global.appCmpRun = async function(){
    const result = document.getElementById('cmp-result');
    const selA = document.getElementById('cmp-a'), selB = document.getElementById('cmp-b'), unitEl = document.getElementById('cmp-unit');
    if(!result || !selA || !selB || !unitEl) return;
    let unit = parseInt(unitEl.value, 10);
    if(!unit || unit < 1 || unit > 120){ unit = Math.max(1, Math.min(120, currentChapter || 1)); unitEl.value = unit; }
    const rows = cmpRowMap();
    const fileOf = id => cmpFileOf(id);
    result.innerHTML = '<div class="cmp-empty">正在载入对照文本……</div>';
    try{
      const [ra, rb] = await Promise.all([cmpUnitText(fileOf(selA.value), unit), cmpUnitText(fileOf(selB.value), unit)]);
      const chs = cmpChapters();
      const chTitle = chs[unit - 1] ? chs[unit - 1].title : '';
      const range = cmpJiajingRange(unit);
      const unitNote = '叙事单元：毛本第 ' + unit + ' 回「' + esc(chTitle) + '」'
        + (range ? '（jiajingId：嘉靖本第 ' + range.s + '–' + range.e + ' 则）' : '');
      const warn = [];
      if(rows[selA.value] && rows[selA.value].status === 'ocr')
        warn.push('甲本「' + esc(rows[selA.value].title) + '」为仅OCR（检索用）文本：逐行录入、未经校勘，未达 97% 验收线，不作对勘底本，仅作参照。');
      if(rows[selB.value] && rows[selB.value].status === 'ocr')
        warn.push('乙本「' + esc(rows[selB.value].title) + '」为仅OCR（检索用）文本：逐行录入、未经校勘，未达 97% 验收线，不作对勘底本，仅作参照。');

      function colHtml(side, id, res){
        const row = rows[id] || { title: id, status: '' };
        const head = (side === 'a' ? '甲本' : '乙本') + '：' + esc(row.title)
          + (row.status ? '（' + (TEXT_STATUS_LABEL[row.status] || row.status) + '）' : '')
          + (res.alignNote ? '<div class="text-xs font-normal text-[#8b6914] mt-1">对齐依据：' + esc(res.alignNote) + '</div>' : '');
        let body;
        if(!res.text){
          body = '<div class="cmp-empty"><b>该单元暂无对照文本</b><br>' + (res.reason || '') + '</div>';
        } else {
          body = '<div class="cmp-text" id="cmp-text-' + side + '">' + res.html + '</div>';
        }
        return '<div class="cmp-col"><div class="cmp-head">' + head + '</div>' + body + '</div>';
      }

      let statNote = '';
      ra.html = ''; rb.html = '';
      if(ra.text && rb.text){
        const segs = cmpDiffSegs(ra.text, rb.text);
        let onlyA = 0, onlyB = 0, chgA = 0;
        const htmlA = [], htmlB = [];
        for(const sg of segs){
          const cls = sg.type === 'eq' ? '' : (sg.type === 'del' ? 'd-del' : (sg.type === 'ins' ? 'd-ins' : 'd-chg'));
          if(sg.type !== 'ins') htmlA.push(cls ? '<span class="' + cls + '">' + cmpRenderEntries(sg.a) + '</span>' : cmpRenderEntries(sg.a));
          if(sg.type !== 'del') htmlB.push(cls ? '<span class="' + cls + '">' + cmpRenderEntries(sg.b) + '</span>' : cmpRenderEntries(sg.b));
          if(sg.type === 'del') onlyA += sg.a.length;
          if(sg.type === 'ins') onlyB += sg.b.length;
          if(sg.type === 'chg') chgA += sg.a.length;
        }
        ra.html = htmlA.join('');
        rb.html = htmlB.join('');
        statNote = '<div class="text-xs text-[#8b6914] mt-2">差异统计（字符级 LCS）：甲本独有（乙本删落）' + onlyA + ' 字 · 乙本独有（新增）' + onlyB + ' 字 · 改写对应' + chgA + ' 字。</div>';
      } else if(ra.text){
        ra.html = cmpRenderEntries(cmpKeyEntries(ra.text));
        statNote = '<div class="text-xs text-[#8b6914] mt-2">乙本无该单元文本，未作差异计算。</div>';
      } else if(rb.text){
        rb.html = cmpRenderEntries(cmpKeyEntries(rb.text));
        statNote = '<div class="text-xs text-[#8b6914] mt-2">甲本无该单元文本，未作差异计算。</div>';
      }

      result.innerHTML =
        (warn.length ? '<div class="cmp-warn">' + warn.join('<br>') + '</div>' : '') +
        '<div class="text-sm text-[#5a3a1a] mb-2">' + unitNote + '</div>' +
        '<div class="cmp-cols">' + colHtml('a', selA.value, ra) + colHtml('b', selB.value, rb) + '</div>' +
        statNote;
    }catch(e){
      result.innerHTML = '<div class="cmp-empty">载入失败：' + esc(e.message) + '（请确认经本地 HTTP 服务或线上地址访问本页）</div>';
    }
  };

  function renderComments(el){
    const list = comments.slice();
    const people = [...new Set(list.map(c=>c.commenter))];
    const st = global.SANGUO_STATS;
    const byChapter = st ? st.annotationByChapter(10) : [];
    const byCritic = st ? st.annotationByCritic() : [];
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">评点汇</h1>
      <p class="mb-4 text-sm text-[#8b6914]">共 ${list.length} 条精选批语，另有 ${byCritic.length} 家评注挂接索引（${ANN?.commentaryIndex?.length||0} 条重点回目）。</p>
      <div class="flex flex-wrap gap-2 mb-4 text-sm">
        <button class="btn btn-sm" onclick="appFilterComment('')">全部</button>
        ${people.map(p=>`<button class="btn btn-sm" onclick="appFilterComment('${p}')">${p}</button>`).join('')}
      </div>
      ${st ? `
      <div class="ancient-border p-4 rounded mb-6">
        <h3 class="text-lg font-bold text-[#8b0000] mb-1">评点密度</h3>
        <p class="text-xs text-[#8b6914] mb-3">对评注挂接索引（commentaryIndex）按回目与评点家实时聚合，数字由 SANGUO_STATS 计算。</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${statBarList('按回集中 TOP10', 'commentaryIndex · unit', byChapter.map(x=>({label:'第'+x.unit+'回', value:x.count})))}
          ${statBarList('按评点家分布', 'commentaryIndex · criticId', byCritic.map(x=>({label:x.name, value:x.count})))}
        </div>
      </div>` : ''}
      <div class="space-y-4">
        ${list.map(c=>`
          <div class="ancient-border p-4 rounded comment-item" data-person="${c.commenter}">
            <div class="flex justify-between mb-2">
              <span class="font-bold text-[#8b0000]">【${c.commenter}批】第${c.chapter}回</span>
              <a class="text-xs underline text-[#8b6914]" href="corpus.html#ed=mao&c=${c.chapter}">对读正文 →</a>
            </div>
            <p class="text-[#3a1c00] italic">「${c.text}」</p>
          </div>`).join('')}
      </div>
    </div>`;
    global.appFilterComment = function(p){ document.querySelectorAll('.comment-item').forEach(x=>x.style.display=(!p||x.dataset.person===p)?'':'none'); };
  }

  function renderHistorical(el){
    const list = historicalContrast.slice().sort((a,b)=>a.chapter-b.chapter);
    const statusCounts = { fact:0, embellished:0, transposed:0, fictional:0 };
    list.forEach(h=>{ const s=h.status||statusFromLevel(h.level); if(statusCounts[s]!==undefined) statusCounts[s]++; });
    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">虚实辨</h1>
      <p class="mb-4 text-sm text-[#8b6914]">章学诚《丙辰札记》评《三国演义》"七分实事，三分虚构"。共 ${list.length} 条情节虚实断语，依据《三国志》及裴松之注为正史基准。</p>
      <div class="flex flex-wrap gap-2 mb-4 text-sm">
        ${Object.entries(statusCounts).map(([k,v])=>`<span class="badge ${STATUS_META[k]?.cls||'badge-default'}">${STATUS_META[k]?.label||k} ${v}</span>`).join('')}
      </div>
      ${global.SANGUO_STATS ? `
      <div class="ancient-border p-4 rounded mb-4">
        <h3 class="text-lg font-bold text-[#8b0000] mb-1">虚实比例（四源合并）</h3>
        <p class="text-xs text-[#8b6914] mb-3">口径：情节虚实断语 + 战役虚实标注 + 人物/事件/器物虚实布尔 + 回目虚实注记，按本体 historicalStatus 四级词表实时聚合（SANGUO_STATS.virtualRatio）。</p>
        ${statBarList('四级分布', 'historicalStatus 词表', global.SANGUO_STATS.virtualRatio().map(r=>({label:r.label, value:r.count, display:r.count+'（'+r.pct+'%）', color:r.color})))}
      </div>` : ''}
      <table>
        <thead><tr><th>回目</th><th>演义情节</th><th>正史记载</th><th>虚实</th></tr></thead>
        <tbody>${list.map(h=>{ const s=h.status||statusFromLevel(h.level); return `<tr><td>第${h.chapter}回</td><td class="font-bold">${h.plot}</td><td>${h.history}</td><td>${virtualBadge(s)}</td></tr>`; }).join('')}</tbody>
      </table>
      <div class="mt-6 text-sm text-[#8b6914]">
        <p><span class="font-bold">说明：</span>"史实"为正史所载；"史实加工"为有史书依凭但细节文学化；"移花接木"为史有其事但张冠李戴、时空挪移；"虚构"为史所未载。</p>
      </div>
    </div>`;
  }

  function renderProphecy(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">天命谶</h1>
      <p class="mb-4 text-sm text-[#8b6914]">共 ${prophecies.length} 条童谣、谶语、梦兆与卷首总纲，多于后文应验。</p>
      <div class="space-y-4">
        ${prophecies.map(p=>`
          <div class="ancient-border p-5 rounded ancient-text">
            <h3 class="font-bold text-[#8b0000] text-xl mb-2 text-center">「${p.content}」</h3>
            <p class="text-center text-sm">—— ${p.prophet}${p.chapter?` · 第${p.chapter}回`:''}</p>
            <p class="text-center text-sm mt-1">应验：${Array.isArray(p.fulfilled)?p.fulfilled.join('、'):p.fulfilled||'—'}</p>
            ${p.note?`<p class="text-xs text-[#8b6914] text-center mt-1">${p.note}</p>`:''}
          </div>`).join('')}
      </div>
    </div>`;
  }

  function renderScholars(el){
    const scholars = [
      {name:"毛宗岗",desc:"清初评点家，字序始，号孑庵，长洲人。与父毛纶共同评改《三国演义》，成通行定本。其评点继承金圣叹文法，提出「正衬反衬」「关目照应」等小说理论，著《读三国志法》。"},
      {name:"李贽（卓吾）",desc:"明代思想家，评点风格泼辣犀利，嬉笑怒骂，开小说评点「童心说」一派。现存李评本多为叶昼托名。"},
      {name:"金圣叹",desc:"明末清初评点大家，毛宗岗评点多效仿其《水浒传》评法，毛本伪托金圣叹序。"},
      {name:"李渔（笠翁）",desc:"清初文学家，号笠翁，戏曲家兼小说家，其评本承袭毛评而多有新见，尤重情节关目。"},
      {name:"陈寿",desc:"西晋史学家，《三国志》作者，三国史实原始来源。叙事简洁谨严。"},
      {name:"裴松之",desc:"南朝宋史学家，为《三国志》作注，引书二百余种，注文字数三倍于原文，保存大量散佚史料。"},
      {name:"章学诚",desc:"清乾嘉学者，论演义「七分实事，三分虚构」，见《丙辰札记》。"},
      {name:"鲁迅",desc:"论三国人物「描写过实，以致失真」，见《中国小说史略》。"},
      {name:"胡适",desc:"《三国志演义序》系统论版本演化，评毛宗岗「不是批评家，乃是改作家」。"},
      {name:"郑振铎",desc:"《三国志演义的演化》梳理版本两系（演义/志传），为现代版本学奠基。"}
    ];
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">评点家与学者</h1>
      <div class="space-y-4">
        ${scholars.map(s=>`
          <div class="ancient-border p-4 rounded">
            <h3 class="font-bold text-[#8b0000] text-lg mb-2">${s.name}</h3>
            <p>${s.desc}</p>
          </div>`).join('')}
      </div>
    </div>`;
  }

  function renderReadMethod(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">读三国法</h1>
      <div class="ancient-border p-6 rounded ancient-text">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">毛宗岗《读三国志法》（节选）</h3>
        <p class="mb-3">三国一书，有总起总结，有伏线有照应，有横云断岭，有桥锁溪连，叙事之妙，古今来无逾此者。</p>
        <p class="mb-3">读三国者，当知有正衬反衬之法。写关公之勇，而以颜良文丑衬之，不足；又以华雄、五关六将衬之。写孔明之智，而以周瑜、司马懿衬之，不足；又以曹操、陆逊衬之。</p>
        <p class="mb-3">古史甚多，而人独贪看《三国演义》者，无他，古今人才之聚，未有盛于三国者也。三国之才，诚一一足为帝王师，一一足为宰相友。</p>
      </div>
    </div>`;
  }

  function renderAcademic(el){
    const st = global.SANGUO_STATS;
    const sysDist = st ? st.editionSystemDist() : [];
    const variantTop = st ? st.variantConcentration(6) : [];
    const ver = (ONT && ONT.meta && ONT.meta.version) ? ONT.meta.version : '';
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">学术研究</h1>
      <div class="ancient-border p-4 rounded mb-4">
        <p class="text-center text-[#8b6914]">学术研究论文索引模块，可补充历代三国研究文献、版本考证成果、学术观点摘要。</p>
        <p class="mt-3 text-sm text-center">核心研究方向：版本演化研究、作者成书考证、人物形象研究、叙事艺术研究、传播影响研究、史实与虚构关系研究。</p>
      </div>
      ${st ? `
      <div class="ancient-border p-4 rounded mb-4">
        <h3 class="text-lg font-bold text-[#8b0000] mb-1">版本系统差异集中度</h3>
        <p class="text-xs text-[#8b6914] mb-3">口径：语料清单 gaps 按版本系统映射 + items 按标题/备注关键词归类（对齐本体 editionSystem 词表）；异文集中度取 variantsExtra 按回计数。全部由 SANGUO_STATS 实时聚合。</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${statBarList('版本系统分布', 'corpus-manifest · gaps + items', sysDist.map(x=>({label:x.label, value:x.count})))}
          ${statBarList('异文按回集中度 TOP6', 'variantsExtra · chapter', variantTop.map(x=>({label:'第'+x.chapter+'回', value:x.count})))}
        </div>
      </div>` : ''}
      <div class="ancient-border p-4 rounded">
        <h3 class="text-lg font-bold text-[#8b0000] mb-2">本体数据导出</h3>
        <p class="text-sm mb-3">导出本体结构化数据 JSON，内容与 <code>data/ontology-schema.js</code> 的 SANGUO_ONTOLOGY 严格一致${ver?`（sanguo-ontology-v${ver}.json）`:''}，可直接导入 Protégé、Jena 等工具或作二次开发数据源。</p>
        <button class="btn" onclick="appExportOntology()">导出本体 JSON${ver?`（v${ver}）`:''}</button>
      </div>
    </div>`;
  }

  function renderAdaptations(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">演义外</h1>
      <div class="grid grid-cols-2 gap-4">
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">戏曲</h3>
          <p>《群英会》《借东风》《华容道》《空城计》《走麦城》等京剧与地方戏曲经典剧目。</p>
        </div>
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">评书</h3>
          <p>袁阔成、连丽如等评书名家的《三国演义》评书。</p>
        </div>
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">影视</h3>
          <p>1994 年央视版《三国演义》、2010 年新版《三国》、电影《赤壁》《见龙卸甲》等。</p>
        </div>
        <div class="ancient-border p-4 rounded">
          <h3 class="font-bold text-[#8b0000] mb-2">游戏</h3>
          <p>《三国志》系列、《真三国无双》系列、《三国杀》等各类三国题材游戏。</p>
        </div>
      </div>
    </div>`;
  }

  function renderRelationGraph(el){
    el.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">人物关系网</h1>
      <p class="text-sm text-[#8b6914] mb-2">共 ${(data.persons||[]).length} 人、${relations.length} 条关系。蓝色蜀汉、红色曹魏、绿色东吴、灰色群雄；可拖动、缩放。</p>
      <div id="graph-container" class="ancient-border rounded w-full" style="height: 72vh"></div>
    </div>`;
    setTimeout(() => {
      if(typeof echarts==='undefined') return;
      const chart = echarts.init(document.getElementById('graph-container'));
      const persons = data.persons||[];
      const idMap = {};
      persons.forEach(p=>idMap[p.id]=p.name);
      const colorMap = {"蜀汉":"#2563eb","曹魏":"#dc2626","东吴":"#16a34a","群雄":"#6b7280","汉室":"#9333ea","黄巾":"#ca8a04"};
      const catNames = Object.keys(colorMap);
      const nodes = persons.map(p=>{ const c=(p.faction||'').split('→')[0]; return {name:p.name, symbolSize: Math.min(34, (p.mentionCount||0)/60 + 10), itemStyle:{color:colorMap[c]||'#6b7280'}, category: Math.max(0, catNames.indexOf(c))}; });
      const links = relations.filter(r=>idMap[r.subject]&&idMap[r.object]).map(r=>({source:idMap[r.subject], target:idMap[r.object], value:r.predicate, label:{show:false}}));
      chart.setOption({
        tooltip:{formatter:p=>p.dataType==='edge'?(p.data.source+' — '+p.data.value+' → '+p.data.target):(p.name+'（'+(catNames[p.category]||'')+'）')},
        series:[{type:'graph', layout:'force', roam:true, data:nodes, links:links, categories:catNames.map(n=>({name:n})), force:{repulsion:220, edgeLength:[50,160]}, label:{show:true, position:'right', fontSize:11}, lineStyle:{opacity:0.45}}]
      });
      window.addEventListener('resize',()=>chart.resize());
    }, 100);
  }

  function renderMap(el){
    el.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-4">三国舆地图</h1>
      <p class="text-sm text-[#8b6914] mb-4">三国时期重要城邑与战场分布示意图（经纬度投影，x 103-122 / y 25-42）。</p>
      <div id="map-container" class="ancient-border rounded w-full" style="height: 70vh"></div>
    </div>`;
    setTimeout(()=>{
      if(typeof echarts==='undefined') return;
      const chart = echarts.init(document.getElementById('map-container'));
      const points = (data.places||[]).filter(p=>(p.coord||[]).length===2).map(p=>({name:p.name, value:p.coord.concat(p.level||'')}));
      chart.setOption({ tooltip:{formatter:p=>p.name+'<br>'+p.value[2]}, xAxis:{min:103,max:122,show:false}, yAxis:{min:25,max:42,show:false}, series:[{type:'scatter', coordinateSystem:'cartesian2d', data:points.map(p=>({name:p.name,value:[p.value[0],p.value[1]]})), symbolSize:10, label:{show:true,formatter:'{b}',position:'right',fontSize:10}, itemStyle:{color:'#8b0000'}}]});
      window.addEventListener('resize',()=>chart.resize());
    },100);
  }

  function renderQuery(el){
    el.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-4">本体查询</h1>
      <p class="text-sm text-[#8b6914] mb-4">选择实体类型与属性进行过滤查询。</p>
      <div class="ancient-border p-4 rounded mb-4 flex gap-3 items-center flex-wrap">
        <label class="font-bold">查询类：</label>
        <select id="query-class" class="border border-[#c9b896] rounded px-2 py-1" onchange="appRunQuery()">
          <option value="persons">人物</option><option value="places">地理</option><option value="battles">战役</option>
        </select>
        <label class="font-bold">按势力：</label>
        <select id="query-faction" class="border border-[#c9b896] rounded px-2 py-1" onchange="appRunQuery()">
          <option value="">全部</option><option value="蜀汉">蜀汉</option><option value="曹魏">曹魏</option><option value="东吴">东吴</option><option value="群雄">群雄</option>
        </select>
      </div>
      <div id="query-result"></div>
    </div>`;
    setTimeout(()=>appRunQuery(), 100);
  }

  global.appRunQuery = function(){
    const cls = document.getElementById('query-class').value;
    const faction = document.getElementById('query-faction').value;
    let items = data[cls]||[];
    if(faction && cls==='persons') items = items.filter(p=>(p.faction||'').startsWith(faction));
    document.getElementById('query-result').innerHTML = `<table><thead><tr><th>名称</th><th>属性1</th><th>属性2</th><th>属性3</th></tr></thead><tbody>${items.slice(0,50).map(item=>`<tr><td class="font-bold">${item.name}</td><td>${item.style||item.level||item.year||'-'}</td><td>${item.faction||item.modernLocation||item.result||'-'}</td><td>${item.title||(item.coord?.join?.(',')||'')||((item.keyPersons||[]).slice?.(0,3).join('、'))||'-'}</td></tr>`).join('')}</tbody></table>`;
  };

  function renderStatistics(el){
    el.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-4">统计谱</h1>
      <div class="grid grid-cols-2 gap-4">
        <div class="ancient-border p-4 rounded"><div id="chart1" style="height:350px"></div></div>
        <div class="ancient-border p-4 rounded"><div id="chart2" style="height:350px"></div></div>
        <div class="ancient-border p-4 rounded col-span-2"><div id="chart3" style="height:300px"></div></div>
      </div>
    </div>`;
    setTimeout(()=>{
      if(typeof echarts==='undefined') return;
      const factionCounts = {"蜀汉":0,"曹魏":0,"东吴":0,"群雄/其他":0};
      (data.persons||[]).forEach(p=>(p.faction||'').startsWith('蜀汉')?factionCounts['蜀汉']++:(p.faction||'').startsWith('曹魏')?factionCounts['曹魏']++:(p.faction||'').startsWith('东吴')?factionCounts['东吴']++:factionCounts['群雄/其他']++);
      echarts.init(document.getElementById('chart1')).setOption({title:{text:'人物势力分布',left:'center'},series:[{type:'pie',radius:['40%','70%'],data:Object.entries(factionCounts).map(([k,v])=>({name:k,value:v})),label:{formatter:'{b}: {c}人'}}]});
      const topPersons = [...(data.persons||[])].sort((a,b)=>(b.mentionCount||0)-(a.mentionCount||0)).slice(0,10);
      echarts.init(document.getElementById('chart2')).setOption({title:{text:'人物提及次数 TOP10',left:'center'},xAxis:{type:'category',data:topPersons.map(p=>p.name),axisLabel:{rotate:30}},yAxis:{type:'value'},series:[{type:'bar',data:topPersons.map(p=>p.mentionCount||0),itemStyle:{color:'#8b0000'}}]});
      const battleYears = {};
      (data.battles||[]).forEach(b=>{const y=parseInt(b.year);if(y>=184&&y<=280)battleYears[y]=(battleYears[y]||0)+1;});
      const yearData = Object.entries(battleYears).sort((a,b)=>a[0]-b[0]);
      echarts.init(document.getElementById('chart3')).setOption({title:{text:'重大战役时间分布（公元年）',left:'center'},xAxis:{type:'category',data:yearData.map(d=>d[0])},yAxis:{type:'value',name:'战役数'},series:[{type:'line',data:yearData.map(d=>d[1]),smooth:true,itemStyle:{color:'#8b4513'},areaStyle:{color:'#f0e6d2'}}]});
    },100);
  }

  /* ---- 增强版本体规范 ---- */
  function renderOntology(el){
    const o = ONT || {};
    const layers = o.layers || [];
    const classes = o.classes || [];
    const props = o.properties || [];
    const vocabs = o.vocabularies || {};
    const cqs = o.competencyQuestions || [];

    el.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-4">本体规范</h1>

      <div class="ancient-border p-5 rounded mb-4">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">基本信息</h3>
        <ul class="space-y-1 text-sm">
          <li>• 命名空间：<code>${o.meta?.iri||'https://example.org/sanguo#'}</code> · 前缀 <code>${o.meta?.prefix||'sg:'}</code></li>
          <li>• 类 ${classes.length} 个 · 属性 ${props.length} 个 · 词表 ${Object.keys(vocabs).length} 组</li>
          <li>• 覆盖本库 19 种古本/评本/史书约 640 万字语料</li>
        </ul>
      </div>

      ${layers.length?`
      <div class="ancient-border p-5 rounded mb-4">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">四层结构</h3>
        ${layers.map(l=>`
          <div class="flex gap-3 py-2 border-b border-dashed border-[#c9b896] last:border-0">
            <span class="w-10 text-right text-[#8b0000] font-bold flex-shrink-0">${l.order}</span>
            <div>
              <span class="font-bold">${l.label}</span> <span class="text-xs text-[#8b6914]">（${l.en}）</span>
              <p class="text-sm text-[#5a3a1a]">${l.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>`:''}

      ${Object.keys(vocabs).length?`
      <div class="ancient-border p-5 rounded mb-4">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">受控词表</h3>
        ${Object.entries(vocabs).map(([key,v])=>`
          <details class="mb-3"><summary class="cursor-pointer font-bold text-[#5a3a1a]">${v.label}（${key}）</summary>
            <p class="text-xs text-[#8b6914] mb-1">${v.desc||''}</p>
            <div class="flex flex-wrap gap-2">
              ${(v.terms||[]).map(t=>`<span class="badge ${STATUS_META[t.id]?.cls||'badge-default'}">${t.label}</span>`).join('')}
            </div>
          </details>`).join('')}
      </div>`:''}

      ${classes.length?`
      <div class="ancient-border p-5 rounded mb-4">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">核心类（${classes.length}）</h3>
        <table>
          <thead><tr><th>类名</th><th>层级</th><th>预计数</th><th>说明</th></tr></thead>
          <tbody>
            ${classes.map(c=>`<tr><td class="font-bold">${c.id}</td><td><span class="text-xs px-2 py-0.5 rounded bg-[#f0e6d2]">${c.layer||''}</span></td><td>${c.estCount||'?'}</td><td class="text-sm">${c.def||''}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`:''}

      ${cqs.length?`
      <div class="ancient-border p-5 rounded mb-4">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">能力问题（${cqs.length}）</h3>
        <ul class="space-y-1 text-sm">
          ${cqs.map((q,i)=>`<li>· ${i+1}. ${q}</li>`).join('')}
        </ul>
      </div>`:''}

      <div class="ancient-border p-5 rounded">
        <h3 class="font-bold text-[#8b0000] text-lg mb-3">OWL/Turtle 规范文件</h3>
        <p class="mb-3">完整本体文件（sanguo-ontology.ttl）可直接导入 Protégé、Apache Jena 等本体工具：</p>
        <a href="./sanguo-ontology.ttl" class="btn inline-block">下载 OWL 本体文件 (.ttl)</a>
        <a href="./data/ontology-schema.js" class="btn inline-block ml-2">下载 Schema (.js)</a>
        <a href="./data/sanguo-data.js" class="btn inline-block ml-2">下载结构化数据 (.js)</a>
      </div>
    </div>`;
  }

  function renderAbout(el){
    el.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-6">关于项目</h1>
      <div class="ancient-border p-5 rounded leading-relaxed">
        <p class="mb-3">《三国演义深度本体论》是一个以本体论方法构建的文学知识图谱项目，参考 yejinlei.github.io 四大名著系列架构，为《三国演义》打造完整的数字化研究平台。</p>
        <p class="mb-3">四层分离：文献层（版本·单元·异文）→ 叙事层（人物·战役·计谋）→ 评注层（毛李钟李四家评点）→ 结论层（公版学术论断·名家结论·虚实断语）。</p>
        <p class="mb-3">所有版本标注、公版结论、情节虚实断语，均著明出处。引用章学诚"七分实事，三分虚构"之说，虚构实体（貂蝉、关索、草船借箭）同样挂接图谱，虚实皆有依据。</p>
        <p class="mb-3">全站简体 UI，正文支持繁/简/白话三态切换。纯静态无服务端架构，所有计算在浏览器端完成，可直接部署于 GitHub Pages。</p>
        <p>技术栈：HTML + Tailwind CSS + Vanilla JS + ECharts。本体规范：OWL 2 DL，可序列化导入 Protégé、Jena 等本体工具。</p>
      </div>
    </div>`;
  }

  /* ======================== 阅读器状态 API ======================== */
  global.appGoChapter = function(n){
    currentChapter = Math.max(1, Math.min(120, n));
    if(typeof showView==='function') showView('reader');
  };
  global.appShowReader = function(){ showView('reader'); };
  global.appSetReaderMode = function(m){
    if(['traditional','simplified','vernacular'].includes(m)){
      readerState.lang = m;
      localStorage.setItem('sanguo-reader-mode', m);
      showView('reader');
    }
  };
  global.appSetEdition = function(id){
    if(id){
      readerState.edition = id;
      currentEdition = id;
      showView('reader');
    }
  };
  global.appSetAnnot = function(key, on){
    if(key === 'all') readerState.annot.all = !!on;
    else if(Object.prototype.hasOwnProperty.call(readerState.annot, key)) readerState.annot[key] = !!on;
    applyAnnotVisibility();
    syncReaderUrl();
  };
  global.appLcsDiff = function(){
    const a = document.getElementById('textA').value;
    const b = document.getElementById('textB').value;
    if(!a||!b) return alert('请输入两段文本');
    const r = lcsDiffFn(a,b);
    document.getElementById('diff-result').classList.remove('hidden');
    document.getElementById('diff-result').innerHTML = '<div class="mb-2"><span class="text-[#8b0000]">【A 独有】</span><br>'+esc(r.onlyA)+'</div><div><span class="text-[#006400]">【B 独有】</span><br>'+esc(r.onlyB)+'</div>';
  };

  /* ======================== 本体 JSON 导出 ======================== */
  function ontologyJSONString(){
    return ONT ? JSON.stringify(ONT, null, 2) : '';
  }
  global.appExportOntology = function(){
    if(!ONT){ alert('本体数据未载入'); return; }
    const ver = (ONT.meta && ONT.meta.version) ? ONT.meta.version : '0';
    const blob = new Blob([ontologyJSONString()], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanguo-ontology-v' + ver + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };

  /* ======================== 初始化入口 ======================== */
  function appInit(pageName){
    // 根据当前页面自动决定默认 view
    const defaults = {
      'index.html': 'home',
      'read.html': 'reader',
      'graph.html': 'persons',
      'research.html': 'comments',
      'topics.html': 'heros'
    };
    const viewName = pageName || defaults['index.html'] || 'home';
    showView(viewName);
  }

  // 导出
  global.SANGUO_APP = {
    showView, renderHome, renderReader, renderOntology, renderAbout,
    virtualBadge, STATUS_META, simpleT2S, normName, personIdByName,
    appInit, statusFromLevel, levelFromStatus, lcsDiffFn,
    ontologyJSONString, appExportOntology: global.appExportOntology,
    data, relations, historicalContrast, comments, variants, stratagems, poems, prophecies,
    eventsData, artifactsData, factionsData, editionsExtra,
    currentChapter, currentEdition,
    appGoChapter: global.appGoChapter,
    appShowReader: global.appShowReader,
    appSetReaderMode: global.appSetReaderMode,
    appSetEdition: global.appSetEdition,
    appSetAnnot: global.appSetAnnot,
    appCmpRun: global.appCmpRun
  };

  // 自动初始化（等待 DOM ready）
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      // 不自动渲染，让页面自己调用 appInit
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
