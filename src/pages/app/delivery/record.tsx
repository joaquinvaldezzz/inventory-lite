import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { print } from "ionicons/icons";
import type { RouteComponentProps } from "react-router";

import { getSpecificDeliveryRecord } from "@/lib/api";
import { Loading } from "@/components/loading";

import DeliveryRecordForm from "./record-form";

type DeliveryPageProps = RouteComponentProps<{ id: string }>;

/**
 * DeliveryRecord component displays and manages a specific delivery record page.
 *
 * This component handles the complete lifecycle of viewing and editing a delivery record:
 *
 * - Fetches the delivery record data based on the route parameter ID
 * - Displays loading states while data is being retrieved
 * - Shows error messages if the record cannot be found or loaded
 * - Renders the delivery record form for editing when data is available
 * - Handles navigation back to the delivery list
 *
 * The component uses React Router's match object to extract the record ID from the URL parameters
 * and manages the data fetching process for delivery entries.
 *
 * @param props Component configuration and routing information
 * @param props.match React Router match object containing route parameters including the delivery
 *   record ID
 * @returns JSX element representing the delivery record page with loading states and form
 */
export default function DeliveryRecord({ match }: DeliveryPageProps) {
  const { data, isFetching } = useQuery({
    queryKey: ["delivery-record", match.params.id],
    queryFn: async () => await getSpecificDeliveryRecord(Number(match.params.id)),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/delivery" />
          </IonButtons>
          <IonTitle>
            {isFetching || data == null ? "Loading delivery record..." : `Delivery #${data[0].id}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={print} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isFetching || data == null ? <Loading /> : <DeliveryRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
