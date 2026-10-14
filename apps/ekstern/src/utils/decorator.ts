import { injectDecoratorClientSide } from '@navikt/nav-dekoratoren-moduler'

import { getSelectedLanguage } from '@/context/LanguageProvider/utils'

const shouldInjectClientSide = () =>
  document
    .querySelector('meta[name="decorator-render"]')
    ?.getAttribute('content') === 'client-side'

export const injectDecoratorIfLocal = () => {
  if (!shouldInjectClientSide()) {
    return
  }

  void injectDecoratorClientSide({
    env: 'dev',
    params: {
      context: 'privatperson',
      chatbot: false,
      logoutWarning: true,
      language: getSelectedLanguage(),
      redirectToUrl: `${window.location.origin}/pensjon/kalkulator/start`,
    },
  })
}
