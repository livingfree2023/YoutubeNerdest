'use strict';

const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');

module.exports = async function checkQuality(source) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM('<!doctype html><div id="movie_player" class="html5-video-player"><video></video></div>', {
    url: 'https://www.youtube.com/watch?v=quality-test', runScripts: 'outside-only', virtualConsole: vc,
  });
  let checks = 0;
  const check = (condition, message) => {
    assert.ok(condition, message);
    checks++;
    process.stdout.write(`PASS ${message}\n`);
  };
  const tick = () => new Promise(resolve => setTimeout(resolve, 35));
  try {
    const w = dom.window, d = w.document, player = d.getElementById('movie_player');
    const observers = [];
    w.ResizeObserver = class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(element) { this.element = element; }
      disconnect() { this.disconnected = true; }
    };
    w.unsafeWindow = w;
    w.GM_getValue = () => true;
    w.GM_setValue = () => {};
    w.GM_registerMenuCommand = () => 1;
    w.GM_unregisterMenuCommand = () => {};
    w.GM_addValueChangeListener = () => {};
    let levels = ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto'];
    let data = [], preferred = 'auto', playback = 'hd1440', identity = 'quality-test';
    let videoWidth = 0, videoHeight = 0, legacyCalls = 0, failSelection = false;
    const requests = [];
    const video = player.querySelector('video');
    Object.defineProperties(video, {
      videoWidth: {get: () => videoWidth}, videoHeight: {get: () => videoHeight},
    });
    player.getVideoData = () => ({video_id: identity});
    player.getAvailableQualityLevels = () => levels;
    player.getAvailableQualityData = () => data;
    player.getPreferredQuality = () => preferred;
    player.getPlaybackQuality = () => playback;
    player.setPlaybackQuality = () => legacyCalls++;
    const setter = (min, max) => {
      if (failSelection) throw new Error('Test-only player failure');
      requests.push([min, max]); preferred = min;
    };
    player.setPlaybackQualityRange = setter;
    player.showVideoInfo = () => {
      if (player.querySelector('.html5-video-info-panel')) return;
      const panel = d.createElement('div'); panel.className = 'html5-video-info-panel';
      panel.innerHTML = '<button class="ytp-sfn-close">[X]</button><div class="html5-video-info-panel-content"><div><div>Viewport / Frames</div><span>999x555 / 0 dropped of 4</span></div><div><div>Current / Optimal Res</div><span class="native-resolution">2560x1440@25 / 3840x2160@25</span></div><div><div>Connection Speed</div><span>151266 Kbps</span></div><div><div>Buffer Health</div><span><div class="ytp-horizonchart" style="height:1em;width:300px"><canvas width="300" height="11"></canvas></div>25 s</span></div></div>';
      panel.querySelector('.ytp-sfn-close').onclick = () => panel.remove();
      player.append(panel);
    };
    w.eval(source);
    const panel = player.querySelector('.html5-video-info-panel');
    const row = panel.querySelector('.ytn-quality-row');
    const badge = () => panel.querySelector('.ytn-current-badge');
    const choice = id => row.querySelector(`[data-quality="${id}"]`);
    const resolution = panel.querySelector('.native-resolution');
    const canvas = panel.querySelector('canvas'), originalCanvas = canvas.outerHTML;
    const update = async text => { resolution.textContent = text; await tick(); };
    check(panel.querySelector('.ytn-speed').textContent === '151 Mbps', 'Compact speed rounds to integer Mbps');
    check(badge().textContent === '2K' && badge().classList.contains('ytn-badge'), 'Effective 1440p gets themed 2K compact badge');
    check(row.hidden, 'Quality shortcuts are hidden while compact');
    panel.querySelector('.ytn-toggle').click(); await tick();
    check(!row.hidden, 'Expanding reveals the quality shortcut row');
    check([...row.querySelectorAll('button')].map(item => item.dataset.quality).join(',') === 'hd2160,hd1440,hd1080,hd720,large,medium,small,auto', 'Only available supported tiers appear in descending order with Auto last');
    check(!choice('highres') && !choice('tiny'), 'Unavailable 8K and unsupported 144p are not offered');
    check(row.querySelectorAll('.ytn-badge').length === 3, 'Available 4K, 2K and HD shortcuts use the shared themed badge class');
    check(choice('auto').getAttribute('aria-pressed') === 'true', 'Highlight follows native Auto mode');
    choice('hd2160').click();
    check(requests.at(-1).join(',') === 'hd2160,hd2160' && legacyCalls === 0, '4K uses equal native range bounds and never the obsolete setter');
    check(choice('hd2160').getAttribute('aria-pressed') === 'true' && badge().textContent === '2K', 'Requested 4K highlight does not falsely change effective resolution');
    await update('3840x2160@25 / 3840x2160@25');
    check(badge().textContent === '4K', 'Effective badge updates after native stats actually change');
    choice('auto').click();
    check(requests.at(-1).join(',') === 'auto,auto' && badge().textContent === '4K', 'Auto clears fixed bounds while preserving current resolution display');
    await update('1280x720@60 / 3840x2160@60');
    check(badge().textContent === '720p' && !badge().classList.contains('ytn-badge'), 'Adaptive 720p is shown as plain text');
    preferred = 'hd1080'; await update('1920x1080@60 / 3840x2160@60');
    check(choice('hd1080').getAttribute('aria-pressed') === 'true' && badge().textContent === 'HD', 'Changes from native settings update requested and effective states');
    let width = 200;
    Object.defineProperty(row, 'clientWidth', {get: () => width});
    Object.defineProperty(row, 'scrollWidth', {get: () => {
      const visible = [...row.querySelectorAll('button')].filter(item => !item.hidden);
      return visible.reduce((sum, item) => sum + (item.textContent.length > 3 ? 38 : 32), 0) + Math.max(0, visible.length - 1) * 6;
    }});
    observers[0].callback();
    check(choice('small').hidden && choice('medium').hidden, 'Width fitting drops optional 240p and 360p first');
    check(!choice('auto').hidden && !choice('hd2160').hidden, 'Required tiers and Auto remain accessible at narrow widths');
    preferred = 'small'; await update('426x240@25 / 3840x2160@25');
    check(!choice('small').hidden && choice('small').getAttribute('aria-pressed') === 'true', 'An active optional tier remains accessible');
    width = 600; observers[0].callback();
    check(!choice('small').hidden && !choice('medium').hidden, 'Wider layout restores optional tiers');
    const stale = choice('hd2160'), previousRequests = requests.length;
    levels = levels.filter(id => id !== 'hd2160'); stale.click();
    check(requests.length === previousRequests && !choice('hd2160'), 'Stale unavailable shortcut cannot request an obsolete tier');
    levels = ['highres','highres','hd2160','hd1080','hd720','auto'];
    data = [{quality:'highres',isPlayable:false},{quality:'hd2160',isPlayable:true},{quality:'hd1080',isPlayable:false},{quality:'hd1080',isPlayable:true}];
    await update('1920x1080@25 / 7680x4320@25');
    check(!choice('highres') && choice('hd1080'), 'Unplayable 8K is omitted while a playable duplicate HD variant is retained');
    data = []; await update('1920x1080@25 / 7680x4320@25');
    check(row.querySelectorAll('[data-quality="highres"]').length === 1, 'Available 8K is supported without duplicate frame-rate entries');
    choice('highres').click();
    check(requests.at(-1).join(',') === 'highres,highres', '8K uses native highres identifier');
    const failureCount = requests.length; failSelection = true;
    choice('hd2160').click();
    check(requests.length === failureCount && row.querySelector('[role="status"]').textContent.includes('Could not change'), 'Setter errors provide feedback without fabricating success');
    failSelection = false;
    player.setPlaybackQualityRange = undefined;
    await update('3840x2160@25 / 7680x4320@25');
    check(row.hidden && badge().textContent === '4K', 'Missing range API hides shortcuts without breaking live compact resolution');
    player.setPlaybackQualityRange = setter;
    await update('1080x1920@30 / 2160x3840@30');
    check(badge().textContent === 'HD', 'Portrait effective dimensions classify by the shorter side');
    await update('3840x1600@25 / 3840x2160@25');
    check(badge().textContent === '1600p' && !badge().classList.contains('ytn-badge'), 'Unusual effective height stays truthful rather than rounded to a tier');
    videoWidth = 1920; videoHeight = 1080; await update('unavailable');
    check(badge().textContent === 'HD', 'Missing stats dimensions fall back to actual video dimensions');
    videoWidth = 0; videoHeight = 0; playback = 'hd2160'; await update('unavailable');
    check(badge().textContent === '4K', 'Missing video dimensions fall back to native effective quality');
    playback = undefined; await update('unavailable');
    check(panel.querySelector('.ytn-current').hidden, 'Unknown effective resolution is omitted rather than fabricated');
    identity = 'new-video'; preferred = 'auto'; levels = ['hd720','large','auto'];
    video.dispatchEvent(new w.Event('loadedmetadata'));
    check(!choice('highres') && choice('auto').getAttribute('aria-pressed') === 'true', 'Video navigation refreshes available tiers and mode immediately');
    player.getAvailableQualityLevels = () => { throw new Error('Unavailable player'); };
    await update('1280x720@30 / 1280x720@30');
    check(row.hidden, 'Availability errors hide controls without crashing stats');
    player.getAvailableQualityLevels = () => levels;
    player.getAvailableQualityData = () => { throw new Error('Optional API missing'); };
    await update('1280x720@30 / 1280x720@30');
    check(!row.hidden && choice('hd720'), 'Missing optional data API uses the native available-level list');
    check(panel.querySelector('canvas') === canvas && canvas.outerHTML === originalCanvas, 'Quality changes preserve native chart node and canvas attributes');
    let playerClicks = 0; player.addEventListener('click', () => playerClicks++);
    choice('large').click();
    check(playerClicks === 0, 'Quality clicks do not trigger playback gestures');
    let mutations = 0;
    const observer = new w.MutationObserver(records => mutations += records.length);
    observer.observe(panel, {childList:true,subtree:true});
    await update('854x480@30 / 1280x720@30'); await tick();
    const settled = mutations; await tick(); observer.disconnect();
    check(mutations === settled && mutations < 15, 'Quality controls do not cause mutation feedback loops');
    panel.querySelector('.ytn-close').click(); await tick();
    check(observers[0].disconnected && !panel.querySelector('.ytn-quality-row'), 'Disposal disconnects resize observation and removes quality controls');
    check(errors.length === 0, 'No unhandled script errors in quality module checks');
    process.stdout.write(`${checks} quality checks passed (isolated player adapters).\n`);
  } finally {
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide'));
    dom.window.close();
  }
};
