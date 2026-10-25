export async function createMailer(config) {
  if (config.mailTransport === 'resend') {
    return async message => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${config.resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: config.mailFrom, ...message })
      });
      if (!response.ok) throw new Error('Mail provider rejected request.');
    };
  }
  throw new Error('Resend must be configured. Tests inject a private test transport.');
}

export function codeMessage(email, code, purpose) {
  const action = { register: '注册账号', reset: '重置密码', bind: '绑定邮箱' }[purpose];
  return { to: email, subject: `格物社 · ${action}验证码`, text: `你正在${action}。验证码：${code}\n10 分钟内有效，只能使用一次。请勿将验证码交给他人。\n如果不是你本人操作，请忽略此邮件。` };
}
