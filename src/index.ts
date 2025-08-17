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
import {
	getDeployments,
	getLabelHash,
	getNamehash,
	getResolver,
	profile as profileCmd,
	resolve as resolveCmd,
} from "./commands";

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
	name: "profile",
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
				"Please provide an address or ENS Name `atlas profile <ADDRESS | vitalik.eth>`",
			);
			return;
		}
		await profileCmd(args);
	},
});

const namehash = command({
	name: "namehash",
	description: "Get a namehash for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "ENS name for the namehash",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Please provide an ENS Name `atlas namehash <vitalik.eth>`");
			return;
		}
		await getNamehash(args);
	},
});

const labelhash = command({
	name: "labelhash",
	description: "Get a labelhash for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "ENS for the labelhash",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Please provide an ENS Name `atlas labelhash <vitalik.eth>`");
			return;
		}
		await getLabelHash(args);
	},
});

const resolver = command({
	name: "resolver",
	description: "Get the current resolver for an ENS Name",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name for the resolver query",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log("Please provide an ENS Name `atlas resolver <vitalik.eth>`");
			return;
		}
		await getResolver(args);
	},
});

const deployments = command({
	name: "deployments",
	description: "Print a list of currently deployed ENS contracts",
	args: {},
	handler: () => {
		getDeployments();
	},
});

const cli = subcommands({
	name: "atlas",
	description: "Explore ENS with Atlas",
	version: "0.0.1",
	cmds: {
		profile,
		resolve,
		namehash,
		labelhash,
		resolver,
		deployments,
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
