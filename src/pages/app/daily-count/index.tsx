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

import { fetchDailyCountEntries } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Loading } from "@/components/loading";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { DailyCountModal } from "./modal-form";

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

  const [present, dismiss] = useIonModal(DailyCountModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  /** Displays a modal and handles its dismissal event. */
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
        contentId="daily-count-content"
        onIonDidClose={() => {
          void refetch();
        }}
      >
        <Settings />
      </IonMenu>

      <IonPage id="daily-count-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
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

          <div className="ion-padding-horizontal ion-padding-top pb-[calc(--spacing(14)+--spacing(8))]">
            {isPending ? (
              <Loading />
            ) : (
              <DataTable
                idToSearch="raw_material_type"
                columns={columns}
                data={sortedData}
                linkPath="/app/daily-count"
                searchPlaceholder="Search by category"
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
