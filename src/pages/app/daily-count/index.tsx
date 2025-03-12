import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
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
import { useQuery } from "@tanstack/react-query";
import { add } from "ionicons/icons";

import { fetchDailyCountEntries } from "@/lib/api";
import { Loading } from "@/components/loading";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewDailyCountModal } from "./new-daily-count-modal";

/**
 * The `DisplayCount` component displays a daily count page with a list of daily count entries. It
 * includes functionality to refresh the list, present a modal for adding new entries, and display a
 * loading indicator while data is being fetched.
 *
 * @returns The rendered component.
 */
export default function DailyCount() {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["daily-count-entries"],
    queryFn: async () => await fetchDailyCountEntries(),
  });

  const sortedData = data?.sort((z, a) => (new Date(a.date) < new Date(z.date) ? -1 : 1)) ?? [];

  const [present, dismiss] = useIonModal(NewDailyCountModal, {
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
      console.error("Error fetching delivery entries:", error);
    } finally {
      event.detail.complete();
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Daily Count</IonTitle>

          {isPending && <IonProgressBar type="indeterminate" />}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Daily Count</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {isPending ? <Loading /> : <DataTable columns={columns} data={sortedData} />}
        </div>

        <IonFab horizontal="end" slot="fixed" vertical="bottom">
          <IonFabButton onClick={presentModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
}
