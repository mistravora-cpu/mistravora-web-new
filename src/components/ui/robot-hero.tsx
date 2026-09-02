"use client";

// Suppress the THREE.Clock deprecation warning emitted by R3F 9.7.0's
// internal `new THREE.Clock()` call. Project code no longer uses Clock
// directly — this filter removes the library-level noise until R3F ships
// a stable release that uses THREE.Timer internally.
if (typeof window !== "undefined") {
  const origWarn = console.warn;
  const clockWarning = /THREE\.Clock.*deprecated.*THREE\.Timer/;
  console.warn = (...args: unknown[]) => {
    if (args.length > 0 && typeof args[0] === "string" && clockWarning.test(args[0])) return;
    origWarn(...args);
  };
}

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Curve,
  CurvePath,
  Group,
  LineCurve3,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

class HeartCurve extends Curve<Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, optionalTarget = new Vector3()) {
    t = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return optionalTarget.set(x * 0.002, (y + 6) * 0.002, 0);
  }
}

const sharedHeartCurve = new HeartCurve();

function ResponsiveGroup({
  children,
  scale = 1,
}: {
  children: React.ReactNode;
  scale?: number;
}) {
  const { viewport } = useThree();
  const s = Math.min(1.7, viewport.width / 2.5) * scale;
  return <group scale={s}>{children}</group>;
}

function GlassCapsule({
  color,
  power,
  intensity,
}: {
  color: string;
  power: number;
  intensity: number;
}) {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      color: { value: new Color("#ffffff") },
      power: { value: 2.5 },
      intensity: { value: 0.6 },
    }),
    [],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.color.value.set(color);
      materialRef.current.uniforms.power.value = power;
      materialRef.current.uniforms.intensity.value = intensity;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }
        `}
        transparent={true}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const earBaseMat = new MeshStandardMaterial({
  color: "#f0f0f0",
  roughness: 0.5,
});
const earRingMat = new MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.3,
});
const earCenterMat = new MeshStandardMaterial({
  color: "#cccccc",
  roughness: 0.8,
});
const antennaBaseMat = new MeshStandardMaterial({
  color: "#999999",
  roughness: 0.4,
  metalness: 0.5,
});
const antennaStickMat = new MeshStandardMaterial({
  color: "#d0d0d0",
  roughness: 0.4,
  metalness: 0.2,
});
const antennaTipMat = new MeshStandardMaterial({
  color: "#ff3366",
  roughness: 0.2,
  toneMapped: false,
});

function RobotEar({
  position,
  scale = 1,
  isLeft = false,
}: {
  position: [number, number, number];
  scale?: number;
  isLeft?: boolean;
}) {
  const dir = isLeft ? -1 : 1;

  return (
    <group position={position} scale={scale}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={earBaseMat}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.025, 16]} />
      </mesh>

      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={earRingMat}
      >
        <torusGeometry args={[0.032, 0.008, 8, 16]} />
      </mesh>

      <mesh
        position={[dir * 0.012, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={earCenterMat}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.005, 16]} />
      </mesh>

      <group position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh
          position={[0, 0.01, 0]}
          material={antennaBaseMat}
        >
          <cylinderGeometry args={[0.006, 0.008, 0.02, 8]} />
        </mesh>
        <mesh
          position={[0, 0.06, 0]}
          material={antennaStickMat}
        >
          <cylinderGeometry args={[0.003, 0.003, 0.1, 6]} />
        </mesh>
        <mesh
          position={[0, 0.11, 0]}
          material={antennaTipMat}
        >
          <sphereGeometry args={[0.006, 8, 8]} />
        </mesh>
      </group>
    </group>
  );
}

const eyeMat = new MeshBasicMaterial({
  color: new Color(2, 2, 2),
  toneMapped: false,
  transparent: true,
});
const heartMat = new MeshBasicMaterial({
  color: "#ff3366",
  toneMapped: false,
});

function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.15,
  blinkCycle = 3.0,
  isLovedRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  blinkDuration?: number;
  blinkCycle?: number;
  isLovedRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<Group>(null);
  const normalEyesRef = useRef<Group>(null);
  const heartEyeRef = useRef<Mesh>(null);
  // Track elapsed time manually to avoid the deprecated THREE.Clock API.
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current)
      return;

    const isHeart = isLovedRef.current;

    normalEyesRef.current.visible = !isHeart;
    heartEyeRef.current.visible = isHeart;

    elapsedRef.current += delta;
    const cycle = elapsedRef.current % blinkCycle;

    let targetScaleY = 1;

    if (cycle < blinkDuration && !isHeart) {
      const progress = cycle / blinkDuration;
      const blinkClose = Math.sin(progress * Math.PI);

      targetScaleY = Math.max(0.05, 1.0 - blinkClose);
    }

    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025;
    const h = 0.035;
    const r = 0.02;
    const g = 0.005;

    const tPath = new CurvePath<Vector3>();
    tPath.add(
      new LineCurve3(
        new Vector3(-w, g, 0),
        new Vector3(-w, h - r, 0),
      ),
    );
    tPath.add(
      new QuadraticBezierCurve3(
        new Vector3(-w, h - r, 0),
        new Vector3(-w, h, 0),
        new Vector3(-w + r, h, 0),
      ),
    );
    tPath.add(
      new LineCurve3(
        new Vector3(-w + r, h, 0),
        new Vector3(w - r, h, 0),
      ),
    );
    tPath.add(
      new QuadraticBezierCurve3(
        new Vector3(w - r, h, 0),
        new Vector3(w, h, 0),
        new Vector3(w, h - r, 0),
      ),
    );
    tPath.add(
      new LineCurve3(
        new Vector3(w, h - r, 0),
        new Vector3(w, g, 0),
      ),
    );

    const bPath = new CurvePath<Vector3>();
    bPath.add(
      new LineCurve3(
        new Vector3(-w, -g, 0),
        new Vector3(-w, -(h - r), 0),
      ),
    );
    bPath.add(
      new QuadraticBezierCurve3(
        new Vector3(-w, -(h - r), 0),
        new Vector3(-w, -h, 0),
        new Vector3(-w + r, -h, 0),
      ),
    );
    bPath.add(
      new LineCurve3(
        new Vector3(-w + r, -h, 0),
        new Vector3(w - r, -h, 0),
      ),
    );
    bPath.add(
      new QuadraticBezierCurve3(
        new Vector3(w - r, -h, 0),
        new Vector3(w, -h, 0),
        new Vector3(w, -(h - r), 0),
      ),
    );
    bPath.add(
      new LineCurve3(
        new Vector3(w, -(h - r), 0),
        new Vector3(w, -g, 0),
      ),
    );

    return { topPath: tPath, bottomPath: bPath };
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>

      <group ref={normalEyesRef}>
        <mesh material={eyeMat}>
          <tubeGeometry args={[topPath, 20, 0.0035, 8, false]} />
        </mesh>
        <mesh material={eyeMat}>
          <tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} />
        </mesh>
      </group>
    </group>
  );
}

function RobotPrototype({
  neckParams = {
    baseR: 0.25,
    baseH: -0.01,
    midR: 0.23,
    midH: 0.02,
    lipBottomR: 0.27,
    lipBottomH: 0.025,
    lipTopR: 0.28,
    lipTopH: 0.05,
    innerR: 0.24,
    innerDropH: 0.03,
  },
  bodyParams = { bodyBevelR: 0.21, bodyBevelY: 0.38, bodyBevelT: 0.015 },
  color = "#c4c4c4",
  pantallaColor = "#00ffc6",
  pantallaBrillo = 1.2,
  blinkCycle = 3.0,
  metalness = 0.0,
}: {
  neckParams?: Record<string, number>;
  bodyParams?: Record<string, number>;
  color?: string;
  pantallaColor?: string;
  pantallaBrillo?: number;
  blinkCycle?: number;
  metalness?: number;
}) {
  const isLovedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const { viewport } = useThree();

  // Compute the actual ResponsiveGroup scale so we can account for the
  // robot's real size when clamping movement to the viewport bounds.
  const robotScale = Math.min(1.7, viewport.width / 2.5) * 1.2;
  // Robot approximate half-extents in local space (body + head + ears)
  const robotHalfWidth = 0.42 * robotScale;
  const robotHalfHeight = 0.85 * robotScale;

  const textures = useMemo(() => {
    if (typeof document === "undefined") return { colorMap: null, bumpMap: null };
    const size = 256;
    const canvasC = document.createElement("canvas");
    const canvasB = document.createElement("canvas");
    canvasC.width = canvasB.width = size;
    canvasC.height = canvasB.height = size;
    const ctxC = canvasC.getContext("2d");
    const ctxB = canvasB.getContext("2d");
    if (ctxC && ctxB) {
      ctxC.fillStyle = "#dcdcdc";
      ctxC.fillRect(0, 0, size, size);
      ctxB.fillStyle = "#808080";
      ctxB.fillRect(0, 0, size, size);
      // Seeded PRNG (mulberry32) for deterministic, pure texture generation
      const state = { seed: 0x2f6842b1 };
      const rand = () => {
        state.seed |= 0;
        state.seed = (state.seed + 0x6d2b79f5) | 0;
        let t = Math.imul(state.seed ^ (state.seed >>> 15), 1 | state.seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      for (let i = 0; i < 3000; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const r = 0.5 + rand() * 1.5;
        const isDark = rand() > 0.15;
        ctxC.beginPath();
        ctxC.arc(x, y, r, 0, Math.PI * 2);
        ctxC.fillStyle = isDark ? "#222222" : "#dddddd";
        ctxC.fill();
        ctxB.beginPath();
        ctxB.arc(x, y, r, 0, Math.PI * 2);
        ctxB.fillStyle = isDark ? "#000000" : "#ffffff";
        ctxB.fill();
      }
    }
    const texC = new CanvasTexture(canvasC);
    const texB = new CanvasTexture(canvasB);
    texC.wrapS = texB.wrapS = RepeatWrapping;
    texC.wrapT = texB.wrapT = RepeatWrapping;
    texC.repeat.set(6, 3);
    texB.repeat.set(6, 3);
    texC.needsUpdate = true;
    texB.needsUpdate = true;
    return { colorMap: texC, bumpMap: texB };
  }, []);

  const design = {
    pantallaColor: pantallaColor,
    pantallaGrosor: 3.8,
    pantallaBrillo: pantallaBrillo,
    separacionOjos: 0.07,
    tamañoOrejas: 1.3,
    escalaOjos: 1.1,
    parpadeoFrecuencia: blinkCycle,
    parpadeoDuracion: 0.45,
    colorChasis: color,
    alturaCabeza: 0.6,
  };

  const config = {
    moveSpeed: 12,
    bodyRotSpeed: 30,
    headRotSpeed: 40,
    bodyTiltX: 0.0,
    bodyTiltY: 0.95,
    headLookX: 0.3,
    headLookY: 1.8,
  };

  // Base Y offset — robot sits below center on desktop so there's room to
  // move up toward the navbar (without reaching it) and down toward the
  // text (without overlapping it).
  const basePosY = -0.35;

  useFrame((state, delta) => {
    if (!bodyRef.current || !headRef.current) return;

    const dt = Math.min(delta, 0.1);

    const tx = state.pointer.x;
    const ty = state.pointer.y;

    // --- X-axis movement ---
    // Clamp so the robot's edges stay within the viewport width.
    const xLimit = Math.max(0, state.viewport.width / 2 - robotHalfWidth);
    const targetPosX = MathUtils.clamp(tx * xLimit * 0.6, -xLimit, xLimit);
    bodyRef.current.position.x = MathUtils.lerp(
      bodyRef.current.position.x,
      targetPosX,
      config.moveSpeed * dt,
    );

    // --- Y-axis movement ---
    // Clamp so the robot's top edge never reaches the navbar (upper bound)
    // and the robot's bottom edge never goes behind the text (lower bound).
    // Movement is 70% of the available range so the robot clearly moves
    // vertically but always stays fully within the frame.
    const yUpperLimit = Math.max(0, state.viewport.height / 2 - robotHalfHeight - 0.3);
    const yLowerLimit = Math.max(0, state.viewport.height / 2 - robotHalfHeight - 0.1);
    const yRange = Math.min(yUpperLimit, yLowerLimit);
    const targetPosY = MathUtils.clamp(
      basePosY + ty * yRange * 0.7,
      basePosY - yRange,
      basePosY + yRange,
    );
    bodyRef.current.position.y = MathUtils.lerp(
      bodyRef.current.position.y,
      targetPosY,
      config.moveSpeed * dt,
    );

    const relativeX = tx - bodyRef.current.position.x / 2.5;

    const bodyTargetRotY = -relativeX * config.bodyTiltY;

    const bodyTargetRotX = relativeX * relativeX * config.bodyTiltX - ty * 0.25;

    const bodyTargetRotZ = -relativeX * 0.15;

    bodyRef.current.rotation.y = MathUtils.lerp(
      bodyRef.current.rotation.y,
      bodyTargetRotY,
      config.bodyRotSpeed * dt,
    );
    bodyRef.current.rotation.x = MathUtils.lerp(
      bodyRef.current.rotation.x,
      bodyTargetRotX,
      config.bodyRotSpeed * dt,
    );
    bodyRef.current.rotation.z = MathUtils.lerp(
      bodyRef.current.rotation.z,
      bodyTargetRotZ,
      config.bodyRotSpeed * dt,
    );

    const headTargetRotY = relativeX * config.headLookY;
    const headTargetRotX = -ty * config.headLookX;

    headRef.current.rotation.y = MathUtils.lerp(
      headRef.current.rotation.y,
      headTargetRotY,
      config.headRotSpeed * dt,
    );
    headRef.current.rotation.x = MathUtils.lerp(
      headRef.current.rotation.x,
      headTargetRotX,
      config.headRotSpeed * dt,
    );
  });

  const handlePointerDown = (
    e: import("@react-three/fiber").ThreeEvent<PointerEvent>,
  ) => {
    e.stopPropagation();
    isLovedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isLovedRef.current = false;
    }, 2000);
  };

  const neckProfile = useMemo(() => {
    const points = [];

    points.push(new Vector2(neckParams.innerR, neckParams.baseH));

    points.push(new Vector2(neckParams.baseR, neckParams.baseH));

    points.push(new Vector2(neckParams.midR, neckParams.midH));

    points.push(
      new Vector2(neckParams.lipBottomR, neckParams.lipBottomH),
    );

    points.push(new Vector2(neckParams.lipTopR, neckParams.lipTopH));

    points.push(new Vector2(neckParams.innerR, neckParams.lipTopH));

    points.push(
      new Vector2(
        neckParams.innerR,
        neckParams.lipTopH - neckParams.innerDropH,
      ),
    );
    return points;
  }, [neckParams]);

  const headMat = useMemo(() => {
    return new MeshStandardMaterial({
      color: "#111111",
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  if (!textures.colorMap) return null;

  return (
    <group
      ref={bodyRef}
      position={[0, -0.35, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <mesh>
        <sphereGeometry
          args={[0.43, 32, 32, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]}
        />
        <meshStandardMaterial
          color={design.colorChasis}
          map={textures.colorMap || undefined}
          bumpMap={textures.bumpMap || undefined}
          bumpScale={0.005}
          roughness={1.0}
          metalness={metalness}
          envMapIntensity={0.0}
        />
      </mesh>

      {bodyParams.bodyBevelT > 0 && (
        <mesh
          position={[0, bodyParams.bodyBevelY, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[bodyParams.bodyBevelR, bodyParams.bodyBevelT, 16, 32]}
          />
          <meshStandardMaterial
            color={design.colorChasis}
            map={textures.colorMap || undefined}
            bumpMap={textures.bumpMap || undefined}
            bumpScale={0.005}
            roughness={1.0}
            metalness={metalness}
            envMapIntensity={0.0}
          />
        </mesh>
      )}

      <mesh position={[0, 0.38, 0]}>
        <latheGeometry args={[neckProfile, 32]} />
        <meshStandardMaterial
          color={design.colorChasis}
          map={textures.colorMap || undefined}
          bumpMap={textures.bumpMap || undefined}
          bumpScale={0.005}
          roughness={1.0}
          metalness={metalness}
          envMapIntensity={0.0}
        />
      </mesh>

      <group ref={headRef} position={[0, design.alturaCabeza, 0]}>
        <mesh material={headMat}>
          <sphereGeometry args={[0.28, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule
          color={design.pantallaColor}
          power={design.pantallaGrosor}
          intensity={design.pantallaBrillo}
        />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye
            position={[-design.separacionOjos, 0, 0]}
            rotation={[0, -0.2, 0]}
            scale={design.escalaOjos}
            blinkDuration={design.parpadeoDuracion}
            blinkCycle={design.parpadeoFrecuencia}
            isLovedRef={isLovedRef}
          />
          <RobotEye
            position={[design.separacionOjos, 0, 0]}
            rotation={[0, 0.2, 0]}
            scale={design.escalaOjos}
            blinkDuration={design.parpadeoDuracion}
            blinkCycle={design.parpadeoFrecuencia}
            isLovedRef={isLovedRef}
          />
        </group>

        <RobotEar
          position={[-0.29, 0, 0]}
          isLeft={true}
          scale={design.tamañoOrejas}
        />
        <RobotEar
          position={[0.29, 0, 0]}
          isLeft={false}
          scale={design.tamañoOrejas}
        />
      </group>
    </group>
  );
}

export interface RobotHeroProps {
  color?: string;
  scale?: number;
  pantallaColor?: string;
  pantallaBrillo?: number;
  blinkCycle?: number;
  metalness?: number;
}

export function RobotHero({
  color = "#c4c4c4",
  scale = 1.2,
  pantallaColor = "#00ffc6",
  pantallaBrillo = 1.2,
  blinkCycle = 3.0,
  metalness = 0.0,
}: RobotHeroProps = {}) {
  const entorno = {
    luzAmbiente: 0.75,
    sombraOpacidad: 0.85,
    sombraBlur: 1.7,
  };

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={entorno.luzAmbiente} color="#ffffff" />
        <hemisphereLight args={["#ffffff", "#888888", 0.3]} />
        <ResponsiveGroup scale={scale}>
          {/* Simple shadow plane — replaces @react-three/drei ContactShadows
              to eliminate the entire drei bundle (~200KB). */}
          <mesh position={[0, -1.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={entorno.sombraOpacidad * 0.4}
              depthWrite={false}
            />
          </mesh>
          <RobotPrototype
            neckParams={{
              baseR: 0.215,
              baseH: -0.05,
              midR: 0.28,
              midH: 0.02,
              lipBottomR: 0.295,
              lipBottomH: 0.045,
              lipTopR: 0.27,
              lipTopH: 0.055,
              innerR: 0.1,
              innerDropH: 0.0,
            }}
            bodyParams={{
              bodyBevelR: 0.235,
              bodyBevelY: 0.34,
              bodyBevelT: 0.025,
            }}
            color={color}
            pantallaColor={pantallaColor}
            pantallaBrillo={pantallaBrillo}
            blinkCycle={blinkCycle}
            metalness={metalness}
          />
        </ResponsiveGroup>
      </Canvas>
    </div>
  );
}
