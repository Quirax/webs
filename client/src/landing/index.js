import React from 'react'
import './landing.scss'
import Twitch from '../twitch'

export default class Landing extends React.Component {
    constructor() {
        super()

        const query = new URLSearchParams(window.location.search)
        if (query.get('code')) {
            const twitch = Twitch.getInstance()
            return twitch.passAuth(query.get('code'))
        }
    }

    // TODO: Redesign
    render() {
        return (
            <main>
                <button
                    onClick={() => {
                        const twitch = Twitch.getInstance()
                        twitch.requestAuth()
                    }}>
                    트위치로 로그인
                </button>
            </main>
        )
    }
}
