export const formaterAlderString = (aar: number, md: number) => {
	return md > 0 ? `${aar} år og ${md} måneder` : `${aar} år`
}
