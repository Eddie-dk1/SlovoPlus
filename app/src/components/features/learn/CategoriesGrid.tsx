import { categories } from '../../../data/categories'
import type { UiLanguage } from '../../../i18n/translations'
import { CategoryCard } from './CategoryCard'

interface CategoriesGridProps {
  language: UiLanguage
  title: string
  countLabel: string
  labels: {
    categoryLabel: string
    openMaterials: string
  }
}

export function CategoriesGrid({
  language,
  title,
  countLabel,
  labels,
}: CategoriesGridProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">
          {categories.length} {countLabel}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            language={language}
            labels={labels}
          />
        ))}
      </div>
    </section>
  )
}
