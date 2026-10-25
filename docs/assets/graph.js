(function(){
const COLOR = {
  person: '#9e2a20', faction: '#b07b28', artifact: '#3d6b5c',
};
const SIZE  = { person: 6, faction: 10, artifact: 5 };

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const W = canvas.width, H = canvas.height;

let DATA = null;            // {nodes:[], links:[]}
let nodes=[], links=[];
let drag=null, hover=null, clicked=null;
let camera = {x:W/2, y:H/2, scale:1, panning:false, px:0, py:0};
const tabEl = {};
document.querySelectorAll('.tab').forEach(b=>{
  tabEl[b.dataset.tab]=b;
  b.onclick=()=>switchTab(b.dataset.tab);
});

function switchTab(t){
  Object.values(tabEl).forEach(b=>b.classList.remove('active'));
  tabEl[t].classList.add('active');
  const map = {people:'people', factions:'factions', artifacts:'artifacts'};
  loadGraph(map[t]);
}

function loadGraph(key){
  if(DATA){
    build(DATA[key]);
    return;
  }
  fetch('data/graph.json').then(r=>r.json()).then(d=>{
    const views=d.views||[];
    const byName={};
    views.forEach(v=>{byName[v.name]=v;});
    DATA = {
      people:    byName['人物关系网']||views[0],
      factions:  byName['势力格局']||views[1]||views[0],
      artifacts: byName['器物谱']||views[2]||views[0],
    };
    build(DATA[key]);
  }).catch(e=>{info.innerHTML='<span style="color:#a8322a">圖譜數據加載失敗：'+e.message+'</span>';});
}

function build(g){
  nodes = g.nodes.map(n=>({...n, x:W/2+(Math.random()-.5)*200, y:H/2+(Math.random()-.5)*200, vx:0, vy:0, r:SIZE[n.type]||6, color:COLOR[n.type]||'#5c4a30'}));
  const idm = Object.fromEntries(nodes.map((n,i)=>[n.id,i]));
  links = g.links.filter(l=>idm[l.source]!=null&&idm[l.target]!=null).map(l=>({...l, s:idm[l.source], t:idm[l.target]}));
  // group big nodes by faction: pull same faction together
  const fx = {}, fy={};
  const offsets = {"蜀漢":[-240,0],"魏":[0,-140],"吳":[240,0],"東漢":[0,-240]};
  nodes.forEach(n=>{
    if(n.faction && offsets[n.faction]){n.x=W/2+offsets[n.faction][0]+(Math.random()-.5)*60; n.y=H/2+offsets[n.faction][1]+(Math.random()-.5)*60;}
  });
  simulate();
}

function simulate(){
  const REP=9000, LINK=0.005, CENTER=0.02;
  for(let it=0; it<300; it++){
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j];
        let dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy)||1;
        const f=REP/(d*d);
        a.vx+=dx/d*f; a.vy+=dy/d*f;
        b.vx-=dx/d*f; b.vy-=dy/d*f;
      }
    }
    for(const l of links){
      const a=nodes[l.s], b=nodes[l.t];
      const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, f=(d-80)*LINK;
      a.vx+=dx/d*f; a.vy+=dy/d*f;
      b.vx-=dx/d*f; b.vy-=dy/d*f;
    }
    for(const n of nodes){
      n.vx+=(W/2-n.x)*CENTER; n.vy+=(H/2-n.y)*CENTER;
      n.vx*=0.85; n.vy*=0.85;
      n.x+=n.vx; n.y+=n.vy;
    }
  }
  draw();
}

function toGraph(px,py){
  return {x:(px-camera.x)/camera.scale+W/2, y:(py-camera.y)/camera.scale+H/2};
}
function toScreen(gx,gy){
  return {x:(gx-W/2)*camera.scale+camera.x, y:(gy-H/2)*camera.scale+camera.y};
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.scale, camera.scale);
  ctx.translate(-W/2, -H/2);

  for(const l of links){
    const a=nodes[l.s], b=nodes[l.t];
    ctx.beginPath();
    ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(139,111,62,.35)';
    ctx.lineWidth=1;
    ctx.stroke();
  }
  for(const n of nodes){
    ctx.beginPath();
    ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    const hi = (hover===n || clicked===n);
    ctx.fillStyle = hi ? '#9e2a20' : n.color;
    ctx.fill();
    ctx.strokeStyle = '#f6ecd4';
    ctx.lineWidth=1.2;
    ctx.stroke();
  }
  ctx.font = '12px "Kaiti SC", "STKaiti", serif';
  ctx.textAlign='center';
  ctx.textBaseline='top';
  for(const n of nodes){
    if(n.r>5 || hover===n || camera.scale>1.2){
      ctx.fillStyle = (hover===n||clicked===n) ? '#9e2a20' : '#2a241f';
      ctx.fillText(n.label||n.name||n.id, n.x, n.y+n.r+2);
    }
  }
  ctx.restore();
}

function hit(px,py){
  const g = toGraph(px,py);
  for(let i=nodes.length-1;i>=0;i--){
    const n=nodes[i];
    if(Math.hypot(n.x-g.x,n.y-g.y) <= n.r+4) return n;
  }
  return null;
}

canvas.addEventListener('mousedown', e=>{
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
  const h=hit(x,y);
  if(e.button===2 || (h==null && e.shiftKey)){
    camera.panning=true; camera.px=x; camera.py=y; return;
  }
  if(h){ drag=h; drag.ox=x; drag.oy=y; drag.gx=h.x; drag.gy=h.y; }
});
canvas.addEventListener('mousemove', e=>{
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
  if(camera.panning){
    camera.x += (x-camera.px); camera.y += (y-camera.py);
    camera.px=x; camera.py=y; draw(); return;
  }
  if(drag){
    const g = toGraph(x,y);
    drag.x = g.x; drag.y = g.y; draw(); return;
  }
  const h=hit(x,y);
  if(h!==hover){hover=h; canvas.style.cursor=h?'pointer':'default'; draw();}
});
window.addEventListener('mouseup', ()=>{
  if(drag){drag=null;}
  camera.panning=false;
});
canvas.addEventListener('click', e=>{
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
  const h=hit(x,y);
  clicked=h||null;
  showInfo(h);
  draw();
});
canvas.addEventListener('contextmenu', e=>e.preventDefault());
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
  const before=toGraph(x,y);
  const k = e.deltaY<0 ? 1.1 : 1/1.1;
  camera.scale = Math.max(0.3, Math.min(4, camera.scale*k));
  const after=toGraph(x,y);
  camera.x += (after.x-before.x)*camera.scale;
  camera.y += (after.y-before.y)*camera.scale;
  draw();
},{passive:false});

function showInfo(n){
  if(!n){info.innerHTML='<i>點選節點查看本體記錄</i>'; return;}
  let rels = (n.relations||[]).map(r=>'<span class="tag">'+r.type+' · '+r.target+'</span>').join(' ');
  let add = '';
  if(n.zi) add += '<div><b>字</b>：'+n.zi+'</div>';
  if(n.faction) add += '<div><b>陣營</b>：'+n.faction+'</div>';
  if(n.category) add += '<div><b>類別</b>：'+n.category+'</div>';
  if(n.capital) add += '<div><b>都城</b>：'+n.capital+'</div>';
  if(n.lord) add += '<div><b>主公</b>：'+n.lord+'</div>';
  if(n.owner) add += '<div><b>持有者</b>：'+n.owner+'</div>';
  if(n.first) add += '<div><b>初登場</b>：第 '+n.first+' 回</div>';
  if(n.total) add += '<div><b>提及</b>：'+n.total.toLocaleString()+'</div>';
  info.innerHTML = '<div class="tip"><h4 style="margin:0 0 6px;color:var(--cinnabar-d)">'+(n.label||n.name)+'</h4>'+add+'<div style="margin-top:6px">'+rels+'</div></div>';
}

switchTab('people');
})();
