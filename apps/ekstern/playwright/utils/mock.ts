import fs from 'fs/promises'

const MOCKS_PATH = '../../../../packages/mocks/src/data'

// Files that have playwright-specific versions (different from MSW mocks)
const PLAYWRIGHT_SPECIFIC_FILES = new Set([
  'afp-offentlig-livsvarig.json',
  'omstillingsstoenad-og-gjenlevende.json',
])

function resolveMockName(name: string): string {
  if (PLAYWRIGHT_SPECIFIC_FILES.has(name)) {
    return `playwright-${name}`
  }
  return name
}

export async function loadJSONMock(name: string): Promise<unknown> {
  const resolvedName = resolveMockName(name)
  const fileUrl = new URL(`${MOCKS_PATH}/${resolvedName}`, import.meta.url)
  const data = await fs.readFile(fileUrl, 'utf-8')
  return JSON.parse(data)
}

export async function loadHTMLMock(name: string): Promise<string> {
  const fileUrl = new URL(`${MOCKS_PATH}/${name}`, import.meta.url)
  return fs.readFile(fileUrl, 'utf-8')
}
