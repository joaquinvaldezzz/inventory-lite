import { lazy, Suspense } from 'react'
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Redirect, Route } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'

import { Loading } from './components/loading'

import './styles/main.css'

const Tabs = lazy(async () => await import('./pages/app/tabs'))
const BranchSelector = lazy(async () => await import('./pages/branch-selector'))
const Login = lazy(async () => await import('./pages/login'))

setupIonicReact()

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route path="/login" exact>
                <Login />
              </Route>

              <Route path="/branch-selector" exact>
                <BranchSelector />
              </Route>

              <Route path="/app/*">
                <Tabs />
              </Route>

              <Route path="/" exact>
                <Redirect to="/login" />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
          <Toaster />
        </IonApp>
      </Suspense>
    </QueryClientProvider>
  )
}
