// ==UserScript==
// @name         YouTube Nerdest
// @namespace    YoutubeNerdest
// @version      1.1.3
// @license      MIT
// @description  Fold Stats for nerds into a live Mbps indicator, with close, expand and automatic display controls.
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
        if (Number.isFinite(kbps)) return `${(kbps / 1000).toFixed(2)} Mbps`;
      }
    }
    return null;
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
    const toggle = button('Expand Stats for nerds', 'ytn-toggle');
    toolbar.append(close, speed, toggle);
    let expanded = false;
    let resizeAnimation = null;
    const cancelAnimation = () => {
      resizeAnimation?.cancel();
      resizeAnimation = null;
    };

    const render = () => {
      const value = speedMbps(panel.querySelector(CONTENT));
      if (value === null) cancelAnimation();
      // Unknown markup leaves the native panel usable and visible.
      toolbar.hidden = value === null;
      toolbar.style.display = value === null ? 'none' : '';
      panel.classList.toggle('ytn-enhanced', value !== null);
      panel.classList.toggle('ytn-compact', value !== null && !expanded);
      if (value !== null && speed.textContent !== value) speed.textContent = value;
      toggle.setAttribute('aria-expanded', String(expanded));
      const label = `${expanded ? 'Collapse' : 'Expand'} Stats for nerds`;
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    };
    // Do not let player keyboard shortcuts, double-click or pointer gestures fire.
    for (const type of ['pointerdown', 'mousedown', 'dblclick', 'keydown', 'keyup', 'click']) {
      toolbar.addEventListener(type, event => event.stopPropagation());
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
      const player = panel.closest(PLAYER);
      const state = players.get(player);
      if (state) state.dismissed = true;
      const nativeClose = panel.querySelector('.ytp-sfn-close, .html5-video-info-panel-close');
      if (nativeClose) nativeClose.click();
      else pagePlayer(player)?.hideVideoInfo?.();
    });
    panel.append(toolbar);
    const observer = new MutationObserver(records => {
      if (records.some(record => !toolbar.contains(record.target))) render();
    });
    observer.observe(panel, { childList: true, characterData: true, subtree: true });
    panels.set(panel, { toolbar, observer, cancelAnimation });
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
        state.cancelAnimation();
        state.observer.disconnect();
        state.toolbar.remove();
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
      state.cancelAnimation();
      state.observer.disconnect();
    }
    for (const [player, state] of players) {
      clearTimeout(state.timer);
      player.removeEventListener('loadedmetadata', state.onLoad, true);
      player.removeEventListener('click', state.onClick, true);
    }
  });
})();
