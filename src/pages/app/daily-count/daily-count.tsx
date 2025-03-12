import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import type { RouteComponentProps } from "react-router";

import { getSpecificDailyCountRecordById } from "@/lib/api";
import { Loading } from "@/components/loading";

import { DailyCountRecordForm } from "./daily-count-record";

type DailyCountPageProps = RouteComponentProps<{ id: string }>;

/**
 * Component for displaying and editing a specific daily count record.
 *
 * @param props The properties passed to the component.
 * @param props.match The match object containing route parameters.
 * @returns The rendered component.
 */
export default function DailyCountRecord({ match }: DailyCountPageProps) {
  const { isPending, data } = useQuery({
    queryKey: ["daily-count-entry", match.params.id],
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
            {isPending ? "Loading daily count record..." : `Daily Count #${data?.[0].id}`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {data == null ? <Loading /> : <DailyCountRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
