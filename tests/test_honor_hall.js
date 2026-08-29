'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const frontMatter = require('hexo-front-matter');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'source');
const chineseDataFile = path.join(sourceRoot, 'honor-hall', 'data.js');
const englishDataFile = path.join(sourceRoot, 'en', 'honor-hall', 'data.js');
const chinesePageFile = path.join(sourceRoot, 'honor-hall', 'index.md');
const englishPageFile = path.join(sourceRoot, 'en', 'honor-hall', 'index.md');
const originalAssetDigest = 'ae29b10c8af9abdecf031aa3e72acec53b127b276aa9c5ad18d79b724dca38ae';

function normalizedSource(file) {
  return fs.readFileSync(file, 'utf8')
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n?/gu, '\n');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function loadData(file) {
  assert.ok(fs.existsSync(file), `missing Honor Hall data file: ${file}`);
  const source = normalizedSource(file);
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: file, timeout: 1000 });
  assert.ok(sandbox.window.HONOR_HALL_DATA, `${file} did not define window.HONOR_HALL_DATA`);
  return { source, data: JSON.parse(JSON.stringify(sandbox.window.HONOR_HALL_DATA)) };
}

function allCertificates(data) {
  return data.events.flatMap(event => event.certificates);
}

function assetFile(publicPath) {
  assert.match(
    publicPath,
    /^\/honor-hall\/assets\/(?:logo-behind|summer-recruitment-2026)\/\d{3}\.png$/u,
    `certificate image is not a fixed local PNG path: ${publicPath}`
  );
  return path.join(sourceRoot, ...publicPath.slice(1).split('/'));
}

const chinese = loadData(chineseDataFile);
const english = loadData(englishDataFile);
assert.equal(chinese.data.locale, 'zh-CN');
assert.equal(english.data.locale, 'en');
assert.equal(chinese.data.qqLookupEndpoint, '', 'QQ lookup must stay server-side until a private mapping exists');
assert.equal(english.data.qqLookupEndpoint, '', 'English QQ lookup must stay disabled with no private mapping');
assert.equal(chinese.data.events.length, 2, 'Honor Hall must contain exactly two activities');
assert.equal(english.data.events.length, 2, 'English Honor Hall must contain exactly two activities');
assert.deepEqual(chinese.data.events.map(event => event.certificates.length), [12, 25]);
assert.deepEqual(english.data.events.map(event => event.certificates.length), [12, 25]);

const chineseCertificates = allCertificates(chinese.data);
const englishCertificates = allCertificates(english.data);
assert.equal(chineseCertificates.length, 37);
assert.equal(englishCertificates.length, 37);

const expectedRecipients = [
  '0陌筱曦0', '1222qs', '十七年蝉', '手极FX-纪尘', '澤崎照乃_channel', '是菲莱吖',
  '小小薛定猫', '0陌筱曦0', '几何冰川', '澤崎照乃_channel', '是菲莱吖', '丛彩',
  '新辰', 'C14H10✨💙（物理全肯定bot', '卷心菜狗', '8102', 'linn', 'ST',
  'T ε μ π ε Σ Tissimo', '让逸', '柒月梅雨', '听禾', 'v4p0813是区', '兔子', 'Betty',
  '山初', 'silence', '湮绛乙醇喵', '1478', 'boring', '好。', '纪尘',
  '迎着阳光盛大逃亡', 'Decade', '蜗牛', '见夏', '茶杯里没有睡鼠'
];
assert.deepEqual(chineseCertificates.map(certificate => certificate.recipient), expectedRecipients);
assert.deepEqual(englishCertificates.map(certificate => certificate.recipient), expectedRecipients, 'translations changed a certificate nickname');

assert.deepEqual(chinese.data.events.map(event => event.title), ['谁藏在LOGO背后', '2026暑期纳新']);
assert.deepEqual(english.data.events.map(event => event.title), ['Who Is Behind the LOGO?', '2026 Summer Recruitment']);
assert.equal(chineseCertificates[4].recipient, '澤崎照乃_channel');
assert.equal(chineseCertificates[13].recipient, 'C14H10✨💙（物理全肯定bot');
assert.equal(chineseCertificates[18].recipient, 'T ε μ π ε Σ Tissimo');
assert.equal(chineseCertificates[22].recipient, 'v4p0813是区');
assert.equal(chineseCertificates[30].recipient, '好。');
assert.equal(chineseCertificates[2].detail, '积分榜第二名 · 二〇二五年十一月');
assert.equal(chineseCertificates[14].detail, '通过天文、生物、玄学考核');
assert.equal(chineseCertificates[31].detail, '通过地理考核');

const ids = new Set();
const images = new Set();
const assetHash = crypto.createHash('sha256');
for (const certificate of chineseCertificates) {
  assert.deepEqual(
    Object.keys(certificate).sort(),
    ['detail', 'id', 'identifiers', 'image', 'recipient'],
    `${certificate.id} contains an unexpected public field`
  );
  assert.ok(certificate.id && !ids.has(certificate.id), `duplicate certificate id: ${certificate.id}`);
  assert.ok(!images.has(certificate.image), `duplicate certificate image: ${certificate.image}`);
  ids.add(certificate.id);
  images.add(certificate.image);
  assert.deepEqual(certificate.identifiers, [certificate.recipient], `${certificate.id} exposes an unexpected identifier`);
  assert.doesNotMatch(certificate.recipient, /^\d{5,12}$/u, `${certificate.id} appears to expose a raw QQ number`);

  const file = assetFile(certificate.image);
  assert.ok(fs.existsSync(file), `missing certificate asset: ${file}`);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file} is not a PNG`);
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR', `${file} has no PNG IHDR header`);
  assert.equal(bytes.readUInt32BE(16), 2000, `${file} width changed`);
  assert.equal(bytes.readUInt32BE(20), 1414, `${file} height changed`);
  assetHash.update(certificate.image);
  assetHash.update(Buffer.from([0]));
  assetHash.update(bytes);
}
assert.equal(
  assetHash.digest('hex'),
  originalAssetDigest,
  'original certificate bytes changed; do not resize, recompress, or strip metadata'
);

assert.deepEqual(
  englishCertificates.map(({ id, recipient, image, identifiers }) => ({ id, recipient, image, identifiers })),
  chineseCertificates.map(({ id, recipient, image, identifiers }) => ({ id, recipient, image, identifiers })),
  'English and Chinese certificate identity data diverged'
);

for (const { source, data } of [chinese, english]) {
  assert.ok(data.labels && typeof data.labels === 'object', 'Honor Hall UI labels are missing');
  assert.doesNotMatch(source, /canva\.com|export-download|DAG240lyeI8|DAHTOCvPPw8/iu, 'data file exposes a Canva edit or download URL');
  assert.doesNotMatch(source, /qqSha|qqHash|qqHashNamespace/iu, 'data file exposes a client-side QQ hash');
  for (const certificate of allCertificates(data)) {
    assert.ok(!Object.keys(certificate).some(key => /^qq/iu.test(key)), `${certificate.id} exposes QQ data`);
  }
}

const chinesePageSource = normalizedSource(chinesePageFile);
const chinesePage = frontMatter.parse(chinesePageSource);
const englishPage = frontMatter.parse(normalizedSource(englishPageFile));
assert.equal(chinesePage.layout, 'honor-hall');
assert.equal(chinesePage.lang, 'zh-CN');
assert.equal(chinesePage.permalink, 'honor-hall/');
assert.equal(chinesePage.honor_hall_data, '/honor-hall/data.js');
assert.equal(englishPage.layout, 'honor-hall');
assert.equal(englishPage.lang, 'en');
assert.equal(englishPage.permalink, 'en/honor-hall/');
assert.equal(englishPage.honor_hall_data, '/en/honor-hall/data.js');
assert.equal(englishPage.translation_key, 'page:honor-hall');
assert.equal(englishPage.translation_source_sha256, sha256(chinesePageSource), 'English Honor Hall page is stale');
assert.equal(chinesePage.aside, false);
assert.equal(englishPage.aside, false);

console.log('Honor Hall check passed: 2 activities, 37 original 2000×1414 PNG certificates, bilingual data, and no public QQ mapping.');
