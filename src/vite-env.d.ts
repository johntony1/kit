/// <reference types="vite/client" />

declare module "virtual:ills-meta" {
  const meta: { k: string; name: string; title: string; kind: "loop" | "hover"; flat?: string }[];
  export default meta;
}
