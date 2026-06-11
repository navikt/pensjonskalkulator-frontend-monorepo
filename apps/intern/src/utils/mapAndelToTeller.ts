export function mapAndelToTeller(value?: number | null): number {
	return Math.round((value ?? 0) * 10)
}
