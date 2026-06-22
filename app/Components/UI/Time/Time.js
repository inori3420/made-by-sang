"use client";

import { useEffect, useState } from "react";
import styles from "./time.module.css";

function formatTime(timeZone) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date());
}

export default function Time({
  className = "",
  location = "MEL, AU",
  timeZone = "Australia/Melbourne",
}) {
  const [time, setTime] = useState(() => formatTime(timeZone));
  const classes = [styles.time, className].filter(Boolean).join(" ");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(formatTime(timeZone));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timeZone]);

  return (
    <time className={classes} suppressHydrationWarning>
      {location} {time}
    </time>
  );
}
