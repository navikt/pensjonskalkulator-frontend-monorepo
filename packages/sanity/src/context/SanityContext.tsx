import React from 'react'

import type {
	AlertQueryResult,
	ForbeholdAvsnittQueryResult,
	GuidePanelQueryResult,
	KortforbeholdQueryResult,
	ReadMoreQueryResult,
} from '../types/sanity.types'

interface SanityContext {
	alertData: Record<string, AlertQueryResult[number]>
	guidePanelData: Record<string, GuidePanelQueryResult[number]>
	readMoreData: Record<string, ReadMoreQueryResult[number]>
	forbeholdAvsnittData: ForbeholdAvsnittQueryResult
	kortforbeholdData?: Record<string, KortforbeholdQueryResult[number]>
	isSanityLoading: boolean
}

export const SanityContext = React.createContext<SanityContext>({
	alertData: {},
	guidePanelData: {},
	readMoreData: {},
	forbeholdAvsnittData: [],
	kortforbeholdData: {},
	isSanityLoading: true,
})
