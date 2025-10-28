/**
 * Cloudflare Pages Function для сохранения конфигурации напрямую в GitHub
 * POST /api/save-to-github
 * 
 * Требует настройки переменных окружения:
 * - GITHUB_TOKEN - Personal Access Token с правами на repo
 * - GITHUB_REPO - Имя репозитория (например: TFWidgets/youtube-feed)
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

        // Санитизация configId
        const sanitizedId = configId.replace(/[^a-zA-Z0-9_-]/g, '');
        if (sanitizedId !== configId) {
            return new Response(JSON.stringify({ 
                error: 'configId contains invalid characters. Use only letters, numbers, hyphens, and underscores.' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Проверяем наличие GitHub токена
        if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
            console.warn('GitHub integration not configured. Falling back to KV storage.');
            
            // Fallback на KV или возврат конфига для ручного сохранения
            if (env.YOUTUBE_CONFIGS) {
                const configJson = JSON.stringify(config, null, 2);
                await env.YOUTUBE_CONFIGS.put(sanitizedId, configJson);
                
                return new Response(JSON.stringify({ 
                    success: true,
                    configId: sanitizedId,
                    message: 'Configuration saved to KV storage (GitHub not configured)',
                    embedCode: `<script src="https://youtube-feed.pages.dev/embed.js" data-id="${sanitizedId}"></script>`
                }), {
                    status: 200,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
            
            return new Response(JSON.stringify({ 
                success: false,
                error: 'GitHub and KV storage not configured',
                config: config,
                message: 'Please save this config manually to configs/' + sanitizedId + '.json'
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Сохранение в GitHub
        const [owner, repo] = env.GITHUB_REPO.split('/');
        const filePath = `configs/${sanitizedId}.json`;
        const configJson = JSON.stringify(config, null, 2);
        const content = btoa(unescape(encodeURIComponent(configJson))); // Base64 encode

        // Проверяем, существует ли файл
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        let sha = null;
        
        try {
            const getResponse = await fetch(getFileUrl, {
                headers: {
                    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Cloudflare-Pages'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha; // SHA нужен для обновления существующего файла
            }
        } catch (error) {
            console.log('File does not exist yet, will create new');
        }

        // Создаем или обновляем файл
        const createUpdateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        const commitMessage = sha 
            ? `Update config: ${sanitizedId}`
            : `Add config: ${sanitizedId}`;

        const githubResponse = await fetch(createUpdateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Cloudflare-Pages'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: content,
                ...(sha && { sha }) // Включаем SHA только если файл существует
            })
        });

        if (!githubResponse.ok) {
            const errorData = await githubResponse.text();
            console.error('GitHub API error:', errorData);
            throw new Error(`GitHub API error: ${githubResponse.status}`);
        }

        const result = await githubResponse.json();

        // Также сохраняем в KV для быстрого доступа
        if (env.YOUTUBE_CONFIGS) {
            await env.YOUTUBE_CONFIGS.put(sanitizedId, configJson);
        }

        return new Response(JSON.stringify({ 
            success: true,
            configId: sanitizedId,
            message: 'Configuration saved to GitHub successfully',
            githubUrl: result.content.html_url,
            embedCode: `<script src="https://youtube-feed.pages.dev/embed.js" data-id="${sanitizedId}"></script>`
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error saving to GitHub:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
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
