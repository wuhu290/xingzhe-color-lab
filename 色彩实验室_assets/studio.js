/* V12: one open activity desk; instructions above, completion below. */
document.body.classList.add('studio-layout');
// Keep the platform navigation and existing event targets, but give the activity
// one full-width surface. Hidden guide nodes remain for the shared renderers.
const roomHeading=document.createElement('div');roomHeading.className='room-heading';
roomHeading.append($('#chapter'));
const roomInstruction=document.createElement('p');roomInstruction.id='room-instruction';roomHeading.append(roomInstruction);
$('.play-top').prepend(roomHeading);$('.play-top').append($('#settings'));
const roomDock=$('.action-dock');$('.art-workspace').append(roomDock);
const roomMessage=document.createElement('div');roomMessage.id='studio-feedback';roomMessage.className='room-message';roomMessage.setAttribute('role','status');roomMessage.setAttribute('aria-live','polite');roomDock.prepend(roomMessage);
$('.dock-actions').prepend($('#reset'));

let studioFinished=false, studioFeedback=null, studioPointerStart=null;
const studioCopy={
 mix:['画笔调色','让颜色在纸上相遇','点颜料蘸一笔，再到纸上涂开。'],
 hue:['色相拼图','接上颜色的变化','先选空位，再选一片颜色。'],
 light:['明度观察','发现明暗的细微差别','比较深浅，找出更亮的图案。'],
 chroma:['鲜灰排序','排出颜色的鲜灰层次','点两张图案，交换它们的位置。'],
 analog:['风景配色','画一张自己的风景','点画面里的区域，再给它选颜色。'],
 contrast:['画面焦点','让色彩改变画面','换一个背景，比较主角的变化。']
};
playThemes.light=[['海洋标本','shell',235],['叶影之间','leaf',150],['纸上飞鸟','bird',275],['花瓣微光','flower',350]];
playThemes.chroma=[['植物色谱','leaf',145],['海岸收藏','shell',55],['蝴蝶标本','butterfly',295],['花色研究','flower',345]];
playThemes.hue=[['十二色花环','flower'],['颜色转盘','wheel'],['纸片色环','donut']];
playThemes.analog=[['山野来信',['天空','远山','草地']],['珊瑚海岸',['海水','珊瑚','沙地']],['城堡暮色',['天空','城堡','草坪']],['风的旅行',['天空','气球','山野']]];
playThemes.contrast=[['海洋剪影','fish'],['蝶翼之间','butterfly'],['纸上飞鸟','bird'],['花与背景','flower']];
playThemes.mix=[['一张新的调色纸','leaf'],['寻找海岸的颜色','shell'],['采集花园的颜色','flower'],['留住傍晚的颜色','bird']];
Object.entries(studioCopy).forEach(([k,v])=>toolsData[k].small=v[0]);

// Identical monochrome details preserve each colour-comparison exercise.
playArt=function(kind,color='#dea648'){
 const shapes={
 leaf:'<path d="M18 87C1 47 29 13 83 9C96 58 69 89 18 87Z"/><path d="M13 94 73 22M31 75 24 48M44 62 42 31M43 63 69 61M56 47 78 44" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.6"/>',
 shell:'<path d="M42 88 8 49C-1 31 11 15 28 19C35 1 52 5 56 13C69 3 86 16 85 29C102 36 98 53 85 64L60 88Z"/><g fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="1.6"><path d="M49 84 21 32M51 83 35 21M53 83 51 18M55 83 68 22M58 82 82 39"/></g><path d="M40 87h23v6H40Z"/>',
 bird:'<path d="m9 58 30-25 4-25 27 42 19-9-8 28-34 17Z"/><path d="m9 58 38 28-8-53 31 17-23 36" fill="#fff" fill-opacity=".16"/><path d="m81 69 14-5-8-6Z"/><circle cx="79" cy="56" r="1.5" fill="#fff" fill-opacity=".65"/>',
 butterfly:'<path d="M46 47C9-7 0 22 12 50L35 60C0 80 31 104 49 69C67 104 100 80 66 60L88 50C100 22 92-7 54 47Z"/><path d="M49 39v37M49 42 40 28M50 42 59 28" fill="none" stroke="currentColor" stroke-width="3"/><path d="m19 30 23 25-21-8m60-17L58 55l21-8M31 78l12-15m26 15L57 63" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>',
 flower:Array.from({length:8},(_,i)=>`<path d="M48 50C22 37 30 4 49 9C67 13 67 36 48 50Z" transform="rotate(${i*45} 50 50)"/>`).join('')+'<circle cx="50" cy="50" r="13" fill="#fff" fill-opacity=".2"/><g fill="#fff" fill-opacity=".35"><circle cx="46" cy="46" r="2"/><circle cx="56" cy="48" r="2"/><circle cx="50" cy="56" r="2"/></g>',
 fish:'<path d="M9 51C29 16 59 20 74 43L94 29 91 77 74 61C56 84 27 85 9 51Z"/><path d="M44 27 54 12 67 33M41 77l16 13 10-19"/><path d="M32 34q-10 18 0 35M47 35q16 16 0 32" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/><circle cx="21" cy="48" r="2" fill="#fff" fill-opacity=".7"/>',
 fruit:'<path d="M51 25C73 10 95 38 89 62C83 101 21 103 13 65C4 33 29 14 51 25Z"/><path d="M49 23Q49 4 72 8Q67 27 49 23"/><path d="M24 44q-7 13-2 24" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>',
 star:'<path d="m50 10 12 25 28 4-20 20 5 29-25-14-25 14 5-29-20-20 28-4Z"/>'
 };
 return `<svg class="play-art specimen" viewBox="0 0 100 100" aria-hidden="true" style="color:${color}"><g fill="currentColor">${shapes[kind]||shapes.leaf}</g></svg>`;
};
smile=()=>'<path d="M139 150h22m-11-11v22" stroke="#b3a78f" stroke-width="1" transform="translate(-100 -100)"/>';

renderMix=function(){queueMicrotask(drawMix);return `<div class="game-area brush-area fresh-mix"><div class="brush-studio"><div class="paper-workspace"><div class="mix-paper"><canvas id="brush-canvas" width="900" height="440" tabindex="0" role="button" aria-label="调色纸：拖动画笔混色，轻点或按回车自动涂开"></canvas><div id="pool-placeholder" class="paper-empty" ${newMixColor().total?'hidden':''}><div class="paper-samples"><i></i><i></i><i></i></div><b>今天，会发现什么颜色？</b><small>从下面选一种颜料，让画笔蘸一蘸</small></div><div class="live-brush" id="live-brush">${brushSVG(brushTipColor())}</div><div class="canvas-label">我的调色纸</div><span class="paper-corner" aria-hidden="true"></span></div><div class="brush-underpaper"><span id="blend-status" role="status">点颜料蘸一笔，再到纸上涂开。</span><span class="paper-action-hint">拖动画笔 · 轻点也能涂开</span></div></div><div class="pigment-tray"><div class="pigment-row">${basePaints.map((c,i)=>`<div class="pigment-card" style="--ink:${c}"><button class="paint-pan" data-pour="${i}" aria-label="蘸取${paintNames[i]}，按住可多蘸一点"><span class="pan-cup"><i></i></span><span>${['红色','黄色','蓝色'][i]}</span></button><div class="pigment-stepper"><output id="ink-count-${i}">${Math.round(inkAmounts[i])} 滴</output><button data-pigment-adjust="${i}:-1" aria-label="减少${['红色','黄色','蓝色'][i]}" ${inkAmounts[i]<=0?'disabled':''}>−</button></div></div>`).join('')}</div><div class="paint-proportion" aria-label="三种颜料的当前用量比例">${basePaints.map((c,i)=>`<i data-ratio-ink="${i}" style="--ink:${c};flex-grow:${inkAmounts[i]}"></i>`).join('')}</div><p class="palette-note">点颜料蘸一笔 · 按住多蘸一点 · − 减一点</p></div></div></div>`};

const studioOldUpdate=updateMix;
updateMix=function(){studioOldUpdate();const total=newMixColor().total;$$('[data-ratio-ink]').forEach((el,i)=>{el.style.flexGrow=inkAmounts[i];el.hidden=!inkAmounts[i]});const status=$('#blend-status');if(status)status.textContent=dipState?(dipState.progress<.48?'画笔正在蘸取颜料…':'把这一笔颜色带到纸上…'):!total?'点颜料蘸一笔，再到纸上涂开。':blend>=.98?'这一抹新颜色，完成了。':blend>0?'留意笔触，颜色正在融合。':'颜料已落在纸上，拖动画笔试一试。';};
const studioOldTip=brushSVG;
brushSVG=function(color){return studioOldTip(color).replace('#536bd8','#9d6b43').replace('#9cabff','#deb68a').replace('#7e8feb','#c69567').replace('#5268cb','#a6744b')};
brushStroke=function(ctx,color,x,y,w,h,seed,opacity=1){
 const rand=k=>{const n=Math.sin(k*71.73+seed*13.1)*41735.7;return n-Math.floor(n)};
 ctx.save();ctx.translate(x,y);ctx.rotate(-.04);ctx.fillStyle=color;ctx.globalAlpha=opacity*.9;
 ctx.beginPath();ctx.moveTo(w*.035,-h*.3);ctx.bezierCurveTo(w*.25,-h*.44,w*.72,-h*.37,w*.965,-h*.24);
 for(let i=0;i<20;i++)ctx.lineTo(w*(.955+rand(i)*.045),h*(-.24+i*.029));
 ctx.bezierCurveTo(w*.7,h*.4,w*.23,h*.37,w*.018,h*.27);
 for(let i=0;i<18;i++)ctx.lineTo(w*rand(i+30)*.035,h*(.27-i*.031));ctx.closePath();ctx.fill();ctx.clip();
 ctx.strokeStyle=color;ctx.lineCap='round';for(let i=0;i<85;i++){const yy=(i/85-.48)*h;ctx.globalAlpha=opacity*(.15+rand(i+60)*.48);ctx.lineWidth=1+rand(i+200)*3;ctx.beginPath();ctx.moveTo(rand(i+90)*w*.04,yy);ctx.bezierCurveTo(w*.3,yy-h*.07,w*.7,yy+h*.04,w,yy-h*.07);ctx.stroke()}
 ctx.strokeStyle='#fffef8';for(let i=0;i<46;i++){const yy=(i/46-.48)*h;ctx.globalAlpha=opacity*(.015+rand(i+300)*.11);ctx.lineWidth=.3+rand(i+400)*1.3;ctx.beginPath();ctx.moveTo(w*rand(i+500)*.12,yy);ctx.bezierCurveTo(w*.28,yy-h*.04,w*.7,yy,w*(.87+rand(i+600)*.13),yy-h*.08);ctx.stroke()}
 ctx.fillStyle='#fffef8';ctx.globalAlpha=opacity*.12;for(let i=0;i<180;i++)ctx.fillRect(rand(i+800)*w,(rand(i+1000)-.5)*h,.4+rand(i+1200)*1.2,.5);ctx.restore();
};
$('#game').addEventListener('pointerdown',e=>{if(e.target.id==='brush-canvas'){if(dipState){e.stopImmediatePropagation();return}studioPointerStart=[e.clientX,e.clientY]}},true);
$('#game').addEventListener('click',e=>{if(e.target.id==='brush-canvas'&&!dipState&&studioPointerStart){if(Math.hypot(e.clientX-studioPointerStart[0],e.clientY-studioPointerStart[1])<8)autoBlend();studioPointerStart=null}},true);
$('#game').addEventListener('keydown',e=>{if(e.target.id==='brush-canvas'&&['Enter',' '].includes(e.key)){e.preventDefault();if(!dipState)autoBlend()}},true);
$('#game').addEventListener('keydown',e=>{if(e.target.matches('[data-region]')&&['Enter',' '].includes(e.key)){e.preventDefault();region=+e.target.dataset.region;renderGame()}},true);

function updateRoomFeedback(){
 const node=$('#studio-feedback');if(!node)return;
 node.innerHTML=studioFeedback||`<span class="room-note-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>${role==='teacher'?'准备好了，就邀请全班一起试试':mode==='mix'?'试着多蘸一点，看看颜色怎样变化':mode==='analog'||mode==='contrast'?'大胆尝试，颜色可以有不同的表达':'慢慢观察，每一次尝试都有新发现'}</span>`;
}
renderSettings=function(){
 let setting='';
 if(mode==='mix'){
 setting=assignedColor===null?`<label class="room-select"><span class="sr-only">探索方式</span><select id="studio-mix-mode"><option value="0" ${!levels.mix?'selected':''}>自由调色</option><option value="1" ${levels.mix?'selected':''}>调出目标色</option></select></label>`:'<span class="assignment-tag">老师的小任务</span>';
 if(levels.mix)setting=`<div class="target-cue"><i style="background:${colorForTarget(activeTarget())}"></i><span>目标色<b>${juniorTargets[activeTarget()].name}</b></span></div>`+setting;
 }else if(role==='teacher'&&mode!=='contrast'){
 setting=`<label class="room-select"><span class="sr-only">练习难度</span><select id="studio-level">${['初识 · 明显差别','进阶 · 更多层次','挑战 · 细微观察'].map((t,i)=>`<option value="${i}" ${levels[mode]===i?'selected':''}>${t}</option>`).join('')}</select></label>`;
 }else{
 setting=`<span class="round-label">${taskTheme()[0]}</span>${mode==='contrast'?'':`<span class="room-level">${['初识','进阶','挑战'][levels[mode]]}<i>${[0,1,2].map(i=>`<b class="${i<=levels[mode]?'on':''}"></b>`).join('')}</i></span>`}`;
 }
 $('#settings').innerHTML=setting;updateRoomFeedback();
 const heading=$('#chapter'),instruction=$('#room-instruction');
 heading.textContent=mode==='mix'&&levels.mix?'调出一抹'+juniorTargets[activeTarget()].name:studioCopy[mode][1];
 instruction.textContent=mode==='light'&&lightVariant==='sort'?'点两张图案交换位置，从暗到亮排一排。':studioCopy[mode][2];
};
$('#settings').addEventListener('change',e=>{if(e.target.id==='studio-mix-mode'){assignedColor=null;studioFinished=false;studioFeedback=null;applyTier(+e.target.value)}if(e.target.id==='studio-level'){studioFinished=false;studioFeedback=null;applyTier(+e.target.value)}});

const studioOldIntro=playIntro;
playIntro=function(){return ''};
const studioOldHue=renderHue;
renderHue=function(){return studioOldHue().replace(/<g transform="translate\(100 100\)">[\s\S]*?<\/g>/,'<text x="150" y="146" text-anchor="middle" class="wheel-center">色相</text><text x="150" y="166" text-anchor="middle" class="wheel-caption">12 种颜色</text>').replaceAll('#fff0b0','#f6f0e4').replaceAll('#fff9ed','#faf6ed').replace('给亮框里的空位选颜色','为选中的空位配色')};
// Keep direct region selection; remove its duplicate button list.
const studioOldAnalog=renderAnalog;
renderAnalog=function(){return studioOldAnalog().replace(/<p>给哪里涂色？<\/p><div class="region-list">[\s\S]*?<\/div>/,`<p class="region-current">正在涂：<b>${taskTheme('analog')[1][region]}</b></p>`).replace('选个颜色吧','挑一个颜色')};
const studioOldScene=sceneArt;
sceneArt=function(){let svg=studioOldScene();if((playState.analog?.theme||0)===0)svg=svg.replace(/<g fill="#c49b76">[\s\S]*?<\/g><ellipse[\s\S]*?<\/g>/,'<path d="M217 271 227 225 242 264 252 235 267 271Z" fill="#ffffff25"/><path d="M40 283q61-40 101-10" stroke="#fff6" stroke-width="5" fill="none"/>');return svg};

showFeedback=function(x){studioFinished=!!x.ok;const feedback={mix:['新颜色，值得留下','你观察到了原色相遇后的变化。'],hue:['色环完整了','相邻的色相，被你接了起来。'],light:['观察得很仔细','你发现了颜色中的明暗层次。'],chroma:['渐变很连贯','从灰到鲜艳，变化清晰可见。'],analog:['这张风景很有想法','你用相近的颜色表达了自己的感受。'],contrast:['你发现了画面的变化','不同背景，带来了不同的色彩关系。']}[mode];
 const retry={mix:juniorTargets[activeTarget()].hint,hue:'看看空位两侧，再调整不连贯的颜色。',light:lightVariant==='sort'?'先找最暗和最亮的，再排中间。':'再比较深浅，寻找更明亮的一个。',chroma:'先找最灰和最鲜艳的，再比较中间。'}[mode]||'再换一种颜色，观察一下。';
 studioFeedback=`<div class="inline-response ${x.ok?'success':'retry'}"><span class="response-stamp">${x.ok?'✓':'↗'}</span><div><b>${x.ok?feedback[0]:'再观察一次'}</b><p>${x.ok?feedback[1]:retry}</p></div></div>`;
 renderSettings();$('#submit-work').innerHTML=x.ok?(mode==='mix'?'再画一张 <span>→</span>':'下一题 <span>→</span>'):'再试一次 <span>→</span>';
 if(x.ok&&mode==='mix'&&!mixSwatches.includes(newMixColor().color))mixSwatches.push(newMixColor().color);
};
const studioOldCheck=check;
check=function(){const x=studioOldCheck();if(mode==='mix'&&newMixColor().total&&blend<.98)x.text='在纸上拖动画笔，或者轻点一下，把颜色涂开。';return x};
$('#submit-work').addEventListener('click',e=>{if(role==='student'&&studioFinished){e.stopImmediatePropagation();studioFinished=false;studioFeedback=null;makeRound(mode,true);renderAll()}},true);
const studioOldRound=makeRound;
makeRound=function(m,advance=false){studioFinished=false;studioFeedback=null;studioOldRound(m,advance)};
const studioOldSetMode=setMode;
setMode=function(m){studioFinished=false;studioFeedback=null;studioOldSetMode(m)};
// Any edit after successful submission becomes a fresh, reviewable attempt.
document.addEventListener('pointerdown',e=>{if(studioFinished&&e.target.closest('#game')){studioFinished=false;studioFeedback=null;renderSettings();$('#submit-work').innerHTML='完成并提交 <span>→</span>'}},true);

const studioOldRender=renderAll;
renderAll=function(){studioOldRender();document.body.dataset.studioMode=mode;$('#head-action').hidden=true;$('#save-work').hidden=true;$('#help').hidden=true;$('#game-title').textContent=role==='teacher'?'带进美术课堂':'我的色彩探索';$('#eyebrow').textContent=role==='teacher'?'课堂准备':'观察 · 尝试 · 创作';$('#reset').textContent=mode==='mix'?'↻ 换张纸':'↻ 换一题';$('.pagehead p').textContent='每一种颜色，都有新发现';$('#dock-desc').textContent=role==='teacher'?'选择班级后，即可布置练习。':'提交后自动收进色彩收藏';$('#submit-work').innerHTML=role==='teacher'?'布置给学生 <span>→</span>':studioFinished?'继续探索 <span>→</span>':'完成并提交 <span>→</span>';$('#stage-note').textContent=mode==='mix'?'屏幕混色示意':'每完成 3 次，挑战会更进一步';renderSettings();};
renderAll();
