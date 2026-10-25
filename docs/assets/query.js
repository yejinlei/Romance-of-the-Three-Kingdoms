(function(){
const STATUS = document.getElementById('qstatus');
const SQL = document.getElementById('sql');
const BTN = document.getElementById('run');
const EXP = document.getElementById('explain');
const RES = document.getElementById('results');
const SCH = document.getElementById('schema');
const SAMP = document.getElementById('sample');

let db=null, conn=null, ready=false;
const TABLES = ["persons","factions","battles","places","events","artifacts","stratagems","prophecies",
                "editions","chapters","lines","mentions","entities","relationships","scholars","papers",
                "adaptations","annotations","stats"];

function setStatus(t, color){
  STATUS.textContent=t;
  STATUS.style.color = color||'var(--bronze)';
}

async function init(){
  try{
    setStatus('正在載入 DuckDB-WASM…');
    const DUCKDB_CDN = [
      'lib/duckdb/duckdb-browser-mvp.worker.js',
      'lib/duckdb/duckdb-mvp.wasm',
    ];
    let duckdb;
    try{
      const mod = await import(new URL('../lib/duckdb/duckdb-browser.mjs', location.href).href);
      duckdb = mod;
    }catch(e){
      // fallback CDN
      setStatus('本地庫加載失敗，嘗試 CDN…');
      const mod = await import('https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/+esm');
      duckdb = mod;
    }
    const bundle = await duckdb.createDuckDBBundle();
    const logger = new duckdb.ConsoleLogger();
    const worker = await duckdb.createDuckDBWorker(bundle.mainWorker);
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);
    conn = await db.connect();
    setStatus('✓ DuckDB 已就緒，正在註冊 Parquet 表…','var(--jade)');
    for(const t of TABLES){
      try{
        await conn.query(`CREATE OR REPLACE VIEW ${t} AS SELECT * FROM read_parquet('data/${t}.parquet')`);
      }catch(e){/* ignore */}
    }
    setStatus('✓ 已就緒（'+TABLES.length+' 張表），可輸入 SQL 執行','var(--jade)');
    ready=true;
    BTN.disabled=false;
    BTN.textContent='執行 ▶';
  }catch(e){
    setStatus('初始化失敗：'+e.message, 'var(--cinnabar-d)');
    console.error(e);
  }
}

async function run(){
  if(!ready){setStatus('尚未就緒…', 'var(--cinnabar-d)'); return;}
  const sql = SQL.value.trim();
  if(!sql) return;
  BTN.disabled=true; BTN.textContent='執行中…';
  try{
    const t0=performance.now();
    const res = await conn.query(sql);
    const ms = (performance.now()-t0).toFixed(0);
    const rows = res.toArray();
    const cols = res.schema.fields.map(f=>f.name);
    let html = '<div class="meta" style="margin-bottom:8px">'+rows.length.toLocaleString()+' 行 · '+ms+' ms</div>';
    if(rows.length===0){
      html += '<div class="mo">（查詢成功，0 行）</div>';
    }else{
      html += '<table><thead><tr>'+cols.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
      const limit = Math.min(rows.length, 500);
      for(let i=0;i<limit;i++){
        html += '<tr>'+cols.map(c=>'<td>'+fmt(rows[i][c])+'</td>').join('')+'</tr>';
      }
      html += '</tbody></table>';
      if(rows.length>500) html += '<div class="mo">（已截斷前 500 行）</div>';
    }
    RES.innerHTML = html;
    SCH.style.display='none';
  }catch(e){
    RES.innerHTML = '<div style="color:var(--cinnabar-d);padding:12px;border:1px solid var(--cinnabar-l);background:var(--paper)">SQL 錯誤：'+e.message+'</div>';
  }finally{
    BTN.disabled=false; BTN.textContent='執行 ▶';
  }
}

function fmt(v){
  if(v==null) return '<span class="mo">NULL</span>';
  if(typeof v==='object' && v instanceof Date) return v.toISOString().slice(0,10);
  if(typeof v==='bigint') return v.toString();
  const s=String(v);
  if(s.length>200) return s.slice(0,200)+'…';
  return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

async function showSchema(){
  if(!ready) return;
  let html='';
  for(const t of TABLES){
    try{
      const r = await conn.query(`DESCRIBE ${t}`);
      const cols = r.toArray().map(x=>x.column_name+': '+x.column_type);
      html += '<div><b>'+t+'</b> <span class="mo">'+cols.length+' 列</span><div style="margin:4px 0 8px 16px;font-size:12px;color:var(--ink2)">'+cols.join(', ')+'</div></div>';
    }catch(e){}
  }
  SCH.innerHTML = html;
  SCH.style.display = SCH.style.display==='none'?'block':'none';
}

BTN.onclick=run;
EXP.onclick=showSchema;
SAMP.onchange=()=>{ if(SAMP.value){ SQL.value=SAMP.value; SAMP.value=''; } };
SQL.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey) && e.key==='Enter') run(); });
init();
})();
