import { cloneDeep } from 'lodash'
import React from 'react'
import Connector from '../../connector'
import BI, { assignList, GenerateID } from '../info'
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
                    bottomItem: <li onClick={onClickBottomItem.bind(this)}>장면 전환 설정</li>,
                    onDblClickGenerator: (item, value, onChange) => (e) => {
                        BI().selectScene(value.index)

                        const conn = Connector.getInstance()
                        conn.selectScene(value.index)

                        this.props.changeMode(ItemlistType.OVERLAYS)
                    },
                    isSelected: (idx) => BI().isCurrentScene(idx),
                    onClickItemGenerator: (item, value) => () => {
                        const conn = Connector.getInstance()
                        conn.selectScene(value.index)

                        BI().selectScene(value.index)
                    },
                    onAdd: () => {
                        BI().info.scene.push({
                            name: '새 장면',
                            defaultCategory: 509658,
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
                    bottomItem: <li onClick={onClickBottomItem.bind(this)}>장면 설정</li>,
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
                    isSelected: (idx) => BI().currentScene().overlay.selected === idx,
                    onClickItemGenerator: (item, value) => () => {
                        BI().currentScene().overlay.selected = value.index
                        BI().onChange(true)
                    },
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
            case '':
                return <></>
            default:
                throw new Error('Invalid itemlist mode')
        }

        return (
            <div>
                <nav>
                    <ul>
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
                                        className={selected === true ? 'selected' : null}
                                        onChangeMode={this.props.changeMode}
                                    />
                                )
                            })}
                        </DndProvider>
                        <li
                            style={{
                                display: BI().detectMobileDevice() ? 'none' : null,
                            }}
                            onClick={state.onAdd.bind(this)}>
                            {state.addLabel}
                        </li>
                    </ul>
                    <ul>{state.bottomItem}</ul>
                </nav>
                <PropertyDialog ref={this.propertyDialogRef} />
                <ContextMenu ref={this.contextMenuRef} />
            </div>
        )
    }
}

function Item({ onDblClickGenerator, menu, value, onChange, mode, index, className, onClickItemGenerator }) {
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
                    BI().selectScene(hoverIndex, true)
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
        <li
            ref={ref}
            onContextMenu={onContextMenu}
            className={className}
            style={{
                opacity,
            }}
            data-handler-id={handlerId}
            onDoubleClick={onDblClick}
            onClick={onClick}>
            {value.name}
        </li>
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
        newValue.id = GenerateID()
        newValue.name += ' (복제)'

        if (this.state.mode === ItemlistType.SCENES) {
            newValue.overlay.forEach((v) => {
                v.id = GenerateID()
            })
        }

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
                BI().deleteScene(this.state.list.indexOf(this.state.value))
                return
            case ItemlistType.TRANSITIONS:
                if (this.state.list.length === 1) return alert('최소 1개 이상의 화면전환이 있어야 합니다.')
                BI().selectTransition(0)
                break
            default:
                if (this.state.value.type === OverlayType.WEBCAM) {
                    let conn = Connector.getInstance()
                    conn.detachStream(this.state.value.id, BI().currentScene().id)
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
        if (BI().detectMobileDevice()) return

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
            <dialog
                style={{
                    left: this.state.left,
                    ...(() => {
                        if (this.state.top < document.body.clientHeight * (3 / 4)) return { top: this.state.top }
                        else return { bottom: document.body.clientHeight - this.state.top }
                    })(),
                }}
                open={this.state.open}>
                <div onClick={this.onCopy.bind(this)}>복제</div>
                <div onClick={this.onUpdate.bind(this)}>수정</div>
                <div onClick={this.onDelete.bind(this)}>삭제</div>
            </dialog>
        )
    }
}
