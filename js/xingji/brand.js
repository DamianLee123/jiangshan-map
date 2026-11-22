/**
 * 行迹 PRD 1.7 — product branding (not 江山时序 official); person epithet in top-left.
 */
(function () {
  'use strict';

  const DEFAULT_SEAL = '行迹';
  const DEFAULT_SUB =
    '历史名人考据地图 · 基于江山时序 · 第三方衍生 · 非官方';
  const UPSTREAM_GH = 'https://github.com/DeanChensj/jiangshan-map';

  function getEpithet(profile) {
    if (!profile) return '';
    if (profile.xingjiEpithetZh) return profile.xingjiEpithetZh;
    const pack = window.XINGJI_MAO_JOURNEY;
    if (profile.key === 'maozedong' && pack && pack.xingji) return pack.xingji.epithetZh || '星火燎原';
    if (profile.journeyKey) {
      const journeys =
        (window.ATLAS_LORE_DATA && window.ATLAS_LORE_DATA.HISTORICAL_JOURNEYS) || [];
      const j = journeys.find((x) => x && x.key === profile.journeyKey);
      if (j && j.shortZh) return j.shortZh;
    }
    return profile.zh || '';
  }

  function renderBrand(ctrl) {
    const seal = document.getElementById('txt-seal');
    const sub = document.getElementById('txt-subtitle');
    let epithetEl = document.getElementById('xingji-epithet-heading');

    if (seal) seal.textContent = DEFAULT_SEAL;

    const person =
      ctrl &&
      ctrl.activePerson &&
      !ctrl.activePerson.isMulti &&
      ctrl.activePerson.profile &&
      ctrl.activePerson.profile.journeyKey;

    if (person) {
      const p = ctrl.activePerson.profile;
      const epithet = getEpithet(p);
      const personName = p.zh || '';
      if (!epithetEl) {
        epithetEl = document.createElement('span');
        epithetEl.id = 'xingji-epithet-heading';
        epithetEl.className = 'xingji-epithet-heading';
        const heading = document.getElementById('site-heading');
        if (heading) heading.appendChild(epithetEl);
      }
      epithetEl.textContent =
        epithet && epithet !== personName
          ? `${personName} · 「${epithet}」`
          : personName;
      epithetEl.classList.remove('is-hidden');
      if (sub) {
        sub.innerHTML =
          `行迹播放 <span class="xingji-nonofficial-tag">非官方</span> · 舆图年份随该行迹 · ` +
          `<a href="${UPSTREAM_GH}" target="_blank" rel="noopener noreferrer">基于江山时序</a>`;
      }
    } else {
      if (epithetEl) epithetEl.classList.add('is-hidden');
      if (sub) {
        sub.innerHTML =
          `${DEFAULT_SUB} · <a href="${UPSTREAM_GH}" target="_blank" rel="noopener noreferrer">上游 GitHub</a>`;
      }
    }
  }

  function installBrandHooks() {
    const C = window.HistoricalAtlasController;
    if (!C || !C.prototype || C.prototype.__xingjiBrandHooked) return;
    const proto = C.prototype;

    const origApply = proto.applyLocale;
    proto.applyLocale = function (opts) {
      const ret = origApply.call(this, opts);
      renderBrand(this);
      return ret;
    };

    const origOpen = proto.openPersonChronicle;
    proto.openPersonChronicle = function () {
      const ret = origOpen.apply(this, arguments);
      renderBrand(this);
      return ret;
    };

    const origClose = proto.closePersonChronicle;
    if (typeof origClose === 'function') {
      proto.closePersonChronicle = function () {
        const ret = origClose.apply(this, arguments);
        renderBrand(this);
        return ret;
      };
    }

    const origSelect = proto.selectPersonEvent;
    proto.selectPersonEvent = function () {
      const ret = origSelect.apply(this, arguments);
      renderBrand(this);
      return ret;
    };

    proto.__xingjiBrandHooked = true;
  }

  function initStaticBrand() {
    const seal = document.getElementById('txt-seal');
    const sub = document.getElementById('txt-subtitle');
    const home = document.getElementById('act-home');
    if (seal) seal.textContent = DEFAULT_SEAL;
    if (sub) {
      sub.innerHTML =
        `${DEFAULT_SUB} · <a href="${UPSTREAM_GH}" target="_blank" rel="noopener noreferrer">上游 GitHub</a>`;
    }
    if (home) home.title = '回到行迹首页';
    const gh = document.getElementById('act-github-star');
    if (gh) {
      gh.title = '江山时序上游仓库（本衍生项目基于该 Fork）';
    }
    const attr = document.getElementById('xingji-attribution');
    if (attr) attr.classList.add('is-compact');
  }

  window.XingjiBrand = { renderBrand, getEpithet };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initStaticBrand();
      installBrandHooks();
    });
  } else {
    initStaticBrand();
    installBrandHooks();
  }
})();