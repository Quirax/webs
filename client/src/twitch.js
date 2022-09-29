function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options,
    }

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString()
    }

    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value)

    for (let optionKey in options) {
        updatedCookie += '; ' + optionKey
        let optionValue = options[optionKey]
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue
        }
    }

    document.cookie = updatedCookie
}

function getCookie(name) {
    let matches = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
    )
    return matches ? decodeURIComponent(matches[1]) : undefined
}

function deleteCookie(name) {
    setCookie(name, '', {
        'max-age': -1,
    })
}

export default class Twitch {
    static instance = null

    user = {}

    constructor() {
        let accessToken = ''
        let refreshToken = ''
        let expiredDate = new Date()

        const beforePerform = async () => {
            if (expiredDate < new Date()) await this.connect()
        }

        this.connect = async () => {
            if (expiredDate > new Date()) return true

            if (refreshToken) {
                try {
                    let resp = await fetch('https://id.twitch.tv/oauth2/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            client_id: process.env.REACT_APP_CLIENT_ID,
                            client_secret: process.env.REACT_APP_CLIENT_SECRET,
                            refresh_token: refreshToken,
                            grant_type: 'refresh_token',
                        }),
                    })
                    let resp_json = await resp.json()

                    accessToken = resp_json.access_token
                    refreshToken = resp_json.refresh_token
                    expiredDate = new Date()
                    expiredDate.setTime(expiredDate.getTime() + resp_json.expires_in * 1000)

                    //https://dev.twitch.tv/docs/api/reference#get-users
                    resp = await fetch('https://api.twitch.tv/helix/users', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Client-Id': process.env.REACT_APP_CLIENT_ID,
                        },
                    })
                    resp_json = await resp.json()

                    this.user = resp_json.data[0]

                    return true
                } catch (e) {
                    console.error('Twitch', 'connect', e)
                    return false
                }
            }

            let code = getCookie('code')
            deleteCookie('code')
            if (!code) {
                alert('잘못된 접근입니다.')
                window.history.back()
            }

            try {
                const resp = await fetch('https://id.twitch.tv/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.REACT_APP_CLIENT_ID,
                        client_secret: process.env.REACT_APP_CLIENT_SECRET,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT || 80}`,
                    }),
                })
                const resp_json = await resp.json()

                accessToken = resp_json.access_token
                refreshToken = resp_json.refresh_token
                expiredDate = new Date()
                expiredDate.setTime(expiredDate.getTime() + resp_json.expires_in * 1000)
                return true
            } catch (e) {
                console.error('Twitch', 'connect', e)
                return false
            }
        }

        this.searchCategories = async (query) => {
            beforePerform()

            try {
                const resp = await fetch(
                    'https://api.twitch.tv/helix/search/categories?' +
                        new URLSearchParams({
                            query,
                        }),
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Client-Id': process.env.REACT_APP_CLIENT_ID,
                        },
                    }
                )
                const resp_json = await resp.json()

                return resp_json.data
            } catch (e) {
                console.error('Twitch', `searchCategories(${query})`, e)
                return []
            }
        }
    }

    static getInstance() {
        if (Twitch.instance === null) Twitch.instance = new Twitch()
        return Twitch.instance
    }

    requestAuth() {
        window.location.href =
            'https://id.twitch.tv/oauth2/authorize?' +
            new URLSearchParams({
                response_type: 'code',
                client_id: process.env.REACT_APP_CLIENT_ID,
                redirect_uri: `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT || 80}`,
                scope: ['channel:read:stream_key', 'channel:manage:broadcast'].join(' '),
            })
    }

    passAuth(code) {
        setCookie('code', code)
        window.location.replace(`https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT || 80}/live`)
    }
}
