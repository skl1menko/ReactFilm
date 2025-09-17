import { useState, useEffect } from 'react';
import AnimatedPage from '../components/AnimatedPage';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'stats', name: 'Статистика', endpoint: '/admin/stats' },
    { id: 'films', name: 'Фильмы', endpoint: '/admin/films' },
    { id: 'people', name: 'Персонажи', endpoint: '/admin/people' },
    { id: 'links', name: 'Связи', endpoint: '/admin/links' }
  ];

  const fetchData = async (endpoint) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001${endpoint}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setData({ error: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab) {
      fetchData(currentTab.endpoint);
    }
  }, [activeTab]);

  const renderStats = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Всего фильмов</h3>
        <div className="stat-number">{data.totalFilms}</div>
      </div>
      <div className="stat-card">
        <h3>Всего персонажей</h3>
        <div className="stat-number">{data.totalPeople}</div>
      </div>
      <div className="stat-card">
        <h3>Всего связей</h3>
        <div className="stat-number">{data.totalLinks}</div>
      </div>
      <div className="stat-card">
        <h3>Персонажи без фильмов</h3>
        <div className="stat-number">{data.peopleWithoutFilms}</div>
      </div>
      <div className="stat-card">
        <h3>Фильмы без персонажей</h3>
        <div className="stat-number">{data.filmsWithoutPeople}</div>
      </div>
      <div className="stat-card">
        <h3>Среднее персонажей на фильм</h3>
        <div className="stat-number">{data.avgCharactersPerFilm}</div>
      </div>
    </div>
  );

  const renderTable = (data, columns) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p>Нет данных для отображения</p>;
    }

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;

    if (data.error) {
      return <div className="error-message">{data.error}</div>;
    }

    switch (activeTab) {
      case 'stats':
        return renderStats();
      case 'films':
        return renderTable(data, ['episode_id', 'title', 'director', 'producer', 'release_date']);
      case 'people':
        return renderTable(data, ['uid', 'name', 'birth_year', 'gender', 'height', 'mass']);
      case 'links':
        return renderTable(data, ['film_id', 'person_id', 'film_title', 'person_name']);
      default:
        return <div>Выберите вкладку</div>;
    }
  };

  return (
    <AnimatedPage>
      <div className="admin-page">
        <div className="admin-header">
          <h1>Админ панель</h1>
          <p>Просмотр данных базы данных Star Wars</p>
        </div>

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminPage;