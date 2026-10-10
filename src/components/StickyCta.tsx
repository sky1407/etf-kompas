"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const twin = document.getElementById("nahrada");
    const gate = document.getElementById("ziskat");
    if (!twin || !gate || typeof IntersectionObserver === "undefined") return;
    let pastTwin = false;
    let gateInView = false;
    const update = () => setVisible(pastTwin && !gateInView);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === twin) pastTwin = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (entry.target === gate) gateInView = entry.isIntersecting || entry.boundingClientRect.top < 0;
      }
      update();
    });
    observer.observe(twin);
    observer.observe(gate);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`no-print fixed inset-x-0 bottom-0 z-20 p-3 transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <a
        href="#ziskat"
        tabIndex={visible ? 0 : -1}
        onClick={() => track("cta_clicked", { cta: "sticky" })}
        className="flex min-h-14 items-center justify-center rounded-2xl bg-signal text-lg font-bold text-white shadow-lg"
      >
        Získat můj ETF plán zdarma
      </a>
    </div>
  );
}
