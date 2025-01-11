import Header from './../Components/Header';
import { useVars } from '../Components/GlobalVars';
import { Button, Divider, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendAdd } from '../index';
import { useEffect, useState } from 'react';

function Admin() {
///////////////////////////////////////////////////////////////
//Variabels

  const { sessionID } = useVars();
  const [validSession, setValidSession] = useState(false);
  const navi = useNavigate();

///////////////////////////////////////////////////////////////
//Functions

  //ask backend if current sessionID is in database
  const checkSession = async (eva) => {
    try {
      const res = await axios.post(backendAdd('/check'), {
        sessionID: sessionID
      });

      //error in getting if in database, so remove current sessionID
      if (res.status < 200 || res.status >= 300) {
        alert('Error checking session')
        setValidSession(false);
      }
      //set validity based on response
      else {
        if (res.data.result === false) {
          setValidSession(false);
        }
        else if (res.data.result === true) {
          setValidSession(true);
        }
        else {
          console.error('Invalid response in check');
        }
      }
    }
    catch (eva) {
      setValidSession(false);
      //axios bad response
      if (eva.response) {
        alert(eva.response.data.error || "Unknown error");
      }
      //didnt reach backend
      else if (eva.request) {
        alert("No response recieved from backend");
      }
      //catchall
      else {
        alert("Unknown error when making request");
      }
    }
  }
  //check sessionID if it changes
  useEffect(() => {
    checkSession();
    //eslint-disable-next-line
  }, [sessionID])

/////////////////////////////////////////////////////////////////////////////
//JSX

  return (
    <div className='App'>
      <Header />
      {/* successful login attempt */}
      {sessionID && validSession ?
        <div style={{display: "flex", justifyContent: "center"}}>
          <Paper className='Main-body'>
            <p><b>Top secret information:</b></p>
            <Divider />
            <p>Cats are pretty cool</p>
          </Paper>
        </div>
        :
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {/* bad login attempt */}
          <p>Invalid Session</p>
          <Button className='Button-override' variant='contianed' sx={{ margin: '1%' }} onClick={() => navi('/')}>
            Return Home
          </Button>
        </div>
      }
    </div>
  )
}

export default Admin;