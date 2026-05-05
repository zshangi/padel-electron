
export class Authentication
{
    constructor()
    {
        if( window.localStorage.auth )
        {
            this.auth = JSON.parse( window.localStorage.auth ) 
        }
        else
        {
            this.auth = null
        }
    }
    
    async has_token()
    {
        if( this.auth )
        {

            if( await this.verify_token() )
            {
                return true
            }
        }
        return false 
    }

    username()
    {
        if( window.localStorage.me )
        {
            let me = JSON.parse( window.localStorage.me )
            if( me.first_name !== "" )
            {
                return me.first_name + " " + me.last_name
            }
            else
            {
                return me.username
            }
        }
        return null
    }

    async obtain_token(credentials) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        };
    
        const response = await fetch('/api/auth/token/obtain/', requestOptions);
        const success = response.status === 200;
    
        if (!success) return false;
    
        const data = await response.json();
    
        this.auth = {
            accessToken: data.access,
            refreshToken: data.refresh
        };
    
        const me = await this.me();
    
        window.localStorage.auth = JSON.stringify(this.auth);
        window.localStorage.me = JSON.stringify(me);
    
        return me;
    }
    

    async verify_token()
    {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({token: this.auth.accessToken})
        };

        var response = await fetch("/api/auth/token/verify/", requestOptions )
        let success = response.status === 200

        if( !success )
        {
            return this.refresh_token()
        }

        return true
    }

    async refresh_token()
    {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({refresh: this.auth.refreshToken})
        };

        var response = await fetch("/api/auth/token/refresh/", requestOptions )
        let success = response.status === 200

        if( !success )
        {
            return false
        }

        var data = await response.json()
        this.auth.accessToken = data.access
        window.localStorage.auth = JSON.stringify( this.auth )

        return true
    }

    logout()
    {
        window.localStorage.removeItem('auth')
        window.localStorage.removeItem('me')
    }

    async post( url, body={}, headers={} )
    {
        if( this.auth )
        {
            let token = this.auth.accessToken;
            headers['Authorization'] = "Bearer " + token;
        }

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        };

        var response = await fetch(url, requestOptions)
        /*let success = response.status === 200

        if( !success )
        {
            return null
        }*/
        var data = await response.json()
        return data
    }

    async get( url, headers={} )
    {
        if( this.auth )
        {
            let token = this.auth.accessToken;
            headers['Authorization'] = "Bearer " + token;
        }

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        var response = await fetch(url, requestOptions)
        var data = await response.json()
        return data
    }

    async me()
    {
        var m = await this.get("/api/auth/me/")
        return m
    }
}

export async function login( credentials )
{
    let auth = new Authentication()

    var res = await auth.obtain_token( credentials )
    return res
}

export function logout()
{
    let auth = new Authentication()
    auth.logout()
}

export async function verify()
{
    let auth = new Authentication()

    var res = await auth.has_token()
    return res
}

export async function backendAccessGet( url, headers={} )
{
    let auth = new Authentication()
    if( ! (await auth.has_token()) )
    {
        window.location.reload(false)
    }

    var res = await auth.get( url, headers )
    return res
}

export async function backendAccessPost( url, body={}, headers={} )
{
    let auth = new Authentication()
    if( !(await auth.has_token()) )
    {
        window.location.reload(false)
    }

    var res = await auth.post( url, body, headers )
    return res
}

export async function backendAccessPostNoAuth( url, data={}, headers={} )
{
    let auth = new Authentication()
    var res = await auth.post( url, data, headers )
    return res
}


export async function backendMe()
{
    let auth = new Authentication()
    var res = await auth.me()
    return res
}