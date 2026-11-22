'use client';
import { GUIDE } from '@/app/docs/_content/guide';
import { FOUNDATIONS } from '@/app/docs/_content/foundations';
import { RESPONSIVE } from '@/app/docs/_content/responsive';
import { COMPONENTS } from '@/app/docs/_content/components';
import { AVATAR } from '@/app/docs/_content/avatar';
import { LAYOUT } from '@/app/docs/_content/layout';
import { MODALS } from '@/app/docs/_content/modals';
import { ANIMATIONS } from '@/app/docs/_content/animations';
import { GESTURES } from '@/app/docs/_content/gestures';
import { UTILITIES } from '@/app/docs/_content/utilities';

// El contenido de cada página de /docs, por slug (los slugs y el orden están en nav.js).
export const DOCS = { ...GUIDE, ...FOUNDATIONS, ...RESPONSIVE, ...COMPONENTS, ...AVATAR, ...LAYOUT, ...MODALS, ...ANIMATIONS, ...GESTURES, ...UTILITIES };
