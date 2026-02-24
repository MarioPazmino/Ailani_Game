/**
 * Day/Night cycle system based on REAL local time.
 *
 *  Phase          Hours        sunAngle (0=midnight → 1=noon → 0=midnight)
 *  ───────────    ─────────    ────────
 *  Night          22:00–05:00  0.00
 *  Dawn           05:00–07:00  0.00 → 0.25
 *  Morning        07:00–12:00  0.25 → 1.00
 *  Afternoon      12:00–17:00  1.00 → 0.55
 *  Sunset         17:00–19:30  0.55 → 0.05
 *  Dusk           19:30–22:00  0.05 → 0.00
 *
 * Everything else is derived from `sunAngle` so the whole scene stays in sync.
 */

import * as THREE from 'three'

// ─── helpers ──────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)) }
function lerpColor(c1, c2, t) {
    const a = new THREE.Color(c1)
    const b = new THREE.Color(c2)
    return new THREE.Color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t))
}

// ─── Compute sun angle from decimal hour ──────────────────────────────────────
function sunAngleFromHour(h) {
    // h is 0–24 decimal
    if (h >= 22 || h < 5) return 0                                   // night
    if (h >= 5  && h < 7)  return clamp((h - 5) / 2) * 0.25          // dawn
    if (h >= 7  && h < 12) return 0.25 + clamp((h - 7) / 5) * 0.75   // morning→noon
    if (h >= 12 && h < 17) return 1.0  - clamp((h - 12) / 5) * 0.45  // afternoon
    if (h >= 17 && h < 19.5) return 0.55 - clamp((h - 17) / 2.5) * 0.50 // sunset
    /* 19.5–22 */ return 0.05 - clamp((h - 19.5) / 2.5) * 0.05       // dusk
}

// ─── Phase name (useful for UI) ───────────────────────────────────────────────
export function getPhase(h) {
    if (h >= 22 || h < 5) return 'night'
    if (h >= 5  && h < 7) return 'dawn'
    if (h >= 7  && h < 12) return 'morning'
    if (h >= 12 && h < 17) return 'afternoon'
    if (h >= 17 && h < 19.5) return 'sunset'
    return 'dusk'
}

// ─── Main export: all scene parameters in one call ────────────────────────────
export function getDayNightState() {
    const now = new Date()
    const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
    const angle = sunAngleFromHour(h)  // 0 = deep night, 1 = high noon
    const phase = getPhase(h)
    const isNight = angle < 0.08

    // ── Sun / Moon orbit position ─────────────────────────────────────────────
    // angle 0 → sun below horizon,  angle 1 → sun at top (noon)
    // We map angle → a 0..PI arc but push it below ground when angle<0.1
    const orbitR = 65
    const elevation = clamp((angle - 0.05) / 0.95) * Math.PI  // below horizon when angle<0.05
    const sunX = Math.cos(elevation) * orbitR
    const sunY = angle < 0.05 ? -15 : Math.sin(elevation) * orbitR
    const sunZ = -25

    // Moon is opposite the sun, high arc at night
    const moonElev = clamp(1 - angle * 4) * Math.PI * 0.75  // drops as sun rises
    const moonX = -Math.cos(moonElev * 0.8) * orbitR * 0.9
    const moonY = isNight ? Math.sin(moonElev) * orbitR : -20
    const moonZ = 25

    // ── Sky background color ──────────────────────────────────────────────────
    const nightCol    = new THREE.Color(0x0c1a3a)   // deep blue night
    const dawnCol     = new THREE.Color(0xdba174)    // warm orange dawn
    const dayCol      = new THREE.Color(0x87ceeb)    // classic sky blue
    const sunsetCol   = new THREE.Color(0xd4764e)    // warm sunset
    const duskCol     = new THREE.Color(0x1e2d55)    // blue-purple dusk

    let skyColor
    if (phase === 'night') {
        skyColor = nightCol.clone()
    } else if (phase === 'dawn') {
        const t = clamp((angle) / 0.25)
        skyColor = lerpColor(duskCol, dawnCol, t)
    } else if (phase === 'morning') {
        const t = clamp((angle - 0.25) / 0.75)
        skyColor = lerpColor(dawnCol, dayCol, t)
    } else if (phase === 'afternoon') {
        skyColor = dayCol.clone()
    } else if (phase === 'sunset') {
        const t = clamp((0.55 - angle) / 0.50)
        skyColor = lerpColor(dayCol, sunsetCol, t)
    } else {
        // dusk
        const t = clamp((0.05 - angle) / 0.05)
        skyColor = lerpColor(sunsetCol, nightCol, t)
    }

    // ── Fog ───────────────────────────────────────────────────────────────────
    const fogColor = skyColor.clone()
    const fogDensity = isNight ? 0.006 : 0.008   // less fog at night so you can see

    // ── Sun color & intensity ─────────────────────────────────────────────────
    const sunColor = angle > 0.5
        ? new THREE.Color(0xfff8e0)
        : lerpColor(0xff6b3a, 0xfff8e0, clamp(angle / 0.5))

    // Sun intensity: 0 when angle<0.08, ramps to ~1.1 at noon
    const sunIntensity = clamp((angle - 0.08) * 2.5, 0, 1.2)

    // ── Hemisphere light ──────────────────────────────────────────────────────
    // dayT: smooth 0→1 from night to day
    const dayT = clamp((angle - 0.05) * 4)
    // Night: soft blue ambient from sky, dark blue from ground
    const hemiSkyCol    = lerpColor(0x2040a0, 0x74b9ff, dayT)
    const hemiGroundCol = lerpColor(0x101830, 0x7c5229, dayT)
    const hemiIntensity = lerp(0.25, 0.6, dayT)     // still 0.25 at night (moonlight feel)

    // ── Ambient (fill) ────────────────────────────────────────────────────────
    const ambientIntensity = lerp(0.12, 0.28, dayT)  // gentle blue fill at night
    const ambientColor = isNight ? new THREE.Color(0x3355cc) : new THREE.Color(0xc9e8ff)

    // ── Stars / cloud / moon opacity ──────────────────────────────────────────
    const starsOpacity = clamp(1 - angle * 6)         // visible below angle≈0.17
    const cloudOpacity = clamp(angle * 4, 0.08, 1)    // slightly visible at night
    const moonOpacity  = clamp(1 - angle * 4)          // visible below angle=0.25

    // ── Bloom / exposure ──────────────────────────────────────────────────────
    const exposure = lerp(0.7, 1.15, clamp(angle * 2.5))  // moonlit, not pitch black

    return {
        h, angle, phase, isNight,
        sunX, sunY, sunZ,
        moonX, moonY, moonZ,
        skyColor, fogColor, fogDensity,
        sunColor, sunIntensity,
        hemiSkyCol, hemiGroundCol, hemiIntensity,
        ambientIntensity, ambientColor,
        starsOpacity, cloudOpacity, moonOpacity,
        exposure,
    }
}
