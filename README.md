# @aacc/ginit

Easily initialize a local and remote repository

## Usage

```sh
npx @aacc/ginit <repo-name>
```

Automatically add a `.gitignore` file from [GitHub's `.gitignore` templates](https://github.com/github/gitignore)

```sh
TEMPLATE=node npx @aacc/ginit <repo-name>
```

## Important

This tool uses the GitHub GraphQL API and thus requires a GitHub access token. Create an access token with the `repo` scope here: https://github.com/settings/tokens/new.

After generating an access token you can set it as a global environment variable or pass it directly to the `npx` command.

#### Example

```sh
GITHUB_TOKEN="abc123" npx @aacc/ginit <repo-name>
```

Or globally...

```sh
echo 'export AACC_GINIT_TOKEN="abc123"' >> ~/.zshrc

npx @aacc/ginit <repo-name>
```