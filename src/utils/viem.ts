import { addEnsContracts } from "@ensdomains/ensjs";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export const ensClient = createPublicClient({
	chain: addEnsContracts(mainnet),
	transport: http("https://eth.llamarpc.com"),
});
