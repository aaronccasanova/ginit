#!/usr/bin/env node

const { Octokit } = require('@octokit/core')
const { $ } = require('zx')
const dotenv = require('dotenv')
const fetch = require('node-fetch')

$.verbose = false

dotenv.config()

const githubToken = process.env.GITHUB_TOKEN || process.env.AACC_GINIT_TOKEN
const template = process.env.TEMPLATE
const repo = process.argv[2]

if (!githubToken) {
  throw new Error(
    'The GITHUB_TOKEN environment variable is required. Create an access token with the `repo` scope here: https://github.com/settings/tokens/new',
  )
}

if (!repo)
  throw new Error(
    'The repository name is required. Please try again: npx @aacc/ginit <repo-name>',
  )

const octokit = new Octokit({ auth: githubToken })

// TEMPLATE=node npx @aacc/ginit <repo-name>
async function main() {
  console.log('\nRetrieving GitHub user data...\n')
  const user = await getUser()

  console.log(`Creating the "${repo}" repository...\n`)
  const repository = await createRepository({
    user,
    repo,
  })

  console.log(`Initializing the "${repo}" repository...\n`)
  await $`git init`
  await $`echo "\n" >> README.md`
  await $`git add README.md`
  await addGitIgnore(template)

  console.log(`Committing @aacc/ginit files...\n`)
  await $`git commit -m "@aacc/ginit - Ginitial commit"`

  console.log(`Updating default branch to "main"...\n`)
  await $`git branch -M main`

  console.log(`Setting the remote origin...\n`)
  await $`git remote add origin https://github.com/${user.login}/${repo}.git`

  console.log(`Pushing changes to the remote origin...\n`)
  await $`git push -u origin main`

  console.log(`\n\nDone!\n`)
}

async function getUser() {
  const query = /* graphql */ `
    query UserData {
      viewer {
        login
        id    
      }
    }
  `

  const userData = await octokit.graphql(query)

  return userData.viewer
}

async function createRepository(options = {}) {
  const { repo, user } = options

  const mutation = /* graphql */ `
    mutation CreateRepository($input: CreateRepositoryInput!) {
      createRepository (input: $input) {
        repository {
          name
        }
      }
    }
	`

  const result = await octokit.graphql(mutation, {
    input: {
      name: repo,
      ownerId: user.id,
      visibility: 'PRIVATE',
    },
  })

  return result.createRepository.repository
}

// https://github.com/github/gitignore
async function addGitIgnore(template) {
  if (!template) return

  const gitignore = await fetch(
    `https://raw.githubusercontent.com/github/gitignore/master/${capitalize(
      template,
    )}.gitignore`,
  )

  const gitignoreText = await gitignore.text()

  await $`echo ${gitignoreText} >> .gitignore`
  await $`git add .gitignore`
}

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1)
}

main()
