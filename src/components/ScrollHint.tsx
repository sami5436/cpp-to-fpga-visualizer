/** Wide diagrams stay legible on a phone by scrolling, so say so. */
export default function ScrollHint() {
  return (
    <div className="border-t border-edge px-4 py-1.5 text-center font-mono text-[10px] text-dim lg:hidden">
      swipe the diagram sideways →
    </div>
  );
}
