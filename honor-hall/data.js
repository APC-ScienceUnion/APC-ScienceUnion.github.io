(function () {
  'use strict'

  const certificate = (id, recipient, detail, image) => ({
    id,
    recipient,
    detail,
    image,
    identifiers: [recipient]
  })

  window.HONOR_HALL_DATA = {
    locale: 'zh-CN',
    labels: {
      searchHeading: '查询荣誉证书',
      queryLabel: 'QQ 号或昵称',
      queryPlaceholder: '输入完整 QQ 号或昵称',
      queryPlaceholderNicknameOnly: '输入证书上的完整昵称',
      queryButton: '查询',
      querying: '查询中',
      privacyNote: '查询只用于匹配证书，不会保存或写入网址。',
      privacyNoteNicknameOnly: '当前可按证书上的昵称查询；QQ 号查询将在私密映射完成后开放。',
      showAll: '返回全部证书',
      foundResults: '找到 {count} 张荣誉证书',
      noMatchTitle: '没有找到对应的荣誉证书',
      noMatchHelp: '请检查输入是否与证书上登记的昵称一致。',
      qqUnavailable: 'QQ 查询将在私密映射完成后开放，目前可使用昵称查询。',
      qqFailed: 'QQ 查询暂时不可用，请稍后重试或改用昵称。',
      activityFallback: '活动 {index}',
      certificateFallback: '荣誉证书',
      activityEmpty: '证书正在整理中。',
      openCertificate: '查看 {recipient} 的{title}',
      defaultRecipient: '获奖者',
      defaultImageAlt: '{recipient}在{activity}中获得的荣誉证书',
      modalTitle: '荣誉证书',
      closeModal: '关闭证书',
      imageLoading: '证书图片载入中',
      imageError: '证书图片暂时无法载入'
    },
    qqLookupEndpoint: '',
    events: [
      {
        id: 'who-is-behind-the-logo',
        title: '谁藏在LOGO背后',
        date: '二〇二五年十一月至十二月',
        certificates: [
          certificate('logo-2025-11-first-0-moxiaoxi-0', '0陌筱曦0', '积分榜第一名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/001.png'),
          certificate('logo-2025-11-first-1222qs', '1222qs', '积分榜第一名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/002.png'),
          certificate('logo-2025-11-second-shiqinianchan', '十七年蝉', '积分榜第二名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/003.png'),
          certificate('logo-2025-11-second-shouji-fx-jichen', '手极FX-纪尘', '积分榜第二名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/004.png'),
          certificate('logo-2025-11-third-teruno-channel', '澤崎照乃_channel', '积分榜第三名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/005.png'),
          certificate('logo-2025-11-third-shifeilaiya', '是菲莱吖', '积分榜第三名 · 二〇二五年十一月', '/honor-hall/assets/logo-behind/006.png'),
          certificate('logo-2025-12-first-xiaoxiaoxuedingmao', '小小薛定猫', '积分榜第一名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/007.png'),
          certificate('logo-2025-12-first-0-moxiaoxi-0', '0陌筱曦0', '积分榜第一名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/008.png'),
          certificate('logo-2025-12-second-jihebingu', '几何冰川', '积分榜第二名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/009.png'),
          certificate('logo-2025-12-second-teruno-channel', '澤崎照乃_channel', '积分榜第二名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/010.png'),
          certificate('logo-2025-12-third-shifeilaiya', '是菲莱吖', '积分榜第三名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/011.png'),
          certificate('logo-2025-12-third-congcai', '丛彩', '积分榜第三名 · 二〇二五年十二月', '/honor-hall/assets/logo-behind/012.png')
        ]
      },
      {
        id: 'summer-recruitment-2026',
        title: '2026暑期纳新',
        date: '2026年8月26日',
        certificates: [
          certificate('recruitment-2026-001-xinchen', '新辰', '通过天文考核', '/honor-hall/assets/summer-recruitment-2026/001.png'),
          certificate('recruitment-2026-002-c14h10-physics-bot', 'C14H10✨💙（物理全肯定bot', '通过物理考核', '/honor-hall/assets/summer-recruitment-2026/002.png'),
          certificate('recruitment-2026-003-juanxincaigou', '卷心菜狗', '通过天文、生物、玄学考核', '/honor-hall/assets/summer-recruitment-2026/003.png'),
          certificate('recruitment-2026-004-8102', '8102', '通过物理、数学、玄学考核', '/honor-hall/assets/summer-recruitment-2026/004.png'),
          certificate('recruitment-2026-005-linn', 'linn', '通过物理考核', '/honor-hall/assets/summer-recruitment-2026/005.png'),
          certificate('recruitment-2026-006-st', 'ST', '通过物理、玄学考核', '/honor-hall/assets/summer-recruitment-2026/006.png'),
          certificate('recruitment-2026-007-tempestissimo', 'T ε μ π ε Σ Tissimo', '通过化学考核', '/honor-hall/assets/summer-recruitment-2026/007.png'),
          certificate('recruitment-2026-008-rangyi', '让逸', '通过化学考核', '/honor-hall/assets/summer-recruitment-2026/008.png'),
          certificate('recruitment-2026-009-qiyuemeiyu', '柒月梅雨', '通过化学、历史、玄学考核', '/honor-hall/assets/summer-recruitment-2026/009.png'),
          certificate('recruitment-2026-010-tinghe', '听禾', '通过生物考核', '/honor-hall/assets/summer-recruitment-2026/010.png'),
          certificate('recruitment-2026-011-v4p0813-shiqu', 'v4p0813是区', '通过生物考核', '/honor-hall/assets/summer-recruitment-2026/011.png'),
          certificate('recruitment-2026-012-tuzi', '兔子', '通过生物考核', '/honor-hall/assets/summer-recruitment-2026/012.png'),
          certificate('recruitment-2026-013-betty', 'Betty', '通过生物、玄学考核', '/honor-hall/assets/summer-recruitment-2026/013.png'),
          certificate('recruitment-2026-014-shanchu', '山初', '通过生物考核', '/honor-hall/assets/summer-recruitment-2026/014.png'),
          certificate('recruitment-2026-015-silence', 'silence', '通过数学、玄学考核', '/honor-hall/assets/summer-recruitment-2026/015.png'),
          certificate('recruitment-2026-016-yanjiangyichunmiao', '湮绛乙醇喵', '通过数学考核', '/honor-hall/assets/summer-recruitment-2026/016.png'),
          certificate('recruitment-2026-017-1478', '1478', '通过数学考核', '/honor-hall/assets/summer-recruitment-2026/017.png'),
          certificate('recruitment-2026-018-boring', 'boring', '通过数学考核', '/honor-hall/assets/summer-recruitment-2026/018.png'),
          certificate('recruitment-2026-019-hao-period', '好。', '通过地理考核', '/honor-hall/assets/summer-recruitment-2026/019.png'),
          certificate('recruitment-2026-020-jichen', '纪尘', '通过地理考核', '/honor-hall/assets/summer-recruitment-2026/020.png'),
          certificate('recruitment-2026-021-yingzheyangguangshengdataowang', '迎着阳光盛大逃亡', '通过玄学考核', '/honor-hall/assets/summer-recruitment-2026/021.png'),
          certificate('recruitment-2026-022-decade', 'Decade', '通过玄学考核', '/honor-hall/assets/summer-recruitment-2026/022.png'),
          certificate('recruitment-2026-023-woniu', '蜗牛', '通过玄学考核', '/honor-hall/assets/summer-recruitment-2026/023.png'),
          certificate('recruitment-2026-024-jianxia', '见夏', '通过玄学考核', '/honor-hall/assets/summer-recruitment-2026/024.png'),
          certificate('recruitment-2026-025-chabeilimeiyoushuishu', '茶杯里没有睡鼠', '通过玄学考核', '/honor-hall/assets/summer-recruitment-2026/025.png')
        ]
      }
    ]
  }
})()
