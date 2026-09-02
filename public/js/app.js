(() => {
  const $ = s => document.querySelector(s);
  const dashboard = $('#dashboard'), auth = $('#auth'), panel = $('#authPanel');
  const account = $('#accountBtn'), menu = $('#menu'), toast = $('#toast');
  let lunch = localStorage.bdhs_lunch || 'A';
  let mode = localStorage.bdhs_mode || 'auto';
  let now = new Date();
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toastMsg(t){toast.textContent=t;toast.classList.add('show');clearTimeout(toastMsg.t);toastMsg.t=setTimeout(()=>toast.classList.remove('show'),2500)}
  function showError(t){const e=$('#authError');if(e)e.innerHTML=`<div class="error">${esc(t)}</div>`}

  function renderAuth(m='login') {
    const copy={login:['Welcome back','Sign in to your BDHS schedule account.'],signup:['Create your account','Save your preferences and keep your schedule ready.'],forgot:['Forgot your password?','Enter your email and we\'ll send a verification code.'],verify:['Check your Gmail','We sent a 6-digit verification code. It expires in 10 minutes.'],change:['Set a new password','Choose a new password for your account.']}[m];
    let h=`<h2>${copy[0]}</h2><p class="sub">${copy[1]}</p>`;
    if(m==='login'||m==='signup'){
      if(m==='signup')h+=`<div class="field"><label>Display name</label><input id="name" maxlength="60" placeholder="Your name"></div>`;
      h+=`<div class="field"><label>Email</label><input id="email" type="email" autocomplete="email" placeholder="you@example.com"></div>
      <div class="field"><label>Password</label><input id="pass" type="password" autocomplete="${m==='login'?'current-password':'new-password'}" placeholder="At least 10 characters"></div>
      <label class="check"><input id="remember" type="checkbox" checked> Remember this device</label><div id="authError"></div>
      <button id="submit" class="primary">${m==='login'?'Log in':'Create account'}</button><div class="divider">OR</div>
      <button id="google" class="google">Continue with Google</button><div class="links"><button id="switch" class="link">${m==='login'?'Create an account':'I already have an account'}</button>${m==='login'?'<button id="forgot" class="link">Forgot password?</button>':''}</div>`;
    } else if(m==='forgot') {
      h+=`<div class="field"><label>Email</label><input id="email" type="email" placeholder="you@example.com"></div><div id="authError"></div><button id="send" class="primary">Send verification code</button><div class="links"><button id="back" class="link">Back to login</button></div>`;
    } else if(m==='verify') {
      h+=`<div class="field"><label>6-digit verification code</label><input id="code" class="code" inputmode="numeric" maxlength="6" placeholder="000000"></div><div id="authError"></div><button id="verify" class="primary">Verify code</button><div class="links"><button id="resend" class="link">Resend code</button></div>`;
    } else {
      h+=`<div class="field"><label>New password</label><input id="newpass" type="password" placeholder="At least 10 characters"></div><div class="field"><label>Confirm password</label><input id="confirm" type="password"></div><div id="authError"></div><button id="change" class="primary">Change password</button>`;
    }
    panel.innerHTML=h; bindAuth(m);
  }

  function bindAuth(m){
    if(m==='login'||m==='signup'){
      $('#submit').onclick=async()=>{try{const e=$('#email').value,p=$('#pass').value,r=$('#remember').checked;if(m==='login')await BDHSAuth.login(e,p,r);else await BDHSAuth.signup(e,$('#name').value,p,r);showDash();toastMsg('You\'re signed in.')}catch(e){showError(e.message)}};
      $('#switch').onclick=()=>renderAuth(m==='login'?'signup':'login');
      if($('#forgot'))$('#forgot').onclick=()=>renderAuth('forgot');
      $('#google').onclick=()=>{try{if(!window.google?.accounts?.id)throw Error('Google is still loading. Try again in a moment.');window.google.accounts.id.initialize({client_id:window.BDHS_GOOGLE_CLIENT_ID,callback:async r=>{try{await BDHSAuth.google(r.credential,$('#remember').checked);showDash()}catch(e){showError(e.message)}}});window.google.accounts.id.prompt()}catch(e){showError(e.message)}};
    }
    if(m==='forgot'){$('#send').onclick=async()=>{try{await BDHSAuth.forgot($('#email').value);renderAuth('verify');toastMsg('Check your Gmail for the code.')}catch(e){showError(e.message)}};$('#back').onclick=()=>renderAuth('login')}
    if(m==='verify'){$('#verify').onclick=async()=>{try{await BDHSAuth.verify($('#code').value);renderAuth('change')}catch(e){showError(e.message)}};$('#resend').onclick=async()=>{try{await BDHSAuth.forgot(BDHSAuth.state().resetEmail);toastMsg('A new code was sent.')}catch(e){showError(e.message)}}}
    if(m==='change')$('#change').onclick=async()=>{try{if($('#newpass').value!==$('#confirm').value)throw Error('The passwords do not match.');await BDHSAuth.change($('#newpass').value);renderAuth('login');toastMsg('Password changed. You can now log in.')}catch(e){showError(e.message)}};
  }
  function showAuth(){dashboard.hidden=true;auth.hidden=false;account.hidden=true;renderAuth()}
  function showDash(){auth.hidden=true;dashboard.hidden=false;updateAccount();render()}
  function updateAccount(){const u=BDHSAuth.state().user;if(!u){account.hidden=false;account.textContent='Sign in';return}account.hidden=false;account.textContent=u.display_name||u.email;$('#menuName').textContent=u.display_name||'Account';$('#menuEmail').textContent=u.email}
  account.onclick=()=>{if(!BDHSAuth.state().user)return showAuth();menu.hidden=!menu.hidden};
  $('#logoutBtn').onclick=async()=>{await BDHSAuth.logout();menu.hidden=true;showAuth();toastMsg('Logged out.')};
  document.querySelectorAll('.lunch').forEach(b=>b.onclick=()=>{lunch=b.dataset.lunch;localStorage.bdhs_lunch=lunch;mode='auto';localStorage.bdhs_mode='auto';$('#scheduleSelect').value='auto';render()});
  $('#scheduleSelect').onchange=e=>{mode=e.target.value;localStorage.bdhs_mode=mode;render()};
  function render(){
    now=new Date();
    $('#dateText').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    $('#timeText').textContent=now.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit'});
    const base=mode==='auto'?getAutomaticBaseSchedule(now):mode.split('-')[0];
    const key=mode==='auto'?getScheduleKey(base,lunch):mode;
    const s=getSchedule(key), special=BDHS_SPECIAL[base];
    $('#scheduleSelect').value=mode;document.querySelectorAll('.lunch').forEach(b=>b.classList.toggle('active',b.dataset.lunch===(key.split('-')[1]||lunch)));
    $('#todayLabel').textContent=now.toLocaleDateString(undefined,{weekday:'long'}).toUpperCase();
    $('#scheduleBadge').textContent=special?.title||BDHS_SCHEDULE_NAMES[base]||base;
    $('#scheduleTitle').textContent=special?.title||"Today's Schedule";
    $('#scheduleSubtitle').textContent=special?.subtitle||`${BDHS_SCHEDULE_NAMES[base]||base} • Lunch ${key.split('-')[1]||lunch}`;
    $('#daysLeft').textContent=getSchoolDaysLeft(now); const tb=$('#scheduleTable');tb.innerHTML='';
    if(!s.length){tb.innerHTML=`<tr><td colspan="4">No period times are loaded for <b>${esc(key)}</b>. Put your exact original times in <code>public/js/schedules.js</code>.</td></tr>`;$('#currentPeriod').textContent=special?'No classes':'Schedule data needed';$('#countdown').textContent='--:--';$('#periodRange').textContent='';$('#nextPeriod').textContent='—';$('#nextRange').textContent='—';return}
    const cm=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;let cur=-1,nxt=-1;
    s.forEach((p,i)=>{const a=minutesFromMidnight(p[1]),b=minutesFromMidnight(p[2]);if(cm>=a&&cm<b)cur=i;if(nxt<0&&cm<a)nxt=i});
    s.forEach((p,i)=>{const tr=document.createElement('tr'),st=i<cur?'Finished':i===cur?'Now':'Upcoming',cl=i<cur?'status-past':i===cur?'status-current':'';tr.innerHTML=`<td>${esc(p[0])}</td><td>${formatTime12(p[1])}</td><td>${formatTime12(p[2])}</td><td class="${cl}">${st}</td>`;tb.appendChild(tr)});
    if(cur>=0){const p=s[cur],rem=Math.max(0,Math.round(minutesFromMidnight(p[2])*60-cm*60));$('#currentPeriod').textContent=p[0];$('#countdown').textContent=`${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}`;$('#periodRange').textContent=`${formatTime12(p[1])} – ${formatTime12(p[2])}`}
    else{$('#currentPeriod').textContent=cm<minutesFromMidnight(s[0][1])?'Before school':'School day complete';$('#countdown').textContent='--:--';$('#periodRange').textContent=''}
    if(nxt>=0){const p=s[nxt];$('#nextPeriod').textContent=p[0];$('#nextRange').textContent=`${formatTime12(p[1])} – ${formatTime12(p[2])}`}else{$('#nextPeriod').textContent='No more periods';$('#nextRange').textContent="You're done for today."}
  }
  async function init(){try{await BDHSAuth.me();BDHSAuth.state().user?showDash():showAuth()}catch{showAuth()}render();setInterval(render,1000)}
  addEventListener('bdhs-auth-change',updateAccount);$('#themeBtn').onclick=()=>document.body.classList.toggle('light');init();
})();
