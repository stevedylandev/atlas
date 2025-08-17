import { getRecords } from "@ensdomains/ensjs/public";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";
import type { Address } from "viem";
import colors from "yoctocolors";
import {
	ensClient,
	getNameAndAddress,
	type ResolveOptions,
	spinner,
} from "../utils";

function printProfile(
	name: string | null,
	address: Address | null,
	records: any,
) {
	console.log(colors.blue(`\nENS Profile`));
	console.log(colors.blue(`============\n`));

	if (name) {
		console.log(`${colors.blue("Name:")}        ${name}`);
	}
	if (address) {
		console.log(`${colors.blue("Address:")}     ${address}`);
	}

	if (records.texts && records.texts.length > 0) {
		console.log(`\n${colors.blue("Text Records:")}`);

		for (const text of records.texts) {
			if (text.value) {
				const displayKey = formatTextKey(text.key);
				console.log(
					`${colors.blue(`${displayKey}:`)}${" ".repeat(Math.max(1, 12 - displayKey.length))}${text.value}`,
				);
			}
		}
	}

	if (records.coins && records.coins.length > 0) {
		console.log(`\n${colors.blue("Coin Records:")}`);
		for (const coin of records.coins) {
			if (coin.value) {
				console.log(
					`${colors.blue(`${coin.name.toUpperCase()}:`)}         ${coin.value}`,
				);
			}
		}
	}

	if (records.contentHash) {
		console.log(`\n${colors.blue("Content Hash:")}`);
		console.log(
			`${colors.blue("Type:")}        ${records.contentHash.protocolType}`,
		);
		console.log(
			`${colors.blue("Hash:")}        ${records.contentHash.decoded}`,
		);
	}

	if (records.resolverAddress) {
		console.log(`\n${colors.blue("Resolver:")}    ${records.resolverAddress}`);
	}

	console.log("");
}

function formatTextKey(key: string): string {
	const keyMappings: { [key: string]: string } = {
		// Global Keys (ENSIP-5)
		avatar: "Avatar",
		description: "Bio",
		display: "Display Name",
		email: "Email",
		keywords: "Keywords",
		mail: "Mail",
		notice: "Notice",
		location: "Location",
		phone: "Phone",
		url: "Website",

		// Service Keys (ENSIP-5)
		"com.github": "GitHub",
		"com.twitter": "Twitter",
		"com.linkedin": "LinkedIn",
		"com.discord": "Discord",
		"com.warpcast": "Warpcast",
		"com.peepeth": "Peepeth",
		"io.keybase": "Keybase",
		"org.telegram": "Telegram",

		// Legacy Keys
		"vnd.github": "GitHub (Legacy)",
		"vnd.peepeth": "Peepeth (Legacy)",
		"vnd.twitter": "Twitter (Legacy)",

		// Additional common records
		timezone: "Timezone",
		pronouns: "Pronouns",
		ipcm: "IPCM",
	};

	return keyMappings[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

export async function profile(options: ResolveOptions) {
	spinner.start();

	const { name, address } = await getNameAndAddress(options);

	if (!name || !address) {
		spinner.stop();
		console.log("404: Name not found");
		return;
	}

	try {
		const subgraphRecords = await getSubgraphRecords(ensClient, {
			name: name as string,
		});
		const records = await getRecords(ensClient, {
			name: name as string,
			coins: ["ETH", "BTC", "LTC", "DOGE", "SOL"],
			texts: [
				...(subgraphRecords?.texts || []),
				// ENSIP-5 Global Keys
				"avatar",
				"description",
				"display",
				"email",
				"location",
				"phone",
				"url",
				// ENSIP-5 Service Keys
				"com.github",
				"com.twitter",
				"com.linkedin",
				"com.discord",
				"com.warpcast",
				"io.keybase",
				"org.telegram",
				// Additional common records
				"timezone",
				"pronouns",
			],
			contentHash: true,
			abi: true,
		});
		spinner.stop();

		printProfile(name, address, records);
	} catch (error) {
		spinner.stop();
		const e = error as { message: string };
		console.error("Error fetching profile record:", e.message);
	}

	return;
}
