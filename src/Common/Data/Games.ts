import { useService } from '~~/src/Common/Helpers/HService'
import { SLanguage } from '~~/src/Common/Services/SLanguage'

export interface IGame {
    photo: string
    link: string
    title: string
    description: string
}

export const games = (): IGame[] => {
    const lang = useService<SLanguage>('lang')

    return [
        {
            photo: '/static/games/tetris.png',
            link: '/simulator/tetris/',
            title: lang.t('Tetris'),
            description: lang.t(
                '"Tetris" is a puzzle based on the use of geometric figures "tetramino" — a variety of polyominoes...'
            ),
        },
        {
            photo: '/static/games/snake.png',
            link: '/simulator/snake/',
            title: lang.t('Snake'),
            description: lang.t(
                'A computer game that first appeared in the Nokia 6110 push-button phone. Developed by Finnish developer Taneli Armanto'
            ),
        },
        {
            photo: '/static/games/tanks.png',
            link: '/simulator/tanks/',
            title: lang.t('Tanks'),
            description: lang.t(
                'Non-standard implementation of classic tankers, in this version the rivals are more aggressive, they know exactly where you are! And they will seek to destroy you.'
            ),
        },
    ]
}
