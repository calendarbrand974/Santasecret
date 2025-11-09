import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fonction pour générer un code de participation unique
async function generateJoinCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Vérifier l'unicité
  const existing = await prisma.groupMember.findUnique({
    where: { joinCode: code }
  })
  
  if (existing) {
    return generateJoinCode() // Récursif si collision
  }
  
  return code
}

async function main() {
  console.log('🌱 Démarrage du seed...')
  
  // Créer un utilisateur admin temporaire
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      displayName: 'Admin',
      email: 'admin@example.com',
      emailVerified: true,
    },
  })
  
  // Créer le groupe
  const group = await prisma.group.upsert({
    where: { id: 'noel-famille-2025' },
    update: {},
    create: {
      id: 'noel-famille-2025',
      name: 'Noël Famille 2025',
      timeZone: 'Indian/Reunion',
      openAt: new Date('2025-11-11T11:00:00+04:00'),
      revealPolicy: 'reveal_on_open',
      createdByUserId: adminUser.id,
    },
  })
  
  console.log('✅ Groupe créé:', group.name)
  
  // Définir les couples
  const couples = [
    { key: 'couple-a', members: ['Nabil', 'Mylène'] },
    { key: 'couple-b', members: ['Georges', 'Sylvaine'] },
    { key: 'couple-c', members: ['Ruddy', 'Urielle'] },
    { key: 'couple-d', members: ['Frédéric', 'Marine'] },
    { key: 'couple-e', members: ['Anthony', 'Syrielle'] },
    { key: 'couple-f', members: ['Katucia', 'Loïc'] },
  ]
  
  // Créer les membres
  const members = []
  let isFirst = true
  for (const couple of couples) {
    for (const name of couple.members) {
      const joinCode = await generateJoinCode()
      const member = await prisma.groupMember.create({
        data: {
          groupId: group.id,
          role: isFirst ? 'ADMIN' : 'MEMBER', // Le premier membre est admin
          status: 'INVITED',
          coupleKey: couple.key,
          joinCode,
        },
      })
      members.push({ ...member, name })
      console.log(`✅ Membre créé: ${name} (code: ${joinCode}, role: ${member.role})`)
      isFirst = false
    }
  }
  
  // Créer les paires interdites (couples)
  for (const couple of couples) {
    const coupleMembers = members.filter(m => m.coupleKey === couple.key)
    if (coupleMembers.length === 2) {
      // Interdire A -> B et B -> A
      await prisma.forbiddenPair.createMany({
        data: [
          {
            groupId: group.id,
            giverId: coupleMembers[0].id,
            receiverId: coupleMembers[1].id,
          },
          {
            groupId: group.id,
            giverId: coupleMembers[1].id,
            receiverId: coupleMembers[0].id,
          },
        ],
        skipDuplicates: true,
      })
      console.log(`✅ Paires interdites créées pour ${couple.key}`)
    }
  }
  
  console.log('✅ Seed terminé !')
  console.log('\n📋 Codes de participation:')
  for (const member of members) {
    console.log(`  ${member.name}: ${member.joinCode}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

