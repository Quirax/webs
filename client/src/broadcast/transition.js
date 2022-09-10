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

export default function getTransitionEffect(transition) {
    if (!transition) return null

    const common = {
        config: { duration: transition.params.duration },
        reset: true,
    }

    switch (transition.type) {
        case TransitionType.PLAIN:
            return {
                main: {
                    ...common,
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                    config: {
                        ...common.config,
                        duration: 0,
                    },
                },
                temp: {
                    ...common,
                    from: { opacity: 1 },
                    to: { opacity: 0 },
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
                            from: { top: '-100%' },
                            to: { top: '0%' },
                        },
                        temp: {
                            ...common,
                            from: { top: '0%' },
                            to: { top: '100%' },
                        },
                    }
                case TransitionParam.slide_from.BOTTOM:
                    return {
                        main: {
                            ...common,
                            from: { bottom: '-100%' },
                            to: { bottom: '0%' },
                        },
                        temp: {
                            ...common,
                            from: { bottom: '0%' },
                            to: { bottom: '100%' },
                        },
                    }
                case TransitionParam.slide_from.LEFT:
                    return {
                        main: {
                            ...common,
                            from: { left: '-100%' },
                            to: { left: '0%' },
                        },
                        temp: {
                            ...common,
                            from: { left: '0%' },
                            to: { left: '100%' },
                        },
                    }
                case TransitionParam.slide_from.RIGHT:
                    return {
                        main: {
                            ...common,
                            from: { right: '-100%' },
                            to: { right: '0%' },
                        },
                        temp: {
                            ...common,
                            from: { right: '0%' },
                            to: { right: '100%' },
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
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                temp: {
                    ...common,
                    from: { opacity: 1 },
                    to: { opacity: 0 },
                },
            }
        default:
            return {
                main: common,
                temp: common,
            }
    }
}
