

// rfc  for full basic code for componned

import React from 'react'
import "./LandingPage.css"
import { Link, useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation';

function LandingPage() {
  const navigate = useNavigate()

  const handleJoinGuest = () => {
  navigate("/ab23cd45")
  }

  const handleRegister = () => {
  navigate("/auth")
  }

  const handleLogin = () => {
  navigate("/auth")
  }

  return (
    <>
      <div className='landingPageContainer'>
        <nav>
            <div className="navHeader">
              <h2>Zoom Meeting App</h2>
            </div>

            <div className="navlist">
              <p onClick={handleJoinGuest}>Join as Guest</p>

              <p onClick={handleRegister}>Register</p>
         
              <p onClick={handleLogin}>Login</p>
              
            </div>
        </nav>

        <div className="landingMainContainer">
          <div  className='heroText'>
            {/* <h1><span style={{color: "#ff9839"}}>Connect</span> with your loved Ones</h1> */}

            <h1>
              <TypeAnimation
             
                sequence={[
                  'Connect with your loved Ones',
                  1000, // wait 1s
                  (el) => {
                    el.classList.add('highlight-connect');
                    return new Promise(res => {
                      setTimeout(() => {
                        el.classList.remove('highlight-connect');
                        res();
                      }, 2000); // keep highlighted for 2s
                    });
                  },
                  '', // reset text
                  500, // wait 0.5s before restarting
                ]}
                speed={40}
                deletionSpeed={60}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                style={{ display: 'inline-block' }}
              />
            </h1>
            <p>Cover a distance by Zoom Meeting App</p>
            <div className='ctaButton' role='button'>
              <Link to={"/auth"}>Get Started</Link>
            </div>
          </div>

          <div className='heroImage'>
            <img src="/mobile.png" alt="Image" />
          </div>

        </div>
      </div>
    </>
  )
}


export default LandingPage;




