import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

import { DataTable } from '@/components/ui/data-table'

import data from '../data.json'
import { columns } from './columns'

export default function Wastes() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Wastes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Wastes</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="p-4">
          <DataTable columns={columns} data={data.data} withSearch withPagination />
        </div>
      </IonContent>
    </IonPage>
  )
}
