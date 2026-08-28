const BASE_PRODUCTS = [{"name": "2 E. HEXANOL", "density": 0.8352}, {"name": "ACETIC ASID", "density": 1.0544}, {"name": "ACETONE", "density": 0.795}, {"name": "ARAMCO PRIMA 110", "density": 0.8603}, {"name": "ARCOL POLYOL 1107-1108", "density": 1.0212}, {"name": "BA - 15 PPM MEHQ/BULK", "density": 0.9027}, {"name": "BASE OIL 70N", "density": 0.8318}, {"name": "BASE OIL HVI 4", "density": 0.8444}, {"name": "BASE OIL SN 150", "density": 0.8755}, {"name": "BASE OIL SN 350", "density": 0.883}, {"name": "BUTYL ACRYLATE 15 PPM MEHQ BULK", "density": 0.9018}, {"name": "BUTYL CELLOSOLVE", "density": 0.9031}, {"name": "CARADOL ED56-200", "density": 1.0058}, {"name": "CARADOL SC 48-08", "density": 1.0215}, {"name": "CARADOL SP 30-47", "density": 1.0475}, {"name": "CARADOL SP 42-15", "density": 1.0294}, {"name": "DENATÜRE METHANOL", "density": 0.7949}, {"name": "DIDP ( Dİ-İZODESİL FTALAT )", "density": 0.9686}, {"name": "DIETILEN GLIKOL (2.2", "density": 1.1191}, {"name": "DINP ( Dİ-İZONONİL FTALAT )", "density": 0.9745}, {"name": "EA - 15 PPM MEHQ/BULK", "density": 0.9264}, {"name": "EOA TEA 99% PMLA BULK", "density": 1.1251}, {"name": "ETHYL ACETATE", "density": 0.9055}, {"name": "ETHYL PROXİTOL", "density": 0.9001}, {"name": "FORMIC ACID", "density": 1.2009}, {"name": "HEXANE", "density": 0.6784}, {"name": "ISO BUTHANOL", "density": 0.8044}, {"name": "ISOPROPANOL", "density": 0.7882}, {"name": "L.A.B.", "density": 0.8589}, {"name": "M.E.K.", "density": 0.8091}, {"name": "M.ETHYLENE GLYCOL", "density": 1.1159}, {"name": "MDI (DESMODUR 44 V 20 L", "density": 1.2416}, {"name": "METHANOL", "density": 0.7949}, {"name": "METHYL ACETATE", "density": 0.939}, {"name": "Methylene Chloride (MEC)", "density": 1.3336}, {"name": "METIL PROXITOL", "density": 0.9245}, {"name": "MMA - 20 PPM AO-30/BULK", "density": 0.9481}, {"name": "MMA-20 PPM AO-30/BULK", "density": 0.948}, {"name": "N-BUTANOL", "density": 0.8124}, {"name": "N-BUTYL ACETATE", "density": 0.8854}, {"name": "NEODOL 25-7", "density": 0.9852}, {"name": "N-PROPANOL", "density": 0.8073}, {"name": "OXC BUCS SOLV BULK", "density": 0.9033}, {"name": "OXS BUCB SOLV BULK", "density": 0.9552}, {"name": "OXS DOWANOL DPNB BULK", "density": 0.9158}, {"name": "PG IND BULK ZFIN", "density": 1.0387}, {"name": "PGI - PROPILEN GLIKOL", "density": 1.0388}, {"name": "PHENOL", "density": 1.0697}, {"name": "PM GLYCOL ", "density": 0.9243}, {"name": "POLYMERIC MDI", "density": 1.2404}, {"name": "POLYOL 0548", "density": 1.0227}, {"name": "SABIC TDI 0380", "density": 1.2239}, {"name": "SAE10(SN150)", "density": 0.8831}, {"name": "SAE30(SN500)", "density": 0.8942}, {"name": "SAPEG-400 (Polyethylene Glycol)", "density": 1.1287}, {"name": "SOLVENT NAPHTA (Düşük Kümenli SOLGAD 100)", "density": 0.8761}, {"name": "STRENE MONOMER", "density": 0.9095}, {"name": "SULU H.METHYLENE DI.", "density": 0.8389}, {"name": "SUPRASEC 5025 (MDI)", "density": 1.2414}, {"name": "TDI (DESMODUR T-80)", "density": 1.224}, {"name": "VAM HQ 14-17BK", "density": 0.9367}, {"name": "XYLENE", "density": 0.8645}];

let PRODUCTS = [...BASE_PRODUCTS];
const fmt=(n,d=2)=>Number(n).toLocaleString('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d});
const byId=id=>document.getElementById(id);
const density=name=>(PRODUCTS.find(p=>p.name===name)||{density:0}).density;
const historyKey='seymen_web_history_v1';

function initSelect(id, selected){
  const s=byId(id);
  s.innerHTML=PRODUCTS.map(p=>`<option ${p.name===selected?'selected':''}>${p.name}</option>`).join('');
}
initSelect('ltProduct','POLYOL 0548'); initSelect('tlProduct','METHANOL');

document.querySelectorAll('#mainNav button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('#mainNav button').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); byId('page-'+btn.dataset.page).classList.add('active');
  if(btn.dataset.page==='history') renderHistory();
}));

function calcLT(){
  const tank=+byId('ltTank').value||0, fill=+byId('ltFill').value||0, den=density(byId('ltProduct').value), adr=+byId('ltAdr').value||0;
  const safe=tank*fill, kg=safe*den, ton=kg/1000;
  byId('ltDensity').textContent=fmt(den,4); byId('ltSafeVolume').textContent=fmt(safe,2);
  byId('ltKg').textContent=fmt(kg,2); byId('ltTon').textContent=fmt(ton,5);
  const ok=ton<=adr; byId('ltStatus').className='status '+(ok?'ok':'bad'); byId('ltStatus').textContent=ok?'UYGUN':'AŞIM VAR';
  return {tank,fill,product:byId('ltProduct').value,den,adr,safe,kg,ton,ok};
}
['ltTank','ltFill','ltProduct','ltAdr'].forEach(id=>byId(id).addEventListener('input',calcLT));

function calcTL(){
  const product=byId('tlProduct').value, fill=+byId('tlFill').value||0, kg=+byId('tlKg').value||0, adr=+byId('tlAdr').value||0, den=density(product);
  const net=den?kg/den:0, tank=fill?net/fill:0, ton=kg/1000;
  byId('tlDensity').textContent=fmt(den,4); byId('tlNet').textContent=fmt(net,2);
  byId('tlTank').textContent=fmt(tank,2); byId('tlTon').textContent=fmt(ton,3)+' ton';
  const ok=ton<=adr; byId('tlStatus').className='status '+(ok?'ok':'bad'); byId('tlStatus').textContent=ok?'UYGUN':'AŞIM VAR';
  return {product,fill,kg,adr,den,net,tank,ton,ok};
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

function saveHistory(type,summary,result){
  const rows=JSON.parse(localStorage.getItem(historyKey)||'[]');
  rows.unshift({date:new Date().toLocaleString('tr-TR'),type,summary,result});
  localStorage.setItem(historyKey,JSON.stringify(rows.slice(0,100)));
}
byId('ltSave').onclick=()=>{const x=calcLT();saveHistory('Litre - Tonaj',`${x.product} • ${fmt(x.tank,0)} L • %${fmt(x.fill*100,0)}`,`${fmt(x.ton,5)} ton • ${x.ok?'UYGUN':'AŞIM VAR'}`);};
byId('tlSave').onclick=()=>{const x=calcTL();saveHistory('Tonaj - Litre',`${x.product} • ${fmt(x.kg,0)} kg`,`${fmt(x.tank,2)} L • ${x.ok?'UYGUN':'AŞIM VAR'}`);};
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
  byId('productRows').innerHTML=rows.map(p=>`<tr><td>${p.name}</td><td>${fmt(p.density,4)}</td></tr>`).join('');
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
  initSelect('ltProduct',PRODUCTS.some(p=>p.name===currentLT)?currentLT:PRODUCTS[0]?.name);
  initSelect('tlProduct',PRODUCTS.some(p=>p.name===currentTL)?currentTL:PRODUCTS[0]?.name);
  calcLT(); calcTL();
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
  if(!name||!Number.isFinite(den)||den<=0){alert('Geçerli ürün adı ve yoğunluk girin.');return;}
  if(PRODUCTS.some(p=>p.name.toLocaleUpperCase('tr-TR')===name.toLocaleUpperCase('tr-TR'))){alert('Bu ürün zaten mevcut.');return;}
  PRODUCTS=[...PRODUCTS,{name,density:den}].sort((a,b)=>a.name.localeCompare(b.name,'tr'));
  persistTempProducts(); refreshProductSelects(); renderProducts(); 
};

byId('adminUpdate').onclick=()=>{
  if(!isAuthorized()||!selectedProductName){alert('Önce listeden bir ürün seçin.');return;}
  const name=byId('adminName').value.trim();
  const den=Number(byId('adminDensity').value);
  if(!name||!Number.isFinite(den)||den<=0){alert('Geçerli ürün adı ve yoğunluk girin.');return;}
  PRODUCTS=PRODUCTS.map(p=>p.name===selectedProductName?{name,density:den}:p);
  selectedProductName=name;
  persistTempProducts(); refreshProductSelects(); renderProducts();
};

byId('adminDelete').onclick=()=>{
  if(!isAuthorized()||!selectedProductName){alert('Önce listeden bir ürün seçin.');return;}
  PRODUCTS=PRODUCTS.filter(p=>p.name!==selectedProductName);
  selectedProductName=null; byId('adminName').value=''; byId('adminDensity').value='';
  persistTempProducts(); refreshProductSelects(); renderProducts();
};

const originalRenderProducts=renderProducts;
renderProducts=function(filter=''){
  const q=filter.trim().toLocaleUpperCase('tr-TR');
  const rows=PRODUCTS.filter(p=>p.name.toLocaleUpperCase('tr-TR').includes(q));
  const auth=isAuthorized();
  byId('productRows').innerHTML=rows.map(p=>`<tr class="${p.name===selectedProductName?'selected':''}" data-product="${p.name.replace(/"/g,'&quot;')}">${auth?`<td class="admin-col"><input class="select-product" type="radio" name="prodsel" ${p.name===selectedProductName?'checked':''}></td>`:''}<td>${p.name}</td><td>${fmt(p.density,4)}</td></tr>`).join('');
  byId('productCount').textContent=`${rows.length} / ${PRODUCTS.length} ürün`;
  if(auth){
    byId('productRows').querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{
      selectedProductName=tr.dataset.product;
      const p=PRODUCTS.find(x=>x.name===selectedProductName);
      if(p){byId('adminName').value=p.name;byId('adminDensity').value=p.density;}
      renderProducts(byId('productSearch').value||'');
    }));
  }
}

if(!byId('fEntryDate').value) byId('fEntryDate').value='2024-06-28';
if(!byId('fCalcDate').value) byId('fCalcDate').value='2026-08-28';
loadTempProducts();
refreshProductSelects();
renderAuthState();
calcLT(); calcTL(); calcFire(); renderProducts(); renderHistory(); renderSourceState();

