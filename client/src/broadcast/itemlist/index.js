import { cloneDeep } from 'lodash'
import React from 'react'
import { Div, Ul, Li, Nav, Dialog } from '../../components'
import Connector from '../connector'
import BI, { assignList } from '../info'
import { OverlayType } from '../overlay'
import PropertyDialog from './property'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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

        assignList(() => {
            this.forceUpdate()
        })
    }

    render() {
        let state = {
            list: [],
            onAdd: (e) => {
                console.log(e, this)
            },
            addLabel: '',
            bottomItem: <></>,
            onDblClickGenerator: () => () => {},
            isSelected: () => false,
            onClickItemGenerator: () => () => {},
        }

        let onClickBottomItem

        switch (this.props.mode) {
            case ItemlistType.SCENES:
                onClickBottomItem = () => {
                    this.props.changeMode(ItemlistType.TRANSITIONS)
                }

                Object.assign(state, {
                    list: BI().info?.scene || [],
                    addLabel: '장면 추가',
                    bottomItem: (
                        <Li
                            padding='8'
                            border-top='normal'
                            align='center'
                            cursor='default'
                            onClick={onClickBottomItem.bind(this)}>
                            장면 전환 설정
                        </Li>
                    ),
                    onDblClickGenerator: (item, value, onChange) => (e) => {
                        BI().selectScene(value.index)

                        const conn = Connector.getInstance()
                        conn.selectScene(value.index)

                        this.props.changeMode(ItemlistType.OVERLAYS)
                    },
                    isSelected: (idx) => BI().isCurrentScene(idx),
                    onClickItemGenerator: (item, value) => () => {
                        BI().selectScene(value.index)

                        const conn = Connector.getInstance()
                        conn.selectScene(value.index)
                    },
                    onAdd: () => {
                        BI().info.scene.push({
                            name: '새 장면',
                            defaultCategory: 'Just Chatting',
                            id: Math.random().toString(36).substring(2, 11),
                            overlay: [],
                        })
                        BI().afterChange()
                    },
                })
                break
            case ItemlistType.TRANSITIONS:
                onClickBottomItem = () => {
                    this.props.changeMode(ItemlistType.SCENES)
                }

                Object.assign(state, {
                    list: BI().info.transition,
                    onAdd: (e) => {
                        if (this.propertyDialogRef) {
                            let dialog = this.propertyDialogRef.current
                            let top = e.clientY
                            let left = e.clientX

                            console.log(dialog)

                            dialog.show(this, ItemlistType.TRANSITIONS, null, top, left, (val) => {
                                BI().info.transition.push(val)
                                BI().afterChange()
                            })
                        }
                    },
                    addLabel: '장면 전환 추가',
                    bottomItem: (
                        <Li
                            padding='8'
                            border-top='normal'
                            align='center'
                            cursor='default'
                            onClick={onClickBottomItem.bind(this)}>
                            장면 설정
                        </Li>
                    ),
                    isSelected: (idx) => BI().isCurrentTransition(idx),
                    onClickItemGenerator: (item, value) => () => {
                        BI().selectTransition(value.index)
                    },
                    onDblClickGenerator: (item, value, onChange) => (e) => {
                        if (this.propertyDialogRef) {
                            let dialog = this.propertyDialogRef.current
                            let top = e.clientY
                            let left = e.clientX

                            dialog.show(item, ItemlistType.TRANSITIONS, value, top, left, (val) => {
                                onChange && onChange(val)
                            })
                        }
                    },
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

                            dialog.show(this, ItemlistType.OVERLAYS, null, top, left, (val) => {
                                BI().currentScene().overlay.push(val)
                                BI().afterChange()
                            })
                        }
                    },
                    addLabel: '오버레이 추가',
                    onDblClickGenerator: (item, value, onChange) => (e) => {
                        if (this.propertyDialogRef) {
                            let dialog = this.propertyDialogRef.current
                            let top = e.clientY
                            let left = e.clientX

                            dialog.show(item, ItemlistType.OVERLAYS, value, top, left, (val) => {
                                onChange && onChange(val)
                            })
                        }
                    },
                })
                break
            default:
                throw new Error('Invalid itemlist mode')
        }

        return (
            <Div
                flex
                style={{
                    userSelect: 'none',
                }}>
                <Nav
                    flex
                    flex-direction='column'
                    flex-justify='space-between'
                    fixsize
                    width='256'
                    border-right='normal'
                    style={{ overflowY: 'auto' }}>
                    <Ul>
                        <DndProvider backend={HTML5Backend}>
                            {state.list.map((v, i) => {
                                let selected = state.isSelected(i)

                                return (
                                    <Item
                                        menu={this.contextMenuRef}
                                        onDblClickGenerator={state.onDblClickGenerator}
                                        onClickItemGenerator={state.onClickItemGenerator}
                                        mode={this.props.mode}
                                        value={v}
                                        key={i}
                                        index={i}
                                        onChange={(val) => {
                                            Object.assign(v, val)
                                            BI().onChange()
                                        }}
                                        style={{
                                            backgroundColor: selected === true ? 'blue' : null,
                                        }}
                                        onChangeMode={this.props.changeMode}
                                    />
                                )
                            })}
                        </DndProvider>
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

function Item({ onDblClickGenerator, menu, value, onChange, mode, index, style, onClickItemGenerator }) {
    const ref = React.useRef(null)
    const [{ handlerId }, drop] = useDrop({
        accept: 'Item',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            }
        },
        hover(item, monitor) {
            if (!ref.current) return

            const dragIndex = item.index
            const hoverIndex = index

            if (dragIndex === hoverIndex) return

            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            const hoverClientY = clientOffset.y - hoverBoundingRect.top

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

            console.log(dragIndex, '->', hoverIndex)

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

            console.log('before move', list)

            let is = list.splice(dragIndex, 1)
            list.splice(hoverIndex, 0, is[0])

            console.log('after move', list)

            item.index = hoverIndex

            BI().onChange(false)
        },
    })

    const [{ draggingId }, drag] = useDrag({
        type: 'Item',
        item: () => ({ id: value.id, index: index }),
        collect: (monitor) => ({
            draggingId: monitor.getItem()?.id,
        }),
        end: (item, monitor) => {
            BI().afterChange()
        },
    })

    drag(drop(ref))

    let onDblClick = null,
        onClick = null

    if (onDblClickGenerator != null) {
        onDblClick = onDblClickGenerator(this, { ...value, index: index }, onChange)
        // onDblClick = onDblClick.bind(this)
    }

    if (onClickItemGenerator != null) {
        onClick = onClickItemGenerator(this, { ...value, index: index }, onChange)
        // onClick = onDblClick.bind(this)
    }

    let onContextMenu = (e) => {
        e.preventDefault()
        if (menu) {
            let mnu = menu.current
            let top = e.clientY
            let left = e.clientX

            mnu.show(
                this,
                mode,
                value,
                () => {
                    onDblClick(e)
                },
                top,
                left
            )
        }
    }
    onContextMenu = onContextMenu.bind(this)

    const opacity = draggingId === value.id ? 0 : 1

    return (
        <Li
            referrer={ref}
            padding='8'
            border-bottom='normal'
            cursor='default'
            selected={value.selected}
            onContextMenu={onContextMenu}
            style={{
                ...style,
                opacity,
            }}
            data-handler-id={handlerId}
            onDoubleClick={onDblClick}
            onClick={onClick}>
            {value.name}
        </Li>
    )
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
        switch (this.state.mode) {
            case ItemlistType.SCENES:
                if (this.state.list.length === 1) return alert('최소 1개 이상의 장면이 있어야 합니다.')
                BI().selectScene(0)
                break
            case ItemlistType.TRANSITIONS:
                if (this.state.list.length === 1) return alert('최소 1개 이상의 화면전환이 있어야 합니다.')
                BI().selectTransition(0)
                break
            default:
                if (this.state.value.type === OverlayType.WEBCAM) {
                    let conn = Connector.getInstance()
                    conn.detachDisplayStream(this.state.value.id)
                }

                break
        }

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
            mode: mode,
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
