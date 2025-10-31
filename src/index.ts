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
	setTxt as setTxtCmd,
	setAddress as setAddressCmd,
	setResolver as setResolverCmd,
	setPrimaryName as setPrimaryNameCmd,
	setAbi as setAbiCmd,
	setContentHash as setContentHashCmd,
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
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description: "Specify a custom resolver address",
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
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description: "Specify a custom resolver address",
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

const editTxt = command({
	name: "txt",
	description:
		"Set TXT record for an ENS name (use 'null' to clear the record)",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		record: positional({
			type: string,
			description: "The type of TXT you want to update, e.g. com.discord",
		}),
		value: positional({
			type: string,
			description:
				"Value of the TXT record being set (use 'null' to clear), e.g. myusername",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (optional, will auto-detect if not provided)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.record || args.value === undefined) {
			console.log(
				"Please provide all required arguments: `atlas edit txt <name> <record> <value>`",
			);
			return;
		}
		await setTxtCmd({
			...args,
			value: args.value === "null" ? "" : args.value,
		});
	},
});

const editAddress = command({
	name: "address",
	description: "Set address record for a specific coin/chain",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		coin: positional({
			type: string,
			description: "Coin/chain identifier (e.g. ETH, BTC, SOL)",
		}),
		value: positional({
			type: string,
			description: "Address value to set",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (optional, will auto-detect if not provided)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.coin || !args.value) {
			console.log(
				"Please provide all required arguments: `atlas edit address <name> <coin> <value>`",
			);
			return;
		}
		await setAddressCmd(args);
	},
});

const editResolver = command({
	name: "resolver",
	description: "Set the resolver for an ENS name",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		resolverAddress: positional({
			type: string,
			description: "New resolver address",
		}),
		contract: option({
			type: optional(string),
			long: "contract",
			short: "c",
			description:
				"Contract to use: registry or nameWrapper (default: registry)",
		}),
	},
	handler: async (args) => {
		if (!args.name || !args.resolverAddress) {
			console.log(
				"Please provide all required arguments: `atlas edit resolver <name> <resolverAddress>`",
			);
			return;
		}
		await setResolverCmd({
			...args,
			contract: (args.contract as "registry" | "nameWrapper") || "registry",
		});
	},
});

const editPrimaryName = command({
	name: "primary",
	description: "Set the primary ENS name for your address",
	args: {
		name: positional({
			type: string,
			description: "ENS name to set as primary",
		}),
	},
	handler: async (args) => {
		if (!args.name) {
			console.log(
				"Please provide an ENS name: `atlas edit primary <vitalik.eth>`",
			);
			return;
		}
		await setPrimaryNameCmd(args);
	},
});

const editAbi = command({
	name: "abi",
	description:
		"Set ABI record for an ENS name (use 'null' to clear the record)",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		abiPath: positional({
			type: string,
			description: "Path to ABI JSON file (use 'null' to clear)",
		}),
		encodeAs: option({
			type: optional(string),
			long: "encode",
			short: "e",
			description: "Encoding format: json, zlib, cbor, or uri (default: json)",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (optional, will auto-detect if not provided)",
		}),
	},
	handler: async (args) => {
		if (!args.name || args.abiPath === undefined) {
			console.log(
				"Please provide all required arguments: `atlas edit abi <name> <abiPath>`",
			);
			return;
		}
		await setAbiCmd({
			...args,
			abiPath: args.abiPath,
			encodeAs: (args.encodeAs as "json" | "zlib" | "cbor" | "uri") || "json",
		});
	},
});

const editContentHash = command({
	name: "contenthash",
	description:
		"Set content hash for an ENS name (use 'null' to clear the record)",
	args: {
		name: positional({
			type: string,
			description: "Target ENS name",
		}),
		contentHash: positional({
			type: string,
			description:
				"Content hash value (e.g. ipfs://, ipns://, or 'null' to clear)",
		}),
		resolverAddress: option({
			type: optional(string),
			long: "resolver",
			short: "r",
			description:
				"Resolver address (optional, will auto-detect if not provided)",
		}),
	},
	handler: async (args) => {
		if (!args.name || args.contentHash === undefined) {
			console.log(
				"Please provide all required arguments: `atlas edit contenthash <name> <contentHash>`",
			);
			return;
		}
		await setContentHashCmd(args);
	},
});

const edit = subcommands({
	name: "edit",
	description: "Edit records for an ENS name",
	cmds: {
		txt: editTxt,
		address: editAddress,
		resolver: editResolver,
		primaryName: editPrimaryName,
		abi: editAbi,
		contenthash: editContentHash,
	},
});

const cli = subcommands({
	name: "atlas",
	description: `

        ++   ++
     +++  +++  +++             ##       ##########    ##              ##         #####
   +++++ +++++  ++++          ####          ##        ##             ###       ##     ##
  +++++ +++++++ +++++         ## ##         ##        ##            ## ##      ##
  +++++ +++++++ +++++        ##  ##         ##        ##            ##  ##     #####
  +++++ +++++++ +++++        #    ##        ##        ##           ##   ##          ####
  +++++ +++++++ +++++       #########       ##        ##          #########            ##
   +++++ +++++  ++++       ##      ##       ##        ##          ##      ##   ##     ##
     +++  +++  +++         ##       ##      ##        #########  ##       ##     ######
         ++  +



         A CLI for exploring ENS
         https://github.com/stevedylandev/atlas

	`,
	version: "0.1.0",
	cmds: {
		profile,
		resolve,
		namehash,
		labelhash,
		resolver,
		deployments,
		edit,
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
