import React from 'react'

export type IRequestState<T, E> =
  | {
      loadingState: 'SHOULD_LOAD'
      data?: undefined
      status?: undefined
      error?: undefined
    }
  | {
      loadingState: 'ERROR'
      error: E
      status: number
      data?: undefined
    }
  | {
      loadingState: 'LOADING'
      data?: undefined
      status?: undefined
      error?: undefined
    }
  | {
      loadingState: 'SUCCESS'
      data: T
      status: number
      error?: undefined
    }

type Action<T, E> =
  | { action: 'RELOAD' }
  | { action: 'LOADING' }
  | { action: 'SUCCESS'; data: T; status: number }
  | { action: 'ERROR'; error: E; status: number }

type ReducerType<T, E> = React.Reducer<IRequestState<T, E>, Action<T, E>>

type ErrorType = { error: string } & string

export function useRequest<T, E = ErrorType>(
  request: Partial<RequestInfo> | URL
) {
  const initialRequestState: IRequestState<T, E> = {
    loadingState: 'SHOULD_LOAD',
  }

  const requestReducer: ReducerType<T, E> = (
    state,
    event
  ): IRequestState<T, E> => {
    switch (event.action) {
      case 'RELOAD':
        return initialRequestState
      case 'LOADING':
        return {
          ...initialRequestState,
          loadingState: 'LOADING',
        }
      case 'SUCCESS':
        return {
          loadingState: 'SUCCESS',
          data: event.data,
          status: event.status,
        }
      case 'ERROR':
        return {
          loadingState: 'ERROR',
          error: event.error,
          status: event.status,
        }
      /* c8 ignore next 2 - Kan ikke treffes fra hook */
      default:
        return state
    }
  }

  const [state, dispatch] = React.useReducer<ReducerType<T, E>>(
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
          if (resp.ok) {
            resp
              .json()
              .then((data: T) => {
                dispatch({
                  action: 'SUCCESS',
                  status: resp.status,
                  data,
                })
              })
              .catch(async () => {
                dispatch({
                  action: 'SUCCESS',
                  status: resp.status,
                  data: undefined as T,
                })
              })
          } else {
            resp
              .json()
              .then((error: E) => {
                dispatch({
                  action: 'ERROR',
                  error: error,
                  status: resp.status,
                })
              }) /* c8 ignore next 15 */
              .catch(() => {
                dispatch({
                  action: 'ERROR',
                  error: undefined as E,
                  status: resp.status,
                })
              })
          }
        })
        .catch(() => {
          dispatch({
            action: 'ERROR',
            error: undefined as E,
            status: 0,
          })
        })
    }
  }, [state.loadingState])

  return {
    reload,
    data: state?.data,
    isLoading: ['SHOULD_LOAD', 'LOADING'].includes(state.loadingState),
    loadingState: state.loadingState,
    hasError: state.loadingState === 'ERROR',
    status: state.status,
    errorData: state?.error,
  }
}

export default useRequest
