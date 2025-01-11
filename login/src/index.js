import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './Pages/Login';
import Admin from './Pages/Admin';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import { GlobalVars } from './Components/GlobalVars';

//use to get backend url (and only have to change 1 place)
export const backendAdd = (path) => {
  return 'https://localhost:5000' + path
}

//set up routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/admin',
    element: <Admin />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalVars>
      <RouterProvider router={router}/>
    </GlobalVars>
  </React.StrictMode>
);