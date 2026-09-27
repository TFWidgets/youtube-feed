/*!
 * TF Widgets — YouTube Feed v2
 * Встраивание: <script src=".../embed.js" data-id="CLIENT_ID"></script>
 * Конфиг клиента: configs/CLIENT_ID.json (формат v1 с videoUrls/customPosts поддерживается)
 * Два режима:
 *   "source": "channel" — последние видео канала подтягиваются сами (бесплатно, через /api/yt этого же сайта)
 *   "source": "videos"  — клиент сам выбрал видео
 * Видео открываются во всплывающем плеере (youtube-nocookie.com), без ухода с сайта.
 * Классы и CSS-переменные: префикс bhw- (общий для всех виджетов TF Widgets), всё ограничено классом .bhw-yt.
 */
(function () {
    'use strict';
    var VERSION = '2.0.1';
    var LOG = '[TFW YouTube]';
    // Где работает живое превью BHWYouTube.render() (конфигуратор на сайте)
    var PREVIEW_DOMAINS = ['tf-widgets.com', '*.tf-widgets.com', '9ac5za-h1.myshopify.com'];

    var I18N = {
        en: { subscribe: 'Subscribe', views: 'views', watch: 'Watch on YouTube', more: 'More videos', prev: 'Previous videos', next: 'Next videos', close: 'Close', play: 'Play' },
        es: { subscribe: 'Suscribirse', views: 'visualizaciones', watch: 'Ver en YouTube', more: 'Más vídeos', prev: 'Anteriores', next: 'Siguientes', close: 'Cerrar', play: 'Reproducir' },
        fr: { subscribe: 'S’abonner', views: 'vues', watch: 'Regarder sur YouTube', more: 'Plus de vidéos', prev: 'Précédentes', next: 'Suivantes', close: 'Fermer', play: 'Lire' },
        de: { subscribe: 'Abonnieren', views: 'Aufrufe', watch: 'Auf YouTube ansehen', more: 'Mehr Videos', prev: 'Zurück', next: 'Weiter', close: 'Schließen', play: 'Abspielen' },
        it: { subscribe: 'Iscriviti', views: 'visualizzazioni', watch: 'Guarda su YouTube', more: 'Altri video', prev: 'Precedenti', next: 'Successivi', close: 'Chiudi', play: 'Riproduci' },
        nl: { subscribe: 'Abonneren', views: 'weergaven', watch: 'Bekijk op YouTube', more: 'Meer video’s', prev: 'Vorige', next: 'Volgende', close: 'Sluiten', play: 'Afspelen' },
        pt: { subscribe: 'Inscrever-se', views: 'visualizações', watch: 'Ver no YouTube', more: 'Mais vídeos', prev: 'Anteriores', next: 'Seguintes', close: 'Fechar', play: 'Reproduzir' },
        pl: { subscribe: 'Subskrybuj', views: 'wyświetleń', watch: 'Obejrzyj na YouTube', more: 'Więcej filmów', prev: 'Poprzednie', next: 'Następne', close: 'Zamknij', play: 'Odtwórz' },
        cs: { subscribe: 'Odebírat', views: 'zhlédnutí', watch: 'Přehrát na YouTube', more: 'Další videa', prev: 'Předchozí', next: 'Další', close: 'Zavřít', play: 'Přehrát' },
        sk: { subscribe: 'Odoberať', views: 'zhliadnutí', watch: 'Pozrieť na YouTube', more: 'Ďalšie videá', prev: 'Predchádzajúce', next: 'Ďalšie', close: 'Zavrieť', play: 'Prehrať' }
    };

    var ICON = {
        play: '<svg viewBox="0 0 68 48" aria-hidden="true"><path class="bhw-play-bg" d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.5 8.5 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z"/><path fill="#fff" d="M27 34.3 45 24 27 13.7z"/></svg>',
        left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 5.4 8.8 12l6.6 6.6-1.4 1.4-8-8 8-8z"/></svg>',
        right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m8.6 18.6 6.6-6.6-6.6-6.6L10 4l8 8-8 8z"/></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg>',
        ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>'
    };

    var inlineCSS = `
        .bhw-yt { font-family: var(--bhw-font, 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif); -webkit-font-smoothing: antialiased; box-sizing: border-box; font-size: var(--bhw-font-size, 15px); line-height: 1.45; }
        .bhw-yt *, .bhw-yt *::before, .bhw-yt *::after { box-sizing: border-box; }
        .bhw-yt.bhw-container { width: 100%; max-width: var(--bhw-max-width, 1140px); margin: var(--bhw-margin, 24px auto); }
        .bhw-yt .bhw-widget {
            position: relative; overflow: hidden; isolation: isolate;
            background: var(--bhw-bg, #ffffff); color: var(--bhw-text-color, #0f0f0f);
            border: 1px solid var(--bhw-widget-border, rgba(0,0,0,.07)); border-radius: var(--bhw-widget-radius, 22px);
            padding: var(--bhw-padding, 28px); box-shadow: var(--bhw-shadow, 0 24px 60px -28px rgba(0,0,0,.28));
        }
        .bhw-yt.bhw-flat .bhw-widget { background: transparent; border: 0; box-shadow: none; padding: 0; }

        .bhw-yt .bhw-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px 24px; margin: 0 0 22px; }
        .bhw-yt .bhw-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .bhw-yt .bhw-ch-logo { flex: none; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; overflow: hidden; background: var(--bhw-accent, #ff0033); color: #fff; font-weight: 800; font-size: 1.3em; object-fit: cover; }
        .bhw-yt .bhw-head-txt { display: grid; gap: 3px; min-width: 0; }
        .bhw-yt .bhw-title { margin: 0; padding: 0; font-family: inherit; font-size: var(--bhw-title-size, 1.4em); font-weight: 800; line-height: 1.2; letter-spacing: -.02em; }
        .bhw-yt .bhw-subtitle { margin: 0; font-size: .92em; opacity: .66; }
        .bhw-yt .bhw-sub-btn {
            display: inline-flex; align-items: center; gap: 8px; margin: 0; padding: 11px 18px; min-height: 0; border: 0; border-radius: 999px;
            font: inherit; font-size: .9em; font-weight: 700; line-height: 1.2; text-decoration: none !important; white-space: nowrap; cursor: pointer;
            background: var(--bhw-accent, #ff0033); color: var(--bhw-accent-text, #fff); box-shadow: none; transition: transform .2s, filter .2s;
        }
        .bhw-yt .bhw-sub-btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
        .bhw-yt .bhw-sub-count { font-size: .85em; opacity: .66; }

        .bhw-yt .bhw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--bhw-card-min, 260px)), 1fr)); gap: var(--bhw-gap, 18px); margin: 0; padding: 0; list-style: none; }
        .bhw-yt .bhw-vid { margin: 0; min-width: 0; }
        .bhw-yt .bhw-vid-btn { display: grid; gap: 10px; width: 100%; margin: 0; padding: 0; min-height: 0; border: 0; background: none; box-shadow: none; color: inherit; font: inherit; text-align: left; cursor: pointer; text-decoration: none !important; }
        .bhw-yt .bhw-thumb { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--bhw-block-radius, 14px); background: #0f0f0f; }
        .bhw-yt .bhw-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
        .bhw-yt .bhw-thumb::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,.35)); opacity: 0; transition: opacity .3s; }
        .bhw-yt .bhw-vid-btn:hover .bhw-thumb img { transform: scale(1.04); }
        .bhw-yt .bhw-vid-btn:hover .bhw-thumb::after { opacity: 1; }
        .bhw-yt .bhw-play { position: absolute; left: 50%; top: 50%; z-index: 1; width: 58px; height: 41px; transform: translate(-50%, -50%); transition: transform .25s; filter: drop-shadow(0 6px 14px rgba(0,0,0,.35)); }
        .bhw-yt .bhw-play .bhw-play-bg { fill: rgba(33,33,33,.82); transition: fill .2s; }
        .bhw-yt .bhw-vid-btn:hover .bhw-play { transform: translate(-50%, -50%) scale(1.08); }
        .bhw-yt .bhw-vid-btn:hover .bhw-play .bhw-play-bg { fill: var(--bhw-accent, #ff0033); }
        .bhw-yt .bhw-short-tag { position: absolute; right: 8px; bottom: 8px; z-index: 1; padding: 2px 7px; border-radius: 6px; background: rgba(0,0,0,.72); color: #fff; font-size: .72em; font-weight: 700; }
        .bhw-yt .bhw-vid-title { margin: 0; font-weight: 700; line-height: 1.35; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
        .bhw-yt .bhw-vid-meta { margin: -6px 0 0; font-size: .82em; opacity: .62; }

        /* главное видео + список */
        .bhw-yt.bhw-featured .bhw-feat { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: var(--bhw-gap, 18px); align-items: start; }
        .bhw-yt.bhw-featured .bhw-feat-main .bhw-vid-title { font-size: 1.2em; -webkit-line-clamp: 2; }
        .bhw-yt.bhw-featured .bhw-feat-main .bhw-play { width: 76px; height: 54px; }
        .bhw-yt.bhw-featured .bhw-side { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
        .bhw-yt.bhw-featured .bhw-side .bhw-vid-btn { grid-template-columns: 42% minmax(0, 1fr); align-items: start; gap: 12px; }
        .bhw-yt.bhw-featured .bhw-side .bhw-thumb { border-radius: calc(var(--bhw-block-radius, 14px) - 4px); }
        .bhw-yt.bhw-featured .bhw-side .bhw-play { width: 36px; height: 26px; }
        .bhw-yt.bhw-featured .bhw-side .bhw-vid-title { font-size: .9em; }
        .bhw-yt.bhw-featured .bhw-side .bhw-vid-meta { margin: 4px 0 0; }
        .bhw-yt.bhw-featured.bhw-w-sm .bhw-feat { grid-template-columns: 1fr; }

        /* слайдер */
        .bhw-yt.bhw-carousel .bhw-track { display: grid; grid-auto-flow: column; grid-auto-columns: var(--bhw-slide, calc((100% - 2 * var(--bhw-gap, 18px)) / 3)); gap: var(--bhw-gap, 18px); overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; margin: 0; padding: 0; list-style: none; }
        .bhw-yt.bhw-carousel .bhw-track::-webkit-scrollbar { display: none; }
        .bhw-yt.bhw-carousel .bhw-vid { scroll-snap-align: start; }
        .bhw-yt.bhw-carousel.bhw-w-md .bhw-track { --bhw-slide: calc((100% - var(--bhw-gap, 18px)) / 2); }
        .bhw-yt.bhw-carousel.bhw-w-sm .bhw-track { --bhw-slide: 86%; }
        .bhw-yt .bhw-car-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 16px 0 0; }
        .bhw-yt .bhw-dots { display: flex; gap: 6px; }
        .bhw-yt .bhw-dots i { display: block; width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .18; transition: opacity .2s, width .2s; }
        .bhw-yt .bhw-dots i.on { opacity: .75; width: 18px; border-radius: 4px; }
        .bhw-yt .bhw-nav { display: flex; gap: 8px; }
        .bhw-yt .bhw-arrow { display: grid; place-items: center; width: 40px; height: 40px; margin: 0; padding: 0; min-height: 0; border-radius: 50%; border: 1px solid var(--bhw-line, rgba(0,0,0,.12)); background: var(--bhw-bg, #fff); color: inherit; box-shadow: none; cursor: pointer; }
        .bhw-yt .bhw-arrow svg { width: 20px; height: 20px; }
        .bhw-yt .bhw-arrow[disabled] { opacity: .35; cursor: default; }
        .bhw-yt .bhw-more-link { display: inline-flex; align-items: center; gap: 6px; font-size: .88em; font-weight: 700; color: inherit; text-decoration: none !important; opacity: .8; }
        .bhw-yt .bhw-more-link svg { width: 14px; height: 14px; }
        .bhw-yt .bhw-foot { display: flex; justify-content: center; margin: 20px 0 0; }

        /* всплывающий плеер */
        .bhw-yt-modal { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.82); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); animation: bhw-yt-fade .2s ease; }
        .bhw-yt-modal .bhw-yt-frame { position: relative; width: min(1100px, 100%, calc((100vh - 110px) * 16 / 9)); aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; background: #000; box-shadow: 0 30px 80px rgba(0,0,0,.6); }
        .bhw-yt-modal .bhw-yt-frame.bhw-vertical { width: min(420px, 100%, calc((100vh - 110px) * 9 / 16)); aspect-ratio: 9 / 16; }
        .bhw-yt-modal iframe { display: block; width: 100%; height: 100%; border: 0; }
        .bhw-yt-modal .bhw-yt-x { position: absolute; top: 14px; right: 14px; display: grid; place-items: center; width: 42px; height: 42px; margin: 0; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,.14); color: #fff !important; cursor: pointer; }
        .bhw-yt-modal .bhw-yt-x svg { width: 20px; height: 20px; }
        .bhw-yt-modal .bhw-yt-ext { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 6px; color: #fff !important; font: 600 13px/1 system-ui, sans-serif; opacity: .8; text-decoration: none !important; }
        .bhw-yt-modal .bhw-yt-ext svg { width: 14px; height: 14px; }
        @keyframes bhw-yt-fade { from { opacity: 0; } to { opacity: 1; } }

        .bhw-yt .bhw-vid-btn:focus-visible, .bhw-yt .bhw-arrow:focus-visible, .bhw-yt .bhw-sub-btn:focus-visible, .bhw-yt-modal .bhw-yt-x:focus-visible { outline: 2px solid var(--bhw-accent, #ff0033); outline-offset: 3px; border-radius: var(--bhw-block-radius, 14px); }
        @media (max-width: 560px) {
            .bhw-yt .bhw-widget { padding: var(--bhw-padding-mobile, 20px); }
            .bhw-yt.bhw-flat .bhw-widget { padding: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .bhw-yt *, .bhw-yt-modal { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }

        /* защита от тем сайта, которые красят весь текст через color: ... !important */
        .bhw-yt .bhw-widget { color: var(--bhw-text-color, #0f0f0f) !important; }
        .bhw-yt .bhw-widget :where(*) { color: inherit !important; }
        .bhw-yt .bhw-widget .bhw-sub-btn, .bhw-yt .bhw-widget .bhw-sub-btn * { color: var(--bhw-accent-text, #fff) !important; }
        .bhw-yt .bhw-widget .bhw-ch-logo, .bhw-yt .bhw-widget .bhw-short-tag { color: #fff !important; }
        .bhw-yt img { border: 0 !important; margin: 0; padding: 0; max-width: none; box-shadow: none; }
    `;

    /* =========================================================
       ПУБЛИЧНЫЕ API
       ========================================================= */
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.youtube = window.BusinessHoursWidgets.youtube || {};

    var currentScript = document.currentScript || (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    var BASE = getBasePath(currentScript && currentScript.src);

    // Живое превью для конфигуратора: BHWYouTube.render(container, config) -> { update, setState, destroy }
    var api = window.BHWYouTube = window.BHWYouTube || {};
    api.version = VERSION;
    api.base = BASE;
    api.defaults = getDefaultConfig;
    api.checkAccess = bhwCheckAccess;
    api.parseVideoId = parseVideoId;
    api.fetchApi = fetchApi;
    api.render = function (container, config) {
        var noop = { destroy: function () {}, update: function () {}, setState: function () {} };
        if (!bhwCheckAccess({ domains: PREVIEW_DOMAINS }).ok) { console.warn(LOG, 'preview is only available on tf-widgets.com'); return noop; }
        injectBaseStyles();
        if (container._bhwYtDestroy) container._bhwYtDestroy();
        var cls = container.__bhwYtClass || (container.__bhwYtClass = 'bhw-yt-preview-' + Math.random().toString(36).slice(2, 8));
        var widget = null;
        function build(cfg) {
            if (widget) widget.destroy();
            // в превью лента канала не запрашивается: конфигуратор сам кладёт видео в cfg.videos
            var n = normalizeConfig(cfg || {});
            widget = mountWidget(n, n.videos, cls, 'preview', { inline: container, preview: true });
        }
        build(config);
        var ctrl = {
            update: function (cfg) { build(cfg); },
            setState: function () {},
            destroy: function () { if (widget) widget.destroy(); widget = null; container._bhwYtDestroy = null; }
        };
        container._bhwYtDestroy = ctrl.destroy;
        return ctrl;
    };

    /* =========================================================
       АВТОЗАПУСК ПО <script data-id="..."> (только свой тег)
       ========================================================= */
    try {
        if (currentScript && currentScript.dataset && currentScript.dataset.id && currentScript.dataset.bhwMounted !== '1') {
            currentScript.dataset.bhwMounted = '1';
            var debug = currentScript.dataset.debug === '1';
            var clientId = normalizeId(currentScript.dataset.id);
            loadConfig(clientId, BASE)
                .then(function (fetched) {
                    var access = bhwCheckAccess(fetched);
                    if (!access.ok) {
                        console.warn(LOG, 'widget "' + clientId + '" is not active on ' + (location.hostname || 'this page') + ': ' + access.reason);
                        return;
                    }
                    var cfg = normalizeConfig(fetched);
                    if (debug) console.log(LOG, 'config "' + clientId + '":', cfg);
                    return getVideos(cfg).then(function (videos) {
                        if (!videos.length) { console.warn(LOG, 'no videos to show'); return; }
                        injectBaseStyles();
                        var mount = function () {
                            var w = mountWidget(cfg, videos, 'bhw-yt-' + clientId.replace(/[^a-z0-9_-]/gi, '') + '-' + Date.now(), clientId, { anchor: currentScript });
                            window.BusinessHoursWidgets.youtube[clientId] = w;
                        };
                        if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
                    });
                })
                .catch(function (error) {
                    // Нет конфига = нет виджета
                    console.warn(LOG, 'config "' + clientId + '" not loaded:', error.message);
                });
        }
    } catch (error) {
        console.error(LOG, 'critical error:', error);
    }

    /* =========================================================
       ФУНКЦИИ
       ========================================================= */
    function injectBaseStyles() {
        if (!document.getElementById('youtube-widget-styles-v2')) {
            var style = document.createElement('style');
            style.id = 'youtube-widget-styles-v2';
            style.textContent = inlineCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    /* ---------------------------------------------------------
       ДОСТУП (общий блок для всех виджетов TF Widgets — копировать без изменений)
       В конфиге клиента:
         "active": true,                       // false = виджет выключен (например, подписка отменена)
         "domains": ["client.com", "client-shop.myshopify.com", "*.client.com"]
       "client.com" разрешает client.com и www.client.com,
       "*.client.com" — любые поддомены (shop.client.com и т.д.).
       Без списка domains виджет не запускается.
       На localhost и при открытии файла с компьютера работает всегда (для тестов).
       --------------------------------------------------------- */
    function bhwCheckAccess(config) {
        config = config || {};
        if (config.active === false) return { ok: false, reason: 'widget is switched off ("active": false)' };
        var host = String(location.hostname || '').toLowerCase().replace(/^www\./, '');
        if (!host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return { ok: true };
        var list = config.domains;
        if (typeof list === 'string') list = list.split(/[\s,]+/);
        if (!Array.isArray(list) || !list.length) return { ok: false, reason: 'no "domains" in config' };
        for (var i = 0; i < list.length; i++) {
            var d = String(list[i] || '').trim().toLowerCase()
                .replace(/^[a-z]+:\/\//, '').replace(/[\/:].*$/, '').replace(/^www\./, '');
            if (!d) continue;
            if (d.indexOf('*.') === 0) {
                var base = d.slice(2);
                if (host === base || host.slice(-(base.length + 1)) === '.' + base) return { ok: true };
            } else if (host === d) {
                return { ok: true };
            }
        }
        return { ok: false, reason: 'domain is not in "domains"' };
    }

    function normalizeId(id) { return String(id || 'demo').replace(/\.(json|js)$/i, ''); }
    function getBasePath(src) {
        if (!src) return './';
        try { var url = new URL(src, location.href); return url.origin + url.pathname.replace(/\/[^\/]*$/, '/'); }
        catch (error) { return './'; }
    }
    function loadConfig(clientId, baseUrl) {
        if (clientId === 'local') {
            var el = document.querySelector('#youtube-local-config') || document.querySelector('#bhw-local-config');
            if (!el) return Promise.reject(new Error('#youtube-local-config not found'));
            try { return Promise.resolve(JSON.parse(el.textContent)); } catch (e) { return Promise.reject(e); }
        }
        var url = baseUrl + 'configs/' + encodeURIComponent(clientId) + '.json?v=' + Date.now();
        return fetch(url, { cache: 'no-store', headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }
    function fetchApi(query) {
        return fetch(BASE + 'api/yt?' + query, { headers: { 'Accept': 'application/json' } })
            .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status)); return j; }); });
    }

    /* видео для показа: лента канала (с запасным списком из конфига) или выбранные вручную */
    function getVideos(cfg) {
        var fallback = cfg.videos.slice(0, cfg.maxVideos);
        if (cfg.source === 'channel' && /^UC[\w-]{22}$/.test(cfg.channelId || '')) {
            return fetchApi('channel=' + encodeURIComponent(cfg.channelId)).then(function (d) {
                var list = (d.videos || []).filter(function (v) { return !(cfg.hideShorts && v.short); }).slice(0, cfg.maxVideos);
                return list.length ? list : fallback;
            }).catch(function (e) { console.warn(LOG, 'channel feed failed, using saved videos:', e.message); return fallback; });
        }
        var missing = fallback.filter(function (v) { return !v.title; }).map(function (v) { return v.id; });
        if (!missing.length) return Promise.resolve(fallback);
        return fetchApi('videos=' + missing.join(',')).then(function (d) {
            var map = {}; (d.videos || []).forEach(function (m) { map[m.id] = m; });
            return fallback.filter(function (v) { return !(map[v.id] && map[v.id].unavailable); })
                .map(function (v) { return v.title ? v : mergeDeep(v, { title: (map[v.id] || {}).title || '' }); });
        }).catch(function () { return fallback; });
    }

    function getDefaultConfig() {
        return {
            layout: 'grid',                 // grid — сетка; carousel — слайдер; featured — большое видео + список
            source: 'videos',               // videos — выбранные видео; channel — последние видео канала автоматически
            channelId: '',                  // UC... (для source: channel)
            channelUrl: '',                 // ссылка на канал — для кнопки Subscribe
            channelName: '',
            logo: '',                       // картинка канала (необязательно), иначе первая буква
            subscribers: '',                // текст рядом с кнопкой, например "12K subscribers"
            title: 'Watch our latest videos',
            subtitle: '',
            locale: 'en',
            maxVideos: 6,
            hideShorts: false,
            showDate: true,
            showViews: true,
            showSubscribe: true,
            playInline: true,               // true — плеер поверх сайта; false — открывать YouTube
            videos: [],                     // [{ id, title, published?, views?, short? }]
            style: {
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
                transparent: false,
                colors: {
                    background: '#ffffff',
                    text: '#0f0f0f',
                    accent: '#ff0033',
                    accentText: '#ffffff',
                    widgetBorder: 'rgba(0, 0, 0, 0.07)',
                    line: 'rgba(0, 0, 0, 0.12)'
                },
                borderRadius: { widget: 22, blocks: 14 },
                sizes: { fontSize: 1, padding: 28, gap: 18, width: 1140 },
                shadow: { widget: '0 24px 60px -28px rgba(0, 0, 0, 0.28)' }
            }
        };
    }

    function parseVideoId(u) {
        var s = String(u || '').trim();
        if (/^[\w-]{11}$/.test(s)) return s;
        var m = s.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/);
        return m ? m[1] : '';
    }

    /* v1: { widgetTitle, widgetDescription, channelUrl, maxPosts, videoUrls: [...], customPosts: [...], channelStats: {...} } */
    function normalizeConfig(raw) {
        raw = raw || {};
        var base = getDefaultConfig();
        var legacy = !raw.layout && (raw.videoUrls || raw.customPosts || raw.widgetTitle);
        if (legacy) {
            var vids = [];
            (raw.customPosts || []).forEach(function (p) { var id = parseVideoId(p.videoUrl || p.id); if (id) vids.push({ id: id, title: p.title || '' }); });
            (raw.videoUrls || []).forEach(function (u) { var id = parseVideoId(u); if (id && !vids.some(function (v) { return v.id === id; })) vids.push({ id: id, title: '' }); });
            var cs = raw.channelStats || {};
            raw = {
                layout: 'grid', source: 'videos', title: raw.widgetTitle || '', subtitle: raw.widgetDescription || '',
                channelUrl: raw.channelUrl || '', subscribers: cs.subscribers && cs.subscribers !== '—' ? cs.subscribers + ' subscribers' : '',
                maxVideos: raw.maxPosts || 6, showDate: false, showViews: false, videos: vids,
                style: { colors: { accent: ((raw.style || {}).colors || {}).accent || '#ff0000' } }
            };
        }
        var cfg = mergeDeep(base, raw);
        cfg.videos = (Array.isArray(raw.videos) ? raw.videos : []).map(function (v) {
            if (typeof v === 'string') v = { id: v };
            var id = parseVideoId(v && (v.id || v.url));
            return id ? { id: id, title: String(v.title || ''), published: v.published || '', views: Number(v.views) || 0, short: !!v.short, thumb: v.thumb || '' } : null;
        }).filter(Boolean);
        cfg.maxVideos = Math.max(1, Math.min(15, Math.round(num(cfg.maxVideos, 6))));
        cfg._t = mergeDeep(I18N[I18N[cfg.locale] ? cfg.locale : 'en'], {});
        cfg._legacy = !!legacy;
        return cfg;
    }

    function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
    function mergeDeep(base, over) {
        var out = {};
        Object.keys(base || {}).forEach(function (k) { out[k] = isObj(base[k]) ? mergeDeep(base[k], {}) : base[k]; });
        Object.keys(over || {}).forEach(function (k) {
            var v = over[k];
            if (isObj(v) && isObj(out[k])) out[k] = mergeDeep(out[k], v);
            else if (v !== undefined) out[k] = v;
        });
        return out;
    }
    function cssValue(v, fallback) { if (v === undefined || v === null || v === '') return fallback; return String(v).replace(/[;{}<>]/g, ''); }
    function num(v, fallback) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : fallback; }
    function safeUrl(url) {
        var u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
        return '';
    }
    function escapeHtml(text) {
        return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function fmtViews(n, cfg) {
        if (!n) return '';
        var s; try { s = new Intl.NumberFormat(cfg.locale || 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n); } catch (e) { s = String(n); }
        return s + ' ' + cfg._t.views;
    }
    function fmtAgo(iso, cfg) {
        var t = Date.parse(iso); if (!t) return '';
        var sec = (t - Date.now()) / 1000, a = Math.abs(sec);
        var u = a < 3600 ? ['minute', 60] : a < 86400 ? ['hour', 3600] : a < 604800 ? ['day', 86400] : a < 2629800 ? ['week', 604800] : a < 31557600 ? ['month', 2629800] : ['year', 31557600];
        try { return new Intl.RelativeTimeFormat(cfg.locale || 'en', { numeric: 'auto' }).format(Math.round(sec / u[1]), u[0]); } catch (e) { return ''; }
    }
    function watchUrl(v) { return v.short ? 'https://www.youtube.com/shorts/' + v.id : 'https://www.youtube.com/watch?v=' + v.id; }
    function channelLink(cfg) {
        var u = safeUrl(cfg.channelUrl);
        if (u && /^https:\/\/(www\.|m\.)?youtube\.com\//i.test(u)) return u;
        if (/^UC[\w-]{22}$/.test(cfg.channelId || '')) return 'https://www.youtube.com/channel/' + cfg.channelId;
        return '';
    }

    function applyCustomStyles(uniqueClass, cfg) {
        var id = 'bhw-yt-style-' + uniqueClass;
        var el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; (document.head || document.documentElement).appendChild(el); }
        var s = cfg.style || {}, c = s.colors || {}, z = s.sizes || {}, r = s.borderRadius || {}, sh = s.shadow || {};
        var fs = num(z.fontSize, 1), pad = num(z.padding, 28);
        el.textContent = '.' + uniqueClass + '{' +
            '--bhw-font:' + cssValue(s.fontFamily, "'Inter', system-ui, sans-serif") + ';' +
            '--bhw-font-size:' + (15 * fs).toFixed(2) + 'px;' +
            '--bhw-max-width:' + Math.round(num(z.width, 1140)) + 'px;' +
            '--bhw-bg:' + cssValue(c.background, '#ffffff') + ';' +
            '--bhw-text-color:' + cssValue(c.text, '#0f0f0f') + ';' +
            '--bhw-accent:' + cssValue(c.accent, '#ff0033') + ';' +
            '--bhw-accent-text:' + cssValue(c.accentText, '#ffffff') + ';' +
            '--bhw-widget-border:' + cssValue(c.widgetBorder, 'rgba(0,0,0,0.07)') + ';' +
            '--bhw-line:' + cssValue(c.line, 'rgba(0,0,0,0.12)') + ';' +
            '--bhw-widget-radius:' + num(r.widget, 22) + 'px;' +
            '--bhw-block-radius:' + num(r.blocks, 14) + 'px;' +
            '--bhw-padding:' + pad + 'px;' +
            '--bhw-padding-mobile:' + Math.round(pad * .72) + 'px;' +
            '--bhw-gap:' + num(z.gap, 18) + 'px;' +
            '--bhw-shadow:' + cssValue(sh.widget, '0 24px 60px -28px rgba(0,0,0,0.28)') + ';' +
            '}';
        return id;
    }

    var opts_preview = false;
    function vidHtml(v, cfg, tag) {
        var meta = [cfg.showViews ? fmtViews(v.views, cfg) : '', cfg.showDate ? fmtAgo(v.published, cfg) : ''].filter(Boolean).join(' · ');
        var thumb = opts_preview && /^data:image\//.test(v.thumb || '') ? v.thumb : 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg';
        var inner = '<span class="bhw-thumb"><img src="' + escapeHtml(thumb) + '" alt="" loading="lazy">' +
                ICON.play.replace('<svg', '<svg class="bhw-play"') + (v.short ? '<span class="bhw-short-tag">Shorts</span>' : '') + '</span>' +
            '<span style="display:grid;gap:6px;min-width:0">' + (v.title ? '<span class="bhw-vid-title">' + escapeHtml(v.title) + '</span>' : '') +
                (meta ? '<span class="bhw-vid-meta">' + escapeHtml(meta) + '</span>' : '') + '</span>';
        var label = escapeHtml(cfg._t.play + (v.title ? ': ' + v.title : ''));
        return '<' + (tag || 'li') + ' class="bhw-vid">' + (cfg.playInline
            ? '<button class="bhw-vid-btn" type="button" data-vid="' + v.id + '"' + (v.short ? ' data-short="1"' : '') + ' aria-label="' + label + '">' + inner + '</button>'
            : '<a class="bhw-vid-btn" href="' + escapeHtml(watchUrl(v)) + '" target="_blank" rel="noopener" aria-label="' + label + '">' + inner + '</a>') +
        '</' + (tag || 'li') + '>';
    }

    function headHtml(cfg) {
        var link = channelLink(cfg), T = cfg._t;
        var logo = safeUrl(cfg.logo), name = cfg.channelName || cfg.title || 'Y';
        var sub = cfg.showSubscribe && link
            ? '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + (cfg.subscribers ? '<span class="bhw-sub-count">' + escapeHtml(cfg.subscribers) + '</span>' : '') +
              '<a class="bhw-sub-btn" href="' + escapeHtml(link + (/[?]/.test(link) ? '&' : '?') + 'sub_confirmation=1') + '" target="_blank" rel="noopener">' + escapeHtml(T.subscribe) + '</a></div>' : '';
        if (!cfg.title && !cfg.subtitle && !sub) return '';
        return '<div class="bhw-head"><div class="bhw-brand">' +
            (logo ? '<img class="bhw-ch-logo" src="' + escapeHtml(logo) + '" alt="">' : (cfg.channelName ? '<span class="bhw-ch-logo" aria-hidden="true">' + escapeHtml(name.trim().charAt(0).toUpperCase()) + '</span>' : '')) +
            '<div class="bhw-head-txt">' + (cfg.title ? '<h3 class="bhw-title">' + escapeHtml(cfg.title) + '</h3>' : '') +
            (cfg.subtitle ? '<p class="bhw-subtitle">' + escapeHtml(cfg.subtitle) + '</p>' : '') + '</div></div>' + sub + '</div>';
    }

    function openPlayer(id, short, cfg) {
        var old = document.querySelector('.bhw-yt-modal'); if (old) old.remove();
        var prevFocus = document.activeElement;
        var m = document.createElement('div');
        m.className = 'bhw-yt-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
        m.innerHTML = '<div class="bhw-yt-frame' + (short ? ' bhw-vertical' : '') + '"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>' +
            '<button class="bhw-yt-x" type="button" aria-label="' + escapeHtml(cfg._t.close) + '">' + ICON.close + '</button>' +
            '<a class="bhw-yt-ext" href="' + escapeHtml(watchUrl({ id: id, short: short })) + '" target="_blank" rel="noopener">' + escapeHtml(cfg._t.watch) + ICON.ext + '</a>';
        var html = document.documentElement, overflow = html.style.overflow;
        function close() { m.remove(); html.style.overflow = overflow; document.removeEventListener('keydown', key); if (prevFocus && prevFocus.focus) prevFocus.focus(); }
        function key(e) { if (e.key === 'Escape') close(); if (e.key === 'Tab') { e.preventDefault(); m.querySelector('.bhw-yt-x').focus(); } }
        m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.bhw-yt-x')) close(); });
        document.addEventListener('keydown', key);
        html.style.overflow = 'hidden';
        document.body.appendChild(m);
        m.querySelector('.bhw-yt-x').focus();
    }

    function mountWidget(cfg, videos, uniqueClass, id, opts) {
        opts = opts || {};
        var styleId = applyCustomStyles(uniqueClass, cfg);
        var layout = ['grid', 'carousel', 'featured'].indexOf(cfg.layout) >= 0 ? cfg.layout : 'grid';
        var list = (videos || []).slice(0, cfg.maxVideos);
        var root = document.createElement('div');
        root.id = 'youtube-widget-' + id;
        root.className = 'bhw-yt bhw-container ' + uniqueClass + (layout !== 'grid' ? ' bhw-' + layout : '') + (cfg.style && cfg.style.transparent ? ' bhw-flat' : '');
        var T = cfg._t, link = channelLink(cfg), body;
        opts_preview = !!opts.preview;
        if (layout === 'featured' && list.length > 1) {
            body = '<div class="bhw-feat"><div class="bhw-feat-main">' + vidHtml(list[0], cfg, 'div') + '</div><ul class="bhw-side">' + list.slice(1, 5).map(function (v) { return vidHtml(v, cfg); }).join('') + '</ul></div>';
        } else if (layout === 'carousel') {
            body = '<ul class="bhw-track">' + list.map(function (v) { return vidHtml(v, cfg); }).join('') + '</ul>' +
                '<div class="bhw-car-foot"><div class="bhw-dots" aria-hidden="true"></div><div class="bhw-nav">' +
                '<button class="bhw-arrow bhw-prev" type="button" aria-label="' + escapeHtml(T.prev) + '">' + ICON.left + '</button>' +
                '<button class="bhw-arrow bhw-next" type="button" aria-label="' + escapeHtml(T.next) + '">' + ICON.right + '</button></div></div>';
        } else {
            body = '<ul class="bhw-grid">' + list.map(function (v) { return vidHtml(v, cfg); }).join('') + '</ul>';
        }
        var foot = link && layout !== 'carousel' ? '<div class="bhw-foot"><a class="bhw-more-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + escapeHtml(T.more) + ICON.ext + '</a></div>' : '';
        root.innerHTML = '<div class="bhw-widget">' + headHtml(cfg) + body + foot + '</div>';

        if (opts.inline) opts.inline.appendChild(root);
        else if (opts.anchor && opts.anchor.parentNode) opts.anchor.parentNode.insertBefore(root, opts.anchor.nextSibling);
        else document.body.appendChild(root);

        var cleanups = [];
        function on(t, e, h, o) { if (!t) return; t.addEventListener(e, h, o); cleanups.push(function () { t.removeEventListener(e, h, o); }); }
        on(root, 'click', function (e) {
            var b = e.target.closest('.bhw-vid-btn[data-vid]'); if (!b) return;
            if (opts.preview && /^sample/.test(b.getAttribute('data-vid'))) return;   // заглушки в конфигураторе не запускаем
            openPlayer(b.getAttribute('data-vid'), b.hasAttribute('data-short'), cfg);
        });
        /* слайдер */
        var track = root.querySelector('.bhw-track');
        function updateNav() {
            if (!track) return;
            var prev = root.querySelector('.bhw-prev'), next = root.querySelector('.bhw-next'), dots = root.querySelector('.bhw-dots');
            var max = track.scrollWidth - track.clientWidth;
            prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2;
            var card = track.querySelector('.bhw-vid'); if (!card) return;
            var step = card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 18);
            var pages = Math.max(1, Math.round(max / step) + 1), cur = Math.min(pages - 1, Math.round(track.scrollLeft / step));
            if (dots.children.length !== pages) dots.innerHTML = new Array(pages + 1).join('<i></i>');
            [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === cur); });
            root.querySelector('.bhw-nav').style.visibility = max > 2 ? '' : 'hidden';
        }
        if (track) {
            var go = function (dir) { var card = track.querySelector('.bhw-vid'); if (card) track.scrollBy({ left: dir * (card.offsetWidth + 18), behavior: 'smooth' }); };
            on(root.querySelector('.bhw-prev'), 'click', function () { go(-1); });
            on(root.querySelector('.bhw-next'), 'click', function () { go(1); });
            on(track, 'scroll', function () { cancelAnimationFrame(updateNav._r); updateNav._r = requestAnimationFrame(updateNav); }, { passive: true });
        }
        function sizeClass() {
            // в превью ширина берётся у области превью: масштаб (zoom) не должен менять раскладку
            var w = opts.inline ? Math.max(0, opts.inline.clientWidth - 32) : (root.clientWidth || 0);
            root.classList.toggle('bhw-w-md', w > 0 && w < 860 && w >= 560);
            root.classList.toggle('bhw-w-sm', w > 0 && w < 560);
            updateNav();
        }
        if (window.ResizeObserver) { var ro = new ResizeObserver(sizeClass); ro.observe(root); cleanups.push(function () { ro.disconnect(); }); }
        else on(window, 'resize', sizeClass);
        requestAnimationFrame(sizeClass);
        /* у удалённых видео YouTube отдаёт серую заглушку 120×90 — такие карточки прячем */
        root.querySelectorAll('.bhw-thumb img').forEach(function (img) {
            on(img, 'load', function () { if (img.naturalWidth === 120 && img.naturalHeight === 90 && !opts.preview) { var li = img.closest('.bhw-vid'); if (li && root.querySelectorAll('.bhw-vid').length > 1) li.remove(); } });
        });

        return {
            root: root, config: cfg, id: id,
            destroy: function () { cleanups.forEach(function (f) { try { f(); } catch (e) {} }); root.remove(); var s = document.getElementById(styleId); if (s) s.remove(); }
        };
    }
})();
