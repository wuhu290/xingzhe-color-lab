(()=>{
'use strict';
const icon=n=>`<img class="md-icon" src="色彩实验室_assets/icons/${n}.svg" alt="">`;
const bases=[['红色','#ee5871'],['橙色','#f69b3d'],['黄色','#f8d33e'],['绿色','#63b479'],['青色','#42b5be'],['蓝色','#498de2'],['紫色','#9c6fc9'],['粉色','#e783b1'],['棕色','#a57454']];
const primaries=[bases[0],bases[2],bases[5]];
const targets=[{name:'橙色',color:'#f69b3d',recipe:[1,1,0]}, {name:'绿色',color:'#63b479',recipe:[0,1,1]}, {name:'紫色',color:'#9c6fc9',recipe:[1,0,1]}, {name:'偏黄的橙色',color:'#f7b73e',recipe:[1,2,0]}, {name:'偏红的橙色',color:'#f27657',recipe:[2,1,0]}, {name:'偏蓝的紫色',color:'#737ed6',recipe:[1,0,2]}];
const assignedTargets=[targets[0],targets[1],targets[2],{name:'偏红的橙色',color:'#f77e5c',recipe:[2,1,0]},{name:'偏黄的橙色',color:'#f9b344',recipe:[1,2,0]}];
function shuffle(a){const out=a.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
let instance=null,practice=false,practiceIndex=0,errors=0,practiceDeck=[...shuffle(targets.slice(0,3)),...shuffle(targets.slice(3))];
const requestedTool=new URLSearchParams(location.search).get('tool');
const versions={mix:requestedTool==='mix'?'1':'2',light:requestedTool==='light'?'1':'2'};
if(requestedTool==='mix2')mode='mix';if(requestedTool==='light2')mode='light';
document.body.classList.add('dual-color-tools');
for(const kind of ['mix','light']){
 const original=document.querySelector(`.toolnav [data-switch="${kind}"]`),second=original.cloneNode(true);
 original.dataset.version='1';original.textContent=(kind==='mix'?'三原色':'明度')+'1';original.setAttribute('title','画笔调色');
 second.dataset.version='2';second.textContent=(kind==='mix'?'三原色':'明度')+'2';second.setAttribute('title','色块混色');original.after(second);
 for(const b of [original,second])b.onclick=()=>{mode=kind;versions[kind]=b.dataset.version;practice=false;const q=new URLSearchParams(location.search);q.set('tool',kind+(b.dataset.version==='2'?'2':''));q.delete('lightPractice');history.replaceState(null,'',location.pathname+'?'+q.toString());render();};
}
const rgb=h=>h.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16));
const css=c=>`rgb(${c.map(n=>Math.round(n)).join(',')})`;
const lerp=(a,b,t)=>a.map((n,i)=>n+(b[i]-n)*t);
const lightness=c=>c.reduce((n,v,i)=>n+[.2126,.7152,.0722][i]*((v/255<=.04045)?v/255/12.92:Math.pow((v/255+.055)/1.055,2.4)),0);
function pigmentMix(amount){
 const sum=amount.reduce((a,b)=>a+b,0);if(!sum)return [250,251,255];
 const w=amount.map(n=>n/sum),m=Math.min(...w),rem=w.map(n=>n-m),ids=[0,1,2].sort((a,b)=>rem[b]-rem[a]);
 if(1-3*m<.0001)return [142,128,106];
 const x=ids[0],y=ids[1],t=rem[y]/Math.max(.0001,rem[x]+rem[y]);
 const pair={'01':rgb(bases[1][1]),'02':rgb(bases[6][1]),'12':rgb(bases[3][1])};
 return lerp(lerp(rgb(primaries[x][1]),pair[[x,y].sort().join('')],Math.min(1,t*2)),[142,128,106],3*m);
}
function makeDesk(){
 const light=mode==='light',a=window.colorAssignment,assigned=a?.tool===mode;
 const holder=document.querySelector('#toy');if(!holder)return;
 const baseIndex=light?(assigned?(a.baseIndex??5):5):0;
 const initial=light?[1,0,0]:[0,0,0];let amount=initial.slice(),base=baseIndex,current=light?rgb(bases[base][1]):[250,251,255],alive=true;const busy=false;
 const dragCleanups=new Map();
 const history=[],saved=[];
 const data=()=>light?[bases[base],['白色','#ffffff'],['黑色','#252738']]:primaries;
 const title=light?'明度2 · 色块混色':'三原色2 · 色块混色';
 const activeTarget=assigned&&mode==='mix'?assignedTargets[(a.target||0)%assignedTargets.length]:practice?practiceDeck[practiceIndex%practiceDeck.length]:null;
 const currentGoal=activeTarget?(assigned?`老师指定 · 调出${activeTarget.name}`:`第 ${practiceIndex+1} / 6 次探索 · 调出${activeTarget.name}`):'';
 holder.innerHTML=`<section class="mixdesk" aria-label="${title}">
  <div class="md-head"><div><div class="md-title">${title}</div><p>${light?'同一种颜色，加入白色或黑色，观察深浅变化。':'把红、黄、蓝放在一起，观察颜色怎样变化。'}</p></div><button class="md-quiet" id="md-practice">${icon('graduation-cap')}${practice?'返回调色台':'课堂练习'}</button></div>
  <div class="md-grid"><div class="md-workspace">
   ${light?`<label class="md-base-row"><span>选择底色</span><i class="md-base-dot" style="--base:${bases[base][1]}"></i><select id="md-base" aria-label="选择明度底色">${bases.map((b,i)=>`<option value="${i}" ${base===i?'selected':''}>${b[0]}</option>`).join('')}</select><span>只改变深浅</span></label>`:''}
   <div class="md-well" id="md-well" aria-label="混色区，可将颜色拖入这里">
    <canvas id="paper" width="600" height="600" aria-label="圆形实时颜料混色区"></canvas>
    <div class="md-tokens" id="md-tokens" role="group" aria-label="投入的颜色，点击或拖出可减少"></div>
    <span class="md-result" id="md-result" hidden><i></i><span></span></span>
    <div class="md-actions-inline"><button id="md-undo" disabled aria-label="撤销一次操作">${icon('undo-2')}撤销</button><button id="md-reset" aria-label="重新开始调色">${icon('rotate-ccw')}重来</button></div>
    <div class="md-well-empty" id="md-empty">颜色会在这里相遇<small>点一下颜料，也可以拖进来</small></div>
    <div class="md-well-caption" id="md-caption">原色色块会保留，点一下或拖出可拿走一份</div>
   </div>
   <div class="md-ratio" id="md-ratio" aria-label="颜料用量比例"></div>
   <div class="md-source-row" id="md-sources"></div>
   <div class="md-instruction"><span>点颜色加一份，点减号拿走一份</span><span id="md-total"></span></div>
   <div class="md-status dip-state" id="md-status" role="status" aria-live="polite"></div>
  </div><aside class="md-side">
   <div><small>${activeTarget?'观察目标':'观察颜色'}</small><h3>${activeTarget?activeTarget.name:light?'同色，不同深浅':'你会调出什么颜色？'}</h3></div>
   ${activeTarget?`<div><div class="md-big-color" style="--result:${activeTarget.color}"><span style="color:white">目标色</span></div><p class="md-recipe">${practiceIndex<3&&!assigned?'试试两种原色。':'颜色接近即可，试着调整用量。'}</p><p class="md-practice-caption">${currentGoal}</p></div>`:light?`<div><div class="md-compare"><div><i id="md-original" style="--color:${bases[base][1]}"></i><span>原来的颜色</span></div><div><i id="md-now" style="--color:${bases[base][1]}"></i><span>现在的颜色</span></div></div><p class="md-recipe" id="md-recipe"></p><div class="md-light-label" id="md-light-scale"></div><div class="md-level-label"><span>深</span><span>浅</span></div></div>`:`<div><div class="md-big-color" id="md-preview"><span id="md-color-name">等待你的第一种颜色</span></div><p class="md-recipe" id="md-recipe">放入两种原色，试着调出间色。</p></div>`}
   ${activeTarget?'<div><div class="md-saved-head"><span>我的颜色</span></div><div class="md-big-color md-current" id="md-current"><span>先放入颜料</span></div><p class="md-recipe" id="md-recipe"></p></div>':assigned?'':`<div><div class="md-saved-head"><span>${light?'我的明度色阶':'我的调色发现'}</span><small id="md-saved-count">0 / 5</small></div><div class="md-saved" id="md-saved"><div class="md-saved-empty">${light?'留住几个深浅，比一比':'把喜欢的颜色留在这里'}</div></div></div>`}
   <div class="md-side-actions"><button class="md-primary" id="md-save" disabled>${icon(activeTarget?'check':assigned?'arrow-right':'bookmark')}<span>${activeTarget?'看看调得怎么样':assigned?'完成并提交':light?'留住这个深浅':'留住这个颜色'}</span></button><p class="md-side-hint">${assigned?'完成后进入下一题，老师可查看过程记录。':activeTarget?'每次完成后，自动进入下一次探索。':'点击留下的色卡，可以重新调出它。'}</p></div>
  </aside></div>
  <div class="md-footer"><span>${light?'加白，明度提高；加黑，明度降低。':'红 ＋ 黄 → 橙　　黄 ＋ 蓝 → 绿　　红 ＋ 蓝 → 紫'}</span><button id="md-more">教学混色示意</button></div>
  <span class="target-chip" hidden></span>
 </section>`;
 const $m=s=>holder.querySelector(s),canvas=$m('#paper'),ctx=canvas.getContext('2d'),well=$m('#md-well');
 if(light)$m('.md-head').insertBefore($m('.md-base-row'),$m('#md-practice'));
 function mixed(){if(!light)return pigmentMix(amount);const total=amount.reduce((a,b)=>a+b,0);if(!total)return [250,251,255];const p=data().map(x=>rgb(x[1]));return [0,1,2].map(i=>p.reduce((s,c,j)=>s+c[i]*amount[j],0)/total);}
 function colorName(){if(!amount.some(Boolean))return '';if(light){if(!amount[0])return amount[1]&&amount[2]?'灰色':amount[1]?'白色':'黑色';const diff=lightness(current)-lightness(rgb(bases[base][1]));return Math.abs(diff)<.005?bases[base][0]:diff>0?'更浅的'+bases[base][0]:'更深的'+bases[base][0];}const ranked=[0,1,2].sort((a,b)=>amount[b]-amount[a]);if(amount.every(n=>!n))return '';if(!amount[ranked[1]])return primaries[ranked[0]][0];if(amount[ranked[2]])return '三种原色的混合';const names={'01':'橙色','02':'紫色','12':'绿色'};return (amount[ranked[0]]>amount[ranked[1]]*1.35?'偏'+primaries[ranked[0]][0][0]+'的':'')+names[ranked.slice(0,2).sort().join('')];}
 function draw(){ctx.fillStyle=amount.some(Boolean)?css(current):'#ffffff';ctx.fillRect(0,0,600,600);}
 function publish(){const state={amount:amount.slice(),blend:busy?0:1,color:css(current)};if(light)window.valueMixState=state;else window.colorMixState=state;window.colorDeskState={...state,tool:mode,baseIndex:base,saved:saved.length,history:history.length};}
 function recipe(){return amount.map((n,i)=>n?data()[i][0]+' '+n+' 份':'').filter(Boolean).join(' · ');}
 function sync(){
  const has=amount.some(Boolean),can=has;
  $m('#md-empty').hidden=has;$m('#md-result').hidden=!has;$m('#md-result').style.setProperty('--result',css(current));$m('#md-result span').textContent=colorName();
  $m('#md-undo').disabled=!history.length;$m('#md-save').disabled=busy||!can;$m('#md-total').textContent=has?'共 '+amount.reduce((a,b)=>a+b,0)+' 份':'';
  $m('#md-ratio').innerHTML=amount.map((n,i)=>`<span style="background:${data()[i][1]};flex:${n};${n===0?'display:none;':''}${i===1&&light?'border:1px solid #e5e9f4;':''}" title="${data()[i][0]} ${n} 份"></span>`).join('');
  $m('#md-sources').querySelectorAll('[data-count]').forEach(e=>{e.textContent=amount[+e.dataset.count]+' 份'});
  $m('#md-sources').querySelectorAll('[data-less]').forEach(e=>{e.disabled=!amount[+e.dataset.less];});
  if(light){$m('#md-now').style.setProperty('--color',has?css(current):'#f6f7fc');$m('#md-now').nextElementSibling.textContent=has?'现在的颜色':'还没有加入颜色';$m('#md-recipe').textContent=recipe();$m('#md-light-scale').style.background=`linear-gradient(90deg,${css(lerp(rgb(bases[base][1]),[37,39,56],.7))},${bases[base][1]},${css(lerp(rgb(bases[base][1]),[255,255,255],.85))})`;}
  else if(!activeTarget){$m('#md-preview').style.setProperty('--result',has?css(current):'#f6f7fc');$m('#md-preview').style.setProperty('--ink',lightness(current)>.48?'#526079':'#fff');$m('#md-color-name').textContent=has?colorName():'等待你的第一种颜色';$m('#md-recipe').textContent=has?recipe():'放入两种原色，试着调出间色。';}
  if(activeTarget){$m('#md-current').style.setProperty('--result',has?css(current):'#f6f7fc');$m('#md-current').style.setProperty('--ink',has?(lightness(current)>.48?'#526079':'#fff'):'#9aa4b8');$m('#md-current span').textContent=has?colorName():'先放入颜料';$m('#md-recipe').textContent=recipe();}
  tokens();
  publish();
 }
 function announce(text){$m('#md-status').textContent=text;}
 function updateMix(){
  const started=performance.now();current=mixed();sync();draw();announce(amount.some(Boolean)?`${recipe()}，调出了${colorName()}。`:'点一下颜料，让颜色在这里相遇。');
  const elapsed=performance.now()-started;holder.dataset.updateMs=elapsed.toFixed(2);holder.dataset.maxUpdateMs=Math.max(+(holder.dataset.maxUpdateMs||0),elapsed).toFixed(2);
 }
 function change(index,delta){if(!alive)return;if(delta<0&&!amount[index])return;if(amount[index]+delta>12){announce('这种颜料已有 12 份，可以减少一些再比较。');return;}history.push({amount:amount.slice(),base});amount[index]+=delta;updateMix(delta>0?index:-1);}
 function bindDrag(button,index,inside){
  let start=null,ghost=null,moved=false,bounds=null,point=null,paintFrame=0,lastOver=null;
  const caption=$m('#md-caption');
  function over(p){return Math.hypot((p.x-bounds.left-bounds.width/2)/(bounds.width/2),(p.y-bounds.top-bounds.height/2)/(bounds.height/2))<=1;}
  function paint(){
   paintFrame=0;if(!start||!point)return;
   if(!ghost){ghost=document.createElement('div');ghost.className='md-ghost';ghost.style.setProperty('--color',data()[index][1]);document.body.append(ghost);}
   ghost.style.transform=`translate3d(${point.x-26}px,${point.y-26}px,0)`;
   const hit=over(point);if(hit!==lastOver){lastOver=hit;well.classList.toggle('over',hit&&!inside);caption.textContent=inside?(hit?'拖出圆形区，可以拿走一份':'松开，拿走一份'+data()[index][0]):hit?'松开，加入一份'+data()[index][0]:'拖到圆形混色区，松手加入';}
  }
  function cleanup(){cancelAnimationFrame(paintFrame);paintFrame=0;ghost?.remove();ghost=null;start=null;lastOver=null;well.classList.remove('over');caption.textContent='原色色块会保留，点一下或拖出可拿走一份';}
  button.onpointerdown=e=>{if(e.button!==0||!alive)return;start={x:e.clientX,y:e.clientY};bounds=canvas.getBoundingClientRect();moved=false;point=start;button.setPointerCapture(e.pointerId);};
  button.onpointermove=e=>{if(!start)return;point={x:e.clientX,y:e.clientY};if(Math.hypot(point.x-start.x,point.y-start.y)>7)moved=true;if(!moved)return;e.preventDefault();if(!paintFrame)paintFrame=requestAnimationFrame(paint);};
  button.onpointerup=e=>{if(!start)return;const dropped=over({x:e.clientX,y:e.clientY}),commit=moved&&(inside?!dropped:dropped);cleanup();if(commit)change(index,inside?-1:1);};
  button.onpointercancel=cleanup;button.onlostpointercapture=cleanup;
  button.onclick=()=>{if(moved){moved=false;return;}change(index,inside?-1:1);};
  dragCleanups.set(button,cleanup);
 }
 function tokens(){
  const container=$m('#md-tokens');container.querySelectorAll('[data-token]').forEach(b=>{dragCleanups.get(b)?.();dragCleanups.delete(b)});container.innerHTML=amount.map((n,i)=>n?`<button class="md-token" data-token="${i}" style="--color:${data()[i][1]};--token-ink:${lightness(rgb(data()[i][1]))>.42?'#38415b':'#fff'}" aria-label="${data()[i][0]}，${n}份，点击或拖出减少一份" title="点击或拖出，拿走一份"><b>${data()[i][0]}</b><small>${n} 份</small></button>`:'').join('');
  container.querySelectorAll('[data-token]').forEach(b=>bindDrag(b,+b.dataset.token,true));
 }
 function sources(){
  $m('#md-sources').querySelectorAll('[data-add]').forEach(b=>{dragCleanups.get(b)?.();dragCleanups.delete(b)});
  $m('#md-sources').innerHTML=data().map(([name,color],i)=>`<div class="md-source"><button class="md-add" data-add="${i}" aria-label="加入一份${name}"><span class="md-color" style="--color:${color}">${icon('plus')}</span><span><b>${light&&i===0?'底色':name}</b><small data-count="${i}">${amount[i]} 份</small></span></button><button class="md-remove" data-less="${i}" aria-label="减少一份${name}">${icon('minus')}</button></div>`).join('');
  $m('#md-sources').querySelectorAll('[data-less]').forEach(b=>b.onclick=()=>change(+b.dataset.less,-1));
  $m('#md-sources').querySelectorAll('[data-add]').forEach(b=>bindDrag(b,+b.dataset.add,false));
 }
 function savedUI(){const el=$m('#md-saved');el.innerHTML=saved.map((s,i)=>`<button data-recall="${i}" style="--color:${s.color}" aria-label="重现色卡${i+1}：${s.recipe}" title="${s.recipe}"></button>`).join('')||`<div class="md-saved-empty">${light?'留住几个深浅，比一比':'把喜欢的颜色留在这里'}</div>`;$m('#md-saved-count').textContent=saved.length+' / 5';el.querySelectorAll('[data-recall]').forEach(b=>b.onclick=()=>{const s=saved[+b.dataset.recall];history.push({amount:amount.slice(),base});base=s.base;amount=s.amount.slice();if(light){$m('#md-base').value=base;$m('.md-base-dot').style.setProperty('--base',bases[base][1]);$m('#md-original').style.setProperty('--color',bases[base][1]);sources();}updateMix(-1);});}
 function save(){if(busy||!amount.some(Boolean))return;const color=css(current);if(saved.some(s=>s.color===color)){announce('这个颜色已经留下了，再调整一点试试。');return;}if(saved.length===5)saved.shift();saved.push({amount:amount.slice(),base,color,recipe:recipe()});savedUI();announce('已留下第 '+saved.length+' 个颜色。点色卡可以重新调出它。');}
 $m('#md-save').onclick=()=>{
  if(busy)return;
  if(activeTarget){
   const target=assigned?[['#fa9e3e','#65bb87','#9f70c9','#f77e5c','#f9b344'][a.target||0]]:[activeTarget.color];const diff=Math.hypot(...current.map((v,i)=>v-rgb(target[0])[i]));
   if(diff>(assigned?[48,36,28][a.level||0]:practiceIndex<3?40:26)||amount.filter(Boolean).length<2){errors++;window.reportColorAttempt?.(false,'原色调和结果与目标色不同');feedback(false,'再试一试，快接近了',amount[2]&&((a?.target||practiceIndex)%5===0)?'看看目标色偏橙，可以少放一些蓝色。':'比较目标色，再增加或减少一种颜料。');return;}
   if(assigned){Promise.resolve(window.submitColorAssignment?.({amount:amount.slice(),color:css(current),snapshot:canvas.toDataURL('image/png')})).then(()=>feedback(true,'调出来啦！','这次调色已经记录。',()=>{}));return;}
   const finished=practiceIndex===5;feedback(true,finished?'六次调色，完成啦！':'调出来啦，观察真仔细！',finished?`完成 6 次探索，调整尝试 ${errors} 次。`:'准备试试下一种颜色。',()=>{if(finished){practice=false;practiceIndex=0;errors=0;}else practiceIndex++;render();});
  }else if(assigned){Promise.resolve(window.submitColorAssignment?.({surface:'color-manipulative',amount:amount.slice(),blend:1,color:css(current),baseIndex:base,snapshot:canvas.toDataURL('image/png')})).then(()=>feedback(true,'你的发现已记录！','继续观察下一种颜色的深浅变化。',()=>{}));}
  else save();
 };
 $m('#md-undo').onclick=()=>{const last=history.pop();if(!last)return;base=last.base;amount=last.amount;updateMix(-1)};
 $m('#md-reset').onclick=()=>{history.push({amount:amount.slice(),base});amount=initial.slice();updateMix(-1);};
 $m('#md-more').onclick=()=>feedback(false,'关于颜料混色','这里演示颜料的混色关系。真实颜料的品种、透明度与用量会影响结果，屏幕颜色是教学示意。');
 $m('#md-practice').hidden=assigned;
 $m('#md-practice').onclick=()=>{if(light){location.href=location.pathname+'?v=64&tool=light2&lightPractice=1';return;}practice=!practice;practiceIndex=0;errors=0;practiceDeck=[...shuffle(targets.slice(0,3)),...shuffle(targets.slice(3))];render();};
 if(light){$m('#md-base').onchange=e=>{base=+e.target.value;history.length=0;amount=initial.slice();$m('.md-base-dot').style.setProperty('--base',bases[base][1]);$m('#md-original').style.setProperty('--color',bases[base][1]);sources();updateMix(-1);};}
 sources();sync();draw();announce(light?'底色已放好，点白色变浅，点黑色变深。':'点一种颜色，或把它拖到混色区。');
 if(assigned&&a.requirement)announce(a.requirement);
 document.querySelector('#finish').hidden=true;document.querySelector('#again').hidden=true;document.querySelector('#round').textContent=assigned?'老师指定任务':practice?'课堂练习':'自由调色';
 return {destroy(){alive=false;dragCleanups.forEach(fn=>fn());dragCleanups.clear();document.querySelectorAll('.md-ghost').forEach(n=>n.remove())}};
}
function feedback(success,title,body,after){
 const dialog=document.createElement('dialog');dialog.className='md-feedback'+(success?' success':'');dialog.innerHTML=`<div class="md-feedback-icon">${icon(success?'check':'rotate-ccw')}</div><h3></h3><p></p>${success&&after?'':'<button class="md-primary">'+(title==='关于颜料混色'?'知道了':'再试试看')+'</button>'}`;dialog.querySelector('h3').textContent=title;dialog.querySelector('p').textContent=body;document.body.append(dialog);let timer;const close=()=>{clearTimeout(timer);dialog.close();dialog.remove();after?.()};dialog.querySelector('button')?.addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close()});dialog.showModal();if(success&&after)timer=setTimeout(close,1250);
}
const before=render;
render=function(){
 instance?.destroy();instance=null;before();const a=window.colorAssignment,q=new URLSearchParams(location.search);
 if(a&&['mix','light'].includes(mode)){try{const key='color-desk-version-'+(a.parentId||a.id),saved=localStorage.getItem(key);if(saved)versions[mode]=saved;else localStorage.setItem(key,versions[mode]);}catch{}}
 const active=versions[mode]==='2'&&(mode==='mix'||mode==='light'&&(a?.tool==='light'?a.play==='valueLab':!q.has('lightPractice')));
 document.body.classList.toggle('mixer-active',active);
 document.querySelectorAll('.toolnav [data-version]').forEach(b=>b.classList.toggle('active',b.dataset.switch===mode&&b.dataset.version===versions[mode]));
 if(active){document.body.classList.remove('brightness-active');if(!document.querySelector('.as-student-summary'))instance=makeDesk();document.querySelector('#stage').scrollTop=0;}
 if(mode==='light'&&versions.light==='2'&&q.has('lightPractice')){const back=document.querySelector('.bl-back');if(back)back.onclick=()=>location.href=location.pathname+'?v=64&tool=light2';}
 if(mode!=='mix')practice=false;
};
render();
})();
