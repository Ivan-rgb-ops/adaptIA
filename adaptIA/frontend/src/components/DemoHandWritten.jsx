import { HandWrittenTitle } from "@/components/ui/hand-writing-text";

/**
 * DemoHandWritten
 * Quick visual demo for the HandWrittenTitle component.
 * Renders centered on a full-screen background that respects dark mode.
 */
export default function DemoHandWritten() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#ffffff",
      }}
    >
      <HandWrittenTitle
        title="ADAPTIA"
        subtitle="Subí tu CV y empezá la magia"
      />
    </div>
  );
}
