"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PokemonRarity } from "@/lib/types";
import { CreatePokemonInput } from "@/lib/types";

const pokemonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  priceEth: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stockQuantity: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  abilities: z.string().optional(),
  rarity: z.nativeEnum(PokemonRarity).optional(),
  category: z.string().optional(),
});

type PokemonFormValues = z.infer<typeof pokemonSchema>;

interface PokemonFormProps {
  defaultValues?: Omit<Partial<CreatePokemonInput>, "abilities"> & {
    abilities?: string;
  };
  onSubmit: (data: CreatePokemonInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const inputClass =
  "w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none placeholder-gray-400";

export default function PokemonForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: PokemonFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PokemonFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pokemonSchema) as any,
    defaultValues: defaultValues as PokemonFormValues,
  });

  const handleFormSubmit = (data: PokemonFormValues) => {
    const abilities = data.abilities
      ? data.abilities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : undefined;
    // eslint-disable-next-line @typescript-eslint/no-destructuring-assignment
    const { priceEth: _priceEth, ...rest } = data;
    onSubmit({ ...rest, abilities, imageUrl: data.imageUrl || undefined });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name *
          </label>
          <input {...register("name")} className={inputClass} />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Type *
          </label>
          <input
            {...register("type")}
            placeholder="e.g. Fire, Water/Ice"
            className={inputClass}
          />
          {errors.type && (
            <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Price (USD) *
          </label>
          <input
            {...register("price")}
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
          />
          {errors.price && (
            <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Price (ETH)
          </label>
          <input
            {...register("priceEth")}
            type="number"
            step="0.001"
            min="0"
            placeholder="0.001"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Stock Quantity
          </label>
          <input
            {...register("stockQuantity")}
            type="number"
            min="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Rarity
          </label>
          <select {...register("rarity")} className={inputClass}>
            {Object.values(PokemonRarity).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <input
            {...register("category")}
            placeholder="e.g. Mouse Pokemon"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Image URL
        </label>
        <input
          {...register("imageUrl")}
          placeholder="https://..."
          className={inputClass}
        />
        {errors.imageUrl && (
          <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Abilities (comma-separated)
        </label>
        <input
          {...register("abilities")}
          placeholder="Static, Lightning Rod"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
