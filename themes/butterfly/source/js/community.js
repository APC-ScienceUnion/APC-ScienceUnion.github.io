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
  function passwordMatch(password, confirm) {
    confirm.setAttribute('aria-label',confirm.parentElement.textContent);
    const wrap=el('span','apc-password-wrap'), mark=el('span','apc-password-match');
    mark.setAttribute('role','status'); mark.setAttribute('aria-live','polite');
    mark.hidden=true; confirm.before(wrap); wrap.append(confirm,mark);
    const update=()=>{
      const hasConfirmation=confirm.value.length>0, matches=password.value===confirm.value;
      mark.hidden=!hasConfirmation;
      mark.dataset.match=String(matches);
      mark.textContent=matches?'✓':'×';
      const message=t(matches?'两次密码一致':'两次密码不一致',matches?'Passwords match':'Passwords do not match');
      mark.setAttribute('aria-label',hasConfirmation?message:''); mark.title=hasConfirmation?message:'';
      confirm.setAttribute('aria-invalid',String(hasConfirmation&&!matches));
      confirm.setCustomValidity(hasConfirmation&&!matches?message:'');
    };
    password.addEventListener('input',update); confirm.addEventListener('input',update);
    password.addEventListener('change',update); confirm.addEventListener('change',update); update();
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
    details.append(el('summary','',t('隐私说明','Privacy')));
    for(const [zh,en] of [
      ['本站使用邮箱提供登录与密码找回，使用授权手机号验证发言身份，并通过必要的 Cookie 保持登录。昵称、头像和发言公开，邮箱与手机号不公开。','We use email for sign-in and account recovery, your authorized phone to verify your posting identity, and necessary cookies to keep you signed in. Nicknames, avatars and posts are public; email addresses and phone numbers are not.'],
      ['你可以管理个人资料或移除自己的发言。账号使用期间保存必要资料；移除的发言不再公开，后台记录和备份可能保留。','You can manage your profile and remove your posts. Necessary account information is retained while your account is in use. Removed posts are no longer public; server records and backups may remain.']
      ,['为保障安全，本站记录访问时间、IP、端口、浏览器信息和账号操作，安全日志至少保存六个月。','For security, we record access times, IP addresses, ports, browser information and account activity. Security logs are kept for at least six months.']
    ])details.append(el('p','apc-muted',t(zh,en)));
    const providers=el('details','apc-privacy-services'); providers.append(el('summary','',t('第三方服务','Third-party services')));
    providers.append(el('p','apc-muted',t('Resend 接收邮箱及验证码邮件内容以投递邮件；Authing 与微信处理你授权的手机号以完成身份验证。','Resend receives your email address and verification email content to deliver messages. Authing and WeChat process your authorized phone for identity verification.'))); details.append(providers);
    const contact=el('p','apc-muted',t('个人信息查询、更正、删除或注销申请，请','For requests to access, correct or delete personal information, or close an account, ')), link=el('a','',t('联系站长','contact the site owner'));
    link.href=english()?'/en/about/':'/about/'; contact.append(link); details.append(contact);
    parent.append(details);
  }
  function auth(root, mode = 'login', notice = '') {
    root.replaceChildren();
    const box = el('div','apc-auth');
    box.append(el('h2','apc-auth-title',mode==='login'?t('登录','Sign in'):mode==='register'?t('创建账号','Create account'):t('找回密码','Reset password')));
    if(notice) box.append(el('p','apc-status',notice));
    const form = el('form','apc-form');
    const email = field(form,t('邮箱','Email'),'email','email','email');
    if(mode === 'register') field(form,t('昵称（2–24 字）','Nickname (2–24 characters)'),'nickname','text','nickname');
    if(mode !== 'login') { codeButton(form,mode,email); field(form,t('邮箱验证码','Email code'),'code','text','one-time-code'); }
    const password = field(form,mode === 'login' ? t('密码','Password') : t('新密码（至少 10 个字符）','New password (at least 10 characters)'),'password','password',mode === 'login' ? 'current-password' : 'new-password');
    let confirm;
    if(mode !== 'login') { confirm = field(form,t('确认密码','Confirm password'),'confirm','password','new-password'); passwordMatch(password,confirm); }
    const submit = button(mode === 'login' ? t('登录','Sign in') : mode === 'register' ? t('创建账号','Create account') : t('重置密码','Reset password'),null,true);
    submit.type = 'submit'; form.append(submit);
    handle(form,submit,async (data,show) => {
      if(confirm && confirm.value !== password.value) throw new Error(t('两次输入的密码不一致。','Passwords do not match.'));
      const result = await api('/auth/' + mode,data);
      if(mode === 'reset') { user=null; auth(root,'login',result.message); await refreshThreads(); }
      else { await loadSession(); renderAccount(root); await refreshThreads(); await loadStats(); }
    });
    box.append(form);
    const links=el('nav','apc-auth-links'); links.setAttribute('aria-label',t('账号操作','Account actions'));
    for(const [key,label] of [['login',t('返回登录','Back to sign in')],['register',t('注册','Register')],['reset',t('找回密码','Forgot password')]]) {
      if(key===mode)continue;
      const link=button(label,()=>auth(root,key)); links.append(link);
    }
    box.append(links); privacyNotice(box); root.append(box);
  }
  function renderAccount(root) {
    if(!user) return auth(root);
    root.replaceChildren();
    const summary = el('div','apc-profile'), details = el('div','apc-profile-details'); details.append(identity(user),el('div','apc-muted',user.email));
    summary.append(avatar(user.avatarSeed),details); root.append(summary);
    const logout = button(t('退出登录','Sign out'),async () => {
      logout.disabled = true;
      try { await api('/auth/logout',{}); user=null; auth(root); await refreshThreads(); }
      catch(error) { notice(error.message,true); logout.disabled=false; }
    }); logout.classList.add('apc-logout'); summary.append(logout); const notice=status(root);
    const panels=el('div','apc-panels'); root.append(panels);
    function panel(title) { const section=el('section','apc-panel'); section.append(el('h3','',title)); panels.append(section); return section; }
    if(verification.available||verification.required)renderVerification(panel(t('微信手机号验证','WeChat phone verification')),root);
    const profile=panel(t('我的昵称','Your nickname')), profileForm=el('form','apc-form');
    const nickname=field(profileForm,t('昵称','Nickname'),'nickname','text','nickname'); nickname.value=user.nickname;
    const save=button(t('保存昵称','Save nickname'),null,true); save.type='submit'; profileForm.append(save);
    handle(profileForm,save,async data => { user=(await api('/me',data,'PATCH')).user; renderAccount(root); await refreshThreads(); }); profile.append(profileForm);
    const security=panel(t('修改密码','Change password')), passwordForm=el('form','apc-form');
    field(passwordForm,t('当前密码','Current password'),'currentPassword','password','current-password');
    const newPassword=field(passwordForm,t('新密码（至少 10 个字符）','New password (at least 10 characters)'),'password','password','new-password');
    const confirmation=field(passwordForm,t('确认新密码','Confirm new password'),'confirm','password','new-password');
    passwordMatch(newPassword,confirmation);
    const change=button(t('修改并重新登录','Change and sign in again'),null,true); change.type='submit'; passwordForm.append(change);
    handle(passwordForm,change,async data => {
      if(data.password!==data.confirm) throw new Error(t('两次输入的密码不一致。','Passwords do not match.'));
      const result=await api('/me/password',data); user=null; auth(root,'login',result.message); await refreshThreads();
    }); security.append(passwordForm);
    const binding=panel(t('绑定邮箱','Recovery email'));
    binding.append(el('p','apc-verified',t('已验证','Verified')),el('p','apc-muted',user.email));
    if(user.role==='admin') binding.append(el('p','apc-muted',t('站长邮箱','Site owner email')));
    else {
      const form=el('form','apc-form'), email=field(form,t('新邮箱','New email'),'email','email','email');
      const password=field(form,t('当前密码','Current password'),'password','password','current-password');
      codeButton(form,'bind',email,password); field(form,t('新邮箱验证码','Verification code'),'code','text','one-time-code');
      const submit=button(t('确认更换邮箱','Update email'),null,true); submit.type='submit'; form.append(submit);
      handle(form,submit,async data => { user=(await api('/me/email',data)).user; renderAccount(root); }); binding.append(form);
    }
    const ownReviews=panel(t('我的待审发言','Your reviewed posts'));
    renderReviews(ownReviews,false);
    if(user.role==='admin'){
      const queue=panel(t('发言审核','Post review')),published=panel(t('已发布评论与留言','Published comments'));
      renderReviews(queue,true,async()=>{
        if(!queue.isConnected)return;
        ownReviews.replaceChildren(ownReviews.firstElementChild);published.replaceChildren(published.firstElementChild);
        await Promise.all([renderReviews(ownReviews,false),renderModeration(published)]);
      });
      renderModeration(published);
    }
    privacyNotice(root);
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
  function reviewTopic(topic) {
    if(topic==='guestbook')return t('首页留言板','Home guestbook');
    let label=topic.replace(/^\/articles\//,'');
    try{label=decodeURIComponent(label);}catch{ /* Plain text fallback. */ }
    return t('文章：','Article: ')+label;
  }
  async function renderReviews(section,admin,onChanged=async()=>{}) {
    section.classList.add('apc-moderation');
    const accountId=user.id,show=status(section),list=el('div');
    let cursor=null,filter='pending',generation=0;
    const tabs=el('div','apc-review-tabs');
    if(admin){
      for(const [key,zh,en] of [['pending','待审核','Pending'],['rejected','未通过','Rejected'],['approved','已通过','Approved']]){
        const tab=button(t(zh,en),()=>{filter=key;load(true);});tab.dataset.filter=key;tabs.append(tab);
      }
      section.append(tabs);
    }
    section.append(list);
    const more=button(t('加载更多','Load more'),()=>load(false));section.append(more);
    async function load(reset){
      const run=++generation;
      if(reset){cursor=null;list.replaceChildren();}
      for(const tab of tabs.children)tab.setAttribute('aria-pressed',String(tab.dataset.filter===filter));
      more.disabled=true;show('');
      try{
        const result=await api((admin?'/admin/reviews?status='+filter:'/me/reviews?')+'&limit=20'+(cursor?'&before='+cursor:''));
        if(run!==generation||!section.isConnected||user?.id!==accountId)return;
        if(!cursor&&!result.items.length)list.append(el('p','apc-muted',t('暂无待处理内容。','Nothing to review.')));
        for(const item of result.items){
          const card=el('article','apc-comment apc-review'),head=el('div','apc-comment-head');
          if(item.user)head.append(avatar(item.user.avatarSeed),identity(item.user));
          head.append(el('span','apc-review-status',t(item.status==='pending'?'待审核':item.status==='rejected'?'未通过':'已通过',item.status==='pending'?'Pending':item.status==='rejected'?'Rejected':'Approved')));
          card.append(head,el('p','apc-muted',reviewTopic(item.topic)+' · '+new Date(item.createdAt).toLocaleString(english()?'en-GB':'zh-CN')),el('p','apc-comment-body',item.body));
          if(admin){
            const cues=el('div','apc-review-cues');
            for(const match of item.matches){const cue=el('span','',match.term);cue.title=match.category;cues.append(cue);}
            card.append(cues);
          }
          const actions=el('div','apc-actions');
          const act=(label,decision,primary=false)=>{
            const control=button(label,async()=>{
              for(const node of actions.children)node.disabled=true;
              try{
                await api((admin?'/admin/reviews/':'/me/reviews/')+item.id,admin?{decision}:{},admin?'POST':'DELETE');
                await load(true);await onChanged();await refreshThreads();
              }catch(error){show(error.message,true);for(const node of actions.children)node.disabled=false;}
            },primary);actions.append(control);
          };
          if(admin&&item.status==='pending'){act(t('通过并公开','Approve and publish'),'approve',true);act(t('不通过','Reject'),'reject');}
          if(!admin)act(t(item.status==='pending'?'撤回':'移除记录',item.status==='pending'?'Withdraw':'Dismiss'),'withdraw');
          card.append(actions);list.append(card);
        }
        cursor=result.nextCursor;more.hidden=!cursor;
      }catch(error){if(run===generation){show(error.message,true);more.hidden=false;more.textContent=t('重试','Retry');}}
      finally{if(run===generation)more.disabled=false;}
    }
    await load(true);
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
        section.append(el('p','apc-verified',t('已验证 · ','Verified · ')+result.phoneMasked));return;
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
      section.append(el('p','apc-muted',t('首次发言前完成验证。请在电脑打开此页，用手机微信扫码。','Verify before your first post. Open this page on a computer and scan with WeChat on your phone.')));
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
  async function renderThread(root,notice='') {
    const container=root.querySelector('.apc-thread'); if(!container) return;
    container.replaceChildren(); const show=status(container);
    const topic=root.dataset.topic;
    if(user && (!verification.required||verification.verified)) {
      const form=el('form','apc-form'); const signed=el('div','apc-comment-head'); signed.append(avatar(user.avatarSeed),identity(user)); form.append(signed);
      const text=field(form,t(topic==='guestbook'?'写下你的留言':'写下你的评论',topic==='guestbook'?'Leave a message':'Write a comment'),'body','textarea'); text.maxLength=2000;
      const row=el('div','apc-actions'), send=button(t('发表','Post'),null,true), count=el('span','apc-counter','0 / 2000'); send.type='submit';
      text.addEventListener('input',()=>{count.textContent=`${[...text.value].length} / 2000`;}); row.append(send,count); form.append(row);
      handle(form,send,async data=>{
        const result=await api('/comments',{...data,topic});
        await renderThread(root,result.status==='pending'?t('已提交，待审核。可在个人中心查看或撤回。','Submitted for review. View or withdraw it in your account.'):'');
      }); container.append(form);
    } else {
      const prompt=el('p','apc-muted'), link=el('a','apc-button',user?t('验证手机号后参与','Verify your phone to join'):t('登录 / 注册后参与','Sign in / register to join')); link.href=accountUrl(); prompt.append(link); container.append(prompt);
    }
    const list=el('div'); container.append(list); let cursor=null;
    const report=el('p','apc-muted'), reportLink=el('a','',t('内容举报','Report content'));
    reportLink.href='mailto:guinytime@gmail.com?subject='+encodeURIComponent(t('网站内容举报','Website content report'))+'&body='+encodeURIComponent(t('页面：','Page: ')+location.origin+location.pathname+'\n'+t('请说明涉及的发言及举报原因。','Please identify the post and describe your concern.'));
    report.append(reportLink);container.append(report);
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
    container.append(more); await load(true);if(notice)show(notice);
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
