import { getHost } from '@/paths'

describe('getHosts', () => {
  it('gir riktig hostnavn ved test', () => {
    expect(getHost('test')).toEqual('http://localhost:8088')
  })

  it('gir tom string når mode er development eller production', () => {
    expect(getHost('development')).toEqual('')
    expect(getHost('production')).toEqual('')
  })
})
