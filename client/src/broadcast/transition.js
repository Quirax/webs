export const TransitionType = Object.freeze({
    PLAIN: 'plain',
    SLIDE: 'slide',
    FADE: 'fade',
})

export const TransitionParam = Object.freeze({
    slide_from: Object.freeze({
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right',
    }),
})

export const TransitionGenerator = (name, type) => {
    let obj = {
        name,
        type,
        id: Math.random().toString(36).substring(2, 11),
        params: {},
    }

    // HACK : 장면 전환 추가

    switch (type) {
        case TransitionType.FADE:
            Object.assign(obj.params, {
                duration: 1000,
            })
            break
        case TransitionType.SLIDE:
            Object.assign(obj.params, {
                duration: 1000,
                slide_from: TransitionParam.slide_from.TOP,
            })
            break
        case TransitionType.PLAIN:
            break
        default:
            throw new Error('Invalid transition type')
    }

    return obj
}

export default function getTransitionEffect(transition, options) {
    if (!transition || !transition.type) return { temp: null, main: null }

    const defaultStyle = { opacity: 1, top: '0%', left: '0%' }

    const common = {
        config: { duration: transition.params?.duration || 0 },
        reset: true,
        ...options,
    }

    switch (transition.type) {
        case TransitionType.PLAIN:
            return {
                main: {
                    ...common,
                    from: {
                        ...defaultStyle,
                        opacity: 0,
                    },
                    to: {
                        ...defaultStyle,
                        opacity: 1,
                    },
                    config: {
                        ...common.config,
                        duration: 0,
                    },
                },
                temp: {
                    ...common,
                    from: {
                        ...defaultStyle,
                        opacity: 1,
                    },
                    to: {
                        ...defaultStyle,
                        opacity: 0,
                    },
                    config: {
                        ...common.config,
                        duration: 0,
                    },
                },
            }
        case TransitionType.SLIDE:
            switch (transition.params.slide_from) {
                case TransitionParam.slide_from.TOP:
                    return {
                        main: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                top: '-100%',
                            },
                            to: {
                                ...defaultStyle,
                                top: '0%',
                            },
                        },
                        temp: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                top: '0%',
                            },
                            to: {
                                ...defaultStyle,
                                top: '100%',
                            },
                        },
                    }
                case TransitionParam.slide_from.BOTTOM:
                    return {
                        main: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                top: '100%',
                            },
                            to: {
                                ...defaultStyle,
                                top: '0%',
                            },
                        },
                        temp: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                top: '0%',
                            },
                            to: {
                                ...defaultStyle,
                                top: '-100%',
                            },
                        },
                    }
                case TransitionParam.slide_from.LEFT:
                    return {
                        main: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                left: '-100%',
                            },
                            to: {
                                ...defaultStyle,
                                left: '0%',
                            },
                        },
                        temp: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                left: '0%',
                            },
                            to: {
                                ...defaultStyle,
                                left: '100%',
                            },
                        },
                    }
                case TransitionParam.slide_from.RIGHT:
                    return {
                        main: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                left: '100%',
                            },
                            to: {
                                ...defaultStyle,
                                left: '0%',
                            },
                        },
                        temp: {
                            ...common,
                            from: {
                                ...defaultStyle,
                                left: '0%',
                            },
                            to: {
                                ...defaultStyle,
                                left: '-100%',
                            },
                        },
                    }
                default:
                    return {
                        main: common,
                        temp: common,
                    }
            }
        case TransitionType.FADE:
            return {
                main: {
                    ...common,
                    from: {
                        ...defaultStyle,
                        opacity: 0,
                    },
                    to: {
                        ...defaultStyle,
                        opacity: 1,
                    },
                },
                temp: {
                    ...common,
                    from: {
                        ...defaultStyle,
                        opacity: 1,
                    },
                    to: {
                        ...defaultStyle,
                        opacity: 0,
                    },
                },
            }
        default:
            return {
                main: common,
                temp: common,
            }
    }
}
