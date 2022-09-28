export default class Twitch {
    static instance = null

    constructor() {
        let accessToken = ''
        let expiredDate = new Date()

        this.connect = async () => {
            if (expiredDate > new Date()) return true

            try {
                const resp = await fetch('https://id.twitch.tv/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.REACT_APP_CLIENT_ID,
                        client_secret: process.env.REACT_APP_CLIENT_SECRET,
                        grant_type: 'client_credentials',
                    }),
                })
                const resp_json = await resp.json()

                accessToken = resp_json.access_token
                expiredDate = new Date()
                expiredDate.setTime(expiredDate.getTime() + resp_json.expires_in * 1000)
                return true
            } catch (e) {
                console.error('Twitch', 'connect', e)
                return false
            }
        }

        this.searchCategories = async (query) => {
            if (expiredDate > new Date()) this.connect()

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
}
