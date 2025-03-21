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
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import type { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { add } from "ionicons/icons";

import Settings from "../settings";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewExpensesModal } from "./modal-form";

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
    <Fragment>
      <IonMenu contentId="expenses-content">
        <Settings />
      </IonMenu>

      <IonPage id="expenses-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
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

          <div className="ion-padding-horizontal ion-padding-top pb-[calc(--spacing(14)+--spacing(8))]">
            <DataTable columns={columns} data={[]} />
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
