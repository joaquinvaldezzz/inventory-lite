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

import { getSpecificDailyCountRecordById } from "@/lib/api";
import { Loading } from "@/components/loading";

import { DailyCountRecordForm } from "./record-form";

type DailyCountPageProps = RouteComponentProps<{ id: string }>;

/**
 * DailyCountRecord component displays and manages a specific daily count record page.
 *
 * This component handles the complete lifecycle of viewing and editing a daily count record:
 *
 * - Fetches the record data based on the route parameter ID
 * - Displays loading states while data is being retrieved
 * - Shows error messages if the record cannot be found or loaded
 * - Renders the record form for editing when data is available
 * - Handles navigation back to the daily count list
 *
 * The component uses React Router's match object to extract the record ID from the URL parameters
 * and manages the data fetching process.
 *
 * @param props Component configuration and routing information
 * @param props.match React Router match object containing route parameters including the record ID
 * @returns JSX element representing the daily count record page with loading states and form
 */
export default function DailyCountRecord({ match }: DailyCountPageProps) {
  const { data, isFetching } = useQuery({
    queryKey: ["daily-count-record", match.params.id],
    queryFn: async () => await getSpecificDailyCountRecordById(Number(match.params.id)),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/daily-count" />
          </IonButtons>
          <IonTitle>
            {isFetching || data == null
              ? "Loading daily count record..."
              : `Daily Count #${data[0].id}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={print} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isFetching || data == null ? <Loading /> : <DailyCountRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
