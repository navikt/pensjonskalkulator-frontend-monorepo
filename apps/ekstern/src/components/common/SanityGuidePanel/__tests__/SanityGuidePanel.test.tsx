import { describe, it } from 'vitest'

import { SanityGuidePanel } from '@/components/common/SanityGuidePanel'
import { render, screen } from '@/test-utils'

const id = 'vurderer_du_a_velge_afp'
const title = 'Vurderer du å velge AFP?'
const content = 'Lorem'

describe('SanityGuidePanel', () => {
  describe('Gitt at innhold finnes i Sanity', () => {
    it('rendrer SanityGuidePanel med korrekte props og innhold når children finnes', async () => {
      render(
        <SanityGuidePanel id={id}>
          <div>Child content</div>
        </SanityGuidePanel>
      )

      const guidePanelElement = await screen.findByTestId(id)
      expect(guidePanelElement).toBeVisible()

      expect(screen.getByText(title)).toBeVisible()
      expect(screen.getByText(content)).toBeVisible()
      expect(screen.queryByText('Child content')).toBeVisible()
    })
  })
})
