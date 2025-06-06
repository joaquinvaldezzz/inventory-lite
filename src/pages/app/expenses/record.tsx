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

import { getSpecificExpensesRecordById } from "@/lib/api";
import { Loading } from "@/components/loading";

import ExpensesRecordForm from "./record-form";

type ExpensesPageProps = RouteComponentProps<{ PurchaseID: string }>;

/**
 * Component for displaying and editing a specific expenses record.
 *
 * @param props The properties passed to the component.
 * @param props.match The match object containing route parameters.
 * @returns The rendered component.
 */
export default function ExpensesRecord({ match }: ExpensesPageProps) {
  const { isPending, data } = useQuery({
    queryKey: ["expenses-entry", match.params.PurchaseID],
    queryFn: async () => await getSpecificExpensesRecordById(Number(match.params.PurchaseID)),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/expenses" />
          </IonButtons>
          <IonTitle>
            {isPending ? "Loading expenses record..." : `Expenses #${data?.[0].PurchaseID}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={print} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {data == null ? <Loading /> : <ExpensesRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
