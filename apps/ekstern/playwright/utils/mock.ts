import fs from 'fs/promises'

const MOCKS_DATA_PKG = '@pensjonskalkulator-frontend-monorepo/mocks/data'

export async function loadJSONMock(name: string): Promise<unknown> {
  const filePath = import.meta.resolve(`${MOCKS_DATA_PKG}/${name}`)
  const data = await fs.readFile(new URL(filePath), 'utf-8')
  return JSON.parse(data)
}

export async function loadHTMLMock(name: string): Promise<string> {
  const filePath = import.meta.resolve(`${MOCKS_DATA_PKG}/${name}`)
  return fs.readFile(new URL(filePath), 'utf-8')
}
