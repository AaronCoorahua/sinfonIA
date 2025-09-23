"use client";

import { Amplify } from "aws-amplify";
import { useRef } from "react";

export default function AmplifyProvider({ children }) {
  const configuredRef = useRef(false);

  if (!configuredRef.current && typeof window !== "undefined") {
    const poolId = (process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "").trim();
    const clientId = (
      process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID ?? ""
    ).trim();
    const region = (process.env.NEXT_PUBLIC_AWS_REGION ?? "").trim();

    if (!poolId || !clientId || !region) {
      console.error("[Amplify] Faltan envs públicas:", {
        poolId,
        clientId,
        region,
      });
    } else {
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: poolId,
            userPoolClientId: clientId,
            region,
            loginWith: { username: false, email: true, phone: false },
          },
        },
      });
      configuredRef.current = true;
    }
  }

  return children;
}
