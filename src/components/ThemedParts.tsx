import { createContext, useContext, type ReactNode } from 'react';
import { FxLayer } from './FxLayer';
import { THEMES, themeKey } from '../fxThemes';

export const Ctx = createContext('mago');
export const useThemeClass = () => useContext(Ctx);

/**
 * Envuelve toda la app/hoja.
 * cls: nombre de la clase ("Bárbaro", "Mago"...). element: normal|agua|tierra|fuego.
 * sub: linaje/patrón ("tormenta", "salvaje", "infernal", "primigenio", "feerico").
 * state: estados separados por espacio ("furia", "oculto", "imposicion").
 * burst: número que subes en +1 para lanzar una ráfaga (Inspiración, Magia Salvaje...).
 */
export function ThemedRoot({ cls, element = 'normal', sub = '', state = '', burst = 0, children }:
  { cls: string; element?: string; sub?: string; state?: string; burst?: number; children: ReactNode }) {
  // Debug: ensure we always render the app tree.

  const k = themeKey(cls);
  return (
    <Ctx.Provider value={k}>
      <div
        className={`themed-root bg-class-${k}`}
        data-class={k}
        data-element={element.toLowerCase()}
        data-sub={sub}
        data-state={state}
      >
        <FxLayer themeKey={k} tint={element + sub} burst={burst} />
        <div className="themed-content">{children}</div>
      </div>
    </Ctx.Provider>
  );
}

/** Casilla de recurso (espacio de conjuro, uso de rasgo, inspiración...). */
export const Pip = ({ used, onClick }: { used: boolean; onClick?: () => void }) => {
  const [on, off] = THEMES[useContext(Ctx)].pip;
  return <span className="pip" data-used={used} onClick={onClick} role="img" aria-label={used ? 'gastado' : 'disponible'}>{used ? off : on}</span>;
};

export const Divider = () => <div className="themed-divider" />;
