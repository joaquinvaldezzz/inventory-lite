import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { StatusBar, Style } from '@capacitor/status-bar'
import { IonReactRouter } from '@ionic/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Redirect, Route } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'

import Tabs from './pages/app/tabs'
import BranchSelector from './pages/branch-selector'
import Login from './pages/login'

import './styles/main.css'

setupIonicReact()

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (status) => {
  StatusBar.setStyle({
    style: status.matches ? Style.Dark : Style.Light,
  }).catch(() => {
    console.error('Failed to set status bar style')
  })
})

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

            <Route path="/branch-selector" exact>
              <BranchSelector />
            </Route>

            <Route path="/app/delivery">
              <Tabs />
            </Route>

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
