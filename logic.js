(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.SeymenLogic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DAY=86400000;
  function parseDateOnly(v){if(!v)return null;const p=v.split('-').map(Number);if(p.length!==3||p.some(Number.isNaN))return null;return Date.UTC(p[0],p[1]-1,p[2]);}
  function totalDayNumber(a,b){const x=parseDateOnly(a),y=parseDateOnly(b);if(x===null||y===null||y<x)return null;return Math.floor((y-x)/DAY)+1;}
  function fireCalculation({entryKg,remaining90Kg,totalDays,aPercent,bPercent}){const A=(Number(aPercent)||0)/100,B=(Number(bPercent)||0)/100;const firstDays=Math.min(Math.max(Number(totalDays)||0,0),90),extraDays=Math.max((Number(totalDays)||0)-90,0);const firstLossKg=(Number(entryKg)||0)*A;const base=Number(remaining90Kg)||0;const extraLossKg=extraDays>0?base*(1-Math.pow(1-B,extraDays)):0;return{firstDays,extraDays,firstLossKg,extraLossKg,totalLossKg:firstLossKg+extraLossKg};}
  function norm(s){return String(s??'').trim().toLocaleUpperCase('tr-TR');}
  function pickCorrelation(records,product,year){const rows=(records||[]).filter(r=>norm(r.product)===norm(product));if(!rows.length)return null;const exact=rows.filter(r=>Number(r.correlationYear)===Number(year));if(exact.length)return exact[exact.length-1];const numeric=rows.filter(r=>Number.isFinite(Number(r.correlationYear))).sort((a,b)=>Number(b.correlationYear)-Number(a.correlationYear));return numeric[0]||rows[rows.length-1];}
  return{parseDateOnly,totalDayNumber,fireCalculation,pickCorrelation};
});
