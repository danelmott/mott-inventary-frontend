'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { morphSelection, selectionShape } from '@mott/animations/motion';

// Forma de selección de una fila de botones: al montar (o al cambiar cuántos hay) se coloca sin animar;
// después solo se animan el que se deselecciona y el que se selecciona. Devuelve los refs de los ítems.
export function useSelectionMorph({ scope, selectedIndex, count, circular = false }) {
    const itemRefs = useRef([]);
    const previousIndexRef = useRef(selectedIndex);
    const placedCountRef = useRef(null);

    useGSAP(() => {
        const options = { circular };
        itemRefs.current.length = count;

        if (placedCountRef.current !== count) {
            placedCountRef.current = count;
            previousIndexRef.current = selectedIndex;
            itemRefs.current.forEach((el, i) => { if (el) gsap.set(el, selectionShape(i === selectedIndex, options)); });
            return;
        }

        const changed = new Set([previousIndexRef.current, selectedIndex]);
        previousIndexRef.current = selectedIndex;
        changed.forEach((i) => {
            const el = itemRefs.current[i];
            if (el) morphSelection(el, i === selectedIndex, options);
        });
    }, { dependencies: [selectedIndex, count, circular], scope });

    return itemRefs;
}
