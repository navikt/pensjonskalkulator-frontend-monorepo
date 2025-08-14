import { RootState } from '@/state/store'

export const selectIsLoggedIn = (state: RootState) => state.session.isLoggedIn
