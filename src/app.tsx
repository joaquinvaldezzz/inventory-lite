import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { Tabs } from '@/pages/app/tabs'
import { BranchSelector } from '@/pages/branch-selector'
import { Home } from '@/pages/home'
import { Login } from '@/pages/login'

import '@ionic/react/css/core.css'
import '@ionic/react/css/palettes/dark.system.css'
import '@ionic/react/css/structure.css'
import './styles/tailwind.css'

setupIonicReact()

export function App() {
  return (
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
    </IonApp>
  )
}
