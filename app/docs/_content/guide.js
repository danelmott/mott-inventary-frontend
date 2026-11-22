'use client';
import { C, SimpleTable } from '@/app/docs/_components/blocks';

const TREE = `
app/            rutas (page.js, layout.js); aquí solo va routing
  layout.js     layout raíz: fuente y providers
  providers.js  providers globales: agrega aquí los tuyos
  globals.css   tokens de diseño
  docs/         esta documentación (solo en desarrollo)

components/     tus componentes          → @/components/...
hooks/          tus hooks                → @/hooks/...
lib/            tu código suelto (API, constantes, formateadores) → @/lib/...
contexts/       providers globales (tema, toasts, sesión y los tuyos) → @/contexts/...

mott/           el sistema de diseño     → @mott/...
public/         imágenes, íconos, favicon
`;

// [qué quieres crear, dónde va, cómo se usa]
const WHERE = [
    ['Una página', 'app/<ruta>/page.js', '/<ruta>'],
    ['Un marco para varias páginas', 'app/(grupo)/layout.js', 'envuelve las páginas del grupo'],
    ['Un componente de un área', 'components/<área>/Nombre.js', '@/components/<área>/Nombre'],
    ['Un componente de toda la app', 'components/shared/Nombre.js', '@/components/shared/Nombre'],
    ['Piezas del marco (header, sidebar)', 'components/layout/Nombre.js', '@/components/layout/Nombre'],
    ['Un provider', 'contexts/NombreContext.jsx', 'registrado en app/providers.js'],
    ['Un hook', 'hooks/useNombre.js', '@/hooks/useNombre'],
    ['Llamadas a tu API', 'lib/api/<recurso>.js', '@/lib/api/<recurso>'],
    ['Constantes y utilidades', 'lib/<nombre>.js', '@/lib/<nombre>'],
    ['Imágenes y archivos estáticos', 'public/', '/logo.svg'],
    ['Un cambio en un componente de Mott', 'mott/<carpeta>/Nombre.js', 'se edita ahí mismo'],
];

export const GUIDE = {
    estructura: {
        summary: (
            <>
                <C>mott/</C> es el sistema de diseño; <C>components/</C>, <C>hooks/</C> y <C>lib/</C> son tuyos, así que
                nada de lo que crees choca con Mott.
            </>
        ),
        sections: [
            { title: 'Carpetas', code: TREE },
            {
                title: 'Dónde va cada cosa',
                content: <SimpleTable headers={['Quiero crear…', 'Va en', 'Se usa como']} rows={WHERE} code={[1, 2]} />,
            },
        ],
    },
};
