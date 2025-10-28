# 📋 Как настроить автосохранение в GitHub

## 🎯 Цель
Чтобы при нажатии кнопки "💾 Сохранить в GitHub" в админ-панели конфиг автоматически создавался в репозитории GitHub.

---

## 🚀 Быстрая настройка (5 минут)

### ⚡ Шаг 1: Создать GitHub токен

1. Откройте: https://github.com/settings/tokens
2. Нажмите: **"Generate new token (classic)"**
3. Настройки:
   ```
   Note: youtube-feed-cloudflare
   Expiration: No expiration
   ✅ repo (Full control)
   ```
4. Нажмите: **"Generate token"**
5. **Скопируйте токен** (выглядит как `ghp_xxx...`)

---

### ⚡ Шаг 2: Добавить токен в Cloudflare

1. Откройте: https://dash.cloudflare.com/
2. Перейдите: **Workers & Pages** → **youtube-feed** → **Settings**
3. Найдите: **Environment variables**
4. Добавьте **две переменные**:

```
Переменная 1:
┌─────────────────────────────────────┐
│ Variable name: GITHUB_TOKEN         │
│ Value: ghp_ваш_токен_здесь          │
│ Environment: ✅ Production          │
└─────────────────────────────────────┘

Переменная 2:
┌─────────────────────────────────────┐
│ Variable name: GITHUB_REPO          │
│ Value: TFWidgets/youtube-feed       │
│ Environment: ✅ Production          │
└─────────────────────────────────────┘
```

5. Нажмите: **"Save"**

---

### ⚡ Шаг 3: Redeploy проекта

1. Вкладка: **Deployments**
2. Последний деплой → **"···"** → **"Retry deployment"**
3. Ждите ~2 минуты

---

### ⚡ Шаг 4: Тест

1. Откройте: https://youtube-feed.pages.dev/admin.html
2. Создайте конфиг с ID: `test123`
3. Добавьте видео URL
4. Нажмите: **"💾 Сохранить в GitHub"**
5. Проверьте GitHub: https://github.com/TFWidgets/youtube-feed/tree/main/configs
6. **Должен появиться файл** `test123.json` ✅

---

## 📊 Как это работает

### До настройки (сейчас):
```
Админ панель → Кнопка "Сохранить"
              ↓
         API endpoint
              ↓
    ❌ GitHub токена нет
              ↓
    Показывает "✅ Успешно!"
              ↓
    НО файл НЕ создается ❌
```

### После настройки:
```
Админ панель → Кнопка "Сохранить"
              ↓
         API endpoint
              ↓
    ✅ GitHub токен есть
              ↓
    GitHub API: создать файл
              ↓
    Файл создан в configs/ ✅
              ↓
    Cloudflare автодеплой ✅
              ↓
    Виджет доступен через embed код ✅
```

---

## 💡 Пример использования

### Создание конфига через админ-панель:

1. **Заполните форму:**
   ```
   Название виджета: Golovach
   Описание: Это описание виджета
   Config ID: golovach
   ```

2. **Добавьте видео:**
   ```
   https://www.youtube.com/watch?v=IIQzZeP48RE
   https://www.youtube.com/watch?v=xJ1x7HFzvN0
   https://www.youtube.com/watch?v=J5sRLTlPtzA
   https://www.youtube.com/watch?v=BHACKCNDMW8
   ```

3. **Нажмите:** "💾 Сохранить в GitHub"

4. **Результат:**
   ```
   ✅ Файл создан: github.com/TFWidgets/youtube-feed/blob/main/configs/golovach.json
   🚀 Cloudflare деплоит изменения (1-2 минуты)
   📦 Embed код готов к использованию
   ```

5. **Используйте на сайте:**
   ```html
   <script src="https://youtube-feed.pages.dev/embed.js" 
           data-id="golovach"></script>
   ```

---

## 🔐 Безопасность

### ✅ Правильно:
- Токен хранится в Cloudflare (серверная переменная)
- Не виден в коде
- Не передается клиенту
- Используется только API на сервере

### ❌ Неправильно:
- НЕ добавляйте токен в код
- НЕ коммитьте токен в GitHub
- НЕ делитесь токеном

---

## 🛠️ Troubleshooting

### Проблема: "✅ Успешно сохранено!" но файла нет в GitHub

**Причина:** Токен не настроен

**Решение:**
1. Проверьте Cloudflare: Settings → Environment variables
2. Должны быть переменные: `GITHUB_TOKEN` и `GITHUB_REPO`
3. После добавления: Retry deployment

---

### Проблема: Ошибка 401 при сохранении

**Причина:** Неправильный токен

**Решение:**
1. Пересоздайте токен на GitHub
2. Убедитесь, что отмечено: ✅ `repo` scope
3. Обновите переменную `GITHUB_TOKEN` в Cloudflare
4. Redeploy

---

### Проблема: Ошибка 404 при сохранении

**Причина:** Неправильное имя репозитория

**Решение:**
1. Проверьте переменную `GITHUB_REPO`
2. Должно быть: `TFWidgets/youtube-feed` (с владельцем)
3. Не должно быть: `youtube-feed` (без владельца)

---

### Проблема: Конфиг сохранился, но не виден на сайте

**Причина:** Cloudflare еще деплоится

**Решение:**
1. Откройте: https://dash.cloudflare.com/ → Deployments
2. Дождитесь статуса: ✅ Success
3. Обновите страницу

---

## 📝 API Endpoint

После настройки токена API `/api/save-to-github` работает так:

### Request:
```javascript
POST /api/save-to-github
Content-Type: application/json

{
  "configId": "icon",
  "config": {
    "widgetTitle": "...",
    "videoUrls": ["..."],
    // ... остальные поля
  }
}
```

### Response (успех):
```javascript
{
  "success": true,
  "configId": "icon",
  "message": "Configuration saved to GitHub successfully",
  "githubUrl": "https://github.com/TFWidgets/youtube-feed/blob/main/configs/icon.json",
  "embedCode": "<script src=\"https://youtube-feed.pages.dev/embed.js\" data-id=\"icon\"></script>"
}
```

### Response (ошибка без токена):
```javascript
{
  "success": false,
  "error": "GitHub and KV storage not configured",
  "message": "Please save this config manually to configs/icon.json"
}
```

---

## 🎉 После настройки

### Автоматически работает:

1. ✅ Создание новых конфигов
2. ✅ Обновление существующих конфигов
3. ✅ Автодеплой на Cloudflare Pages
4. ✅ Version control в GitHub (история изменений)
5. ✅ Backup конфигов в репозитории

### Workflow:

```
Админ панель
    ↓
Создать конфиг
    ↓
Нажать "Сохранить"
    ↓
GitHub: файл создан
    ↓
Cloudflare: автодеплой
    ↓
Виджет работает!
```

---

## 📞 Дополнительная информация

### Полезные ссылки:

- **Админ-панель:** https://youtube-feed.pages.dev/admin.html
- **GitHub репозиторий:** https://github.com/TFWidgets/youtube-feed
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **GitHub Tokens:** https://github.com/settings/tokens

### Файлы проекта:

- `/functions/api/save-to-github.js` - API endpoint для сохранения
- `/configs/*.json` - Конфигурационные файлы
- `/admin.html` - Админ-панель
- `/embed.js` - Widget скрипт

---

**Настройка занимает 5 минут, работает автоматически навсегда!** 🚀
