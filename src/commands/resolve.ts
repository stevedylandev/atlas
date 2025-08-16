import { getContentHashRecord, getRecords } from "@ensdomains/ensjs/public";
import { type Address, isHex } from "viem";
import { normalize } from "viem/ens";
import type { ResolveOptions } from "../utils/types";
import { ensClient } from "../utils/viem";

export async function resolve(options: ResolveOptions) {
	let name: string | null;
	let address: Address | null;
	let input: "address" | "name";

	// Handle name or address
	if (isHex(options.input)) {
		address = options.input;
		input = "address";
		name = await ensClient.getEnsName({
			address: input as Address,
		});
	} else {
		name = options.input;
		input = "name";
		address = await ensClient.getEnsAddress({
			name: normalize(options.input as string),
		});
	}

	// Handle TXT
	if (options.txt) {
		try {
			const res = await ensClient.getEnsText({
				name: normalize(name as string),
				key: options.txt,
			});
			console.log(res);
		} catch (error) {
			const e = error as { shortMessage: string };
			console.error("Error fetching TXT record:", e.shortMessage);
		}
		return;
	}

	// Handle contenthash
	if (options.contenthash) {
		try {
			const contentHash = await getContentHashRecord(ensClient, {
				name: name as string,
			});
			console.log(contentHash?.decoded || "Not found");
		} catch (error) {
			const e = error as { shortMessage: string };
			console.error("Error fetching content hash:", e.shortMessage);
		}
		return;
	}

	if (options.chain) {
		try {
			const result = await getRecords(ensClient, {
				name: name as string,
				coins: [options.chain],
			});
			console.log(result.coins[0]?.value || "Not found");
		} catch (error) {
			const e = error as { shortMessage: string };
			console.error("Error fetching chain record:", e.shortMessage);
		}
		return;
	}
	// Print basic resolve if no args passed
	if (input === "name") {
		console.log(address);
	} else {
		console.log(name);
	}
	return;
}
