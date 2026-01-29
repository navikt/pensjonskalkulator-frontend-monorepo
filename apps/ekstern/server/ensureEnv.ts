export const ensureEnv = <T extends Record<string, string>>(variables: T) => {
  return Object.entries(variables).reduce(
    (acc: Record<string, string>, [key, value]: [string, string]) => {
      const newVar = process.env[value]
      if (!newVar) {
        console.error(`Could not find enviroment variable: ${value}`)
        process.exit(1)
      }
      return {
        ...acc,
        [key]: newVar,
      }
    },
    {}
  ) as T
}
