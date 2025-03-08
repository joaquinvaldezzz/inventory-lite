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

/**
 * Component for displaying and editing a specific delivery record.
 *
 * @param props The properties passed to the component.
 * @param props.match The match object containing route parameters.
 * @returns The rendered component.
 */
export default function DeliveryRecord({ match }: DeliveryPageProps) {
  const { isPending, data } = useQuery({
    queryKey: ['delivery-entry', match.params.id],
    queryFn: async () => await getSpecificDeliveryRecord(Number(match.params.id)),
  })

  if (isPending) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/delivery" />
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
            <IonBackButton defaultHref="/app/delivery" />
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
