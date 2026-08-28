const BASE_PRODUCTS = [{"name": "2 E. HEXANOL", "density": 0.8352}, {"name": "ACETIC ASID", "density": 1.0544}, {"name": "ACETONE", "density": 0.795}, {"name": "ARAMCO PRIMA 110", "density": 0.8603}, {"name": "ARCOL POLYOL 1107-1108", "density": 1.0212}, {"name": "BA - 15 PPM MEHQ/BULK", "density": 0.9027}, {"name": "BASE OIL 70N", "density": 0.8318}, {"name": "BASE OIL HVI 4", "density": 0.8444}, {"name": "BASE OIL SN 150", "density": 0.8755}, {"name": "BASE OIL SN 350", "density": 0.883}, {"name": "BUTYL ACRYLATE 15 PPM MEHQ BULK", "density": 0.9018}, {"name": "BUTYL CELLOSOLVE", "density": 0.9031}, {"name": "CARADOL ED56-200", "density": 1.0058}, {"name": "CARADOL SC 48-08", "density": 1.0215}, {"name": "CARADOL SP 30-47", "density": 1.0475}, {"name": "CARADOL SP 42-15", "density": 1.0294}, {"name": "DENATÜRE METHANOL", "density": 0.7949}, {"name": "DIDP ( Dİ-İZODESİL FTALAT )", "density": 0.9686}, {"name": "DIETILEN GLIKOL (2.2", "density": 1.1191}, {"name": "DINP ( Dİ-İZONONİL FTALAT )", "density": 0.9745}, {"name": "EA - 15 PPM MEHQ/BULK", "density": 0.9264}, {"name": "EOA TEA 99% PMLA BULK", "density": 1.1251}, {"name": "ETHYL ACETATE", "density": 0.9055}, {"name": "ETHYL PROXİTOL", "density": 0.9001}, {"name": "FORMIC ACID", "density": 1.2009}, {"name": "HEXANE", "density": 0.6784}, {"name": "ISO BUTHANOL", "density": 0.8044}, {"name": "ISOPROPANOL", "density": 0.7882}, {"name": "L.A.B.", "density": 0.8589}, {"name": "M.E.K.", "density": 0.8091}, {"name": "M.ETHYLENE GLYCOL", "density": 1.1159}, {"name": "MDI (DESMODUR 44 V 20 L", "density": 1.2416}, {"name": "METHANOL", "density": 0.7949}, {"name": "METHYL ACETATE", "density": 0.939}, {"name": "Methylene Chloride (MEC)", "density": 1.3336}, {"name": "METIL PROXITOL", "density": 0.9245}, {"name": "MMA - 20 PPM AO-30/BULK", "density": 0.9481}, {"name": "MMA-20 PPM AO-30/BULK", "density": 0.948}, {"name": "N-BUTANOL", "density": 0.8124}, {"name": "N-BUTYL ACETATE", "density": 0.8854}, {"name": "NEODOL 25-7", "density": 0.9852}, {"name": "N-PROPANOL", "density": 0.8073}, {"name": "OXC BUCS SOLV BULK", "density": 0.9033}, {"name": "OXS BUCB SOLV BULK", "density": 0.9552}, {"name": "OXS DOWANOL DPNB BULK", "density": 0.9158}, {"name": "PG IND BULK ZFIN", "density": 1.0387}, {"name": "PGI - PROPILEN GLIKOL", "density": 1.0388}, {"name": "PHENOL", "density": 1.0697}, {"name": "PM GLYCOL ", "density": 0.9243}, {"name": "POLYMERIC MDI", "density": 1.2404}, {"name": "POLYOL 0548", "density": 1.0227}, {"name": "SABIC TDI 0380", "density": 1.2239}, {"name": "SAE10(SN150)", "density": 0.8831}, {"name": "SAE30(SN500)", "density": 0.8942}, {"name": "SAPEG-400 (Polyethylene Glycol)", "density": 1.1287}, {"name": "SOLVENT NAPHTA (Düşük Kümenli SOLGAD 100)", "density": 0.8761}, {"name": "STRENE MONOMER", "density": 0.9095}, {"name": "SULU H.METHYLENE DI.", "density": 0.8389}, {"name": "SUPRASEC 5025 (MDI)", "density": 1.2414}, {"name": "TDI (DESMODUR T-80)", "density": 1.224}, {"name": "VAM HQ 14-17BK", "density": 0.9367}, {"name": "XYLENE", "density": 0.8645}];

BASE_PRODUCTS.forEach(p=>{if(!Number.isFinite(Number(p.fireRate)))p.fireRate=0.002;});
let PRODUCTS=BASE_PRODUCTS.map(p=>({...p}));
const fmt=(n,d=2)=>Number(n).toLocaleString('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d});
const byId=id=>document.getElementById(id);
const density=name=>(PRODUCTS.find(p=>p.name===name)||{density:0}).density;
const historyKey='seymen_web_history_v1';

function initSelect(id, selected){
  const s=byId(id);
  s.innerHTML=PRODUCTS.map(p=>`<option ${p.name===selected?'selected':''}>${p.name}</option>`).join('');
}
initSelect('ltProduct','POLYOL 0548'); initSelect('tlProduct','METHANOL'); initSelect('f90Product','POLYOL 0548');

document.querySelectorAll('#mainNav button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('#mainNav button').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); byId('page-'+btn.dataset.page).classList.add('active');
  if(btn.dataset.page==='history') renderHistory();
}));

function calcLT(){
  const tank=+byId('ltTank').value||0;
  const fillPercent=+byId('ltFill').value||0;
  const fill=fillPercent/100;
  const den=density(byId('ltProduct').value);
  const plannedTon=+byId('ltAdr').value||0;
  const safe=tank*fill;
  const kg=safe*den;
  const ton=kg/1000;
  byId('ltDensity').textContent=fmt(den,4);
  byId('ltSafeVolume').textContent=fmt(safe,2);
  byId('ltKg').textContent=fmt(kg,2);
  byId('ltTon').textContent=fmt(ton,3)+' ton';
  const ok=plannedTon<=ton && plannedTon>=0;
  byId('ltStatus').className='status '+(ok?'ok':'bad');
  byId('ltStatus').textContent=ok
    ? `UYGUN • Planlanan ${fmt(plannedTon,3)} ton / Maksimum ${fmt(ton,3)} ton`
    : `UYGUN DEĞİL • Planlanan ${fmt(plannedTon,3)} ton / Maksimum ${fmt(ton,3)} ton`;
  return {tank,fillPercent,fill,product:byId('ltProduct').value,den,plannedTon,safe,kg,ton,ok};
}
['ltTank','ltFill','ltProduct','ltAdr'].forEach(id=>byId(id).addEventListener('input',calcLT));

function calcTL(){
  const product=byId('tlProduct').value;
  const fillPercent=+byId('tlFill').value||0;
  const fill=fillPercent/100;
  const plannedTon=+byId('tlKg').value||0;
  const kg=plannedTon*1000;
  const vehicleCapacity=+byId('tlAdr').value||0;
  const den=density(product);
  const net=den?kg/den:0;
  const requiredCapacity=fill?net/fill:0;
  const usableCapacity=vehicleCapacity*fill;
  byId('tlDensity').textContent=fmt(den,4);
  byId('tlNet').textContent=fmt(net,2);
  byId('tlTank').textContent=fmt(requiredCapacity,2);
  byId('tlTon').textContent=fmt(usableCapacity,2)+' L';
  const ok=net<=usableCapacity && vehicleCapacity>0;
  byId('tlStatus').className='status '+(ok?'ok':'bad');
  byId('tlStatus').textContent=ok
    ? `UYGUN • Gereken net ${fmt(net,2)} L / Kullanılabilir ${fmt(usableCapacity,2)} L`
    : `UYGUN DEĞİL • Gereken net ${fmt(net,2)} L / Kullanılabilir ${fmt(usableCapacity,2)} L`;
  return {product,fillPercent,fill,plannedTon,kg,vehicleCapacity,den,net,requiredCapacity,usableCapacity,ok};
}
['tlProduct','tlFill','tlKg','tlAdr'].forEach(id=>byId(id).addEventListener('input',calcTL));

function parseDateOnly(value){
  if(!value) return null;
  const parts=value.split('-').map(Number);
  if(parts.length!==3||parts.some(x=>!Number.isFinite(x))) return null;
  return Date.UTC(parts[0],parts[1]-1,parts[2]);
}
function formatDateTR(value){
  if(!value) return '-';
  const [y,m,d]=value.split('-');
  return `${d}.${m}.${y}`;
}
function calcFire(){
  const entry=+byId('fEntry').value||0;
  const APercent=+byId('fA').value||0;
  const BPercent=+byId('fB').value||0;
  const A=APercent/100;
  const B=BPercent/100;
  const remaining=+byId('fRemaining').value||0;
  const entryDateVal=byId('fEntryDate').value;
  const calcDateVal=byId('fCalcDate').value;
  const entryDate=parseDateOnly(entryDateVal);
  const calcDate=parseDateOnly(calcDateVal);

  let days=0;
  let valid=true;
  let message='';

  if(entryDate===null||calcDate===null){
    valid=false;
    message='Ürünün giriş tarihi ve hesaplama tarihini seçin.';
  }else if(calcDate<entryDate){
    valid=false;
    message='Hesaplama tarihi, ürün giriş tarihinden önce olamaz.';
  }else{
    days=Math.floor((calcDate-entryDate)/86400000);
  }

  byId('fDays').value=valid?days:'';
  byId('fEntryDateOut').textContent=formatDateTR(entryDateVal);
  byId('fCalcDateOut').textContent=formatDateTR(calcDateVal);
  byId('fDaysOut').textContent=valid?`${fmt(days,0)} gün`:'-';

  const firstDays=valid?Math.min(days,90):0;
  const extra=valid?Math.max(days-90,0):0;
  byId('fFirstDaysOut').textContent=valid?`${fmt(firstDays,0)} gün`:'-';
  byId('fExtraDaysOut').textContent=valid?`${fmt(extra,0)} gün`:'-';
  byId('fARateOut').textContent=`%${fmt(APercent,2)}`;
  byId('fBRateOut').textContent=`%${fmt(BPercent,3)}`;
  const firstLoss=valid?entry*A:0;
  const extraLoss=valid?remaining*(1-Math.pow(1-B,extra)):0;
  const total=firstLoss+extraLoss;

  byId('fFirstDays').textContent=valid?fmt(firstDays,0):'-';
  byId('fExtraDays').textContent=valid?fmt(extra,0):'-';
  byId('fFirstLoss').textContent=valid?fmt(firstLoss,3):'-';
  byId('fExtraLoss').textContent=valid?fmt(extraLoss,3):'-';
  byId('fTotalLoss').textContent=valid?fmt(total,3):'-';

  const validation=byId('fireValidation');
  if(valid){
    validation.className='status hidden';
    validation.textContent='';
  }else{
    validation.className='status bad';
    validation.textContent=message;
  }

  return {entry,APercent,BPercent,A,B,days,remaining,firstDays,extra,firstLoss,extraLoss,total,entryDateVal,calcDateVal,valid};
}
['fEntryDate','fCalcDate','fEntry','fA','fB','fRemaining'].forEach(id=>byId(id).addEventListener('input',calcFire));


let fire90Events=[];

function getProductFireRate(name){
  const p=PRODUCTS.find(x=>x.name===name);
  return p && Number.isFinite(Number(p.fireRate)) ? Number(p.fireRate) : 0.002;
}
function isoFromDay(entryDateVal,dayNo){
  const t=parseDateOnly(entryDateVal);
  if(t===null||!Number.isFinite(dayNo))return '';
  const d=new Date(t+(dayNo-1)*86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function totalDayNumber(entryDateVal,calcDateVal){
  const a=parseDateOnly(entryDateVal),b=parseDateOnly(calcDateVal);
  if(a===null||b===null||b<a)return null;
  return Math.floor((b-a)/86400000)+1;
}
function syncFire90RateFromProduct(){
  byId('f90Rate').value=getProductFireRate(byId('f90Product').value);
  calcFire90();
}
function calcFire90(){
  const product=byId('f90Product').value;
  const entryDateVal=byId('f90EntryDate').value;
  const calcDateVal=byId('f90CalcDate').value;
  const entryTon=+byId('f90EntryTon').value||0;
  const day90Ton=+byId('f90Day90Ton').value||0;
  const ratePercent=+byId('f90Rate').value||0;
  const rate=ratePercent/100;
  const refDayRaw=byId('f90RefDay').value.trim();
  const refTonRaw=byId('f90RefTon').value.trim();
  const refDay=refDayRaw?Number(refDayRaw):null;
  const refTon=refTonRaw?Number(refTonRaw):null;
  const totalDays=totalDayNumber(entryDateVal,calcDateVal);

  let valid=true,message='';
  if(totalDays===null){valid=false;message='Geçerli ilk giriş ve hesaplama tarihi seçin.';}
  else if(totalDays<90){valid=false;message='Bu ekran 90. gün ve sonrası için hesaplama yapar.';}
  else if(entryTon<0||day90Ton<0||ratePercent<0){valid=false;message='Tonaj ve oran negatif olamaz.';}
  else if(refDay!==null&&(!Number.isInteger(refDay)||refDay<90)){valid=false;message='Referans gün 90 veya daha büyük tam sayı olmalıdır.';}
  else if(refDay!==null&&refDay>totalDays){valid=false;message='Referans gün hesaplama tarihinden sonra olamaz.';}
  else if((refDay===null)!=(refTon===null)){valid=false;message='Referans gün ve referans tonaj birlikte girilmelidir.';}

  let startDay=90,baseTon=day90Ton;
  if(valid&&refDay!==null){startDay=refDay;baseTon=refTon;}
  const calcDays=valid?Math.max(totalDays-startDay,0):0;
  const remainingTon=valid?baseTon*Math.pow(1-rate,calcDays):0;
  const lossTon=valid?baseTon-remainingTon:0;

  byId('f90TotalDays').textContent=valid?`${totalDays} gün`:'-';
  byId('f90ExtraDays').textContent=valid?`${calcDays} gün`:'-';
  byId('f90BaseTon').textContent=valid?`${fmt(baseTon,3)} ton`:'-';
  byId('f90Loss').textContent=valid?`${fmt(lossTon*1000,3)} kg`:'-';
  byId('f90Remaining').textContent=valid?`${fmt(remainingTon,3)} ton`:'-';
  const v=byId('f90Validation');
  v.className=valid?'status hidden':'status bad';
  v.textContent=valid?'':message;
  return {valid,message,product,entryDateVal,calcDateVal,entryTon,day90Ton,ratePercent,rate,totalDays,startDay,baseTon,calcDays,remainingTon,lossTon,refDay,refTon};
}
['f90EntryDate','f90CalcDate','f90EntryTon','f90Day90Ton','f90Rate','f90RefDay','f90RefTon'].forEach(id=>byId(id).addEventListener('input',calcFire90));
byId('f90Product').addEventListener('change',syncFire90RateFromProduct);

function renderFire90Events(){
  fire90Events.sort((a,b)=>a.day-b.day);
  byId('f90EventRows').innerHTML=fire90Events.length
    ? fire90Events.map((e,i)=>`<tr><td>${e.day}</td><td>${formatDateTR(isoFromDay(byId('f90EntryDate').value,e.day))}</td><td>${e.type==='exit'?'Araç Çıkış Tonajı':'Kalan Toplam Tonaj'}</td><td>${fmt(e.ton,3)}</td><td><button type="button" class="mini-danger" data-remove="${i}">Sil</button></td></tr>`).join('')
    : '<tr><td colspan="5" class="empty">Ara hareket girilmedi.</td></tr>';
  byId('f90EventRows').querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
    fire90Events.splice(Number(btn.dataset.remove),1);
    renderFire90Events();
  }));
}
byId('f90EventAdd').onclick=()=>{
  const day=Number(byId('f90EventDay').value);
  const type=byId('f90EventType').value;
  const ton=Number(byId('f90EventTon').value);
  const totalDays=totalDayNumber(byId('f90EntryDate').value,byId('f90CalcDate').value);
  if(!Number.isInteger(day)||day<91||!Number.isFinite(ton)||ton<0){alert('Geçerli gün ve tonaj girin.');return;}
  if(totalDays!==null&&day>totalDays){alert('Hareket günü hesaplama tarihinden sonra olamaz.');return;}
  fire90Events.push({day,type,ton});
  byId('f90EventDay').value='';byId('f90EventTon').value='';
  renderFire90Events();
};

function buildFire90DailyReport(){
  const x=calcFire90();
  if(!x.valid)return {valid:false,rows:[]};
  let balanceKg=x.day90Ton*1000;
  const rows=[];
  const eventsByDay={};
  fire90Events.forEach(e=>(eventsByDay[e.day]??=[]).push(e));

  for(let day=91;day<=x.totalDays;day++){
    const startKg=balanceKg;
    let movement='';
    for(const e of (eventsByDay[day]||[])){
      if(e.type==='exit'){
        balanceKg=Math.max(0,balanceKg-e.ton*1000);
        movement+=`${movement?' | ':''}Araç çıkışı -${fmt(e.ton,3)} ton`;
      }else{
        balanceKg=e.ton*1000;
        movement+=`${movement?' | ':''}Kalan toplam = ${fmt(e.ton,3)} ton`;
      }
    }
    if(x.refDay!==null&&day===x.refDay){
      balanceKg=x.refTon*1000;
      movement+=`${movement?' | ':''}Referans bakiye = ${fmt(x.refTon,3)} ton`;
    }
    const afterMovementKg=balanceKg;
    const dailyLossKg=afterMovementKg*x.rate;
    balanceKg=Math.max(0,afterMovementKg-dailyLossKg);
    rows.push({day,date:isoFromDay(x.entryDateVal,day),startKg,movement,afterMovementKg,dailyLossKg,endKg:balanceKg});
  }
  return {valid:true,meta:x,rows};
}
function renderFire90DailyReport(){
  const report=buildFire90DailyReport();
  if(!report.valid){
    byId('f90DailyRows').innerHTML='<tr><td colspan="6" class="empty">Önce geçerli hesaplama bilgilerini girin.</td></tr>';
    return report;
  }
  byId('f90DailyRows').innerHTML=report.rows.length
    ? report.rows.slice(-500).map(r=>`<tr><td>${r.day}</td><td>${formatDateTR(r.date)}</td><td>${fmt(r.startKg,3)}</td><td>${r.movement||'-'}</td><td>${fmt(r.dailyLossKg,3)}</td><td>${fmt(r.endKg,3)}</td></tr>`).join('')
    : '<tr><td colspan="6" class="empty">90+ günlük satır oluşmadı.</td></tr>';
  return report;
}
byId('f90Preview').onclick=renderFire90DailyReport;

function xmlEscape(s){
  return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function downloadFire90Excel(){
  const report=buildFire90DailyReport();
  if(!report.valid){alert('Önce geçerli hesaplama bilgilerini girin.');return;}
  const x=report.meta;
  const allRows=[
    ['SEYMEN 90+ GÜNLÜK FIRE RAPORU','','','','','',''],
    ['Ürün',x.product],
    ['İlk Giriş Tarihi',formatDateTR(x.entryDateVal)],
    ['Hesaplama Tarihi',formatDateTR(x.calcDateVal)],
    ['İlk Giriş Tonajı (ton)',x.entryTon],
    ['90. Gün Kalan Tonaj (ton)',x.day90Ton],
    ['90+ Günlük Fire Oranı (%)',x.ratePercent],
    ['','','','','','',''],
    ['Gün','Tarih','Gün Başı (kg)','Hareket','Hareket Sonrası (kg)','Günlük Fire (kg)','Gün Sonu (kg)'],
    ...report.rows.map(r=>[r.day,formatDateTR(r.date),r.startKg,r.movement,r.afterMovementKg,r.dailyLossKg,r.endKg])
  ];
  const rowsXml=allRows.map(row=>`<Row>${row.map(v=>`<Cell><Data ss:Type="${typeof v==='number'?'Number':'String'}">${xmlEscape(v)}</Data></Cell>`).join('')}</Row>`).join('');
  const xml=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="90+ Günlük Fire"><Table>${rowsXml}</Table></Worksheet></Workbook>`;
  const blob=new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`SEYMEN_90_Plus_Fire_${x.entryDateVal}_${x.calcDateVal}.xls`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
byId('f90Excel').onclick=downloadFire90Excel;
byId('f90Save').onclick=()=>{
  const x=calcFire90();
  if(!x.valid)return;
  saveHistory('90+ Günlük Fire',`${x.product} • ${formatDateTR(x.entryDateVal)} → ${formatDateTR(x.calcDateVal)} • %${fmt(x.ratePercent,3)}`,`Fire ${fmt(x.lossTon*1000,3)} kg • Kalan ${fmt(x.remainingTon,3)} ton`);
};

function saveHistory(type,summary,result){
  const rows=JSON.parse(localStorage.getItem(historyKey)||'[]');
  rows.unshift({date:new Date().toLocaleString('tr-TR'),type,summary,result});
  localStorage.setItem(historyKey,JSON.stringify(rows.slice(0,100)));
}
byId('ltSave').onclick=()=>{const x=calcLT();saveHistory('Litre - Tonaj',`${x.product} • ${fmt(x.tank,0)} L • %${fmt(x.fillPercent,0)} • Plan ${fmt(x.plannedTon,3)} ton`,`${fmt(x.ton,3)} ton maks. • ${x.ok?'UYGUN':'UYGUN DEĞİL'}`);};
byId('tlSave').onclick=()=>{const x=calcTL();saveHistory('Tonaj - Litre',`${x.product} • ${fmt(x.plannedTon,3)} ton • %${fmt(x.fillPercent,0)}`,`${fmt(x.requiredCapacity,2)} L gerekli kapasite • ${x.ok?'UYGUN':'UYGUN DEĞİL'}`);};
byId('fSave').onclick=()=>{const x=calcFire();if(!x.valid)return;saveHistory('Fire',`${formatDateTR(x.entryDateVal)} → ${formatDateTR(x.calcDateVal)} • ${x.days} gün • A:%${fmt(x.APercent,2)} • B:%${fmt(x.BPercent,3)}`,`Toplam fire: ${fmt(x.total,3)} kg`);};
function renderHistory(){
  const rows=JSON.parse(localStorage.getItem(historyKey)||'[]');
  byId('historyCount').textContent=`${rows.length} kayıt`;
  byId('historyRows').innerHTML=rows.length?rows.map(r=>`<tr><td>${r.date}</td><td>${r.type}</td><td>${r.summary}</td><td>${r.result}</td></tr>`).join(''):'<tr><td class="empty" colspan="4">Henüz kayıt yok.</td></tr>';
}
byId('clearHistory').onclick=()=>{localStorage.removeItem(historyKey);renderHistory();};

function renderProducts(filter=''){
  const q=filter.trim().toLocaleUpperCase('tr-TR');
  const rows=PRODUCTS.filter(p=>p.name.toLocaleUpperCase('tr-TR').includes(q));
  byId('productRows').innerHTML=rows.map(p=>`<tr><td>${p.name}</td><td>${fmt(p.density,4)}</td><td>%${fmt(Number(p.fireRate??0.002),3)}</td></tr>`).join('');
  byId('productCount').textContent=`${rows.length} / ${PRODUCTS.length} ürün`;
}
byId('productSearch').addEventListener('input',e=>renderProducts(e.target.value));

// Masaüstü -> web senkron mimarisinin ilk ön yüz katmanı.
// Gerçek backend bağlandığında bu kayıt sunucudan gelecektir.
function renderSourceState(){
  const sourceState=JSON.parse(localStorage.getItem('seymen_desktop_sources')||'{"sources":[{"id":"DESKTOP-01","name":"Ana Masaüstü","lastSync":"Eşitlendi"}]}');
  const sources=sourceState.sources||[];
  const warning=byId('sourceWarning');
  if(sources.length>1){
    warning.classList.remove('hidden');
    byId('syncBadge').textContent='⚠ Veri Çakışması';
    byId('sourceWarningDetail').textContent=sources.map(s=>`${s.name||s.id} (${s.lastSync||'bilinmiyor'})`).join(' • ');
  } else {
    warning.classList.add('hidden');
    byId('syncBadge').textContent='☁ Eşitlendi';
  }
}

const AUTH_HASH='3c0324ef3f647e882f320fc89c34f087fabbd593cc87c62b465563c40699565a';
const AUTH_SESSION_KEY='seymen_authorized_mode_v1';
const TEMP_PRODUCTS_KEY='seymen_temp_products_v1';
let selectedProductName=null;

async function sha256Hex(text){
  const data=new TextEncoder().encode(text);
  const digest=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function isAuthorized(){
  return sessionStorage.getItem(AUTH_SESSION_KEY)==='1';
}

function loadTempProducts(){
  if(!isAuthorized()){ PRODUCTS=[...BASE_PRODUCTS]; return; }
  try{
    const saved=JSON.parse(sessionStorage.getItem(TEMP_PRODUCTS_KEY)||'null');
    PRODUCTS=Array.isArray(saved)&&saved.length?saved:[...BASE_PRODUCTS];
  }catch{ PRODUCTS=[...BASE_PRODUCTS]; }
}

function persistTempProducts(){
  if(isAuthorized()) sessionStorage.setItem(TEMP_PRODUCTS_KEY,JSON.stringify(PRODUCTS));
}

function refreshProductSelects(){
  const currentLT=byId('ltProduct').value;
  const currentTL=byId('tlProduct').value;
  const currentF90=byId('f90Product').value;
  initSelect('ltProduct',PRODUCTS.some(p=>p.name===currentLT)?currentLT:PRODUCTS[0]?.name);
  initSelect('tlProduct',PRODUCTS.some(p=>p.name===currentTL)?currentTL:PRODUCTS[0]?.name);
  initSelect('f90Product',PRODUCTS.some(p=>p.name===currentF90)?currentF90:PRODUCTS[0]?.name);
  calcLT(); calcTL(); syncFire90RateFromProduct();
}

function renderAuthState(){
  const on=isAuthorized();
  byId('authOpen').classList.toggle('hidden',on);
  byId('authLogout').classList.toggle('hidden',!on);
  byId('productAdmin').classList.toggle('hidden',!on);
  document.querySelectorAll('.admin-col').forEach(el=>el.classList.toggle('hidden',!on));
  byId('authOpen').textContent=on?'Geçici Yetkili Modu':'Yetkili Modu Aç';
  renderProducts(byId('productSearch').value||'');
}

byId('authOpen').onclick=()=>{byId('authModal').classList.remove('hidden');byId('authPassword').value='';byId('authError').textContent='';byId('authPassword').focus();};
byId('authCancel').onclick=()=>byId('authModal').classList.add('hidden');
byId('authSubmit').onclick=async()=>{
  const hash=await sha256Hex(byId('authPassword').value);
  if(hash!==AUTH_HASH){byId('authError').textContent='Şifre hatalı.';return;}
  sessionStorage.setItem(AUTH_SESSION_KEY,'1');
  loadTempProducts();
  byId('authModal').classList.add('hidden');
  renderAuthState();
};
byId('authPassword').addEventListener('keydown',e=>{if(e.key==='Enter')byId('authSubmit').click();});
byId('authLogout').onclick=()=>{
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(TEMP_PRODUCTS_KEY);
  PRODUCTS=[...BASE_PRODUCTS];
  selectedProductName=null;
  refreshProductSelects();
  renderAuthState();
};

byId('adminAdd').onclick=()=>{
  if(!isAuthorized())return;
  const name=byId('adminName').value.trim();
  const den=Number(byId('adminDensity').value);
  const fireRate=Number(byId('adminFireRate').value);
  if(!name||!Number.isFinite(den)||den<=0||!Number.isFinite(fireRate)||fireRate<0){alert('Geçerli ürün adı, yoğunluk ve fire oranı girin.');return;}
  if(PRODUCTS.some(p=>p.name.toLocaleUpperCase('tr-TR')===name.toLocaleUpperCase('tr-TR'))){alert('Bu ürün zaten mevcut.');return;}
  PRODUCTS=[...PRODUCTS,{name,density:den,fireRate}].sort((a,b)=>a.name.localeCompare(b.name,'tr'));
  persistTempProducts(); refreshProductSelects(); renderProducts(); 
};

byId('adminUpdate').onclick=()=>{
  if(!isAuthorized()||!selectedProductName){alert('Önce listeden bir ürün seçin.');return;}
  const name=byId('adminName').value.trim();
  const den=Number(byId('adminDensity').value);
  const fireRate=Number(byId('adminFireRate').value);
  if(!name||!Number.isFinite(den)||den<=0||!Number.isFinite(fireRate)||fireRate<0){alert('Geçerli ürün adı, yoğunluk ve fire oranı girin.');return;}
  PRODUCTS=PRODUCTS.map(p=>p.name===selectedProductName?{name,density:den,fireRate}:p);
  selectedProductName=name;
  persistTempProducts(); refreshProductSelects(); renderProducts();
};

byId('adminDelete').onclick=()=>{
  if(!isAuthorized()||!selectedProductName){alert('Önce listeden bir ürün seçin.');return;}
  PRODUCTS=PRODUCTS.filter(p=>p.name!==selectedProductName);
  selectedProductName=null; byId('adminName').value=''; byId('adminDensity').value=''; byId('adminFireRate').value='';
  persistTempProducts(); refreshProductSelects(); renderProducts();
};

const originalRenderProducts=renderProducts;
renderProducts=function(filter=''){
  const q=filter.trim().toLocaleUpperCase('tr-TR');
  const rows=PRODUCTS.filter(p=>p.name.toLocaleUpperCase('tr-TR').includes(q));
  const auth=isAuthorized();
  byId('productRows').innerHTML=rows.map(p=>`<tr class="${p.name===selectedProductName?'selected':''}" data-product="${p.name.replace(/"/g,'&quot;')}">${auth?`<td class="admin-col"><input class="select-product" type="radio" name="prodsel" ${p.name===selectedProductName?'checked':''}></td>`:''}<td>${p.name}</td><td>${fmt(p.density,4)}</td><td>%${fmt(Number(p.fireRate??0.002),3)}</td></tr>`).join('');
  byId('productCount').textContent=`${rows.length} / ${PRODUCTS.length} ürün`;
  if(auth){
    byId('productRows').querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{
      selectedProductName=tr.dataset.product;
      const p=PRODUCTS.find(x=>x.name===selectedProductName);
      if(p){byId('adminName').value=p.name;byId('adminDensity').value=p.density;byId('adminFireRate').value=Number(p.fireRate??0.002);}
      renderProducts(byId('productSearch').value||'');
    }));
  }
}

if(!byId('fEntryDate').value) byId('fEntryDate').value='2024-06-28';
if(!byId('f90EntryDate').value) byId('f90EntryDate').value='2026-05-01';
if(!byId('f90CalcDate').value) byId('f90CalcDate').value=new Date().toISOString().slice(0,10);
if(!byId('fCalcDate').value) byId('fCalcDate').value='2026-08-28';
loadTempProducts();
refreshProductSelects();
renderAuthState();
calcLT(); calcTL(); calcFire(); syncFire90RateFromProduct(); renderFire90Events(); renderProducts(); renderHistory(); renderSourceState();

