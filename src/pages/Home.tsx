import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Home() {
  return (
    <IonPage>
      <IonContent>
        <div className="space-y-4 px-4 py-4 pt-[env(safe-area-inset-top)]">
          <Input className="w-full" type="text" name="name" />
          <Button>Click me</Button>
        </div>
      </IonContent>
    </IonPage>
  )
}
