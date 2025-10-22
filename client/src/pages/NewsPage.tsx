import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';

// Описуємо тип для однієї новини
interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Робимо запит на наш backend, який, у свою чергу, візьме новини з МОУ
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/news`);
        setNews(data);
      } catch (err) {
        setError('Не вдалося завантажити новини. Спробуйте пізніше.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []); // Пустий масив означає, що ефект виконається один раз при завантаженні

  return (
    <Container>
      <h1 className="mb-4">Останні новини з порталу Міноборони</h1>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        news.map((article, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title>{article.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {new Date(article.pubDate).toLocaleString('uk-UA')}
              </Card.Subtitle>
              <Card.Text>{article.description}</Card.Text>
              <Button href={article.link} target="_blank" rel="noopener noreferrer" variant="primary">
                Читати на сайті
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default NewsPage;