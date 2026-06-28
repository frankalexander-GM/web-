import { db } from '../src/lib/db'

const dicebear = (seed: string, style = 'bottts-neutral') =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed,db2777,0891b2,10b981`

const gradient = (c1: string, c2: string, label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><text x='50%' y='52%' font-family='sans-serif' font-size='48' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const gradientWide = (c1: string, c2: string, label: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='240'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='800' height='240' fill='url(#g)'/><text x='50%' y='54%' font-family='sans-serif' font-size='42' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

async function main() {
  console.log('🌱 Limpiando base de datos...')
  await db.chatMessage.deleteMany()
  await db.purchase.deleteMany()
  await db.storeItem.deleteMany()
  await db.stream.deleteMany()
  await db.follow.deleteMany()
  await db.comment.deleteMany()
  await db.like.deleteMany()
  await db.post.deleteMany()
  await db.communityMember.deleteMany()
  await db.community.deleteMany()
  await db.user.deleteMany()

  console.log('👥 Creando usuarios y streamers...')
  const streamersData = [
    { username: 'neonblaze', displayName: 'NeonBlaze', bio: 'Streamer de Valorant y FPS. Top 500 Radiante 🔥', platform: 'twitch', channel: 'shroud', color: '#a855f7' },
    { username: 'pixelqueen', displayName: 'PixelQueen', bio: 'Roblox + Minecraft todos los días. Construyendo imperios 🧱', platform: 'kick', channel: 'trainwreckstv', color: '#ec4899' },
    { username: 'shadowgamer', displayName: 'ShadowGamer', bio: 'Speedruns de Minecraft y challenges extremos ⚡', platform: 'youtube', channel: 'UCxxxxxxxx', color: '#06b6d4' },
    { username: 'lunastar', displayName: 'LunaStar', bio: 'Just chatting, música y buena vibra 🌙', platform: 'twitch', channel: 'pokimane', color: '#8b5cf6' },
    { username: 'toxicshark', displayName: 'ToxicShark', bio: 'League of Legends Challenger. Mid main 🦈', platform: 'twitch', channel: 'faker', color: '#10b981' },
    { username: 'cyberwolf', displayName: 'CyberWolf', bio: 'GTA RP roleplay y acción sin límite 🐺', platform: 'kick', channel: 'xqc', color: '#f59e0b' },
    { username: 'auroravibes', displayName: 'AuroraVibes', bio: 'Free Fire competitive. Top 1 mundial 🎮', platform: 'youtube', channel: 'UCyyyyyyyy', color: '#ef4444' },
    { username: 'midnightcoder', displayName: 'MidnightCoder', bio: 'Game dev en vivo. Creando juegos con vos 🌃', platform: 'twitch', channel: 'thecodinggamer', color: '#14b8a6' },
  ]

  const usersData = [
    { username: 'gamerpro99', displayName: 'GamerPro99', bio: 'Fan del competitive y los torneos 🏆' },
    { username: 'streamfan', displayName: 'StreamFan', bio: 'Amo ver streams y conocer gente nueva 💜' },
    { username: 'robloxking', displayName: 'RobloxKing', bio: 'Constructor de mundos en Roblox 👑' },
    { username: 'kirito_dev', displayName: 'KiritoDev', bio: 'Desarrollador y gamer de corazón ⚔️' },
    { username: 'rosepetal', displayName: 'RosePetal', bio: 'Diseñadora de avatares y banners 🌹' },
    { username: 'nightowl', displayName: 'NightOwl', bio: 'Trasnochadora profesional 🦉' },
    { username: 'emberstorm', displayName: 'EmberStorm', bio: 'FPS player. Aim > todo 🔥' },
    { username: 'frostbyte', displayName: 'FrostByte', bio: 'Estratega de MOBA y amante del lore ❄️' },
  ]

  const streamers = []
  for (const s of streamersData) {
    const u = await db.user.create({
      data: {
        username: s.username,
        email: `${s.username}@streamverse.gg`,
        displayName: s.displayName,
        avatar: dicebear(s.username),
        banner: gradientWide(s.color, '#1e1b4b', s.displayName),
        bio: s.bio,
        isStreamer: true,
        platform: s.platform,
        channelHandle: s.channel,
        level: Math.floor(Math.random() * 50) + 50,
        xp: Math.floor(Math.random() * 9000) + 1000,
        coins: Math.floor(Math.random() * 5000) + 1000,
      }
    })
    streamers.push(u)
  }

  const users = []
  for (const u of usersData) {
    const user = await db.user.create({
      data: {
        username: u.username,
        email: `${u.username}@streamverse.gg`,
        displayName: u.displayName,
        avatar: dicebear(u.username, 'avataaars'),
        banner: gradientWide('#7c3aed', '#db2777', u.displayName),
        bio: u.bio,
        isStreamer: false,
        level: Math.floor(Math.random() * 30) + 5,
        xp: Math.floor(Math.random() * 3000) + 100,
        coins: Math.floor(Math.random() * 1000) + 200,
      }
    })
    users.push(user)
  }

  const currentUser = await db.user.create({
    data: {
      username: 'tu',
      email: 'tu@streamverse.gg',
      displayName: 'Tú (Invitado)',
      avatar: dicebear('tu-streamverse', 'avataaars'),
      banner: gradientWide('#a855f7', '#06b6d4', 'Tu Perfil'),
      bio: 'Explorando StreamVerse. Únete a la comunidad 💜',
      isStreamer: false,
      level: 12,
      xp: 2400,
      coins: 1500,
    }
  })

  console.log('👥 Creando follows...')
  const allUsers = [...streamers, ...users]
  for (const s of streamers.slice(0, 6)) {
    await db.follow.create({ data: { followerId: currentUser.id, followingId: s.id } })
  }
  for (let i = 0; i < 12; i++) {
    const follower = allUsers[i % allUsers.length]
    const following = streamers[i % streamers.length]
    if (follower.id !== following.id) {
      await db.follow.create({ data: { followerId: follower.id, followingId: following.id } }).catch(() => {})
    }
  }
  await db.follow.create({ data: { followerId: streamers[0].id, followingId: streamers[1].id } }).catch(() => {})
  await db.follow.create({ data: { followerId: streamers[1].id, followingId: streamers[2].id } }).catch(() => {})

  console.log('🌐 Creando comunidades...')
  const communitiesData = [
    { name: 'Roblox', slug: 'roblox', description: 'La comunidad más grande de Roblox en español. Comparte tus juegos, avatares y experiencias.', category: 'roblox', color: '#ef4444' },
    { name: 'Minecraft', slug: 'minecraft', description: 'Construye, sobrevive y explora. Mods, seeds, servidores y speedruns.', category: 'minecraft', color: '#10b981' },
    { name: 'Valorant', slug: 'valorant', description: 'FPS táctico de Riot. Estrategias, agents, ranking y clutches.', category: 'valorant', color: '#ef4444' },
    { name: 'Fortnite', slug: 'fortnite', description: 'Battle Royale, Zero Build, creativo y eventos en vivo.', category: 'fortnite', color: '#a855f7' },
    { name: 'League of Legends', slug: 'league-of-legends', description: 'MOBA número 1 del mundo. LoL, Wild Rift y esports.', category: 'lol', color: '#0891b2' },
    { name: 'Free Fire', slug: 'free-fire', description: 'Battle Royale móvil más jugado. Torneos y squad.', category: 'free-fire', color: '#f59e0b' },
    { name: 'GTA Online', slug: 'gta-online', description: 'Roleplay, carreras, heists y caos en Los Santos.', category: 'gta', color: '#ec4899' },
    { name: 'Counter-Strike 2', slug: 'cs2', description: 'El FPS clásico. Aim, spray control, competición.', category: 'cs2', color: '#f97316' },
    { name: 'Genshin Impact', slug: 'genshin-impact', description: 'Mundo abierto, gacha, lore y team building.', category: 'genshin', color: '#8b5cf6' },
    { name: 'Among Us', slug: 'among-us', description: 'Social deduction, impostores y caos con amigos.', category: 'among-us', color: '#06b6d4' },
    { name: 'Call of Duty', slug: 'call-of-duty', description: 'Warzone, MW3, Zombies. Todo CoD en un lugar.', category: 'cod', color: '#84cc16' },
    { name: 'Pokemon', slug: 'pokemon', description: 'Atrápalos ya. TCG, juegos mainline y competitivo.', category: 'pokemon', color: '#eab308' },
  ]

  const communities = []
  for (const c of communitiesData) {
    const comm = await db.community.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: gradient(c.color, '#1e1b4b', c.name.charAt(0)),
        banner: gradientWide(c.color, '#0f172a', c.name),
        category: c.category,
        color: c.color,
        membersCount: Math.floor(Math.random() * 80000) + 5000,
      }
    })
    communities.push(comm)
  }

  await db.communityMember.create({ data: { userId: currentUser.id, communityId: communities[0].id } })
  await db.communityMember.create({ data: { userId: currentUser.id, communityId: communities[1].id } })
  await db.communityMember.create({ data: { userId: currentUser.id, communityId: communities[2].id } })
  for (let i = 0; i < 20; i++) {
    const u = allUsers[i % allUsers.length]
    const c = communities[i % communities.length]
    await db.communityMember.create({ data: { userId: u.id, communityId: c.id } }).catch(() => {})
  }

  console.log('🛒 Creando artículos de tienda...')
  const storeItems = [
    { type: 'logo', name: 'Neon Phoenix', description: 'Logo de fénix con efecto neón púrpura. Perfecto para streamers de FPS.', price: 850, creator: 'RosePetal', rarity: 'legendary', color: '#a855f7' },
    { type: 'logo', name: 'Cyber Mask', description: 'Máscara cyberpunk animada para tu marca personal.', price: 600, creator: 'KiritoDev', rarity: 'epic', color: '#06b6d4' },
    { type: 'logo', name: 'Wolf Crest', description: 'Emblema de lobo minimalista en degradado rosa.', price: 450, creator: 'RosePetal', rarity: 'rare', color: '#ec4899' },
    { type: 'logo', name: 'Pixel Crown', description: 'Corona pixel art retro para creadores indie.', price: 300, creator: 'NightOwl', rarity: 'common', color: '#f59e0b' },
    { type: 'logo', name: 'Toxic Vibe', description: 'Logo tóxico verde fluorescente para ranked grinders.', price: 550, creator: 'EmberStorm', rarity: 'epic', color: '#84cc16' },
    { type: 'balloon', name: 'Purple Hype', description: 'Globo de texto animado púrpura con partículas.', price: 200, creator: 'RosePetal', rarity: 'rare', color: '#a855f7' },
    { type: 'balloon', name: 'Pink Love', description: 'Globo rosa con corazones flotantes para chat.', price: 180, creator: 'NightOwl', rarity: 'common', color: '#ec4899' },
    { type: 'balloon', name: 'Cyan Wave', description: 'Globo cyan con efecto de onda neon.', price: 220, creator: 'KiritoDev', rarity: 'rare', color: '#06b6d4' },
    { type: 'balloon', name: 'Emerald Rage', description: 'Globo verde esmeralda explosivo para clutches.', price: 350, creator: 'EmberStorm', rarity: 'epic', color: '#10b981' },
    { type: 'balloon', name: 'Golden GG', description: 'Globo dorado legendario con destello.', price: 500, creator: 'RosePetal', rarity: 'legendary', color: '#f59e0b' },
    { type: 'banner', name: 'Aurora Banner', description: 'Banner de perfil con aurora boreal animada.', price: 700, creator: 'RosePetal', rarity: 'epic', color: '#8b5cf6' },
    { type: 'banner', name: 'Lava Flow', description: 'Banner de lava fundiéndose en degradado naranja.', price: 650, creator: 'EmberStorm', rarity: 'epic', color: '#f97316' },
    { type: 'banner', name: 'Ocean Deep', description: 'Banner oceánico con olas cyan profundas.', price: 500, creator: 'KiritoDev', rarity: 'rare', color: '#06b6d4' },
    { type: 'banner', name: 'Galaxy Edge', description: 'Banner de galaxia con estrellas y nebulosa.', price: 900, creator: 'RosePetal', rarity: 'legendary', color: '#7c3aed' },
    { type: 'banner', name: 'Forest Mist', description: 'Banner de bosque nieblado en verde esmeralda.', price: 400, creator: 'NightOwl', rarity: 'common', color: '#10b981' },
    { type: 'frame', name: 'Neon Purple', description: 'Marco de perfil con brillo púrpura pulsante.', price: 300, creator: 'KiritoDev', rarity: 'rare', color: '#a855f7' },
    { type: 'frame', name: 'Pink Heart', description: 'Marco de corazones rosa animados.', price: 350, creator: 'RosePetal', rarity: 'rare', color: '#ec4899' },
    { type: 'frame', name: 'Circuit Board', description: 'Marco cyberpunk con circuitos cyan.', price: 550, creator: 'KiritoDev', rarity: 'epic', color: '#06b6d4' },
    { type: 'frame', name: 'Golden Royal', description: 'Marco dorado real con adornos. Status máximo.', price: 1000, creator: 'RosePetal', rarity: 'legendary', color: '#f59e0b' },
    { type: 'frame', name: 'Emerald Leaf', description: 'Marco de hojas esmeralda naturales.', price: 280, creator: 'NightOwl', rarity: 'common', color: '#10b981' },
    { type: 'frame', name: 'Fire Edge', description: 'Marco de fuego ardiente en los bordes.', price: 480, creator: 'EmberStorm', rarity: 'epic', color: '#ef4444' },
  ]

  for (const item of storeItems) {
    await db.storeItem.create({
      data: {
        type: item.type,
        name: item.name,
        description: item.description,
        price: item.price,
        image: gradient(item.color, '#0f172a', item.name),
        preview: gradient(item.color, '#1e1b4b', item.name),
        creator: item.creator,
        rarity: item.rarity,
        color: item.color,
        sales: Math.floor(Math.random() * 500),
      }
    })
  }

  console.log('📺 Creando streams...')
  const streamsData = [
    { platform: 'twitch', channel: 'shroud', title: 'VALORANT Radiant Grind w/ subs!', streamer: streamers[0], category: 'valorant', viewers: 45200 },
    { platform: 'kick', channel: 'trainwreckstv', title: 'Slots + Just Chatting all night', streamer: streamers[1], category: 'roblox', viewers: 28900 },
    { platform: 'youtube', channel: 'UC_x5XG1OV2P6uZZ5FSM9Ftw', title: 'Minecraft Speedrun World Record Attempt', streamer: streamers[2], category: 'minecraft', viewers: 12400 },
    { platform: 'twitch', channel: 'pokimane', title: 'cozy morning chat + music 🌙', streamer: streamers[3], category: 'just-chatting', viewers: 18700 },
    { platform: 'twitch', channel: 'faker', title: 'LoL SoloQ - Road to Challenger', streamer: streamers[4], category: 'lol', viewers: 63000 },
    { platform: 'kick', channel: 'xqc', title: 'GTA RP NoPixel - chaotic day', streamer: streamers[5], category: 'gta', viewers: 89500 },
    { platform: 'youtube', channel: 'UCVHHxqfPm9x3kIEk0NRMEjQ', title: 'Free Fire Ranked Push - Top 1', streamer: streamers[6], category: 'free-fire', viewers: 9800 },
    { platform: 'twitch', channel: 'thecodinggamer', title: 'Building a 3D game live w/ chat', streamer: streamers[7], category: 'game-dev', viewers: 4200 },
  ]

  for (const s of streamsData) {
    const colorMap: Record<string, string> = { twitch: '#9146ff', kick: '#53fc18', youtube: '#ff0000' }
    await db.stream.create({
      data: {
        platform: s.platform,
        channel: s.channel,
        title: s.title,
        streamerId: s.streamer.id,
        category: s.category,
        thumbnail: gradientWide(colorMap[s.platform] || '#a855f7', '#0f172a', `${s.platform.toUpperCase()} · ${s.streamer.displayName}`),
        viewers: s.viewers,
        isLive: true,
      }
    })
  }

  console.log('📝 Creando publicaciones...')
  const postsData = [
    { author: streamers[0], content: '¡Acabo de llegar a Radiante otra vez! 🔥 Gracias por el apoyo en el stream hoy. Vamos por más 🚀', image: gradient('#a855f7', '#ec4899', 'RADIANT 🔥') },
    { author: streamers[1], content: 'Nuevo mundo en Roblox terminado 🧱 ¡Mañana lo muestro en directo! ¿Quién se anima a explorarlo?', image: gradient('#ec4899', '#f59e0b', 'NEW WORLD') },
    { author: streamers[2], content: 'Speedrun de 12:34 hoy en Minecraft. Casi récord mundial ⚡ ¿Qué challenge hacemos mañana?', image: null },
    { author: streamers[3], content: 'Gracias por los 50k followers 💜 hoy toca celebrar con música en directo esta noche 🌙', image: gradient('#8b5cf6', '#06b6d4', '50K 🎉') },
    { author: streamers[4], content: 'Challenger alcanzado. Ahora a por el Top 10 mundial 🦈 #LeagueOfLegends', image: gradient('#10b981', '#0891b2', 'CHALLENGER') },
    { author: streamers[5], content: 'El GTA RP de hoy fue brutal 🐺 clip del clutches en 3v1 subido ya. ¡Mañana más caos!', image: gradient('#f59e0b', '#ef4444', 'GTA RP') },
    { author: streamers[7], content: 'Hoy programé un sistema de partículas en vivo para el juego. Código abierto en mi repo 🌃', image: gradient('#14b8a6', '#7c3aed', 'DEV LIVE') },
    { author: users[0], content: '¿Alguien para squad de Valorant esta noche? Intento subir a Inmortal 🏆', image: null },
    { author: users[1], content: 'La nueva tienda de StreamVerse tiene unos logos brutales. Ya me compré el Neon Phoenix 💜', image: gradient('#a855f7', '#0f172a', 'NEON LOGO') },
    { author: users[2], content: 'Acabo de publicar mi nuevo juego en Roblox. Link en mi perfil 👑', image: null },
  ]

  for (const p of postsData) {
    await db.post.create({
      data: {
        authorId: p.author.id,
        content: p.content,
        image: p.image,
        likesCount: Math.floor(Math.random() * 800) + 50,
        commentsCount: Math.floor(Math.random() * 40) + 2,
      }
    })
  }

  console.log('💬 Creando historial de chat...')
  const chatColors = ['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
  const chatMessages = [
    { username: 'NeonBlaze', content: '¡Buenas noches a todos! Stream en vivo 🔥' },
    { username: 'GamerPro99', content: 'alguien para squad de valorant?' },
    { username: 'PixelQueen', content: 'construyendo mi nuevo mundo en roblox 🧱' },
    { username: 'StreamFan', content: 'esta plataforma está increíble 💜' },
    { username: 'ShadowGamer', content: 'speedrun hoy fue brutal ⚡' },
    { username: 'LunaStar', content: 'música y chill esta noche 🌙' },
    { username: 'ToxicShark', content: 'challenger reached 🦈' },
    { username: 'CyberWolf', content: 'GTA RP fue caos total 🐺' },
    { username: 'RobloxKing', content: 'nuevo juego publicado, pasen a ver 👑' },
    { username: 'NightOwl', content: 'alguien despierto a estas horas? 🦉' },
    { username: 'EmberStorm', content: 'clutch 1v5 hoy, clip subido 🔥' },
    { username: 'FrostByte', content: 'el lore de genshin es infinito ❄️' },
    { username: 'RosePetal', content: 'nuevos diseños en la tienda 🌹' },
    { username: 'KiritoDev', content: 'codeando un juego en directo ⚔️' },
    { username: 'AuroraVibes', content: 'free fire ranked push 🎮' },
  ]
  for (let i = 0; i < chatMessages.length; i++) {
    const m = chatMessages[i]
    await db.chatMessage.create({
      data: {
        username: m.username,
        content: m.content,
        color: chatColors[i % chatColors.length],
        avatar: dicebear(m.username, 'avataaars'),
        createdAt: new Date(Date.now() - (chatMessages.length - i) * 60000 * 3),
      }
    })
  }

  console.log('✅ Seed completado!')
  console.log(`   - ${streamers.length} streamers`)
  console.log(`   - ${users.length + 1} usuarios`)
  console.log(`   - ${communities.length} comunidades`)
  console.log(`   - ${storeItems.length} artículos de tienda`)
  console.log(`   - ${streamsData.length} streams`)
  console.log(`   - ${postsData.length} publicaciones`)
  console.log(`   - ${chatMessages.length} mensajes de chat`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
