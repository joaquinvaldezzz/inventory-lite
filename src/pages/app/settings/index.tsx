import { Fragment } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

/**
 * The `Settings` component handles the settings page. It contains the ...
 *
 * @returns The rendered component.
 */
export default function Settings() {
  return (
    <Fragment>
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Settings</IonTitle>
            </IonToolbar>
          </IonHeader>

          <div className="ion-padding"></div>
        </IonContent>
      </IonPage>
    </Fragment>
  );
}
