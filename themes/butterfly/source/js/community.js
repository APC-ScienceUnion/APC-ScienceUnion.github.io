(() => {
  'use strict';
  if (window.APCCommunity) return;
  window.APCCommunity = true;
  const english = () => location.pathname.startsWith('/en/');
  const t = (zh, en) => english() ? en : zh;
  const accountUrl = () => english() ? '/en/account/' : '/account/';
  let user = null;
  let apiBase = '';
  let active = 0;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function button(label, action, primary = false) {
    const node = el('button', primary ? 'apc-primary' : '', label);
    node.type = 'button'; if (action) node.addEventListener('click', action); return node;
  }
  function status(parent) {
    const node = el('p', 'apc-status'); node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); parent.append(node);
    return (message, error = false) => { node.textContent = message; node.dataset.error = String(error); };
  }
  function field(form, label, name, type = 'text', autocomplete = '') {
    const wrapper = el('label', '', label), input = el(type === 'textarea' ? 'textarea' : 'input');
    input.name = name; input.required = true;
    if (type !== 'textarea') input.type = type;
    if (autocomplete) input.autocomplete = autocomplete;
    if (name === 'nickname') { input.minLength = 2; input.maxLength = 24; }
    if (type === 'password') { input.minLength = 10; input.maxLength = 256; }
    if (name === 'code') { input.inputMode = 'numeric'; input.pattern = '[0-9]{6}'; input.maxLength = 6; }
    wrapper.append(input); form.append(wrapper); return input;
  }
  async function api(route, data, method = 'POST') {
    if (!apiBase) throw new Error(t('社区服务正在准备中，请稍后再来。', 'The community service is being prepared. Please check back soon.'));
    const response = await fetch(apiBase + '/api' + route, { method: data === undefined ? 'GET' : method, credentials: 'include', cache: 'no-store',
      headers: data === undefined ? {} : { 'Content-Type': 'application/json', 'X-Community-Request': '1' },
      body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(20000) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t('连接失败，请稍后再试。', 'Connection failed. Please try again.'));
    return result;
  }
  function handle(form, submit, fn) {
    const show = status(form);
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      submit.disabled = true; show(t('正在处理…', 'Working…'));
      try { await fn(Object.fromEntries(new FormData(form)), show); }
      catch (error) { show(error.message, true); }
      finally { submit.disabled = false; }
    });
    return show;
  }
  function codeButton(form, purpose, email, password) {
    const send = button(t('发送验证码', 'Send code'), async () => {
      if (!email.reportValidity() || (password && !password.reportValidity())) return;
      send.disabled = true;
      try {
        const result = await api('/auth/code', { email: email.value, purpose, password: password?.value });
        show(result.message);
        let left = 60; send.textContent = `${left}s`;
        const timer = setInterval(() => {
          if (!send.isConnected || --left <= 0) { clearInterval(timer); send.disabled = false; send.textContent = t('发送验证码', 'Send code'); }
          else send.textContent = `${left}s`;
        }, 1000);
      } catch (error) { send.disabled = false; show(error.message, true); }
    });
    form.append(send); const show = status(form); return send;
  }
  function avatar(seed) {
    // Generated entirely in the browser from a random server seed; no avatar tracking service.
    const safe = /^[a-f0-9]{32}$/.test(seed) ? seed : '1234567890abcdef1234567890abcdef';
    const hue = parseInt(safe.slice(0,4), 16) % 360;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 70 70'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('apc-avatar');
    const rect = (x,y,w,h,fill) => { const n = document.createElementNS(svg.namespaceURI,'rect'); for (const [k,v] of Object.entries({x,y,width:w,height:h,fill})) n.setAttribute(k,String(v)); svg.append(n); };
    rect(0,0,70,70,`hsl(${hue} 45% 92%)`);
    for (let y=0;y<5;y++) for(let x=0;x<3;x++) if (parseInt(safe[y*3+x],16)%2) {
      rect(10+x*10,10+y*10,10,10,`hsl(${hue} 48% 42%)`); if(x<2) rect(50-x*10,10+y*10,10,10,`hsl(${hue} 48% 42%)`);
    }
    return svg;
  }
  function identity(person) {
    const name = el('span','apc-comment-name',person.nickname);
    if(person.role === 'admin') name.append(el('span','apc-badge',t('站长','Admin')));
    return name;
  }
  function auth(root, mode = 'login', notice = '') {
    root.replaceChildren();
    const box = el('div','apc-auth'), tabs = el('nav','apc-tabs'); tabs.setAttribute('aria-label',t('账号操作','Account actions'));
    for (const [key,label] of [['login',t('登录','Sign in')],['register',t('注册','Register')],['reset',t('找回密码','Reset password')]]) {
      const tab = button(label, () => auth(root,key)); tab.setAttribute('aria-current',String(mode === key)); tabs.append(tab);
    }
    box.append(tabs);
    box.append(el('p','apc-muted',mode === 'register' ? t('用邮箱创建你的身份。昵称和随机头像会出现在评论中，邮箱不会公开。','Create your identity with email. Your nickname and random avatar are public; your email stays private.') : mode === 'reset' ? t('验证绑定邮箱后，必须设置一个与原来不同的新密码。','Verify your email and choose a new password different from the old one.') : t('欢迎回来，继续这场关于科学的对话。','Welcome back to the conversation.')));
    if(notice) box.append(el('p','apc-status',notice));
    const form = el('form','apc-form');
    const email = field(form,t('邮箱','Email'),'email','email','email');
    if(mode === 'register') field(form,t('昵称（2–24 字）','Nickname (2–24 characters)'),'nickname','text','nickname');
    if(mode !== 'login') { codeButton(form,mode,email); field(form,t('邮箱验证码','Email code'),'code','text','one-time-code'); }
    const password = field(form,mode === 'login' ? t('密码','Password') : t('新密码（至少 10 个字符）','New password (at least 10 characters)'),'password','password',mode === 'login' ? 'current-password' : 'new-password');
    let confirm;
    if(mode !== 'login') confirm = field(form,t('确认密码','Confirm password'),'confirm','password','new-password');
    const submit = button(mode === 'login' ? t('登录','Sign in') : mode === 'register' ? t('创建账号','Create account') : t('重置密码','Reset password'),null,true);
    submit.type = 'submit'; form.append(submit);
    handle(form,submit,async (data,show) => {
      if(confirm && confirm.value !== password.value) throw new Error(t('两次输入的密码不一致。','Passwords do not match.'));
      const result = await api('/auth/' + mode,data);
      if(mode === 'reset') { user=null; auth(root,'login',result.message); await refreshThreads(); }
      else { user=result.user; renderAccount(root); await refreshThreads(); await loadStats(); }
    });
    box.append(form); root.append(box);
  }
  function renderAccount(root) {
    if(!user) return auth(root);
    root.replaceChildren();
    const summary = el('div','apc-profile'), details = el('div'); details.append(identity(user),el('div','apc-muted',user.email));
    summary.append(avatar(user.avatarSeed),details); root.append(summary);
    const actions = el('div','apc-actions');
    const logout = button(t('退出登录','Sign out'),async () => {
      logout.disabled = true;
      try { await api('/auth/logout',{}); user=null; auth(root); await refreshThreads(); }
      catch(error) { notice(error.message,true); logout.disabled=false; }
    }); actions.append(logout); root.append(actions); const notice=status(root);
    const panels=el('div','apc-panels'); root.append(panels);
    function panel(title) { const section=el('section','apc-panel'); section.append(el('h3','',title)); panels.append(section); return section; }
    const profile=panel(t('我的昵称','Your nickname')), profileForm=el('form','apc-form');
    const nickname=field(profileForm,t('显示在评论和留言里的名字','Your name in comments'),'nickname','text','nickname'); nickname.value=user.nickname;
    const save=button(t('保存昵称','Save nickname'),null,true); save.type='submit'; profileForm.append(save);
    handle(profileForm,save,async data => { user=(await api('/me',data,'PATCH')).user; renderAccount(root); await refreshThreads(); }); profile.append(profileForm);
    const security=panel(t('修改密码','Change password')), passwordForm=el('form','apc-form');
    field(passwordForm,t('当前密码','Current password'),'currentPassword','password','current-password');
    field(passwordForm,t('新密码（至少 10 个字符）','New password (at least 10 characters)'),'password','password','new-password');
    field(passwordForm,t('确认新密码','Confirm new password'),'confirm','password','new-password');
    const change=button(t('修改并重新登录','Change and sign in again'),null,true); change.type='submit'; passwordForm.append(change);
    handle(passwordForm,change,async data => {
      if(data.password!==data.confirm) throw new Error(t('两次输入的密码不一致。','Passwords do not match.'));
      const result=await api('/me/password',data); user=null; auth(root,'login',result.message); await refreshThreads();
    }); security.append(passwordForm);
    const binding=panel(t('绑定邮箱','Recovery email'));
    binding.append(el('p','apc-muted',t('当前邮箱已验证，可用于找回密码。更换邮箱需要验证新邮箱和当前密码。','Your verified email can recover your account. Changing it requires your password and verification of the new email.')));
    if(user.role==='admin') binding.append(el('p','',t('站长邮箱由服务器配置管理。','The administrator email is managed on the server.')));
    else {
      const form=el('form','apc-form'), email=field(form,t('新邮箱','New email'),'email','email','email');
      const password=field(form,t('当前密码','Current password'),'password','password','current-password');
      codeButton(form,'bind',email,password); field(form,t('新邮箱验证码','Verification code'),'code','text','one-time-code');
      const submit=button(t('确认更换邮箱','Update email'),null,true); submit.type='submit'; form.append(submit);
      handle(form,submit,async data => { user=(await api('/me/email',data)).user; renderAccount(root); }); binding.append(form);
    }
    const privacy=panel(t('你的社区身份','Your community identity'));
    privacy.append(el('p','apc-muted',t('头像由随机种子生成，昵称修改后会同步到过去的评论。邮箱仅用于身份验证与找回密码。验证码邮件由 Resend 发送。','Your avatar comes from a random seed. Nickname changes apply to earlier comments. Email is used only for verification and recovery; verification mail is delivered by Resend.')));
  }
  async function renderThread(root) {
    const container=root.querySelector('.apc-thread'); if(!container) return;
    container.replaceChildren(); const show=status(container);
    const topic=root.dataset.topic;
    if(user) {
      const form=el('form','apc-form'); const signed=el('div','apc-comment-head'); signed.append(avatar(user.avatarSeed),identity(user)); form.append(signed);
      const text=field(form,t(topic==='guestbook'?'写下你的留言':'写下你的评论',topic==='guestbook'?'Leave a message':'Write a comment'),'body','textarea'); text.maxLength=2000;
      const row=el('div','apc-actions'), send=button(t('发表','Post'),null,true), count=el('span','apc-counter','0 / 2000'); send.type='submit';
      text.addEventListener('input',()=>{count.textContent=`${[...text.value].length} / 2000`;}); row.append(send,count); form.append(row);
      handle(form,send,async data=>{await api('/comments',{...data,topic}); await renderThread(root);}); container.append(form);
    } else {
      const prompt=el('p','apc-muted'), link=el('a','apc-button',t('登录 / 注册后参与','Sign in / register to join')); link.href=accountUrl(); prompt.append(link); container.append(prompt);
    }
    const list=el('div'); container.append(list); let cursor=null;
    const more=button(t('加载更多','Load more'),()=>load(false));
    async function load(first) {
      more.disabled=true; show('');
      try {
        const result=await api(`/comments?topic=${encodeURIComponent(topic)}&limit=${topic==='guestbook'?5:20}${!first && cursor ? '&before='+cursor : ''}`);
        if(first && !result.items.length) list.append(el('p','apc-muted',t('还没有人发言，来写下第一句吧。','No messages yet. Start the conversation.')));
        for(const item of result.items) {
          const card=el('article','apc-comment'), head=el('div','apc-comment-head'), meta=el('div'), date=el('time','',new Date(item.createdAt).toLocaleString(english()?'en-GB':'zh-CN'));
          date.dateTime=new Date(item.createdAt).toISOString(); meta.append(identity(item.user),date); head.append(avatar(item.user.avatarSeed),meta);
          card.append(head,el('p','apc-comment-body',item.body));
          if(user && (user.id===item.user.id || user.role==='admin')) {
            const remove=button(t('移除','Remove'),()=>{
              const controls=el('div','apc-actions');
              controls.append(el('span','apc-muted',t('从评论区移除这条内容？','Remove this message?')));
              const yes=button(t('确认移除','Confirm'),async()=>{
                yes.disabled=true;
                try{await api('/comments/'+item.id,{},'DELETE'); await renderThread(root);}catch(error){show(error.message,true);yes.disabled=false;}
              });
              controls.append(yes,button(t('取消','Cancel'),()=>{controls.remove();remove.hidden=false;})); remove.hidden=true; card.append(controls);
            }); remove.classList.add('apc-delete'); card.append(remove);
          }
          list.append(card);
        }
        cursor=result.nextCursor; more.hidden=!cursor;
      }catch(error){show(error.message,true); more.hidden=false; more.textContent=t('重试','Retry');}
      finally{more.disabled=false;}
    }
    container.append(more); await load(true);
  }
  async function refreshThreads(){await Promise.all([...document.querySelectorAll('.apc-community[data-topic]')].map(renderThread));}
  async function loadStats(){
    const nodes=document.querySelectorAll('[data-community-users]'); if(!nodes.length)return;
    try{const result=await api('/stats');nodes.forEach(n=>{n.textContent=result.registeredUsers.toLocaleString();n.removeAttribute('title');});}
    catch{nodes.forEach(n=>{n.textContent='—';n.title=t('暂时无法获取','Temporarily unavailable');});}
  }
  async function init(){
    const generation=++active;
    apiBase=document.querySelector('meta[name=community-api]')?.content || '';
    if(['localhost','127.0.0.1'].includes(location.hostname)) apiBase=`http://${location.hostname}:8787`;
    const root=document.getElementById('apc-account');
    let available=true;
    try { user=(await api('/session')).user; }
    catch(error){
      user=null;available=false;
      if(root){root.replaceChildren();const show=status(root);show(error.message,true);root.append(button(t('重新连接','Reconnect'),init));}
    }
    if(generation!==active)return;
    if(root && available)renderAccount(root);
    await Promise.all([refreshThreads(),loadStats()]);
  }
  document.addEventListener('pjax:complete',init);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
