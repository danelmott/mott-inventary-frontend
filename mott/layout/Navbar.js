'use client';
import Link from 'next/link';
import { cn } from '@mott/utils/cn';
import Icon from '@mott/ui/Icon';
import OptionsModal from '@mott/modals/OptionsModal';
import DragScroll from '@mott/ui/DragScroll';
import { pressHandlers } from '@mott/animations/motion';
import useNavbar from '@mott/services/useNavbar';

/* Rail en escritorio y barra flotante en el teléfono.
   `items: [{ icon, label?, ariaLabel?, href?, onClick?, active? }]` — el activo sale de la ruta (o de `active`).
   `logo: { icon, href?, onClick?, account? }` (con `account` el logo abre el menú de la cuenta) · `account`: true agrega el botón que abre el menú de la cuenta (OptionsModal).
   `action: { icon, label, onClick }` pone otra acción en el lugar del botón de la cuenta (p. ej. una X que cierra una modal). */
export default function Navbar({ items = [], logo, account, action }) {
    const {
        railRef,
        barRef,
        railItemRefs,
        barItemRefs,
        logoRef,
        railAccountRef,
        barAccountRef,
        accountRef,
        accountOpen,
        activeIndex,
        logoActive,
        scrollable,
        handleOpenAccount,
        handleLogoClick,
        handleCloseAccount,
    } = useNavbar({ items, logo });

    const LogoTag = logo?.href && !logo.account ? Link : 'button';
    // el botón del extremo: la acción propia o, si no hay, el de la cuenta
    const trailing = action ?? (account ? { icon: 'apps', label: 'Tu cuenta', onClick: handleOpenAccount } : null);

    const bar = (
        <div ref={barRef} className={cn('inline-flex gap-group', scrollable && 'shrink-0')}>
            {items.map((item, i) => {
                const Tag = item.href ? Link : 'button';
                const active = i === activeIndex;
                return (
                    <Tag
                        key={item.href ?? item.icon ?? i}
                        ref={(node) => { barItemRefs.current[i] = node; }}
                        {...(item.href ? { href: item.href, 'aria-current': active ? 'page' : undefined } : { type: 'button', 'aria-pressed': active })}
                        onClick={item.onClick}
                        aria-label={item.label ? undefined : item.ariaLabel}
                        className={cn('mott-nav-item', item.label ? 'px-5' : 'w-(--control-size-md)')}
                        {...pressHandlers()}
                    >
                        <span className="mott-nav-icon">{typeof item.icon === 'string' ? <Icon name={item.icon} /> : item.icon}</span>
                        {item.label && <span>{item.label}</span>}
                    </Tag>
                );
            })}
        </div>
    );

    return (
        <>
            <nav className="sticky top-block mx-section my-block hidden h-[calc(100dvh_-_var(--spacing-block)_*_2)] w-fit shrink-0 flex-col items-center justify-start gap-group p-block md:flex">
                {logo && (
                    <LogoTag
                        ref={logoRef}
                        {...(LogoTag === Link
                            ? { href: logo.href, 'aria-current': logoActive ? 'page' : undefined }
                            : logo.account
                                ? { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': accountOpen }
                                : { type: 'button', 'aria-pressed': logoActive })}
                        onClick={handleLogoClick}
                        aria-label={logo.account ? 'Tu cuenta' : 'Inicio'}
                        className="mott-nav-item w-(--control-size-md)"
                        {...pressHandlers()}
                    >
                        {typeof logo.icon === 'string' ? <Icon name={logo.icon} /> : logo.icon}
                    </LogoTag>
                )}

                <div ref={railRef} className="inline-flex flex-col gap-group">
                    {items.map((item, i) => {
                        const Tag = item.href ? Link : 'button';
                        const active = i === activeIndex;
                        return (
                            <Tag
                                key={item.href ?? item.icon ?? i}
                                ref={(node) => { railItemRefs.current[i] = node; }}
                                {...(item.href ? { href: item.href, 'aria-current': active ? 'page' : undefined } : { type: 'button', 'aria-pressed': active })}
                                onClick={item.onClick}
                                aria-label={item.label ? undefined : item.ariaLabel}
                                className={cn('mott-nav-item', item.label ? 'px-5' : 'w-(--control-size-md)')}
                                {...pressHandlers()}
                            >
                                <span className="mott-nav-icon">{typeof item.icon === 'string' ? <Icon name={item.icon} /> : item.icon}</span>
                                {item.label && <span>{item.label}</span>}
                            </Tag>
                        );
                    })}
                </div>

                {trailing && (
                    <button
                        ref={railAccountRef}
                        type="button"
                        onClick={trailing.onClick}
                        aria-label={trailing.label}
                        className="mott-nav-fab mt-auto w-(--control-size-md)"
                        {...pressHandlers()}
                    >
                        <span className="mott-nav-icon"><Icon name={trailing.icon} /></span>
                    </button>
                )}
            </nav>

            <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-[var(--z-nav)] flex items-center justify-center gap-3 [--mott-nav-rest:var(--color-surface)] md:hidden">
                <div className="pointer-events-auto flex items-center rounded-full bg-surface p-2 shadow-floating">
                    {scrollable ? (
                        // el padding + margen negativo deja respirar al ítem seleccionado, que crece más allá de su caja
                        <DragScroll
                            axis="x"
                            fadeSize={24}
                            className="-m-1 flex max-w-[calc(4*var(--control-size-md)+3*var(--spacing-group)+0.5rem)] items-center p-1"
                        >
                            {bar}
                        </DragScroll>
                    ) : bar}
                </div>

                {trailing && (
                    <button
                        ref={barAccountRef}
                        type="button"
                        onClick={trailing.onClick}
                        aria-label={trailing.label}
                        className="mott-nav-fab pointer-events-auto size-[calc(var(--control-size-md)+1rem)]"
                        {...pressHandlers()}
                    >
                        <span className="mott-nav-icon"><Icon name={trailing.icon} size="lg" /></span>
                    </button>
                )}
            </nav>

            {(account || logo?.account) && (
                <OptionsModal open={accountOpen} onClose={handleCloseAccount} triggerRef={accountRef} />
            )}
        </>
    );
}
