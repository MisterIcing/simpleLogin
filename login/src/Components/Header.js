import SecurityIcon from '@mui/icons-material/Security';
import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useVars } from './GlobalVars';
import { backendAdd } from '../index';
import axios from 'axios'

function Header() {
/////////////////////////////////////////////////////////////////////////////
//Variables

  let navi = useNavigate();
  const {sessionID, setSessionID} = useVars();

/////////////////////////////////////////////////////////////////////////////
//Functions

  //send current sessionID to backend to log out account
  const handleLogout = async () => {
    try{
      const res = await axios.post(`${backendAdd('/logout')}`, {
        sessionID: sessionID
      });
      if(res.status < 200 || res.status >= 300){
        alert(res.data.error || "Unknown error");
      }
      else{
        //invalidate session and go back to login
        setSessionID(null);
        navi('/')
      }
    }
    catch(eva){
      //update will trigger useEffect in admin
      setSessionID(null);
      //bad response from backend
      if(eva.response){
        alert(eva.response.data.error || "Unknown error")
      }
      //no response from backend
      else if(eva.request){
        alert("No response recieved from backend")
      }
      //something else
      else{
        alert("Unknown error when making request")
      }
      console.error('Error logging out', eva)
    }
  }

/////////////////////////////////////////////////////////////////////////////
//JSX

  return (
    <header className="App-header">
      {/* left icon & text. work as button to login */}
      <div style={{display: 'flex', alignItems: 'center'}} onClick={() => navi('/')}>
        <SecurityIcon />
        <p>
          Basic Login
        </p>
      </div>
      { sessionID ?
        // add logout button if there is a sessionID
        <div>
          <Button variant='contained' className='Button-override' onClick={handleLogout}>Log Out</Button>
        </div>
        :
        // show that there is no active session to log out of
        <div><p>No Active Session</p></div>
      }
    </header>
  )
}

export default Header