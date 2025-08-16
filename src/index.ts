#!/usr/bin/env node --no-deprecation
import {
	binary,
	command,
	flag,
	option,
	optional,
	positional,
	run,
	string,
	subcommands,
} from "cmd-ts";
import { profile as profileCmd, resolve as resolveCmd } from "./commands";

const resolve = command({
	name: "resolve",
	description: "Resolve an ENS name to an address or vice versa",
	args: {
		input: positional({
			type: string,
			description: "Provide either an address or an ENS name to resolve it",
		}),
		txt: option({
			type: optional(string),
			description: "Query a specific TXT record for the ENS or Address",
			long: "txt",
			short: "t",
		}),
		contenthash: flag({
			long: "contenthash",
			short: "c",
			description: "Fetch the content hash for an ENS name or address",
		}),
		chain: option({
			type: optional(string),
			long: "chain",
			description: "Get address for a specific chain",
		}),
	},
	handler: async (args) => {
		if (!args.input) {
			console.log(
				"Please provide an address or ENS Name `atlas resolve <ADDRESS | vitalik.eth>`",
			);
			return;
		}
		await resolveCmd(args);
	},
});

const profile = command({
	name: "resolve",
	description: "Resolve an ENS name to an address or vice versa",
	args: {
		input: positional({
			type: string,
			description: "Provide either an address or an ENS name to resolve it",
		}),
	},
	handler: async (args) => {
		if (!args.input) {
			console.log(
				"Please provide an address or ENS Name `atlas resolve <ADDRESS | vitalik.eth>`",
			);
			return;
		}
		await profileCmd(args);
	},
});

const cli = subcommands({
	name: "atlas",
	description: "Explore ENS with Atlas",
	version: "0.0.1",
	cmds: {
		profile,
		resolve,
	},
});

async function main() {
	try {
		await run(binary(cli), process.argv);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

main();
