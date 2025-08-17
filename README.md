# atlas

![cover](./cover.png)

A CLI for exploring ENS

## Installation

Install using your package manager of choice

```bash
npm i -g @stevedylandev/atlas
```

Make sure it worked by running `atlas`

```bash
atlas
```

## Usage

### resolve
Resolve an ENS name to an address or vice versa

```bash
# Resolve ENS name to address
atlas resolve vitalik.eth

# Resolve address to ENS name
atlas resolve 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

# Get a specific TXT record
atlas resolve vitalik.eth --txt com.github

# Get content hash
atlas resolve vitalik.eth --contenthash

# Get address for a specific chain
atlas resolve vitalik.eth --chain ETH
```

### profile
Display a complete ENS profile with all records

```bash
# Show full profile for an ENS name or address
atlas profile vitalik.eth
atlas profile 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### namehash
Generate a namehash for an ENS name

```bash
atlas namehash vitalik.eth
```

### labelhash
Generate a labelhash for an ENS name

```bash
atlas labelhash vitalik
```

### resolver
Get the current resolver address for an ENS name

```bash
atlas resolver vitalik.eth
```

### deployments
List all deployed ENS contracts

```bash
atlas deployments
```

## Development

Make sure [Bun](https://bun.sh) is installed

```bash
bun --version
```

Clone the repo and install dependencies

```bash
git clone https://github.com/stevedylandev/atlas
cd atlas
bun install
```

After making changes use the `dev` command to create a symlink to test it

```bash
bun dev

atlas somenewthing
```

> [!NOTE]
> If you don't see any changes, make sure you uninstall any previously installed versions. If you use Bun it should overwrite but you can always manually fix it:
> ```bash
> which atlas | rm xargs
> ```

## Feedback

If you have any issues or feature requests please feel free to [open an issue](https://github.com/stevedylandev/atlas/issues/new)!
