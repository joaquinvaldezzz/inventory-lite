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
import { DataTable } from "@/components/ui/data-table";
import { Loading } from "@/components/loading";
import { Settings } from "@/components/settings";

import { columns } from "./columns";
import { WastesFormModal } from "./modal-form";

/**
 * The `Wastes` component is responsible for displaying and managing waste entries. It fetches waste
 * data using the `useQuery` hook and provides functionalities to refresh the data and present a
 * modal for adding new waste entries.
 *
 * @returns The rendered component.
 */
export default function Wastes() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["wastes-entries"],
    queryFn: fetchWasteEntries,
  });

  const sortedData = useMemo(() => {
    if (data == null) return [];

    return data.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const [present, dismiss] = useIonModal(WastesFormModal, {
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
  }, [present, refetch]);

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
      <IonMenu contentId="wastes-content">
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
            {isPending ? (
              <Loading />
            ) : (
              <DataTable
                idToSearch="raw_material_type"
                columns={columns}
                data={sortedData}
                linkPath="/app/wastes"
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
