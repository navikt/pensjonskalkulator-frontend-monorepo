import formlerXmlRaw from '../../resources/formler.xml?raw'
import { type StaticFormelKode, getFormulaKey } from './formler'

const buildFormulaMap = (): Map<string, string> => {
	const map = new Map<string, string>()
	const doc = new DOMParser().parseFromString(formlerXmlRaw, 'application/xml')
	for (const entry of Array.from(doc.getElementsByTagName('entry'))) {
		const key = entry.getAttribute('key')
		if (key) {
			map.set(key, entry.innerHTML.trim())
		}
	}
	return map
}

let formulaMap: Map<string, string> | null = null

/** Returns the MathML markup for a formula code, or null if none exists. */
export function getFormulaMathML(kode: StaticFormelKode): string | null {
	const key = getFormulaKey(kode)
	if (!key) {
		return null
	}
	formulaMap ??= buildFormulaMap()
	const mathml = formulaMap.get(key)
	return mathml
		? `<math xmlns="http://www.w3.org/1998/Math/MathML">${mathml}</math>`
		: null
}

const nodeToText = (node: Node): string => {
	if (node.nodeType === Node.TEXT_NODE) {
		return (node.textContent ?? '').trim()
	}
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return ''
	}
	const element = node as Element
	const parts = Array.from(element.childNodes).map(nodeToText).filter(Boolean)
	switch (element.tagName.toLowerCase()) {
		case 'mi':
		case 'mn':
		case 'mo':
			return (element.textContent ?? '').trim()
		case 'mfrac':
			return `(${parts[0] ?? ''}) / (${parts[1] ?? ''})`
		case 'msup':
			return `${parts[0] ?? ''}^${parts[1] ?? ''}`
		default:
			return parts.join(' ')
	}
}

/** Returns the formula as human-readable text, or null if none exists. */
export function getFormulaText(kode: StaticFormelKode): string | null {
	const mathml = getFormulaMathML(kode)
	if (!mathml) {
		return null
	}
	const doc = new DOMParser().parseFromString(mathml, 'application/xml')
	return nodeToText(doc.documentElement)
}
