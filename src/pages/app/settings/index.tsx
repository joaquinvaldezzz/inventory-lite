import { Fragment, useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";

import { fetchUserBranches } from "@/lib/dal";
import type { Branch } from "@/lib/types";
import { updateTheme } from "@/lib/utils";

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
    <Fragment>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
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
              onIonChange={(event) => {
                console.log(event.detail.checked);
                updateTheme(event.detail.checked ? "dark" : "light");
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
    </Fragment>
  );
}
