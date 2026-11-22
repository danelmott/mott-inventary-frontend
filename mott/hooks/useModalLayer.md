# Modales anidadas

Cómo se abre una modal encima de otra en Mott, y por qué el sistema es tan pequeño.

## Cómo se usa

Se declara la modal hija **dentro** de la madre, cada una con su propio `open` / `onClose`:

```jsx
<Modal open={cuenta} onClose={cerrarCuenta} triggerRef={botonCuenta}>
    <h2>Ajustes de la cuenta</h2>

    <Button ref={botonBorrar} variant="danger" onClick={() => setConfirmar(true)}>
        Eliminar cuenta
    </Button>

    <Modal open={confirmar} onClose={() => setConfirmar(false)} triggerRef={botonBorrar}>
        <h2>¿Seguro?</h2>
        <Button onClick={() => setConfirmar(false)}>Cancelar</Button>
        <Button variant="danger" onClick={borrar}>Eliminar</Button>
    </Modal>
</Modal>
```

No hay provider que montar ni API nueva que aprender: es el mismo `Modal` de siempre, escrito
dentro de otro. Anidar tantos niveles como haga falta funciona igual.

## Lo que hace el navegador solo

`Modal` abre un `<dialog>` nativo con `showModal()`, y eso lo mete en el **top layer** del
navegador, una capa por encima de todo el documento que se ordena por orden de apertura. De ahí sale
gratis casi todo:

- **La de arriba tapa a la de abajo**, sin `z-index` ninguno.
- **Escape cierra solo la de arriba.** El evento `cancel` únicamente llega al `<dialog>` superior.
- **El clic en el fondo también.** El `<dialog>` de arriba ocupa la pantalla entera, así que el fondo
  de la de abajo es literalmente inalcanzable con el ratón.
- **El foco vuelve donde debe.** `dialog.close()` devuelve el foco al elemento que lo tenía antes de
  abrir, que para una hija abierta desde un botón de la madre es ese botón.
- **El scroll de la página sigue bloqueado** al cerrar la de arriba, porque `utils/scrollLock.js`
  cuenta referencias en vez de guardar un booleano.

## Lo que sí hay que resolver, y es lo único que hace este módulo

Cada modal pinta su propio velo al 32%. Con dos abiertas, la página se vería a través de dos velos
(≈54%) y se oscurecería un poco más en cada nivel.

`useModalLayer.js` es un registro, a nivel de módulo, de qué modales están abiertas, en qué orden y cuál
es el velo de cada una. Con eso la de arriba sabe qué velo tiene debajo, y `animations/scrim.js` hace el resto:
solo la superior deja su velo encendido.

El panel de la modal de abajo **sí se ve atenuado**, y no hace falta animar nada para conseguirlo: el
velo que lo oscurece es el de la modal que tiene encima, que en el top layer está por delante de él.
La de abajo no se mueve ni se escala; solo se apaga.

```
sin la pila:              con la pila:
página  ← velo1 ← velo2   página  ← ——— ← velo2      (la página, un solo velo)
panel1  ← ——— ← velo2     panel1  ← ——— ← velo2      (el panel de abajo, atenuado)
```

### El relevo entre velos

Los dos velos los mueve **un solo tween**, el de la modal de arriba. En cada frame, la opacidad del de
abajo se calcula para que la página siga exactamente igual de oscura (dos capas componen
`1 - (1 - a)(1 - b)`, y se despeja la de abajo). Lo único que cambia durante el relevo es la
atenuación del panel de abajo.

- **Al abrir la de arriba**: su velo sube de 0 al 32% y el de abajo baja a 0 a la par.
- **Al cerrarla**: el relevo al revés. Empieza cuando la de arriba **empieza** a cerrarse, no cuando
  termina, para que nunca haya un frame de página sin velo.
- **Si se desmonta sin cerrarse**, la de abajo recupera su velo al instante.

Antes cada modal fundía su propio velo por su cuenta. A mitad del cruce la página se aclaraba y, al
cerrar, el velo de arriba desaparecía de golpe mientras el de abajo volvía desde 0: se veía apagarse y
encenderse otra vez.

## Por qué es un módulo y no un provider

Por el mismo motivo que `scrollLock.js`: dos modales que necesitan saber la una de la otra pueden
estar declaradas en componentes que no comparten nada salvo el documento. Un provider funcionaría
solo si todo el mundo se acordara de montarlo, y olvidarlo fallaría en silencio — la segunda modal
simplemente pintaría un segundo velo.

## Una regla de implementación

El `<dialog>` se renderiza con `createPortal` a `document.body`, aunque el JSX esté anidado. Es
obligatorio: si el `<dialog>` hijo quedara dentro del `content` de la madre, la animación de cierre
de la madre le aplicaría `visibility: hidden` — que sí alcanza a un descendiente en el top layer — y
la hija desaparecería con ella. El anidamiento es un hecho del JSX y de la pila, nunca del DOM.
