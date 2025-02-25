import { IonSpinner } from '@ionic/react'

export function Loading() {
  return (
    <div className="flex h-96 items-center justify-center">
      <IonSpinner />
    </div>
  )
}
