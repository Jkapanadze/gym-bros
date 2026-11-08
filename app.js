const $ = (s) => document.querySelector(s);
const storeKey = 'rep-club-v1';
const initial = { names: ['Alex', 'Sam', 'Jordan'], workouts: {} };
let data;
try { data = { ...initial, ...JSON.parse(localStorage.getItem(storeKey) || '{}') }; } catch { data = { ...initial }; }
let shownMonth = new Date();
const today = new Date();
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const save = () => localStorage.setItem(storeKey, JSON.stringify(data));
const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderCrew(){
  const colors=['a','b','c'];
  $('#crew-list').innerHTML=data.names.map((name,i)=>`<div class="crew-person"><span class="avatar ${colors[i]}">${safe(name.trim().charAt(0).toUpperCase()||'?')}</span><span class="person-name">${safe(name)}</span><span class="person-status ${i===0?'in':''}">${i===0?'● COUNT ME IN':'READY WHEN YOU ARE'}</span></div>`).join('');
}
function renderGoal(){
  const start=new Date(today); start.setDate(today.getDate()-((today.getDay()+6)%7));
  const dates=Object.entries(data.workouts).filter(([k,w])=>w.done).filter(([k])=>{const d=new Date(`${k}T12:00:00`);return d>=start&&d<new Date(start.getFullYear(),start.getMonth(),start.getDate()+7)});
  const n=dates.length, pct=Math.min(100,Math.round(n/3*100));
  $('#goal-count').textContent=`${n} of 3 sessions`; $('#goal-percent').textContent=`${pct}%`; $('#progress-fill').style.width=`${pct}%`;
  $('#goal-message').textContent=n>=3?'You did it! The group chat is proud.':n===2?'One more and we hit our goal!':n===1?'First one down. Keep the good thing going!':'Every visit counts. Let’s get moving!';
}
function renderCalendar(){
  const y=shownMonth.getFullYear(),m=shownMonth.getMonth();
  $('#month-label').textContent=new Intl.DateTimeFormat('en',{month:'short',year:'numeric'}).format(shownMonth).toUpperCase();
  const first=new Date(y,m,1), offset=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
  let html='';
  for(let i=0;i<42;i++){
    let d,other=false;
    if(i<offset){d=new Date(y,m-1,prevDays-offset+i+1);other=true}
    else if(i>=offset+days){d=new Date(y,m+1,i-offset-days+1);other=true}
    else d=new Date(y,m,i-offset+1);
    const key=dateKey(d), w=data.workouts[key], isToday=key===dateKey(today);
    html+=`<button class="day${other?' other-month':''}${isToday?' today':''}${w?' planned':''}${w?.done?' completed':''}" data-date="${key}" aria-label="${new Intl.DateTimeFormat('en',{month:'long',day:'numeric'}).format(d)}${w?`, ${w.type}${w.done?', completed':''}`:''}">${d.getDate()}</button>`;
  }
  $('#calendar-grid').innerHTML=html;
  $('#calendar-grid').querySelectorAll('.day').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.date;if(data.workouts[k]){data.workouts[k].done=!data.workouts[k].done;save();renderAll();toast(data.workouts[k].done?'Nice work! Session checked off.':'Check-in removed.')}else openWorkout(k)}));
}
function renderAll(){renderCrew();renderCalendar();renderGoal()}
let toastTimer;
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
const workoutDialog=$('#workout-dialog'), namesDialog=$('#names-dialog');
function openWorkout(value=dateKey(today)){ $('#workout-date').value=value;workoutDialog.showModal(); }
$('#plan-workout').addEventListener('click',()=>openWorkout());
$('#today-button').addEventListener('click',()=>{shownMonth=new Date(today);renderCalendar();document.querySelector('.calendar-card').scrollIntoView({behavior:'smooth',block:'center'})});
$('#prev-month').addEventListener('click',()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);renderCalendar()});
$('#next-month').addEventListener('click',()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);renderCalendar()});
$('#workout-form').addEventListener('submit',(e)=>{e.preventDefault();const d=$('#workout-date').value;if(!d)return;data.workouts[d]={type:$('#workout-type').value,done:false};save();shownMonth=new Date(`${d}T12:00:00`);workoutDialog.close();renderAll();toast('It’s on the calendar. Who’s bringing the playlist?')});
function openNames(){data.names.forEach((n,i)=>$(`#name-${i+1}`).value=n);namesDialog.showModal()}
$('#edit-crew').addEventListener('click',openNames);$('#edit-names').addEventListener('click',openNames);
$('#names-form').addEventListener('submit',(e)=>{e.preventDefault();data.names=[1,2,3].map(i=>$(`#name-${i}`).value.trim()||initial.names[i-1]);save();namesDialog.close();renderCrew();toast('Crew roster updated!')});
$('#share-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied. Send it to the group chat!')}catch{toast('Copy this page’s link and send it to the group chat!')}});
renderAll();
