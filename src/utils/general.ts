import { isHex, type Address } from "viem";
import { normalize } from "viem/ens";
import { ensClient, type ResolveOptions } from "./";

export async function getNameAndAddress(
	options: ResolveOptions,
	requireAddress = true,
) {
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
			if (!options.contenthash) {
				try {
					address = await ensClient.getEnsAddress({
						name: normalize(options.input as string),
					});
				} catch (error) {
					if (requireAddress) throw error;
				}
			}
		}

		return { name, address, input };
	} catch (_error) {
		console.error(`Failed to resolve: ${options.input}`);
		return { name: null, address: null, input: "name" };
	}
}
