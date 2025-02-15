import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

import { columns } from './columns'
import { DataTable } from './data-table'

export default function Wastes() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Wastes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <DataTable columns={columns} data={[]} />
      </IonContent>
    </IonPage>
  )
}
