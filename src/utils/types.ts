import type { Address } from "viem";

export type ResolveOptions = {
	input: string | Address | null;
	chain?: string;
	contenthash?: boolean;
	txt?: string;
	resolverAddress?: string;
};
