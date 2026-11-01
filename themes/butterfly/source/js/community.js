(() => {
  'use strict';
  if (window.APCCommunity) return;
  window.APCCommunity = true;
  const english = () => location.pathname.startsWith('/en/');
  const t = (zh, en) => english() ? en : zh;
  const accountUrl = () => english() ? '/en/account/' : '/account/';
  let user = null;
  let verification = {available:false,required:false,verified:false};
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
  async function loadSession() {
    const result=await api('/session');user=result.user;
    verification={available:result.identityAvailable===true,required:result.identityRequired===true,...result.identity};
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
  function privacyNotice(parent) {
    const details=el('details','apc-privacy');
    details.append(el('summary','',t('账号与隐私说明','Account and privacy information')));
    for(const [zh,en] of [
      ['昵称、随机头像及发表的内容会公开；邮箱和手机号不会显示在评论中。','Your nickname, random avatar and posts are public. Your email and phone are not shown in comments.'],
      ['邮箱用于登录、验证码和找回密码，验证码邮件由 Resend 发送。密码保存为不可逆校验值；找回时必须重置密码。','Email is used for sign-in, verification and recovery; Resend delivers verification emails. Passwords are stored as one-way hashes and recovery requires a new password.'],
      ['首次发言前，通过 Authing 接收微信授权的手机号用于身份验证。本站加密保存号码，个人中心只显示脱敏号码；此授权不会把本站密码交给 Authing 或微信。','Before your first post, Authing supplies your WeChat-authorized phone for identity verification. The blog stores it encrypted and displays a masked number. Your blog password is not shared with Authing or WeChat.'],
      ['登录使用必要的会话 Cookie。你可以修改昵称、更换邮箱、退出登录，或移除自己的评论；移除后内容不再公开，但后台记录和备份可能保留。','A necessary session cookie keeps you signed in. You can change your nickname or email, sign out, and remove your own comments. Removed posts are hidden publicly; server records and backups may remain.']
    ])details.append(el('p','apc-muted',t(zh,en)));
    parent.append(details);
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
      else { await loadSession(); renderAccount(root); await refreshThreads(); await loadStats(); }
    });
    box.append(form); privacyNotice(box); root.append(box);
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
    if(verification.available||verification.required)renderVerification(panel(t('微信手机号验证','WeChat phone verification')),root);
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
    privacyNotice(privacy);
    if(user.role==='admin')renderModeration(panel(t('评论与留言管理','Comment management')));
  }
  function removalButton(item,card,onRemoved,show) {
    const remove=button(t('移除','Remove'),()=>{
      const controls=el('div','apc-actions');
      controls.append(el('span','apc-muted',t('从评论区移除这条内容？','Remove this message?')));
      const yes=button(t('确认移除','Confirm'),async()=>{
        yes.disabled=true;
        try{await api('/comments/'+item.id,{},'DELETE');await onRemoved();}catch(error){show(error.message,true);yes.disabled=false;}
      });
      controls.append(yes,button(t('取消','Cancel'),()=>{controls.remove();remove.hidden=false;}));remove.hidden=true;card.append(controls);
    });remove.classList.add('apc-delete');return remove;
  }
  async function renderModeration(section) {
    section.classList.add('apc-moderation');
    const accountId=user.id,show=status(section),list=el('div');section.append(list);
    let cursor=null;
    const more=button(t('加载更多','Load more'),()=>load());section.append(more);
    async function load(){
      more.disabled=true;show('');
      try{
        const result=await api('/admin/comments?limit=20'+(cursor?'&before='+cursor:''));
        if(!section.isConnected||user?.id!==accountId)return;
        if(!cursor&&!result.items.length)list.append(el('p','apc-muted',t('暂无评论或留言。','No comments or messages yet.')));
        for(const item of result.items){
          const card=el('article','apc-comment'),head=el('div','apc-comment-head'),meta=el('div');
          const date=el('time','',new Date(item.createdAt).toLocaleString(english()?'en-GB':'zh-CN'));date.dateTime=new Date(item.createdAt).toISOString();
          meta.append(identity(item.user),date);head.append(avatar(item.user.avatarSeed),meta);card.append(head);
          // Canonical discussion IDs are shared by translations; they are not URLs.
          let topicLabel=item.topic.replace(/^\/articles\//,'');
          try{topicLabel=decodeURIComponent(topicLabel);}catch{ /* Keep malformed old labels as plain text. */ }
          const topic=el('p','apc-muted',item.topic==='guestbook'?t('首页留言板','Home guestbook'):t('文章：','Article: ')+topicLabel);
          card.append(topic,el('p','apc-comment-body',item.body),removalButton(item,card,async()=>{card.remove();await refreshThreads();},show));list.append(card);
        }
        cursor=result.nextCursor;more.hidden=!cursor;
      }catch(error){show(error.message,true);more.hidden=false;more.textContent=t('重试','Retry');}
      finally{more.disabled=false;}
    }
    await load();
  }
  async function renderVerification(section,root) {
    const title=section.firstChild,loading=el('p','apc-muted',t('正在读取验证状态…','Loading verification status…'));section.append(loading);
    const accountId=user.id;
    try {
      if(!verification.available){loading.textContent=t('手机号验证暂未开放。','Phone verification is not available yet.');return;}
      const result=await api('/identity/status');
      if(!section.isConnected||user?.id!==accountId)return;
      section.replaceChildren(title);
      if(result.verified){
        verification={...verification,...result};
        section.append(el('p','apc-verified',t('已验证 · ','Verified · ')+result.phoneMasked),el('p','apc-muted',t('可参与评论与留言。手机号不会公开，找回密码仍使用绑定邮箱。','You can post comments and messages. Your phone stays private; use your email to recover your account.')));return;
      }
      if(result.pending){
        section.append(el('p','',t('请确认将此手机号绑定到当前账号：','Confirm this phone belongs to the current account:')),el('p','apc-verified',result.pending.phoneMasked),el('p','apc-muted',user.email));
        const actions=el('div','apc-actions'),show=status(section);
        const confirm=button(t('确认绑定此手机号','Confirm phone binding'),async()=>{
          confirm.disabled=true;
          try{await api('/identity/confirm',{receipt:result.pending.receipt,confirm:true});await loadSession();renderAccount(root);await refreshThreads();}
          catch(error){show(error.message,true);confirm.disabled=false;}
        },true);
        const cancel=button(t('不是我的号码，取消','Wrong number — cancel'),async()=>{
          cancel.disabled=true;
          try{await api('/identity/cancel',{});renderAccount(root);}catch(error){show(error.message,true);cancel.disabled=false;}
        });actions.append(confirm,cancel);section.append(actions);return;
      }
      const callbackStatus=new URLSearchParams(location.search).get('identity');
      if(callbackStatus==='failed')section.append(el('p','apc-status',t('上次验证未完成，请重新发起。','The last verification did not complete. Please try again.')));
      section.append(el('p','apc-muted',t('首次发言前，用微信授权手机号。验证后仍使用本站密码登录；手机号不会出现在评论中。','Authorize your phone through WeChat before your first post. Keep signing in with your blog password; your phone will not appear in comments.')));
      section.append(el('p','apc-muted',t('建议在电脑打开此页，前往验证后用手机微信扫描二维码。完成一次绑定后，手机上也可用邮箱和密码登录、发表评论。','For verification, open this page on a computer and scan the code with WeChat on your phone. After binding once, you can sign in and comment on your phone using your email and password.')));
      const form=el('form','apc-form');field(form,t('确认本站密码','Confirm your blog password'),'password','password','current-password');
      const consent=el('label','apc-consent'),checkbox=el('input');checkbox.type='checkbox';checkbox.required=true;checkbox.name='consent';
      consent.append(checkbox,el('span','',t('同意通过 Authing 接收微信授权手机号，并由本站加密保存以验证评论身份。','I agree to share my WeChat-authorized phone through Authing and let this blog store it encrypted for comment verification.')));form.append(consent);
      const start=button(t('前往微信扫码验证','Verify by scanning with WeChat'),null,true);start.type='submit';form.append(start);
      handle(form,start,async data=>{
        const response=await api('/identity/start',{password:data.password,consent:checkbox.checked});
        const destination=new URL(response.authorizationUrl);
        if(destination.protocol!=='https:'||destination.username||destination.password||destination.port||!(/^[a-z0-9-]+\.authing\.cn$/).test(destination.hostname)||destination.pathname!=='/oidc/auth')throw new Error(t('验证地址无效，请稍后重试。','Invalid verification address. Please try again later.'));
        location.assign(destination.href);
      });section.append(form);
    }catch(error){if(!section.isConnected||user?.id!==accountId)return;loading.textContent=error.message;loading.className='apc-status';loading.dataset.error='true';section.append(loading,button(t('重试','Retry'),()=>renderAccount(root)));}
  }
  async function renderThread(root) {
    const container=root.querySelector('.apc-thread'); if(!container) return;
    container.replaceChildren(); const show=status(container);
    const topic=root.dataset.topic;
    if(user && (!verification.required||verification.verified)) {
      const form=el('form','apc-form'); const signed=el('div','apc-comment-head'); signed.append(avatar(user.avatarSeed),identity(user)); form.append(signed);
      const text=field(form,t(topic==='guestbook'?'写下你的留言':'写下你的评论',topic==='guestbook'?'Leave a message':'Write a comment'),'body','textarea'); text.maxLength=2000;
      const row=el('div','apc-actions'), send=button(t('发表','Post'),null,true), count=el('span','apc-counter','0 / 2000'); send.type='submit';
      text.addEventListener('input',()=>{count.textContent=`${[...text.value].length} / 2000`;}); row.append(send,count); form.append(row);
      handle(form,send,async data=>{await api('/comments',{...data,topic}); await renderThread(root);}); container.append(form);
    } else {
      const prompt=el('p','apc-muted'), link=el('a','apc-button',user?t('验证手机号后参与','Verify your phone to join'):t('登录 / 注册后参与','Sign in / register to join')); link.href=accountUrl(); prompt.append(link); container.append(prompt);
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
            card.append(removalButton(item,card,()=>renderThread(root),show));
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
    try { await loadSession(); }
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
