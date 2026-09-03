import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox, SoftShadows } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { parseDimensions } from "@/components/Room3D.helpers";
import { SceneObjectMesh } from "@/components/SceneObject";
import { WALL_THICKNESS, planBounds, wallPieces, walls } from "@/lib/plan";
import type { RoomPlan, SceneItem, Visualization } from "@/lib/types";

const FLOOR_COLOR: Record<string, string> = {
  "Porcelanato acetinado 80x80": "#e3dfd8",
  "Porcelanato grande formato 120x120": "#eeebe6",
  "Piso amadeirado": "#a97c4c",
  "Cimento queimado": "#a5a5a1",
  "Deck de madeira": "#8f6031",
  "Piso cerâmico": "#d5d0c7",
};

const LIGHT_COLOR: Record<string, string> = {
  "Luz quente embutida": "#ffd9a8",
  "Luz neutra": "#fff6ea",
  "Luz fria": "#d6e6ff",
  "Iluminação cênica externa": "#ffc98a",
  "Luz natural": "#eaf4ff",
};

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement, repeat: number, srgb = true) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  return tex;
}

/** Piso: cor + rejunte + variação, com mapa de rugosidade para reflexo realista. */
function useFloorMaps(color: string, wood: boolean, repeat: number) {
  return useMemo(() => {
    const size = 1024;
    const [c, ctx] = makeCanvas(size);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    if (wood) {
      const plank = size / 6;
      for (let i = 0; i < 6; i++) {
        const shade = 0.9 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(0,0,0,${(1 - shade) * 0.5})`;
        ctx.fillRect(0, i * plank, size, plank);
        for (let g = 0; g < 90; g++) {
          ctx.strokeStyle = `rgba(60,35,12,${0.04 + Math.random() * 0.08})`;
          ctx.lineWidth = 0.6 + Math.random();
          ctx.beginPath();
          const y = i * plank + Math.random() * plank;
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(size / 3, y + (Math.random() - 0.5) * 8, (size * 2) / 3, y + (Math.random() - 0.5) * 8, size, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(0,0,0,0.28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, i * plank);
        ctx.lineTo(size, i * plank);
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 22000; i++) {
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
      }
      // veios sutis de porcelanato
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = `rgba(150,150,150,${0.05 + Math.random() * 0.07})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        const x = Math.random() * size;
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 60, size / 3, x - 60, (size * 2) / 3, x + 20, size);
        ctx.stroke();
      }
      const step = size / 2;
      ctx.strokeStyle = "rgba(0,0,0,0.16)";
      ctx.lineWidth = 4;
      for (let i = 0; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, size);
        ctx.moveTo(0, i * step);
        ctx.lineTo(size, i * step);
        ctx.stroke();
      }
    }

    // mapa de rugosidade a partir do desenho
    const [rc, rctx] = makeCanvas(size);
    rctx.drawImage(c, 0, 0);
    rctx.globalCompositeOperation = "saturation";
    rctx.fillStyle = "#000";
    rctx.fillRect(0, 0, size, size);

    return { map: toTexture(c, repeat), roughnessMap: toTexture(rc, repeat, false) };
  }, [color, wood, repeat]);
}

/** Parede: textura de pintura fosca com micro-relevo. */
function useWallMap(color: string) {
  return useMemo(() => {
    const size = 512;
    const [c, ctx] = makeCanvas(size);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 26000; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "0,0,0"},${Math.random() * 0.045})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    return toTexture(c, 3);
  }, [color]);
}

function Slats({ width, height }: { width: number; height: number }) {
  const count = Math.max(8, Math.round(width / 0.12));
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + (i + 0.5) * (width / count), height / 2, 0.04]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[(width / count) * 0.62, height, 0.06]} />
          <meshStandardMaterial color={i % 2 ? "#8b5e34" : "#82562f"} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Piso, teto e paredes gerados a partir da planta baixa desenhada pelo usuário. */
function PlanShell({
  plan,
  wallColor,
  wallMap,
  floor,
  woodFloor,
  blackFrame,
  woodDoor,
}: {
  plan: RoomPlan;
  wallColor: string;
  wallMap: THREE.Texture;
  floor: { map: THREE.Texture; roughnessMap: THREE.Texture };
  woodFloor: boolean;
  blackFrame: boolean;
  woodDoor: boolean;
}) {
  const h = plan.height;
  const segs = walls(plan);

  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    plan.points.forEach((p, i) => (i === 0 ? shape.moveTo(p.x, p.z) : shape.lineTo(p.x, p.z)));
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, [plan.points]);

  return (
    <group>
      <mesh geometry={floorGeo} receiveShadow>
        <meshStandardMaterial
          map={floor.map}
          roughnessMap={floor.roughnessMap}
          roughness={woodFloor ? 0.55 : 0.22}
          metalness={woodFloor ? 0.02 : 0.08}
          envMapIntensity={woodFloor ? 0.4 : 0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={floorGeo} position={[0, h, 0]} receiveShadow>
        <meshStandardMaterial color="#fafaf8" roughness={0.98} side={THREE.DoubleSide} />
      </mesh>

      {segs.map((s) => {
        const ops = plan.openings.filter((o) => o.wall === s.index);
        const pieces = wallPieces(s.length, ops);
        return (
          <group key={s.index} position={[s.mid.x, 0, s.mid.z]} rotation-y={-s.angle}>
            {/* trechos cheios */}
            {pieces.map((pc, i) => (
              <mesh key={`p${i}`} position={[pc.center, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[pc.width, h, WALL_THICKNESS]} />
                <meshStandardMaterial map={wallMap} color={wallColor} roughness={0.97} />
              </mesh>
            ))}
            {/* rodapé */}
            {pieces.map((pc, i) => (
              <mesh key={`r${i}`} position={[pc.center, 0.06, WALL_THICKNESS / 2 - 0.012]} receiveShadow>
                <boxGeometry args={[pc.width, 0.12, 0.03]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
              </mesh>
            ))}
            {ops.map((o) => {
              const cx = o.offset - s.length / 2;
              const top = o.sill + o.height;
              const door = o.kind === "porta" || o.kind === "portaJanela";
              return (
                <group key={o.id} position={[cx, 0, 0]}>
                  {/* verga */}
                  {top < h - 0.01 && (
                    <mesh position={[0, (top + h) / 2, 0]} castShadow receiveShadow>
                      <boxGeometry args={[o.width, h - top, WALL_THICKNESS]} />
                      <meshStandardMaterial map={wallMap} color={wallColor} roughness={0.97} />
                    </mesh>
                  )}
                  {/* peitoril */}
                  {o.sill > 0.01 && (
                    <mesh position={[0, o.sill / 2, 0]} castShadow receiveShadow>
                      <boxGeometry args={[o.width, o.sill, WALL_THICKNESS]} />
                      <meshStandardMaterial map={wallMap} color={wallColor} roughness={0.97} />
                    </mesh>
                  )}
                  {o.kind === "vao" ? null : door ? (
                    <group position={[0, o.sill + o.height / 2, 0]}>
                      <mesh castShadow receiveShadow>
                        <boxGeometry args={[o.width - 0.06, o.height - 0.04, 0.05]} />
                        <meshStandardMaterial
                          color={o.kind === "portaJanela" ? "#cfe6f7" : woodDoor ? "#7b5029" : "#eceae6"}
                          roughness={o.kind === "portaJanela" ? 0.05 : 0.45}
                          metalness={o.kind === "portaJanela" ? 0.5 : 0}
                          transparent={o.kind === "portaJanela"}
                          opacity={o.kind === "portaJanela" ? 0.55 : 1}
                        />
                      </mesh>
                      {o.kind === "porta" && (
                        <mesh position={[o.width / 2 - 0.12, -0.05, 0.05]} castShadow>
                          <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
                          <meshStandardMaterial color="#c9ad74" metalness={0.95} roughness={0.18} />
                        </mesh>
                      )}
                    </group>
                  ) : (
                    <group position={[0, o.sill + o.height / 2, 0]}>
                      <mesh>
                        <boxGeometry args={[o.width - 0.04, o.height - 0.04, 0.03]} />
                        <meshStandardMaterial
                          color="#cfe6f7"
                          roughness={0.02}
                          metalness={0.5}
                          emissive="#dcefff"
                          emissiveIntensity={0.8}
                          transparent
                          opacity={0.5}
                        />
                      </mesh>
                      <rectAreaLight
                        position={[0, 0, WALL_THICKNESS * 0.6 * (1)]}
                        width={o.width}
                        height={o.height}
                        intensity={5}
                        color="#e8f3ff"
                      />
                    </group>
                  )}
                  {/* esquadria / batente */}
                  <mesh position={[0, o.sill + o.height / 2, 0]}>
                    <boxGeometry args={[o.width + 0.08, o.height + 0.08, WALL_THICKNESS * 0.55]} />
                    <meshStandardMaterial
                      color={blackFrame ? "#1e2226" : "#f2f0ec"}
                      roughness={0.4}
                      metalness={blackFrame ? 0.5 : 0.1}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

interface EditProps {
  editable: boolean;
  selectedId: string | null;
  onSelect?: ((id: string | null) => void) | undefined;
  onMove?: ((id: string, x: number, z: number) => void) | undefined;
  onDragChange?: ((dragging: boolean) => void) | undefined;
}

/** Objetos adicionados pelo usuário — clicáveis e arrastáveis sobre o piso. */
function EditableItems({
  items,
  w,
  d,
  editable,
  selectedId,
  onSelect,
  onMove,
  onDragChange,
}: EditProps & { items: SceneItem[]; w: number; d: number }) {
  const [dragId, setDragId] = useState<string | null>(null);

  const clamp = (n: number, lim: number) => Math.max(-lim, Math.min(lim, n));

  return (
    <group>
      {/* plano invisível para captar o arraste sobre o piso */}
      {dragId && (
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.001, 0]}
          onPointerMove={(e) => {
            e.stopPropagation();
            onMove?.(
              dragId,
              Number(clamp(e.point.x, w / 2 - 0.2).toFixed(2)),
              Number(clamp(e.point.z, d / 2 - 0.2).toFixed(2)),
            );
          }}
          onPointerUp={() => {
            setDragId(null);
            onDragChange?.(false);
          }}
        >
          <planeGeometry args={[w * 3, d * 3]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {items.map((item) => {
        const selected = editable && selectedId === item.id;
        return (
          <group key={item.id} position={[item.x, 0, item.z]}>
            <group
              rotation-y={item.rot}
              scale={item.scale}
              {...(editable
                ? {
                    onPointerDown: (e) => {
                      e.stopPropagation();
                      onSelect?.(item.id);
                      setDragId(item.id);
                      onDragChange?.(true);
                    },
                    onPointerOver: () => {
                      document.body.style.cursor = "grab";
                    },
                    onPointerOut: () => {
                      document.body.style.cursor = "auto";
                    },
                  }
                : {})}
            >
              <SceneObjectMesh item={item} />
            </group>
            {selected && (
              <mesh rotation-x={-Math.PI / 2} position={[0, 0.014, 0]}>
                <ringGeometry args={[0.62 * item.scale, 0.74 * item.scale, 48]} />
                <meshBasicMaterial color="#f5a524" transparent opacity={0.95} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function RoomScene({
  v,
  w,
  d,
  editable,
  selectedId,
  onSelect,
  onMove,
  onDragChange,
}: EditProps & { v: Visualization; w: number; d: number }) {
  const items = v.items ?? [];
  const plan = v.plan;
  const h = plan?.height ?? 2.8;
  const wall = v.wallColor || "#e8e3da";
  const floorColor = FLOOR_COLOR[v.floor] ?? "#e3dfd8";
  const woodFloor = /madeira|deck/i.test(v.floor);
  const floor = useFloorMaps(floorColor, woodFloor, Math.max(2, Math.round(Math.max(w, d) / 2)));
  const wallMap = useWallMap(wall);
  const lightColor = LIGHT_COLOR[v.lighting] ?? "#fff6ea";
  const ripado = /ripado/i.test(v.cladding);
  const tijolo = /tijolo/i.test(v.cladding);
  const woodDoor = /madeira/i.test(v.door);
  const blackFrame = /preta/i.test(v.window);
  const classic = /clássic/i.test(v.furniture);

  const winW = Math.min(w * 0.42, 2.6);
  const winH = h * 0.46;
  const winY = h * 0.56;
  const winX = w * 0.2;

  return (
    <group>
      {plan ? (
        <PlanShell plan={plan} wallColor={wall} wallMap={wallMap} floor={floor} woodFloor={woodFloor} blackFrame={blackFrame} woodDoor={woodDoor} />
      ) : (
        <>
        {/* piso */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            map={floor.map}
            roughnessMap={floor.roughnessMap}
            roughness={woodFloor ? 0.55 : 0.22}
            metalness={woodFloor ? 0.02 : 0.08}
            envMapIntensity={woodFloor ? 0.4 : 0.9}
          />
        </mesh>
        {/* teto */}
        <mesh rotation-x={Math.PI / 2} position={[0, h, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.98} />
        </mesh>
        {/* sanca de gesso */}
        <mesh position={[0, h - 0.06, -d / 2 + 0.22]}>
          <boxGeometry args={[w, 0.12, 0.16]} />
          <meshStandardMaterial color="#f7f6f3" roughness={0.95} />
        </mesh>

        {/* paredes */}
        <mesh position={[0, h / 2, -d / 2]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={wallMap} color={wall} roughness={0.97} />
        </mesh>
        <mesh position={[-w / 2, h / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial map={wallMap} color={wall} roughness={0.97} />
        </mesh>
        <mesh position={[w / 2, h / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial map={wallMap} color={wall} roughness={0.97} />
        </mesh>

        {/* rodapés */}
        <mesh position={[0, 0.06, -d / 2 + 0.02]} receiveShadow>
          <boxGeometry args={[w, 0.12, 0.025]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[-w / 2 + 0.02, 0.06, 0]} receiveShadow>
          <boxGeometry args={[0.025, 0.12, d]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[w / 2 - 0.02, 0.06, 0]} receiveShadow>
          <boxGeometry args={[0.025, 0.12, d]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* revestimento na parede de fundo */}
        <group position={[-w * 0.22, 0, -d / 2 + 0.02]}>
          {ripado ? (
            <Slats width={Math.min(w * 0.46, 3)} height={h * 0.8} />
          ) : tijolo ? (
            <group>
              {Array.from({ length: 14 }, (_, r) =>
                Array.from({ length: 10 }, (_, i) => (
                  <mesh
                    key={`${r}-${i}`}
                    position={[
                      -Math.min(w * 0.46, 3) / 2 + (i + 0.5) * (Math.min(w * 0.46, 3) / 10) + (r % 2 ? 0.06 : 0),
                      0.08 + r * ((h * 0.72) / 14),
                      0.03,
                    ]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[Math.min(w * 0.46, 3) / 10 - 0.02, (h * 0.72) / 14 - 0.015, 0.05]} />
                    <meshStandardMaterial color={r % 3 ? "#a5573f" : "#95492f"} roughness={0.95} />
                  </mesh>
                )),
              )}
            </group>
          ) : (
            <mesh position={[0, (h * 0.6) / 2, 0.03]} receiveShadow castShadow>
              <boxGeometry args={[Math.min(w * 0.46, 3), h * 0.6, 0.05]} />
              <meshStandardMaterial color="#d5cfc6" roughness={0.9} />
            </mesh>
          )}
        </group>

        {/* janela: vão, esquadria e vidro */}
        <group position={[winX, winY, -d / 2 + 0.03]}>
          <mesh castShadow>
            <boxGeometry args={[winW + 0.12, winH + 0.12, 0.08]} />
            <meshStandardMaterial
              color={blackFrame ? "#1e2226" : "#f4f4f2"}
              roughness={0.35}
              metalness={blackFrame ? 0.55 : 0.15}
            />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[winW, winH]} />
            <meshStandardMaterial
              color="#cfe6f7"
              roughness={0.02}
              metalness={0.55}
              emissive="#dcefff"
              emissiveIntensity={1.15}
            />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.03, winH, 0.02]} />
            <meshStandardMaterial color={blackFrame ? "#1e2226" : "#f4f4f2"} roughness={0.4} />
          </mesh>
          {/* peitoril */}
          <mesh position={[0, -winH / 2 - 0.09, 0.09]} castShadow receiveShadow>
            <boxGeometry args={[winW + 0.2, 0.05, 0.18]} />
            <meshStandardMaterial color="#e7e3dc" roughness={0.4} metalness={0.05} />
          </mesh>
        </group>
        {/* luz entrando pela janela */}
        <rectAreaLight
          position={[winX, winY, -d / 2 + 0.12]}
          width={winW}
          height={winH}
          intensity={6}
          color="#e8f3ff"
        />

        {/* porta na parede esquerda */}
        <group position={[-w / 2 + 0.04, 0, d * 0.22]} rotation-y={Math.PI / 2}>
          <mesh position={[0, 1.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.92, 2.12, 0.06]} />
            <meshStandardMaterial color={woodDoor ? "#7b5029" : "#eceae6"} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.06, -0.02]}>
            <boxGeometry args={[1.02, 2.22, 0.03]} />
            <meshStandardMaterial color={woodDoor ? "#5f3d1f" : "#dedad4"} roughness={0.6} />
          </mesh>
          <mesh position={[0.36, 1.02, 0.05]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
            <meshStandardMaterial color="#c9ad74" metalness={0.95} roughness={0.18} />
          </mesh>
        </group>
        </>
      )}

      {/* mobiliário base (oculto quando o usuário monta a própria composição) */}
      {!plan && v.furniture !== "Sem mobiliário" && items.length === 0 && (
        <group>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, d * 0.16]} receiveShadow>
            <planeGeometry args={[Math.min(w * 0.66, 3.4), Math.min(d * 0.5, 2.4)]} />
            <meshStandardMaterial color={classic ? "#c9bda6" : "#cfc9be"} roughness={1} />
          </mesh>

          {/* sofá */}
          <group position={[0, 0, -d * 0.02]}>
            <RoundedBox args={[Math.min(w * 0.5, 2.4), 0.34, 0.9]} radius={0.07} smoothness={4} position={[0, 0.34, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={classic ? "#8d7355" : "#4c5663"} roughness={0.92} />
            </RoundedBox>
            <RoundedBox args={[Math.min(w * 0.5, 2.4), 0.5, 0.2]} radius={0.07} smoothness={4} position={[0, 0.62, -0.36]} castShadow>
              <meshStandardMaterial color={classic ? "#7a6248" : "#434c58"} roughness={0.92} />
            </RoundedBox>
            {[-1, 1].map((s) => (
              <RoundedBox
                key={s}
                args={[0.16, 0.42, 0.9]}
                radius={0.06}
                smoothness={4}
                position={[(s * Math.min(w * 0.5, 2.4)) / 2, 0.45, 0]}
                castShadow
              >
                <meshStandardMaterial color={classic ? "#836a4f" : "#464f5b"} roughness={0.92} />
              </RoundedBox>
            ))}
            {[-0.5, 0.5].map((s) => (
              <RoundedBox key={s} args={[0.34, 0.3, 0.1]} radius={0.05} smoothness={3} position={[s, 0.66, -0.24]} rotation-x={-0.25} castShadow>
                <meshStandardMaterial color={classic ? "#a08a68" : "#5b6673"} roughness={0.95} />
              </RoundedBox>
            ))}
            {[
              [-1, -1],
              [1, -1],
              [-1, 1],
              [1, 1],
            ].map(([sx, sz], i) => (
              <mesh key={i} position={[sx! * (Math.min(w * 0.5, 2.4) / 2 - 0.14), 0.08, sz! * 0.34]} castShadow>
                <cylinderGeometry args={[0.03, 0.02, 0.16, 10]} />
                <meshStandardMaterial color="#2b2b2b" metalness={0.7} roughness={0.35} />
              </mesh>
            ))}
          </group>

          {/* mesa de centro */}
          <group position={[0, 0, d * 0.28]}>
            <RoundedBox args={[1.05, 0.06, 0.58]} radius={0.02} smoothness={3} position={[0, 0.4, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#6b4a2c" roughness={0.35} metalness={0.05} />
            </RoundedBox>
            {[
              [-0.45, -0.22],
              [0.45, -0.22],
              [-0.45, 0.22],
              [0.45, 0.22],
            ].map(([x, z], i) => (
              <mesh key={i} position={[x!, 0.2, z!]} castShadow>
                <cylinderGeometry args={[0.022, 0.022, 0.4, 10]} />
                <meshStandardMaterial color="#26262a" metalness={0.85} roughness={0.28} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* decoração */}
      {!plan && v.decor !== "Sem decoração" && (
        <group>
          <group position={[-w * 0.38, 0, -d * 0.26]}>
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.17, 0.12, 0.4, 24]} />
              <meshStandardMaterial color="#b9b2a6" roughness={0.85} />
            </mesh>
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.16, 0.62 + (i % 3) * 0.13, Math.sin(a) * 0.16]}
                  rotation={[Math.cos(a) * 0.5, a, Math.sin(a) * 0.5]}
                  castShadow
                >
                  <sphereGeometry args={[0.17, 12, 10]} />
                  <meshStandardMaterial color={i % 2 ? "#3f6b45" : "#4c7d50"} roughness={1} />
                </mesh>
              );
            })}
          </group>
          <group position={[-w * 0.22, h * 0.68, -d / 2 + 0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.6, 0.04]} />
              <meshStandardMaterial color="#20242a" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[0.7, 0.5]} />
              <meshStandardMaterial color="#e6e9ec" roughness={0.7} />
            </mesh>
          </group>
        </group>
      )}

      {/* objetos editáveis posicionados pelo usuário */}
      <EditableItems
        items={items}
        w={w}
        d={d}
        editable={editable}
        selectedId={selectedId ?? null}
        onSelect={onSelect}
        onMove={onMove}
        onDragChange={onDragChange}
      />

      {/* luminárias embutidas */}
      {[-w * 0.25, w * 0.25].map((x, i) => (
        <group key={i} position={[x, h - 0.02, d * 0.05]}>
          <mesh rotation-x={Math.PI / 2}>
            <circleGeometry args={[0.09, 24]} />
            <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={2.4} />
          </mesh>
          <pointLight position={[0, -0.1, 0]} intensity={5} color={lightColor} distance={7} decay={2} castShadow={i === 0} />
        </group>
      ))}

      {/* iluminação geral */}
      <ambientLight intensity={0.35} color={lightColor} />
      <hemisphereLight intensity={0.45} color="#eaf2ff" groundColor="#b3a99c" />
      <directionalLight
        position={[winX + 1.2, h * 1.4, -d * 0.9]}
        intensity={1.7}
        color="#fff3e2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />
      <ContactShadows position={[0, 0.012, 0]} opacity={0.42} scale={Math.max(w, d) * 1.4} blur={2.4} far={3} />
      <Environment>
        <Lightformer intensity={1.4} position={[0, 4, 2]} scale={[10, 10, 1]} />
        <Lightformer intensity={1.1} color="#cfe3f5" position={[winX, winY, -d]} scale={[winW * 1.6, winH * 1.6, 1]} />
        <Lightformer intensity={0.5} color="#ffe6c4" position={[0, 1, 4]} scale={[8, 4, 1]} />
      </Environment>
    </group>
  );
}

export { parseDimensions };

export type CameraPreset = "frontal" | "canto" | "lateral" | "topo";

const PRESETS: Record<CameraPreset, { azimuth: number; polar: number; dist: number }> = {
  frontal: { azimuth: Math.PI / 2, polar: 1.32, dist: 0.95 },
  canto: { azimuth: Math.PI / 4, polar: 1.2, dist: 1.05 },
  lateral: { azimuth: 0, polar: 1.35, dist: 0.95 },
  topo: { azimuth: Math.PI / 2, polar: 0.55, dist: 1.25 },
};

/** Reposiciona a câmera quando o usuário troca o ângulo de visualização. */
function CameraPresetRig({ preset, radius }: { preset?: CameraPreset | undefined; radius: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update: () => void } | null;

  useEffect(() => {
    if (!preset) return;
    const p = PRESETS[preset];
    const r = Math.max(2.2, radius * p.dist);
    camera.position.set(
      Math.cos(p.azimuth) * Math.sin(p.polar) * r,
      Math.max(1.2, Math.cos(p.polar) * r + 1.1),
      Math.sin(p.azimuth) * Math.sin(p.polar) * r,
    );
    camera.lookAt(0, 1.1, 0);
    controls?.update();
  }, [preset, radius, camera, controls]);

  return null;
}

export default function Room3D({
  v,
  dimensions,
  editable = false,
  selectedId = null,
  onSelect,
  onMove,
  cameraPreset,
  capture = false,
}: {
  v: Visualization;
  dimensions: string;
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, z: number) => void;
  cameraPreset?: CameraPreset | undefined;
  /** mantém o buffer do WebGL para permitir exportar a imagem do render */
  capture?: boolean;
}) {
  const parsed = parseDimensions(dimensions);
  const b = v.plan ? planBounds(v.plan) : null;
  const w = b ? b.w : parsed[0];
  const d = b ? b.d : parsed[1];
  const [dragging, setDragging] = useState(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [w * 0.42, 1.65, d * 0.92], fov: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        preserveDrawingBuffer: capture,
      }}
      onPointerMissed={() => editable && onSelect?.(null)}
    >
      <color attach="background" args={["#0d1014"]} />
      <SoftShadows size={26} samples={12} focus={0.9} />
      <RoomScene
        v={v}
        w={w}
        d={d}
        editable={editable}
        selectedId={selectedId}
        onSelect={onSelect}
        onMove={onMove}
        onDragChange={setDragging}
      />
      <OrbitControls
        makeDefault
        enabled={!dragging}
        enablePan={false}
        enableDamping
        minDistance={1.6}
        maxDistance={Math.max(w, d) * 1.8}
        minPolarAngle={0.5}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.1, 0]}
      />
      <CameraPresetRig preset={cameraPreset} radius={Math.max(w, d)} />
    </Canvas>
  );
}

