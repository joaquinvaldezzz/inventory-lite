import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonModal,
} from '@ionic/react'
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces'
import { useQuery } from '@tanstack/react-query'
import { add } from 'ionicons/icons'

import { fetchDailyCountEntries } from '@/lib/api'

import { columns } from './columns'
import { DataTable } from './data-table'
import { NewDailyCountModal } from './new-daily-count-modal'

export default function DailyCount() {
  const { isPending, data } = useQuery({
    queryKey: ['daily-count-entries'],
    queryFn: async () => await fetchDailyCountEntries(),
  })

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
            <DataTable columns={columns} data={data ?? []} />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
