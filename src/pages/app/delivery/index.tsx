import { Fragment } from "react";
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

import { fetchDeliveryEntries } from "@/lib/api";
import type { DeliveryItem } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Loading } from "@/components/loading";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { DeliveryFormModal } from "./modal-form";

/**
 * The `Delivery` component handles displaying and managing delivery entries. It fetches delivery
 * data, sorts it by date, and allows users to add, update, delete, and refresh deliveries.
 *
 * @returns The rendered component.
 */
export default function Delivery() {
  /**
   * The `useQuery` hook fetches delivery entries from the API, providing loading states, data, and
   * a refetch function. The entries are then sorted by date and DR number.
   */
  const { isFetching, isPending, data, refetch } = useQuery({
    queryKey: ["delivery-entries"],
    queryFn: async () => await fetchDeliveryEntries(),
  });

  /** Initializes an empty array to store sorted delivery data of type `DeliveryItem`. */
  let sortedData: DeliveryItem[] = [];

  /**
   * Sorts delivery data by delivery date (newest first) and DR number (descending), then stores the
   * result in `sortedData`.
   */
  if (data != null) {
    sortedData = data.slice().sort((a, b) => {
      /** Sort by date delivered (newest first) */
      const dateComparison =
        new Date(b.date_delivered).getTime() - new Date(a.date_delivered).getTime();

      if (dateComparison !== 0) {
        return dateComparison;
      }

      /** If dates are equal, sort by DR number (descending) */
      if (b.dr_no != null && a.dr_no != null) {
        return b.dr_no.localeCompare(a.dr_no);
      }

      return 0;
    });
  }

  /** Initializes the `useIonModal` hook with the `NewDeliveryModal` component. */
  const [present, dismiss] = useIonModal(DeliveryFormModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  /**
   * Displays a modal and handles its dismissal event.
   *
   * This function presents a modal using the `present` function and sets up an event listener for
   * its dismissal. If dismissed with the role of 'confirm', it triggers a refetch operation.
   */
  function presentModal() {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === "confirm") {
          void refetch();
        }
      },
    });
  }

  /**
   * Handles the refresh event for the delivery page.
   *
   * @param event The refresh event containing the refresher details.
   */
  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    try {
      void refetch();
    } catch (error) {
      throw new Error("Error fetching delivery entries");
    } finally {
      event.detail.complete();
    }
  }

  useIonViewDidEnter(() => {
    void refetch();
  });

  return (
    <Fragment>
      <IonMenu
        contentId="delivery-content"
        onIonDidClose={() => {
          void refetch();
        }}
      >
        <Settings />
      </IonMenu>

      <IonPage id="delivery-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Delivery</IonTitle>
            {isFetching && !isPending && <IonProgressBar type="indeterminate" />}
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Delivery</IonTitle>
            </IonToolbar>
          </IonHeader>

          <div className="ion-padding-horizontal ion-padding-top pb-[calc(--spacing(14)+--spacing(8))]">
            {isPending ? (
              <Loading />
            ) : (
              <DataTable
                idToSearch="dr_no"
                columns={columns}
                data={sortedData}
                linkPath="/app/delivery"
                searchPlaceholder="Search by DR no. or PO no."
              />
            )}
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
