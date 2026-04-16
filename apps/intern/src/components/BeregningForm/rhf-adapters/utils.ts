import type { FieldError, FieldErrors, FieldValues } from 'react-hook-form'

export function toRawValue(value: unknown): string {
	return typeof value === 'string' || typeof value === 'number'
		? String(value)
		: ''
}

type NestedFormError<TFieldValues extends FieldValues> =
	| FieldError
	| FieldErrors<TFieldValues>
	| NestedFormError<TFieldValues>[]
	| undefined

const isFieldError = (
	error: NestedFormError<FieldValues>
): error is FieldError =>
	Boolean(error && typeof error === 'object' && 'message' in error)

export function getNestedError<TFieldValues extends FieldValues>(
	errors: FieldErrors<TFieldValues>,
	name: string
): string | undefined {
	let error: NestedFormError<TFieldValues> = errors

	for (const segment of name.split('.')) {
		if (Array.isArray(error)) {
			const index = Number(segment)
			if (Number.isNaN(index)) return undefined
			error = error[index]
			continue
		}

		if (!error || isFieldError(error) || !(segment in error)) {
			return undefined
		}

		error = error[
			segment as keyof typeof error
		] as NestedFormError<TFieldValues>
	}

	return isFieldError(error) ? error.message : undefined
}
