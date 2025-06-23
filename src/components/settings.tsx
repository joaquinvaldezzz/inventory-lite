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
  useIonAlert,
} from "@ionic/react";

import { version } from "@/root/package.json";
import { fetchUserBranches, getUserSelectedBranch } from "@/lib/dal";
import { saveToStorage } from "@/lib/storage";
import { onChange } from "@/lib/theme-utils";
import type { Branch } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

/**
 * The `Settings` component handles the settings page. It contains the ...
 *
 * @returns The rendered component.
 */
export function Settings() {
  const [currentBranch, setCurrentBranch] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [presentAlert] = useIonAlert();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();

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

  /**
   * Updates the current branch information by saving it to storage.
   *
   * This function attempts to save the `currentBranch` to storage using the `saveToStorage`
   * function.
   *
   * @param value The value to update the branch with.
   * @returns A promise that resolves when the branch information has been saved.
   */
  async function updateBranch(value: number) {
    try {
      await saveToStorage(
        "currentBranch",
        JSON.stringify({
          currentBranch: value.toString(),
        }),
      );
    } catch (error) {
      throw new Error("Error saving branch information");
    }
  }

  /** Logs the user out of the application. */
  function logoutUser() {
    void presentAlert({
      header: "Logout",
      message: "Are you sure you want to logout?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            auth.logout();
          },
        },
      ],
    });
  }

  return (
    <Fragment>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="bg-( flex h-full flex-col justify-between bg-(--ion-item-background,_#fff)">
          <IonList>
            <IonItem>
              <IonSelect
                placeholder="Select a branch"
                value={currentBranch}
                label="Branch"
                onIonChange={(event) => {
                  if (typeof event.detail.value === "number") {
                    void updateBranch(event.detail.value);
                  }
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
                checked={theme === "dark"}
                onIonChange={(event) => {
                  onChange(event.detail.checked ? "dark" : "light", setTheme);
                }}
              >
                Dark mode
              </IonToggle>
            </IonItem>

            <IonItem onClick={logoutUser}>
              <IonLabel color="danger">Logout</IonLabel>
            </IonItem>
          </IonList>

          <IonList lines="none">
            <IonItem>
              <IonLabel>App version: {version}-alpha</IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </Fragment>
  );
}
