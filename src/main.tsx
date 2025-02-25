import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { Loading } from './components/loading'

const App = lazy(async () => await import('./app'))

const container = document.getElementById('root')

if (container == null) {
  throw new Error('Root container missing in the DOM')
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </StrictMode>,
)
