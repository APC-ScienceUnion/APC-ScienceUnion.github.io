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
    locale: 'en',
    labels: {
      searchHeading: 'Find a certificate',
      queryLabel: 'QQ number or nickname',
      queryPlaceholder: 'Enter the complete QQ number or nickname',
      queryPlaceholderNicknameOnly: 'Enter the complete nickname shown on the certificate',
      queryButton: 'Search',
      querying: 'Searching',
      privacyNote: 'Your query is used only to match certificates. It is not saved or written into the URL.',
      privacyNoteNicknameOnly: 'Nickname search is available now. QQ lookup will open after a private mapping is added.',
      showAll: 'Show all certificates',
      foundResults: 'Found {count} certificate(s)',
      noMatchTitle: 'No matching certificate found',
      noMatchHelp: 'Check that your query matches the nickname printed on the certificate.',
      qqUnavailable: 'QQ lookup will open after a private mapping is added. You can search by nickname now.',
      qqFailed: 'QQ lookup is temporarily unavailable. Try again later or search by nickname.',
      activityFallback: 'Activity {index}',
      certificateFallback: 'Certificate of Honor',
      activityEmpty: 'Certificates are being prepared.',
      openCertificate: 'View {recipient} — {title}',
      defaultRecipient: 'Recipient',
      defaultImageAlt: "{recipient}'s certificate from {activity}",
      modalTitle: 'Certificate of Honor',
      closeModal: 'Close certificate',
      imageLoading: 'Loading certificate image',
      imageError: 'The certificate image could not be loaded'
    },
    qqLookupEndpoint: '',
    events: [
      {
        id: 'who-is-behind-the-logo',
        title: 'Who Is Behind the LOGO?',
        date: 'November–December 2025',
        certificates: [
          certificate('logo-2025-11-first-0-moxiaoxi-0', '0陌筱曦0', '1st on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/001.png'),
          certificate('logo-2025-11-first-1222qs', '1222qs', '1st on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/002.png'),
          certificate('logo-2025-11-second-shiqinianchan', '十七年蝉', '2nd on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/003.png'),
          certificate('logo-2025-11-second-shouji-fx-jichen', '手极FX-纪尘', '2nd on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/004.png'),
          certificate('logo-2025-11-third-teruno-channel', '澤崎照乃_channel', '3rd on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/005.png'),
          certificate('logo-2025-11-third-shifeilaiya', '是菲莱吖', '3rd on the leaderboard · November 2025', '/honor-hall/assets/logo-behind/006.png'),
          certificate('logo-2025-12-first-xiaoxiaoxuedingmao', '小小薛定猫', '1st on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/007.png'),
          certificate('logo-2025-12-first-0-moxiaoxi-0', '0陌筱曦0', '1st on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/008.png'),
          certificate('logo-2025-12-second-jihebingu', '几何冰川', '2nd on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/009.png'),
          certificate('logo-2025-12-second-teruno-channel', '澤崎照乃_channel', '2nd on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/010.png'),
          certificate('logo-2025-12-third-shifeilaiya', '是菲莱吖', '3rd on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/011.png'),
          certificate('logo-2025-12-third-congcai', '丛彩', '3rd on the leaderboard · December 2025', '/honor-hall/assets/logo-behind/012.png')
        ]
      },
      {
        id: 'summer-recruitment-2026',
        title: '2026 Summer Recruitment',
        date: 'August 26, 2026',
        certificates: [
          certificate('recruitment-2026-001-xinchen', '新辰', 'Passed the Astronomy assessment', '/honor-hall/assets/summer-recruitment-2026/001.png'),
          certificate('recruitment-2026-002-c14h10-physics-bot', 'C14H10✨💙（物理全肯定bot', 'Passed the Physics assessment', '/honor-hall/assets/summer-recruitment-2026/002.png'),
          certificate('recruitment-2026-003-juanxincaigou', '卷心菜狗', 'Passed the Astronomy, Biology, and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/003.png'),
          certificate('recruitment-2026-004-8102', '8102', 'Passed the Physics, Mathematics, and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/004.png'),
          certificate('recruitment-2026-005-linn', 'linn', 'Passed the Physics assessment', '/honor-hall/assets/summer-recruitment-2026/005.png'),
          certificate('recruitment-2026-006-st', 'ST', 'Passed the Physics and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/006.png'),
          certificate('recruitment-2026-007-tempestissimo', 'T ε μ π ε Σ Tissimo', 'Passed the Chemistry assessment', '/honor-hall/assets/summer-recruitment-2026/007.png'),
          certificate('recruitment-2026-008-rangyi', '让逸', 'Passed the Chemistry assessment', '/honor-hall/assets/summer-recruitment-2026/008.png'),
          certificate('recruitment-2026-009-qiyuemeiyu', '柒月梅雨', 'Passed the Chemistry, History, and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/009.png'),
          certificate('recruitment-2026-010-tinghe', '听禾', 'Passed the Biology assessment', '/honor-hall/assets/summer-recruitment-2026/010.png'),
          certificate('recruitment-2026-011-v4p0813-shiqu', 'v4p0813是区', 'Passed the Biology assessment', '/honor-hall/assets/summer-recruitment-2026/011.png'),
          certificate('recruitment-2026-012-tuzi', '兔子', 'Passed the Biology assessment', '/honor-hall/assets/summer-recruitment-2026/012.png'),
          certificate('recruitment-2026-013-betty', 'Betty', 'Passed the Biology and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/013.png'),
          certificate('recruitment-2026-014-shanchu', '山初', 'Passed the Biology assessment', '/honor-hall/assets/summer-recruitment-2026/014.png'),
          certificate('recruitment-2026-015-silence', 'silence', 'Passed the Mathematics and Metaphysics assessments', '/honor-hall/assets/summer-recruitment-2026/015.png'),
          certificate('recruitment-2026-016-yanjiangyichunmiao', '湮绛乙醇喵', 'Passed the Mathematics assessment', '/honor-hall/assets/summer-recruitment-2026/016.png'),
          certificate('recruitment-2026-017-1478', '1478', 'Passed the Mathematics assessment', '/honor-hall/assets/summer-recruitment-2026/017.png'),
          certificate('recruitment-2026-018-boring', 'boring', 'Passed the Mathematics assessment', '/honor-hall/assets/summer-recruitment-2026/018.png'),
          certificate('recruitment-2026-019-hao-period', '好。', 'Passed the Geography assessment', '/honor-hall/assets/summer-recruitment-2026/019.png'),
          certificate('recruitment-2026-020-jichen', '纪尘', 'Passed the Geography assessment', '/honor-hall/assets/summer-recruitment-2026/020.png'),
          certificate('recruitment-2026-021-yingzheyangguangshengdataowang', '迎着阳光盛大逃亡', 'Passed the Metaphysics assessment', '/honor-hall/assets/summer-recruitment-2026/021.png'),
          certificate('recruitment-2026-022-decade', 'Decade', 'Passed the Metaphysics assessment', '/honor-hall/assets/summer-recruitment-2026/022.png'),
          certificate('recruitment-2026-023-woniu', '蜗牛', 'Passed the Metaphysics assessment', '/honor-hall/assets/summer-recruitment-2026/023.png'),
          certificate('recruitment-2026-024-jianxia', '见夏', 'Passed the Metaphysics assessment', '/honor-hall/assets/summer-recruitment-2026/024.png'),
          certificate('recruitment-2026-025-chabeilimeiyoushuishu', '茶杯里没有睡鼠', 'Passed the Metaphysics assessment', '/honor-hall/assets/summer-recruitment-2026/025.png')
        ]
      }
    ]
  }
})()
