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
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5,
  });

  const sortedData = useMemo(() => {
    if (data == null) return [];

    return data.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const [present, dismiss] = useIonModal(DailyCountModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  /** Displays a modal and handles its dismissal event. */
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

  useIonViewDidEnter(() => {
    void refetch();
  });

  return (
    <Fragment>
      <IonMenu
        onIonDidClose={() => {
          void refetch();
        }}
        contentId="daily-count-content"
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
