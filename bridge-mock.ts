// bridge-mock.ts
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Only respond to the /prove endpoint
    if (url.pathname === "/prove" && req.method === "POST") {
      const body = await req.json();
      
      console.log("🚀 Midnight Bridge received payload:", body);

      return Response.json({
        success: true,
        proof_id: "zkp_midnight_devnet_" + Math.random().toString(36).substring(2, 12),
        network: "Midnight-Devnet-v1",
        timestamp: new Date().toISOString()
      });
    }

    return new Response("GotiHub Midnight Bridge Mock is Online", { status: 200 });
  },
});

console.log(`✅ Midnight Bridge Sidecar running at http://localhost:${server.port}`);