import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { add } from 'ionicons/icons'

import { columns } from './columns'
import { DataTable } from './data-table'

export default function Expenses() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Expenses</IonTitle>
          <IonButtons slot="end" collapse>
            <IonButton>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <DataTable columns={columns} data={[]} />
      </IonContent>
    </IonPage>
  )
}
