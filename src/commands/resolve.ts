import { getContentHashRecord, getRecords } from "@ensdomains/ensjs/public";
import { normalize } from "viem/ens";
import {
	ensClient,
	getNameAndAddress,
	type ResolveOptions,
	spinner,
} from "../utils";

export async function resolve(options: ResolveOptions) {
	spinner.start();

	const { name, address, input } = await getNameAndAddress(options);

	if (!name || !address) {
		spinner.stop();
		console.log("404: Name not found");
		return;
	}

	// Note: If resolverAddress is provided, inform user it's for reference
	if (options.resolverAddress) {
		spinner.stop();
		console.log(`Note: Using custom resolver: ${options.resolverAddress}`);
		console.log(
			"(Custom resolver support for read operations is limited in current ENS.js version)\n",
		);
		spinner.start();
	}

	// Handle TXT
	if (options.txt) {
		try {
			const res = await ensClient.getEnsText({
				name: normalize(name as string),
				key: options.txt,
			});
			spinner.stop();
			console.log(res);
		} catch (error) {
			const e = error as { shortMessage: string };
			spinner.stop();
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
			spinner.stop();
			console.log(contentHash?.decoded || "Not found");
		} catch (error) {
			const e = error as { shortMessage: string };
			spinner.stop();
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
			spinner.stop();
			console.log(result.coins[0]?.value || "Not found");
		} catch (error) {
			const e = error as { shortMessage: string };
			spinner.stop();
			console.error("Error fetching chain record:", e.shortMessage);
		}
		spinner.stop();
		return;
	}
	// Print basic resolve if no args passed
	if (input === "name") {
		spinner.stop();
		console.log(address);
	} else {
		spinner.stop();
		console.log(name);
	}
	return;
}
