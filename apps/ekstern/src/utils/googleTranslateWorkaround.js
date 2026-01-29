/* eslint-disable */
/* Fix for Google Translate. Google translate oversetter innhold og React mister referansen til elementer (da disse erstattes med <font> elementer)


Se Chrome discussion: https://issues.chromium.org/issues/41407169
Se Issue: https://github.com/facebook/react/issues/11538#issuecomment-417504600 (er lukket, men feil er fremdeles til stede)

Løsning hentet fra: https://github.com/facebook/react/issues/11538#issuecomment-417504600
*/
export function applyGoogleTranslateFix() {
  if (typeof window !== 'undefined' && !window.__googleTranslateFixApplied) {
    const originalRemoveChild = Node.prototype.removeChild

    Node.prototype.removeChild = function (child) {
      try {
        return originalRemoveChild.call(this, child)
      } catch (error) {
        if (error.name === 'NotFoundError') {
          // Prevents crashes by ignoring the error
          console.warn('Google Translate workaround removeChild')
          return child
        }
        throw error
      }
    }

    const originalInsertBefore = Node.prototype.insertBefore

    Node.prototype.insertBefore = function (newNode, referenceNode) {
      try {
        return originalInsertBefore.call(this, newNode, referenceNode)
      } catch (error) {
        if (error.name === 'NotFoundError') {
          console.warn('Google Translate workaround insertBefore')
          // If insertion fails, append the element instead
          return this.appendChild(newNode)
        }
        throw error
      }
    }

    window.__googleTranslateFixApplied = true
  }
}
