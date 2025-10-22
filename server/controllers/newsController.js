const axios = require('axios');
const { parseStringPromise } = require('xml2js');

// URL RSS-стрічки новин (виправлена)
const RSS_URL = 'https://armyinform.com.ua/feed/';

// @desc    Отримати останні новини з сайту АрміяInform
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
    const parsedData = await parseStringPromise(xmlData);
    console.log('[News] XML розпарсено успішно.');


    // 3. Перевіряємо структуру об'єкта
    let newsItems = [];
    if (parsedData.rss && parsedData.rss.channel && parsedData.rss.channel[0] && parsedData.rss.channel[0].item) {
        newsItems = parsedData.rss.channel[0].item;
    } else {
        console.error('[News] Не вдалося знайти елементи новин у RSS-структурі:', JSON.stringify(parsedData, null, 2)); // Виводимо структуру для аналізу
        throw new Error('Неправильний формат RSS-стрічки');
    }

    // 4. Форматуємо дані
    const formattedNews = newsItems.slice(0, 10).map(item => ({
      title: item.title && item.title[0] ? item.title[0] : 'Без заголовка',
      link: item.link && item.link[0] ? item.link[0] : '#',
      pubDate: item.pubDate && item.pubDate[0] ? item.pubDate[0] : new Date().toISOString(),
      description: item.description && item.description[0] ? item.description[0].substring(0, 150) + '...' : 'Опис відсутній',
    }));
    console.log(`[News] Успішно відформатовано ${formattedNews.length} новин.`);

    res.json(formattedNews);
  } catch (error) { // <-- Зміни тут, всередині catch
    let errorMessage = 'Не вдалося завантажити новини. Можливі проблеми з джерелом.'; // Повідомлення за замовчуванням

    // Логуємо більш детальну інформацію про помилку
    if (axios.isAxiosError(error)) {
        console.error(`[News] Помилка Axios при запиті до ${RSS_URL}:`, error.code, error.message);
        if (error.response) {
            console.error('[News] Статус відповіді:', error.response.status);
            console.error('[News] Дані відповіді:', error.response.data);
            // Можна спробувати взяти повідомлення з відповіді сервера, якщо воно є
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.request) {
            console.error('[News] Запит було зроблено, але відповіді не отримано:', error.code);
             if (error.code === 'ETIMEDOUT') {
                errorMessage = 'Сервер новин не відповідає (тайм-аут). Спробуйте пізніше.';
             }
        } else {
            console.error('[News] Помилка налаштування запиту Axios:', error.message);
        }
    } else if (error instanceof Error) {
         console.error('[News] Помилка парсингу або інша:', error.message);
         errorMessage = error.message; // Використовуємо повідомлення з помилки
    } else {
         // Обробка несподіваних типів помилок
         console.error('[News] Невідома помилка:', error);
    }

    // Надсилаємо відповідь з помилкою
    res.status(500).json({
        message: errorMessage,
    });
  }
};

module.exports = {
  getMoDNews,
};

