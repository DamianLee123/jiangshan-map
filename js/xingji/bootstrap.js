/**
 * 行迹 · derivative bootstrap — registers 星火燎原 pack into upstream person-chronicle data.
 */
(function () {
  'use strict';

  const XINGJI_KEY = 'maozedong';

  function mergeMaoJourney() {
    const pack = window.XINGJI_MAO_JOURNEY;
    if (!pack || !window.ATLAS_LORE_DATA) return false;
    const list = window.ATLAS_LORE_DATA.HISTORICAL_JOURNEYS;
    if (!Array.isArray(list)) return false;
    const i = list.findIndex((j) => j && j.key === XINGJI_KEY);
    if (i >= 0) list[i] = pack;
    else list.push(pack);
    return true;
  }

  function patchProfile() {
    if (!window.ATLAS_LORE_DATA || !Array.isArray(window.ATLAS_LORE_DATA.PERSON_PROFILES)) return;
    const p = window.ATLAS_LORE_DATA.PERSON_PROFILES.find((x) => x.key === XINGJI_KEY);
    if (!p) return;
    p.journeyKey = XINGJI_KEY;
    p.span = [1893, 1949];
    p.evCount = (window.XINGJI_MAO_JOURNEY && window.XINGJI_MAO_JOURNEY.stops.length) || p.evCount;
    p.xingjiEpithetZh = '星火燎原';
    p.xingjiEpithetEn = 'Sparks of Revolution';
    p.courtesyZh = '星火燎原 · 字润之 · 中华人民共和国主要缔造者';
  }

  function installLoreHook() {
    const C = window.HistoricalAtlasController;
    if (!C || !C.prototype || C.prototype.__xingjiLoreHooked) return;
    const orig = C.prototype._ensureLoreDetail;
    if (typeof orig !== 'function') return;
    C.prototype._ensureLoreDetail = function () {
      return Promise.resolve(orig.call(this)).then(() => {
        mergeMaoJourney();
        patchProfile();
      });
    };
    C.prototype.__xingjiLoreHooked = true;
  }

  function appendAttribution() {
    if (document.getElementById('xingji-attribution')) return;
    const bar = document.createElement('div');
    bar.id = 'xingji-attribution';
    bar.className = 'xingji-attribution';
    bar.innerHTML =
      '<span class="xingji-attribution-label">非官方</span>' +
      '<span>第三方衍生 · 基于 <a href="https://github.com/DeanChensj/jiangshan-map" target="_blank" rel="noopener noreferrer">江山时序</a>（GPL-3.0）· 非 deanchen.me 官方站</span>';
    const header = document.getElementById('nav-bar');
    const shell = document.getElementById('atlas-shell');
    if (shell && header) shell.insertBefore(bar, header.nextSibling);
    else if (header) header.appendChild(bar);
  }

  function appendRouteLegendNote() {
    const box = document.getElementById('txt-disclaimer');
    if (!box || box.dataset.xingjiLegend) return;
    const extra = document.createElement('p');
    extra.className = 'xingji-route-legend';
    extra.textContent =
      '行迹人物弧线：宽带朱砂示意线为人物公开行迹，不代表部队实际进军或作战方向；政区与现代省界均为示意参考。';
    box.appendChild(extra);
    box.dataset.xingjiLegend = '1';
  }

  window.XingjiBootstrap = {
    mergeMaoJourney,
    patchProfile,
    isXingjiPerson(profile) {
      return Boolean(profile && profile.journeyKey === XINGJI_KEY && profile.key === XINGJI_KEY);
    },
  };

  mergeMaoJourney();
  patchProfile();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installLoreHook();
      appendAttribution();
      appendRouteLegendNote();
    });
  } else {
    installLoreHook();
    appendAttribution();
    appendRouteLegendNote();
  }
})();