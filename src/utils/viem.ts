import { addEnsContracts } from "@ensdomains/ensjs";
import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const ensClient = createPublicClient({
	chain: {
		...addEnsContracts(mainnet),
		subgraphs: { ens: { url: "https://api.alpha.ensnode.io/subgraph" } },
	},
	transport: http(process.env.ETH_RPC_URL || "https://eth.drpc.org"),
});

export async function walletClient() {
	const privateKey = process.env.ATLAS_PRIVATE_KEY;

	if (!privateKey) {
		return null;
	}

	const account = privateKeyToAccount(privateKey as `0x${string}`);

	return createWalletClient({
		account,
		chain: addEnsContracts(mainnet),
		transport: http(process.env.ETH_RPC_URL || "https://eth.drpc.org"),
	});
}
