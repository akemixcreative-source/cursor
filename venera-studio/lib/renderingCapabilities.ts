let softwareRenderer: boolean | null = null;

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

/**
 * Browsers do not expose a direct "hardware acceleration disabled" flag.
 * Software WebGL renderers are the most reliable practical signal.
 */
export function hasSoftwareRenderer(): boolean {
  if (softwareRenderer !== null) return softwareRenderer;
  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl", { powerPreference: "low-power" }) ??
    canvas.getContext("experimental-webgl");

  if (!(gl instanceof WebGLRenderingContext)) {
    softwareRenderer = true;
    return softwareRenderer;
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(
    debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  );

  softwareRenderer =
    /swiftshader|llvmpipe|software|microsoft basic render/i.test(renderer);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return softwareRenderer;
}

/** Prefer native, low-cost behavior when richer motion would hurt usability. */
export function prefersLightweightRendering(): boolean {
  if (typeof window === "undefined") return false;

  const connection = (navigator as NavigatorWithConnection).connection;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    connection?.saveData === true ||
    hasSoftwareRenderer()
  );
}
