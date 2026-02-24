import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, history, userContext, userId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Vérifier limite freemium chat
    if (userId && userContext?.authenticated) {
      try {
        const adminPb = await getAdminClient();
        const user = await adminPb.collection('users').getOne(userId, { 
          requestKey: null 
        });
        
        const userIsPremium = user.subscription_plan === 'premium' && 
          user.subscription_status === 'active';
        
        if (!userIsPremium) {
          // Compter messages aujourd'hui via historique passé
          // On se base sur la longueur de l'historique utilisateur
          const userMessagesCount = history.filter(
            (m: any) => m.role === 'user'
          ).length;
          
          if (userMessagesCount >= 5) {
            return NextResponse.json({ 
              reply: "Tu as atteint la limite de 5 messages/jour en version gratuite. 🔒 Passe Premium pour un chat illimité ! → /pricing",
              limitReached: true
            });
          }
        }
      } catch (error) {
        console.error('Erreur vérification limite chat:', error);
        // Continue même en cas d'erreur
      }
    }

    // Construire le contexte utilisateur
    let contextInfo = '';
    if (userContext?.authenticated && userContext?.plants && userContext.plants.length > 0) {
      const plantsList = userContext.plants.map((p: any) => 
        `- ${p.nickname || p.common_name} (${p.scientific_name || 'N/A'}) : santé ${p.health_score}/100`
      ).join('\n');
      
      contextInfo = `

CONTEXTE DE L'UTILISATEUR :
Niveau : ${userContext.user?.level || 'N/A'}, XP : ${userContext.user?.points_total || 0}
Collection de ${userContext.user?.plant_count || userContext.plants.length} plante(s) :
${plantsList}

Tu connais les noms de ses plantes (nickname ou common_name).
`;
    }

    const systemPrompt = `Tu es l'assistant botanique de l'application Byoom.
Tu as deux modes selon la question :

MODE DÉCOUVERTE (par défaut quand pas de problème urgent) :
- Partage des faits fascinants, anecdotes, histoire de l'espèce
- Connexions inattendues : médecine, cuisine, culture, évolution
- Rends la botanique vivante et surprenante

MODE EXPERT (quand l'utilisateur a un problème concret) :
- Réponds précisément et en détail à la question posée
- Ne jamais esquiver une vraie question botanique
- Donne une vraie réponse utile, pas juste "allez voir ailleurs"

RÈGLE RENVOI VERS L'APP :
Si la question concerne un problème visible sur une plante 
(jaunissement, taches, flétrissement, parasites, maladie),
réponds D'ABORD avec une vraie réponse, PUIS suggère l'app :

Exemple :
Q: "Mes feuilles de basilic jaunissent"
R: "Le jaunissement du basilic vient souvent d'un excès d'eau 
— ses racines détestent stagner dans l'humidité. Vérifie que 
le pot draine bien et laisse le terreau sécher entre les 
arrosages. Ça peut aussi venir d'un manque de lumière : 
le basilic a besoin de 6h de lumière directe par jour minimum.
Pour un diagnostic visuel précis avec ta photo, 
👉 utilise la section Diagnostic de Byoom — l'IA analyse 
l'image et te donne un plan d'action personnalisé."

AUTRES CAS DE RENVOI VERS L'APP :
- "comment s'appelle cette plante ?" → 
  "📸 Prends-la en photo dans Identifier — l'IA l'identifie 
  en quelques secondes avec sa fiche complète !"
- "comment entretenir ma plante ?" → 
  "Ta fiche plante dans Mon Jardin contient le guide complet 
  d'entretien spécifique à ton espèce 🌿"
- Question sur la santé d'une plante spécifique dans sa collection →
  "Jette un œil au score santé dans Mon Jardin, et si tu veux 
  un diagnostic approfondi, la section Diagnostic est là pour ça 🔬"

TON GÉNÉRAL :
- Chaleureux, passionné, jamais condescendant
- Réponds toujours EN FRANÇAIS
- Réponds TOUJOURS à la question posée avant tout renvoi
- Utilise des emojis avec parcimonie 🌿
- Si hors botanique : "Je suis spécialisé dans les plantes 
  et la botanique — pose-moi une question sur ce sujet ! 🌿"

CONTEXTE UTILISATEUR DISPONIBLE :
${contextInfo}
Utilise ce contexte pour personnaliser tes réponses quand 
c'est pertinent (ex: si l'utilisateur a un basilic et parle 
de feuilles jaunes, fais le lien avec SA plante).`;

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 800,
    });

    return NextResponse.json({
      reply: response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
    });
  } catch (error: any) {
    console.error('Erreur assistant botanique:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}
