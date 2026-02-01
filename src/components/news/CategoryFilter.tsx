import { cn } from "@/lib/utils";
import type { NewsCategory } from "./NewsCard";

export type FilterCategory = "All" | NewsCategory;

const categories: FilterCategory[] = [
  "All",
  "Regulatory Updates",
  "Sanctions & Enforcement",
  "AML & Financial Crime",
  "GCC Regulatory Updates",
];

interface CategoryFilterProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
}

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "px-4 py-2 rounded-full text-body-sm font-medium transition-all",
            selected === category
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-text-secondary hover:bg-secondary/80 hover:text-navy"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
