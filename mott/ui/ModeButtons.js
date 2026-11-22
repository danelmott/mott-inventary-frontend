'use client';
import { useRef } from 'react';
import Icon from '@mott/ui/Icon';
import { selectionTint, FAMILIES } from '@mott/theme/roles';
import { pressHandlers } from '@mott/animations/motion';
import { useSelectionMorph } from '@mott/hooks/animations/useSelectionMorph';
import { useTheme } from '@/contexts/ThemeContext';

const MODES = [
    { value: 'light', icon: 'light_mode', label: 'Claro' },
    { value: 'dark', icon: 'dark_mode', label: 'Oscuro' },
    { value: 'system', icon: 'brightness_4', label: 'Sistema' },
];

// El modo del tema (claro, oscuro, sistema) como fila de botones con la forma de selección animada.
export default function ModeButtons() {
    const { mode, setMode } = useTheme();
    const containerRef = useRef(null);
    const selectedIndex = MODES.findIndex((option) => option.value === mode);
    const itemRefs = useSelectionMorph({ scope: containerRef, selectedIndex, count: MODES.length });
    const selectedTint = selectionTint('support');
    const restingTint = FAMILIES.neutral;

    return (
        <div ref={containerRef} className="inline-flex gap-group">
            {MODES.map((option, i) => {
                const selected = i === selectedIndex;
                return (
                    <button
                        key={option.value}
                        ref={(el) => { itemRefs.current[i] = el; }}
                        type="button"
                        onClick={() => setMode(option.value)}
                        aria-pressed={selected}
                        aria-label={option.label}
                        title={option.label}
                        className="mott-state-layer mott-morph mott-trim inline-flex size-(--control-size-md) cursor-pointer items-center justify-center gap-2 border-0 p-0 type-label-lg transition-[color] duration-[var(--duration-morph)] ease-emphasized"
                        {...pressHandlers()}
                        style={{
                            '--mott-morph-bg': selected ? selectedTint.surface : restingTint.soft,
                            color: selected ? selectedTint.on : restingTint.onSoft,
                        }}
                    >
                        <Icon name={option.icon} />
                    </button>
                );
            })}
        </div>
    );
}
