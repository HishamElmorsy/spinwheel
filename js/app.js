const canvas=document.getElementById('wheelCanvas');
const ctx=canvas.getContext('2d');
const spinBtn=document.getElementById('spinBtn');
const namesListEl=document.getElementById('namesList');
const nameInput=document.getElementById('nameInput');
const addBtn=document.getElementById('addBtn');
const resetBtn=document.getElementById('resetBtn');
const team1El=document.getElementById('team1List');
const team2El=document.getElementById('team2List');

let names=["Mshmsh","Spy","Borkano","Zuksh","3soom","Vmoor","Gondi","Frank","Santos"];
let selected=Object.fromEntries(names.map(n=>[n,true]));
let currentRotation=0; // radians
let spinning=false;
let teamTurn=1; // 1 then 2 alternating
let team1=[]; let team2=[];

// audio
let audioCtx=null; let lastTickIndex=null;
function ensureAudio(){
  if(!audioCtx){
    try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }
    catch(e){ audioCtx=null; }
  }
}
function playTick(){
  if(!audioCtx) return;
  const t=audioCtx.currentTime;
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='square'; o.frequency.setValueAtTime(1200,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(0.2,t+0.005);
  g.gain.exponentialRampToValueAtTime(0.0001,t+0.06);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t+0.07);
}

function colorFor(i,n){
  const hue=(i*360/n)|0;return `hsl(${hue} 75% 50%)`;
}

function fitFontFor(ctx, text, maxWidth, maxPx, minPx){
  let lo=minPx, hi=maxPx, best=minPx;
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    ctx.font=`600 ${mid}px Poppins, system-ui, Segoe UI, Roboto, Arial`;
    const w=ctx.measureText(text).width;
    if(w<=maxWidth){ best=mid; lo=mid+1; } else { hi=mid-1; }
  }
  return best;
}

function drawWheel(rotation=0){
  const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2,r=Math.min(cx,cy)-10;
  const active=names.filter(n=>selected[n]);
  const list=active.length?active:names.length?names:["Add names"];
  const n=list.length, angle=2*Math.PI/n;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);
  for(let i=0;i<n;i++){
    const start=i*angle,end=start+angle;
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,start,end);ctx.closePath();
    ctx.fillStyle=colorFor(i,n);ctx.fill();
    ctx.save();
    const mid=start+angle/2;ctx.rotate(mid);ctx.textAlign='right';
    ctx.textBaseline='middle';
    const label=list[i];
    const maxRadial=r-22; // leave inner spacing
    const maxTextWidth=Math.max(60, maxRadial-38);
    const fontPx=fitFontFor(ctx,label,maxTextWidth, Math.max(18, 38 - Math.floor(n*0.8)), 12);
    ctx.font=`600 ${fontPx}px Poppins, system-ui, Segoe UI, Roboto, Arial`;
    // outline for readability
    ctx.lineWidth=Math.max(2, Math.floor(fontPx/8));
    ctx.strokeStyle='rgba(0,0,0,0.55)';
    ctx.fillStyle='#f3f7ff';
    const tx=maxRadial-8;
    ctx.strokeText(label, tx, 0);
    ctx.fillText(label, tx, 0);
    ctx.restore();
  }
  ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fillStyle='#e8ecf1';ctx.fill();
  ctx.restore();
}

function renderList(){
  namesListEl.innerHTML='';
  names.forEach(n=>{
    const item=document.createElement('div');
    item.className='list-group-item d-flex align-items-center justify-content-between draggable';
    const id=`chk-${n.replace(/\W+/g,'_')}`;
    item.innerHTML=`<div class=\"form-check\">\n      <input class=\"form-check-input\" type=\"checkbox\" id=\"${id}\" ${selected[n]?'checked':''}>\n      <label class=\"form-check-label\" for=\"${id}\">${n}</label>\n    </div>\n    <button data-del class=\"btn btn-sm btn-outline-danger\">x</button>`;
    const chk=item.querySelector('input');
    chk.addEventListener('change',()=>{selected[n]=chk.checked;drawWheel(currentRotation)});
    chk.addEventListener('dragstart',e=>e.stopPropagation());
    const del=item.querySelector('[data-del]');
    del.addEventListener('click',()=>{names=names.filter(x=>x!==n);delete selected[n];drawWheel(currentRotation);renderList()});
    del.addEventListener('dragstart',e=>e.stopPropagation());
    item.setAttribute('draggable','true');
    item.addEventListener('dragstart',e=>{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', JSON.stringify({name:n,source:'pool'})); });
    namesListEl.appendChild(item);
  });
}

function randomInt(max){return Math.floor(Math.random()*max)}

function updateTeamsUI(){
  team1El.innerHTML=''; team2El.innerHTML='';
  team1.forEach(n=>{ const li=document.createElement('li'); li.className='team1'; li.textContent=n; li.setAttribute('draggable','true'); li.addEventListener('dragstart',e=>{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', JSON.stringify({name:n,source:'team1'})); }); team1El.appendChild(li); });
  team2.forEach(n=>{ const li=document.createElement('li'); li.className='team2'; li.textContent=n; li.setAttribute('draggable','true'); li.addEventListener('dragstart',e=>{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', JSON.stringify({name:n,source:'team2'})); }); team2El.appendChild(li); });
}

function setupDnDTargets(){
  function allow(e){ e.preventDefault(); if(e.dataTransfer) e.dataTransfer.dropEffect='move'; }
  function recalcSpin(){ const anyLeft=names.filter(n=>selected[n]).length || names.length; spinBtn.disabled=!anyLeft; }
  namesListEl.addEventListener('dragover',allow);
  namesListEl.addEventListener('drop',e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='team1'){ team1=team1.filter(x=>x!==name); if(!names.includes(name)) { names.push(name); selected[name]=true; } }
    else if(source==='team2'){ team2=team2.filter(x=>x!==name); if(!names.includes(name)) { names.push(name); selected[name]=true; } }
    updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); });
  // expand drop zone to card container
  const namesCard=namesListEl.closest('.card');
  if(namesCard){ namesCard.addEventListener('dragover',allow); namesCard.addEventListener('drop', e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='team1'){ team1=team1.filter(x=>x!==name); if(!names.includes(name)) { names.push(name); selected[name]=true; } } else if(source==='team2'){ team2=team2.filter(x=>x!==name); if(!names.includes(name)) { names.push(name); selected[name]=true; } } updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); }); }
  team1El.addEventListener('dragover',allow);
  team1El.addEventListener('drop',e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='pool'){ names=names.filter(x=>x!==name); delete selected[name]; if(!team1.includes(name)) team1.push(name); }
    else if(source==='team2'){ team2=team2.filter(x=>x!==name); if(!team1.includes(name)) team1.push(name); }
    updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); });
  const team1Container=team1El.parentElement; if(team1Container){ team1Container.addEventListener('dragover',allow); team1Container.addEventListener('drop', e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='pool'){ names=names.filter(x=>x!==name); delete selected[name]; if(!team1.includes(name)) team1.push(name); } else if(source==='team2'){ team2=team2.filter(x=>x!==name); if(!team1.includes(name)) team1.push(name); } updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); }); }
  team2El.addEventListener('dragover',allow);
  team2El.addEventListener('drop',e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='pool'){ names=names.filter(x=>x!==name); delete selected[name]; if(!team2.includes(name)) team2.push(name); }
    else if(source==='team1'){ team1=team1.filter(x=>x!==name); if(!team2.includes(name)) team2.push(name); }
    updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); });
  const team2Container=team2El.parentElement; if(team2Container){ team2Container.addEventListener('dragover',allow); team2Container.addEventListener('drop', e=>{ e.preventDefault(); let data={}; try{ data=JSON.parse(e.dataTransfer.getData('text/plain')||'{}'); }catch{}; const {name,source}=data; if(!name) return; if(source==='pool'){ names=names.filter(x=>x!==name); delete selected[name]; if(!team2.includes(name)) team2.push(name); } else if(source==='team1'){ team1=team1.filter(x=>x!==name); if(!team2.includes(name)) team2.push(name); } updateTeamsUI(); renderList(); drawWheel(currentRotation); recalcSpin(); }); }
}

function spin(){
  ensureAudio();
  if(spinning) return; const active=names.filter(n=>selected[n]);
  const list=active.length?active:names; if(!list.length) return;
  spinning=true; spinBtn.disabled=true;
  const n=list.length, seg=2*Math.PI/n;
  const targetIndex=randomInt(n);
  const finalRot=(3*Math.PI/2) - (targetIndex*seg + seg/2);
  const extraTurns=6*Math.PI; // 3 full spins
  const start=currentRotation; const end=finalRot+extraTurns;
  const duration=2800+Math.random()*600; const t0=performance.now();
  function easeOutCubic(x){return 1-Math.pow(1-x,3)}
  lastTickIndex=null;
  function frame(now){
    const t=Math.min(1,(now-t0)/duration); const eased=easeOutCubic(t);
    currentRotation=start+(end-start)*eased; drawWheel(currentRotation);
    // compute current index under pointer (top at 3pi/2)
    const norm=((3*Math.PI/2 - currentRotation)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
    const idx=Math.floor(norm/seg);
    if(lastTickIndex===null){ lastTickIndex=idx; }
    if(idx!==lastTickIndex){ lastTickIndex=idx; playTick(); }
    if(t<1) requestAnimationFrame(frame); else {
      currentRotation=end%(2*Math.PI);
      const winner=list[targetIndex];
      // remove from names and selection
      names=names.filter(x=>x!==winner);
      delete selected[winner];
      // assign to alternating teams
      if(teamTurn===1){ team1.push(winner); teamTurn=2; }
      else { team2.push(winner); teamTurn=1; }
      updateTeamsUI();
      renderList();
      spinning=false; spinBtn.disabled=false;
      // disable if nothing left
      const anyLeft=names.filter(n=>selected[n]).length || names.length;
      if(!anyLeft){ spinBtn.disabled=true; }
    }
  }
  requestAnimationFrame(frame);
}

addBtn.addEventListener('click',()=>{
  const v=nameInput.value.trim(); if(!v) return; if(names.includes(v)) {nameInput.value='';return;}
  names.push(v); selected[v]=true; nameInput.value=''; renderList(); drawWheel(currentRotation);
  spinBtn.disabled=false;
});
nameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ addBtn.click(); }});
spinBtn.addEventListener('click',spin);

function resetTeams(){
  // move everyone from teams back to pool, mark selected and clear teams
  const back=[...team1, ...team2];
  back.forEach(n=>{ if(!names.includes(n)) { names.push(n); } selected[n]=true; });
  team1.length=0; team2.length=0; teamTurn=1;
  updateTeamsUI(); renderList(); drawWheel(currentRotation);
  spinBtn.disabled = names.length===0 ? true : false;
}

if(resetBtn){ resetBtn.addEventListener('click', resetTeams); }

drawWheel(0); renderList(); updateTeamsUI(); setupDnDTargets();
// redraw after webfont loads to avoid initial fallback font render
try{
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{ drawWheel(currentRotation); });
    // try an explicit load to nudge rendering engines
    document.fonts.load('600 24px Poppins').then(()=>{ drawWheel(currentRotation); });
  } else {
    // fallback: slight delay redraw
    setTimeout(()=>drawWheel(currentRotation), 150);
  }
}catch{ /* noop */ }
if(!(names.length)) spinBtn.disabled=true;
