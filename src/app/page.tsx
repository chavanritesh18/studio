"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRecipe, GenerateRecipeOutput } from "@/ai/flows/generate-recipe";
import { identifyIngredients } from "@/ai/flows/identify-ingredients";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const RecipeDownload = ({ recipe }: { recipe: GenerateRecipeOutput }) => {
  const { toast } = useToast();
  const downloadRecipe = () => {
    const recipeContent = `Recipe Name: ${recipe.recipeName}\nPrep Time: ${recipe.prepTime}\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}\n\nInstructions:\n${recipe.instructions}`;
    const blob = new Blob([recipeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.recipeName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Recipe Downloaded",
      description: "Your recipe has been downloaded successfully.",
    });
  };

  const downloadIngredients = () => {
    const ingredientsContent = recipe.ingredients.map(i => `- ${i}`).join('\n');
    const blob = new Blob([ingredientsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.recipeName.replace(/\s+/g, '_')}_ingredients.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Ingredients Downloaded",
      description: "The ingredients list has been downloaded.",
    });
  };


  return (
    <div className="flex justify-end space-x-2">
      <Button variant="secondary" size="sm" onClick={downloadRecipe}>
        Download Recipe <Download className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="secondary" size="sm" onClick={downloadIngredients}>
        Download Ingredients <Download className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectIngredients = async () => {
    if (!imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    setLoadingIngredients(true);
    try {
      // Extract content type from data URI
      const contentType = imageUrl.match(/data:(.*);base64/)?.[1] || "image/jpeg";
      const result = await identifyIngredients({ photo: { url: imageUrl, contentType: contentType } });
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
    <div className={`min-h-screen bg-background py-12 ${fadeIn ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}>
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-primary text-center">
            RecipeSnap
          </h1>
          <p className="text-muted-foreground text-center">
            Generate delicious recipes from your ingredients.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Image Upload Section */}
          <Card className="bg-card rounded-lg shadow-md overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-medium text-foreground">
                Upload Ingredients
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Upload an image to identify ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-4"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Uploaded Ingredients"
                  className="rounded-md mb-4 w-full object-cover"
                  style={{ maxHeight: "200px" }}
                />
              )}
              <Button
                onClick={handleDetectIngredients}
                disabled={loadingIngredients}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80 rounded-md"
              >
                {loadingIngredients ? (
                  <>
                    <Skeleton className="w-4 h-4 mr-2" />
                    Detecting...
                  </>
                ) : (
                  "Detect Ingredients"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Ingredients Display Section */}
          {ingredients && (
            <Card className="bg-card rounded-lg shadow-md overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-medium text-foreground">
                  Detected Ingredients
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Here are the ingredients we found in your image.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {loadingIngredients ? (
                  <Skeleton className="h-4 w-full" />
                ) : ingredients.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm text-foreground">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No ingredients detected.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recipe Generation Section */}
          {ingredients && (
            <Card className="bg-card rounded-lg shadow-md overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-medium text-foreground">
                  Generate Recipe
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Generate a recipe based on the detected ingredients.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  onClick={handleGenerateRecipe}
                  disabled={loadingRecipe}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/80 rounded-md"
                >
                  {loadingRecipe ? (
                    <>
                      <Skeleton className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Generate Recipe"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recipe Display Section */}
          {recipe && (
            <Card className="bg-card rounded-lg shadow-md overflow-hidden lg:col-span-3">
              <CardHeader className="p-4">
                <CardTitle className="text-2xl font-medium text-foreground">
                  {recipe.recipeName}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>Prep Time: {recipe.prepTime}</span>
                  <RecipeDownload recipe={recipe} />
                </CardDescription>

              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="ingredients" className="w-full">
                  <TabsList>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ingredients">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Ingredients:</h3>
                    <ul className="list-disc list-inside mb-4">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm text-foreground">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="instructions">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Instructions:</h3>
                    <p className="text-sm text-foreground">{recipe.instructions}</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
