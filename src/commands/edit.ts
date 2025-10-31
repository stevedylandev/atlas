import {
	setTextRecord,
	setAddressRecord,
	setResolver as setResolverRecord,
	setPrimaryName as setPrimaryNameRecord,
	setAbiRecord,
} from "@ensdomains/ensjs/wallet";
import { normalize } from "viem/ens";
import { spinner, walletClient } from "../utils";
import { encodeAbi } from "@ensdomains/ensjs/utils";
import { readFile } from "node:fs/promises";

export async function setTxt(options: {
	name: string;
	record: string;
	value: string;
	resolverAddress?: string;
}) {
	try {
		spinner.start();
		const wallet = await walletClient();

		if (!wallet) {
			spinner.stop();
			console.error(
				"Error: Wallet not configured. Please set ATLAS_PRIVATE_KEY environment variable.",
			);
			return;
		}

		// Get resolver if not provided
		let resolverAddress = options.resolverAddress;
		if (!resolverAddress) {
			const { ensClient } = await import("../utils");
			const resolver = await ensClient.getEnsResolver({
				name: normalize(options.name),
			});
			resolverAddress = resolver || undefined;
		}

		if (!resolverAddress) {
			spinner.stop();
			console.error("Error: No resolver found for this name");
			return;
		}

		const hash = await setTextRecord(wallet, {
			name: options.name,
			key: options.record,
			value: options.value,
			resolverAddress: resolverAddress as `0x${string}`,
		});

		spinner.stop();
		if (options.value === "") {
			console.log(`✓ TXT record cleared successfully`);
		} else {
			console.log(`✓ TXT record set successfully`);
		}
		console.log(`Transaction hash: ${hash}`);
	} catch (error) {
		const e = error as { shortMessage?: string; message: string };
		spinner.stop();
		console.error("Error setting TXT record:", e.shortMessage || e.message);
		console.error(
			"If you are receiving HTTP errors consider setting ETH_RPC_URL as an environemnt variable",
		);
	}
}

export async function setAddress(options: {
	name: string;
	coin: string;
	value: string;
	resolverAddress?: string;
}) {
	try {
		spinner.start();
		const wallet = await walletClient();

		if (!wallet) {
			spinner.stop();
			console.error(
				"Error: Wallet not configured. Please set ATLAS_PRIVATE_KEY environment variable.",
			);
			return;
		}

		// Get resolver if not provided
		let resolverAddress = options.resolverAddress;
		if (!resolverAddress) {
			const { ensClient } = await import("../utils");
			const resolver = await ensClient.getEnsResolver({
				name: normalize(options.name),
			});
			resolverAddress = resolver || undefined;
		}

		if (!resolverAddress) {
			spinner.stop();
			console.error("Error: No resolver found for this name");
			return;
		}

		const hash = await setAddressRecord(wallet, {
			name: options.name,
			coin: options.coin,
			value: options.value,
			resolverAddress: resolverAddress as `0x${string}`,
		});

		spinner.stop();
		console.log(`✓ Address record set successfully`);
		console.log(`Transaction hash: ${hash}`);
	} catch (error) {
		const e = error as { shortMessage?: string; message: string };
		spinner.stop();
		console.error("Error setting address record:", e.shortMessage || e.message);
		console.error(
			"If you are receiving HTTP errors consider setting ETH_RPC_URL as an environemnt variable",
		);
	}
}

export async function setResolver(options: {
	name: string;
	resolverAddress: string;
	contract?: "registry" | "nameWrapper";
}) {
	try {
		spinner.start();
		const wallet = await walletClient();

		if (!wallet) {
			spinner.stop();
			console.error(
				"Error: Wallet not configured. Please set ATLAS_PRIVATE_KEY environment variable.",
			);
			return;
		}

		const hash = await setResolverRecord(wallet, {
			name: options.name,
			contract: options.contract || "registry",
			resolverAddress: options.resolverAddress as `0x${string}`,
		});

		spinner.stop();
		console.log(`✓ Resolver set successfully`);
		console.log(`Transaction hash: ${hash}`);
	} catch (error) {
		const e = error as { shortMessage?: string; message: string };
		spinner.stop();
		console.error("Error setting resolver:", e.shortMessage || e.message);
		console.error(
			"If you are receiving HTTP errors consider setting ETH_RPC_URL as an environemnt variable",
		);
	}
}

export async function setPrimaryName(options: { name: string }) {
	try {
		spinner.start();
		const wallet = await walletClient();

		if (!wallet) {
			spinner.stop();
			console.error(
				"Error: Wallet not configured. Please set ATLAS_PRIVATE_KEY environment variable.",
			);
			return;
		}

		const hash = await setPrimaryNameRecord(wallet, {
			name: options.name,
		});

		spinner.stop();
		console.log(`✓ Primary name set successfully`);
		console.log(`Transaction hash: ${hash}`);
	} catch (error) {
		const e = error as { shortMessage?: string; message: string };
		spinner.stop();
		console.error("Error setting primary name:", e.shortMessage || e.message);
		console.error(
			"If you are receiving HTTP errors consider setting ETH_RPC_URL as an environemnt variable",
		);
	}
}

export async function setAbi(options: {
	name: string;
	abiPath: string;
	encodeAs?: "json" | "zlib" | "cbor" | "uri";
	resolverAddress?: string;
}) {
	try {
		spinner.start();
		const wallet = await walletClient();

		if (!wallet) {
			spinner.stop();
			console.error(
				"Error: Wallet not configured. Please set ATLAS_PRIVATE_KEY environment variable.",
			);
			return;
		}

		let encodedAbi: `0x${string}`;

		// Handle null case to clear ABI
		if (options.abiPath === "null") {
			// Encode empty ABI to clear the record
			encodedAbi = await encodeAbi({
				encodeAs: options.encodeAs || "json",
				data: null,
			});
		} else {
			// Read ABI file
			const abiContent = await readFile(options.abiPath, "utf-8");
			const abi = JSON.parse(abiContent);

			// Encode ABI
			encodedAbi = await encodeAbi({
				encodeAs: options.encodeAs || "json",
				data: abi,
			});
		}

		// Get resolver if not provided
		let resolverAddress = options.resolverAddress;
		if (!resolverAddress) {
			const { ensClient } = await import("../utils");
			const resolver = await ensClient.getEnsResolver({
				name: normalize(options.name),
			});
			resolverAddress = resolver || undefined;
		}

		if (!resolverAddress) {
			spinner.stop();
			console.error("Error: No resolver found for this name");
			return;
		}

		const hash = await setAbiRecord(wallet, {
			name: options.name,
			encodedAbi,
			resolverAddress: resolverAddress as `0x${string}`,
		});

		spinner.stop();
		if (options.abiPath === "null") {
			console.log(`✓ ABI record cleared successfully`);
		} else {
			console.log(`✓ ABI record set successfully`);
		}
		console.log(`Transaction hash: ${hash}`);
	} catch (error) {
		const e = error as { shortMessage?: string; message: string };
		spinner.stop();
		console.error("Error setting ABI record:", e.shortMessage || e.message);
		console.error(
			"If you are receiving HTTP errors consider setting ETH_RPC_URL as an environemnt variable",
		);
	}
}
