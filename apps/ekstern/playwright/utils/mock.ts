import fs from 'fs/promises'

export async function loadJSONMock(name: string): Promise<unknown> {
  const fileUrl = new URL(`../mocks/${name}`, import.meta.url)
  const data = await fs.readFile(fileUrl, 'utf-8')
  return JSON.parse(data)
}

export async function loadHTMLMock(name: string): Promise<string> {
  const fileUrl = new URL(`../mocks/${name}`, import.meta.url)
  return fs.readFile(fileUrl, 'utf-8')
}
