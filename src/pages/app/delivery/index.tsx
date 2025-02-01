import { useRef, useState } from 'react'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import { add } from 'ionicons/icons'

import { getDeliveryEntries } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'

import { columns } from './columns'
import { NewDeliveryForm } from './new-delivery-form'

export default function Delivery() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const modalRef = useRef<HTMLIonModalElement>(null)

  function openModal() {
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
  }

  const { error, data } = useQuery({
    queryKey: ['delivery-entries'],
    queryFn: async () => await getDeliveryEntries(),
  })

  if (error != null) console.error(error)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Delivery</IonTitle>
          <IonButtons slot="end" collapse>
            <IonButton onClick={openModal}>
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Delivery</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={openModal}>
                <IonIcon icon={add} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <DataTable columns={columns} data={data ?? []} withPagination withSearch />
        </div>

        <IonModal isOpen={isOpen} ref={modalRef}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={closeModal}>Cancel</IonButton>
              </IonButtons>
              <IonTitle className="text-center">New delivery</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Submit</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <NewDeliveryForm />
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}
