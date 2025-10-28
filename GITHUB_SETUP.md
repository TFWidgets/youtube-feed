# 🔧 GitHub Integration Setup

Инструкция по настройке автоматического сохранения конфигов в GitHub через админ-панель.

## 📋 Что это дает?

После настройки, кнопка **"💾 Сохранить в GitHub"** в админ-панели будет:
1. Автоматически создавать/обновлять файлы в папке `configs/`
2. Коммитить изменения в GitHub
3. Cloudflare Pages автоматически задеплоит обновления
4. Конфиг сразу станет доступен по URL

## 🔑 Шаг 1: Создание GitHub Personal Access Token

1. Зайдите на GitHub: https://github.com/settings/tokens
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. Настройте токен:
   - **Note**: `Cloudflare Pages - YouTube Feed`
   - **Expiration**: `No expiration` (или выберите срок)
   - **Scopes**: Выберите только `repo` (полный доступ к репозиториям)
4. Нажмите **"Generate token"**
5. **ВАЖНО**: Скопируйте токен сразу! Он больше не покажется

Токен будет выглядеть так: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## ⚙️ Шаг 2: Настройка Cloudflare Pages

### Вариант 1: Через Cloudflare Dashboard (Рекомендуется)

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Выберите **Workers & Pages** → Ваш проект **youtube-feed**
3. Перейдите в **Settings** → **Environment variables**
4. Добавьте две переменные:

   **Первая переменная:**
   - Variable name: `GITHUB_TOKEN`
   - Value: Вставьте ваш токен (начинается с `ghp_`)
   - Environment: `Production` (и `Preview` если нужно)
   - ✅ Encrypt

   **Вторая переменная:**
   - Variable name: `GITHUB_REPO`
   - Value: `TFWidgets/youtube-feed` (формат: owner/repo)
   - Environment: `Production` (и `Preview` если нужно)
   - Encryption: Не обязательно

5. Нажмите **Save**
6. Сделайте редеплой: **Deployments** → последний deployment → **Retry deployment**

### Вариант 2: Через wrangler CLI

Если у вас установлен `wrangler`:

```bash
# В директории проекта
cd /path/to/youtube-feed

# Установка переменных
npx wrangler pages secret put GITHUB_TOKEN
# Вставьте токен когда попросит

npx wrangler pages secret put GITHUB_REPO
# Введите: TFWidgets/youtube-feed
```

## 🧪 Шаг 3: Проверка

1. Откройте админ-панель: https://youtube-feed.pages.dev/admin.html
2. Настройте виджет
3. Введите **Config ID** (например: `test-widget-1`)
4. Нажмите **"💾 Сохранить в GitHub"**
5. Если всё настроено правильно, вы увидите:
   ```
   ✅ Успешно сохранено!
   Config ID: test-widget-1
   Configuration saved to GitHub successfully
   Посмотреть на GitHub
   ```
6. Перейдите по ссылке "Посмотреть на GitHub" - файл должен быть в репозитории!

## ❌ Troubleshooting

### Ошибка: "GitHub integration not configured"
- **Причина**: Переменные окружения не настроены
- **Решение**: Проверьте что `GITHUB_TOKEN` и `GITHUB_REPO` добавлены в Cloudflare Pages Settings

### Ошибка: "GitHub API error: 401"
- **Причина**: Неверный токен
- **Решение**: 
  1. Проверьте что токен скопирован полностью
  2. Убедитесь что токен имеет scope `repo`
  3. Создайте новый токен если старый истек

### Ошибка: "GitHub API error: 403"
- **Причина**: Токен не имеет прав на репозиторий
- **Решение**: 
  1. Убедитесь что токен создан от пользователя с доступом к репозиторию
  2. Проверьте что scope `repo` включен

### Ошибка: "GitHub API error: 404"
- **Причина**: Неверное имя репозитория
- **Решение**: 
  1. Проверьте что `GITHUB_REPO` = `TFWidgets/youtube-feed`
  2. Формат должен быть `owner/repo` (без пробелов)

### Конфиг не появляется на сайте
- **Причина**: Cloudflare Pages не задеплоил изменения
- **Решение**: 
  1. Зайдите в Cloudflare Dashboard → Workers & Pages → youtube-feed
  2. Посмотрите последний deployment
  3. Подождите 1-2 минуты пока задеплоится
  4. Очистите кеш браузера (Ctrl+Shift+R)

## 🔄 Fallback без GitHub

Если вы не хотите настраивать GitHub токен:

1. Конфиги будут сохраняться в **Cloudflare KV** (если настроен)
2. Или вы получите JSON конфиг для ручного сохранения
3. Создайте файл `configs/your-id.json` вручную через GitHub веб-интерфейс
4. Cloudflare Pages автоматически задеплоит при push/merge

## 📝 Безопасность

- ✅ Токен хранится зашифрованным в Cloudflare
- ✅ Токен НЕ виден в коде или браузере
- ✅ Токен используется только на сервере (Cloudflare Functions)
- ✅ Используйте токен только для этого проекта
- ✅ Дайте токену минимальные необходимые права (только `repo`)
- ⚠️ НЕ публикуйте токен в коде или документации

## 🎯 Готово!

После настройки админ-панель будет автоматически сохранять конфиги в GitHub! 🚀

## 📖 Дополнительно

### Настройка Cloudflare KV (опционально)

Для быстрого доступа к конфигам можно также настроить KV:

1. Cloudflare Dashboard → Workers & Pages → KV
2. Create namespace: `YOUTUBE_CONFIGS`
3. В настройках Pages project добавьте KV binding:
   - Variable name: `YOUTUBE_CONFIGS`
   - KV namespace: выберите созданный namespace

С KV конфиги будут загружаться мгновенно, без запроса к статическим файлам.
