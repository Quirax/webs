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

        const fetchAPI = async (uri, query, method = 'GET', body) => {
            await beforePerform()

            const header = {
                Authorization: `Bearer ${accessToken}`,
                'Client-Id': process.env.REACT_APP_CLIENT_ID,
            }

            let url = `https://api.twitch.tv/helix/${uri}`

            if (query) url += '?' + query

            if (body) {
                Object.apply(header, {
                    'Content-Type': 'application/json',
                })
            }

            const resp = await fetch(url, {
                method: method,
                headers: header,
                body: body,
            })

            return await resp.json()
        }

        const fetchToken = async (mode, token) => {
            const body = new URLSearchParams({
                client_id: process.env.REACT_APP_CLIENT_ID,
                client_secret: process.env.REACT_APP_CLIENT_SECRET,
            })

            if (mode === 'refresh') {
                body.append('grant_type', 'refresh_token')
                body.append('refresh_token', token)
            } else {
                body.append('grant_type', 'authorization_code')
                body.append('code', token)
                body.append('redirect_uri', `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT || 80}`)
            }

            console.log(mode, body)

            let resp = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body,
            })
            const resp_json = await resp.json()

            accessToken = resp_json.access_token
            refreshToken = resp_json.refresh_token
            expiredDate = new Date()
            expiredDate.setTime(expiredDate.getTime() + resp_json.expires_in * 1000)
            setCookie('refresh_token', refreshToken, {
                'max-age': resp_json.expires_in,
            })

            console.log(accessToken, refreshToken)

            //https://dev.twitch.tv/docs/api/reference#get-users
            resp = await fetchAPI('users')
            this.user = resp.data[0]
        }

        this.connect = async () => {
            if (expiredDate > new Date()) return true

            try {
                let code = getCookie('code')
                deleteCookie('code')
                if (code) {
                    await fetchToken('auth', code)
                    return true
                }

                const rt = refreshToken || getCookie('refresh_token')

                console.log(rt)

                if (!rt) {
                    alert('잘못된 접근입니다.')
                    window.history.back()
                }

                await fetchToken('refresh', rt)

                return true
            } catch (e) {
                console.error('Twitch', 'connect', e)
                return false
            }
        }

        this.searchCategories = async (query) => {
            try {
                const resp = await fetchAPI(
                    'search/categories',
                    new URLSearchParams({
                        query,
                    })
                )

                return resp.data
            } catch (e) {
                console.error('Twitch', `searchCategories(${query})`, e)
                return []
            }
        }

        this.getCategoryWithID = async (id) => {
            try {
                const resp = await fetchAPI(
                    'games',
                    new URLSearchParams({
                        id: id,
                    })
                )

                return resp.data[0]
            } catch (e) {
                console.error('Twitch', `getCategoryWithID(${id})`, e)
                return undefined
            }
        }

        this.getStreamKey = async () => {
            try {
                const resp = await fetchAPI(
                    'streams/key',
                    new URLSearchParams({
                        broadcaster_id: this.user.id,
                    })
                )

                return resp.data[0].stream_key
            } catch (e) {
                console.error('Twitch', `getStreamKey()`, e)
                return undefined
            }
        }

        // this.getDescription = async () => {
        //     //https://dev.twitch.tv/docs/api/reference#get-channel-information
        // }

        this.setDescription = async ({ category_id, title }) => {
            //https://dev.twitch.tv/docs/api/reference#modify-channel-information
            try {
                await fetchAPI(
                    'channels',
                    new URLSearchParams({
                        broadcaster_id: this.user.id,
                    }),
                    'PATCH',
                    {
                        game_id: category_id,
                        title: title,
                    }
                )

                return true
            } catch (e) {
                console.error('Twitch', `setDescription({${category_id}, ${title}})`, e)
                return false
            }
        }

        this.getStatus = async () => {
            //https://dev.twitch.tv/docs/api/reference#get-streams
            try {
                const resp = await fetchAPI(
                    'streams',
                    new URLSearchParams({
                        user_id: this.user.id,
                    })
                )

                if (resp.data.length > 0) return resp.data[0]
                else return undefined
            } catch (e) {
                console.error('Twitch', `getStatus()`, e)
                return undefined
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
