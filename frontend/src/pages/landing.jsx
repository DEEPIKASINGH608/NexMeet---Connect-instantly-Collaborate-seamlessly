import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2 className='font-bold' style={{ color: "#ff9839" }}>NexMeet </h2>

        </div>
        <div className='navlist' style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} >
          <p style={{ cursor: 'pointer' }} >Join as Guest</p>


          <Link to="/auth" state={{ defaultForm: 1 }} style={{ textDecoration: 'none' }}>
            <p style={{ cursor: 'pointer' }}>Register</p>
          </Link>


          <Link to="/auth" state={{ defaultForm: 0 }} style={{ textDecoration: 'none' }}>
            <div role='button' style={{ background: '#ff9839', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }} >
              <p style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>Login</p>
            </div>
          </Link>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#ff9839" }}>Connect</span> instantly,<br />
            Collaborate seamlessly
          </h1>

          <p> Cover a distance by NexMeet Video Call </p>
          <div role='button'>
            <Link to={"/home"}> Get Started </Link>
          </div>
        </div>

        <div>
          <img src="/vc.jpg" alt="" />
        </div>


      </div>

    </div>



  )
}

