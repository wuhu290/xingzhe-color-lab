const colors={红:'#f16b67',黄:'#f8cc4e',蓝:'#5c86e9',橙:'#f3a05d',绿:'#65bb82',紫:'#a884d2'};
const mixNames={'红黄':'橙','黄红':'橙','黄蓝':'绿','蓝黄':'绿','红蓝':'紫','蓝红':'紫'};
const modeInfo={
  三原色:['选两张色片，观察合成结果。先试试红色和黄色。','三原色 · 发现新颜色','用两张原色色片完成一次组合，并说出画面感觉的变化。'],
  色相:['沿着色相排列选颜色，观察屋顶从暖色到冷色的变化。','色相 · 换一种颜色','选择两种色相，比较画面给你的不同感觉。'],
  明度:['拖动深浅尺，保持色相大体一致，比较画面的亮暗。','明度 · 看见亮与暗','试两个明度，并描述哪个屋顶更明亮。'],
  纯度:['拖动鲜灰尺，比较鲜艳和柔和的颜色。','纯度 · 鲜艳还是柔和','比较高纯度和低纯度色卡的效果。'],
  相近色:['选一组色相相邻的色卡，观察画面能否更统一。','相近色 · 找到邻居','从相近色中选一组，解释画面为何更协调。'],
  对比度:['比较深浅差别较小和较大的两组颜色。','对比度 · 找到视觉重点','比较两组对比，指出画面焦点的变化。']
};
let slots=['红','黄'],nextSlot=0,mode='三原色',currentLabel='橙';
const $=s=>document.querySelector(s);
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.switch button').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));window.scrollTo(0,0)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
function result(){return mixNames[slots.join('')]||(slots[0]===slots[1]?slots[0]:'自定义')}
function paint(){const r=result(),hex=colors[r]||'#ada7a5';$('#slot-a').style.background=colors[slots[0]];$('#slot-b').style.background=colors[slots[1]];$('#slot-result').style.background=hex;$('#mix-label').textContent=`${slots[0]} + ${slots[1]} → ${r}色（课堂示意）`;document.querySelectorAll('#color-picks button').forEach(x=>x.classList.remove('active'))}
function applyHex(hex,label){currentLabel=label;$('#art-roof').setAttribute('fill',hex);$('#comp-result').style.background=hex;$('#comp-text').textContent=`现在：${label}屋顶`}
function renderWidget(){
  const w=$('#mode-widget');
  $('#station-title').textContent=mode==='三原色'?'色彩配方台':`${mode}观察台`;
  $('#model-note').hidden=mode!=='三原色';
  $('#lab-steps').innerHTML=mode==='三原色'?'<li>选一张放入色片 A</li><li>再选一张放入色片 B</li><li>将新色卡应用到屋顶</li><li>保存记录并提交老师</li>':'<li>调整本页的色彩样本</li><li>观察同一画面中的变化</li><li>比较两种方案并说出理由</li><li>保存记录并提交老师</li>';
  $('#feedback-tip').textContent=mode==='三原色'?'选红＋黄会出现橙色。搭配没有唯一正确答案，评价针对观察和表达。':`小提示：${mode}的判断要结合画面和你的理由，没有固定的“最佳搭配”。`;
  if(mode==='三原色'){w.hidden=true;document.querySelectorAll('.primary-only').forEach(x=>x.hidden=false);$('#save-card').textContent='保存我的色彩记录';return}
  document.querySelectorAll('.primary-only').forEach(x=>x.hidden=true);w.hidden=false;$('#save-card').textContent='保存本次观察';
  const swatch=(name,hex)=>`<button class="sample" data-hex="${hex}" data-label="${name}" style="--sample:${hex}"><i></i>${name}</button>`;
  if(mode==='色相')w.innerHTML=`<strong>色相序列</strong><p>依次换色，留意冷暖变化。</p><div class="samples">${Object.entries(colors).map(([n,h])=>swatch(n,h)).join('')}</div>`;
  if(mode==='明度')w.innerHTML='<strong>明度阶梯</strong><p>同一色相，从深到浅。</p><input type="range" min="20" max="85" value="60" data-range="light"><div class="rangelabel"><span>较暗</span><span>较亮</span></div><div class="gradientbar lightbar"></div>';
  if(mode==='纯度')w.innerHTML='<strong>纯度阶梯</strong><p>从灰调到鲜艳，比较颜色的强弱。</p><input type="range" min="0" max="100" value="70" data-range="sat"><div class="rangelabel"><span>更柔和</span><span>更鲜艳</span></div><div class="gradientbar satbar"></div>';
  if(mode==='相近色')w.innerHTML=`<strong>相近色组</strong><p>选择一组相邻颜色，看看画面是否更统一。</p><div class="samples">${swatch('暖红','#e98a81')}${swatch('橙','#f3a05d')}${swatch('金黄','#f4c76a')}${swatch('蓝','#6d9ee2')}${swatch('青蓝','#76c6d9')}${swatch('青绿','#7dc9b4')}</div>`;
  if(mode==='对比度')w.innerHTML=`<strong>对比度比较</strong><p>把屋顶与浅色墙面对照，看看哪个更醒目。</p><div class="samples">${swatch('低对比·浅橙','#edcfa9')}${swatch('高对比·深蓝','#3f5a9b')}</div>`;
}
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
document.querySelectorAll('#color-picks button').forEach(b=>b.addEventListener('click',()=>{slots[nextSlot]=b.dataset.color;nextSlot=1-nextSlot;paint();b.classList.add('active')}));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));const info=modeInfo[mode];$('#mode-intro').textContent=info[0];$('#goal-title').textContent=info[1];$('#goal-text').textContent=info[2];renderWidget()}));
$('#mode-widget').addEventListener('click',e=>{const b=e.target.closest('[data-hex]');if(!b)return;applyHex(b.dataset.hex,b.dataset.label+'色');$('#mode-widget').querySelectorAll('.sample').forEach(x=>x.classList.toggle('active',x===b));toast('已应用到同一张画面')});
$('#mode-widget').addEventListener('input',e=>{const slider=e.target.closest('[data-range]');if(!slider)return;const hex=slider.dataset.range==='light'?`hsl(25 78% ${slider.value}%)`:`hsl(25 ${slider.value}% 60%)`;applyHex(hex,slider.dataset.range==='light'?`明度 ${slider.value}`:`纯度 ${slider.value}`)});
$('#apply-color').addEventListener('click',()=>{const r=result();applyHex(colors[r]||'#ada7a5',r+'色');toast('已把色卡应用到同一张画面')});
$('#save-card').addEventListener('click',()=>toast(mode==='三原色'?`已保存 ${slots[0]}＋${slots[1]} 的色彩记录（演示）`:`已保存${mode}观察（演示）`));
$('#submit-work').addEventListener('click',()=>{const good=mode==='三原色'&&(slots.join('')==='红黄'||slots.join('')==='黄红');toast(good?'你发现了暖色的变化！记得告诉老师你的想法。':'勇于尝试很棒！再观察一下画面的变化。');$('#submitted-count').textContent='1';$('#feedback-tip').textContent=good?'小评价：你找到了一个清晰的配色变化。接下来试着解释原因。':'小评价：每次尝试都是新发现。比较前后画面，再说说你的发现。'});
$('#start-class').addEventListener('click',()=>{$('#student-wait').style.display='none';$('#student-open').style.display='block';$('#opened-count').textContent='20';$('#row-a').textContent='已打开 · 进行中';$('#row-b').textContent='已打开 · 进行中';toast('课堂练习已下发，学生端示例已打开')});
$('#assign-homework').addEventListener('click',()=>toast('已加入课后待办示例；正式发布需班级任务系统接入'));
$('#show-detail').addEventListener('click',()=>$('#review-detail').scrollIntoView({behavior:'smooth',block:'center'}));
$('#send-review').addEventListener('click',()=>toast('老师点评已发送给学生（演示）'));
paint();renderWidget();
