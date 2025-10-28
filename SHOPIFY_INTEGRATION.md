# 🛍️ Shopify Integration Guide

Инструкция по интеграции YouTube Feed Widget с вашим Shopify виджет-конструктором на https://tf-widgets.com/

## 📋 Обзор

Клиент настраивает виджет в вашем Shopify интерфейсе → Сохраняется конфигурация → Клиент получает embed-код → Вставляет на свой сайт

## 🔧 API Endpoints

### 1. Сохранение конфигурации

**POST** `https://youtube-feed.pages.dev/api/save-config`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "configId": "unique-customer-id",
  "config": {
    "widgetTitle": "FOR THE LOVE OF GAMING",
    "widgetDescription": "Latest gaming videos and trailers",
    "channelStats": {
      "subscribers": "718",
      "likes": "338.3K",
      "videos": "892"
    },
    "channelUrl": "https://www.youtube.com/@PlayStation",
    "maxPosts": 6,
    "showChannelStats": true,
    "showTimestamp": true,
    "showMedia": true,
    "autoFetchMeta": true,
    "videoUrls": [
      "https://www.youtube.com/watch?v=VIDEO_ID_1",
      "https://www.youtube.com/watch?v=VIDEO_ID_2"
    ],
    "style": {
      "fontFamily": "'Inter', sans-serif",
      "colors": {
        "background": "#ffffff",
        "accent": "#FF0000",
        "logoBg": "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"
      },
      "sizes": {
        "cardWidth": 340,
        "padding": 32
      }
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "configId": "unique-customer-id",
  "message": "Configuration saved successfully",
  "embedCode": "<script src=\"https://youtube-feed.pages.dev/embed.js\" data-id=\"unique-customer-id\"></script>"
}
```

### 2. Получение конфигурации

**GET** `https://youtube-feed.pages.dev/api/get-config?id=unique-customer-id`

**Response:**
```json
{
  "widgetTitle": "FOR THE LOVE OF GAMING",
  "widgetDescription": "Latest gaming videos and trailers",
  ...
}
```

## 💻 Пример интеграции из Shopify

### JavaScript для отправки конфигурации

```javascript
async function saveYouTubeWidgetConfig(customerId, widgetConfig) {
    try {
        const response = await fetch('https://youtube-feed.pages.dev/api/save-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                configId: customerId, // Уникальный ID клиента
                config: widgetConfig
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Показываем клиенту embed-код
            console.log('Embed Code:', result.embedCode);
            return result.embedCode;
        } else {
            console.error('Error:', result.error);
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to save config:', error);
        throw error;
    }
}

// Пример использования
const customerId = 'customer-123';
const widgetConfig = {
    widgetTitle: document.getElementById('channelName').value,
    widgetDescription: document.getElementById('channelDescription').value,
    channelStats: {
        subscribers: document.getElementById('followers').value,
        likes: document.getElementById('likes').value,
        videos: document.getElementById('posts').value
    },
    videoUrls: getSelectedVideoUrls(), // Функция для получения выбранных видео
    // ... остальные настройки
};

const embedCode = await saveYouTubeWidgetConfig(customerId, widgetConfig);
```

## 🎨 Маппинг полей из вашего Shopify интерфейса

Судя по скриншоту, вот как должны мапиться поля:

| Shopify поле | YouTube Widget конфиг |
|--------------|----------------------|
| Заголовок | `widgetTitle` |
| Иконка | `style.colors.logoBg` или emoji в `widgetTitle` |
| Максимум постов | `maxPosts` |
| Макет | Определяет `style.sizes.cardWidth` |
| Показывать аватары | Не используется (всегда true для YouTube) |
| Показывать время | `showTimestamp` |
| Интервал обновления | Не используется в текущей версии |
| **Платформы** | |
| YouTube (checked) | Активирует YouTube виджет |
| **Цвета** | |
| Фон виджета | `style.colors.background` |

### Дополнительные поля для YouTube:

```javascript
{
  // Основные настройки
  "widgetTitle": "Название канала",
  "widgetDescription": "Описание",
  
  // Статистика канала
  "channelStats": {
    "subscribers": "718",      // Followers
    "likes": "338.3K",         // Likes
    "videos": "892"            // Posts
  },
  
  // YouTube видео
  "videoUrls": [
    "https://www.youtube.com/watch?v=...",
    // ... больше видео
  ],
  
  // URL канала для кнопки Subscribe
  "channelUrl": "https://www.youtube.com/@ChannelName",
  
  // Настройки отображения
  "maxPosts": 6,
  "showChannelStats": true,
  "showTimestamp": true,
  "showMedia": true,
  "autoFetchMeta": true
}
```

## 🔐 Безопасность

1. **configId** должен быть уникальным для каждого клиента
2. Используйте UUID или хешируйте email клиента
3. Валидируйте YouTube URLs перед отправкой
4. Ограничьте количество видео (рекомендуется max 12)

## 📦 Генерация configId

```javascript
// Вариант 1: UUID
function generateConfigId() {
    return 'youtube-' + crypto.randomUUID();
}

// Вариант 2: На основе email клиента
function generateConfigId(customerEmail) {
    const hash = btoa(customerEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    return 'youtube-' + hash;
}

// Вариант 3: Shopify Customer ID
function generateConfigId(shopifyCustomerId) {
    return 'youtube-customer-' + shopifyCustomerId;
}
```

## 🎯 Workflow

1. **Клиент открывает виджет-конструктор** на tf-widgets.com
2. **Настраивает виджет** через ваш интерфейс
3. **Нажимает "Сохранить" или "Получить код"**
4. **Ваш Shopify app** вызывает `/api/save-config`
5. **API возвращает** готовый embed-код
6. **Клиент копирует** embed-код
7. **Вставляет** на свой сайт
8. **Виджет загружается** автоматически с сохраненной конфигурацией

## 🚀 Пример полного кода для Shopify

```html
<!-- В вашем Shopify app admin panel -->
<form id="youtubeWidgetForm">
    <!-- Ваши поля формы -->
    <input type="text" id="channelName" placeholder="Название канала">
    <input type="text" id="channelDescription" placeholder="Описание">
    
    <!-- Статистика -->
    <input type="text" id="followers" placeholder="Подписчики">
    <input type="text" id="likes" placeholder="Лайки">
    <input type="text" id="posts" placeholder="Видео">
    
    <!-- Видео URLs -->
    <textarea id="videoUrls" placeholder="YouTube URLs (по одному на строку)"></textarea>
    
    <button type="submit">Создать виджет</button>
</form>

<div id="embedCodeResult" style="display: none;">
    <h3>Ваш код для вставки:</h3>
    <pre id="embedCodeDisplay"></pre>
    <button onclick="copyEmbedCode()">Копировать</button>
</div>

<script>
document.getElementById('youtubeWidgetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Получаем ID клиента из Shopify
    const customerId = window.shopifyCustomerId; // Или другой способ
    
    // Собираем конфигурацию
    const config = {
        widgetTitle: document.getElementById('channelName').value,
        widgetDescription: document.getElementById('channelDescription').value,
        channelStats: {
            subscribers: document.getElementById('followers').value,
            likes: document.getElementById('likes').value,
            videos: document.getElementById('posts').value
        },
        videoUrls: document.getElementById('videoUrls').value
            .split('\n')
            .filter(url => url.trim())
            .map(url => url.trim()),
        maxPosts: 6,
        showChannelStats: true,
        showTimestamp: true,
        showMedia: true,
        autoFetchMeta: true
    };
    
    try {
        // Отправляем на API
        const response = await fetch('https://youtube-feed.pages.dev/api/save-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                configId: 'customer-' + customerId,
                config: config
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Показываем embed-код
            document.getElementById('embedCodeDisplay').textContent = result.embedCode;
            document.getElementById('embedCodeResult').style.display = 'block';
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        alert('Не удалось сохранить конфигурацию');
        console.error(error);
    }
});

function copyEmbedCode() {
    const code = document.getElementById('embedCodeDisplay').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код скопирован!');
    });
}
</script>
```

## 📝 Примечания

- API работает как с Cloudflare KV (динамическое хранение), так и со статическими JSON файлами
- Если KV не настроен, конфиги можно сохранять вручную в папку `configs/`
- Embed-код работает сразу после сохранения через API
- Конфиги кешируются на 5 минут для производительности

## 🆘 Поддержка

Если у вас возникли вопросы по интеграции:
1. Проверьте [документацию API](#api-endpoints)
2. Посмотрите [примеры кода](#пример-интеграции-из-shopify)
3. Откройте issue в GitHub репозитории
