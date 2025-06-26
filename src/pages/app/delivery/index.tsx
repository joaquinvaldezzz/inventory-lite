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

import { fetchDeliveryEntries } from "@/lib/api";
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
  const queryClient = useQueryClient();
  const { data, isFetching, isPending, refetch } = useQuery({
    queryKey: ["delivery-entries"],
    queryFn: async () => await fetchDeliveryEntries(),
  });

  const sortedData = useMemo(() => {
    if (data == null) return [];

    return data.slice().sort((a, b) => {
      const dateComparison =
        new Date(b.date_delivered).getTime() - new Date(a.date_delivered).getTime();

      if (dateComparison !== 0) {
        return dateComparison;
      }

      if (b.dr_no != null && a.dr_no != null) {
        return b.dr_no.localeCompare(a.dr_no);
      }

      return 0;
    });
  }, [data]);

  const [present, dismiss] = useIonModal(DeliveryFormModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role);
    },
  });

  const presentModal = useCallback(() => {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === "confirm") {
          void queryClient.invalidateQueries({ queryKey: ["delivery-entries"] });
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
          void refetch();
        }}
        contentId="delivery-content"
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
