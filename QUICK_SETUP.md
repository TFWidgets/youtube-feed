# ⚡ БЫСТРАЯ НАСТРОЙКА (2 минуты)

## 🎯 Что нужно сделать

Чтобы кнопка "💾 Сохранить в GitHub" **реально сохраняла** файлы в репозиторий.

---

## 📋 Шаг 1: Создать токен GitHub

### 1.1 Откройте:
```
https://github.com/settings/tokens
```

### 1.2 Нажмите:
```
"Generate new token" → "Generate new token (classic)"
```

### 1.3 Заполните:
```
Note: youtube-feed-auto-save
Expiration: No expiration
Select scopes: ✅ repo (поставьте галочку!)
```

### 1.4 Нажмите внизу:
```
"Generate token"
```

### 1.5 ВАЖНО! Скопируйте токен:
```
Выглядит так: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
⚠️ Вы увидите его только один раз!
```

---

## 📋 Шаг 2: Добавить в Cloudflare

### 2.1 Откройте Cloudflare:
```
https://dash.cloudflare.com/
```

### 2.2 Перейдите:
```
Workers & Pages → youtube-feed → Settings → Environment variables
```

### 2.3 Нажмите:
```
"Add variables"
```

### 2.4 Добавьте ДВЕ переменные:

**Первая переменная:**
```
Variable name: GITHUB_TOKEN
Value: [вставьте ваш токен ghp_xxx...]
Environment: Production ✅
```

**Вторая переменная:**
```
Variable name: GITHUB_REPO  
Value: TFWidgets/youtube-feed
Environment: Production ✅
```

### 2.5 Нажмите:
```
"Save"
```

---

## 📋 Шаг 3: Redeploy

### 3.1 Перейдите на вкладку:
```
Deployments
```

### 3.2 Найдите последний деплой → нажмите "···" (три точки)

### 3.3 Нажмите:
```
"Retry deployment"
```

### 3.4 Подождите:
```
~2 минуты пока деплой завершится
```

---

## 📋 Шаг 4: Проверка

### 4.1 Откройте админ-панель:
```
https://youtube-feed.pages.dev/admin.html
```

### 4.2 Создайте тестовый конфиг:
```
Название: Test
Config ID: test-save-123
Добавьте 1 видео URL
```

### 4.3 Нажмите:
```
💾 Сохранить в GitHub
```

### 4.4 Проверьте GitHub:
```
https://github.com/TFWidgets/youtube-feed/tree/main/configs
```

### 4.5 Результат:
```
✅ Должен появиться файл: test-save-123.json
✅ Файл создан автоматически через API
✅ Cloudflare автоматически задеплоит изменения
```

---

## ✅ ГОТОВО!

Теперь при создании конфига в админ-панели:

```
Админ панель → Заполнить форму → "Сохранить в GitHub"
                                        ↓
                            GitHub API создает файл
                                        ↓
                          Cloudflare автоматически деплоит
                                        ↓
                          Конфиг доступен через embed код!
```

### Embed код:
```html
<script src="https://youtube-feed.pages.dev/embed.js" 
        data-id="ваш-config-id"></script>
```

---

## 🆘 Если что-то не работает

### Показывает "✅ Успешно!" но файла нет в GitHub?
```
→ Проверьте, что добавили обе переменные
→ Проверьте, что сделали Retry deployment
→ Подождите 2 минуты после деплоя
```

### Ошибка 401?
```
→ Токен неправильный
→ Создайте новый токен с галочкой ✅ repo
```

### Ошибка 404?
```
→ Проверьте GITHUB_REPO = TFWidgets/youtube-feed
→ Не должно быть просто "youtube-feed"
```

---

## 📚 Полная документация

- **Английский:** `CLOUDFLARE_GITHUB_SETUP.md`
- **Русский:** `ИНСТРУКЦИЯ_GITHUB.md`
- **Статус golovach:** `GOLOVACH_CONFIG_STATUS.md`

---

**Вся настройка занимает 2 минуты! 🚀**
