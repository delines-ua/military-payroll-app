import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Оновлюємо інтерфейс PaySlip
interface PaySlip {
  _id: string;
  paymentDate: string; // Замість month/year
  totalAmount: number;
}

// Допоміжний тип для даних графіка
interface ChartData {
    name: string; // Назва місяця (та рік, якщо потрібно)
    totalAmount: number;
}


const StatisticsPage = () => {
  const authContext = useContext(AuthContext);
  // Зберігаємо оригінальні дані та дані для графіка окремо
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaySlips = async () => {
      if (authContext?.userInfo?.token) {
        try {
            setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${authContext.userInfo.token}`,
            },
          };
          const { data } = await axios.get<PaySlip[]>('/api/payroll/mypayslips', config);

          // Обробляємо дані для графіка
          const formattedData = data
            .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()) // Сортуємо за датою
            .map(slip => {
                const date = new Date(slip.paymentDate);
                // Форматуємо назву місяця + рік
                const monthName = date.toLocaleString('uk-UA', { month: 'long' });
                const year = date.getFullYear();
                return {
                    name: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, // Напр. "Вересень 2025"
                    totalAmount: slip.totalAmount,
                };
            });

          setChartData(formattedData);
          setError('');
        } catch (err: any) {
          setError('Не вдалося завантажити дані для статистики.');
          console.error("Помилка завантаження статистики:", err);
        } finally {
          setLoading(false);
        }
      } else {
         // Чекаємо завантаження userInfo
         const timer = setTimeout(() => {
           if (!localStorage.getItem('userInfo')) {
              setError('Користувач не авторизований');
              setLoading(false);
           }
         }, 200);
         return () => clearTimeout(timer);
      }
    };

    if(authContext?.userInfo !== undefined){ // Перевіряємо, чи стан ініціалізовано
        fetchPaySlips();
    }
  }, [authContext?.userInfo]); // Залежність userInfo

  // Форматування для осі Y
  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `${(tickItem / 1000).toLocaleString('uk-UA')} тис.`;
    }
    return `${tickItem} грн`;
  };

  return (
    <Container>
      <h1>Статистика нарахувань</h1>
      <p>Динаміка грошового забезпечення за останні місяці.</p>
      <Card className="mt-4 p-3">
        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : chartData.length === 0 ? (
            <p>Недостатньо даних для побудови графіка.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData} // Використовуємо оброблені дані
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /> {/* Вісь X тепер показує "Місяць Рік" */}
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString('uk-UA')} грн`, 'Сума']} />
              <Legend />
              <Bar dataKey="totalAmount" fill="#8884d8" name="Сума нарахування" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Container>
  );
};

export default StatisticsPage; // <-- Правильний експорт

