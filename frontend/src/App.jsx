import React from 'react';
import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import { AuthProvider } from './contexts/AuthContext';
import Authentication from './pages/authentication';
import NexMeetComponent from './pages/NexMeet';
import HomeComponent from './pages/home';
import History from './pages/history';

function App() {

  return (
    <div className="App">
      <Router>

        <AuthProvider>

        <Routes>

          <Route path='/' element={<LandingPage />} />

          <Route path='/auth' element={<Authentication />} />

          <Route path='/home' element={<HomeComponent />} />

          <Route path='/history' element={ <History />} />

          <Route path='/:url' element={<NexMeetComponent />} />

        </Routes>

        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;
