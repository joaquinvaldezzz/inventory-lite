import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, type RouteComponentProps } from "react-router";

import { getSpecificDailyCountRecordById } from "@/lib/api";

import { DailyCountRecordForm } from "./daily-count-record";

type DailyCountPageProps = RouteComponentProps<{ id: string }>;

export default function DailyCountRecord({ match }: DailyCountPageProps) {
  const { pathname } = useLocation();
  const { isPending, data } = useQuery({
    queryKey: ["delivery-entry", match.params.id, pathname],
    queryFn: async () => await getSpecificDailyCountRecordById(Number(match.params.id)),
  });

  // if (isPending) {
  //   return (
  //     <IonPage>
  //       <IonHeader>
  //         <IonToolbar>
  //           <IonButtons slot="start">
  //             <IonBackButton defaultHref="/app/delivery" />
  //           </IonButtons>
  //           <IonTitle>Loading delivery record...</IonTitle>
  //         </IonToolbar>
  //       </IonHeader>

  //       <IonContent className="ion-padding">
  //         <div className="flex h-full items-center justify-center">
  //           <IonSpinner />
  //         </div>
  //       </IonContent>
  //     </IonPage>
  //   )
  // }

  // if (data == null) {
  //   return null
  // }

  if (isPending) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/daily-count" />
            </IonButtons>
            <IonTitle>Loading daily count record...</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <div className="flex h-full items-center justify-center">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (data == null) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/daily-count" />
          </IonButtons>
          <IonTitle>Edit daily count</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <DailyCountRecordForm data={data[0]} />
      </IonContent>
    </IonPage>
  );
}
