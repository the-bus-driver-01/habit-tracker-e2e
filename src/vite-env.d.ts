/// <reference types="vite/client" />
/// <reference types="vitest" />

declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}
