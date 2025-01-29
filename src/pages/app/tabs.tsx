import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { calendar, cube, trash } from 'ionicons/icons'
import { Redirect, Route } from 'react-router'

import DailyCount from './daily-count'
import Deliveries from './deliveries'
import Wastes from './wastes'

export function Tabs() {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect path="/app" to="/app/deliveries" exact />
          <Route path="/app/deliveries" render={() => <Deliveries />} exact />
          <Route path="/app/daily-count" render={() => <DailyCount />} exact />
          <Route path="/app/wastes" render={() => <Wastes />} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton href="/app/deliveries" tab="deliveries">
            <IonIcon icon={cube} />
            <IonLabel>Deliveries</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/daily-count" tab="daily-count">
            <IonIcon icon={calendar} />
            <IonLabel>Daily Count</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/wastes" tab="wastes">
            <IonIcon icon={trash} />
            <IonLabel>Wastes</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  )
}
