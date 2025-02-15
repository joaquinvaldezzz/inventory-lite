import { IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { useQuery } from '@tanstack/react-query'

import { fetchWasteEntries } from '@/lib/api'

import { columns } from './columns'
import { DataTable } from './data-table'

export default function Wastes() {
  const { isPending, data } = useQuery({
    queryKey: ['wastes'],
    queryFn: async () => await fetchWasteEntries(),
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Wastes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isPending ? (
          <div className="flex h-96 items-center justify-center">
            <IonSpinner />
          </div>
        ) : (
          <DataTable columns={columns} data={data ?? []} />
        )}
      </IonContent>
    </IonPage>
  )
}
