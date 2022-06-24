import React from 'react'
import { Div, Ul, Li, Nav, Dialog } from '../../components'
import BI from '../info'
import PropertyDialog from './property'

export const ItemlistType = {
    SCENES: 'scenes',
    TRANSITIONS: 'transitions',
    OVERLAYS: 'overlays',
}

Object.freeze(ItemlistType)

export default class Itemlist extends React.Component {
    constructor() {
        super()

        this.state = {
            list: [],
        }

        this.contextMenuRef = React.createRef()
        this.propertyDialogRef = React.createRef()
    }

    componentDidMount() {
        switch (this.props.mode) {
            case ItemlistType.SCENES:
                this.setState({
                    list: BI().info.scene,
                })
                break
            case ItemlistType.TRANSITIONS:
                this.setState({
                    list: BI().info.transition,
                })
                break
            case ItemlistType.OVERLAYS:
                this.setState({
                    list: BI().currentScene().overlay,
                })
                break
            default:
                throw new Error('Invalid itemlist mode')
        }
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
                        {this.state.list.map((v, i) => {
                            return (
                                <Item
                                    menu={this.contextMenuRef}
                                    propertyDialog={this.propertyDialogRef}
                                    value={v}
                                    key={i}
                                    onChange={(val) => {
                                        v = val

                                        BI().onChange()
                                    }}
                                />
                            )
                        })}
                        <Li padding='8' border-bottom='normal' align='center' cursor='default'>
                            {(() => {
                                switch (this.props.mode) {
                                    case ItemlistType.SCENES:
                                        return '장면 추가'
                                    case ItemlistType.TRANSITIONS:
                                        return '장면 전환 추가'
                                    case ItemlistType.OVERLAYS:
                                        return '오버레이 추가'
                                    default:
                                        throw new Error('Invalid itemlist mode')
                                }
                            })()}
                        </Li>
                    </Ul>
                    <Ul>
                        {(() => {
                            switch (this.props.mode) {
                                case ItemlistType.SCENES:
                                    return (
                                        <Li padding='8' border-top='normal' align='center' cursor='default'>
                                            장면 전환 설정
                                        </Li>
                                    )
                                case ItemlistType.TRANSITIONS:
                                    return (
                                        <Li padding='8' border-top='normal' align='center' cursor='default'>
                                            장면 설정
                                        </Li>
                                    )
                                case ItemlistType.OVERLAYS:
                                    return <></>
                                default:
                                    throw new Error('Invalid itemlist mode')
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

            dialog.show(this, this.props.value, top, left, (val) => {
                this.props.onChange && this.props.onChange(val)
            })
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
                <Div padding='8' border-top='normal' hover='hover' cursor='default'>
                    수정
                </Div>
                <Div padding='8' border-top='normal' hover='hover' cursor='default'>
                    삭제
                </Div>
            </Dialog>
        )
    }
}
