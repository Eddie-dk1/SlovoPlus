interface DefinitionBlockProps {
  definition: string
  simpleExplanation?: string
}

export function DefinitionBlock({ definition, simpleExplanation }: DefinitionBlockProps) {
  return (
    <section className="surface-hover space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Определение</h2>
      <p className="text-slate-700">{definition}</p>
      {simpleExplanation ? (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{simpleExplanation}</p>
      ) : null}
    </section>
  )
}
