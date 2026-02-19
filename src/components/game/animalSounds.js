/*
  Animal sounds — uses real MP3 files from /animals/sonidos/
  Each animal plays its sound when the player is nearby, with a cooldown.
*/

import vacaUrl from './animals/sonidos/vaca.mp3'
import polloUrl from './animals/sonidos/pollo.mp3'
import chanchoUrl from './animals/sonidos/chancho.mp3'
import ovejaUrl from './animals/sonidos/oveja.mp3'
import caballoUrl from './animals/sonidos/caballo.mp3'

function playSound(url, volume = 0.4) {
    const audio = new Audio(url)
    audio.volume = volume
    audio.play().catch(() => { })
}

export function playCowSound() { playSound(vacaUrl) }
export function playChickenSound() { playSound(polloUrl) }
export function playPigSound() { playSound(chanchoUrl) }
export function playSheepSound() { playSound(ovejaUrl) }
export function playHorseSound() { playSound(caballoUrl) }
