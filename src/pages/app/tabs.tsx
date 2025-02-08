import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { cube } from 'ionicons/icons'
import { Redirect, Route } from 'react-router'

import Delivery from './delivery'
import DeliveryRecord from './delivery/delivery'

// import { calendar, cube, trash } from 'ionicons/icons'
// import DailyCount from './daily-count'
// import Wastes from './wastes'

export default function Tabs() {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect path="/app" to="/app/delivery" exact />
          <Route path="/app/delivery" render={() => <Delivery />} exact />
          {/* <Route path="/app/daily-count" render={() => <DailyCount />} exact />
          <Route path="/app/wastes" render={() => <Wastes />} exact /> */}

          <Route path="/app/delivery/:id" render={(props) => <DeliveryRecord {...props} />} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton href="/app/delivery" tab="delivery">
            <IonIcon icon={cube} />
            <IonLabel>Delivery</IonLabel>
          </IonTabButton>

          {/* <IonTabButton href="/app/daily-count" tab="daily-count">
            <IonIcon icon={calendar} />
            <IonLabel>Daily Count</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/wastes" tab="wastes">
            <IonIcon icon={trash} />
            <IonLabel>Wastes</IonLabel>
          </IonTabButton> */}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  )
}
