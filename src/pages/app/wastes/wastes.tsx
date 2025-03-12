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

import { getSpecificWastesRecordById } from "@/lib/api";
import { Loading } from "@/components/loading";

import { WastesRecordForm } from "./wastes-record";

type WastesPageProps = RouteComponentProps<{ id: string }>;

/**
 * Component for displaying and editing a specific waste record.
 *
 * @param props The properties passed to the component.
 * @param props.match The match object containing route parameters.
 * @returns The rendered component.
 */
export default function WastesRecord({ match }: WastesPageProps) {
  const { isPending, data } = useQuery({
    queryKey: ["waste-entry", match.params.id],
    queryFn: async () => await getSpecificWastesRecordById(Number(match.params.id)),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/wastes" />
          </IonButtons>
          <IonTitle>{isPending ? "Loading wastes record..." : `Wastes #${data?.[0].id}`}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {data == null ? <Loading /> : <WastesRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
