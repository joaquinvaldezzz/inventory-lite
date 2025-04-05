import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { calendar, cash, cube, trash } from "ionicons/icons";
import { Redirect, Route } from "react-router";

import DailyCount from "./daily-count";
import DailyCountRecord from "./daily-count/record";
import Delivery from "./delivery";
import DeliveryRecord from "./delivery/record";
import Expenses from "./expenses";
import ExpensesRecord from "./expenses/record";
import Wastes from "./wastes";
import WastesRecord from "./wastes/record";

/**
 * The `Tabs` component sets up the main tab navigation for the application using Ionic components.
 * It includes routes and tab buttons for different sections of the app such as Delivery, Daily
 * Count, Wastes, and Expenses.
 *
 * @returns The rendered tab navigation component.
 */
export default function Tabs() {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect path="/app" to="/app/delivery" exact />
          <Route path="/app/delivery" render={() => <Delivery />} exact />
          <Route path="/app/daily-count" render={() => <DailyCount />} exact />
          <Route path="/app/wastes" render={() => <Wastes />} exact />
          <Route path="/app/expenses" render={() => <Expenses />} exact />

          <Route path="/app/delivery/:id" render={(props) => <DeliveryRecord {...props} />} exact />
          <Route
            path="/app/daily-count/:id"
            render={(props) => <DailyCountRecord {...props} />}
            exact
          />
          <Route path="/app/wastes/:id" render={(props) => <WastesRecord {...props} />} exact />
          <Route
            path="/app/expenses/:PurchaseID"
            render={(props) => <ExpensesRecord {...props} />}
            exact
          />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton href="/app/delivery" tab="delivery">
            <IonIcon icon={cube} />
            <IonLabel>Delivery</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/daily-count" tab="daily-count">
            <IonIcon icon={calendar} />
            <IonLabel>Daily Count</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/wastes" tab="wastes">
            <IonIcon icon={trash} />
            <IonLabel>Wastes</IonLabel>
          </IonTabButton>

          <IonTabButton href="/app/expenses" tab="expenses">
            <IonIcon icon={cash} />
            <IonLabel>Expenses</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}
