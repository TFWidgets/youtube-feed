/**
 * Cloudflare Pages Function для сохранения конфигурации виджета
 * POST /api/save-config
 * 
 * Body: {
 *   configId: string,
 *   config: object
 * }
 */

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // Проверяем Content-Type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return new Response(JSON.stringify({ 
                error: 'Content-Type must be application/json' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Парсим тело запроса
        const body = await request.json();
        const { configId, config } = body;

        // Валидация
        if (!configId || typeof configId !== 'string') {
            return new Response(JSON.stringify({ 
                error: 'configId is required and must be a string' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!config || typeof config !== 'object') {
            return new Response(JSON.stringify({ 
                error: 'config is required and must be an object' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Санитизация configId (только буквы, цифры, дефисы, подчеркивания)
        const sanitizedId = configId.replace(/[^a-zA-Z0-9_-]/g, '');
        if (sanitizedId !== configId) {
            return new Response(JSON.stringify({ 
                error: 'configId contains invalid characters. Use only letters, numbers, hyphens, and underscores.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Сохраняем в KV (если настроен) или возвращаем для ручного сохранения
        if (env.YOUTUBE_CONFIGS) {
            // Сохранение в Cloudflare KV
            const configJson = JSON.stringify(config, null, 2);
            await env.YOUTUBE_CONFIGS.put(sanitizedId, configJson);
            
            return new Response(JSON.stringify({ 
                success: true,
                configId: sanitizedId,
                message: 'Configuration saved successfully',
                embedCode: `<script src="https://youtube-feed.pages.dev/embed.js" data-id="${sanitizedId}"></script>`
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        } else {
            // KV не настроен - возвращаем конфиг для ручного сохранения
            return new Response(JSON.stringify({ 
                success: true,
                configId: sanitizedId,
                config: config,
                message: 'KV storage not configured. Save this config manually to configs/' + sanitizedId + '.json',
                embedCode: `<script src="https://youtube-feed.pages.dev/embed.js" data-id="${sanitizedId}"></script>`
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

    } catch (error) {
        console.error('Error saving config:', error);
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
}
