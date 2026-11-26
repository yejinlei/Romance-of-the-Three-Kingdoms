/**
 * 通用文本单元切分器（unitsplit.js）
 *
 * 供 read.html（app.js）与多版本对照使用；corpus.html 是繁体页、不引本文件，
 * 其内联 split* 函数与本文件同构——改动本文件时须同步 corpus.html（反之亦然）。
 *
 * 顶层 const UNITSplit，不挂 window；页面按裸标识符读取。
 * 纯静态、无第三方库。
 */
const UNITSplit = (function(){
  'use strict';

  /* ---- 汉字/全角数字 → 阿拉伯 ---- */
  function cn2num(s){
    const d={'零':0,'〇':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
    s=String(s||'').trim();
    if(/^\d+$/.test(s)) return parseInt(s,10);
    let total=0, cur=0;
    for(const c of s){
      if(c==='十'){ total+=(cur||1)*10; cur=0; }
      else if(c==='百'){ total+=(cur||1)*100; cur=0; }
      else if(c==='零'||c==='〇'){ cur=0; }
      else if(d[c]!==undefined){ cur=d[c]; }
    }
    return total+cur;
  }
  // 全角数字→半角，再走 cn2num
  function toHalf(s){
    return String(s||'').replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
  }
  function cmpCnNum(s){ return cn2num(toHalf(s)); }

  /* ---- 行清理：去 \r、空行、页码残迹、markdown 噪音 ---- */
  function cleanLines(lines){
    const out=[];
    for(let raw of lines){
      let t=String(raw).replace(/\r/g,'').trim();
      if(!t || t.startsWith('#')) continue;
      if(/^\d{1,4}$/.test(t)) continue; // 页码残迹
      if(/^---+$/.test(t)) continue;
      if(/^=+$/.test(t)) continue;
      if(/^>/.test(t)) continue;
      if(/^\[Volume\s+\d/i.test(t)) continue;      // 英译本卷/回标记行
      if(/^CHAPTER\s*[IVXLC]+\.?$/i.test(t)) continue; // 英译本回号行（已作单元号）
      t=t.replace(/\*\*/g,'');
      out.push(t);
    }
    return out;
  }

  /* ---- 按单元形制切分 ---- */
  // kind: 'chapter'(第N回) | 'ze'(第N則) | 'volume'(卷之N) | 'bullet'(●) | 'marker'(===) | 'en-chapter'([Volume · Chapter])
  // opts 可选：{ prefix:'###'|'==='|null, unit:'回'|'則' } 覆盖默认标题检测（OCR 版本格式不一）
  function splitByKind(text, kind, opts){
    text=String(text||'');
    const lines=text.replace(/\r/g,'').split('\n');
    const units=[]; let cur=null; let volume='';
    const reN = '[一二三四五六七八九十百零〇0-9]{1,6}';
    const prefix = (opts&&opts.prefix!==undefined)?opts.prefix:null; // null→按 kind 默认
    const unitWord = (opts&&opts.unit)||((kind==='chapter')?'回':'則');
    // 标题行匹配：prefix + 第N(则|回) + 题名
    function titleMatch(line){
      let pre = (prefix===null) ? ((kind==='chapter')?'':(kind==='ze'?'###\\s*':'\\s*')) : (prefix==='none'?'':prefix+'\\s*');
      const re=new RegExp('^'+pre+'第('+reN+')'+unitWord+'[\\s　]*(.*)$');
      const m=line.match(re);
      if(m) return {n:cmpCnNum(m[1]), title:line.trim()};
      return null;
    }
    for(const line of lines){
      let m=null;
      if(kind==='chapter'||kind==='ze') m=titleMatch(line);
      else if(kind==='volume') m=line.match(/^卷之([一二三四五六七八九十百零〇0-9]+)\s*$/);
      else if(kind==='bullet') m=line.match(/^\s*●\s*(.+)$/);
      else if(kind==='marker') m=line.match(/^===\s*(.+?)\s*===$/);
      else if(kind==='en-chapter') m=line.match(/^\[(Volume\s*\d+\s*\S[^\]]*)\]\s*$/i);
      if(m){
        if(kind==='bullet'){ cur={title:m[1].trim(),lines:[]}; }
        else if(kind==='marker'){ cur={title:m[1],lines:[]}; }
        else if(kind==='volume'){ cur={title:'卷之'+m[1],n:cmpCnNum(m[1]),lines:[]}; }
        else if(kind==='en-chapter'){
        // 英译本：[Volume 1 · Chapter 1] 标记；回号取自标记内 Chapter N（该译本缺回6/20/25/60/75/114，保留真实回号而非连号）
        const cn=(m[1].match(/Chapter\s*(\d+)/i)||[])[1];
        let subj='';
        const start=lines.indexOf(line)+1;
        for(let j=start; j<Math.min(lines.length, start+12); j++){
          const t=String(lines[j]).trim();
          if(!t) continue;
          if(/^=+$/i.test(t) || /^CHAPTER\s*[IVXLC]+\.?$/i.test(t)) continue;
          subj=t; break;
        }
        cur={ title:subj||m[1], n:cn?parseInt(cn,10):units.length+1, lines:[] };
      }
        else { cur={n:m.n,title:m.title,volume,lines:[]}; }
        units.push(cur);
      }
      else if(cur) cur.lines.push(line);
    }
    if(!units.length && kind==='marker') units.push({title:'全文',lines});
    return units.map(u=>{
      const o={title:u.title,paras:cleanLines(u.lines)};
      if(u.n!==undefined) o.n=u.n;
      if(u.volume!==undefined) o.volume=u.volume;
      return o;
    });
  }

  /* ---- app.js 既有 splitZeText 迁移（兼容余象斗阿拉伯数字则） ---- */
  function splitZeText(txt){
    const lines=String(txt||'').split('\n');
    const marks=[]; let volume='';
    for(let i=0;i<lines.length;i++){
      const line=lines[i].replace(/\r$/,'');
      const vm=line.match(/^===\s*(.+?)\s*===\s*$/);
      if(vm){ volume=vm[1]; continue; }
      const m=line.match(/^###\s*第([0-9０-９一二三四五六七八九十百零〇]{1,6})則[　\s]*(.*)$/);
      if(m) marks.push({ num: cmpCnNum(m[1]), title: String(m[2]||'').trim(), line:i, volume:volume });
    }
    return marks.map((mk,k)=>{
      const end=(k+1<marks.length)?marks[k+1].line:lines.length;
      const paras=lines.slice(mk.line+1,end)
        .filter(l=>l.trim() && !/^>/.test(l.trim()) && !/^---+$/.test(l.trim()))
        .map(l=>l.replace(/\*\*/g,'').trim());
      return { n:mk.num, title:mk.title, volume:mk.volume, paras:paras };
    });
  }

  /* ---- 从段落提取【】批注，critic 按首词归家 ---- */
  // 返回 [{text, critic}]；critic ∈ 'li'|'zhong'|'yu'|'mao'（与 corpus.html .anno 类名对应）
  function extractAnno(paras){
    const out=[];
    for(const p of (paras||[])){
      const re=/【([^】]{1,4000})】/g; let m;
      while((m=re.exec(p))){
        const inner=m[1];
        let critic='mao';
        if(/^(贄|李贄|李卓吾|卓吾)/.test(inner)) critic='li';
        else if(/^(鍾|鐘|鍾伯敬|伯敬)/.test(inner)) critic='zhong';
        else if(/^(漁|李漁|笠翁)/.test(inner)) critic='yu';
        out.push({text:inner, critic:critic});
      }
    }
    return out;
  }

  /* ---- 高亮【】批注（复用 corpus.html fmtPara 视觉类） ---- */
  function fmtAnnoHtml(p){
    let s=String(p||'');
    s=s.replace(/【([^】]{1,4000})】/g,(all,inner)=>{
      let cls='anno';
      if(/^(贄|李贄|李卓吾|卓吾)/.test(inner)) cls+=' li';
      else if(/^(鍾|鐘|鍾伯敬|伯敬)/.test(inner)) cls+=' zhong';
      else if(/^(漁|李漁|笠翁)/.test(inner)) cls+=' yu';
      return `<span class="${cls}">【${inner}】</span>`;
    });
    return s;
  }

  return { cn2num, cmpCnNum, cleanLines, splitByKind, splitZeText, extractAnno, fmtAnnoHtml };
})();
