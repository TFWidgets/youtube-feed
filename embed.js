(function() {
    'use strict';

    // CSS стили для YouTube виджета
    const inlineCSS = `
        .bhw-container {
            font-family: var(--bhw-font, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
            max-width: var(--bhw-max-width, 1200px);
            margin: var(--bhw-margin, 20px auto);
            width: 100%;
            padding: 0 16px;
        }
        .bhw-widget {
            background: var(--bhw-bg, #ffffff);
            border-radius: var(--bhw-widget-radius, 24px);
            padding: var(--bhw-padding, 32px);
            color: var(--bhw-text-color, #1a1a1a);
            box-shadow: var(--bhw-shadow, 0 8px 32px rgba(0,0,0,0.08));
            position: relative;
            overflow: hidden;
        }
        
        /* Заголовок виджета */
        .bhw-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: var(--bhw-header-margin, 32px);
            flex-wrap: wrap;
            gap: 20px;
        }
        .bhw-branding {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;
            min-width: 300px;
        }
        .bhw-logo-icon {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bhw-logo-bg, linear-gradient(135deg, #FF0000 0%, #CC0000 100%));
            border-radius: 16px;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 12px rgba(255,0,0,0.3);
            flex-shrink: 0;
        }
        .bhw-branding-text h2 {
            font-size: var(--bhw-main-title-size, 1.75em);
            font-weight: 700;
            line-height: 1.3;
            margin: 0 0 6px 0;
            color: var(--bhw-main-title-color, #1a202c);
        }
        .bhw-branding-text p {
            font-size: var(--bhw-main-description-size, 0.95em);
            color: var(--bhw-main-description-color, #4a5568);
            line-height: 1.5;
            margin: 0;
        }
        
        /* Статистика канала */
        .bhw-stats {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }
        .bhw-stat-chip {
            background: var(--bhw-chip-bg, #f1f5f9);
            border: 1px solid var(--bhw-chip-border, #e2e8f0);
            border-radius: 999px;
            padding: 6px 12px;
            font-size: 13px;
            font-weight: 600;
            color: var(--bhw-text-color, #374151);
        }
        .bhw-follow-btn {
            background: var(--bhw-accent, #FF0000);
            color: white;
            border: none;
            border-radius: 999px;
            padding: 8px 16px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
        
        /* Сетка для YouTube видео */
        .bhw-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(var(--bhw-card-width, 340px), 1fr));
            gap: var(--bhw-gap, 20px);
            align-items: start;
        }
        
        /* Карточки видео */
        .bhw-card {
            background: var(--bhw-card-bg, #ffffff);
            border: var(--bhw-card-border, 1px solid #e5e7eb);
            border-radius: var(--bhw-block-radius, 16px);
            padding: 0;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            box-shadow: var(--bhw-card-shadow, 0 4px 12px rgba(0,0,0,0.05));
            overflow: hidden;
            cursor: pointer;
        }
        .bhw-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--bhw-card-hover-shadow, 0 12px 24px rgba(255,0,0,0.15));
            border-color: var(--bhw-border-hover, #d1d5db);
        }
        
        /* Цветная полоса сверху карточки */
        .bhw-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #FF0000;
            z-index: 1;
        }
        
        /* Содержимое карточки */
        .bhw-card-content {
            padding: var(--bhw-block-padding, 20px);
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        
        .bhw-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .bhw-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--bhw-avatar-border, #f3f4f6);
        }
        .bhw-user-info {
            flex: 1;
        }
        .bhw-author {
            font-weight: 600;
            font-size: 13px;
            color: var(--bhw-author-color, #111827);
            margin: 0 0 2px 0;
        }
        .bhw-time {
            font-size: 12px;
            color: var(--bhw-time-color, #6b7280);
            margin: 0;
        }
        
        .bhw-video-title {
            font-size: 16px;
            font-weight: 700;
            line-height: 1.4;
            color: var(--bhw-content-color, #1a202c);
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .bhw-video-description {
            font-size: 14px;
            line-height: 1.5;
            color: var(--bhw-time-color, #6b7280);
            margin-bottom: 16px;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        /* Превью видео с кнопкой Play */
        .bhw-media {
            width: 100%;
            aspect-ratio: 16/9;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            margin-bottom: 16px;
        }
        .bhw-media img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .bhw-play-button {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            border-radius: 50%;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            transition: all 0.2s ease;
            backdrop-filter: blur(4px);
        }
        .bhw-card:hover .bhw-play-button {
            background: rgba(255,0,0,0.9);
            transform: translate(-50%, -50%) scale(1.1);
        }
        
        /* Действия (метрики) */
        .bhw-actions {
            display: flex;
            gap: 16px;
            align-items: center;
            justify-content: space-between;
            padding-top: 16px;
            border-top: 1px solid var(--bhw-actions-border, #f3f4f6);
            margin-top: auto;
        }
        .bhw-actions-left {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        .bhw-action {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--bhw-action-color, #6b7280);
            font-size: 14px;
            font-weight: 500;
        }
        .bhw-share-btn {
            color: var(--bhw-action-color, #6b7280);
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .bhw-share-btn:hover {
            color: var(--bhw-accent, #FF0000);
        }
        
        /* Загрузка */
        .bhw-loading {
            text-align: center;
            padding: 60px 20px;
            color: var(--bhw-loading-color, #6b7280);
        }
        .bhw-spinner {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e7eb;
            border-top: 2px solid #FF0000;
            border-radius: 50%;
            animation: bhw-spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes bhw-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .bhw-container { padding: 0 12px; }
            .bhw-widget { padding: var(--bhw-padding-mobile, 24px); }
            .bhw-branding-text h2 { font-size: var(--bhw-title-size-mobile, 1.4em); }
            .bhw-header { 
                flex-direction: column; 
                gap: 16px; 
                align-items: flex-start; 
            }
            .bhw-branding { min-width: auto; }
            .bhw-stats { justify-content: flex-start; }
            .bhw-grid { grid-template-columns: 1fr; }
        }
    `;

    // Объект для хранения экземпляров YouTube виджетов
    window.BusinessHoursWidgets = window.BusinessHoursWidgets || {};
    window.BusinessHoursWidgets.youtube = window.BusinessHoursWidgets.youtube || {};

    try {
        const currentScript = document.currentScript || (function() {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();

        let clientId = currentScript.dataset.id;
        if (!clientId) {
            console.error('[YouTubeWidget] data-id обязателен');
            return;
        }

        clientId = normalizeId(clientId);

        if (currentScript.dataset.bhwMounted === '1') return;
        currentScript.dataset.bhwMounted = '1';

        console.log(`[YouTubeWidget] 🚀 Инициализация YouTube виджета "${clientId}"`);

        if (!document.querySelector('#youtube-widget-styles')) {
            const style = document.createElement('style');
            style.id = 'youtube-widget-styles';
            style.textContent = inlineCSS;
            document.head.appendChild(style);
        }

        const baseUrl = getBasePath(currentScript.src);
        const uniqueClass = `bhw-youtube-${clientId}-${Date.now()}`;
        const container = createContainer(currentScript, clientId, uniqueClass);
        
        showLoading(container);

        loadConfig(clientId, baseUrl)
            .then(async fetchedConfig => {
                const finalConfig = mergeDeep(getDefaultConfig(), fetchedConfig);
                applyCustomStyles(uniqueClass, finalConfig.style || {});
                
                // Автоматически обогащаем данные видео, если есть videoUrls
                if (finalConfig.videoUrls && finalConfig.videoUrls.length > 0) {
                    finalConfig.customPosts = await enrichVideoData(finalConfig.videoUrls, finalConfig);
                }
                
                createWidget(container, finalConfig);
                window.BusinessHoursWidgets.youtube[clientId] = { container, config: finalConfig };
                console.log(`[YouTubeWidget] ✅ YouTube виджет "${clientId}" успешно создан`);
            })
            .catch(error => {
                console.warn(`[YouTubeWidget] ⚠️ Ошибка загрузки "${clientId}":`, error.message);
                const defaultConfig = getDefaultConfig();
                applyCustomStyles(uniqueClass, defaultConfig.style);
                createWidget(container, defaultConfig);
                window.BusinessHoursWidgets.youtube[clientId] = { container, config: defaultConfig };
            });

    } catch (error) {
        console.error('[YouTubeWidget] 💥 Критическая ошибка:', error);
    }

    /**
     * Нормализует ID клиента, удаляя расширения файлов
     */
    function normalizeId(id) {
        return (id || 'demo').replace(/\.(json|js)$/i, '');
    }

    /**
     * Извлекает базовый путь скрипта для загрузки конфигурационных файлов
     */
    function getBasePath(src) {
        if (!src) return './';
        try {
            const url = new URL(src, location.href);
            return url.origin + url.pathname.replace(/\/[^\/]*$/, '/');
        } catch (error) {
            console.warn('[YouTubeWidget] Ошибка определения basePath:', error);
            return './';
        }
    }

    /**
     * Создает и вставляет контейнер для виджета в DOM
     */
    function createContainer(scriptElement, clientId, uniqueClass) {
        const container = document.createElement('div');
        container.id = `youtube-widget-${clientId}`;
        container.className = `bhw-container ${uniqueClass}`;
        scriptElement.parentNode.insertBefore(container, scriptElement.nextSibling);
        return container;
    }

    /**
     * Отображает индикатор загрузки
     */
    function showLoading(container) {
        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-loading">
                    <div class="bhw-spinner"></div>
                    <div>Loading YouTube videos...</div>
                </div>
            </div>
        `;
    }

    /**
     * Возвращает конфигурацию по умолчанию для YouTube виджета
     */
    function getDefaultConfig() {
        return {
            widgetTitle: "YouTube Channel Feed",
            widgetDescription: "Latest videos from our YouTube channel",
            channelStats: {
                subscribers: "—",
                likes: "—", 
                videos: "—"
            },
            maxPosts: 6,
            showChannelStats: true,
            showTimestamp: true,
            showMedia: true,
            autoFetchMeta: true,
            videoUrls: [], // Массив YouTube URL для автоматического обогащения
            customPosts: [], // Массив готовых данных видео
            style: {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                colors: {
                    background: "#ffffff",
                    text: "#1a1a1a",
                    title: "#1a202c",
                    description: "#4a5568",
                    author: "#111827",
                    time: "#6b7280",
                    content: "#374151",
                    action: "#6b7280",
                    cardBg: "#ffffff",
                    cardBorder: "#e5e7eb",
                    borderHover: "#d1d5db",
                    avatarBorder: "#f3f4f6",
                    actionsBorder: "#f3f4f6",
                    logoBg: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                    accent: "#FF0000",
                    chipBg: "#f1f5f9",
                    chipBorder: "#e2e8f0"
                },
                borderRadius: { widget: 24, blocks: 16 },
                sizes: { 
                    fontSize: 1.0, 
                    padding: 32, 
                    blockPadding: 20, 
                    gap: 20,
                    cardWidth: 340,
                    cardMinHeight: 320
                },
                shadow: { 
                    widget: "0 8px 32px rgba(0,0,0,0.08)",
                    card: "0 4px 12px rgba(0,0,0,0.05)",
                    cardHover: "0 12px 24px rgba(255,0,0,0.15)"
                }
            }
        };
    }

    /**
     * Выполняет глубокое слияние объектов конфигурации
     */
    function mergeDeep(base, override) {
        const result = { ...base, ...override };
        
        for (const key of ['style', 'channelStats']) {
            if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
                result[key] = { ...(base[key] || {}), ...(override[key] || {}) };
            }
        }

        if (result.style) {
            for (const subKey of ['colors', 'borderRadius', 'sizes', 'shadow']) {
                if (base.style[subKey] && typeof base.style[subKey] === 'object' && !Array.isArray(base.style[subKey])) {
                    result.style[subKey] = { ...(base.style[subKey] || {}), ...(override.style?.[subKey] || {}) };
                }
            }
        }
        
        return result;
    }

    /**
     * Загружает конфигурацию виджета из локального скрипта или сервера
     */
    async function loadConfig(clientId, baseUrl) {
        // Для админ-панели - загружаем из localStorage
        if (clientId === 'admin-preview') {
            try {
                const storedConfig = localStorage.getItem('admin-preview-config');
                if (storedConfig) {
                    const config = JSON.parse(storedConfig);
                    console.log(`[YouTubeWidget] 📄 Admin preview конфиг загружен из localStorage`);
                    return config;
                }
            } catch (err) {
                console.warn('[YouTubeWidget] Ошибка загрузки admin config:', err);
            }
        }

        if (clientId === 'local') {
            const localScript = document.querySelector('#youtube-local-config');
            if (!localScript) {
                throw new Error('Локальный YouTube конфиг не найден (#youtube-local-config)');
            }
            try {
                const config = JSON.parse(localScript.textContent);
                console.log(`[YouTubeWidget] 📄 Локальный конфиг загружен`);
                return config;
            } catch (err) {
                throw new Error('Ошибка парсинга JSON: ' + err.message);
            }
        }

        // Сначала пытаемся загрузить через API (из KV)
        try {
            const apiUrl = `${baseUrl}api/get-config?id=${encodeURIComponent(clientId)}`;
            console.log(`[YouTubeWidget] 🌐 Загружаем конфиг через API: ${apiUrl}`);
            
            const apiResponse = await fetch(apiUrl, { 
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });
            
            if (apiResponse.ok) {
                const config = await apiResponse.json();
                console.log(`[YouTubeWidget] ✅ Конфиг загружен через API`);
                return config;
            }
        } catch (apiError) {
            console.warn('[YouTubeWidget] API недоступен, пробуем загрузить из файла');
        }

        // Если API не сработал, загружаем из статического файла
        const configUrl = `${baseUrl}configs/${encodeURIComponent(clientId)}.json?v=${Date.now()}`;
        console.log(`[YouTubeWidget] 🌐 Загружаем конфиг из файла: ${configUrl}`);
        
        const response = await fetch(configUrl, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log(`[YouTubeWidget] ✅ Серверный конфиг загружен из файла`);
        return config;
    }

    /**
     * Обогащает данные видео, автоматически получая метаданные из YouTube
     */
    async function enrichVideoData(videoUrls, config) {
        const enrichedPosts = await Promise.all(videoUrls.slice(0, config.maxPosts || 6).map(async (url) => {
            const videoId = parseYouTubeId(url);
            const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            
            let title = 'YouTube Video';
            let author = 'YouTube Channel';
            let description = '';
            
            // Пытаемся получить метаданные через oEmbed API
            if (config.autoFetchMeta !== false) {
                try {
                    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
                    const response = await fetch(oembedUrl);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.title) title = data.title;
                        if (data.author_name) author = data.author_name;
                    }
                } catch (error) {
                    console.warn(`[YouTubeWidget] Не удалось получить метаданные для ${videoId}:`, error);
                }
            }

            return {
                id: videoId,
                platform: 'youtube',
                title: title,
                description: description,
                author: author,
                avatar: `https://i.ytimg.com/img/no_thumbnail.jpg`, // Заглушка для аватара
                thumbnailUrl: thumbnail,
                videoUrl: watchUrl,
                timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                views: randomRange(1000, 1000000),
                likes: randomRange(50, 50000),
                comments: randomRange(10, 5000)
            };
        }));

        return enrichedPosts;
    }

    /**
     * Парсит YouTube ID из различных форматов URL
     */
    function parseYouTubeId(url) {
        const patterns = [
            /[?&]v=([^&#]+)/, // youtube.com/watch?v=ID
            /youtu\.be\/([^?&#/]+)/, // youtu.be/ID
            /\/embed\/([^?&#/]+)/, // youtube.com/embed/ID
            /\/v\/([^?&#/]+)/ // youtube.com/v/ID
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        
        // Если не удалось распарсить, возвращаем исходную строку
        return url;
    }

    /**
     * Применяет кастомные стили через CSS переменные
     */
    function applyCustomStyles(uniqueClass, style) {
        const s = style || {};
        const colors = s.colors || {};
        const sizes = s.sizes || {};
        const borderRadius = s.borderRadius || {};
        const shadow = s.shadow || {};
        const fs = sizes.fontSize || 1;

        const styleElement = document.createElement('style');
        styleElement.id = `youtube-style-${uniqueClass}`;
        styleElement.textContent = `
            .${uniqueClass} {
                --bhw-font: ${s.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
                --bhw-max-width: ${Math.round(1200 * fs)}px;
                --bhw-bg: ${colors.background || "#ffffff"};
                --bhw-widget-radius: ${borderRadius.widget || 24}px;
                --bhw-padding: ${sizes.padding || 32}px;
                --bhw-padding-mobile: ${Math.round((sizes.padding || 32) * 0.75)}px;
                --bhw-text-color: ${colors.text || "#1a1a1a"};
                --bhw-main-title-color: ${colors.title || "#1a202c"};
                --bhw-main-description-color: ${colors.description || "#4a5568"};
                --bhw-author-color: ${colors.author || "#111827"};
                --bhw-time-color: ${colors.time || "#6b7280"};
                --bhw-content-color: ${colors.content || "#374151"};
                --bhw-action-color: ${colors.action || "#6b7280"};
                --bhw-shadow: ${shadow.widget || "0 8px 32px rgba(0,0,0,0.08)"};
                --bhw-main-title-size: ${1.75 * fs}em;
                --bhw-title-size-mobile: ${1.4 * fs}em;
                --bhw-main-description-size: ${0.95 * fs}em;
                --bhw-header-margin: ${32 * fs}px;
                --bhw-gap: ${sizes.gap || 20}px;
                --bhw-card-width: ${sizes.cardWidth || 340}px;
                --bhw-card-min-height: ${sizes.cardMinHeight || 320}px;
                --bhw-card-bg: ${colors.cardBg || "#ffffff"};
                --bhw-card-border: 1px solid ${colors.cardBorder || "#e5e7eb"};
                --bhw-block-radius: ${borderRadius.blocks || 16}px;
                --bhw-block-padding: ${sizes.blockPadding || 20}px;
                --bhw-card-shadow: ${shadow.card || "0 4px 12px rgba(0,0,0,0.05)"};
                --bhw-card-hover-shadow: ${shadow.cardHover || "0 12px 24px rgba(255,0,0,0.15)"};
                --bhw-avatar-border: ${colors.avatarBorder || "#f3f4f6"};
                --bhw-actions-border: ${colors.actionsBorder || "#f3f4f6"};
                --bhw-logo-bg: ${colors.logoBg || "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"};
                --bhw-accent: ${colors.accent || "#FF0000"};
                --bhw-chip-bg: ${colors.chipBg || "#f1f5f9"};
                --bhw-chip-border: ${colors.chipBorder || "#e2e8f0"};
                --bhw-loading-color: #6b7280;
            }
        `;
        document.head.appendChild(styleElement);
    }

    /**
     * Создает HTML-разметку виджета
     */
    function createWidget(container, config) {
        const feeds = generateYouTubeFeeds(config);
        const cards = feeds.slice(0, config.maxPosts || 6).map(feed => createCard(feed, config)).join('');

        // Статистика канала
        const statsHtml = config.showChannelStats !== false ? `
            <div class="bhw-stats">
                <span class="bhw-stat-chip">${escapeHtml(config.channelStats?.subscribers || '—')} Followers</span>
                <span class="bhw-stat-chip">${escapeHtml(config.channelStats?.likes || '—')} Likes</span>
                <span class="bhw-stat-chip">${escapeHtml(config.channelStats?.videos || String(feeds.length))} Videos</span>
                ${config.channelUrl ? `<a class="bhw-follow-btn" href="${escapeAttr(config.channelUrl)}" target="_blank" rel="noopener">Subscribe</a>` : ''}
            </div>
        ` : '';

        container.innerHTML = `
            <div class="bhw-widget">
                <div class="bhw-header">
                    <div class="bhw-branding">
                        <div class="bhw-logo-icon">📺</div>
                        <div class="bhw-branding-text">
                            <h2>${escapeHtml(config.widgetTitle || "YouTube Channel Feed")}</h2>
                            <p>${escapeHtml(config.widgetDescription || "Latest videos from our YouTube channel")}</p>
                        </div>
                    </div>
                    ${statsHtml}
                </div>
                <div class="bhw-grid">
                    ${cards}
                </div>
            </div>
        `;
    }

    /**
     * Создает HTML-разметку для одной карточки видео
     */
    function createCard(feed, config) {
        const cardClickableProps = feed.videoUrl ? `onclick="window.open('${escapeAttr(feed.videoUrl)}', '_blank')"` : '';

        return `
            <div class="bhw-card" ${cardClickableProps}>
                <div class="bhw-card-content">
                    ${config.showTimestamp !== false ? `
                        <div class="bhw-card-header">
                            <img class="bhw-avatar" src="${escapeAttr(feed.avatar)}" alt="${escapeAttr(feed.author)}" loading="lazy"/>
                            <div class="bhw-user-info">
                                <div class="bhw-author">${escapeHtml(feed.author)}</div>
                                <div class="bhw-time">${timeAgo(feed.timestamp)}</div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="bhw-video-title">${escapeHtml(feed.title)}</div>
                    ${feed.description ? `<div class="bhw-video-description">${escapeHtml(feed.description)}</div>` : ''}
                    ${config.showMedia !== false && feed.thumbnailUrl ? `
                        <div class="bhw-media">
                            <img src="${escapeAttr(feed.thumbnailUrl)}" alt="YouTube Video Thumbnail" loading="lazy"/>
                            <div class="bhw-play-button">▶️</div>
                        </div>
                    ` : ''}
                    <div class="bhw-actions">
                        <div class="bhw-actions-left">
                            ${feed.views ? `<div class="bhw-action">👁️ ${formatNumber(feed.views)}</div>` : ''}
                            ${feed.likes ? `<div class="bhw-action">👍 ${formatNumber(feed.likes)}</div>` : ''}
                            ${feed.comments ? `<div class="bhw-action">💬 ${formatNumber(feed.comments)}</div>` : ''}
                        </div>
                        ${feed.videoUrl ? `<a class="bhw-share-btn" href="${escapeAttr(feed.videoUrl)}" target="_blank" rel="noopener">Watch ↗</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Генерирует YouTube посты, используя customPosts из конфига или моковые данные
     */
    function generateYouTubeFeeds(config) {
        let feeds = [];
        
        if (config.customPosts && Array.isArray(config.customPosts) && config.customPosts.length > 0) {
            feeds = config.customPosts.map(post => ({
                id: post.id || `youtube_custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                platform: 'youtube',
                title: post.title,
                description: post.description,
                author: post.author || config.channelName || 'YouTube Channel',
                avatar: post.avatar || `https://i.ytimg.com/img/no_thumbnail.jpg`,
                thumbnailUrl: post.thumbnailUrl,
                videoUrl: post.videoUrl,
                timestamp: post.timestamp || new Date().toISOString(),
                views: post.views,
                likes: post.likes,
                comments: post.comments
            }));
            
            const mockCount = Math.max(0, (config.maxPosts || 6) - feeds.length);
            for (let i = 0; i < mockCount; i++) {
                feeds.push(createMockYouTubeFeed());
            }
        } else {
            const maxPosts = config.maxPosts || 6;
            for (let i = 0; i < maxPosts; i++) {
                feeds.push(createMockYouTubeFeed());
            }
        }
        
        return feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Создает один моковый YouTube пост для демонстрации
     */
    function createMockYouTubeFeed() {
        const now = Date.now();
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const timestamp = new Date(now - rand(10, 60 * 60 * 24 * 30) * 60 * 1000).toISOString();

        const youtubePosts = [
            {
                title: 'What 1000 HOURS OF THE LAST OF US 2 LOOKS LIKE',
                description: '"WHAT 1000 HOURS OF THE LAST OF US 2 LOOKS LIKE" IS JUST EXCELLENT. Don\'t forget to subscribe! #tlou2 #ps5 #fortheloveofgaming',
                author: '@FOR THE LOVE OF GAMING',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                thumbnailUrl: 'https://images.unsplash.com/photo-1627856428384-5f80b95c378e?w=600&h=400&fit=crop',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                views: rand(100000, 500000),
                likes: rand(5000, 25000),
                comments: rand(200, 1000)
            },
            {
                title: '5 EXCITING MOST-ANTICIPATED GAMES COMING IN SEPTEMBER 2023!',
                description: '5 EXCITING MOST-ANTICIPATED GAMES COMING IN SEPTEMBER! 1. WITCHFIRE 2. THE CREW MOTORFEST 3. CYBERPUNK 2077: PHANTOM LIBERTY 4. PAYDAY 3 5. MORTAL KOMBAT 1',
                author: '@FOR THE LOVE OF GAMING',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                thumbnailUrl: 'https://images.unsplash.com/photo-1542759569-8084f72be56a?w=600&h=400&fit=crop',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                views: rand(50000, 300000),
                likes: rand(2000, 15000),
                comments: rand(100, 800)
            },
            {
                title: 'TOP 5 NEXT-GEN UNREAL ENGINE 5 GAMES 2023 & 2024!',
                description: 'TOP 5 NEXT-GEN UPCOMING UNREAL ENGINE GAMES 2023 & 2024 #gametrailers #unrealengine',
                author: '@FOR THE LOVE OF GAMING',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                thumbnailUrl: 'https://images.unsplash.com/photo-1616409549302-3c8b4b7c8f9b?w=600&h=400&fit=crop',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                views: rand(200000, 800000),
                likes: rand(10000, 40000),
                comments: rand(500, 2000)
            }
        ];

        const post = youtubePosts[rand(0, youtubePosts.length - 1)];
        
        return {
            id: `youtube_${rand(1, 9999)}`,
            platform: 'youtube',
            timestamp: timestamp,
            ...post
        };
    }

    /**
     * Генерирует случайное число в заданном диапазоне
     */
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Преобразует временную метку в человекочитаемый формат
     */
    function timeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (years > 0) return `${years}y ago`;
        if (months > 0) return `${months}mo ago`;
        if (weeks > 0) return `${weeks}w ago`;
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    /**
     * Форматирует числа для компактного отображения (1.2K, 1.5M)
     */
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * Экранирует HTML-сущности для безопасного вывода
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * Экранирует HTML-атрибуты для безопасного использования в атрибутах
     */
    function escapeAttr(text) {
        return String(text || '').replace(/"/g, '&quot;');
    }
})();
