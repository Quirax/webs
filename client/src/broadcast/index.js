import React from 'react'
import { Header, Aside, Main, Flex, Footer, Article } from '../components'
import './index.scss'

class Broadcast extends React.Component {
    render() {
        return (
            <>
                <Header of='broadcast'>
                    <div>left</div>
                    <div>right</div>
                </Header>
                <Flex of='broadcast'>
                    <Aside of='broadcast'>
                        <ul>
                            <li>목록 1</li>
                            <li>목록 2</li>
                            <li>목록 3</li>
                        </ul>
                    </Aside>
                    <Main of='broadcast'>
                        <Article of='broadcast'>화면</Article>
                        <Footer of='broadcast'>
                            <div>left</div>
                            <div>right</div>
                        </Footer>
                    </Main>
                </Flex>
            </>
        )
    }
}

export default Broadcast
