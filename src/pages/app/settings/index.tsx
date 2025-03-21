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

import { fetchUserBranches, getUserSelectedBranch } from "@/lib/dal";
import type { Branch } from "@/lib/types";
import { updateTheme } from "@/lib/utils";

/**
 * The `Settings` component handles the settings page. It contains the ...
 *
 * @returns The rendered component.
 */
export default function Settings() {
  const [currentBranch, setCurrentBranch] = useState<number | null>(null);
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

  useEffect(() => {
    /**
     * Retrieves the branch selected by the user and updates the state with the selected branch.
     *
     * @returns A promise that resolves when the selected branch has been fetched and the state has
     *   been updated.
     */
    async function getSelectedBranch() {
      const selectedBranch = await getUserSelectedBranch();
      setCurrentBranch(selectedBranch);
    }

    void getSelectedBranch();
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
            <IonSelect
              placeholder="Select a branch"
              value={currentBranch}
              label="Branch"
              onIonChange={(event) => {
                console.log(event.detail.value);
              }}
            >
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
