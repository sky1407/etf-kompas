"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      const twin = document.getElementById("nahrada");
      const gate = document.getElementById("ziskat");
      if (!twin || !gate) return;
      const pastTwin = twin.getBoundingClientRect().bottom < 0;
      const gateRect = gate.getBoundingClientRect();
      const gateOnScreen = gateRect.top < window.innerHeight * 0.85 && gateRect.bottom > 0;
      const planShown = document.getElementById("plan") !== null;
      setVisible(pastTwin && !gateOnScreen && !planShown);
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
