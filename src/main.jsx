import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/global.css';
import App from './App';

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    return storedTheme;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem('taskflow_user') || 'null');
    return storedUser?.settings?.theme || 'dark';
  } catch {
    return 'dark';
  }
};

document.documentElement.setAttribute('data-theme', getInitialTheme());

const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

// Точка входа: подключаем глобальные стили и монтируем корневое React-приложение.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
