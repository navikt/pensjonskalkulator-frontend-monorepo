import React from 'react'

export interface IRequestState<T> {
  status?: number
  error?: string
  loadingState: 'SHOULD_LOAD' | 'LOADING' | 'ERROR' | 'SUCCESS'
  data?: T
}

type Action<T> =
  | { action: 'RELOAD' }
  | { action: 'LOADING' }
  | { action: 'SUCCESS'; data: T }
  | { action: 'ERROR'; error: string }
  | { action: 'SET_STATUS'; status: number }

type ReducerType<T> = React.Reducer<IRequestState<T>, Action<T>>

export function useRequest<T>(request: Partial<RequestInfo> | URL) {
  const initialRequestState: IRequestState<T> = {
    loadingState: 'SHOULD_LOAD',
  }

  const requestReducer: ReducerType<T> = (state, event) => {
    switch (event.action) {
      case 'RELOAD':
        return {
          ...state,
          loadingState: 'SHOULD_LOAD',
        }
      case 'LOADING':
        return {
          ...initialRequestState,
          loadingState: 'LOADING',
        }
      case 'SUCCESS':
        return {
          ...state,
          loadingState: 'SUCCESS',
          data: event.data,
        }
      case 'ERROR':
        return {
          ...state,
          loadingState: 'ERROR',
          error: event.error,
        }
      case 'SET_STATUS':
        return {
          ...state,
          status: event.status,
        }
      default:
        return state
    }
  }

  const [state, dispatch] = React.useReducer<ReducerType<T>>(
    requestReducer,
    initialRequestState
  )

  const reload = () => dispatch({ action: 'RELOAD' })

  React.useEffect(() => {
    if (state.loadingState === 'SHOULD_LOAD') {
      dispatch({
        action: 'LOADING',
      })
      fetch(request as RequestInfo | URL)
        .then((resp) => {
          dispatch({
            action: 'SET_STATUS',
            status: resp.status,
          })
          return resp.json()
        })
        .then((data) => {
          dispatch({
            action: 'SUCCESS',
            data,
          })
        })
        .catch((error) => {
          dispatch({
            action: 'ERROR',
            error: error,
          })
        })
    }
  }, [state.loadingState])

  return {
    reload,
    data: state.data,
    isLoading: ['SHOULD_LOAD', 'LOADING'].includes(state.loadingState),
    loadingState: state.loadingState,
    hasError: state.loadingState === 'ERROR',
    status: state.status,
  }
}

export default useRequest
