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
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { CapacitorThermalPrinter } from "capacitor-thermal-printer";
import { print } from "ionicons/icons";
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

  /** Handles the printing of a delivery record. */
  async function handlePrint() {
    if (!isPlatform("android") || !isPlatform("ios")) {
      // TODO: Use WebBluetoothReceiptPrinter instead here
      throw new Error("Bluetooth printing is not supported on this platform");
    }

    await CapacitorThermalPrinter.startScan();

    await CapacitorThermalPrinter.addListener("discoverDevices", (devices) => {
      // TODO: Handle device selection and connect to the selected device
      // eslint-disable-next-line no-console -- debug
      console.log("Discovered devices list:", devices);
    });

    await CapacitorThermalPrinter.addListener("discoveryFinish", () => {
      // TODO: Handle device selection
      // eslint-disable-next-line no-console -- debug
      console.log("Discovery finished");
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
