import Header from "../Components/Header";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormControl, Paper, InputAdornment, InputLabel, Input, IconButton, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendAdd }  from "../index";
import { useVars } from "../Components/GlobalVars";
import axios from 'axios'

/**
 * Some elements used from MUI's website including:
 * Password input: text-field -> input-adornments
 */

function Login() {
/////////////////////////////////////////////////////////////////////////////
// Variables

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navi = useNavigate();
  const {setSessionID} = useVars();

/////////////////////////////////////////////////////////////////////////////
// Functions

  //variable form field update for login
  const handleFieldChange = (eva) => {
    const {id, value} = eva.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  //toggle seeing password
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  //send username & password to backend and show results
  const handleSubmit = async (eva) => {
    eva.preventDefault(); //dont reload page basically
    setErrorMsg("")

    //dont waste time if missing field
    if(!formData.username || !formData.password){
      setErrorMsg("Missing username or password")
      console.log("Missing form data")
      return
    }

    try{
      const res = await axios.post(`${backendAdd('/login')}`, {
        username: formData.username,
        password: formData.password,
      });

      //report bad return codes
      if(res.status < 200 || res.status >= 300){
        setErrorMsg(res.data.error || "Unknown error")
      }
      else{
        //set valid sessionID and go to admin screen
        setSessionID(res.data.sessionID)
        navi('/admin')
      }
    }
    //axios bad codes here
    catch(shinji){
      //bad response from backend
      if(shinji.response){
        setErrorMsg(shinji.response.data.error || "Unknown error")
      }
      //didnt reach backend
      else if(shinji.request){
        setErrorMsg("No response recieved from backend")
      }
      //something else
      else{
        setErrorMsg("Unknown error when making request")
      }
    }
  }

/////////////////////////////////////////////////////////////////////////////
//JSX

  return (
    <div className="App">
      <Header />
      <div style={{display: "flex", justifyContent: "center"}}>
        <Paper className="Main-body">
          {/* start of important form inputs */}
          <form className="form" onSubmit={handleSubmit}>
            {/* username field */}
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input 
                id="username"
                type="text"
                value={formData.username}
                onChange={handleFieldChange}
                sx={{paddingLeft: "15px"}}
              />
            </FormControl>
            {/* password field */}
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleFieldChange}
                sx={{paddingLeft: "15px"}}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? 'hide the password' : 'display the password'
                      }
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            {/* error message if valid */}
            {errorMsg ? <p className="Error-msg">{errorMsg}</p> : <div></div>}
            {/* submit button */}
            <div style={{display: "flex", justifyContent: "center", marginTop: "5%"}}>
              <Button
                className="Button-override"
                type="submit"
                variant="contained"
              >Log In</Button>
            </div>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default Login;
