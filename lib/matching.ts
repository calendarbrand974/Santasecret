/**
 * Implémentation de l'algorithme de matching bipartite (Hopcroft-Karp)
 * pour le Secret Santa avec contraintes (pas soi-même, pas de couple)
 */

export interface MatchingNode {
  id: string
  coupleKey?: string
}

export interface ForbiddenEdge {
  giverId: string
  receiverId: string
}

/**
 * Génère un seed aléatoire pour la reproductibilité
 */
export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Mélange un tableau avec un seed (aléatoire déterministe)
 */
function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array]
  let seedValue = 0
  for (let i = 0; i < seed.length; i++) {
    seedValue = ((seedValue << 5) - seedValue) + seed.charCodeAt(i)
    seedValue = seedValue & seedValue
  }
  
  // Simple LCG pour le shuffle
  let random = seedValue
  for (let i = result.length - 1; i > 0; i--) {
    random = (random * 1103515245 + 12345) & 0x7fffffff
    const j = Math.floor((random / 0x7fffffff) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  
  return result
}

/**
 * Construit le graphe bipartite des paires possibles
 */
function buildBipartiteGraph(
  givers: MatchingNode[],
  receivers: MatchingNode[],
  forbiddenEdges: ForbiddenEdge[]
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>()
  const forbiddenSet = new Set(
    forbiddenEdges.map(e => `${e.giverId}:${e.receiverId}`)
  )
  
  // Construire les arêtes possibles
  for (const giver of givers) {
    graph.set(giver.id, new Set())
    
    for (const receiver of receivers) {
      // Pas soi-même
      if (giver.id === receiver.id) continue
      
      // Pas de couple (même coupleKey)
      if (giver.coupleKey && receiver.coupleKey && giver.coupleKey === receiver.coupleKey) {
        continue
      }
      
      // Pas dans les interdictions explicites
      const edgeKey = `${giver.id}:${receiver.id}`
      if (forbiddenSet.has(edgeKey)) continue
      
      graph.get(giver.id)!.add(receiver.id)
    }
  }
  
  return graph
}

/**
 * BFS pour trouver les chemins d'augmentation (Hopcroft-Karp)
 */
function bfs(
  graph: Map<string, Set<string>>,
  pairU: Map<string, string>,
  pairV: Map<string, string>,
  dist: Map<string, number>
): boolean {
  const queue: string[] = []
  
  // Initialiser la queue avec les donneurs non appariés
  for (const u of graph.keys()) {
    if (!pairU.has(u)) {
      dist.set(u, 0)
      queue.push(u)
    } else {
      dist.set(u, Infinity)
    }
  }
  
  dist.set('NIL', Infinity)
  
  while (queue.length > 0) {
    const u = queue.shift()!
    
    if (dist.get(u)! < dist.get('NIL')!) {
      for (const v of graph.get(u) || []) {
        const vPair = pairV.get(v)
        if (vPair === undefined) {
          dist.set('NIL', dist.get(u)! + 1)
        } else if (dist.get(vPair) === Infinity) {
          dist.set(vPair, dist.get(u)! + 1)
          queue.push(vPair)
        }
      }
    }
  }
  
  return dist.get('NIL')! !== Infinity
}

/**
 * DFS pour trouver un chemin d'augmentation (Hopcroft-Karp)
 */
function dfs(
  u: string,
  graph: Map<string, Set<string>>,
  pairU: Map<string, string>,
  pairV: Map<string, string>,
  dist: Map<string, number>
): boolean {
  if (u === 'NIL') return true
  
  for (const v of graph.get(u) || []) {
    const vPair = pairV.get(v)
    // Si le receveur n'est pas apparié, on peut créer le match directement
    if (vPair === undefined) {
      if (dist.get('NIL') === dist.get(u)! + 1) {
        pairU.set(u, v)
        pairV.set(v, u)
        return true
      }
    } else if (dist.get(vPair) === dist.get(u)! + 1) {
      if (dfs(vPair, graph, pairU, pairV, dist)) {
        pairU.set(u, v)
        pairV.set(v, u)
        return true
      }
    }
  }
  
  dist.set(u, Infinity)
  return false
}

/**
 * Algorithme glouton simple pour le matching (fallback)
 * Amélioré pour éviter les paires réciproques
 */
function greedyMatching(
  graph: Map<string, Set<string>>,
  givers: MatchingNode[],
  avoidReciprocal: boolean = false
): Map<string, string> {
  const matching = new Map<string, string>()
  const usedReceivers = new Set<string>()
  
  // Trier les donneurs par nombre d'options (du plus contraint au moins contraint)
  const sortedGivers = [...givers].sort((a, b) => {
    const aOptions = graph.get(a.id)?.size || 0
    const bOptions = graph.get(b.id)?.size || 0
    return aOptions - bOptions
  })
  
  for (const giver of sortedGivers) {
    const options = graph.get(giver.id)
    if (!options) continue
    
    // Si on veut éviter les paires réciproques, filtrer les options
    let availableOptions = Array.from(options)
    if (avoidReciprocal) {
      // Éviter les receveurs qui donneraient à ce donneur (paire réciproque)
      availableOptions = availableOptions.filter(receiverId => {
        // Vérifier si ce receveur donnerait à ce donneur
        const receiverOptions = graph.get(receiverId)
        if (!receiverOptions) return true
        // Si le receveur n'a pas encore de match et pourrait donner à ce donneur, éviter
        if (!matching.has(receiverId) && receiverOptions.has(giver.id)) {
          // Vérifier s'il y a d'autres options pour le receveur
          const otherOptions = Array.from(receiverOptions).filter(r => r !== giver.id && !usedReceivers.has(r))
          // Si le receveur a d'autres options, on peut éviter cette paire réciproque
          return otherOptions.length > 0
        }
        return true
      })
    }
    
    // Trouver la première option disponible
    for (const receiverId of availableOptions.length > 0 ? availableOptions : Array.from(options)) {
      if (!usedReceivers.has(receiverId)) {
        matching.set(giver.id, receiverId)
        usedReceivers.add(receiverId)
        break
      }
    }
  }
  
  return matching
}

/**
 * Algorithme principal de Hopcroft-Karp
 */
function hopcroftKarp(
  graph: Map<string, Set<string>>
): Map<string, string> {
  const pairU = new Map<string, string>() // donneur -> receveur
  const pairV = new Map<string, string>() // receveur -> donneur
  const dist = new Map<string, number>()
  
  let matching = 0
  let iterations = 0
  const maxIterations = graph.size * graph.size // Limite de sécurité
  
  while (bfs(graph, pairU, pairV, dist)) {
    iterations++
    if (iterations > maxIterations) {
      console.error('[MATCHING] Hopcroft-Karp: trop d\'itérations, arrêt pour éviter boucle infinie')
      break
    }
    
    for (const u of graph.keys()) {
      if (!pairU.has(u)) {
        if (dfs(u, graph, pairU, pairV, dist)) {
          matching++
        }
      }
    }
  }
  
  return pairU
}

/**
 * Génère un matching parfait pour le Secret Santa
 * 
 * @param givers Liste des donneurs
 * @param receivers Liste des receveurs (peut être la même que givers)
 * @param forbiddenEdges Liste des paires interdites
 * @param seed Seed pour la reproductibilité
 * @returns Map de giverId -> receiverId, ou null si impossible
 */
export function generateMatching(
  givers: MatchingNode[],
  receivers: MatchingNode[],
  forbiddenEdges: ForbiddenEdge[],
  seed: string,
  avoidReciprocal: boolean = true
): Map<string, string> | null {
  // Si on veut éviter les paires réciproques, essayer plusieurs fois avec des seeds différents
  if (avoidReciprocal) {
    console.log('[MATCHING] Tentative d\'éviter les paires réciproques...')
    let bestMatching: Map<string, string> | null = null
    let minReciprocal = Infinity
    const maxAttempts = 20 // Augmenter le nombre de tentatives
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const attemptSeed = seed + (attempt > 0 ? `_attempt${attempt}` : '')
      const shuffledGiversAttempt = seededShuffle(givers, attemptSeed)
      const shuffledReceiversAttempt = seededShuffle(receivers, attemptSeed)
      const graphAttempt = buildBipartiteGraph(shuffledGiversAttempt, shuffledReceiversAttempt, forbiddenEdges)
      
      // Vérifier qu'il y a au moins une arête pour chaque donneur
      let hasAllOptions = true
      for (const giver of shuffledGiversAttempt) {
        const edges = graphAttempt.get(giver.id)
        if (!edges || edges.size === 0) {
          hasAllOptions = false
          break
        }
      }
      
      if (!hasAllOptions) continue
      
      // Appliquer Hopcroft-Karp
      let matching = hopcroftKarp(graphAttempt)
      
      // Si Hopcroft-Karp échoue, essayer l'algorithme glouton amélioré
      if (matching.size !== shuffledGiversAttempt.length) {
        matching = greedyMatching(graphAttempt, shuffledGiversAttempt, true)
      } else {
        // Même si Hopcroft-Karp a réussi, vérifier les paires réciproques
        let reciprocalCount = 0
        for (const [giverId, receiverId] of matching.entries()) {
          if (matching.get(receiverId) === giverId) {
            reciprocalCount++
          }
        }
        // Si beaucoup de paires réciproques, essayer l'algorithme glouton amélioré
        if (reciprocalCount > shuffledGiversAttempt.length / 3) {
          const greedyMatchingResult = greedyMatching(graphAttempt, shuffledGiversAttempt, true)
          if (greedyMatchingResult.size === shuffledGiversAttempt.length) {
            let greedyReciprocal = 0
            for (const [giverId, receiverId] of greedyMatchingResult.entries()) {
              if (greedyMatchingResult.get(receiverId) === giverId) {
                greedyReciprocal++
              }
            }
            // Utiliser le glouton si il a moins de paires réciproques
            if (greedyReciprocal < reciprocalCount) {
              matching = greedyMatchingResult
            }
          }
        }
      }
      
      if (matching.size === shuffledGiversAttempt.length) {
        // Compter les paires réciproques
        let reciprocalCount = 0
        for (const [giverId, receiverId] of matching.entries()) {
          if (matching.get(receiverId) === giverId) {
            reciprocalCount++
          }
        }
        
        // Si pas de paires réciproques, c'est parfait !
        if (reciprocalCount === 0) {
          console.log(`[MATCHING] ✅ Matching sans paires réciproques trouvé à l'essai ${attempt + 1}`)
          return matching
        }
        
        // Sinon, garder le meilleur (moins de paires réciproques)
        if (reciprocalCount < minReciprocal) {
          minReciprocal = reciprocalCount
          bestMatching = matching
          console.log(`[MATCHING] Meilleur matching jusqu'à présent: ${reciprocalCount} paires réciproques (essai ${attempt + 1})`)
        }
      }
    }
    
    // Si on a trouvé un matching, même avec des paires réciproques
    if (bestMatching) {
      console.log(`[MATCHING] ⚠️ Meilleur matching trouvé avec ${minReciprocal} paires réciproques (sur ${maxAttempts} tentatives)`)
      return bestMatching
    }
    
    // Si aucun matching n'a été trouvé, essayer sans la contrainte
    console.log('[MATCHING] Impossible d\'éviter toutes les paires réciproques, tentative sans contrainte...')
  }
  
  // Code original si avoidReciprocal est false ou si on n'a pas trouvé de matching
  // Reconstruire le graphe avec le seed original
  const shuffledGivers = seededShuffle(givers, seed)
  const shuffledReceivers = seededShuffle(receivers, seed)
  const graph = buildBipartiteGraph(shuffledGivers, shuffledReceivers, forbiddenEdges)
  
  // Vérifier qu'il y a au moins une arête pour chaque donneur
  for (const giver of shuffledGivers) {
    const edges = graph.get(giver.id)
    if (!edges || edges.size === 0) {
      // Impossible : au moins un donneur n'a aucune option
      console.log('[MATCHING] Impossible: donneur', giver.id, 'n\'a aucune option')
      return null
    }
  }
  
  console.log('[MATCHING] Graphe construit,', shuffledGivers.length, 'donneurs,', forbiddenEdges.length, 'paires interdites')
  
  // Vérifier la faisabilité : compter les options par donneur
  for (const giver of shuffledGivers) {
    const edges = graph.get(giver.id)!
    console.log('[MATCHING] Donneur', giver.id, 'a', edges.size, 'options')
  }
  
  // Appliquer Hopcroft-Karp
  const startTime = Date.now()
  let matching = hopcroftKarp(graph)
  const duration = Date.now() - startTime
  console.log('[MATCHING] Hopcroft-Karp terminé en', duration, 'ms,', matching.size, 'matches trouvés')
  
  // Si Hopcroft-Karp échoue, essayer un algorithme glouton simple
  if (matching.size !== shuffledGivers.length) {
    console.log('[MATCHING] Hopcroft-Karp a échoué, tentative avec algorithme glouton...')
    matching = greedyMatching(graph, shuffledGivers, avoidReciprocal)
    console.log('[MATCHING] Algorithme glouton terminé,', matching.size, 'matches trouvés')
  }
  
  // Vérifier que tous les donneurs ont un match
  if (matching.size !== shuffledGivers.length) {
    console.log('[MATCHING] Impossible de trouver un matching complet:', matching.size, '/', shuffledGivers.length)
    return null
  }
  
  return matching
}

/**
 * Rematch partiel : ré-appaire seulement certains donneurs
 * 
 * @param existingMatches Les matches existants (giverId -> receiverId)
 * @param giversToRematch Liste des IDs des donneurs à ré-appairer
 * @param allGivers Tous les donneurs
 * @param allReceivers Tous les receveurs
 * @param forbiddenEdges Paires interdites
 * @param seed Seed pour la randomisation
 * @returns Nouveau matching complet, ou null si impossible
 */
export function partialRematch(
  existingMatches: Map<string, string>,
  giversToRematch: string[],
  allGivers: MatchingNode[],
  allReceivers: MatchingNode[],
  forbiddenEdges: ForbiddenEdge[],
  seed: string
): Map<string, string> | null {
  // Créer un nouveau matching en conservant les matches non touchés
  const newMatching = new Map<string, string>(existingMatches)
  
  // Retirer les matches à ré-appairer
  const receiversToFree = new Set<string>()
  for (const giverId of giversToRematch) {
    const receiverId = newMatching.get(giverId)
    if (receiverId) {
      receiversToFree.add(receiverId)
      newMatching.delete(giverId)
    }
  }
  
  // Créer les listes pour le rematch
  const giversToMatch = allGivers.filter(g => giversToRematch.includes(g.id))
  const availableReceivers = allReceivers.filter(
    r => !Array.from(newMatching.values()).includes(r.id) || receiversToFree.has(r.id)
  )
  
  // Ajouter les contraintes : les receveurs déjà assignés ne doivent pas être réassignés
  const additionalForbidden: ForbiddenEdge[] = [...forbiddenEdges]
  for (const [giverId, receiverId] of newMatching.entries()) {
    if (!giversToRematch.includes(giverId)) {
      // Ce receveur est déjà assigné et ne doit pas être réassigné
      for (const giver of giversToMatch) {
        additionalForbidden.push({ giverId: giver.id, receiverId })
      }
    }
  }
  
  // Générer le matching pour les donneurs à ré-appairer
  const rematch = generateMatching(
    giversToMatch,
    availableReceivers,
    additionalForbidden,
    seed + '_rematch'
  )
  
  if (!rematch) {
    return null
  }
  
  // Fusionner les résultats
  for (const [giverId, receiverId] of rematch.entries()) {
    newMatching.set(giverId, receiverId)
  }
  
  return newMatching
}

