/**
 * 行迹 PRD 1.7 — map year / dynasty / view follow the selected person's chronicle, not global China evolution autoplay.
 */
(function () {
  'use strict';

  function isJourneyPerson(ctrl) {
    return Boolean(
      ctrl.activePerson &&
        !ctrl.activePerson.isMulti &&
        ctrl.activePerson.profile &&
        ctrl.activePerson.profile.journeyKey
    );
  }

  function syncYearToEvent(ctrl, ev) {
    if (!ev || !Array.isArray(ev.coord)) return;
    ctrl._inPersonSync = true;
    try {
      const dyn = ev.dynasty || ctrl.dynasties[ctrl._findDynastyIndex(ev.year)];
      ctrl.jumpToYear(ctrl._clampYearToDynasty(dyn, ev.year));
    } finally {
      ctrl._inPersonSync = false;
    }
  }

  function installPersonSyncHooks() {
    const C = window.HistoricalAtlasController;
    if (!C || !C.prototype || C.prototype.__xingjiPersonSyncHooked) return;
    const proto = C.prototype;

    const origStart = proto.startAutoplay;
    proto.startAutoplay = function () {
      if (isJourneyPerson(this)) return;
      return origStart.call(this);
    };

    const origTick = proto._autoplayTick;
    proto._autoplayTick = function () {
      if (isJourneyPerson(this)) return;
      return origTick.call(this);
    };

    const origOpen = proto.openPersonChronicle;
    proto.openPersonChronicle = function (personOrQuery, initialIdx) {
      const wasPlaying = Boolean(this.playing);
      this.stopAutoplay();
      if (wasPlaying) this.stopAutoplay();
      const ret = origOpen.call(this, personOrQuery, initialIdx);
      if (isJourneyPerson(this)) {
        this._xingjiPersonTrail = true;
        const events = this.activePerson.events || [];
        const idx = this.activePersonEventIdx >= 0 ? this.activePersonEventIdx : 0;
        const ev = events[idx];
        if (ev) syncYearToEvent(this, ev);
      }
      return ret;
    };

    const origSelect = proto.selectPersonEvent;
    proto.selectPersonEvent = function (idx, panCamera) {
      const ret = origSelect.call(this, idx, panCamera);
      if (isJourneyPerson(this) && idx >= 0) {
        const ev = this.activePerson.events[idx];
        if (ev && !(this._xingji && this._xingji.transitActive)) {
          syncYearToEvent(this, ev);
        }
      }
      return ret;
    };

    proto.__xingjiPersonSyncHooked = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPersonSyncHooks);
  } else {
    installPersonSyncHooks();
  }
})();