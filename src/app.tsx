import { lazy, Suspense } from 'react'
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Redirect, Route } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'

import { Loading } from './components/loading'
import BranchSelector from './pages/branch-selector'
import Login from './pages/login'
import PIN from './pages/pin'

import './styles/main.css'

const Tabs = lazy(async () => await import('./pages/app/tabs'))

setupIonicReact()

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" exact>
              <Login />
            </Route>

            <Route path="/pin" exact>
              <PIN />
            </Route>

            <Route path="/branch-selector" exact>
              <BranchSelector />
            </Route>

            <Suspense fallback={<Loading />}>
              <Route path="/app/*">
                <Tabs />
              </Route>
            </Suspense>

            <Route path="/" exact>
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
        <Toaster />
      </IonApp>
    </QueryClientProvider>
  )
}
