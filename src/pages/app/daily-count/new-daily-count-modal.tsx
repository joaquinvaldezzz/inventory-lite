import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'

interface DailyCountModalActions {
  dismiss: (data?: string | number | null, role?: string) => void
}

export function NewDailyCountModal({ dismiss }: DailyCountModalActions) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                dismiss(null, 'cancel')
              }}
            >
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>New daily count</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                dismiss(null, 'confirm')
              }}
            >
              Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding"></IonContent>
    </IonPage>
  )
}
