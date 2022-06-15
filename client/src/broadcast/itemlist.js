import React from 'react'
import {
    Header,
    Main,
    Div,
    Footer,
    Article,
    Ul,
    CommonProps,
    Li,
    Nav,
    Form,
    P,
    Button,
    Dialog,
} from '../components'

export default class Itemlist extends React.Component {
    static SCENES = 0
    static TRANSITIONS = 1
    static OVERLAYS = 2

    constructor() {
        super()

        this.contextMenuRef = React.createRef()
        this.propertyDialogRef = React.createRef()
    }

    render() {
        return (
            <>
                <Nav
                    flex
                    flex-direction='column'
                    flex-justify='space-between'
                    fixsize
                    width='256'
                    border-right='normal'>
                    <Ul>
                        {this.props.list.map((v, i) => (
                            <Item
                                menu={this.contextMenuRef}
                                propertyDialog={this.propertyDialogRef}
                                value={v}
                                key={i}
                            />
                        ))}
                        <Li
                            padding='8'
                            border-bottom='normal'
                            align='center'
                            cursor='default'>
                            {(() => {
                                switch (this.props.mode) {
                                    case Itemlist.SCENES:
                                        return '장면 추가'
                                    case Itemlist.TRANSITIONS:
                                        return '장면 전환 추가'
                                    case Itemlist.OVERLAYS:
                                        return '오버레이 추가'
                                    default:
                                        throw 'Invalid itemlist mode'
                                }
                            })()}
                        </Li>
                    </Ul>
                    <Ul>
                        {(() => {
                            switch (this.props.mode) {
                                case Itemlist.SCENES:
                                    return (
                                        <Li
                                            padding='8'
                                            border-top='normal'
                                            align='center'
                                            cursor='default'>
                                            장면 전환 설정
                                        </Li>
                                    )
                                case Itemlist.TRANSITIONS:
                                    return (
                                        <Li
                                            padding='8'
                                            border-top='normal'
                                            align='center'
                                            cursor='default'>
                                            장면 설정
                                        </Li>
                                    )
                                case Itemlist.OVERLAYS:
                                    return <></>
                                default:
                                    throw 'Invalid itemlist mode'
                            }
                        })()}
                    </Ul>
                </Nav>
                <PropertyDialog ref={this.propertyDialogRef} />
                <ContextMenu ref={this.contextMenuRef} />
            </>
        )
    }
}

class Item extends React.Component {
    constructor() {
        super()

        this.onContextMenu = this.onContextMenu.bind(this)
        this.onDblClick = this.onDblClick.bind(this)
    }

    onDblClick(e) {
        if (this.props.propertyDialog) {
            let dialog = this.props.propertyDialog.current
            let top = e.clientY
            let left = e.clientX

            dialog.show(this, this.props.value, top, left)
        }
    }

    onContextMenu(e) {
        e.preventDefault()
        if (this.props.menu) {
            let menu = this.props.menu.current
            let top = e.clientY
            let left = e.clientX

            menu.show(this, top, left)
        }
    }
    render() {
        return (
            <Li
                padding='8'
                border-bottom='normal'
                cursor='default'
                selected={this.props.value.selected}
                onContextMenu={this.onContextMenu}
                onDoubleClick={this.onDblClick}>
                {this.props.value.name}
            </Li>
        )
    }
}

class ContextMenu extends React.Component {
    constructor() {
        super()

        this.state = {
            top: 100,
            left: 100,
            target: null,
            open: false,
        }

        this.onClick = () => {
            if (this) {
                this.setState({
                    open: false,
                })
            }
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick)
    }

    show(target, top, left) {
        this.setState({
            top: top,
            left: left,
            target: target,
            open: true,
        })
    }

    render() {
        return (
            <Dialog
                position='fixed'
                top={this.state.top}
                left={this.state.left}
                border='normal'
                background='white'
                open={this.state.open}
                z-index={10}>
                <Div padding='8' hover='hover' cursor='default'>
                    복제
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    수정
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    삭제
                </Div>
            </Dialog>
        )
    }
}

class PropertyDialog extends React.Component {
    constructor() {
        super()

        this.state = {
            top: 200,
            left: 200,
            target: null,
            open: false,
            value: null,
        }

        this.isFocusing = false

        this.onClick = () => {
            if (!this) return
            if (!this.isFocusing) {
                this.setState({
                    open: false,
                })
            } else {
                this.isFocusing = false
            }
        }

        this.setFocus = () => {
            this.isFocusing = true
        }
        this.setFocus = this.setFocus.bind(this)

        this.leaveFocus = () => {
            this.isFocusing = false
            this.setState({
                open: false,
            })
        }
        this.leaveFocus = this.leaveFocus.bind(this)
    }

    componentDidMount() {
        window.addEventListener('click', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick)
    }

    show(target, value, top, left) {
        this.setState({
            top: top - 8,
            left: left + 8,
            target: target,
            open: true,
            value: value,
        })
    }

    render() {
        return (
            <Dialog
                position='fixed'
                top={this.state.top}
                left={this.state.left}
                border='normal'
                background='white'
                open={this.state.open}
                z-index={10}
                onClick={this.setFocus}>
                <Div
                    display='inline-block'
                    height='0'
                    width='0'
                    arrow='right'
                    position='absolute'
                    top='-1'
                    left='-16'
                    z-index='-1'
                />
                <Form>
                    <Div padding='8'>
                        <P>
                            이름:{' '}
                            <input
                                type='text'
                                defaultValue={
                                    this.state.value
                                        ? this.state.value.name
                                        : ''
                                }
                            />
                        </P>
                        <P padding-top='8'>
                            종류:{' '}
                            <select>
                                <option>이미지</option>
                                <option>웹 뷰 (URL)</option>
                            </select>
                        </P>
                    </Div>
                    <Div padding='8' border-top='normal' border-bottom='normal'>
                        <P>
                            파일: <input type='file' />
                        </P>
                    </Div>
                    <Div>
                        <Button width='50%' onClick={this.leaveFocus}>
                            저장
                        </Button>
                        <Button width='50%' onClick={this.leaveFocus}>
                            취소
                        </Button>
                    </Div>
                </Form>
            </Dialog>
        )
    }
}
