"use client";

import { useEffect, useState } from "react";
import styles from "./time.module.css";

function formatTime(timeZone) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(new Date());

  return {
    hour: parts.find(({ type }) => type === "hour")?.value ?? "00",
    minute: parts.find(({ type }) => type === "minute")?.value ?? "00",
  };
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
      <span>{location}</span>{" "}
      <span>{time.hour}</span>
      <span className={styles.separator} aria-hidden="true">
        :
      </span>
      <span>{time.minute}</span>
    </time>
  );
}
