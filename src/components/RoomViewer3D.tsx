import { lazy, Suspense, useEffect, useState } from "react";
import type { Visualization } from "@/lib/types";

/**
 * Visualização 3D real (WebGL / React Three Fiber), renderizada apenas no
 * navegador. Quando `visualization.renderUrl` estiver preenchido, a imagem
 * de render fotorrealista é exibida no lugar da cena interativa.
 */
const Room3D = lazy(() => import("./Room3D"));

export function RoomViewer3D({
  v,
  roomName,
  dimensions = "",
  editable = false,
  selectedId = null,
  onSelect,
  onMove,
  className = "aspect-16/10",
  hint,
}: {
  v: Visualization;
  roomName: string;
  dimensions?: string;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, z: number) => void;
  className?: string;
  hint?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (v.renderUrl) {
    return (
      <img
        src={v.renderUrl}
        alt={`Renderização do ambiente ${roomName}`}
        className={`w-full rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-muted ${className}`}
      role="img"
      aria-label={`Visualização 3D interativa do ambiente ${roomName}`}
    >
      {mounted ? (
        <Suspense fallback={<Loading />}>
          <Room3D
            v={v}
            dimensions={dimensions}
            editable={editable}
            selectedId={selectedId}
            {...(onSelect ? { onSelect } : {})}
            {...(onMove ? { onMove } : {})}
          />
        </Suspense>
      ) : (
        <Loading />
      )}
      <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-foreground/70 px-2 py-1 text-[10px] font-semibold tracking-wide text-background uppercase">
        {hint ?? "3D interativo · arraste para girar · scroll para zoom"}
      </span>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Carregando visualização 3D…
    </div>
  );
}
