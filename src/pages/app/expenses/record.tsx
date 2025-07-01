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
 * ExpensesRecord component displays and manages a specific expense record page.
 *
 * This component handles the complete lifecycle of viewing and editing an expense record:
 *
 * - Fetches the expense record data based on the route parameter ID
 * - Displays loading states while data is being retrieved
 * - Shows error messages if the record cannot be found or loaded
 * - Renders the expense record form for editing when data is available
 * - Handles navigation back to the expenses list
 *
 * The component uses React Router's match object to extract the record ID from the URL parameters
 * and manages the data fetching process for expense entries.
 *
 * @param props Component configuration and routing information
 * @param props.match React Router match object containing route parameters including the expense
 *   record ID
 * @returns JSX element representing the expense record page with loading states and form
 */
export default function ExpensesRecord({ match }: ExpensesPageProps) {
  const { data, isFetching } = useQuery({
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
            {isFetching || data == null
              ? "Loading expenses record..."
              : `Expenses #${data[0].PurchaseID}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={print} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isFetching || data == null ? <Loading /> : <ExpensesRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
