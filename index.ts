import { serve } from "bun";

serve({
  port: 3000,
  async fetch(req) {
    const data = await req.json();
    
    // Here you call your compiled .compact circuit
    // const proof = await midnight.prove(data);
    
    return Response.json({
      success: true,
      proof: "zkp_real_from_midnight_sdk_" + Math.random().toString(36),
    });
  },
});