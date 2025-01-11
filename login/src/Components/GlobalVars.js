import React, { useState, createContext, useContext } from 'react';

const context = createContext();

// This is just used to make sessionID a global variable so that all pages can update it
export const GlobalVars = ({children}) => {
/////////////////////////////////////////////////////////////////////////////
//Variables

    const [sessionID, setSessionID] = useState(null);

/////////////////////////////////////////////////////////////////////////////
//JSX

    return(
        <context.Provider value={{sessionID, setSessionID}}>
            {children}
        </context.Provider>
    )
}

export const useVars = () => useContext(context);