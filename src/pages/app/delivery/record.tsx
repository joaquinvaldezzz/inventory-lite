import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonToast,
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { CapacitorThermalPrinter } from "capacitor-thermal-printer";
import { alertCircleOutline, checkmarkCircleOutline, print, searchOutline } from "ionicons/icons";
import type { RouteComponentProps } from "react-router";

import { getSpecificDeliveryRecord } from "@/lib/api";
import { Loading } from "@/components/loading";

import DeliveryRecordForm from "./record-form";

type DeliveryPageProps = RouteComponentProps<{ id: string }>;

/**
 * Component for displaying and editing a specific delivery record.
 *
 * @param props The properties passed to the component.
 * @param props.match The match object containing route parameters.
 * @returns The rendered component.
 */
export default function DeliveryRecord({ match }: DeliveryPageProps) {
  const { isPending, data } = useQuery({
    queryKey: ["delivery-entry", match.params.id],
    queryFn: async () => await getSpecificDeliveryRecord(Number(match.params.id)),
  });
  const [presentToast] = useIonToast();

  /** Handles the printing of a delivery record. */
  async function handlePrint() {
    let isThereAnyDevice = false;

    if (!isPlatform("android")) {
      void presentToast({
        color: "danger",
        duration: 3500,
        icon: alertCircleOutline,
        message:
          "Wireless printing isn't supported on this platform. Please use an Android or iOS device instead.",
        swipeGesture: "vertical",
      });
      return;
    }

    await CapacitorThermalPrinter.startScan();

    void presentToast({
      duration: 3500,
      icon: searchOutline,
      message: "Searching for devices... Please wait.",
      swipeGesture: "vertical",
    });

    await CapacitorThermalPrinter.addListener("discoverDevices", (devices) => {
      if (devices.devices.length > 0) {
        isThereAnyDevice = true;
        void presentToast({
          duration: 3500,
          icon: checkmarkCircleOutline,
          message: "Device found. Please select a device to print to.",
          swipeGesture: "vertical",
        });
      } else {
        isThereAnyDevice = false;
      }
    });

    await CapacitorThermalPrinter.addListener("discoveryFinish", () => {
      if (isThereAnyDevice) {
        void presentToast({
          duration: 3500,
          icon: checkmarkCircleOutline,
          message: "Search complete. Please select a device to print to.",
          swipeGesture: "vertical",
        });
      } else {
        void presentToast({
          duration: 3500,
          icon: alertCircleOutline,
          message: "No devices found. Please try again.",
          swipeGesture: "vertical",
        });
      }
    });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/delivery" />
          </IonButtons>
          <IonTitle>
            {isPending ? "Loading delivery record..." : `Delivery #${data?.[0].id}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                void handlePrint();
              }}
            >
              <IonIcon icon={print} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {data == null ? <Loading /> : <DeliveryRecordForm data={data[0]} />}
      </IonContent>
    </IonPage>
  );
}
