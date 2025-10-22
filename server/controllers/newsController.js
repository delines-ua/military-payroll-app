const axios = require('axios');
const { parseStringPromise } = require('xml2js');

// URL RSS-стрічки новин (ЗАМІНЕНО НА АЛЬТЕРНАТИВНУ)
const RSS_URL = 'https://www.ukrmilitary.com/feeds/posts/default';

// @desc    Отримати останні новини
// @route   GET /api/news
// @access  Public
const getMoDNews = async (req, res) => {
  try {
    // 1. Отримуємо XML-дані з RSS-стрічки зі збільшеним тайм-аутом
    console.log(`[News] Спроба отримати дані з ${RSS_URL}`);
    const { data: xmlData } = await axios.get(RSS_URL, {
        timeout: 20000 // Чекаємо 20 секунд
    });
    console.log('[News] Дані XML отримано успішно.');

    // 2. Парсимо XML в JavaScript об'єкт
    console.log('[News] Спроба парсингу XML...');
    // Використовуємо parseStringPromise для xml2js
    const parsedData = await parseStringPromise(xmlData, { 
        explicitArray: false, // Спрощуємо структуру об'єкта
        tagNameProcessors: [key => key.replace(':', '_')] // Замінюємо ':' в тегах, якщо вони є
    }); 
    console.log('[News] XML розпарсено успішно.');


    // 3. Перевіряємо структуру об'єкта (структура Atom feed відрізняється від RSS)
    let newsItems = [];
    if (parsedData.feed && parsedData.feed.entry) {
        newsItems = Array.isArray(parsedData.feed.entry) ? parsedData.feed.entry : [parsedData.feed.entry]; // Переконуємось, що це масив
    } else {
        console.error('[News] Не вдалося знайти елементи новин у Atom feed структурі:', JSON.stringify(parsedData, null, 2));
        throw new Error('Неправильний формат Atom feed');
    }

    // 4. Форматуємо дані (адаптовано для Atom feed)
    const formattedNews = newsItems.slice(0, 10).map(item => {
        let description = 'Опис відсутній';
        // Шукаємо опис в content або summary
        if (item.summary && typeof item.summary === 'object' && item.summary._) {
             description = item.summary._;
        } else if (item.summary && typeof item.summary === 'string') {
             description = item.summary;
        } else if (item.content && typeof item.content === 'object' && item.content._) {
             description = item.content._;
        } else if (item.content && typeof item.content === 'string') {
             description = item.content;
        }
        // Очищаємо HTML теги та скорочуємо
        description = description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

        // Link може бути масивом об'єктів
        let link = '#';
        if (Array.isArray(item.link)) {
            const alternateLink = item.link.find(l => l.$.rel === 'alternate');
            if (alternateLink) link = alternateLink.$.href;
        } else if (item.link && item.link.$ && item.link.$.href) {
            link = item.link.$.href;
        }

        return {
          title: item.title && typeof item.title === 'object' && item.title._ ? item.title._ : (item.title || 'Без заголовка'),
          link: link,
          pubDate: item.published || item.updated || new Date().toISOString(), // Atom використовує published або updated
          description: description,
        }
    });
    console.log(`[News] Успішно відформатовано ${formattedNews.length} новин.`);

    res.json(formattedNews);
  } catch (error) { // Обробка помилок залишається схожою
    let errorMessage = 'Не вдалося завантажити новини. Можливі проблеми з джерелом.'; 

    if (axios.isAxiosError(error)) {
        console.error(`[News] Помилка Axios при запиті до ${RSS_URL}:`, error.code, error.message);
        if (error.response) {
            console.error('[News] Статус відповіді:', error.response.status);
            console.error('[News] Дані відповіді:', error.response.data);
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
            console.error('[News] Запит було зроблено, але відповіді не отримано:', error.code);
             if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                errorMessage = 'Сервер новин не відповідає (тайм-аут). Спробуйте пізніше.';
             }
        } else {
            console.error('[News] Помилка налаштування запиту Axios:', error.message);
        }
    } else if (error instanceof Error) {
         console.error('[News] Помилка парсингу або інша:', error.message);
         errorMessage = error.message; 
    } else {
         console.error('[News] Невідома помилка:', error);
    }

    res.status(500).json({
        message: errorMessage,
    });
  }
};

module.exports = {
  getMoDNews,
};

