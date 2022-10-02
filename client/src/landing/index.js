import React from 'react'
import { Button, Div } from '../components'
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

    render() {
        return (
            <Div height='100%' width='100%' flex flex-align='center' flex-justify='center' flex-direction='column'>
                <Button
                    onClick={() => {
                        const twitch = Twitch.getInstance()
                        twitch.requestAuth()
                    }}>
                    트위치로 로그인
                </Button>
            </Div>
        )
    }
}
