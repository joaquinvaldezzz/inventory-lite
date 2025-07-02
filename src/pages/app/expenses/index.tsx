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
  type RefresherEventDetail,
} from "@ionic/react";
import type { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { add } from "ionicons/icons";

import { fetchExpenses } from "@/lib/api";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewExpensesModal } from "./modal-form";

/**
 * Expenses component displays a comprehensive expense management interface.
 *
 * This component provides:
 *
 * - A data table showing expense entries with detailed information
 * - Pull-to-refresh functionality to update the expense data
 * - A floating action button to add new expense entries via modal
 * - A collapsible header with progress indicator during data loading
 * - A side menu with settings accessible via hamburger menu
 * - Search functionality for filtering expense entries
 *
 * The component automatically refreshes data when the modal is dismissed with confirmation or when
 * the settings menu is closed. It handles the complete lifecycle of expense entry management
 * including create, read, update, and delete operations.
 *
 * @returns JSX element representing the expense management page interface
 */
export default function Expenses() {
  const queryClient = useQueryClient();
  const { data, isFetching, isPending, refetch } = useQuery({
    queryKey: ["expenses-entries"],
    queryFn: async () => await fetchExpenses(),
  });
  const [present, dismiss] = useIonModal(NewExpensesModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
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
      <IonMenu
        onIonDidClose={() => {
          void queryClient.invalidateQueries({ queryKey: ["expenses-entries"] });
        }}
        contentId="expenses-content"
      >
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
