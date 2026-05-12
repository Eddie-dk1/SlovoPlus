import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { AppErrorBoundary } from './components/ui/AppErrorBoundary'
import { I18nProvider } from './i18n/I18nProvider'

function App() {
  return (
    <AppErrorBoundary>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </AppErrorBoundary>
  )
}

export default App
