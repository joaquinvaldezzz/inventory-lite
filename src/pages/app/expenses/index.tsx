import { Fragment, useCallback, useMemo } from "react";
import {
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonModal,
  useIonViewDidEnter,
  type RefresherEventDetail,
} from "@ionic/react";
import type { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import { add } from "ionicons/icons";

import { fetchExpenses } from "@/lib/api";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewExpensesModal } from "./modal-form";

/**
 * The `Expenses` component renders a page that displays a list of expenses. It includes a header
 * with a title and a floating action button to add new expenses.
 *
 * @returns The rendered component.
 */
export default function Expenses() {
  const { isFetching, isPending, data, refetch } = useQuery({
    queryKey: ["expenses-entries"],
    queryFn: async () => await fetchExpenses(),
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
  });
  const [present, dismiss] = useIonModal(NewExpensesModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  useIonViewDidEnter(() => {
    void refetch();
  });

  const sortedData = useMemo(() => {
    if (data == null) return [];

    return data.slice().sort((a, b) => {
      const dateComparison = new Date(b.InvoiceDate).getTime() - new Date(a.InvoiceDate).getTime();

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return b.PONo.localeCompare(a.PONo);
    });
  }, [data]);

  /**
   * Displays a modal and handles its dismissal event.
   *
   * This function presents a modal using the `present` function and sets up an event listener for
   * its dismissal. If dismissed with the role of 'confirm', it triggers a refetch operation.
   */
  const presentModal = useCallback(() => {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === "confirm") {
          void refetch();
        }
      },
    });
  }, [present, refetch]);

  /**
   * Handles the refresh event for the delivery page.
   *
   * @param event The refresh event containing the refresher details.
   */
  const handleRefresh = useCallback(
    (event: CustomEvent<RefresherEventDetail>) => {
      try {
        void refetch();
      } catch (error) {
        throw new Error("Error fetching delivery entries");
      } finally {
        event.detail.complete();
      }
    },
    [refetch],
  );

  return (
    <Fragment>
      <IonMenu contentId="expenses-content">
        <Settings />
      </IonMenu>

      <IonPage id="expenses-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Expenses</IonTitle>
            {isFetching && !isPending && <IonProgressBar type="indeterminate" />}
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Expenses</IonTitle>
            </IonToolbar>
          </IonHeader>

          <div className="ion-padding-horizontal ion-padding-top pb-[calc(--spacing(14)+--spacing(8))]">
            <DataTable
              idToSearch="PONo"
              columns={columns}
              data={sortedData}
              linkPath="/app/expenses"
              searchPlaceholder="Search by reference number"
            />
          </div>

          <IonFab horizontal="end" slot="fixed" vertical="bottom">
            <IonFabButton onClick={presentModal}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
    </Fragment>
  );
}
