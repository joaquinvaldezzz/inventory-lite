import { IonContent, IonPage } from '@ionic/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Home() {
  return (
    <IonPage>
      <IonContent>
        <div className="space-y-4 px-4">
          <Input className="w-full" type="text" name="name" />
          <Button>Click me</Button>
        </div>
      </IonContent>
    </IonPage>
  )
}
