import { create } from 'zustand'

export const CHARACTERS = {
    ailani: {
        name: 'Ailani', emoji: '👧🏽', desc: '7 años · Aventurera',
        skin: 0xc68642,       // medium tan
        hair: 0x2c1810,       // dark brown
        hairStyle: 'ponytails', // two ponytails
        dress: 0x8e44ad,      // purple dress
        dressAccent: 0xc084fc, // lilac accent
        shoes: 0xe91e63,      // pink shoes
        accessory: 'bow',     // hair bow
        accColor: 0xff69b4,   // pink bow
        blush: 0xe8a0a0,
    },
    aylin: {
        name: 'Aylin', emoji: '👧🏾', desc: 'Hermana · Valiente',
        skin: 0x8d5524,       // darker tan
        hair: 0x1a1005,       // very dark brown
        hairStyle: 'braids',  // braided
        dress: 0x7b1fa2,      // violet dress
        dressAccent: 0xb388ff, // light violet accent
        shoes: 0xfdd835,      // yellow shoes
        accessory: 'headband', // headband
        accColor: 0xfdd835,   // yellow headband
        blush: 0xc07070,
    },
    carolina: {
        name: 'Carolina', emoji: '👩🏽', desc: 'Mamá · Cariñosa',
        skin: 0xc68642,       // medium tan
        hair: 0x2c1810,       // dark brown
        hairStyle: 'long',    // long flowing hair
        dress: 0xe91e63,      // pink dress
        dressAccent: 0xff80ab, // light pink accent
        shoes: 0x8e44ad,      // purple shoes
        accessory: 'earrings',// earrings
        accColor: 0xffd700,   // gold earrings
        blush: 0xe8a0a0,
    },
}

export const useGameStore = create((set, get) => ({
    character: 'ailani',
    setCharacter: (c) => set({ character: c }),

    screen: 'start',
    startGame: () => set({ screen: 'game' }),
    goBack: () => set({ screen: 'start', stars: 0, points: 0 }),
    enterMathWorld: () => set({ screen: 'mathWorld' }),
    leaveMathWorld: () => set({ screen: 'game' }),

    stars: 0,
    points: 0,
    collectStar: () => {
        const s = get()
        set({ stars: s.stars + 1, points: s.points + 20 })
    },

    tooltip: '',
    tooltipTimer: null,
    showTooltip: (text) => {
        const prev = get().tooltipTimer
        if (prev) clearTimeout(prev)
        const timer = setTimeout(() => set({ tooltip: '' }), 1800)
        set({ tooltip: text, tooltipTimer: timer })
    },
}))
