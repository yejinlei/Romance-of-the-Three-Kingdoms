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
      case 'compare':       renderMultiCompare(content); break;
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
      case 'topic-doctrines':  renderTopicDoctrines(content); break;
      case 'topic-battles':    renderTopicBattles(content); break;
      case 'topic-prophecies': renderTopicProphecies(content); break;
      case 'topic-factions':   renderTopicFactions(content); break;
      case 'topic-imagery':   renderTopicImagery(content); break;
      case 'topic-techniques': renderTopicTechniques(content); break;
      case 'topic-drift':      renderTopicDoctrineDrift(content); break;
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
    // 批注单一真相源：四家标志即真相；可见性与 URL 编解码均从此派生
    annot: { maozigang:true, lizhi:true, zhongxing:true, liyuweng:true }
  };
  // 用户点选侧栏的「版本单元号」（单元制版本）。非空时侧栏高亮该单元、工具栏按其显示，
  // 保证 侧栏条目 ↔ 工具栏计数 ↔ 正文 三者口径一致；翻页/切版本后清空回退到回→单元映射
  let clickedUnitN = null;
  let readerUrlParsed = false;

  // textStatus 受控词表标签（与 ontology-schema.js Vocab_textStatus 一致）
  const TEXT_STATUS_LABEL = {
    full:'全文入库', partial:'部分入库', absent:'未获',
    readable:'全文入库',            // 非毛本整理本：texts 目录已按单元接入阅读
    ocr:'仅OCR（未整理）',         // 未接入阅读、仅检索
    ocrReadable:'OCR可读（未校勘）',  // OCR 本：已接入阅读，未校勘
    catalog:'仅存目次',            // 目录本：仅存卷目次，无正文
    facsimile:'仅影印'
  };
  // 可读状态集：凡可展示正文（full=毛本 CHAPTER_TEXT，readable=整理本，ocrReadable=OCR 本）
  const TEXT_STATUS_READABLE = ['full','readable','ocrReadable'];

  // 由 corpus-manifest 清单字段 + VERSION_ONTOLOGY 可读性派生 textStatus。
  // 关键：有 texts 文件且可接入阅读的版本，无论整理本还是 OCR 本，都是「全文入库/可读」，
  // 不再一律标 partial（部分入库）——那是「未获抓取网上版本」时的旧派生逻辑。
  function deriveItemTextStatus(it, ont){
    if(!it) return 'absent';
    if(it.id === 'mao') return 'full';      // text.js 120 回全文已接入站内阅读
    if(it.chars > 0){
      if(ont && ont.catalogOnly) return 'catalog'; // 目录本：仅存目次，无正文
      if(ont && ont.file) return it.ocr ? 'ocrReadable' : 'readable';
      return 'partial';                           // 无版本配置，未接入阅读
    }
    return 'absent';                        // 文本未入库
  }
  function deriveGapTextStatus(g){
    const s = g.status || '';
    if(/OCR/.test(s) && /、未校勘/.test(s)) return 'ocrReadable'; // OCR 本已接入阅读
    if(/OCR/.test(s)) return 'ocr';                                  // 未接入阅读、仅检索
    if(/部分可得/.test(s)) return 'partial';
    if(/不收錄|不收录|拿不到|無可抓取|无可抓取/.test(s + (g.tier || ''))) return 'absent';
    return 'facsimile';                     // 未獲文本而有影印 → 仅影印
  }
  // 下拉标签后缀：版本名已含「（OCR）」「（OCR，殘本）」等括号者，不再追加重复前缀，避免双重括号
  // 下拉/对照选项的完整显示文本。
  // OCR 本标题已自带「（OCR）」括号，状态后缀合并进该括号，避免「（OCR）（可读·未校勘）」双重括号
  function versionLabel(v){
    const st = TEXT_STATUS_LABEL[v.status] || v.status;
    const t = String(v.title || '');
    if(v.status === 'ocrReadable'){
      const m = t.match(/[（(]OCR([^）)]*)[）)]/);
      if(m){
        const extra = String(m[1] || '').replace(/^[，,、\s]+/, '');
        const merged = ['OCR', extra, '可读 · 未校勘'].filter(Boolean).join(' · ');
        return t.replace(m[0], '（' + merged + '）');
      }
    }
    return t + '（' + st + '）';
  }

  // 版本单元缓存（文件级）：fileName → units 数组
  const edUnitCacheAll = {};
  // 按 VERSION_ONTOLOGY 配置切分指定版本全部单元（用 unitsplit.js，替换旧 splitZeText）
  async function getEditionUnits(fileName, meta){
    const key = fileName + '|' + meta.id + '|' + JSON.stringify(meta.splitOpts||{});
    if(edUnitCacheAll[key]) return edUnitCacheAll[key];
    const res = await fetch('texts/' + encodeURIComponent(fileName));
    if(!res.ok) throw new Error(fileName + ' HTTP ' + res.status);
    let units = (typeof UNITSplit !== 'undefined') ? UNITSplit.splitByKind(await res.text(), meta.splitKind, meta.splitOpts) : [];
    units = normalizeUnits(units, meta);
    edUnitCacheAll[key] = units;
    return units;
  }
  // 版本单元归一化：按配置修正 n、去重、过滤标题
  function normalizeUnits(units, meta){
    let arr = (units || []).slice();
    // 过滤标题（如裴注只取「魏書/蜀書/吳書」卷）
    if(meta && meta.filterTitle){
      arr = arr.filter(u => meta.filterTitle.test(u.title || ''));
    }
    // 夏振宇等乱序残本：按则号去重（目录污染重复），保留原则号（按文件出现序）
    if(meta && meta.unordered){
      const st = new Set(); const dd = [];
      for(const u of arr){
        if(u.n === undefined){ dd.push(u); continue; }
        if(st.has(u.n)) continue;
        st.add(u.n); dd.push(u);
      }
      return dd;
    }
    // 依 n 去重（保序）：同一则号出现多次（目录污染）只留首个；无 n 的正文段一律保留
    const seen = new Set(); const dedup = [];
    for(const u of arr){
      if(u.n === undefined){ dedup.push(u); continue; }
      if(seen.has(u.n)) continue;
      seen.add(u.n); dedup.push(u);
    }
    arr = dedup;
    // 全无编号单元（如裴注卷、黄正甫则题名）：按文件出现顺序编 1..N
    if(arr.length && arr.every(u => u.n === undefined) && !(meta && meta.splitKind === 'volume')){
      arr = arr.map((u,i) => ({ ...u, n: i+1 }));
      return arr;
    }
    // 嘉靖系：卷内则无编号（splitKind=volume），按「卷序×perVolume+卷内序」生成则号
    if(meta && meta.splitKind === 'volume' && meta.perVolume){
      const numbered = [];
      let volIdx = 0, inner = 0;
      for(const u of arr){
        if(u.title && /^卷之/.test(u.title)){
          volIdx = u.n || (volIdx+1); inner = 0;
        } else {
          inner += 1;
          const zeN = (volIdx-1) * meta.perVolume + inner;
          numbered.push({ ...u, n: zeN, volume: u.volume || ('卷之' + cnNum(volIdx)) });
        }
      }
      arr = numbered;
    }
    return arr;
  }
  // 十进制 → 中文（仅用于卷号显示，≤24）
  function cnNum(n){
    const d=['零','一','二','三','四','五','六','七','八','九','十'];
    if(n<=10) return d[n]||String(n);
    if(n<20) return '十'+(n%10?d[n%10]:'');
    return d[Math.floor(n/10)]+'十'+(n%10?d[n%10]:'');
  }
  // 该毛本回 → 版本单元号数组（映射规则运行时推导）
  function computeUnitNsForChapter(meta, chapterNum){
    if(!meta) return null;
    if(meta.kind === 'hui') return [chapterNum];                 // 回=回恒等
    if(meta.kind === 'jiajing'){                                 // 每回2则
      return [chapterNum*2-1, chapterNum*2];
    }
    if(meta.kind === 'ze'){                                      // 按比例近似，返回区间
      const total = meta.unitCount || 180;
      const n = Math.round(chapterNum * total / 120);
      const c = Math.max(1, Math.min(total, n));
      const prev = Math.max(1, Math.min(total, Math.round((chapterNum-1) * total / 120)));
      const ns = [];
      for(let k = prev; k <= c; k++) ns.push(k);
      return ns.length ? ns : [c];
    }
    if(meta.kind === 'juan'){                                   // 卷·篇制：按叙事进度比例映射
      const total = meta.unitCount || 1;
      const c = Math.max(1, Math.min(total, Math.round(chapterNum * total / 120)));
      const prev = Math.max(1, Math.min(total, Math.round((chapterNum-1) * total / 120)));
      const ns = [];
      for(let k = prev; k <= c; k++) ns.push(k);
      return ns.length ? ns : [c];
    }
    return null;
  }

  // 按「第N則」切分 OCR 志传系文本（委托 unitsplit.js，保留兼容导出）
  function splitZeText(txt){
    if(typeof UNITSplit !== 'undefined') return UNITSplit.splitZeText(txt);
    const lines = String(txt || '').split('\n');
    const marks = [];
    let volume = '';
    for(let i = 0; i < lines.length; i++){
      const line = lines[i].replace(/\r$/, '');
      const vm = line.match(/^===\s*(.+?)\s*===\s*$/);
      if(vm){ volume = vm[1]; continue; }
      const m = line.match(/^###\s*第([0-9０-９一二三四五六七八九十百零〇]{1,6})則[　\s]*(.*)$/);
      if(m) marks.push({ num: cmpCnNum(m[1]), title: String(m[2]||'').trim(), line: i, volume: volume });
    }
    return marks.map((mk, k) => {
      const end = (k + 1 < marks.length) ? marks[k+1].line : lines.length;
      const paras = lines.slice(mk.line + 1, end)
        .filter(l => l.trim() && !/^>/.test(l.trim()) && !/^---+$/.test(l.trim()))
        .map(l => l.replace(/\*\*/g, '').trim());
      return { n: mk.num, title: mk.title, volume: mk.volume, paras: paras };
    });
  }
  const ocrZeCache = {};
  // 取指定 OCR 版本的某一则正文（按卷/则切分后按编号定位）
  async function getOcrZeByNum(fileName, zeNum){
    if(ocrZeCache[fileName + '#' + zeNum]) return ocrZeCache[fileName + '#' + zeNum];
    if(!ocrZeCache[fileName]){
      const res = await fetch('texts/' + encodeURIComponent(fileName));
      if(!res.ok) throw new Error(fileName + ' HTTP ' + res.status);
      ocrZeCache[fileName] = splitZeText(await res.text());
    }
    const unit = (ocrZeCache[fileName] || []).find(u => u.n === zeNum);
    const out = unit ? { n: unit.n, title: unit.title, volume: unit.volume, paras: unit.paras } : null;
    ocrZeCache[fileName + '#' + zeNum] = out;
    return out;
  }

  // 版本清单（corpus items + gaps 合并去重），含派生 textStatus
  function buildVersionRows(){
    const corpus = (typeof SANGUO_CORPUS !== 'undefined') ? SANGUO_CORPUS : null;
    const rows = [];
    const norm = s => String(s || '').replace(/[（(][^)）]*[)）]/g, '').replace(/[/／\s·、]/g, '');
    const seenTitles = {};
    if(corpus && Array.isArray(corpus.items)){
      const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
      corpus.items.forEach(it => {
        if(/^cmt-/.test(it.id) || /-front$/.test(it.id) || it.id === 'mao-dufa') return; // 卷首/评语辑录不作阅读版本
        seenTitles[norm(it.title)] = true;
        const ont = (VONT && VONT.editions) ? VONT.editions[it.id] : null;
        rows.push({ id: it.id, title: it.title, status: deriveItemTextStatus(it, ont), chars: it.chars || 0, units: it.units || null });
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

  /* ---- 左侧「回目列表」随所选版本联动 ---- */
  // 版本侧栏数据：毛本/回制版本=120 回题名；非回制（則/卷/篇）=该版本切分出的真实单元
  let readerToc = null; // { id, kind: 'chapter'|'unit', items: [{n, title}] }
  // 侧栏条目 HTML：回制高亮当前回；单元制（則/卷/篇）优先高亮用户点选的单元号，
  // 未点选时回退到「当前毛本回 → 该版本单元」的映射区间（ze 系按比例近似为一小区间）
  function tocItemsHTML(){
    const t = readerToc;
    if(!t || !Array.isArray(t.items) || !t.items.length) return '';
    let hitSet = null;
    if(t.kind === 'unit'){
      let ns = null;
      if(clickedUnitN != null){
        ns = [clickedUnitN];
      } else {
        const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
        const meta = (VONT && VONT.editions) ? VONT.editions[t.id] : null;
        ns = computeUnitNsForChapter(meta, currentChapter);
      }
      hitSet = new Set(ns || []);
    }
    return t.items.map(it => `
      <div class="reader-toc-item ${(t.kind === 'chapter' ? it.n===currentChapter : (hitSet && hitSet.has(it.n)))?'active':''}" onclick="appGoEditionUnit('${t.id}', ${it.n})">
        ${esc(t.kind === 'chapter' ? ('第' + it.n + '回') : ('' + it.n))}${it.title ? ' ' + esc(it.title) : ''}
      </div>`).join('');
  }
  // 构建侧栏数据：回制版本同步给 120 回题名；非回制需切分该版本文件取真实单元题名
  function buildReaderToc(editionId){
    const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
    const meta = (VONT && VONT.editions) ? VONT.editions[editionId] : null;
    const isChapterMode = !meta || meta.unitKind === '回' || !meta.file;
    // 目录本（catalogOnly，仅存目次无正文）：用本体 unitCount 生成「卷之N」条目，
    // 不依赖切分结果（文件只有目次，切分只得 1 条「全文」）
    if(meta && meta.catalogOnly && meta.unitCount){
      const n = meta.unitCount;
      readerToc = { id: editionId, kind: 'unit', items: Array.from({length:n}, (_,i) => ({ n: i+1, title: (meta.unitKind === '卷' ? '卷之' : '') + cnNum(i+1) })) };
      const el = document.getElementById('edition-toc');
      if(el) el.innerHTML = tocItemsHTML();
      return;
    }
    // 回制：用毛本 120 回题名；若该版本回号缺失（如 sankuo-en 114 回），
    // 按该版本真实单元切分出真实回号序列，使侧栏条数/回号与工具栏「共 N 回」口径一致
    if(isChapterMode){
      if(meta && meta.file && meta.unitCount && meta.unitCount < 120){
        const cachedKey = Object.keys(edUnitCacheAll).find(k => k.indexOf(meta.file) === 0 && k.indexOf('|' + editionId + '|') > 0);
        if(cachedKey){
          applyChapterToc(editionId, meta, edUnitCacheAll[cachedKey]);
          return;
        }
        if(typeof UNITSplit !== 'undefined'){
          getEditionUnits(meta.file, meta).then(units => applyChapterToc(editionId, meta, units)).catch(() => {});
        }
        return;
      }
      readerToc = { id: editionId, kind: 'chapter', items: (data.chapters || []).map(c => ({ n: c.id, title: c.title })) };
      const el = document.getElementById('edition-toc');
      if(el) el.innerHTML = tocItemsHTML();
      return;
    }
    // 非回制：命中缓存同步更新，否则异步切分后更新
    const cachedKey = Object.keys(edUnitCacheAll).find(k => k.indexOf(meta.file) === 0 && k.indexOf('|' + editionId + '|') > 0);
    if(cachedKey){
      applyUnitToc(editionId, meta, edUnitCacheAll[cachedKey]);
      return;
    }
    if(typeof UNITSplit !== 'undefined'){
      getEditionUnits(meta.file, meta).then(units => applyUnitToc(editionId, meta, units)).catch(() => {});
    }
  }
  function applyUnitToc(editionId, meta, units){
    const arr = (units || []).filter(u => u.title && !/^(卷首|目錄|目次|凡例|讀法)/.test(String(u.title)));
    if(!arr.length) return;
    readerToc = { id: editionId, kind: 'unit', items: arr.slice(0, 500).map(u => ({ n: u.n, title: u.title })) };
    const el = document.getElementById('edition-toc');
    if(el) el.innerHTML = tocItemsHTML();
  }
  // 回制但回号缺失的版本（如 sankuo-en 114 回）：用该版本真实单元回号序列构建侧栏
  function applyChapterToc(editionId, meta, units){
    const arr = (units || []).filter(u => u.title);
    if(!arr.length) return;
    readerToc = { id: editionId, kind: 'chapter', items: arr.slice(0, 500).map(u => ({ n: u.n, title: u.title })) };
    const el = document.getElementById('edition-toc');
    if(el) el.innerHTML = tocItemsHTML();
  }
  // 单元制版本（則/卷/篇）：单元号 → 毛本回（比例反算，与正向 computeUnitNsForChapter 对称）
  function chapterFromUnit(meta, unitN){
    if(!meta || !unitN) return 1;
    const total = meta.unitCount || 120;
    return Math.max(1, Math.min(120, Math.round(unitN * 120 / total)));
  }
  // 点击侧栏条目：记录点选单元号（回制即回号），单元制再反算毛本回；
  // 侧栏高亮、工具栏计数、正文单元三者口径由此保持统一。
  global.appGoEditionUnit = function(editionId, unitN){
    if(editionId) readerState.edition = editionId;
    const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
    const meta = (VONT && VONT.editions) ? VONT.editions[editionId] : null;
    clickedUnitN = unitN != null ? unitN : null;
    currentChapter = meta && meta.unitKind !== '回'
      ? chapterFromUnit(meta, unitN)
      : Math.max(1, unitN || 1);
    if(typeof showView === 'function') showView('reader');
  };

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
      // URL 只编码「实际可见的评点家集合」，与 applyAnnotVisibility 同源：
      // all=四家全开 / none=全关 / 列表=仅列表内可见。兼容旧 off: 前缀（取其后可见集）。
      ANNOT_CRITICS.forEach(c => { readerState.annot[c.id] = false; });
      if(annot === 'all'){
        ANNOT_CRITICS.forEach(c => { readerState.annot[c.id] = true; });
      } else if(annot !== 'none'){
        const ids = annot.replace(/^off:/, '').split(',').map(s => s.trim()).filter(Boolean);
        ids.forEach(id => { if(Object.prototype.hasOwnProperty.call(readerState.annot, id)) readerState.annot[id] = true; });
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
    // 编码与 applyAnnotVisibility 同源：可见集合 = readerState.annot 中为真的家
    const visibleIds = ANNOT_CRITICS.filter(c => readerState.annot[c.id]).map(c => c.id);
    let annotVal;
    if(visibleIds.length === ANNOT_CRITICS.length) annotVal = 'all';
    else if(visibleIds.length === 0) annotVal = 'none';
    else annotVal = visibleIds.join(',');
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
    // 版本元信息（切分配置 + 映射规则）：先于可读性判定声明
    const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
    const edMeta = (VONT && VONT.editions) ? VONT.editions[readerState.edition] : null;
    // 目录本（仅存目次无正文，如钱氏藏书本）：不进阅读，明确说明
    const catalogOnly = !!(edMeta && edMeta.catalogOnly);
    // 左侧「回目列表」随所选版本联动（须先于 el.innerHTML 求值，模板内调用 tocItemsHTML）
    buildReaderToc(readerState.edition);
    // 可读性：full / readable / ocrReadable 均展示正文（full 走 CHAPTER_TEXT，其余按版本单元异步取文）
    const readable = !!(vrow && ['full','readable','ocrReadable'].includes(vrow.status)) && !catalogOnly;
    const ocrReadable = readable; // 兼容：凡可读版本按单元取章
    // 通用版本单元定位：非毛本且有版本配置 → 返回该版本文本元信息（file + editionId）
    const ocrInfo = (function(){
      if(!vrow || vrow.status === 'full') return null; // 毛本走 CHAPTER_TEXT
      if(!edMeta || !edMeta.file) return null;
      if(edMeta.catalogOnly) return null; // 目录本（仅存目次无正文），不进阅读
      return { file: edMeta.file, editionId: vrow.id, meta: edMeta };
    })();
    // 该毛本回对应的版本单元号（数组，嘉靖每回 2 则；ze 系按比例近似）
    const ocrZeForChapter = (function(){
      if(!ocrInfo) return null;
      const meta = edMeta;
      // 显式映射优先：余象斗等（YXD_ONTOLOGY.unitMappings → 'mao-chN'）
      if(meta && meta.explicitMapping === 'YXD_ONTOLOGY'){
        const yxd = (typeof YXD_ONTOLOGY !== 'undefined') ? YXD_ONTOLOGY : null;
        if(yxd){
          const map = (yxd.unitMappings || []).find(m => m.to === 'mao-ch' + chapterNum);
          if(map){
            const zm = String(map.from).match(/第([0-9]+)則/);
            if(zm) return [parseInt(zm[1],10)];
          }
        }
      }
      return computeUnitNsForChapter(meta, chapterNum);
    })();
    // 版本单元缓存（文件级）
    const edUnitCache = edUnitCacheAll;
    // 该版本全部单元（异步获取，供正文层取文；含 normalizeUnits 后的 n 连续化）
    const edUnitsPromise = ocrInfo ? getEditionUnits(ocrInfo.file, edMeta) : null;

    // 三体处理：繁=原文原样 / 简=t2s.js 转换 / 白=编者自撰导读
    let bodyHTML = '';
    let viewLabel = '';
    let viewDesc = '';
    let sourceLayer = '';
    // 白话导读层由站内元数据（events/stratagems/persons 等）派生，与所选版本是否全文入库无关，
    // 因此白话模式不因版本 partial/absent 短路——始终显示导读层；原文层按可读性追加。
    if(mode==='vernacular'){
      // 白话：导读层在上、原文正文在下并存，不替换正文（切走后再切回不丢原文）
      const simplifiedBody = chapterText.text ? simpleT2S(chapterText.text) : '';
      let lowerNote = '';
      // OCR 版本：导读层 + 该则 OCR 正文（按则取章），不再给「无可读全文」提示
      if(ocrInfo && ocrZeForChapter){
        bodyHTML = renderVernacularGuide(chapterNum)
          + `<div class="guide-body-sep mt-4 pt-3 border-t border-[#c9b896]"></div>`
          + `<div class="guide-backlink mb-3"><button class="btn btn-sm" onclick="appSetReaderMode('traditional')">↑ 只看原文（繁体）</button></div>`
          + `<div class="ocr-ze-wrap" id="ocr-ze-body"><div class="text-sm text-[#8b6914]">正在载入该则 OCR 正文…</div></div>`;
        viewLabel = '白话导读 + 原文（按单元）';
        viewDesc = '编者所撰导读在上，该版本文本（' + (edMeta && edMeta.ocr ? 'OCR·未校勘' : '整理本') + '）在下；仅作浏览。';
        sourceLayer = '编者导读层 + 原文层 · ' + esc(vrow.title) + '（按版本单元取章）';
      } else {
        // 非 OCR 白话：导读层 +（可读 ? 简化正文 : 版本说明），不再被上支覆盖
        if(!readable){
          const st = vrow ? vrow.status : 'absent';
          lowerNote = `<div class="empty-state mt-4">
            <p class="text-sm">所选版本「${esc(vrow ? vrow.title : readerState.edition)}」文本状态：<strong>${TEXT_STATUS_LABEL[st] || st}</strong>${vrow && vrow.gapNote ? `（${esc(vrow.gapNote)}）` : ''}，下方不附原文；${st === 'partial' ? '本版本已入库语料库，' : '本版本无入库可读文本，'}可至「多版本语料库」查看该版正文。</p>
          </div>`;
        }
        bodyHTML = renderVernacularGuide(chapterNum)
          + `<div class="guide-body-sep mt-4 pt-3 border-t border-[#c9b896]"></div>`
          + `<div class="guide-backlink mb-3"><button class="btn btn-sm" onclick="appSetReaderMode('traditional')">↑ 只看原文（繁体）</button></div>`
          + (readable ? simplifiedBody : lowerNote);
        viewLabel = '白话导读' + (readable ? ' + 原文' : '');
        viewDesc = '编者所撰导读在上' + (readable ? '，毛宗岗本原文（简体）在下，两层并存' : '，原文层依版本可读性而定') + '。';
        sourceLayer = '编者导读层' + (readable ? ' + 原文层 · 毛宗岗本正文（t2s.js 繁转简）' : '（版本未全文入库，无原文层）');
      }
    } else if(ocrInfo && ocrZeForChapter){
      // 非毛本版本传统/简体：按版本单元取正文显示（繁体原样 / t2s 转简体）
      bodyHTML = `<div class="ocr-ze-wrap" id="ocr-ze-body"><div class="text-sm text-[#8b6914]">正在载入该版本单元正文…</div></div>`;
      viewLabel = (mode === 'simplified') ? '简体（版本原文）' : '繁体原文（版本原文）';
      viewDesc = '该版本文本（' + (edMeta && edMeta.ocr ? 'OCR·未校勘' : '整理本') + '）按版本单元显示；仅作浏览。';
      sourceLayer = '原文层 · ' + esc(vrow.title) + '（按版本单元取章' + (mode === 'simplified' ? '，t2s.js 繁转简' : '，繁体原样') + '）';
    } else if(!readable){
      const st = vrow ? vrow.status : 'absent';
      const catNote = catalogOnly
        ? '。本文件为钱氏藏书电子本，仅存卷目次（24 卷 × 10 则题名），正文另见「嘉靖壬午本（维基文库转录本）」'
        : '';
      bodyHTML = `<div class="empty-state">
        <h3 class="text-lg font-bold mb-2">本版本无可读全文</h3>
        <p class="text-sm">版本「${esc(vrow ? vrow.title : readerState.edition)}」文本状态：<strong>${TEXT_STATUS_LABEL[st] || st}</strong>${vrow && vrow.gapNote ? `（${esc(vrow.gapNote)}）` : ''}${esc(catNote)}。</p>
        <p class="text-sm mt-2">docs/texts 下各版本已按单元接入阅读（按回/则/卷自动取章）；${catalogOnly ? '本目录本不含正文，不可作阅读底本。' : '本版本无入库可读正文，'}可至「多版本语料库」「影印本阅读」查看相关材料。</p>
      </div>`;
      viewLabel = '版本说明';
      viewDesc = catalogOnly ? '所选版本仅存目次，未接入站内全文阅读。' : '所选版本未接入站内全文阅读。';
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
    }

    const prevChapter = chapterNum - 1;
    const nextChapter = chapterNum + 1;
    // 工具栏「第 N 则/卷/篇 · 共 M」：点选侧栏单元时按其号显示，否则按毛本回正向映射；
    // 回制版本按本体 unitCount 显示总量（sankuo-en 114 回、jiajing-ws 240 则等），
    // 使 侧栏条目数 ↔ 工具栏计数 ↔ 正文单元 三者口径一致
    const displayUnitN = (function(){
      if(!edMeta || !edMeta.unitKind) return chapterNum;
      if(edMeta.unitKind === '回') return chapterNum;
      if(clickedUnitN != null) return clickedUnitN;
      const ns = computeUnitNsForChapter(edMeta, chapterNum);
      return ns && ns.length ? ns[0] : chapterNum;
    })();
    const displayTotal = edMeta ? (edMeta.unitCount || 120) : 120;

    // 批注块（annotations.js commentaryIndex 评注 + text.js 回前评归毛宗岗栏），按评点家分栏
    const critName = id => {
      const c = ANNOT_CRITICS.find(x => x.id === id);
      return c ? c.name : id;
    };
    const idx = (ANN && Array.isArray(ANN.commentaryIndex)) ? ANN.commentaryIndex : [];
    const chapAnnots = idx.filter(a => a.unit === chapterNum);
    // 本回各评点家批注条数（含毛宗岗回前评），供工具栏提示「本回 N 条 / 本回无」
    const criticCount = {};
    chapAnnots.forEach(a => { criticCount[a.criticId] = (criticCount[a.criticId] || 0) + 1; });
    if(chapterText.preComment) criticCount['maozigang'] = (criticCount['maozigang'] || 0) + 1;
    const allAnnotOn = ANNOT_CRITICS.every(c => readerState.annot[c.id]);
    const annotBlocksHTML = chapAnnots.map(a => `
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
          <div id="edition-toc">${tocItemsHTML()}</div>
        </div>

        <!-- 正文 -->
        <div class="reader-body">
          <div class="reader-toolbar">
            <div class="flex gap-2 items-center">
              <label class="font-bold">版本：</label>
              <select id="edition-select" class="border border-[#c9b896] rounded px-2 py-1 bg-white"
                onchange="appSetEdition(this.value)">
                ${vrows.map(v=>{
                  const dis = (v.status!=='full' && v.status!=='readable' && v.status!=='ocrReadable');
                  const ont = (VONT && VONT.editions && VONT.editions[v.id]);
                  // 无版本本体配置的版本（如卷首/辑录类）仍不可读；目录本（仅目次）不可读
                  const dis2 = dis || (!ont && v.status!=='full') || (ont && ont.catalogOnly);
                  return `<option value="${esc(v.id)}" ${v.id===readerState.edition?'selected':''} ${dis2?'disabled':''}>${esc(versionLabel(v))}</option>`;
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
              ${edMeta && edMeta.unitKind && edMeta.unitKind !== '回'
                ? ('第 ' + displayUnitN + ' ' + edMeta.unitKind + ' / 共 ' + displayTotal + ' ' + edMeta.unitKind)
                : ('第 ' + chapterNum + ' 回 / 共 ' + displayTotal + ' 回')}
              ${vrow ? ` · ${esc(versionLabel(vrow))}` : ''}
            </div>
            <a class="text-sm text-[#8b0000] underline ml-auto" href="corpus.html#ed=${encodeURIComponent(readerState.edition)}&c=${chapterNum}">多版本对读 →</a>
          </div>

          <!-- 批注显隐：总开关 + 按评点家（毛宗岗/李卓吾/钟伯敬/李渔）分栏 -->
          <div class="annot-toolbar text-sm flex flex-wrap gap-3 items-center border-b border-[#c9b896] pb-2 mb-3">
            <span class="font-bold">批注：</span>
            <label class="flex items-center gap-1" title="全选 / 全清四家批注"><input type="checkbox" id="annot-toggle-all" ${allAnnotOn?'checked':''} onchange="appSetAnnot('all', this.checked)"> 总开关</label>
            ${ANNOT_CRITICS.map(c=>{
              const n = criticCount[c.id] || 0;
              return `
              <label class="flex items-center gap-1" title="${n?'本回 '+c.name+' 批注 '+n+' 条':'本回无 '+c.name+' 批注'}"><input type="checkbox" data-annot-toggle="${c.id}" ${readerState.annot[c.id]?'checked':''} onchange="appSetAnnot('${c.id}', this.checked)"> ${c.name}<span class="text-xs ${n?'text-[#8b6914]':'text-[#aaa]'} ml-0.5">（${n?n+'条':'本回无'}）</span></label>`;
            }).join('')}
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
    // 非毛本版本：异步取该版本单元正文，填充 #ocr-ze-body（渲染占位后加载）
    if(ocrInfo && ocrZeForChapter){
      const bodyEl = el.querySelector('#ocr-ze-body');
      if(bodyEl){
        fillEditionUnits(bodyEl, ocrInfo.file, edMeta, ocrZeForChapter, mode);
      }
    }
  }

  // 按单元号填充版本正文（支持多则，如嘉靖每回2则）
  async function fillEditionUnits(bodyEl, fileName, meta, unitNs, mode){
    try{
      const units = await getEditionUnits(fileName, meta);
      const picked = unitNs.map(n => units.find(u => u.n === n)).filter(Boolean);
      if(!picked.length){
        bodyEl.innerHTML = `<div class="text-sm text-[#a33]">该版本无对应单元正文（第 ${unitNs.join('、')} 单元未找到，可能为残本缺卷）。</div>`;
        return;
      }
      const parts = picked.map(ze => {
        const raw = (ze.paras || []).map(p => `<p>${esc(mode === 'simplified' ? simpleT2S(p) : p)}</p>`).join('');
        const head = `<div class="text-sm text-[#8b6914] mb-2">${esc(ze.volume ? ze.volume + ' · ' : '')}${esc(ze.title)}${meta && meta.ocr ? '（OCR · 未校勘 · 仅作浏览）' : ''}</div>`;
        return head + raw;
      });
      bodyEl.innerHTML = parts.join('<div class="border-t border-[#c9b896] my-3"></div>');
      // 批注：正文内联【】高亮（评点本）；parts 用 <p> 直接渲染，选择器为 bodyEl 内 p
      if(meta && meta.hasAnno && typeof UNITSplit !== 'undefined'){
        bodyEl.querySelectorAll('p').forEach(p => {
          const t = p.textContent;
          if(/【/.test(t)){
            p.innerHTML = UNITSplit.fmtAnnoHtml(esc(p.textContent));
          }
        });
      }
    }catch(e){
      bodyEl.innerHTML = `<div class="text-sm text-[#a33]">载入失败：${esc(e && e.message ? e.message : e)}</div>`;
    }
  }

  // 批注显隐：单一真相源 = readerState.annot 四家标志；总开关为全选/全清便利开关
  function applyAnnotVisibility(){
    document.querySelectorAll('[data-annot-critic]').forEach(node => {
      const cid = node.getAttribute('data-annot-critic');
      node.hidden = !readerState.annot[cid];
    });
  }

  // 白话导读（编者所撰 · 非原文）：逐字取材于站内元数据的既有字段（含 desc/outcome/note 等成文描述），
  // 仅做分组、排序与繁→简转换，不新增史实细节、不改写事实。
  function renderVernacularGuide(chapterNum){
    const st = s => esc(simpleT2S(s == null ? '' : String(s)));
    const meta = (data.chapters || []).find(c => c.id === chapterNum) || {};
    const title = meta.title || (typeof CHAPTER_TEXT !== 'undefined' && CHAPTER_TEXT[chapterNum] ? CHAPTER_TEXT[chapterNum].title : '');
    const evNames = meta.events || [];
    const virtuals = meta.isVirtual || [];

    const personById = {}; (data.persons || []).forEach(p => { personById[p.name] = p; });
    const placeById = {};  (data.places || []).forEach(p => { placeById[p.id] = p; placeById[p.name] = p; });
    const evList0 = (TOP.events || []).filter(e => e.chapter === chapterNum);
    // 战役记录不挂 chapter 字段：以「本章事件名 / 本章地名」与战役名、战役地名做归一化交集匹配
    const nv = s => normName(s || '');
    const chEvNames = (meta.events || []).map(nv);
    const chPlaces = (meta.keyPlaces || []).concat(evList0.map(e => e.place)).map(nv).filter(Boolean);
    const battles = (data.battles || []).filter(b => {
      const bn = nv(b.name);
      const bPlaces = (b.placeIds || []).map(id => { const p = (data.places||[]).find(x => x.id === id); return p ? p.name : ''; }).map(nv);
      return chEvNames.indexOf(bn) >= 0 || bPlaces.some(x => x && chPlaces.indexOf(x) >= 0);
    });
    const evList = evList0;
    const sgList = (TOP.stratagems || []).filter(s => s.chapter === chapterNum);
    const arList = (TOP.artifacts || []).filter(a => a.chapter === chapterNum);
    const pmList = (TOP.poems || []).filter(p => p.chapter === chapterNum || (chapterNum === 1 && p.chapter === 0));
    const prList = (TOP.prophecies || []).filter(p => p.chapter === chapterNum);

    // 本回涉及人物：优先 keyPersons，其次事件 persons；补入人物表已注册的简介
    const nameSet = [];
    [meta.keyPersons || [], [].concat(...evList.map(e => e.persons || []))].flat().forEach(n => {
      if(n && nameSet.indexOf(n) < 0) nameSet.push(n);
    });
    const personCards = nameSet.map(n => {
      const p = personById[n] || personById[simpleT2S(n)] || {};
      const bits = [];
      if(p.style) bits.push('字' + p.style);
      if(p.faction) bits.push(p.faction);
      if(p.birth || p.death) bits.push((p.birth||'?') + '–' + (p.death||'?'));
      if(p.title) bits.push('称' + p.title);
      if(p.nativePlace) bits.push(p.nativePlace);
      if(p.mentionCount) bits.push('全书提及 ' + p.mentionCount + ' 次');
      return `<li><b>${st(n)}</b>${bits.length ? '（' + st(bits.join(' · ')) + '）' : ''}</li>`;
    }).join('');

    // 地理：回目 keyPlaces + 事件 place + 战役 placeIds
    const placeSet = [];
    [meta.keyPlaces || [], evList.map(e => e.place)].flat().forEach(n => {
      if(n && placeSet.indexOf(n) < 0) placeSet.push(n);
    });
    battles.forEach(b => (b.placeIds || []).forEach(id => {
      const p = placeById[id]; if(p && placeSet.indexOf(p.name) < 0) placeSet.push(p.name);
    }));
    const placeCards = placeSet.map(n => {
      const p = placeById[n] || placeById[simpleT2S(n)] || {};
      const bits = [];
      if(p.level) bits.push(p.level);
      if(p.modernLocation) bits.push('今' + p.modernLocation);
      return `<li><b>${st(n)}</b>${bits.length ? '（' + st(bits.join(' · ')) + '）' : ''}</li>`;
    }).join('');

    const evCards = evList.map(e => `
      <li class="mb-2">
        <b>${st(e.name)}</b>
        <span class="text-xs text-[#4a6741]">（${e.year === 0 || !e.year ? '年代不详' : e.year + ' 年'}${e.place ? ' · ' + st(e.place) : ''}${e.type ? ' · ' + st(e.type) : ''}${e.virtual ? ' · 小说虚构' : ''}）</span>
        ${e.desc ? `<div class="mt-1">${st(e.desc)}</div>` : ''}
      </li>`).join('');

    const sgCards = sgList.map(s => `
      <li class="mb-2">
        <b>${st(s.name)}</b>
        <span class="text-xs text-[#4a6741]">（献计：${st(s.user)}；针对：${st(s.target)}${s.type ? '；类型：' + st(s.type) : ''}）</span>
        ${s.desc ? `<div class="mt-1">${st(s.desc)}</div>` : ''}
        ${s.outcome ? `<div class="mt-1"><b class="text-[#006400]">结果：</b>${st(s.outcome)}</div>` : ''}
      </li>`).join('');

    const arCards = arList.map(a => `
      <li class="mb-1"><b>${st(a.name)}</b>
        <span class="text-xs text-[#4a6741]">（${st(a.type)}${a.owner ? ' · 主：' + st(a.owner) : ''}${a.virtual ? ' · 小说虚构' : ''}）</span>
        ${a.desc ? `<span class="text-sm"> ${st(a.desc)}</span>` : ''}</li>`).join('');

    const pmCards = pmList.map(p => `
      <li class="mb-2">
        <div><b>${st(p.title)}</b><span class="text-xs text-[#4a6741]">（${st(p.author)}${p.type ? ' · ' + st(p.type) : ''}${p.chapter === 0 ? ' · 卷首词' : ''}）</span></div>
        <div class="mt-1 pl-3 border-l-2 border-[#8fbc8f] whitespace-pre-wrap">${st(p.content)}</div>
        ${p.note ? `<div class="mt-1 text-xs text-[#4a6741]">${st(p.note)}</div>` : ''}
      </li>`).join('');

    const prCards = prList.map(p => `
      <li class="mb-2">
        <div class="font-bold">「${st(p.content)}」</div>
        <div class="text-sm mt-1">${p.prophet ? '预言者：<b>' + st(p.prophet) + '</b>。' : ''}${p.fulfilled ? '应验：' + st(p.fulfilled) : ''}${p.note ? '<span class="text-xs text-[#4a6741]"> 按：' + st(p.note) + '</span>' : ''}</div>
      </li>`).join('');

    const btCards = battles.map(b => {
      const names = (b.keyPersonIds || []).map(id => {
        const p = (data.persons || []).find(x => x.id === id); return p ? p.name : '';
      }).filter(Boolean);
      const pname = (b.placeIds || []).map(id => { const p = placeById[id]; return p ? p.name : ''; }).filter(Boolean).join('、');
      return `<li class="mb-2"><b>${st(b.name)}</b><span class="text-xs text-[#4a6741]">（${b.year || '年代不详'}${pname ? ' · ' + st(pname) : ''}${names.length ? ' · ' + st(names.join('、')) : ''}）</span>
        ${b.result ? `<div class="mt-1"><b class="text-[#006400]">结局：</b>${st(b.result)}</div>` : ''}</li>`;
    }).join('');

    const sec = (h, body) => `
      <div class="guide-sec mt-3">
        <div class="font-bold text-[#006400] border-b border-[#d8e8d8] pb-1 mb-2">${h}</div>
        ${body}
      </div>`;

    const covered = !!(evCards || sgCards || arCards || pmCards || prCards || btCards);
    return `
      <div class="vernacular-guide p-3 bg-[#f0f4ea] rounded border border-[#8fbc8f]">
        <div class="guide-banner text-sm mb-3 pb-2 border-b border-[#8fbc8f]">
          <strong class="text-[#006400]">编者所撰 · 非原文</strong>
          <div class="mt-1">本层为<strong>编者导读层</strong>，是编者自撰的本回导读，非毛宗岗本原文、亦非原文翻译。</div>
          <div class="text-xs text-[#4a6741] mt-1">所据材料：站内 <code>data/sanguo-data.js</code>（chapters、persons、places、battles）与 <code>data/sanguo-topics.js</code>（events、stratagems、artifacts、poems、prophecies）中 <b>已录入</b>的字段，逐字转录、仅繁转简，不引原文、不新增史实。</div>
        </div>
        <h3 class="font-bold mb-2">第${chapterNum}回 导读（编者所撰）</h3>
        <p class="mb-1">本回回目作《${st(title)}》。</p>
        ${evNames.length ? `<p class="mb-0">回目点出关目：${st(evNames.join('、'))}。</p>` : ''}
        ${covered ? '' : `
        <div class="text-sm mt-2 p-2 bg-[#fdf3e7] rounded border-l-4 border-[#d8a24a]">
          <b class="text-[#8b4513]">元数据覆盖说明：</b>站内结构化元数据尚未覆盖本回的事件 / 计谋 / 器物 / 诗词 / 谶语条目，故本回导读仅含回目与出场人物、地理、虚实注记。阅读内容请以下方原文为准。
        </div>`}
        ${btCards ? sec('本回战役', `<ul class="list-disc ml-5">${btCards}</ul>`) : ''}
        ${evCards ? sec('本回事件', `<ul class="list-disc ml-5">${evCards}</ul>`) : ''}
        ${sgCards ? sec('本回计谋', `<ul class="list-disc ml-5">${sgCards}</ul>`) : ''}
        ${personCards ? sec('出场要角', `<ul class="list-disc ml-5 text-sm">${personCards}</ul>`) : ''}
        ${placeCards ? sec('地理所涉', `<ul class="list-disc ml-5 text-sm">${placeCards}</ul>`) : ''}
        ${arCards ? sec('器物', `<ul class="list-disc ml-5 text-sm">${arCards}</ul>`) : ''}
        ${pmCards ? sec('诗词', `<ul class="list-disc ml-5 text-sm">${pmCards}</ul>`) : ''}
        ${prCards ? sec('谶纬童谣', `<ul class="list-disc ml-5 text-sm">${prCards}</ul>`) : ''}
        ${virtuals.length ? `
        <div class="guide-virtual text-sm mt-3 p-2 bg-[#fdf3e7] rounded border-l-4 border-[#d8a24a]">
          <strong class="text-[#8b4513]">虚实提示（据站内注记）：</strong>
          <ul class="list-disc ml-5 mt-1">${virtuals.map(v => `<li>${st(v)}</li>`).join('')}</ul>
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

  /* ======================== 多版本对照（Task 8 · AC） ========================
     同回并排对照最多 4 个版本：回次选择 + 版本多选（checkbox≤4） + 繁/简切换 +
     CSS grid 并排。每列按 VERSION_ONTOLOGY 切分并映射到毛本回。 */
  const COMPARE_DEFAULT_IDS = ['mao','jiajing-ws','huiping','huang'];
  let compareState = { ids: COMPARE_DEFAULT_IDS.slice(), lang: 'traditional' };
  function renderMultiCompare(el){
    const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
    const vrows = buildVersionRows().filter(r => TEXT_STATUS_READABLE.includes(r.status));
    // 可对照版本 = 有 VERSION_ONTOLOGY 配置（毛本走 CHAPTER_TEXT）
    const selectable = vrows.filter(r => r.id === 'mao' || (VONT && VONT.editions && VONT.editions[r.id]));
    el.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">多版本对照</h1>
      <p class="mb-4 text-sm text-[#8b6914]">同回并排对照最多 4 个版本；映射以毛本 120 回为枢纽，嘉靖系每回 2 则、志传系按则目近似对应。可切换繁/简。</p>
      <div class="ancient-border p-4 rounded mb-4">
        <div class="flex flex-wrap gap-3 items-center mb-3">
          <label class="text-sm font-bold">回次：<input id="mc-unit" type="number" min="1" max="120" value="${currentChapter||1}" style="width:70px;border:1px solid #c9b896;border-radius:4px;padding:3px 8px"></label>
          <button class="btn btn-sm" onclick="appMcRun()">对照</button>
          <div class="flex gap-2 items-center text-sm">
            <span class="font-bold">语体：</span>
            <button class="btn btn-sm ${compareState.lang==='traditional'?'active':''}" onclick="appMcLang('traditional')">繁体</button>
            <button class="btn btn-sm ${compareState.lang==='simplified'?'active':''}" onclick="appMcLang('simplified')">简体</button>
          </div>
        </div>
        <div class="text-sm mb-1 font-bold text-[#8b0000]">选择版本（最多 4 个）：</div>
        <div class="flex flex-wrap gap-2 text-sm" id="mc-picks">
          ${selectable.map(r=>`
            <label class="flex items-center gap-1 mc-pick-label" data-id="${esc(r.id)}">
              <input type="checkbox" class="mc-pick" value="${esc(r.id)}" ${compareState.ids.includes(r.id)?'checked':''} ${compareState.ids.length>=4 && !compareState.ids.includes(r.id)?'disabled':''}>
              ${esc(r.title)}
            </label>`).join('')}
        </div>
      </div>
      <div id="mc-result"><div class="empty-state">请选择版本与回次后点击「对照」。</div></div>
    </div>`;
    // 版本勾选事件（受 ≤4 约束）
    el.querySelectorAll('.mc-pick').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(el.querySelectorAll('.mc-pick:checked')).map(x => x.value);
        if(cb.checked && checked.length > 4){
          cb.checked = false;
          alert('最多同时对照 4 个版本。');
        }
        // 未勾选时重新启用所有被禁用的（只要未达上限）
        const cur = Array.from(el.querySelectorAll('.mc-pick:checked')).map(x => x.value);
        compareState.ids = cur;
        el.querySelectorAll('.mc-pick').forEach(x => x.disabled = cur.length >= 4 && !x.checked);
        if(global.appMcRun) global.appMcRun();
      });
    });
    setTimeout(()=>{ if(global.appMcRun) global.appMcRun(); }, 0);
  }
  global.appMcLang = function(m){
    if(m === 'traditional' || m === 'simplified'){
      compareState.lang = m;
      // 只更新按钮态并重跑，不重建视图（保留回次输入）
      const btns = document.querySelectorAll('button[onclick^="appMcLang"]');
      btns.forEach(b => b.classList.toggle('active', (b.getAttribute('onclick')||'').indexOf("'"+m+"'") >= 0));
      if(global.appMcRun) global.appMcRun();
    }
  };
  global.appMcRun = async function(){
    const result = document.getElementById('mc-result');
    if(!result) return;
    const unitEl = document.getElementById('mc-unit');
    let unit = parseInt(unitEl ? unitEl.value : '1', 10);
    if(!unit || unit < 1 || unit > 120){ unit = Math.max(1, Math.min(120, currentChapter || 1)); if(unitEl) unitEl.value = unit; }
    const checked = Array.from(document.querySelectorAll('.mc-pick:checked')).map(x => x.value);
    if(!checked.length){ result.innerHTML = '<div class="empty-state">请至少勾选 1 个版本。</div>'; return; }
    result.innerHTML = '<div class="text-sm text-[#8b6914]">正在载入对照文本……</div>';
    const VONT = (typeof VERSION_ONTOLOGY !== 'undefined' && VERSION_ONTOLOGY) ? VERSION_ONTOLOGY : null;
    const CH_TXT = (typeof CHAPTER_TEXT !== 'undefined') ? CHAPTER_TEXT : null;
    const cols = [];
    for(const id of checked){
      let title = '';
      const vrow = buildVersionRows().find(v => v.id === id);
      title = vrow ? vrow.title : id;
      const meta = (VONT && VONT.editions) ? VONT.editions[id] : null;
      cols.push({ id, title, meta });
    }
    const results = await Promise.all(cols.map(async col => {
      let paras = [];
      let unitLabel = '';
      if(col.id === 'mao'){
        const t = (CH_TXT && CH_TXT[unit]) ? CH_TXT[unit] : null;
        paras = t ? t.text.split(/\n+/).map(s => s.trim()).filter(Boolean) : [];
        unitLabel = '第' + unit + '回 ' + ((CH_TXT && CH_TXT[unit] && CH_TXT[unit].title) || '');
      } else if(col.meta){
        const units = await getEditionUnits(col.meta.file, col.meta);
        const ns = computeUnitNsForChapter(col.meta, unit);
        const picked = (ns||[]).map(n => units.find(u => u.n === n)).filter(Boolean);
        paras = picked.reduce((acc, z) => acc.concat(z.paras || []), []);
        unitLabel = picked.map(z => (z.volume ? z.volume + ' · ' : '') + z.title).join('；') || (ns ? '第' + ns.join('、') + '单元' : '');
      }
      const lang = compareState.lang;
      return { ...col, paras: paras.map(p => lang === 'simplified' ? simpleT2S(p) : p), unitLabel };
    }));
    result.innerHTML = `
      <div class="mc-grid">
        ${results.map(c => `
          <div class="mc-col ancient-border">
            <div class="mc-head"><strong>${esc(c.title)}</strong><div class="text-xs text-[#8b6914]">${esc(c.unitLabel)}</div></div>
            <div class="mc-text">${c.paras.length ? c.paras.map(p => `<p>${esc(p)}</p>`).join('') : '<div class="text-sm text-[#a33]">该版本无此回对应单元（可能为残本缺卷）。</div>'}</div>
          </div>`).join('')}
      </div>
      <style>
        .mc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
        .mc-col{border:1px solid #c9b896;border-radius:6px;overflow:hidden;background:#fffdf8}
        .mc-head{background:#f5ecd8;font-weight:bold;color:#8b0000;padding:6px 10px;font-size:13px;border-bottom:1px solid #c9b896}
        .mc-text{padding:10px;max-height:600px;overflow:auto;font-size:14px;line-height:1.9}
        .mc-text p{margin:0 0 8px;text-indent:2em}
        @media(max-width:800px){.mc-grid{grid-template-columns:1fr}}
      </style>`;
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
      .filter(r => TEXT_STATUS_READABLE.includes(r.status))
      .map(r => '<option value="' + esc(r.id) + '"' + (r.id === sel ? ' selected' : '') + '>'
        + esc(versionLabel(r)) + '</option>')
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
      if(rows[selA.value] && rows[selA.value].status === 'ocrReadable')
        warn.push('甲本「' + esc(rows[selA.value].title) + '」为 OCR 可读文本：逐行录入、未经校勘，未达 97% 验收线，不作对勘底本，仅作参照。');
      if(rows[selB.value] && rows[selB.value].status === 'ocrReadable')
        warn.push('乙本「' + esc(rows[selB.value].title) + '」为 OCR 可读文本：逐行录入、未经校勘，未达 97% 验收线，不作对勘底本，仅作参照。');

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

  // echarts 尺寸守卫：容器宽高为 0 时 echarts.init 会内部崩溃（graph series dataIndex 未定义）。
  // 用 requestAnimationFrame 等待布局稳定并检查 clientWidth/Height>0，0 尺寸时重试，最多约 12 帧。
  function initEchartsContainer(domId, cb){
    if(typeof echarts === 'undefined') return;
    let tries = 0;
    function attempt(){
      const dom = document.getElementById(domId);
      if(!dom) return;
      if(dom.clientWidth > 0 && dom.clientHeight > 0){
        try{
          const chart = echarts.init(dom);
          cb(chart);
        }catch(e){
          if(++tries < 12) requestAnimationFrame(attempt);
        }
        return;
      }
      if(++tries < 12) requestAnimationFrame(attempt);
    }
    requestAnimationFrame(attempt);
  }

  function renderRelationGraph(el){
    el.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold ink-title pb-2 mb-2">人物关系网</h1>
      <p class="text-sm text-[#8b6914] mb-2">共 ${(data.persons||[]).length} 人、${relations.length} 条关系。蓝色蜀汉、红色曹魏、绿色东吴、灰色群雄；可拖动、缩放。</p>
      <div id="graph-container" class="ancient-border rounded w-full" style="height: 72vh"></div>
    </div>`;
    initEchartsContainer('graph-container', (chart) => {
      const persons = data.persons||[];
      // 节点带唯一 id（person.id），边 source/target 直接用该 id：
      // 避免重名（如法正/严颜各有两条记录）导致 echarts graph 按 name 解析边端点时
      // dataIndex 映射被破坏而抛「Cannot set properties of undefined (setting 'dataIndex')」。
      const colorMap = {"蜀汉":"#2563eb","曹魏":"#dc2626","东吴":"#16a34a","群雄":"#6b7280","汉室":"#9333ea","黄巾":"#ca8a04"};
      const catNames = Object.keys(colorMap);
      const nodes = persons.map(p=>{ const c=(p.faction||'').split('→')[0]; return {id:p.id, name:p.name, symbolSize: Math.min(34, (p.mentionCount||0)/60 + 10), itemStyle:{color:colorMap[c]||'#6b7280'}, category: Math.max(0, catNames.indexOf(c))}; });
      const idName = {};
      persons.forEach(p => idName[p.id] = p.name);
      const links = relations.filter(r=>persons.some(p=>p.id===r.subject) && persons.some(p=>p.id===r.object)).map(r=>({source:r.subject, target:r.object, value:r.predicate, label:{show:false}}));
      chart.setOption({
        tooltip:{formatter:p=>p.dataType==='edge'?((idName[p.data.source]||p.data.source)+' — '+p.data.value+' → '+(idName[p.data.target]||p.data.target)):(p.name+'（'+(catNames[p.category]||'')+'）')},
        series:[{type:'graph', layout:'force', roam:true, data:nodes, links:links, categories:catNames.map(n=>({name:n})), force:{repulsion:220, edgeLength:[50,160]}, label:{show:true, position:'right', fontSize:11}, lineStyle:{opacity:0.45}}]
      });
      chart.resize();
      window.addEventListener('resize',()=>chart.resize());
    });
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

  /* ======== T1 义理五维（DoctrineConcept × 12） ======== */
  function renderTopicDoctrines(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const doctrines = topics.doctrines || [];
    if(!doctrines.length){ el.innerHTML = '<p class="p3 text-gray-500">义理数据未加载。</p>'; return; }
    const events = topics.events || [];
    const comments = TOP.commentsExtra || [];
    const prophecies = topics.prophecies || [];
    const eventsByCh = {}; events.forEach(e=>{ (eventsByCh[e.chapter]=eventsByCh[e.chapter]||[]).push(e); });
    const commentsByCh = {}; comments.forEach(c=>{ (commentsByCh[c.chapter]=commentsByCh[c.chapter]||[]).push(c); });

    const outer = doctrines.filter(d=>d.ring==='outer');
    const inner = doctrines.filter(d=>d.ring==='inner');

    // SVG 五瓣放射图（手写，不引新库）
    const W=360, H=360, CX=W/2, CY=H/2;
    const R_OUT=155, R_IN=85;
    function polar(cx,cy,r,deg){ const a=(deg-90)*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; }
    function sector(cx,cy,r1,r2,deg1,deg2){
      const [x1,y1]=polar(cx,cy,r2,deg1), [x2,y2]=polar(cx,cy,r2,deg2), [x3,y3]=polar(cx,cy,r1,deg2), [x4,y4]=polar(cx,cy,r1,deg1);
      const large = (deg2-deg1>180)?1:0;
      return `M ${x4.toFixed(1)} ${y4.toFixed(1)} A ${r1} ${r1} 0 ${large} 1 ${x3.toFixed(1)} ${y3.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${r2} ${r2} 0 ${large} 0 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
    }
    // 5 outer 扇形（72° 等分）
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="360" height="360" class="mx-auto">`;
    outer.forEach((d,i)=>{
      const d1=i*72-36, d2=(i+1)*72-36;
      svg += `<path data-id="${d.id}" d="${sector(CX,CY,R_IN,R_OUT,d1,d2)}" fill="${d.color}" fill-opacity="0.75" stroke="#fff" stroke-width="2" class="doctrine-sector cursor-pointer hover:opacity-100 transition-opacity"/>`;
      const [tx,ty]=polar(CX,CY,(R_IN+R_OUT)/2, (d1+d2)/2);
      svg += `<text data-id="${d.id}" x="${tx.toFixed(0)}" y="${ty.toFixed(0)}" font-size="14" font-weight="600" fill="#fff" text-anchor="middle" dominant-baseline="middle" class="doctrine-label pointer-events-none select-none">${d.label}</text>`;
    });
    // 7 inner 小圆（散布）
    inner.forEach((d,i)=>{
      const deg=360/inner.length*i-90;
      const [x,y]=polar(CX,CY,R_IN*0.62, deg);
      svg += `<circle data-id="${d.id}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="22" fill="${d.color}" fill-opacity="0.8" stroke="#fff" stroke-width="1.5" class="doctrine-sector cursor-pointer hover:opacity-100 transition-opacity"/>`;
      svg += `<text data-id="${d.id}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="11" font-weight="500" fill="#fff" text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">${d.label}</text>`;
    });
    // 中心圆
    svg += `<circle cx="${CX}" cy="${CY}" r="50" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>`;
    svg += `<text x="${CX}" y="${CY-4}" font-size="14" font-weight="700" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">义理</text>`;
    svg += `<text x="${CX}" y="${CY+14}" font-size="10" fill="#64748b" text-anchor="middle">DoctrineConcept · 12</text>`;
    svg += `</svg>`;

    // 默认选中第一个 outer
    const initial = outer[0] || doctrines[0];

    el.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 items-start">
        <div class="flex-1 min-w-0">
          <h3 class="sub-h mb-2">義理五維 · DoctrineConcept</h3>
          <p class="text-sm text-gray-600 mb-4">
            天命、正統、忠義、智謀、勇烈——全書最深層的歷史觀、道德觀、審美觀皆從此五維輻射。
            外圈五瓣為核心義理，內圈七點為輔助維度。點擊圖形可讀該義理的落點事件、評點引述與相關讖緯。
          </p>
          <div class="doctrines-svg-wrap">${svg}</div>
          <div class="flex flex-wrap gap-2 mt-4 px-2">
            ${doctrines.map(d=>`<button data-btn="${d.id}" class="doctrine-btn px-3 py-1 rounded-full text-xs border border-gray-300 hover:border-gray-500 transition-colors" style="--dot:${d.color}">${d.label}</button>`).join('')}
          </div>
        </div>
        <div class="w-full md:w-[420px] shrink-0">
          <div id="doctrine-detail" class="border border-gray-200 rounded-lg p-5 bg-white shadow-sm min-h-[480px]">
            <!-- 动态填充 -->
          </div>
        </div>
      </div>
    `;

    function renderDetail(d){
      const $ = sel => document.querySelector(sel);
      const box = el.querySelector('#doctrine-detail');
      const evs = (d.events||[]).map(n => eventsByCh[n]).filter(Boolean).flat();
      const cmts = (d.comments||[]).map(n => commentsByCh[n]).filter(Boolean).flat();
      const prs = (d.prophecies||[]).map(c => prophecies.find(p => p.content.includes(c) || (c && p.content && c.length>0 && p.content.indexOf(c)>=0))).filter(Boolean);
      box.innerHTML = `
        <div class="flex items-center gap-3 mb-3">
          <span class="inline-block w-3 h-3 rounded-full" style="background:${d.color}"></span>
          <h4 class="text-xl font-bold">${d.label}</h4>
          <span class="text-sm text-gray-500">${d.ring==='outer'?'主軸':'輔助'}</span>
        </div>
        <p class="text-sm italic text-gray-600 mb-3">「${d.tagline}」</p>
        <p class="text-sm leading-relaxed mb-5 text-gray-700">${d.desc}</p>

        <div class="mb-4">
          <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">落點事件（${evs.length}）</h5>
          ${evs.length?`<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-2">${evs.map(e=>`<a href="read.html?edition=mao&unit=${e.chapter}" class="event-item flex items-center gap-2 text-sm hover:bg-gray-50 rounded px-2 py-1">
            <span class="text-xs bg-gray-200 text-gray-700 rounded px-1.5 py-0.5 font-mono">第${e.chapter}回</span>
            <span class="font-medium">${e.name||e.plot}</span>
            <span class="text-xs text-gray-400 ml-auto">${e.type||''}${e.virtual?' · 虛構':''}</span>
          </a>`).join('')}</div>`:'<p class="text-sm text-gray-400">暂无落点事件</p>'}
        </div>

        <div class="mb-4">
          <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">評點引述（${cmts.length}）</h5>
          ${cmts.length?`<div class="space-y-2">${cmts.map(c=>`<div class="comment-quote border-l-4 pl-3 py-1" style="border-color:${d.color}">
            <p class="text-sm leading-relaxed text-gray-700">"${c.text}"</p>
            <p class="text-xs text-gray-500 mt-1">—— ${c.commenter}（第${c.chapter}回）</p>
          </div>`).join('')}</div>`:'<p class="text-sm text-gray-400">暂无相关评点</p>'}
        </div>

        ${prs.length?`<div>
          <h5 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">相關讖緯（${prs.length}）</h5>
          <div class="space-y-1">${prs.map(p=>`<p class="text-sm italic text-gray-600">"${p.content}"</p>`).join('')}</div>
        </div>`:''}
      `;
    }

    // 事件绑定
    el.querySelectorAll('.doctrine-sector, .doctrine-label').forEach(n=>{
      n.addEventListener('click', e=>{ const id=e.currentTarget.dataset.id; const d=doctrines.find(x=>x.id===id); if(d){ renderDetail(d); highlight(id); } });
    });
    el.querySelectorAll('.doctrine-btn').forEach(n=>{
      n.addEventListener('click', e=>{ const id=e.currentTarget.dataset.btn; const d=doctrines.find(x=>x.id===id); if(d){ renderDetail(d); highlight(id); } });
    });
    function highlight(id){
      el.querySelectorAll('.doctrine-btn').forEach(b=>{ b.classList.toggle('ring-2', b.dataset.btn===id); b.classList.toggle('ring-offset-1', b.dataset.btn===id); });
    }
    // 默认选中
    renderDetail(initial);
    highlight(initial.id);
  }

  /* ======== T2 36 战役时空（Battles Timeline） ======== */
  function renderTopicBattles(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const events = topics.events || [];
    const factions = topics.factions || [];
    // 识别战役：events 里 type ∈ {决战, 攻城, 戰鬥, 水戰, 圍殲}
    const battleTypes = new Set(['決戰','攻城','戰鬥','水戰','圍殲','伏击','突袭','火攻']);
    const battles = events.filter(e=> battleTypes.has(e.type) || (e.place && /關|城|戰|陣|寨/.test(e.place)));

    // 年度聚合
    const byYear = {};
    battles.forEach(b=>{ const y=b.year||0; if(y<150||y>300) return; (byYear[y]=byYear[y]||[]).push(b); });
    const years = Object.keys(byYear).sort((a,b)=>a-b);

    // 势力颜色映射（取参战人物匹配 factions.members）
    const factionColorMap = {};
    factions.forEach(f=>{ f.members.forEach(m=>factionColorMap[m]=f.color); });
    function battleColor(b){
      const pers = (b.persons||[]).map(p=>factionColorMap[p]).filter(Boolean);
      if(pers.length===0) return '#999';
      // 取首个颜色
      return pers[0];
    }

    el.innerHTML = `
      <h3 class="sub-h mb-2">三十六役 · 時間地理</h3>
      <p class="text-sm text-gray-600 mb-4">
        從黃巾起義（184）到三分歸晉（280），百年之間主要戰役的年度分布。
        柱圖按參戰主力勢力著色（魏=紅、蜀=綠、吳=藍、董/袁/呂=灰褐）。
        點擊柱體可跳轉閱讀器對應回目。
      </p>
      <div class="flex flex-wrap gap-2 mb-4 text-xs">
        ${factions.slice(0,8).map(f=>`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full"><span class="w-2 h-2 rounded-full" style="background:${f.color}"></span>${f.name}</span>`).join('')}
      </div>
      <div id="battles-chart" style="height:360px"></div>
      <div class="mt-4">
        <h4 class="text-sm font-bold mb-2">全部戰役列表</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-2">
          ${battles.sort((a,b)=>(a.year||0)-(b.year||0)).map(b=>`
            <a href="read.html?edition=mao&unit=${b.chapter}" class="battle-item flex items-center gap-2 text-sm hover:bg-gray-50 rounded px-2 py-1.5 border border-gray-100">
              <span class="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded w-10 text-center">${b.year||'?'}</span>
              <span class="w-3 h-3 rounded-full shrink-0" style="background:${battleColor(b)}"></span>
              <span class="font-medium">${b.name}</span>
              <span class="text-xs text-gray-400 ml-auto">${b.place||''}</span>
              <span class="text-xs bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">第${b.chapter}回</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    // ECharts 柱图（年度聚合，按势力色分段太复杂，简化为单柱 + tooltip 详情）
    const yearData = years.map(y=> byYear[y].length);
    const battleColorByYear = years.map(y=>{
      const arr = byYear[y];
      const first = arr[0];
      return battleColor(first);
    });
    setTimeout(()=>{
      const el2 = document.getElementById('battles-chart');
      if(!el2) return;
      const chart = echarts.init(el2);
      chart.setOption({
        title:{ text:'主要戰役年度分布（184–280）', left:'center', textStyle:{fontSize:14, fontWeight:'normal', color:'#475569'} },
        tooltip:{ trigger:'axis', axisPointer:{type:'shadow'}, formatter: p=>{
          const y = p[0].name;
          const arr = byYear[y];
          return `<b>${y} 年（${arr.length} 役）</b><br/>`+arr.map(b=>`${b.name} · 第${b.chapter}回`).join('<br/>');
        } },
        grid:{ left:60, right:30, top:50, bottom:40 },
        xAxis:{ type:'category', data: years, name:'年', nameLocation:'end', nameGap:10 },
        yAxis:{ type:'value', name:'役數' },
        series:[{
          type:'bar',
          data: years.map((y,i)=>({ value: byYear[y].length, itemStyle:{ color: battleColorByYear[i] } })),
          barMaxWidth:28
        }]
      });
      chart.on('click', params=>{
        const y = params.name;
        const arr = byYear[y];
        if(arr && arr[0]){ window.open('read.html?edition=mao&unit='+arr[0].chapter, '_blank'); }
      });
      window.addEventListener('resize', ()=>chart.resize());
    }, 120);
  }

  /* ======== T3 谶纬应验链（Prophecy Chain） ======== */
  function renderTopicProphecies(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const prophecies = topics.prophecies || [];

    function classify(p){
      const pr = (p.prophet||'').toString();
      if(/童謠|童谣/.test(pr)) return { cat:'童謠', cls:'bg-amber-50 border-amber-300', dot:'#d97706' };
      if(/夢|梦/.test(pr)) return { cat:'夢兆', cls:'bg-indigo-50 border-indigo-300', dot:'#4f46e5' };
      if(/讖|谶|緯/.test(pr)) return { cat:'讖語', cls:'bg-purple-50 border-purple-300', dot:'#7c3aed' };
      if(/詩|卷首語|卷首/.test(pr)) return { cat:'詩語', cls:'bg-emerald-50 border-emerald-300', dot:'#059669' };
      if(/卷首語/.test(pr)) return { cat:'詩語', cls:'bg-emerald-50 border-emerald-300', dot:'#059669' };
      return { cat:'人物語', cls:'bg-gray-50 border-gray-300', dot:'#6b7280' };
    }

    el.innerHTML = `
      <h3 class="sub-h mb-2">讖緯應驗鏈 · Prophecy Chain</h3>
      <p class="text-sm text-gray-600 mb-4">
        《三國》開篇即以「歲在甲子」為口號，預示漢室衰微；其後童謠、夢兆、讖語層出不窮。
        毛宗崗評點尤重「應驗」——每條讖緯皆有對應事件或人物結局，形成一條條命運鏈。
        點擊卡片可跳轉閱讀器對應回目。
      </p>
      <div class="flex gap-3 text-xs mb-4">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-full"><span class="w-2 h-2 rounded-full bg-amber-600"></span>童謠</span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-300 rounded-full"><span class="w-2 h-2 rounded-full bg-indigo-600"></span>夢兆</span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-300 rounded-full"><span class="w-2 h-2 rounded-full bg-purple-600"></span>讖語</span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 rounded-full"><span class="w-2 h-2 rounded-full bg-emerald-600"></span>詩語</span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-300 rounded-full"><span class="w-2 h-2 rounded-full bg-gray-600"></span>人物語</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${prophecies.map(p=>{
          const cl = classify(p);
          const ch = p.chapter||0;
          return `<a href="${ch>0?('read.html?edition=mao&unit='+ch):'#'}" class="prophecy-card block border rounded-lg p-4 ${cl.cls} hover:shadow-md transition-shadow">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full" style="background:${cl.dot}"></span>
              <span class="text-xs font-bold uppercase tracking-wide" style="color:${cl.dot}">${cl.cat}</span>
              <span class="ml-auto text-xs text-gray-500">${ch>0?('第'+ch+'回'):'—'}</span>
            </div>
            <p class="text-base font-medium italic leading-snug mb-2">"${p.content}"</p>
            <p class="text-xs text-gray-500 mb-2">—— ${p.prophet}</p>
            <div class="border-t border-gray-200/50 pt-2 mt-2">
              <p class="text-xs text-gray-700"><b>應驗：</b>${p.fulfilled||'（未明言）'}</p>
              ${p.note?`<p class="text-xs text-gray-500 mt-1">${p.note}</p>`:''}
            </div>
          </a>`;
        }).join('')}
      </div>
    `;
  }

  /* ======== T4 势力网络 Faction Network（ECharts 力导向图） ======== */
  function renderTopicFactions(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const factions = topics.factions || [];
    const relations = topics.factionRelations || [];
    if(!factions.length){ el.innerHTML = '<p class="p3 text-gray-500">势力数据未加载。</p>'; return; }

    // ECharts force graph：势力为中心节点，成员为外围
    const colorMap = {}; factions.forEach(f=> colorMap[f.id]=f.color );
    const nodes = [];
    // 势力节点
    factions.forEach(f=>{
      nodes.push({ id:f.id, name:f.name, category:'faction', symbolSize: Math.max(50, Math.min(80, f.members.length*6)), itemStyle:{ color:f.color, borderColor:'#fff', borderWidth:2 }, label:{ show:true, fontSize:11, fontWeight:'bold' } });
    });
    // 成员节点（去重，最多 60 个）
    const seen = new Set();
    const memberLimit = 60;
    factions.forEach(f=>{
      (f.members||[]).slice(0, Math.ceil(memberLimit/factions.length)).forEach(m=>{
        if(seen.has(m)) return; seen.add(m);
        nodes.push({ id:'m-'+m, name:m, category:'member', symbolSize:18, itemStyle:{ color:f.color, opacity:0.85 }, label:{ show:true, fontSize:9 } });
      });
    });
    const links = [];
    // 成员→势力
    factions.forEach(f=>{
      f.members.forEach(m=>{
        if(nodes.find(n=>n.id==='m-'+m)) links.push({ source:'m-'+m, target:f.id, value:'隸屬', lineStyle:{ color:f.color, opacity:0.35, type:'solid' } });
      });
    });
    // 势力间关系（去重）
    const seenRel = new Set();
    const edgeTypeColor = {'敵對':'#dc2626','同盟':'#16a34a','破裂':'#f59e0b','篡奪':'#a855f7','滅亡':'#991b1b','交接':'#0891b2','主從':'#78350f','被併':'#be185d','鎮壓':'#475569','同族':'#7c3aed','無關':'#cbd5e1'};
    relations.forEach(r=>{
      const key = [r.from, r.to].sort().join('|')+'|'+r.type;
      if(seenRel.has(key)) return; seenRel.add(key);
      const c = edgeTypeColor[r.type] || '#94a3b8';
      links.push({ source:r.from, target:r.to, value:r.type, note:r.note, lineStyle:{ color:c, opacity:0.85, width:2, curveness:0.08 } });
    });

    el.innerHTML = `
      <h3 class="sub-h mb-2">勢力網絡 · Faction Network</h3>
      <p class="text-sm text-gray-600 mb-3">
        十二家勢力與核心人物的隸屬關係 + 勢力間的敵對·同盟·篡奪·滅亡。
        點擊勢力節點可見其人物；拖動節點可視化調整佈局。
      </p>
      <div class="flex flex-wrap gap-2 mb-3 text-xs">
        <span class="text-gray-500 mr-1">邊色：</span>
        ${Object.entries(edgeTypeColor).slice(0,8).map(([k,v])=>`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full"><span class="w-3 h-0.5 rounded-full" style="background:${v}"></span>${k}</span>`).join('')}
      </div>
      <div id="factions-chart" style="height:600px"></div>
      <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
        ${factions.map(f=>`<a href="read.html?edition=mao&unit=1" class="flex items-center gap-2 border border-gray-100 rounded px-2 py-1 hover:bg-gray-50"><span class="w-2 h-2 rounded-full" style="background:${f.color}"></span>${f.name}<span class="text-gray-400 ml-auto">${f.period}</span></a>`).join('')}
      </div>
    `;

    setTimeout(()=>{
      const c = document.getElementById('factions-chart'); if(!c) return;
      const chart = echarts.init(c);
      chart.setOption({
        tooltip:{
          formatter: p=>{
            if(p.dataType==='node'){
              const f = factions.find(x=>x.id===p.data.id);
              if(f) return `<b>${f.name}</b><br/>${f.period}<br/>領袖：${f.leader}<br/>規模：${f.army||'—'}`;
              return `<b>${p.data.name}</b>`;
            }
            return `<b>${p.data.source}</b> → <b>${p.data.target}</b><br/>關係：${p.data.value||''}<br/>${p.data.note||''}`;
          }
        },
        legend:{ show:false },
        series:[{
          type:'graph',
          layout:'force',
          roam:true,
          draggable:true,
          data:nodes,
          links:links,
          categories:[ {name:'faction'}, {name:'member'} ],
          force:{ repulsion:300, edgeLength:[40,140], gravity:0.08, friction:0.2 },
          emphasis:{ focus:'adjacency', lineStyle:{ width:4 } },
          lineStyle:{ opacity:0.6, curveness:0.08 },
          edgeSymbol:['none','arrow'],
          edgeSymbolSize:6,
          label:{ show:true, position:'right', fontSize:10 },
          animationDuration:800
        }]
      });
      window.addEventListener('resize', ()=>chart.resize());
    }, 120);
  }

  /* ======== T5 意象图谱 Imagery Heatmap ======== */
  function renderTopicImagery(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const imgs = topics.imagery || [];
    if(!imgs.length){ el.innerHTML = '<p class="p3 text-gray-500">意象数据未加载。</p>'; return; }

    // 120 列 × 15 行 SVG 热力图
    const COLS=120, ROWS=imgs.length, CELL_W=7, CELL_H=22, PAD_L=80, PAD_T=50, W=PAD_L+COLS*CELL_W+30, H=PAD_T+ROWS*CELL_H+30;

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="mx-auto">`;
    // 顶部章号刻度（每 20 回标一次）
    for(let c=1;c<=COLS;c++){
      const x=PAD_L+(c-1)*CELL_W+CELL_W/2;
      if(c%20===0 || c===1){ svg += `<text x="${x}" y="${PAD_T-6}" font-size="10" fill="#64748b" text-anchor="middle">${c}</text>`; }
      svg += `<line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${PAD_T+ROWS*CELL_H}" stroke="#f1f5f9" stroke-width="1"/>`;
    }
    // 左标签 + 单元格
    imgs.forEach((img,r)=>{
      const y=PAD_T+r*CELL_H;
      svg += `<text x="${PAD_L-8}" y="${y+CELL_H/2+4}" font-size="12" text-anchor="end" dominant-baseline="middle">${img.symbol} ${img.label}</text>`;
      for(let c=1;c<=COLS;c++){
        const hit = img.chapters.includes(c);
        const x=PAD_L+(c-1)*CELL_W;
        const cls = hit ? `fill="${img.color}" fill-opacity="0.9" stroke="#fff" stroke-width="0.5"` : `fill="#f1f5f9"`;
        if(hit){
          svg += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" ${cls} data-img="${img.label}" data-ch="${c}" class="img-cell cursor-pointer hover:stroke-gray-700"/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" ${cls}/>`;
        }
      }
    });
    svg += `</svg>`;

    // 右侧详情卡
    el.innerHTML = `
      <h3 class="sub-h mb-2">意象圖譜 · Imagery Matrix</h3>
      <p class="text-sm text-gray-600 mb-3">
        十五種意象（桃/馬/劍/玉璽/火/風/龍/鳳/山/水…）在一百二十回的分布熱圖。
        點擊格子可跳轉閱讀器對應回目；點擊意象名稱看全部落點。
      </p>
      <div class="flex flex-wrap gap-2 mb-3 text-xs">
        ${imgs.map(i=>`<button data-img="${i.label}" class="img-btn px-2 py-0.5 rounded-full border text-xs hover:border-gray-500 transition-colors" style="--ic:${i.color};border-color:${i.color}40;color:${i.color}">${i.symbol}${i.label}(${i.chapters.length})</button>`).join('')}
      </div>
      <div class="overflow-x-auto">${svg}</div>
      <div id="img-detail" class="mt-4 border border-gray-200 rounded-lg p-4 bg-white min-h-[120px] text-sm text-gray-500">
        點擊上方意象或熱圖格子查看詳情。
      </div>
    `;

    const detail = el.querySelector('#img-detail');
    function showImg(img){
      const chs = img.chapters.slice().sort((a,b)=>a-b);
      detail.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl">${img.symbol}</span>
          <h4 class="text-lg font-bold">${img.label}</h4>
          <span class="text-xs text-gray-500">對應義理：${img.doctrine}</span>
        </div>
        <p class="text-sm text-gray-700 mb-2">${img.note}</p>
        <div class="flex flex-wrap gap-1">
          ${chs.map(c=>`<a href="read.html?edition=mao&unit=${c}" class="text-xs px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200">第${c}回</a>`).join('')}
        </div>
      `;
    }
    // cell 点击
    el.querySelectorAll('.img-cell').forEach(cell=>{
      cell.addEventListener('click', ()=>{
        const ch = +cell.dataset.ch;
        const imgName = cell.dataset.img;
        const img = imgs.find(i=>i.label===imgName);
        if(img){ showImg(img); window.open('read.html?edition=mao&unit='+ch, '_blank'); }
      });
    });
    // btn 点击
    el.querySelectorAll('.img-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const img = imgs.find(i=>i.label===btn.dataset.img);
        if(img) showImg(img);
      });
    });
  }

  /* ======== T6 叙事技法 Narrative Technique Heatmap ======== */
  function renderTopicTechniques(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const techs = topics.narrativeTechniques || [];
    if(!techs.length){ el.innerHTML = '<p class="p3 text-gray-500">技法数据未加载。</p>'; return; }

    const COLS=120, ROWS=techs.length, CELL_W=7, CELL_H=26, PAD_L=90, PAD_T=50, W=PAD_L+COLS*CELL_W+30, H=PAD_T+ROWS*CELL_H+30;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="mx-auto">`;
    for(let c=1;c<=COLS;c++){
      const x=PAD_L+(c-1)*CELL_W+CELL_W/2;
      if(c%20===0 || c===1){ svg += `<text x="${x}" y="${PAD_T-6}" font-size="10" fill="#64748b" text-anchor="middle">${c}</text>`; }
      svg += `<line x1="${x}" y1="${PAD_T}" x2="${x}" y2="${PAD_T+ROWS*CELL_H}" stroke="#f1f5f9" stroke-width="1"/>`;
    }
    techs.forEach((t,r)=>{
      const y=PAD_T+r*CELL_H;
      svg += `<text x="${PAD_L-8}" y="${y+CELL_H/2+4}" font-size="12" text-anchor="end" dominant-baseline="middle" fill="${t.color}" font-weight="600">${t.label}</text>`;
      for(let c=1;c<=COLS;c++){
        const hit = t.chapters.includes(c);
        const x=PAD_L+(c-1)*CELL_W;
        const cls = hit ? `fill="${t.color}" fill-opacity="0.85" stroke="#fff" stroke-width="0.5"` : `fill="#f8fafc"`;
        if(hit){ svg += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" ${cls} data-tech="${t.label}" data-ch="${c}" class="tech-cell cursor-pointer hover:stroke-gray-700"/>`; }
        else { svg += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" ${cls}/>`; }
      }
    });
    svg += `</svg>`;

    el.innerHTML = `
      <h3 class="sub-h mb-2">敘事技法 · Narrative Technique × 120 回</h3>
      <p class="text-sm text-gray-600 mb-3">
        十種敘事技法在一百二十回的落點熱圖（毛宗崗評點體系）。
        深色格 = 該回明顯使用此技法。點擊查看該技法說明 + 跳轉閱讀器。
      </p>
      <div class="overflow-x-auto">${svg}</div>
      <div id="tech-detail" class="mt-4 border border-gray-200 rounded-lg p-4 bg-white min-h-[120px] text-sm text-gray-500">
        點擊上方熱圖格子查看技法說明與落點回目。
      </div>
    `;

    const detail = el.querySelector('#tech-detail');
    function showTech(t){
      const chs = t.chapters.slice().sort((a,b)=>a-b);
      detail.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-block w-3 h-3 rounded-full" style="background:${t.color}"></span>
          <h4 class="text-lg font-bold">${t.label}</h4>
          <span class="text-xs text-gray-500">${t.note||''}</span>
        </div>
        <p class="text-sm text-gray-700 mb-2">${t.desc}</p>
        <div class="flex flex-wrap gap-1">
          ${chs.map(c=>`<a href="read.html?edition=mao&unit=${c}" class="text-xs px-2 py-0.5 rounded" style="background:${t.color}20;color:${t.color}">第${c}回</a>`).join('')}
        </div>
      `;
    }
    el.querySelectorAll('.tech-cell').forEach(cell=>{
      cell.addEventListener('click', ()=>{
        const ch = +cell.dataset.ch;
        const label = cell.dataset.tech;
        const t = techs.find(x=>x.label===label);
        if(t){ showTech(t); window.open('read.html?edition=mao&unit='+ch, '_blank'); }
      });
    });
  }

  /* ======== T7 义理漂移 Doctrine Drift ======== */
  function renderTopicDoctrineDrift(el){
    const topics = (typeof SANGUO_TOPICS!=='undefined') ? SANGUO_TOPICS : {};
    const drift = topics.doctrineDrifts || {};
    const doctrines = topics.doctrines || [];
    const density = drift.density || {};
    const narratives = drift.narratives || [];
    const revisions = drift.revisions || [];
    const editionMeta = {
      mao:{name:'毛宗崗評本', color:'#dc2626', era:'1679', system:'評本'},
      jiajing:{name:'嘉靖壬午本', color:'#2563eb', era:'1522', system:'志傳'},
      jiajingWs:{name:'嘉靖维基轉錄', color:'#60a5fa', era:'1522', system:'志傳'},
      huiping:{name:'七家匯評本', color:'#9333ea', era:'清', system:'匯評'},
      yuxiangdou:{name:'余象斗評林', color:'#059669', era:'1598', system:'志傳'},
      zhouyue:{name:'周曰校本', color:'#14b8a6', era:'1591', system:'志傳'},
      lizhuowu:{name:'李卓吾評本', color:'#ea580c', era:'萬曆', system:'評本'},
      zhongbojing:{name:'鍾伯敬評本', color:'#64748b', era:'明末', system:'評本'}
    };
    const edIds = Object.keys(density).filter(id=> density[id] && density[id].length===12);
    if(!edIds.length || !doctrines.length){ el.innerHTML = '<p class="p3 text-gray-500">义理漂移数据未加载。</p>'; return; }

    const doctLabels = doctrines.map(d=>d.label);
    const doctColors = doctrines.map(d=>d.color);

    el.innerHTML = `
      <div class="mb-6">
        <h3 class="sub-h mb-2">義理漂移 · Doctrine Drift</h3>
        <p class="text-sm text-gray-600 mb-4">
          同一部《三國演義》，八種版本對十二種義理概念的強度分佈完全不同。
          毛宗崗把「正統」提升為綱領，嘉靖本把「勇烈」放在首位，志傳評林重情節輕義理，
          評點家則在嘉靖與毛本之間找到了屬於自己的道德坐標。
          這不是誰改誰的問題——這是一部小說如何隨著閱讀史被不斷重寫的故事。
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 雷达图 -->
          <div class="border border-gray-200 rounded-lg p-4 bg-white">
            <h4 class="text-sm font-bold mb-2">多版本義理密度雷達圖</h4>
            <div id="drift-radar" style="height:320px"></div>
            <div class="flex flex-wrap gap-1.5 mt-2 text-[11px]">
              ${edIds.map(id=>{ const m=editionMeta[id]; return `<span data-ed="${id}" class="ed-legend inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 cursor-pointer hover:border-gray-500" style="border-left-color:${m.color};border-left-width:3px">${m.name}</span>`; }).join('')}
            </div>
          </div>
          <!-- 堆叠条形图 -->
          <div class="border border-gray-200 rounded-lg p-4 bg-white">
            <h4 class="text-sm font-bold mb-2">各版本義理分佈堆疊</h4>
            <div id="drift-bar" style="height:320px"></div>
          </div>
        </div>
      </div>

      <!-- 漂移叙事切换 -->
      <div class="border border-gray-200 rounded-lg p-5 bg-white mb-6">
        <h4 class="text-sm font-bold mb-3">三段漂移敘事</h4>
        <div class="flex gap-2 flex-wrap mb-4">
          ${narratives.map((n,i)=>`<button data-nid="${n.id}" class="narr-btn px-3 py-1.5 rounded text-sm border hover:bg-gray-50 transition-colors ${i===0?'border-gray-700 bg-gray-100 font-bold':'border-gray-300'}">${n.title.split('：')[0]}</button>`).join('')}
        </div>
        <div id="narr-detail" class="min-h-[180px]">${renderNarr(narratives[0])}</div>
      </div>

      <!-- 改笔案例 -->
      <div>
        <h4 class="text-sm font-bold mb-3">毛宗崗改筆四案</h4>
        <p class="text-xs text-gray-500 mb-3">嘉靖壬午本原文 vs 毛宗崗改後 · 一字之差重塑義理</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${revisions.map(r=>`
            <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">第${r.chapter}回</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">${r.doctrine}</span>
              </div>
              <div class="space-y-1.5 text-xs">
                <div class="flex gap-2">
                  <span class="shrink-0 text-gray-400 w-14">嘉靖本：</span>
                  <span class="italic text-gray-600">"${r.jiajing}"</span>
                </div>
                <div class="flex gap-2">
                  <span class="shrink-0 text-red-500 w-14">毛宗崗：</span>
                  <span class="italic font-bold text-gray-800">"${r.mao}"</span>
                </div>
              </div>
              <p class="mt-2 text-sm text-gray-700 leading-relaxed">${r.impact}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    function renderNarr(n){
      const vers = (n.versions||[]).map(id=> editionMeta[id]?.name || id);
      return `
        <div class="mb-2">
          <h5 class="text-lg font-bold mb-1">${n.title}</h5>
          <p class="text-xs text-gray-500">涉及版本：${vers.join(' · ')}</p>
        </div>
        <div class="space-y-2">
          ${(n.text||[]).map((p,i)=>`<p class="text-sm leading-relaxed text-gray-700">
            <span class="inline-block w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold leading-6 text-center mr-2">${i+1}</span>
            ${p}
          </p>`).join('')}
        </div>
        <p class="mt-3 text-sm font-bold border-l-4 border-amber-400 pl-3 py-1 bg-amber-50 text-amber-900">結語：${n.verdict}</p>
      `;
    }

    // 雷达图
    setTimeout(()=>{
      const r = document.getElementById('drift-radar'); if(!r) return;
      const chart = echarts.init(r);
      const series = edIds.map(id=>{
        const m = editionMeta[id];
        return {
          name:m.name,
          type:'radar',
          data:[{ value:density[id], name:m.name, areaStyle:{ opacity:0.15, color:m.color }, lineStyle:{ color:m.color }, itemStyle:{ color:m.color } }]
        };
      });
      chart.setOption({
        tooltip:{},
        legend:{ show:false },
        radar:{
          indicator: doctLabels.map((l,i)=>({ name:l, max:5 })),
          shape:'polygon',
          splitNumber:5,
          axisName:{ color:'#475569', fontSize:11 },
          splitArea:{ areaStyle:{ color:['#f8fafc','#f1f5f9'] } }
        },
        series
      });
      window.addEventListener('resize', ()=>chart.resize());
    }, 100);

    // 堆叠条形图
    setTimeout(()=>{
      const b = document.getElementById('drift-bar'); if(!b) return;
      const chart = echarts.init(b);
      // 只取前 5 核心概念（outer ring）用于堆叠，更可读
      const outerDoctIdx = doctrines.filter(d=>d.ring==='outer').map(d=> doctrines.indexOf(d));
      const stackedSeries = outerDoctIdx.map((di,si)=>({
        name: doctLabels[di],
        type:'bar',
        stack:'total',
        emphasis:{ focus:'series' },
        itemStyle:{ color: doctColors[di] },
        data: edIds.map(id=> density[id][di])
      }));
      chart.setOption({
        tooltip:{ trigger:'axis', axisPointer:{ type:'shadow' } },
        legend:{ top:26, textStyle:{ fontSize:11 } },
        grid:{ left:80, right:20, top:70, bottom:20 },
        xAxis:{ type:'value', max:25 },
        yAxis:{ type:'category', data: edIds.map(id=> editionMeta[id].name), axisLabel:{ fontSize:11 } },
        series: stackedSeries
      });
      window.addEventListener('resize', ()=>chart.resize());
    }, 200);

    // 叙事切换
    el.querySelectorAll('.narr-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.nid;
        const n = narratives.find(x=>x.id===id);
        if(n){
          document.querySelectorAll('.narr-btn').forEach(b=>{
            b.classList.remove('border-gray-700','bg-gray-100','font-bold');
            b.classList.add('border-gray-300');
          });
          btn.classList.add('border-gray-700','bg-gray-100','font-bold');
          btn.classList.remove('border-gray-300');
          el.querySelector('#narr-detail').innerHTML = renderNarr(n);
        }
      });
    });
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
    clickedUnitN = null; // 翻页/跳回：清空点选单元，侧栏回到「回→单元」映射高亮
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
      clickedUnitN = null; // 切版本：清空点选单元，侧栏按新版本重建
      showView('reader');
    }
  };
  global.appSetAnnot = function(key, on){
    on = !!on;
    if(key === 'all'){
      // 总开关 = 全选/全清：同步四家状态与对应勾选框 DOM，不重渲染整页
      ANNOT_CRITICS.forEach(c => {
        readerState.annot[c.id] = on;
        const cb = document.querySelector('input[data-annot-toggle="' + c.id + '"]');
        if(cb) cb.checked = on;
      });
    } else if(Object.prototype.hasOwnProperty.call(readerState.annot, key)){
      readerState.annot[key] = on;
      // 个体变化后回写总开关勾选状态：四家全选 → 总开关勾上
      const allCb = document.getElementById('annot-toggle-all');
      if(allCb) allCb.checked = ANNOT_CRITICS.every(c => readerState.annot[c.id]);
    }
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
    appCmpRun: global.appCmpRun,
    appMcRun: global.appMcRun,
    appMcLang: global.appMcLang
  };

  // 自动初始化（等待 DOM ready）
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      // 不自动渲染，让页面自己调用 appInit
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
