import { RouteObject } from 'react-router-dom'

export const findRoutesWithoutLoaders = (
  routerRoutes: RouteObject[]
): string[] => {
  return routerRoutes
    .map((route) => {
      if (route.children) {
        return findRoutesWithoutLoaders(route.children)
      }
      return route.loader ? undefined : route.path
    })
    .flat()
    .filter((path) => path !== undefined)
    .filter((path) => path !== '/')
}
