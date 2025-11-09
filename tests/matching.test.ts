import { describe, it, expect } from 'vitest'
import { generateMatching, partialRematch, generateSeed } from '../lib/matching'

describe('Matching Algorithm', () => {
  it('should generate a perfect matching for simple case', () => {
    const givers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
      { id: '3', coupleKey: undefined },
    ]
    const receivers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
      { id: '3', coupleKey: undefined },
    ]
    const forbiddenEdges: any[] = []
    const seed = generateSeed()
    
    const matching = generateMatching(givers, receivers, forbiddenEdges, seed)
    
    expect(matching).not.toBeNull()
    expect(matching!.size).toBe(3)
    
    // Vérifier qu'aucun donneur ne se tire lui-même
    for (const [giverId, receiverId] of matching!.entries()) {
      expect(giverId).not.toBe(receiverId)
    }
  })
  
  it('should respect forbidden edges', () => {
    const givers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
    ]
    const receivers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
    ]
    const forbiddenEdges = [
      { giverId: '1', receiverId: '2' },
    ]
    const seed = generateSeed()
    
    const matching = generateMatching(givers, receivers, forbiddenEdges, seed)
    
    expect(matching).not.toBeNull()
    expect(matching!.get('1')).not.toBe('2')
  })
  
  it('should respect couple constraints', () => {
    const givers = [
      { id: '1', coupleKey: 'couple-a' },
      { id: '2', coupleKey: 'couple-a' },
      { id: '3', coupleKey: undefined },
    ]
    const receivers = [
      { id: '1', coupleKey: 'couple-a' },
      { id: '2', coupleKey: 'couple-a' },
      { id: '3', coupleKey: undefined },
    ]
    const forbiddenEdges: any[] = []
    const seed = generateSeed()
    
    const matching = generateMatching(givers, receivers, forbiddenEdges, seed)
    
    expect(matching).not.toBeNull()
    // Vérifier que les membres du couple ne se tirent pas entre eux
    const giver1Receiver = matching!.get('1')
    const giver2Receiver = matching!.get('2')
    expect(giver1Receiver).not.toBe('2')
    expect(giver2Receiver).not.toBe('1')
  })
  
  it('should handle partial rematch', () => {
    const existingMatches = new Map([
      ['1', '2'],
      ['2', '3'],
      ['3', '1'],
    ])
    const giversToRematch = ['1']
    const allGivers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
      { id: '3', coupleKey: undefined },
    ]
    const allReceivers = [
      { id: '1', coupleKey: undefined },
      { id: '2', coupleKey: undefined },
      { id: '3', coupleKey: undefined },
    ]
    const forbiddenEdges: any[] = []
    const seed = generateSeed()
    
    const newMatching = partialRematch(
      existingMatches,
      giversToRematch,
      allGivers,
      allReceivers,
      forbiddenEdges,
      seed
    )
    
    expect(newMatching).not.toBeNull()
    expect(newMatching!.size).toBe(3)
    // Le donneur 1 doit avoir un nouveau receveur
    expect(newMatching!.get('1')).not.toBe('2')
    // Les autres doivent être conservés
    expect(newMatching!.get('2')).toBe('3')
    expect(newMatching!.get('3')).toBe('1')
  })
})

