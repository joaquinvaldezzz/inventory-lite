import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from '@ionic/react'
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces'
import { add } from 'ionicons/icons'

import { columns } from './columns'
import { DataTable } from './data-table'
import { NewExpensesModal } from './new-expenses-modal'

export default function Expenses() {
  const [present, dismiss] = useIonModal(NewExpensesModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role)
    },
  })

  function presentModal() {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === 'confirm') {
          // void refetch()
        }
      },
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Expenses</IonTitle>
          <IonButtons slot="end" collapse>
            <IonButton onClick={presentModal}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Expenses</IonTitle>
            <IonButtons slot="primary">
              <IonButton onClick={presentModal}>
                <IonIcon icon={add} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <DataTable columns={columns} data={[]} />
        </div>
      </IonContent>
    </IonPage>
  )
}
