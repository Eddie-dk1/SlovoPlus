import { categories } from '../../../data/categories'
import { CategoryCard } from './CategoryCard'

export function CategoriesGrid() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Категории практики</h2>
        <p className="text-sm text-slate-500">{categories.length} тематических блоков</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
      </div>
    </section>
  )
}
