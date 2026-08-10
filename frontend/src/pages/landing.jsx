import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const corporateBlueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
});

const router = useNavigate();

export default function LandingPage() {
  return (
    <ThemeProvider theme={corporateBlueTheme}>
      <CssBaseline />
      <div className='landingPageContainer' style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
          <div className='navHeader'>
            <h2 style={{ color: "#3b82f6", fontSize: '2rem', margin: 0, fontWeight: 'bold', fontFamily: 'sans-serif' }}>NexMeet</h2>
          </div>

          <div className='navlist' style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', fontSize: '1.1rem', fontWeight: '500' }}>
            <p onClick={() => {
              router("/ffd")
            }} style={{ cursor: 'pointer', margin: 0, color: '#94a3b8', fontFamily: 'sans-serif', transition: 'color 0.2s' }}>Join as Guest</p>

            <Link to="/auth" state={{ defaultForm: 1 }} style={{ textDecoration: 'none', color: '#94a3b8', fontFamily: 'sans-serif' }}>
              Register
            </Link>

            <div onClick={(
              router("/auth")
            )} role='button'></div>

            <Link to="/auth" state={{ defaultForm: 0 }} style={{
              textDecoration: 'none',
              background: '#2563eb',
              padding: '0.6rem 1.6rem',
              borderRadius: '6px',
              color: '#ffffff',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}>
              Login
            </Link>
          </div>
        </nav>

        <div className="landingMainContainer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4rem' }}>
          <div style={{ maxWidth: '55%' }}>
            <h1 style={{ fontSize: '3.8rem', lineHeight: '1.2', marginBottom: '1.5rem', color: '#ffffff', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
              <span style={{ color: "#3b82f6" }}>Connect</span> instantly,<br />
              Collaborate seamlessly
            </h1>

            <p style={{ fontSize: '1.3rem', color: '#94a3b8', marginBottom: '2.5rem', fontFamily: 'sans-serif' }}>
              Cover a distance by NexMeet Video Call
            </p>

             <Link to="/home" style={{
              textDecoration: 'none',
              background: '#2563eb',
              padding: '0.8rem 2.2rem',
              borderRadius: '30px',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              fontFamily: 'sans-serif',
              display: 'inline-block',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'transform 0.2s, background 0.2s'
            }}>
              Get Started
            </Link>
          </div>

          <div style={{ maxWidth: '40%', display: 'flex', justifyContent: 'center' }}>
            <img src="/vc.jpg" alt="Video Call" style={{ maxWidth: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

