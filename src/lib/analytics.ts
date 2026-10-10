import posthog from "posthog-js";

export type FunnelEvent =
  | "landing_view"
  | "fund_selected"
  | "isin_copied"
  | "calculator_used"
  | "gate_viewed"
  | "cta_clicked"
  | "email_focused"
  | "lead_submitted"
  | "lead_succeeded"
  | "lead_failed"
  | "pdf_downloaded"
  | "scroll_depth";

type Props = Record<string, string | number | boolean | null>;

let ready = false;

export function initAnalytics(superProps: Props): boolean {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (ready || !key || typeof window === "undefined") return ready;
  try {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      persistence: "memory",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      ip: false,
    });
    posthog.register(superProps);
    ready = true;
  } catch (error) {
    console.error("analytics init failed", error);
  }
  return ready;
}

export function track(event: FunnelEvent, props: Props = {}): void {
  if (!ready) return;
  try {
    posthog.capture(event, props);
  } catch (error) {
    console.error("analytics capture failed", error);
  }
}
