import { isHex, type Address } from "viem";
import { normalize } from "viem/ens";
import { ensClient, type ResolveOptions } from "./";

export async function getNameAndAddress(options: ResolveOptions) {
	let name: string | null = null;
	let address: Address | null = null;
	let input: "address" | "name";

	try {
		// Handle name or address
		if (isHex(options.input)) {
			address = options.input;
			input = "address";
			name = await ensClient.getEnsName({
				address: options.input as Address,
			});
		} else {
			name = options.input;
			input = "name";
			address = await ensClient.getEnsAddress({
				name: normalize(options.input as string),
			});
		}

		return { name, address, input };
	} catch (_error) {
		console.error(`Failed to resolve: ${options.input}`);
		return { name: null, address: null, input: "name" };
	}
}
