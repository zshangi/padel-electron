import { Navigate } from 'react-router-dom'
import { verify } from '../utils/Authentication'
import { useEffect, useState } from 'react'

function PrivateRoute({ children }) {
    const [ loaded, setLoadded ] = useState( false )
    const [ hasAccess, setHasAccess ] = useState( false )

    useEffect( () => {
        verify().then( auth => {
            if( auth )
            {
                setHasAccess( true )
            }
            else
            {
                setHasAccess( false )
            }

            setLoadded( true )
        })

    },[])

    if( !loaded )
    {
        return ( <></> )
    }

    return hasAccess ? children : <Navigate to="/" />;
}

export default PrivateRoute;
