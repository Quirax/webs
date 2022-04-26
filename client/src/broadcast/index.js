import React from 'react'
import {
    Header,
    Aside,
    Main,
    Div,
    Footer,
    Article,
    CommonProps,
} from '../components'
import './index.scss'

class Broadcast extends React.Component {
    render() {
        return (
            <CommonProps of='broadcast'>
                <Header
                    flex
                    fixsize
                    justify='space-between'
                    align='center'
                    border-bottom='normal'
                    height='4'>
                    <Div flex fixsize>
                        <input type='text' defaultValue='Just Chatting' />
                        <button>수정</button>
                        <button>삭제</button>
                    </Div>
                    <Div fixsize>
                        <button>방송 시작</button>
                    </Div>
                </Header>
                <Div flex height='full' width='full'>
                    <Aside fixsize width='16' border-right='normal'>
                        <ul>
                            <li>목록 1</li>
                            <li>목록 2</li>
                            <li>목록 3</li>
                        </ul>
                    </Aside>
                    <Main flex direction='column' width='full'>
                        <Article height='full'>화면</Article>
                        <Footer
                            flex
                            fixsize
                            justify='space-between'
                            height='4'
                            border-top='normal'>
                            <div>left</div>
                            <div>right</div>
                        </Footer>
                    </Main>
                </Div>
            </CommonProps>
        )
    }
}

export default Broadcast
