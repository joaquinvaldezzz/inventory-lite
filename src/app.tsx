import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Redirect, Route } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import { Tabs } from '@/pages/app/tabs'
import { BranchSelector } from '@/pages/branch-selector'
import { Home } from '@/pages/home'
import { Login } from '@/pages/login'

import './styles/main.css'

setupIonicReact()

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/branch-selector">
              <BranchSelector />
            </Route>

            <Route exact path="/app">
              <Tabs />
            </Route>

            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
        <Toaster />
      </IonApp>
    </QueryClientProvider>
  )
}
