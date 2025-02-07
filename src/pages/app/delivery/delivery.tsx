import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useQuery } from '@tanstack/react-query'
import type { RouteComponentProps } from 'react-router'

import { getSpecificDeliveryRecord } from '@/lib/api'

import DeliveryRecordForm from './delivery-record'

type DeliveryPageProps = RouteComponentProps<{ id: string }>

export default function DeliveryRecord({ match }: DeliveryPageProps) {
  const { isFetching, data } = useQuery({
    queryKey: ['delivery-entry', match.params.id],
    queryFn: async () => await getSpecificDeliveryRecord(Number(match.params.id)),
  })

  if (isFetching) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>Loading delivery record...</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <div className="flex h-full items-center justify-center">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (data == null) {
    return null
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Edit delivery</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <DeliveryRecordForm data={data[0]} />
      </IonContent>
    </IonPage>
  )
}
