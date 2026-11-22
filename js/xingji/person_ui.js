/**
 * 行迹 PRD 1.8 — person-scoped play UI: hide upstream chrome, clip timeline to footprint,
 * sidebar events from the person pack only, year-only links stay in person trail mode.
 */
(function () {
  'use strict';

  function isJourneyPerson(ctrl) {
    return Boolean(
      ctrl &&
        ctrl.activePerson &&
        !ctrl.activePerson.isMulti &&
        ctrl.activePerson.profile &&
        ctrl.activePerson.profile.journeyKey
    );
  }

  function getPersonSpan(ctrl) {
    const profile = ctrl.activePerson && ctrl.activePerson.profile;
    if (profile && Array.isArray(profile.span) && profile.span.length >= 2) {
      return [profile.span[0], profile.span[1]];
    }
    const events = (ctrl.activePerson && ctrl.activePerson.events) || [];
    if (!events.length) return [ctrl.year, ctrl.year];
    let min = events[0].year;
    let max = events[0].year;
    events.forEach((ev) => {
      if (ev.year < min) min = ev.year;
      if (ev.year > max) max = ev.year;
    });
    return [min, max];
  }

  function getEpithet(profile) {
    if (window.XingjiBrand && typeof window.XingjiBrand.getEpithet === 'function') {
      return window.XingjiBrand.getEpithet(profile);
    }
    return profile && (profile.xingjiEpithetZh || profile.courtesyZh || profile.zh);
  }

  function eventLabel(ctrl, ev) {
    const zh =
      (ev.xingji && ev.xingji.stageTitleZh) ||
      ev.titleZh ||
      ev.siteZh ||
      (ev.milestone && ctrl.milestoneHeadline && ev.dynasty && ev.milestone
        ? ctrl.milestoneHeadline(ev.dynasty, ev.milestone)
        : '') ||
      ev.siteZh ||
      '';
    return ctrl.locale === 'en'
      ? ev.titleEn || ev.siteEn || zh
      : typeof ctrl._zh === 'function'
        ? ctrl._zh(zh)
        : zh;
  }

  function setTrailChrome(active) {
    const root = document.documentElement;
    if (root) root.classList.toggle('xingji-person-trail', Boolean(active));
    const shell = document.getElementById('atlas-shell');
    if (shell) shell.classList.toggle('xingji-person-trail', Boolean(active));
  }

  function ensureScrubLabel(from, to, epithet) {
    const wrap = document.getElementById('scrubber-rail-wrap');
    if (!wrap) return;
    let el = document.getElementById('xingji-person-scrub-label');
    if (!el) {
      el = document.createElement('div');
      el.id = 'xingji-person-scrub-label';
      el.className = 'xingji-person-scrub-label';
      wrap.prepend(el);
    }
    const lo = from <= 0 ? `前${-from}` : String(from);
    const hi = to <= 0 ? `前${-to}` : String(to);
    el.textContent = epithet ? `${lo}—${hi} · ${epithet}行迹轴` : `${lo}—${hi} · 人物行迹轴`;
    el.classList.remove('is-hidden');
  }

  function hideScrubLabel() {
    const el = document.getElementById('xingji-person-scrub-label');
    if (el) el.classList.add('is-hidden');
  }

  function applyPersonTimelineBounds(ctrl) {
    if (!isJourneyPerson(ctrl)) return;
    if (!ctrl._xingjiSavedBounds) {
      ctrl._xingjiSavedBounds = {
        minYear: ctrl.minYear,
        maxYear: ctrl.maxYear,
        bandClip: ctrl._bandClip,
      };
    }
    const profile = ctrl.activePerson.profile;
    const [from, to] = getPersonSpan(ctrl);
    ctrl._bandClip = [from, to];
    ctrl.minYear = from;
    ctrl.maxYear = to;
    if (typeof ctrl._buildScrubberBands === 'function') ctrl._buildScrubberBands();
    if (typeof ctrl._setScrubberView === 'function') ctrl._setScrubberView(0, 1);
    const inp = ctrl._id && ctrl._id('inp-year');
    if (inp) {
      inp.min = String(from);
      inp.max = String(to);
    }
    const track = ctrl._id && ctrl._id('scrubber-track');
    if (track) {
      track.setAttribute('aria-valuemin', String(from));
      track.setAttribute('aria-valuemax', String(to));
    }
    const epithet = getEpithet(profile);
    ensureScrubLabel(from, to, epithet && epithet !== profile.zh ? `「${epithet}」` : '');
    setTrailChrome(true);
  }

  function restorePersonTimelineBounds(ctrl) {
    if (!ctrl._xingjiSavedBounds) {
      setTrailChrome(false);
      hideScrubLabel();
      return;
    }
    const saved = ctrl._xingjiSavedBounds;
    ctrl._xingjiSavedBounds = null;
    ctrl.minYear = saved.minYear;
    ctrl.maxYear = saved.maxYear;
    ctrl._bandClip = saved.bandClip;
    if (typeof ctrl._buildScrubberBands === 'function') ctrl._buildScrubberBands();
    if (typeof ctrl._setScrubberView === 'function') ctrl._setScrubberView(0, 1);
    const inp = ctrl._id && ctrl._id('inp-year');
    if (inp) {
      inp.min = String(ctrl.minYear);
      inp.max = String(ctrl.maxYear);
    }
    hideScrubLabel();
    setTrailChrome(false);
  }

  function renderPersonChroniclePane(ctrl) {
    if (!isJourneyPerson(ctrl)) return;
    const profile = ctrl.activePerson.profile;
    const events = ctrl.activePerson.events || [];
    const [from, to] = getPersonSpan(ctrl);
    const epithet = getEpithet(profile);
    const name = profile.zh || '';
    const titleEl = ctrl._id('dynasty-title');
    if (titleEl) {
      titleEl.textContent =
        epithet && epithet !== name ? `${name} · 「${epithet}」` : name;
    }
    const spanEl = ctrl._id('dynasty-span');
    if (spanEl) {
      const lo = from <= 0 ? `前${-from}` : from;
      const hi = to <= 0 ? `前${-to}` : to;
      spanEl.textContent = `${lo} — ${hi}`;
    }
    const seatEl = ctrl._id('dynasty-seat');
    if (seatEl) {
      seatEl.textContent =
        ctrl.locale === 'en'
          ? 'Person journey · map year follows this trail'
          : '人物行迹 · 舆图年份随此行迹同步';
    }
    const topic = ctrl._id('lnk-dynasty-topic');
    if (topic) topic.classList.add('is-hidden');
    const summary = ctrl._id('dynasty-summary');
    if (summary) {
      summary.textContent =
        ctrl.locale === 'en'
          ? `Events and route stops from the ${name} data pack only (${events.length} nodes, ${from}–${to}). Not the upstream China evolution chronicle.`
          : `侧栏仅列出「${name}」数据包中的行迹节点与拐点（${events.length} 站，${from}—${to}），不含上游中国社会演变总览。`;
    }
    const heading = ctrl._id('txt-milestones-heading');
    if (heading) heading.textContent = ctrl.locale === 'en' ? 'Journey events' : '行迹节点';
    const polityExtra = ctrl._id('polity-extra');
    if (polityExtra) {
      polityExtra.innerHTML = '';
      polityExtra.classList.add('is-hidden');
    }
    const back = ctrl._id('polity-backbar');
    if (back) back.classList.add('is-hidden');

    const ul = ctrl._id('milestone-list');
    if (!ul) return;
    ul.innerHTML = '';
    const curIdx = ctrl.activePersonEventIdx;
    events.forEach((ev, idx) => {
      const li = document.createElement('li');
      const yr = ev.year;
      const yrLabel =
        ctrl.locale === 'en'
          ? typeof ctrl.formatYear === 'function'
            ? ctrl.formatYear(yr)
            : String(yr)
          : `${yr <= 0 ? '前' + -yr : yr} 年`;
      const tag =
        ev.xingji && ev.xingji.inflection
          ? '<span class="ev-map-tag" title="拐点">拐</span>'
          : '';
      li.innerHTML = `<span class="ev-yr">${yrLabel}</span><span>${eventLabel(ctrl, ev)}${tag}</span>`;
      li.classList.toggle('is-current', idx === curIdx);
      li.addEventListener('click', () => {
        ctrl.stopAutoplay();
        if (window.innerWidth <= 900 && ctrl.mobileChronicleOpen) {
          ctrl.toggleMobileChronicle(false);
        }
        ctrl._inPersonSync = true;
        try {
          if (typeof ctrl.selectPersonEvent === 'function') {
            ctrl.selectPersonEvent(idx, true);
          }
        } finally {
          ctrl._inPersonSync = false;
        }
      });
      ul.appendChild(li);
    });
    if (ctrl.locale === 'zh-tw' && typeof ctrl._applyZhHantDom === 'function') {
      const pane = ctrl._id('chronicle-pane');
      if (pane) ctrl._applyZhHantDom(pane);
    }
  }

  function syncEventHighlight(ctrl) {
    if (!isJourneyPerson(ctrl)) return;
    const ul = ctrl._id('milestone-list');
    if (!ul) return;
    const curIdx = ctrl.activePersonEventIdx;
    Array.from(ul.children).forEach((li, i) => {
      li.classList.toggle('is-current', i === curIdx);
    });
  }

  function selectEventForYear(ctrl, year) {
    if (!isJourneyPerson(ctrl)) return;
    const events = ctrl.activePerson.events;
    let best = 0;
    let bestDist = Infinity;
    events.forEach((ev, i) => {
      const d = Math.abs(ev.year - year);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (ctrl.activePersonEventIdx !== best) {
      ctrl._inPersonSync = true;
      try {
        ctrl.selectPersonEvent(best, false);
      } finally {
        ctrl._inPersonSync = false;
      }
    }
    syncEventHighlight(ctrl);
  }

  function attachYearFromQuery(ctrl) {
    if (!isJourneyPerson(ctrl)) return;
    const q = new URLSearchParams(location.search);
    if (!q.has('year') || q.has('stop')) return;
    const yList =
      typeof ctrl._parseYearList === 'function'
        ? ctrl._parseYearList(q.get('year') || '')
        : [Number(q.get('year'))];
    const y = yList[0];
    if (!Number.isFinite(y)) return;
    selectEventForYear(ctrl, y);
  }

  function installPersonUiHooks() {
    const C = window.HistoricalAtlasController;
    if (!C || !C.prototype || C.prototype.__xingjiPersonUiHooked) return;
    const proto = C.prototype;

    const origChronicle = proto._renderChroniclePane;
    proto._renderChroniclePane = function (dynasty) {
      if (isJourneyPerson(this)) {
        renderPersonChroniclePane(this);
        return;
      }
      const topic = this._id('lnk-dynasty-topic');
      if (topic) topic.classList.remove('is-hidden');
      return origChronicle.call(this, dynasty);
    };

    const origJump = proto.jumpToYear;
    proto.jumpToYear = function (targetYear) {
      const ret = origJump.call(this, targetYear);
      if (isJourneyPerson(this) && !this._inPersonSync) {
        renderPersonChroniclePane(this);
        if (this.isScrubbing) selectEventForYear(this, this.year);
      }
      return ret;
    };

    const origOpen = proto.openPersonChronicle;
    proto.openPersonChronicle = function () {
      const ret = origOpen.apply(this, arguments);
      if (isJourneyPerson(this)) {
        applyPersonTimelineBounds(this);
        renderPersonChroniclePane(this);
        attachYearFromQuery(this);
        if (window.XingjiBrand && typeof window.XingjiBrand.renderBrand === 'function') {
          window.XingjiBrand.renderBrand(this);
        }
      }
      return ret;
    };

    const origClear = proto._clearActivePerson;
    proto._clearActivePerson = function () {
      const was = isJourneyPerson(this);
      origClear.call(this);
      if (was) restorePersonTimelineBounds(this);
    };

    const origSelect = proto.selectPersonEvent;
    proto.selectPersonEvent = function () {
      const ret = origSelect.apply(this, arguments);
      if (isJourneyPerson(this)) {
        syncEventHighlight(this);
        if (window.XingjiBrand && typeof window.XingjiBrand.renderBrand === 'function') {
          window.XingjiBrand.renderBrand(this);
        }
      }
      return ret;
    };

    proto.__xingjiPersonUiHooked = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPersonUiHooks);
  } else {
    installPersonUiHooks();
  }

  window.XingjiPersonUi = {
    isJourneyPerson,
    renderPersonChroniclePane,
    applyPersonTimelineBounds,
  };
})();