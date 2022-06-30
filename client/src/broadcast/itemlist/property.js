import React from 'react'
import {
    Div,
    Form,
    P,
    Button,
    Dialog,
    Details as DetailsView,
    Summary,
    TR,
    TD,
    Input,
    Label,
    Textarea,
    Table,
} from '../../components'
import BI from '../info'
import { OverlayGenerator, OverlayParam, OverlayType } from '../overlay'
import { cloneDeep } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faAlignJustify,
    faBold,
    faItalic,
    faStrikethrough,
    faUnderline,
    faFont,
} from '@fortawesome/free-solid-svg-icons'

export default class PropertyDialog extends React.Component {
    constructor() {
        super()

        this.state = {
            top: 200,
            left: 200,
            target: null,
            open: false,
            value: null,
            onChange: () => {},
        }

        this.isFocusing = false

        this.onClick = () => {
            if (!this) return
            if (!this.isFocusing) {
                if (this.state.open) {
                    this.state.onChange(this.state.originalValue)
                    BI().afterChange()
                }
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
        window.addEventListener('mousedown', this.onClick)
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.onClick)
    }

    show(target, value, top, left, onChange) {
        console.log(target, value)
        this.setState({
            top: top,
            left: left + 8,
            target: target,
            open: true,
            value: value,
            originalValue: cloneDeep(value),
            onChange: onChange,
        })
    }

    render() {
        let formContent = <></>

        if (this.state.value === null) {
            formContent = (
                <Form>
                    <Div padding='8'>어떤 오버레이를 만드시겠습니까?</Div>
                    <Div padding='8'>
                        <Button
                            width='100%'
                            onClick={(e) => {
                                this.state.onChange(OverlayGenerator('새 텍스트 오버레이', OverlayType.TEXT))
                                this.leaveFocus(e)
                            }}>
                            <FontAwesomeIcon icon={faFont} /> 텍스트
                        </Button>
                    </Div>
                </Form>
            )
        } else {
            formContent = (
                <Form>
                    <Div padding='8'>
                        <P>
                            이름:{' '}
                            <input
                                type='text'
                                value={this.state.value ? this.state.value.name : ''}
                                onChange={(e) => {
                                    let v = this.state.value
                                    v.name = e.target.value
                                    this.state.onChange(v)
                                }}
                            />
                        </P>
                    </Div>
                    <Div padding='8' border-top='normal' border-bottom='normal'>
                        <ParamList
                            value={this.state.value}
                            onChange={(val) => {
                                this.state.onChange(val)
                            }}
                        />
                    </Div>
                    <Div>
                        <Button
                            width='50%'
                            onClick={(e) => {
                                this.state.onChange(this.state.value)
                                BI().afterChange()
                                this.leaveFocus(e)
                            }}>
                            저장
                        </Button>
                        <Button
                            width='50%'
                            onClick={(e) => {
                                // TODO: Cancel update
                                this.state.onChange(this.state.originalValue)
                                BI().afterChange()
                                this.leaveFocus(e)
                            }}>
                            취소
                        </Button>
                    </Div>
                </Form>
            )
        }

        return (
            <Dialog
                position='fixed'
                top={64}
                left={256}
                border='normal'
                background='white'
                open={this.state.open}
                z-index={10}
                onMouseDown={this.setFocus}
                style={{
                    overflowY: 'auto',
                }}
                height={document.body.clientHeight - 64}>
                {formContent}
            </Dialog>
        )
    }
}

function ParamList(props) {
    const commonParams = (
        <>
            <Details title='공통'>
                <Params>
                    <Arg
                        name='넘칠 때'
                        type={ArgTypes.COMBOBOX}
                        default={props.value?.params.overflow}
                        onChange={(val) => {
                            props.value && (props.value.params.overflow = val)
                            props.onChange && props.onChange(props.value)
                        }}>
                        <option value={OverlayParam.overflow.HIDDEN}>숨김</option>
                        <option value={OverlayParam.overflow.SHOW}>표시</option>
                    </Arg>
                    <Arg
                        name='배경색'
                        type={ArgTypes.COLOR}
                        default={props.value?.params.background_color}
                        onChange={(val) => {
                            props.value && (props.value.params.background_color = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='배경 투명도'
                        type={ArgTypes.SLIDER}
                        min={0}
                        max={1}
                        step={0.01}
                        default={props.value?.params.background_opacity}
                        onChange={(val) => {
                            props.value && (props.value.params.background_opacity = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='전체 투명도'
                        type={ArgTypes.SLIDER}
                        min={0}
                        max={1}
                        step={0.01}
                        default={props.value?.params.opacity}
                        onChange={(val) => {
                            props.value && (props.value.params.opacity = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='현재 비율 유지'
                        type={ArgTypes.CHECKBOX}
                        default={props.value?.params.aspect_ratio}
                        onChange={(val) => {
                            props.value && (props.value.params.aspect_ratio = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='모서리 곡률 반경'
                        type={ArgTypes.NUMBER}
                        min={0}
                        unit='px'
                        default={props.value?.params.radius}
                        onChange={(val) => {
                            props.value && (props.value.params.radius = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                </Params>
            </Details>
            <Details title='테두리'>
                <Params>
                    <Arg
                        name='형태'
                        type={ArgTypes.COMBOBOX}
                        default={props.value?.params.border_style}
                        onChange={(val) => {
                            props.value && (props.value.params.border_style = val)
                            props.onChange && props.onChange(props.value)
                        }}>
                        <option value={OverlayParam.border_style.NONE}>없음</option>
                        <option value={OverlayParam.border_style.SOLID}>직선 (-----)</option>
                        <option value={OverlayParam.border_style.DOUBLE}>겹선 (=====)</option>
                        <option value={OverlayParam.border_style.DOTTED}>점선 (&middot; &middot; &middot;)</option>
                        <option value={OverlayParam.border_style.DASHED}>점선 (- - -)</option>
                        <option value={OverlayParam.border_style.GROOVE}>파인 테두리</option>
                        <option value={OverlayParam.border_style.RIDGE}>튀어나온 테두리</option>
                        <option value={OverlayParam.border_style.INSET}>파인 경사</option>
                        <option value={OverlayParam.border_style.OUTSET}>튀어나온 경사</option>
                    </Arg>
                    <Arg
                        name='두께'
                        type={ArgTypes.NUMBER}
                        min={0}
                        unit='px'
                        default={props.value?.params.border_width}
                        onChange={(val) => {
                            props.value && (props.value.params.border_width = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='색'
                        type={ArgTypes.COLOR}
                        default={props.value?.params.border_color}
                        onChange={(val) => {
                            props.value && (props.value.params.border_color = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='투명도'
                        type={ArgTypes.SLIDER}
                        min={0}
                        max={1}
                        step={0.01}
                        default={props.value?.params.border_opacity}
                        onChange={(val) => {
                            props.value && (props.value.params.border_opacity = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                </Params>
            </Details>
            <Details title='여백'>
                <Params>
                    <Arg
                        name='테두리 바깥쪽'
                        type={ArgTypes.NUMBER}
                        unit='px'
                        min={0}
                        default={props.value?.params.margin}
                        onChange={(val) => {
                            props.value && (props.value.params.margin = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                    <Arg
                        name='테두리 안쪽'
                        type={ArgTypes.NUMBER}
                        min={0}
                        unit='px'
                        default={props.value?.params.padding}
                        onChange={(val) => {
                            props.value && (props.value.params.padding = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                </Params>
            </Details>
        </>
    )

    let preCommonParams = <></>
    let postCommonParams = <></>

    switch (props.value?.type) {
        case OverlayType.TEXT:
            preCommonParams = (
                <Params>
                    <Arg
                        type={ArgTypes.TEXTAREA}
                        default={props.value?.params.text}
                        placeholder='표시할 내용을 입력하십시오.'
                        onChange={(val) => {
                            props.value && (props.value.params.text = val)
                            props.onChange && props.onChange(props.value)
                        }}
                    />
                </Params>
            )
            postCommonParams = (
                <>
                    <Details title='글꼴'>
                        <Params>
                            <Arg
                                name='글꼴'
                                type={ArgTypes.COMBOBOX}
                                onChange={(val) => {
                                    // props.value && (props.value.params.overflow_y = val)
                                    // props.onChange && props.onChange(props.value)
                                }}>
                                {/* TODO: 글꼴 목록 반영 */}
                                <option>굴림</option>
                            </Arg>
                            <Arg
                                name='크기'
                                type={ArgTypes.NUMBER}
                                default={props.value?.params.font_size}
                                min={0}
                                unit='pt'
                                onChange={(val) => {
                                    props.value && (props.value.params.font_size = val)
                                    props.onChange && props.onChange(props.value)
                                }}
                            />
                            <Arg
                                type={ArgTypes.BUTTONS}
                                multiple
                                default={props.value?.params.font_flags}
                                onChange={(val) => {
                                    props.value && (props.value.params.font_flags = val)
                                    props.onChange && props.onChange(props.value)
                                }}>
                                <option value={OverlayParam.font_flags.BOLD}>
                                    <FontAwesomeIcon icon={faBold} />
                                </option>
                                <option value={OverlayParam.font_flags.ITALIC}>
                                    <FontAwesomeIcon icon={faItalic} />
                                </option>
                                <option value={OverlayParam.font_flags.UNDERLINE}>
                                    <FontAwesomeIcon icon={faUnderline} />
                                </option>
                                <option value={OverlayParam.font_flags.STRIKE}>
                                    <FontAwesomeIcon icon={faStrikethrough} />
                                </option>
                            </Arg>
                            <Arg
                                name='색'
                                type={ArgTypes.COLOR}
                                default={props.value?.params.font_color}
                                onChange={(val) => {
                                    props.value && (props.value.params.font_color = val)
                                    props.onChange && props.onChange(props.value)
                                }}
                            />
                            <Arg
                                name='투명도'
                                type={ArgTypes.SLIDER}
                                min={0}
                                max={1}
                                step={0.01}
                                default={props.value?.params.font_opacity}
                                onChange={(val) => {
                                    props.value && (props.value.params.font_opacity = val)
                                    props.onChange && props.onChange(props.value)
                                }}
                            />
                        </Params>
                    </Details>
                    <Details title='문단'>
                        <Params>
                            <Arg
                                name='가로 정렬'
                                type={ArgTypes.BUTTONS}
                                default={props.value?.params.text_align_horizontal}
                                onChange={(val) => {
                                    props.value && (props.value.params.text_align_horizontal = val)
                                    props.onChange && props.onChange(props.value)
                                }}>
                                <option value={OverlayParam.text_align_horizontal.LEFT}>
                                    <FontAwesomeIcon icon={faAlignLeft} />
                                </option>
                                <option value={OverlayParam.text_align_horizontal.CENTER}>
                                    <FontAwesomeIcon icon={faAlignCenter} />
                                </option>
                                <option value={OverlayParam.text_align_horizontal.RIGHT}>
                                    <FontAwesomeIcon icon={faAlignRight} />
                                </option>
                                <option value={OverlayParam.text_align_horizontal.JUSTIFY}>
                                    <FontAwesomeIcon icon={faAlignJustify} />
                                </option>
                            </Arg>
                            <Arg
                                name='세로 정렬'
                                type={ArgTypes.COMBOBOX}
                                default={props.value?.params.text_align_vertical}
                                onChange={(val) => {
                                    props.value && (props.value.params.text_align_vertical = val)
                                    props.onChange && props.onChange(props.value)
                                }}>
                                <option value={OverlayParam.text_align_vertical.TOP}>T</option>
                                <option value={OverlayParam.text_align_vertical.MIDDLE}>M</option>
                                <option value={OverlayParam.text_align_vertical.BOTTOM}>B</option>
                            </Arg>
                            <Arg
                                name='줄 높이'
                                prefix='텍스트의'
                                type={ArgTypes.NUMBER}
                                default={props.value?.params.text_line_height}
                                step={0.25}
                                min={1.0}
                                unit='배'
                                onChange={(val) => {
                                    props.value && (props.value.params.text_line_height = val)
                                    props.onChange && props.onChange(props.value)
                                }}
                            />
                        </Params>
                    </Details>
                </>
            )
            break
        default:
    }

    return (
        <>
            {preCommonParams}
            {commonParams}
            {postCommonParams}
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
        <Table width='100%'>
            <tbody>{props.children}</tbody>
        </Table>
    )
}

class Arg extends React.Component {
    constructor() {
        super()
    }

    render() {
        let value = this.props.default

        return (
            <TR>
                {this.props.name ? (
                    <TD padding='8' align='right'>
                        {this.props.name}
                    </TD>
                ) : (
                    <></>
                )}
                <TD padding='8' align={this.props.name ? 'left' : 'center'} colSpan={this.props.name ? null : 2}>
                    {this.props.prefix ? this.props.prefix + ' ' : ''}
                    {(() => {
                        switch (this.props.type) {
                            case ArgTypes.BUTTONS:
                                const radioName = Math.random().toString(36).substring(2, 11)
                                return (
                                    <>
                                        {this.props.children?.map((v, i) => {
                                            let onchange = (value) => {
                                                let val = this.props.default
                                                if (this.props.multiple) {
                                                    val && (val[v.props.value] = value)
                                                } else val = value

                                                this.props.onChange && this.props.onChange(val)
                                            }

                                            onchange.bind(this)

                                            return (
                                                <ArgButton
                                                    key={i}
                                                    radioName={radioName}
                                                    value={v.props.value}
                                                    label={v.props.children}
                                                    multiple={this.props.multiple}
                                                    checked={
                                                        value && this.props.multiple
                                                            ? value[v.props.value]
                                                            : value === v.props.value
                                                    }
                                                    onChange={onchange}
                                                />
                                            )
                                        }, this)}
                                    </>
                                )
                            case ArgTypes.CHECKBOX:
                                return (
                                    <input
                                        type='checkbox'
                                        checked={value || false}
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e.target.checked)
                                        }}
                                    />
                                )
                            case ArgTypes.COLOR:
                                return (
                                    <input
                                        type='color'
                                        value={value || '#000000'}
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e.target.value)
                                        }}
                                    />
                                )
                            case ArgTypes.COMBOBOX:
                                return (
                                    <select
                                        value={value}
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e.target.value)
                                        }}>
                                        {this.props.children}
                                    </select>
                                )
                            case ArgTypes.NUMBER:
                                return (
                                    <Input
                                        type='number'
                                        value={value || 0}
                                        step={this.props.step}
                                        min={this.props.min}
                                        max={this.props.max}
                                        width='56'
                                        align='right'
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e.target.value)
                                        }}
                                    />
                                )
                            case ArgTypes.SLIDER:
                                return (
                                    <>
                                        <input
                                            type='range'
                                            value={value || 0}
                                            step={this.props.step}
                                            min={this.props.min}
                                            max={this.props.max}
                                            onInput={(e) => {
                                                e.target.nextElementSibling.value = e.target.value
                                            }}
                                            onChange={(e) => {
                                                this.props.onChange && this.props.onChange(e.target.value)
                                            }}
                                        />
                                        <output>{value || 0}</output>
                                    </>
                                )
                            case ArgTypes.TEXTAREA:
                                return (
                                    <Textarea
                                        value={value || ''}
                                        width='100%'
                                        autoresize='true'
                                        style={{
                                            resize: 'none',
                                        }}
                                        minrows={3}
                                        onChange={(e) => {
                                            this.props.onChange && this.props.onChange(e.target.value)
                                        }}
                                    />
                                )
                            default:
                                return <></>
                        }
                    })()}
                    {this.props.unit ? ' ' + this.props.unit : ''}
                </TD>
            </TR>
        )
    }
}

const ArgTypes = {
    COMBOBOX: 'combobox',
    COLOR: 'color',
    CHECKBOX: 'checkbox',
    NUMBER: 'number',
    BUTTONS: 'buttons',
    SLIDER: 'slider',
    TEXTAREA: 'textarea',
}

Object.freeze(ArgTypes)

function ArgButton(props) {
    const radioID = Math.random().toString(36).substring(2, 11)

    return (
        <>
            <Input
                type={props.multiple ? 'checkbox' : 'radio'}
                name={props.radioName}
                id={radioID}
                value={props.value}
                checked={props.checked}
                onChange={(e) => {
                    props.onChange(props.multiple ? e.target.checked : props.value)
                }}
                display='none'
            />
            <Label
                htmlFor={radioID}
                name={props.radioName}
                padding='8'
                border='normal'
                margin-right='-1'
                display='inline-block'
                width='32'
                align='center'
                background={props.checked ? 'black' : ''}>
                {props.label || ''}
            </Label>
        </>
    )
}
