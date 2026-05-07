import { loadContract } from '@midnight-ntwrk/compact-runtime';
import { MidnightProvider } from '@midnight-ntwrk/sdk';
// Loading the 'DNA' from your circuits/output folder
import * as governance from './circuits/output/contract/index.js'; 

async function startBridge() {
    // 1. Connect to the Stable Devnet RPC (No .sh file needed)
    // In 2026, we use the public developer infrastructure for faster iteration
    const provider = await MidnightProvider.connect('https://rpc.devnet.midnight.network');

    // 2. Implement the Witnesses (Your Local Privacy Shield)
    // This satisfies the interface we analyzed in the .d.ts file
    const witnesses: governance.Witnesses<any> = {
        managerSecret: (context) => {
            console.log("🔒 GotiHub Security: Providing local secret for ZK-Proof...");
            // Converting your hex string to a Uint8Array
            const secret = Buffer.from(process.env.MANAGER_SECRET_KEY || '0'.repeat(64), 'hex');
            return [context.publicState, new Uint8Array(secret)];
        }
    };

    // 3. Initialize the Governance Contract
    const contract = new governance.Contract(witnesses);

    // 4. Start the Bun server for Laravel coordination
    Bun.serve({
        port: 3000,
        async fetch(req) {
            const url = new URL(req.url);

            // This is the endpoint your Laravel Approval Engine will hit
            if (url.pathname === "/v1/governance/approve" && req.method === "POST") {
                try {
                    console.log("🚀 Laravel Triggered Approval. Executing ZK-Circuit...");
                    
                    // Generate and submit the proof to the Devnet Ledger
                    const result = await contract.circuits.approve_action({ provider });
                    
                    return new Response(JSON.stringify({ 
                        status: "SUCCESS", 
                        tx_id: result.transactionId,
                        network: "Midnight Devnet"
                    }));
                } catch (error) {
                    console.error("ZK Error:", error);
                    return new Response(JSON.stringify({ error: "ZK-Proof Generation Failed" }), { status: 500 });
                }
            }
            return new Response("GotiHub Midnight Bridge: Active on Devnet");
        },
    });

    console.log("📡 GotiHub Bridge listening on http://localhost:3000");
}

startBridge().catch(console.error);