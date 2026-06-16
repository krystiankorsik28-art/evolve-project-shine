"use client";
import dynamic from "next/dynamic";

export const Scene3D = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});
