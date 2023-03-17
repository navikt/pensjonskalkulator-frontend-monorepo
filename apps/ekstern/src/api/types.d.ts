declare type Pensjonsberegning = {
  pensjonsaar: number
  pensjonsbeloep: number
  alder: number
}

declare type FetchedDataSuccess<T> = {
  data: T
  isLoading: false
  hasError: false
}

declare type FetchedDataError<T> = {
  data: T | null
  isLoading: false
  hasError: true
}

declare type FetchedDataLoading<T> = {
  data: null
  isLoading: true
  hasError: false
}

declare type FetchedData<T> =
  | FetchedDataSuccess<T>
  | FetchedDataError<T>
  | FetchedDataLoading<T>
