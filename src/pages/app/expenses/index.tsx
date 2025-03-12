import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import type { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { add } from "ionicons/icons";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewExpensesModal } from "./new-expenses-modal";

/**
 * The `Expenses` component renders a page that displays a list of expenses. It includes a header
 * with a title and a floating action button to add new expenses.
 *
 * @returns The rendered component.
 */
export default function Expenses() {
  const [present, dismiss] = useIonModal(NewExpensesModal, {
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
          // void refetch()
        }
      },
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Expenses</IonTitle>
          {/* {isFetching && !isPending && <IonProgressBar type="indeterminate" />} */}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Expenses</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <DataTable columns={columns} data={[]} />
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
