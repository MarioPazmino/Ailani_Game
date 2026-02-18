import { create } from 'zustand'

export const CHARACTERS = {
    ailani: { name: 'Ailani', emoji: '👧🏽', threeColor: 0x8e44ad, hair: 0x2c1810, desc: '7 años · Aventurera' },
    aaylyn: { name: 'Aaylyn', emoji: '👧🏾', threeColor: 0x7b1fa2, hair: 0x1a1005, desc: 'Hermana · Valiente' },
    carolina: { name: 'Carolina', emoji: '👩🏽', threeColor: 0xe91e63, hair: 0x2c1810, desc: 'Mamá · Cariñosa' },
}

export const useGameStore = create((set, get) => ({
    character: 'ailani',
    setCharacter: (c) => set({ character: c }),

    screen: 'start',
    startGame: () => set({ screen: 'game' }),

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
