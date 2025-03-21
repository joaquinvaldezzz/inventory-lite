import { useEffect, useState } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";

import { fetchUserBranches } from "@/lib/dal";
import type { Branch } from "@/lib/types";

/**
 * The `Settings` component handles the settings page. It contains the ...
 *
 * @returns The rendered component.
 */
export default function Settings() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    /**
     * Fetches the branches associated with the user and updates the state with the fetched
     * branches.
     *
     * @returns A promise that resolves when the branches have been fetched and the state has been
     *   updated.
     */
    async function getBranches() {
      const userBranches = await fetchUserBranches();

      setBranches(userBranches);
    }

    void getBranches();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          <IonItem>
            <IonSelect placeholder="Select a branch" label="Branch">
              {branches.map((branch) => (
                <IonSelectOption value={branch.id} key={branch.id}>
                  {branch.branch}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonToggle
              onChange={() => {
                console.log("Dark mode toggled");
              }}
            >
              Dark mode
            </IonToggle>
          </IonItem>

          <IonItem>
            <IonLabel color="danger">Logout</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
