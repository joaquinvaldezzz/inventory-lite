'use client'

import { Fragment, useEffect, type ReactNode } from 'react'
import { SafeArea } from 'capacitor-plugin-safe-area'

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void (async function () {
      const safeAreaData = await SafeArea.getSafeAreaInsets()
      const { insets } = safeAreaData
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`)
      }
    })()
  }, [])

  return <Fragment>{children}</Fragment>
}
