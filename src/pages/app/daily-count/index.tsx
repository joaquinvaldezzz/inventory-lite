import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

import { DataTable } from '@/components/ui/data-table'

import data from '../data.json'
import { columns } from './columns'

export default function DailyCount() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daily Count</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Daily Count</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="p-4">
          <DataTable columns={columns} data={data.data} withPagination withSearch />
        </div>
      </IonContent>
    </IonPage>
  )
}
