import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface SessionState {
  isLoggedIn: boolean
}

export const sessionInitialState: SessionState = {
  isLoggedIn: false,
}

export const sessionSlice = createSlice({
  name: 'sessionSlice',
  initialState: sessionInitialState,
  reducers: {
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload
    },
  },
})

export default sessionSlice.reducer

export const sessionActions = sessionSlice.actions

export type SessionSlice = {
  [sessionSlice.name]: ReturnType<(typeof sessionSlice)['reducer']>
}
