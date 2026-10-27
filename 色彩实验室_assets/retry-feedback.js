(()=>{
'use strict';
let popup=null,timer=null;
const hints={mix:'和目标色比一比，再调整一点颜料。',hue:'看看它更偏哪一种颜色，再选一次。',light:'和旁边的颜色比一比，找找深浅变化。',chroma:'比较鲜艳和灰柔的感觉，再试一次。',analog:'和样本色组比一比，再找一枚邻近色。',contrast:'看看图形和背景，再比较它们的颜色。'};
function clear(){clearTimeout(timer);popup?.remove();popup=null}
function show(reason){clearTimeout(timer);if(!popup){popup=document.createElement('div');popup.id='color-retry-feedback';popup.setAttribute('role','status');popup.setAttribute('aria-live','polite');popup.setAttribute('aria-atomic','true');popup.innerHTML='<div class="retry-icon"><svg viewBox="0 0 100 90" aria-hidden="true"><path d="m77 4 4 9 10 2-8 7 2 10-8-5-9 5 2-10-8-7 11-2Z" fill="#f2c65f"/><circle cx="44" cy="47" r="33" fill="#fff1c8"/><path d="M62 39a20 20 0 1 0-1 23" fill="none" stroke="#9a83d8" stroke-width="7" stroke-linecap="round"/><path d="m62 25 2 17-17-1" fill="none" stroke="#9a83d8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="15" r="4" fill="#b9dce0"/><path d="M82 63v12m-6-6h12" stroke="#c0a9eb" stroke-width="3" stroke-linecap="round"/></svg></div><div><b>再试试看</b><p></p></div>';document.body.append(popup)}
const technical=/不匹配|未通过|尚未匹配|答案不/;popup.querySelector('p').textContent=reason&&!technical.test(reason)&&reason.length<=44?reason:(hints[mode]||'换个想法，再仔细观察一下。');popup.classList.remove('retry-show');void popup.offsetWidth;popup.classList.add('retry-show');timer=setTimeout(clear,2600)}
const original=window.reportColorAttempt;
window.reportColorAttempt=function(ok,reason){if(ok===false)show(reason);return original?.apply(this,arguments)};
const prior=render;render=function(){clear();return prior.apply(this,arguments)};
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&(node.matches('.correct-pop,.ng-celebrate,.as-student-summary')||node.querySelector('.correct-pop,.ng-celebrate,.as-student-summary'))){clear();return}}).observe(document.body,{childList:true,subtree:true});
})();
