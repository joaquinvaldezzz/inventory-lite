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

import { fetchDailyCountEntries } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Loading } from "@/components/loading";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { DailyCountModal } from "./modal-form";

/**
 * DailyCount component displays a comprehensive daily count management interface.
 *
 * This component provides:
 *
 * - A data table showing daily count entries sorted by date (newest first)
 * - Pull-to-refresh functionality to update the data
 * - A floating action button to add new daily count entries via modal
 * - A collapsible header with progress indicator during data loading
 * - A side menu with settings accessible via hamburger menu
 * - Search functionality filtered by raw material type
 *
 * The component automatically refreshes data when the modal is dismissed with confirmation or when
 * the settings menu is closed.
 *
 * @returns JSX element representing the daily count page interface
 */
export default function DailyCount() {
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useQuery({
    queryKey: ["daily-count-entries"],
    queryFn: fetchDailyCountEntries,
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

  const presentModal = useCallback(() => {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === "confirm") {
          void refetch();
        }
      },
    });
  }, [present, queryClient]);

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
          void queryClient.invalidateQueries({ queryKey: ["daily-count-entries"] });
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
