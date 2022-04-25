import React from 'react'
import {
    Header,
    Aside,
    Main,
    Flex,
    Footer,
    Article,
    CommonProps,
} from '../components'
import './index.scss'

class Broadcast extends React.Component {
    render() {
        return (
            <CommonProps of='broadcast'>
                <Header>
                    <div>left</div>
                    <div>right</div>
                </Header>
                <Flex>
                    <Aside>
                        <ul>
                            <li>목록 1</li>
                            <li>목록 2</li>
                            <li>목록 3</li>
                        </ul>
                    </Aside>
                    <Main>
                        <Article>화면</Article>
                        <Footer>
                            <div>left</div>
                            <div>right</div>
                        </Footer>
                    </Main>
                </Flex>
            </CommonProps>
        )
    }
}

export default Broadcast
