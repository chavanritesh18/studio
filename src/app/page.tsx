"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRecipe, GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { identifyIngredients } from "@/ai/flows/identify-ingredients";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDetectIngredients = async () => {
    if (!imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    setLoadingIngredients(true);
    try {
      const result = await identifyIngredients({ photoUrl: imageUrl });
      setIngredients(result.ingredients);
    } catch (error) {
      console.error("Error detecting ingredients:", error);
      alert("Failed to detect ingredients. Please try again.");
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!ingredients || ingredients.length === 0) {
      alert("Please detect ingredients first.");
      return;
    }

    setLoadingRecipe(true);
    try {
      const result = await generateRecipe({ ingredients: ingredients });
      setRecipe(result);
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Failed to generate recipe. Please try again.");
    } finally {
      setLoadingRecipe(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 bg-background">
      <h1 className="text-4xl font-bold mb-8 text-primary">RecipeSnap</h1>

      {/* Image Upload Section */}
      <Card className="w-full max-w-md mb-6 bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Upload Your Ingredients</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Upload an image to identify the ingredients.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded Ingredients" className="rounded-md mb-4" style={{ maxHeight: '200px', objectFit: 'contain' }} />
          )}
          <Button onClick={handleDetectIngredients} disabled={loadingIngredients} className="w-full bg-accent text-card-foreground hover:bg-accent-foreground">
            {loadingIngredients ? <><Skeleton className="w-4 h-4 mr-2" /> Detecting Ingredients...</> : "Detect Ingredients"}
          </Button>
        </CardContent>
      </Card>

      {/* Ingredients Display Section */}
      {ingredients && (
        <Card className="w-full max-w-md mb-6 bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Detected Ingredients</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Here are the ingredients we found in your image.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loadingIngredients ? (
              <Skeleton className="h-4 w-full" />
            ) : ingredients.length > 0 ? (
              <ul className="list-disc list-inside">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm">{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No ingredients detected.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recipe Generation Section */}
      {ingredients && (
        <Card className="w-full max-w-md bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Generate Recipe</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Generate a recipe based on the detected ingredients.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Button onClick={handleGenerateRecipe} disabled={loadingRecipe} className="w-full bg-primary text-card-foreground hover:bg-primary-foreground">
              {loadingRecipe ? <><Skeleton className="w-4 h-4 mr-2" /> Generating Recipe...</> : "Generate Recipe"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recipe Display Section */}
      {recipe && (
        <Card className="w-full max-w-md mt-6 bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{recipe.recipeName}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Prep Time: {recipe.prepTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
            <ul className="list-disc list-inside mb-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm">{ingredient}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
            <p className="text-sm">{recipe.instructions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
