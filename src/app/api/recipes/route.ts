import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/openai';
import { pb } from '@/lib/pocketbase';
import type { Plant } from '@/lib/types/pocketbase';

export async function POST(request: NextRequest) {
  try {
    const { plantId } = await request.json();

    if (!plantId) {
      return NextResponse.json(
        { error: 'plantId requis' },
        { status: 400 }
      );
    }

    const plant = await pb.plants().getOne(plantId);

    if (!plant.edible) {
      return NextResponse.json(
        { error: 'Cette plante n\'est pas comestible' },
        { status: 400 }
      );
    }

    // Vérifier si des recettes existent déjà
    if (plant.recipes && plant.recipes.length > 0) {
      return NextResponse.json({
        success: true,
        recipes: plant.recipes,
      });
    }

    // Générer de nouvelles recettes
    const recipes = await generateRecipes(plant as unknown as Plant);

    // Mettre à jour la plante avec les recettes
    await pb.plants().update(plantId, {
      recipes,
    });

    return NextResponse.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error('Erreur lors de la génération de recettes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de recettes' },
      { status: 500 }
    );
  }
}
