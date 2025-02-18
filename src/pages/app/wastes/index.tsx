import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { add } from 'ionicons/icons'

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
          <IonButtons slot="primary">
            <IonButton>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Wastes</IonTitle>
            <IonButtons slot="primary">
              <IonButton>
                <IonIcon icon={add} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {isPending ? (
            <div className="flex h-96 items-center justify-center">
              <IonSpinner />
            </div>
          ) : (
            <DataTable columns={columns} data={data ?? []} />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
