import { RoundedBox } from "@react-three/drei";
import type { SceneItem } from "@/lib/types";

/**
 * Renderização procedural de cada objeto editável da cena 3D.
 * Todos os objetos são desenhados apoiados no piso (y = 0).
 */
export function SceneObjectMesh({ item }: { item: SceneItem }) {
  const c = item.color;

  switch (item.kind) {
    case "sofa":
      return (
        <group>
          <RoundedBox args={[2.1, 0.34, 0.9]} radius={0.07} smoothness={4} position={[0, 0.34, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.92} />
          </RoundedBox>
          <RoundedBox args={[2.1, 0.5, 0.2]} radius={0.07} smoothness={4} position={[0, 0.62, -0.36]} castShadow>
            <meshStandardMaterial color={c} roughness={0.92} />
          </RoundedBox>
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.16, 0.42, 0.9]} radius={0.06} smoothness={4} position={[s * 1.05, 0.45, 0]} castShadow>
              <meshStandardMaterial color={c} roughness={0.92} />
            </RoundedBox>
          ))}
          {[-0.5, 0.5].map((s) => (
            <RoundedBox key={s} args={[0.34, 0.3, 0.1]} radius={0.05} smoothness={3} position={[s, 0.66, -0.24]} rotation-x={-0.25} castShadow>
              <meshStandardMaterial color={c} roughness={0.98} />
            </RoundedBox>
          ))}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx! * 0.9, 0.08, sz! * 0.34]} castShadow>
              <cylinderGeometry args={[0.03, 0.02, 0.16, 10]} />
              <meshStandardMaterial color="#2b2b2b" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );

    case "poltrona":
      return (
        <group>
          <RoundedBox args={[0.82, 0.3, 0.8]} radius={0.08} smoothness={4} position={[0, 0.36, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.82, 0.5, 0.18]} radius={0.08} smoothness={4} position={[0, 0.64, -0.32]} castShadow>
            <meshStandardMaterial color={c} roughness={0.9} />
          </RoundedBox>
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.12, 0.34, 0.8]} radius={0.05} smoothness={3} position={[s * 0.42, 0.45, 0]} castShadow>
              <meshStandardMaterial color={c} roughness={0.9} />
            </RoundedBox>
          ))}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx! * 0.3, 0.1, sz! * 0.3]} castShadow>
              <cylinderGeometry args={[0.025, 0.02, 0.2, 10]} />
              <meshStandardMaterial color="#2b2b2b" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      );

    case "mesaCentro":
      return (
        <group>
          <RoundedBox args={[1.05, 0.06, 0.58]} radius={0.02} smoothness={3} position={[0, 0.4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.35} />
          </RoundedBox>
          {[[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]].map(([x, z], i) => (
            <mesh key={i} position={[x!, 0.2, z!]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.4, 10]} />
              <meshStandardMaterial color="#26262a" metalness={0.85} roughness={0.28} />
            </mesh>
          ))}
        </group>
      );

    case "mesaJantar":
      return (
        <group>
          <RoundedBox args={[1.7, 0.07, 0.95]} radius={0.025} smoothness={3} position={[0, 0.75, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.4} />
          </RoundedBox>
          {[[-0.72, -0.36], [0.72, -0.36], [-0.72, 0.36], [0.72, 0.36]].map(([x, z], i) => (
            <mesh key={i} position={[x!, 0.37, z!]} castShadow>
              <boxGeometry args={[0.07, 0.74, 0.07]} />
              <meshStandardMaterial color="#2c2c30" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      );

    case "cadeira":
      return (
        <group>
          <RoundedBox args={[0.46, 0.07, 0.46]} radius={0.02} smoothness={3} position={[0, 0.46, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.7} />
          </RoundedBox>
          <RoundedBox args={[0.44, 0.5, 0.06]} radius={0.03} smoothness={3} position={[0, 0.74, -0.2]} castShadow>
            <meshStandardMaterial color={c} roughness={0.7} />
          </RoundedBox>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx! * 0.19, 0.22, sz! * 0.19]} castShadow>
              <cylinderGeometry args={[0.018, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#26262a" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
        </group>
      );

    case "cama":
      return (
        <group>
          <RoundedBox args={[1.65, 0.28, 2.05]} radius={0.04} smoothness={3} position={[0, 0.3, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={c} roughness={0.95} />
          </RoundedBox>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[1.6, 0.28, 2]} />
            <meshStandardMaterial color="#4a4038" roughness={0.8} />
          </mesh>
          <RoundedBox args={[1.7, 0.75, 0.09]} radius={0.04} smoothness={3} position={[0, 0.55, -1.03]} castShadow>
            <meshStandardMaterial color="#6f5943" roughness={0.7} />
          </RoundedBox>
          {[-0.42, 0.42].map((x) => (
            <RoundedBox key={x} args={[0.62, 0.14, 0.34]} radius={0.06} smoothness={3} position={[x, 0.51, -0.76]} castShadow>
              <meshStandardMaterial color="#f4f1ec" roughness={1} />
            </RoundedBox>
          ))}
        </group>
      );

    case "estante":
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.8, 0.34]} />
            <meshStandardMaterial color={c} roughness={0.65} />
          </mesh>
          {[0.45, 0.9, 1.35].map((y) => (
            <mesh key={y} position={[0, y, 0.03]} castShadow>
              <boxGeometry args={[1.32, 0.03, 0.3]} />
              <meshStandardMaterial color="#efe9df" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case "armario":
      return (
        <group>
          <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 2.1, 0.55]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, 1.05, 0.29]} castShadow>
              <boxGeometry args={[0.74, 2, 0.03]} />
              <meshStandardMaterial color={c} roughness={0.35} metalness={0.05} />
            </mesh>
          ))}
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 1.05, 0.33]}>
              <boxGeometry args={[0.02, 0.5, 0.02]} />
              <meshStandardMaterial color="#c9ad74" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      );

    case "balcao":
      return (
        <group>
          <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.88, 0.62]} />
            <meshStandardMaterial color={c} roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[2, 0.05, 0.7]} />
            <meshStandardMaterial color="#ecebe7" roughness={0.15} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.93, 0.05]}>
            <boxGeometry args={[0.42, 0.03, 0.32]} />
            <meshStandardMaterial color="#b9bec2" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      );

    case "tv":
      return (
        <group>
          <mesh position={[0, 1.1, -0.05]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 2.2, 0.08]} />
            <meshStandardMaterial color="#6a5137" roughness={0.75} />
          </mesh>
          <mesh position={[0, 1.25, 0.02]} castShadow>
            <boxGeometry args={[1.5, 0.86, 0.05]} />
            <meshStandardMaterial color={c} roughness={0.25} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.25, 0.05]}>
            <planeGeometry args={[1.42, 0.78]} />
            <meshStandardMaterial color="#12161c" emissive="#1d2b3a" emissiveIntensity={0.6} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.22, 0.16]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.44, 0.42]} />
            <meshStandardMaterial color="#2c2c30" roughness={0.5} />
          </mesh>
        </group>
      );

    case "tapete":
      return (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.008, 0]} receiveShadow>
          <planeGeometry args={[2.6, 1.8]} />
          <meshStandardMaterial color={c} roughness={1} />
        </mesh>
      );

    case "planta":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.19, 0.14, 0.4, 24]} />
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
                <meshStandardMaterial color={i % 2 ? c : "#3f6b45"} roughness={1} />
              </mesh>
            );
          })}
        </group>
      );

    case "luminaria":
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.04, 24]} />
            <meshStandardMaterial color="#26262a" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.5, 12]} />
            <meshStandardMaterial color="#26262a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <coneGeometry args={[0.26, 0.34, 24, 1, true]} />
            <meshStandardMaterial color={c} roughness={0.5} side={2} emissive={c} emissiveIntensity={0.35} />
          </mesh>
          <pointLight position={[0, 1.45, 0]} intensity={3.2} color={c} distance={4.5} decay={2} />
        </group>
      );

    case "quadro":
      return (
        <group position={[0, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.68, 0.05]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.78, 0.56]} />
            <meshStandardMaterial color="#e6e9ec" roughness={0.7} />
          </mesh>
        </group>
      );

    case "vaso":
      return (
        <group>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.12, 0.2, 0.56, 24]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <torusGeometry args={[0.12, 0.02, 10, 24]} />
            <meshStandardMaterial color="#8f8677" roughness={0.7} />
          </mesh>
        </group>
      );

    case "churrasqueira":
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1, 0.6]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow>
            <boxGeometry args={[1.5, 0.06, 0.7]} />
            <meshStandardMaterial color="#3b3b3b" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 1.55, -0.1]} castShadow>
            <boxGeometry args={[0.9, 1, 0.4]} />
            <meshStandardMaterial color="#7d7c78" roughness={0.95} />
          </mesh>
        </group>
      );

    case "piscina":
      return (
        <group>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[3.4, 0.12, 2.2]} />
            <meshStandardMaterial color="#e6e2d8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[3, 0.06, 1.8]} />
            <meshStandardMaterial color={c} roughness={0.05} metalness={0.35} transparent opacity={0.85} />
          </mesh>
        </group>
      );

    case "espreguicadeira":
      return (
        <group>
          <mesh position={[0, 0.34, 0]} rotation-x={-0.06} castShadow receiveShadow>
            <boxGeometry args={[0.68, 0.1, 1.8]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.6, -0.72]} rotation-x={-0.9} castShadow>
            <boxGeometry args={[0.68, 0.08, 0.7]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx! * 0.28, 0.14, sz! * 0.7]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      );

    default:
      return null;
  }
}
