import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { addEnsContracts } from "@ensdomains/ensjs";
import { encodeAbiParameters, namehash, type Hex } from "viem";
import { mainnet } from "viem/chains";

const name = "example.eth";
const resolverAddress = "0x0000000000000000000000000000000000000002";
const transactionHash = `0x${"00".repeat(32)}` as Hex;
let contentHash: Hex = "0x";
let includeAddress = false;

const records = [
	{ protocol: "adnl", id: "cd".repeat(32), prefix: "90b2da05" },
	{ protocol: "tonstorage", id: `00${"ab".repeat(31)}`, prefix: "90b2de05" },
] as const;

const writeContract = mock(
	async (_parameters: { args: readonly unknown[] }) => transactionHash,
);
const ensClient = {
	chain: addEnsContracts(mainnet),
	getEnsAddress: mock(async () => null),
	getEnsName: mock(async () => name),
	getEnsResolver: mock(async () => resolverAddress),
	resolveNameData: mock(async ({ data }: { data: Hex | Hex[] }) => {
		const encoded = encodeAbiParameters([{ type: "bytes" }], [contentHash]);
		const encodedAddress = encodeAbiParameters(
			[{ type: "address" }],
			["0x0000000000000000000000000000000000000001"],
		);
		return {
			resolverAddress,
			resolvedData: Array.isArray(data)
				? data.map((call) => {
						if (call.startsWith("0xbc1c58d1")) {
							return { success: true, returnData: encoded };
						}
						if (includeAddress && call.startsWith("0x3b3b57de")) {
							return { success: true, returnData: encodedAddress };
						}
						return { success: false, returnData: "0x" };
					})
				: encoded,
		};
	}),
};

mock.module("../utils/viem", () => ({
	ensClient,
	walletClient: async () => ({
		chain: ensClient.chain,
		account: {
			address: "0x0000000000000000000000000000000000000001",
			type: "json-rpc",
		},
		writeContract,
	}),
}));
mock.module("../utils/spinner", () => ({
	spinner: { start: () => {}, stop: () => {} },
}));
mock.module("@ensdomains/ensjs/subgraph", () => ({
	getSubgraphRecords: async () => ({ texts: [] }),
}));

const { resolve } = await import("./resolve");
const { profile } = await import("./profile");
const { setContentHash } = await import("./edit");
let log: ReturnType<typeof spyOn<typeof console, "log">>;
let error: ReturnType<typeof spyOn<typeof console, "error">>;

beforeEach(() => {
	contentHash = "0x";
	includeAddress = false;
	writeContract.mockClear();
	ensClient.getEnsAddress.mockReset();
	ensClient.getEnsAddress.mockImplementation(async () => null);
	ensClient.resolveNameData.mockClear();
	log = spyOn(console, "log").mockImplementation(() => {});
	error = spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	log.mockRestore();
	error.mockRestore();
});

for (const record of records) {
	test(`resolve prints a complete ${record.protocol} URI without an ETH address`, async () => {
		contentHash = `0x${record.prefix}${record.id}`;
		ensClient.getEnsAddress.mockImplementation(async () => {
			throw new Error("ETH address lookup failed");
		});
		await resolve({ input: name, contenthash: true });
		expect(log).toHaveBeenCalledWith(`${record.protocol}://${record.id}`);
		expect(ensClient.getEnsAddress).not.toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
	});

	test(`profile displays ${record.protocol} without an ETH address`, async () => {
		contentHash = `0x${record.prefix}${record.id}`;
		await profile({ input: name });
		const output = log.mock.calls.flat().join("\n");
		expect(output).toContain(record.protocol);
		expect(output).toContain(record.id);
		expect(error).not.toHaveBeenCalled();
	});

	test(`profile preserves ${record.protocol} when the ETH address lookup fails`, async () => {
		contentHash = `0x${record.prefix}${record.id}`;
		ensClient.getEnsAddress.mockImplementation(async () => {
			throw new Error("ETH address lookup failed");
		});
		await profile({ input: name });
		const output = log.mock.calls.flat().join("\n");
		expect(output).toContain(record.protocol);
		expect(output).toContain(record.id);
		expect(error).not.toHaveBeenCalled();
	});

	test(`edit prepares the correct ${record.protocol} payload`, async () => {
		await setContentHash({
			name,
			contentHash: `${record.protocol}://${record.id.toUpperCase()}`,
		});
		expect(writeContract).toHaveBeenCalledTimes(1);
		expect(writeContract.mock.calls[0]?.[0].args).toEqual([
			namehash(name),
			`0x${record.prefix}${record.id}`,
		]);
		expect(error).not.toHaveBeenCalled();
	});

	for (const invalid of ["deadbeef", "g".repeat(64)]) {
		test(`edit rejects invalid ${record.protocol} input ${invalid}`, async () => {
			await setContentHash({
				name,
				contentHash: `${record.protocol}://${invalid}`,
			});
			expect(writeContract).not.toHaveBeenCalled();
			expect(error).toHaveBeenCalled();
		});
	}
}

test("edit can still clear the contenthash", async () => {
	await setContentHash({ name, contentHash: "null" });
	expect(writeContract.mock.calls[0]?.[0].args).toEqual([namehash(name), "0x"]);
	expect(error).not.toHaveBeenCalled();
});

test("profile displays address symbols returned by ENS.js v5", async () => {
	includeAddress = true;
	contentHash = `0x${records[1].prefix}${records[1].id}`;
	await profile({ input: name });
	const output = log.mock.calls.flat().join("\n");
	expect(output).toContain("ETH");
	expect(output).toContain("0x0000000000000000000000000000000000000001");
	expect(error).not.toHaveBeenCalled();
});

test("plain address resolution still requires an ETH address", async () => {
	await resolve({ input: name });
	expect(log).toHaveBeenCalledWith("404: Name not found");
	expect(ensClient.resolveNameData).not.toHaveBeenCalled();
});
