// cast.js — HERO: neon-blue lifter with a white headband. DOC: lab coat + glasses.
import { E } from '/engine/core.js';
import { drawFigure } from '/engine/rig2d.js';
export const HERO = { top: 'none', head: 'headband', headColor: '#ffffff' };
export const DOC = { top: 'labcoat', face: 'glasses', head: 'none' };
export const CAST = [HERO, DOC];
// neon glow around a figure
export function neon(g, o, blur = 26) { g.save(); g.shadowColor = 'rgba(40,200,255,.85)'; g.shadowBlur = blur * E.PX; drawFigure(g, o); g.restore(); }
