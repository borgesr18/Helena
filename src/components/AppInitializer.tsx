"use client"

import { useEffect } from "react"
import { initializeErrorHandling } from "@/lib/errorHandler"

export default function AppInitializer() {
  useEffect(() => {
    // Initialize global error handling
    initializeErrorHandling()

    // Register service worker after window load
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      }

      window.addEventListener("load", onLoad)
      return () => window.removeEventListener("load", onLoad)
    }
  }, [])

  return null
}