import React from 'react'
import {
    Div,
    Ul,
    Li,
    Nav,
    Form,
    P,
    Button,
    Dialog,
    Details as DetailsView,
    Summary,
} from '../../components'
import BI from '../info'
import { OverlayType } from '../overlay'

export default class PropertyDialog extends React.Component {
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
                            <select defaultValue={this.state.value?.type}>
                                <option value={OverlayType.TEXT}>텍스트</option>
                                <option>기타</option>
                            </select>
                        </P>
                    </Div>
                    <Div padding='8' border-top='normal' border-bottom='normal'>
                        <ParamList />
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

function ParamList(props) {
    return (
        <>
            <Details title='공통'>
                <Params>
                    <Arg
                        name='가로로 넘치는 부분을'
                        type={ArgTypes.COMBOBOX} /* [숨김] */
                    />
                    <Arg
                        name='세로로 넘치는 부분을'
                        type={ArgTypes.COMBOBOX} /* [숨김] */
                    />
                    <Arg name='배경색' type={ArgTypes.COLOR} />
                    <Arg
                        name='현재 비율 유지'
                        type={ArgTypes.CHECKBOX}
                        default={false}
                    />
                    <Arg
                        name='모서리 곡률 반경'
                        type={ArgTypes.NUMBER}
                        unit='px'
                    />
                </Params>
            </Details>
            <Details title='테두리'>
                <Params>
                    <Arg name='색' type={ArgTypes.COLOR} />
                    <Arg name='두께' type={ArgTypes.NUMBER} unit='px' />
                    <Arg name='형태' type={ArgTypes.COMBOBOX} /* [직선] */ />
                </Params>
            </Details>
            <Details title='여백'>
                <Params>
                    <Arg
                        name='테두리 바깥쪽'
                        type={ArgTypes.NUMBER}
                        unit='px'
                    />
                    <Arg name='테두리 안쪽' type={ArgTypes.NUMBER} unit='px' />
                </Params>
            </Details>
            <Details title='글꼴'>
                <Params>
                    <Arg name='글꼴' type={ArgTypes.COMBOBOX} /* [굴림] */ />
                    <Arg
                        name='크기'
                        type={ArgTypes.NUMBER}
                        default={12}
                        unit='pt'
                    />
                    <Arg type={ArgTypes.BUTTONS} /* [B][I][U][S] */ />
                </Params>
            </Details>
            <Details title='문단'>
                <Params>
                    <Arg
                        name='가로 정렬'
                        type={ArgTypes.BUTTONS} /* [L][C][R][J] */
                    />
                    <Arg
                        name='세로 정렬'
                        type={ArgTypes.BUTTONS} /* [T][M][B] */
                    />
                    <Arg
                        name='줄 높이'
                        prefix='텍스트의'
                        type={ArgTypes.NUMBER}
                        default={1.0}
                        unit='배'
                    />
                </Params>
            </Details>
        </>
    )
}

function Details(props) {
    return (
        <DetailsView
            padding-top='8'
            padding-bottom='8'
            border-top='normal'
            border-bottom='normal'
            margin-top='-1'
            margin-bottom='-1'
            cursor='default'
            onToggle={(e) => {
                if (!e.target.open) return

                const details = document.querySelectorAll('details')
                details.forEach((d) => {
                    if (d === e.target) return
                    d.open = false
                })
            }}>
            <Summary>{props.title}</Summary>
            <Div margin-top='8'>{props.children}</Div>
        </DetailsView>
    )
}

function Params(props) {
    return (
        <table>
            <tbody>{props.children}</tbody>
        </table>
    )
}

function Arg(props) {
    return (
        <tr>
            {props.name ? <td>{props.name}</td> : <></>}
            <td colSpan={props.name ? null : 2}>
                {props.prefix ? props.prefix + ' ' : ''}
                {(() => {
                    switch (props.type) {
                        case ArgTypes.BUTTONS:
                            return '[][][][]'
                        case ArgTypes.CHECKBOX:
                            return (
                                <input
                                    type='checkbox'
                                    defaultChecked={props.default}
                                />
                            )
                        case ArgTypes.COLOR:
                            return '[#00000000]'
                        case ArgTypes.COMBOBOX:
                            return '[]'
                        case ArgTypes.NUMBER:
                            return '[0]'
                    }
                })()}
                {props.unit ? ' ' + props.unit : ''}
            </td>
        </tr>
    )
}

const ArgTypes = {
    COMBOBOX: 'combobox',
    COLOR: 'color',
    CHECKBOX: 'checkbox',
    NUMBER: 'number',
    BUTTONS: 'buttons',
}

Object.freeze(ArgTypes)
