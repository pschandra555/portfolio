"use client";

import { useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GlyphFieldGL } from "@/lib/hero/glyphFieldGL";
import { onThemeChange, type FieldInput } from "@/lib/hero/field";

interface Props {
  heroEl: HTMLElement;
  input: FieldInput;
  /** Is the hero on screen? Off-screen, the render loop stops entirely. */
  active: boolean;
  monoFamily: string;
  onReady: () => void;
  /** Called if the GPU can't hold frame rate; the parent swaps in the 2D field. */
  onStruggle?: () => void;
}

/** WebGL tier of the hero cipher field. Loaded lazily, after the hero text has painted. */
export default function CipherFieldGL({ active, ...props }: Props) {
  return (
    <Canvas
      aria-hidden="true"
      orthographic
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, depth: false, stencil: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Field {...props} />
    </Canvas>
  );
}

function Field({ heroEl, input, monoFamily, onReady, onStruggle }: Omit<Props, "active">) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const [field] = useState(() => new GlyphFieldGL(monoFamily));

  useEffect(() => () => field.dispose(), [field]);
  useEffect(() => field.resize(size.width, size.height, dpr, heroEl), [field, size.width, size.height, dpr, heroEl]);
  useEffect(() => onThemeChange(() => field.applyPalette()), [field]);

  useFrame((_, delta) => {
    if (field.tick(delta, input)) onStruggle?.();
    if (field.claimReady()) onReady();
  });

  return (
    <mesh material={field.material} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
