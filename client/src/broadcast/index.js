import React from 'react'
import {
    Header,
    Aside,
    Main,
    Div,
    Footer,
    Article,
    Ul,
    CommonProps,
    Li,
} from '../components'
import './index.scss'

class Broadcast extends React.Component {
    render() {
        return (
            <CommonProps of='broadcast'>
                <Header
                    flex
                    fixsize
                    flex-justify='space-between'
                    flex-align='center'
                    border-bottom='normal'
                    height='8'>
                    <Div flex fixsize padding-left='1'>
                        <input type='text' defaultValue='Just Chatting' />
                        <button>수정</button>
                        <button>삭제</button>
                    </Div>
                    <Div fixsize padding-right='1'>
                        <button>방송 시작</button>
                    </Div>
                </Header>
                <Div flex height='full' width='full'>
                    <Aside
                        flex
                        direction='column'
                        flex-justify='space-between'
                        fixsize
                        width='32'
                        border-right='normal'>
                        <Ul>
                            <Li padding='1' border-bottom='normal'>
                                목록 1
                            </Li>
                            <Li padding='1' border-bottom='normal'>
                                목록 2
                            </Li>
                            <Li padding='1' border-bottom='normal'>
                                목록 3
                            </Li>
                        </Ul>
                        <Ul>
                            <Li padding='1' border-top='normal'>
                                목록 4
                            </Li>
                        </Ul>
                    </Aside>
                    <Main flex direction='column' width='full'>
                        <Article height='full'>화면</Article>
                        <Footer
                            flex
                            fixsize
                            flex-justify='space-between'
                            height='8'
                            border-top='normal'>
                            <Div
                                flex
                                direction='column'
                                flex-justify='center'
                                padding-left='1'>
                                <input type='text' defaultValue='방송제목' />
                                <select>
                                    <option>Just Chatting</option>
                                    <option>Art</option>
                                    <option>ASMR</option>
                                </select>
                            </Div>
                            <Div
                                flex
                                direction='column'
                                flex-justify='center'
                                padding-right='1'
                                align='right'>
                                <div>[] 123</div>
                                <div>12:34:56</div>
                            </Div>
                        </Footer>
                    </Main>
                </Div>
            </CommonProps>
        )
    }
}

export default Broadcast
