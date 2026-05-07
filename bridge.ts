import * as governance from './circuits/output/contract/index.js';

async function startBridge() {
    console.log("📡 GotiHub: Initializing 2026 Polkadot-based Infrastructure...");

    // 1. Using the EXACT export name your terminal confirmed
    const { PolkadotNodeClient } = await import('@midnight-ntwrk/wallet-sdk-node-client');

    const secret = Bun.env.MANAGER_SECRET_KEY;
    const rpcUrl = Bun.env.MIDNIGHT_RPC_URL || 'https://rpc.devnet.midnight.network';

    if (!secret) {
        console.error("❌ ERROR: MANAGER_SECRET_KEY missing in .env");
        process.exit(1);
    }

    // 2. Instantiate with the correct class name
    const provider = new PolkadotNodeClient(rpcUrl);

    // 3. Define the Witnesses (Privacy Shield)
    const witnesses: governance.Witnesses<any> = {
        managerSecret: (context) => {
            console.log("🔒 ZK-Proof Generation: Providing local witness...");
            const secretBuffer = Buffer.from(secret, 'hex');
            return [context.publicState, new Uint8Array(secretBuffer)];
        }
    };

    // 4. Initialize the Governance Contract
    const contract = new governance.Contract(witnesses);

    // 5. Start the Bun HTTP Server
    Bun.serve({
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);

            if (url.pathname === "/v1/governance/approve" && req.method === "POST") {
                try {
                    console.log("🚀 Laravel Triggered Approval. Executing ZK-Circuit...");
                    const result = await contract.circuits.approve_action({ provider });
                    
                    return Response.json({ 
                        status: "SUCCESS", 
                        tx_id: result.transactionId,
                        network: "Midnight Devnet"
                    });
                } catch (error: any) {
                    console.error("❌ ZK Error:", error.message);
                    return Response.json({ error: "ZK-Proof Failed", details: error.message }, { status: 500 });
                }
            }
            return new Response("GotiHub Bridge: Operational");
        },
    });

    console.log("✅ GotiHub Bridge listening on http://localhost:3000");
}

startBridge().catch(console.error);