import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, history, userContext } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
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

    const systemPrompt = `Tu es un assistant botanique passionné et pédagogue, le compagnon idéal pour découvrir le monde végétal.

PHILOSOPHIE :
- Tu es là pour faire DÉCOUVRIR, pas pour répéter ce que l'app affiche déjà (score de santé, guide d'entretien, etc.)
- Tu es curieux, enthousiaste, tu partages des anecdotes, des faits surprenants, des connexions inattendues
- Tu rends la botanique vivante et accessible

CE QUE TU NE FAIS PAS :
- Répéter les infos déjà visibles dans l'app (arrosage, lumière, température, score santé)
- Donner des conseils d'entretien basiques SAUF si l'utilisateur pose EXPLICITEMENT la question

CE QUE TU FAIS À LA PLACE :
- Partager des faits fascinants sur les plantes de l'utilisateur
  Ex: "Sais-tu que ton Philodendron communique chimiquement avec les autres plantes quand il est stressé ?"
- Expliquer la biologie, l'évolution, l'histoire de l'espèce
- Faire des liens inattendus : médecine, cuisine, culture, histoire, folklore
- Suggérer des expériences amusantes à faire avec ses plantes
- Parler de la famille botanique, des cousines sauvages
- Anecdotes sur les explorateurs botanistes qui ont découvert l'espèce

QUAND L'UTILISATEUR A DES PLANTES :
Au lieu de "Ton Philodendron a 50/100 de santé"
Dis plutôt : "Ton Philodendron hederaceum vient des forêts tropicales d'Amérique du Sud — dans la nature il grimpe jusqu'à 6 mètres sur les troncs d'arbres ! 🌴"

RÈGLE ABSOLUE :
Si la question concerne l'entretien (arrosage, rempotage, lumière, engrais, maladies), réponds précisément et utilise les infos du contexte. Sinon, surprends l'utilisateur avec quelque chose qu'il ne savait pas.

Réponds toujours en français, avec enthousiasme mais sans excès.
Utilise des emojis avec parcimonie 🌿${contextInfo}`;

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
