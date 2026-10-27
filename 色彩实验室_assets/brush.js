/* V8: visible pigment controls and a simpler, polished painting workspace. */
let brushPoint=null,brushDown=false,brushPrevious=null,brushPhase=0,brushPigment=null;
// The tip follows the pigment actually picked up, then the visible mixing progress.
function brushTipColor(){
 const clean='#ccb49c',c=newMixColor();
 if(!c.total)return clean;
 const source=Number.isInteger(brushPigment)&&inkAmounts[brushPigment]>0?basePaints[brushPigment]:clean;
 const progress=Math.max(0,Math.min(1,blend));
 if(progress===0)return source;
 if(progress===1)return c.color;
 const rgb=source.slice(1).match(/../g).map(v=>parseInt(v,16));
 return `rgb(${rgb.map((v,i)=>Math.round(v+(c.rgb[i]-v)*progress)).join(',')})`;
}
const brushPourPrior=pour;
pour=function(i,amount){if(amount>0){brushPigment=i;brushDown=false;brushPoint=null;brushPrevious=null}brushPourPrior(i,amount)};
const brushTierPrior=applyTier;
applyTier=function(t){if(mode==='mix'){brushPigment=null;brushDown=false;brushPoint=null;brushPrevious=null}brushTierPrior(t)};
Object.assign(toolsData.mix,{small:'画笔调色',title:'用画笔，让颜色相遇',desc:'选一选，涂一涂，发现新的颜色。',hint:'轻轻带过时，能看见原来的颜色；多涂几笔，它们会慢慢变成一抹新的颜色。',chapter:'01 / 画笔调色室',note:'红黄蓝混色教学示意 · 可自由调整用量',dock:'每一笔，都能发现新颜色',docksub:'按住蘸色，在纸上涂开，收下你喜欢的一抹。'});
function brushSVG(color='#d9af66'){return `<svg viewBox="0 0 90 220" aria-hidden="true"><defs><linearGradient id="brushWood" x1="0" x2="1"><stop stop-color="#536bd8"/><stop offset=".36" stop-color="#9cabff"/><stop offset=".6" stop-color="#7e8feb"/><stop offset="1" stop-color="#5268cb"/></linearGradient><linearGradient id="brushMetal" x1="0" x2="1"><stop stop-color="#b2b2b3"/><stop offset=".32" stop-color="#efefee"/><stop offset=".65" stop-color="#d3d1ce"/><stop offset="1" stop-color="#a5a6a5"/></linearGradient></defs><path d="M37 139Q35 90 40 16Q44 0 49 16Q55 90 53 139Z" fill="url(#brushWood)"/><path d="M35 131H55L58 169H32Z" fill="url(#brushMetal)"/><path d="M35 140H55M34 155H56" stroke="#9a989640"/><path d="M32 168H58L62 203Q47 214 28 205Z" fill="#d7bd9c"/><path d="M30 188Q44 194 60 188L62 203Q47 214 28 205Z" fill="${color}"/><g stroke="#7b553d" opacity=".17">${[33,37,41,45,49,53,57].map(x=>`<path d="M${x} 170L${x-1} 205"/>`).join('')}</g><path d="M42 23L40 118" stroke="#fff" opacity=".22" stroke-width="2"/></svg>`}
renderMix=function(){queueMicrotask(drawMix);return `<div class="game-area brush-area fresh-mix"><div class="brush-studio"><div class="paper-workspace"><div class="mix-paper"><canvas id="brush-canvas" width="900" height="440" aria-label="调色纸，按住并拖动画笔，让颜色融合"></canvas><div id="pool-placeholder" class="paper-empty" ${newMixColor().total?'hidden':''}><span class="empty-stroke"></span><b>两种颜色，会变出什么？</b><small>选好颜色，在这里拖动画笔</small></div><div class="live-brush" id="live-brush">${brushSVG(brushTipColor())}</div><div class="canvas-label"><span></span>我的调色画布</div></div><div class="brush-underpaper"><span id="blend-status">${newMixColor().total?'颜色准备好了，涂一涂吧':'从下方选两种颜色，开始试试吧'}</span><button id="stir-colors" ${newMixColor().total?'':'disabled'}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 13 8-9 3 3-9 8M5 13q-5 0-3 5 5 1 5-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>帮我涂开</button></div></div><div class="pigment-tray"><div class="palette-caption"><b>我的颜料</b><span>点选或按住色碟加色</span></div><div class="pigment-row">${basePaints.map((c,i)=>`<div class="pigment-card" style="--ink:${c}"><button class="paint-pan" data-pour="${i}" aria-label="蘸取${paintNames[i]}，按住连续增加"><span class="pan-cup"><i></i></span><span>${['红色','黄色','蓝色'][i]}</span></button><div class="pigment-stepper"><button data-pigment-adjust="${i}:-1" aria-label="减少${['红色','黄色','蓝色'][i]}" ${inkAmounts[i]<=0?'disabled':''}>−</button><output id="ink-count-${i}" aria-label="${['红色','黄色','蓝色'][i]}用量">${Math.round(inkAmounts[i])} 滴</output><button data-pigment-adjust="${i}:1" aria-label="增加${['红色','黄色','蓝色'][i]}" ${inkAmounts[i]>=100?'disabled':''}>＋</button></div></div>`).join('')}</div></div></div><div class="color-shelf"><div class="color-memory"><span>颜色收藏</span>${mixSwatches.length?mixSwatches.slice(-6).map((c,i)=>`<i style="background:${c}" title="收藏颜色 ${i+1}"></i>`).join(''):'<small>把喜欢的颜色，留在这里</small>'}</div><button id="keep-color" class="keep-brush-color" ${newMixColor().total?'':'disabled'}><span>＋</span> 收藏这一色</button></div></div>`};
function brushStroke(ctx,color,x,y,w,h,seed,opacity=1){
 ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.rotate(-.055+(seed%3)*.018);ctx.fillStyle=color;
 ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-5,-h*.27,20,-h*.43,w*.19,-h*.43);ctx.bezierCurveTo(w*.39,-h*.54,w*.75,-h*.45,w*.95,-h*.3);
 ctx.quadraticCurveTo(w*1.018,-h*.23,w*.992,-h*.145);ctx.quadraticCurveTo(w*1.032,-h*.06,w*.995,h*.015);ctx.quadraticCurveTo(w*1.012,h*.11,w*.975,h*.18);
 ctx.bezierCurveTo(w*.76,h*.37,w*.45,h*.48,w*.16,h*.4);ctx.bezierCurveTo(w*.035,h*.42,-8,h*.18,0,0);ctx.closePath();ctx.fill();ctx.clip();
 const rand=k=>{const n=Math.sin(k*71.73+seed*13.1)*41735.7;return n-Math.floor(n)};
 ctx.strokeStyle='#fff';ctx.lineCap='round';for(let i=0;i<32;i++){const yy=(i/31-.5)*h;ctx.globalAlpha=opacity*(.018+rand(i)*.025);ctx.lineWidth=.6+rand(i+70)*1.5;ctx.beginPath();ctx.moveTo(20+rand(i+90)*45,yy);ctx.bezierCurveTo(w*.32,yy-h*.16,w*.71,yy-h*.025,w*(.88+rand(i+30)*.12),yy+h*.055);ctx.stroke()}
 ctx.fillStyle='#fff';ctx.globalAlpha=opacity*.05;for(let i=0;i<210;i++){ctx.fillRect(rand(i+500)*w,(rand(i+800)-.5)*h,.8+rand(i+200)*1.1,1)}ctx.restore();
}
// Absolute quantity controls the footprint. Compress the range so one drop
// remains visible and 100 drops still fit; this is a volume cue, not an area scale.
function pigmentFootprint(amount,mixed=false){
 const quantity=Math.max(0,Math.min(mixed?300:100,amount));
 if(!quantity)return {w:0,h:0};
 const size=Math.log1p(quantity)/Math.log1p(mixed?300:100);
 return mixed?{w:220+350*size,h:120+130*size}:{w:110+340*size,h:75+135*size};
}
drawMix=function(){const canvas=$('#brush-canvas');if(!canvas)return;const ctx=canvas.getContext('2d'),c=newMixColor();ctx.clearRect(0,0,900,440);const active=inkAmounts.map((v,i)=>v>0?i:-1).filter(i=>i>=0);if(active.length){
 const b=Math.min(1,blend),mixed=pigmentFootprint(c.total,true);
 active.forEach((i,j)=>{
  const spread=(j-(active.length-1)/2)*(1-b),raw=pigmentFootprint(inkAmounts[i]);
  const w=raw.w+(mixed.w-raw.w)*b,h=raw.h+(mixed.h-raw.h)*b;
  brushStroke(ctx,basePaints[i],430+spread*145-w/2,221+spread*90,w,h,i+2,1-b);
 });
 if(b>0)brushStroke(ctx,c.color,430-mixed.w/2,221,mixed.w,mixed.h,5,b);
}
const brush=$('#live-brush');if(brush){const point=brushPoint||[765,260];brush.style.left=point[0]/900*100+'%';brush.style.top=point[1]/440*100+'%';brush.classList.toggle('in-use',brushDown);brush.style.setProperty('--brush-angle',brushDown?'-30deg':'24deg');const tip=brushTipColor();if(brush.dataset.color!==tip){brush.innerHTML=brushSVG(tip);brush.dataset.color=tip}}};
const updateMixPrior=updateMix;updateMix=function(){updateMixPrior();$$('[data-pigment-adjust]').forEach(b=>{const [i,d]=b.dataset.pigmentAdjust.split(':').map(Number);b.disabled=d<0?inkAmounts[i]<=0:inkAmounts[i]>=100});const s=$('#blend-status');if(s&&mode==='mix')s.textContent=!newMixColor().total?'从下方选两种颜色，开始试试吧':blend>.98?'新颜色出现啦！':blend>0?'看，颜色正在慢慢变！':'拖动画笔，或者点「帮我涂开」';};
autoBlend=function(){if(!newMixColor().total)return;cancelAnimationFrame(blendFrame);if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){blend=1;brushPoint=null;updateMix();return}const start=performance.now(),from=blend;function sweep(t){if(mode!=='mix')return;const p=Math.min(1,(t-start)/2400);brushDown=true;brushPoint=[180+Math.sin(p*Math.PI*3-Math.PI/2)*-235+235,150+p*130];blend=from+(1-from)*p;updateMix();if(p<1)blendFrame=requestAnimationFrame(sweep);else{brushDown=false;brushPoint=null;drawMix()}}blendFrame=requestAnimationFrame(sweep)};
function brushLocal(e){const r=e.target.getBoundingClientRect();return [(e.clientX-r.left)/r.width*900,(e.clientY-r.top)/r.height*440]}
$('#game').addEventListener('pointerdown',e=>{if(e.target.id!=='brush-canvas')return;e.preventDefault();if(!newMixColor().total){toast('先从下方的色碟蘸一点颜色吧');return}cancelAnimationFrame(blendFrame);brushDown=true;brushPoint=brushLocal(e);brushPrevious=brushPoint;e.target.setPointerCapture(e.pointerId);drawMix()});
$('#game').addEventListener('pointermove',e=>{if(e.target.id!=='brush-canvas'||!brushDown)return;const p=brushLocal(e),d=Math.hypot(p[0]-brushPrevious[0],p[1]-brushPrevious[1]);blend=Math.min(1,blend+d/650);brushPoint=p;brushPrevious=p;updateMix()});
function endBrush(){if(brushDown){brushDown=false;brushPoint=null;brushPrevious=null;drawMix()}}document.addEventListener('pointerup',endBrush);document.addEventListener('pointercancel',endBrush);window.addEventListener('blur',endBrush);
// Always-visible +/- controls use whole drops and clamp at both ends.
$('#game').addEventListener('click',e=>{const button=e.target.closest('[data-pigment-adjust]');if(!button)return;e.stopImmediatePropagation();const [i,delta]=button.dataset.pigmentAdjust.split(':').map(Number);stopPour();cancelAnimationFrame(blendFrame);brushDown=false;brushPoint=null;brushPrevious=null;inkAmounts[i]=Math.max(0,Math.min(100,Math.round(inkAmounts[i])+delta));if(delta>0)brushPigment=i;else if(inkAmounts[i]===0&&brushPigment===i)brushPigment=null;blend=0;updateMix()},true);
// Elementary activities use broad color matches, without fine pigment simulation.
let mixChallengeRound=0,teacherColor=0,assignedColor=null;
const juniorTargets=[{name:'橙色',amounts:[50,50,0],hint:'试试红色和黄色。'},{name:'绿色',amounts:[0,50,50],hint:'试试黄色和蓝色。'},{name:'紫色',amounts:[50,0,50],hint:'试试红色和蓝色。'}];
function activeTarget(){return assignedColor===null?mixChallengeRound:assignedColor}
targetMix=function(){return juniorTargets[activeTarget()].amounts};
function colorForTarget(i){const saved=inkAmounts;inkAmounts=juniorTargets[i].amounts;const c=newMixColor().color;inkAmounts=saved;return c}
const juniorSettingsPrior=renderSettings;
renderSettings=function(){if(mode!=='mix')return juniorSettingsPrior();const n=activeTarget();$('#settings').innerHTML=`${assignedColor===null?`<div class="junior-modes"><button data-mix-play="0" class="${levels.mix===0?'active':''}" aria-pressed="${levels.mix===0}">自由玩色</button><button data-mix-play="1" class="${levels.mix?'active':''}" aria-pressed="${!!levels.mix}">调出目标色</button></div>`:'<div class="teacher-task-label">老师的小任务</div>'}<div class="junior-task ${levels.mix?'target-task':''}">${levels.mix?`<div class="task-overline">${assignedColor===null?`第 ${mixChallengeRound+1} 关 / 3`:'今天的目标色'}</div><div class="target-swatch" style="--target:${colorForTarget(n)}"><i></i></div><h3>调出这一抹${juniorTargets[n].name}</h3><p>颜色接近，就很棒！</p>`:`<div class="free-color-art" aria-hidden="true"><i></i><i></i><i></i><span>✦</span></div><h3>你会发现什么颜色？</h3><p>选两种颜色，涂一涂看看。</p>`}</div><p class="junior-tip">${levels.mix?(assignedColor!==null||mixChallengeRound===0?juniorTargets[n].hint:'想一想，哪两种颜色能帮上忙？'):'喜欢的颜色，可以收藏起来。'}</p>`};
const juniorRenderPrior=renderAll;
renderAll=function(){document.body.classList.toggle('junior-mix',mode==='mix');if(mode==='mix')levels.mix=levels.mix?1:0;juniorRenderPrior();if(mode==='mix'){$('#game-title').textContent=assignedColor===null?'颜色小画室':'一起调颜色';$('#eyebrow').textContent='三原色 · 画笔调色';$('#dock-title').textContent=role==='teacher'?'选好目标色，让全班一起试试':'把你的颜色发现，分享给老师';$('#dock-desc').textContent=role==='teacher'?'选择颜色和班级，即可开始练习。':'提交后，收获一枚小小的鼓励。';$('#stage-note').textContent='红、黄、蓝 · 混色效果示意'}};
$('#settings').addEventListener('click',e=>{const b=e.target.closest('[data-mix-play]');if(!b)return;e.stopImmediatePropagation();assignedColor=null;applyTier(+b.dataset.mixPlay)},true);
const juniorCheckPrior=check;
check=function(){if(mode!=='mix')return juniorCheckPrior();const c=newMixColor();if(!c.total)return {empty:true,text:'先选一点颜色吧。'};if(blend<.98)return {empty:true,text:'再涂一涂，或点「帮我涂开」看看新颜色。'};if(!levels.mix)return {ok:true,title:'哇，你发现了新颜色！',text:'每一次大胆尝试，都值得一颗小星星。',tip:'再换两种颜色，看看还有什么新发现。'};const n=activeTarget(),used=juniorTargets[n].amounts.map((v,i)=>v?i:-1).filter(i=>i>=0),other=[0,1,2].find(i=>!used.includes(i)),a=inkAmounts[used[0]]/c.total,b=inkAmounts[used[1]]/c.total,ok=a>=.2&&b>=.2&&inkAmounts[other]/c.total<=.1;return {ok,title:'太棒了，调出来啦！',text:`你发现了${juniorTargets[n].name}的秘密！`,tip:juniorTargets[n].hint+'多一点、少一点，还会有新的变化。',retry:'新颜色也很有趣！',retryText:'和目标色还有一点不同。'+juniorTargets[n].hint}};
const juniorFeedbackPrior=showFeedback;
showFeedback=function(x){if(mode!=='mix')return juniorFeedbackPrior(x);originalFeedback(x);const next=$('#feedback-next');if(next){next.textContent=levels.mix&&assignedColor===null&&mixChallengeRound<2?'试试下一种颜色 →':'继续玩色 →';if(levels.mix&&assignedColor===null&&mixChallengeRound<2)next.dataset.mixNext='true'}};
$('#dialog-content').addEventListener('click',e=>{if(e.target.closest('[data-mix-next]')){e.stopImmediatePropagation();mixChallengeRound++;closeDialog();applyTier(1)}},true);
const brushCapturePrior=captureWork;captureWork=function(){return {...brushCapturePrior(),version:9,mixChallengeRound,assignedColor,brushPigment}};
const juniorRestorePrior=restoreWork;restoreWork=function(i){const w=records[i]?.work;brushPigment=Number.isInteger(w?.brushPigment)?w.brushPigment:null;mixChallengeRound=w?.mixChallengeRound||0;assignedColor=w?.assignedColor??null;juniorRestorePrior(i)};
// Teacher choice stays in the existing classroom dialog.
const juniorClassPrior=classDialog;
classDialog=function(){juniorClassPrior();const fields=document.createElement('div');fields.className='lesson-fields';const first=document.querySelector('label[for="class-choice"]');first.before(fields);['class-choice','tool-choice'].forEach(id=>{const group=document.createElement('div');group.append(document.querySelector('label[for="'+id+'"]'),$('#'+id));fields.append(group)});const label=document.querySelector('label[for="task-copy"]');label.insertAdjacentHTML('beforebegin','<div id="teacher-colors"></div>');renderTeacherColors()};
function renderTeacherColors(){const box=$('#teacher-colors');if(!box)return;const mix=$('#tool-choice').value==='mix';box.hidden=!mix;if(!mix)return;box.innerHTML=`<label>给学生一个目标色</label><div class="teacher-colors">${juniorTargets.map((c,i)=>`<button data-teacher-color="${i}" class="${teacherColor===i?'active':''}" aria-pressed="${teacherColor===i}"><i style="background:${colorForTarget(i)}"></i><span>${c.name}</span><b>${teacherColor===i?'✓':''}</b></button>`).join('')}</div><p class="color-choice-note">学生会看到同一块色卡，调出接近的颜色即可。</p>`;$('#task-copy').value=`试着调出${juniorTargets[teacherColor].name}，看看哪两种颜色能帮上忙。`}
$('#dialog-content').addEventListener('change',e=>{if(e.target.id==='tool-choice')renderTeacherColors()});
$('#dialog-content').addEventListener('click',e=>{const b=e.target.closest('[data-teacher-color]');if(b){e.stopImmediatePropagation();teacherColor=+b.dataset.teacherColor;renderTeacherColors();return}if(e.target.closest('#launch-task')){if($('#tool-choice').value==='mix'){assignedColor=teacherColor;levels.mix=1;inkAmounts=[0,0,0];blend=0}else assignedColor=null}},true);
const juniorProgressPrior=progressDialog;progressDialog=function(homework){if(lesson&&mode==='mix')lesson.targetColor=assignedColor;juniorProgressPrior(homework);if(mode==='mix'&&assignedColor!==null){$('.task-panel').insertAdjacentHTML('beforebegin',`<div class="sent-color"><i style="background:${colorForTarget(assignedColor)}"></i><div><b>目标色：${juniorTargets[assignedColor].name}</b><p>学生打开后，直接看到这张任务色卡。</p></div></div>`);$('.modal-actions').insertAdjacentHTML('afterbegin',`<button class="secondary" id="preview-student-task">看看学生端</button>`)}};
$('#dialog-content').addEventListener('click',e=>{if(e.target.closest('#preview-student-task')){const url=new URL('色彩实验_学生端.html',location.href);url.searchParams.set('target',assignedColor);window.open(url,'_blank','noopener')}},true);
const assignedParam=new URLSearchParams(location.search).get('target');if(assignedParam!==null&&/^[0-2]$/.test(assignedParam)){assignedColor=+assignedParam;levels.mix=1;mode='mix'}
renderAll();

// V9: use one workspace, with the submission controls beside the task.
document.body.classList.add('fresh-layout');
$('.guide').append($('.action-dock'));
const freshRenderPrior=renderAll;
renderAll=function(){freshRenderPrior();if(mode==='mix'){$('#chapter').textContent='画笔调色台';$('#eyebrow').textContent=assignedColor===null?'选择一种玩法':'课堂练习';$('#game-title').textContent=assignedColor===null?'从颜色开始':'老师的小任务';$('#dock-title').textContent=role==='teacher'?'准备好，一起开始':'完成你的颜色发现';$('#dock-desc').textContent=role==='teacher'?'选一个目标色，邀请全班来调色':'提交后，就能收到一份小鼓励'}};
renderAll();
