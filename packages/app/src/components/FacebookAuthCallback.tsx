import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./FacebookAuthCallback.module.css";

const FacebookAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const accessToken = searchParams.get("access_token");
      const expiresIn = searchParams.get("expires_in");

      if (error) {
        setStatus("error");
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (accessToken) {
        localStorage.setItem("facebook_access_token", accessToken);
        if (expiresIn) {
          localStorage.setItem("facebook_expires_in", expiresIn);
        }

        setStatus("success");
        setMessage("Authentication successful! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (code) {
        try {
          setStatus("loading");
          setMessage("Exchanging authorization code for access token...");

          const response = await fetch(
            "http://localhost:3000/facebook/exchange-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code }),
            }
          );

          const data = await response.json();

          if (data.success) {
            // Store the access token and user data
            localStorage.setItem(
              "facebook_access_token",
              data.data.accessToken
            );
            localStorage.setItem(
              "facebook_user",
              JSON.stringify(data.data.user)
            );
            localStorage.setItem(
              "facebook_permissions",
              JSON.stringify(data.data.permissions)
            );
            localStorage.setItem(
              "facebook_expires_in",
              data.data.expiresIn.toString()
            );
            localStorage.setItem("facebook_token_type", data.data.tokenType);

            setStatus("success");
            setMessage(
              "Authentication successful! Access token obtained. Redirecting..."
            );
            setTimeout(() => navigate("/"), 2000);
          } else {
            setStatus("error");
            setMessage(`Token exchange failed: ${data.error}`);
            setTimeout(() => navigate("/"), 3000);
          }
        } catch (err) {
          setStatus("error");
          setMessage("Failed to exchange authorization code for access token");
          setTimeout(() => navigate("/"), 3000);
        }
        return;
      }

      setStatus("error");
      setMessage("No valid authentication data received");
      setTimeout(() => navigate("/"), 3000);
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <div className={styles.spinner} />
            <h2 className={styles.title}>Authenticating...</h2>
            <p className={styles.message}>
              Please wait while we complete your Facebook authentication.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className={`${styles.statusIcon} ${styles.successIcon}`}>
              ✓
            </div>
            <h2 className={styles.successTitle}>Success!</h2>
            <p className={styles.message}>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className={`${styles.statusIcon} ${styles.errorIcon}`}>×</div>
            <h2 className={styles.errorTitle}>Authentication Failed</h2>
            <p className={styles.message}>{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FacebookAuthCallback;
