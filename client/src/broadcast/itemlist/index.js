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
                throw 'Invalid itemlist mode'
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
                                />
                            )
                        })}
                        <Li
                            padding='8'
                            border-bottom='normal'
                            align='center'
                            cursor='default'>
                            {(() => {
                                switch (this.props.mode) {
                                    case ItemlistType.SCENES:
                                        return '?????? ??????'
                                    case ItemlistType.TRANSITIONS:
                                        return '?????? ?????? ??????'
                                    case ItemlistType.OVERLAYS:
                                        return '???????????? ??????'
                                    default:
                                        throw 'Invalid itemlist mode'
                                }
                            })()}
                        </Li>
                    </Ul>
                    <Ul>
                        {(() => {
                            switch (this.props.mode) {
                                case ItemlistType.SCENES:
                                    return (
                                        <Li
                                            padding='8'
                                            border-top='normal'
                                            align='center'
                                            cursor='default'>
                                            ?????? ?????? ??????
                                        </Li>
                                    )
                                case ItemlistType.TRANSITIONS:
                                    return (
                                        <Li
                                            padding='8'
                                            border-top='normal'
                                            align='center'
                                            cursor='default'>
                                            ?????? ??????
                                        </Li>
                                    )
                                case ItemlistType.OVERLAYS:
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
        // this.props.value.name = '?????????'
        // BI().onChange()

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
                    ??????
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    ??????
                </Div>
                <Div
                    padding='8'
                    border-top='normal'
                    hover='hover'
                    cursor='default'>
                    ??????
                </Div>
            </Dialog>
        )
    }
}
