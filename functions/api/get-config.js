/**
 * Cloudflare Pages Function для получения конфигурации виджета
 * GET /api/get-config?id=configId
 */

export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const configId = url.searchParams.get('id');

        // Валидация
        if (!configId) {
            return new Response(JSON.stringify({ 
                error: 'configId parameter is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Санитизация configId
        const sanitizedId = configId.replace(/[^a-zA-Z0-9_-]/g, '');

        // Пытаемся загрузить из KV
        if (env.YOUTUBE_CONFIGS) {
            const configJson = await env.YOUTUBE_CONFIGS.get(sanitizedId);
            
            if (configJson) {
                return new Response(configJson, {
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=300' // Кешируем на 5 минут
                    }
                });
            }
        }

        // Если не найдено в KV, пытаемся загрузить из файла configs/
        try {
            const configUrl = `https://youtube-feed.pages.dev/configs/${sanitizedId}.json`;
            const configResponse = await fetch(configUrl);
            
            if (configResponse.ok) {
                const config = await configResponse.json();
                return new Response(JSON.stringify(config), {
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=300'
                    }
                });
            }
        } catch (fileError) {
            console.error('Error loading config from file:', fileError);
        }

        // Конфиг не найден
        return new Response(JSON.stringify({ 
            error: 'Configuration not found',
            configId: sanitizedId
        }), {
            status: 404,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error getting config:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
}
