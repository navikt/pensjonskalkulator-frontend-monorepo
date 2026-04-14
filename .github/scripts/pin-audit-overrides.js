import { readFileSync, writeFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
let changed = false

const rangePrefix = /^(>=|<=|>|<|~|\^)/

const pinOverrides = (overrides) => {
	for (const [key, val] of Object.entries(overrides)) {
		if (typeof val === 'string' && rangePrefix.test(val)) {
			overrides[key] = val.replace(rangePrefix, '')
			changed = true
			console.log(`Pinned ${key}: ${val} → ${overrides[key]}`)
		}
	}
}

if (pkg.overrides) pinOverrides(pkg.overrides)
if (pkg.pnpm?.overrides) pinOverrides(pkg.pnpm.overrides)

if (changed) {
	writeFileSync('package.json', JSON.stringify(pkg, null, '\t') + '\n')
	console.log('package.json updated with pinned overrides.')
} else {
	console.log('No overrides to pin.')
}
