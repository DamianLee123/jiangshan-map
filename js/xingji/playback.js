/**
 * 行迹 PRD 1.5–1.6 playback: transit playhead, inflection pause cards, red flag marker.
 */
(function () {
  'use strict';

  const XINGJI_KEY = 'maozedong';
  const BASE_TRANSIT_MS = 2200;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpCoord(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function isXingjiActive(ctrl) {
    return (
      ctrl.activePerson &&
      !ctrl.activePerson.isMulti &&
      ctrl.activePerson.profile &&
      ctrl.activePerson.profile.key === XINGJI_KEY &&
      ctrl.activePerson.profile.journeyKey === XINGJI_KEY
    );
  }

  function attachXingjiMeta(ctrl, events) {
    const pack = window.XINGJI_MAO_JOURNEY;
    if (!pack || !Array.isArray(events)) return;
    events.forEach((ev) => {
      const st = pack.stops[ev.journeyStopIdx];
      if (st && st.xingji) ev.xingji = { ...st.xingji };
    });
  }

  function ensurePanel() {
    let el = document.getElementById('xingji-inflection-panel');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'xingji-inflection-panel';
    el.className = 'xingji-inflection-panel is-hidden';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.innerHTML =
      '<div class="xip-inner">' +
      '<div class="xip-kicker">阶段简述</div>' +
      '<h3 class="xip-title"></h3>' +
      '<div class="xip-time"></div>' +
      '<div class="xip-body"></div>' +
      '<p class="xip-sources"><span class="xip-sources-label">依据</span><span class="xip-sources-list"></span></p>' +
      '<div class="xip-actions">' +
      '<button type="button" class="xip-btn xip-replay">重看这段</button>' +
      '<button type="button" class="xip-btn xip-continue primary">继续往下</button>' +
      '</div></div>';
    const shell = document.getElementById('atlas-shell') || document.body;
    shell.appendChild(el);
    return el;
  }

  function showInflectionPanel(ctrl, ev) {
    const panel = ensurePanel();
    const xj = ev && ev.xingji;
    if (!xj || !xj.inflection) {
      panel.classList.add('is-hidden');
      return;
    }
    const title = panel.querySelector('.xip-title');
    const time = panel.querySelector('.xip-time');
    const body = panel.querySelector('.xip-body');
    const sources = panel.querySelector('.xip-sources-list');
    if (title) title.textContent = xj.stageTitleZh || ev.titleZh || '';
    if (time) time.textContent = xj.stageTimeZh || `${ev.year}年`;
    if (body) body.textContent = xj.stageSummaryZh || '';
    if (sources) {
      sources.textContent = Array.isArray(xj.sourcesZh) ? xj.sourcesZh.join('；') : '';
    }
    panel.classList.remove('is-hidden');
    ctrl._xingji = ctrl._xingji || {};
    ctrl._xingji.inflectionPaused = true;
    ctrl._xingji.pauseEventIdx = ctrl.activePersonEventIdx;
    if (ctrl.personTimer) {
      clearInterval(ctrl.personTimer);
      ctrl.personTimer = null;
      ctrl._updateAutoplayUi();
    }
  }

  function hideInflectionPanel(ctrl) {
    const panel = document.getElementById('xingji-inflection-panel');
    if (panel) panel.classList.add('is-hidden');
    if (ctrl._xingji) {
      ctrl._xingji.inflectionPaused = false;
      ctrl._xingji.pauseEventIdx = -1;
    }
  }

  function renderFlag(ctrl, coord) {
    if (!ctrl.grpJourney || !coord) return;
    let g = ctrl.grpJourney.querySelector('.xingji-playhead-flag');
    if (!g) {
      g = ctrl._svgNode(
        'g',
        { class: 'xingji-playhead-flag', 'pointer-events': 'none' },
        ctrl.grpJourney
      );
      const inner = ctrl._svgNode('g', { class: 'xj-flag-inner' }, g);
      ctrl._svgNode(
        'path',
        {
          d: 'M0,0 L0,-14 L11,-9.5 L0,-5 Z',
          class: 'xj-flag-cloth',
        },
        inner
      );
      ctrl._svgNode('line', { x1: 0, y1: 0, x2: 0, y2: 4.5, class: 'xj-flag-pole' }, inner);
    }
    const [sx, sy] = ctrl.projector.toScreen(coord[0], coord[1]);
    g.setAttribute('transform', `translate(${sx.toFixed(2)},${sy.toFixed(2)})`);
    g.style.display = '';
  }

  function clearFlag(ctrl) {
    const g = ctrl.grpJourney && ctrl.grpJourney.querySelector('.xingji-playhead-flag');
    if (g) g.style.display = 'none';
  }

  function beginTransit(ctrl, fromIdx, toIdx) {
    const events = ctrl.activePerson.events;
    const from = events[fromIdx];
    const to = events[toIdx];
    if (!from || !to) return;
    ctrl._xingji = ctrl._xingji || {};
    if (ctrl._xingji.transitRaf) cancelAnimationFrame(ctrl._xingji.transitRaf);
    const speed = Number(ctrl.playSpeed) > 0 ? Number(ctrl.playSpeed) : 1;
    const duration = Math.max(400, BASE_TRANSIT_MS / speed);
    const start = performance.now();
    const fromC = from.coord;
    const toC = to.coord;
    const via = Array.isArray(to.via) && to.via.length ? to.via : null;

    const sampleCoord = (t) => {
      if (!via || !via.length) return lerpCoord(fromC, toC, t);
      const pts = [fromC, ...via, toC];
      const seg = 1 / (pts.length - 1);
      const pos = Math.min(pts.length - 2, Math.floor(t / seg));
      const localT = (t - pos * seg) / seg;
      return lerpCoord(pts[pos], pts[pos + 1], easeInOut(localT));
    };

    ctrl._xingji.transitActive = true;
    const tick = (now) => {
      if (!isXingjiActive(ctrl)) {
        ctrl._xingji.transitActive = false;
        return;
      }
      const raw = Math.min(1, (now - start) / duration);
      const t = easeInOut(raw);
      const c = sampleCoord(t);
      ctrl._xingji.flagCoord = c;
      renderFlag(ctrl, c);
      const year = Math.round(lerp(from.year, to.year, t));
      if (year !== ctrl.year) {
        ctrl._inPersonSync = true;
        ctrl.jumpToYear(ctrl._clampYearToDynasty(to.dynasty, year));
        ctrl._inPersonSync = false;
      }
      if (raw < 1) {
        ctrl._xingji.transitRaf = requestAnimationFrame(tick);
      } else {
        ctrl._xingji.transitActive = false;
        ctrl._xingji.transitRaf = null;
        ctrl.selectPersonEvent(toIdx, true);
        const ev = events[toIdx];
        if (ev && ev.xingji && ev.xingji.inflection) {
          showInflectionPanel(ctrl, ev);
        } else {
          hideInflectionPanel(ctrl);
          ctrl._scheduleXingjiAutoplayStep(ctrl);
        }
      }
    };
    ctrl._xingji.transitRaf = requestAnimationFrame(tick);
  }

  function continueFromInflection(ctrl) {
    hideInflectionPanel(ctrl);
    if (!ctrl.personTimer && ctrl.activePerson) {
      ctrl.personTimer = setInterval(
        () => ctrl._personAutoplayTick(),
        ctrl._personAutoplayIntervalMs()
      );
      ctrl._updateAutoplayUi();
    }
    ctrl._scheduleXingjiAutoplayStep(ctrl);
  }

  function replaySegment(ctrl) {
    const events = ctrl.activePerson.events;
    const idx = ctrl.activePersonEventIdx;
    const ev = events[idx];
    if (!ev || !(ev.xingji && ev.xingji.inflection)) return;
    let fromIdx = idx - 1;
    while (fromIdx >= 0) {
      const prev = events[fromIdx];
      if (prev && prev.xingji && prev.xingji.inflection && fromIdx !== idx) break;
      fromIdx--;
    }
    if (fromIdx < 0) fromIdx = 0;
    hideInflectionPanel(ctrl);
    ctrl.selectPersonEvent(fromIdx, true);
    beginTransit(ctrl, fromIdx, idx);
  }

  function installPlaybackHooks() {
    const C = window.HistoricalAtlasController;
    if (!C || !C.prototype || C.prototype.__xingjiPlaybackHooked) return;
    const proto = C.prototype;

    const origCollect = proto._collectPersonEvents;
    proto._collectPersonEvents = function (profile, opts) {
      const out = origCollect.call(this, profile, opts);
      if (profile && profile.key === XINGJI_KEY) attachXingjiMeta(this, out);
      return out;
    };

    const origOpen = proto.openPersonChronicle;
    proto.openPersonChronicle = function (personOrQuery, initialIdx) {
      mergeBeforeOpen();
      const ret = origOpen.call(this, personOrQuery, initialIdx);
      if (isXingjiActive(this)) {
        this._xingji = {
          inflectionPaused: false,
          pauseEventIdx: -1,
          transitActive: false,
        };
        hideInflectionPanel(this);
      }
      return ret;
    };

    const origRenderCard = proto._renderPersonChronicleCard;
    proto._renderPersonChronicleCard = function (preserveScroll) {
      origRenderCard.call(this, preserveScroll);
      if (!isXingjiActive(this)) return;
      const heading = this._id('genealogy-heading');
      if (heading && !heading.querySelector('.xingji-epithet')) {
        const epithet = document.createElement('div');
        epithet.className = 'xingji-epithet';
        epithet.textContent = '「星火燎原」';
        heading.appendChild(epithet);
      }
      const lore = this._id('genealogy-lore');
      if (lore && !lore.querySelector('.xingji-pack-note')) {
        const note = document.createElement('p');
        note.className = 'xingji-pack-note';
        note.textContent =
          '公开行迹 1893—1949 · 12 段 / 25 拐点 · 收束开国大典（建国后节点另表）';
        lore.prepend(note);
      }
    };

    const origSelect = proto.selectPersonEvent;
    proto.selectPersonEvent = function (idx, panCamera) {
      origSelect.call(this, idx, panCamera);
      if (!isXingjiActive(this)) {
        clearFlag(this);
        hideInflectionPanel(this);
        return;
      }
      const ev = this.activePerson.events[idx];
      if (ev && ev.coord) {
        this._xingji = this._xingji || {};
        this._xingji.flagCoord = ev.coord;
        if (!this._xingji.transitActive) renderFlag(this, ev.coord);
      }
      if (
        ev &&
        ev.xingji &&
        ev.xingji.inflection &&
        !this._xingji.transitActive &&
        (this._xingji.manualJump || this._xingji.jumpExpand)
      ) {
        showInflectionPanel(this, ev);
      }
      if (this._xingji) {
        this._xingji.manualJump = false;
        this._xingji.jumpExpand = false;
      }
    };

    const origStep = proto.stepPersonEvent;
    proto.stepPersonEvent = function (delta) {
      if (!isXingjiActive(this)) return origStep.call(this, delta);
      this._xingji = this._xingji || {};
      if (this._xingji.inflectionPaused) return;
      this._xingji.manualJump = true;
      this._xingji.jumpExpand = true;
      origStep.call(this, delta);
      const idx = this.activePersonEventIdx;
      const ev = this.activePerson.events[idx];
      if (ev && ev.xingji && ev.xingji.inflection) showInflectionPanel(this, ev);
    };

    const origAutoplayTick = proto._personAutoplayTick;
    proto._personAutoplayTick = function () {
      if (!isXingjiActive(this)) return origAutoplayTick.call(this);
      if (this._xingji && (this._xingji.inflectionPaused || this._xingji.transitActive)) return;
      this._scheduleXingjiAutoplayStep(this);
    };

    proto._scheduleXingjiAutoplayStep = function (ctrl) {
      const events = ctrl.activePerson.events;
      let cur = ctrl.activePersonEventIdx;
      if (cur < 0) cur = 0;
      const to = cur + 1;
      if (to >= events.length) {
        if (ctrl.personTimer) {
          clearInterval(ctrl.personTimer);
          ctrl.personTimer = null;
          ctrl._updateAutoplayUi();
        }
        return;
      }
      if (cur === ctrl.activePersonEventIdx && cur < 0) {
        ctrl.selectPersonEvent(0, true);
      }
      beginTransit(ctrl, cur, to);
    };

    const origToggle = proto.togglePersonAutoplay;
    proto.togglePersonAutoplay = function () {
      if (isXingjiActive(this) && this._xingji && this._xingji.inflectionPaused) {
        continueFromInflection(this);
        return;
      }
      const was = Boolean(this.personTimer);
      origToggle.call(this);
      if (!was && this.personTimer && isXingjiActive(this)) {
        clearInterval(this.personTimer);
        this.personTimer = setInterval(() => this._personAutoplayTick(), this._personAutoplayIntervalMs());
        if (this.activePersonEventIdx < 0) this.selectPersonEvent(0, true);
        this._scheduleXingjiAutoplayStep(this);
      }
    };

    const origPins = proto._renderPersonPinsOverlay;
    proto._renderPersonPinsOverlay = function () {
      origPins.call(this);
      if (!isXingjiActive(this)) return;
      if (this._xingji && this._xingji.flagCoord) renderFlag(this, this._xingji.flagCoord);
    };

    proto.__xingjiPlaybackHooked = true;

    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('.xip-continue, .xip-replay');
      if (!btn) return;
      const ctrl = window.atlas;
      if (!ctrl || !isXingjiActive(ctrl)) return;
      e.preventDefault();
      if (btn.classList.contains('xip-replay')) replaySegment(ctrl);
      else continueFromInflection(ctrl);
    });
  }

  function mergeBeforeOpen() {
    if (window.XingjiBootstrap && window.XingjiBootstrap.mergeMaoJourney) {
      window.XingjiBootstrap.mergeMaoJourney();
      window.XingjiBootstrap.patchProfile();
    }
  }

  function installKeyboardHook() {
    window.addEventListener(
      'keydown',
      (e) => {
        const ctrl = window.atlas;
        if (!ctrl || !isXingjiActive(ctrl)) return;
        if (e.key !== ' ' && e.key !== 'Enter') return;
        if (!ctrl._xingji || !ctrl._xingji.inflectionPaused) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        continueFromInflection(ctrl);
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installPlaybackHooks();
      installKeyboardHook();
    });
  } else {
    installPlaybackHooks();
    installKeyboardHook();
  }
})();