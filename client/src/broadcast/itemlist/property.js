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
                            ??????:{' '}
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
                            ??????:{' '}
                            <select defaultValue={this.state.value?.type}>
                                <option value={OverlayType.TEXT}>?????????</option>
                                <option>??????</option>
                            </select>
                        </P>
                    </Div>
                    <Div padding='8' border-top='normal' border-bottom='normal'>
                        <ParamList />
                    </Div>
                    <Div>
                        <Button width='50%' onClick={this.leaveFocus}>
                            ??????
                        </Button>
                        <Button width='50%' onClick={this.leaveFocus}>
                            ??????
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
            <Details title='??????'>
                <Params>
                    <Arg name='????????? ????????? ?????????' /* [??????] */ />
                    <Arg name='????????? ????????? ?????????' /* [??????] */ />
                    <Arg name='?????????' /* [#00000000] */ />
                    <Arg name='?????? ?????? ??????' /* [-] */ />
                    <Arg name='????????? ?????? ??????' /* [0] */ unit='px' />
                </Params>
            </Details>
            <Details title='?????????'>
                <Params>
                    <Arg name='???' /* [#00000000] */ />
                    <Arg name='??????' /* [0] */ unit='px' />
                    <Arg name='??????' /* [??????] */ />
                </Params>
            </Details>
            <Details title='??????'>
                <Params>
                    <Arg name='????????? ?????????' /* [0] */ unit='px' />
                    <Arg name='????????? ??????' /* [0] */ unit='px' />
                </Params>
            </Details>
            <Details title='??????'>
                <Params>
                    <Arg name='??????' /* [??????] */ />
                    <Arg name='??????' /* [12] */ unit='pt' />
                    <Arg /* [B][I][U][S] */ />
                </Params>
            </Details>
            <Details title='??????'>
                <Params>
                    <Arg name='?????? ??????' /* [L][C][R][J] */ />
                    <Arg name='?????? ??????' /* [T][M][B] */ />
                    <Arg name='??? ??????' prefix='????????????' /* [0] */ unit='???' />
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
                {props.prefix ? props.prefix + ' ' : ''}[]
                {props.unit ? ' ' + props.unit : ''}
            </td>
        </tr>
    )
}
