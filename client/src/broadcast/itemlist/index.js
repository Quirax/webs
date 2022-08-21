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
        }

        let onClickBottomItem

        switch (this.props.mode) {
            case ItemlistType.SCENES:
                // TODO : addScene
                // TODO : select scene on click

                onClickBottomItem = () => {
                    this.props.changeMode(ItemlistType.TRANSITIONS)
                }

                Object.assign(state, {
                    list: BI().info.scene,
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
                        console.log('a', BI().currentScene())
                        this.props.changeMode(ItemlistType.OVERLAYS)
                    },
                    isSelected: (idx) => BI().isCurrentScene(idx),
                })
                break
            case ItemlistType.TRANSITIONS:
                onClickBottomItem = () => {
                    this.props.changeMode(ItemlistType.SCENES)
                }

                Object.assign(state, {
                    list: BI().info.transition,
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
                    onDblClickGenerator: (item, value, onChange) => (e) => {
                        if (this.propertyDialogRef) {
                            let dialog = this.propertyDialogRef.current
                            let top = e.clientY
                            let left = e.clientX

                            dialog.show(item, value, top, left, (val) => {
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
                onMouseMove={(e) => {
                    getSelection().empty()
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

                                // TODO : onclick event support

                                return (
                                    <Item
                                        menu={this.contextMenuRef}
                                        onDblClickGenerator={state.onDblClickGenerator}
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

function Item({ onDblClickGenerator, menu, value, onChange, mode, index, style }) {
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

    let onDblClick = null

    if (onDblClickGenerator != null) {
        onDblClick = onDblClickGenerator(this, { ...value, index: index }, onChange)
        // onDblClick = onDblClick.bind(this)
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

    // TODO : onclick event support

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
            onDoubleClick={onDblClick}>
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
        if (this.state.value.type === OverlayType.WEBCAM) {
            let conn = Connector.getInstance()

            conn.detachDisplayStream(this.state.value.id)
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
