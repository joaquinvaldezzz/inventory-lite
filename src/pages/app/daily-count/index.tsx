import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonModal,
  type RefresherEventDetail,
} from '@ionic/react'
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces'
import { useQuery } from '@tanstack/react-query'
import { add } from 'ionicons/icons'

import { fetchDailyCountEntries } from '@/lib/api'

import { columns } from './columns'
import { DataTable } from './data-table'
import { NewDailyCountModal } from './new-daily-count-modal'

export default function DailyCount() {
  const { isPending, data, refetch } = useQuery({
    queryKey: ['daily-count-entries'],
    queryFn: async () => await fetchDailyCountEntries(),
  })

  const sortedData = data?.sort((z, a) => (new Date(a.date) < new Date(z.date) ? -1 : 1)) ?? []

  const [present, dismiss] = useIonModal(NewDailyCountModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role)
    },
  })

  function handleAdd() {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === 'confirm') {
          console.log('You entered: ', event.detail.data)
        }
      },
    })
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    try {
      void refetch()
    } catch (error) {
      console.error('Error fetching delivery entries:', error)
    } finally {
      event.detail.complete()
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Daily Count</IonTitle>
          <IonButtons slot="primary" collapse>
            <IonButton onClick={handleAdd}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
          {isPending && <IonProgressBar type="indeterminate" />}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Daily Count</IonTitle>
            <IonButtons slot="primary">
              <IonButton onClick={handleAdd}>
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
            <DataTable columns={columns} data={sortedData} />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
