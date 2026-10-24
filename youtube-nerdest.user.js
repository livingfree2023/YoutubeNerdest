// ==UserScript==
// @name         YouTube Nerdest
// @name:zh      油管速度显示和快捷切换分辨率
// @name:zh-CN   油管速度显示和快捷切换分辨率
// @namespace    YoutubeNerdest
// @version      1.2.4
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/livingfree2023/YoutubeNerdest/main/youtube-nerdest.user.js
// @downloadURL  https://raw.githubusercontent.com/livingfree2023/YoutubeNerdest/main/youtube-nerdest.user.js
// @description  Compact live Mbps and resolution, with native quality shortcuts, animated expansion and automatic display controls.
// @description:zh 将 YouTube「详细统计信息」折叠为显示整数 Mbps 连接速度和当前清晰度的小窗，展开可快捷切换可用分辨率，支持自动显示、展开动画和 Enhancer 主题配色。
// @description:zh-CN 将 YouTube「详细统计信息」折叠为显示整数 Mbps 连接速度和当前清晰度的小窗，展开可快捷切换可用分辨率，支持自动显示、展开动画和 Enhancer 主题配色。
// @match        https://www.youtube.com/*
// @match        https://www.youtube-nocookie.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-idle
// @noframes
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener
// ==/UserScript==

(() => {
  'use strict';

  const PLAYER = '.html5-video-player';
  const PANEL = '.html5-video-info-panel';
  const CONTENT = '.html5-video-info-panel-content';
  const KEY = 'autoShowStats';
  const QUALITY_TIERS = [
    { id: 'highres', height: 4320, label: '8K', badge: true },
    { id: 'hd2160', height: 2160, label: '4K', badge: true },
    { id: 'hd1440', height: 1440, label: '2K', badge: true },
    { id: 'hd1080', height: 1080, label: 'HD', badge: true },
    { id: 'hd720', height: 720, label: '720p' },
    { id: 'large', height: 480, label: '480p' },
    { id: 'medium', height: 360, label: '360p', optional: true },
    { id: 'small', height: 240, label: '240p', optional: true },
  ];
  const players = new Map();
  const panels = new Map();
  let autoShow = GM_getValue(KEY, true) !== false;
  let menuId;
  let queued = false;

  const style = document.createElement('style');
  style.textContent = `
    .html5-video-info-panel.ytn-compact {
      width: max-content; min-width: 0 !important;
      max-width: calc(100% - 20px) !important;
      height: auto; min-height: 0 !important; padding: 0 !important;
    }
    /* Keep chart geometry measurable: display:none makes YouTube resize and
       clear its canvases while retaining their circular drawing cursors. */
    .html5-video-info-panel.ytn-compact > .html5-video-info-panel-content {
      position: absolute !important; visibility: hidden !important;
      pointer-events: none !important; width: max-content !important;
      max-width: none !important;
    }
    .html5-video-info-panel.ytn-enhanced > .ytp-sfn-close,
    .html5-video-info-panel.ytn-enhanced > .html5-video-info-panel-close { display: none !important; }
    .html5-video-info-panel > .ytn-toolbar {
      position: relative;
      display: flex; align-items: center; gap: 6px; height: 32px;
      padding: 0 4px 0 34px; color: #fff; font: 13px Arial, sans-serif;
    }
    .html5-video-info-panel:not(.ytn-compact) > .ytn-toolbar {
      position: absolute; top: 0; left: 0; right: 0;
      justify-content: flex-end; pointer-events: none;
    }
    .html5-video-info-panel:not(.ytn-compact) > .ytn-toolbar > .ytn-speed { display: none; }
    .html5-video-info-panel:not(.ytn-compact) > .ytn-toolbar > .ytn-current { display: none; }
    .ytn-toolbar > button {
      appearance: none; border: 0; border-radius: 2px; background: transparent;
      color: inherit; width: 24px; height: 28px; padding: 0;
      cursor: pointer; font: 19px Arial, sans-serif; line-height: 1; pointer-events: auto;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .ytn-toolbar > .ytn-close { position: absolute; top: 2px; left: 4px; }
    .ytn-toolbar > button:hover { background: #ffffff26; }
    .ytn-toolbar > button:focus-visible { outline: 2px solid #72b7f4; outline-offset: -2px; }
    .ytn-toolbar > .ytn-speed { white-space: nowrap; font-variant-numeric: tabular-nums; }
    .ytn-current { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
    .ytn-current[hidden] { display: none; }
    .ytn-current-badge[role="button"] { cursor: pointer; }
    .ytn-current-badge[role="button"]:focus-visible { outline: 2px solid #72b7f4; outline-offset: 2px; }
    .ytn-badge { background: var(--efyt-accent-color, var(--yt-sys-color-baseline--static-brand-red, #f03)); color: #fff; border-radius: 2px; padding: 1px 3px; font: 700 12px/15px Arial, sans-serif; letter-spacing: -.4px; }
    .html5-video-info-panel > .ytn-quality-row {
      display: flex; align-items: center; gap: 6px; padding-top: 7px; margin-top: 8px;
      border-top: 1px solid #ffffff25; overflow-x: auto; scrollbar-width: thin;
      font: 11px Arial, sans-serif;
    }
    .html5-video-info-panel.ytn-compact > .ytn-quality-row,
    .html5-video-info-panel > .ytn-quality-row[hidden] { display: none; }
    .ytn-quality-row > button {
      flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
      min-width: 32px; height: 28px; padding: 0 5px; border: 0;
      border-bottom: 2px solid transparent; border-radius: 2px 2px 0 0;
      color: #eee; background: transparent; font: inherit; cursor: pointer; white-space: nowrap;
    }
    .ytn-quality-row > button:hover { background: #ffffff20; }
    .ytn-quality-row > button[aria-pressed="true"] { background: #ffffff20; border-bottom-color: #fff; }
    .ytn-quality-row > button:focus-visible { outline: 2px solid #72b7f4; outline-offset: -2px; }
    .ytn-quality-row > button[hidden] { display: none; }
    .ytn-quality-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .ytn-toggle::before {
      content: ''; width: 7px; height: 7px;
      border-top: 1.5px solid currentColor; border-right: 1.5px solid currentColor;
      transform: rotate(45deg); transition: transform 220ms ease;
    }
    .ytn-toggle[aria-expanded="true"]::before { transform: rotate(225deg); }
    @media (prefers-reduced-motion: reduce) {
      .ytn-toggle::before { transition: none; }
    }
  `;
  document.head.append(style);

  function speedMbps(content) {
    if (!content) return null;
    for (const row of content.children) {
      // Anchor to the native Kbps value, never a converter's appended MB/s number.
      const values = [...row.querySelectorAll('span')];
      for (const value of values.reverse()) {
        const text = [...value.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent).join('').trim();
        const match = text.match(/^(\d+(?:[,\s]\d{3})*(?:\.\d+)?)\s*Kbps$/i);
        if (!match) continue;
        const kbps = Number(match[1].replace(/[,\s]/g, ''));
        if (Number.isFinite(kbps)) return `${Math.round(kbps / 1000)} Mbps`;
      }
    }
    return null;
  }

  function effectiveResolution(player, content) {
    let height = 0;
    for (const row of content?.children || []) {
      if (row.firstElementChild?.textContent.trim() !== 'Current / Optimal Res') continue;
      const dimensions = row.querySelector('span')?.textContent.match(/^\s*(\d+)x(\d+)(?:@[\d.]+)?\s*\//);
      if (dimensions) height = Math.min(Number(dimensions[1]), Number(dimensions[2]));
      break;
    }
    if (!height) {
      const video = player?.querySelector('video');
      height = Math.min(video?.videoWidth || 0, video?.videoHeight || 0);
    }
    if (!height) {
      try {
        const id = pagePlayer(player)?.getPlaybackQuality?.();
        height = QUALITY_TIERS.find(tier => tier.id === id)?.height || (id === 'tiny' ? 144 : 0);
      } catch { /* Missing or initializing player: omit an unknown resolution. */ }
    }
    if (!height) return null;
    return QUALITY_TIERS.find(tier => tier.height === height) || { label: `${height}p`, height };
  }

  function availableQualities(api) {
    if (typeof api?.setPlaybackQualityRange !== 'function') return [];
    let levels;
    try { levels = api.getAvailableQualityLevels?.(); } catch { return []; }
    if (!Array.isArray(levels)) return [];
    let data = [];
    try {
      const result = api.getAvailableQualityData?.();
      if (Array.isArray(result)) data = result;
    } catch { /* Older players may expose only the native level list. */ }
    const tiers = QUALITY_TIERS.filter(tier => {
      if (!levels.includes(tier.id)) return false;
      const entries = data.filter(item => item?.quality === tier.id);
      return !entries.length || entries.some(item => item.isPlayable !== false);
    });
    return tiers.length ? [...tiers, { id: 'auto', label: 'Auto' }] : [];
  }

  function button(label, className) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.title = label;
    element.setAttribute('aria-label', label);
    return element;
  }

  function attachPanel(panel) {
    if (panels.has(panel)) return;
    const toolbar = document.createElement('div');
    toolbar.className = 'ytn-toolbar';
    const close = button('Close Stats for nerds', 'ytn-close');
    close.textContent = '×';
    const speed = document.createElement('span');
    speed.className = 'ytn-speed';
    const current = document.createElement('span');
    current.className = 'ytn-current';
    const separator = document.createElement('span');
    separator.textContent = '·';
    separator.setAttribute('aria-hidden', 'true');
    const currentBadge = document.createElement('span');
    currentBadge.className = 'ytn-current-badge';
    current.append(separator, currentBadge);
    const toggle = button('Expand Stats for nerds', 'ytn-toggle');
    toolbar.append(close, speed, current, toggle);
    const qualityRow = document.createElement('div');
    qualityRow.className = 'ytn-quality-row';
    qualityRow.setAttribute('role', 'group');
    qualityRow.setAttribute('aria-label', 'Video quality');
    qualityRow.hidden = true;
    const qualityStatus = document.createElement('span');
    qualityStatus.className = 'ytn-quality-status';
    qualityStatus.setAttribute('role', 'status');
    let qualitySignature = '';
    let qualityTimer = null;
    let compactCycleIndex = null;
    let compactCycleSignature = '';
    let compactCycleVideo = '';
    let expanded = false;
    let resizeAnimation = null;
    const cancelAnimation = () => {
      resizeAnimation?.cancel();
      resizeAnimation = null;
    };

    const fitQualityRow = () => {
      if (qualityRow.hidden || !expanded || !qualityRow.clientWidth) return;
      const buttons = [...qualityRow.querySelectorAll('button')];
      buttons.forEach(item => { item.hidden = false; });
      for (const id of ['small', 'medium']) {
        if (qualityRow.scrollWidth <= qualityRow.clientWidth) break;
        const optional = buttons.find(item => item.dataset.quality === id);
        if (optional?.getAttribute('aria-pressed') === 'false') optional.hidden = true;
      }
    };

    const renderQualities = enabled => {
      if (!enabled || !expanded) { qualityRow.hidden = true; return; }
      const api = pagePlayer(panel.closest(PLAYER));
      const tiers = availableQualities(api);
      qualityRow.hidden = tiers.length === 0;
      const signature = tiers.map(tier => tier.id).join(',');
      if (signature !== qualitySignature) {
        qualitySignature = signature;
        qualityStatus.textContent = '';
        qualityRow.replaceChildren();
        for (const tier of tiers) {
          const item = button(tier.height ? `${tier.label} (${tier.height}p)` : 'Automatic quality', 'ytn-quality-button');
          item.dataset.quality = tier.id;
          const label = document.createElement('span');
          label.textContent = tier.label;
          if (tier.badge) label.className = 'ytn-badge';
          item.append(label);
          item.addEventListener('click', () => {
            const activeApi = pagePlayer(panel.closest(PLAYER));
            // A video may have changed since this button was rendered.
            if (!availableQualities(activeApi).some(option => option.id === tier.id)) { render(); return; }
            compactCycleIndex = null;
            try {
              // The old setPlaybackQuality export is a no-op in modern YouTube.
              activeApi.setPlaybackQualityRange(tier.id, tier.id);
              qualityStatus.textContent = `${tier.label} requested`;
            } catch {
              qualityStatus.textContent = 'Could not change quality. Use YouTube settings.';
            }
            render();
            clearTimeout(qualityTimer);
            qualityTimer = setTimeout(() => { qualityTimer = null; render(); }, 250);
          });
          qualityRow.append(item);
        }
        qualityRow.append(qualityStatus);
      }
      let preferred = null;
      try { preferred = api?.getPreferredQuality?.(); } catch { /* No fabricated selection state. */ }
      qualityRow.querySelectorAll('button').forEach(item => {
        item.setAttribute('aria-pressed', String(item.dataset.quality === preferred));
      });
      fitQualityRow();
    };

    const cycleCompactQuality = event => {
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      const player = panel.closest(PLAYER);
      const api = pagePlayer(player);
      const available = availableQualities(api);
      const eligible = available.filter(tier => tier.height >= 1080);
      if (eligible.length < 2) return;
      const signature = eligible.map(tier => tier.id).join(',');
      const identity = videoIdentity(player);
      if (signature !== compactCycleSignature || identity !== compactCycleVideo) {
        compactCycleIndex = null;
        compactCycleSignature = signature;
        compactCycleVideo = identity;
      }
      let nextIndex;
      if (compactCycleIndex === null) {
        let preferred = null;
        try { preferred = api?.getPreferredQuality?.(); } catch { /* Effective dimensions still guide the first step. */ }
        const effective = effectiveResolution(player, panel.querySelector(CONTENT));
        const alreadyAtTop = preferred === eligible[0].id || effective?.height === eligible[0].height;
        nextIndex = alreadyAtTop ? 1 : 0;
      } else {
        nextIndex = (compactCycleIndex + 1) % eligible.length;
      }
      const tier = eligible[nextIndex];
      // Re-read availability immediately before requesting in case the video changed.
      if (!availableQualities(pagePlayer(player)).some(option => option.id === tier.id)) {
        compactCycleIndex = null;
        render();
        return;
      }
      try {
        api.setPlaybackQualityRange(tier.id, tier.id);
        compactCycleIndex = nextIndex;
        qualityStatus.textContent = `${tier.label} requested`;
      } catch {
        qualityStatus.textContent = 'Could not change quality. Use YouTube settings.';
      }
      render();
      clearTimeout(qualityTimer);
      qualityTimer = setTimeout(() => { qualityTimer = null; render(); }, 250);
    };
    currentBadge.setAttribute('role', 'button');
    currentBadge.setAttribute('tabindex', '0');
    currentBadge.setAttribute('title', 'Cycle available resolutions from highest down to 1080p');
    currentBadge.addEventListener('click', cycleCompactQuality);
    currentBadge.addEventListener('keydown', cycleCompactQuality);

    const render = () => {
      if (!panel.isConnected) return;
      const content = panel.querySelector(CONTENT);
      const value = speedMbps(content);
      if (value === null) cancelAnimation();
      // Unknown markup leaves the native panel usable and visible.
      toolbar.hidden = value === null;
      toolbar.style.display = value === null ? 'none' : '';
      panel.classList.toggle('ytn-enhanced', value !== null);
      panel.classList.toggle('ytn-compact', value !== null && !expanded);
      if (value !== null && speed.textContent !== value) speed.textContent = value;
      const resolution = effectiveResolution(panel.closest(PLAYER), content);
      current.hidden = resolution === null;
      if (resolution) {
        if (currentBadge.textContent !== resolution.label) currentBadge.textContent = resolution.label;
        currentBadge.classList.toggle('ytn-badge', Boolean(resolution.badge));
        currentBadge.setAttribute('aria-label', `Current resolution: ${resolution.height}p. Click to cycle available resolutions from highest down to 1080p.`);
      }
      toggle.setAttribute('aria-expanded', String(expanded));
      const label = `${expanded ? 'Collapse' : 'Expand'} Stats for nerds`;
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
      renderQualities(value !== null);
    };
    // Do not let player keyboard shortcuts, double-click or pointer gestures fire.
    for (const type of ['pointerdown', 'mousedown', 'dblclick', 'keydown', 'keyup', 'click']) {
      for (const controls of [toolbar, qualityRow]) controls.addEventListener(type, event => event.stopPropagation());
    }
    toggle.addEventListener('click', () => {
      // Measure the current animated size before canceling, so rapid reversals
      // continue from the visible size rather than jumping to an endpoint.
      const before = panel.getBoundingClientRect();
      cancelAnimation();
      expanded = !expanded;
      render();
      const after = panel.getBoundingClientRect();
      if (!panel.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
          !before.width || !before.height || !after.width || !after.height) return;
      // Temporary animation effects leave native dimensions and inline styles
      // untouched once complete. Clip overflow while the panel changes size.
      resizeAnimation = panel.animate([
        { width: `${before.width}px`, height: `${before.height}px`, boxSizing: 'border-box', overflow: 'hidden' },
        { width: `${after.width}px`, height: `${after.height}px`, boxSizing: 'border-box', overflow: 'hidden' },
      ], { duration: 220, easing: 'ease', fill: 'none' });
    });
    close.addEventListener('click', () => {
      cancelAnimation();
      clearTimeout(qualityTimer);
      const player = panel.closest(PLAYER);
      const state = players.get(player);
      if (state) state.dismissed = true;
      const nativeClose = panel.querySelector('.ytp-sfn-close, .html5-video-info-panel-close');
      if (nativeClose) nativeClose.click();
      else pagePlayer(player)?.hideVideoInfo?.();
    });
    panel.append(toolbar, qualityRow);
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(fitQualityRow) : null;
    resizeObserver?.observe(qualityRow);
    const observer = new MutationObserver(records => {
      if (records.some(record => !toolbar.contains(record.target) && !qualityRow.contains(record.target))) render();
    });
    observer.observe(panel, { childList: true, characterData: true, subtree: true });
    const dispose = () => {
      cancelAnimation();
      clearTimeout(qualityTimer);
      resizeObserver?.disconnect();
    };
    panels.set(panel, { toolbar, qualityRow, observer, dispose, render });
    render();
  }

  function pagePlayer(player) {
    // GM grants isolate the script; unsafeWindow exposes the actual player API.
    if (!player?.id) return null;
    return unsafeWindow.document.getElementById(player.id);
  }

  function videoIdentity(player) {
    const api = pagePlayer(player);
    try {
      const id = api?.getVideoData?.()?.video_id;
      if (id) return id;
    } catch { /* Player initialization may not have finished yet. */ }
    const url = new URL(location.href);
    return url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1] || '';
  }

  function tryAutoShow(player, state) {
    if (!autoShow || state.dismissed || state.opened || !player.isConnected) return true;
    const identity = videoIdentity(player);
    if (!identity || !player.querySelector('video')) return false;
    const api = pagePlayer(player);
    if (typeof api?.showVideoInfo !== 'function') return false;
    try {
      api.showVideoInfo();
      // Opening can be asynchronous. Retry only until a native panel exists.
      const panel = player.querySelector(PANEL);
      if (panel) { state.opened = true; attachPanel(panel); return true; }
    } catch { /* Bounded retries below handle a player that is still loading. */ }
    return false;
  }

  function beginAutoShow(player, state) {
    clearTimeout(state.timer);
    let remaining = 20;
    const attempt = () => {
      state.timer = null;
      if (!tryAutoShow(player, state) && --remaining > 0) {
        state.timer = setTimeout(attempt, 500);
      }
    };
    attempt();
  }

  function refreshVideo(player, state) {
    const identity = videoIdentity(player);
    if (identity && identity !== state.identity) {
      state.identity = identity;
      state.dismissed = false;
      state.opened = false;
    }
    beginAutoShow(player, state);
    player.querySelectorAll(PANEL).forEach(panel => panels.get(panel)?.render());
  }

  function attachPlayer(player) {
    if (players.has(player)) return;
    const state = { identity: '', dismissed: false, opened: false, timer: null };
    state.onLoad = () => refreshVideo(player, state);
    state.onClick = event => {
      if (event.target.closest?.('.ytp-sfn-close, .html5-video-info-panel-close')) {
        state.dismissed = true;
      }
    };
    player.addEventListener('loadedmetadata', state.onLoad, true);
    player.addEventListener('click', state.onClick, true);
    players.set(player, state);
    refreshVideo(player, state);
  }

  function discover() {
    queued = false;
    for (const [panel, state] of panels) {
      if (!panel.isConnected) {
        state.dispose();
        state.observer.disconnect();
        state.toolbar.remove();
        state.qualityRow.remove();
        panel.classList.remove('ytn-compact', 'ytn-enhanced');
        panels.delete(panel);
      }
    }
    for (const [player, state] of players) {
      if (!player.isConnected) {
        clearTimeout(state.timer);
        player.removeEventListener('loadedmetadata', state.onLoad, true);
        player.removeEventListener('click', state.onClick, true);
        players.delete(player);
      }
    }
    document.querySelectorAll(PLAYER).forEach(attachPlayer);
    document.querySelectorAll(PANEL).forEach(attachPanel);
  }

  const discovery = new MutationObserver(records => {
    const relevant = records.some(record => {
      if (record.target.closest?.(PANEL)) return false;
      return [...record.addedNodes, ...record.removedNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches(`${PLAYER}, ${PANEL}`) || node.querySelector(`${PLAYER}, ${PANEL}`)));
    });
    if (relevant && !queued) { queued = true; queueMicrotask(discover); }
  });
  discovery.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('yt-navigate-finish', () => {
    discover();
    for (const [player, state] of players) refreshVideo(player, state);
  });

  function registerMenu() {
    if (menuId !== undefined) GM_unregisterMenuCommand(menuId);
    menuId = GM_registerMenuCommand(`Show stats automatically: ${autoShow ? 'ON ✓' : 'OFF'}`, () => {
      autoShow = !autoShow;
      GM_setValue(KEY, autoShow);
      applyPreference();
    });
  }

  function applyPreference() {
    registerMenu();
    for (const [player, state] of players) {
      clearTimeout(state.timer);
      if (autoShow) {
        state.dismissed = false;
        state.opened = false;
        beginAutoShow(player, state);
      }
    }
  }

  GM_addValueChangeListener(KEY, (_key, _old, value, remote) => {
    if (remote) { autoShow = value !== false; applyPreference(); }
  });
  registerMenu();
  discover();

  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    discovery.disconnect();
    for (const state of panels.values()) {
      state.dispose();
      state.observer.disconnect();
    }
    for (const [player, state] of players) {
      clearTimeout(state.timer);
      player.removeEventListener('loadedmetadata', state.onLoad, true);
      player.removeEventListener('click', state.onClick, true);
    }
  });
})();
