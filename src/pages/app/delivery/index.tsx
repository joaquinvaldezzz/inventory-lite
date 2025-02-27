import {
  IonButton,
  IonButtons,
  IonContent,
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
} from '@ionic/react'
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces'
import { useQuery } from '@tanstack/react-query'
import { add } from 'ionicons/icons'

import { fetchDeliveryEntries } from '@/lib/api'
import type { DeliveryItem } from '@/lib/types'
import { DataTable } from '@/components/ui/data-table'
import { Loading } from '@/components/loading'

import { columns } from './columns'
import { NewDeliveryModal } from './new-delivery-modal'

/**
 * The `Delivery` component handles displaying and managing delivery entries. It fetches delivery
 * data, sorts it by date, and allows users to add, delete, update, and refresh deliveries.
 *
 * @remarks
 *   This component uses the `useQuery` hook to fetch delivery entries and the `useIonModal` hook to
 *   present a modal for adding new deliveries. It also includes a refresh mechanism via the
 *   `IonRefresher` component.
 */

export default function Delivery() {
  /**
   * The `useQuery` hook fetches delivery entries from the API, providing loading states, data, and
   * a refetch function. The entries are then sorted by date and DR number.
   */
  const { isFetching, isPending, data, refetch } = useQuery({
    queryKey: ['delivery-entries'],
    queryFn: async () => await fetchDeliveryEntries(),
  })

  /** Initializes an empty array to store sorted delivery data of type `DeliveryItem`. */
  let sortedData: DeliveryItem[] = []

  /**
   * Sorts delivery data by delivery date (newest first) and DR number (descending), then stores the
   * result in `sortedData`.
   */
  if (data != null) {
    sortedData = data.slice().sort((a, b) => {
      /** Sort by date delivered (newest first) */
      const dateComparison =
        new Date(b.date_delivered).getTime() - new Date(a.date_delivered).getTime()

      if (dateComparison !== 0) {
        return dateComparison
      }

      /** If dates are equal, sort by DR number (descending) */
      return b.dr_no.localeCompare(a.dr_no)
    })
  }

  /** Initializes the `useIonModal` hook with the `NewDeliveryModal` component. */
  const [present, dismiss] = useIonModal(NewDeliveryModal, {
    dismiss: (data: string, role: string) => {
      dismiss(data, role)
    },
  })

  /**
   * Displays a modal and handles its dismissal event.
   *
   * This function presents a modal using the `present` function and sets up an event listener for
   * its dismissal. If dismissed with the role of 'confirm', it triggers a refetch operation.
   */
  function presentModal() {
    present({
      onWillDismiss: (event: CustomEvent<OverlayEventDetail>) => {
        if (event.detail.role === 'confirm') {
          void refetch()
        }
      },
    })
  }

  /**
   * Handles the refresh event for the delivery page.
   *
   * This function attempts to refetch the delivery entries. If an error occurs during the fetch, it
   * logs the error to the console. Regardless of success or failure, it completes the refresh
   * event.
   *
   * @param {CustomEvent<RefresherEventDetail>} event - The refresh event containing the refresher
   *   details.
   */
  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    try {
      void refetch()
    } catch (error) {
      console.error('Error fetching delivery entries:', error)
    } finally {
      event.detail.complete()
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Delivery</IonTitle>
          <IonButtons slot="end" collapse>
            <IonButton onClick={presentModal}>
              <IonIcon icon={add} slot="icon-only" />
            </IonButton>
          </IonButtons>
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
            <IonButtons slot="primary">
              <IonButton onClick={presentModal}>
                <IonIcon icon={add} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          {isPending ? (
            <Loading />
          ) : (
            <DataTable columns={columns} data={sortedData} withPagination withSearch />
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
