import { cloneDeep } from 'lodash'
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

        this.contextMenuRef = React.createRef()
        this.propertyDialogRef = React.createRef()
    }

    componentDidMount() {
        BI().assignList(this)
    }

    componentDidUpdate() {
        console.log('updated!')
    }

    render() {
        let state = {
            list: [],
            onAdd: (e) => {
                console.log(e, this)
            },
            addLabel: '',
            bottomItem: <></>,
        }

        switch (this.props.mode) {
            case ItemlistType.SCENES:
                Object.assign(state, {
                    list: BI().info.scene,
                    addLabel: '장면 추가',
                    bottomItem: (
                        <Li padding='8' border-top='normal' align='center' cursor='default'>
                            장면 전환 설정
                        </Li>
                    ),
                })
                break
            case ItemlistType.TRANSITIONS:
                Object.assign(state, {
                    list: BI().info.transition,
                    addLabel: '장면 전환 추가',
                    bottomItem: (
                        <Li padding='8' border-top='normal' align='center' cursor='default'>
                            장면 설정
                        </Li>
                    ),
                })
                break
            case ItemlistType.OVERLAYS:
                Object.assign(state, {
                    list: BI().currentScene().overlay,
                    onAdd: (e) => {
                        if (this.propertyDialogRef) {
                            let dialog = this.propertyDialogRef.current
                            let top = e.clientY
                            let left = e.clientX

                            console.log(dialog)

                            dialog.show(this, null, top, left, (val) => {
                                BI().currentScene().overlay.push(val)
                                BI().afterChange()
                            })
                        }
                    },
                    addLabel: '오버레이 추가',
                })
                break
            default:
                throw new Error('Invalid itemlist mode')
        }

        return (
            <Div flex>
                <Nav
                    flex
                    flex-direction='column'
                    flex-justify='space-between'
                    fixsize
                    width='256'
                    border-right='normal'
                    style={{ overflowY: 'auto' }}>
                    <Ul>
                        {state.list.map((v, i) => {
                            return (
                                <Item
                                    menu={this.contextMenuRef}
                                    propertyDialog={this.propertyDialogRef}
                                    mode={this.props.mode}
                                    value={v}
                                    key={i}
                                    onChange={(val) => {
                                        v = val

                                        BI().onChange()
                                    }}
                                />
                            )
                        })}
                        <Li
                            padding='8'
                            border-bottom='normal'
                            align='center'
                            cursor='default'
                            onClick={state.onAdd.bind(this)}>
                            {state.addLabel}
                        </Li>
                    </Ul>
                    <Ul>{state.bottomItem}</Ul>
                </Nav>
                <PropertyDialog ref={this.propertyDialogRef} />
                <ContextMenu ref={this.contextMenuRef} />
            </Div>
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

            menu.show(
                this,
                this.props.mode,
                this.props.value,
                () => {
                    this.onDblClick(e)
                },
                top,
                left
            )
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
            value: {},
            list: [],
            dialogOpener: () => {},
        }

        this.onClick = () => {
            if (this) {
                this.setState({
                    open: false,
                })
            }
        }
    }

    onCopy(e) {
        let newValue = cloneDeep(this.state.value)
        newValue.name += ' (복제)'
        this.state.list.push(newValue)
        BI().afterChange()
    }

    onUpdate(e) {
        this.state.dialogOpener()
    }

    onDelete(e) {
        this.state.list.splice(this.state.list.indexOf(this.state.value), 1)
        BI().afterChange()
    }

    componentDidMount() {
        window.addEventListener('click', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.onClick)
    }

    show(target, mode, value, dialogOpener, top, left) {
        let list = []
        switch (mode) {
            case ItemlistType.SCENES:
                list = BI().info.scene
                break
            case ItemlistType.TRANSITIONS:
                list = BI().info.transition
                break
            case ItemlistType.OVERLAYS:
                list = BI().currentScene().overlay
                break
            default:
                throw new Error('Invalid itemlist mode')
        }
        this.setState({
            top: top,
            left: left,
            target: target,
            value: value,
            open: true,
            list: list,
            dialogOpener: dialogOpener,
        })
    }

    render() {
        return (
            <Dialog
                position='fixed'
                {...(() => {
                    if (this.state.top < document.body.clientHeight * (3 / 4)) return { top: this.state.top }
                    else return { bottom: document.body.clientHeight - this.state.top }
                })()}
                left={this.state.left}
                border='normal'
                background='white'
                open={this.state.open}
                z-index={10}>
                <Div onClick={this.onCopy.bind(this)} padding='8' hover='hover' cursor='default'>
                    복제
                </Div>
                <Div onClick={this.onUpdate.bind(this)} padding='8' border-top='normal' hover='hover' cursor='default'>
                    수정
                </Div>
                <Div onClick={this.onDelete.bind(this)} padding='8' border-top='normal' hover='hover' cursor='default'>
                    삭제
                </Div>
            </Dialog>
        )
    }
}
