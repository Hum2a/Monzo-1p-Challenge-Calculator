/**
 * Stub for @vercel/og - prevents bundling resvg.wasm (~2MB) when not using dynamic OG images.
 * Cloudflare Workers free tier has a 3 MiB limit; excluding this keeps the bundle under limit.
 * Exports minimal ImageResponse that throws if invoked (we use static metadata only).
 */
export class ImageResponse extends Response {
  constructor() {
    super(
      new ReadableStream({
        start(c) {
          c.enqueue(
            new TextEncoder().encode(
              "Dynamic OG images disabled. Use static opengraph-image.png."
            )
          );
          c.close();
        },
      }),
      { status: 501, headers: { "content-type": "text/plain" } }
    );
  }
}

export const experimental_FigmaImageResponse = async () => {
  throw new Error("FigmaImageResponse disabled for bundle size.");
};
