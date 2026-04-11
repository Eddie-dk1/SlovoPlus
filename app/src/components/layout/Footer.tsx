export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-slate-500">
        Слово+ · MVP · {new Date().getFullYear()}
      </div>
    </footer>
  )
}
