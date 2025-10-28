# 🔧 Настройка автоматического сохранения в GitHub

## Проблема
При нажатии на кнопку "💾 Сохранить в GitHub" в админ-панели показывается "✅ Успешно сохранено!", но файл не создается в репозитории GitHub.

## Причина
Не настроены переменные окружения `GITHUB_TOKEN` и `GITHUB_REPO` в Cloudflare Pages.

## Решение: Пошаговая инструкция

### Шаг 1: Создать GitHub Personal Access Token

1. Откройте: **https://github.com/settings/tokens**
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. Заполните форму:
   - **Note**: `youtube-feed-cloudflare` (название для себя)
   - **Expiration**: `No expiration` (или выберите срок)
   - **Scopes**: Обязательно отметьте ✅ **`repo`** (Full control of private repositories)
4. Нажмите **"Generate token"**
5. **ВАЖНО**: Скопируйте токен сразу! Вы не сможете увидеть его снова
   - Формат токена: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Шаг 2: Добавить переменные в Cloudflare Pages

1. Откройте: **https://dash.cloudflare.com/**
2. Перейдите: **Workers & Pages** → **youtube-feed**
3. Откройте вкладку: **Settings**
4. Найдите секцию: **Environment variables**
5. Нажмите **"Add variables"**

#### Добавьте две переменные:

**Переменная 1:**
- **Variable name**: `GITHUB_TOKEN`
- **Value**: Вставьте ваш токен (например: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Environment**: `Production` ✅

**Переменная 2:**
- **Variable name**: `GITHUB_REPO`
- **Value**: `TFWidgets/youtube-feed`
- **Environment**: `Production` ✅

6. Нажмите **"Save"**

### Шаг 3: Redeploy проекта

После добавления переменных нужно передеплоить проект:

1. В Cloudflare Pages перейдите на вкладку **"Deployments"**
2. Найдите последний успешный деплой
3. Нажмите **"···"** (три точки) → **"Retry deployment"**
4. Дождитесь завершения деплоя (обычно 1-2 минуты)

### Шаг 4: Проверка работы

1. Откройте админ-панель: **https://youtube-feed.pages.dev/admin.html**
2. Создайте тестовый конфиг с ID: `test-auto-save`
3. Добавьте 1-2 видео URL
4. Нажмите **"💾 Сохранить в GitHub"**
5. Если всё настроено правильно, вы увидите:
   ```
   ✅ Успешно сохранено!
   Config ID: test-auto-save
   ```
6. Проверьте GitHub репозиторий:
   - Откройте: https://github.com/TFWidgets/youtube-feed/tree/main/configs
   - Вы должны увидеть новый файл: `test-auto-save.json`
   - Файл должен быть создан автоматически через GitHub API

## Как это работает?

### Без токена (текущее состояние):
```javascript
// В функции /api/save-to-github.js (строка 60-93)
if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    console.warn('GitHub integration not configured.');
    // Возвращает success, но НЕ сохраняет в GitHub
    return { success: true, message: '...' }; // ⚠️ Ложный успех!
}
```

### С токеном (после настройки):
```javascript
// Строка 96-169
// 1. Проверяет, существует ли файл в GitHub
const getResponse = await fetch(getFileUrl, {
    headers: { 'Authorization': `Bearer ${env.GITHUB_TOKEN}` }
});

// 2. Создает или обновляет файл через GitHub API
const githubResponse = await fetch(createUpdateUrl, {
    method: 'PUT',
    body: JSON.stringify({
        message: 'Add config: test-auto-save',
        content: base64EncodedConfig
    })
});

// 3. Возвращает ссылку на созданный файл
return {
    success: true,
    githubUrl: 'https://github.com/TFWidgets/youtube-feed/blob/main/configs/test-auto-save.json'
};
```

## Безопасность токена

### ✅ Безопасно:
- Токен хранится в переменных окружения Cloudflare
- Не виден в коде
- Не передается на клиент
- Используется только в серверных функциях

### ⚠️ НЕ делайте:
- Не добавляйте токен в код
- Не коммитьте токен в репозиторий
- Не делитесь токеном публично

## Дополнительные возможности

После настройки GitHub токена админ-панель сможет:

1. **Автоматически создавать конфиги** - при нажатии "Сохранить в GitHub"
2. **Обновлять существующие конфиги** - если файл уже существует
3. **Показывать ссылку на GitHub** - прямую ссылку на созданный файл
4. **Автоматический деплой** - Cloudflare Pages автоматически задеплоит изменения

## Проверка деплоя

После сохранения конфига в GitHub:

1. **Автоматический деплой**: Cloudflare Pages автоматически запустит новый деплой
2. **Проверка статуса**: https://dash.cloudflare.com/ → Workers & Pages → youtube-feed → Deployments
3. **Готово через**: ~1-2 минуты
4. **Доступ к конфигу**: https://youtube-feed.pages.dev/configs/YOUR-CONFIG-ID.json

## Troubleshooting

### Ошибка: "GitHub API error: 401"
- **Причина**: Неправильный токен
- **Решение**: Пересоздайте токен с правильными правами (`repo` scope)

### Ошибка: "GitHub API error: 404"
- **Причина**: Неправильное имя репозитория
- **Решение**: Проверьте, что `GITHUB_REPO` = `TFWidgets/youtube-feed`

### Конфиг сохранился, но не виден на сайте
- **Причина**: Cloudflare Pages еще деплоится
- **Решение**: Подождите 1-2 минуты и обновите страницу

### Показывается "✅ Успешно сохранено!", но файла нет
- **Причина**: Токен не настроен или неправильный
- **Решение**: Проверьте переменные окружения в Cloudflare Pages

## Альтернатива: KV Storage (без GitHub)

Если не хотите настраивать GitHub токен, можно использовать Cloudflare KV:

1. Создайте KV namespace в Cloudflare
2. Добавьте binding в `wrangler.toml`: `YOUTUBE_CONFIGS`
3. Конфиги будут сохраняться в KV (без коммитов в GitHub)

**Минусы KV подхода**:
- Нет истории изменений
- Нет бэкапов в GitHub
- Нет автоматического version control

## Поддержка

Если возникли проблемы:

1. Проверьте логи в Cloudflare Pages Dashboard
2. Откройте DevTools в браузере (F12) → Console
3. Проверьте ответ API: `/api/save-to-github`

---

**После настройки всё будет работать автоматически!** 🚀
