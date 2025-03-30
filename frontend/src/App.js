import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import MainPage from './MainPage';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/" element={token ? <MainPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
