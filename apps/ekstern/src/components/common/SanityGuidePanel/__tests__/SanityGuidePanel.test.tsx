import { describe, it } from 'vitest'

import { SanityGuidePanel } from '@/components/common/SanityGuidePanel'
import { render, screen } from '@/test-utils'

const id = 'vurderer_du_a_velge_afp'

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
    })
  })
})
