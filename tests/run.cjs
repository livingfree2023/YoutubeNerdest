'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');

async function main() {
  const source = fs.readFileSync(path.join(__dirname, '../youtube-compact-stats.user.js'), 'utf8');
  const fixture = fs.readFileSync(path.join(__dirname, 'browser.html'), 'utf8');
  // No external resources or browser access: run the local source in the test DOM.
  const html = fixture.replace('<script src="../youtube-compact-stats.user.js"></script>',
    () => `<script>${source}</script>`);
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(html, {
    url: 'https://www.youtube.com/watch?v=test-video',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: console,
  });
  try {
    const deadline = Date.now() + 8000;
    while (!/^(PASS|FAIL)/.test(dom.window.document.title) && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const output = dom.window.document.getElementById('results').textContent;
    process.stdout.write(output + '\n');
    assert.equal(errors.length, 0, errors.map(error => error.message).join('\n'));
    assert.match(dom.window.document.title, /^PASS/, 'Module verification did not pass');
    await checkSavedOff(source);
    checkAnimations(source);
  } finally {
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide'));
    dom.window.close();
  }
}

function checkAnimations(source) {
  const dom = new JSDOM('<!doctype html><div id="movie_player" class="html5-video-player"><video></video></div>', {
    url: 'https://www.youtube.com/watch?v=animation-test',
    runScripts: 'outside-only',
  });
  let count = 0;
  function check(condition, message) {
    assert.ok(condition, message);
    count++;
    process.stdout.write(`PASS ${message}\n`);
  }
  try {
    const w = dom.window;
    const player = w.document.getElementById('movie_player');
    w.unsafeWindow = w;
    w.GM_getValue = () => true;
    w.GM_setValue = () => {};
    w.GM_registerMenuCommand = () => 1;
    w.GM_unregisterMenuCommand = () => {};
    w.GM_addValueChangeListener = () => {};
    let reducedMotion = false;
    w.matchMedia = () => ({matches: reducedMotion});
    player.getVideoData = () => ({video_id:'animation-test'});
    player.showVideoInfo = () => {
      if (player.querySelector('.html5-video-info-panel')) return;
      const panel = w.document.createElement('div');
      panel.className = 'html5-video-info-panel';
      panel.style.color = 'white';
      panel.innerHTML = '<button class="ytp-sfn-close">[X]</button><div class="html5-video-info-panel-content"><div><div>Connection Speed</div><span>151266 Kbps</span></div></div>';
      panel.querySelector('button').onclick = () => panel.remove();
      player.append(panel);
    };
    w.eval(source);
    const panel = player.querySelector('.html5-video-info-panel');
    const content = panel.querySelector('.html5-video-info-panel-content');
    const originalStyle = panel.getAttribute('style');
    const animations = [];
    let visibleSize = null;
    // Test-only geometry/animation boundary: jsdom does not render or animate.
    panel.getBoundingClientRect = () => visibleSize || (panel.classList.contains('ytn-compact') ?
      {width:160, height:32} : {width:500, height:180});
    panel.animate = (frames, options) => {
      const animation = {frames, options, canceled: false,
        cancel() { this.canceled = true; visibleSize = null; }};
      animations.push(animation);
      return animation;
    };
    const toggle = panel.querySelector('.ytn-toggle');
    toggle.click();
    check(animations[0].frames[0].width === '160px' && animations[0].frames[1].width === '500px', 'Expand animation measures compact and native widths');
    check(animations[0].frames[0].height === '32px' && animations[0].frames[1].height === '180px', 'Expand animation measures compact and native heights');
    check(animations[0].options.duration === 220 && animations[0].options.fill === 'none', 'Animation expires after 220ms without persistent sizing');
    visibleSize = {width:300, height:106};
    toggle.click();
    check(animations[0].canceled && animations[1].frames[0].width === '300px', 'Rapid reversal starts from visible intermediate size');
    check(animations[1].frames[1].width === '160px' && panel.classList.contains('ytn-compact'), 'Second click animates back to minimal size');
    check(panel.getAttribute('style') === originalStyle && panel.contains(content), 'Animation preserves native inline styles and content identity');
    reducedMotion = true;
    toggle.click();
    check(animations[1].canceled && animations.length === 2 && toggle.getAttribute('aria-expanded') === 'true', 'Reduced motion cancels current animation and switches immediately');
    reducedMotion = false;
    const animate = panel.animate;
    panel.animate = undefined;
    toggle.click();
    check(panel.classList.contains('ytn-compact'), 'Missing animation API falls back to instant collapse');
    panel.animate = animate;
    panel.getBoundingClientRect = () => ({width:0, height:0});
    toggle.click();
    check(animations.length === 2, 'Unmeasurable hidden panel skips size animation');
    panel.getBoundingClientRect = () => panel.classList.contains('ytn-compact') ? {width:160,height:32} : {width:500,height:180};
    toggle.click();
    panel.querySelector('.ytn-close').click();
    check(animations[2].canceled && !panel.isConnected, 'Close cancels animation and uses native dismissal');
    const rules = w.document.querySelector('style').textContent;
    check(rules.includes('rotate(225deg)') && rules.includes('transition: transform 220ms ease'), 'Chevron has a 180-degree animated rotation');
    check(rules.includes('prefers-reduced-motion: reduce') && rules.includes('transition: none'), 'Chevron respects reduced-motion preference');
    process.stdout.write(`${count} animation checks passed (DOM adapters, not rendered frames).\n`);
  } finally {
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide'));
    dom.window.close();
  }
}

async function checkSavedOff(source) {
  const dom = new JSDOM('<!doctype html><div id="movie_player" class="html5-video-player"><video></video></div>', {
    url: 'https://www.youtube.com/watch?v=test',
    runScripts: 'outside-only',
  });
  try {
    let calls = 0;
    let label;
    const w = dom.window;
    w.unsafeWindow = w;
    w.GM_getValue = () => false;
    w.GM_setValue = () => {};
    w.GM_registerMenuCommand = text => { label = text; return 1; };
    w.GM_unregisterMenuCommand = () => {};
    w.GM_addValueChangeListener = () => {};
    const player = w.document.getElementById('movie_player');
    player.getVideoData = () => ({video_id:'test'});
    player.showVideoInfo = () => calls++;
    w.eval(source);
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(calls, 0);
    assert.match(label, /OFF/);
    process.stdout.write('PASS Saved OFF preference overrides default ON at startup\n');
  } finally {
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide'));
    dom.window.close();
  }
}

main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
