import React from 'react'

import type {
	AlertQueryResult,
	ForbeholdAvsnittQueryResult,
	GuidePanelQueryResult,
	ReadMoreQueryResult,
} from '../types/sanity.types'

interface SanityContext {
	alertData: Record<string, AlertQueryResult[number]>
	guidePanelData: Record<string, GuidePanelQueryResult[number]>
	readMoreData: Record<string, ReadMoreQueryResult[number]>
	forbeholdAvsnittData: ForbeholdAvsnittQueryResult
	isSanityLoading: boolean
}

export const SanityContext = React.createContext<SanityContext>({
	alertData: {},
	guidePanelData: {},
	readMoreData: {},
	forbeholdAvsnittData: [],
	isSanityLoading: true,
})
