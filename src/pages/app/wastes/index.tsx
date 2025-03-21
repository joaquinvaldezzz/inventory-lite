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
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonModal,
  type RefresherEventDetail,
} from "@ionic/react";
import type { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import { add } from "ionicons/icons";

import { fetchWasteEntries } from "@/lib/api";
import { Loading } from "@/components/loading";

import Settings from "../settings";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { WastesFormModal } from "./modal-form";

/**
 * The `Wastes` component is responsible for displaying and managing waste entries. It fetches waste
 * data using the `useQuery` hook and provides functionalities to refresh the data and present a
 * modal for adding new waste entries.
 *
 * @returns The rendered component.
 */
export default function Wastes() {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["wastes"],
    queryFn: async () => await fetchWasteEntries(),
  });

  const sortedData = data?.sort((z, a) => (new Date(a.date) < new Date(z.date) ? -1 : 1)) ?? [];

  const [present, dismiss] = useIonModal(WastesFormModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  /**
   * Presents a modal and handles its dismissal event.
   *
   * This function triggers the presentation of a modal using the `present` method. It also sets up
   * an event listener for the modal's dismissal event (`onWillDismiss`). If the modal is dismissed
   * with the role of 'confirm', it triggers a refetch operation.
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
   * Handles the refresh event for the waste entries page.
   *
   * @param event The refresh event containing the refresher details.
   *
   *   This function attempts to refetch the data when the refresh event is triggered. If an error
   *   occurs during the refetch, it logs the error to the console. Regardless of the outcome, it
   *   signals the completion of the refresh event.
   */
  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    try {
      void refetch();
    } catch (error) {
      console.error("Error fetching delivery entries:", error);
    } finally {
      event.detail.complete();
    }
  }

  return (
    <Fragment>
      <IonMenu
        onIonDidClose={() => {
          void refetch();
        }}
        contentId="wastes-content"
      >
        <Settings />
      </IonMenu>

      <IonPage id="wastes-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Wastes</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Wastes</IonTitle>
            </IonToolbar>
          </IonHeader>

          <div className="ion-padding-horizontal ion-padding-top pb-[calc(--spacing(14)+--spacing(8))]">
            {isPending ? <Loading /> : <DataTable columns={columns} data={sortedData} />}
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
