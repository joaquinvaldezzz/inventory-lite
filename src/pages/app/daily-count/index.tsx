import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'

import { getDailyCountEntries } from '@/lib/api'

import { columns } from './columns'
import { DataTable } from './data-table'

export default function DailyCount() {
  const { isFetching, isPending, error, data } = useQuery({
    queryKey: ['daily-count-entries'],
    queryFn: async () => await getDailyCountEntries(),
  })

  if (data === undefined) {
    return null
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daily Count</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="space-y-4">
          <DataTable columns={columns} data={data} />
        </div>
      </IonContent>
    </IonPage>
  )
}
