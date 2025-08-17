import { labelhash, namehash } from "viem";
import { ensClient, spinner } from "../utils";
import { normalize } from "viem/ens";
import { addresses } from "@ensdomains/ensjs/contracts";

export async function getLabelHash(options: { name: string }) {
	spinner.start();
	const res = labelhash(options.name as string);
	spinner.stop();
	console.log(res);
}

export async function getNamehash(options: { name: string }) {
	spinner.start();
	const res = namehash(options.name as string);
	spinner.stop();
	console.log(res);
}

export async function getResolver({ name }: { name: string }) {
	spinner.start();
	const resolver = await ensClient.getEnsResolver({
		name: normalize(name),
	});
	spinner.stop();
	console.log(resolver);
}

export function getDeployments() {
	for (const [chainId, contracts] of Object.entries(addresses)) {
		console.log(`Chain ID: ${chainId}`);
		for (const [contractName, contractData] of Object.entries(contracts)) {
			console.log(`  ${contractName}: ${contractData.address}`);
		}
	}
}
