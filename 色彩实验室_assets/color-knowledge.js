(()=>{
'use strict';
const topics={
mix:{name:'三原色',title:'三原色与三间色',text:'在传统绘画色彩体系中，红、黄、蓝称为三原色。两种原色调和，可以得到间色。',points:['红色与黄色调和，得到橙色。','黄色与蓝色调和，得到绿色。','红色与蓝色调和，得到紫色。'],colors:['#eb5575','#f2cd48','#4b94d5'],labels:['红','黄','蓝']},
hue:{name:'色相',title:'色相',text:'色相是色彩的相貌，是区别不同色彩的名称，如红、橙、黄、绿、蓝、紫等。',points:['色相、明度、纯度是色彩的三种属性。'],colors:['#e96679','#edb35e','#edce58','#77bf9b','#699cd9','#aa85d1'],labels:['红','橙','黄','绿','蓝','紫']},
light:{name:'明度',title:'色彩的明度',text:'色彩的明暗程度称为明度。不同色彩有不同的明度，同一种颜色也有深浅变化。',points:['同一种颜色加入白色，明度提高。','同一种颜色加入黑色，明度降低。'],colors:['#e2ebf8','#b3c9e5','#7d9fc8','#466b99'],labels:['浅','较浅','较深','深']},
chroma:{name:'纯度',title:'色彩的纯度',text:'色彩的纯度指色彩的鲜艳程度，又称色彩饱和度。',points:['纯度高，颜色较鲜艳。','纯度低，颜色较灰。'],colors:['#ef7299','#cc8ba0','#af9aa1','#a3a0a1'],labels:['高纯度','较高','较低','低纯度']},
analog:{name:'相近色',title:'邻近色',text:'在色环上，相邻近的色彩称为邻近色。邻近色组合常使人产生和谐的感觉。',points:['例如：黄、黄绿、绿。','例如：红紫、紫、蓝紫。'],colors:['#eacb57','#bac65a','#82b975'],labels:['黄','黄绿','绿']},
contrast:{name:'对比色',title:'对比色',text:'在色环上，两个位置相对的颜色互为对比色。',points:['红与绿、橙与蓝、黄与紫，是三组常见的对比色。','改变一方色彩的面积、明度或纯度，可以调和对比效果。'],colors:['#e65d6b','#62ad76','#ed963e','#5e90ca','#ebce4e','#9566b4'],labels:['红','绿','橙','蓝','黄','紫']}
};
const seen=new Set();let last=null;
const entry=document.createElement('button');entry.id='color-knowledge-entry';entry.textContent='✦ 色彩小知识';entry.setAttribute('aria-haspopup','dialog');document.querySelector('.toolnav').append(entry);
const panel=document.createElement('dialog');panel.id='color-knowledge';panel.setAttribute('aria-labelledby','ck-title');document.body.append(panel);
function currentTopic(){return topics[mode]}
function close(){panel.close();entry.focus()}
function open(){const key=mode,t=currentTopic();if(!topics[key])return;seen.add(key);panel.innerHTML=`<button class="ck-close" aria-label="关闭色彩知识">×</button><div class="ck-eyebrow">色彩小知识 · ${t.name}</div><h2 id="ck-title">${t.title}</h2><p class="ck-intro">${t.text}</p><div class="ck-visual">${picture(key,t)}</div><ul class="ck-points">${t.points.map(point=>`<li>${point}</li>`).join('')}</ul><button class="ck-start" autofocus>知道啦，开始体验 →</button>`;panel.querySelector('.ck-close').onclick=close;panel.querySelector('.ck-start').onclick=close;if(!panel.open)panel.showModal()}
entry.onclick=open;panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
function picture(key,t){if(key==='mix')return `<div class="ck-mixing"><i style="background:#eb5575"></i><span>＋</span><i style="background:#f2cd48"></i><span>→</span><i style="background:#ef974c"></i></div><small>红色 ＋ 黄色 → 橙色（示意）</small>`;return `<div class="ck-colors">${t.colors.map((c,i)=>`<span><i style="background:${c}"></i><small>${t.labels[i]}</small></span>`).join('')}</div>`}
function update(){if(!topics[mode])return;if(last!==mode){if(panel.open)panel.close();last=mode;if(!seen.has(mode))open()}}
const previous=render;render=function(){previous();update()};update();
})();
