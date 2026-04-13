import { execFileSync } from 'node:child_process'
import { appendFileSync, writeFileSync } from 'node:fs'

const [baseSha, headSha] = process.argv.slice(2)

if (!baseSha || !headSha) {
	throw new Error('Expected base and head commit SHAs')
}

const packageNamesFile = '.lockfile-new-packages.txt'
const summaryFile = process.env.GITHUB_STEP_SUMMARY

const diff = execFileSync(
	'git',
	[
		'diff',
		'--unified=0',
		'--no-color',
		baseSha,
		headSha,
		'--',
		'pnpm-lock.yaml',
	],
	{ encoding: 'utf8' }
)

const addedPackageKeys = [
	...new Set(
		diff
			.split('\n')
			.map((line) => {
				const match = line.match(/^\+\s{2}(.+):$/)
				return match ? match[1] : null
			})
			.filter(Boolean)
	),
]

const parsePnpmPackageKey = (packageKey) => {
	const versionSeparator = packageKey.lastIndexOf('@')

	if (versionSeparator <= 0) {
		return null
	}

	const name = packageKey.slice(0, versionSeparator)
	const versionWithPeers = packageKey.slice(versionSeparator + 1)
	const version = versionWithPeers.split('(')[0]

	if (
		!version ||
		version.startsWith('link:') ||
		version.startsWith('file:') ||
		version.startsWith('workspace:')
	) {
		return null
	}

	return {
		packageKey,
		name,
		version,
	}
}

const packageEntries = addedPackageKeys
	.map(parsePnpmPackageKey)
	.filter(Boolean)
	.sort((left, right) => left.packageKey.localeCompare(right.packageKey))

const uniquePackageNames = [
	...new Set(packageEntries.map((entry) => entry.name)),
].sort()
writeFileSync(
	packageNamesFile,
	uniquePackageNames.length > 0 ? `${uniquePackageNames.join('\n')}\n` : ''
)

const readRegistryScripts = (name, version) => {
	try {
		const raw = execFileSync(
			'npm',
			[
				'view',
				`${name}@${version}`,
				'scripts',
				'--json',
				'--registry=https://registry.npmjs.org',
			],
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
		).trim()

		if (!raw) {
			return { status: 'ok', scripts: {} }
		}

		return { status: 'ok', scripts: JSON.parse(raw) }
	} catch (error) {
		return {
			status: 'unavailable',
			reason:
				error instanceof Error
					? error.message.split('\n')[0]
					: 'Unable to query npm metadata',
		}
	}
}

const lifecycleScriptNames = ['preinstall', 'install', 'postinstall']

const packageReports = packageEntries.map((entry) => {
	const registryMetadata = readRegistryScripts(entry.name, entry.version)

	if (registryMetadata.status !== 'ok') {
		return {
			...entry,
			lifecycleScripts: {},
			metadataStatus: registryMetadata.status,
			reason: registryMetadata.reason,
		}
	}

	const scripts =
		registryMetadata.scripts &&
		typeof registryMetadata.scripts === 'object'
			? registryMetadata.scripts
			: {}
	const lifecycleScripts = Object.fromEntries(
		Object.entries(scripts).filter(([scriptName]) =>
			lifecycleScriptNames.includes(scriptName)
		)
	)

	return {
		...entry,
		lifecycleScripts,
		metadataStatus: 'ok',
	}
})

const packagesWithLifecycleScripts = packageReports.filter(
	(report) => Object.keys(report.lifecycleScripts).length > 0
)

const summaryLines = [
	'## Lockfile security review',
	'',
	`Added package entries: ${packageEntries.length}`,
	`Unique package names: ${uniquePackageNames.length}`,
	`Entries with lifecycle scripts: ${packagesWithLifecycleScripts.length}`,
	'',
]

if (packageReports.length === 0) {
	summaryLines.push('No new package entries were added in pnpm-lock.yaml.')
} else {
	summaryLines.push('| Package entry | Lifecycle scripts | Metadata |')
	summaryLines.push('| --- | --- | --- |')

	for (const report of packageReports) {
		const lifecycleSummary =
			Object.entries(report.lifecycleScripts)
				.map(([scriptName, command]) => `${scriptName}: ${command}`)
				.join('<br>') || 'none'
		const metadataSummary =
			report.metadataStatus === 'ok' ? 'ok' : `unavailable: ${report.reason}`

		summaryLines.push(
			`| ${report.packageKey} | ${lifecycleSummary} | ${metadataSummary} |`
		)
	}
}

if (summaryFile) {
	appendFileSync(summaryFile, `${summaryLines.join('\n')}\n`)
}

for (const report of packagesWithLifecycleScripts) {
	const lifecycleSummary = Object.entries(report.lifecycleScripts)
		.map(([scriptName, command]) => `${scriptName}=${command}`)
		.join(', ')
	console.log(
		`::warning title=Lifecycle scripts detected::${report.packageKey} exposes ${lifecycleSummary}`
	)
}

console.log(summaryLines.join('\n'))
