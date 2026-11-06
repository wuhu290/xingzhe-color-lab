/* Contextual review documentation. Does not change gameplay or assignment data. */
(()=>{'use strict';
const assetRoot=new URL('.',document.currentScript.src), STORE='color-lab-guide-edits-v3';
let original,config,pageKey='mix',opened=false,editing=false,markers=false,pinned=false,focusReturn,updateTimer;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=document.createElement('button');button.id='pg-trigger';button.textContent='原型说明';button.title='查看当前工具的操作规则与原型边界';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
const layer=document.createElement('div');layer.id='pg-layer';layer.hidden=true;
layer.innerHTML='<div class="pg-backdrop"></div><aside class="pg-drawer" role="dialog" aria-modal="true" aria-labelledby="pg-title" tabindex="-1"><header><div><span class="pg-eyebrow">色彩实验 · 产品原型</span><h2 id="pg-title">原型说明</h2></div><button id="pg-close" aria-label="关闭原型说明">×</button></header><div class="pg-context"><label for="pg-page">说明页面</label><select id="pg-page"></select><button id="pg-follow">跟随当前页</button></div><div class="pg-tools"><button id="pg-markers">显示标号</button><button id="pg-edit">编辑</button><button id="pg-reset">重置说明</button><button id="pg-export">导出 JSON</button></div><p id="pg-notice" role="status"></p><main id="pg-content"></main><footer>说明用于产品评审与开发交接 · 不影响学生操作及任务记录<br>编辑仅在本标签页会话内保存；导出后可交接，不会同步修改线上说明。</footer></aside>';
const badges=document.createElement('div');badges.id='pg-badges';badges.hidden=true;document.body.append(button,layer,badges);
const $=s=>layer.querySelector(s);
function current(){
 const a=document.querySelector('.assignment-overlay');if(a){if(a.querySelector('#assign-launch'))return'teacher';if(a.querySelector('#as-export')||a.querySelector('.as-student-summary'))return'feedback';}
 if(document.querySelector('.as-student-summary'))return'feedback';
 let kind;try{kind=typeof mode!=='undefined'?mode:null}catch{}
 kind=kind||new URLSearchParams(location.search).get('tool')||'mix';
 const v=document.querySelector('.toolnav [data-switch="'+kind+'"][data-version].active');
 if(v?.dataset.version==='2')kind+='2';
 const round=document.querySelector('#round')?.textContent||'';
 const desk=document.querySelector('#md-well');
 if(!desk&&(/课堂练习|随机任务/.test(round)||(kind==='hue'&&!document.body.classList.contains('hue-studio-active'))||(kind==='light'&&!document.body.classList.contains('brightness-active'))||(kind==='chroma'&&!document.querySelector('#purity-lab-canvas'))||(['analog','contrast'].includes(kind)&&!document.querySelector('#pl-picture'))))return'practice';
 return config?.pages[kind]?kind:'mix';
}
function render(){
 if(!config)return;const p=config.pages[pageKey];$('#pg-title').textContent=p.title;
 $('#pg-page').innerHTML=Object.entries(config.pages).map(([k,v])=>`<option value="${k}" ${k===pageKey?'selected':''}>${escape(v.title)}</option>`).join('');
 $('#pg-follow').hidden=!pinned;$('#pg-edit').textContent=editing?'完成编辑':'编辑';$('#pg-markers').textContent=markers?'隐藏标号':'显示标号';
 $('#pg-notice').textContent=editing?'编辑仅保留于本标签页。完成后请导出 JSON 交接。':pinned?'正在查看指定说明；点击“跟随当前页”返回自动切换。':'说明随当前工具切换。编号仅显示在当前可见、已实现的界面元素旁。';
 const field=(s,path,tag='p')=>`<${tag}${editing?` contenteditable="true" data-field="${path}" role="textbox" aria-label="编辑说明"`:''}>${escape(s)}</${tag}>`;
 const list=(arr,key)=>'<ul>'+arr.map((s,i)=>field(s,key+'.'+i,'li')).join('')+'</ul>';
 $('#pg-content').innerHTML=`<div class="pg-meta"><code>${escape(p.pageId)}</code><span>${escape(p.targetRoles.join(' / '))}</span></div><section><h3>01 业务目标</h3>${field(p.businessGoal,'businessGoal')}</section><section><h3>02 核心流程</h3><ol>${p.coreWorkflow.map((s,i)=>field(s,'coreWorkflow.'+i,'li')).join('')}</ol></section><section><h3>03 页面功能</h3><div class="pg-features">${p.features.map((f,i)=>`<article><button class="pg-number" data-locate="${i}" aria-label="定位${escape(f.title)}">${f.number}</button><div>${field(f.title,'features.'+i+'.title','h4')}${field(f.description,'features.'+i+'.description')}<button class="pg-locate" data-locate="${i}">定位界面元素 ↗</button></div></article>`).join('')}</div></section><section><h3>04 关键规则</h3>${list(p.keyRules,'keyRules')}</section><section class="pg-boundaries"><h3>05 原型范围与边界</h3>${list(p.prototypeBoundaries,'prototypeBoundaries')}</section>`;
 $('#pg-content').querySelectorAll('[data-locate]').forEach(b=>{const f=p.features[+b.dataset.locate];b.disabled=!target(f);b.title=b.disabled?'当前页面未展示此元素，进入对应工具或操作状态后可定位':'';b.onclick=()=>locate(f)});
 $('#pg-content').querySelectorAll('[data-field]').forEach(el=>el.onblur=()=>{const path=el.dataset.field.split('.');let obj=config.pages[pageKey];while(path.length>1)obj=obj[path.shift()];obj[path[0]]=el.textContent.trim();persist()});
 paintBadges();
}
function persist(){try{sessionStorage.setItem(STORE,JSON.stringify(config))}catch{$('#pg-notice').textContent='本地保存失败，请导出说明保留修改。'}}
function target(f){if(!f?.selector)return null;return [...document.querySelectorAll(f.selector)].find(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'})||null;}
function locate(f){const el=target(f);if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('pg-highlight');setTimeout(()=>el.classList.remove('pg-highlight'),1800);if(innerWidth<1000)setOpen(false);else{layer.classList.add('pg-peek');setTimeout(()=>layer.classList.remove('pg-peek'),1800)}setTimeout(paintBadges,400)}
function paintBadges(){badges.replaceChildren();badges.hidden=!markers;if(!markers||!config)return;config.pages[pageKey].features.forEach(f=>{const el=target(f);if(!el)return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const b=document.createElement('button');b.textContent=f.number;b.title=f.title;b.setAttribute('aria-label','查看说明：'+f.title);b.style.left=Math.max(4,Math.min(innerWidth-34,r.left+6))+'px';b.style.top=Math.max(4,r.top+6)+'px';b.onclick=()=>{setOpen(true);const row=$('[data-locate="'+(f.number-1)+'"]');row?.closest('article')?.scrollIntoView({block:'center',behavior:'smooth'})};badges.append(b)})}
function setOpen(value){opened=value;layer.hidden=!value;button.setAttribute('aria-expanded',String(value));if(value){focusReturn=document.activeElement;if(!pinned)pageKey=current();render();$('#pg-close').focus()}else{editing=false;focusReturn?.focus?.()} }
button.onclick=()=>setOpen(!opened);$('#pg-close').onclick=()=>setOpen(false);$('.pg-backdrop').onclick=()=>setOpen(false);
$('#pg-page').onchange=e=>{pageKey=e.target.value;pinned=true;editing=false;render()};$('#pg-follow').onclick=()=>{pinned=false;pageKey=current();editing=false;render()};$('#pg-markers').onclick=()=>{markers=!markers;render()};$('#pg-edit').onclick=()=>{editing=!editing;render()};
$('#pg-reset').onclick=()=>{config.pages[pageKey]=structuredClone(original.pages[pageKey]);persist();editing=false;render();$('#pg-notice').textContent='已恢复本页默认说明；工具及任务记录未改变。'};
$('#pg-export').onclick=()=>{document.activeElement?.blur();const blob=new Blob([JSON.stringify(config,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='色彩实验_原型说明.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#pg-notice').textContent='已生成完整说明 JSON 下载。'};
layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}if(e.key==='Tab'){const els=[...layer.querySelectorAll('button:not(:disabled):not([hidden]),select,[contenteditable="true"]')].filter(e=>e.getClientRects().length),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function refresh(){clearTimeout(updateTimer);updateTimer=setTimeout(()=>{if(!config||pinned)return;const key=current();if(key!==pageKey){pageKey=key;editing=false;if(opened)render();else paintBadges()}else if(markers)paintBadges()},180)}
const observer=new MutationObserver(m=>{if(m.some(x=>!x.target.closest?.('#pg-layer,#pg-badges,#pg-trigger')))refresh()});observer.observe(document.body,{childList:true,subtree:true});
addEventListener('scroll',()=>{if(markers)paintBadges()},true);addEventListener('resize',paintBadges);
fetch(new URL('prototype-guide.json?v=68',assetRoot)).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{original=data;config=structuredClone(data);try{const saved=JSON.parse(sessionStorage.getItem(STORE)||'null');if(saved?.schemaVersion===1&&saved.pages?.mix2)config=saved}catch{}pageKey=current();button.disabled=false}).catch(()=>{button.textContent='说明加载失败 · 重试';button.onclick=()=>location.reload()});button.disabled=true;
})();
